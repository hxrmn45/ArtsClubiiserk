import { useState, useEffect } from "react";
import { Trophy, Gamepad2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import ColorMemoryGame from "@/components/games/ColorMemoryGame";
import BrushRushGame from "@/components/games/BrushRushGame";

function Leaderboard({ gameName }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/games/leaderboard?game_name=${gameName}&limit=10`);
        setScores(res.data);
      } catch {
        toast.error("Couldn't load leaderboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [gameName]);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="bg-white rounded-3xl border border-stone-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="font-outfit font-bold text-stone-900">Leaderboard</h3>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-stone-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : scores.length === 0 ? (
        <p className="font-manrope text-stone-400 text-sm text-center py-4">No scores yet. Be the first!</p>
      ) : (
        <div className="space-y-2">
          {scores.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-stone-50 hover:bg-orange-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg w-6">{medals[i] || `${i + 1}.`}</span>
                <span className="font-manrope text-sm font-medium text-stone-800">{s.user_name}</span>
              </div>
              <span className="font-outfit font-bold text-orange-500">{s.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const GAMES = [
  {
    id: "color-memory",
    name: "Color Memory",
    desc: "Flip and match color tiles before time runs out.",
    color: "bg-orange-50 border-orange-200",
    badge: "bg-orange-100 text-orange-600",
  },
  {
    id: "brush-rush",
    name: "Brush Rush",
    desc: "Draw random prompts as fast as you can!",
    color: "bg-cyan-50 border-cyan-200",
    badge: "bg-cyan-100 text-cyan-600",
  },
];

export default function GamesPage() {
  const [activeGame, setActiveGame] = useState(null);
  const [leaderboardGame, setLeaderboardGame] = useState("color-memory");
  const [submitKey, setSubmitKey] = useState(0);

  const handleScoreSubmit = async ({ game_name, score, duration_seconds }) => {
    try {
      await api.post("/games/scores", { game_name, score, duration_seconds });
      toast.success(`Score of ${score} submitted!`);
      setSubmitKey((k) => k + 1); // force leaderboard refresh
      setLeaderboardGame(game_name);
    } catch {
      toast.error("Couldn't save your score.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="font-outfit font-extrabold text-4xl text-stone-900 tracking-tight">Games Hub</h1>
        <p className="font-manrope text-stone-500 mt-1">Play, compete, and climb the leaderboard.</p>
      </div>

      {!activeGame ? (
        <>
          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            {GAMES.map((game) => (
              <button
                key={game.id}
                onClick={() => setActiveGame(game.id)}
                className={`text-left p-8 rounded-3xl border-2 ${game.color} hover:-translate-y-1 hover:shadow-xl transition-all duration-300`}
              >
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-outfit font-semibold mb-4 ${game.badge}`}>
                  {game.id}
                </span>
                <h3 className="font-outfit font-bold text-2xl text-stone-900 mb-2">{game.name}</h3>
                <p className="font-manrope text-stone-500">{game.desc}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-outfit font-semibold text-stone-600">
                  <Gamepad2 className="w-4 h-4" /> Play Now →
                </div>
              </button>
            ))}
          </div>

          {/* Leaderboard section */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="font-outfit font-bold text-2xl text-stone-900">Leaderboard</h2>
              <div className="flex rounded-xl bg-stone-100 p-1">
                {GAMES.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setLeaderboardGame(g.id)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-outfit font-medium transition-colors ${
                      leaderboardGame === g.id ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="max-w-md">
              <Leaderboard key={`${leaderboardGame}-${submitKey}`} gameName={leaderboardGame} />
            </div>
          </div>
        </>
      ) : (
        <div>
          <button
            onClick={() => setActiveGame(null)}
            className="mb-8 font-manrope text-sm text-stone-400 hover:text-stone-600 transition-colors"
          >
            ← Back to Games
          </button>
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="flex-1 bg-white rounded-3xl border border-stone-100 p-8 shadow-sm">
              <h2 className="font-outfit font-bold text-2xl text-stone-900 mb-6">
                {GAMES.find((g) => g.id === activeGame)?.name}
              </h2>
              {activeGame === "color-memory" && (
                <ColorMemoryGame onScoreSubmit={handleScoreSubmit} />
              )}
              {activeGame === "brush-rush" && (
                <BrushRushGame onScoreSubmit={handleScoreSubmit} />
              )}
            </div>
            <div className="w-full lg:w-72">
              <Leaderboard key={`${activeGame}-${submitKey}`} gameName={activeGame} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
