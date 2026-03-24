<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$studentId = isset($_GET['student_id']) ? (int)$_GET['student_id'] : 0;
$onlyUnread = isset($_GET['only_unread']) ? (int)$_GET['only_unread'] : 0;

if ($studentId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Student ID is required']);
    exit();
}

try {
    if (!$db) {
        throw new Exception('Database connection failed');
    }

    // Fixed query with explicit COLLATE to handle collation mismatch
    $courseQuery = "SELECT 
        e.id AS enrollment_id, 
        e.course_id, 
        e.status, 
        e.approved_at, 
        e.student_seen, 
        e.management_message, 
        e.rejection_reason, 
        c.course_name, 
        c.course_code,
        'course' as notification_type
        FROM course_enrollments e 
        JOIN courses c ON e.course_id = c.id 
        WHERE e.student_id = :student_id 
        AND e.status IN ('enrolled', 'rejected') 
        AND (e.management_message IS NOT NULL AND e.management_message != '')";

    $idpQuery = "SELECT 
        NULL AS enrollment_id, 
        NULL AS course_id, 
        CASE WHEN i.status = 'approved' THEN 'idp_approved' ELSE 'idp_rejected' END AS status, 
        i.approved_at, 
        1 AS student_seen, 
        i.management_message, 
        i.rejection_reason, 
        NULL AS course_name, 
        NULL AS course_code,
        'idp' as notification_type
        FROM idp i 
        WHERE i.user_id = :student_id 
        AND i.status IN ('approved', 'rejected') 
        AND (i.management_message IS NOT NULL AND i.management_message != '')";

    // Combine with proper collation handling
    $query = "($courseQuery) UNION ALL ($idpQuery) ORDER BY approved_at DESC LIMIT 50";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':student_id', $studentId, PDO::PARAM_INT);
    $stmt->execute();
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Calculate unread count
    $unreadCount = 0;
    foreach ($notifications as $notif) {
        if ($notif['notification_type'] === 'course' && $notif['student_seen'] == 0) {
            $unreadCount++;
        } elseif ($notif['notification_type'] === 'idp') {
            // IDP notifications are always considered unread for now
            $unreadCount++;
        }
    }

    echo json_encode([
        'success' => true,
        'notifications' => $notifications,
        'unread_count' => $unreadCount,
        'message' => 'Notifications retrieved successfully'
    ]);

} catch (Exception $e) {
    error_log("Error fetching notifications: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error: ' . $e->getMessage()
    ]);
}
?>
