import { Router } from "express";
import { IsAuthenticatedUser } from "../support/middleware";
import { CategoryController, MenuItemController, MyResturant } from "../controllers/shopOwner";

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
