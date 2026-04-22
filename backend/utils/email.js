import nodemailer from "nodemailer";

export const sendEmail = async (to, password) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Your CRM Account Created",
    html: `
      <h3>Welcome to CRM</h3>
      <p>Your account has been created.</p>
      <p><strong>Email:</strong> ${to}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p>Please login and change your password.</p>
    `,
  });
};