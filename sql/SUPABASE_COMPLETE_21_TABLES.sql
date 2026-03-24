-- Complete PSA Academy Database Schema for Supabase (PostgreSQL)
-- All 21 tables from your MySQL system converted to PostgreSQL

-- Enable UUID extension for Supabase auth
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (core authentication and profile data)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'teacher', 'admin', 'management')) DEFAULT 'student',
  
  -- Personal Information
  first_name VARCHAR(255) NOT NULL,
  middle_name VARCHAR(255),
  last_name VARCHAR(255) NOT NULL,
  suffix VARCHAR(50),
  date_of_birth DATE NOT NULL,
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female', 'other')),
  blood_type VARCHAR(10),
  civil_status VARCHAR(50) NOT NULL,
  type_of_disability VARCHAR(100),
  religion VARCHAR(100),
  educational_attainment VARCHAR(100) NOT NULL,
  
  -- Address
  house_no_and_street VARCHAR(500) NOT NULL,
  barangay VARCHAR(255) NOT NULL,
  municipality VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  region VARCHAR(255) NOT NULL,
  
  -- Contact Information
  cellphone_number VARCHAR(20) NOT NULL,
  profile_image_url VARCHAR(500),
  
  -- Employment Details
  type_of_employment VARCHAR(100),
  civil_service_eligibility_level VARCHAR(100),
  salary_grade VARCHAR(50),
  present_position VARCHAR(255),
  office VARCHAR(255),
  service VARCHAR(255),
  division_province VARCHAR(255),
  
  -- Emergency Contact
  emergency_contact_name VARCHAR(255),
  emergency_contact_relationship VARCHAR(100),
  emergency_contact_address VARCHAR(500),
  emergency_contact_number VARCHAR(20),
  emergency_contact_email VARCHAR(255),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_code VARCHAR(50) UNIQUE NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  subcategory VARCHAR(100),
  duration_hours INTEGER,
  max_students INTEGER,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  thumbnail_url VARCHAR(500),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course modules table
CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course teachers assignment table (many-to-many)
CREATE TABLE IF NOT EXISTS course_teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (course_id, teacher_id)
);

-- Course enrollments table
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMPTZ DEFAULT NOW(),
  completion_date TIMESTAMPTZ NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'enrolled', 'in_progress', 'completed', 'dropped', 'rejected')) DEFAULT 'pending',
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ NULL,
  rejection_reason TEXT NULL,
  student_seen BOOLEAN DEFAULT FALSE,
  management_message TEXT NULL,
  UNIQUE (course_id, student_id)
);

-- Course lessons table
CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  lesson_title VARCHAR(255) NOT NULL,
  lesson_content TEXT,
  lesson_type TEXT NOT NULL CHECK (lesson_type IN ('video', 'document', 'quiz', 'assignment', 'reading')) DEFAULT 'reading',
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning materials table (files, videos, documents)
CREATE TABLE IF NOT EXISTS learning_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  material_name VARCHAR(255) NOT NULL,
  material_type TEXT NOT NULL CHECK (material_type IN ('pdf', 'video', 'image', 'document', 'link', 'other')),
  file_url VARCHAR(500) NOT NULL,
  file_size INTEGER,
  description TEXT,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student lesson progress tracking
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  time_spent_minutes INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ NULL,
  completed_at TIMESTAMPTZ NULL,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, lesson_id)
);

-- Capacity Development Plans table
CREATE TABLE IF NOT EXISTS capacity_development_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_year INTEGER NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  proposed_training_schedule VARCHAR(255) DEFAULT NULL,
  target_participants TEXT DEFAULT NULL,
  estimated_participants INTEGER DEFAULT NULL,
  status_notes TEXT DEFAULT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (plan_year, course_id)
);

-- Teacher Ratings table
CREATE TABLE IF NOT EXISTS teacher_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, course_id, teacher_id)
);

-- Skill Audit table (SATNA - Skill Audit and Training Needs Assessment)
CREATE TABLE IF NOT EXISTS skill_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  audit_data JSONB NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, year)
);

-- Career Leverage Inventory table (CLI)
CREATE TABLE IF NOT EXISTS career_leverage_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  cli_data JSONB NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, year)
);

-- Individual Development Plan table (IDP)
CREATE TABLE IF NOT EXISTS individual_development_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  idp_data JSONB NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, year)
);

-- Training Evaluations table
CREATE TABLE IF NOT EXISTS training_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  evaluation_data JSONB NOT NULL,
  level_1_data JSONB NULL,
  level_2_data JSONB NULL,
  level_3_data JSONB NULL,
  training_objectives TEXT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

-- Course Content table (general content)
CREATE TABLE IF NOT EXISTS course_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'document', 'image', 'link', 'quiz', 'assignment')),
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  file_url VARCHAR(500) NULL,
  content_data JSONB NULL,
  order_index INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Module tests table (pre-test and post-test)
CREATE TABLE IF NOT EXISTS module_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL CHECK (test_type IN ('pre_test', 'post_test')),
  test_title VARCHAR(255) NOT NULL,
  description TEXT,
  passing_score INTEGER DEFAULT 70,
  time_limit_minutes INTEGER DEFAULT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (module_id, test_type)
);

-- Test questions table
CREATE TABLE IF NOT EXISTS test_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES module_tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'multiple_choice',
  points INTEGER DEFAULT 1,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question answer options table
CREATE TABLE IF NOT EXISTS question_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES test_questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student test attempts table
CREATE TABLE IF NOT EXISTS student_test_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES module_tests(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ NULL,
  score DECIMAL(5,2) DEFAULT NULL,
  passed BOOLEAN DEFAULT NULL,
  time_taken_minutes INTEGER DEFAULT NULL
);

-- Student answers table
CREATE TABLE IF NOT EXISTS student_test_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES student_test_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES test_questions(id) ON DELETE CASCADE,
  selected_answer_id UUID REFERENCES question_answers(id) ON DELETE SET NULL,
  answer_text TEXT NULL,
  is_correct BOOLEAN DEFAULT NULL,
  points_earned DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (attempt_id, question_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_office ON users(office);
CREATE INDEX IF NOT EXISTS idx_users_service ON users(service);
CREATE INDEX IF NOT EXISTS idx_users_division_province ON users(division_province);

CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_subcategory ON courses(subcategory);
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);

CREATE INDEX IF NOT EXISTS idx_course_teachers_course ON course_teachers(course_id);
CREATE INDEX IF NOT EXISTS idx_course_teachers_teacher ON course_teachers(teacher_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON course_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_pending ON course_enrollments(status, enrollment_date);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_seen ON course_enrollments(student_id, student_seen);
CREATE INDEX IF NOT EXISTS idx_enrollments_completion ON course_enrollments(course_id, status, completion_date);

CREATE INDEX IF NOT EXISTS idx_modules_course ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_order ON course_modules(course_id, order_index);

CREATE INDEX IF NOT EXISTS idx_lessons_module ON course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_type ON course_lessons(lesson_type);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON course_lessons(is_published);

CREATE INDEX IF NOT EXISTS idx_materials_lesson ON learning_materials(lesson_id);
CREATE INDEX IF NOT EXISTS idx_materials_course ON learning_materials(course_id);
CREATE INDEX IF NOT EXISTS idx_materials_type ON learning_materials(material_type);

CREATE INDEX IF NOT EXISTS idx_progress_student ON lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_progress_status ON lesson_progress(status);

CREATE INDEX IF NOT EXISTS idx_content_course ON course_content(course_id);
CREATE INDEX IF NOT EXISTS idx_content_type ON course_content(content_type);
CREATE INDEX IF NOT EXISTS idx_content_order ON course_content(course_id, order_index);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_evaluations_user ON training_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_course ON training_evaluations(course_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_submitted ON training_evaluations(submitted_at);

CREATE INDEX IF NOT EXISTS idx_module_tests_module ON module_tests(module_id);
CREATE INDEX IF NOT EXISTS idx_module_tests_type ON module_tests(test_type);
CREATE INDEX IF NOT EXISTS idx_test_questions_test ON test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_question_answers_question ON question_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_student_attempts_student ON student_test_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_student_attempts_test ON student_test_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_attempt ON student_test_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_question ON student_test_answers(question_id);

-- JSONB indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_skill_audit_data ON skill_audit USING GIN (audit_data);
CREATE INDEX IF NOT EXISTS idx_cli_data ON career_leverage_inventory USING GIN (cli_data);
CREATE INDEX IF NOT EXISTS idx_idp_data ON individual_development_plans USING GIN (idp_data);
CREATE INDEX IF NOT EXISTS idx_eval_data ON training_evaluations USING GIN (evaluation_data);
CREATE INDEX IF NOT EXISTS idx_content_data ON course_content USING GIN (content_data);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacity_development_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_leverage_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_development_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_test_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = auth_id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = auth_id);
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND user_type = 'admin')
);
CREATE POLICY "Admins can update all users" ON users FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND user_type = 'admin')
);

-- RLS Policies for courses table
CREATE POLICY "Anyone can view published courses" ON courses FOR SELECT USING (status = 'published');
CREATE POLICY "Admins and teachers can view all courses" ON courses FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND user_type IN ('admin', 'teacher'))
);
CREATE POLICY "Admins can manage courses" ON courses FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND user_type = 'admin')
);

-- RLS Policies for course_enrollments
CREATE POLICY "Students can view their own enrollments" ON course_enrollments FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND id = student_id)
);
CREATE POLICY "Teachers can view their course enrollments" ON course_enrollments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM course_teachers ct 
    WHERE ct.course_id = course_enrollments.course_id 
    AND ct.teacher_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  )
);
CREATE POLICY "Admins and management can view all enrollments" ON course_enrollments FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND user_type IN ('admin', 'management'))
);
CREATE POLICY "Students can create enrollments" ON course_enrollments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND id = student_id)
);
CREATE POLICY "Admins and management can manage enrollments" ON course_enrollments FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND user_type IN ('admin', 'management'))
);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND id = user_id)
);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND id = user_id)
);

-- RLS Policies for test-related tables
CREATE POLICY "Students can view their own test attempts" ON student_test_attempts FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND id = student_id)
);
CREATE POLICY "Students can create test attempts" ON student_test_attempts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND id = student_id)
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at on all tables that have it
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_modules_updated_at BEFORE UPDATE ON course_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_lessons_updated_at BEFORE UPDATE ON course_lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_capacity_development_plans_updated_at BEFORE UPDATE ON capacity_development_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teacher_ratings_updated_at BEFORE UPDATE ON teacher_ratings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skill_audit_updated_at BEFORE UPDATE ON skill_audit FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_career_leverage_inventory_updated_at BEFORE UPDATE ON career_leverage_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_individual_development_plans_updated_at BEFORE UPDATE ON individual_development_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_evaluations_updated_at BEFORE UPDATE ON training_evaluations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_content_updated_at BEFORE UPDATE ON course_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_module_tests_updated_at BEFORE UPDATE ON module_tests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_questions_updated_at BEFORE UPDATE ON test_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
