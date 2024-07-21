import { string } from 'joi';
import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  owner: string;
  organization: string;
  type: string;
  title: string,
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationParams {
  owner?: string;
  title?: string;
  type?: string;
  message?: string;
};