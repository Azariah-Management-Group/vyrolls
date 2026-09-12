"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";
import toast, { Toaster } from "react-hot-toast";

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("Users");
  const [loading, setLoading] = useState(true);
  
  // Settings state
  const [siteLogoUrl, setSiteLogoUrl] = useState("");
  
  // SMTP state
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpEnc, setSmtpEnc] = useState("ssl");

  // Messaging state
  const [messageUserId, setMessageUserId] = useState("");
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // RBAC Form states
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newPermName, setNewPermName] = useState("");
  const [newPermDesc, setNewPermDesc] = useState("");

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

      const rolesRes = await fetch(`${API_URL}/admin/roles.php?admin_id=${userId}`);
      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(rolesData.roles || []);
      }

      const permsRes = await fetch(`${API_URL}/admin/permissions.php?admin_id=${userId}`);
      if (permsRes.ok) {
        const permsData = await permsRes.json();
        setPermissions(permsData.permissions || []);
      }

      const smtpRes = await fetch(`${API_URL}/admin/smtp.php?admin_id=${userId}`);
      if (smtpRes.ok) {
        const smtpData = await smtpRes.json();
        const settings = smtpData.smtp_settings || {};
        setSmtpHost(settings.smtp_host || "");
        setSmtpPort(settings.smtp_port || "");
        setSmtpUser(settings.smtp_username || "");
        setSmtpPass(settings.smtp_password || "");
        setSmtpEnc(settings.smtp_encryption || "ssl");
      }
    } catch (err) {
      toast.error("Error fetching admin data");
    }
    setLoading(false);
  };

  const handleUserAction = async (targetUserId: number, action: string, role_name?: string) => {
    const adminId = localStorage.getItem("user_id");
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    try {
      const res = await fetch(`${API_URL}/admin/users.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_id: adminId, user_id: targetUserId, action, role_name }),
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

  const handleSaveSmtp = async () => {
    const adminId = localStorage.getItem("user_id");
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    try {
      const res = await fetch(`${API_URL}/admin/smtp.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_id: adminId,
          smtp_host: smtpHost,
          smtp_port: smtpPort,
          smtp_username: smtpUser,
          smtp_password: smtpPass,
          smtp_encryption: smtpEnc
        }),
      });
      if (res.ok) {
        toast.success("SMTP settings saved successfully!");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to save SMTP settings");
      }
    } catch (err) {
      toast.error("Error saving SMTP settings");
    }
  };

  const handleTestSmtp = async () => {
    const adminId = localStorage.getItem("user_id");
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    try {
      const res = await fetch(`${API_URL}/admin/smtp_test.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_id: adminId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.message || "SMTP test failed");
      }
    } catch (err) {
      toast.error("Error running SMTP test");
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

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    const adminId = localStorage.getItem("user_id");
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    try {
      const res = await fetch(`${API_URL}/admin/roles.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_id: adminId, action: 'create', name: newRoleName, description: newRoleDesc }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setNewRoleName("");
        setNewRoleDesc("");
        fetchData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Error creating role");
    }
  };

  const handleCreatePermission = async (e: React.FormEvent) => {
    e.preventDefault();
    const adminId = localStorage.getItem("user_id");
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    try {
      const res = await fetch(`${API_URL}/admin/permissions.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_id: adminId, name: newPermName, description: newPermDesc }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setNewPermName("");
        setNewPermDesc("");
        fetchData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Error creating permission");
    }
  };

  const handleTogglePermission = async (roleId: number, permissionId: number, assign: boolean) => {
    const adminId = localStorage.getItem("user_id");
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const action = assign ? "assign" : "revoke";
    try {
      const res = await fetch(`${API_URL}/admin/role_permissions.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_id: adminId, role_id: roleId, permission_id: permissionId, action }),
      });
      if (res.ok) {
        toast.success(`Permission ${action}ed successfully`);
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(`Error to ${action} permission`);
    }
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
          <button className={`${styles.tabBtn} ${activeTab === "Roles" ? styles.activeTab : ""}`} onClick={() => setActiveTab("Roles")}>
            Roles & Permissions
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
                      <td>
                        <select 
                          className={styles.roleSelect} 
                          value={u.role} 
                          onChange={(e) => handleUserAction(u.id, "change_role", e.target.value)}
                        >
                          {roles.map(r => (
                            <option key={r.id} value={r.name}>{r.name}</option>
                          ))}
                        </select>
                      </td>
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

          {activeTab === "Roles" && (
            <div>
              <h2>Roles & Permissions</h2>
              
              <div className={styles.grid}>
                <div className={styles.card}>
                  <h3>Create Role</h3>
                  <form onSubmit={handleCreateRole} className={styles.form}>
                    <div className={styles.formGroup}>
                      <input type="text" placeholder="Role Name (e.g. editor)" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} required />
                    </div>
                    <div className={styles.formGroup}>
                      <input type="text" placeholder="Description" value={newRoleDesc} onChange={e => setNewRoleDesc(e.target.value)} required />
                    </div>
                    <button type="submit" className={styles.saveBtn}>Add Role</button>
                  </form>
                </div>

                <div className={styles.card}>
                  <h3>Create Permission</h3>
                  <form onSubmit={handleCreatePermission} className={styles.form}>
                    <div className={styles.formGroup}>
                      <input type="text" placeholder="Permission Name (e.g. delete_posts)" value={newPermName} onChange={e => setNewPermName(e.target.value)} required />
                    </div>
                    <div className={styles.formGroup}>
                      <input type="text" placeholder="Description" value={newPermDesc} onChange={e => setNewPermDesc(e.target.value)} required />
                    </div>
                    <button type="submit" className={styles.saveBtn}>Add Permission</button>
                  </form>
                </div>
              </div>

              <div style={{ marginTop: '30px' }}>
                <h3>Assign Permissions to Roles</h3>
                <div className={styles.grid}>
                  {roles.map(role => (
                    <div key={role.id} className={styles.card}>
                      <h4 style={{ margin: 0, color: 'var(--gold)' }}>{role.name}</h4>
                      <small style={{ color: '#888' }}>{role.description}</small>
                      <div className={styles.permissionList}>
                        {permissions.map(perm => {
                          const hasPerm = role.permissions && role.permissions.includes(perm.name);
                          return (
                            <label key={perm.id} className={styles.permissionItem}>
                              <input 
                                type="checkbox" 
                                checked={hasPerm}
                                onChange={(e) => handleTogglePermission(role.id, perm.id, e.target.checked)}
                              />
                              <span>{perm.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
              
              <div className={styles.card} style={{ marginBottom: "20px" }}>
                <h3 style={{ marginTop: 0 }}>General Settings</h3>
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

              <div className={styles.card}>
                <h3 style={{ marginTop: 0 }}>SMTP Configuration</h3>
                <div className={styles.formGroup}>
                  <label>SMTP Host</label>
                  <input type="text" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" />
                </div>
                <div className={styles.formGroup}>
                  <label>SMTP Port</label>
                  <input type="text" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} placeholder="465" />
                </div>
                <div className={styles.formGroup}>
                  <label>SMTP Username</label>
                  <input type="text" value={smtpUser} onChange={e => setSmtpUser(e.target.value)} placeholder="email@example.com" />
                </div>
                <div className={styles.formGroup}>
                  <label>SMTP Password</label>
                  <input type="password" value={smtpPass} onChange={e => setSmtpPass(e.target.value)} placeholder="••••••••" />
                </div>
                <div className={styles.formGroup}>
                  <label>Encryption</label>
                  <select value={smtpEnc} onChange={e => setSmtpEnc(e.target.value)} className={styles.roleSelect} style={{ width: '100%', marginTop: '5px' }}>
                    <option value="ssl">SSL</option>
                    <option value="tls">TLS</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button className={styles.saveBtn} onClick={handleSaveSmtp}>Save SMTP Settings</button>
                  <button className={styles.saveBtn} style={{ backgroundColor: '#444' }} onClick={handleTestSmtp}>Send Test Email</button>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
