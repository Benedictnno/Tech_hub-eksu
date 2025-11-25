import express from 'express';
import { check } from 'express-validator';
import * as blogController from '../controllers/blogController.js';
import { createPostValidator, updatePostValidator, toggleStatusValidator } from '../middleware/validators/blogValidator.js';
import { protect as auth, admin } from '../middleware/auth.js';

const router = express.Router();

// Admin routes (protected by auth and admin middleware)
router.post('/', 
  auth, 
  admin, 
  createPostValidator, 
  blogController.createPost
);

router.put('/:id', 
  auth, 
  admin, 
  updatePostValidator, 
  blogController.updatePost
);

router.delete('/:id', 
  auth, 
  admin, 
  blogController.deletePost
);

router.patch('/:id/status', 
  auth, 
  admin, 
  toggleStatusValidator, 
  blogController.togglePostStatus
);

// Public routes
router.get('/', blogController.getPublishedPosts);
router.get('/:slug', blogController.getPostBySlug);

// Admin list all posts (with filters)
router.get('/admin/list', 
  auth, 
  admin, 
  blogController.getAllPosts
);

export default router;
