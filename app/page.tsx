"use client";

import { useEffect, useMemo, useState } from "react";
import { QUESTION_BANK, type Question } from "./questions";

type SessionQuestion = Question & { options: string[] };
type Response = { question: SessionQuestion; chosen: string; correct: boolean };
const LETTERS = ["A", "B", "C"];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createSession(): SessionQuestion[] {
  return shuffle(QUESTION_BANK).slice(0, 30).map((question) => ({
    ...question,
    options: shuffle([question.answer, ...question.distractors]),
  }));
}

export default function Home() {
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [session, setSession] = useState<SessionQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [showReview, setShowReview] = useState(false);
  const current = session[currentIndex];
  const score = responses.filter((response) => response.correct).length;
  const missed = useMemo(() => responses.filter((response) => !response.correct), [responses]);

  const begin = () => {
    setSession(createSession());
    setCurrentIndex(0);
    setSelected(null);
    setResponses([]);
    setShowReview(false);
    setPhase("quiz");
  };

  const advance = () => {
    if (!current || !selected) return;
    const nextResponses = [...responses, { question: current, chosen: selected, correct: selected === current.answer }];
    setResponses(nextResponses);
    setSelected(null);
    if (currentIndex === session.length - 1) setPhase("result");
    else setCurrentIndex((index) => index + 1);
  };

  useEffect(() => {
    if (phase !== "quiz" || !current) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!selected && ["1", "2", "3"].includes(event.key)) setSelected(current.options[Number(event.key) - 1]);
      else if (selected && event.key === "Enter") advance();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (phase === "intro") {
    return (
      <main className="site-shell intro-shell">
        <Decorations />
        <section className="intro-card">
          <div className="eyebrow"><span>MONOGATARI</span><i /> QUIZ ARCHIVE 07</div>
          <div className="issue-stamp">第七回<br /><small>怪异调查</small></div>
          <p className="vertical-title" aria-hidden="true">ものがたり</p>
          <h1><span>怪异</span>·记忆<br />冷知识测验</h1>
          <p className="intro-copy">答案并不会自己浮现。<br />你所知道的，只是你知道的而已。</p>
          <button className="primary-button" type="button" onClick={begin}><span>开始答题</span><b>→</b></button>
          <div className="intro-stats" aria-label="测验信息">
            <div><b>{QUESTION_BANK.length}</b><span>题库总数</span></div>
            <div><b>30</b><span>随机抽取</span></div>
            <div><b>3</b><span>每题选项</span></div>
          </div>
          <p className="source-note">题目整理自「物语系列 B 萌群第七届冷知识竞赛」</p>
        </section>
      </main>
    );
  }

  if (phase === "result") {
    const rate = Math.round((score / responses.length) * 100);
    const verdict = rate >= 90 ? "怪异专家" : rate >= 70 ? "资深观测者" : rate >= 50 ? "见习调查员" : "迷途蜗牛";
    return (
      <main className="site-shell result-shell">
        <Decorations />
        <section className="result-card">
          <p className="result-label">CASE CLOSED // 调查结束</p>
          <div className="score-orbit"><span className="score-value">{score}</span><span className="score-total">/ 30</span></div>
          <h2>{verdict}</h2>
          <p className="result-copy">本轮正确率 <strong>{rate}%</strong>。{missed.length === 0 ? "没有任何怪异逃过你的眼睛。" : `还有 ${missed.length} 条记忆出现了偏差。`}</p>
          <div className="result-actions">
            <button className="primary-button" type="button" onClick={begin}><span>再抽 30 题</span><b>↻</b></button>
            {missed.length > 0 && <button className="text-button" type="button" onClick={() => setShowReview((value) => !value)}>{showReview ? "收起错题" : "查看错题"} <span>＋</span></button>}
          </div>
          {showReview && <div className="review-list">{missed.map((item, index) => (
            <article className="review-item" key={item.question.id}>
              <div className="review-number">{String(index + 1).padStart(2, "0")}</div>
              <div><p>{item.question.prompt}</p><span>你的答案：{item.chosen}</span><strong>正确答案：{item.question.answer}</strong></div>
            </article>
          ))}</div>}
        </section>
      </main>
    );
  }

  const answeredCorrectly = selected === current.answer;
  const progress = ((currentIndex + 1) / session.length) * 100;
  return (
    <main className="quiz-shell">
      <header className="quiz-header">
        <button className="wordmark" type="button" onClick={() => setPhase("intro")} aria-label="返回首页">物語 <span>MONOGATARI QUIZ</span></button>
        <div className="header-count"><span>QUESTION</span><b>{String(currentIndex + 1).padStart(2, "0")}</b><i>/</i><em>30</em></div>
      </header>
      <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
      <section className="question-stage">
        <div className="question-aside" aria-hidden="true"><b>{String(currentIndex + 1).padStart(2, "0")}</b><span>怪異譚</span></div>
        <article className="question-card">
          <div className="question-meta"><span>{current.category}区</span><i>ARCHIVE NO. {String(current.id).padStart(3, "0")}</i></div>
          <h2>{current.prompt}</h2>
          <div className="options" role="radiogroup" aria-label="答案选项">
            {current.options.map((option, index) => {
              const isSelected = selected === option;
              const isAnswer = Boolean(selected) && option === current.answer;
              const state = isAnswer ? " correct" : isSelected ? " wrong" : selected ? " muted" : "";
              return <button className={`option${state}`} key={option} type="button" role="radio" aria-checked={isSelected} disabled={Boolean(selected)} onClick={() => setSelected(option)}>
                <span className="option-letter">{LETTERS[index]}</span><span className="option-text">{option}</span><span className="option-mark">{isAnswer ? "○" : isSelected ? "×" : "↗"}</span>
              </button>;
            })}
          </div>
          <div className={`feedback ${selected ? "visible" : ""}`} aria-live="polite">
            {selected && <><div className="feedback-status">{answeredCorrectly ? "回答正确" : "记忆偏差"}<small>{answeredCorrectly ? "CORRECT" : "INCORRECT"}</small></div><p>{answeredCorrectly ? "不错。看来这只怪异没能骗过你。" : <>正确答案是：<strong>{current.answer}</strong></>}</p></>}
          </div>
          <div className="question-footer"><span>按数字键 1—3 选择</span><button className="next-button" type="button" disabled={!selected} onClick={advance}>{currentIndex === 29 ? "查看结果" : "下一题"}<b>→</b></button></div>
        </article>
      </section>
      <div className="corner-copy" aria-hidden="true">KAII / MEMORY / ANSWER</div>
    </main>
  );
}

function Decorations() {
  return <div className="decorations" aria-hidden="true"><div className="deco-kana">物語</div><div className="deco-red" /><div className="deco-cyan" /><div className="deco-grid" /></div>;
}
