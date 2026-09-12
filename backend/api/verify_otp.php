<?php
require_once '../db.php';
require_once '../email.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->email) && isset($data->otp)) {
    $email = $data->email;
    $otp = $data->otp;

    $stmt = $pdo->prepare("SELECT id, name, otp_code, otp_expires_at, email_verified_at FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        if ($user['otp_code'] === $otp && strtotime($user['otp_expires_at']) > time()) {
            
            // Send welcome email if first verification
            if (is_null($user['email_verified_at'])) {
                sendWelcomeEmail($email, $user['name']);
            }
            
            // Verify success
            $updateStmt = $pdo->prepare("UPDATE users SET email_verified_at = NOW(), last_login_at = NOW(), otp_code = NULL, otp_expires_at = NULL WHERE id = ?");
            $updateStmt->execute([$user['id']]);

            http_response_code(200);
            echo json_encode(["message" => "Verification successful", "user" => ["id" => $user['id'], "name" => $user['name'], "email" => $email]]);
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Invalid or expired verification code"]);
        }
    } else {
        http_response_code(404);
        echo json_encode(["message" => "User not found"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data"]);
}
