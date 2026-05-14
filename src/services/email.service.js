import { transporter } from "../config/nodeMailer.config.js";
import { InvitationMailTemplate } from "../templates/invitation.template.js";
import { env } from "../config/env.js";
export const sendInvitationEmail = async ({ to, managerName, developerName, projectName, acceptLink }) => {
    const html = InvitationMailTemplate({ managerName, developerName, projectName, acceptLink });
    const mailOptions = {
        from: env.EMAIL_USER,
        to,
        subject: "Project Invitation",
        html,
    }
    await transporter.sendMail(mailOptions);
}