"use server";

import { dburl } from "@/constants";
import { Present } from "@/types/present";

export type Database = {
  rooms: [
    {
      id: string;
      players: { playerId: string; name: string }[];
      presents: Present[];
    },
  ];
};

type JsonDatabase = Database & {
  error: string;
};

export async function DumpDatabase(): Promise<Database | undefined> {
  const response = await fetch(dburl + "retrieve-all", {
    method: "GET",
  });
  let json: JsonDatabase;
  try {
    json = await response.json();
  } catch (error) {
    return undefined;
  }
  if (json.error != null) {
    return undefined;
  }
  return {
    rooms: json.rooms,
  };
}
