import { Schema, model, Model } from 'mongoose';
import { IUser, Imedia, Itoken } from '../interfaces/users';

const UserSchema:Schema<IUser> = new Schema<IUser>({
    fullname: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, default:"user" },
    isVerified: { type: Boolean, default: false },
    personalAddress: String,
    businessAddress: String,
    idBack: { type: Schema.Types.ObjectId, ref: 'Media' },
    idFront: { type: Schema.Types.ObjectId, ref: 'Media' },
    state: String,
    lga: String,
    address: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  }, { timestamps: true });

const MediaSchema :Schema<Imedia> = new Schema<Imedia>({
    file:{
        type:String,
        required:true
    },
    key:{
        type:String,
        required:true
    }
},{timestamps:true})

const TokenSchema:Schema<Itoken> = new Schema<Itoken>({
    email: {
      type: String,
      required:true
    },
    token: {
      type: String,
      required:true
    },
    created_at: {
      type: Date,
      default:Date.now,
      required:false
    },
    expires_at: {
      type: Date,
      required:true
    },
  })
export const Media: Model<Imedia> = model<Imedia>('Media', MediaSchema);
export const User:Model<IUser> = model<IUser>('User', UserSchema);
export const Token: Model<Itoken> = model<Itoken>('Token', TokenSchema);