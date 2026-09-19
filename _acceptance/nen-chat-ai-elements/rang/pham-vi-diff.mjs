#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC_KHO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

const NHANH_CHINH_MAC_DINH = "origin/onehub";

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

function diemCuoi() {
  const tu = process.env.DIEM_CUOI;
  if (tu && tu.trim() !== "") return tu.trim();
  return "HEAD";
}

function nhanhNen() {
  const tuThamSo = process.argv[2];
  if (tuThamSo && tuThamSo.trim() !== "") return tuThamSo.trim();
  const tuMoiTruong = process.env.NHANH_NEN ?? process.env.BASE_REF;
  if (tuMoiTruong && tuMoiTruong.trim() !== "") return tuMoiTruong.trim();
  return diemRe(NHANH_CHINH_MAC_DINH);
}

function diemRe(nhanhChinh) {
  try {
    return execFileSync("git", ["merge-base", "HEAD", nhanhChinh], {
      cwd: GOC_KHO,
      encoding: "utf8",
    }).trim();
  } catch {
    return null;
  }
}

function git(doiSo) {
  return execFileSync("git", doiSo, { cwd: GOC_KHO, encoding: "utf8" });
}

function trongDanhSachTrang(duong) {
  return DANH_SACH_TRANG.some((mau) =>
    mau.endsWith("/**") ? duong.startsWith(mau.slice(0, -2)) : duong === mau,
  );
}

const nen = nhanhNen();
const cuoi = diemCuoi();

if (nen === null) {
  console.error(
    `RĂNG PHẠM VI KHÔNG ĐO ĐƯỢC: không giải được điểm rẽ với "${NHANH_CHINH_MAC_DINH}" trong kho ${GOC_KHO}.`,
  );
  console.error(
    "Mã 2 nghĩa là THIẾU PHÉP ĐO, không phải cây sạch và cũng không phải có vi phạm.",
  );
  console.error("Truyền nhánh nền tay: NHANH_NEN=<ref hoặc sha> node <script>.");
  process.exit(2);
}

try {
  git(["rev-parse", "--verify", "--quiet", `${nen}^{commit}`]);
} catch {
  console.error(
    `RĂNG PHẠM VI KHÔNG ĐO ĐƯỢC: không tìm thấy nhánh nền "${nen}" trong kho ${GOC_KHO}.`,
  );
  console.error(
    "Mã 2 nghĩa là THIẾU PHÉP ĐO, không phải cây sạch và cũng không phải có vi phạm.",
  );
  process.exit(2);
}

let thoRaw;
try {
  thoRaw = git(["diff", "--name-only", "-z", `${nen}...${cuoi}`]);
} catch (loi) {
  console.error(`RĂNG PHẠM VI: chạy git diff hỏng — ${loi.message}`);
  process.exit(1);
}

const duongDoi = thoRaw.split("\0").filter((duong) => duong !== "");

console.log(`RĂNG PHẠM VI — nhánh nền ${nen} … điểm cuối ${cuoi}`);
if (cuoi !== "HEAD") {
  console.log(
    "Vòng này đã hoà vào onehub, nên khoảng của nó là một đoạn lịch sử ĐÓNG.\n" +
      "  Neo điểm cuối vào HEAD sẽ đo việc của các vòng SAU trên cùng nhánh —\n" +
      "  đúng lỗi đã làm răng này đỏ ngày 19/09 với 13 tệp, không tệp nào là sáu\n" +
      "  tệp chat nó thật sự canh.",
  );
}
console.log(`Gốc kho: ${GOC_KHO}`);
console.log(`Tổng số tệp đổi: ${duongDoi.length}`);

if (duongDoi.length === 0) {
  console.error("");
  console.error("Diff RỖNG so với nhánh nền. Chưa làm gì không phải là giữ đúng phạm vi.");
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
