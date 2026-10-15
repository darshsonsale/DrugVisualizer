import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface QuizSeedResult {
  quizzesCount: number;
  questionsCount: number;
  optionsCount: number;
  driftWarningsCount: number;
}

export interface QuestionBankOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  explanation: string;
  needs_scientific_review: boolean;
}

export interface QuestionBankQuestion {
  id: string;
  quiz_id: string;
  question_order: number;
  question_text: string;
  options: QuestionBankOption[];
}

export interface QuestionBankQuiz {
  id: string;
  drug_id: string;
  title: string;
  description: string;
  pass_percentage: number;
  questions: QuestionBankQuestion[];
}

export interface QuestionBankData {
  version: string;
  description: string;
  quizzes: QuestionBankQuiz[];
}

export async function seedQuizzes(client: pg.PoolClient): Promise<QuizSeedResult> {
  const questionBankPath = path.resolve(__dirname, '../../../data/quiz/question_bank.json');
  if (!fs.existsSync(questionBankPath)) {
    throw new Error(`Question bank fixture not found at: ${questionBankPath}`);
  }

  const questionBank: QuestionBankData = JSON.parse(fs.readFileSync(questionBankPath, 'utf-8'));

  // 1. Pre-seed fixture-drift detection without overwriting historical records
  // Inspect existing database records to alert developers if local JSON fixture diverged
  const existingOptionsRes = await client.query<{
    id: string;
    question_id: string;
    option_text: string;
    is_correct: boolean;
  }>('SELECT id, question_id, option_text, is_correct FROM quiz_options;');

  const existingOptionMap = new Map(existingOptionsRes.rows.map((row) => [row.id, row]));
  let driftWarningsCount = 0;

  for (const quiz of questionBank.quizzes) {
    for (const q of quiz.questions) {
      for (const opt of q.options) {
        const existing = existingOptionMap.get(opt.id);
        if (existing) {
          if (
            existing.option_text !== opt.option_text ||
            existing.is_correct !== opt.is_correct ||
            existing.question_id !== opt.question_id
          ) {
            console.warn(
              `[Quiz Seeder Warning] Fixture drift detected for Option "${opt.id}" (Question: "${opt.question_id}"). ` +
              `Database record is preserved to protect historical quiz attempt integrity.`
            );
            driftWarningsCount++;
          }
        }
      }
    }
  }

  // 2. Insert Quizzes, Questions, and Options using ON CONFLICT (id) DO NOTHING
  // This guarantees that past student attempts and answer mappings are 100% immutable
  let quizzesCount = 0;
  let questionsCount = 0;
  let optionsCount = 0;

  for (const quiz of questionBank.quizzes) {
    await client.query(
      `INSERT INTO quizzes (id, drug_id, title, description, pass_percentage)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING;`,
      [quiz.id, quiz.drug_id, quiz.title, quiz.description, quiz.pass_percentage]
    );
    quizzesCount++;

    for (const q of quiz.questions) {
      await client.query(
        `INSERT INTO quiz_questions (id, quiz_id, question_order, question_text)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO NOTHING;`,
        [q.id, q.quiz_id, q.question_order, q.question_text]
      );
      questionsCount++;

      for (const opt of q.options) {
        await client.query(
          `INSERT INTO quiz_options (
            id, question_id, option_text, is_correct, explanation, needs_scientific_review
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO NOTHING;`,
          [
            opt.id,
            opt.question_id,
            opt.option_text,
            opt.is_correct,
            opt.explanation,
            opt.needs_scientific_review ?? true
          ]
        );
        optionsCount++;
      }
    }
  }

  return {
    quizzesCount,
    questionsCount,
    optionsCount,
    driftWarningsCount
  };
}
