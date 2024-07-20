import { io } from "..";
import { EVENTS } from "../socket";
import { writeErrorsToLogs } from "../support/helpers";
import { currentLocationSchema } from "./validator";
import { Order, Delivery } from "../models/resturant";
import { IOrder } from "../interfaces/shop";

export async function handleRecieveSendLocation(socket: any, message: any) {
    console.log(message, "Received message");

    const { error, value } = currentLocationSchema.validate(message);
    if (error) {
        io.to(socket.user.userId).emit(EVENTS.SERVER.ERROR, {
            status: 400,
            message: error.details[0].message,
            success: false,
        });
        return;
    }

    try {
        await Delivery.updateMany(
            { dispatchRider: socket.user.userId, status: "onRoute" },
            {
                $set: { currentLocation: value },
                $push: { coordinates: value },
            }
        );

        const deliveries = await Delivery.find({
            dispatchRider: socket.user.userId,
            status: "onRoute",
        }).populate({
            path: "order",
            select: "orderNumber",
        });

        const orderNumbers = deliveries.map((delivery) => {
            const order = delivery.order as IOrder;
            return order.orderNumber;
        });

        console.log(orderNumbers, "Order Numbers");

        orderNumbers.forEach((orderNumber) => {
            io.to(orderNumber).emit(EVENTS.CLIENT.RECEIVE_LOCATION_FROM_SERVER, { value });
        });

        io.to(socket.user.userId).emit(EVENTS.SERVER.SUCCESS, {
            status: 200,
            message: "Success",
            success: true,
        });
    } catch (err: any) {
        writeErrorsToLogs(err);
        io.to(socket.user.userId).emit(EVENTS.SERVER.ERROR, {
            status: 500,
            message: "Internal server error",
            success: false,
        });
    }
}
