// server/src/mailer.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

export async function sendInvite(email, projectName, inviteLink) {
    const msg = {
        from: `"Orninote" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `You've been invited to join ${projectName}!`,
        html: `
        <div style="font-family: Inter, sans-serif; color: #333;">
            <p>Hello,</p>
            <p>You've been invited to join the project <strong>${projectName}</strong>.</p>
            <p>
            Visit <a href="${inviteLink}"> here </a> to accept the invitation.</p>
            </p>
            <p>Thanks,<br/>Orninote Team</p>
        </div>
        `
    };

    await transporter.sendMail(msg);
}

