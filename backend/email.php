<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/vendor/autoload.php';

function getEmailTemplate($content) {
    $year = date('Y');
    return "
    <div style='font-family: Arial, sans-serif; background-color: #121212; color: #ffffff; padding: 40px 20px; text-align: center;'>
        <h1 style='color: #D4AF37; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 5px;'>Vyrolls</h1>
        <p style='color: #a0a0a0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0;'>Drive Your World</p>
        <div style='background-color: #1e1e1e; max-width: 500px; margin: 30px auto; padding: 40px; border-radius: 12px; border: 1px solid #333;'>
            $content
        </div>
        <p style='color: #555; font-size: 12px;'>&copy; $year Vyrolls Ecosystem. All rights reserved.</p>
    </div>
    ";
}

function initMailer() {
    global $pdo;
    
    // Fetch settings from DB
    $settings = [];
    if (isset($pdo)) {
        $stmt = $pdo->query("SELECT key_name, key_value FROM site_settings WHERE key_name LIKE 'smtp_%'");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $settings[$row['key_name']] = $row['key_value'];
        }
    }

    $mail = new PHPMailer(true);
    $mail->isSMTP();
    
    // Use DB settings or fallback to defaults
    $mail->Host       = $settings['smtp_host'] ?? 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = $settings['smtp_username'] ?? 'podoremetropolis@gmail.com';
    $mail->Password   = $settings['smtp_password'] ?? 'ptfjtrjyaidmyqrf';
    
    $enc = $settings['smtp_encryption'] ?? 'ssl';
    $mail->SMTPSecure = ($enc === 'tls') ? PHPMailer::ENCRYPTION_STARTTLS : PHPMailer::ENCRYPTION_SMTPS;
    
    $mail->Port       = $settings['smtp_port'] ?? 465;
    $mail->setFrom($mail->Username, 'Vyrolls');
    return $mail;
}

function sendWelcomeEmail($toEmail, $toName) {
    try {
        $mail = initMailer();
        $mail->addAddress($toEmail, $toName);
        $mail->isHTML(true);
        $mail->Subject = 'Welcome to Vyrolls!';
        
        $content = "
            <h2 style='font-size: 22px; margin-bottom: 20px; color: #fff;'>Welcome $toName!</h2>
            <p style='color: #ccc; line-height: 1.6;'>We are thrilled to have you join Vyrolls. Get ready to access a higher standard of living and drive your world.</p>
            <a href='http://localhost:3000' style='display: inline-block; background-color: #D4AF37; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; margin-top: 20px; text-transform: uppercase; letter-spacing: 1px;'>Enter Ecosystem</a>
        ";
        
        $mail->Body    = getEmailTemplate($content);
        $mail->AltBody = "Welcome $toName! We are thrilled to have you join Vyrolls. Get ready to drive your world.";
        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Welcome email failed: " . $e->getMessage());
        return false;
    }
}

function sendOTPEmail($toEmail, $toName, $otpCode) {
    try {
        $mail = initMailer();
        $mail->addAddress($toEmail, $toName);
        $mail->isHTML(true);
        $mail->Subject = 'Your Vyrolls Verification Code';
        
        $content = "
            <h2 style='font-size: 20px; margin-bottom: 20px; color: #fff;'>Verification Code</h2>
            <p style='color: #ccc; margin-bottom: 30px; line-height: 1.6;'>Hello $toName,<br><br>Use the following 6-digit code to verify your account and securely log in.</p>
            <div style='font-size: 40px; font-weight: bold; letter-spacing: 8px; color: #D4AF37; margin-bottom: 30px;'>
                $otpCode
            </div>
            <p style='color: #888; font-size: 12px;'>This code expires in 15 minutes. If you did not request this, you can safely ignore this email.</p>
        ";
        
        $mail->Body    = getEmailTemplate($content);
        $mail->AltBody = "Hello $toName, your verification code is $otpCode. It expires in 15 minutes.";
        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("OTP email failed: " . $e->getMessage());
        return false;
    }
}

