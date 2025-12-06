export type Present = {
  gifterId: string;
  items: Item[];
};

export type Item = {
  name: string;
  gameId: number;
  tags: string[];
  maxTags: number;
};
