<?php
require_once '../../db.php';
require_once '../../email.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$data = json_decode(file_get_contents("php://input"), true);
$viewerId = isset($data['admin_id']) ? (int)$data['admin_id'] : null;

if (!$viewerId) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit;
}

$stmt = $pdo->prepare("SELECT email, role FROM users WHERE id = ?");
$stmt->execute([$viewerId]);
$adminUser = $stmt->fetch();

if (!$adminUser || $adminUser['role'] !== 'super_admin') {
    http_response_code(403);
    echo json_encode(["message" => "Forbidden: Super Admin access required"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $mail = initMailer();
        $mail->addAddress($adminUser['email'], 'Super Admin');
        $mail->isHTML(true);
        $mail->Subject = 'Vyrolls SMTP Configuration Test';
        
        $content = "
            <h2 style='font-size: 20px; margin-bottom: 20px; color: #fff;'>SMTP Test Successful</h2>
            <p style='color: #ccc; line-height: 1.6;'>If you are seeing this email, it means your dynamic SMTP configuration on the Vyrolls Admin panel is working correctly.</p>
        ";
        
        $mail->Body = getEmailTemplate($content);
        $mail->send();
        
        echo json_encode(["message" => "Test email sent successfully to " . $adminUser['email']]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "SMTP Test Failed. Error: " . $e->getMessage()]);
    }
}
?>
