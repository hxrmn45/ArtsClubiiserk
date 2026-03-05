import { useState, useEffect, useRef, useCallback } from "react";

const PROMPTS = [
  "Draw a sun", "Sketch a cat", "Draw a house", "Doodle a tree",
  "Draw a flower", "Sketch a star", "Draw a fish", "Doodle a cloud",
  "Draw a mountain", "Sketch a bird",
];

export default function BrushRushGame({ onScoreSubmit }) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState("intro"); // intro | playing | done
  const [prompt, setPrompt] = useState("");
  const [promptIndex, setPromptIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#EA580C");
  const [size, setSize] = useState(8);
  const lastPos = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const TOTAL_ROUNDS = 5;
  const SECONDS_PER_ROUND = 15;

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FAFAF9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const startRound = useCallback((idx) => {
    clearCanvas();
    const shuffled = [...PROMPTS].sort(() => Math.random() - 0.5);
    setPrompt(shuffled[idx % shuffled.length]);
    setTimeLeft(SECONDS_PER_ROUND);
    setRound(idx + 1);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          if (idx + 1 >= TOTAL_ROUNDS) {
            setPhase("done");
          } else {
            setScore((s) => s + 50); // bonus for completing
            startRound(idx + 1);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, []);

  const handleStart = () => {
    setScore(0);
    setPhase("playing");
    startTimeRef.current = Date.now();
    startRound(0);
  };

  const handleDoneRound = () => {
    clearInterval(timerRef.current);
    const bonus = timeLeft * 5;
    const newScore = score + 100 + bonus;
    setScore(newScore);
    if (round >= TOTAL_ROUNDS) {
      setPhase("done");
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      onScoreSubmit && onScoreSubmit({ game_name: "brush-rush", score: newScore, duration_seconds: elapsed });
    } else {
      startRound(round);
    }
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const draw = (e) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.beginPath();
    if (lastPos.current) {
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
    } else {
      ctx.moveTo(pos.x, pos.y);
    }
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const COLORS_PALETTE = ["#EA580C", "#06B6D4", "#FDE047", "#22C55E", "#A855F7", "#EC4899", "#1C1917", "#FFFFFF"];

  if (phase === "intro") {
    return (
      <div className="text-center py-10">
        <h3 className="font-outfit font-bold text-2xl text-stone-900 mb-2">Brush Rush</h3>
        <p className="font-manrope text-stone-500 mb-3">Draw {TOTAL_ROUNDS} prompts in {SECONDS_PER_ROUND}s each.</p>
        <p className="font-manrope text-stone-400 text-sm mb-8">Hit "Done!" before time runs out for a bonus.</p>
        <button
          onClick={handleStart}
          className="px-10 py-4 rounded-full bg-cyan-500 text-white font-outfit font-bold hover:bg-cyan-600 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-cyan-100"
        >
          Start Brushing!
        </button>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="text-center py-10">
        <p className="text-3xl mb-2">🖌️</p>
        <h3 className="font-outfit font-bold text-2xl text-stone-900 mb-1">Great session!</h3>
        <p className="font-outfit font-bold text-cyan-500 text-3xl my-4">{score} pts</p>
        <button
          onClick={handleStart}
          className="px-8 py-3 rounded-full bg-cyan-500 text-white font-outfit font-semibold text-sm hover:bg-cyan-600 transition-colors"
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-sm">
        <div className="text-center">
          <p className="font-manrope text-xs text-stone-400 uppercase tracking-wider">Round</p>
          <p className="font-outfit font-bold text-xl text-stone-900">{round}/{TOTAL_ROUNDS}</p>
        </div>
        <div className="text-center">
          <p className="font-outfit font-bold text-2xl text-cyan-500">{prompt}</p>
        </div>
        <div className="text-center">
          <p className="font-manrope text-xs text-stone-400 uppercase tracking-wider">Time</p>
          <p className={`font-outfit font-bold text-xl ${timeLeft <= 5 ? "text-red-500" : "text-stone-900"}`}>{timeLeft}s</p>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={340}
        height={260}
        className="rounded-2xl border-2 border-stone-200 cursor-crosshair touch-none"
        style={{ background: "#FAFAF9" }}
        onMouseDown={(e) => { setDrawing(true); lastPos.current = getPos(e, canvasRef.current); }}
        onMouseMove={draw}
        onMouseUp={() => { setDrawing(false); lastPos.current = null; }}
        onMouseLeave={() => { setDrawing(false); lastPos.current = null; }}
        onTouchStart={(e) => { e.preventDefault(); setDrawing(true); lastPos.current = getPos(e, canvasRef.current); }}
        onTouchMove={(e) => { e.preventDefault(); draw(e); }}
        onTouchEnd={() => { setDrawing(false); lastPos.current = null; }}
      />

      <div className="flex items-center gap-2 flex-wrap justify-center">
        {COLORS_PALETTE.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? "border-stone-900 scale-110" : "border-stone-200"}`}
            style={{ backgroundColor: c }}
          />
        ))}
        <input type="range" min={3} max={20} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-24 accent-orange-500" />
        <button onClick={clearCanvas} className="text-xs font-manrope text-stone-400 hover:text-stone-600 transition-colors">Clear</button>
      </div>

      <button
        onClick={handleDoneRound}
        className="px-10 py-3 rounded-full bg-cyan-500 text-white font-outfit font-bold text-sm hover:bg-cyan-600 active:scale-95 transition-all duration-200"
      >
        Done! ✓
      </button>
    </div>
  );
}
