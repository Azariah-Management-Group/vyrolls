<?php
require_once '../db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$data = json_decode(file_get_contents("php://input"));
if (!$data || !isset($data->email) || !isset($data->otp) || !isset($data->new_password)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid data"]);
    exit;
}

$email = $data->email;
$otp = $data->otp;
$newPassword = $data->new_password;

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user) {
    if ($user['otp_code'] === $otp && strtotime($user['otp_expires_at']) > time()) {
        $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
        // Clear OTP and update password
        $updateStmt = $pdo->prepare("UPDATE users SET password_hash = ?, otp_code = NULL, otp_expires_at = NULL WHERE email = ?");
        if ($updateStmt->execute([$passwordHash, $email])) {
            echo json_encode(["message" => "Password successfully reset"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Failed to update password"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Invalid or expired verification code"]);
    }
} else {
    http_response_code(404);
    echo json_encode(["message" => "User not found"]);
}
