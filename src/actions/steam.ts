"use server";

import * as cheerio from "cheerio";

export type SteamInfo = {
  name: string;
  tags: string[];
  ok: boolean;
};

export async function GetSteamGameName(
  gameId: number,
): Promise<string | undefined> {
  const resp = await fetch(`https://store.steampowered.com/app/${gameId}`, {
    method: "GET",
    headers: {
      Cookie:
        'birthtime=1041408001; created="Sun, 29 Dec 2024 02:26:46 GMT"; path=/; expires=Session',
    },
  });
  if (!resp.ok) {
    return Promise.resolve("Failed to contact steam servers");
  }
  const blob = await resp.blob();
  const bodyRaw = await blob.text();
  const body = cheerio.load(bodyRaw);
  const name = body("#appHubAppName").text();
  return Promise.resolve(name);
}

export async function GetSteamGameInfo(gameId: number): Promise<SteamInfo> {
  const resp = await fetch(`https://store.steampowered.com/app/${gameId}`, {
    method: "GET",
    headers: {
      Cookie:
        'birthtime=1041408001; created="Sun, 29 Dec 2024 02:26:46 GMT"; path=/; expires=Session',
    },
  });
  if (!resp.ok) {
    return Promise.resolve({
      name: "",
      tags: [],
      ok: false,
    });
  }
  const blob = await resp.blob();
  const bodyRaw = await blob.text();
  const body = cheerio.load(bodyRaw);
  const name = body("#appHubAppName").text();
  const tags = body("a.app_tag")
    .map((_, el) => {
      return body(el).text().trim();
    })
    .toArray();
  return Promise.resolve({
    name: name,
    tags: tags,
    ok: true,
  });
}

export async function ParseGameId(
  gameIdRaw: FormDataEntryValue,
): Promise<number | null> {
  const gameId = parseInt(gameIdRaw.toString().trim());
  if (!isNaN(gameId)) {
    return gameId;
  }

  const regex = new RegExp("(?<=app\\/)\\d+");

  if (!regex.test(gameIdRaw.toString())) {
    console.log("failed regex test");
    return null;
  }

  const gameIdRaw2 = gameIdRaw.toString().match(regex)?.[0];
  if (gameIdRaw2 == undefined) {
    console.log("failed regex match");
    return null;
  }

  const gameId2 = parseInt(gameIdRaw2);
  if (!isNaN(gameId2)) {
    return gameId2;
  }

  return null;
}
