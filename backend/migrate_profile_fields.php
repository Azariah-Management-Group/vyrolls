<?php
require_once 'db.php';

echo "Starting database migration...\n";

// 1. Add new columns to user_profiles
$columnsToAdd = [
    'gender' => 'VARCHAR(50) DEFAULT NULL',
    'address' => 'VARCHAR(255) DEFAULT NULL',
    'city' => 'VARCHAR(100) DEFAULT NULL',
    'county' => 'VARCHAR(100) DEFAULT NULL',
    'town' => 'VARCHAR(100) DEFAULT NULL',
    'postal_code' => 'VARCHAR(50) DEFAULT NULL'
];

foreach ($columnsToAdd as $col => $def) {
    try {
        $pdo->exec("ALTER TABLE user_profiles ADD COLUMN $col $def");
        echo "Successfully added column: $col\n";
    } catch (PDOException $e) {
        // Ignore duplicate column errors (SQLSTATE 42S21)
        if ($e->getCode() == '42S21') {
            echo "Column $col already exists, skipping.\n";
        } else {
            echo "Error adding column $col: " . $e->getMessage() . "\n";
        }
    }
}

// 2. Create followers table
try {
    $createFollowersTable = "
        CREATE TABLE IF NOT EXISTS followers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            follower_id INT NOT NULL,
            following_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_follow (follower_id, following_id)
        )
    ";
    $pdo->exec($createFollowersTable);
    echo "Successfully created table: followers\n";
} catch (PDOException $e) {
    echo "Error creating followers table: " . $e->getMessage() . "\n";
}

echo "Migration complete.\n";
