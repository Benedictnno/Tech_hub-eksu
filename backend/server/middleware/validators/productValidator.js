import { body } from 'express-validator';

export const createProductValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('Product name is required')
        .isLength({ min: 3, max: 200 }).withMessage('Name must be between 3 and 200 characters'),

    body('description')
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),

    body('price')
        .notEmpty().withMessage('Price is required')
        .isNumeric().withMessage('Price must be a number')
        .custom((value) => value >= 0).withMessage('Price cannot be negative'),

    body('category')
        .trim()
        .notEmpty().withMessage('Category is required'),

    body('tags')
        .optional()
        .isArray().withMessage('Tags must be an array'),

    body('images')
        .optional()
        .isArray().withMessage('Images must be an array'),

    body('images.*.url')
        .if(body('images').exists())
        .isURL().withMessage('Image URL must be valid'),

    body('images.*.publicId')
        .if(body('images').exists())
        .notEmpty().withMessage('Image publicId is required'),

    body('stock')
        .optional()
        .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),

    body('status')
        .optional()
        .isIn(['draft', 'available', 'out_of_stock', 'discontinued']).withMessage('Invalid status')
];

export const updateProductValidator = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 200 }).withMessage('Name must be between 3 and 200 characters'),

    body('description')
        .optional()
        .isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),

    body('price')
        .optional()
        .isNumeric().withMessage('Price must be a number')
        .custom((value) => value >= 0).withMessage('Price cannot be negative'),

    body('category')
        .optional()
        .trim(),

    body('tags')
        .optional()
        .isArray().withMessage('Tags must be an array'),

    body('images')
        .optional()
        .isArray().withMessage('Images must be an array'),

    body('stock')
        .optional()
        .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),

    body('status')
        .optional()
        .isIn(['draft', 'available', 'out_of_stock', 'discontinued']).withMessage('Invalid status')
];
