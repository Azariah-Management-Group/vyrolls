<?php
require 'db.php';
$stmt = $pdo->query('SELECT p.id, p.user_id, u.name FROM user_profiles p JOIN users u ON p.user_id = u.id');
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $name = preg_replace('/[^a-zA-Z0-9]/', '', strtolower($row['name']));
    $handle = '@' . $name . $row['user_id'];
    $pdo->prepare('UPDATE user_profiles SET handle = ? WHERE id = ?')->execute([$handle, $row['id']]);
    echo "Updated {$row['user_id']} to $handle\n";
}
?>
