import { Player } from "./player";
import { Present } from "./present";

export type Room = {
  id: string;
  players: Player[];
  gifts: Present[];
};
