import Product from '../models/Product.js';
import { validationResult } from 'express-validator';
import { deleteImage } from '../utils/cloudinary.js';

// Helper function to handle errors
const handleError = (res, status, message) => {
    return res.status(status).json({ success: false, error: message });
};

// Create a new product
export const createProduct = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, description, price, category, tags, images, stock, status } = req.body;

        console.log(req.body);
        const newProduct = new Product({
            name,
            description,
            price,
            category,
            tags,
            images,
            stock,
            status,
            author: req.user.id
        });

    
        const savedProduct = await newProduct.save();
        res.status(201).json({ success: true, data: savedProduct });
    } catch (error) {
        console.error('Error creating product:', error);
        handleError(res, 500, 'Server error while creating product');
    }
};

// Get all products with filtering
export const getProducts = async (req, res) => {
    try {
        const {
            category,
            tags,
            minPrice,
            maxPrice,
            search,
            status,
            page = 1,
            limit = 10,
            sort = '-createdAt'
        } = req.query;

        const query = {};

        // Filter by status (public view defaults to 'available')
        if (status) {
            query.status = status;
        } else {
            query.status = 'available';
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Filter by tags (any of the tags)
        if (tags) {
            const tagsArray = tags.split(',').map(tag => tag.trim());
            query.tags = { $in: tagsArray };
        }

        // Filter by price range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Search in name and description
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const products = await Product.find(query)
            .populate('author', 'name email')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Product.countDocuments(query);

        res.json({
            success: true,
            data: products,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            totalProducts: count
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        handleError(res, 500, 'Server error while fetching products');
    }
};

// Get single product by ID or Slug
export const getProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if ID is a valid MongoDB ObjectId or a slug
        const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };

        const product = await Product.findOne(query).populate('author', 'name email');

        if (!product) {
            return handleError(res, 404, 'Product not found');
        }

        res.json({ success: true, data: product });
    } catch (error) {
        console.error('Error fetching product:', error);
        handleError(res, 500, 'Server error while fetching product');
    }
};

// Update a product
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const product = await Product.findById(id);
        if (!product) {
            return handleError(res, 404, 'Product not found');
        }

        // Check if the user is the author or admin
        if (product.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return handleError(res, 403, 'Not authorized to update this product');
        }

        // Handle image removal from Cloudinary if images are being updated
        if (req.body.images && Array.isArray(req.body.images)) {
            const oldPublicIds = product.images.map(img => img.publicId);
            const newPublicIds = req.body.images.map(img => img.publicId);

            const toDelete = oldPublicIds.filter(id => !newPublicIds.includes(id));
            for (const publicId of toDelete) {
                await deleteImage(publicId);
            }
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.json({ success: true, data: updatedProduct });
    } catch (error) {
        console.error('Error updating product:', error);
        handleError(res, 500, 'Server error while updating product');
    }
};

// Delete a product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        if (!product) {
            return handleError(res, 404, 'Product not found');
        }

        // Check if the user is the author or admin
        if (product.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return handleError(res, 403, 'Not authorized to delete this product');
        }

        // Delete images from Cloudinary
        for (const image of product.images) {
            if (image.publicId) {
                await deleteImage(image.publicId);
            }
        }

        await Product.findByIdAndDelete(id);
        res.json({ success: true, message: 'Product and associated images deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        handleError(res, 500, 'Server error while deleting product');
    }
};
