<?php
require_once '../db.php';
require_once '../email.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$data = json_decode(file_get_contents("php://input"));
if (!$data || !isset($data->email)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid data"]);
    exit;
}

$email = $data->email;

// Check if user exists
$stmt = $pdo->prepare("SELECT id, name FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
    http_response_code(404);
    echo json_encode(["message" => "Email not found"]);
    exit;
}

$otpCode = sprintf("%06d", mt_rand(1, 999999));
$expiresAt = date('Y-m-d H:i:s', strtotime('+15 minutes'));

// Update OTP
$updateStmt = $pdo->prepare("UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE email = ?");
if ($updateStmt->execute([$otpCode, $expiresAt, $email])) {
    if (sendOTPEmail($email, $user['name'], $otpCode)) {
        echo json_encode(["message" => "Verification code sent to your email", "email" => $email]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Failed to send verification email"]);
    }
} else {
    http_response_code(500);
    echo json_encode(["message" => "Database error"]);
}
