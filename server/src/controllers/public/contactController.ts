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

    const submission = new ContactSubmission({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      status: 'pending'
    });

    await submission.save();

    // Send thank you email to user (DISABLED)
    // try {
    //   await sendThankYouEmail(email, name);
    // } catch (emailError) {
    //   console.error('Failed to send thank you email:', emailError);
    // }

    // Log received data for debugging
    console.log('Contact form submission:', {
      name: name?.trim(),
      email: email?.trim(),
      subject: subject?.trim(),
      messageLength: message?.trim()?.length
    });

    // Send notification email to admin
    try {
      await sendContactNotification(name, email, subject, message);
      console.log('Admin notification email sent successfully');
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon, In Sha Allah.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to submit contact form'
    });
  }
};