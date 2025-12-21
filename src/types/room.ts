import { Player } from "./player";
import { Present } from "./present";

export type Game = {
  turnOrder: Player[];
  turnIndex: number;
  presents: Present[];
  roomId: string;
};
