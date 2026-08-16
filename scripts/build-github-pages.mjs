import { mkdir, readFile, writeFile } from "node:fs/promises";

const questionsSource = await readFile("app/questions.ts", "utf8");
const arrayMatch = questionsSource.match(/export const QUESTION_BANK: Question\[\] = (\[[\s\S]*\]);\s*$/);
if (!arrayMatch) throw new Error("Could not extract QUESTION_BANK from app/questions.ts");

const questions = Function(`"use strict"; return (${arrayMatch[1]});`)();
if (!Array.isArray(questions) || questions.length < 30) throw new Error("Question bank is incomplete");

const [template, appScript, sourceCss] = await Promise.all([
  readFile("github-pages/template.html", "utf8"),
  readFile("github-pages/app.js", "utf8"),
  readFile("app/globals.css", "utf8"),
]);

const css = sourceCss.replace(/^@import\s+"tailwindcss";\s*/m, "");
const script = appScript.replace("__QUESTION_DATA__", JSON.stringify(questions));
const html = template.replace("/*__CSS__*/", css).replace("/*__JS__*/", script);

await mkdir("docs", { recursive: true });
await Promise.all([
  writeFile("docs/index.html", html, "utf8"),
  writeFile("docs/.nojekyll", "", "utf8"),
]);

console.log(`Built GitHub Pages site with ${questions.length} questions.`);
