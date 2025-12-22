export type Present = {
  gifterId: string;
  items: Item[];
  timesTraded: number;
  maxTags: number;
  giftName: string;
};

export type Item = {
  name: string;
  gameId: number;
  tags: string[];
};
