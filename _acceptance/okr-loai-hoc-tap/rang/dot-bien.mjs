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
const SO_CAP_KHAI = 14;

const TEP = {
	soan: "packages/validation/src/okr-cuoc-soan.ts",
	mucTieu: "packages/validation/src/okr-muc-tieu.ts",
	khepVal: "packages/validation/src/okr-khep.ts",
	khepSvc: "apps/api/src/okr/okr-khep.service.ts",
	svc: "apps/api/src/okr/okr.service.ts",
	khep: "apps/api/src/okr/khep.ts",
	cfg: "apps/api/src/okr/okr-config.ts",
	hop: "apps/app/app/(app)/[slug]/settings/okr/hop-thoai-dong-ky.tsx",
	cham: "apps/app/app/(app)/[slug]/okr/cham-diem.tsx",
	hopMt: "apps/app/app/(app)/[slug]/okr/hop-thoai-muc-tieu.tsx",
};

const DOT_BIEN = [
	{
		ma: "a",
		ten: "LOAI_MUC_TIEU_NHAP mang tay",
		tep: TEP.soan,
		tu: "export const LOAI_MUC_TIEU_NHAP = LOAI_MUC_TIEU;",
		thanh:
			'export const LOAI_MUC_TIEU_NHAP = ["cam-ket", "tham-vong"] as const;\nvoid LOAI_MUC_TIEU;',
		phai: [
			{ khoa: "olht_mot_nguon", ghim: "LOAI_MUC_TIEU_NHAP lech LOAI_MUC_TIEU" },
			{ khoa: "olht_soan_nhan", ghim: "soan OKR tu choi hoc-tap" },
		],
	},
	{
		ma: "b",
		ten: "LOAI_MUC_TIEU bo hoc-tap",
		tep: TEP.mucTieu,
		tu: 'export const LOAI_MUC_TIEU = ["cam-ket", "tham-vong", "hoc-tap"] as const;',
		thanh: 'export const LOAI_MUC_TIEU = ["cam-ket", "tham-vong"] as const;',
		phai: [{ khoa: "olht_api_tao", ghim: "tao hoc-tap bi tu choi" }],
	},
	{
		ma: "c",
		ten: "tinhTrang dieu kien cu",
		tep: TEP.mucTieu,
		tu: 'if (loai !== "cam-ket")',
		thanh: 'if (loai === "tham-vong")',
		phai: [{ khoa: "olht_tinh_trang", ghim: "hoc-tap ra truot o muc 0.49" }],
	},
	{
		ma: "d",
		ten: "cachDoc bo trim",
		tep: TEP.khepVal,
		tu: "dieuHocDuoc.trim() ?",
		thanh: "dieuHocDuoc ?",
		phai: [
			{ khoa: "olht_cach_doc", ghim: "khoang trang doc thanh da-tra-loi" },
		],
	},
	{
		ma: "e",
		ten: "bang cham chi doc khi co diem",
		tep: TEP.khepSvc,
		tu: 'cachDoc: cachDoc(loai, diem, m.nhinLai?.dieuHocDuoc ?? ""),',
		thanh:
			'cachDoc: diem === null ? null : cachDoc(loai, diem, m.nhinLai?.dieuHocDuoc ?? ""),',
		phai: [
			{ khoa: "olht_bang_cham", ghim: "hoc-tap chua cham khong co cach doc" },
		],
	},
	{
		ma: "f",
		ten: "bo kiem khep",
		tep: TEP.svc,
		tu: "if (hocTap.length > 0)",
		thanh: "if (hocTap.length > 999)",
		phai: [{ khoa: "olht_khep", ghim: "khep duoc khi con hoc-tap chua ghi" }],
	},
	{
		ma: "g",
		ten: "bo dieu kien cong bo",
		tep: TEP.khep,
		tu: '{ cycleId, kind: "hoc-tap", status: "cong-bo" },',
		thanh: '{ cycleId, kind: "hoc-tap" },',
		phai: [{ khoa: "olht_khep_bien", ghim: "hoc-tap da bo van chan khep" }],
	},
	{
		ma: "h",
		ten: "hop khep chi xet conLai",
		tep: TEP.hop,
		tu: "bang.data.conLai === 0 && hocTap.length === 0",
		thanh: "bang.data.conLai === 0",
		phai: [
			{ khoa: "olht_dom", ghim: "hop xac nhan hien khi con hoc-tap chua ghi" },
		],
	},
	{
		ma: "i",
		ten: "man cham an nhan khi diem trong",
		tep: TEP.cham,
		tu: "if (mt.diem === null && mt.cachDoc !== null)",
		thanh: 'if (mt.diem === null && mt.cachDoc === "__khong-co__")',
		phai: [{ khoa: "olht_dom", ghim: "hoc-tap diem trong mat nhan cach doc" }],
	},
	{
		ma: "j",
		ten: "hop chon loc bo hoc-tap",
		tep: TEP.hopMt,
		tu: "{LOAI_MUC_TIEU.map((l) => (",
		thanh: '{LOAI_MUC_TIEU.filter((l) => l !== "hoc-tap").map((l) => (',
		phai: [{ khoa: "olht_dom", ghim: "hop chon loai thieu Hoc tap" }],
	},
	{
		ma: "l",
		ten: "thong diep chi in ten dau",
		tep: TEP.cfg,
		tu: '${ten.join(", ")}',
		thanh: "${ten[0]}",
		phai: [{ khoa: "olht_khep", ghim: "thieu ten hoc-tap thu hai" }],
	},
	{
		ma: "m",
		ten: "loc kieu loai tru",
		tep: TEP.khep,
		tu: '{ cycleId, kind: "hoc-tap", status: "cong-bo" },',
		thanh:
			'{ cycleId, kind: "hoc-tap", status: { notIn: ["nhap", "da-bo"] } },',
		phai: [{ khoa: "olht_khep_bien", ghim: "hoc-tap cho duyet van chan khep" }],
	},
	{
		ma: "n",
		ten: "bo translate no tren ten",
		tep: TEP.hop,
		tu: '<span translate="no">{m.ten}</span>',
		thanh: "<span>{m.ten}</span>",
		phai: [{ khoa: "olht_dom", ghim: "ten hoc-tap thieu translate no" }],
	},
];

const soCapBang = DOT_BIEN.reduce((n, d) => n + d.phai.length, 0);
if (soCapBang !== SO_CAP_KHAI) {
	console.log(
		`KHONG DO DUOC: bang co ${soCapBang} cap, hang khai ${SO_CAP_KHAI}`,
	);
	process.exit(1);
}

function docLenh() {
	const cfg = readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8");
	const lenh = {};
	for (const dong of cfg.split("\n")) {
		const m = dong.match(/^ {4}(olht_[a-z_]+): (.+)$/);
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
		env: { ...process.env, PHIEN_DO_TEN_CAY: "olht-dot-bien" },
	});
	return { ma: r.status ?? 2, ra: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

const lenh = docLenh();
const cacKhoa = [
	...new Set(DOT_BIEN.flatMap((d) => d.phai.map((p) => p.khoa))),
];
const thieu = cacKhoa.filter((k) => !lenh[k]);
if (thieu.length > 0) {
	console.log(`KHONG DO DUOC: config thieu ${thieu.join(", ")}`);
	process.exit(2);
}

const tam = mkdtempSync(join(tmpdir(), "olht-dot-bien-"));
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

	for (const khoa of cacKhoa) {
		const r = chayLenh(sao, lenh[khoa]);
		console.log(`lanh ${khoa}: ma ${r.ma}`);
		if (r.ma !== 0) hong.push(`doi chung lanh ${khoa} ma ${r.ma}`);
	}

	for (const d of DOT_BIEN) {
		const tep = join(sao, d.tep);
		const goc = readFileSync(tep, "utf8");
		if (!goc.includes(d.tu)) {
			hong.push(
				`dot bien (${d.ma}) ${d.ten}: khong thay diem cam trong ${d.tep}`,
			);
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
	if (soCapDaChay !== SO_CAP_KHAI)
		hong.push(`so cap da chay ${soCapDaChay} != ${SO_CAP_KHAI}`);
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
		? `dot-bien: ${soCapDaChay}/${SO_CAP_KHAI} cap do dung ghim, doi chung lanh xanh`
		: `dot-bien: ma ${ma}`,
);
process.exit(ma);
