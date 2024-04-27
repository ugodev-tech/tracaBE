import { Router } from "express";
import { Onboarding } from "../controllers/auth";

export const authRouter = Router()

authRouter
.post("/signup", Onboarding.signup)
.post("/signup/resend-activation-token", Onboarding.resendToken)
.post("/verify-email", Onboarding.verifyAccount)