'use client';

import React, { useState } from 'react';
import styles from './dashboard.module.css';
import { X, Upload, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: any;
  userId: number;
  onSuccess: () => void;
}

export default function EditProfileModal({ isOpen, onClose, profileData, userId, onSuccess }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    bio: profileData?.bio || '',
    gender: profileData?.gender || '',
    address: profileData?.address || '',
    city: profileData?.city || '',
    county: profileData?.county || '',
    town: profileData?.town || '',
    postal_code: profileData?.postal_code || ''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(profileData?.avatar_url || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const uploadToCloudinary = async (file: File) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      // Fallback: If Cloudinary isn't configured, convert to Base64 string so it just works
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let avatar_url = profileData?.avatar_url;

      if (avatarFile) {
        avatar_url = await uploadToCloudinary(avatarFile);
      }

      // We don't have location field in the form directly, we construct it or leave it
      const location = [formData.city, formData.county].filter(Boolean).join(', ');

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${API_URL}/update_profile.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          avatar_url,
          location,
          ...formData
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      toast.success('Profile updated successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Edit Profile</h2>
          <button onClick={onClose} className={styles.closeButton}><X size={24} /></button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          
          <div className={styles.formGroup}>
            <label>Profile Picture</label>
            <div className={styles.avatarUpload}>
              <label htmlFor="avatar-upload" style={{ cursor: 'pointer', position: 'relative' }}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className={styles.avatarPreview} />
                ) : (
                  <div className={styles.avatarPlaceholder}><Upload size={24} /></div>
                )}
                <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--gold)', borderRadius: '50%', padding: '4px', color: 'black' }}>
                  <Camera size={14} />
                </div>
              </label>
              <input id="avatar-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} placeholder="Tell us about yourself..." />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Postal Code</label>
              <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} placeholder="e.g. 90210" />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Street address" />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Town</label>
              <input type="text" name="town" value={formData.town} onChange={handleChange} placeholder="Town" />
            </div>
            <div className={styles.formGroup}>
              <label>City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" />
            </div>
            <div className={styles.formGroup}>
              <label>County</label>
              <input type="text" name="county" value={formData.county} onChange={handleChange} placeholder="County / State" />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.cancelButton} disabled={loading}>Cancel</button>
            <button type="submit" className={styles.saveButton} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
