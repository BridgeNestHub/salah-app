import React from 'react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="container">
      <header className="text-center mb-2">
        <h1>Privacy Policy</h1>
        <p>Last updated: December 2024</p>
      </header>

      <main>
        <section className="section">
          <div className="legal-content">
            <h2>Information We Collect</h2>
            <p>
              Islamic Prayer Tools collects minimal information necessary to provide our services:
            </p>
            <ul>
              <li><strong>Location Data:</strong> Used only for prayer times and Qibla direction calculations</li>
              <li><strong>Device Information:</strong> Compass and orientation data for Qibla compass functionality</li>
              <li><strong>Contact Information:</strong> When you contact us through our forms</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>Your information is used exclusively to:</p>
            <ul>
              <li>Calculate accurate prayer times for your location</li>
              <li>Determine Qibla direction</li>
              <li>Find nearby mosques</li>
              <li>Respond to your inquiries and support requests</li>
            </ul>

            <h2>Data Storage and Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. 
              Location data is processed locally on your device when possible and is not stored 
              on our servers unless necessary for service functionality.
            </p>

            <h2>Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul>
              <li><strong>Google Maps API:</strong> For mosque locations and mapping services</li>
              <li><strong>Aladhan API:</strong> For prayer time calculations</li>
            </ul>

            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for location access</li>
            </ul>

            <h2>Children's Privacy</h2>
            <p>
              Our service is suitable for all ages. We do not knowingly collect personal 
              information from children under 13 without parental consent.
            </p>

            <h2>Changes to Privacy Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify users 
              of any material changes by posting the new policy on this page.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:
              <br />
              Email: <a href="mailto:privacy@islamicprayertools.com">privacy@islamicprayertools.com</a>
            </p>
          </div>
        </section>

        <section className="section">
          <div className="islamic-note">
            <p>
              <em>"And Allah is ever, over all things, Guardian"</em>
              <br />
              <strong>- Quran 33:52</strong>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PrivacyPage;