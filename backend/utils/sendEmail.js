import nodemailer from 'nodemailer';

// Create transporter (configure with your email service)
const createTransporter = () => {
  // For development, you can use Ethereal Email or configure with SendGrid
  if (process.env.NODE_ENV === 'development') {
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS
      }
    });
  }

  // Production: Use SendGrid or other service
  return nodemailer.createTransport({
    service: 'SendGrid',
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY
    }
  });
};

export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const message = {
      from: process.env.EMAIL_FROM || 'noreply@realestateplatform.com',
      to: options.email,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    const info = await transporter.sendMail(message);
    console.log('Email sent: ', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error: ', error);
    throw error;
  }
};

export default sendEmail;
