import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

await transporter.sendMail({
  from: `"AgriConnect Test" <${process.env.EMAIL_USER}>`,
  to: process.env.EMAIL_USER,
  subject: "AgriConnect SMTP test",
  html: "<p>If you're reading this, your EMAIL_USER/EMAIL_PASS setup works.</p>",
});

console.log("Sent! Check your inbox.");