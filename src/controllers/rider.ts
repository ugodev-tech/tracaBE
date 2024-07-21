import { Request, Response, NextFunction} from "express"
import { failedResponse, successResponse } from '../support/http'; 
import { writeErrorsToLogs } from '../support/helpers';
import { Delivery, Restaurant } from "../models/resturant";
import { updateDeliverySchema } from "../validator/orderSchema";

export class RidersDashboard {
    static async allDeliveries(req: Request, res: Response, next: NextFunction) {
        try {
            const {  status,page = 1, pageSize = 10 } = req.query;
            const user = (req as any).user;


            const filter: any = {};
            if (status){
                filter.status = status
            };
            if(user.userType === "rider"){
                filter.dispatchRider = user._id
            }

            const skip = (Number(page) - 1) * Number(pageSize);
            const totalDeliveries = await Delivery.countDocuments(filter);
            const totalPages = Math.ceil(totalDeliveries / Number(pageSize));

            const deliveries = await Delivery.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(pageSize))
                .populate({
                    path:"order",
                    select:"orderNumber deliveryLocation totalPrice status"
                });

            return successResponse(res, 200, "Success", {
                deliveries,
                pagination: {
                    totalDeliveries,
                    totalPages,
                    currentPage: Number(page),
                    pageSize: Number(pageSize)
                }
            });
        } catch (error: any) {
            writeErrorsToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
    static async singleDelivery(req: Request, res: Response, next: NextFunction) {
        try {

            const delivery = await Delivery.findById(req.params.id)
            .populate({
                path:"order",
                select:"orderNumber deliveryLocation totalPrice status"
            });
            return successResponse(res, 200, "Success", {
                delivery,
            });
        } catch (error: any) {
            writeErrorsToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
    static async updateDeliveryById(req: Request, res: Response, next: NextFunction) {
        const user = (req as any).user;
        const role = user.userType;
        try {
            const { error, value } = updateDeliverySchema.validate(req.body);
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);
    
            const delivery = await Delivery.findById(req.params.id);
    
            if (!delivery) {
                return failedResponse(res, 404, "Delivery not found");
            }
    
            if (role === "rider" && delivery.dispatchRider.toString() !== user._id.toString()) {
                return failedResponse(res, 403, "Permission denied. Access to this order is restricted.");
            };
            delivery.status = value.status;
            await delivery.save()
    
            return successResponse(res, 200, "Delivery updated successfully", delivery);
        } catch (error: any) {
            writeErrorsToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
}