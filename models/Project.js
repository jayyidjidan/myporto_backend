import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    hero: {
      title: {
        type: String,
        required: true,
        trim: true,
      },

      coverImage: {
        type: String,
        default: "",
      },

      showSource: {
        type: Boolean,
        default: false,
      },

      showPreview: {
        type: Boolean,
        default: false,
      },

      sourceUrl: {
        type: String,
        default: "",
      },

      previewUrl: {
        type: String,
        default: "",
      },
    },

    overview: {
      description: {
        type: String,
        default: "",
      },

      duration: {
        type: String,
        default: "",
      },

      categories: [
        {
          type: String,
          trim: true,
        },
      ],
    },

    problem: {
      problem: {
        type: String,
        default: "",
      },

      solution: {
        type: String,
        default: "",
      },

      images: [
        {
          type: String,
        },
      ],
    },

    processes: [
      {
        title: {
          type: String,
          trim: true,
        },

        description: {
          type: String,
          default: "",
        },

        images: [
          {
            type: String,
          },
        ],
      },
    ],

    technologies: [
      {
        name: {
          type: String,
          trim: true,
        },

        icon: {
          type: String,
          default: "",
        },
      },
    ],

    results: [
      {
        title: {
          type: String,
          trim: true,
        },

        description: {
          type: String,
          default: "",
        },

        images: [
          {
            type: String,
          },
        ],
      },
    ],

    gallery: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;