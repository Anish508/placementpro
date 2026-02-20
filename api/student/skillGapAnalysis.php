<?php

require_once "../../middleware/authMiddleware.php";
require_once "../../utils/response.php";
require_once "../../config/database.php";

$user = authenticate("STUDENT");

$db = new Database();
$conn = $db->getConnection();

/* Get Student */
$studentQuery = "SELECT * FROM Student WHERE userId={$user['id']} LIMIT 1";
$student = $conn->query($studentQuery)->fetch_assoc();

if (!$student) {
    jsonResponse(false, "Student profile not found", null, 404);
}

/* Get Student Skills */
$studentSkillQuery = "
SELECT skillId 
FROM StudentSkill 
WHERE studentId={$student['id']}
";

$studentSkills = [];
$result = $conn->query($studentSkillQuery);

while ($row = $result->fetch_assoc()) {
    $studentSkills[] = $row['skillId'];
}

/* Get Top Skills from Placed Students */
$topSkillsQuery = "
SELECT StudentSkill.skillId, Skill.name, COUNT(*) as usageCount
FROM PlacementRecord
JOIN StudentSkill ON PlacementRecord.studentId = StudentSkill.studentId
JOIN Skill ON Skill.id = StudentSkill.skillId
GROUP BY StudentSkill.skillId
ORDER BY usageCount DESC
LIMIT 5
";

$topSkillsResult = $conn->query($topSkillsQuery);

$recommended = [];

while ($row = $topSkillsResult->fetch_assoc()) {

    if (!in_array($row['skillId'], $studentSkills)) {
        $recommended[] = [
            "skillId" => $row['skillId'],
            "skillName" => $row['name'],
            "demandCount" => $row['usageCount']
        ];
    }
}

jsonResponse(true, "Skill Gap Analysis", [
    "yourSkills" => $studentSkills,
    "recommendedSkills" => $recommended
]);