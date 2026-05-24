import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, htmlOrLink: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // If caller passed a full HTML snippet (starts with '<'), use it directly.
  // Otherwise treat the value as a plain URL and render a simple default template.
  const html = htmlOrLink.trim().startsWith("<")
    ? htmlOrLink
    : `<p>Click the link below:</p>
         <p><a href="${htmlOrLink}">${htmlOrLink}</a></p>`;

  await transporter.sendMail({
    to,
    subject,
    html,
  });
}