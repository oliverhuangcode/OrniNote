// server/src/routes/invite.js
import express from 'express';
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendInvite } from '../middleware/mailer.js';
import { User } from '../../models/users.js';
import { Project, Invite } from '../../models/projects.js';

const router = express.Router();

// Create and send invite
router.post("/", async (req, res) => {
    const { email, projectId, projectName } = req.body;

    if (!email || !projectId || !projectName) {
        return res.status(400).json({ success: false, message: "Email, projectId and projectName are required" });
    }

    try {
        // Check for pending invite
        const existingInvite = await Invite.findOne({ email, status: "Pending", project: projectId });
        if (existingInvite) {
            return res.status(400).json({ success: false, message: "Invite already sent to this email" });
        } 

        // Creates token and hash 
        const token = jwt.sign({ projectId, email }, process.env.JWT_SECRET, { expiresIn: "7d" });
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        // Save invite and add to project
        const invite = await Invite.create({ project: projectId, email, tokenHash });
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        };

        project.invites.push(invite._id);
        await project.save();

        // Send email invite 
        const inviteLink = `http://localhost:3000/accept-invite?token=${token}`;
        await sendInvite(email, projectName, inviteLink);

        res.status(200).json({ 
            success: true, 
            message: 'Invite sent!',
            inviteId: invite._id  // Add this line
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to send invite' });
    }
});

// Accept invite 
router.get("/accept", async (req, res) => {
    const { token } = req.query;

    if (!token) return res.status(400).send("Invalid invite link");

    try {
        // Verify token 
        jwt.verify(token, process.env.JWT_SECRET);
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        // Find pending invite 
        const invite = await Invite.findOne({ tokenHash, status: "Pending" });
        if (!invite) return res.status(400).json({ error: "Invalid or expired invite" });

        // Check if user exists 
        let user = await User.findOne({ email: invite.email });
        if (!user) {
            // Front end to redirect to sign up  
            return res.json({ success: true, action: "redirectToLogin", email: invite.email });
        }

        // Add user to project collaborators 
        const project = await Project.findById(invite.project);

        const alreadyCollaborator = project.collaborators.some(
            (c) => c.user.toString() === user._id.toString()
        );

        if (!alreadyCollaborator) {
            project.collaborators.push({ user: user._id, role: "Viewer"});
            await project.save();
        }

        // Mark invite as accepted 
        invite.status = "Accepted";
        await invite.save();

        // Frontend to redirect to project page
        res.json({ success: true, action: "redirectToProject", projectId: project._id });

    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "Invalid or expired token" });
    }
});

export default router;