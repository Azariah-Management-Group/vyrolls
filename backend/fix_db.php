<?php require 'db.php'; $pdo->exec('ALTER TABLE user_profiles MODIFY avatar_url LONGTEXT'); echo 'Updated avatar_url to LONGTEXT';
