<?php
require 'db.php';
try {
    $stmt = $pdo->query('DESCRIBE vehicles');
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo $e->getMessage();
}
