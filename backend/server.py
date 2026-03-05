from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import List, Optional
import logging
import os
import uuid

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware


# ─── Environment ────────────────────────────────────────────────────────────────
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_EXP_MINUTES = int(os.environ["JWT_EXP_MINUTES"])
JWT_ALGORITHM = "HS256"


# ─── App Setup ──────────────────────────────────────────────────────────────────
app = FastAPI(title="Canvas Club API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)
password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ─── Helpers ────────────────────────────────────────────────────────────────────
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_access_token(user_id: str) -> str:
    expiry = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXP_MINUTES)
    payload = {"sub": user_id, "exp": expiry}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


# ─── Models ─────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=120)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: EmailStr
    created_at: str


class AuthResponse(BaseModel):
    access_token: str
    user: UserPublic


class EventCreate(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    description: str = Field(min_length=10, max_length=800)
    location: str = Field(min_length=2, max_length=140)
    event_date: str
    image_url: Optional[str] = None


class EventPublic(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    description: str
    location: str
    event_date: str
    image_url: Optional[str] = None
    created_by: str
    created_by_name: str
    created_at: str
    joined_count: int = 0
    joined: bool = False


class JoinToggleResponse(BaseModel):
    event_id: str
    joined: bool
    joined_count: int


class PostCreate(BaseModel):
    image_url: str = Field(min_length=5, max_length=600)
    caption: str = Field(min_length=2, max_length=800)


class PostUpdate(BaseModel):
    image_url: str = Field(min_length=5, max_length=600)
    caption: str = Field(min_length=2, max_length=800)


class PostPublic(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    image_url: str
    caption: str
    author_id: str
    author_name: str
    created_at: str
    like_count: int = 0
    comment_count: int = 0
    liked_by_me: bool = False
    can_edit: bool = False


class CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=400)


class CommentPublic(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    post_id: str
    user_id: str
    user_name: str
    content: str
    created_at: str


class ReportCreate(BaseModel):
    reason: str = Field(min_length=3, max_length=240)


class GameScoreCreate(BaseModel):
    game_name: str
    score: int = Field(ge=0)
    duration_seconds: int = Field(ge=0)


class GameScorePublic(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    game_name: str
    score: int
    duration_seconds: int
    user_id: str
    user_name: str
    created_at: str


class DashboardStats(BaseModel):
    members: int
    events: int
    posts: int
    total_likes: int


# ─── Auth Routes ────────────────────────────────────────────────────────────────

@api_router.get("/")
async def root():
    return {"message": "Canvas Club API is live"}


@api_router.post("/auth/register", response_model=AuthResponse)
async def register(payload: UserCreate):
    email = payload.email.lower().strip()
    existing = await db.users.find_one({"email": email}, {"_id": 0, "id": 1})
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user_doc = {
        "id": str(uuid.uuid4()),
        "name": payload.name.strip(),
        "email": email,
        "password_hash": password_context.hash(payload.password),
        "created_at": now_iso(),
    }
    await db.users.insert_one(user_doc)

    token = create_access_token(user_doc["id"])
    return AuthResponse(
        access_token=token,
        user=UserPublic(**user_doc),
    )


@api_router.post("/auth/login", response_model=AuthResponse)
async def login(payload: UserLogin):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not password_context.verify(payload.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(user["id"])
    return AuthResponse(
        access_token=token,
        user=UserPublic(**user),
    )


@api_router.get("/auth/me", response_model=UserPublic)
async def auth_me(current_user: dict = Depends(get_current_user)):
    return UserPublic(**current_user)


# ─── Dashboard ──────────────────────────────────────────────────────────────────

@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    members = await db.users.count_documents({})
    events = await db.events.count_documents({})
    posts = await db.posts.count_documents({})
    total_likes = await db.likes.count_documents({})
    return DashboardStats(members=members, events=events, posts=posts, total_likes=total_likes)


# ─── Events Routes ──────────────────────────────────────────────────────────────

@api_router.post("/events", response_model=EventPublic)
async def create_event(payload: EventCreate, current_user: dict = Depends(get_current_user)):
    event_doc = {
        "id": str(uuid.uuid4()),
        "title": payload.title.strip(),
        "description": payload.description.strip(),
        "location": payload.location.strip(),
        "event_date": payload.event_date,
        "image_url": payload.image_url,
        "created_by": current_user["id"],
        "created_by_name": current_user["name"],
        "created_at": now_iso(),
    }
    await db.events.insert_one(event_doc)
    return EventPublic(**event_doc, joined_count=0, joined=False)


@api_router.get("/events", response_model=List[EventPublic])
async def list_events(current_user: dict = Depends(get_current_user)):
    events = await db.events.find({}, {"_id": 0}).sort("event_date", 1).to_list(200)
    if not events:
        return []

    joins = await db.event_joins.find({}, {"_id": 0, "event_id": 1, "user_id": 1}).to_list(5000)
    join_count_map = {}
    joined_by_user = set()

    for join in joins:
        event_id = join["event_id"]
        join_count_map[event_id] = join_count_map.get(event_id, 0) + 1
        if join["user_id"] == current_user["id"]:
            joined_by_user.add(event_id)

    result = []
    for event in events:
        event["joined_count"] = join_count_map.get(event["id"], 0)
        event["joined"] = event["id"] in joined_by_user
        result.append(EventPublic(**event))
    return result


@api_router.post("/events/{event_id}/join", response_model=JoinToggleResponse)
async def toggle_join_event(event_id: str, current_user: dict = Depends(get_current_user)):
    event = await db.events.find_one({"id": event_id}, {"_id": 0, "id": 1})
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    existing = await db.event_joins.find_one(
        {"event_id": event_id, "user_id": current_user["id"]},
        {"_id": 0, "id": 1},
    )

    if existing:
        await db.event_joins.delete_one({"id": existing["id"]})
        joined = False
    else:
        await db.event_joins.insert_one({
            "id": str(uuid.uuid4()),
            "event_id": event_id,
            "user_id": current_user["id"],
            "joined_at": now_iso(),
        })
        joined = True

    joined_count = await db.event_joins.count_documents({"event_id": event_id})
    return JoinToggleResponse(event_id=event_id, joined=joined, joined_count=joined_count)


# ─── Posts Routes ───────────────────────────────────────────────────────────────

@api_router.post("/posts", response_model=PostPublic)
async def create_post(payload: PostCreate, current_user: dict = Depends(get_current_user)):
    post_doc = {
        "id": str(uuid.uuid4()),
        "image_url": payload.image_url.strip(),
        "caption": payload.caption.strip(),
        "author_id": current_user["id"],
        "author_name": current_user["name"],
        "created_at": now_iso(),
    }
    await db.posts.insert_one(post_doc)
    return PostPublic(**post_doc, like_count=0, comment_count=0, liked_by_me=False, can_edit=True)


@api_router.get("/posts", response_model=List[PostPublic])
async def list_posts(current_user: dict = Depends(get_current_user)):
    posts = await db.posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    if not posts:
        return []

    post_ids = [post["id"] for post in posts]

    like_counts_cursor = db.likes.aggregate([
        {"$match": {"post_id": {"$in": post_ids}}},
        {"$group": {"_id": "$post_id", "count": {"$sum": 1}}},
    ])
    like_counts = {item["_id"]: item["count"] async for item in like_counts_cursor}

    comment_counts_cursor = db.comments.aggregate([
        {"$match": {"post_id": {"$in": post_ids}}},
        {"$group": {"_id": "$post_id", "count": {"$sum": 1}}},
    ])
    comment_counts = {item["_id"]: item["count"] async for item in comment_counts_cursor}

    my_likes = await db.likes.find(
        {"post_id": {"$in": post_ids}, "user_id": current_user["id"]},
        {"_id": 0, "post_id": 1},
    ).to_list(2000)
    liked_by_me = {like["post_id"] for like in my_likes}

    response = []
    for post in posts:
        post["like_count"] = like_counts.get(post["id"], 0)
        post["comment_count"] = comment_counts.get(post["id"], 0)
        post["liked_by_me"] = post["id"] in liked_by_me
        post["can_edit"] = post["author_id"] == current_user["id"]
        response.append(PostPublic(**post))
    return response


@api_router.put("/posts/{post_id}", response_model=PostPublic)
async def update_post(post_id: str, payload: PostUpdate, current_user: dict = Depends(get_current_user)):
    post = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    if post["author_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    update_doc = {
        "image_url": payload.image_url.strip(),
        "caption": payload.caption.strip(),
    }
    await db.posts.update_one({"id": post_id}, {"$set": update_doc})

    likes = await db.likes.count_documents({"post_id": post_id})
    comments = await db.comments.count_documents({"post_id": post_id})
    liked = bool(await db.likes.find_one({"post_id": post_id, "user_id": current_user["id"]}, {"_id": 0}))

    return PostPublic(
        **{**post, **update_doc},
        like_count=likes,
        comment_count=comments,
        liked_by_me=liked,
        can_edit=True,
    )


@api_router.delete("/posts/{post_id}")
async def delete_post(post_id: str, current_user: dict = Depends(get_current_user)):
    post = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    if post["author_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    await db.posts.delete_one({"id": post_id})
    await db.likes.delete_many({"post_id": post_id})
    await db.comments.delete_many({"post_id": post_id})
    await db.reports.delete_many({"post_id": post_id})
    return {"message": "Post deleted"}


# ─── Likes ──────────────────────────────────────────────────────────────────────

@api_router.post("/posts/{post_id}/like")
async def toggle_like(post_id: str, current_user: dict = Depends(get_current_user)):
    post = await db.posts.find_one({"id": post_id}, {"_id": 0, "id": 1})
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    existing = await db.likes.find_one(
        {"post_id": post_id, "user_id": current_user["id"]},
        {"_id": 0, "id": 1},
    )
    if existing:
        await db.likes.delete_one({"id": existing["id"]})
        liked = False
    else:
        await db.likes.insert_one({
            "id": str(uuid.uuid4()),
            "post_id": post_id,
            "user_id": current_user["id"],
            "created_at": now_iso(),
        })
        liked = True

    like_count = await db.likes.count_documents({"post_id": post_id})
    return {"post_id": post_id, "liked": liked, "like_count": like_count}


# ─── Comments ───────────────────────────────────────────────────────────────────

@api_router.post("/posts/{post_id}/comments", response_model=CommentPublic)
async def add_comment(post_id: str, payload: CommentCreate, current_user: dict = Depends(get_current_user)):
    post = await db.posts.find_one({"id": post_id}, {"_id": 0, "id": 1})
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    comment_doc = {
        "id": str(uuid.uuid4()),
        "post_id": post_id,
        "user_id": current_user["id"],
        "user_name": current_user["name"],
        "content": payload.content.strip(),
        "created_at": now_iso(),
    }
    await db.comments.insert_one(comment_doc)
    return CommentPublic(**comment_doc)


@api_router.get("/posts/{post_id}/comments", response_model=List[CommentPublic])
async def list_comments(post_id: str, current_user: dict = Depends(get_current_user)):
    comments = await db.comments.find(
        {"post_id": post_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(1000)
    return [CommentPublic(**item) for item in comments]


# ─── Reports ────────────────────────────────────────────────────────────────────

@api_router.post("/posts/{post_id}/report")
async def report_post(post_id: str, payload: ReportCreate, current_user: dict = Depends(get_current_user)):
    post = await db.posts.find_one({"id": post_id}, {"_id": 0, "id": 1})
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    existing = await db.reports.find_one(
        {"post_id": post_id, "reported_by": current_user["id"]},
        {"_id": 0, "id": 1},
    )
    if existing:
        return {"message": "Already reported"}

    await db.reports.insert_one({
        "id": str(uuid.uuid4()),
        "post_id": post_id,
        "reported_by": current_user["id"],
        "reason": payload.reason.strip(),
        "created_at": now_iso(),
    })
    return {"message": "Report submitted"}


# ─── Games ──────────────────────────────────────────────────────────────────────

@api_router.post("/games/scores", response_model=GameScorePublic)
async def submit_game_score(payload: GameScoreCreate, current_user: dict = Depends(get_current_user)):
    game_name = payload.game_name.strip().lower()
    allowed_games = {"color-memory", "brush-rush"}
    if game_name not in allowed_games:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid game name")

    score_doc = {
        "id": str(uuid.uuid4()),
        "game_name": game_name,
        "score": payload.score,
        "duration_seconds": payload.duration_seconds,
        "user_id": current_user["id"],
        "user_name": current_user["name"],
        "created_at": now_iso(),
    }
    await db.game_scores.insert_one(score_doc)
    return GameScorePublic(**score_doc)


@api_router.get("/games/leaderboard", response_model=List[GameScorePublic])
async def get_leaderboard(
    game_name: Optional[str] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=50),
    current_user: dict = Depends(get_current_user),
):
    query = {}
    if game_name:
        query["game_name"] = game_name.strip().lower()

    leaderboard = (
        await db.game_scores.find(query, {"_id": 0})
        .sort([("score", -1), ("duration_seconds", 1), ("created_at", 1)])
        .to_list(limit)
    )
    return [GameScorePublic(**item) for item in leaderboard]


# ─── Startup / Shutdown ─────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_db_indexes():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.events.create_index("id", unique=True)
    await db.posts.create_index("id", unique=True)
    await db.comments.create_index("id", unique=True)
    await db.likes.create_index("id", unique=True)
    await db.reports.create_index("id", unique=True)
    await db.game_scores.create_index("id", unique=True)
    await db.event_joins.create_index([("event_id", 1), ("user_id", 1)], unique=True)
    logger.info("MongoDB indexes created.")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# ─── Middleware & Router ─────────────────────────────────────────────────────────

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)
