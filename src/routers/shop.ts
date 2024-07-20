import { Router } from "express";
import { IsAdmin, IsAdminOrShopOwner, IsAuthenticatedUser } from "../support/middleware";
import { CategoryController, MenuItemController, MyResturant } from "../controllers/shopOwner";
import { SubOrderController, OrderController } from "../controllers/order.controller";

export const shopRouter = Router()

shopRouter
.put("/my-shop/:id", IsAuthenticatedUser, MyResturant.setupShop)
.get("/my-shop/:id", IsAuthenticatedUser, MyResturant.retrieveShop)

// category
.post('/categories', IsAuthenticatedUser,CategoryController.createCategory)
.get('/categories/:id', IsAuthenticatedUser,CategoryController.retrieveCategory)
.put('/categories/:id', IsAuthenticatedUser,CategoryController.updateCategory)
.delete('/categories/:id', IsAuthenticatedUser,CategoryController.deleteCategory)
.get('/categories', IsAuthenticatedUser,CategoryController.listCategories)

// menue
.post('/menuItems', IsAuthenticatedUser, MenuItemController.createMenuItem)
.get('/menuItems/:id', IsAuthenticatedUser, MenuItemController.retrieveMenuItem)
.put('/menuItems/:id', IsAuthenticatedUser, MenuItemController.updateMenuItem)
.delete('/menuItems/:id', IsAuthenticatedUser, MenuItemController.deleteMenuItem)
.get('/menuItems', IsAuthenticatedUser, MenuItemController.listMenuItems)


// checkout 
.post("/checkout",IsAuthenticatedUser, OrderController.checkout)

// orders
.get("/orders",IsAdmin, OrderController.getAllOrders )
.get("/orders/:orderNumber",IsAuthenticatedUser, OrderController.getOrderByOrderNum )
.put("/orders/:orderNumber",IsAdmin, OrderController.updateOrderById )
.delete("/orders/:orderNumber",IsAuthenticatedUser, OrderController.deleteOrderById )

// sub orders
.get("/suborders",IsAdminOrShopOwner, SubOrderController.getAllSubOrders )
.get("/suborders/:id",IsAdminOrShopOwner, SubOrderController.getSubOrderById )
.delete("/suborders/:id",IsAdminOrShopOwner, SubOrderController.deleteSubOrderById )