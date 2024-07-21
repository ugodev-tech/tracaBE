import { CreateNotificationParams } from "../interfaces/notification";
import { Notification } from "../models/norification";
import { writeErrorsToLogs } from "../support/helpers";


export async function createNotification(params: CreateNotificationParams): Promise<void> {
    try {
        const { owner, title, type, message } = params;

        // Create a new notification document
        const newNotification = await Notification.create({
            owner:owner,
            title:title,
            type:type,
            message:message
        });

        // Optionally return the created notification object or handle it as needed
    } catch (error:any) {
        writeErrorsToLogs(error);
        throw new Error(`Failed to create notification: ${error.message}`);
    }
};