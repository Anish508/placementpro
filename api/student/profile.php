<?php

require_once "../../middleware/authMiddleware.php";
require_once "../../utils/response.php";
require_once "../../config/database.php";

$user = authenticate("STUDENT");

$db = new Database();
$conn = $db->getConnection();

/* =====================================
   GET PROFILE
===================================== */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $query = "
        SELECT 
            u.name,
            u.email,
            u.phone,
            u.profileImage,
            s.cgpa,
            s.backlogCount
        FROM Student s
        JOIN User u ON s.userId = u.id
        WHERE s.userId = {$user['id']}
    ";

    $result = $conn->query($query);

    if (!$result || $result->num_rows === 0) {
        jsonResponse(false, "Student profile not found");
    }

    $data = $result->fetch_assoc();

    jsonResponse(true, "Profile fetched successfully", $data);
}


/* =====================================
   UPDATE PROFILE
===================================== */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $email   = $_POST['email'] ?? '';
    $phone   = $_POST['phone'] ?? '';
    $cgpa    = floatval($_POST['cgpa'] ?? 0);
    $backlog = intval($_POST['backlogCount'] ?? 0);

    /* ================= VALIDATIONS ================= */

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(false, "Invalid email format");
    }

    if ($cgpa < 0 || $cgpa > 10) {
        jsonResponse(false, "CGPA must be between 0 and 10");
    }

    if ($backlog < 0) {
        jsonResponse(false, "Backlog cannot be negative");
    }

    /* Check duplicate email (except current user) */
    $checkEmail = $conn->query("
        SELECT id FROM User 
        WHERE email='$email' AND id != {$user['id']}
    ");

    if ($checkEmail->num_rows > 0) {
        jsonResponse(false, "Email already in use");
    }

    $email = $conn->real_escape_string($email);
    $phone = $conn->real_escape_string($phone);

    /* ================= IMAGE UPLOAD ================= */

    $imagePath = null;

    if (isset($_FILES['profileImage']) && $_FILES['profileImage']['error'] === 0) {

        $allowed = ['jpg','jpeg','png'];
        $ext = strtolower(pathinfo($_FILES['profileImage']['name'], PATHINFO_EXTENSION));

        if (!in_array($ext, $allowed)) {
            jsonResponse(false, "Only JPG, JPEG, PNG allowed");
        }

        if ($_FILES['profileImage']['size'] > 2 * 1024 * 1024) {
            jsonResponse(false, "Image must be less than 2MB");
        }

        $newName = "user_" . $user['id'] . "." . $ext;

        $uploadDir = "../../uploads/profiles/";
        $uploadPath = $uploadDir . $newName;

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        if (!move_uploaded_file($_FILES['profileImage']['tmp_name'], $uploadPath)) {
            jsonResponse(false, "Image upload failed");
        }

        $imagePath = "uploads/profiles/" . $newName;
    }

    /* ================= UPDATE USER ================= */

    $updateUserQuery = "
        UPDATE User 
        SET email='$email',
            phone='$phone'
            " . ($imagePath ? ", profileImage='$imagePath'" : "") . "
        WHERE id={$user['id']}
    ";

    if (!$conn->query($updateUserQuery)) {
        jsonResponse(false, "Failed to update user");
    }

    /* ================= UPDATE STUDENT ================= */

    $updateStudentQuery = "
        UPDATE Student 
        SET cgpa=$cgpa,
            backlogCount=$backlog
        WHERE userId={$user['id']}
    ";

    if (!$conn->query($updateStudentQuery)) {
        jsonResponse(false, "Failed to update student data");
    }

    jsonResponse(true, "Profile updated successfully");
}