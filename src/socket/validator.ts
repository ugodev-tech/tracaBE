import Joi from 'joi';

export const currentLocationSchema = Joi.object({
    lat: Joi.string().required(),
    long: Joi.string().required()
});