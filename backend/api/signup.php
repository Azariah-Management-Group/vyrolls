<?php
require_once '../db.php';
require_once '../email.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->name) && isset($data->email) && isset($data->password)) {
    $name = $data->name;
    $email = $data->email;
    $password = password_hash($data->password, PASSWORD_BCRYPT);

    try {
        // Generate a 6-digit OTP
        $otpCode = sprintf("%06d", mt_rand(1, 999999));
        
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, otp_code, otp_expires_at) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))");
        $stmt->execute([$name, $email, $password, $otpCode]);
        
        sendOTPEmail($email, $name, $otpCode);

        http_response_code(201);
        echo json_encode(["message" => "Account created. Please verify your email.", "requireOtp" => true, "email" => $email]);
    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(["message" => "Email already exists or invalid data"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data"]);
}
