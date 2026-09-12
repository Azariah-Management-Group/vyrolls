<?php
require_once '../../db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Ensure the request is from a super admin
$viewerId = isset($_GET['admin_id']) ? (int)$_GET['admin_id'] : null;

if (!$viewerId) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit;
}

$stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
$stmt->execute([$viewerId]);
$adminUser = $stmt->fetch();

if (!$adminUser || $adminUser['role'] !== 'super_admin') {
    http_response_code(403);
    echo json_encode(["message" => "Forbidden: Super Admin access required"]);
    exit;
}

try {
    $stmt = $pdo->query("SELECT a.id, a.user_id, a.action, a.details, a.created_at, u.name, u.email 
                         FROM user_activities a 
                         JOIN users u ON a.user_id = u.id 
                         ORDER BY a.created_at DESC 
                         LIMIT 100");
    $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["activities" => $activities]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error: " . $e->getMessage()]);
}
?>
