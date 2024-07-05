import { Router } from "express";
import { Onboarding, ForgotPasswordReset} from "../controllers/auth";
import { IsAuthenticatedUser } from "../support/middleware";

export const authRouter = Router()

authRouter
.post("/signup", Onboarding.signup)
.post("/login", Onboarding.login)
.put("/update-profile",IsAuthenticatedUser, Onboarding.updateProfile)
.post("/resend-activation-token", Onboarding.resendToken)
.post("/verify-email", Onboarding.verifyAccount)
.post("/forgotten-password/get-reset-token", ForgotPasswordReset.sendResetToken)
.post("/forgotten-password/validate-token", ForgotPasswordReset.validateToken)
.post("/forgotten-password/change-password", ForgotPasswordReset.changePassword)