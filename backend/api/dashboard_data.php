<?php
require_once '../db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if (!isset($_GET['user_id'])) {
    http_response_code(400);
    echo json_encode(["message" => "Missing user_id"]);
    exit;
}

$user_id = (int)$_GET['user_id'];

try {
    // Basic user info
    $stmt = $pdo->prepare("SELECT id, name, email FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(["message" => "User not found"]);
        exit;
    }

    // Extended profile
    $stmt = $pdo->prepare("SELECT * FROM user_profiles WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);

    // If profile doesn't exist, create a default one
    if (!$profile) {
        $stmt = $pdo->prepare("INSERT INTO user_profiles (user_id, handle, member_since) VALUES (?, ?, CURDATE())");
        $default_handle = '@user' . $user_id;
        $stmt->execute([$user_id, $default_handle]);
        
        $stmt = $pdo->prepare("SELECT * FROM user_profiles WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Vehicles
    $stmt = $pdo->prepare("SELECT * FROM vehicles WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user_id]);
    $vehicles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Posts
    $stmt = $pdo->prepare("SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user_id]);
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Badges
    $stmt = $pdo->prepare("SELECT badge_name, badge_icon FROM badges WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $badges = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Communities
    $stmt = $pdo->prepare("
        SELECT c.*, 
        (SELECT COUNT(*) FROM user_communities uc2 WHERE uc2.community_id = c.id) as real_member_count,
        EXISTS(SELECT 1 FROM user_communities uc WHERE uc.community_id = c.id AND uc.user_id = ?) as is_joined
        FROM communities c
    ");
    $stmt->execute([$user_id]);
    $communities = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Prepare response
    $response = [
        "user" => $user,
        "profile" => $profile,
        "vehicles" => $vehicles,
        "posts" => $posts,
        "badges" => $badges,
        "communities" => $communities,
        "stats" => [
            "followers" => 0,
            "following" => 0,
            "reviews" => 0,
            "community_rank" => "Top 50%",
            "avg_rating" => 0.0,
            "successful_trades" => 0
        ]
    ];

    echo json_encode($response);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error: " . $e->getMessage()]);
}
