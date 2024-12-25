import { NextRequest, NextResponse } from "next/server";
import { GetPlayer } from "./db/players";

export async function middleware(request: NextRequest) {
  console.log(request.url);
  if (!request.cookies.has("session")) {
    console.log("no cookie");
    return;
  }
  const cookie = request.cookies.get("session");
  if (cookie == undefined || GetPlayer(cookie.value) == undefined) {
    console.log("no sessions match");
    return;
  }
  console.log("found session match, redirecting");
  return NextResponse.redirect("http:localhost:3000/");
}

export const config = {
  matcher: "/signup",
};
