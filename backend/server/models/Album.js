import mongoose from "mongoose";

const albumSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String },
    folder: { type: String, required: true },
    isPublic: { type: Boolean, default: true },
    coverPhoto: { type: mongoose.Schema.Types.ObjectId, ref: "GalleryPhoto", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Profiles", required: true }
  },
  { timestamps: true }
);

albumSchema.index({ slug: 1 });

const Album = mongoose.model("GalleryAlbum", albumSchema);

export default Album;
