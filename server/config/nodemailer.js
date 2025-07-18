import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
        user: "85c33c001@smtp-brevo.com",
        pass: "GVFrT3M4Ek8vhqQO",
    },
});

export default transporter;