import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { useAuth } from '../Context/AuthContext';
import '../styles/Registration.css';

function Registration() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const password = location.state?.password || '';

  const { login } = useAuth();

  const [fName, setFName] = useState('');
  const [lName, setLName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [role, setRole] = useState('');
  const [branch, setBranch] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [profilePic, setProfilePic] = useState('/profile.png');
  const [croppedBlob, setCroppedBlob] = useState(null); // 🌟 Store blob for deferred upload

  const [selectedImage, setSelectedImage] = useState(null);
  const [cropping, setCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const fileInputRef = useRef(null);
  const fullName = `${fName} ${lName}`;

  const onCropComplete = (_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
        setCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmCrop = async () => {
    try {
      const blob = await getCroppedImg(selectedImage, croppedAreaPixels);
      const previewURL = URL.createObjectURL(blob);
      setProfilePic(previewURL);
      setCroppedBlob(blob); // ✅ store blob for later upload
      setCropping(false);
      setSelectedImage(null);
    } catch (err) {
      alert('Error cropping image');
    }
  };

  const handleProfileClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) return alert('Please select a role');
    if (role === 'Student' && !branch) return alert('Please select a branch');

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fName,
          lName,
          email,
          password,
          phone,
          country,
          role,
          profilePic, // this will be updated after upload
          branch: role === 'Student' ? branch : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      // ✅ Upload profile image AFTER registration
      if (croppedBlob) {
        try {
          const formData = new FormData();
          formData.append('profilePic', croppedBlob);

          const uploadRes = await fetch('http://localhost:5000/api/auth/upload-profile-pic', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
            body: formData,
          });

          const uploadData = await uploadRes.json();

          if (uploadRes.ok && uploadData.url) {
            const fullURL = uploadData.url.startsWith('http')
              ? uploadData.url
              : `http://localhost:5000/${uploadData.url.replace(/^\/+/, '')}`;
            data.user.profilePic = fullURL;
            setProfilePic(fullURL);
          }
        } catch (err) {
          console.warn('Image upload failed', err);
        }
      }

      // ✅ Finalize login with updated user
      login(data.user, data.token);

      localStorage.setItem('fullName', fullName);
      localStorage.setItem('profileImage', data.user.profilePic || profilePic);
      localStorage.setItem('user', JSON.stringify(data.user));

      setShowWelcome(true);
      setTimeout(() => {
        navigate(role === 'Admin' ? '/admin-profile' : '/profile', {
          state: { name: fullName },
        });
      }, 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  if (showWelcome) {
    return (
      <div className="white-bg animation-screen">
        <div className="welcome-msg">
          <h1>Welcome</h1>
          <span>{fullName}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="reg-container">
      <form className="reg-form" onSubmit={handleSubmit}>
        <h2>Complete Your Profile</h2>

        {cropping ? (
          <>
            <div className="crop-container">
              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="crop-actions">
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(e.target.value)}
              />
              <button type="button" className="confirm-crop-btn" onClick={handleConfirmCrop}>
                Confirm Crop
              </button>
            </div>
          </>
        ) : (
          <div className="profile-pic-section" onClick={handleProfileClick}>
            <img src={profilePic} alt="Profile" className="profile-img" />
            <p>Tap to change</p>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        )}

        <div className="role-selection">
          <h3>Select Your Role</h3>
          <div className="roles">
            <div
              className={`role-option ${role === 'Student' ? 'selected' : ''}`}
              onClick={() => setRole('Student')}
            >
              <img src="/Student.jpg" alt="Student" />
              Student
            </div>
            <div
              className={`role-option ${role === 'Admin' ? 'selected' : ''}`}
              onClick={() => setRole('Admin')}
            >
              <img src="/admin.png" alt="Admin" />
              Admin
            </div>
          </div>
        </div>

        <div className="name-fields">
          <input
            type="text"
            placeholder="First Name"
            value={fName}
            onChange={(e) => setFName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lName}
            onChange={(e) => setLName(e.target.value)}
            required
          />
        </div>

        {role === 'Student' && (
          <div className="branch-field">
            <label htmlFor="branch">Select Branch</label>
            <select
              id="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              required
            >
              <option value="">-- Select Branch --</option>
              <option value="CSE">CSE</option>
              <option value="CSM">CSM</option>
              <option value="CSO">CSO</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="ME">ME</option>
              <option value="CE">CE</option>
              <option value="EE">EE</option>
            </select>
          </div>
        )}

        <label className="field-label">Email</label>
        <input type="email" value={email} readOnly className="readonly-email" />

        <div className="phone-field">
          <select value={country} onChange={(e) => setCountry(e.target.value)} required>
            <option value="">Country</option>
            <option value="+91">India +91</option>
            <option value="+1">US +1</option>
            <option value="+44">GB +44</option>
            <option value="+61">AU +61</option>
          </select>
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <button className="submit-btn" type="submit">Continue</button>
      </form>
    </div>
  );
}

export default Registration;
