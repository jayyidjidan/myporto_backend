import express from "express";
import {
  createProject,
  getProjects,
  getProjectBySlug,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";

const router = express.Router();

router.post("/", createProject);

router.get("/", getProjects);

router.get("/:slug", getProjectBySlug);

router.put("/:id", updateProject);

router.delete("/:id", deleteProject);

export default router;