import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="container">
      <header className="text-center mb-2">
        <h1>Terms of Service</h1>
        <p>Last updated: December 2024</p>
      </header>

      <main>
        <section className="section">
          <div className="legal-content">
            <h2>Acceptance of Terms</h2>
            <p>
              By accessing and using Islamic Prayer Tools, you accept and agree to be bound 
              by the terms and provision of this agreement.
            </p>

            <h2>Use License</h2>
            <p>
              Permission is granted to temporarily use Islamic Prayer Tools for personal, 
              non-commercial transitory viewing only. This is the grant of a license, not a 
              transfer of title, and under this license you may not:
            </p>
            <ul>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained in the service</li>
              <li>Remove any copyright or other proprietary notations</li>
            </ul>

            <h2>Service Availability</h2>
            <p>
              We strive to provide accurate prayer times, Qibla directions, and mosque information. 
              However, we cannot guarantee 100% accuracy and recommend verifying with local Islamic 
              authorities when precision is critical.
            </p>

            <h2>User Responsibilities</h2>
            <p>Users are responsible for:</p>
            <ul>
              <li>Providing accurate location information when requested</li>
              <li>Using the service in accordance with Islamic principles</li>
              <li>Respecting the intellectual property rights of the service</li>
              <li>Not attempting to disrupt or damage the service</li>
            </ul>

            <h2>Content Accuracy</h2>
            <p>
              While we strive for accuracy in Quranic verses, Hadith, and Islamic content, 
              users should consult qualified Islamic scholars for religious guidance and 
              verification of religious content.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              Islamic Prayer Tools shall not be liable for any damages arising from the use 
              or inability to use the service, including but not limited to direct, indirect, 
              incidental, punitive, and consequential damages.
            </p>

            <h2>Privacy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also 
              governs your use of the service, to understand our practices.
            </p>

            <h2>Modifications</h2>
            <p>
              Islamic Prayer Tools may revise these terms of service at any time without notice. 
              By using this service, you are agreeing to be bound by the then current version 
              of these terms of service.
            </p>

            <h2>Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with 
              applicable laws and you irrevocably submit to the exclusive jurisdiction of 
              the courts in that state or location.
            </p>

            <h2>Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
              <br />
              Email: <a href="mailto:legal@islamicprayertools.com">legal@islamicprayertools.com</a>
            </p>
          </div>
        </section>

        <section className="section">
          <div className="islamic-note">
            <p>
              <em>"O you who believe! Fulfill your contracts"</em>
              <br />
              <strong>- Quran 5:1</strong>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TermsPage;