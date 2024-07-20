import app from "./app";
import dotenv from "dotenv";
import { logger } from "./logger";

// socket.io
import { createServer } from "http";
import { Server } from "socket.io";
import { socket } from "./socket";

const httpServer = createServer(app);

// const io = new Server(httpServer);

export const io = new Server(httpServer, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

dotenv.config();
const {PORT } = process.env;

const port = PORT || 8000;

httpServer.listen(PORT, async () => {
    logger.info(`server connected on ${port}`);
    await socket();
});


