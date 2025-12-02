import { GetRoomPlayers } from "@/db/players";
import { Player } from "../types/player";
import { Present } from "../types/present";
import { GetRoomPresents } from "@/db/present";

export enum ActionTypes {
  Join,
  Reveal,
  Take,
}

export abstract class PlayerAction {
  abstract type: ActionTypes;
}

export class JoinAction extends PlayerAction {
  type: ActionTypes = ActionTypes.Join;
  playerId: string;
  players: Player[] = [];
  presents: Present[] = [];
  constructor(playerId: string) {
    super();
    this.playerId = playerId;
  }
  async SyncRoom(roomId: string) {
    this.players = await GetRoomPlayers(roomId);
    this.presents = await GetRoomPresents(roomId);
  }
}

export class RevealAction extends PlayerAction {
  type: ActionTypes = ActionTypes.Reveal;
  playerId: string;
  present: Present;
  constructor(playerId: string, present: Present) {
    super();
    this.playerId = playerId;
    this.present = present;
  }
}

export class TakeAction extends PlayerAction {
  type: ActionTypes = ActionTypes.Take;
  playerId: string;
  present: Present;
  constructor(playerId: string, present: Present) {
    super();
    this.playerId = playerId;
    this.present = present;
  }
}
