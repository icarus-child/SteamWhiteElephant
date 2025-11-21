export type Player = {
  name: string;
};

export type RoomPlayer = Player & {
  room: string;
};
