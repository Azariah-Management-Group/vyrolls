<?php
require_once '../db.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->email) && isset($data->password)) {
    $email = $data->email;
    $password = $data->password;

    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password_hash'])) {
            if ($user['status'] === 'banned') {
                http_response_code(403);
                echo json_encode(["message" => "Your account has been banned."]);
                exit;
            }
            $now = time();
            $lastLogin = $user['last_login_at'] ? strtotime($user['last_login_at']) : 0;
            $sevenDays = 7 * 24 * 60 * 60;
            
            if (is_null($user['email_verified_at']) || ($now - $lastLogin > $sevenDays)) {
                // Needs OTP verification
                $otpCode = sprintf("%06d", mt_rand(1, 999999));
                $updateStmt = $pdo->prepare("UPDATE users SET otp_code = ?, otp_expires_at = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = ?");
                $updateStmt->execute([$otpCode, $user['id']]);
                
                require_once '../email.php';
                sendOTPEmail($user['email'], $user['name'], $otpCode);
                
                http_response_code(200);
                echo json_encode(["message" => "Session expired or unverified. Please verify your email.", "requireOtp" => true, "email" => $user['email']]);
            } else {
                // Normal login
                $updateStmt = $pdo->prepare("UPDATE users SET last_login_at = NOW() WHERE id = ?");
                $updateStmt->execute([$user['id']]);
                
                // Log activity
                $actStmt = $pdo->prepare("INSERT INTO user_activities (user_id, action, details) VALUES (?, ?, ?)");
                $actStmt->execute([$user['id'], 'login', 'User signed in successfully']);

                http_response_code(200);
                echo json_encode(["message" => "Login successful", "user" => ["id" => $user['id'], "name" => $user['name'], "email" => $user['email']]]);
            }
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Invalid email or password"]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Database error"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data"]);
}
