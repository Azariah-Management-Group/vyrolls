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
        $stmt = $pdo->query("SELECT * FROM roles ORDER BY id ASC");
        $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch permissions for each role
        foreach ($roles as &$role) {
            $stmtPerms = $pdo->prepare("SELECT p.name FROM permissions p JOIN role_permissions rp ON p.id = rp.permission_id WHERE rp.role_id = ?");
            $stmtPerms->execute([$role['id']]);
            $role['permissions'] = $stmtPerms->fetchAll(PDO::FETCH_COLUMN);
        }
        
        echo json_encode(["roles" => $roles]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Database error: " . $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $data['action'] ?? 'create';
    
    if ($action === 'create') {
        $name = $data['name'] ?? null;
        $description = $data['description'] ?? null;
        
        if (!$name) {
            http_response_code(400);
            echo json_encode(["message" => "Missing role name"]);
            exit;
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO roles (name, description) VALUES (?, ?)");
            $stmt->execute([$name, $description]);
            echo json_encode(["message" => "Role created successfully"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Database error: " . $e->getMessage()]);
        }
    } elseif ($action === 'delete') {
        $role_id = $data['role_id'] ?? null;
        if (!$role_id) {
            http_response_code(400);
            echo json_encode(["message" => "Missing role id"]);
            exit;
        }
        try {
            $stmt = $pdo->prepare("DELETE FROM roles WHERE id = ? AND name != 'super_admin'");
            $stmt->execute([$role_id]);
            echo json_encode(["message" => "Role deleted successfully"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Database error: " . $e->getMessage()]);
        }
    }
}
?>
