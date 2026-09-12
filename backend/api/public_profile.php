<?php
require_once '../db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if (!isset($_GET['handle'])) {
    http_response_code(400);
    echo json_encode(["message" => "Missing handle"]);
    exit;
}

$handle = $_GET['handle'];

// Optional: ID of the person viewing the profile, to see if they follow this person
$viewer_id = isset($_GET['viewer_id']) ? (int)$_GET['viewer_id'] : null;

try {
    // 1. Get profile by handle
    $stmt = $pdo->prepare("
        SELECT p.*, u.name, u.email 
        FROM user_profiles p
        JOIN users u ON p.user_id = u.id
        WHERE p.handle = ?
    ");
    $stmt->execute([$handle]);
    $profileData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$profileData) {
        http_response_code(404);
        echo json_encode(["message" => "Profile not found"]);
        exit;
    }

    $profile_user_id = $profileData['user_id'];

    // Vehicles
    $stmt = $pdo->prepare("SELECT * FROM vehicles WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$profile_user_id]);
    $vehicles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Posts
    $stmt = $pdo->prepare("SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$profile_user_id]);
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Badges
    $stmt = $pdo->prepare("SELECT badge_name, badge_icon FROM badges WHERE user_id = ?");
    $stmt->execute([$profile_user_id]);
    $badges = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Follower Stats
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM followers WHERE following_id = ?");
    $stmt->execute([$profile_user_id]);
    $followers_count = (int)$stmt->fetchColumn();

    $stmt = $pdo->prepare("SELECT COUNT(*) FROM followers WHERE follower_id = ?");
    $stmt->execute([$profile_user_id]);
    $following_count = (int)$stmt->fetchColumn();

    // Is current viewer following?
    $is_following = false;
    if ($viewer_id) {
        $stmt = $pdo->prepare("SELECT id FROM followers WHERE follower_id = ? AND following_id = ?");
        $stmt->execute([$viewer_id, $profile_user_id]);
        $is_following = $stmt->rowCount() > 0;
    }

    // Split user basics from profile details to match dashboard schema
    $user = [
        "id" => $profileData['user_id'],
        "name" => $profileData['name'],
        "email" => $profileData['email']
    ];

    unset($profileData['name']);
    unset($profileData['email']);

    // Prepare response
    $response = [
        "user" => $user,
        "profile" => $profileData,
        "vehicles" => $vehicles,
        "posts" => $posts,
        "badges" => $badges,
        "stats" => [
            "followers" => $followers_count,
            "following" => $following_count,
            "reviews" => 0,
            "community_rank" => "Top 50%",
            "avg_rating" => 0.0,
            "successful_trades" => 0
        ],
        "is_following" => $is_following
    ];

    echo json_encode($response);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error: " . $e->getMessage()]);
}
