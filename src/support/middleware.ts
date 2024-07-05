import multer from "multer"
import dotenv from "dotenv";
import { logger } from "../logger";
import { NextFunction, Request, Response } from "express";
import { S3Client,S3ClientConfig, PutObjectCommand } from "@aws-sdk/client-s3"
import { failedResponse, successResponse } from "./http";
import crypto from "crypto"
import { verifyJwtToken } from "./generateTokens";
import { User } from "../models/users";

dotenv.config()
 
const {PROJ_ENV,AWS_ACCESS_KEY_ID,AWS_SECRET_ACCESS_KEY,AWS_REGION,AWS_BUCKET} = process.env
let storage;
// configure storage for development and production
if (PROJ_ENV != "DEV"){
    storage = multer.memoryStorage()
}else{
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, 'uploads')
        },
        filename: function (req, file, cb) {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
          cb(null, file.fieldname + '-' + uniqueSuffix + '.png')
        }
      })
}

export const upload = multer({ storage: storage })

const s3Config: S3ClientConfig = {
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID || '',
      secretAccessKey: AWS_SECRET_ACCESS_KEY || '',
    },
    region: AWS_REGION || 'us-west-1', // Change the default region as per your requirement
  };
  
const s3 = new S3Client({ ...s3Config });

export async function handlefileUpload(req: Request, res: Response, next: NextFunction): Promise<any> {


  if (!req.file) {
      // Check if the expected fieldname is missing or empty
      return res.status(400).json({ error: "File field is missing or empty" });
  }
  const fieldname:string = req.file.filename
  const environ: any = PROJ_ENV;
  try {
      let key = `${crypto.randomUUID()}.png`;
      let filePath;
      if (environ === "DEV") {
          filePath = `${req.protocol}://${req.get('host')}/${fieldname}`;
          req.body.file_key = fieldname;
      } else {
          const fieldName = req.file.buffer;

          const params = {
              Bucket: AWS_BUCKET,
              Key: `gotruhub/${key}`,
              Body: fieldName, // File content
          };
          // Upload file to S3 bucket
          const command = new PutObjectCommand(params);
          const data = await s3.send(command);
          logger.info(data)
          filePath = `https://${AWS_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;
          req.body.file_key = key;
      }

      req.body.file_url = filePath;
      
      next();
  } catch (error:any) {
      logger.error(error.message);
      return res.status(500).json({ error: "Internal server error" });
  }
};

export const IsAuthenticatedUser = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    return failedResponse(res, 401, 'Access denied. Authorization header missing.');
  }

  const token = req.headers.authorization.split(" ")[1] || req.cookies.token;
  if (!token) {
    return failedResponse(res, 401, 'Access denied. No token provided.');
  }

  try {
    const decodedToken = verifyJwtToken(token);

    const user = await User.findById(decodedToken.userId);
    if (!user?.isVerified) {
      return failedResponse(res, 401, 'Account onboarding is not completed yet, please verify email.');
    }

    (req as any).user = {
      email: decodedToken.email,
      _id: decodedToken.userId,
      userType: decodedToken.userType
    };
    next();
  } catch (error: any) {
    logger.error(error.message);
    return failedResponse(res, 401, 'Invalid access token.');
  }
};
