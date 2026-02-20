<?php

require_once "../../middleware/authMiddleware.php";
require_once "../../utils/response.php";
require_once "../../config/database.php";

$user = authenticate("TPO");

$db = new Database();
$conn = $db->getConnection();

/* Total Students */
$totalStudents = $conn->query("SELECT COUNT(*) as count FROM Student")->fetch_assoc()['count'];

/* Placed Students */
$placedStudents = $conn->query("
SELECT COUNT(*) as count 
FROM Student 
WHERE placementStatus='PLACED'
")->fetch_assoc()['count'];

/* Unplaced */
$unplaced = $totalStudents - $placedStudents;

/* Total Drives */
$totalDrives = $conn->query("SELECT COUNT(*) as count FROM Drive")->fetch_assoc()['count'];

/* Total Applications */
$totalApplications = $conn->query("SELECT COUNT(*) as count FROM Application")->fetch_assoc()['count'];

/* Average Package */
$avgPackage = $conn->query("
SELECT AVG(package) as avgPackage 
FROM PlacementRecord
")->fetch_assoc()['avgPackage'];

$avgPackage = $avgPackage ? round($avgPackage,2) : 0;

/* Top Hiring Company */
$topCompanyQuery = "
SELECT Company.name, COUNT(*) as hires
FROM PlacementRecord
JOIN Company ON PlacementRecord.companyId = Company.id
GROUP BY companyId
ORDER BY hires DESC
LIMIT 1
";

$topCompanyResult = $conn->query($topCompanyQuery);

$topCompany = $topCompanyResult->num_rows > 0 
    ? $topCompanyResult->fetch_assoc() 
    : null;

jsonResponse(true, "Placement Analytics", [
    "totalStudents" => $totalStudents,
    "placedStudents" => $placedStudents,
    "unplacedStudents" => $unplaced,
    "totalDrives" => $totalDrives,
    "totalApplications" => $totalApplications,
    "averagePackage" => $avgPackage,
    "topHiringCompany" => $topCompany
]);