import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { hostname, port } from "@/constants";
import { GetRoomPlayers } from "@/db/players";
import { GetRoomPresents } from "@/db/present";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev: dev, hostname: hostname, port: port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    socket.on("room", async (roomIdRaw) => {
      if (!roomIdRaw) return;
      const roomId: string = roomIdRaw as string;
      socket.join(roomId);
      io.to(roomId).emit("players", await GetRoomPlayers(roomId));
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
