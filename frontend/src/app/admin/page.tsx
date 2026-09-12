"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";
import toast, { Toaster } from "react-hot-toast";

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("Users");
  const [loading, setLoading] = useState(true);
  
  // Settings state
  const [siteLogoUrl, setSiteLogoUrl] = useState("");

  // Messaging state
  const [messageUserId, setMessageUserId] = useState("");
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    const expiry = localStorage.getItem("session_expiry");
    if (!userId || !expiry || new Date().getTime() > parseInt(expiry)) {
      router.push("/");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const userId = localStorage.getItem("user_id");
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    
    try {
      const usersRes = await fetch(`${API_URL}/admin/users.php?admin_id=${userId}`);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      } else if (usersRes.status === 403) {
        toast.error("Forbidden. Super Admin access required.");
        router.push("/dashboard");
        return;
      }

      const activitiesRes = await fetch(`${API_URL}/admin/activities.php?admin_id=${userId}`);
      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        setActivities(activitiesData.activities || []);
      }
    } catch (err) {
      toast.error("Error fetching admin data");
    }
    setLoading(false);
  };

  const handleUserAction = async (targetUserId: number, action: string) => {
    const adminId = localStorage.getItem("user_id");
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    try {
      const res = await fetch(`${API_URL}/admin/users.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_id: adminId, user_id: targetUserId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Error performing action");
    }
  };

  const handleUpdateLogo = async () => {
    const adminId = localStorage.getItem("user_id");
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    try {
      const res = await fetch(`${API_URL}/admin/settings.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_id: adminId, key_name: "site_logo", key_value: siteLogoUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Site logo updated!");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Error updating logo");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingMessage(true);
    const adminId = localStorage.getItem("user_id");
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    try {
      const res = await fetch(`${API_URL}/admin/send_message.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          admin_id: adminId, 
          user_id: messageUserId, 
          subject: messageSubject, 
          message: messageContent 
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Message sent successfully!");
        setMessageUserId("");
        setMessageSubject("");
        setMessageContent("");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Error sending message");
    }
    setIsSendingMessage(false);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.ferrariLoader}>
          <img src="/ferrari.png" alt="Loading" className={styles.carImg} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Toaster position="top-right" />
      <header className={styles.header}>
        <div className={styles.logo}>Vyrolls Admin</div>
        <button onClick={() => router.push("/dashboard")} className={styles.backButton}>
          Back to Dashboard
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.sidebar}>
          <button className={`${styles.tabBtn} ${activeTab === "Users" ? styles.activeTab : ""}`} onClick={() => setActiveTab("Users")}>
            Manage Users
          </button>
          <button className={`${styles.tabBtn} ${activeTab === "Activities" ? styles.activeTab : ""}`} onClick={() => setActiveTab("Activities")}>
            User Activities
          </button>
          <button className={`${styles.tabBtn} ${activeTab === "Messaging" ? styles.activeTab : ""}`} onClick={() => setActiveTab("Messaging")}>
            Send Message
          </button>
          <button className={`${styles.tabBtn} ${activeTab === "Settings" ? styles.activeTab : ""}`} onClick={() => setActiveTab("Settings")}>
            Site Settings
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === "Users" && (
            <div>
              <h2>Manage Users</h2>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[u.status]}`}>
                          {u.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          {u.status === "active" ? (
                            <button className={styles.banBtn} onClick={() => handleUserAction(u.id, "ban")}>Ban</button>
                          ) : (
                            <button className={styles.unbanBtn} onClick={() => handleUserAction(u.id, "unban")}>Unban</button>
                          )}
                          <button className={styles.deleteBtn} onClick={() => {
                            if (window.confirm("Are you sure you want to delete this user?")) {
                              handleUserAction(u.id, "delete");
                            }
                          }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "Activities" && (
            <div>
              <h2>User Activities</h2>
              <ul className={styles.activityList}>
                {activities.map(a => (
                  <li key={a.id} className={styles.activityItem}>
                    <strong>{a.name} ({a.email})</strong> performed <em>{a.action}</em>: {a.details}
                    <div className={styles.timestamp}>{new Date(a.created_at).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "Messaging" && (
            <div>
              <h2>Send Message to User</h2>
              <form onSubmit={handleSendMessage} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>User ID</label>
                  <input type="number" value={messageUserId} onChange={e => setMessageUserId(e.target.value)} required />
                </div>
                <div className={styles.formGroup}>
                  <label>Subject</label>
                  <input type="text" value={messageSubject} onChange={e => setMessageSubject(e.target.value)} required />
                </div>
                <div className={styles.formGroup}>
                  <label>Message</label>
                  <textarea value={messageContent} onChange={e => setMessageContent(e.target.value)} rows={5} required />
                </div>
                <button type="submit" className={styles.saveBtn} disabled={isSendingMessage}>
                  {isSendingMessage ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "Settings" && (
            <div>
              <h2>Site Settings</h2>
              <div className={styles.formGroup}>
                <label>Site Logo URL (Cloudinary or public link)</label>
                <input 
                  type="text" 
                  value={siteLogoUrl} 
                  onChange={(e) => setSiteLogoUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                />
              </div>
              <button className={styles.saveBtn} onClick={handleUpdateLogo}>Update Logo</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
