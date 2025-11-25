import express from "express";
import Joi from "joi";
import { protect, admin } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {
  createAlbum,
  listPublicAlbums,
  getAlbumPhotosBySlug,
  addPhotosToAlbum,
  deletePhoto,
} from "../controllers/galleryController.js";

const router = express.Router();

const createAlbumSchema = Joi.object({
  name: Joi.string().min(1).required(),
  description: Joi.string().allow("", null),
  isPublic: Joi.boolean().optional(),
});

const addPhotosSchema = Joi.object({
  photos: Joi.array()
    .items(
      Joi.object({
        publicId: Joi.string().required(),
        title: Joi.string().allow("", null),
        format: Joi.string().optional(),
        width: Joi.number().optional(),
        height: Joi.number().optional(),
        bytes: Joi.number().optional(),
      })
    )
    .min(1)
    .required(),
});

// Admin routes
router.post("/albums", protect, admin, validate(createAlbumSchema), createAlbum);
router.post(
  "/albums/:albumId/photos",
  protect,
  admin,
  validate(addPhotosSchema),
  addPhotosToAlbum
);
router.delete("/photos/:id", protect, admin, deletePhoto);

// Public routes
router.get("/albums", listPublicAlbums);
router.get("/albums/:slug/photos", getAlbumPhotosBySlug);

export default router;
