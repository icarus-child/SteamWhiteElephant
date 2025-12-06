"use server";

import { dburl } from "@/constants";
import { Present } from "@/types/present";

export async function CreatePresent(
  present: Present,
  playerId: string,
): Promise<boolean> {
  const res = await fetch(dburl + "present/", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      gifterId: playerId,
      items: present.items,
    }),
  });
  if (res.status == 200) {
    return true;
  }
  return false;
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
  return json.presents;
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
  };
}
