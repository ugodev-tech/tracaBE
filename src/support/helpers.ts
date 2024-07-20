import { PrismaClient } from '@prisma/client'
import nodemailer from "nodemailer"
import dotenv from "dotenv"
import fs from "fs"
import handlebars from "handlebars"
import { logger } from '../logger'
import { Token } from '../models/users'

dotenv.config()

export const generateRandomToken = async function(): Promise<number> {
    let token: number=0;
    let codeExists = true;
  
    // Generate a new code until a unique one is found
    while (codeExists) {
      token = Math.floor(Math.random() * 9000) + 1000; // Generate a 6-digit random number
      // Check if the generated code already exists in the database
      const existingToken = await Token.findOne({token: token.toString()})
      if (!existingToken) {
        codeExists = false; // Exit the loop if code doesn't exist in the database
      }
    }
  
    return token; // Convert number to string before returning
  };

  export async function OtpToken(email: string, subject: string = "Otp Token", template: string): Promise<any> {
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 10);
    const token = await generateRandomToken();
    
    // Find the token record by email
    const otp = await Token.findOne({email: email})

    // If the token record exists, update it with the new token and expiry date
    if (otp) {
        otp.token = token.toString()
        otp.expires_at = expiryDate
        await otp.save()
    }else{
        const data = {
            email:email,
            token: token.toString(),
            expires_at: expiryDate
        };
        await Token.create(data)
    }

    // Send mail with the new token
    await sendTemplateMail(email, subject, template, { email: email, token: token });
}

export async function verifyToken(email:string, token:string): Promise<boolean> {
    const isEmailToken = await Token.findOne ({email:email, token:token})
    const currentTime : Date= new Date()
    if (!isEmailToken){
        return false
    }
    if (isEmailToken.expires_at < currentTime){
        return false
    }else{
        const expiryDate= new Date()
        expiryDate.setMinutes(expiryDate.getMinutes() + 10);
        isEmailToken.token = generateRandomToken().toString();
        isEmailToken.expires_at = expiryDate;
        await isEmailToken.save()
        return true
    }

    
}

export async function ValidateToken(email:string, token:string): Promise<boolean> {
    const isEmailToken = await Token.findOne ({email:email, token:token})
    const currentTime : Date= new Date()
    if (!isEmailToken){
        return false
    }
    if (isEmailToken.expires_at < currentTime){
        return false
    }else{
        return true
    }
}


const transporter = nodemailer.createTransport({
    service: 'gmail', // Update with your email service provider
    auth: {
        user: process.env.username, // Update with your email address
        pass: process.env.pass, // Update with your email password
    },
});

const sentMail = async (to:string, subject:string, html:string)=>{
    await transporter.sendMail({
        from: process.env.username, // Update with your email address
        to: to,
        subject: subject,
        html: html,
    });
}

export const sendTemplateMail = async (email: string, subject: string, templatePath:string, context:object) => {
    // Read the HTML template file
    const html = fs.readFileSync(templatePath, 'utf8');

    // Compile the template
    const template = handlebars.compile(html);

    // Render the template with dynamic data
    const compiledHtml = template(context);

    // Send the email
    await sentMail(email, subject , compiledHtml);
};

export function writeErrorsToLogs(error:any) {
    logger.error(`${error.name}: ${error.message}\n${error.stack}`);
}

export function generateRandomAlphNumeric(length: number = 6): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
  
    return result;
  }
  

  