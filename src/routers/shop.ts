import { Router } from "express";
import { IsAuthenticatedUser } from "../support/middleware";
import { MyResturant } from "../controllers/shopOwner";

export const shopRouter = Router()

shopRouter
.put("/my-shop/:id", IsAuthenticatedUser, MyResturant.setupShop)
.get("/my-shop/:id", IsAuthenticatedUser, MyResturant.retrieveShop)
