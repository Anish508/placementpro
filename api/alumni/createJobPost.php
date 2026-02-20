<?php

header("Content-Type: application/json");

require_once "../../middleware/authMiddleware.php";
require_once "../../utils/response.php";
require_once "../../config/database.php";

$user = authenticate("ALUMNI");

$db = new Database();
$conn = $db->getConnection();

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['title'], $data['description'])) {
    jsonResponse(false, "Title and Description required", null, 400);
}

$alumniQuery = "SELECT * FROM Alumni WHERE userId={$user['id']} LIMIT 1";
$alumni = $conn->query($alumniQuery)->fetch_assoc();

if (!$alumni) {
    jsonResponse(false, "Alumni profile not found", null, 404);
}

$title = $conn->real_escape_string($data['title']);
$description = $conn->real_escape_string($data['description']);

$query = "
INSERT INTO JobPost (alumniId, title, description)
VALUES ({$alumni['id']}, '$title', '$description')
";

if (!$conn->query($query)) {
    jsonResponse(false, "Job Post Failed", $conn->error, 500);
}

jsonResponse(true, "Job Posted Successfully");