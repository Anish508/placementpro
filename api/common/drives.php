<?php

require_once "../../middleware/authMiddleware.php";
require_once "../../utils/response.php";
require_once "../../config/database.php";

$user = authenticate();

$db = new Database();
$conn = $db->getConnection();

$role = $user['role'];
$studentId = null;
$studentBranchId = null;

$whereCondition = "d.status = 'OPEN'";

/*
|--------------------------------------------------------------------------
| If STUDENT → Get studentId + branchId
|--------------------------------------------------------------------------
*/

if ($role === "STUDENT") {

    $studentQuery = "
        SELECT id, branchId 
        FROM Student 
        WHERE userId = {$user['id']}
        LIMIT 1
    ";

    $studentResult = $conn->query($studentQuery);

    if (!$studentResult || $studentResult->num_rows === 0) {
        jsonResponse(false, "Student profile not found");
    }

    $student = $studentResult->fetch_assoc();
    $studentId = intval($student['id']);
    $studentBranchId = intval($student['branchId']);

    // Filter using DriveBranch table
    $whereCondition .= " AND d.id IN (
        SELECT driveId 
        FROM DriveBranch 
        WHERE branchId = $studentBranchId
    )";
}

/*
|--------------------------------------------------------------------------
| Fetch Drives
|--------------------------------------------------------------------------
*/

$query = "
SELECT 
    d.id,
    d.title,
    d.description,
    d.minCgpa,
    d.maxBacklogs,
    d.status,
    c.name AS companyName
FROM Drive d
JOIN Company c ON d.companyId = c.id
WHERE $whereCondition
ORDER BY d.createdAt DESC
";

$result = $conn->query($query);

$drives = [];

while ($row = $result->fetch_assoc()) {

    if ($role === "STUDENT") {

        $driveId = intval($row['id']);

        $appCheck = $conn->query("
            SELECT id 
            FROM Application 
            WHERE studentId = $studentId 
            AND driveId = $driveId
            LIMIT 1
        ");

        $row['isApplied'] = ($appCheck && $appCheck->num_rows > 0) ? 1 : 0;
    }

    $drives[] = $row;
}

jsonResponse(true, "Drives fetched successfully", $drives);