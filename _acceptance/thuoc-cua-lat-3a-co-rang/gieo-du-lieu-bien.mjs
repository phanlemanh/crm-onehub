import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HO_SO = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HO_SO, "../..");
const CHUP = join(HO_SO, ".anh-chup");
const KHO_TRANG_THAI = join(CHUP, "trang-thai-bo-sung.json");
const KHO_HOAT_DONG = join(CHUP, "moc-hoat-dong.json");
const KHO_NGANH = join(CHUP, "nganh.json");

const TRANG_THAI = ["RUNNING", "COMPLETE", "FAILED", "SKIPPED"];

const co = (c) => process.argv.includes(c);
const PHA_TRANG_THAI = co("--tra-ve-pending");
const PHA_HOAT_DONG = co("--go-hoat-dong");
const PHA_NGANH = co("--go-nganh");

mkdirSync(CHUP, { recursive: true });

const chup = (kho, chon) => `
import { writeFileSync } from "node:fs";
import { db } from "./src/client";
const rows = await db.company.findMany({ select: ${chon} });
writeFileSync(${JSON.stringify(kho)}, JSON.stringify(rows));
console.log(\`-- da chup \${rows.length} hang vao ${kho}\`);
`;

const doiAnhChup = (kho, ten) => `
import { existsSync } from "node:fs";
if (!existsSync(${JSON.stringify(kho)})) {
  console.log("KHONG DO DUOC: thieu anh chup ${ten} — khong phuc duoc, va KHONG duoc doan");
  process.exit(2);
}
`;

const KICH_BAN = {
  "tra-ve-pending": chup(KHO_TRANG_THAI, "{ id: true, enrichmentStatus: true }") + `
const n = await db.company.updateMany({ data: { enrichmentStatus: "PENDING" } });
console.log(\`-- da tra \${n.count} cong ty ve PENDING (dung tap rong de thu chieu do)\`);
`,
  "phuc-trang-thai": doiAnhChup(KHO_TRANG_THAI, "trang thai bo sung du lieu") + `
import { readFileSync } from "node:fs";
import { db } from "./src/client";
const rows = JSON.parse(readFileSync(${JSON.stringify(KHO_TRANG_THAI)}, "utf8"));
for (const r of rows) {
  await db.company.update({ where: { id: r.id }, data: { enrichmentStatus: r.enrichmentStatus } });
}
const sau = await db.company.findMany({ select: { id: true, enrichmentStatus: true } });
const map = new Map(rows.map((r) => [r.id, r.enrichmentStatus]));
const lech = sau.filter((r) => map.has(r.id) && map.get(r.id) !== r.enrichmentStatus);
console.log(\`-- da phuc \${rows.length} hang · con lech \${lech.length}\`);
if (lech.length > 0) process.exit(1);
`,
  "go-hoat-dong": chup(KHO_HOAT_DONG, "{ id: true, lastActivityAt: true }") + `
await db.company.updateMany({ data: { lastActivityAt: null } });
console.log("-- da go moc hoat dong cua moi cong ty");
`,
  "phuc-hoat-dong": doiAnhChup(KHO_HOAT_DONG, "moc hoat dong") + `
import { readFileSync } from "node:fs";
import { db } from "./src/client";
const rows = JSON.parse(readFileSync(${JSON.stringify(KHO_HOAT_DONG)}, "utf8"));
for (const r of rows) {
  await db.company.update({
    where: { id: r.id },
    data: { lastActivityAt: r.lastActivityAt === null ? null : new Date(r.lastActivityAt) },
  });
}
const sau = await db.company.findMany({ select: { id: true, lastActivityAt: true } });
const map = new Map(rows.map((r) => [r.id, r.lastActivityAt]));
const lech = sau.filter((r) => {
  if (!map.has(r.id)) return false;
  const cu = map.get(r.id);
  const moi = r.lastActivityAt;
  return (cu === null) !== (moi === null) ||
    (cu !== null && moi !== null && new Date(cu).getTime() !== moi.getTime());
});
console.log(\`-- da phuc \${rows.length} hang · con lech \${lech.length}\`);
if (lech.length > 0) process.exit(1);
`,
  "go-nganh": chup(KHO_NGANH, "{ id: true, industry: true }") + `
await db.company.updateMany({ data: { industry: null } });
console.log("-- da go nganh cua moi cong ty (dung tap nganh rong)");
`,
  "phuc-nganh": doiAnhChup(KHO_NGANH, "nganh") + `
import { readFileSync } from "node:fs";
import { db } from "./src/client";
const rows = JSON.parse(readFileSync(${JSON.stringify(KHO_NGANH)}, "utf8"));
for (const r of rows) {
  await db.company.update({ where: { id: r.id }, data: { industry: r.industry } });
}
const sau = await db.company.findMany({ select: { id: true, industry: true } });
const map = new Map(rows.map((r) => [r.id, r.industry]));
const lech = sau.filter((r) => map.has(r.id) && map.get(r.id) !== r.industry);
console.log(\`-- da phuc \${rows.length} hang · con lech \${lech.length}\`);
if (lech.length > 0) process.exit(1);
`,
  gieo: `
import { db } from "./src/client";
const CAN = ${JSON.stringify(TRANG_THAI)};
const rows = await db.company.findMany({
  select: { id: true, name: true, enrichmentStatus: true },
  orderBy: { name: "asc" },
});
if (rows.length < CAN.length + 1) {
  console.log(\`KHONG GIEO DUOC: chi co \${rows.length} cong ty, can it nhat \${CAN.length + 1}\`);
  process.exit(2);
}
const dangCo = new Set(rows.map((r) => r.enrichmentStatus));
const thieu = CAN.filter((t) => !dangCo.has(t));
if (thieu.length > 0) {
  const nhan = rows.slice(1, 1 + thieu.length);
  for (let i = 0; i < thieu.length; i += 1) {
    await db.company.update({ where: { id: nhan[i].id }, data: { enrichmentStatus: thieu[i] } });
    console.log(\`   \${thieu[i].padEnd(10)} <- \${nhan[i].name}\`);
  }
}
const sau = await db.company.findMany({ select: { enrichmentStatus: true } });
const dem = {};
for (const r of sau) dem[r.enrichmentStatus] = (dem[r.enrichmentStatus] ?? 0) + 1;
const conThieu = ["PENDING", ...CAN].filter((t) => !dem[t]);
console.log(\`-- trang thai hien co: \${JSON.stringify(dem)}\`);
if (conThieu.length > 0) {
  console.log(\`KHONG GIEO DUOC: van thieu \${conThieu.join(", ")}\`);
  process.exit(1);
}
`,
};

const CHAN_THEO_CO = [
  ["--tra-ve-pending", "tra-ve-pending"],
  ["--phuc-trang-thai", "phuc-trang-thai"],
  ["--go-hoat-dong", "go-hoat-dong"],
  ["--phuc-hoat-dong", "phuc-hoat-dong"],
  ["--go-nganh", "go-nganh"],
  ["--phuc-nganh", "phuc-nganh"],
];

const chan = CHAN_THEO_CO.find(([c]) => co(c))?.[1] ?? "gieo";
if (!KICH_BAN[chan]) {
  console.log(`KHONG DO DUOC: khong co kich ban cho chan ${chan}`);
  process.exit(2);
}

console.log(`-- gieo-du-lieu-bien: chan ${chan}`);
try {
  process.stdout.write(
    execFileSync("bun", ["-e", KICH_BAN[chan]], {
      cwd: `${GOC}/packages/db`,
      encoding: "utf8",
      env: process.env,
    }),
  );
} catch (loi) {
  const ra = `${String(loi.stdout ?? "")}${String(loi.stderr ?? loi.message)}`;
  process.stdout.write(ra.slice(0, 600));
  process.exit(ra.includes("KHONG DO DUOC") ? 2 : (loi.status ?? 2));
}

if (
  (PHA_TRANG_THAI && !existsSync(KHO_TRANG_THAI)) ||
  (PHA_HOAT_DONG && !existsSync(KHO_HOAT_DONG)) ||
  (PHA_NGANH && !existsSync(KHO_NGANH))
) {
  console.log("KHONG DO DUOC: da pha du lieu ma KHONG chup duoc anh — khong phuc duoc");
  process.exit(2);
}
