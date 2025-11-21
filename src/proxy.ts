import { NextRequest, NextResponse } from "next/server";
import { GetPlayer } from "./db/players";
import { baseurl } from "@/constants";

// TODO: next.js suggests not using proxy (formerly called middleware) unless as a last resort
export async function proxy(request: NextRequest) {
  console.log(request.url);
  if (!request.cookies.has("session")) {
    return;
  }
  const cookie = request.cookies.get("session");
  if (cookie == undefined) return;
  const player = await GetPlayer(cookie.value);
  if (player == undefined) {
    return;
  }
  return NextResponse.redirect(baseurl + "/" + player.room);
}

export const config = {
  matcher: "/signup",
};
