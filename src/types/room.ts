import { Player } from "./player";

export type Game = {
  turnOrder: Player[];
  turnIndex: number;
};
