import { Schema, model, Document, Types } from 'mongoose';
import { IUser, Imedia } from './users';

export interface IRestaurant extends Document {
  owner: Schema.Types.ObjectId;// Reference to the User who owns the restaurant
  name: string;
  image?:Schema.Types.ObjectId
  address: string;
  phone: string;
  email: string;
  openingHours: {
    day: string;
    open: string;
    close: string;
  }[];
  cuisineType: string[];
  location: { lat: string; long: string };
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export interface ICategory extends Document {
    restaurant:Schema.Types.ObjectId;
    owner: Schema.Types.ObjectId
    name: string;
    description?: string;
    image?:Schema.Types.ObjectId;
  };

export interface IMenuItem extends Document {
    _id?:string;
    restaurant:Schema.Types.ObjectId;
    owner: Schema.Types.ObjectId; // Reference to the Restaurant
    itemName: string;
    coverImage?:Schema.Types.ObjectId;
    images?:Schema.Types.ObjectId[];
    description: string;
    price: number;
    category: Schema.Types.ObjectId
  };

export interface ISubOrder extends Document {
    user: Schema.Types.ObjectId; // Reference to the User who placed the order
    shopOwnerId: Schema.Types.ObjectId; // Reference to the User who placed the order
    restaurant: Schema.Types.ObjectId;  // Reference to the Restaurant
    items: {
      menuItem: Schema.Types.ObjectId  // Reference to MenuItem
      quantity: number;
    }[];
    subTotal: number;
    status?: 'pending' | 'accepted' | 'inDelivery' | 'delivered' | 'cancelled';
    dispatchRider?: Schema.Types.ObjectId; // Reference to the User who is the dispatch rider
    deliveryLocation: { type: string, required: true }
    createdAt: Date;
    updatedAt: Date;
  };

export interface IOrder extends Document {
    orderNumber:string ;
    user: Schema.Types.ObjectId; // Reference to the User who placed the order
    subOrder: Schema.Types.ObjectId[];
    totalPrice: number;
    status: 'pending' | 'accepted' | 'inDelivery' | 'delivered' | 'cancelled';
    dispatchRider?: Schema.Types.ObjectId; // Reference to the User who is the dispatch rider
    deliveryLocation: { type: string, required: true }
    createdAt: Date;
    updatedAt: Date;
  };

export interface IDelivery extends Document {
    order:Schema.Types.ObjectId; // Reference to the Order
    dispatchRider: Schema.Types.ObjectId;// Reference to the User who is the dispatch rider
    currentLocation: { lat: string; long: string };
    status: 'onRoute' | 'delivered';
    createdAt: Date;
    updatedAt: Date;
  }
  