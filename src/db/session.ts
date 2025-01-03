"use server";

import "server-only";
import { dburl } from "@/constants";

type JsonSession = {
  exists: boolean;
  error: string;
};

export async function CheckSession(id: string): Promise<boolean | undefined> {
  const response = await fetch(dburl + "session-exists?id=" + id, {
    method: "GET",
  });
  let json: JsonSession;
  try {
    json = await response.json();
  } catch (error) {
    return undefined;
  }
  if (json.error != null) {
    return undefined;
  }
  return json.exists;
}
