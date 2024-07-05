import {Request, Response, NextFunction} from "express"
import { failedResponse, successResponse } from '../support/http'; 
import { Media} from '../models/users';
import { RestaurantSchema } from "../validator/shopOwner";
import { Restaurant } from "../models/resturant";
import { writeErrorsToLogs } from "../support/helpers";

export class MyResturant {
    static async setupShop (req:Request, res:Response, next:NextFunction){
        try {
            const {id} = req.params;
            const { error, value } = RestaurantSchema.validate(req.body);
            if (error) {
                return failedResponse (res, 400, `${error.details[0].message}`)
            };

            // Check if idBack and idFront exist
            if (value.image) {
                const image = await Media.findById(value.image);
                if (!image) {
                return failedResponse(res, 404, 'ID Back media not found.');
                }
            };
            // check resturant
            const shop = await Restaurant.findOneAndUpdate({_id:id, owner:(req as any).user._id}, value, {new:true});
            if (!shop) {
                return failedResponse(res, 404, 'Restaurant not found.');
            }
        
            return successResponse(res,200,"Success", shop)
        } catch (error:any) {
            writeErrorsToLogs(error)
            return failedResponse(res,500, error.message)
        }
        
    };

    static async retrieveShop (req:Request, res:Response, next:NextFunction){
        try {
            const {id} = req.params;
            // check resturant
            const shop = await Restaurant.findOneAndUpdate({_id:id, owner:(req as any).user._id});
            if (!shop) {
                return failedResponse(res, 404, 'Restaurant not found.');
            }
            return successResponse(res,200,"Success", shop)
        } catch (error:any) {
            writeErrorsToLogs(error)
            return failedResponse(res,500, error.message)
        }
        
    };
}
