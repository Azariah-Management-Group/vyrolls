'use client';

import { useEffect, useState } from 'react';
import { Shield, MapPin, Camera, User, Car, FileText, ShoppingBag, Bookmark, Calendar, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from '../dashboard/dashboard.module.css';
import Loading from '../loading';
import { useParams, useRouter } from 'next/navigation';

export default function PublicProfile() {
  const router = useRouter();
  const params = useParams();
  const handle = params.handle as string;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    // Viewer ID is optional for public viewing, but helps determine if they follow this person
    let viewerId = localStorage.getItem('user_id');
    const expiry = localStorage.getItem('session_expiry');
    if (viewerId && expiry && new Date().getTime() > parseInt(expiry)) {
      localStorage.removeItem('user_id');
      localStorage.removeItem('session_expiry');
      viewerId = null;
    }
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    
    // Make sure we pass the handle correctly. If it doesn't start with @, add it.
    const formattedHandle = handle.startsWith('%40') ? handle.replace('%40', '@') : (handle.startsWith('@') ? handle : `@${handle}`);

    fetch(`${API_URL}/public_profile.php?handle=${encodeURIComponent(formattedHandle)}&viewer_id=${viewerId || ''}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Profile not found');
        }
        return res.json();
      })
      .then(result => {
        setData(result);
        setIsFollowing(result.is_following);
        setIsOwnProfile(viewerId == result.user.id);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [handle]);

  const handleFollowToggle = async () => {
    let viewerId = localStorage.getItem('user_id');
    const expiry = localStorage.getItem('session_expiry');
    if (viewerId && expiry && new Date().getTime() > parseInt(expiry)) {
      localStorage.removeItem('user_id');
      localStorage.removeItem('session_expiry');
      viewerId = null;
    }
    if (!viewerId) {
      toast.error("Please log in to follow this user.");
      router.push('/');
      return;
    }

    setIsFollowLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    try {
      const res = await fetch(`${API_URL}/toggle_follow.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          follower_id: viewerId,
          following_id: data.user.id
        })
      });

      if (res.ok) {
        setIsFollowing(!isFollowing);
        if (!isFollowing) toast.success(`You are now following ${data.user.name}`);
        // Optimistically update counts
        setData({
          ...data,
          stats: {
            ...data.stats,
            followers: isFollowing ? data.stats.followers - 1 : data.stats.followers + 1
          }
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to follow user.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (error || !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', backgroundColor: '#0a0a0a' }}>
        <h2>{error || "Profile not found"}</h2>
      </div>
    );
  }

  // If the viewer is looking at their own profile, give them a button to go to their dashboard

  return (
    <div className={styles.dashboardContainer}>
      {/* Dynamic Profile Header Section */}
      <div className={styles.profileHeaderSection}>
        {/* Top Cover Banner */}
        <div 
          className={styles.bannerImageContainer} 
          style={{ backgroundImage: `url(${data.profile.cover_url || 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?q=80&w=2071&auto=format&fit=crop'})` }}
        >
          <div className={styles.bannerOverlay}>
            <div className={styles.bannerTopRight}>
              <div className={styles.quote}>
                &quot;Cars are more than machines.<br/>They&apos;re memories in motion.&quot;
              </div>
            </div>
            
            <div className={styles.bannerBottomInfo}>
              <div className={styles.profileDetailsDark}>
                <h2>{data.user.name} <Shield size={18} className={styles.verifiedIcon} fill="var(--gold)" /></h2>
                <p className={styles.handle}>{data.profile.handle}</p>
                <p className={styles.location}><MapPin size={14} /> {data.profile.location || 'Unknown Location'}</p>
                <p className={styles.bio}>{data.profile.bio || 'Cars. Travel. Design. Sharing the journey one mile at a time.'}</p>
                <div className={styles.tags}>
                  <span className={styles.tag}>Collector</span>
                  <span className={styles.tag}>Traveler</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom White Stat Bar */}
        <div className={styles.profileStatBar}>
          <div className={styles.statBarContent}>
            
            <div className={styles.avatarWrapper}>
              <img src={data.profile.avatar_url || "https://ui-avatars.com/api/?name="+data.user.name+"&background=random"} alt="Avatar" className={styles.avatar} />
            </div>

            <div className={styles.bannerProfileStats}>
              <div className={styles.statBox}>
                <span className={styles.statNum}>{data.posts.length}</span>
                <span className={styles.statLabel}>Posts</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statNum}>{data.stats.followers > 1000 ? (data.stats.followers/1000).toFixed(1)+'K' : data.stats.followers}</span>
                <span className={styles.statLabel}>Followers</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statNum}>{data.stats.following}</span>
                <span className={styles.statLabel}>Following</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statNum}>{data.vehicles.length}</span>
                <span className={styles.statLabel}>Cars</span>
              </div>
              <div className={styles.membershipBox}>
                <Shield size={32} className={styles.goldIcon} />
                <div className={styles.memberText}>
                  <span className={styles.memLevel}>Gold Member</span>
                  <span className={styles.memSince}>Since {new Date(data.profile.member_since).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})}</span>
                </div>
              </div>
            </div>
            
            <div className={styles.bannerProfileActions}>
              {isOwnProfile ? (
                <button className={styles.editBtn} onClick={() => router.push('/dashboard')}>Go to Dashboard</button>
              ) : (
                <button 
                  className={isFollowing ? styles.editBtn : styles.saveButton} 
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  style={!isFollowing ? { backgroundColor: 'var(--gold)', color: 'black', fontWeight: 600, padding: '8px 24px', border: 'none', borderRadius: '20px', cursor: 'pointer' } : {}}
                >
                  {isFollowLoading ? '...' : (isFollowing ? 'Unfollow' : 'Follow')}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className={styles.mainLayout}>
        {/* Center Content */}
        <main className={`${styles.mainContent} ${styles.fadeInUp} ${styles.delay3}`} style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
          <div className={styles.tabs}>
            <button className={activeTab === 'overview' ? styles.activeTab : ''} onClick={() => setActiveTab('overview')}>Overview</button>
            <button>Garage ({data.vehicles.length})</button>
            <button>Posts ({data.posts.length})</button>
          </div>

          <div className={styles.tabContent}>
             <div className={styles.contentSection}>
                <div className={styles.sectionHeader}>
                  <h3>Featured Vehicles</h3>
                  <a href="#" className={styles.viewAll}>View All &rarr;</a>
                </div>
                <div className={styles.emptyState}>
                  <p>No vehicles added to garage yet.</p>
                </div>
              </div>
          </div>
        </main>
      </div>
    </div>
  );
}
