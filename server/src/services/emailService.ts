import nodemailer from 'nodemailer';

// Create transporter with better error handling
let transporter: nodemailer.Transporter | null = null;

const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ SMTP credentials not configured, email service disabled');
    return null;
  }

  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    connectionTimeout: 5000,
    greetingTimeout: 3000,
    socketTimeout: 5000,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

transporter = createTransporter();

export const sendThankYouEmail = async (email: string, name: string) => {
  if (!transporter) {
    console.log('📧 Email service disabled, skipping thank you email');
    return;
  }

  const emailContent = `
Dear ${name},

Assalamu Alaikum wa Rahmatullahi wa Barakatuh,

Thank you for reaching out to us through Islamic Prayer Tools. We have received your message and truly appreciate you taking the time to contact us.

Our team will review your inquiry and respond within 24-48 hours, In Sha Allah. We are committed to providing you with the best possible support for your spiritual journey.

May Allah bless you and guide you in all your endeavors.

Barakallahu feeki/feek,
Islamic Prayer Tools Team

---
"And whoever fears Allah - He will make for him a way out" - Quran 65:2
  `;

  try {
    await Promise.race([
      transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Thank you for contacting Islamic Prayer Tools',
        text: emailContent
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email timeout')), 8000)
      )
    ]);
    console.log(`✅ Thank you email sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send thank you email:', error);
  }
};

export const sendContactNotification = async (name: string, email: string, subject: string, message: string) => {
  if (!transporter) {
    console.log('📧 Email service disabled, skipping notification email');
    return;
  }

  const notificationContent = `
New Contact Form Submission

From: ${name} (${email})
Subject: ${subject}

Message:
${message}

---
Submitted at: ${new Date().toLocaleString()}
  `;

  try {
    await Promise.race([
      transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.SMTP_USER,
        subject: `Contact Form: ${subject}`,
        text: notificationContent
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email timeout')), 8000)
      )
    ]);
    console.log(`✅ Contact notification sent for ${name}`);
  } catch (error) {
    console.error('❌ Failed to send contact notification:', error);
  }
};