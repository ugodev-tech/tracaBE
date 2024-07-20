import { verifyJwtToken } from "../support/generateTokens";
import { logger } from "../logger";
import { Delivery, Order } from "../models/resturant";

export async function authenticate(socket: any, next: any) {
    const token = socket.handshake.headers.token;

    if (!token) {
        logger.info("Token not provided");
        return next(new Error("Authentication error"));
    }

    try {
        const decoded = verifyJwtToken(token);
        socket.user = decoded;
        socket.orderNumber = socket.handshake.query.orderNumber;

        if (socket.user.userType === "user" || socket.user.userType === "admin") {
            if (!socket.orderNumber || socket.orderNumber === "undefined") {
                logger.info("Order number not in query params");
                return next(new Error("Order number not in query params"));
            }

            // Validate ownership
            const order = await Order.findOne({ orderNumber: socket.orderNumber });

            if (!order) {
                logger.info("Order number not found");
                return next(new Error("Order number not found"));
            }

            if (socket.user.userType === "user" && order.user.toString() !== socket.user.userId) {
                logger.info("Permission denied for user");
                return next(new Error("Permission denied"));
            };

            const coordinate = await Delivery.findOne({order:order})
            socket.coordinates = coordinate?.coordinates
        }

        next();
    } catch (error: any) {
        logger.error(error.message);
        next(new Error("Authentication error"));
    }
};
