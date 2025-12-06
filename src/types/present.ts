import { Player } from "./player";

export type Present = {
  gifter: Player;
  items: Item[];
};

export type Item = {
  name: string;
  gameId: number;
  tags: string[];
  maxTags: number;
};
