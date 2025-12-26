export type Present = {
  gifterId: string;
  items: Item[];
  timesTraded: number;
  maxSteals: number;
  giftName: string;
};

export type Item = {
  name: string;
  gameId: number;
  tags: string[];
};
