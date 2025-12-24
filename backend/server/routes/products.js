import express from 'express';
import * as productController from '../controllers/productController.js';
import { createProductValidator, updateProductValidator } from '../middleware/validators/productValidator.js';
import { protect as auth, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

// Admin/Protected routes
router.post('/',
    auth,
    admin,
    createProductValidator,
    productController.createProduct
);

router.put('/:id',
    auth,
    admin,
    updateProductValidator,
    productController.updateProduct
);

router.delete('/:id',
    auth,
    admin,
    productController.deleteProduct
);

export default router;
