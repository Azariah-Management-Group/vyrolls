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

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM permissions ORDER BY name ASC");
        $permissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["permissions" => $permissions]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Database error: " . $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $data['name'] ?? null;
    $description = $data['description'] ?? null;
    
    if (!$name) {
        http_response_code(400);
        echo json_encode(["message" => "Missing permission name"]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO permissions (name, description) VALUES (?, ?)");
        $stmt->execute([$name, $description]);
        echo json_encode(["message" => "Permission created successfully"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Database error: " . $e->getMessage()]);
    }
}
?>
