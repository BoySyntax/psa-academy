<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Get the POST data
$data = json_decode(file_get_contents('php://input'), true);
$studentId = isset($data['student_id']) ? (int)$data['student_id'] : 0;
$enrollmentId = isset($data['enrollment_id']) ? (int)$data['enrollment_id'] : null;

echo "<h2>Debug Notifications Read</h2>";
echo "<p>Student ID: $studentId</p>";
echo "<p>Enrollment ID: " . ($enrollmentId ?? 'null') . "</p>";

if ($studentId <= 0) {
    echo "<p style='color: red;'>Error: Student ID is required</p>";
    exit();
}

try {
    if (!$db) {
        throw new Exception('Database connection failed');
    }

    // Set connection charset
    $db->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");

    echo "<h3>Current Notifications Status:</h3>";

    // Check course enrollments
    $stmt = $db->prepare("SELECT id, student_id, course_id, status, student_seen, management_message FROM course_enrollments WHERE student_id = :student_id AND status IN ('enrolled', 'rejected')");
    $stmt->bindParam(':student_id', $studentId, PDO::PARAM_INT);
    $stmt->execute();
    $courseEnrollments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "<h4>Course Enrollments:</h4>";
    echo "<pre>" . json_encode($courseEnrollments, JSON_PRETTY_PRINT) . "</pre>";

    // Check IDP records
    $stmt = $db->prepare("SELECT id, user_id, status, approved_at, management_message FROM idp WHERE user_id = :student_id AND status IN ('approved', 'rejected')");
    $stmt->bindParam(':student_id', $studentId, PDO::PARAM_INT);
    $stmt->execute();
    $idpRecords = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "<h4>IDP Records:</h4>";
    echo "<pre>" . json_encode($idpRecords, JSON_PRETTY_PRINT) . "</pre>";

    echo "<h3>Attempting to Mark as Read:</h3>";

    // Mark course enrollments as read
    if ($enrollmentId) {
        echo "<p>Marking specific course enrollment $enrollmentId as read...</p>";
        $stmt = $db->prepare("UPDATE course_enrollments SET student_seen = 1 WHERE id = :enrollment_id AND student_id = :student_id");
        $stmt->bindParam(':enrollment_id', $enrollmentId, PDO::PARAM_INT);
        $stmt->bindParam(':student_id', $studentId, PDO::PARAM_INT);
        $result = $stmt->execute();
        
        if ($result) {
            echo "<p style='color: green;'>Course enrollment marked as read</p>";
        } else {
            echo "<p style='color: red;'>Failed to mark course enrollment as read</p>";
        }
    } else {
        echo "<p>Marking ALL course enrollments as read...</p>";
        $stmt = $db->prepare("UPDATE course_enrollments SET student_seen = 1 WHERE student_id = :student_id AND status IN ('enrolled', 'rejected')");
        $stmt->bindParam(':student_id', $studentId, PDO::PARAM_INT);
        $result = $stmt->execute();
        
        if ($result) {
            echo "<p style='color: green;'>All course enrollments marked as read</p>";
        } else {
            echo "<p style='color: red;'>Failed to mark course enrollments as read</p>";
        }
    }

    // For IDP, we need to handle it differently since there's no student_seen column
    echo "<p>Note: IDP notifications don't have a student_seen column, so they're always considered 'unread' by the current system</p>";

    echo "<h3>Updated Status:</h3>";

    // Check updated status
    $stmt = $db->prepare("SELECT id, student_id, course_id, status, student_seen, management_message FROM course_enrollments WHERE student_id = :student_id AND status IN ('enrolled', 'rejected')");
    $stmt->bindParam(':student_id', $studentId, PDO::PARAM_INT);
    $stmt->execute();
    $updatedEnrollments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "<h4>Updated Course Enrollments:</h4>";
    echo "<pre>" . json_encode($updatedEnrollments, JSON_PRETTY_PRINT) . "</pre>";

} catch (Exception $e) {
    echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>";
}
?>
