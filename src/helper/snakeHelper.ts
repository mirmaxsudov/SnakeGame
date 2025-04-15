import {CellType, Coord, Direction} from "../enums/Snake";

/**
 * Finds the shortest path from the snake's head to the food using the A* algorithm.
 * The board is a matrix (array of arrays) of cells (Coord) representing a rectangular grid.
 * Since there are no explicit wall cells, board boundaries are derived from the matrix dimensions.
 * Only cells marked as EMPTY or FOOD are allowed for movement.
 *
 * @param board 2D array of Coord cells representing the grid.
 * @param snake Array of Coord for the snake; snake[0] is the head.
 * @param food The target food coordinate.
 * @returns The first Direction to move toward the food, or null if no path exists.
 */
export function findShortestWayToFood(board: Coord[][], snake: Coord[], food: Coord): Direction | null {
    if (snake.length === 0) return null;

    // Derive grid dimensions directly from the matrix.
    const rows = board.length;
    const cols = board[0]?.length || 0;

    // Helper to check if a position is within the board boundaries and is passable.
    function isValid(row: number, col: number): boolean {
        if (row < 0 || row >= rows || col < 0 || col >= cols) return false;
        const cell = board[row][col];
        // Only allow travel on EMPTY cells or the cell with FOOD.
        return cell.type === CellType.EMPTY || cell.type === CellType.FOOD;
    }

    // A* node definition.
    type Node = {
        row: number;
        col: number;
        g: number; // cost from the start
        h: number; // heuristic cost to food
        f: number; // total cost (g + h)
        parent: Node | null;
    };

    // Manhattan distance heuristic.
    function heuristic(row: number, col: number): number {
        return Math.abs(row - food.row) + Math.abs(col - food.col);
    }

    // Open set (nodes to explore) and closed set (visited nodes).
    const openSet: Node[] = [];
    const closedSet: Set<string> = new Set();

    // Generate a unique key for a coordinate.
    function coordKey(row: number, col: number): string {
        return `${row}-${col}`;
    }

    // Start from the snake's head.
    const start = snake[0];
    const startNode: Node = {
        row: start.row,
        col: start.col,
        g: 0,
        h: heuristic(start.row, start.col),
        f: heuristic(start.row, start.col),
        parent: null,
    };

    openSet.push(startNode);

    // Define possible movements with their corresponding direction.
    const moves = [
        {dir: Direction.UP, rowDelta: -1, colDelta: 0},
        {dir: Direction.DOWN, rowDelta: 1, colDelta: 0},
        {dir: Direction.LEFT, rowDelta: 0, colDelta: -1},
        {dir: Direction.RIGHT, rowDelta: 0, colDelta: 1},
    ];

    // A* search loop.
    while (openSet.length > 0) {
        // Sort openSet to pick the node with the lowest f value.
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift()!;
        closedSet.add(coordKey(current.row, current.col));

        // Check if we reached the food.
        if (current.row === food.row && current.col === food.col) {
            // Reconstruct the path from snake's head to the food.
            const path: Node[] = [];
            let temp: Node | null = current;
            while (temp) {
                path.push(temp);
                temp = temp.parent;
            }
            path.reverse(); // Now the path starts at the snake's head.

            // If the path length is less than 2, the snake is already at the food.
            if (path.length < 2) return null;

            // Determine the first move direction using the difference between
            // the snake's head and the next step in the path.
            const nextStep = path[1];
            if (nextStep.row < start.row) return Direction.UP;
            if (nextStep.row > start.row) return Direction.DOWN;
            if (nextStep.col < start.col) return Direction.LEFT;
            if (nextStep.col > start.col) return Direction.RIGHT;
        }

        // Explore the neighboring cells in all four cardinal directions.
        for (const move of moves) {
            const newRow = current.row + move.rowDelta;
            const newCol = current.col + move.colDelta;

            if (!isValid(newRow, newCol)) continue; // Skip out-of-bound or blocked cells.

            const neighborKey = coordKey(newRow, newCol);
            if (closedSet.has(neighborKey)) continue;

            const tentativeG = current.g + 1;

            // Check if the neighbor is already in the open set.
            let neighbor = openSet.find(n => n.row === newRow && n.col === newCol);
            if (!neighbor) {
                neighbor = {
                    row: newRow,
                    col: newCol,
                    g: tentativeG,
                    h: heuristic(newRow, newCol),
                    f: tentativeG + heuristic(newRow, newCol),
                    parent: current,
                };
                openSet.push(neighbor);
            } else if (tentativeG < neighbor.g) {
                // Found a better path to the neighbor.
                neighbor.g = tentativeG;
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = current;
            }
        }
    }

    // If no valid path is found, return null.
    return null;
}