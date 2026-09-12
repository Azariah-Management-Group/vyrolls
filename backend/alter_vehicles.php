<?php
require 'db.php';

try {
    $alterSql = "ALTER TABLE vehicles 
        ADD COLUMN make VARCHAR(100) NULL,
        ADD COLUMN model VARCHAR(100) NULL,
        ADD COLUMN year INT NULL,
        ADD COLUMN trim_level VARCHAR(100) NULL,
        ADD COLUMN body_type VARCHAR(50) NULL,
        ADD COLUMN transmission VARCHAR(50) NULL,
        ADD COLUMN exterior_color VARCHAR(50) NULL,
        ADD COLUMN interior_color VARCHAR(50) NULL,
        ADD COLUMN fuel_type VARCHAR(50) NULL,
        ADD COLUMN vin VARCHAR(50) NULL,
        ADD COLUMN condition_state VARCHAR(50) NULL,
        ADD COLUMN price DECIMAL(10,2) NULL,
        ADD COLUMN listing_type VARCHAR(50) NULL,
        ADD COLUMN gallery_urls TEXT NULL";
        
    $pdo->exec($alterSql);
    echo "Successfully updated vehicles table schema.";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "Columns already exist.";
    } else {
        echo "Error: " . $e->getMessage();
    }
}
