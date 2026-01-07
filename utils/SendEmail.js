import nodemailer from 'nodemailer';

export const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  await transporter.sendMail({
    from: `"DevNexus Solutions" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
};
