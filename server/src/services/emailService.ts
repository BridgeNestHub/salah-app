import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 5000,    // 5 seconds
  socketTimeout: 10000,     // 10 seconds
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendThankYouEmail = async (email: string, name: string) => {
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
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Thank you for contacting Islamic Prayer Tools',
      text: emailContent
    });
    console.log(`✅ Thank you email sent to ${email}`);
  } catch (error) {
    console.error('❌ Failed to send thank you email:', error);
    throw error;
  }
};

export const sendContactNotification = async (name: string, email: string, subject: string, message: string) => {
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
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to yourself
      subject: `Contact Form: ${subject}`,
      text: notificationContent
    });
    console.log(`✅ Contact notification sent for ${name}`);
  } catch (error) {
    console.error('❌ Failed to send contact notification:', error);
    throw error;
  }
};