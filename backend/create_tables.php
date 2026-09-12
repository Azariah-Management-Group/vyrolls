<?php
require_once 'db.php';

try {
    // User Profiles
    $pdo->exec("CREATE TABLE IF NOT EXISTS user_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        handle VARCHAR(255) UNIQUE,
        location VARCHAR(255),
        bio TEXT,
        membership_level VARCHAR(50) DEFAULT 'Member',
        avatar_url VARCHAR(255),
        cover_url VARCHAR(255),
        member_since DATE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )");

    // Vehicles
    $pdo->exec("CREATE TABLE IF NOT EXISTS vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255),
        engine VARCHAR(255),
        mileage VARCHAR(255),
        type_tag VARCHAR(50),
        status_tag VARCHAR(50),
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )");

    // Posts
    $pdo->exec("CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        content TEXT,
        image_url VARCHAR(255),
        likes_count INT DEFAULT 0,
        comments_count INT DEFAULT 0,
        shares_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )");

    // Badges
    $pdo->exec("CREATE TABLE IF NOT EXISTS badges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        badge_name VARCHAR(100),
        badge_icon VARCHAR(100),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )");

    // Communities
    $pdo->exec("CREATE TABLE IF NOT EXISTS communities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        member_count VARCHAR(50),
        image_url VARCHAR(255)
    )");

    // User Communities (Many-to-Many)
    $pdo->exec("CREATE TABLE IF NOT EXISTS user_communities (
        user_id INT NOT NULL,
        community_id INT NOT NULL,
        PRIMARY KEY (user_id, community_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE
    )");

    echo "Tables created successfully.\n";

} catch (PDOException $e) {
    echo "Error creating tables: " . $e->getMessage() . "\n";
}
