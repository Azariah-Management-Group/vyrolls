<?php
require_once 'db.php';

try {
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Update users table
    $pdo->exec("ALTER TABLE users 
                ADD COLUMN role ENUM('user', 'super_admin') DEFAULT 'user' AFTER email,
                ADD COLUMN status ENUM('active', 'banned') DEFAULT 'active' AFTER role");

    echo "Users table updated.\n";
} catch (PDOException $e) {
    echo "Users table update failed (might already exist): " . $e->getMessage() . "\n";
}

try {
    // 2. Create site_settings table
    $pdo->exec("CREATE TABLE IF NOT EXISTS site_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_name VARCHAR(100) UNIQUE NOT NULL,
        key_value LONGTEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");
    
    // Insert default logo
    $stmt = $pdo->prepare("INSERT IGNORE INTO site_settings (key_name, key_value) VALUES ('site_logo', '/icon.png')");
    $stmt->execute();
    
    echo "Site settings table created.\n";
} catch (PDOException $e) {
    echo "Site settings table error: " . $e->getMessage() . "\n";
}

try {
    // 3. Create user_activities table
    $pdo->exec("CREATE TABLE IF NOT EXISTS user_activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        action VARCHAR(100) NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )");
    echo "User activities table created.\n";
} catch (PDOException $e) {
    echo "User activities table error: " . $e->getMessage() . "\n";
}

try {
    // 4. Create messages table
    $pdo->exec("CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        sender_id INT,
        subject VARCHAR(255),
        message TEXT NOT NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )");
    echo "Messages table created.\n";
} catch (PDOException $e) {
    echo "Messages table error: " . $e->getMessage() . "\n";
}

try {
    // 5. Make user ID 1 super admin
    $pdo->exec("UPDATE users SET role = 'super_admin' WHERE id = 1");
    echo "User ID 1 set to super_admin.\n";
} catch (PDOException $e) {
    echo "Failed to set super_admin: " . $e->getMessage() . "\n";
}
?>
