<?php

require_once "../../middleware/authMiddleware.php";
require_once "../../utils/response.php";
require_once "../../config/database.php";

$user = authenticate("STUDENT");

$db = new Database();
$conn = $db->getConnection();

if (!isset($_GET['driveId'])) {
    jsonResponse(false, "Drive ID required", null, 400);
}

$driveId = intval($_GET['driveId']);

/* Fetch available slots */
$query = "
SELECT id, startTime, endTime, room
FROM InterviewSlot
WHERE driveId=$driveId
AND isBooked=0
ORDER BY startTime ASC
";

$result = $conn->query($query);

$slots = [];

while ($row = $result->fetch_assoc()) {
    $slots[] = $row;
}

jsonResponse(true, "Available Slots", $slots);