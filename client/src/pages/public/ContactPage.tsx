import React, { useState } from 'react';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const { contactAPI } = await import('../../services/contactApi');
      const response = await contactAPI.submitContact(formData);
      
      if (response.success) {
        setSubmitMessage(response.message || 'Thank you for your message! We will get back to you soon, In Sha Allah.');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitMessage('Sorry, there was an error sending your message. Please try again.');
      }
    } catch (error) {
      setSubmitMessage('Sorry, there was an error sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <header className="text-center mb-2">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you. Your feedback helps us build the app based on your needs and requested features to keep our community organized and stay together.</p>
      </header>

      <main>
        <section className="section">
          <div className="contact-container">
            <div className="contact-info-section">
              <h2>Get in Touch</h2>
              
              <div className="contact-info">
                <div className="contact-item">
                  <h3>📧 Email Support</h3>
                  <p>support@islamicprayertools.com</p>
                  <small>We typically respond within 24 hours</small>
                </div>

                <div className="contact-item">
                  <h3>🕐 Response Time</h3>
                  <p>24-48 hours</p>
                  <small>Monday to Friday (excluding Islamic holidays)</small>
                </div>

                <div className="contact-item">
                  <h3>🌍 Community</h3>
                  <p>Join our community discussions</p>
                  <small>Share feedback and connect with other users</small>
                </div>
              </div>

              <div className="faq-section">
                <h3>Frequently Asked Questions</h3>
                <div className="faq-item">
                  <h4>How accurate are the prayer times?</h4>
                  <p>Our prayer times are calculated using the Aladhan API with multiple calculation methods to ensure accuracy for your location.</p>
                </div>
                
                <div className="faq-item">
                  <h4>Can I use this app offline?</h4>
                  <p>Some features like prayer times and Qibla direction require internet connection for initial setup, but basic functionality works offline.</p>
                </div>
                
                <div className="faq-item">
                  <h4>How do I report incorrect mosque information?</h4>
                  <p>Please use the contact form with the subject "Content Suggestion" and provide details about the mosque that needs correction.</p>
                </div>
              </div>
            </div>

            <div className="contact-form-section">
              <h2>Send us a Message</h2>
              
              {submitMessage && (
                <div className={`message ${submitMessage.includes('Thank you') ? 'success' : 'error'}`}>
                  {submitMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Bug Report</option>
                    <option value="content">Content Suggestion</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    placeholder="Please describe your inquiry or feedback in detail..."
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>


          </div>
        </section>

        <section className="section">
          <div className="islamic-note text-center">
            <p>
              <em>"And whoever fears Allah - He will make for him a way out"</em>
              <br />
              <strong>- Quran 65:2</strong>
            </p>
            <p>May Allah bless you and guide you in your spiritual journey.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ContactPage;