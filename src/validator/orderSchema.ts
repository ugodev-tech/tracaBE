import Joi from "joi"
import { objectIdValidator } from "./user";

// Define the product schema
const menuSchema = Joi.object({
    cartItem: objectIdValidator.objectId().required(), // Assuming product_id is a string
    quantity: Joi.number().integer().min(1).required()
  });
  
  // Define the cart schema
const cartSchema = Joi.array().items(menuSchema).min(1).required();
  
  // Define the main payload schema
  export const payloadSchema = Joi.object({
    cart: cartSchema,
    deliveryLocation: Joi.string().required()
  });