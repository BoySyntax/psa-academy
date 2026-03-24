# Module Pre-Test and Post-Test Feature - Deployment Guide

## Overview
This feature allows teachers to create pre-tests and post-tests for each module. Students must take these tests before and after completing module content.

## Database Setup

### 1. Run the SQL Migration
Execute the following SQL file to create the necessary database tables:
```sql
-- File: ADD_MODULE_TESTS.sql
```

This creates the following tables:
- `module_tests` - Stores pre-test and post-test configurations
- `test_questions` - Stores questions for each test
- `question_answers` - Stores answer options for questions
- `student_test_attempts` - Tracks student test attempts
- `student_test_answers` - Stores student answers

## Backend API Setup

### 2. Deploy PHP API Files
Copy the following PHP files to your API directory (`/xampp/htdocs/charming_api/`):

#### Admin Endpoints (for teachers/admins):
- `api_module_tests.php` → `/xampp/htdocs/charming_api/admin/module-tests.php`
  - Manages module tests (create, read, update, delete)
  
- `api_test_questions.php` → `/xampp/htdocs/charming_api/admin/test-questions.php`
  - Manages test questions and answers

#### Student Endpoints:
- `api_student_tests.php` → `/xampp/htdocs/charming_api/student/tests.php`
  - Allows students to view tests, start attempts, and submit answers

## Frontend Setup

### 3. New Files Created
The following new files have been added to the frontend:

#### Services:
- `src/services/moduleTests.ts` - Service for all test-related API calls

#### Components:
- `src/components/TestManagementDialog.tsx` - Teacher UI for creating/editing tests
- `src/components/StudentTestTaking.tsx` - Student UI for taking tests

### 4. Modified Files
The following existing files were updated:

#### Content Management (Teacher):
- `src/pages/admin/ContentManagement.tsx`
  - Added "Create Pre-Test" and "Create Post-Test" buttons for each module
  - Integrated TestManagementDialog component

## Feature Workflow

### Teacher Workflow:
1. Navigate to Content Management
2. Select a course
3. Expand a module
4. Click "Create Pre-Test" or "Create Post-Test"
5. Configure test settings (title, passing score, time limit)
6. Save test settings
7. Add questions with answer options
8. Mark correct answers
9. Publish test when ready

### Student Workflow:
1. Navigate to a course module (CourseViewer)
2. See available pre-test before module content
3. Take pre-test
4. View results (pass/fail)
5. Access module content after passing pre-test
6. Complete module lessons
7. Take post-test after completing module
8. View final results

## Test Types

### Pre-Test
- Must be taken before accessing module content
- Tests student's prior knowledge
- Can be used to determine if student can skip module

### Post-Test
- Taken after completing module content
- Validates student learning
- Required to mark module as complete

## Question Types Supported

**Multiple Choice Only** - Students select one correct answer from multiple options (2-10 answer choices)

## API Endpoints Reference

### Admin/Teacher Endpoints:

**GET** `/admin/module-tests.php?module_id={id}`
- Get all tests for a module

**GET** `/admin/module-tests.php?test_id={id}`
- Get specific test with questions

**POST** `/admin/module-tests.php`
- Create new test

**PUT** `/admin/module-tests.php`
- Update test settings

**DELETE** `/admin/module-tests.php`
- Delete test

**GET** `/admin/test-questions.php?test_id={id}`
- Get all questions for a test

**POST** `/admin/test-questions.php`
- Create new question with answers

**PUT** `/admin/test-questions.php`
- Update question

**DELETE** `/admin/test-questions.php`
- Delete question

### Student Endpoints:

**GET** `/student/tests.php?module_id={id}&student_id={id}`
- Get available tests for module with student's attempt status

**GET** `/student/tests.php?test_id={id}&student_id={id}`
- Get test questions for taking (without correct answers shown)

**POST** `/student/tests.php` (action: start)
- Start a new test attempt

**POST** `/student/tests.php` (action: submit)
- Submit test answers and get results

**GET** `/student/tests.php?attempt_id={id}`
- Get detailed results of a completed attempt

## Testing Checklist

- [ ] Database tables created successfully
- [ ] API files deployed to correct locations
- [ ] Teacher can create pre-test for a module
- [ ] Teacher can add multiple-choice questions
- [ ] Teacher can add true/false questions
- [ ] Teacher can mark correct answers
- [ ] Teacher can publish test
- [ ] Student can see available tests
- [ ] Student can start test attempt
- [ ] Student can answer questions
- [ ] Student can submit test
- [ ] Student sees correct score and pass/fail status
- [ ] Test results are saved in database

## Next Steps (Optional Enhancements)

1. **CourseViewer Integration** - Add test prompts in CourseViewer to enforce pre-test before module access
2. **Test Analytics** - Add teacher dashboard to view student test performance
3. **Retake Logic** - Allow/prevent test retakes based on configuration
4. **Question Bank** - Create reusable question library
5. **Randomization** - Randomize question and answer order
6. **Timer** - Add countdown timer for timed tests
7. **Manual Grading** - Add interface for grading short answer questions

## Troubleshooting

### Common Issues:

**Tests not showing for students:**
- Verify test is published (`is_published = 1`)
- Check student is enrolled in course
- Verify API endpoint is accessible

**Questions not saving:**
- Check that test is created first before adding questions
- Verify at least one answer is marked as correct
- Check database foreign key constraints

**Score calculation incorrect:**
- Verify correct answers are properly marked in database
- Check points assigned to each question
- Review student_test_answers table for is_correct values
