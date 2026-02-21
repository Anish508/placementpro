<?php

/* ==============================
   CORS HEADERS
============================== */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

/* Handle Preflight Request */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/* ==============================
   DATABASE CONNECTION
============================== */
$conn = new mysqli("localhost", "root", "", "u508697926_form_db");

if ($conn->connect_error) {
    die(json_encode(["success"=>false,"message"=>"DB Connection Failed"]));
}

/* ==============================
   ACTIVE DRIVES
============================== */
$activeDrives = $conn->query("SELECT COUNT(*) as total FROM Drive WHERE status='OPEN'")
                     ->fetch_assoc()['total'];

/* ==============================
   TOTAL APPLICATIONS
============================== */
$applications = $conn->query("SELECT COUNT(*) as total FROM Application")
                     ->fetch_assoc()['total'];

/* ==============================
   TOTAL STUDENTS
============================== */
$totalStudents = $conn->query("SELECT COUNT(*) as total FROM Student")
                      ->fetch_assoc()['total'];

/* ==============================
   PLACED STUDENTS
============================== */
$placedStudents = $conn->query("SELECT COUNT(*) as total FROM Student WHERE placementStatus='PLACED'")
                       ->fetch_assoc()['total'];

$unplacedStudents = $totalStudents - $placedStudents;

/* ==============================
   PLACEMENT %
============================== */
$placementPercentage = $totalStudents > 0 
    ? round(($placedStudents / $totalStudents) * 100, 2) 
    : 0;

/* ==============================
   PACKAGE STATS
============================== */
$packageStats = $conn->query("
    SELECT 
        IFNULL(MAX(package),0) as highest,
        IFNULL(AVG(package),0) as average
    FROM PlacementRecord
")->fetch_assoc();

$highestPackage = $packageStats['highest'];
$averagePackage = round($packageStats['average'], 2);

/* ==============================
   RESPONSE
============================== */
echo json_encode([
    "success" => true,
    "activeDrives" => (int)$activeDrives,
    "applications" => (int)$applications,
    "totalStudents" => (int)$totalStudents,
    "placedStudents" => (int)$placedStudents,
    "unplacedStudents" => (int)$unplacedStudents,
    "placementPercentage" => $placementPercentage,
    "highestPackage" => (float)$highestPackage,
    "averagePackage" => (float)$averagePackage
]);

$conn->close();
?>