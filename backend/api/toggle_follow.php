<?php
require_once '../db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Receive JSON payload
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['follower_id']) || !isset($data['following_id'])) {
    http_response_code(400);
    echo json_encode(["message" => "Missing follower_id or following_id"]);
    exit;
}

$follower_id = (int)$data['follower_id'];
$following_id = (int)$data['following_id'];

if ($follower_id === $following_id) {
    http_response_code(400);
    echo json_encode(["message" => "Cannot follow yourself"]);
    exit;
}

try {
    // Check if already following
    $stmt = $pdo->prepare("SELECT id FROM followers WHERE follower_id = ? AND following_id = ?");
    $stmt->execute([$follower_id, $following_id]);
    
    if ($stmt->rowCount() > 0) {
        // Unfollow
        $stmt = $pdo->prepare("DELETE FROM followers WHERE follower_id = ? AND following_id = ?");
        $stmt->execute([$follower_id, $following_id]);
        echo json_encode(["message" => "Unfollowed successfully", "status" => "unfollowed"]);
    } else {
        // Follow
        $stmt = $pdo->prepare("INSERT INTO followers (follower_id, following_id) VALUES (?, ?)");
        $stmt->execute([$follower_id, $following_id]);
        echo json_encode(["message" => "Followed successfully", "status" => "followed"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error: " . $e->getMessage()]);
}
