import slugify from "slugify";
import Album from "../models/Album.js";
import Photo from "../models/Photo.js";
import { deleteImage, hasCloudinaryConfig } from "../utils/cloudinary.js";

const handleError = (res, status, message) => {
  return res.status(status).json({ success: false, error: message });
};

export const createAlbum = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    const slug = slugify(name, { lower: true, strict: true });
    const folderRoot = process.env.CLOUDINARY_GALLERY_ROOT || "gallery";
    const folder = `${folderRoot}/${slug}`;

    const existing = await Album.findOne({ slug });
    if (existing) {
      return handleError(res, 400, "An album with this name already exists");
    }

    const album = await Album.create({
      name,
      slug,
      description,
      folder,
      isPublic: typeof isPublic === "boolean" ? isPublic : true,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: album });
  } catch (err) {
    console.error("createAlbum error", err);
    handleError(res, 500, "Server error while creating album");
  }
};

export const listPublicAlbums = async (req, res) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);

    const query = { isPublic: true };

    const [items, total] = await Promise.all([
      Album.find(query)
        .populate("coverPhoto")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Album.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: items,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      limit,
    });
  } catch (err) {
    console.error("listPublicAlbums error", err);
    handleError(res, 500, "Server error while fetching albums");
  }
};

export const getAlbumPhotosBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const album = await Album.findOne({ slug, isPublic: true });
    if (!album) {
      return handleError(res, 404, "Album not found");
    }

    const photos = await Photo.find({ album: album._id }).sort({ createdAt: 1 });

    res.json({ success: true, data: { album, photos } });
  } catch (err) {
    console.error("getAlbumPhotosBySlug error", err);
    handleError(res, 500, "Server error while fetching album photos");
  }
};

export const addPhotosToAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;
    const { photos } = req.body;

    console.log("photos", photos);
    
    if (!Array.isArray(photos) || photos.length === 0) {
      return handleError(res, 400, "photos must be a non-empty array");
    }

    const album = await Album.findById(albumId);
    if (!album) {
      return handleError(res, 404, "Album not found");
    }

    const docs = photos.map((p) => ({
      album: album._id,
      title: p.title || "",
      cloudinaryPublicId: p.publicId,
      format: p.format,
      width: p.width,
      height: p.height,
      bytes: p.bytes,
    }));

    const created = await Photo.insertMany(docs);

    if (!album.coverPhoto && created[0]) {
      album.coverPhoto = created[0]._id;
      await album.save();
    }

    res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error("addPhotosToAlbum error", err);
    handleError(res, 500, "Server error while adding photos");
  }
};

export const deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await Photo.findById(id);
    if (!photo) {
      return handleError(res, 404, "Photo not found");
    }

    const album = await Album.findById(photo.album);

    if (hasCloudinaryConfig()) {
      await deleteImage(photo.cloudinaryPublicId);
    }

    await photo.deleteOne();

    if (album && album.coverPhoto && album.coverPhoto.toString() === id) {
      album.coverPhoto = null;
      await album.save();
    }

    res.json({ success: true, message: "Photo deleted" });
  } catch (err) {
    console.error("deletePhoto error", err);
    handleError(res, 500, "Server error while deleting photo");
  }
};
