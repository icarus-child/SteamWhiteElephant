import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { hostname, port } from "@/constants";
import { FetchDatabase, GetRoomPlayers, GetRoomPresents } from "@/rooms";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev: dev, hostname: hostname, port: port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  FetchDatabase();
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.time("join room server");
    socket.on("room", async (roomIdRaw) => {
      if (!roomIdRaw) return;
      const roomId: string = roomIdRaw as string;
      socket.join(roomId);
      console.timeEnd("join room server");
      console.time("websocket-players");
      io.to(roomId).emit("players", await GetRoomPlayers(roomId));
      console.timeEnd("websocket-players");
      io.to(roomId).emit("presents", await GetRoomPresents(roomId));
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
