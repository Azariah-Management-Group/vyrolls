<?php
require_once '../db.php';

$data = json_decode(file_get_contents("php://input"));

if (isset($data->name) && isset($data->email) && isset($data->password)) {
    $name = $data->name;
    $email = $data->email;
    $password = password_hash($data->password, PASSWORD_BCRYPT);

    try {
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)");
        $stmt->execute([$name, $email, $password]);
        http_response_code(201);
        echo json_encode(["message" => "User created successfully"]);
    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(["message" => "Email already exists or invalid data"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data"]);
}
