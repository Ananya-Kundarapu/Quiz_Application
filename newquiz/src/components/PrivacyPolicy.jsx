import React from 'react';
import { useNavigate } from 'react-router-dom';

function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
   
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '50px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        fontFamily: 'Poppins, sans-serif',
        marginBottom: '40px',
        maxWidth: '900px',
        marginLeft: '200px',
        marginRight: 'auto',
      }}>
        <div style={{
          fontSize: '1.8rem',
          fontWeight: '600',
          marginBottom: '25px',
          color: '#1935CA',
        }}>
          <h4>Quizzify Privacy Policy</h4>
        </div>

        <p>
          At <strong>Quizzify</strong>, protecting your privacy and securing your personal information is central to our mission of making learning fun, safe, and effective. This policy explains how we collect, use, and protect your information.
        </p>

        <h3 style={{ color: '#1935CA' }}>Guiding Privacy Principles</h3>
        <ul>
          <li>We only collect personal information that is necessary to provide our services.</li>
          <li>We do not retain personal data longer than required to provide the intended services.</li>
          <li>We do not share personal information with third parties except to comply with legal obligations or provide services.</li>
          <li>We never sell, rent, or trade personal data.</li>
          <li>We provide clear options for users to control what information is public, private, indexed by third parties, or permanently deleted.</li>
        </ul>

        <h3 style={{ color: '#1935CA' }}>General Privacy Policy</h3>
        <p>
          This Privacy Policy applies to all users of Quizzify, including our website, apps, quizzes, lessons, practice tests, educational tools, integrations, and support services (collectively referred to as the “Services”).
        </p>
        <p>
          By using Quizzify Services, you agree to the collection, use, and storage of your personal data as described in this policy.
        </p>

        <h3 style={{ color: '#1935CA' }}>Protecting Students and Children</h3>
        <p>Quizzify prioritizes the safety and privacy of students and complies with applicable laws:</p>
        <ul>
          <li><strong>U.S.</strong> – COPPA and state privacy laws.</li>
          <li><strong>Canada</strong> – PIPEDA and provincial regulations.</li>
          <li><strong>EU</strong> – GDPR and relevant national laws.</li>
        </ul>
        <p>Safety measures include:</p>
        <ul>
          <li>No mandatory collection of names or contact info for students.</li>
          <li>Accounts are optional for younger users.</li>
          <li>No behavioral or targeted advertising for children.</li>
          <li>Students can join quizzes without signing up.</li>
          <li>Direct messaging between students is disabled.</li>
          <li>Proactive content filters and reporting mechanisms are in place.</li>
        </ul>

        <h3 style={{ color: '#1935CA' }}>Parental Rights and Consent</h3>
        <p>
          Parents or guardians can manage their child’s personal data under the age of consent (typically under 13 in the U.S.):
        </p>
        <ul>
          <li>Review, modify, or delete their child’s information.</li>
          <li>Provide or revoke consent for data collection.</li>
          <li>Only necessary data for providing the service is collected (e.g., parent email, child first name).</li>
          <li>Account deletion prevents further data collection.</li>
        </ul>

        <h3 style={{ color: '#1935CA' }}>Data Collection and Use</h3>
        <p>
          Quizzify may collect information such as account info (name, email, phone, country), profile pictures, quiz participation, progress, and device/browser info.
        </p>
        <p>We use this data to:</p>
        <ul>
          <li>Provide and improve our Services</li>
          <li>Personalize learning experiences</li>
          <li>Ensure security and prevent abuse</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h3 style={{ color: '#1935CA' }}>User Control and Transparency</h3>
        <p>Users can:</p>
        <ul>
          <li>View and edit account information</li>
          <li>Upload or remove profile pictures</li>
          <li>Delete accounts and personal data</li>
          <li>Control visibility of activity or profile</li>
          <li>Access quiz results and history</li>
        </ul>

        <h3 style={{ color: '#1935CA' }}>Security</h3>
        <p>
          We implement technical and organizational measures to protect user data, including encryption, secure authentication, and restricted access.
        </p>

        <h3 style={{ color: '#1935CA' }}>Changes to This Policy</h3>
        <p>
          Quizzify may update this policy to reflect changes in services or legal requirements. Users are encouraged to review the Privacy Policy periodically.
        </p>

        <h3 style={{ color: '#1935CA' }}>Contact</h3>
        <p>
          For privacy questions or requests, contact: <br />
          <strong>Email:</strong> <a href="mailto:ananyakundarapu@gmail.com">ananyakundarapu@gmail.com</a>
        </p>
        
        <div style={{ marginTop: '20px', textAlign: 'left' }}>
          <button
            onClick={() => navigate('/settings')}
            style={{
              backgroundColor: '#1935CA',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
              transition: 'background-color 0.3s ease',
            }}
          >
            Back to Settings
          </button>
        </div>
      </div>
  );
}

export default PrivacyPolicy;