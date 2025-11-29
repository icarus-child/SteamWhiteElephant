import { GetRoomPlayers } from "@/db/players";
import { headers } from "next/headers";
import { useParams } from "next/navigation";

export function GET() {
  const headers = new Headers();
  headers.set("Connection", "Upgrade");
  headers.set("Upgrade", "websocket");
  return new Response("Upgrade Required", { status: 426, headers });
}

export async function UPGRADE(
  client: import("ws").WebSocket,
  server: import("ws").WebSocketServer,
) {
  await headers();
  const roomId = useParams().id as string;

  // on connection
  // tell clients to update players and presents
  for (const other of server.clients) {
    if (client === other || other.readyState !== other.OPEN) continue;
    other.send(await GetRoomPlayers(roomId));
  }

  // on client action
  // 1. parse  2. validate  3. propogate
  client.on("message", (message) => {});
}
