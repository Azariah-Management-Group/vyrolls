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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $role_id = $data['role_id'] ?? null;
    $permission_id = $data['permission_id'] ?? null;
    $action = $data['action'] ?? null; // 'assign' or 'revoke'

    if (!$role_id || !$permission_id || !$action) {
        http_response_code(400);
        echo json_encode(["message" => "Missing required fields"]);
        exit;
    }

    try {
        if ($action === 'assign') {
            $stmt = $pdo->prepare("INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)");
            $stmt->execute([$role_id, $permission_id]);
            echo json_encode(["message" => "Permission assigned"]);
        } elseif ($action === 'revoke') {
            $stmt = $pdo->prepare("DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?");
            $stmt->execute([$role_id, $permission_id]);
            echo json_encode(["message" => "Permission revoked"]);
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Invalid action"]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Database error: " . $e->getMessage()]);
    }
}
?>
