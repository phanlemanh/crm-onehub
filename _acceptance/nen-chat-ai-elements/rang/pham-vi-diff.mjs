#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC_KHO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

const DANH_SACH_TRANG = [
  "packages/ui/src/components/ai-elements/**",
  "packages/ui/src/lib/**",
  "packages/ui/package.json",
  "packages/validation/src/**",
  "packages/validation/package.json",
  "packages/validation/test/**",
  "apps/app/lib/agent-transcript.ts",
  "apps/app/test/agent-transcript.spec.ts",
  "apps/app/test/agent-results.spec.ts",
  "packages/ui/test/**",
  "_acceptance/**",
  "docs/**",
  ".githooks/gate-shape.json",
  "turbo.json",
  "knip.json",
  "package.json",
  "bun.lock",
  "PRODUCT-MAP.md",
];

const SAU_TEP_CHAT = [
  "apps/app/components/agent-builder/agent-builder-chat.tsx",
  "apps/app/components/agent-builder/agent-composer.tsx",
  "apps/app/components/agent-builder/chat-chips.tsx",
  "apps/app/components/crm/agent-panel.tsx",
  "apps/app/components/agent-clarification-composer.tsx",
  "apps/app/components/agent-builder/agent-builder-route-fallback.tsx",
];

const VONG = Object.freeze({
  truoc: "08cc6754282046494bd6eda63eae7066dad20707",
  sau: "2340eaccf09c5febcbc9d079c47863406aeb67be",
});

function git(doiSo) {
  return execFileSync("git", doiSo, { cwd: GOC_KHO, encoding: "utf8" });
}

function trongDanhSachTrang(duong) {
  return DANH_SACH_TRANG.some((mau) =>
    mau.endsWith("/**") ? duong.startsWith(mau.slice(0, -2)) : duong === mau,
  );
}

for (const sha of [VONG.truoc, VONG.sau]) {
  try {
    git(["rev-parse", "--verify", "--quiet", `${sha}^{commit}`]);
  } catch {
    console.error(
      `RĂNG PHẠM VI KHÔNG ĐO ĐƯỢC: không tìm thấy commit ${sha} của vòng trong kho ${GOC_KHO}.`,
    );
    console.error(
      "Mã 2 nghĩa là THIẾU PHÉP ĐO, không phải cây sạch và cũng không phải có vi phạm.",
    );
    process.exit(2);
  }
}

let thoRaw;
try {
  thoRaw = git(["diff", "--name-only", "-z", `${VONG.truoc}...${VONG.sau}`]);
} catch (loi) {
  console.error(`RĂNG PHẠM VI: chạy git diff hỏng — ${loi.message}`);
  process.exit(1);
}

const duongDoi = thoRaw.split("\0").filter((duong) => duong !== "");

console.log(`RĂNG PHẠM VI — vòng ${VONG.truoc}...${VONG.sau}`);
console.log(`Gốc kho: ${GOC_KHO}`);
console.log(`Tổng số tệp đổi: ${duongDoi.length}`);

if (duongDoi.length === 0) {
  console.error("");
  console.error("Diff RỖNG giữa hai đầu của vòng. Chưa làm gì không phải là giữ đúng phạm vi.");
  process.exit(2);
}

const viPham = duongDoi.filter((duong) => !trongDanhSachTrang(duong));
const chatBiCham = SAU_TEP_CHAT.filter((duong) => duongDoi.includes(duong));

console.log(`Tệp vi phạm: ${viPham.length}`);
for (const duong of viPham) {
  console.log(`  ${duong} — ngoài phạm vi đã duyệt`);
}

console.log(`Sáu tệp chat bị chạm: ${chatBiCham.length}`);
for (const duong of chatBiCham) {
  console.log(`  ${duong} — tệp chat phải nguyên vẹn, ngoài phạm vi đã duyệt`);
}

if (viPham.length > 0 || chatBiCham.length > 0) {
  console.error("");
  console.error("RĂNG PHẠM VI ĐỎ: có đường ngoài phạm vi đã duyệt ở AC-2.");
  process.exit(1);
}

console.log("");
console.log("RĂNG PHẠM VI XANH: mọi đường nằm trong danh sách trắng AC-2, sáu tệp chat nguyên vẹn.");
process.exit(0);
