import nodemailer from 'nodemailer';

const hasSmtpConfig = () =>
  Boolean(process.env.SMTP_HOST || process.env.ETHEREAL_USER || process.env.SENDGRID_API_KEY);

const createTransporter = () => {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth:
        process.env.SMTP_USER || process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
    });
  }

  if (process.env.ETHEREAL_USER && process.env.ETHEREAL_PASS) {
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS,
      },
    });
  }

  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }

  return null;
};

export const sendEmail = async (options) => {
  if (!hasSmtpConfig()) {
    console.warn(`Email skipped (not configured): ${options.subject} -> ${options.email}`);
    return { skipped: true, sent: false };
  }

  try {
    const transporter = createTransporter();
    if (!transporter) {
      return { skipped: true, sent: false };
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@housetourguide.com',
      to: options.email,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log('Email sent: ', info.messageId);
    return { skipped: false, sent: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error: ', error);
    return { skipped: false, sent: false, error: error.message };
  }
};

export default sendEmail;
