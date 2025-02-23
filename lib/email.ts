import nodemailer from 'nodemailer';
import { EmailSchema } from '@/services/types';
import { emailSchema } from '@/services/validation';

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !port || !user || !pass) {
    throw new Error('Missing SMTP configuration');
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: false, // true for 465, false for other ports
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  });
};

export async function sendEmail({ to, subject, html }: EmailSchema): Promise<void> {
  try {
    // Validate environment variables
    const fromEmail = process.env.SMTP_FROM_EMAIL;
    if (!fromEmail) {
      throw new Error('Missing SMTP_FROM_EMAIL configuration');
    }

    // Create transporter
    const transporter = createTransporter();

    // Validate email data
    const validatedData = emailSchema.parse({ to, subject, html });

    // Send email
    const info = await transporter.sendMail({
      from: fromEmail,
      to: validatedData.to,
      subject: validatedData.subject,
      html: validatedData.html,
    });

  } catch (error) {
    throw error;
  }
}
