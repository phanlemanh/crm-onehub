import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox"] });
for (const n of ["ban-do-vong", "giai-doan-thoa-thuan"]) {
  const p = await b.newPage();
  await p.setViewport({ width: 1400, height: 1000, deviceScaleFactor: 2 });
  await p.goto(`file://${process.cwd()}/_acceptance/nhan-ung-dung-noi-tieng-viet/figures/${n}.html`, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1200));
  const el = (await p.$("svg")) ?? (await p.$("body"));
  await el.screenshot({ path: `_acceptance/nhan-ung-dung-noi-tieng-viet/figures/${n}.png` });
  console.log(n, "->", (await p.evaluate(() => document.querySelectorAll("svg").length)), "svg");
}
await b.close();
