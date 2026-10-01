import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Board, type Arrow } from "./Board";
import type { Puzzle } from "@/lib/puzzles";

type Props = {
  puzzle: Puzzle; // remount (key) to restart
  retryOnWrong?: boolean; // replay mode: undo wrong moves instead of failing
  hintLevel?: number; // 1 = highlight piece, 2 = show move
  onSolved?: () => void;
  onFailed?: () => void;
  onProgress?: () => void; // correct move, puzzle continues
};

type Status = "waiting" | "playing" | "solved" | "failed";

const LAST_MOVE = "rgba(255,255,51,.45)";
const WRONG = "rgba(230,60,50,.7)";
const HINT = "rgba(80,160,255,.6)";
const GOOD = "#5dab3a";

const squares = (uci: string) => [uci.slice(0, 2), uci.slice(2, 4)] as const;
const toMove = (uci: string) => ({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });

export function playerColor(puzzle: Puzzle): "white" | "black" {
  // The FEN has the opponent to move; the player answers.
  return puzzle.fen.split(" ")[1] === "w" ? "black" : "white";
}

export function PuzzlePlayer({ puzzle, retryOnWrong = false, hintLevel = 0, onSolved, onFailed, onProgress }: Props) {
  const [chess] = useState(() => new Chess(puzzle.fen));
  const [fen, setFen] = useState(puzzle.fen);
  const [ply, setPly] = useState(0); // index of the next solution move
  const [status, setStatus] = useState<Status>("waiting");
  const [lastMove, setLastMove] = useState<readonly [string, string] | null>(null);
  const [wrong, setWrong] = useState<string | null>(null); // destination of a wrong move
  const timers = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  function play(uci: string) {
    const m = chess.move(toMove(uci));
    setFen(chess.fen());
    setLastMove([m.from, m.to]);
  }

  // Opponent's setup move.
  useEffect(() => {
    const t = window.setTimeout(() => {
      const m = chess.move(toMove(puzzle.moves[0]));
      setFen(chess.fen());
      setLastMove([m.from, m.to]);
      setPly(1);
      setStatus("playing");
    }, 600);
    const pending = timers.current;
    return () => {
      clearTimeout(t);
      pending.forEach(clearTimeout);
    };
  }, [chess, puzzle]);

  function handleMove(from: string, to: string, promotion?: string) {
    if (status !== "playing") return;
    const m = chess.move({ from, to, promotion });
    setFen(chess.fen());
    setLastMove([from, to]);

    // Any mate is accepted, as on Lichess and chess.com.
    if (from + to + (m.promotion ?? "") === puzzle.moves[ply] || chess.isCheckmate()) {
      if (ply + 1 >= puzzle.moves.length || chess.isCheckmate()) {
        setStatus("solved");
        onSolved?.();
        return;
      }
      setStatus("waiting");
      onProgress?.();
      later(() => {
        play(puzzle.moves[ply + 1]);
        setPly(ply + 2);
        setStatus("playing");
      }, 350);
      return;
    }

    setWrong(to);
    setStatus(retryOnWrong ? "waiting" : "failed");
    onFailed?.();
    later(() => {
      chess.undo();
      setFen(chess.fen());
      setLastMove(squares(puzzle.moves[ply - 1]));
      setWrong(null);
      if (retryOnWrong) setStatus("playing");
    }, 700);
  }

  const expected = puzzle.moves[ply];
  const showSolution = (status === "failed" && !wrong) || (hintLevel >= 2 && status === "playing");

  const highlights: Record<string, string> = {};
  if (lastMove) for (const sq of lastMove) highlights[sq] = LAST_MOVE;
  if (wrong) highlights[wrong] = WRONG;
  if (expected && hintLevel >= 1 && status === "playing") highlights[squares(expected)[0]] = HINT;
  if (status === "solved" && lastMove) highlights[lastMove[1]] = GOOD;

  const arrows: Arrow[] =
    showSolution && expected
      ? [{ startSquare: squares(expected)[0], endSquare: squares(expected)[1], color: GOOD }]
      : [];

  return (
    <Board
      fen={fen}
      orientation={playerColor(puzzle)}
      canMove={status === "playing"}
      onMove={handleMove}
      highlights={highlights}
      arrows={arrows}
    />
  );
}
