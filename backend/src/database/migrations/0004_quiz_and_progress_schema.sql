-- Up

-- 1. QUIZZES TABLE
CREATE TABLE IF NOT EXISTS quizzes (
    id VARCHAR(64) PRIMARY KEY,
    drug_id VARCHAR(64) NOT NULL REFERENCES drugs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    pass_percentage NUMERIC(5, 2) NOT NULL DEFAULT 70.00 CHECK (pass_percentage >= 0 AND pass_percentage <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_quizzes_drug UNIQUE (drug_id)
);

CREATE TRIGGER trg_quizzes_updated_at
BEFORE UPDATE ON quizzes
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- 2. QUIZ_QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS quiz_questions (
    id VARCHAR(64) PRIMARY KEY,
    quiz_id VARCHAR(64) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL CHECK (question_order > 0),
    question_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_quiz_questions_order UNIQUE (quiz_id, question_order),
    CONSTRAINT uq_quiz_questions_quiz_id_id UNIQUE (quiz_id, id)
);

CREATE TRIGGER trg_quiz_questions_updated_at
BEFORE UPDATE ON quiz_questions
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- 3. QUIZ_OPTIONS TABLE
CREATE TABLE IF NOT EXISTS quiz_options (
    id VARCHAR(64) PRIMARY KEY,
    question_id VARCHAR(64) NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    explanation TEXT,
    needs_scientific_review BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_quiz_options_question_id_id UNIQUE (question_id, id)
);

CREATE TRIGGER trg_quiz_options_updated_at
BEFORE UPDATE ON quiz_options
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- 4. QUIZ_ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id VARCHAR(64) PRIMARY KEY,
    quiz_id VARCHAR(64) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id VARCHAR(64),
    score NUMERIC(5, 2) NOT NULL CHECK (score >= 0 AND score <= 100),
    total_questions INTEGER NOT NULL CHECK (total_questions > 0),
    correct_answers INTEGER NOT NULL CHECK (correct_answers >= 0),
    passed BOOLEAN NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);

-- 5. QUIZ_ATTEMPT_ANSWERS TABLE
CREATE TABLE IF NOT EXISTS quiz_attempt_answers (
    id VARCHAR(64) PRIMARY KEY,
    attempt_id VARCHAR(64) NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id VARCHAR(64) NOT NULL,
    selected_option_id VARCHAR(64) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_attempt_answers_question_option FOREIGN KEY (question_id, selected_option_id) REFERENCES quiz_options(question_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempt_answers_attempt ON quiz_attempt_answers(attempt_id);

-- 6. USER_PROGRESS TABLE
CREATE TABLE IF NOT EXISTS user_progress (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    drug_id VARCHAR(64) NOT NULL REFERENCES drugs(id) ON DELETE CASCADE,
    completed_nodes TEXT[] NOT NULL DEFAULT '{}',
    quiz_score NUMERIC(5, 2) CHECK (quiz_score IS NULL OR (quiz_score >= 0 AND quiz_score <= 100)),
    quiz_completed BOOLEAN NOT NULL DEFAULT false,
    last_accessed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_progress_user_drug UNIQUE (user_id, drug_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);

CREATE TRIGGER trg_user_progress_updated_at
BEFORE UPDATE ON user_progress
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- Down

DROP TRIGGER IF EXISTS trg_user_progress_updated_at ON user_progress;
DROP TABLE IF EXISTS user_progress;

DROP TABLE IF EXISTS quiz_attempt_answers;
DROP TABLE IF EXISTS quiz_attempts;

DROP TRIGGER IF EXISTS trg_quiz_options_updated_at ON quiz_options;
DROP TABLE IF EXISTS quiz_options;

DROP TRIGGER IF EXISTS trg_quiz_questions_updated_at ON quiz_questions;
DROP TABLE IF EXISTS quiz_questions;

DROP TRIGGER IF EXISTS trg_quizzes_updated_at ON quizzes;
DROP TABLE IF EXISTS quizzes;
