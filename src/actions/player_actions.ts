// import { GetRoomPlayers } from "@/db/players";
import { Player } from "../types/player";
import { Present } from "../types/present";
import { GetRoomPresents } from "@/db/present";

export enum ActionTypes {
  Join,
  OrderCorrection,
  Take,
}

export abstract class PlayerAction {
  abstract type: ActionTypes;
  abstract playerId: string;
  abstract turnIndex: number;
}

export class JoinAction extends PlayerAction {
  type: ActionTypes = ActionTypes.Join;
  playerId: string;
  presents: Present[] = [];
  players: Player[];
  turnIndex: number;
  constructor(playerId: string, orderedPlayers: Player[], turnIndex: number) {
    super();
    this.playerId = playerId;
    this.players = orderedPlayers;
    this.turnIndex = turnIndex;
  }
  async SyncRoom(roomId: string) {
    // this.players = await GetRoomPlayers(roomId);
    this.presents = await GetRoomPresents(roomId);
  }
}

export class OrderCorrectionAction extends PlayerAction {
  type: ActionTypes = ActionTypes.OrderCorrection;
  playerId: string = "server";
  players: Player[];
  turnIndex: number;
  constructor(orderedPlayers: Player[], turnIndex: number) {
    super();
    this.players = orderedPlayers;
    this.turnIndex = turnIndex;
  }
}

export class TakeAction extends PlayerAction {
  type: ActionTypes = ActionTypes.Take;
  playerId: string;
  present: Present;
  turnIndex: number;
  constructor(playerId: string, present: Present, turnIndex: number) {
    super();
    this.playerId = playerId;
    this.present = present;
    this.turnIndex = turnIndex;
  }
}
