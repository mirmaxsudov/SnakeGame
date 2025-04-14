import React, { useEffect, useState } from "react";
import { CellType, Coord, Direction } from "./enums/Snake";
import { BOARD_I_LENGTH, BOARD_J_LENGTH } from "./const/SnakeConsts";

const SnakeGame: React.FC = () => {
  const [board, setBoard] = useState<Coord[][]>([]);
  const [snake, setSnake] = useState<Coord[]>([]);
  const [food, setFood] = useState<Coord | null>(null);
  const [direction, setDirection] = useState<Direction>(Direction.RIGHT);

  // The game loop: every 1 second, move the snake.
  useEffect(() => {
    const timerId = setTimeout(() => {
      move();
    }, 200);

    return () => clearTimeout(timerId);
  }, [snake, direction]); // run when snake or direction changes

  // Initialize board and snake only once on mount.
  useEffect(() => {
    initBoard();
    initSnake();
  }, []);

  // Ensure food is placed when board/ snake updates and no food exists.
  useEffect(() => {
    if (food === null && board.length > 0) {
      placeFood();
    }
  }, [board, snake, food]);

  // Initialize a board with proper coordinates.
  const initBoard = () => {
    const newBoard: Coord[][] = Array.from({ length: BOARD_I_LENGTH }, (_, i) =>
      Array.from({ length: BOARD_J_LENGTH }, (_, j) => ({
        row: i,
        col: j,
        type: CellType.EMPTY,
      }))
    );
    setBoard(newBoard);
  };

  // Initialize the snake; here we start at the center.
  const initSnake = () => {
    const initialSnake: Coord[] = [
      {
        row: Math.floor(BOARD_I_LENGTH / 2),
        col: Math.floor(BOARD_J_LENGTH / 2),
        type: CellType.SNAKE,
      },
    ];
    setSnake(initialSnake);
  };

  // Place food randomly on any empty cell (cells not occupied by snake).
  const placeFood = () => {
    const emptyCells: { row: number; col: number }[] = [];

    // We loop through each cell by its coordinates.
    for (let i = 0; i < BOARD_I_LENGTH; i++) {
      for (let j = 0; j < BOARD_J_LENGTH; j++) {
        // A cell is considered empty if the snake is not there.
        if (!snake.some((s) => s.row === i && s.col === j)) {
          emptyCells.push({ row: i, col: j });
        }
      }
    }

    if (emptyCells.length === 0) {
      console.warn("No empty cells available for food!");
      return;
    }

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const { row, col } = emptyCells[randomIndex];

    // Update board to mark the food cell.
    const newBoard = board.map((row) =>
      row.map((cell) => ({ ...cell, type: CellType.EMPTY }))
    );
    newBoard[row][col].type = CellType.FOOD;
    setBoard(newBoard);

    // Set the food state.
    setFood({ row, col, type: CellType.FOOD });
  };

  // The move logic; called by the game loop.
  const move = () => {
    if (snake.length === 0) return;

    const head = snake[0];
    let newHead: Coord = { ...head, type: CellType.SNAKE };

    // Compute the new head based on the current direction.
    switch (direction) {
      case Direction.UP:
        newHead.row -= 1;
        break;
      case Direction.DOWN:
        newHead.row += 1;
        break;
      case Direction.LEFT:
        newHead.col -= 1;
        break;
      case Direction.RIGHT:
        newHead.col += 1;
        break;
      default:
        break;
    }

    // Check for wall collision.
    if (
      newHead.row < 0 ||
      newHead.row >= BOARD_I_LENGTH ||
      newHead.col < 0 ||
      newHead.col >= BOARD_J_LENGTH
    ) {
      console.log("Game Over: Hit wall");
      return;
    }

    // Check for self-collision.
    if (snake.some((s) => s.row === newHead.row && s.col === newHead.col)) {
      console.log("Game Over: Hit itself");
      return;
    }

    // Determine if the snake has eaten the food.
    const ateFood =
      food !== null && newHead.row === food.row && newHead.col === food.col;
    let newSnake: Coord[];
    if (ateFood) {
      // Grow the snake by adding the new head (do not remove tail).
      newSnake = [newHead, ...snake];
      setFood(null); // Food eaten; will be replaced by useEffect.
    } else {
      // Move: add new head and remove the last element.
      newSnake = [newHead, ...snake.slice(0, snake.length - 1)];
    }

    setSnake(newSnake);

    // Update board from scratch: clear board then mark snake and food.
    const newBoard = board.map((row) =>
      row.map((cell) => ({ ...cell, type: CellType.EMPTY }))
    );
    // Mark snake cells.
    newSnake.forEach((segment) => {
      newBoard[segment.row][segment.col].type = CellType.SNAKE;
    });
    // Mark food cell if present.
    if (food && !ateFood) {
      newBoard[food.row][food.col].type = CellType.FOOD;
    }
    setBoard(newBoard);
  };

  // Keyboard controls: update direction based on arrow keys.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          if (direction !== Direction.DOWN) setDirection(Direction.UP);
          break;
        case "ArrowDown":
          if (direction !== Direction.UP) setDirection(Direction.DOWN);
          break;
        case "ArrowLeft":
          if (direction !== Direction.RIGHT) setDirection(Direction.LEFT);
          break;
        case "ArrowRight":
          if (direction !== Direction.LEFT) setDirection(Direction.RIGHT);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction]);

  return (
    <div>
      <h1 className="text-center text-4xl font-bold">Snake Game</h1>
      <div className="my-4">
        {board.map((row, i) => (
          <div key={i} className="flex justify-center">
            {row.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                className={`w-8 h-8 border flex items-center justify-center ${
                  cell.type === CellType.SNAKE
                    ? "bg-green-500"
                    : cell.type === CellType.FOOD 
                    ? "bg-red-500"
                    : "bg-white"
                }`}
              >
                {cell.type === CellType.FOOD && (
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SnakeGame;
