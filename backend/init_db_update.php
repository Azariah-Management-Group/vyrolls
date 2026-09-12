<?php
require_once 'db.php';

try {
    $sql = "
        ALTER TABLE users 
        ADD COLUMN otp_code VARCHAR(10) NULL,
        ADD COLUMN otp_expires_at DATETIME NULL,
        ADD COLUMN email_verified_at DATETIME NULL,
        ADD COLUMN last_login_at DATETIME NULL;
    ";
    $pdo->exec($sql);
    echo "Users table updated successfully.";
} catch (PDOException $e) {
    echo "Error updating table: " . $e->getMessage();
}
