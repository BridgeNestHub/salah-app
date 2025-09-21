import nodemailer from 'nodemailer';

// Gmail SMTP transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS?.replace(/\s/g, '') // Remove spaces from app password
  }
});

// Send customer message to admin
export const sendContactNotification = async (name: string, email: string, subject: string, message: string) => {
  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: 'balerobe6868@gmail.com',
    subject: `🕌 Islamic Prayer Tools - ${subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2E8B57, #4682B4); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .field { margin-bottom: 15px; padding: 10px; background: white; border-left: 4px solid #2E8B57; }
          .field-label { font-weight: bold; color: #2E8B57; margin-bottom: 5px; }
          .field-value { margin-left: 10px; }
          .message-box { background: white; padding: 15px; border: 1px solid #ddd; border-radius: 5px; margin-top: 10px; }
          .footer { background: #2E8B57; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
          .timestamp { font-size: 12px; color: #666; text-align: right; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🕌 New Contact Form Submission</h2>
            <p>Islamic Prayer Tools Web App</p>
          </div>
          
          <div class="content">
            <div class="timestamp">Received: ${timestamp}</div>
            
            <div class="field">
              <div class="field-label">👤 Customer Name:</div>
              <div class="field-value">${name}</div>
            </div>
            
            <div class="field">
              <div class="field-label">📧 Email Address:</div>
              <div class="field-value"><a href="mailto:${email}">${email}</a></div>
            </div>
            
            <div class="field">
              <div class="field-label">📋 Subject Category:</div>
              <div class="field-value">${subject}</div>
            </div>
            
            <div class="field">
              <div class="field-label">💬 Message:</div>
              <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>📱 Reply directly to this email to respond to the customer</p>
            <p><em>"And whoever fears Allah - He will make for him a way out" - Quran 65:2</em></p>
          </div>
        </div>
      </body>
      </html>
    `,
    replyTo: email
  };

  await transporter.sendMail(mailOptions);
};

// Disabled thank you email function
export const sendThankYouEmail = async (email: string, name: string) => {
  console.log(`Thank you email disabled for ${email} (${name})`);
  return Promise.resolve();
};