export enum CellType {
  EMPTY = "EMPTY",
  SNAKE = "SNAKE",
  FOOD = "FOOD",
  AI_SNAKE = "AI_SNAKE",
  USER_SNAKE = "USER_SNAKE",
}

export enum GameState {
  PLAYING = "PLAYING",
  PAUSED = "PAUSED",
  GAME_OVER = "GAME_OVER",
}

export enum SnakeState {
  ALIVE = "ALIVE",
  DEAD = "DEAD",
}

export type Coord = {
  row: number;
  col: number;
  type: CellType;
};

export enum Direction {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}
