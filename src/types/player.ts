export type Player = {
  name: string;
};

export type SessionPlayer = Player & {
  room: string;
};
