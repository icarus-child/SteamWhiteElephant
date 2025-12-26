"use server";

import { dburl, maxSteals } from "@/constants";
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

type JsonPresent = {
  error: string;
  present: Present;
};

export async function GetPlayerPresent(id: string): Promise<Present | null> {
  const response = await fetch(dburl + "player-present?id=" + id, {
    method: "GET",
  });
  let json: JsonPresent;
  try {
    json = await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
  if (json.error != null) {
    console.error(json.error);
    return null;
  }
  if (json.present === null) {
    return null;
  }
  return {
    ...json.present,
    timesTraded: 0,
    maxTags: Math.min(
      Math.min(...json.present.items.map((i) => i.tags.length)),
      maxSteals,
    ),
    giftName: json.present.giftName,
  };
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
        maxTags: Math.min(
          Math.min(...p.items.map((i) => i.tags.length)),
          maxSteals,
        ),
        giftName: p.giftName,
      };
    }),
  );
}

type JsonError = {
  error: string;
};

export async function ResetRound(id: string): Promise<undefined> {
  const response = await fetch(dburl + "reset-round?id=" + id, {
    method: "POST",
  });
  let json: JsonError;
  try {
    json = await response.json();
  } catch (error) {
    console.error(error);
    return;
  }
  if (json.error != null) {
    console.error(json.error);
  }
}

export async function MarkPresentStolen(id: string): Promise<undefined> {
  const response = await fetch(dburl + "mark-present-stolen?id=" + id, {
    method: "POST",
  });
  let json: JsonError;
  try {
    json = await response.json();
  } catch (error) {
    console.error(error);
    return;
  }
  if (json.error != null) {
    console.error(json.error);
  }
}

type JsonOpened = {
  error: string;
  opened: boolean;
};

export async function GetPresentStolenThisRound(id: string): Promise<boolean> {
  const response = await fetch(dburl + "present-stolen-this-round?id=" + id, {
    method: "GET",
  });
  let json: JsonOpened;
  try {
    json = await response.json();
  } catch (error) {
    console.error(error);
    return false;
  }
  if (json.error != null) {
    console.error(json.error);
    return false;
  }
  return json.opened;
}
