import {Application, Request, Response, NextFunction} from "express"
import { failedResponse, successResponse } from '../support/http'; 
import { httpLogger } from '../httpLogger';
import { writeErrorsToLogs } from '../support/helpers';
import { Media, User } from '../models/users';
import { Restaurant } from "../models/resturant";

export class AdminDashboard {
    static async users(req: Request, res: Response, next: NextFunction) {
        try {
            const { role, page = 1, pageSize = 10 } = req.query;

            const filter: any = {};
            if (role) filter.role = role;

            const skip = (Number(page) - 1) * Number(pageSize);
            const totalUsers = await User.countDocuments(filter);
            const totalPages = Math.ceil(totalUsers / Number(pageSize));

            const users = await User.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(pageSize))
                .select("name _id userType email userType")

            return successResponse(res, 200, "Success", {
                users,
                pagination: {
                    totalUsers,
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
    static async singleUser(req: Request, res: Response, next: NextFunction) {
        try {

            const users = await User.findById(req.params.id)
            .populate("idFront")
            .populate("idBack")
            return successResponse(res, 200, "Success", {
                users,
            });
        } catch (error: any) {
            writeErrorsToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
    static async resturants(req: Request, res: Response, next: NextFunction) {
        try {
            const { completed, page = 1, pageSize = 10 } = req.query;

            const filter: any = {};
            if (completed){
                filter.completed = completed
            }
            const skip = (Number(page) - 1) * Number(pageSize);
            const totalResturants = await Restaurant.countDocuments(filter);
            const totalPages = Math.ceil(totalResturants / Number(pageSize));

            const resturants = await Restaurant.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(pageSize))
                .select("name address email phone completed")

            return successResponse(res, 200, "Success", {
                resturants,
                pagination: {
                    totalResturants,
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
    static async singleResturant(req: Request, res: Response, next: NextFunction) {
        try {

            const resturant = await Restaurant.findById(req.params.id)
            .populate("image")
            return successResponse(res, 200, "Success", {
                resturant,
            });
        } catch (error: any) {
            writeErrorsToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
}