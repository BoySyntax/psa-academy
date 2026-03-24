const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/charming_api';

export type TestType = 'pre_test' | 'post_test';
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export interface ModuleTest {
  id: number;
  module_id: number;
  test_type: TestType;
  test_title: string;
  description?: string;
  passing_score: number;
  time_limit_minutes?: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  questions?: TestQuestion[];
}

export interface TestQuestion {
  id: number;
  test_id: number;
  question_text: string;
  question_type: QuestionType;
  points: number;
  order_index: number;
  created_at: string;
  updated_at: string;
  answers?: QuestionAnswer[];
}

export interface QuestionAnswer {
  id: number;
  question_id: number;
  answer_text: string;
  is_correct: boolean;
  order_index: number;
  created_at: string;
}

export interface CreateTestData {
  module_id: number;
  test_type: TestType;
  test_title?: string;
  description?: string;
  passing_score?: number;
  time_limit_minutes?: number;
  is_published?: boolean;
}

export interface UpdateTestData {
  id: number;
  test_title?: string;
  description?: string;
  passing_score?: number;
  time_limit_minutes?: number;
  is_published?: boolean;
}

export interface CreateQuestionData {
  test_id: number;
  question_text: string;
  question_type: QuestionType;
  points?: number;
  order_index?: number;
  answers?: {
    answer_text: string;
    is_correct: boolean;
    order_index?: number;
  }[];
}

export interface UpdateQuestionData {
  id: number;
  question_text?: string;
  question_type?: QuestionType;
  points?: number;
  order_index?: number;
  answers?: {
    answer_text: string;
    is_correct: boolean;
    order_index?: number;
  }[];
}

export interface StudentTestAttempt {
  id: number;
  test_id: number;
  student_id: number;
  started_at: string;
  completed_at?: string;
  score?: number;
  passed?: boolean;
  time_taken_minutes?: number;
}

export interface StudentAnswer {
  question_id: number;
  selected_answer_id?: number;
  answer_text?: string;
}

export const moduleTestsService = {
  // Test Management
  async getModuleTests(moduleId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/module-tests.php?module_id=${moduleId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          tests: result.tests || [],
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to fetch tests',
          tests: [],
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch tests',
        tests: [],
      };
    }
  },

  async getTestById(testId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/module-tests.php?test_id=${testId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          test: result.test,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to fetch test',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch test',
      };
    }
  },

  async createTest(data: CreateTestData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/module-tests.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message || 'Test created successfully',
          test_id: result.test_id,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to create test',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create test',
      };
    }
  },

  async updateTest(data: UpdateTestData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/module-tests.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message || 'Test updated successfully',
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to update test',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update test',
      };
    }
  },

  async deleteTest(testId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/module-tests.php`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: testId }),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message || 'Test deleted successfully',
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to delete test',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete test',
      };
    }
  },

  // Question Management
  async getTestQuestions(testId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/test-questions.php?test_id=${testId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          questions: result.questions || [],
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to fetch questions',
          questions: [],
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch questions',
        questions: [],
      };
    }
  },

  async createQuestion(data: CreateQuestionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/test-questions.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message || 'Question created successfully',
          question_id: result.question_id,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to create question',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create question',
      };
    }
  },

  async updateQuestion(data: UpdateQuestionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/test-questions.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message || 'Question updated successfully',
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to update question',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update question',
      };
    }
  },

  async deleteQuestion(questionId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/test-questions.php`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: questionId }),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message || 'Question deleted successfully',
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to delete question',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete question',
      };
    }
  },

  // Student Test Taking
  async getModuleTestsForStudent(moduleId: number, studentId: number) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/student/tests.php?module_id=${moduleId}&student_id=${studentId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          tests: result.tests || [],
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to fetch tests',
          tests: [],
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch tests',
        tests: [],
      };
    }
  },

  async getTestForStudent(testId: number, studentId: number) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/student/tests.php?test_id=${testId}&student_id=${studentId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          test: result.test,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to fetch test',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch test',
      };
    }
  },

  async startTestAttempt(testId: number, studentId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/student/tests.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start',
          test_id: testId,
          student_id: studentId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message || 'Test started',
          attempt_id: result.attempt_id,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to start test',
          already_completed: result.already_completed,
          attempt_id: result.attempt_id,
          score: result.score,
          passed: result.passed,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to start test',
      };
    }
  },

  async submitTestAnswers(attemptId: number, answers: StudentAnswer[]) {
    try {
      const response = await fetch(`${API_BASE_URL}/student/tests.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submit',
          attempt_id: attemptId,
          answers,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message || 'Test submitted',
          score: result.score,
          passed: result.passed,
          earned_points: result.earned_points,
          total_points: result.total_points,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to submit test',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit test',
      };
    }
  },

  async getAttemptResults(attemptId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/student/tests.php?attempt_id=${attemptId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          attempt: result.attempt,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to fetch results',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch results',
      };
    }
  },
};
