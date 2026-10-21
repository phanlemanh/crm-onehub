import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
	banGom,
	type CauHinhGom,
	type ChuaGomRa,
	cauHinhGom,
	chuaGomRa,
	type HangLoTrinh,
	ketQuaPhien,
	type PrDeXuat,
	prDeXuat,
	tepLoTrinh,
} from "../../packages/validation/src/tin-hieu-gom.ts";
import { GOM } from "./gom-cau-hinh.ts";
import { dauTap, docKhoiMay, dungThan } from "./gom-than-pr.ts";

type Lenh = { ma: number; ra: string; loi: string; ma_loi?: string };
type Env = Record<string, string | undefined>;

function chay(
	lenh: string,
	thamSo: string[],
	cwd: string,
	env: NodeJS.ProcessEnv,
	timeoutMs?: number,
): Lenh {
	const r = spawnSync(lenh, thamSo, {
		cwd,
		encoding: "utf8",
		env,
		maxBuffer: 64 * 1024 * 1024,
		...(timeoutMs ? { timeout: timeoutMs, killSignal: "SIGKILL" } : {}),
	});
	const maLoi = (r.error as NodeJS.ErrnoException | undefined)?.code;
	return {
		ma: r.status ?? 1,
		ra: r.stdout ?? "",
		loi: r.stderr ?? r.error?.message ?? "",
		...(maLoi ? { ma_loi: maLoi } : r.signal ? { ma_loi: r.signal } : {}),
	};
}

export const DANH_TINH = {
	GIT_AUTHOR_NAME: GOM.tacGia.ten,
	GIT_AUTHOR_EMAIL: GOM.tacGia.thu,
	GIT_COMMITTER_NAME: GOM.tacGia.ten,
	GIT_COMMITTER_EMAIL: GOM.tacGia.thu,
};

const dauDong = (s: string): string => s.trim().split("\n")[0] ?? "";
const cacDong = (s: string): string[] =>
	s
		.split("\n")
		.map((d) => d.trimEnd())
		.filter(Boolean);

export type KetQuaGom = { ma: 0 | 1 | 2; dong: string[] };

export function gitCauHinh(
	cap: readonly (readonly [string, string])[],
): Record<string, string> {
	const r: Record<string, string> = { GIT_CONFIG_COUNT: String(cap.length) };
	cap.forEach(([k, v], i) => {
		r[`GIT_CONFIG_KEY_${i}`] = k;
		r[`GIT_CONFIG_VALUE_${i}`] = v;
	});
	return r;
}

export function lenhKit(
	ag: string,
	banGomTep: string,
	loTrinh: readonly string[],
): string[] {
	const tinHieu = path.join(ag, GOM.kit.tinHieu);
	const catLuot = path.join(ag, GOM.kit.catLuot);
	return [
		...GOM.moHinh.lenhTinHieu.map((c) => `node ${tinHieu} --root . ${c}`),
		...GOM.moHinh.lenhCatLuot.map((c) => `node ${catLuot} --root . ${c}`),
		...loTrinh.map(
			(lt) =>
				`node ${catLuot} --root . --pham-vi ${banGomTep} --lo-trinh ${lt}`,
		),
	];
}

export function dungLoiGoi(o: {
	ag: string;
	banGom: string;
	loTrinh: readonly string[];
	phuQuyet: string[];
	nguon: Env;
	thuMucTam: string;
}): {
	thamSo: string[];
	env: NodeJS.ProcessEnv;
	tepCaiDat: string;
	lenh: string[];
} {
	const lenh = lenhKit(o.ag, o.banGom, o.loTrinh);
	const caiDat = {
		permissions: {
			allow: [
				...GOM.moHinh.docDuoc,
				...GOM.moHinh.skill.map((s) => `Skill(${s})`),
				`Edit(./${o.banGom})`,
				...o.loTrinh.map((lt) => `Edit(./${lt})`),
				...lenh.map((l) => `Bash(${l})`),
			],
			deny: [...GOM.moHinh.cam],
			blockReadsOutsideWorkingDirectories: true,
		},
		disableAllHooks: true,
	};
	const tepCaiDat = path.join(o.thuMucTam, "cai-dat.json");
	writeFileSync(tepCaiDat, `${JSON.stringify(caiDat, null, 2)}\n`);
	const env: NodeJS.ProcessEnv = {};
	for (const k of GOM.moHinh.moiTruong) {
		const v = o.nguon[k];
		if (v !== undefined) env[k] = v;
	}
	Object.assign(
		env,
		GOM.moHinh.hangMoiTruong,
		gitCauHinh(GOM.gitLenh),
		DANH_TINH,
		{ AG: o.ag, [GOM.moHinh.bienBanGom]: o.banGom },
	);
	const thamSo = [
		"-p",
		GOM.moHinh.loiDan(o.phuQuyet, { banGom: o.banGom, lenh }),
		"--model",
		GOM.moHinh.ten,
		"--max-turns",
		String(GOM.moHinh.tranLuot),
		"--permission-mode",
		"dontAsk",
		"--tools",
		GOM.moHinh.congCu.join(","),
		"--disallowedTools",
		GOM.moHinh.camCongCu.join(","),
		"--strict-mcp-config",
		"--setting-sources",
		"user",
		"--settings",
		tepCaiDat,
		"--add-dir",
		o.ag,
		"--output-format",
		"json",
	];
	return { thamSo, env, tepCaiDat, lenh };
}

export function dangKhoa(v: string): string[] {
	const ra = new Set([v]);
	for (const k of [0, 1, 2]) {
		const s = Buffer.from("\0".repeat(k) + v)
			.toString("base64")
			.replace(/=+$/, "");
		const loi = s.slice(k === 0 ? 0 : 4, s.length - 4);
		if (loi.length >= 8) {
			ra.add(loi);
			ra.add(loi.replaceAll("+", "-").replaceAll("/", "_"));
		}
	}
	return [...ra];
}

export function quetDia(
	thuMuc: readonly string[],
	giaTri: readonly string[],
): string[] {
	const coThat = thuMuc.filter((d) => existsSync(d));
	if (!giaTri.length || !coThat.length) return [];
	const r = spawnSync(
		"grep",
		[
			"-rlsF",
			"-f",
			"-",
			...GOM.quetDia.boQua.map((d) => `--exclude-dir=${d}`),
			"--",
			...coThat,
		],
		{ input: giaTri.join("\n"), encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
	);
	return [...new Set(cacDong(r.stdout ?? ""))].sort();
}

export function thuMucGit(goc: string, env: NodeJS.ProcessEnv): string[] {
	const ra: string[] = [];
	for (const co of ["--absolute-git-dir", "--git-common-dir"]) {
		const r = spawnSync("git", ["rev-parse", co], {
			cwd: goc,
			encoding: "utf8",
			env,
		});
		const d = r.stdout?.trim();
		if (r.status === 0 && d) ra.push(path.resolve(goc, d));
	}
	return [...new Set(ra)];
}

function bamCay(goc: string, rel: string, ra: Map<string, string>): void {
	const p = path.join(goc, rel);
	if (!existsSync(p)) return;
	const st = statSync(p);
	if (st.isDirectory()) {
		for (const con of readdirSync(p).sort())
			bamCay(goc, path.join(rel, con), ra);
		return;
	}
	ra.set(
		rel,
		`${st.mode}:${createHash("sha256").update(readFileSync(p)).digest("hex")}`,
	);
}

export function bamSieuDuLieu(thuMuc: readonly string[]): Map<string, string> {
	const ra = new Map<string, string>();
	for (const d of thuMuc) {
		const m = new Map<string, string>();
		for (const t of GOM.sieuDuLieu) bamCay(d, t, m);
		for (const [k, v] of m) ra.set(path.join(d, k), v);
	}
	return ra;
}

function lechBam(
	truoc: Map<string, string>,
	sau: Map<string, string>,
	goc: string,
): string[] {
	const ten = new Set([...truoc.keys(), ...sau.keys()]);
	return [...ten]
		.filter((k) => truoc.get(k) !== sau.get(k))
		.map((k) => path.relative(goc, k))
		.sort();
}

export function duongBanGom(
	goc: string,
	thuMuc: string,
	now: Date,
): string {
	const ngay = now.toLocaleDateString("sv-SE", {
		timeZone: "Asia/Ho_Chi_Minh",
	});
	for (let i = 1; ; i++) {
		const t = `${thuMuc}/${ngay}${i === 1 ? "" : `-${i}`}.md`;
		if (!existsSync(path.join(goc, t))) return t;
	}
}

export function gocKit(
	goc: string,
	env: Record<string, string | undefined>,
): string | null {
	const kiem = (g: string): boolean =>
		existsSync(path.join(g, GOM.kit.tinHieu)) &&
		existsSync(path.join(g, GOM.kit.catLuot));
	for (const b of GOM.kit.bien) {
		const g = env[b];
		if (g && kiem(g)) return g;
	}
	if (!existsSync(path.join(goc, GOM.kit.giai[0]))) return null;
	const r = chay("node", [...GOM.kit.giai], goc, process.env);
	const g = r.ra.trim();
	return r.ma === 0 && g && kiem(g) ? g : null;
}

export async function chayGom(o: {
	goc: string;
	env: Record<string, string | undefined>;
	gh: string;
	claude: string;
	now: Date;
	tranMs?: number;
}): Promise<KetQuaGom> {
	const nguon: Env = { ...process.env, ...o.env };
	const khoa = GOM.khoaMoHinh
		.map((k) => nguon[k])
		.filter((v): v is string => Boolean(v));
	const token =
		GOM.tokenKho.map((k) => nguon[k]).find((v) => Boolean(v)) ??
		nguon.GH_TOKEN;
	const biMat = [...khoa, ...(token ? [token] : [])];
	const che = (s: string): string =>
		biMat
			.flatMap(dangKhoa)
			.reduce((t, k) => t.split(k).join("***"), s);
	const them: string[] = [];
	const do1 = (dong: string[]): KetQuaGom => ({
		ma: 1,
		dong: [...dong, ...them].map(che),
	});
	const envChay: NodeJS.ProcessEnv = { ...nguon };
	for (const k of GOM.khoaBo) delete envChay[k];
	Object.assign(envChay, DANH_TINH, gitCauHinh(GOM.gitLenh));
	const envMang: NodeJS.ProcessEnv = {
		...envChay,
		...gitCauHinh([
			...GOM.gitLenh,
			...(token
				? ([[GOM.xacThuc.khoa, GOM.xacThuc.giaTri(token)]] as const)
				: []),
		]),
	};
	const envGh: NodeJS.ProcessEnv = {
		...envChay,
		...(token ? { GH_TOKEN: token } : {}),
	};
	const git = (...thamSo: string[]) => chay("git", thamSo, o.goc, envChay);
	const gitPhai = (...thamSo: string[]): string => {
		const r = git(...thamSo);
		if (r.ma !== 0) throw new Error(`git ${thamSo[0]} hỏng: ${dauDong(r.loi)}`);
		return r.ra.trim();
	};
	const chinh = `origin/${GOM.nhanhChinh}`;
	const deXuat = `origin/${GOM.nhanhDeXuat}`;

	const fetch = chay(
		"git",
		["fetch", "--quiet", "origin", GOM.nhanhChinh],
		o.goc,
		envMang,
	);
	if (fetch.ma !== 0) throw new Error(`git fetch hỏng: ${dauDong(fetch.loi)}`);
	chay(
		"git",
		[
			"fetch",
			"--quiet",
			"origin",
			`+${GOM.nhanhDeXuat}:refs/remotes/${deXuat}`,
		],
		o.goc,
		envMang,
	);
	gitPhai("switch", "--quiet", "--detach", chinh);

	const ag = gocKit(o.goc, nguon);
	if (!ag) return do1([GOM.thongDiep.thieuKit]);
	const kit = (tep: string, ...thamSo: string[]) =>
		chay("node", [path.join(ag, tep), "--root", o.goc, ...thamSo], o.goc, {
			...envChay,
			AG: ag,
		});

	const cg = kit(GOM.kit.tinHieu, "--chua-gom");
	let chua: ChuaGomRa;
	try {
		chua = chuaGomRa.parse(JSON.parse(cg.ra));
	} catch {
		return do1([GOM.thongDiep.tinHieuSai, ...cacDong(cg.loi).slice(0, 20)]);
	}
	if (cg.ma !== 0 || chua.loi.length)
		return do1([GOM.thongDiep.tinHieuSai, ...chua.loi]);
	const ids = chua.tin_hieu.map((t) => t.id);
	if (!ids.length) return { ma: 0, dong: [GOM.thongDiep.khongMoi] };
	const dau = dauTap(ids);

	const ds = chay(
		o.gh,
		[
			"pr",
			"list",
			"--head",
			GOM.nhanhDeXuat,
			"--base",
			GOM.nhanhChinh,
			"--state",
			"all",
			"--json",
			"number,state,body,mergedAt",
		],
		o.goc,
		envGh,
	);
	let prs: PrDeXuat;
	try {
		if (ds.ma !== 0) throw new Error();
		prs = prDeXuat.parse(JSON.parse(ds.ra)).sort((a, b) => b.number - a.number);
	} catch {
		return do1([GOM.thongDiep.danhSachLa, dauDong(ds.loi)].filter(Boolean));
	}
	const mo = prs.find((p) => p.state === "OPEN");
	let gioCu: Record<string, string> = {};
	let phuQuyet: string[] = [];
	if (mo) {
		const tacGia = git("log", "--format=%ae", `${chinh}..${deXuat}`)
			.ra.split("\n")
			.filter(Boolean);
		if (tacGia.some((t) => t !== GOM.tacGia.thu))
			return { ma: 0, dong: [GOM.thongDiep.nguoiSua] };
		const k = docKhoiMay(mo.body);
		if (k.dau === dau) return { ma: 0, dong: [GOM.thongDiep.cungDau] };
		gioCu = k.gio;
	} else {
		const cuoi = prs[0];
		if (cuoi && cuoi.state === "CLOSED" && !cuoi.mergedAt) {
			const k = docKhoiMay(cuoi.body);
			if (k.dau === dau) return { ma: 0, dong: [GOM.thongDiep.phuQuyet] };
			phuQuyet = k.nhom.map((n) => n.ten);
		}
	}

	if (!khoa.length) return do1([GOM.thongDiep.thieuKhoa]);
	const nha = nguon.HOME;
	const trenDia = quetDia(
		[o.goc, ...(nha ? [nha] : [])],
		token ? [token] : [],
	);
	if (trenDia.length) return do1([GOM.thongDiep.tokenTrenDia, ...trenDia]);

	let ch: CauHinhGom;
	try {
		ch = cauHinhGom.parse(
			Bun.YAML.parse(
				readFileSync(path.join(o.goc, "_acceptance", "config.yaml"), "utf8"),
			),
		);
	} catch {
		return do1([GOM.thongDiep.chamNgoai, "_acceptance/config.yaml"]);
	}
	const thuMucGom = ch.tin_hieu.gom.replace(/\/+$/, "");
	const loTrinh = [ch.lo_trinh.tep].flat();
	const tepBanGomDinh = duongBanGom(o.goc, thuMucGom, o.now);
	writeFileSync(path.join(o.goc, tepBanGomDinh), "");
	gitPhai("add", "--intent-to-add", "--", tepBanGomDinh);

	const thuMucTam = mkdtempSync(path.join(tmpdir(), "gom-phien-"));
	const loiGoi = dungLoiGoi({
		ag,
		banGom: tepBanGomDinh,
		loTrinh,
		phuQuyet,
		nguon,
		thuMucTam,
	});
	const dirGit = thuMucGit(o.goc, envChay);
	const bamTruoc = bamSieuDuLieu(dirGit);
	const ph = chay(
		o.claude,
		loiGoi.thamSo,
		o.goc,
		loiGoi.env,
		o.tranMs ?? GOM.moHinh.tranMs,
	);
	const lech = lechBam(bamTruoc, bamSieuDuLieu(dirGit), o.goc);
	rmSync(thuMucTam, { recursive: true, force: true });
	if (lech.length) return do1([GOM.thongDiep.sieuDuLieu, ...lech]);
	try {
		const kq = ketQuaPhien.parse(JSON.parse(ph.ra));
		const tenCongCu = [
			...new Set(kq.permission_denials.map((d) => d.tool_name)),
		];
		them.push(
			`${GOM.thongDiep.biTuChoi} ${kq.permission_denials.length} lời gọi${tenCongCu.length ? `: ${tenCongCu.join(", ")}` : ""}`,
		);
	} catch {}
	if (ph.ma_loi === "ENOENT" || ph.ma_loi === "EACCES")
		return do1([GOM.thongDiep.thieuLenh]);
	if (ph.ma_loi === "ETIMEDOUT" || ph.ma_loi === "SIGKILL")
		return do1([GOM.thongDiep.quaTran]);
	if (ph.ma !== 0)
		return do1(
			[GOM.thongDiep.moHinhHong, dauDong(ph.loi || ph.ra)].filter(Boolean),
		);

	const tepDinh = path.join(o.goc, tepBanGomDinh);
	if (existsSync(tepDinh) && statSync(tepDinh).size === 0) {
		git("rm", "--cached", "--quiet", "--", tepBanGomDinh);
		rmSync(tepDinh, { force: true });
	}

	const trongGom = (t: string) =>
		t.startsWith(`${thuMucGom}/`) &&
		t.endsWith(".md") &&
		!t.slice(thuMucGom.length + 1).includes("/");
	const trongVung = (t: string) =>
		t === GOM.vung.trang || loTrinh.includes(t) || trongGom(t);

	const ban = git("status", "--porcelain", "--untracked-files=all")
		.ra.split("\n")
		.filter(Boolean)
		.map((d) => d.slice(3).replace(/^.* -> /, ""));
	const ngoai = new Set(ban.filter((t) => !trongVung(t)));
	const banTrong = ban.filter(trongVung);
	if (banTrong.length && !ngoai.size) {
		gitPhai("add", "--", ...banTrong);
		gitPhai(
			"commit",
			"--quiet",
			"-m",
			"chore(gom-tin-hieu-tu-chay): bản gom và hàng đề xuất",
		);
	}
	const doi = gitPhai("diff", "--name-status", chinh, "HEAD")
		.split("\n")
		.filter(Boolean)
		.map((d) => {
			const [trangThai = "", ...con] = d.split("\t");
			return { trangThai: trangThai[0] ?? "", tep: con[con.length - 1] ?? "" };
		});
	for (const d of doi)
		if (!trongVung(d.tep) || (trongGom(d.tep) && d.trangThai !== "A"))
			ngoai.add(d.tep);
	if (ngoai.size) return do1([GOM.thongDiep.chamNgoai, ...[...ngoai].sort()]);
	const banGomMoi = doi.filter((d) => trongGom(d.tep)).map((d) => d.tep);
	if (banGomMoi.length !== 1)
		return do1([GOM.thongDiep.soBanGom, ...banGomMoi]);
	const tepBanGom = banGomMoi[0] as string;

	const ve = chay("node", [...GOM.vung.veLai], o.goc, envChay);
	if (ve.ma !== 0)
		return do1([`${GOM.thongDiep.veHong}: ${dauDong(ve.loi || ve.ra)}`]);
	if (git("status", "--porcelain", "--", GOM.vung.trang).ra.trim()) {
		gitPhai("add", "--", GOM.vung.trang);
		gitPhai(
			"commit",
			"--quiet",
			"-m",
			"chore(gom-tin-hieu-tu-chay): vẽ lại trang lộ trình",
		);
	}

	const rang = kit(GOM.kit.tinHieu, "--rang");
	if (rang.ma !== 0)
		return do1([GOM.thongDiep.rangDo, ...cacDong(rang.ra + rang.loi)]);
	const cau = kit(GOM.kit.tinHieu, "--cau");
	if (cau.ma !== 0)
		return do1([GOM.thongDiep.cauDo, ...cacDong(cau.ra + cau.loi)]);
	const loTrinhDoi = doi.map((d) => d.tep).filter((t) => loTrinh.includes(t));
	for (const lt of loTrinhDoi.length ? loTrinhDoi : loTrinh.slice(0, 1)) {
		const cl = kit(GOM.kit.catLuot, "--pham-vi", tepBanGom, "--lo-trinh", lt);
		if (cl.ma !== 0)
			return do1([GOM.thongDiep.catLuotDo, ...cacDong(cl.ra + cl.loi)]);
	}

	const modKit = (await import(
		pathToFileURL(path.join(ag, GOM.kit.tinHieu)).href
	)) as { docBanGom: (txt: string) => unknown };
	const bg = banGom.parse(
		modKit.docBanGom(readFileSync(path.join(o.goc, tepBanGom), "utf8")),
	);
	const hang: HangLoTrinh[] = loTrinh.flatMap((lt) => {
		try {
			return tepLoTrinh.parse(
				JSON.parse(readFileSync(path.join(o.goc, lt), "utf8")),
			).hang;
		} catch {
			return [];
		}
	});
	const gio: Record<string, string> = {};
	for (const id of ids) gio[id] = gioCu[id] ?? o.now.toISOString();
	const than = dungThan({
		banGom: bg,
		tepBanGom,
		hang,
		tinHieu: chua.tin_hieu,
		daGiao: chua.da_giao,
		dau,
		gioDeXuat: gio,
	});
	const tieuDe = GOM.tieuDe(o.now);

	const sapDi = [
		git("diff", chinh, "HEAD").ra,
		git("log", "--format=%B", `${chinh}..HEAD`).ra,
		tieuDe,
		than,
	].join("\n");
	if (biMat.flatMap(dangKhoa).some((k) => sapDi.includes(k)))
		return do1([GOM.thongDiep.lotKhoa]);

	const day = chay(
		"git",
		[
			"push",
			"--quiet",
			"--force",
			"origin",
			`HEAD:refs/heads/${GOM.nhanhDeXuat}`,
		],
		o.goc,
		{ ...envMang, ...GOM.boHookTruocDay },
	);
	if (day.ma !== 0)
		return do1([`${GOM.thongDiep.dayHong}: ${dauDong(day.loi)}`]);
	const giao = mo
		? chay(
				o.gh,
				["pr", "edit", String(mo.number), "--title", tieuDe, "--body", than],
				o.goc,
				envGh,
			)
		: chay(
				o.gh,
				[
					"pr",
					"create",
					"--draft",
					"--base",
					GOM.nhanhChinh,
					"--head",
					GOM.nhanhDeXuat,
					"--title",
					tieuDe,
					"--body",
					than,
				],
				o.goc,
				envGh,
			);
	if (giao.ma !== 0)
		return do1([`${GOM.thongDiep.moPrHong}: ${dauDong(giao.loi)}`]);
	return {
		ma: 0,
		dong: [
			`${ids.length} tín hiệu vào ${bg.nhom.length} nhóm`,
			mo ? `đã dựng lại đề xuất #${mo.number}` : dauDong(giao.ra),
			...them,
		].map(che),
	};
}

if (import.meta.main) {
	const kq = await chayGom({
		goc: path.resolve(import.meta.dir, "..", ".."),
		env: process.env,
		gh: "gh",
		claude: "claude",
		now: new Date(),
	}).catch((loi: unknown) => ({
		ma: 1 as const,
		dong: [loi instanceof Error ? loi.message : "lượt gom hỏng"],
	}));
	for (const d of kq.dong) (kq.ma === 0 ? console.log : console.error)(d);
	process.exit(kq.ma);
}
