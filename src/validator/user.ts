import Joi from "joi";

export const userValidator = Joi.object({
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    password: Joi.string()
        .required()
        .min(8) // Minimum length of 8 characters
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})')) // Password complexity rules
        .message('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character.'),
    name: Joi.string().required()
});

export const emailValidator = Joi.object({
  email: Joi.string().email().required(),

});

export const emailVerificationValidator=Joi.object({
  email: Joi.string().email().required(),
  token: Joi.string().min(4).max(4).required(),

})


export const loginValidator=Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),

})

export const resetPasswordValidator=Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
        .required()
        .min(8) // Minimum length of 8 characters
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})')) // Password complexity rules
        .message('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character.'),
  token: Joi.string().min(4).max(4).required(),

})