// server/src/routes/invite.js
import express from 'express';
import { sendInvite } from '../mailer.js'; 

const router = express.Router();

router.post('/invite', async (req, res) => {
    const { email, projectName } = req.body;

    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    try {
        await sendInvite(email, projectName);

        res.status(200).json({ success: true, message: 'Invite sent!' }); // add success flag
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to send invite' });
    }
});

export default router;


