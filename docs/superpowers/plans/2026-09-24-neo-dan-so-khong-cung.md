# Neo dân số không cứng — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thước `lai-ra-man.mjs dan-so` thôi ghim số tệp; đối chiếu «git theo dõi ⊆ bộ duyệt» thay vào; giữ neo `mac_dinh`, `dong_bang_cu`.

**Architecture:** Bộ đo `do-neo.mjs` viết TRƯỚC (đỏ trên thước cũ), rồi sửa `danSo()`: kiểm tập rỗng trước, đọc phía git (mã 2 khi không đọc được / gốc git khác / rỗng), so hai tập, rồi so hai neo còn lại.

**Tech Stack:** bun, node, git.

**Spec:** `docs/superpowers/specs/2026-09-24-neo-dan-so-khong-cung-design.md`

## Global Constraints

- Không chú thích trong mã (AGENTS.md).
- Hằng của bộ đo sống trong `rang/cau-hinh.mjs`.
- Diff ngoài `_acceptance/**` và T1 phải rỗng (AC-7).
- Bản gốc = `lai-ra-man.mjs` ở `e22d82882e656a0b536ed7756a4ae7e7c11ffb9d`.

---

### Task 1: Bộ đo `do-neo.mjs` (RED)

independent: false · phục vụ E1–E8

**Files:** Create `_acceptance/neo-dan-so-khong-cung/rang/cau-hinh.mjs`, `_acceptance/neo-dan-so-khong-cung/rang/do-neo.mjs`; Modify `_acceptance/config.yaml` (khoá `executors.script.ndk_*`, gọi bằng `bun`).

**Interfaces:** `bun do-neo.mjs --ca <them-tep|them-mac-dinh|bo-sot|chua-theo-doi|khong-do-duoc|cay-that|pham-vi|ho-so-goc>`; in `DUNG|SAI <ban> — <thông điệp>`; dòng cuối `DO-NEO KET LUAN: <n> DUNG, <m> SAI — ma thoat <x>`; mã 0/1/2.

- [x] **Step 1: `cau-hinh.mjs`**

```js
export const DO_NEO = Object.freeze({
	goc: "e22d82882e656a0b536ed7756a4ae7e7c11ffb9d",
	rang: "_acceptance/chan-lai-component-ra-man/rang",
	laiRaMan: "_acceptance/chan-lai-component-ra-man/rang/lai-ra-man.mjs",
	moiMacDinh: "_acceptance/chan-lai-component-ra-man/rang/moi-mac-dinh.mjs",
	soHoSoGoc: "_acceptance/chan-lai-component-ra-man/decisions.jsonl",
	hoSoGoc: "chan-lai-component-ra-man",
	slug: "neo-dan-so-khong-cung",
	canChep: [
		"packages/ui/src",
		"apps/app/components",
		"apps/app/lib",
		"apps/app/app",
		"_acceptance/chan-lai-component-ra-man/rang",
		"_acceptance/chu-mac-dinh-thu-vien-ngoai/rang",
	],
	thuMucGoc: [
		"packages/ui/src",
		"apps/app/components",
		"apps/app/lib",
		"apps/app/app",
	],
	chayRieng: ".acceptance-runs/neo-dan-so-khong-cung",
	loaiTruCu: 'export const LOAI_TRU = ["node_modules", ".next", "dist", "build"];',
	loaiTruTiem:
		'export const LOAI_TRU = ["node_modules", ".next", "dist", "build", "lib"];',
	tepThem: "apps/app/lib/do-neo-them.ts",
	tepMacDinh: "apps/app/components/do-neo-mac-dinh.tsx",
	tepChuaCommit: "apps/app/lib/do-neo-chua-commit.ts",
	lenhCong: ["cl_tieng_viet_den_man", "cl_dan_so"],
	mauPhamVi: "packages/ui/src/components/button.tsx",
	nhanhChinh: "origin/onehub",
});
```

- [x] **Step 2: `do-neo.mjs`**

```js
import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DO_NEO } from "./cau-hinh.mjs";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

class TienDe extends Error {}

function tienDe(cau) {
	throw new TienDe(cau);
}

function git(cwd, ...thamSo) {
	return execFileSync("git", thamSo, { cwd, encoding: "utf8" });
}

function gitSao(d, ...thamSo) {
	return git(
		d,
		"-c",
		"user.email=do-neo@localhost",
		"-c",
		"user.name=do-neo",
		...thamSo,
	);
}

function dungBanSao({ ban, coGit = true, noi = tmpdir() }) {
	mkdirSync(noi, { recursive: true });
	const d = mkdtempSync(join(noi, "do-neo-"));
	const tep = git(GOC, "ls-files", "-z", "--", ...DO_NEO.canChep)
		.split("\0")
		.filter((f) => f && existsSync(join(GOC, f)));
	const danhSach = join(d, ".danh-sach");
	writeFileSync(danhSach, tep.join("\0"));
	execFileSync("bash", [
		"-c",
		`tar --null -T "${danhSach}" -cf - | tar -xf - -C "${d}"`,
	], { cwd: GOC });
	rmSync(danhSach);
	symlinkSync(join(GOC, "node_modules"), join(d, "node_modules"));
	if (ban === "goc")
		writeFileSync(
			join(d, DO_NEO.laiRaMan),
			git(GOC, "show", `${DO_NEO.goc}:${DO_NEO.laiRaMan}`),
		);
	if (coGit) {
		writeFileSync(join(d, ".gitignore"), "node_modules\n");
		gitSao(d, "init", "-q");
		gitSao(d, "add", "-A");
		gitSao(d, "commit", "-q", "-m", "ban sao");
	}
	return d;
}

function donBanSao(d) {
	rmSync(d, { recursive: true, force: true });
}

function chay(d) {
	const r = spawnSync("node", [join(d, DO_NEO.laiRaMan), "dan-so"], {
		cwd: d,
		encoding: "utf8",
	});
	return { ma: r.status, ra: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

function soTep(ra) {
	const m = ra.match(/— (\d+) file nguon/);
	if (!m) tienDe(`khong doc duoc so tep tu dau ra:\n${ra.slice(-400)}`);
	return Number(m[1]);
}

function dong(ra) {
	return ra.split("\n").map((d) => d.trim());
}

function neoTrong(nguon, khoa) {
	const m = nguon.match(new RegExp(`${khoa}: (\\d+)`));
	if (!m) tienDe(`khong thay neo ${khoa} trong ban thuoc`);
	return Number(m[1]);
}

function themVaCommit(d, duong, noiDung) {
	mkdirSync(dirname(join(d, duong)), { recursive: true });
	writeFileSync(join(d, duong), noiDung);
	gitSao(d, "add", "--", duong);
	gitSao(d, "commit", "-q", "-m", `them ${duong}`);
}

function voiBanSao(tuyChon, lam) {
	const d = dungBanSao(tuyChon);
	try {
		return lam(d);
	} finally {
		donBanSao(d);
	}
}

function nenXanh(ban, d) {
	const r = chay(d);
	if (r.ma !== 0)
		tienDe(
			`ban ${ban} do san tren ban sao nguyen ven (ma ${r.ma}):\n${r.ra.slice(-400)}`,
		);
	return r;
}

function ket(dieuKien, dung, sai) {
	return dieuKien ? `DUNG ${dung}` : `SAI ${sai}`;
}

function caThemTep() {
	const noiDung = "export const doNeoThem = 1;\n";
	const sua = voiBanSao({ ban: "sua" }, (d) => {
		const r0 = nenXanh("sua", d);
		themVaCommit(d, DO_NEO.tepThem, noiDung);
		const r1 = chay(d);
		return { n0: soTep(r0.ra), r1 };
	});
	const neoGoc = neoTrong(git(GOC, "show", `${DO_NEO.goc}:${DO_NEO.laiRaMan}`), "file");
	const goc = voiBanSao({ ban: "goc" }, (d) => {
		const r0 = nenXanh("goc", d);
		themVaCommit(d, DO_NEO.tepThem, noiDung);
		return { n0: soTep(r0.ra), r1: chay(d) };
	});
	const mongGoc = `DO: neo file ghim ${neoGoc} nhung do duoc ${goc.n0 + 1}`;
	return [
		ket(
			sua.r1.ma === 0 && soTep(sua.r1.ra) === sua.n0 + 1,
			`sua — them-tep: thoat 0, so tep ${sua.n0} -> ${soTep(sua.r1.ra)}`,
			`sua — them-tep: thoat ${sua.r1.ma}, so tep ${sua.n0} -> ${soTep(sua.r1.ra)}`,
		),
		ket(
			goc.r1.ma === 1 && dong(goc.r1.ra).includes(mongGoc),
			`goc — them-tep: ${mongGoc}`,
			`goc — them-tep: chieu do khong hien (thoat ${goc.r1.ma}, mong dong ${JSON.stringify(mongGoc)})`,
		),
	];
}

function caThemMacDinh() {
	const nguonSua = readFileSync(join(GOC, DO_NEO.laiRaMan), "utf8");
	const n = neoTrong(nguonSua, "mac_dinh");
	const ra = voiBanSao({ ban: "sua" }, (d) => {
		nenXanh("sua", d);
		themVaCommit(
			d,
			DO_NEO.tepMacDinh,
			'export function DoNeo({ nhan = "Hello there" }: { nhan?: string }) {\n\treturn <span>{nhan}</span>;\n}\n',
		);
		return chay(d);
	});
	const mong = `DO: neo mac_dinh ghim ${n} nhung do duoc ${n + 1}`;
	return [
		"DUNG doi-chung — them-mac-dinh: ban sua xanh tren ban sao nguyen ven",
		ket(
			ra.ma === 1 && dong(ra.ra).includes(mong),
			`sua — them-mac-dinh: ${mong}`,
			`sua — them-mac-dinh: day bao mac_dinh khong keu (thoat ${ra.ma}, mong ${JSON.stringify(mong)})`,
		),
	];
}

function tiemLoaiTru(d) {
	const p = join(d, DO_NEO.moiMacDinh);
	const s = readFileSync(p, "utf8");
	if (!s.includes(DO_NEO.loaiTruCu)) tienDe("moc LOAI_TRU khong co trong moi-mac-dinh.mjs");
	writeFileSync(p, s.replace(DO_NEO.loaiTruCu, DO_NEO.loaiTruTiem));
}

function caBoSot() {
	const sua = voiBanSao({ ban: "sua" }, (d) => {
		const r0 = nenXanh("sua", d);
		tiemLoaiTru(d);
		return { n0: soTep(r0.ra), r1: chay(d) };
	});
	const goc = voiBanSao({ ban: "goc" }, (d) => {
		nenXanh("goc", d);
		tiemLoaiTru(d);
		return chay(d);
	});
	const boSot = dong(sua.r1.ra).find((l) => l.startsWith("BO-SOT:")) ?? "";
	const soSot = Number(boSot.match(/^BO-SOT: (\d+)/)?.[1] ?? 0);
	return [
		ket(
			soTep(sua.r1.ra) < sua.n0,
			`sua — bo-sot: tiem da vao, bo duyet thay ${soTep(sua.r1.ra)} < ${sua.n0}`,
			`sua — bo-sot: tiem khong vao (so tep ${soTep(sua.r1.ra)}, nguyen ven ${sua.n0})`,
		),
		ket(
			sua.r1.ma === 1 &&
				soSot === sua.n0 - soTep(sua.r1.ra) &&
				boSot.includes("/lib/"),
			`sua — bo-sot: ${boSot.slice(0, 160)}`,
			`sua — bo-sot: quan he git khong keu (thoat ${sua.r1.ma}, dong ${JSON.stringify(boSot)})`,
		),
		ket(
			goc.ma === 1 && dong(goc.ra).some((l) => l.startsWith("DO: neo file")),
			"goc — bo-sot: DO: neo file (chi bat vi so tep giam)",
			`goc — bo-sot: chieu do khong hien (thoat ${goc.ma})`,
		),
	];
}

function caChuaTheoDoi() {
	const noiDung = "export const doNeoChuaCommit = 1;\n";
	const sua = voiBanSao({ ban: "sua" }, (d) => {
		const r0 = nenXanh("sua", d);
		writeFileSync(join(d, DO_NEO.tepChuaCommit), noiDung);
		return { n0: soTep(r0.ra), r1: chay(d) };
	});
	const goc = voiBanSao({ ban: "goc" }, (d) => {
		nenXanh("goc", d);
		writeFileSync(join(d, DO_NEO.tepChuaCommit), noiDung);
		return chay(d);
	});
	const lanDo = dong(sua.r1.ra).filter(
		(l) => l.startsWith("BO-SOT:") || l.startsWith("DO:"),
	);
	return [
		ket(
			sua.r1.ma === 0 && soTep(sua.r1.ra) === sua.n0 + 1 && lanDo.length === 0,
			`sua — chua-theo-doi: thoat 0, bo duyet thay ${sua.n0} -> ${soTep(sua.r1.ra)}`,
			`sua — chua-theo-doi: thoat ${sua.r1.ma}, so tep ${soTep(sua.r1.ra)}, dong do ${JSON.stringify(lanDo)}`,
		),
		ket(
			goc.ma === 1 && dong(goc.ra).some((l) => l.startsWith("DO: neo file")),
			"goc — chua-theo-doi: DO: neo file",
			`goc — chua-theo-doi: chieu do khong hien (thoat ${goc.ma})`,
		),
	];
}

function coGitO(d) {
	const r = spawnSync("git", ["-C", d, "rev-parse", "--show-toplevel"], {
		encoding: "utf8",
	});
	return r.status === 0 ? r.stdout.trim() : null;
}

function khongDoDuocGit(r) {
	return (
		r.ma === 2 &&
		dong(r.ra).some((l) => l.startsWith("KHONG DO DUOC:") && l.includes("git"))
	);
}

function caKhongDoDuoc() {
	const hang = [];
	const a = voiBanSao({ ban: "sua", coGit: false }, (d) => {
		if (coGitO(d) !== null) tienDe(`thu muc tam ${d} nam trong mot kho git`);
		return chay(d);
	});
	hang.push(
		ket(
			khongDoDuocGit(a),
			"sua — khong-do-duoc (a) ngoai moi kho: thoat 2, KHONG DO DUOC nhac git",
			`sua — khong-do-duoc (a): thoat ${a.ma}\n${a.ra.slice(-300)}`,
		),
	);
	const c = voiBanSao(
		{ ban: "sua", coGit: false, noi: join(GOC, DO_NEO.chayRieng) },
		(d) => {
			const top = coGitO(d);
			if (top === null || resolve(top) === resolve(d))
				tienDe(`ban sao ${d} khong nam trong kho khac`);
			return chay(d);
		},
	);
	hang.push(
		ket(
			khongDoDuocGit(c),
			"sua — khong-do-duoc (c) trong kho khac: thoat 2, KHONG DO DUOC nhac git",
			`sua — khong-do-duoc (c): thoat ${c.ma}\n${c.ra.slice(-300)}`,
		),
	);
	const b = voiBanSao({ ban: "sua" }, (d) => {
		for (const g of DO_NEO.thuMucGoc) rmSync(join(d, g), { recursive: true, force: true });
		gitSao(d, "add", "-A");
		gitSao(d, "commit", "-q", "-m", "xoa goc");
		return chay(d);
	});
	hang.push(
		ket(
			b.ma === 2 && dong(b.ra).includes("KHONG DO DUOC: tap nguon rong"),
			"sua — khong-do-duoc (b) goc rong: KHONG DO DUOC: tap nguon rong",
			`sua — khong-do-duoc (b): thoat ${b.ma}\n${b.ra.slice(-300)}`,
		),
	);
	const dc = voiBanSao({ ban: "sua" }, (d) => chay(d));
	hang.push(
		ket(
			dc.ma === 0,
			"doi-chung — khong-do-duoc: ban sao nguyen ven co git thi thoat 0",
			`doi-chung — khong-do-duoc: ban sao nguyen ven thoat ${dc.ma}\n${dc.ra.slice(-300)}`,
		),
	);
	return hang;
}

function lenhTuConfig(khoa) {
	const cfg = readFileSync(join(GOC, "_acceptance/config.yaml"), "utf8");
	const d = cfg.split("\n").find((l) => l.trim().startsWith(`${khoa}:`));
	if (!d) tienDe(`config khong co khoa ${khoa}`);
	return d
		.trim()
		.slice(khoa.length + 1)
		.trim()
		.replace(/^"(.*)"$/, "$1");
}

function caCayThat() {
	return DO_NEO.lenhCong.map((khoa) => {
		const lenh = lenhTuConfig(khoa);
		const r = spawnSync("bash", ["-c", lenh], { cwd: GOC, encoding: "utf8" });
		return ket(
			r.status === 0,
			`that — ${khoa}: thoat 0 · ${lenh}`,
			`that — ${khoa}: thoat ${r.status} · ${lenh}\n${`${r.stdout}${r.stderr}`.slice(-400)}`,
		);
	});
}

function globT1() {
	const cfg = readFileSync(join(GOC, "_acceptance/config.yaml"), "utf8");
	const khoi = cfg.split("t1_skip_globs:")[1]?.split(/\n {2}\S/)[0];
	if (!khoi) tienDe("khong doc duoc risk_tiers.t1_skip_globs");
	return [...khoi.matchAll(/^\s*-\s*"([^"]+)"/gm)].map((m) => m[1]);
}

export function ngoaiPhamVi(tep, globs) {
	return tep.filter(
		(f) =>
			!f.startsWith("_acceptance/") &&
			!globs.some((g) => new Bun.Glob(g).match(f)),
	);
}

function caPhamVi() {
	const globs = globT1();
	const mau = ngoaiPhamVi([DO_NEO.mauPhamVi, "_acceptance/x/contract.md", "docs/x.md"], globs);
	const moc = git(GOC, "merge-base", DO_NEO.nhanhChinh, "HEAD").trim();
	const doi = git(GOC, "diff", "--name-only", `${moc}...HEAD`).split("\n").filter(Boolean);
	const ngoai = ngoaiPhamVi(doi, globs);
	return [
		ket(
			mau.length === 1 && mau[0] === DO_NEO.mauPhamVi,
			`doi-chung — pham-vi: goi ten ${DO_NEO.mauPhamVi}`,
			`doi-chung — pham-vi: mau tra ${JSON.stringify(mau)}`,
		),
		ket(
			ngoai.length === 0,
			`sua — pham-vi: ${doi.length} tep doi tu ${moc.slice(0, 8)}, 0 ngoai _acceptance va T1`,
			`sua — pham-vi: doi ngoai _acceptance va T1: ${ngoai.join(", ")}`,
		),
	];
}

export function kiemConTro(dongSo) {
	const loi = [];
	let co = 0;
	dongSo.forEach((l, i) => {
		try {
			const d = JSON.parse(l);
			if (d.type === "revisit" && String(d.decision ?? "").includes(DO_NEO.slug)) co += 1;
		} catch {
			loi.push(`HO-SO-GOC: dong ${i + 1} khong phai JSON`);
		}
	});
	if (co === 0) loi.push("HO-SO-GOC: thieu con tro revisit");
	return loi;
}

function caHoSoGoc() {
	const dongSo = readFileSync(join(GOC, DO_NEO.soHoSoGoc), "utf8").split("\n").filter(Boolean);
	const mauSach = dongSo.filter((l) => !l.includes(DO_NEO.slug));
	const hang = [
		ket(
			kiemConTro(mauSach).includes("HO-SO-GOC: thieu con tro revisit"),
			"doi-chung — ho-so-goc: so khong co con tro bi goi ten",
			"doi-chung — ho-so-goc: so khong co con tro KHONG bi goi ten",
		),
	];
	const loi = kiemConTro(dongSo);
	hang.push(
		ket(loi.length === 0, "sua — ho-so-goc: co con tro revisit hop le", `sua — ${loi.join("; ")}`),
	);
	const fl = execFileSync(
		"node",
		["scripts/resolve-plugin.mjs", "--plugin", "feature-loop", "--require", "scripts/repin-lane.mjs"],
		{ cwd: GOC, encoding: "utf8" },
	).trim();
	const r = spawnSync(
		"node",
		[join(fl, "scripts/repin-lane.mjs"), "--root", ".", "--slug", DO_NEO.hoSoGoc, "--allow-dirty"],
		{ cwd: GOC, encoding: "utf8" },
	);
	hang.push(
		ket(
			r.status === 0,
			`sua — ho-so-goc: lan do ${DO_NEO.hoSoGoc} xanh (chi do, khong ghim)`,
			`sua — ho-so-goc: lan do thoat ${r.status}\n${`${r.stdout}${r.stderr}`.slice(-600)}`,
		),
	);
	return hang;
}

const CAC_CA = {
	"them-tep": caThemTep,
	"them-mac-dinh": caThemMacDinh,
	"bo-sot": caBoSot,
	"chua-theo-doi": caChuaTheoDoi,
	"khong-do-duoc": caKhongDoDuoc,
	"cay-that": caCayThat,
	"pham-vi": caPhamVi,
	"ho-so-goc": caHoSoGoc,
};

if (import.meta.main || process.argv[1]?.endsWith("do-neo.mjs")) {
	const i = process.argv.indexOf("--ca");
	const cacCa = (i >= 0 ? process.argv[i + 1] ?? "" : "").split(",").filter(Boolean);
	let ma = 0;
	let dung = 0;
	let sai = 0;
	try {
		if (cacCa.length === 0) tienDe(`thieu --ca <${Object.keys(CAC_CA).join("|")}>`);
		for (const ten of cacCa) {
			if (!CAC_CA[ten]) tienDe(`ca la: ${ten}`);
			const hang = CAC_CA[ten]();
			for (const h of hang) console.log(h);
			dung += hang.filter((h) => h.startsWith("DUNG")).length;
			sai += hang.filter((h) => h.startsWith("SAI")).length;
		}
		if (sai > 0) ma = 1;
	} catch (loi) {
		console.log(
			loi instanceof TienDe ? `TIEN DE: ${loi.message}` : `TIEN DE: bo do hong: ${loi?.stack ?? loi}`,
		);
		ma = 2;
	}
	console.log(`DO-NEO KET LUAN: ${dung} DUNG, ${sai} SAI — ma thoat ${ma}`);
	process.exit(ma);
}
```

- [x] **Step 3: Chiều đỏ trên thước cũ** — `bun _acceptance/neo-dan-so-khong-cung/rang/do-neo.mjs --ca them-tep,them-mac-dinh,bo-sot,chua-theo-doi,khong-do-duoc,pham-vi` → exit 1; các hàng `sua` của them-tep, bo-sot, chua-theo-doi, khong-do-duoc (a)(b)(c) là SAI; mọi hàng `goc`/`doi-chung` DUNG. (Đã chạy: 9 DUNG, 6 SAI.)
- [x] **Step 4: Commit** — `test: bo do do-neo cho neo-dan-so-khong-cung (chieu do)`

### Task 2: Sửa `danSo()` + con trỏ ở hồ sơ gốc (GREEN)

independent: false · phục vụ E1–E6, E8

**Files:** Modify `_acceptance/chan-lai-component-ra-man/rang/lai-ra-man.mjs`; append một dòng `revisit` vào `_acceptance/chan-lai-component-ra-man/decisions.jsonl`.

- [x] **Step 1: Mã sau sửa của `lai-ra-man.mjs` (phần đầu tới hết `danSo`)**

```js
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { duongLuot, xoaTaoPhamCu } from "./luot-chay.mjs";
import { GOC as THU_MUC_GOC, docFile, docMacDinh } from "./moi-mac-dinh.mjs";

const GOC = join(import.meta.dirname, "..", "..", "..");

const NEO = { mac_dinh: 93, dong_bang_cu: 9 };

function banVeRong(banVe) {
	return Object.values(banVe)
		.flat()
		.every((b) => b.loi_dong !== null && b.loi_mo !== null);
}

function docGit(goc) {
	let dinh;
	try {
		dinh = execFileSync("git", ["-C", goc, "rev-parse", "--show-toplevel"], {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
		}).trim();
	} catch (loi) {
		return { loi: `khong doc duoc git o ${goc}: ${String(loi?.stderr ?? loi).trim().split("\n")[0]}` };
	}
	if (realpathSync(dinh) !== realpathSync(goc))
		return { loi: `goc git ${dinh} khac goc dang do ${goc}` };
	const ra = execFileSync("git", ["-C", goc, "ls-files", "-z", "--", ...THU_MUC_GOC], {
		encoding: "utf8",
	});
	return { tep: ra.split("\0").filter((f) => /\.tsx?$/.test(f)) };
}

function ghi(ten, gt) {
	writeFileSync(duongLuot(ten), `${JSON.stringify(gt, null, "\t")}\n`);
}

export function danSo() {
	const file = docFile(GOC);
	const macDinh = docMacDinh(GOC);
	ghi("mac-dinh.json", macDinh);
	const bangCu = JSON.parse(
		readFileSync(
			join(
				GOC,
				"_acceptance/chu-mac-dinh-thu-vien-ngoai/rang/gioi-han-bam-moi-hien.json",
			),
			"utf8",
		),
	);
	const doDuoc = {
		file: file.length,
		mac_dinh: macDinh.length,
		dong_bang_cu: bangCu.dong.length,
	};
	console.log(
		`tap loai tru ghim ten: node_modules · .next · dist · build — ${doDuoc.file} file nguon`,
	);
	console.log(
		`gia tri mac dinh la chuoi co chu: ${doDuoc.mac_dinh} · component so huu: ${new Set(macDinh.map((m) => m.file)).size}`,
	);
	console.log(`dong trong bang gioi han vong truoc: ${doDuoc.dong_bang_cu}`);
	if (doDuoc.file === 0 || doDuoc.mac_dinh === 0) {
		console.error("KHONG DO DUOC: tap nguon rong");
		return 2;
	}
	const phiaGit = docGit(GOC);
	if (phiaGit.loi) {
		console.error(`KHONG DO DUOC: ${phiaGit.loi}`);
		return 2;
	}
	if (phiaGit.tep.length === 0) {
		console.error(
			`KHONG DO DUOC: phia git rong trong khi bo duyet thay ${doDuoc.file} tep — khong doi chieu duoc`,
		);
		return 2;
	}
	console.log(`tep git theo doi duoi goc: ${phiaGit.tep.length}`);
	let ma = 0;
	const thay = new Set(file);
	const sot = phiaGit.tep.filter((f) => !thay.has(f));
	if (sot.length > 0) {
		console.error(
			`BO-SOT: ${sot.length} tep git theo doi ma bo duyet khong thay: ${sot.slice(0, 5).join(", ")}`,
		);
		ma = 1;
	}
	const lech = Object.entries(NEO).filter(([k, v]) => doDuoc[k] !== v);
	for (const [k, v] of lech)
		console.error(`DO: neo ${k} ghim ${v} nhung do duoc ${doDuoc[k]}`);
	if (lech.length > 0) ma = 1;
	if (ma === 0) console.log("XANH: moi neo khop dia, bo duyet thay du tep git theo doi.");
	return ma;
}

```

- [x] **Step 2:** `bun _acceptance/neo-dan-so-khong-cung/rang/do-neo.mjs --ca them-tep,them-mac-dinh,bo-sot,chua-theo-doi,khong-do-duoc,cay-that,pham-vi,ho-so-goc` → exit 0, 20 DUNG.
- [x] **Step 3: Commit** — `fix(chan-lai-component-ra-man): bo neo so tep, doi chieu voi git theo doi`

### Task 3: Ghim lại hồ sơ gốc (sau S4, ở đỉnh nhánh)

independent: false · không phục vụ eval (nghi thức ghim)

- [ ] `repin-lane.mjs --root . --slug chan-lai-component-ra-man --reason "bo neo so tep (neo-dan-so-khong-cung)" --write` sau khi hồ sơ này được ký, rồi lưới trước-merge.
