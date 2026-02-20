<?php

require_once "../../middleware/authMiddleware.php";
require_once "../../utils/response.php";
require_once "../../config/database.php";

$user = authenticate("TPO");

$db = new Database();
$conn = $db->getConnection();

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['driveId'], $data['startTime'], $data['endTime'], $data['room'])) {
    jsonResponse(false, "All fields required", null, 400);
}

$driveId = intval($data['driveId']);
$startTime = $conn->real_escape_string($data['startTime']);
$endTime = $conn->real_escape_string($data['endTime']);
$room = $conn->real_escape_string($data['room']);

/* Prevent overlapping slots */
$overlapQuery = "
SELECT * FROM InterviewSlot
WHERE driveId=$driveId
AND room='$room'
AND (
    ('$startTime' BETWEEN startTime AND endTime)
    OR ('$endTime' BETWEEN startTime AND endTime)
)
";

$overlap = $conn->query($overlapQuery);

if ($overlap->num_rows > 0) {
    jsonResponse(false, "Time Slot Overlaps", null, 400);
}

/* Insert Slot */
$query = "
INSERT INTO InterviewSlot (driveId, startTime, endTime, room)
VALUES ($driveId, '$startTime', '$endTime', '$room')
";

if (!$conn->query($query)) {
    jsonResponse(false, "Slot Creation Failed", $conn->error, 500);
}

jsonResponse(true, "Interview Slot Created");