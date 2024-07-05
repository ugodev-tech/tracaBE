import { PrismaClient } from '@prisma/client'
import {Application, Request, Response, NextFunction} from "express"
import { failedResponse, successResponse } from '../support/http'; 
import { httpLogger } from '../httpLogger';
import { emailValidator, emailVerificationValidator, loginValidator, resetPasswordValidator, updateUserValidator, userValidator } from '../validator/user';
import { logger } from '../logger';
import { OtpToken, ValidateToken, verifyToken, writeErrorsToLogs } from '../support/helpers';
import { generateJwtToken } from '../support/generateTokens';
import bcrypt from "bcrypt"
import { Media, User } from '../models/users';


export class Onboarding {
  static async signup(req: Request, res: Response) {
    try {
      const { error, value } = userValidator.validate(req.body);
      if (error) return failedResponse(res, 400, `${error.details[0].message}`);

      const emailExist = await User.findOne({ email: value.email }).select('email');
      if (emailExist) {
        return failedResponse(res, 400, 'Email already exists.');
      }

      // Check if idBack and idFront exist
      if (value.idBack) {
        const idBackExist = await Media.findById(value.idBack);
        if (!idBackExist) {
          return failedResponse(res, 404, 'ID Back media not found.');
        }
      }

      if (value.idFront) {
        const idFrontExist = await Media.findById(value.idFront);
        if (!idFrontExist) {
          return failedResponse(res, 404, 'ID Front media not found.');
        }
      }

      const salt = await bcrypt.genSalt(10);
      value.password = await bcrypt.hash(value.password, salt);
      const newUser = await User.create(value);

      await OtpToken(value.email, 'Account activation code', 'templates/activateemail.html');
      const accessToken = generateJwtToken({ email: value.email, userId: newUser.id, userType: newUser.userType });

      return successResponse(res, 201, 'Verification token has been sent to your email.', accessToken);
    } catch (error: any) {
      writeErrorsToLogs(error);
      return failedResponse(res, 500, error.message);
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id
      const { error, value } = updateUserValidator.validate(req.body, { allowUnknown: true });
      if (error) return failedResponse(res, 400, `${error.details[0].message}`);

      // Check if idBack and idFront exist
      if (value.idBack) {
        const idBackExist = await Media.findById(value.idBack);
        if (!idBackExist) {
          return failedResponse(res, 404, 'ID Back media not found.');
        }
      }

      if (value.idFront) {
        const idFrontExist = await Media.findById(value.idFront);
        if (!idFrontExist) {
          return failedResponse(res, 404, 'ID Front media not found.');
        }
      }

      const updatedUser = await User.findByIdAndUpdate(userId, value, { new: true }).select("-password");

      if (!updatedUser) {
        return failedResponse(res, 404, 'User not found.');
      }

      return successResponse(res, 200, 'Profile updated successfully.', updatedUser);
    } catch (error: any) {
      writeErrorsToLogs(error);
      return failedResponse(res, 500, error.message);
    }
  };

    static async resendToken (req:Request, res:Response, next:NextFunction){
      try {
        const { error, value } = emailValidator.validate(req.body);
        if (error) {
          return failedResponse (res, 400, `${error.details[0].message}`)
        }
        const emailExist = await User.findOne({email:value.email}).select("isVerified")
        if (!emailExist) {
          return failedResponse (res, 404, "Email does not exist.")
        }
        if (emailExist.isVerified) {
          return failedResponse (res, 400, "Email already verified")
        }
          await OtpToken(value.email,"Account activation code", "templates/activateemail.html" )
          return successResponse(res,200,"Verification token has been resent to your email.")
        } catch (error:any) {
          writeErrorsToLogs(error)
          return failedResponse(res,500, error.message)
        }
        
    };

    static async verifyAccount (req:Request, res:Response, next:NextFunction) {
      try {
        const { error, value } = emailVerificationValidator.validate(req.body);
        if (error) {
          return failedResponse (res, 400, `${error.details[0].message}`)
        }
        const user = await User.findOne({email:value.email}).select("isVerified")
        if (!user) {
          return failedResponse (res, 404, "Email does not exist.")
        }
        if (user.isVerified) {
          return failedResponse (res, 400, "Email already verified")
        }
        const verify = await verifyToken(value.email, value.token)
        if (!verify){
          return failedResponse (res, 400, "Invalid token or token has expired")
        }
        user.isVerified = true;
        await user.save()
        return successResponse(res,200,"Verification successful.")
      } catch (error:any) {
        writeErrorsToLogs(error)
        return failedResponse(res,500, error.message)
      }
    
    };
    static async login (req:Request, res:Response){
      try {
          const { error, value } = loginValidator.validate(req.body);
          if (error) return failedResponse (res, 400, `${error.details[0].message}`)
          const user = await User.findOne({email:value.email})
          if (!user) {
            return failedResponse (res, 404, "Email does not exist.")
          }
          const validatePassword = await bcrypt.compare(value.password, user.password)
          if (!validatePassword) return failedResponse (res, 400, `Incorrect password`)
          const accessToken = generateJwtToken({email:value.email, userId:user.id,userType:user.userType })
          const payload ={
            email:user.email,
            _id:user._id,
            userType:user.userType
          }
          return successResponse(res,200,"Success",{payload, accessToken} )
      } catch (error:any) {
          writeErrorsToLogs(error)
          return failedResponse(res,500, error.message)
          
      };
  };
  static async getAccount (req:Request, res:Response){
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
          return failedResponse (res, 404, "Email does not exist.")
        }
        return successResponse(res,200,"Success",user )
    } catch (error:any) {
        writeErrorsToLogs(error)
        return failedResponse(res,500, error.message)
        
    }

}}
export class ForgotPasswordReset {
  static async sendResetToken (req:Request, res:Response, next:NextFunction){
    try {
      const { error, value } = emailValidator.validate(req.body);
      if (error) {
        return failedResponse (res, 400, `${error.details[0].message}`)
      }
      const emailExist = await User.findOne({email:value.email})
    if (!emailExist) {
      return failedResponse (res, 404, "Email does not exist.")
    }
    await OtpToken(value.email,"Reset password token", "templates/reset_password.html" )
    return successResponse(res,200,"Verification token has been resent to your email.")
    } catch (error:any) {
      writeErrorsToLogs(error)
      return failedResponse(res,500, error.message)
    }
      
  };

  static async validateToken (req:Request, res:Response, next:NextFunction) {
    try {
      const { error, value } = emailVerificationValidator.validate(req.body);
      if (error) {
        return failedResponse (res, 400, `${error.details[0].message}`)
      }
      const emailExist = await User.findOne({email:value.email})
      if (!emailExist) {
        return failedResponse (res, 404, "Email does not exist.")
      }
        const verify = await ValidateToken(value.email, value.token)
        if (!verify){
          return failedResponse (res, 400, "Invalid token or token has expired")
        }
        return successResponse(res,200," Valid")
      } catch (error:any) {
        writeErrorsToLogs(error)
        return failedResponse(res,500, error.message)
      }
  
  };

  static async changePassword (req:Request, res:Response, next:NextFunction) {
    try {
      const { error, value } = resetPasswordValidator.validate(req.body);
      if (error) {
        return failedResponse (res, 400, `${error.details[0].message}`)
      }
      const user = await User.findOne({email:value.email}).select("password")
      if (!user) {
        return failedResponse (res, 404, "Email does not exist.")
      }
      const isValid = await verifyToken(value.email, value.token)
      if (!isValid){
        return failedResponse (res, 400, "Invalid token or token has expired")
      }
      const salt = await bcrypt.genSalt(10)
      value.password = await bcrypt.hash(value.password, salt)
      user.password = value.password;
      await user.save();
      return successResponse(res,200," Valid")
    } catch (error:any) {
      writeErrorsToLogs(error)
      return failedResponse(res,500, error.message)
    }
  
  };
}