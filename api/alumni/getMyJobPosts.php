<?php

require_once "../../middleware/authMiddleware.php";
require_once "../../utils/response.php";
require_once "../../config/database.php";

$user = authenticate("ALUMNI");

$db = new Database();
$conn = $db->getConnection();

/* Get Alumni Profile */
$alumniQuery = "SELECT * FROM Alumni WHERE userId={$user['id']} LIMIT 1";
$alumni = $conn->query($alumniQuery)->fetch_assoc();

if (!$alumni) {
    jsonResponse(false, "Alumni profile not found", null, 404);
}

/* Fetch Only His Job Posts */
$query = "
SELECT id, title, description, createdAt
FROM JobPost
WHERE alumniId={$alumni['id']}
ORDER BY createdAt DESC
";

$result = $conn->query($query);

$jobs = [];

while ($row = $result->fetch_assoc()) {
    $jobs[] = $row;
}

jsonResponse(true, "My Job Posts", $jobs);