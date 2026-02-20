<?php

require_once "../../middleware/authMiddleware.php";
require_once "../../utils/response.php";
require_once "../../config/database.php";

$user = authenticate("STUDENT");

$db = new Database();
$conn = $db->getConnection();

/*
|--------------------------------------------------------------------------
| Get Student ID
|--------------------------------------------------------------------------
*/

$studentQuery = "SELECT id FROM Student WHERE userId = {$user['id']} LIMIT 1";
$studentResult = $conn->query($studentQuery);

if (!$studentResult || $studentResult->num_rows == 0) {
    jsonResponse(false, "Student profile not found");
}

$student = $studentResult->fetch_assoc();
$studentId = intval($student['id']);

/*
|--------------------------------------------------------------------------
| GET CERTIFICATIONS
|--------------------------------------------------------------------------
*/

if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $result = $conn->query("
        SELECT id, name, issuer, year
        FROM Certification
        WHERE studentId = $studentId
        ORDER BY year DESC
    ");

    $certifications = [];

    while ($row = $result->fetch_assoc()) {
        $certifications[] = $row;
    }

    jsonResponse(true, "Certification List", $certifications);
}

/*
|--------------------------------------------------------------------------
| ADD CERTIFICATION
|--------------------------------------------------------------------------
*/

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['certName'], $data['issuer'], $data['year'])) {
        jsonResponse(false, "All fields are required");
    }

    $name = $conn->real_escape_string(trim($data['certName']));
    $issuer = $conn->real_escape_string(trim($data['issuer']));
    $year = intval($data['year']);

    if ($year < 1900 || $year > date("Y") + 1) {
        jsonResponse(false, "Invalid year");
    }

    $insertQuery = "
        INSERT INTO Certification (studentId, name, issuer, year)
        VALUES ($studentId, '$name', '$issuer', $year)
    ";

    if (!$conn->query($insertQuery)) {
        jsonResponse(false, "Insert failed: " . $conn->error);
    }

    jsonResponse(true, "Certification Added Successfully");
}

/*
|--------------------------------------------------------------------------
| DELETE CERTIFICATION
|--------------------------------------------------------------------------
*/

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {

    $data = json_decode(file_get_contents("php://input"), true);
    $certId = intval($data['certificationId'] ?? 0);

    if (!$certId) {
        jsonResponse(false, "Certification ID required");
    }

    $deleteQuery = "
        DELETE FROM Certification
        WHERE id = $certId
        AND studentId = $studentId
    ";

    if (!$conn->query($deleteQuery)) {
        jsonResponse(false, "Delete failed: " . $conn->error);
    }

    jsonResponse(true, "Certification Deleted Successfully");
}