import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, symlinkSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DAY = dirname(fileURLToPath(import.meta.url));
const GOC = process.env.GOC_KHO ?? join(DAY, "..", "..", "..");
const ts = createRequire(import.meta.url)("typescript");
const GOP_VONG = "f1a32ab991b6e085d5f1c7c540dd8d9553fa6cad";
const BO_LAN = process.argv.includes("--bo-lan");

const HO_SO = [
	"nhac-qua-zalo",
	"noi-zalo-cho-nguoi-moi",
	"loi-tac-tu-zalo-noi-dung-nguyen-nhan",
	"loi-vao-dieu-phoi-30-ngay",
	"cai-dat-con-lai-noi-tieng-viet",
	"man-cai-dat-noi-tieng-viet",
	"tong-quan-va-khung-noi-tieng-viet",
	"onboarding-giong-deals",
	"truong-tu-tao-o-cai-dat",
	"to-chuc-danh-sach-chi-tiet",
	"zalo-goi-thu-hong-hien-dung-bot",
];
const NHIN_THAY_BI_DUNG = [
	"nhac-qua-zalo E17",
	"noi-zalo-cho-nguoi-moi E19",
	"tong-quan-va-khung-noi-tieng-viet E18",
	"truong-tu-tao-o-cai-dat E5",
	"truong-tu-tao-o-cai-dat E6",
	"truong-tu-tao-o-cai-dat E12",
	"truong-tu-tao-o-cai-dat E14",
	"truong-tu-tao-o-cai-dat E22",
	"to-chuc-danh-sach-chi-tiet E17",
	"zalo-goi-thu-hong-hien-dung-bot E8",
];
const BAI_DOI_DUOC = "apps/app/test/cai-dat-dieu-huong.spec.ts";
const TEN_BAI_DOI = "loi-vao-dieu-phoi";
const GAC_DAU = "apps/app/test/messages-guard.spec.ts";
const KHOA_MIEN_MOI = [
	'"thanhBen.chung",',
	'"tieuDeTab.chung",',
	'"chung.tieuDe",',
];

let dung = 0;
let sai = 0;

function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

function khang(dat, cau) {
	if (dat) dung += 1;
	else {
		sai += 1;
		console.log(`DO: ${cau}`);
	}
}

const git = (...doi) =>
	execFileSync("git", ["-C", GOC, ...doi], { encoding: "utf8" }).trim();

function boNhay(v) {
	const t = v.trim();
	if (t.startsWith("'") && t.endsWith("'"))
		return t.slice(1, -1).replaceAll("''", "'");
	if (t.startsWith('"') && t.endsWith('"')) return JSON.parse(t);
	return t;
}

function lenhCuaCauHinh() {
	const lenh = new Map();
	let nhom = null;
	for (const dong of readFileSync(
		join(GOC, "_acceptance/config.yaml"),
		"utf8",
	).split("\n")) {
		const n = /^ {2}(\w+):\s*$/.exec(dong);
		if (n) nhom = n[1];
		const m = /^ {4}(\w+):\s*(.+)$/.exec(dong);
		if (m && nhom) lenh.set(`executors.${nhom}.${m[1]}`, boNhay(m[2]));
	}
	return lenh;
}

// F8 neo (ve-sinh-do-san-onehub): docEvals nhan them sha — co sha thi doc evals.yaml o dung commit do
// (paths cua eval ho so khac duoc «khai paths» sau khi vong ky, 04/10), khong co thi doc cay hien tai.
function docEvals(hoSo, sha) {
	let noiDung;
	if (sha) {
		const r = spawnSync("git", ["-C", GOC, "show", `${sha}:_acceptance/${hoSo}/evals.yaml`], {
			encoding: "utf8",
		});
		if (r.status !== 0) return null;
		noiDung = r.stdout;
	} else {
		const tep = join(GOC, "_acceptance", hoSo, "evals.yaml");
		if (!existsSync(tep)) return null;
		noiDung = readFileSync(tep, "utf8");
	}
	const ra = [];
	let cur = null;
	let trongPaths = false;
	// F8 neo (ve-sinh-do-san-onehub): cung bo doc dong cho ca hai nguon (cay hien tai va commit D).
	for (const dong of noiDung.split("\n")) {
		const moi = /^ {2}- id:\s*(\S+)/.exec(dong);
		if (moi) {
			cur = { id: moi[1], paths: [], executor: "", cmd: "", status: "" };
			ra.push(cur);
			trongPaths = false;
			continue;
		}
		if (!cur) continue;
		const kv = /^ {4}(\w+):\s*(.*)$/.exec(dong);
		if (kv) {
			trongPaths = kv[1] === "paths";
			if (["executor", "cmd", "status"].includes(kv[1]))
				cur[kv[1]] = boNhay(kv[2]);
			continue;
		}
		const pt = /^ {6}- (.+)$/.exec(dong);
		if (trongPaths && pt) cur.paths.push(boNhay(pt[1]));
	}
	return ra;
}

function khopGlob(glob, tep) {
	const r = glob
		.replace(/[.+^${}()|[\]\\]/g, "\\$&")
		.replace(/\*\*\//g, "\u0000")
		.replace(/\*\*/g, "\u0001")
		.replace(/\*/g, "[^/]*")
		.replaceAll("\u0000", "(?:.*/)?")
		.replaceAll("\u0001", ".*");
	return new RegExp(`^${r}$`).test(tep);
}

function cacBai(chu) {
	const goc = ts.createSourceFile(
		"x.ts",
		chu,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TS,
	);
	const ra = new Map();
	const di = (n) => {
		if (
			ts.isCallExpression(n) &&
			ts.isIdentifier(n.expression) &&
			["it", "test"].includes(n.expression.text) &&
			n.arguments[0] &&
			ts.isStringLiteralLike(n.arguments[0])
		)
			ra.set(n.arguments[0].text, n.arguments[1]?.getText() ?? "");
		ts.forEachChild(n, di);
	};
	di(goc);
	return ra;
}

const DAU_VONG = git("rev-parse", `${GOP_VONG}^2`);
const moc = git("merge-base", `${GOP_VONG}^1`, DAU_VONG);
const doi = git("diff", "--name-only", moc, DAU_VONG)
	.split("\n")
	.filter(Boolean);
const lenh = lenhCuaCauHinh();

const docDuoc = HO_SO.map((h) => [h, docEvals(h)]).filter(
	([, e]) => e !== null,
);
if (docDuoc.length !== HO_SO.length)
	khongDo(`doc duoc ${docDuoc.length}/${HO_SO.length} ho so`);

const chayMay = new Map();
const tepBai = new Map();
const nhinThay = [];
for (const [h, evals] of docDuoc) {
	for (const e of evals) {
		// F8 neo (ve-sinh-do-san-onehub): eval nhin-thay dem rieng tren evals.yaml o D (vong lap ben duoi).
		if (["ui-check", "judgment"].includes(e.executor)) continue;
		if (e.status === "not-run") continue;
		const ref = e.cmd.replace(/^config:/, "");
		const c = lenh.get(ref);
		if (!c) khongDo(`${h} ${e.id}: khong giai duoc ${e.cmd}`);
		if (!chayMay.has(c)) chayMay.set(c, `${h} ${e.id}`);
		const thuMuc = /cd ((?:apps|packages)\/[\w-]+)/.exec(c)?.[1];
		for (const m of c.matchAll(
			/(?:\.\/)?(test\/[\w./-]+\.(?:spec|dom)\.tsx?)/g,
		))
			if (thuMuc) {
				const t = `${thuMuc}/${m[1]}`;
				tepBai.set(t, [...(tepBai.get(t) ?? []), h]);
			}
	}
}

// F8 neo (ve-sinh-do-san-onehub): tap eval nhin-thay bi dung tinh tren evals.yaml o D cua cap gop — cung cho
// voi diff moc..D; paths khai them sau khi vong ky khong lam tap nay lech.
for (const h of HO_SO) {
	for (const e of docEvals(h, DAU_VONG) ?? []) {
		if (!["ui-check", "judgment"].includes(e.executor)) continue;
		if (doi.some((t) => e.paths.some((g) => khopGlob(g, t))))
			nhinThay.push(`${h} ${e.id}`);
	}
}

for (const [t, hoSo] of tepBai) {
	if (!doi.includes(t)) {
		dung += 1;
		continue;
	}
	if (t === GAC_DAU) {
		const hunk = git("diff", "-U0", moc, DAU_VONG, "--", t)
			.split("\n")
			.filter((d) => /^[+-]/.test(d) && !/^(\+\+\+|---)/.test(d));
		const bo = hunk.filter((d) => d.startsWith("-"));
		const them = hunk
			.filter((d) => d.startsWith("+"))
			.map((d) => d.slice(1).trim());
		khang(
			bo.length === 0 &&
				them.length === KHOA_MIEN_MOI.length &&
				KHOA_MIEN_MOI.every((k) => them.includes(k)),
			`${hoSo[0]}: bai ${t} doi ngoai pham vi da khai (${JSON.stringify(them)})`,
		);
		continue;
	}
	if (t === BAI_DOI_DUOC) {
		const cu = cacBai(git("show", `${moc}:${t}`));
		const moi = cacBai(git("show", `${DAU_VONG}:${t}`));
		const tenCu = [...cu.keys()].sort();
		const tenMoi = [...moi.keys()].sort();
		const khac = tenMoi.filter(
			(k) => !k.startsWith(TEN_BAI_DOI) && cu.get(k) !== moi.get(k),
		);
		khang(
			JSON.stringify(tenCu) === JSON.stringify(tenMoi) && khac.length === 0,
			`${hoSo[0]}: bai ${khac[0] ?? "ten bai"} doi ngoai pham vi da khai`,
		);
		continue;
	}
	khang(false, `${hoSo[0]}: bai ${t} doi ngoai pham vi da khai`);
}

const e17 = readFileSync(
	join(GOC, "_acceptance/nhac-qua-zalo/evals.yaml"),
	"utf8",
);
const khoiE17 = e17.slice(
	e17.indexOf("  - id: E17"),
	e17.indexOf("  - id: E18"),
);
khang(
	khoiE17.includes("/<slug>/reminders"),
	"nhac-qua-zalo E17: buoc mo chua doi sang /reminders",
);
khang(
	khoiE17.includes("Nhắc buổi sáng") && !khoiE17.includes("Thông báo của bạn"),
	"nhac-qua-zalo E17: dong thanh ben chua doi sang menu nguoi dung",
);

const thua = nhinThay.filter((x) => !NHIN_THAY_BI_DUNG.includes(x));
const thieu = NHIN_THAY_BI_DUNG.filter((x) => !nhinThay.includes(x));
khang(
	thua.length === 0 && thieu.length === 0,
	`tap eval nhin-thay bi dung lech khai: thua ${JSON.stringify(thua)}, thieu ${JSON.stringify(thieu)}`,
);

const CAN_MAY_CHU = /tien-de|APP_URL|API_URL/;
const doSan = [];
const canMayChu = [];

function cayGoc() {
	const goc = join(GOC, ".acceptance-runs", "khung-trang-cai-dat", "goc");
	if (!existsSync(goc)) git("worktree", "add", "--detach", goc, moc);
	else execFileSync("git", ["-C", goc, "checkout", "-q", "--detach", moc]);
	const noi = [
		".env",
		"node_modules",
		"apps/app/node_modules",
		"apps/api/node_modules",
		"apps/agent/node_modules",
		"packages/ui/node_modules",
		"packages/db/node_modules",
	];
	for (const d of noi)
		if (existsSync(join(GOC, d)) && !existsSync(join(goc, d)))
			symlinkSync(join(GOC, d), join(goc, d));
	// ve-sinh-do-san-onehub cach-toi: cay moc tu sinh Prisma client cua schema o moc; symlink generated tu cay that
	// lam lenh db:generate trong cay moc ghi schema cu de len cay that (luot ghim lai 07:08Z, 16/10).
	if (!existsSync(join(goc, "packages/db/src/generated"))) {
		const r = spawnSync("bun", ["run", "db:generate"], { cwd: goc, encoding: "utf8" });
		if (r.status !== 0) khongDo(`cay moc khong sinh duoc Prisma client (ma ${r.status})`);
	}
	return goc;
}

function chay(c, cwd) {
	return spawnSync("bash", ["-lc", c], {
		cwd,
		encoding: "utf8",
		timeout: 900000,
	});
}

if (!BO_LAN) {
	let goc = null;
	for (const [c, ai] of chayMay) {
		if (CAN_MAY_CHU.test(c)) {
			canMayChu.push(ai);
			continue;
		}
		const r = chay(c, GOC);
		if (r.status === 0) {
			dung += 1;
			continue;
		}
		goc ??= cayGoc();
		const g = chay(c, goc);
		if (g.status !== 0) {
			doSan.push(`${ai} (HEAD ${r.status}, merge-base ${g.status})`);
			continue;
		}
		khang(
			false,
			`${ai}: hoi quy — HEAD ma ${r.status}, merge-base ma 0 — ${c.slice(0, 120)}`,
		);
		console.log(
			`${r.stdout ?? ""}${r.stderr ?? ""}`.split("\n").slice(-12).join("\n"),
		);
	}
	console.log(
		`do san (do ca o merge-base, khong tinh la hoi quy): ${doSan.length}`,
	);
	for (const x of doSan) console.log(`  do-san: ${x}`);
	console.log(
		`can may chu (khong chay o day, lan ghim lai cua tung ho so): ${canMayChu.length}`,
	);
	for (const x of canMayChu) console.log(`  can-may-chu: ${x}`);
}

console.log(
	`khong-hoi-quy: ${dung}/${dung + sai} khang dinh dat · ${tepBai.size} tep bai · ${chayMay.size} lenh${BO_LAN ? " (bo lan)" : ""}`,
);
process.exit(sai === 0 ? 0 : 1);
