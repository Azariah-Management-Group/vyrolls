"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Bell, ChevronDown, MapPin, Camera, Edit2, Share, 
  User, Car, FileText, ShoppingBag, Bookmark, Calendar, Shield, Settings,
  ThumbsUp, MessageSquare, Share2
} from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './dashboard.module.css';

const DashboardSkeleton = () => (
  <div className={styles.dashboardContainer}>
    {/* Header Skeleton */}
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={`${styles.skeleton} ${styles.skeletonAvatar}`} style={{width: 40, height: 40}}></div>
        <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{width: 150, height: 24}}></div>
      </div>
    </header>

    {/* Profile Header Area Skeleton */}
    <div className={styles.profileHeaderSection}>
      <div className={styles.skeletonBanner}></div>
      <div className={styles.profileStatBar}>
        <div className={styles.statBarContent}>
          <div className={styles.avatarWrapper}>
            <div className={`${styles.skeleton} ${styles.skeletonAvatar}`}></div>
          </div>
          <div className={styles.bannerProfileStats}>
            {[1,2,3,4].map(i => (
              <div key={i} className={styles.statBox}>
                <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{width: 40, height: 24}}></div>
                <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{width: 60, height: 14}}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Main Layout Skeleton */}
    <div className={styles.mainLayout}>
      <aside className={styles.leftSidebar}>
        {[1,2,3,4,5,6,7].map(i => (
          <div key={i} className={`${styles.skeleton} ${styles.skeletonNav}`}></div>
        ))}
      </aside>
      <main className={styles.mainContent}>
        <div className={styles.tabs}>
          {[1,2,3,4,5].map(i => (
            <div key={i} className={`${styles.skeleton} ${styles.skeletonText}`} style={{width: 80, height: 30, borderRadius: 20}}></div>
          ))}
        </div>
        <div className={styles.vehicleGrid}>
          {[1,2,3].map(i => (
            <div key={i} className={`${styles.skeleton} ${styles.skeletonBox}`}></div>
          ))}
        </div>
      </main>
    </div>
  </div>
);


import Loading from '../loading';
import EditProfileModal from './EditProfileModal';

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [siteLogo, setSiteLogo] = useState<string | null>(null);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const toastId = toast.loading('Uploading cover image...');
      
      try {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        let cover_url = '';

        if (!cloudName || !uploadPreset) {
          cover_url = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
          });
        } else {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', uploadPreset);
          const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData,
          });
          if (!response.ok) throw new Error('Failed to upload image to Cloudinary');
          const cloudinaryData = await response.json();
          cover_url = cloudinaryData.secure_url;
        }

        const userId = localStorage.getItem('user_id');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const res = await fetch(`${API_URL}/update_profile.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            cover_url: cover_url
          }),
        });

        if (!res.ok) throw new Error('Failed to update profile cover');
        
        setData({ ...data, profile: { ...data.profile, cover_url } });
        toast.success('Cover image updated!', { id: toastId });
      } catch (err: any) {
        toast.error(err.message || 'Failed to upload cover', { id: toastId });
      }
    }
  };

  const fetchDashboardData = () => {
    const userId = localStorage.getItem('user_id');
    const expiry = localStorage.getItem('session_expiry');
    
    if (!userId || !expiry || new Date().getTime() > parseInt(expiry)) {
      localStorage.removeItem('user_id');
      localStorage.removeItem('session_expiry');
      router.push('/');
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    fetch(`${API_URL}/dashboard_data.php?user_id=${userId}`)
      .then(res => res.json())
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    fetch(`${API_URL}/messages.php?user_id=${userId}`)
      .then(res => res.json())
      .then(result => {
        if (result.messages) {
          setMessages(result.messages);
        }
      })
      .catch(err => console.error(err));
      
    fetch(`${API_URL}/admin/settings.php`)
      .then(res => res.json())
      .then(result => {
        if (result.settings && result.settings.site_logo) {
          setSiteLogo(result.settings.site_logo);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchDashboardData();
  }, [router]);

  if (loading) {
    return <Loading />;
  }

  if (!data || !data.user) {
    return <div className={styles.loadingContainer}>Error loading dashboard.</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          {siteLogo ? (
            <img src={siteLogo} alt="Site Logo" style={{height: '40px'}} />
          ) : (
            <>
              <div className={styles.logoIcon} style={{fontFamily: "'Playfair Display', serif", color: "#d4af37", fontSize: "1.8rem", letterSpacing: "3px"}}>V</div>
              <div className={styles.logoText}>
                <span style={{fontFamily: "'Playfair Display', serif", letterSpacing: "3px"}}>VYROLLS</span>
                <span className={styles.logoSub} style={{letterSpacing: "3px"}}>Drive Your World</span>
              </div>
            </>
          )}
        </div>
        <nav className={styles.topNav}>
          <a href="#">Vehicles</a>
          <a href="#">Customize</a>
          <a href="#">Services</a>
          <a href="#">Marketplace</a>
          <a href="#">Membership</a>
          <a href="#">Community</a>
          <a href="#">About</a>
        </nav>
        <div className={styles.headerActions}>
          <Search size={20} className={styles.iconAction} />
          <div className={styles.notification}>
            <Bell size={20} className={styles.iconAction} />
            <span className={styles.badge}>0</span>
          </div>
          <div className={styles.userDropdown}>
            <img src={data.profile.avatar_url || "https://ui-avatars.com/api/?name="+data.user.name+"&background=random"} alt="User" />
            <span>My Garage</span>
            <ChevronDown size={16} />
          </div>
          {data.user.role === 'super_admin' && (
            <button className={styles.listBtn} onClick={() => router.push('/admin')} style={{marginRight: '10px', backgroundColor: '#333', color: 'var(--gold)', border: '1px solid var(--gold)'}}>Admin Panel</button>
          )}
          <button className={styles.listBtn}>List Your Vehicle +</button>
        </div>
      </header>

      {/* Profile Header Area (Banner + Stats Bar) */}
      <div className={styles.profileHeaderSection}>
        {/* Top Dark Banner */}
        <div 
          className={styles.bannerImage} 
          style={{ backgroundImage: `url(${data.profile.cover_url || '/vyrolls_background_1789170713473.jpg'})` }}
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
                <p className={styles.handle}>@{data.user.name.toLowerCase().replace(/\s+/g, '')}</p>
                <p className={styles.location}><MapPin size={14} /> {data.profile.location || 'Unknown Location'}</p>
                <p className={styles.bio}>{data.profile.bio || 'Cars. Travel. Design. Sharing the journey one mile at a time.'}</p>
                <div className={styles.tags}>
                  <span className={styles.tag}>Collector</span>
                  <span className={styles.tag}>Traveler</span>
                  <span className={styles.tag}>Automotive Photographer</span>
                  <span className={styles.tag}>EV Advocate</span>
                </div>
              </div>
            </div>
          </div>
          <label className={styles.editBannerBtn} style={{cursor: 'pointer'}}>
            <Camera size={16} /> Edit Cover
            <input type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />
          </label>
        </div>

        {/* Bottom White Stat Bar */}
        <div className={styles.profileStatBar}>
          <div className={styles.statBarContent}>
            
            <div className={styles.avatarWrapper}>
              <img src={data.profile.avatar_url || "https://ui-avatars.com/api/?name="+data.user.name+"&background=random"} alt="Avatar" className={styles.avatar} />
              <button className={styles.avatarEdit} onClick={() => setIsEditModalOpen(true)}><Camera size={16} /></button>
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
              <button className={styles.editBtn} onClick={() => setIsEditModalOpen(true)}>Edit Profile</button>
              <button className={styles.shareBtn} onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/${data.profile.handle}`);
                toast.success('Profile link copied!');
              }}>Share Profile</button>
            </div>

          </div>
        </div>
      </div>


      {/* Main Layout */}
      <div className={styles.mainLayout}>
        {/* Left Sidebar */}
        <aside className={`${styles.leftSidebar} ${styles.slideInLeft} ${styles.delay2}`}>

          <nav className={styles.sideNav}>
            <a href="#" className={activeTab !== 'messages' ? styles.active : ''} onClick={(e) => { e.preventDefault(); setActiveTab('overview'); }}><User size={18} /> Profile</a>
            <a href="#" className={activeTab === 'messages' ? styles.active : ''} onClick={(e) => { e.preventDefault(); setActiveTab('messages'); }}><MessageSquare size={18} /> Messages {messages.filter(m => !m.is_read).length > 0 && <span className={styles.msgBadge}>{messages.filter(m => !m.is_read).length}</span>}</a>
            <a href="#"><Car size={18} /> My Garage</a>
            <a href="#"><FileText size={18} /> Posts</a>
            <a href="#"><ShoppingBag size={18} /> Marketplace</a>
            <a href="#"><Bookmark size={18} /> Saved</a>
            <a href="#"><Calendar size={18} /> Events</a>
            <a href="#"><Shield size={18} /> Badges</a>
            <a href="#"><Settings size={18} /> Settings</a>
          </nav>

          <div className={styles.adCard}>
            <h3>A HIGHER STANDARD TOGETHER.</h3>
            <p>Connect. Drive. Belong.</p>
            <button>Upgrade Membership &rarr;</button>
          </div>
        </aside>

        {/* Center Content */}
        <main className={`${styles.mainContent} ${styles.fadeInUp} ${styles.delay3}`}>
          {activeTab === 'messages' ? (
            <div className={styles.messagesSection}>
              <h2>Messages</h2>
              {messages.length === 0 ? (
                <div className={styles.emptyState}>No messages yet.</div>
              ) : (
                <div className={styles.messageList}>
                  {messages.map(msg => (
                    <div key={msg.id} className={`${styles.messageCard} ${msg.is_read ? styles.readMessage : styles.unreadMessage}`}>
                      <div className={styles.msgHeader}>
                        <h4>{msg.subject}</h4>
                        <span>{new Date(msg.created_at).toLocaleString()}</span>
                      </div>
                      <p>{msg.message}</p>
                      {!msg.is_read && (
                        <button className={styles.markReadBtn} onClick={() => {
                          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                          fetch(`${API_URL}/messages.php`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ user_id: data.user.id, action: 'mark_read', message_id: msg.id })
                          }).then(() => {
                            setMessages(messages.map(m => m.id === msg.id ? {...m, is_read: 1} : m));
                          });
                        }}>Mark as Read</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className={styles.tabs}>
            <button className={activeTab === 'overview' ? styles.activeTab : ''} onClick={() => setActiveTab('overview')}>Overview</button>
            <button>Garage ({data.vehicles.length})</button>
            <button>Posts ({data.posts.length})</button>
            <button>Activity</button>
            <button>Reviews ({data.stats.reviews})</button>
            <button>Following ({data.stats.following})</button>
            <button>Followers ({data.stats.followers})</button>
          </div>

          <div className={styles.sectionHeader}>
            <h3>Featured Vehicles</h3>
            <a href="#" className={styles.viewAll}>View All &rarr;</a>
          </div>

          <div className={styles.vehicleGrid}>
            {data.vehicles.length === 0 ? (
              <div className={styles.emptyState}>No vehicles added to garage yet.</div>
            ) : (
              data.vehicles.slice(0,3).map((vehicle: any) => (
                <div key={vehicle.id} className={styles.vehicleCard}>
                  <div className={styles.vehicleImage} style={{ backgroundImage: `url(${vehicle.image_url})` }}>
                    <div className={styles.vehicleFeatureBadge}>Featured</div>
                  </div>
                  <div className={styles.vehicleInfo}>
                    <h4>{vehicle.name}</h4>
                    <p>{vehicle.engine} | {vehicle.mileage}</p>
                    <div className={styles.vehicleTags}>
                      <span className={styles.tagPersonal}>{vehicle.type_tag}</span>
                      <span className={styles.tagSale}>{vehicle.status_tag}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.sectionHeader}>
            <h3>Recent Activity</h3>
            <div className={styles.activityFilters}>
              <button className={styles.activeFilter}>All</button>
              <button>Posts</button>
              <button>Trades</button>
              <button>Reviews</button>
              <button>Event Activity</button>
            </div>
            <a href="#" className={styles.viewAll}>View All &rarr;</a>
          </div>

          <div className={styles.activityGrid}>
             {data.posts.length === 0 ? (
              <div className={styles.emptyState}>No posts yet.</div>
             ) : (
               data.posts.map((post: any) => (
                 <div key={post.id} className={styles.postCard}>
                   <div className={styles.postHeader}>
                     <img src={data.profile.avatar_url || "https://ui-avatars.com/api/?name="+data.user.name} alt="" />
                     <div className={styles.postMeta}>
                       <h4>{data.user.name} <Shield size={12} className={styles.verifiedIcon} fill="var(--gold)" /></h4>
                       <span>{data.profile.handle} &bull; 2h ago</span>
                     </div>
                   </div>
                   <p className={styles.postContent}>{post.content}</p>
                   {post.image_url && (
                     <div className={styles.postImage} style={{ backgroundImage: `url(${post.image_url})` }} />
                   )}
                   <div className={styles.postActions}>
                     <span><ThumbsUp size={16} /> {post.likes_count}</span>
                     <span><MessageSquare size={16} /> {post.comments_count}</span>
                     <span><Share2 size={16} /> {post.shares_count}</span>
                   </div>
                 </div>
               ))
             )}
          </div>
            </>
          )}
        </main>

        {/* Right Sidebar */}
        <aside className={`${styles.rightSidebar} ${styles.slideInRight} ${styles.delay4}`}>
          <div className={styles.widget}>
            <div className={styles.widgetHeader}>
              <h3>Reputation & Stats</h3>
              <a href="#" className={styles.viewAll}>View All &rarr;</a>
            </div>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <Shield size={24} className={styles.goldIcon} />
                <span className={styles.statValue}>{data.stats.community_rank}</span>
                <span className={styles.statDesc}>Community Rank</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValueGold}>{data.stats.avg_rating} ({data.stats.reviews})</span>
                <span className={styles.statDesc}>Avg. Rating</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValueGold}>{data.stats.successful_trades}</span>
                <span className={styles.statDesc}>Successful Trades</span>
              </div>
            </div>
          </div>

          <div className={styles.widget}>
            <div className={styles.widgetHeader}>
              <h3>Badges ({data.badges.length})</h3>
              <a href="#" className={styles.viewAll}>View All &rarr;</a>
            </div>
            <div className={styles.badgesList}>
              {data.badges.length === 0 ? (
                <div className={styles.emptyStateSmall}>No badges earned yet.</div>
              ) : (
                data.badges.map((b:any, i:number) => (
                  <div key={i} className={styles.badgeItem}>
                    <Shield size={32} className={styles.goldIcon} />
                    <span>{b.badge_name}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.widget}>
            <div className={styles.widgetHeader}>
              <h3>My Communities</h3>
              <a href="#" className={styles.viewAll}>Manage &rarr;</a>
            </div>
            <div className={styles.communityList}>
              {data.communities.length === 0 ? (
                <div className={styles.emptyStateSmall}>No communities joined.</div>
              ) : (
                data.communities.map((c: any) => (
                  <div key={c.id} className={styles.communityItem}>
                    <img src={c.image_url} alt="" />
                    <div className={styles.communityInfo}>
                      <h4>{c.name}</h4>
                      <span>{c.real_member_count} members</span>
                    </div>
                    <button className={c.is_joined ? styles.joinedBtn : styles.joinBtn}>
                      {c.is_joined ? 'Joined' : '+ Join'}
                    </button>
                  </div>
                ))
              )}
            </div>
            <a href="#" className={styles.viewAllLink}>View All Communities &rarr;</a>
          </div>

          <div className={styles.inviteWidget}>
            <div className={styles.inviteIcon}>
               <User size={24} />
            </div>
            <div className={styles.inviteContent}>
              <h4>Invite Friends</h4>
              <p>Grow the community. Share your passion.</p>
              <button>Invite Friends &rarr;</button>
            </div>
          </div>
        </aside>
      </div>
      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        profileData={data.profile} 
        userId={data.user.id} 
        onSuccess={fetchDashboardData} 
      />
    </div>
  );
}
