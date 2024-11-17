import {Schema, Model, model } from 'mongoose';
import { INotification } from '../interfaces/notification'; 
import { sendNotif } from '../notification/firebaseNotification';
import { User } from './users';
import { writeErrorsToLogs } from '../support/helpers';

const notificationSchema: Schema<INotification> = new Schema<INotification>({
  owner: String,
  title: String,
  type: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.pre("save", async function(next) {
    if(this.isNew){
        const user = await User.findById(this.owner)
        if (user?.fcmToken) {
            const notifyPayload = {};
            try {
                await sendNotif(user.fcmToken.toString(), this.title, this.message, notifyPayload);
            } catch (error) {
                writeErrorsToLogs(error)
            }
        }
    };
    next()
})

export const Notification: Model<INotification> = model<INotification>('Notification', notificationSchema);
