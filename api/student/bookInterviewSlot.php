<?php

require_once "../../middleware/authMiddleware.php";
require_once "../../utils/response.php";
require_once "../../config/database.php";

$user = authenticate("STUDENT");

$db = new Database();
$conn = $db->getConnection();

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['slotId'], $data['driveId'])) {
    jsonResponse(false, "Slot ID and Drive ID required", null, 400);
}

$slotId = intval($data['slotId']);
$driveId = intval($data['driveId']);

/* Get Student */
$studentQuery = "SELECT * FROM Student WHERE userId={$user['id']} LIMIT 1";
$student = $conn->query($studentQuery)->fetch_assoc();

/* Check if already booked */
$existingCheck = $conn->query("
    SELECT * FROM StudentInterview
    WHERE studentId={$student['id']}
    AND driveId=$driveId
");

if ($existingCheck->num_rows > 0) {
    jsonResponse(false, "You already booked an interview slot for this drive", null, 400);
}

/* Check Slot Available */
$slotQuery = "SELECT * FROM InterviewSlot WHERE id=$slotId AND isBooked=0";
$slotResult = $conn->query($slotQuery);

if ($slotResult->num_rows == 0) {
    jsonResponse(false, "Slot Not Available", null, 400);
}

$conn->begin_transaction();

try {

    $conn->query("UPDATE InterviewSlot SET isBooked=1 WHERE id=$slotId");

    $conn->query("
        INSERT INTO StudentInterview (studentId, driveId, slotId)
        VALUES ({$student['id']}, $driveId, $slotId)
    ");

    $conn->query("
        UPDATE Application 
        SET status='INTERVIEW_SCHEDULED'
        WHERE studentId={$student['id']} 
        AND driveId=$driveId
    ");

    $conn->commit();

    jsonResponse(true, "Interview Scheduled Successfully");

} catch (Exception $e) {
    $conn->rollback();
    jsonResponse(false, "Booking Failed", $e->getMessage(), 500);
}