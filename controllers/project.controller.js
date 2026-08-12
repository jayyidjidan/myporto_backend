import cloudinary from "../config/cloudinary.js";
import Project from "../models/Project.js";

/**
 * Upload a file buffer to Cloudinary.
 */
const uploadToCloudinary = (file) => {
  console.log({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKeyExists: !!process.env.CLOUDINARY_API_KEY,
    apiSecretExists: !!process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "jayyid-portfolio",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    stream.end(file.buffer);
  });
};

/**
 * Build the nested MongoDB document from the flat multipart form data.
 *
 * The frontend sends:
 * - All non-file fields as JSON string in req.body.projectData
 * - Actual image files through multipart fields
 */
const buildProjectData = async (body, files) => {
  let data;

  try {
    data = JSON.parse(body.projectData);
  } catch {
    data = { ...body };
  }

  // ============================================================
  // HERO IMAGE
  // ============================================================

  if (files?.coverImage?.[0]) {
    const coverUrl = await uploadToCloudinary(
      files.coverImage[0]
    );

    if (data.hero) {
      data.hero.coverImage = coverUrl;
    }
  }

  // ============================================================
  // PROBLEM IMAGES
  // ============================================================

  if (data.problem) {
    const existingImages = data.problem.images || [];

    const image1 = files?.image1?.[0]
      ? await uploadToCloudinary(files.image1[0])
      : existingImages[0] || null;

    const image2 = files?.image2?.[0]
      ? await uploadToCloudinary(files.image2[0])
      : existingImages[1] || null;

    data.problem.images = [
      image1,
      image2,
    ].filter(Boolean);
  }

  // ============================================================
  // PROCESS IMAGES
  // ============================================================

  if (data.processes) {
    data.processes = await Promise.all(
      data.processes.map(async (process, index) => {
        const fieldName = `process${index + 1}image`;

        const file = files?.[fieldName]?.[0];

        if (file) {
          const imageUrl = await uploadToCloudinary(file);

          return {
            ...process,
            images: [imageUrl],
          };
        }

        return {
          ...process,
          images: process.images || [],
        };
      })
    );
  }

  // ============================================================
  // RESULT IMAGES
  // ============================================================

  if (data.results) {
    data.results = await Promise.all(
      data.results.map(async (result, index) => {
        const fieldName = `result${index + 1}image`;

        const file = files?.[fieldName]?.[0];

        if (file) {
          const imageUrl = await uploadToCloudinary(file);

          return {
            ...result,
            images: [imageUrl],
          };
        }

        return {
          ...result,
          images: result.images || [],
        };
      })
    );
  }

  // ============================================================
  // GALLERY IMAGES
  // ============================================================

  if (data.gallery) {
    const existingGallery = data.gallery || [];

    const galleryUrls = [];

    for (let i = 1; i <= 9; i++) {
      const fieldName = `gallery${i}`;

      const file = files?.[fieldName]?.[0];

      if (file) {
        const imageUrl = await uploadToCloudinary(file);

        galleryUrls.push(imageUrl);
      } else if (existingGallery[i - 1]) {
        galleryUrls.push(existingGallery[i - 1]);
      }
    }

    data.gallery = galleryUrls;
  } else {
    data.gallery = [];
  }

  return data;
};

/**
 * Create a new project
 *
 * POST /api/projects
 */
export const createProject = async (req, res) => {
  try {
    const projectData = await buildProjectData(
      req.body,
      req.files || {}
    );

    const project = await Project.create(projectData);

    res.status(201).json({
      success: true,
      message: "Project created successfully.",
      data: project,
    });
  } catch (error) {
    console.error("Create Project Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all projects
 *
 * GET /api/projects
 */
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("Get Projects Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get project by slug
 *
 * GET /api/projects/:slug
 */
export const getProjectBySlug = async (req, res) => {
  try {
    const project = await Project.findOne({
      slug: req.params.slug,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Get Project Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update project
 *
 * PUT /api/projects/:id
 */
export const updateProject = async (req, res) => {
  try {
    const projectData = await buildProjectData(
      req.body,
      req.files || {}
    );

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      projectData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      data: project,
    });
  } catch (error) {
    console.error("Update Project Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete project
 *
 * DELETE /api/projects/:id
 */
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(
      req.params.id
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Project Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};