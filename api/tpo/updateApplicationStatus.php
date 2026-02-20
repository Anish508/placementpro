<?php

require_once "../../middleware/authMiddleware.php";
require_once "../../utils/response.php";
require_once "../../config/database.php";

$user = authenticate("TPO");

$db = new Database();
$conn = $db->getConnection();

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['applicationId']) || !isset($data['status'])) {
    jsonResponse(false, "Application ID and Status Required", null, 400);
}

$applicationId = intval($data['applicationId']);
$status = $conn->real_escape_string($data['status']);

$allowedStatuses = [
    'APPLIED',
    'APTITUDE',
    'CLEARED',
    'INTERVIEW_SCHEDULED',
    'SELECTED',
    'REJECTED'
];

if (!in_array($status, $allowedStatuses)) {
    jsonResponse(false, "Invalid Status", null, 400);
}

$query = "UPDATE Application 
          SET status='$status' 
          WHERE id=$applicationId";

if (!$conn->query($query)) {
    jsonResponse(false, "Update Failed", $conn->error, 500);
}

jsonResponse(true, "Application Status Updated", [
    "newStatus" => $status
]);