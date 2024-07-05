import Joi from "joi";


export const RestaurantSchema = Joi.object({
    name: Joi.string().allow(""),
    address: Joi.string().allow(""),
    image: Joi.string().allow(""),
    phone: Joi.string().allow(""),
    email: Joi.string().email().allow(""),
    openingHours: Joi.array().items(Joi.object({
      day: Joi.string().allow(""),
      open: Joi.string().allow(""),
      close: Joi.string().allow("")
    })).allow(""),
    cuisineType: Joi.array().items(Joi.string().allow("")),
    location: Joi.object({
      lat: Joi.string().allow(""),
      long: Joi.string().allow("")
    }).allow("")
  });

export const CategorySchema = Joi.object({
  restaurant: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().allow(""),
  image: Joi.string().allow(""),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().allow(""),
  description: Joi.string().allow(""),
  image: Joi.string().allow(""),
});