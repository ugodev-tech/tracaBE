import { Server } from "socket.io";
import { io } from ".";
import { authenticate } from "./socket/authentication";
import { logger } from "./logger";
import { handleRecieveSendLocation } from "./socket/sendMessageHandler"; 

export const EVENTS = {
  CONNECTION: "connection",
  CLIENT: {
    SEND_ORDER_LOCATION: "SEND_ORDER_LOCATION",
    JOIN_ROOM: "JOIN_ROOM",
    RECEIVE_LOCATION_FROM_SERVER: "RECEIVE_LOCATION_FROM_SERVER",
  },
  SERVER: {
    ROOMS: "ROOMS",
    ERROR: "ERROR",
    SUCCESS: "SUCCESS",
    JOINED_ROOM: "JOINED_ROOM",
    ROOM_MESSAGE: "ROOM_MESSAGE",
    WELCOME: "WELCOME",
  },
};

export async function socket() {
    io.use(authenticate);

    io.on(EVENTS.CONNECTION, (socket) => {
        const roomId = socket.user.userType === "rider" ? socket.user.userId : socket.orderNumber;

        if (!roomId) {
            logger.error("Room ID is not defined");
            return;
        }

        socket.join(roomId);
        logger.info(`${socket.user.userType} joined room ${roomId}`);
        if(socket.user.userType !== "rider"){
            
            io.to(roomId).emit(EVENTS.CLIENT.RECEIVE_LOCATION_FROM_SERVER, socket.coordinates);
        }

        io.to(roomId).emit(EVENTS.SERVER.WELCOME, `Welcome ${roomId}`);

        socket.on("disconnect", () => {
            logger.info(`Client disconnected: ${roomId}`);
        });

        socket.on(EVENTS.CLIENT.SEND_ORDER_LOCATION, async (message: any) => {
            await handleRecieveSendLocation(socket, message);
        });
    });
}
