import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const TRANG_THAI = ["RUNNING", "COMPLETE", "FAILED", "SKIPPED"];
const TRA_VE = process.argv.includes("--tra-ve-pending");
const GO_HOAT_DONG = process.argv.includes("--go-hoat-dong");
const PHUC_HOAT_DONG = process.argv.includes("--phuc-hoat-dong");
const KHO_MOC = "/tmp/moc-hoat-dong.json";

const kichBanTraVe = `
import { db } from "./src/client";
const n = await db.company.updateMany({ data: { enrichmentStatus: "PENDING" } });
console.log(\`-- da tra \${n.count} cong ty ve PENDING (dung tap rong de thu chieu do)\`);
`;

const kichBanGoHoatDong = `
import { writeFileSync } from "node:fs";
import { db } from "./src/client";
const rows = await db.company.findMany({
  where: { lastActivityAt: { not: null } },
  select: { id: true, lastActivityAt: true },
});
writeFileSync(${JSON.stringify(KHO_MOC)}, JSON.stringify(rows));
await db.company.updateMany({ data: { lastActivityAt: null } });
console.log(\`-- da go moc hoat dong cua \${rows.length} cong ty, chup vao ${KHO_MOC}\`);
`;

const kichBanPhucHoatDong = `
import { readFileSync } from "node:fs";
import { db } from "./src/client";
const rows = JSON.parse(readFileSync(${JSON.stringify(KHO_MOC)}, "utf8"));
for (const r of rows) {
  await db.company.update({ where: { id: r.id }, data: { lastActivityAt: new Date(r.lastActivityAt) } });
}
console.log(\`-- da phuc moc hoat dong cho \${rows.length} cong ty\`);
`;

const kichBan = `
import { db } from "./src/client";

const CAN = ${JSON.stringify(TRANG_THAI)};

const rows = await db.company.findMany({
	select: { id: true, name: true, enrichmentStatus: true },
	orderBy: { name: "asc" },
});

if (rows.length < CAN.length + 1) {
	console.log(
		\`KHONG GIEO DUOC: chi co \${rows.length} cong ty, can it nhat \${CAN.length + 1} de giu mot cai o PENDING\`,
	);
	process.exit(2);
}

const dangCo = new Set(rows.map((r) => r.enrichmentStatus));
const thieu = CAN.filter((t) => !dangCo.has(t));

if (thieu.length === 0) {
	console.log("-- du lieu thu da du nam trang thai bo sung du lieu, khong gieo them");
	for (const t of ["PENDING", ...CAN]) {
		console.log(\`   \${t.padEnd(10)} \${rows.filter((r) => r.enrichmentStatus === t).length} cong ty\`);
	}
	process.exit(0);
}

const nhan = rows.slice(1, 1 + thieu.length);
for (let i = 0; i < thieu.length; i += 1) {
	const c = nhan[i];
	await db.company.update({
		where: { id: c.id },
		data: { enrichmentStatus: thieu[i] },
	});
	console.log(\`   \${thieu[i].padEnd(10)} <- \${c.name}\`);
}

const sau = await db.company.findMany({ select: { enrichmentStatus: true } });
const dem = {};
for (const r of sau) dem[r.enrichmentStatus] = (dem[r.enrichmentStatus] ?? 0) + 1;
const conThieu = ["PENDING", ...CAN].filter((t) => !dem[t]);
console.log(\`-- sau khi gieo: \${JSON.stringify(dem)}\`);
if (conThieu.length > 0) {
	console.log(\`KHONG GIEO DUOC: van thieu \${conThieu.join(", ")}\`);
	process.exit(1);
}
`;

console.log("-- gieo du lieu thu");
try {
	const chon = GO_HOAT_DONG
	? kichBanGoHoatDong
	: PHUC_HOAT_DONG
		? kichBanPhucHoatDong
		: TRA_VE
			? kichBanTraVe
			: kichBan;
	const ra = execFileSync("bun", ["-e", chon], {
		cwd: `${GOC}/packages/db`,
		encoding: "utf8",
		env: process.env,
	});
	process.stdout.write(ra);
} catch (loi) {
	console.log(
		`KHONG GIEO DUOC: ${String(loi.stdout ?? "")}${String(loi.stderr ?? loi.message).slice(0, 400)}`,
	);
	process.exit(2);
}
