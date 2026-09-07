import { execSync } from "node:child_process";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { GOC, docGoi, docTask } from "./cau-hinh-turbo.mjs";

const CHUNG_DUONG = {
	goi: "packages/ui",
	task: "check-types",
	file: "packages/ui/src/lib/messages.ts",
};

function raNgoai(goi) {
	const ra = [];
	for (const thu of ["src", "test", "scripts"]) {
		const goc = join(GOC, goi, thu);
		const di = (d) => {
			let ten = [];
			try {
				ten = readdirSync(d);
			} catch {
				return;
			}
			for (const t of ten) {
				const p = join(d, t);
				if (statSync(p).isDirectory()) di(p);
				else if (/\.(ts|tsx|mjs)$/.test(t)) {
					const s = readFileSync(p, "utf8");
					if (/"\.\.\/\.\.\/\.\."|_acceptance/.test(s)) ra.push(p.slice(GOC.length + 1));
				}
			}
		};
		di(goc);
	}
	return ra;
}

function demCache(goi, task) {
	let out = "";
	try {
		out = execSync(`bunx turbo run ${task} --filter=./${goi} --concurrency=1`, {
			cwd: GOC,
			encoding: "utf8",
			stdio: "pipe",
			maxBuffer: 20e6,
		});
	} catch (e) {
		out = `${e.stdout ?? ""}${e.stderr ?? ""}`;
	}
	const m = out.match(/Cached:\s+(\d+) cached, (\d+) total/);
	return m === null ? null : { cached: Number(m[1]), total: Number(m[2]) };
}

function cham(duong) {
	const goc = readFileSync(duong, "utf8");
	const dau = `${Date.now()}-${Math.random()}`;
	writeFileSync(duong, `${goc}\n${dau}\n`);
	return { goc, dau };
}

const d = docTask();
if (d === null) {
	console.error("KHONG DO DUOC: khong doc duoc cau hinh turbo.");
	process.exit(2);
}
const soGoiKhai = d.so_goi;
const conDem = d.task.filter((t) => t.dem);
if (conDem.length === 0) {
	console.error("KHONG DO DUOC: bang rong — khong task nao con dem.");
	process.exit(2);
}

function thucThi(goi, task) {
	const sc =
		JSON.parse(readFileSync(join(GOC, goi, "package.json"), "utf8")).scripts ?? {};
	return /\b(bun|vitest|jest|node|tsx)\s+test\b|\btest\b.*--preload|^bun test/.test(
		sc[task] ?? "",
	);
}

const bang = [];
const goiDaQuet = new Set();
for (const t of conDem) {
	goiDaQuet.add(t.goi);
	const file = raNgoai(t.goi);
	const chay = thucThi(t.goi, t.task);
	bang.push({
		goi: t.goi,
		task: t.task,
		file,
		thuc_thi: chay,
		doc_ngoai: file.length > 0 && chay,
	});
}
const moiGoi = docGoi()?.goi ?? [];
const khongTaskDem = moiGoi.filter((g) => !goiDaQuet.has(g));
console.log(`goi khai trong workspaces: ${soGoiKhai}`);
console.log(`  co task con dem — da quet: ${goiDaQuet.size}`);
console.log(
	`  khong task nao con dem — khai ra: ${khongTaskDem.length}${khongTaskDem.length ? ` (${khongTaskDem.join(" · ")})` : ""}`,
);
console.log(`task con dem: ${conDem.length}`);
if (goiDaQuet.size + khongTaskDem.length !== soGoiKhai) {
	console.error(
		`KHONG DO DUOC: ${goiDaQuet.size} goi da quet + ${khongTaskDem.length} goi khong task dem = ${goiDaQuet.size + khongTaskDem.length}, ma workspaces khai ${soGoiKhai} — co goi khong duoc ke den.`,
	);
	process.exit(2);
}

const viPham = bang.filter((r) => r.doc_ngoai);
const fileRaNgoai = [...new Set(bang.flatMap((r) => r.file))];
console.log(`file trong goi tro ra ngoai do thi: ${fileRaNgoai.length}`);
for (const f of fileRaNgoai) console.log(`  ${f}`);
console.log(
	"phan biet: task PHAN TICH (lint, check-types) chi doc VAN BAN file — van ban nam trong khoa cache nen khong doi duoc; chi task THUC THI moi chay no va doc ra ngoai khoa.",
);
for (const r of bang.filter((x) => x.file.length > 0))
	console.log(`  ${r.goi}#${r.task} · thuc thi=${r.thuc_thi} · doc ngoai khoa=${r.doc_ngoai}`);

console.log(
	`\nDOI CHUNG DUONG ghim ten: ${CHUNG_DUONG.goi}#${CHUNG_DUONG.task} x ${CHUNG_DUONG.file}`,
);
const duongDan = join(GOC, CHUNG_DUONG.file);
let no = false;
let dau = "";
demCache(CHUNG_DUONG.goi, CHUNG_DUONG.task);
const truoc = demCache(CHUNG_DUONG.goi, CHUNG_DUONG.task);
const luu = cham(duongDan);
dau = luu.dau;
try {
	const sau = demCache(CHUNG_DUONG.goi, CHUNG_DUONG.task);
	console.log(
		`  moi cache truoc khi do · noi dung cham (chua tung co): ${dau}\n  truoc ${truoc?.cached}/${truoc?.total} · sau ${sau?.cached}/${sau?.total}`,
	);
	no =
		truoc !== null &&
		sau !== null &&
		truoc.total >= 1 &&
		truoc.cached === truoc.total &&
		sau.cached < sau.total;
} finally {
	writeFileSync(duongDan, luu.goc);
}
if (!no) {
	console.error(
		`KHONG DO DUOC: doi chung duong KHONG no — ${CHUNG_DUONG.goi}#${CHUNG_DUONG.task} la task CON DEM va ${CHUNG_DUONG.file} nam trong khoa cua no, nen cham vao PHAI lam cache be. Khong be nghia la phep cham hoac phep dem cache hong, va ca bang "khong doc ngoai khoa" khong ket luan duoc gi.`,
	);
	process.exit(2);
}
console.log("  doi chung duong NO dung — phep cham that su lam task chay lai.");

if (viPham.length > 0) {
	for (const r of viPham)
		console.error(
			`DO: ${r.goi}#${r.task} vua CON DEM vua doc file ngoai do thi (${r.file.join(" · ")}) — van con vat de AC-3/AC-4 cua ho so cu do, khong duoc go chung.`,
		);
	process.exit(1);
}
console.log(
	`XANH: ${conDem.length} task con dem tren ${goiDaQuet.size} goi, KHONG task nao doc file ngoai do thi. Ca ${fileRaNgoai.length} file tro ra ngoai deu nam trong test — task duy nhat tat dem. Hai tieu chi cu that su het doi tuong.`,
);
