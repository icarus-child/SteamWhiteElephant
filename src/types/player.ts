export type Player = {
  id: string;
  name: string;
};

export type RoomPlayer = Player & {
  room: string;
};

export type PartialRoomPlayer = {
  name: string;
  room: string;
};
