import mongoose from "mongoose";

const photoSchema = new mongoose.Schema(
  {
    album: { type: mongoose.Schema.Types.ObjectId, ref: "GalleryAlbum", required: true },
    title: { type: String },
    cloudinaryPublicId: { type: String, required: true },
    format: { type: String },
    width: { type: Number },
    height: { type: Number },
    bytes: { type: Number }
  },
  { timestamps: true }
);

photoSchema.index({ album: 1, createdAt: -1 });

const Photo = mongoose.model("GalleryPhoto", photoSchema);

export default Photo;
