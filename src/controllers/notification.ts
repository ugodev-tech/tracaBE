import { Request, Response } from 'express';
import { Notification } from '../models/norification';
import { writeErrorsToLogs } from '../support/helpers';
import {failedResponse, successResponse } from "../support/http";

export class NotificationController {
    static async myNotifications(req: Request, res: Response) {
        
        try {
            const { type, read, page = 1, pageSize = 10 } = req.query;
            const user = (req as any).user
        
            // Build query conditions
            const query: any = {
                owner: user._id,
            };
        
            if (type) {
                query.type = type;
            }
            if (read) {
                query.read.toLower() === "true";
            }
            const skip = (Number(page) - 1) * Number(pageSize);
            const totalNotifications = await Notification.countDocuments(query);
            const totalPages = Math.ceil(totalNotifications / Number(pageSize));

            const notifications = await Notification.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(pageSize));
        
            
        
            return successResponse(res, 200, 'Success', {
                notifications,
                currentPage: page,
                totalPages,
                totalNotifications,
            });
        } catch (error: any) {
            writeErrorsToLogs(error);
            return failedResponse(res, 500, error.message);
        }
      };

    static async markAllAsRead(req: Request, res: Response) {
        try {
            const user = (req as any).user
            const result = await Notification.updateMany(
                { owner: user._id, read: false },
                { read: true }
            );
        
            return successResponse(res, 200, 'All notifications marked as read', result);
        } catch (error: any) {
            writeErrorsToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async markSingleAsRead(req: Request, res: Response) {
        try {
            const user = (req as any).user
            const notitication = await Notification.findOneAndUpdate({_id:req.params.id, owner:user._id},{read: true });
            if (!notitication) return failedResponse (res, 404, "Notitication not found")
        
            return successResponse(res, 200, 'Notification marked as read', notitication);
        } catch (error: any) {
            writeErrorsToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
    
}
