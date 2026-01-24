import Joi from 'joi';


export const registerSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'any.required': 'Password is required'
        }),
    firstName: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.min': 'First name must be at least 2 characters',
            'any.required': 'First name is required'
        }),
    lastName: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.min': 'Last name must be at least 2 characters',
            'any.required': 'Last name is required'
        })
});

export const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required'
        })
});


export const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });


        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path[0],
                message: detail.message
            }));
            console.log('Validation failed:', errors);

            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors
            });
        }

        req.body = value;
        next();
    };
};
