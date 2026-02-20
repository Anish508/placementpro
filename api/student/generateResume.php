<?php

require_once "../../middleware/authMiddleware.php";
require_once "../../config/database.php";
require_once "../../utils/fpdf.php";

$user = authenticate("STUDENT");

$db = new Database();
$conn = $db->getConnection();

/* Get Student + User */
$query = "
SELECT User.name, User.email, User.phone,
       Student.cgpa, Student.graduationYear,
       Branch.name AS branchName
FROM Student
JOIN User ON Student.userId = User.id
JOIN Branch ON Student.branchId = Branch.id
WHERE User.id = {$user['id']}
LIMIT 1
";

$student = $conn->query($query)->fetch_assoc();

if (!$student) {
    die("Student profile not found");
}

/* Get Skills */
$skills = [];
$skillQuery = "
SELECT Skill.name
FROM StudentSkill
JOIN Skill ON Skill.id = StudentSkill.skillId
JOIN Student ON Student.id = StudentSkill.studentId
WHERE Student.userId = {$user['id']}
";

$result = $conn->query($skillQuery);
while ($row = $result->fetch_assoc()) {
    $skills[] = $row['name'];
}

/* Get Projects */
$projects = [];
$projectQuery = "
SELECT title, description, techStack
FROM Project
JOIN Student ON Student.id = Project.studentId
WHERE Student.userId = {$user['id']}
";

$result = $conn->query($projectQuery);
while ($row = $result->fetch_assoc()) {
    $projects[] = $row;
}

/* Create PDF */
$pdf = new FPDF();
$pdf->AddPage();
$pdf->SetFont("Arial","B",16);

$pdf->Cell(0,10,$student['name'],0,1);
$pdf->SetFont("Arial","",12);
$pdf->Cell(0,8,"Email: ".$student['email'],0,1);
$pdf->Cell(0,8,"Phone: ".$student['phone'],0,1);
$pdf->Ln(5);

$pdf->SetFont("Arial","B",14);
$pdf->Cell(0,10,"Education",0,1);
$pdf->SetFont("Arial","",12);
$pdf->Cell(0,8,"Branch: ".$student['branchName'],0,1);
$pdf->Cell(0,8,"CGPA: ".$student['cgpa'],0,1);
$pdf->Cell(0,8,"Graduation Year: ".$student['graduationYear'],0,1);
$pdf->Ln(5);

$pdf->SetFont("Arial","B",14);
$pdf->Cell(0,10,"Skills",0,1);
$pdf->SetFont("Arial","",12);
$pdf->MultiCell(0,8,implode(", ", $skills));
$pdf->Ln(5);

$pdf->SetFont("Arial","B",14);
$pdf->Cell(0,10,"Projects",0,1);
$pdf->SetFont("Arial","",12);

foreach ($projects as $project) {
    $pdf->Cell(0,8,$project['title'],0,1);
    $pdf->MultiCell(0,8,$project['description']);
    $pdf->Cell(0,8,"Tech Stack: ".$project['techStack'],0,1);
    $pdf->Ln(3);
}

/* Output PDF */
$pdf->Output("I","Resume.pdf");
exit;