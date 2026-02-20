<?php

require_once "../../middleware/authMiddleware.php";
require_once "../../utils/response.php";
require_once "../../config/database.php";

$user = authenticate("STUDENT");

$db = new Database();
$conn = $db->getConnection();

$query = "
SELECT id, title, message, isRead, createdAt
FROM Notification
WHERE userId={$user['id']}
ORDER BY createdAt DESC
";

$result = $conn->query($query);

$notifications = [];

while ($row = $result->fetch_assoc()) {
    $notifications[] = $row;
}

jsonResponse(true, "Your Notifications", $notifications);