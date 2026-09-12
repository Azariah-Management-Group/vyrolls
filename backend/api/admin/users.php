<?php
require_once '../../db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Ensure the request is from a super admin
$viewerId = isset($_GET['admin_id']) ? (int)$_GET['admin_id'] : null;
$data = json_decode(file_get_contents("php://input"), true);
if (!$viewerId && isset($data['admin_id'])) {
    $viewerId = (int)$data['admin_id'];
}

if (!$viewerId) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit;
}

// Verify admin status
$stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
$stmt->execute([$viewerId]);
$adminUser = $stmt->fetch();

if (!$adminUser || $adminUser['role'] !== 'super_admin') {
    http_response_code(403);
    echo json_encode(["message" => "Forbidden: Super Admin access required"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query("SELECT u.id, u.name, u.email, u.role, u.status, u.created_at, p.handle, p.avatar_url 
                             FROM users u 
                             LEFT JOIN user_profiles p ON u.id = p.user_id 
                             ORDER BY u.created_at DESC");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["users" => $users]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Database error: " . $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $data['action'] ?? null;
    $target_user_id = $data['user_id'] ?? null;

    if (!$action || !$target_user_id) {
        http_response_code(400);
        echo json_encode(["message" => "Missing action or user_id"]);
        exit;
    }

    try {
        if ($action === 'ban') {
            $stmt = $pdo->prepare("UPDATE users SET status = 'banned' WHERE id = ?");
            $stmt->execute([$target_user_id]);
            echo json_encode(["message" => "User banned successfully"]);
        } elseif ($action === 'unban') {
            $stmt = $pdo->prepare("UPDATE users SET status = 'active' WHERE id = ?");
            $stmt->execute([$target_user_id]);
            echo json_encode(["message" => "User unbanned successfully"]);
        } elseif ($action === 'delete') {
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$target_user_id]);
            echo json_encode(["message" => "User deleted successfully"]);
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
