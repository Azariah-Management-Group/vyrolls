<?php
require_once '../../db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$data = json_decode(file_get_contents("php://input"), true);
$viewerId = isset($data['admin_id']) ? (int)$data['admin_id'] : null;

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

$target_user_id = $data['user_id'] ?? null;
$subject = $data['subject'] ?? 'Message from Admin';
$message = $data['message'] ?? null;

if (!$target_user_id || !$message) {
    http_response_code(400);
    echo json_encode(["message" => "Missing user_id or message"]);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO messages (user_id, sender_id, subject, message) VALUES (?, ?, ?, ?)");
    $stmt->execute([$target_user_id, $viewerId, $subject, $message]);
    echo json_encode(["message" => "Message sent successfully"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error: " . $e->getMessage()]);
}
?>
