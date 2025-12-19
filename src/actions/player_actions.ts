import { Player } from "../types/player";
import { Present } from "../types/present";

export class PlayerAction {
  playerId: string;
  presents: Present[];
  players: Player[];
  turnIndex: number;
  gameStarted: boolean;
  constructor(
    playerId: string,
    orderedPlayers: Player[],
    turnIndex: number,
    presents: Present[],
    gameStarted: boolean,
  ) {
    this.playerId = playerId;
    this.players = orderedPlayers;
    this.turnIndex = turnIndex;
    this.presents = presents;
    this.gameStarted = gameStarted;
  }
  // async SyncRoom(roomId: string) {
  // this.players = await GetRoomPlayers(roomId);
  // this.presents = await GetRoomPresents(roomId);
  // }
}

export type SendTakeAction = {
  senderId: string;
  gifterId: string;
};
