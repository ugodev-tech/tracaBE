import { Router } from "express";
import { IsAdmin, IsAdminOrRider, IsAuthenticatedUser } from "../support/middleware";
import { RidersDashboard } from "../controllers/rider";


export const riderRouter = Router();

riderRouter
.get("/deliveries", IsAdminOrRider, RidersDashboard.allDeliveries)
.get("/deliveries/:id", IsAdminOrRider, RidersDashboard.singleDelivery)
.put("/deliveries/:id", IsAdminOrRider, RidersDashboard.updateDeliveryById)