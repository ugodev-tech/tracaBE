import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  fullname: string;
  password: string;
  userType: 'shopOwner' | 'rider' | 'user' | 'admin';
  isVerified: boolean;
  personalAddress?: string;
  businessAddress?: string;
  idBack?: Imedia["_id"]
  idFront?: Imedia["_id"]
  state?: string;
  lga?: string;
  address?: string;
  fcmToken:string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Imedia extends Document{
    file:string,
    key:string,
};
export interface Itoken extends Document{
    email: string;
    token: string;
    created_at?: Date;
    expires_at: Date;
  };