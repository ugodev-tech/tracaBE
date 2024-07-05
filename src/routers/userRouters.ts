import { Router } from "express";
import { Onboarding, ForgotPasswordReset, UploadFile} from "../controllers/auth";
import { IsAuthenticatedUser, handlefileUpload, upload } from "../support/middleware";

export const authRouter = Router()
const uploadMedia = upload.single('file')

authRouter
.post("/signup", Onboarding.signup)
.post("/upload-media", uploadMedia,handlefileUpload, UploadFile)
.post("/login", Onboarding.login)
.put("/update-profile",IsAuthenticatedUser, Onboarding.updateProfile)
.post("/resend-activation-token", Onboarding.resendToken)
.post("/verify-email", Onboarding.verifyAccount)
.post("/forgotten-password/get-reset-token", ForgotPasswordReset.sendResetToken)
.post("/forgotten-password/validate-token", ForgotPasswordReset.validateToken)
.post("/forgotten-password/change-password", ForgotPasswordReset.changePassword)
.post("/forgotten-password/dashboard/change-password",IsAuthenticatedUser, ForgotPasswordReset.changePasswordInDashBoard)