import express from "express";
import {
  createProject,
  getProjects,
  getProjectBySlug,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";
import { uploadFields } from "../middleware/upload.js";

const router = express.Router();

router.post("/", uploadFields, createProject);
router.get("/", getProjects);
router.get("/:slug", getProjectBySlug);
router.put("/:id", uploadFields, updateProject);
router.delete("/:id", deleteProject);

export default router;