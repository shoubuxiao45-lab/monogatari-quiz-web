const QUESTION_BANK = __QUESTION_DATA__;
const app = document.querySelector("#app");
const LETTERS = ["A", "B", "C"];
let phase = "intro";
let session = [];
let currentIndex = 0;
let selected = null;
let responses = [];
let showReview = false;

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[character]);
}

function decorations() {
  return '<div class="decorations" aria-hidden="true"><div class="deco-kana">物語</div><div class="deco-red"></div><div class="deco-cyan"></div><div class="deco-grid"></div></div>';
}

function begin() {
  session = shuffle(QUESTION_BANK).slice(0, 30).map((question) => ({
    ...question,
    options: shuffle([question.answer, ...question.distractors]),
  }));
  currentIndex = 0;
  selected = null;
  responses = [];
  showReview = false;
  phase = "quiz";
  render();
}

function choose(option) {
  if (selected) return;
  selected = option;
  render();
}

function advance() {
  if (!selected) return;
  const question = session[currentIndex];
  responses.push({ question, chosen: selected, correct: selected === question.answer });
  selected = null;
  if (currentIndex === session.length - 1) phase = "result";
  else currentIndex += 1;
  render();
}

function renderIntro() {
  app.innerHTML = `<main class="site-shell intro-shell">${decorations()}<section class="intro-card">
    <div class="eyebrow"><span>MONOGATARI</span><i></i> QUIZ ARCHIVE 07</div>
    <div class="issue-stamp">第七回<br><small>怪异调查</small></div>
    <p class="vertical-title" aria-hidden="true">ものがたり</p>
    <h1><span>怪异</span>·记忆<br>冷知识测验</h1>
    <p class="intro-copy">答案并不会自己浮现。<br>你所知道的，只是你知道的而已。</p>
    <button class="primary-button" id="start" type="button"><span>开始答题</span><b>→</b></button>
    <div class="intro-stats" aria-label="测验信息"><div><b>${QUESTION_BANK.length}</b><span>题库总数</span></div><div><b>30</b><span>随机抽取</span></div><div><b>3</b><span>每题选项</span></div></div>
    <p class="source-note">题目整理自「物语系列 B 萌群第七届冷知识竞赛」</p>
  </section></main>`;
  document.querySelector("#start").addEventListener("click", begin);
}

function renderQuiz() {
  const question = session[currentIndex];
  const answeredCorrectly = selected === question.answer;
  const options = question.options.map((option, index) => {
    const isSelected = selected === option;
    const isAnswer = Boolean(selected) && option === question.answer;
    const state = isAnswer ? " correct" : isSelected ? " wrong" : selected ? " muted" : "";
    const mark = isAnswer ? "○" : isSelected ? "×" : "↗";
    return `<button class="option${state}" data-option="${index}" type="button" role="radio" aria-checked="${isSelected}" ${selected ? "disabled" : ""}><span class="option-letter">${LETTERS[index]}</span><span class="option-text">${escapeHtml(option)}</span><span class="option-mark">${mark}</span></button>`;
  }).join("");
  const feedback = selected ? `<div class="feedback-status">${answeredCorrectly ? "回答正确" : "记忆偏差"}<small>${answeredCorrectly ? "CORRECT" : "INCORRECT"}</small></div><p>${answeredCorrectly ? "不错。看来这只怪异没能骗过你。" : `正确答案是：<strong>${escapeHtml(question.answer)}</strong>`}</p>` : "";
  app.innerHTML = `<main class="quiz-shell"><header class="quiz-header"><button class="wordmark" id="home" type="button" aria-label="返回首页">物語 <span>MONOGATARI QUIZ</span></button><div class="header-count"><span>QUESTION</span><b>${String(currentIndex + 1).padStart(2, "0")}</b><i>/</i><em>30</em></div></header>
    <div class="progress-track"><span style="width:${((currentIndex + 1) / 30) * 100}%"></span></div>
    <section class="question-stage"><div class="question-aside" aria-hidden="true"><b>${String(currentIndex + 1).padStart(2, "0")}</b><span>怪異譚</span></div><article class="question-card">
      <div class="question-meta"><span>${escapeHtml(question.category)}区</span><i>ARCHIVE NO. ${String(question.id).padStart(3, "0")}</i></div>
      <h2>${escapeHtml(question.prompt)}</h2><div class="options" role="radiogroup" aria-label="答案选项">${options}</div>
      <div class="feedback ${selected ? "visible" : ""}" aria-live="polite">${feedback}</div>
      <div class="question-footer"><span>按数字键 1—3 选择</span><button class="next-button" id="next" type="button" ${selected ? "" : "disabled"}>${currentIndex === 29 ? "查看结果" : "下一题"}<b>→</b></button></div>
    </article></section><div class="corner-copy" aria-hidden="true">KAII / MEMORY / ANSWER</div></main>`;
  document.querySelector("#home").addEventListener("click", () => { phase = "intro"; render(); });
  document.querySelectorAll("[data-option]").forEach((button) => button.addEventListener("click", () => choose(question.options[Number(button.dataset.option)])));
  document.querySelector("#next").addEventListener("click", advance);
}

function renderResult() {
  const score = responses.filter((response) => response.correct).length;
  const missed = responses.filter((response) => !response.correct);
  const rate = Math.round((score / responses.length) * 100);
  const verdict = rate >= 90 ? "怪异专家" : rate >= 70 ? "资深观测者" : rate >= 50 ? "见习调查员" : "迷途蜗牛";
  const review = showReview ? `<div class="review-list">${missed.map((item, index) => `<article class="review-item"><div class="review-number">${String(index + 1).padStart(2, "0")}</div><div><p>${escapeHtml(item.question.prompt)}</p><span>你的答案：${escapeHtml(item.chosen)}</span><strong>正确答案：${escapeHtml(item.question.answer)}</strong></div></article>`).join("")}</div>` : "";
  app.innerHTML = `<main class="site-shell result-shell">${decorations()}<section class="result-card"><p class="result-label">CASE CLOSED // 调查结束</p><div class="score-orbit"><span class="score-value">${score}</span><span class="score-total">/ 30</span></div><h2>${verdict}</h2><p class="result-copy">本轮正确率 <strong>${rate}%</strong>。${missed.length === 0 ? "没有任何怪异逃过你的眼睛。" : `还有 ${missed.length} 条记忆出现了偏差。`}</p><div class="result-actions"><button class="primary-button" id="restart" type="button"><span>再抽 30 题</span><b>↻</b></button>${missed.length ? `<button class="text-button" id="review" type="button">${showReview ? "收起错题" : "查看错题"} <span>＋</span></button>` : ""}</div>${review}</section></main>`;
  document.querySelector("#restart").addEventListener("click", begin);
  document.querySelector("#review")?.addEventListener("click", () => { showReview = !showReview; render(); });
}

function render() {
  if (phase === "intro") renderIntro();
  else if (phase === "quiz") renderQuiz();
  else renderResult();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

window.addEventListener("keydown", (event) => {
  if (phase !== "quiz") return;
  if (!selected && ["1", "2", "3"].includes(event.key)) choose(session[currentIndex].options[Number(event.key) - 1]);
  else if (selected && event.key === "Enter") advance();
});

render();
