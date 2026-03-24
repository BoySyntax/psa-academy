<!DOCTYPE html>
<html>
<head>
    <title>Debug Notifications</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ccc; }
        pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
        .error { color: red; }
        .success { color: green; }
    </style>
</head>
<body>
    <h1>Debug Notifications System</h1>
    
    <div class="section">
        <h2>1. Test Student Notifications API</h2>
        <form method="post">
            <label>Student ID: <input type="number" name="student_id" value="9" required></label>
            <button type="submit" name="test_student_notifs">Test Student Notifications</button>
        </form>
        
        <?php
        if (isset($_POST['test_student_notifs'])) {
            $studentId = $_POST['student_id'];
            echo "<h3>Testing notifications for student $studentId</h3>";
            
            // Test the API endpoint
            $apiUrl = "http://localhost/charming_api/student/notifications.php?student_id=$studentId&only_unread=0";
            echo "<p>Calling: $apiUrl</p>";
            
            $context = stream_context_create([
                'http' => [
                    'method' => 'GET',
                    'header' => "Content-Type: application/json\r\n"
                ]
            ]);
            
            $response = file_get_contents($apiUrl, false, $context);
            
            if ($response === false) {
                echo "<p class='error'>Failed to call API</p>";
            } else {
                echo "<h4>API Response:</h4>";
                echo "<pre>" . htmlspecialchars($response) . "</pre>";
                
                $data = json_decode($response, true);
                if ($data && isset($data['success']) && $data['success']) {
                    echo "<p class='success'>API call successful!</p>";
                    echo "<p>Notifications count: " . count($data['notifications'] ?? []) . "</p>";
                    echo "<p>Unread count: " . ($data['unread_count'] ?? 0) . "</p>";
                } else {
                    echo "<p class='error'>API call failed</p>";
                }
            }
        }
        ?>
    </div>
    
    <div class="section">
        <h2>2. Check Database Tables</h2>
        <form method="post">
            <button type="submit" name="check_tables">Check Database Tables</button>
        </form>
        
        <?php
        if (isset($_POST['check_tables'])) {
            echo "<h3>Checking database tables...</h3>";
            
            try {
                $pdo = new PDO("mysql:host=localhost;dbname=charming_logins", "root", "");
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
                // Check course_enrollments table
                echo "<h4>Course Enrollments with notifications:</h4>";
                $stmt = $pdo->prepare("SELECT id, student_id, course_id, status, approved_at, student_seen, management_message FROM course_enrollments WHERE status IN ('enrolled', 'rejected') AND (management_message IS NOT NULL AND management_message != '') ORDER BY approved_at DESC LIMIT 10");
                $stmt->execute();
                $enrollments = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                if (count($enrollments) > 0) {
                    echo "<pre>" . json_encode($enrollments, JSON_PRETTY_PRINT) . "</pre>";
                } else {
                    echo "<p class='error'>No course enrollments with notifications found</p>";
                }
                
                // Check idp table
                echo "<h4>IDP records with notifications:</h4>";
                $stmt = $pdo->prepare("SELECT id, user_id, status, approved_at, management_message, rejection_reason FROM idp WHERE status IN ('approved', 'rejected') AND (management_message IS NOT NULL AND management_message != '') ORDER BY approved_at DESC LIMIT 10");
                $stmt->execute();
                $idps = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                if (count($idps) > 0) {
                    echo "<pre>" . json_encode($idps, JSON_PRETTY_PRINT) . "</pre>";
                } else {
                    echo "<p class='error'>No IDP records with notifications found</p>";
                }
                
                // Check for student 9 specifically
                echo "<h4>Records for Student ID 9:</h4>";
                $stmt = $pdo->prepare("
                    SELECT 'course' as type, id, student_id, course_id as reference_id, status, approved_at, management_message, rejection_reason 
                    FROM course_enrollments 
                    WHERE student_id = 9 AND status IN ('enrolled', 'rejected') AND (management_message IS NOT NULL AND management_message != '')
                    UNION ALL
                    SELECT 'idp' as type, id, user_id as student_id, id as reference_id, status, approved_at, management_message, rejection_reason 
                    FROM idp 
                    WHERE user_id = 9 AND status IN ('approved', 'rejected') AND (management_message IS NOT NULL AND management_message != '')
                    ORDER BY approved_at DESC
                ");
                $stmt->execute();
                $studentRecords = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                if (count($studentRecords) > 0) {
                    echo "<pre>" . json_encode($studentRecords, JSON_PRETTY_PRINT) . "</pre>";
                } else {
                    echo "<p class='error'>No notification records found for Student ID 9</p>";
                }
                
            } catch (PDOException $e) {
                echo "<p class='error'>Database error: " . $e->getMessage() . "</p>";
            }
        }
        ?>
    </div>
    
    <div class="section">
        <h2>3. Create Test Notifications</h2>
        <form method="post">
            <label>Student ID: <input type="number" name="test_student_id" value="9" required></label>
            <button type="submit" name="create_test_notifs">Create Test Notifications</button>
        </form>
        
        <?php
        if (isset($_POST['create_test_notifs'])) {
            $studentId = $_POST['test_student_id'];
            echo "<h3>Creating test notifications for student $studentId</h3>";
            
            try {
                $pdo = new PDO("mysql:host=localhost;dbname=charming_logins", "root", "");
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
                // Create test course enrollment notification
                $stmt = $pdo->prepare("
                    INSERT INTO course_enrollments (student_id, course_id, status, approved_at, student_seen, management_message) 
                    VALUES (?, 1, 'enrolled', NOW(), 0, 'Test course approval notification')
                ");
                $result = $stmt->execute([$studentId]);
                
                if ($result) {
                    echo "<p class='success'>Created test course enrollment notification</p>";
                } else {
                    echo "<p class='error'>Failed to create course notification</p>";
                }
                
                // Create test IDP notification
                $stmt = $pdo->prepare("
                    INSERT INTO idp (user_id, status, approved_at, management_message) 
                    VALUES (?, 'approved', NOW(), 'Test IDP approval notification')
                ");
                $result = $stmt->execute([$studentId]);
                
                if ($result) {
                    echo "<p class='success'>Created test IDP notification</p>";
                } else {
                    echo "<p class='error'>Failed to create IDP notification</p>";
                }
                
                echo "<p><strong>Now test the notifications API again to see if they appear!</strong></p>";
                
            } catch (PDOException $e) {
                echo "<p class='error'>Database error: " . $e->getMessage() . "</p>";
            }
        }
        ?>
    </div>
</body>
</html>
