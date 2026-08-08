import Project from "../models/Project.js";

/**
 * Helper: get relative URL for an uploaded file.
 * Returns null if no file was uploaded for that field.
 */
const getFileUrl = (files, fieldName) => {
  if (files && files[fieldName] && files[fieldName][0]) {
    return `/uploads/${files[fieldName][0].filename}`;
  }
  return null;
};

/**
 * Build the nested MongoDB document from the flat multipart form data.
 * The frontend sends all non-file fields as a JSON string in `req.body.projectData`,
 * and actual files as separate multipart fields.
 */
const buildProjectData = (body, files) => {
  let data;
  try {
    data = JSON.parse(body.projectData);
  } catch {
    data = { ...body };
  }

  // ── Hero image ──────────────────────────────────────────────
  const coverUrl = getFileUrl(files, "coverImage");
  if (coverUrl && data.hero) data.hero.coverImage = coverUrl;

  // ── Problem images ───────────────────────────────────────────
  if (data.problem) {
    const existingImgs = data.problem.images || [];
    const img1 = getFileUrl(files, "image1") ?? existingImgs[0] ?? null;
    const img2 = getFileUrl(files, "image2") ?? existingImgs[1] ?? null;
    data.problem.images = [img1, img2].filter(Boolean);
  }

  // ── Process images ───────────────────────────────────────────
  if (data.processes) {
    data.processes = data.processes.map((p, i) => {
      const newImg = getFileUrl(files, `process${i + 1}image`);
      return {
        ...p,
        images: newImg ? [newImg] : (p.images || []),
      };
    });
  }

  // ── Result images ────────────────────────────────────────────
  if (data.results) {
    data.results = data.results.map((r, i) => {
      const newImg = getFileUrl(files, `result${i + 1}image`);
      return {
        ...r,
        images: newImg ? [newImg] : (r.images || []),
      };
    });
  }

  // ── Gallery images ───────────────────────────────────────────
  const galleryUrls = [];
  for (let i = 1; i <= 9; i++) {
    const url = getFileUrl(files, `gallery${i}`);
    if (url) galleryUrls.push(url);
  }
  if (galleryUrls.length > 0) {
    data.gallery = galleryUrls;
  } else if (!data.gallery) {
    data.gallery = [];
  }

  return data;
};

/**
 * Create a new project
 * POST /api/projects
 */
export const createProject = async (req, res) => {
  try {
    const projectData = buildProjectData(req.body, req.files || {});
    const project = await Project.create(projectData);

    res.status(201).json({
      success: true,
      message: "Project created successfully.",
      data: project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all projects
 * GET /api/projects
 */
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
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
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update project
 * PUT /api/projects/:id
 */
export const updateProject = async (req, res) => {
  try {
    const projectData = buildProjectData(req.body, req.files || {});

    const project = await Project.findByIdAndUpdate(req.params.id, projectData, {
      new: true,
      runValidators: true,
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      data: project,
    });
  } catch (error) {
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
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    res.status(200).json({ success: true, message: "Project deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};