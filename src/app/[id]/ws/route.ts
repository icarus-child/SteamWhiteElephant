import { cookies } from "next/headers";
import { JoinAction, PlayerAction } from "@/actions/player_actions";
import { GetPlayer } from "@/db/players";

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
  const cookieStore = await cookies();
  if (!cookieStore.has("session")) return;
  const session = cookieStore.get("session");
  if (session == undefined) return;
  const playerId = session.value;
  const player = await GetPlayer(playerId);
  if (player == undefined) {
    return;
  }
  const roomId = player.room;

  // on connection
  // tell clients to update players and presents
  console.log("player joined");
  const join_action = new JoinAction(playerId);
  await join_action.SyncRoom(roomId);
  for (const client of server.clients) {
    if (client.readyState !== client.OPEN) continue;
    client.send(JSON.stringify(join_action));
  }

  // on client action
  // 1. parse(?)  2. validate  3. propogate
  client.on("message", (message) => {
    if (message! instanceof PlayerAction) {
      console.error("Unknown Action Received from Client");
      return;
    }
    for (const other of server.clients) {
      if (client !== other && other.readyState === other.OPEN) {
        other.send(message);
      }
    }
  });
}
