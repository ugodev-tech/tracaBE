import { Router } from "express";
import { AdminDashboard } from "../controllers/admin";
import { IsAdmin, IsAuthenticatedUser } from "../support/middleware";

export const adminRouter = Router()

adminRouter

// Dashbaord
.get("/admin/users", IsAuthenticatedUser,AdminDashboard.users)
.get("/admin/users/:id", IsAuthenticatedUser, AdminDashboard.singleUser)
.put("/admin/users/:id", IsAdmin, AdminDashboard.verifySingleUser)
.get("/admin/resturants", IsAuthenticatedUser, AdminDashboard.resturants)
.get("/admin/resturants/:id", IsAdmin, AdminDashboard.singleResturant)
 

