import { Request, Response } from 'express';
import ContactSubmission from '../../models/ContactSubmission';
import { sendThankYouEmail, sendContactNotification } from '../../services/emailService';

export const submitContact = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    // Input validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    const submission = new ContactSubmission({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      status: 'pending'
    });

    await submission.save();
    console.log(`✅ Contact submission saved: ${name} - ${subject}`);

    // Send emails asynchronously (don't wait for them)
    Promise.all([
      sendThankYouEmail(email, name),
      sendContactNotification(name, email, subject, message)
    ]).catch(emailError => {
      console.error('❌ Email sending failed:', emailError);
    });

    // Return response immediately
    return res.status(201).json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon, In Sha Allah.'
    });
  } catch (error) {
    console.error('❌ Contact submission error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to submit contact form'
    });
  }
};