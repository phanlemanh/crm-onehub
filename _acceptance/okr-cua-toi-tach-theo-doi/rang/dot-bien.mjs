import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const TRAN_MS = 15 * 60_000;

const TEP = {
	cuaToi: "apps/api/src/okr/cua-toi.ts",
	service: "apps/api/src/okr/okr.service.ts",
	traoDoi: "apps/api/src/okr/okr-trao-doi.service.ts",
	man: "apps/app/app/(app)/[slug]/okr/cua-toi.tsx",
};

const DOT_BIEN = [
	{
		ma: "a",
		ten: "chia lot chi-theo-doi-da-bo",
		tep: TEP.cuaToi,
		tu: '(m) => !idsCuaToi.has(m.id) && m.status !== "da-bo"',
		thanh: "(m) => !idsCuaToi.has(m.id)",
		phai: [
			{ khoa: "ctt_chia", ghim: "chi-theo-doi-da-bo lot vao dangTheoDoi" },
			{ khoa: "ctt_da_bo", ghim: "D5 o dangTheoDoi" },
		],
	},
	{
		ma: "b",
		ten: "status === cong-bo thay cho !== da-bo",
		tep: TEP.cuaToi,
		tu: 'objectives: cuaToi.filter((m) => m.status !== "da-bo"),',
		thanh: 'objectives: cuaToi.filter((m) => m.status === "cong-bo"),',
		phai: [{ khoa: "ctt_chia", ghim: "nhap cua toi roi khoi objectives" }],
	},
	{
		ma: "c",
		ten: "idsCuaToi nam vai",
		tep: TEP.service,
		tu: "where: { cycleId, OR: vaiCuaToi(userId) },",
		thanh:
			"where: { cycleId, OR: [...vaiCuaToi(userId), { followers: { some: { userId } } }] },",
		phai: [{ khoa: "ctt_mine", ghim: "M5 o objectives" }],
	},
	{
		ma: "d",
		ten: "dangTheoDoi tu okrFollow khong tru idsCuaToi",
		tep: TEP.service,
		tu: "return chiaCuaToi(ds, new Set(cuaToi.map((m) => m.id)));",
		thanh:
			'return { ...chiaCuaToi(ds, new Set(cuaToi.map((m) => m.id))), dangTheoDoi: ds.filter((m) => m.following && m.status !== "da-bo") };',
		phai: [{ khoa: "ctt_trung_vai", ghim: "T1 o dangTheoDoi" }],
	},
	{
		ma: "e",
		ten: "bo nguCanhXem phan theo doi",
		tep: TEP.service,
		tu: "{ nguCanh: this.quyenOkr.nguCanhXem(q, userId) },\n\t\t\t),\n\t\t\tthis.db.okrObjective.findMany({\n\t\t\t\twhere: { cycleId, OR: vaiCuaToi(userId) },",
		thanh:
			"{ nguCanh: { ...this.quyenOkr.nguCanhXem(q, userId), quanTri: true } },\n\t\t\t),\n\t\t\tthis.db.okrObjective.findMany({\n\t\t\t\twhere: { cycleId, OR: vaiCuaToi(userId) },",
		phai: [{ khoa: "ctt_hien_thi", ghim: "H lo du bi gioi han" }],
	},
	{
		ma: "f",
		ten: "follow bo deleteMany khi tat",
		tep: TEP.traoDoi,
		tu: "where: { objectiveId: input.objectiveId, userId },",
		thanh: 'where: { objectiveId: input.objectiveId, userId: "__khong-ai__" },',
		phai: [{ khoa: "ctt_bo_theo_doi", ghim: "F con o dangTheoDoi sau khi tat" }],
	},
	{
		ma: "g",
		ten: "nhanh rong mat nhom theo doi",
		tep: TEP.man,
		tu: "</Empty>\n\t\t\t\t{nhomTheoDoi}",
		thanh: "</Empty>",
		phai: [{ khoa: "ctt_dom", ghim: "ST-cuatoi-rong khong co nhom theo doi" }],
	},
];

const SO_CAP = DOT_BIEN.reduce((n, d) => n + d.phai.length, 0);

function docLenh() {
	const cfg = readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8");
	const lenh = {};
	for (const dong of cfg.split("\n")) {
		const m = dong.match(/^ {4}(ctt_[a-z_]+): (.+)$/);
		if (!m) continue;
		let v = m[2].trim();
		if (
			(v.startsWith('"') && v.endsWith('"')) ||
			(v.startsWith("'") && v.endsWith("'"))
		)
			v = v.slice(1, -1);
		lenh[m[1]] = v;
	}
	return lenh;
}

function readlinkOr(p) {
	try {
		return execFileSync("readlink", [p], { encoding: "utf8" }).trim() || p;
	} catch {
		return p;
	}
}

function chayLenh(sao, lenh) {
	const r = spawnSync("bash", ["-c", lenh], {
		cwd: sao,
		encoding: "utf8",
		timeout: TRAN_MS,
		maxBuffer: 64 * 1024 * 1024,
		env: { ...process.env, PHIEN_DO_TEN_CAY: "ctt-dot-bien" },
	});
	return { ma: r.status ?? 2, ra: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

const lenh = docLenh();
const thieu = [
	...new Set(DOT_BIEN.flatMap((d) => d.phai.map((p) => p.khoa))),
].filter((k) => !lenh[k]);
if (thieu.length > 0) {
	console.log(`KHONG DO DUOC: config thieu ${thieu.join(", ")}`);
	process.exit(2);
}

const tam = mkdtempSync(join(tmpdir(), "ctt-dot-bien-"));
const sao = join(tam, "crm");
const hong = [];
let soCapDaChay = 0;
let ma = 1;
try {
	execFileSync("git", ["worktree", "add", "--detach", "--quiet", sao, "HEAD"], {
		cwd: GOC,
		stdio: "inherit",
	});
	const env = join(GOC, ".env");
	if (existsSync(env)) symlinkSync(readlinkOr(env), join(sao, ".env"));
	execFileSync("bun", ["install", "--frozen-lockfile", "--silent"], {
		cwd: sao,
		stdio: "inherit",
	});
	execFileSync("bun", ["run", "db:generate"], { cwd: sao, stdio: "ignore" });

	const cacKhoa = [
		...new Set(DOT_BIEN.flatMap((d) => d.phai.map((p) => p.khoa))),
	];
	for (const khoa of cacKhoa) {
		const r = chayLenh(sao, lenh[khoa]);
		console.log(`lanh ${khoa}: ma ${r.ma}`);
		if (r.ma !== 0) hong.push(`doi chung lanh ${khoa} ma ${r.ma}`);
	}

	for (const d of DOT_BIEN) {
		const tep = join(sao, d.tep);
		const goc = readFileSync(tep, "utf8");
		if (!goc.includes(d.tu)) {
			hong.push(`dot bien (${d.ma}) ${d.ten}: khong thay diem cam trong ${d.tep}`);
			continue;
		}
		writeFileSync(tep, goc.replace(d.tu, d.thanh));
		try {
			for (const p of d.phai) {
				const r = chayLenh(sao, lenh[p.khoa]);
				soCapDaChay += 1;
				const coGhim = r.ra.includes(p.ghim);
				const dung = r.ma !== 0 && coGhim;
				console.log(
					`dot bien (${d.ma}) ${d.ten} → ${p.khoa}: ma ${r.ma}, ${coGhim ? `in «${p.ghim}»` : `KHONG in «${p.ghim}»`} → ${dung ? "do dung" : "LOT"}`,
				);
				if (!dung)
					hong.push(
						`dot bien (${d.ma}) ${d.ten} → ${p.khoa}: ma ${r.ma}, ${coGhim ? "co ghim" : "thieu ghim"}`,
					);
			}
		} finally {
			writeFileSync(tep, goc);
		}
	}
	if (soCapDaChay !== SO_CAP)
		hong.push(`so cap da chay ${soCapDaChay} != ${SO_CAP}`);
	ma = hong.length === 0 ? 0 : 1;
} catch (e) {
	console.log(`KHONG DO DUOC: ${String(e?.stack ?? e).slice(0, 600)}`);
	ma = 2;
} finally {
	try {
		execFileSync("git", ["worktree", "remove", "--force", sao], {
			cwd: GOC,
			stdio: "ignore",
		});
	} catch {}
	rmSync(tam, { recursive: true, force: true });
	try {
		execFileSync("git", ["worktree", "prune"], { cwd: GOC, stdio: "ignore" });
	} catch {}
}
if (ma === 1) for (const h of hong) console.log(`hong: ${h}`);
console.log(
	ma === 0
		? `dot-bien: ${soCapDaChay}/${SO_CAP} cap do dung ghim, doi chung lanh xanh`
		: `dot-bien: ma ${ma}`,
);
process.exit(ma);
