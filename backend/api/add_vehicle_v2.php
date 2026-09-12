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
$make = $data['make'] ?? null;
$model = $data['model'] ?? null;
$year = $data['year'] ?? null;
$trim_level = $data['trim_level'] ?? null;
$body_type = $data['body_type'] ?? null;
$transmission = $data['transmission'] ?? null;
$mileage = $data['mileage'] ?? null;
$exterior_color = $data['exterior_color'] ?? null;
$interior_color = $data['interior_color'] ?? null;
$fuel_type = $data['fuel_type'] ?? null;
$vin = $data['vin'] ?? null;
$condition_state = $data['condition_state'] ?? null;
$price = $data['price'] ?? null;
$listing_type = $data['listing_type'] ?? null;
$gallery_urls = isset($data['gallery_urls']) ? json_encode($data['gallery_urls']) : null;

// The main image_url is the first image in the gallery
$image_url = null;
if (isset($data['gallery_urls']) && is_array($data['gallery_urls']) && count($data['gallery_urls']) > 0) {
    $image_url = $data['gallery_urls'][0];
}

$name = "$year $make $model";

try {
    $insertSql = "INSERT INTO vehicles (
        user_id, name, make, model, year, trim_level, body_type, 
        transmission, mileage, exterior_color, interior_color, 
        fuel_type, vin, condition_state, price, listing_type, 
        image_url, gallery_urls
    ) VALUES (
        :user_id, :name, :make, :model, :year, :trim_level, :body_type, 
        :transmission, :mileage, :exterior_color, :interior_color, 
        :fuel_type, :vin, :condition_state, :price, :listing_type, 
        :image_url, :gallery_urls
    )";
    
    $stmt = $pdo->prepare($insertSql);
    $stmt->execute([
        ':user_id' => $user_id,
        ':name' => $name,
        ':make' => $make,
        ':model' => $model,
        ':year' => $year,
        ':trim_level' => $trim_level,
        ':body_type' => $body_type,
        ':transmission' => $transmission,
        ':mileage' => $mileage,
        ':exterior_color' => $exterior_color,
        ':interior_color' => $interior_color,
        ':fuel_type' => $fuel_type,
        ':vin' => $vin,
        ':condition_state' => $condition_state,
        ':price' => $price,
        ':listing_type' => $listing_type,
        ':image_url' => $image_url,
        ':gallery_urls' => $gallery_urls,
    ]);
    
    $vehicle_id = $pdo->lastInsertId();

    // Log activity
    $actStmt = $pdo->prepare("INSERT INTO user_activities (user_id, action, details) VALUES (?, ?, ?)");
    $actStmt->execute([$user_id, 'add_vehicle', 'User added a new vehicle listing']);

    echo json_encode(["message" => "Vehicle added successfully", "vehicle_id" => $vehicle_id]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error: " . $e->getMessage()]);
}
