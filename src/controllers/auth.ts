import { PrismaClient } from '@prisma/client'
import {Application, Request, Response, NextFunction} from "express"
import { failedResponse, successResponse } from '../support/http'; 
import { httpLogger } from '../httpLogger';
import { emailValidator, emailVerificationValidator, loginValidator, resetPasswordValidator, userValidator } from '../validator/user';
import { logger } from '../logger';
import { OtpToken, ValidateToken, verifyToken } from '../support/helpers';
import { generateJwtToken } from '../support/generateTokens';
import bcrypt from "bcrypt"


const prisma = new PrismaClient()

export class Onboarding {
    static async signup (req:Request, res:Response){
        try {
            const { error, value } = userValidator.validate(req.body);
            if (error) return failedResponse (res, 400, `${error.details[0].message}`)
            const emailExist = await prisma.user.findUnique({
                where: {
                    email:value.email
                  },
                  select:{
                    email:true
                  }
            })
            if (emailExist) {
              return failedResponse (res, 400, "Email already exist.")
            }
            const salt = await bcrypt.genSalt(10)
            value.password = await bcrypt.hash(value.password, salt)
            const newUser = await prisma.user.create({ data:value});
            await OtpToken(value.email,"Account activation code", "templates/activateemail.html")
            const accessToken = generateJwtToken({email:value, userId:newUser.id})
            return successResponse(res,201,"Verification token has been sent to your email.",{newUser, accessToken} )
        } catch (error:any) {
            logger.error(`Error in login at line ${error.name}: ${error.message}\n${error.stack}`);
            return failedResponse(res,500, error.message)
            
        }
    };

    static async resendToken (req:Request, res:Response, next:NextFunction){
      try {
        const { error, value } = emailValidator.validate(req.body);
        if (error) {
          return failedResponse (res, 400, `${error.details[0].message}`)
        }
        const emailExist = await prisma.user.findUnique({
          where: {
              email:value.email
            },
            select:{
              email:true,
              is_verified:true
            }
      })
      if (!emailExist) {
        return failedResponse (res, 404, "Email does not exist.")
      }
      if (emailExist.is_verified) {
        return failedResponse (res, 400, "Email already verified")
      }
        await OtpToken(value.email,"Account activation code", "templates/activateemail.html" )
        return successResponse(res,200,"Verification token has been resent to your email.")
      } catch (error:any) {
        logger.error(`Error in login at line ${error.name}: ${error.message}\n${error.stack}`);
        return failedResponse(res,500, error.message)
      }
        
    };

    static async verifyAccount (req:Request, res:Response, next:NextFunction) {
      try {
        const { error, value } = emailVerificationValidator.validate(req.body);
        if (error) {
          return failedResponse (res, 400, `${error.details[0].message}`)
        }
        const emailExist = await prisma.user.findFirst({
          where: {
              email:value.email
            },
            select:{
              email:true,
              id:true,
              is_verified:true
            }
      })
      if (!emailExist) {
        return failedResponse (res, 404, "Email does not exist.")
      }
        const verify = await verifyToken(value.email, value.token)
        if (!verify){
          return failedResponse (res, 400, "Invalid token or token has expired")
        }
        await prisma.user.update({
          where:{
            id:emailExist.id
          },
          data:{
            is_verified:true
          }
        })
        return successResponse(res,200,"Verification successful.")
      } catch (error:any) {
        logger.error(`Error in login at line ${error.name}: ${error.message}\n${error.stack}`);
        return failedResponse(res,500, error.message)
      }
    
    };
    static async login (req:Request, res:Response){
      try {
          const { error, value } = loginValidator.validate(req.body);
          if (error) return failedResponse (res, 400, `${error.details[0].message}`)
          const emailExist = await prisma.user.findUnique({
              where: {
                  email:value.email
                }
          })
          if (!emailExist) {
            return failedResponse (res, 404, "Email does not exist.")
          }
          const validatePassword = await bcrypt.compare(value.password, emailExist.password)
          if (!validatePassword) return failedResponse (res, 400, `Incorrect password`)
          const accessToken = generateJwtToken({email:value.email, userId:emailExist.id})
          return successResponse(res,200,"Success",{emailExist, accessToken} )
      } catch (error:any) {
          logger.error(`Error in login at line ${error.name}: ${error.message}\n${error.stack}`);
          return failedResponse(res,500, error.message)
          
      }
  };

}

export class ForgotPasswordReset {
  static async sendResetToken (req:Request, res:Response, next:NextFunction){
    try {
      const { error, value } = emailValidator.validate(req.body);
      if (error) {
        return failedResponse (res, 400, `${error.details[0].message}`)
      }
      const emailExist = await prisma.user.findUnique({
        where: {
            email:value.email
          },
          select:{
            email:true,
            is_verified:true
          }
    })
    if (!emailExist) {
      return failedResponse (res, 404, "Email does not exist.")
    }
    await OtpToken(value.email,"Reset password token", "templates/reset_password.html" )
    return successResponse(res,200,"Verification token has been resent to your email.")
    } catch (error:any) {
      logger.error(`Error in login at line ${error.name}: ${error.message}\n${error.stack}`);
      return failedResponse(res,500, error.message)
    }
      
  };

  static async validateToken (req:Request, res:Response, next:NextFunction) {
    try {
      const { error, value } = emailVerificationValidator.validate(req.body);
      if (error) {
        return failedResponse (res, 400, `${error.details[0].message}`)
      }
      const emailExist = await prisma.user.findFirst({
        where: {
            email:value.email
          },
          select:{
            email:true,
            id:true,
            is_verified:true
          }
    })
    if (!emailExist) {
      return failedResponse (res, 404, "Email does not exist.")
    }
      const verify = await ValidateToken(value.email, value.token)
      if (!verify){
        return failedResponse (res, 400, "Invalid token or token has expired")
      }
      return successResponse(res,200," Valid")
    } catch (error:any) {
      logger.error(`Error in login at line ${error.name}: ${error.message}\n${error.stack}`);
      return failedResponse(res,500, error.message)
    }
  
  };

  static async changePassword (req:Request, res:Response, next:NextFunction) {
    try {
      const { error, value } = resetPasswordValidator.validate(req.body);
      if (error) {
        return failedResponse (res, 400, `${error.details[0].message}`)
      }
      const emailExist = await prisma.user.findFirst({
        where: {
            email:value.email
          },
          select:{
            email:true,
            id:true,
            is_verified:true
          }
    })
    if (!emailExist) {
      return failedResponse (res, 404, "Email does not exist.")
    }
      const user = await verifyToken(value.email, value.token)
      if (!user){
        return failedResponse (res, 400, "Invalid token or token has expired")
      }
      const salt = await bcrypt.genSalt(10)
      value.password = await bcrypt.hash(value.password, salt)
      await prisma.user.update({
        where:{
          id: emailExist.id
        },
        data: {
          password:value.password
        }
      })
      return successResponse(res,200," Valid")
    } catch (error:any) {
      logger.error(`Error in login at line ${error.name}: ${error.message}\n${error.stack}`);
      return failedResponse(res,500, error.message)
    }
  
  };
}