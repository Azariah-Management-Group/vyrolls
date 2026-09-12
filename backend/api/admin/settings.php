<?php
require_once '../../db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Anyone can get public settings like site logo
    try {
        $stmt = $pdo->query("SELECT key_name, key_value FROM site_settings");
        $settings = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $settings[$row['key_name']] = $row['key_value'];
        }
        echo json_encode(["settings" => $settings]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Database error: " . $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Only super admin can update settings
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

    $key_name = $data['key_name'] ?? null;
    $key_value = $data['key_value'] ?? null;

    if (!$key_name || $key_value === null) {
        http_response_code(400);
        echo json_encode(["message" => "Missing key_name or key_value"]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO site_settings (key_name, key_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE key_value = ?");
        $stmt->execute([$key_name, $key_value, $key_value]);
        echo json_encode(["message" => "Setting updated successfully"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Database error: " . $e->getMessage()]);
    }
}
?>
