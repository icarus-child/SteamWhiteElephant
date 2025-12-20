export type Present = {
  gifterId: string;
  items: Item[];
  timesTraded: number;
  maxTags: number;
  texture: Blob;
};

export type Item = {
  name: string;
  gameId: number;
  tags: string[];
};
