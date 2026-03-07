import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import api from "../../lib/api";

const COLORS = [
  "#EA580C", "#06B6D4", "#FDE047", "#22C55E",
  "#A855F7", "#EC4899", "#F97316", "#14B8A6",
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateCards(numPairs) {
  const colors = COLORS.slice(0, numPairs);
  const pairs = [...colors, ...colors];
  return shuffleArray(pairs).map((color, i) => ({
    id: i,
    color,
    flipped: false,
    matched: false,
  }));
}

export default function ColorMemoryGame({ onScoreSubmit }) {
  const [level, setLevel] = useState(null);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const timerRef = useRef(null);

  const numPairs = level || 4;
  const totalPairs = numPairs;

  const startGame = useCallback((pairs) => {
    setLevel(pairs);
    setCards(generateCards(pairs));
    setFlipped([]);
    setMoves(0);
    setMatched(0);
    setGameOver(false);
    setElapsed(0);
    setStartTime(Date.now());
  }, []);

  useEffect(() => {
    if (startTime && !gameOver) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [startTime, gameOver]);

  const handleFlip = (id) => {
    if (flipped.length === 2) return;

    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;

    const newFlipped = [...flipped, id];

    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, flipped: true } : c))
    );

    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);

      const [a, b] = newFlipped.map((fid) =>
        cards.find((c) => c.id === fid)
      );

      if (a.color === b.color) {
        setCards((prev) =>
          prev.map((c) =>
            newFlipped.includes(c.id) ? { ...c, matched: true } : c
          )
        );

        const newMatched = matched + 1;
        setMatched(newMatched);
        setFlipped([]);

        if (newMatched === totalPairs) {
          clearInterval(timerRef.current);
          setGameOver(true);

          const finalElapsed = Math.floor(
            (Date.now() - startTime) / 1000
          );

          setElapsed(finalElapsed);

          const score = Math.max(
            0,
            1000 - moves * 10 - finalElapsed * 2
          );

          onScoreSubmit &&
            onScoreSubmit({
              game_name: "color-memory",
              score,
              duration_seconds: finalElapsed,
            });
        }
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              newFlipped.includes(c.id)
                ? { ...c, flipped: false }
                : c
            )
          );
          setFlipped([]);
        }, 900);
      }
    }
  };

  if (!level) {
    return (
      <div className="text-center py-12">
        <h3 className="font-outfit font-bold text-2xl text-stone-900 mb-2">
          Color Memory
        </h3>

        <p className="font-manrope text-stone-500 mb-8">
          Match the color pairs. Choose your difficulty:
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          {[
            { pairs: 4, label: "Easy", sub: "4 pairs" },
            { pairs: 6, label: "Medium", sub: "6 pairs" },
            { pairs: 8, label: "Hard", sub: "8 pairs" },
          ].map(({ pairs, label, sub }) => (
            <button
              key={pairs}
              onClick={() => startGame(pairs)}
              className="px-8 py-4 rounded-2xl bg-white border-2 border-stone-100 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group"
            >
              <p className="font-outfit font-bold text-stone-900 group-hover:text-orange-600">
                {label}
              </p>

              <p className="font-manrope text-stone-400 text-sm">
                {sub}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const cols = 4;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center justify-between w-full max-w-sm">
        <div className="text-center">
          <p className="font-manrope text-xs text-stone-400 uppercase tracking-wider">
            Moves
          </p>

          <p className="font-outfit font-bold text-2xl text-stone-900">
            {moves}
          </p>
        </div>

        <div className="text-center">
          <p className="font-manrope text-xs text-stone-400 uppercase tracking-wider">
            Matched
          </p>

          <p className="font-outfit font-bold text-2xl text-orange-500">
            {matched}/{totalPairs}
          </p>
        </div>

        <div className="text-center">
          <p className="font-manrope text-xs text-stone-400 uppercase tracking-wider">
            Time
          </p>

          <p className="font-outfit font-bold text-2xl text-stone-900">
            {elapsed}s
          </p>
        </div>
      </div>

      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          maxWidth: "340px",
        }}
      >
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleFlip(card.id)}
            className={`w-16 h-16 rounded-2xl transition-all duration-300 border-2 ${
              card.flipped || card.matched
                ? "border-transparent scale-105"
                : "border-stone-200 bg-stone-100 hover:bg-stone-200 hover:scale-105"
            } ${card.matched ? "opacity-60" : ""}`}
            style={
              card.flipped || card.matched
                ? { backgroundColor: card.color }
                : {}
            }
            aria-label="card"
          />
        ))}
      </div>
    </div>
  );
}
