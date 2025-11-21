import { Player } from "./player";
import { Present } from "./present";

export type Room = {
  players: Map<string, Player>;
  presents: Present[];
};
