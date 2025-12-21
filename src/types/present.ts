import { Texture } from "three";

export type Present = {
  gifterId: string;
  items: Item[];
  timesTraded: number;
  maxTags: number;
  texture?: Texture;
};

export type Item = {
  name: string;
  gameId: number;
  tags: string[];
};
