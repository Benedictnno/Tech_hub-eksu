import { body } from 'express-validator';

export const createPostValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
    
  body('content')
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 50 }).withMessage('Content must be at least 50 characters'),
    
  body('excerpt')
    .trim()
    .notEmpty().withMessage('Excerpt is required')
    .isLength({ max: 300 }).withMessage('Excerpt cannot exceed 300 characters'),
    
  body('featured_image')
    .optional()
    .isURL().withMessage('Featured image must be a valid URL'),
    
  body('status')
    .optional()
    .isIn(['draft', 'published']).withMessage('Invalid status')
];

export const updatePostValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
    
  body('content')
    .optional()
    .isLength({ min: 50 }).withMessage('Content must be at least 50 characters'),
    
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Excerpt cannot exceed 300 characters'),
    
  body('featured_image')
    .optional()
    .isURL().withMessage('Featured image must be a valid URL'),
    
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived']).withMessage('Invalid status')
];

export const toggleStatusValidator = [
  body('status')
    .isIn(['draft', 'published', 'archived']).withMessage('Invalid status')
];
