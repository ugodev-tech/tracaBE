import { PrismaClient } from '@prisma/client'
import {Application, Request, Response, NextFunction} from "express"
import { failedResponse, successResponse } from '../support/http'; 
import { httpLogger } from '../httpLogger';
import { emailValidator, emailVerificationValidator, userValidator } from '../validator/user';
import { logger } from '../logger';
import { OtpToken, verifyToken } from '../support/helpers';
import { generateJwtToken } from '../support/generateTokens';



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
    
    }

}