import mongoose from "mongoose";

// ── Block sub-schema ──────────────────────────────────────────────────────────
const blockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["text", "image", "carousel", "grid", "button"],
      required: true,
    },

    // text block
    content: { type: String, default: "" },

    // image / carousel / grid
    url: { type: String, default: "" },
    alt: { type: String, default: "" },
    images: [
      {
        url: { type: String, default: "" },
        alt: { type: String, default: "" },
      },
    ],
    columns: { type: Number, default: 2 },

    // button block
    label: { type: String, default: "" },
    href: { type: String, default: "" },
  },
  { _id: false }
);

// ── Section sub-schema ────────────────────────────────────────────────────────
const sectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    blocks: [blockSchema],
  },
  { _id: false }
);

// ── Project schema ────────────────────────────────────────────────────────────
const projectSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "",
      trim: true,
    },

    scope: [
      {
        type: String,
        trim: true,
      },
    ],

    duration: {
      type: String,
      default: "",
      trim: true,
    },

    // Optional top-level cover image for project card thumbnails
    coverImage: {
      type: String,
      default: "",
    },

    // Dynamic content sections
    sections: [sectionSchema],
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;