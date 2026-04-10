import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, link: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    to,
    subject,
    html: `<p>Click below to reset password:</p>
           <a href="${link}">${link}</a>`,
  });
}