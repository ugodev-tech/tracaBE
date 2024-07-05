import { Model, Schema, model } from "mongoose";
import { ICategory, IDelivery, IMenuItem, IOrder, IRestaurant } from "../interfaces/shop";


const RestaurantSchema:Schema<IRestaurant> = new Schema<IRestaurant>({
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String },
    image: { type: Schema.Types.ObjectId, ref: 'Media' },
    address: { type: String },
    phone: { type: String },
    email: { type: String },
    openingHours: [{
      day: { type: String },
      open: { type: String },
      close: { type: String },
    }],
    cuisineType: [{ type: String }],
    location: {
      lat: { type: String },
      long: { type: String }
    },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  }, { timestamps: true });

const CategorySchema:Schema<ICategory> = new Schema<ICategory>({
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: String,
    image: { type: Schema.Types.ObjectId, ref: 'Media' },
  }, { timestamps: true });

const MenuItemSchema:Schema<IMenuItem> = new Schema<IMenuItem>({
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    itemName: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    coverImage: { type: Schema.Types.ObjectId, ref: 'Media' },
    images:[{ type: Schema.Types.ObjectId, ref: 'Media' }],
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  }, { timestamps: true });

const OrderSchema:Schema<IOrder> = new Schema<IOrder>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    items: [{
        menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
    }],
    totalPrice: { type: Number, required: true },
    status: { type: String, required: true, enum: ['pending', 'accepted', 'inDelivery', 'delivered', 'cancelled'], default: 'pending' },
    dispatchRider: { type: Schema.Types.ObjectId, ref: 'User' },
    deliveryLocation: {
        lat: { type: String, required: true },
        long: { type: String, required: true }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    }, { timestamps: true });
const DeliverySchema:Schema<IDelivery> = new Schema<IDelivery>({
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    dispatchRider: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    currentLocation: {
        lat: { type: String, required: true },
        long: { type: String, required: true }
    },
    status: { type: String, required: true, enum: ['onRoute', 'delivered'], default: 'onRoute' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    }, { timestamps: true });

export const Delivery:Model<IDelivery> = model<IDelivery>('Delivery', DeliverySchema);   
export const Order:Model<IOrder> = model<IOrder>('Order', OrderSchema);
export const Category:Model<ICategory> = model<ICategory>('Category', CategorySchema);
export const MenuItem:Model<IMenuItem> = model<IMenuItem>('MenuItem', MenuItemSchema);
export const Restaurant:Model<IRestaurant> = model<IRestaurant>('Restaurant', RestaurantSchema);