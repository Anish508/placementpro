<?php

require_once "../../middleware/authMiddleware.php";
require_once "../../utils/response.php";
require_once "../../config/database.php";

$user = authenticate("STUDENT");

$db = new Database();
$conn = $db->getConnection();

/* Get Student Table ID using userId */
$studentQuery = $conn->query("
    SELECT id FROM Student WHERE userId = {$user['id']}
");

if(!$studentQuery || $studentQuery->num_rows === 0){
    jsonResponse(false, "Student record not found");
}

$studentRow = $studentQuery->fetch_assoc();
$studentId = $studentRow['id'];

/* Fetch Applications */
$query = "
    SELECT 
        d.title AS driveTitle,
        c.name AS companyName,
        a.status,
        a.appliedAt
    FROM Application a
    JOIN Drive d ON a.driveId = d.id
    JOIN Company c ON d.companyId = c.id
    WHERE a.studentId = $studentId
    ORDER BY a.appliedAt DESC
";

$result = $conn->query($query);

if(!$result){
    jsonResponse(false, "Query failed");
}

$data = [];

while($row = $result->fetch_assoc()){
    $data[] = $row;
}

jsonResponse(true, "Applications fetched", $data);