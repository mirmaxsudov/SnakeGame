import React, { useEffect, useState } from "react";
import { CellType, Coord, Direction } from "../../enums/Snake";
import { BOARD_I_LENGTH, BOARD_J_LENGTH } from "../../const/SnakeConsts";
import { findShortestWayToFood } from "../../helper/snakeHelper";

const AiSnake: React.FC = () => {
    const [board, setBoard] = useState<Coord[][]>([]);
    const [snake, setSnake] = useState<Coord[]>([]);
    const [food, setFood] = useState<Coord | null>(null);
    const [direction, setDirection] = useState<Direction>(Direction.RIGHT);

    // Helper: Build a fresh board for pathfinding based on current snake & food.
    const getPathfindingBoard = (): Coord[][] => {
        const newBoard: Coord[][] = [];
        for (let i = 0; i < BOARD_I_LENGTH; i++) {
            const row: Coord[] = [];
            for (let j = 0; j < BOARD_J_LENGTH; j++) {
                let cellType = CellType.EMPTY;
                // Mark the cell as SNAKE if any snake segment occupies it.
                if (snake.some((seg) => seg.row === i && seg.col === j)) {
                    cellType = CellType.SNAKE;
                }
                // Mark the cell as FOOD if it matches the current food.
                if (food && food.row === i && food.col === j) {
                    cellType = CellType.FOOD;
                }
                row.push({ row: i, col: j, type: cellType });
            }
            newBoard.push(row);
        }
        return newBoard;
    };

    // Game loop: every 100ms determine next move and update snake.
    useEffect(() => {
        const timerId = setTimeout(() => {
            // Rebuild board for the pathfinding step so that snake cells are correctly marked.
            const currentPathfindingBoard = getPathfindingBoard();
            const nextDir = findShortestWayToFood(currentPathfindingBoard, snake, food as Coord);
            const moveDir = nextDir ? nextDir : direction;
            setDirection(moveDir);
            move(moveDir);
        }, 100);

        return () => clearTimeout(timerId);
    }, [snake, food, direction]); // We don't need board dependency here as we rebuild it for pathfinding.

    // Initialize board and snake once on mount.
    useEffect(() => {
        initBoard();
        initSnake();
    }, []);

    // Place food on the board if none exists.
    useEffect(() => {
        if (food === null && board.length > 0) {
            placeFood();
        }
    }, [board, snake, food]);

    // Create an empty board as a matrix for rendering.
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

    // Initialize the snake at the center of the board.
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

    // Place food randomly on an empty cell.
    const placeFood = () => {
        const emptyCells: { row: number; col: number }[] = [];
        for (let i = 0; i < BOARD_I_LENGTH; i++) {
            for (let j = 0; j < BOARD_J_LENGTH; j++) {
                // A cell is empty if no snake segment occupies it.
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
        const newBoard = board.map((boardRow) =>
            boardRow.map((cell) => ({ ...cell, type: CellType.EMPTY }))
        );
        newBoard[row][col].type = CellType.FOOD;
        setBoard(newBoard);
        setFood({ row, col, type: CellType.FOOD });
    };

    /**
     * Moves the snake given the computed direction.
     * Updates both the snake and board states.
     *
     * @param moveDir The direction to move.
     */
    const move = (moveDir: Direction) => {
        if (snake.length === 0) return;

        const head = snake[0];
        let newHead: Coord = { ...head, type: CellType.SNAKE };

        // Compute the new head position based on moveDir.
        switch (moveDir) {
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
            // Restart the game if collision is detected.
            console.log("Game Over: Hit itself. Restarting.");
            initBoard();
            initSnake();
            return;
        }

        // Check if snake has eaten the food.
        const ateFood =
            food !== null &&
            newHead.row === food.row &&
            newHead.col === food.col;

        let newSnake: Coord[];
        if (ateFood) {
            // Grow the snake (new head added, tail remains).
            newSnake = [newHead, ...snake];
            setFood(null); // Food eaten; will be replaced by useEffect.
        } else {
            // Move snake (add new head, remove tail).
            newSnake = [newHead, ...snake.slice(0, snake.length - 1)];
        }
        setSnake(newSnake);

        // Rebuild the board for rendering: mark snake and food.
        const newBoard = board.map((boardRow) =>
            boardRow.map((cell) => ({ ...cell, type: CellType.EMPTY }))
        );
        newSnake.forEach((segment) => {
            newBoard[segment.row][segment.col].type = CellType.SNAKE;
        });
        if (food && !ateFood) {
            newBoard[food.row][food.col].type = CellType.FOOD;
        }
        setBoard(newBoard);
    };

    return (
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
    );
};

export default AiSnake;