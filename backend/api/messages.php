<?php
require_once '../db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Ensure the request is from a user
$viewerId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;
$data = json_decode(file_get_contents("php://input"), true);
if (!$viewerId && isset($data['user_id'])) {
    $viewerId = (int)$data['user_id'];
}

if (!$viewerId) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->prepare("SELECT * FROM messages WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$viewerId]);
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["messages" => $messages]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Database error: " . $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $data['action'] ?? null;
    $message_id = $data['message_id'] ?? null;

    if ($action === 'mark_read' && $message_id) {
        try {
            $stmt = $pdo->prepare("UPDATE messages SET is_read = 1 WHERE id = ? AND user_id = ?");
            $stmt->execute([$message_id, $viewerId]);
            echo json_encode(["message" => "Message marked as read"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Database error: " . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Invalid action or missing message_id"]);
    }
}
?>
