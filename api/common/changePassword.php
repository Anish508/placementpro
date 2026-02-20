<?php

require_once "../../middleware/authMiddleware.php";
require_once "../../utils/response.php";
require_once "../../config/database.php";

$user = authenticate(); // any logged in user

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, "Invalid request method");
}

$data = json_decode(file_get_contents("php://input"), true);

$currentPassword = $data['currentPassword'] ?? '';
$newPassword = $data['newPassword'] ?? '';

if (strlen($newPassword) < 6) {
    jsonResponse(false, "Password must be at least 6 characters");
}

$db = new Database();
$conn = $db->getConnection();

/* Fetch existing hash */
$result = $conn->query("SELECT passwordHash FROM User WHERE id={$user['id']}");

$row = $result->fetch_assoc();

if (!password_verify($currentPassword, $row['passwordHash'])) {
    jsonResponse(false, "Current password is incorrect");
}

/* Hash new password */
$newHash = password_hash($newPassword, PASSWORD_BCRYPT);

$conn->query("
    UPDATE User 
    SET passwordHash='$newHash'
    WHERE id={$user['id']}
");

jsonResponse(true, "Password changed successfully");