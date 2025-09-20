import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Settings.css';
import { useAuth } from '../Context/AuthContext';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
function Settings() {
const { user, loading: authLoading, setUser } = useAuth();
const [profileImage, setProfileImage] = useState('/profile.png');
const [pushNotifications, setPushNotifications] = useState(false);
const [language, setLanguage] = useState('English');
const [soundEffects, setSoundEffects] = useState(false);
const [showPasswordPopup, setShowPasswordPopup] = useState(false);
const [showAccountPopup, setShowAccountPopup] = useState(false);
const [currentPassword, setCurrentPassword] = useState('');
const [showPassword, setShowPassword] = useState(false);
const [showNotification, setShowNotification] = useState(false);
const [imageToCrop, setImageToCrop] = useState(null);
const [selectedImage, setSelectedImage] = useState(null);
const [cropping, setCropping] = useState(false);
const [crop, setCrop] = useState({ x: 0, y: 0 });
const [zoom, setZoom] = useState(1);
const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
const [croppedBlob, setCroppedBlob] = useState(null);
const [accountDetails, setAccountDetails] = useState({
  firstName: '',
  lastName: '',
  phone: '', // Changed to phone
  country: '',
  password: ''
});
const [error, setError] = useState(''); // New state for error messages
const navigate = useNavigate();

useEffect(() => {
  if (!authLoading && user) {
    setAccountDetails({
      firstName: user.fName || '',
      lastName: user.lName || '',
      phone: user.phone || '',
      country: user.country || '',
      password: ''
    });
if (user.profilePic) {
  setProfileImage(`http://localhost:5000${user.profilePic}?t=${Date.now()}`);
} else {
  setProfileImage(defaultImage + `?t=${Date.now()}`);
}
 }
}, [user, authLoading]);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

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

const handleCropAndUpload = async () => {
  if (!user?._id || !croppedAreaPixels || !selectedImage) return;

  try {
    const blob = await getCroppedImg(selectedImage, croppedAreaPixels);
    const formData = new FormData();
    formData.append('profilePic', blob, 'profile.jpg');

const res = await fetch(`http://localhost:5000/api/auth/upload-profile-pic`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`, // keep only this
  },
  body: formData,
});

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to upload profile picture');
    }

const data = await res.json();
const newProfilePicUrl = `http://localhost:5000${data.profilePic}?t=${Date.now()}`;
setProfileImage(newProfilePicUrl);
setUser(prev => ({ ...prev, profilePic: data.profilePic }));

    setCropping(false);
    setSelectedImage(null);
    setError('');
    setShowNotification(true);
  } catch (err) {
    console.error('❌ Error uploading profile picture:', err.message);
    setError(err.message);
  }
};

const handleRemoveProfilePic = async () => {
  if (!user?._id) return;

  try {
    const res = await fetch(`http://localhost:5000/api/auth/remove-profile-pic`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to remove profile picture');
    }

    const data = await res.json();
    // ✅ Important: use returned profilePic from backend
    setProfileImage(`http://localhost:5000${data.profilePic}?t=${Date.now()}`);
    setUser(prev => ({ ...prev, profilePic: data.profilePic }));
    setError('');
    setShowNotification(true);
  } catch (err) {
    console.error('❌ Error removing profile picture:', err.message);
    setError(err.message);
  }
};

  const handlePasswordConfirm = () => {
    if (currentPassword) {
      setShowPasswordPopup(false);
      setShowAccountPopup(true);
      setCurrentPassword('');
    }
  };

const handleAccountDetailsChange = (e) => {
  const { name, value } = e.target;

  if (name === 'phone') {
    const onlyDigits = /^[0-9]*$/;

    // Allow only digits
    if (!onlyDigits.test(value)) {
      setError('Invalid phone number: only digits allowed.');
      return;
    }
    if (value.length > 10) {
      setError('Phone number cannot exceed 10 digits.');
      return;
    }
    setError('');
    setAccountDetails((prev) => ({ ...prev, phone: value }));
  } else {
    setAccountDetails((prev) => ({ ...prev, [name]: value }));
  }
};

const handleSaveChanges = async () => {
  setError('');

  const { firstName, lastName, phone, country, password } = accountDetails;

  if (phone && phone.length !== 10) {
    setError('Phone number must be exactly 10 digits long.');
    return;
  }

  try {
const res = await fetch(`http://localhost:5000/api/auth/update`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({
    fName: firstName,
    lName: lastName,
    phone,
    country,
    password: password || undefined
  })
});

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to update user information');
    }

    const updatedUser = await res.json();
    setUser(updatedUser); // update context immediately
    setShowAccountPopup(false);
    setShowNotification(true);
    console.log('✅ User updated successfully!');
    navigate('/profile');  
  } catch (error) {
    console.error('❌ Error updating user:', error.message);
    setError(error.message);
  }
};

if (authLoading) return <div>Loading…</div>;
if (!user) return <div>Please sign in to edit settings.</div>;

return (
  <div className="settings">
      <h2>Settings</h2>

      {showNotification && (
        <div className="notification" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          zIndex: 1000
        }}>
          Saved Successfully!
        </div>
      )}

      {showPasswordPopup && (
        <div className="popup-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="popup" style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            width: '400px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Enter Current Password</h3>
              <button onClick={() => setShowPasswordPopup(false)} style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer'
              }}>×</button>
            </div>
            <p style={{ margin: '10px 0' }}>Enter your password to view/edit account settings</p>
            <input
              type={showPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Password"
              style={{
                width: '100%',
                padding: '10px',
                margin: '10px 0',
                border: '1px solid #ccc',
                borderRadius: '5px'
              }}
            />
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <input
      type="checkbox"
      id="show-password"
      checked={showPassword}
      onChange={() => setShowPassword(!showPassword)}
      style={{ marginLeft: '10px', marginRight: '8px', marginTop: '20px' }}
    />
    <label htmlFor="show-password" style={{ whiteSpace: 'nowrap' }}>Show Password</label>
  </div>
</div>
            <button onClick={handlePasswordConfirm} style={{
              backgroundColor: '#1935CA',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              width: '100%'
            }}>
              Confirm
            </button>
          </div>
        </div>
      )}

      {showAccountPopup && (
        <div className="popup-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="popup" style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            width: '500px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Edit Account Information</h3>
              <button onClick={() => setShowAccountPopup(false)} style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer'
              }}>×</button>
            </div>
            <div style={{ margin: '20px 0' }}>
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={accountDetails.firstName}
                onChange={handleAccountDetailsChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  margin: '5px 0 15px',
                  border: '1px solid #ccc',
                  borderRadius: '5px'
                }}
              />
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={accountDetails.lastName}
                onChange={handleAccountDetailsChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  margin: '5px 0 15px',
                  border: '1px solid #ccc',
                  borderRadius: '5px'
                }}
              />
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={accountDetails.phone}
                onChange={handleAccountDetailsChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  margin: '5px 0 15px',
                  border: '1px solid #ccc',
                  borderRadius: '5px'
                }}
              />
{error && (
  <p style={{ color: '#e57373', fontSize: '12px', marginTop: '-4px' }}>
    {error}
  </p>
)}
<label>Country</label>
<select
  name="country"
  value={accountDetails.country}
  onChange={handleAccountDetailsChange}
  style={{
    width: '100%',
    padding: '10px',
    margin: '5px 0 15px',
    border: '1px solid #ccc',
    borderRadius: '5px'
  }}
>
  <option value="">Select Country</option>
  <option value="(+91) India">(+91) India</option>
  <option value="(+1) United States">(+1) United States</option>
  <option value="(+44) United Kingdom">(+44) United Kingdom</option>
  <option value="(+61) Australia">(+61) Australia</option>
</select>
              <label>New Password (optional)</label>
              <input
                type="password"
                name="password"
                value={accountDetails.password}
                onChange={handleAccountDetailsChange}
                placeholder="Enter new password"
                style={{
                  width: '100%',
                  padding: '10px',
                  margin: '5px 0 15px',
                  border: '1px solid #ccc',
                  borderRadius: '5px'
                }}
              />
            </div>
            <button onClick={handleSaveChanges} style={{
              backgroundColor: '#1935CA',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              width: '100%'
            }}>
              Save Changes
            </button>
          </div>
        </div>
      )}

      <div className="setting-section">
        <h3>Account</h3>

        <div className="setting profile-picture-setting">
          <div className="profile-text">
            <label>Profile Picture</label>
            <p>Change your profile photo</p>
          </div>
          <div className="profile-image-container-vertical">
<img
  src={profileImage}
  alt="Profile"
  className="profile-image-large"
/>

<div className="profile-actions">
  <label htmlFor="file-upload" className="upload-button-custom">
    {profileImage.includes('profile.png') ? 'Choose Photo' : 'Edit'}
  </label>
{!profileImage.includes('profile.png') && (
  <button
    type="button"
    onClick={handleRemoveProfilePic}
    className="profile-link-button"
  >
    Remove
  </button>
)}
  <input
    type="file"
    id="file-upload"
    accept="image/*"
    onChange={handleFileChange}
    className="upload-button-hidden"
  />
</div>
</div>
        </div>

        <div className="setting">
          <div>
            <label>Account Information</label>
            <p>Edit your personal information</p>
          </div>
          <button onClick={() => setShowPasswordPopup(true)}>Edit</button>
        </div>
      </div>

      <div className="setting-section">
        <h3>Notifications</h3>
        <div className="setting">
          <div>
            <label>Push Notifications</label>
            <p>Receive reminders about quizzes</p>
          </div>
          <div className="toggle">
            <input
              type="checkbox"
              id="push-notifications"
              checked={pushNotifications}
              onChange={() => setPushNotifications(!pushNotifications)}
            />
            <label htmlFor="push-notifications" className="toggle-label" />
          </div>
        </div>
      </div>

      <div className="setting-section">
        <h3>Preferences</h3>

        <div className="setting">
          <div>
            <label>Sound Effects</label>
            <p>Enable/disable quiz sounds</p>
          </div>
          <div className="toggle">
            <input
              type="checkbox"
              id="sound-effects"
              checked={soundEffects}
              onChange={() => setSoundEffects(!soundEffects)}
            />
            <label htmlFor="sound-effects" className="toggle-label" />
          </div>
        </div>
      </div>

      <div className="setting-section">
        <h3>Privacy</h3>
        <div className="setting">
          <div>
            <label>Privacy Policy</label>
            <p>Read our privacy policy</p>
          </div>
          <button>View</button>
        </div>
        <div className="setting">
          <div>
            <label>Terms of Service</label>
            <p>Read our terms of service</p>
          </div>
          <button>View</button>
        </div>
      </div>
{cropping && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000
  }}>
    <div style={{
      background: '#fff',
      padding: '20px',
      borderRadius: '12px',
      width: '400px',
      maxWidth: '90%',
      textAlign: 'center'
    }}>
      <h3>Adjust your photo</h3>
      <div style={{ position: 'relative', width: '100%', height: '300px', background: '#333' }}>
        <Cropper
          image={selectedImage}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          circularCrop
        />
      </div>
      <input
        type="range"
        min={1}
        max={3}
        step={0.1}
        value={zoom}
        onChange={(e) => setZoom(Number(e.target.value))}
        style={{ width: '100%', margin: '15px 0' }}
      />
      <button onClick={handleCropAndUpload} style={{ marginRight: '10px' }}>Confirm</button>
      <button onClick={() => setCropping(false)}>Cancel</button>
    </div>
  </div>
)}
    </div>
  );
}
export default Settings;