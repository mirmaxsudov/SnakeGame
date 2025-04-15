import React, {useEffect, useState} from "react";

// --- Enums & Types ---

enum CellType {
    EMPTY = "EMPTY",
    PLAYER_ONE = "PLAYER_ONE",
    PLAYER_TWO = "PLAYER_TWO",
    FOOD = "FOOD",
}

enum Direction {
    UP = "UP",
    DOWN = "DOWN",
    LEFT = "LEFT",
    RIGHT = "RIGHT",
}

type Coord = {
    row: number;
    col: number;
    type: CellType;
};

// --- Board Dimensions ---
const BOARD_ROWS = 20;
const BOARD_COLS = 20;

// --- The Two Player Snake Component ---

const SnakeTwo: React.FC = () => {
    // Board state for rendering.
    const [board, setBoard] = useState<Coord[][]>([]);
    // Snake state for each player.
    const [snakeOne, setSnakeOne] = useState<Coord[]>([]);
    const [snakeTwo, setSnakeTwo] = useState<Coord[]>([]);
    // Food state.
    const [food, setFood] = useState<Coord | null>(null);
    // Direction state for each snake.
    const [directionOne, setDirectionOne] = useState<Direction>(Direction.RIGHT);
    const [directionTwo, setDirectionTwo] = useState<Direction>(Direction.LEFT);

    // --- Initialization Functions ---

    // Create an empty board.
    const initBoard = () => {
        const newBoard: Coord[][] = [];
        for (let r = 0; r < BOARD_ROWS; r++) {
            const row: Coord[] = [];
            for (let c = 0; c < BOARD_COLS; c++) {
                row.push({row: r, col: c, type: CellType.EMPTY});
            }
            newBoard.push(row);
        }
        setBoard(newBoard);
    };

    // Initialize the two snakes in different positions.
    const initSnakes = () => {
        // Place player one toward the left of center.
        const initialSnakeOne: Coord[] = [
            {row: Math.floor(BOARD_ROWS / 2), col: 2, type: CellType.PLAYER_ONE},
        ];
        // Place player two toward the right of center.
        const initialSnakeTwo: Coord[] = [
            {row: Math.floor(BOARD_ROWS / 2), col: BOARD_COLS - 3, type: CellType.PLAYER_TWO},
        ];
        setSnakeOne(initialSnakeOne);
        setSnakeTwo(initialSnakeTwo);
    };

    // Generate food randomly on an empty cell.
    const placeFood = () => {
        const emptyCells: { row: number; col: number }[] = [];
        for (let r = 0; r < BOARD_ROWS; r++) {
            for (let c = 0; c < BOARD_COLS; c++) {
                if (
                    !snakeOne.some(seg => seg.row === r && seg.col === c) &&
                    !snakeTwo.some(seg => seg.row === r && seg.col === c)
                ) {
                    emptyCells.push({row: r, col: c});
                }
            }
        }
        if (emptyCells.length === 0) return;
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const {row, col} = emptyCells[randomIndex];
        setFood({row, col, type: CellType.FOOD});
    };

    // Reset player one's snake (for collisions).
    const resetSnakeOne = () => {
        setSnakeOne([{row: Math.floor(BOARD_ROWS / 2), col: 2, type: CellType.PLAYER_ONE}]);
        setDirectionOne(Direction.RIGHT);
    };

    // Reset player two's snake.
    const resetSnakeTwo = () => {
        setSnakeTwo([{row: Math.floor(BOARD_ROWS / 2), col: BOARD_COLS - 3, type: CellType.PLAYER_TWO}]);
        setDirectionTwo(Direction.LEFT);
    };

    // --- Movement Function ---
    // This function returns a new snake array given current snake, its direction, and its cell type.
    // It returns null if the move results in a collision with wall or self.
    const moveSnake = (
        snake: Coord[],
        direction: Direction,
        selfType: CellType
    ): Coord[] | null => {
        if (snake.length === 0) return snake;
        const head = snake[0];
        let newHead = {...head, type: selfType};
        // Update head position based on direction.
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
        // Wall collision.
        if (
            newHead.row < 0 ||
            newHead.row >= BOARD_ROWS ||
            newHead.col < 0 ||
            newHead.col >= BOARD_COLS
        ) {
            return null;
        }
        // Self-collision.
        if (snake.some(seg => seg.row === newHead.row && seg.col === newHead.col)) {
            return null;
        }
        // Determine if food is eaten.
        const ateFood = food !== null && newHead.row === food.row && newHead.col === food.col;
        let newSnake: Coord[];
        if (ateFood) {
            newSnake = [newHead, ...snake]; // Grow the snake.
        } else {
            newSnake = [newHead, ...snake.slice(0, snake.length - 1)];
        }
        return newSnake;
    };

    // --- Update Board for Rendering ---
    const updateBoard = () => {
        const newBoard: Coord[][] = [];
        for (let r = 0; r < BOARD_ROWS; r++) {
            const row: Coord[] = [];
            for (let c = 0; c < BOARD_COLS; c++) {
                row.push({row: r, col: c, type: CellType.EMPTY});
            }
            newBoard.push(row);
        }
        // Mark snake one.
        snakeOne.forEach(seg => {
            newBoard[seg.row][seg.col].type = CellType.PLAYER_ONE;
        });
        // Mark snake two.
        snakeTwo.forEach(seg => {
            newBoard[seg.row][seg.col].type = CellType.PLAYER_TWO;
        });
        // Mark food.
        if (food) {
            newBoard[food.row][food.col].type = CellType.FOOD;
        }
        setBoard(newBoard);
    };

    // --- Game Loop ---
    // Every tick, move both snakes using their current directions, check collisions, and update board.
    useEffect(() => {
        const timerId = setInterval(() => {
            // Compute new state for snake one.
            const newSnakeOne = moveSnake(snakeOne, directionOne, CellType.PLAYER_ONE);
            let validSnakeOne = true;
            if (newSnakeOne === null) {
                validSnakeOne = false;
                resetSnakeOne();
            }
            // Compute new state for snake two.
            const newSnakeTwo = moveSnake(snakeTwo, directionTwo, CellType.PLAYER_TWO);
            let validSnakeTwo = true;
            if (newSnakeTwo === null) {
                validSnakeTwo = false;
                resetSnakeTwo();
            }
            // Check for inter-snake collisions:
            if (newSnakeOne) {
                const headOne = newSnakeOne[0];
                // If head one lands on any segment of snake two, collision.
                if (snakeTwo.some(seg => seg.row === headOne.row && seg.col === headOne.col)) {
                    validSnakeOne = false;
                    resetSnakeOne();
                }
            }
            if (newSnakeTwo) {
                const headTwo = newSnakeTwo[0];
                if (snakeOne.some(seg => seg.row === headTwo.row && seg.col === headTwo.col)) {
                    validSnakeTwo = false;
                    resetSnakeTwo();
                }
            }
            // Update snakes if moves are valid.
            if (validSnakeOne && newSnakeOne) {
                setSnakeOne(newSnakeOne);
            }
            if (validSnakeTwo && newSnakeTwo) {
                setSnakeTwo(newSnakeTwo);
            }
            // If either snake ate the food, remove it so it gets re-placed.
            if (food) {
                const headOne = validSnakeOne && newSnakeOne ? newSnakeOne[0] : null;
                const headTwo = validSnakeTwo && newSnakeTwo ? newSnakeTwo[0] : null;
                if (
                    (headOne && headOne.row === food.row && headOne.col === food.col) ||
                    (headTwo && headTwo.row === food.row && headTwo.col === food.col)
                ) {
                    setFood(null);
                }
            }
            updateBoard();
        }, 150);
        return () => clearInterval(timerId);
    }, [snakeOne, snakeTwo, directionOne, directionTwo, food]);

    // Place food if none exists.
    useEffect(() => {
        if (!food) {
            placeFood();
        }
    }, [food, snakeOne, snakeTwo]);

    // --- Keyboard Controls ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Player one: W, A, S, D keys.
            if (e.key === "w" || e.key === "W") {
                setDirectionOne(Direction.UP);
            } else if (e.key === "s" || e.key === "S") {
                setDirectionOne(Direction.DOWN);
            } else if (e.key === "a" || e.key === "A") {
                setDirectionOne(Direction.LEFT);
            } else if (e.key === "d" || e.key === "D") {
                setDirectionOne(Direction.RIGHT);
            }
            // Player two: Arrow keys.
            else if (e.key === "ArrowUp") {
                setDirectionTwo(Direction.UP);
            } else if (e.key === "ArrowDown") {
                setDirectionTwo(Direction.DOWN);
            } else if (e.key === "ArrowLeft") {
                setDirectionTwo(Direction.LEFT);
            } else if (e.key === "ArrowRight") {
                setDirectionTwo(Direction.RIGHT);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // --- Initial Setup ---
    useEffect(() => {
        initBoard();
        initSnakes();
    }, []);

    // --- Rendering ---
    return (
        <div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${BOARD_COLS}, 20px)`,
                    gap: "1px",
                    width: BOARD_COLS * 21,
                    margin: "auto",
                }}
            >
                {board.flat().map((cell, index) => (
                    <div
                        key={index}
                        style={{
                            width: "20px",
                            height: "20px",
                            backgroundColor:
                                cell.type === CellType.EMPTY
                                    ? "#fff"
                                    : cell.type === CellType.PLAYER_ONE
                                        ? "green"
                                        : cell.type === CellType.PLAYER_TWO
                                            ? "blue"
                                            : cell.type === CellType.FOOD
                                                ? "red"
                                                : "#fff",
                            border: "1px solid #ccc",
                        }}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default SnakeTwo;