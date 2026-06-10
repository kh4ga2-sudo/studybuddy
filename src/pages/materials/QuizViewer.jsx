import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { QUIZ_BANK } from '../../data/materials';

export default function QuizViewer({ item }) {
  const { state, t } = useApp();
  const isAr = state.lang === 'ar';
  const [phase, setPhase] = useState(item.status === 'graded' ? 'results' : 'intro');
  const [answers, setAnswers] = useState({});

  const questions = useMemo(() => QUIZ_BANK.slice(0, 8), []);

  if (item.status === 'upcoming' && phase === 'intro') {
    // Show intro
  }

  const answered = Object.keys(answers).length;
  const total = questions.length;

  const score = useMemo(() => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct) correct++;
    });
    return Math.round((correct / total) * 100);
  }, [answers, questions, total]);

  const passed = score >= 60;

  const startQuiz = () => {
    setAnswers({});
    setPhase('taking');
  };

  const submitQuiz = () => {
    setPhase('results');
  };

  // Past exam locked
  if (item.status === 'graded' && phase === 'results') {
    return (
      <div>
        <div className={`quiz-result ${item.score && item.score >= 60 ? 'is-pass' : 'is-fail'}`}>
          <div className="quiz-result__circle">
            <div className="big">{item.score}%</div>
            <div className="sm">{item.score}/{item.maxScore}</div>
          </div>
          <div>
            <span className="quiz-result__badge">
              {(item.score >= 60) ? (isAr ? 'ناجح' : 'Passed') : (isAr ? 'راسب' : 'Failed')}
            </span>
            <div className="quiz-result__msg">
              {isAr
                ? `أكملت هذا الاختبار بدرجة ${item.score} من ${item.maxScore}.`
                : `You completed this exam with a score of ${item.score}/${item.maxScore}.`}
            </div>
          </div>
        </div>

        <div className="quiz-locked">
          <svg><use href="#icon-lock"/></svg>
          <div>
            <div className="quiz-locked__title">{isAr ? 'تم إغلاق الاختبار' : 'Exam Closed'}</div>
            <div className="quiz-locked__sub">{isAr ? 'لا يمكن إعادة الاختبارات السابقة' : 'Past exams cannot be retaken'}</div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div className="quiz-intro">
        <div className="quiz-intro__icon"><svg><use href="#icon-edit-2"/></svg></div>
        <h3 className="quiz-intro__title">{isAr ? item.titleAr : item.title}</h3>
        <p className="quiz-intro__sub">
          {isAr
            ? `${questions.length} أسئلة · ${item.duration || 30} دقيقة · اختر الإجابة الصحيحة لكل سؤال`
            : `${questions.length} questions · ${item.duration || 30} minutes · Pick the correct answer for each question`}
        </p>
        <button className="btn btn--primary" onClick={startQuiz}>
          <svg width="14" height="14"><use href="#icon-play"/></svg>
          {isAr ? 'ابدأ الاختبار' : 'Start Quiz'}
        </button>
      </div>
    );
  }

  if (phase === 'taking') {
    return (
      <div>
        <div className="quiz-progress-card">
          <div className="quiz-progress-card__top">
            <div className="quiz-progress-card__title">{isAr ? item.titleAr : item.title}</div>
            <div className="quiz-progress-card__count">{answered} / {total}</div>
          </div>
          <div className="quiz-progress-card__bar">
            <span style={{ width: `${(answered / total) * 100}%` }} />
          </div>
        </div>

        <div className="quiz-questions">
          {questions.map((q, idx) => (
            <div key={q.id} className="quiz-q">
              <div className="quiz-q__head">
                <span className="quiz-q__num">Q{idx + 1}</span>
                <div className="quiz-q__text">{isAr ? q.textAr : q.textEn}</div>
              </div>
              <div className="quiz-q__options">
                {q.opts.map(opt => (
                  <button
                    key={opt.id}
                    className={`quiz-opt${answers[q.id] === opt.id ? ' is-selected' : ''}`}
                    onClick={() => setAnswers({ ...answers, [q.id]: opt.id })}
                  >
                    <div className="quiz-opt__letter">{opt.id.toUpperCase()}</div>
                    <div className="quiz-opt__text">{isAr ? opt.ar : opt.en}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--s-4)' }}>
          <button className="btn btn--primary" onClick={submitQuiz} disabled={answered === 0}>
            {isAr ? 'إرسال الإجابات' : 'Submit Quiz'}
          </button>
        </div>
      </div>
    );
  }

  // Results phase after taking
  return (
    <div>
      <div className={`quiz-result ${passed ? 'is-pass' : 'is-fail'}`}>
        <div className="quiz-result__circle">
          <div className="big">{score}%</div>
          <div className="sm">{Object.values(answers).filter((v, i) => v === questions[i].correct).length}/{total}</div>
        </div>
        <div>
          <span className="quiz-result__badge">{passed ? (isAr ? 'ناجح' : 'Passed') : (isAr ? 'راسب' : 'Try Again')}</span>
          <div className="quiz-result__msg">
            {passed
              ? (isAr ? 'عمل رائع! تابع التقدم في هذا المقرر.' : 'Great work! Keep up the momentum.')
              : (isAr ? 'لا بأس، راجع المادة وأعد المحاولة.' : "Don't worry, review the material and try again.")}
          </div>
        </div>
      </div>

      <div className="quiz-questions">
        {questions.map((q, idx) => {
          const userAns = answers[q.id];
          const isCorrect = userAns === q.correct;
          const isSkipped = !userAns;
          const cls = isSkipped ? 'is-skipped' : isCorrect ? 'is-correct' : 'is-wrong';
          return (
            <div key={q.id} className={`quiz-q ${cls}`}>
              <div className="quiz-q__head">
                <span className="quiz-q__num">Q{idx + 1}</span>
                <div className="quiz-q__text">{isAr ? q.textAr : q.textEn}</div>
                <span className={`quiz-q__status ${cls}`}>
                  {isCorrect && <><svg><use href="#icon-check"/></svg> {isAr ? 'صحيح' : 'Correct'}</>}
                  {!isCorrect && !isSkipped && <><svg><use href="#icon-x"/></svg> {isAr ? 'خطأ' : 'Wrong'}</>}
                  {isSkipped && (isAr ? 'متروك' : 'Skipped')}
                </span>
              </div>
              <div className="quiz-q__options">
                {q.opts.map(opt => {
                  let oCls = '';
                  if (opt.id === q.correct) oCls = 'is-correct';
                  else if (opt.id === userAns) oCls = 'is-wrong';
                  return (
                    <button key={opt.id} className={`quiz-opt ${oCls}`} disabled>
                      <div className="quiz-opt__letter">{opt.id.toUpperCase()}</div>
                      <div className="quiz-opt__text">{isAr ? opt.ar : opt.en}</div>
                      {opt.id === q.correct && (
                        <div className="quiz-opt__mark"><svg><use href="#icon-check"/></svg></div>
                      )}
                      {opt.id === userAns && opt.id !== q.correct && (
                        <div className="quiz-opt__mark quiz-opt__mark--x"><svg><use href="#icon-x"/></svg></div>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="quiz-q__explain">
                <span className="quiz-q__explain-label">{isAr ? 'شرح' : 'Explanation'}</span>
                <p>{isAr ? q.explainAr : q.explainEn}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--s-4)' }}>
        <button className="btn btn--ghost" onClick={() => setPhase('intro')}>
          <svg width="14" height="14"><use href="#icon-refresh-cw"/></svg>
          {isAr ? 'إعادة المحاولة' : 'Try Again'}
        </button>
      </div>
    </div>
  );
}
