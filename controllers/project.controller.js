import cloudinary from "../config/cloudinary.js";
import Project from "../models/Project.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Upload a file buffer to Cloudinary.
 */
const uploadToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "jayyid-portfolio", resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });

/**
 * Build the project document from multipart form data.
 *
 * The frontend sends:
 *   - req.body.projectData   : JSON string with all non-file fields
 *   - req.files.coverImage   : optional cover image
 *   - req.files[`s${sIdx}_b${bIdx}_img${iIdx}`] : block image files
 *       where sIdx = section index (0-based)
 *             bIdx = block index (0-based)
 *             iIdx = image index within block (0-based, for carousel/grid)
 */
const buildProjectData = async (body, files) => {
  let data;

  try {
    data = JSON.parse(body.projectData);
  } catch {
    data = { ...body };
  }

  // ── Cover image ─────────────────────────────────────────────────────────────
  if (files?.coverImage?.[0]) {
    data.coverImage = await uploadToCloudinary(files.coverImage[0]);
  }

  // ── Section block images ─────────────────────────────────────────────────────
  if (Array.isArray(data.sections)) {
    data.sections = await Promise.all(
      data.sections.map(async (section, sIdx) => {
        const blocks = await Promise.all(
          (section.blocks || []).map(async (block, bIdx) => {
            if (block.type === "image") {
              // Single image block
              const key = `s${sIdx}_b${bIdx}_img0`;
              if (files?.[key]?.[0]) {
                block.url = await uploadToCloudinary(files[key][0]);
              }
            } else if (block.type === "carousel" || block.type === "grid") {
              // Multi-image blocks
              const updatedImages = await Promise.all(
                (block.images || []).map(async (img, iIdx) => {
                  const key = `s${sIdx}_b${bIdx}_img${iIdx}`;
                  if (files?.[key]?.[0]) {
                    return {
                      ...img,
                      url: await uploadToCloudinary(files[key][0]),
                    };
                  }
                  return img;
                })
              );
              block.images = updatedImages;
            }
            return block;
          })
        );
        return { ...section, blocks };
      })
    );
  }

  return data;
};

// ── Controller actions ────────────────────────────────────────────────────────

/**
 * Create a new project
 * POST /api/projects
 */
export const createProject = async (req, res) => {
  try {
    const projectData = await buildProjectData(req.body, req.files || {});
    const project = await Project.create(projectData);

    res.status(201).json({
      success: true,
      message: "Project created successfully.",
      data: project,
    });
  } catch (error) {
    console.error("Create Project Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all projects (lightweight list for project cards)
 * GET /api/projects
 */
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .select("slug title category scope duration coverImage createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.set(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=300"
    );

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("Get Projects Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get project by slug
 * GET /api/projects/:slug
 */
export const getProjectBySlug = async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug });

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    console.error("Get Project Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update project
 * PUT /api/projects/:id
 */
export const updateProject = async (req, res) => {
  try {
    const projectData = await buildProjectData(req.body, req.files || {});

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      projectData,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }

    res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      data: project,
    });
  } catch (error) {
    console.error("Update Project Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete project
 * DELETE /api/projects/:id
 */
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Project Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};