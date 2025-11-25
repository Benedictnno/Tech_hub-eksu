import BlogPost from '../models/BlogPost.js';
import { validationResult } from 'express-validator';
import slugify from 'slugify';

// Helper function to handle errors
const handleError = (res, status, message) => {
  return res.status(status).json({ success: false, error: message });
};

// Create a new blog post
export const createPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, content, excerpt, featured_image, status } = req.body;
    const slug = slugify(title, { lower: true, strict: true });

    // Check if slug already exists
    const existingPost = await BlogPost.findOne({ slug });
    if (existingPost) {
      return handleError(res, 400, 'A post with this title already exists');
    }

    const newPost = new BlogPost({
      title,
      slug,
      content,
      excerpt,
      featured_image,
      author: req.user.id,
      status,
      published_at: status === 'published' ? new Date() : null
    });

    const savedPost = await newPost.save();
    res.status(201).json({ success: true, data: savedPost });
  } catch (error) {
    console.error('Error creating post:', error);
    handleError(res, 500, 'Server error while creating post');
  }
};

// Update an existing blog post
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, featured_image, status } = req.body;

    const post = await BlogPost.findById(id);
    if (!post) {
      return handleError(res, 404, 'Post not found');
    }

    // Check if the user is the author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return handleError(res, 403, 'Not authorized to update this post');
    }

    // Update fields
    post.title = title || post.title;
    post.content = content || post.content;
    post.excerpt = excerpt || post.excerpt;
    post.featured_image = featured_image || post.featured_image;
    
    // Handle status change
    if (status && status !== post.status) {
      post.status = status;
      if (status === 'published' && !post.published_at) {
        post.published_at = new Date();
      }
    }

    // Update slug if title changed
    if (title && title !== post.title) {
      post.slug = slugify(title, { lower: true, strict: true });
    }

    const updatedPost = await post.save();
    res.json({ success: true, data: updatedPost });
  } catch (error) {
    console.error('Error updating post:', error);
    handleError(res, 500, 'Server error while updating post');
  }
};

// Get all posts (admin view - includes drafts)
export const getAllPosts = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = {};
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Search in title and content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await BlogPost.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await BlogPost.countDocuments(query);

    res.json({
      success: true,
      data: posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalPosts: count
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    handleError(res, 500, 'Server error while fetching posts');
  }
};

// Get published posts (public endpoint)
export const getPublishedPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = {
      status: 'published',
      published_at: { $lte: new Date() }
    };

    const posts = await BlogPost.find(query)
      .populate('author', 'name')
      .select('-content')
      .sort({ published_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await BlogPost.countDocuments(query);

    res.json({
      success: true,
      data: posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalPosts: count
    });
  } catch (error) {
    console.error('Error fetching published posts:', error);
    handleError(res, 500, 'Server error while fetching published posts');
  }
};

// Get single post by slug (public endpoint)
export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const post = await BlogPost.findOne({
      slug,
      status: 'published',
      published_at: { $lte: new Date() }
    }).populate('author', 'name');

    if (!post) {
      return handleError(res, 404, 'Post not found or not published');
    }

    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Error fetching post:', error);
    handleError(res, 500, 'Server error while fetching post');
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findById(id);
    if (!post) {
      return handleError(res, 404, 'Post not found');
    }

    // Check if the user is the author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return handleError(res, 403, 'Not authorized to delete this post');
    }

    await BlogPost.findByIdAndDelete(id);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    handleError(res, 500, 'Server error while deleting post');
  }
};

// Toggle post status
export const togglePostStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'published', 'archived'].includes(status)) {
      return handleError(res, 400, 'Invalid status');
    }

    const post = await BlogPost.findById(id);
    if (!post) {
      return handleError(res, 404, 'Post not found');
    }

    // Check if the user is the author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return handleError(res, 403, 'Not authorized to update this post');
    }

    post.status = status;
    if (status === 'published' && !post.published_at) {
      post.published_at = new Date();
    }

    const updatedPost = await post.save();
    res.json({ success: true, data: updatedPost });
  } catch (error) {
    console.error('Error toggling post status:', error);
    handleError(res, 500, 'Server error while updating post status');
  }
};
