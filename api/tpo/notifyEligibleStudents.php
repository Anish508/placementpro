<?php

require_once "../../middleware/authMiddleware.php";
require_once "../../utils/response.php";
require_once "../../config/database.php";

$user = authenticate("TPO");

$db = new Database();
$conn = $db->getConnection();

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['driveId'], $data['title'], $data['message'])) {
    jsonResponse(false, "Drive ID, Title and Message required", null, 400);
}

$driveId = intval($data['driveId']);
$title = $conn->real_escape_string($data['title']);
$message = $conn->real_escape_string($data['message']);

/* Get Drive Criteria */
$drive = $conn->query("SELECT * FROM Drive WHERE id=$driveId")->fetch_assoc();

if (!$drive) {
    jsonResponse(false, "Drive Not Found", null, 404);
}

/* Get Eligible Branches */
$branchResult = $conn->query("SELECT branchId FROM DriveBranch WHERE driveId=$driveId");

$branchIds = [];
while ($row = $branchResult->fetch_assoc()) {
    $branchIds[] = $row['branchId'];
}

$branchList = implode(",", $branchIds);

/* Find Eligible Students */
$eligibleQuery = "
SELECT User.id as userId
FROM Student
JOIN User ON Student.userId = User.id
WHERE Student.cgpa >= {$drive['minCgpa']}
AND Student.backlogCount <= {$drive['maxBacklogs']}
AND Student.branchId IN ($branchList)
";

$result = $conn->query($eligibleQuery);

$count = 0;

while ($row = $result->fetch_assoc()) {

    $conn->query("
        INSERT INTO Notification (userId, title, message)
        VALUES ({$row['userId']}, '$title', '$message')
    ");

    $count++;
}

jsonResponse(true, "Notification Sent to Eligible Students", [
    "notifiedCount" => $count
]);