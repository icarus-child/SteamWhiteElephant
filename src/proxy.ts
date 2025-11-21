import { NextRequest, NextResponse } from "next/server";
import { baseurl } from "@/constants";
import { GetPlayer } from "./rooms";

export async function middleware(request: NextRequest) {
  console.log(request.url);
  if (!request.cookies.has("session")) {
    return;
  }
  const cookie = request.cookies.get("session");
  if (cookie == undefined) return;
  const [playerId, roomId] = cookie.value.split(":", 2);
  const player = await GetPlayer(roomId, playerId);
  if (player == undefined) {
    return;
  }
  return NextResponse.redirect(baseurl + "/" + roomId);
}

export const config = {
  matcher: "/signup",
};
