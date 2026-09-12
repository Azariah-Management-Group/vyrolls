'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, X, Camera, Check, MapPin, Search, Bell, ChevronDown, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './add_vehicle.module.css';

export default function AddVehiclePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    trim_level: '',
    body_type: 'SUV',
    transmission: 'Automatic',
    mileage: '',
    exterior_color: '',
    interior_color: '',
    fuel_type: 'Gasoline',
    vin: '',
    condition_state: 'Like New',
    price: '',
    listing_type: 'For Sale',
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConditionSelect = (condition: string) => {
    setFormData({ ...formData, condition_state: condition });
  };

  const handleListingTypeSelect = (type: string) => {
    setFormData({ ...formData, listing_type: type });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages([...images, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const uploadToCloudinary = async (file: File) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
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

  const handleSubmit = async () => {
    setLoading(true);
    const toastId = toast.loading('Publishing your vehicle...');
    
    try {
      // Upload all images
      const gallery_urls = await Promise.all(images.map(img => uploadToCloudinary(img)));
      
      const userId = localStorage.getItem('user_id');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      
      const res = await fetch(`${API_URL}/add_vehicle_v2.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          ...formData,
          gallery_urls
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to publish vehicle');
      }

      toast.success('Vehicle published successfully!', { id: toastId });
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'An error occurred', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = ['Vehicle Details', 'Photos & Media', 'Pricing & Listing', 'Trade Options', 'Review & Publish'];
    
    return (
      <div className={styles.stepper}>
        <div className={styles.stepLine}></div>
        <div className={styles.stepLineActive} style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}></div>
        {steps.map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = step === stepNum;
          const isCompleted = step > stepNum;
          return (
            <div key={idx} className={`${styles.step} ${isActive ? styles.stepActive : ''} ${isCompleted ? styles.stepCompleted : ''}`}>
              <div className={styles.stepCircle}>
                {isCompleted ? <Check size={16} /> : stepNum}
              </div>
              <div className={styles.stepLabel}>{label}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid #e0e0e0' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h2 style={{margin: 0, fontWeight: 700}}>AUTORA</h2>
            <nav style={{display: 'flex', gap: '20px', fontSize: '0.9rem', color: '#666', fontWeight: 500}}>
              <span>Vehicles</span>
              <span>Customize</span>
              <span>Services</span>
              <span>Marketplace</span>
              <span style={{color: 'var(--gold)', borderBottom: '2px solid var(--gold)'}}>Garage</span>
              <span>Membership</span>
              <span>About</span>
            </nav>
         </div>
      </header>

      <div className={styles.headerSection}>
        <h1>Add Your Vehicle</h1>
        <p>Reach a global community of enthusiasts. Sell, trade, or exchange with confidence.</p>
        {renderStepIndicator()}
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.leftColumn}>
          {step === 1 && (
            <div className={styles.formSection}>
              <div className={styles.sectionTitle}>
                1. Vehicle Details
                <button className={styles.btnSecondary} style={{padding: '6px 12px', fontSize: '0.8rem'}}>Save Draft</button>
              </div>
              <p className={styles.sectionSubtitle}>Tell us about your vehicle.</p>
              
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Make <span>*</span></label>
                  <select name="make" className={styles.select} value={formData.make} onChange={handleChange}>
                    <option value="">Select Make</option>
                    <option value="Land Rover">Land Rover</option>
                    <option value="Porsche">Porsche</option>
                    <option value="Mercedes-Benz">Mercedes-Benz</option>
                    <option value="BMW">BMW</option>
                    <option value="Audi">Audi</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Model <span>*</span></label>
                  <input type="text" name="model" className={styles.input} placeholder="e.g. Range Rover" value={formData.model} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Year <span>*</span></label>
                  <input type="number" name="year" className={styles.input} placeholder="2023" value={formData.year} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Trim <span>*</span></label>
                  <input type="text" name="trim_level" className={styles.input} placeholder="Autobiography" value={formData.trim_level} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Body Type <span>*</span></label>
                  <select name="body_type" className={styles.select} value={formData.body_type} onChange={handleChange}>
                    <option value="SUV">SUV</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Coupe">Coupe</option>
                    <option value="Convertible">Convertible</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Transmission <span>*</span></label>
                  <select name="transmission" className={styles.select} value={formData.transmission} onChange={handleChange}>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Mileage <span>*</span></label>
                  <input type="text" name="mileage" className={styles.input} placeholder="12,500 mi" value={formData.mileage} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Exterior Color <span>*</span></label>
                  <input type="text" name="exterior_color" className={styles.input} placeholder="Santorini Black" value={formData.exterior_color} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Interior Color</label>
                  <input type="text" name="interior_color" className={styles.input} placeholder="Ebony / Perlino" value={formData.interior_color} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Fuel Type</label>
                  <select name="fuel_type" className={styles.select} value={formData.fuel_type} onChange={handleChange}>
                    <option value="Gasoline">Gasoline</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>VIN (Optional)</label>
                  <input type="text" name="vin" className={styles.input} placeholder="Enter VIN" value={formData.vin} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Condition <span>*</span></label>
                  <div className={styles.conditionGrid}>
                    {['New', 'Like New', 'Excellent', 'Good'].map(cond => (
                      <button 
                        key={cond}
                        className={`${styles.conditionBtn} ${formData.condition_state === cond ? styles.conditionBtnActive : ''}`}
                        onClick={() => handleConditionSelect(cond)}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.actionButtons}>
                <div></div>
                <button className={styles.btnPrimary} onClick={() => setStep(2)}>Next Step &rarr;</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.formSection}>
              <div className={styles.sectionTitle}>
                2. Photos & Media
              </div>
              <p className={styles.sectionSubtitle}>High-quality photos get more attention.</p>
              
              <label className={styles.uploadArea}>
                <Upload size={32} className={styles.uploadIcon} />
                <div className={styles.uploadText}>Upload Photos</div>
                <div className={styles.uploadSubtext}>Drag & drop or click to upload<br/>Add up to 20 photos (JPG, PNG, WebP)</div>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{display: 'none'}} />
              </label>

              {imagePreviews.length > 0 && (
                <div className={styles.imageGrid}>
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className={styles.imagePreviewCard}>
                      <img src={preview} alt={`Preview ${idx}`} />
                      <button className={styles.removeImageBtn} onClick={() => removeImage(idx)}><X size={14}/></button>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.actionButtons}>
                <button className={styles.btnSecondary} onClick={() => setStep(1)}>Back</button>
                <button className={styles.btnPrimary} onClick={() => setStep(3)}>Next Step &rarr;</button>
              </div>
            </div>
          )}

          {step >= 3 && step < 5 && (
            <div className={styles.formSection}>
              <div className={styles.sectionTitle}>
                3. Pricing & Listing
              </div>
              <p className={styles.sectionSubtitle}>Set your price and listing type.</p>
              
              <div className={styles.formGroup} style={{marginBottom: '20px'}}>
                <label>Price ($) <span>*</span></label>
                <input type="number" name="price" className={styles.input} placeholder="134000" value={formData.price} onChange={handleChange} />
              </div>

              <div className={styles.formGroup}>
                <label>Listing Type <span>*</span></label>
                <div className={styles.conditionGrid}>
                  {['For Sale', 'Accept Trade/Exchange', 'List for Both'].map(type => (
                    <button 
                      key={type}
                      className={`${styles.conditionBtn} ${formData.listing_type === type ? styles.conditionBtnActive : ''}`}
                      onClick={() => handleListingTypeSelect(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.actionButtons}>
                <button className={styles.btnSecondary} onClick={() => setStep(2)}>Back</button>
                <button className={styles.btnPrimary} onClick={() => setStep(5)}>Next Step &rarr;</button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className={styles.formSection}>
              <div className={styles.sectionTitle}>
                5. Review & Publish
              </div>
              <p className={styles.sectionSubtitle}>Review your details before going live.</p>
              
              <div style={{background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px'}}>
                <p><strong>Vehicle:</strong> {formData.year} {formData.make} {formData.model} {formData.trim_level}</p>
                <p><strong>Price:</strong> ${formData.price}</p>
                <p><strong>Listing Type:</strong> {formData.listing_type}</p>
                <p><strong>Images:</strong> {images.length} uploaded</p>
              </div>

              <div className={styles.actionButtons}>
                <button className={styles.btnSecondary} onClick={() => setStep(3)}>Back</button>
                <button className={styles.btnPrimary} onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Publishing...' : 'Publish Listing'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <h3>Listing Preview</h3>
              <p>This is how your vehicle will appear on Autora.</p>
            </div>
            {imagePreviews.length > 0 ? (
              <img src={imagePreviews[0]} alt="Preview" className={styles.previewImage} />
            ) : (
              <div className={styles.previewImage} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888'}}>No image</div>
            )}
            <div className={styles.previewContent}>
              <div className={styles.previewTags}>
                <span className={`${styles.tag} ${styles.tagGold}`} style={{background: '#fff9e6', color: '#b5952f'}}>{formData.listing_type}</span>
                <span className={styles.tagGreen}>Verified Seller</span>
              </div>
              <h4 className={styles.previewTitle}>
                {formData.year || '2023'} {formData.make || 'Land Rover'} {formData.model || 'Range Rover'} <br/>{formData.trim_level || 'Autobiography'}
              </h4>
              <p className={styles.previewPrice}>${formData.price || '134,000'}</p>
              
              <div className={styles.previewSpecs}>
                <div className={styles.specItem}><span style={{fontWeight: 600}}>Mi:</span> {formData.mileage || '12,500'}</div>
                <div className={styles.specItem}><span style={{fontWeight: 600}}>Trans:</span> {formData.transmission}</div>
                <div className={styles.specItem}><span style={{fontWeight: 600}}>Loc:</span> Los Angeles, CA</div>
                <div className={styles.specItem}><span style={{fontWeight: 600}}>Fuel:</span> {formData.fuel_type}</div>
              </div>
            </div>
          </div>

          <div className={styles.tipsCard}>
            <div className={styles.tipsTitle}><Sparkles size={20} /> Increase Your Visibility</div>
            <ul className={styles.tipsList}>
              <li><Check size={16} /> Add at least 10 high-quality photos</li>
              <li><Check size={16} /> Include a detailed description</li>
              <li><Check size={16} /> Set a competitive price</li>
              <li><Check size={16} /> Consider offering trade options</li>
              <li><Check size={16} /> Get verified to build trust</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
