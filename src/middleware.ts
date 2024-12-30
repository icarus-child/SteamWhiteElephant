import { NextRequest, NextResponse } from "next/server";
import { GetPlayer } from "./db/players";
import { baseurl } from "./constants";

export async function middleware(request: NextRequest) {
  console.log(request.url);
  if (!request.cookies.has("session")) {
    return;
  }
  const cookie = request.cookies.get("session");
  if (cookie == undefined || (await GetPlayer(cookie.value)) == undefined) {
    return;
  }
  return NextResponse.redirect(baseurl);
}

export const config = {
  matcher: "/signup",
};
