import { Schema, model, Document, Types } from 'mongoose';
import { IUser, Imedia } from './users';

export interface IRestaurant extends Document {
  owner: IUser["_id"]; // Reference to the User who owns the restaurant
  name: string;
  image?:Imedia["_id"]
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
    restaurant:IRestaurant["_id"];
    owner: IUser["_id"];
    name: string;
    description?: string;
    image?:Imedia["_id"]
  };

export interface IMenuItem extends Document {
    restaurant:IRestaurant["_id"];
    owner: IUser["_id"];  // Reference to the Restaurant
    itemName: string;
    description: string;
    price: number;
    category: ICategory["_id"];
  };

export interface IOrder extends Document {
    user: IUser["_id"];  // Reference to the User who placed the order
    restaurant: IRestaurant["_id"];  // Reference to the Restaurant
    items: {
      menuItem: IMenuItem["_id"];  // Reference to MenuItem
      quantity: number;
      price: number;
    }[];
    totalPrice: number;
    status: 'pending' | 'accepted' | 'inDelivery' | 'delivered' | 'cancelled';
    dispatchRider?: IUser["_id"];  // Reference to the User who is the dispatch rider
    deliveryLocation: { lat: string; long: string };
    createdAt: Date;
    updatedAt: Date;
  };

export interface IDelivery extends Document {
    order: IOrder["_id"];   // Reference to the Order
    dispatchRider: IUser["_id"]; // Reference to the User who is the dispatch rider
    currentLocation: { lat: string; long: string };
    status: 'onRoute' | 'delivered';
    createdAt: Date;
    updatedAt: Date;
  }
  