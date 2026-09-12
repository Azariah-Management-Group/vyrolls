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

if (!isset($data['user_id'])) {
    http_response_code(400);
    echo json_encode(["message" => "Missing user_id"]);
    exit;
}

$user_id = (int)$data['user_id'];
$avatar_url = $data['avatar_url'] ?? null;
$bio = $data['bio'] ?? null;
$location = $data['location'] ?? null;
$gender = $data['gender'] ?? null;
$address = $data['address'] ?? null;
$city = $data['city'] ?? null;
$county = $data['county'] ?? null;
$town = $data['town'] ?? null;
$postal_code = $data['postal_code'] ?? null;

try {
    // Check if profile exists
    $stmt = $pdo->prepare("SELECT id FROM user_profiles WHERE user_id = ?");
    $stmt->execute([$user_id]);
    
    if ($stmt->rowCount() > 0) {
        // Update existing profile
        $updateSql = "UPDATE user_profiles SET 
            avatar_url = COALESCE(:avatar_url, avatar_url),
            bio = COALESCE(:bio, bio),
            location = COALESCE(:location, location),
            gender = COALESCE(:gender, gender),
            address = COALESCE(:address, address),
            city = COALESCE(:city, city),
            county = COALESCE(:county, county),
            town = COALESCE(:town, town),
            postal_code = COALESCE(:postal_code, postal_code)
            WHERE user_id = :user_id";
            
        $stmt = $pdo->prepare($updateSql);
        $stmt->execute([
            ':avatar_url' => $avatar_url,
            ':bio' => $bio,
            ':location' => $location,
            ':gender' => $gender,
            ':address' => $address,
            ':city' => $city,
            ':county' => $county,
            ':town' => $town,
            ':postal_code' => $postal_code,
            ':user_id' => $user_id
        ]);
    } else {
        $stmt_user = $pdo->prepare("SELECT name FROM users WHERE id = ?");
        $stmt_user->execute([$user_id]);
        $user_data = $stmt_user->fetch(PDO::FETCH_ASSOC);
        $user_name = $user_data ? preg_replace('/[^a-zA-Z0-9]/', '', strtolower($user_data['name'])) : 'user';

        // Insert new profile
        $insertSql = "INSERT INTO user_profiles (user_id, avatar_url, bio, location, gender, address, city, county, town, postal_code, handle, member_since) 
                      VALUES (:user_id, :avatar_url, :bio, :location, :gender, :address, :city, :county, :town, :postal_code, :handle, CURDATE())";
        $stmt = $pdo->prepare($insertSql);
        $stmt->execute([
            ':user_id' => $user_id,
            ':avatar_url' => $avatar_url,
            ':bio' => $bio,
            ':location' => $location,
            ':gender' => $gender,
            ':address' => $address,
            ':city' => $city,
            ':county' => $county,
            ':town' => $town,
            ':postal_code' => $postal_code,
            ':handle' => '@' . $user_name . $user_id
        ]);
    }
    
    // Log activity
    $actStmt = $pdo->prepare("INSERT INTO user_activities (user_id, action, details) VALUES (?, ?, ?)");
    $actStmt->execute([$user_id, 'update_profile', 'User updated their profile']);

    echo json_encode(["message" => "Profile updated successfully"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error: " . $e->getMessage()]);
}
