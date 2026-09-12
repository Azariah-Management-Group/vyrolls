<?php
require_once '../../db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

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

$stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
$stmt->execute([$viewerId]);
$adminUser = $stmt->fetch();

if (!$adminUser || $adminUser['role'] !== 'super_admin') {
    http_response_code(403);
    echo json_encode(["message" => "Forbidden: Super Admin access required"]);
    exit;
}

$keys = ['smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'smtp_encryption'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $settings = [];
        $stmt = $pdo->query("SELECT key_name, key_value FROM site_settings WHERE key_name LIKE 'smtp_%'");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $settings[$row['key_name']] = $row['key_value'];
        }
        
        // Provide empty strings if keys missing
        $response = [];
        foreach ($keys as $k) {
            $response[$k] = $settings[$k] ?? '';
        }
        
        echo json_encode(["smtp_settings" => $response]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Database error: " . $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare("INSERT INTO site_settings (key_name, key_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE key_value = VALUES(key_value)");
        
        foreach ($keys as $k) {
            if (isset($data[$k])) {
                $stmt->execute([$k, $data[$k]]);
            }
        }
        
        $pdo->commit();
        echo json_encode(["message" => "SMTP settings updated successfully"]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["message" => "Database error: " . $e->getMessage()]);
    }
}
?>
