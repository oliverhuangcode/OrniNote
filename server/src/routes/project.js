// server/src/routes/project.js
import express from "express";
import { Project } from "../../models/projects.js";

const router = express.Router();

// GET project by ID
router.get("/:id", async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate("collaborators.user", "username email")
            .populate("invites");
            
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }
        res.json(project);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch project" });
    }
});

// Update collaborator role
router.patch("/:projectId/collaborators/:memberId", async (req, res) => {
    try {
        const { projectId, memberId } = req.params;
        const { role } = req.body;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        const collaborator = project.collaborators.find(
            (c) => c.user.toString() === memberId
        );

        if (!collaborator) {
            return res.status(404).json({ success: false, message: "Collaborator not found" });
        }

        collaborator.role = role;
        await project.save();

        res.json({ success: true, message: "Role updated", project });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to update role" });
    }
});

export default router;

