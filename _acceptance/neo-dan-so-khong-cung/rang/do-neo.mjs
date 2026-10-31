import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	renameSync,
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

function chepCayLamViec(d) {
	const tep = git(GOC, "ls-files", "-z", "--", ...DO_NEO.canChep)
		.split("\0")
		.filter((f) => f && existsSync(join(GOC, f)));
	const danhSach = join(d, ".danh-sach");
	writeFileSync(danhSach, tep.join("\0"));
	execFileSync(
		"bash",
		["-c", `tar --null -T "${danhSach}" -cf - | tar -xf - -C "${d}"`],
		{ cwd: GOC },
	);
	rmSync(danhSach);
}

function chepCayGoc(d) {
	execFileSync(
		"bash",
		[
			"-c",
			`git archive --format=tar ${DO_NEO.goc} -- ${DO_NEO.canChep.join(" ")} | tar -xf - -C "${d}"`,
		],
		{ cwd: GOC },
	);
}

function neoHienHanh(nguonV1) {
	const mau = /^const NEO = \{[^\n]*\};$/m;
	const neo = readFileSync(join(GOC, DO_NEO.laiRaMan), "utf8").match(mau);
	if (!neo || !mau.test(nguonV1))
		tienDe("khong tim thay dong const NEO o ban sua hay ban sua-v1");
	return nguonV1.replace(mau, neo[0]);
}

function dungBanSao({ ban, coGit = true, noi = tmpdir() }) {
	mkdirSync(noi, { recursive: true });
	const d = mkdtempSync(join(noi, "do-neo-"));
	if (ban === "goc") chepCayGoc(d);
	else chepCayLamViec(d);
	symlinkSync(join(GOC, "node_modules"), join(d, "node_modules"));
	if (ban === "sua-v1")
		writeFileSync(
			join(d, DO_NEO.laiRaMan),
			neoHienHanh(git(GOC, "show", `${DO_NEO.suaV1}:${DO_NEO.laiRaMan}`)),
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
	const neoGoc = neoTrong(
		git(GOC, "show", `${DO_NEO.goc}:${DO_NEO.laiRaMan}`),
		"file",
	);
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
	if (!s.includes(DO_NEO.loaiTruCu))
		tienDe("moc LOAI_TRU khong co trong moi-mac-dinh.mjs");
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

function khongDoDuocGocKhac(r) {
	return (
		r.ma === 2 &&
		dong(r.ra).some(
			(l) =>
				l.startsWith("KHONG DO DUOC: goc git ") &&
				l.includes(" khac goc dang do "),
		)
	);
}

function goChanGocGit(d) {
	const p = join(d, DO_NEO.laiRaMan);
	const s = readFileSync(p, "utf8");
	if (!s.includes(DO_NEO.chanGocGit))
		tienDe("moc chan goc git khong co trong lai-ra-man.mjs");
	writeFileSync(p, s.replace(DO_NEO.chanGocGit, ""));
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
			const that = chay(d);
			goChanGocGit(d);
			return { that, dotBien: chay(d) };
		},
	);
	hang.push(
		ket(
			khongDoDuocGocKhac(c.that),
			"sua — khong-do-duoc (c) trong kho khac: thoat 2, KHONG DO DUOC: goc git ... khac goc dang do ...",
			`sua — khong-do-duoc (c): thoat ${c.that.ma}\n${c.that.ra.slice(-300)}`,
		),
		ket(
			!khongDoDuocGocKhac(c.dotBien),
			`doi-chung — khong-do-duoc (c) dot bien go chan goc git: khang dinh goi ten sai (thoat ${c.dotBien.ma})`,
			`doi-chung — khong-do-duoc (c) dot bien go chan goc git van qua khang dinh:\n${c.dotBien.ra.slice(-300)}`,
		),
	);
	const b = voiBanSao({ ban: "sua" }, (d) => {
		for (const g of DO_NEO.thuMucGoc)
			rmSync(join(d, g), { recursive: true, force: true });
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

function caXoaChuaCommit() {
	const noiDung = "export const doNeoThem = 1;\n";
	const lam = (ban, bienDoi) =>
		voiBanSao({ ban }, (d) => {
			themVaCommit(d, DO_NEO.tepThem, noiDung);
			nenXanh(ban, d);
			bienDoi(d);
			return chay(d);
		});
	const xoa = (d) => rmSync(join(d, DO_NEO.tepThem));
	const doiTen = (d) =>
		renameSync(join(d, DO_NEO.tepThem), join(d, DO_NEO.tepDoiTen));
	const mongV1 = `BO-SOT: 1 tep git theo doi ma bo duyet khong thay: ${DO_NEO.tepThem}`;
	return [
		["xoa", xoa],
		["doi-ten", doiTen],
	].flatMap(([ten, bienDoi]) => {
		const sua = lam("sua", bienDoi);
		const v1 = lam("sua-v1", bienDoi);
		const boSot = dong(sua.ra).filter((l) => l.startsWith("BO-SOT:"));
		return [
			ket(
				sua.ma === 0 && boSot.length === 0,
				`sua — ${ten}-chua-commit: thoat 0, khong BO-SOT`,
				`sua — ${ten}-chua-commit: thoat ${sua.ma}, dong ${JSON.stringify(boSot)}`,
			),
			ket(
				v1.ma === 1 && dong(v1.ra).includes(mongV1),
				`sua-v1 — ${ten}-chua-commit: ${mongV1}`,
				`sua-v1 — ${ten}-chua-commit: chieu do khong hien (thoat ${v1.ma}, mong ${JSON.stringify(mongV1)})`,
			),
		];
	});
}

function chayBoDo(goc, cacCa) {
	const r = spawnSync(
		"bun",
		[join(goc, DO_NEO.boDo), "--ca", cacCa.join(",")],
		{
			cwd: goc,
			encoding: "utf8",
		},
	);
	return { ma: r.status, ra: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

function caCayLech() {
	const noi = mkdtempSync(join(tmpdir(), "do-neo-cay-lech-"));
	const cay = join(noi, "cay");
	git(GOC, "worktree", "add", "-q", "--detach", cay, "HEAD");
	try {
		symlinkSync(join(GOC, "node_modules"), join(cay, "node_modules"));
		themVaCommit(cay, DO_NEO.tepLech, "export const doNeoLech = 1;\n");
		const moi = chayBoDo(cay, DO_NEO.caCayLech);
		writeFileSync(
			join(cay, DO_NEO.boDo),
			git(GOC, "show", `${DO_NEO.suaV1}:${DO_NEO.boDo}`),
		);
		const cu = chayBoDo(cay, ["them-tep"]);
		return [
			ket(
				moi.ma === 0,
				`sua — cay-lech: ${DO_NEO.caCayLech.join(", ")} thoat 0 tren cay HEAD + 1 tep`,
				`sua — cay-lech: thoat ${moi.ma}\n${moi.ra.slice(-600)}`,
			),
			ket(
				cu.ma === 2 &&
					dong(cu.ra).some((l) => l.startsWith("TIEN DE: ban goc do san")),
				"sua-v1 — cay-lech: bo do vong 1 thoat 2 TIEN DE: ban goc do san",
				`sua-v1 — cay-lech: chieu do khong hien (thoat ${cu.ma})\n${cu.ra.slice(-300)}`,
			),
		];
	} finally {
		spawnSync("git", ["worktree", "remove", "--force", cay], { cwd: GOC });
		rmSync(noi, { recursive: true, force: true });
	}
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
	const mau = ngoaiPhamVi(
		[DO_NEO.mauPhamVi, "_acceptance/x/contract.md", "docs/x.md"],
		globs,
	);
	const moc = git(GOC, "merge-base", DO_NEO.nhanhChinh, "HEAD").trim();
	const doi = git(GOC, "diff", "--name-only", `${moc}...HEAD`)
		.split("\n")
		.filter(Boolean);
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
			if (
				d.type === "revisit" &&
				String(d.decision ?? "").includes(DO_NEO.slug)
			)
				co += 1;
		} catch {
			loi.push(`HO-SO-GOC: dong ${i + 1} khong phai JSON`);
		}
	});
	if (co === 0) loi.push("HO-SO-GOC: thieu con tro revisit");
	return loi;
}

function caHoSoGoc() {
	const dongSo = readFileSync(join(GOC, DO_NEO.soHoSoGoc), "utf8")
		.split("\n")
		.filter(Boolean);
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
		ket(
			loi.length === 0,
			"sua — ho-so-goc: co con tro revisit hop le",
			`sua — ${loi.join("; ")}`,
		),
	);
	const fl = execFileSync(
		"node",
		[
			"scripts/resolve-plugin.mjs",
			"--plugin",
			"feature-loop",
			"--require",
			"scripts/repin-lane.mjs",
		],
		{ cwd: GOC, encoding: "utf8" },
	).trim();
	const r = spawnSync(
		"node",
		[
			join(fl, "scripts/repin-lane.mjs"),
			"--root",
			".",
			"--slug",
			DO_NEO.hoSoGoc,
			"--allow-dirty",
		],
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
	"xoa-chua-commit": caXoaChuaCommit,
	"cay-lech": caCayLech,
};

if (import.meta.main || process.argv[1]?.endsWith("do-neo.mjs")) {
	const i = process.argv.indexOf("--ca");
	const cacCa = (i >= 0 ? (process.argv[i + 1] ?? "") : "")
		.split(",")
		.filter(Boolean);
	let ma = 0;
	let dung = 0;
	let sai = 0;
	try {
		if (cacCa.length === 0)
			tienDe(`thieu --ca <${Object.keys(CAC_CA).join("|")}>`);
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
			loi instanceof TienDe
				? `TIEN DE: ${loi.message}`
				: `TIEN DE: bo do hong: ${loi?.stack ?? loi}`,
		);
		ma = 2;
	}
	console.log(`DO-NEO KET LUAN: ${dung} DUNG, ${sai} SAI — ma thoat ${ma}`);
	process.exit(ma);
}
