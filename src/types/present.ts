import { Player } from "./player";

export type Present = {
  name: string;
  gameId: number;
  gifter: Player;
  tags: string[];
};
