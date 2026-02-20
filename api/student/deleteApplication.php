<?php

require_once "../../middleware/authMiddleware.php";
require_once "../../config/database.php";

$user = authenticate("STUDENT");

$db = new Database();
$conn = $db->getConnection();

if ($_SERVER['REQUEST_METHOD'] !== "DELETE") {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid method"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$applicationId = $input['applicationId'] ?? null;

if (!$applicationId) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Application ID required"]);
    exit;
}

/*
|--------------------------------------------------------------------------
| Get Student ID using logged-in user
|--------------------------------------------------------------------------
*/

$studentQuery = "SELECT id FROM Student WHERE userId = {$user['id']} LIMIT 1";
$studentResult = $conn->query($studentQuery);

if (!$studentResult || $studentResult->num_rows == 0) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Student not found"]);
    exit;
}

$student = $studentResult->fetch_assoc();
$studentId = $student['id'];

/*
|--------------------------------------------------------------------------
| Verify ownership
|--------------------------------------------------------------------------
*/

$verifyQuery = "
    SELECT id FROM Application 
    WHERE id = $applicationId 
    AND studentId = $studentId
";

$verifyResult = $conn->query($verifyQuery);

if (!$verifyResult || $verifyResult->num_rows == 0) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Not authorized"]);
    exit;
}

/*
|--------------------------------------------------------------------------
| Delete Application
|--------------------------------------------------------------------------
*/

$deleteQuery = "DELETE FROM Application WHERE id = $applicationId";

if ($conn->query($deleteQuery)) {
    echo json_encode(["success" => true, "message" => "Application deleted successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Delete failed: " . $conn->error]);
}