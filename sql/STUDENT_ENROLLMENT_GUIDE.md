# Student Course Enrollment System - Complete Guide

## Overview

The student enrollment system allows students to:
1. Browse available courses
2. Enroll in courses
3. View enrolled courses with progress tracking
4. Access course content with modules and lessons
5. Track learning progress

## Features Implemented

### 1. My Courses Dashboard (Like Reference Image 2)
**Page:** `src/pages/student/MyCourses.tsx`

**Features:**
- ✅ Course Finder search bar
- ✅ Filter tabs: All, In progress, Future, Past
- ✅ Grid/List view toggle
- ✅ Course cards showing:
  - Course thumbnail
  - Course name and code
  - Enrollment status badge
  - Progress bar with percentage
  - Duration and category
  - "Continue Learning" button
- ✅ Link to browse all available courses

**Access:** Students click "My Courses" in sidebar

---

### 2. Course Viewer with Sidebar Menu (Like Reference Image 1)
**Page:** `src/pages/student/CourseViewer.tsx`

**Features:**
- ✅ Collapsible sidebar with course menu
- ✅ Expandable modules with lessons
- ✅ Lesson status icons:
  - ⭕ Not Started (gray circle)
  - 🔵 In Progress (blue filled circle)
  - ✅ Completed (green checkmark)
  - 🔒 Locked (not published)
- ✅ Lesson type icons (video, document, quiz, etc.)
- ✅ Top header with:
  - Course name and code
  - Progress bar
  - Statistics (Enrolled, Completed, In Progress, Yet to Start)
- ✅ Main content area showing:
  - Selected lesson content
  - Learning materials
  - "Mark as Complete" button
- ✅ Mobile responsive with hamburger menu

**Access:** Click on any course card in "My Courses"

---

### 3. Available Courses (Browse & Enroll)
**Page:** `src/pages/student/AvailableCourses.tsx`

**Features:**
- ✅ Search courses by name, code, or category
- ✅ Course cards with:
  - Thumbnail
  - Course details
  - Duration, category, max students
  - "Enroll Now" button
- ✅ Only shows courses student is NOT enrolled in
- ✅ Only shows published courses
- ✅ Enrollment with capacity checking

**Access:** Click "Browse All Courses" button in My Courses

---

## Database Schema

### Tables Used

1. **`courses`** - Course information
2. **`course_modules`** - Course modules/sections
3. **`course_lessons`** - Individual lessons within modules
4. **`course_enrollments`** - Student enrollments with progress
5. **`lesson_progress`** - Individual lesson completion tracking
6. **`learning_materials`** - Files, videos, documents for lessons

All tables are already created in your database schemas:
- `DATABASE_COURSES_SCHEMA.sql`
- `DATABASE_CONTENT_SCHEMA.sql`

---

## Backend API Endpoints

### Student Enrollment APIs

All located in `c:/xampp/htdocs/charming_api/student/`

#### 1. Get My Enrollments
```
GET /student/enrollments.php?student_id={id}
```
Returns all courses the student is enrolled in with progress.

#### 2. Get Available Courses
```
GET /student/available-courses.php?student_id={id}
```
Returns published courses the student is NOT enrolled in.

#### 3. Enroll in Course
```
POST /student/enroll.php
Body: { "student_id": "1", "course_id": 1 }
```
Enrolls student in a course (checks capacity).

#### 4. Get Course Content
```
GET /student/course-content.php?course_id={id}&student_id={id}
```
Returns course with modules, lessons, and student's progress.

#### 5. Update Lesson Progress
```
POST /student/lesson-progress.php
Body: {
  "student_id": "1",
  "lesson_id": 1,
  "status": "completed",
  "progress_percentage": 100
}
```
Updates lesson progress and recalculates course progress.

#### 6. Get Lesson Details
```
GET /student/lesson.php?lesson_id={id}&student_id={id}
```
Returns lesson content and learning materials.

---

## How to Use

### For Students

1. **Login** as a student user
2. **Click "My Courses"** in sidebar
3. **Browse enrolled courses** or click "Browse All Courses"
4. **Enroll in a course** by clicking "Enroll Now"
5. **View course** by clicking on course card
6. **Navigate lessons** using sidebar menu
7. **Complete lessons** by clicking "Mark as Complete"
8. **Track progress** via progress bar and statistics

### For Admins/Teachers

1. **Create courses** via Course Management
2. **Add modules** to courses
3. **Add lessons** to modules
4. **Publish courses** to make them available to students
5. **Set max students** to limit enrollment

---

## Progress Tracking

### Lesson Progress
- **Not Started** - Lesson never opened
- **In Progress** - Lesson opened but not completed
- **Completed** - Student marked lesson as complete

### Course Progress
- Automatically calculated based on completed lessons
- Formula: `(completed_lessons / total_lessons) * 100`
- Updates enrollment status:
  - `enrolled` → `in_progress` → `completed`

### Enrollment Status
- **enrolled** - Just enrolled, no lessons started
- **in_progress** - At least one lesson started
- **completed** - All lessons completed (100%)
- **dropped** - Student dropped the course

---

## Setup Instructions

### 1. Database Setup
Make sure all tables are created:
```sql
SOURCE DATABASE_COURSES_SCHEMA.sql;
SOURCE DATABASE_CONTENT_SCHEMA.sql;
```

### 2. Create Sample Course Structure

```sql
-- Create a course
INSERT INTO courses (course_code, course_name, description, status) 
VALUES ('CS101', 'Introduction to Programming', 'Learn programming basics', 'published');

-- Create modules
INSERT INTO course_modules (course_id, module_name, order_index)
VALUES 
(1, 'Introduction', 1),
(1, 'Variables and Data Types', 2),
(1, 'Control Structures', 3);

-- Create lessons
INSERT INTO course_lessons (module_id, lesson_title, lesson_content, lesson_type, order_index, is_published)
VALUES 
(1, 'Welcome to Programming', '<h2>Welcome!</h2><p>This course will teach you...</p>', 'reading', 1, 1),
(1, 'Setting Up Your Environment', '<h2>Setup</h2><p>Install the following...</p>', 'video', 2, 1),
(2, 'What are Variables?', '<h2>Variables</h2><p>Variables store data...</p>', 'reading', 1, 1);
```

### 3. Test Enrollment Flow

1. Login as student
2. Go to "My Courses"
3. Click "Browse All Courses"
4. Enroll in "CS101"
5. Click on course to view content
6. Navigate through lessons
7. Mark lessons as complete
8. Watch progress update

---

## Key Differences from Reference Images

### Similarities ✅
- Sidebar course menu with expandable modules
- Progress tracking with statistics
- Course cards with thumbnails
- Grid/List view options
- Search and filter functionality

### Enhancements 🚀
- Real-time progress calculation
- Automatic enrollment status updates
- Material attachments for lessons
- Mobile responsive design
- Toast notifications for actions
- Loading states and error handling

---

## Next Steps (Optional Enhancements)

1. **Add quizzes and assignments** - Interactive assessments
2. **Add certificates** - Generate on course completion
3. **Add discussion forums** - Student collaboration
4. **Add notifications** - Email/push for new content
5. **Add course ratings** - Student feedback
6. **Add bookmarks** - Save favorite lessons
7. **Add notes** - Student can take notes per lesson
8. **Add video player** - Embedded video lessons
9. **Add file uploads** - For assignment submissions

---

## Troubleshooting

### Courses not showing
- Check course status is `published`
- Verify student is logged in
- Check database connection

### Enrollment fails
- Check course capacity (max_students)
- Verify student not already enrolled
- Check database foreign keys

### Progress not updating
- Verify lesson_progress table exists
- Check student_id matches
- Look at browser console for errors

### Sidebar not showing lessons
- Verify course_modules table has data
- Check course_lessons linked to modules
- Ensure lessons have is_published = 1

---

## Summary

You now have a **complete student enrollment system** with:
- ✅ Course browsing and enrollment
- ✅ Course viewer with sidebar navigation
- ✅ Progress tracking (lesson and course level)
- ✅ Modern UI matching reference images
- ✅ Full backend API support
- ✅ Mobile responsive design

Students can enroll in courses, view content, track progress, and complete lessons just like a professional LMS!
