require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(to, subject, text) {
  const info = await transporter.sendMail({
    from: `"PNR Checker" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: subject,
    text: text,
  });

  console.log("Email sent:", info.messageId);
}

module.exports = sendEmail;
