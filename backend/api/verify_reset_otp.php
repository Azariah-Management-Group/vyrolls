<?php
require_once '../db.php';

$data = json_decode(file_get_contents("php://input"));

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if (isset($data->email) && isset($data->otp)) {
    $email = $data->email;
    $otp = $data->otp;

    $stmt = $pdo->prepare("SELECT id, otp_code, otp_expires_at FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        if ($user['otp_code'] === $otp && strtotime($user['otp_expires_at']) > time()) {
            http_response_code(200);
            echo json_encode(["message" => "OTP is valid. Proceed to reset password."]);
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Invalid or expired reset code."]);
        }
    } else {
        http_response_code(404);
        echo json_encode(["message" => "User not found."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data."]);
}
