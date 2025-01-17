import {Request, Response, NextFunction} from "express"
import { failedResponse, successResponse } from '../support/http'; 
import { CategorySchema, MenuItemSchema, RestaurantSchema, updateCategorySchema, updateMenuItemSchema } from "../validator/shopOwner";
import { Category, Delivery, MenuItem, Order, Restaurant, SubOrder } from "../models/resturant";
import { writeErrorsToLogs } from "../support/helpers";
import { payloadSchema, updateOrderSchema } from "../validator/orderSchema";
import { CreateNotificationParams } from "../interfaces/notification";
import { createNotification } from "../notification/helpers";
import { User } from "../models/users";

export class OrderController {
    static async checkout(req: Request, res: Response, next: NextFunction) {
        try {
            const user = (req as any).user
            // Validate request payload
            const { error, value } = payloadSchema.validate(req.body);
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);

            // Initialize total amount
            let totalAmount = 0;

            // Get menu item IDs from the cart
            const menuItemIds = value.cart.map((item: any) => item.cartItem);
            const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });
            const menuItemMap = new Map(menuItems.map(item => [item._id.toString(), item]));

            // Group items by restaurant
            const restaurantItemGroups: Record<string, any[]> = {};

            for (const item of value.cart) {
                const menuItem = menuItemMap.get(item.cartItem);
                if (!menuItem) return failedResponse(res, 400, `Item with id ${item.cartItem} not found.`);

                const restaurantId = menuItem.restaurant.toString();
                if (!restaurantItemGroups[restaurantId]) {
                    restaurantItemGroups[restaurantId] = [];
                }
                restaurantItemGroups[restaurantId].push({
                    menuItem: menuItem._id,
                    quantity: item.quantity,
                    price: menuItem.price,
                    shopOwer:menuItem.owner
                });

            }

            // Create sub-orders for each restaurant
            const subOrderIds = [];
            for (const [restaurantId, items] of Object.entries(restaurantItemGroups)) {
                let subTotal = 0;
                let shopOwer;
                for (const item of items) {
                    subTotal += item.price * item.quantity;
                    shopOwer = item.shopOwer
                }

                const subOrder = new SubOrder({
                    user: user._id,
                    restaurant: restaurantId,
                    items,
                    subTotal,
                    shopOwnerId:shopOwer,
                    status: 'pending',
                    deliveryLocation: value.deliveryLocation // Assuming deliveryLocation is part of the payload
                });

                await subOrder.save();
                subOrderIds.push(subOrder._id);
                totalAmount += subTotal;
            }

            // Create the main order
            const order = new Order({
                user: user._id,
                subOrder: subOrderIds,
                totalPrice: totalAmount,
                status: 'pending',
                deliveryLocation: value.deliveryLocation // Assuming deliveryLocation is part of the payload
            });

            await order.save();

            return successResponse(res, 200, "Order placed successfully", order);
        } catch (error: any) {
            writeErrorsToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
    // order
    // Admin only
    static async getAllOrders(req: Request, res: Response, next: NextFunction) {
        try {
            const { status, subOrderId,restaurantId, page = 1, pageSize = 10 } = req.query;
            const role = (req as any).user.userType
            const user = (req as any).user

            const filter: any = {};
            if (status) filter.status = status;
            
            if (subOrderId) {
                filter.subOrder = { $in: subOrderId };
            };
            if(role === "user"){
                filter.user = user._id
            }

            const skip = (Number(page) - 1) * Number(pageSize);
            const totalOrders = await Order.countDocuments(filter);
            const totalPages = Math.ceil(totalOrders / Number(pageSize));

            const orders = await Order.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(pageSize))
                .populate({
                    path: 'dispatchRider',
                    select: 'fullname'
                })
                .populate({
                    path: 'user',
                    select: 'fullname'
                });


            return successResponse(res, 200, "Success", {
                orders,
                pagination: {
                    totalOrders,
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

    // Get suborder by ID
    static async getOrderByOrderNum(req: Request, res: Response, next: NextFunction) {
        const user = (req as any).user;
        const role = user.userType;
        try {
            const order = await Order.findOne({orderNumber:req.params.orderNumber})
            .populate({
                path: 'subOrder',
                populate: [
                    {
                        path: 'restaurant',
                        select: 'name'
                    },
                    {
                        path: 'items.menuItem',
                        select: 'itemName'
                    }
                ],
                select: 'subTotal'
            })
            .populate({
                path: 'dispatchRider',
                select: 'fullname'
            });

            if (!order) {
                return failedResponse(res, 404, "Order not found");
            }

            if (role === "user" && order.user.toString() !== user._id.toString()) {
                return failedResponse(res, 403, "Permission denied. Access to this suborder is restricted.");
            }

            return successResponse(res, 200, "Success", order);
        } catch (error: any) {
            writeErrorsToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    // Update suborder by ID
    static async updateOrderById(req: Request, res: Response, next: NextFunction) {
        const user = (req as any).user;
        const role = user.userType;
        try {
            const { error, value } = updateOrderSchema.validate(req.body);
            if (error) return failedResponse(res, 400, `${error.details[0].message}`);
    
            const order = await Order.findOneAndUpdate({ orderNumber: req.params.orderNumber }, value, { new: true });
    
            if (!order) {
                return failedResponse(res, 404, "Order not found");
            }
    
            if (role === "user" && order.user.toString() !== user._id.toString()) {
                return failedResponse(res, 403, "Permission denied. Access to this order is restricted.");
            }
    
            if (value.dispatchRider) {
                const deliveryInstance = await Delivery.findOneAndUpdate({ order: order._id, dispatchRider: value.dispatchRider}, { dispatchRider: value.dispatchRider });
                if (!deliveryInstance) {
                    await Delivery.create({ order: order._id, dispatchRider: value.dispatchRider });
                };
                const payload: CreateNotificationParams = {
                    owner: value.dispatchRider.toString(),
                    title: "New delivery",
                    type: `delivery`,
                    message: `You have a new order to deliver at ${order?.deliveryLocation}.`
                  };
                  await createNotification(payload);
                // send notification to the order owner
                const payload2: CreateNotificationParams = {
                    owner: order.user.toString(),
                    title: "New Order",
                    type: `order`,
                    message: `Your order with number ${order?.orderNumber} has just been picked.`
                  };
                  await createNotification(payload2);
            }
    
            return successResponse(res, 200, "Order updated successfully", order);
        } catch (error: any) {
            writeErrorsToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
    
    // Delete suborder by ID
    static async deleteOrderById(req: Request, res: Response, next: NextFunction) {
        const user = (req as any).user;
        const role = user.userType;
        try {

            const order = await Order.findOneAndDelete({orderNumber:req.params.orderNumber})

            if (!order) {
                return failedResponse(res, 404, "SubOrder not found");
            }

            if (role === "user" && order.user.toString() !== user._id.toString()) {
                return failedResponse(res, 403, "Permission denied. Access to this suborder is restricted.");
            }

            return successResponse(res, 204, "Order deleted successfully");
        } catch (error: any) {
            writeErrorsToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
};


export class SubOrderController {
    // Get all suborders with optional filtering by status and restaurant ID, including pagination
    static async getAllSubOrders(req: Request, res: Response, next: NextFunction) {
        const user = (req as any).user;
        const role = user.userType;
        try {
            const { status, restaurantId, page = 1, pageSize = 10 } = req.query;

            const filter: any = {};
            if (status) filter.status = status;
            
            if (role === "shopOwner") {
                const ownerRestaurants = await Restaurant.find({ owner: user._id });
                const ownerRestaurantIds = ownerRestaurants.map((rest: any) => rest._id);
                filter.restaurant = { $in: ownerRestaurantIds };
            } else if (restaurantId) {
                filter.restaurant = restaurantId;
            }

            const skip = (Number(page) - 1) * Number(pageSize);
            const totalSubOrders = await SubOrder.countDocuments(filter);
            const totalPages = Math.ceil(totalSubOrders / Number(pageSize));

            const subOrders = await SubOrder.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(pageSize))
                .populate({
                    path: 'restaurant',
                    select: "name"
                })
                .populate('items.menuItem');

            return successResponse(res, 200, "Success", {
                subOrders,
                pagination: {
                    totalSubOrders,
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

    // Get suborder by ID
    static async getSubOrderById(req: Request, res: Response, next: NextFunction) {
        const user = (req as any).user;
        const role = user.userType;
        try {
            const { id } = req.params;
            const subOrder = await SubOrder.findById(id)
                .populate({
                    path: 'restaurant',
                    select: "name"
                })
                .populate('items.menuItem');

            if (!subOrder) {
                return failedResponse(res, 404, "SubOrder not found");
            }

            if (role === "shopOwner" && subOrder.shopOwnerId.toString() !== user._id.toString()) {
                return failedResponse(res, 403, "Permission denied. Access to this suborder is restricted.");
            }

            return successResponse(res, 200, "Success", subOrder);
        } catch (error: any) {
            writeErrorsToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    // Delete suborder by ID
    static async deleteSubOrderById(req: Request, res: Response, next: NextFunction) {
        const user = (req as any).user;
        const role = user.userType;
        try {
            const { id } = req.params;
            const subOrder = await SubOrder.findById(id).populate('restaurant');

            if (!subOrder) {
                return failedResponse(res, 404, "SubOrder not found");
            }

            if (role === "shopOwner" && subOrder.shopOwnerId.toString() !== user._id.toString()) {
                return failedResponse(res, 403, "Permission denied. Access to this suborder is restricted.");
            }

            await SubOrder.findByIdAndDelete(id);

            return successResponse(res, 204, "SubOrder deleted successfully");
        } catch (error: any) {
            writeErrorsToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
};