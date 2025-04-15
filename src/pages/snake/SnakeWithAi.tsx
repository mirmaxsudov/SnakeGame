import React, {useEffect, useState} from "react";
import {CellType, Coord, Direction} from "../../enums/Snake";
import {BOARD_I_LENGTH, BOARD_J_LENGTH} from "../../const/SnakeConsts";
import {findShortestWayToFood} from "../../helper/snakeHelper";

const SnakeWithAi: React.FC = () => {
    // Board: used for rendering.
    const [board, setBoard] = useState<Coord[][]>([]);
    // AI snake state.
    const [snake, setSnake] = useState<Coord[]>([]);
    // User snake state.
    const [userSnake, setUserSnake] = useState<Coord[]>([]);
    // Food state.
    const [food, setFood] = useState<Coord | null>(null);
    // Direction for the AI snake.
    const [aiDirection, setAiDirection] = useState<Direction>(Direction.RIGHT);
    // Direction for the user-controlled snake.
    const [userDirection, setUserDirection] = useState<Direction>(Direction.RIGHT);

    // -------------------------------
    // Board & Pathfinding Helpers
    // -------------------------------

    // Build a board used for pathfinding, marking both snakes as obstacles.
    const getPathfindingBoard = (): Coord[][] => {
        const newBoard: Coord[][] = [];
        for (let i = 0; i < BOARD_I_LENGTH; i++) {
            const row: Coord[] = [];
            for (let j = 0; j < BOARD_J_LENGTH; j++) {
                let cellType = CellType.EMPTY;
                // Mark as occupied if either snake occupies the cell.
                if (
                    snake.some((seg) => seg.row === i && seg.col === j) ||
                    userSnake.some((seg) => seg.row === i && seg.col === j)
                ) {
                    cellType = CellType.SNAKE; // Use a generic blocked type for A*.
                }
                // If food is here, mark it.
                if (food && food.row === i && food.col === j) {
                    cellType = CellType.FOOD;
                }
                row.push({row: i, col: j, type: cellType});
            }
            newBoard.push(row);
        }
        return newBoard;
    };

    // Rebuild and update the board for rendering from the states of both snakes and the food.
    const updateBoard = () => {
        const newBoard: Coord[][] = Array.from({length: BOARD_I_LENGTH}, (_, i) =>
            Array.from({length: BOARD_J_LENGTH}, (_, j) => ({
                row: i,
                col: j,
                type: CellType.EMPTY,
            }))
        );
        // Mark AI snake segments.
        snake.forEach((seg) => {
            newBoard[seg.row][seg.col].type = CellType.AI_SNAKE;
        });
        // Mark user snake segments.
        userSnake.forEach((seg) => {
            newBoard[seg.row][seg.col].type = CellType.USER_SNAKE;
        });
        // Mark food if it exists.
        if (food) {
            newBoard[food.row][food.col].type = CellType.FOOD;
        }
        setBoard(newBoard);
    };

    // -------------------------------
    // Movement and Collision
    // -------------------------------

    // Move the AI snake given its computed direction.
    const moveAiSnake = (moveDir: Direction) => {
        if (snake.length === 0) return;
        const head = snake[0];
        let newHead: Coord = {...head, type: CellType.AI_SNAKE};
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
            console.log("AI Snake hit wall. Resetting AI snake.");
            resetAiSnake();
            return;
        }
        // Check collision: with itself or the user snake.
        if (
            snake.some((seg) => seg.row === newHead.row && seg.col === newHead.col) ||
            userSnake.some((seg) => seg.row === newHead.row && seg.col === newHead.col)
        ) {
            console.log("AI Snake collided. Resetting AI snake.");
            resetAiSnake();
            return;
        }
        // Check if food is eaten.
        const ateFood =
            food !== null &&
            newHead.row === food.row &&
            newHead.col === food.col;
        let newSnake: Coord[];
        if (ateFood) {
            newSnake = [newHead, ...snake]; // Grow snake.
            setFood(null);
        } else {
            newSnake = [newHead, ...snake.slice(0, snake.length - 1)];
        }
        setSnake(newSnake);
    };

    // Move the user snake given the current user direction.
    const moveUserSnake = (moveDir: Direction) => {
        if (userSnake.length === 0) return;
        const head = userSnake[0];
        let newHead: Coord = {...head, type: CellType.USER_SNAKE};
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
            console.log("User Snake hit wall. Resetting user snake.");
            resetUserSnake();
            return;
        }
        // Check collision: with itself or the AI snake.
        if (
            userSnake.some((seg) => seg.row === newHead.row && seg.col === newHead.col) ||
            snake.some((seg) => seg.row === newHead.row && seg.col === newHead.col)
        ) {
            console.log("User Snake collided. Resetting user snake.");
            resetUserSnake();
            return;
        }
        // Check if food is eaten.
        const ateFood =
            food !== null &&
            newHead.row === food.row &&
            newHead.col === food.col;
        let newUserSnake: Coord[];
        if (ateFood) {
            newUserSnake = [newHead, ...userSnake]; // Grow snake.
            setFood(null);
        } else {
            newUserSnake = [newHead, ...userSnake.slice(0, userSnake.length - 1)];
        }
        setUserSnake(newUserSnake);
    };

    // Reset only the AI snake (for example, after collision).
    const resetAiSnake = () => {
        const newAiSnake: Coord[] = [
            {
                row: Math.floor(BOARD_I_LENGTH / 2),
                col: Math.floor(BOARD_J_LENGTH / 2),
                type: CellType.AI_SNAKE,
            },
        ];
        setSnake(newAiSnake);
    };

    // Reset only the user snake.
    const resetUserSnake = () => {
        const newUserSnake: Coord[] = [
            {
                row: BOARD_I_LENGTH - 1,
                col: BOARD_J_LENGTH - 1,
                type: CellType.USER_SNAKE,
            },
        ];
        setUserSnake(newUserSnake);
    };

    // -------------------------------
    // Game Loop
    // -------------------------------

    // Combined game tick: update both snakes each interval.
    useEffect(() => {
        const timerId = setTimeout(() => {
            // For AI snake: rebuild the board for pathfinding
            const currentPathfindingBoard = getPathfindingBoard();
            const nextAIDir = findShortestWayToFood(
                currentPathfindingBoard,
                snake,
                food as Coord
            );
            const aiMoveDir = nextAIDir ? nextAIDir : aiDirection;
            setAiDirection(aiMoveDir);
            moveAiSnake(aiMoveDir);
            // For user snake: move using current userDirection.
            moveUserSnake(userDirection);
            // Update the board for rendering.
            updateBoard();
        }, 100);
        return () => clearTimeout(timerId);
    }, [snake, userSnake, food, aiDirection, userDirection]);

    // -------------------------------
    // Input: User Controls via Keyboard
    // -------------------------------
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowUp") {
                setUserDirection(Direction.UP);
            } else if (e.key === "ArrowDown") {
                setUserDirection(Direction.DOWN);
            } else if (e.key === "ArrowLeft") {
                setUserDirection(Direction.LEFT);
            } else if (e.key === "ArrowRight") {
                setUserDirection(Direction.RIGHT);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // -------------------------------
    // Initialization & Food Placement
    // -------------------------------

    // Create an empty board initially.
    const initBoard = () => {
        const newBoard: Coord[][] = Array.from({length: BOARD_I_LENGTH}, (_, i) =>
            Array.from({length: BOARD_J_LENGTH}, (_, j) => ({
                row: i,
                col: j,
                type: CellType.EMPTY,
            }))
        );
        setBoard(newBoard);
    };

    // Initialize both snakes.
    const initSnake = () => {
        const initialAiSnake: Coord[] = [
            {
                row: Math.floor(BOARD_I_LENGTH / 2),
                col: Math.floor(BOARD_J_LENGTH / 2),
                type: CellType.AI_SNAKE,
            },
        ];
        const initialUserSnake: Coord[] = [
            {
                row: BOARD_I_LENGTH - 1,
                col: BOARD_J_LENGTH - 1,
                type: CellType.USER_SNAKE,
            },
        ];
        setSnake(initialAiSnake);
        setUserSnake(initialUserSnake);
    };

    // Place food on any cell not occupied by either snake.
    const placeFood = () => {
        const emptyCells: { row: number; col: number }[] = [];
        for (let i = 0; i < BOARD_I_LENGTH; i++) {
            for (let j = 0; j < BOARD_J_LENGTH; j++) {
                if (
                    !snake.some((s) => s.row === i && s.col === j) &&
                    !userSnake.some((s) => s.row === i && s.col === j)
                ) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }
        if (emptyCells.length === 0) {
            console.warn("No empty cells available for food!");
            return;
        }
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const {row, col} = emptyCells[randomIndex];
        setFood({row, col, type: CellType.FOOD});
    };

    // On mount, initialize board and snakes.
    useEffect(() => {
        initBoard();
        initSnake();
    }, []);

    // Place food if none exists.
    useEffect(() => {
        if (food === null) {
            placeFood();
        }
    }, [food, snake, userSnake]);

    // -------------------------------
    // Rendering
    // -------------------------------
    return (
        <div className="my-4">
            {board.map((row, i) => (
                <div key={i} className="flex justify-center">
                    {row.map((cell, j) => (
                        <div
                            key={`${i}-${j}`}
                            className={`w-8 h-8 border flex items-center justify-center ${
                                cell.type === CellType.AI_SNAKE
                                    ? "bg-green-500"
                                    : cell.type === CellType.USER_SNAKE
                                        ? "bg-blue-500"
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

export default SnakeWithAi;