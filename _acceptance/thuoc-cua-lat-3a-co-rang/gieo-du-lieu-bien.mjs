import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const TRANG_THAI = ["RUNNING", "COMPLETE", "FAILED", "SKIPPED"];

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

console.log("-- gieo nam trang thai bo sung du lieu cho du lieu thu");
try {
	const ra = execFileSync("bun", ["-e", kichBan], {
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
