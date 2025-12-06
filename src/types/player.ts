import { Present } from "./present";

export type Player = {
  id: string;
  name: string;
  present: Present | undefined;
};

export type RoomPlayer = Player & {
  room: string;
};

export type PartialRoomPlayer = {
  name: string;
  room: string;
};
