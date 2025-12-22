"use server";

import { dburl } from "@/constants";
import { Present } from "@/types/present";

export async function CreatePresent(
  present: Present & { texture: Blob },
  playerId: string,
): Promise<boolean> {
  const res_tex = await fetch(dburl + "texture/", {
    method: "POST",
    headers: {
      "Content-Type": "image/png",
      "X-Player-ID": playerId,
    },
    body: present.texture,
  });
  if (res_tex.status != 200) {
    return false;
  }

  const res_pres = await fetch(dburl + "present/", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      gifterId: playerId,
      items: present.items,
      giftName: present.giftName,
    }),
  });
  if (res_pres.status != 200) {
    return false;
  }
  return true;
}

type JsonPresents = {
  error: string;
  presents: Present[];
};

export async function GetRoomPresents(id: string): Promise<Present[]> {
  const response = await fetch(dburl + "room-presents?id=" + id, {
    method: "GET",
  });
  let json: JsonPresents;
  try {
    json = await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
  if (json.error != null) {
    console.error(json.error);
    return [];
  }
  return await Promise.all(
    json.presents.map(async (p): Promise<Present> => {
      return {
        ...p,
        timesTraded: 0,
        maxTags: Math.min(Math.min(...p.items.map((i) => i.tags.length)), 4),
        giftName: p.giftName,
      };
    }),
  );
}

type JsonPresent = Present & {
  error: string;
};

export async function GetPlayerPresent(
  pid: string,
): Promise<Present | undefined> {
  const response = await fetch(dburl + "present?id=" + pid, {
    method: "GET",
  });
  let json: JsonPresent;
  try {
    json = await response.json();
  } catch (error) {
    console.error(error);
    return undefined;
  }
  if (json.error != null) {
    console.error(json.error);
    return undefined;
  }
  return {
    gifterId: json.gifterId,
    items: json.items,
    timesTraded: 0,
    maxTags: Math.min(Math.min(...json.items.map((i) => i.tags.length)), 4),
    texture: json.texture,
  };
}
