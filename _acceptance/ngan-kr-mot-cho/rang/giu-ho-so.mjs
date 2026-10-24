import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	readdirSync,
	readFileSync,
	rmSync,
	symlinkSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "../../../packages/validation/node_modules/zod/index.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "..", "..", "..");
const SLUG = "ngan-kr-mot-cho";
const PHUT_MS = 60_000;
const GIU = {
	nhanhNen: "origin/onehub",
	daKy: new Set(["signed-off", "machine-cleared"]),
	may: new Set(["test", "script"]),
	kiemDuong: [
		"cap-nhat-tuan-okr#E18",
		"no-sau-luot-4-okr#E8",
		"canh-kr-okr#E13",
	],
	giuDuong: ["no-sau-luot-4-okr#E8"],
	tepKhongCo: "apps/khong-co/tep-nay.ts",
	sauToiThieu: 3,
	boTepDoi: [
		/^_acceptance\//,
		/^docs\//,
		/^PRODUCT-MAP\.md$/,
		/^LO-TRINH\.html$/,
	],
	lenhMan: /scripts\/lan-do\/tien-de\.mjs|rang\/mot-luot\.sh/,
	hetGioMs: 40 * PHUT_MS,
	maHoan: 3,
	boRa: {
		"doi-ten-onehub-center#E14":
			"luat pham vi vong: rang/soi-ma.mjs cam diff merge-base cua vong do cham proto ngoai doi-ten-onehub-center",
		"khung-khong-con-dung-chu#E5":
			"luat pham vi vong: git diff --quiet merge-base tren messages-guard.spec.ts cua vong do",
		"muc-tieu-va-kr#E14":
			"thuoc chay thuoc: rang/ho-so-cham.mjs tu chay eval cua 14 ho so khac",
		"kara-mot-ten#E12":
			"so-do-toan-vung AC-6 gỡ bài Cây có chủ đích (cay-can-chinh-ly-do.dom.tsx, ca theo-don-vi-cay); chủ kho V3-18 lối 1",
		"truong-tu-tao-o-cai-dat#E11":
			"thước màn trang-truong.mjs khay-cu chụp ảnh vào evidence của hồ sơ đã ký (làn ghim lại dừng «executor chạm hồ sơ đã thông»), và đỏ sẵn trên onehub; chủ kho V3-39 lối A",
	},
	cayNen: ".acceptance-runs/ngan-kr-mot-cho/goc",
};
const ANH_XA = join(HERE, "anh-xa-nghi.json");

const git = (...a) =>
	execFileSync("git", ["-C", GOC, ...a], {
		encoding: "utf8",
		maxBuffer: 64 << 20,
	});

const config = Bun.YAML.parse(
	readFileSync(join(GOC, "_acceptance/config.yaml"), "utf8"),
);

export function giaiLenh(cmd) {
	if (!cmd.startsWith("config:")) return cmd;
	const gt = cmd
		.slice("config:".length)
		.split(".")
		.reduce((o, k) => (o == null ? undefined : o[k]), config);
	const r = z.string().safeParse(gt);
	if (!r.success) throw new Error(`khong giai duoc ${cmd}`);
	return r.data;
}

export function globRegex(mau) {
	let ra = "";
	let i = 0;
	let ngoac = 0;
	while (i < mau.length) {
		const c = mau[i];
		if (mau.startsWith("**/", i)) {
			ra += "(?:.*/)?";
			i += 3;
		} else if (mau.startsWith("**", i)) {
			ra += ".*";
			i += 2;
		} else if (c === "*") {
			ra += "[^/]*";
			i += 1;
		} else if (c === "?") {
			ra += "[^/]";
			i += 1;
		} else if (c === "{") {
			ra += "(?:";
			ngoac += 1;
			i += 1;
		} else if (c === "}" && ngoac > 0) {
			ra += ")";
			ngoac -= 1;
			i += 1;
		} else if (c === "," && ngoac > 0) {
			ra += "|";
			i += 1;
		} else {
			ra += c.replace(/[.+^$()|[\]\\]/g, "\\$&");
			i += 1;
		}
	}
	return new RegExp(`^${ra}$`);
}

export function doSau(mau) {
	const i = mau.search(/[*?{]/);
	if (i < 0) return Number.POSITIVE_INFINITY;
	return mau.slice(0, i).split("/").filter(Boolean).length;
}

export const khop = (paths, tepDoi) =>
	paths.some((p) => {
		if (doSau(p) < GIU.sauToiThieu) return false;
		const r = globRegex(p);
		return tepDoi.some((t) => r.test(t));
	});

const truong = (khoi, ten) =>
	khoi.match(new RegExp(`^ {4}${ten}: *(.*)$`, "m"))?.[1]?.trim() ?? null;

export function docTheoDong(tho) {
	return tho
		.split(/^ {2}- id: */m)
		.slice(1)
		.map((k) => {
			const dongPaths = truong(k, "paths");
			const ky = truong(k, "expected_exit");
			return {
				id: k.split("\n")[0].trim(),
				executor: truong(k, "executor"),
				cmd: truong(k, "cmd"),
				status: truong(k, "status"),
				superseded_by: truong(k, "superseded_by"),
				expected_exit: ky === null ? undefined : Number(ky),
				paths: dongPaths
					? dongPaths
							.replace(/^\[|\]$/g, "")
							.split(",")
							.map((x) => x.trim().replace(/^"|"$/g, ""))
							.filter(Boolean)
					: [],
			};
		});
}

const trangThai = (hoSo) => {
	const hd = join(GOC, "_acceptance", hoSo, "contract.md");
	if (!existsSync(hd)) return null;
	return readFileSync(hd, "utf8").match(/^status:\s*(\S+)/m)?.[1] ?? null;
};

function docEvals(hoSo) {
	const tep = join(GOC, "_acceptance", hoSo, "evals.yaml");
	if (!existsSync(tep)) return null;
	const tho = readFileSync(tep, "utf8");
	try {
		const ds = Bun.YAML.parse(tho)?.evals;
		if (Array.isArray(ds)) return ds;
	} catch {}
	return docTheoDong(tho);
}

function hoSoDaKy() {
	const ra = [];
	for (const hoSo of readdirSync(join(GOC, "_acceptance")).sort()) {
		if (hoSo === SLUG || !GIU.daKy.has(trangThai(hoSo) ?? "")) continue;
		const ds = docEvals(hoSo);
		if (ds) ra.push({ hoSo, ds });
	}
	return ra;
}

export function tapKhop(hoSo, tepDoi) {
	const ra = [];
	for (const { hoSo: h, ds } of hoSo)
		for (const e of ds) {
			if (e.status === "not-run") continue;
			const paths = Array.isArray(e.paths) ? e.paths.map(String) : [];
			if (!khop(paths, tepDoi)) continue;
			ra.push({
				hoSo: h,
				id: String(e.id),
				executor: String(e.executor),
				cmd: e.cmd == null ? null : String(e.cmd),
				ky: e.expected_exit ?? 0,
			});
		}
	return ra;
}

export function tachBoRa(tatCa, boRa = GIU.boRa) {
	const khoaBoRa = new Set(Object.keys(boRa));
	const conLai = tatCa.filter((e) => !khoaBoRa.has(`${e.hoSo}#${e.id}`));
	const daBo = tatCa.filter((e) => khoaBoRa.has(`${e.hoSo}#${e.id}`));
	const loi = [...khoaBoRa]
		.filter((k) => !daBo.some((e) => `${e.hoSo}#${e.id}` === k))
		.map((k) => `BO RA THUA ${k.replace("#", "/")}`);
	return { conLai, daBo, loi };
}

function evalNghi(hoSo) {
	const ra = [];
	for (const { hoSo: h, ds } of hoSo)
		for (const e of ds) {
			const sb = e.superseded_by == null ? "" : String(e.superseded_by);
			if (sb.startsWith(`${SLUG}#`))
				ra.push({ cu: `${h}#${e.id}`, status: e.status, sb });
		}
	return ra;
}

function kiemNghi(hoSo) {
	const loi = [];
	const nghi = evalNghi(hoSo);
	const bang = existsSync(ANH_XA)
		? JSON.parse(readFileSync(ANH_XA, "utf8"))
		: [];
	if (!Array.isArray(bang))
		return { nghi, loi: ["anh-xa-nghi.json khong phai mang"] };
	const hd = readFileSync(
		join(GOC, "_acceptance", SLUG, "contract.md"),
		"utf8",
	);
	const ac = new Set([...hd.matchAll(/^- (AC-\d+)/gm)].map((m) => m[1]));
	const cuaVong = new Set((docEvals(SLUG) ?? []).map((e) => `${SLUG}#${e.id}`));
	for (const n of nghi) {
		if (n.status !== "not-run") loi.push(`NGHI KHONG not-run ${n.cu}`);
		if (!ac.has(n.sb.slice(SLUG.length + 1)))
			loi.push(`CON TRO HONG ${n.cu} -> ${n.sb}`);
		const dong = bang.filter((d) => d?.cu === n.cu);
		if (dong.length === 0) loi.push(`MAT THUOC ${n.cu.replace("#", "/")}`);
		for (const d of dong)
			if (!cuaVong.has(String(d.moi)))
				loi.push(`ANH XA TRO SAI ${n.cu} -> ${d.moi}`);
	}
	for (const d of bang)
		if (!nghi.some((n) => n.cu === d?.cu)) loi.push(`ANH XA THUA ${d?.cu}`);
	if (bang.length !== nghi.length)
		loi.push(`so dong anh xa ${bang.length} != so eval nghi ${nghi.length}`);
	return { nghi, loi };
}

function khungDaGop() {
	const gop = git(
		"log",
		GIU.nhanhNen,
		"--first-parent",
		"--merges",
		"--format=%H %P%x09%s",
		"--grep",
		`/feat/${SLUG}`,
	)
		.split("\n")
		.map((d) => d.split("\t"))
		.find(([, s]) => s?.endsWith(`/feat/${SLUG}`))?.[0];
	if (!gop) return null;
	const [, cha1, cha2] = gop.split(" ");
	return { nen: git("merge-base", cha1, cha2).trim(), den: cha2 };
}

function tepDoiCuaVong() {
	const khung = khungDaGop();
	const nen = khung?.nen ?? git("merge-base", "HEAD", GIU.nhanhNen).trim();
	const tep = git("diff", "--name-only", nen, ...(khung ? [khung.den] : []))
		.split("\n")
		.filter((t) => t && !GIU.boTepDoi.some((r) => r.test(t)));
	return { nen, tep };
}

const khoa = (e) => `${e.hoSo}#${e.id}`;
const ten = (k) => k.replace("#", "/");

function chiaTap(tatCa) {
	const may = tatCa.filter((e) => GIU.may.has(e.executor) && e.cmd);
	const lenhMay = new Set(may.map((e) => giaiLenh(e.cmd)));
	const kemLenh = tatCa.filter(
		(e) => !GIU.may.has(e.executor) && e.cmd && lenhMay.has(giaiLenh(e.cmd)),
	);
	const boQua = tatCa.filter((e) => !may.includes(e) && !kemLenh.includes(e));
	return { may, kemLenh, boQua };
}

function nhomLenh(ds) {
	const theoLenh = new Map();
	for (const e of ds) {
		const lenh = giaiLenh(e.cmd);
		theoLenh.set(lenh, [...(theoLenh.get(lenh) ?? []), e]);
	}
	return [...theoLenh.entries()].sort(
		([a], [b]) => Number(GIU.lenhMan.test(a)) - Number(GIU.lenhMan.test(b)),
	);
}

function chayLenh(lenh, cwd = GOC) {
	const r = spawnSync("bash", ["-c", lenh], {
		cwd,
		stdio: ["ignore", "inherit", "inherit"],
		timeout: GIU.hetGioMs,
		killSignal: "SIGKILL",
	});
	return r.error ? `het gio ${GIU.hetGioMs / PHUT_MS} phut` : r.status;
}

let cayNen = null;

function layCayNen(nen) {
	if (cayNen) {
		git("-C", cayNen, "checkout", "-q", "--", ".");
		git("-C", cayNen, "clean", "-fdq");
		return cayNen;
	}
	const cay = join(GOC, GIU.cayNen);
	spawnSync("git", ["-C", GOC, "worktree", "remove", "--force", cay]);
	rmSync(cay, { recursive: true, force: true });
	git("worktree", "add", "--detach", cay, nen);
	cayNen = cay;
	symlinkSync(join(GOC, ".env"), join(cay, ".env"));
	for (const buoc of [["install"], ["run", "db:generate"]]) {
		const r = spawnSync("bun", buoc, { cwd: cay, stdio: "ignore" });
		if (r.status !== 0)
			throw new Error(`khong dung duoc cay nen: bun ${buoc.join(" ")}`);
	}
	console.log(`cay nen ${nen.slice(0, 9)}: ${cay}`);
	return cay;
}

function goCayNen() {
	if (!cayNen) return;
	spawnSync("git", ["-C", GOC, "worktree", "remove", "--force", cayNen]);
	rmSync(cayNen, { recursive: true, force: true });
	cayNen = null;
}

export function phanXu(ds, ma, chayNen, chayLai) {
	if (ds.every((e) => ma === e.ky)) return ds.map((e) => ({ loai: "GIU", e }));
	const maNen = chayNen();
	const maLai = ds.some((e) => ma !== e.ky && maNen === e.ky)
		? chayLai()
		: null;
	return ds.map((e) => {
		if (ma === e.ky) return { loai: "GIU", e };
		if (maNen !== e.ky)
			return { loai: "DO-SAN-NEN", e, chu: `HEAD ${ma} · nen ${maNen}` };
		if (maLai === e.ky)
			return {
				loai: "CHAP-CHON",
				e,
				chu: `HEAD ${ma} · nen ${maNen} · HEAD lai ${maLai}`,
			};
		return { loai: "DO", e, chu: `${ma}` };
	});
}

const dongKetQua = (k) =>
	k.loai === "GIU"
		? `GIU ${ten(khoa(k.e))}`
		: `${k.loai} ${ten(khoa(k.e))}: ${k.chu}`;

const tepHoSoDaKy = (hoSo) => {
	const thuMuc = hoSo.map(({ hoSo: h }) => `_acceptance/${h}/`);
	return git("status", "--porcelain", "--", "_acceptance")
		.split("\n")
		.filter(Boolean)
		.map((d) => ({ ma: d.slice(0, 2), tep: d.slice(3) }))
		.filter(({ tep }) => thuMuc.some((t) => tep.startsWith(t)));
};

function traLaiHoSoDaKy(hoSo, truoc) {
	const daBan = new Set(truoc.map((d) => d.tep));
	const ra = [];
	for (const { ma, tep } of tepHoSoDaKy(hoSo)) {
		if (daBan.has(tep)) continue;
		if (ma === "??") rmSync(join(GOC, tep), { recursive: true, force: true });
		else git("checkout", "--", tep);
		ra.push(tep);
	}
	return ra;
}

function locChay(argv) {
	const i = argv.indexOf("--chi");
	const chi =
		i < 0 ? null : new Set((argv[i + 1] ?? "").split(",").filter(Boolean));
	const boMan = argv.includes("--bo-man");
	const chiMan = argv.includes("--chi-man");
	return (lenh, ds) => {
		const man = GIU.lenhMan.test(lenh);
		if (boMan && man) return "phien do man";
		if (chiMan && !man) return "khong phai phien do man";
		if (chi && !ds.some((e) => chi.has(khoa(e)))) return "ngoai --chi";
		return null;
	};
}

function chay() {
	const hoan = locChay(process.argv);
	const hoSo = hoSoDaKy();
	const { nen, tep } = tepDoiCuaVong();
	console.log(
		`nen ${nen.slice(0, 9)} (${GIU.nhanhNen}) · ${tep.length} tep doi`,
	);
	const am = tapKhop(hoSo, [GIU.tepKhongCo]);
	if (am.length !== 0) {
		console.log(`KHONG DO DUOC: doi chung am khop ${am.map(khoa).join(", ")}`);
		process.exit(2);
	}
	const { conLai: tatCa, daBo, loi: loiBoRa } = tachBoRa(tapKhop(hoSo, tep));
	const thieu = GIU.kiemDuong.filter((k) => !tatCa.some((e) => khoa(e) === k));
	if (thieu.length > 0) {
		console.log(`KHONG DO DUOC: doi chung duong thieu ${thieu.join(", ")}`);
		process.exit(2);
	}
	for (const e of daBo)
		console.log(`BO RA ${ten(khoa(e))} — ${GIU.boRa[khoa(e)]}`);
	const { may, kemLenh, boQua } = chiaTap(tatCa);
	console.log(
		`khop ${tatCa.length} eval · ${may.length} test/script · ${kemLenh.length} ui-check cung lenh · bo qua ${boQua.length} · bo ra ${daBo.length}`,
	);
	for (const e of boQua)
		console.log(`BO QUA ${e.hoSo}/${e.id} (${e.executor}, lenh rieng)`);
	const kiem = kiemNghi(hoSo);
	const loi = [...loiBoRa, ...kiem.loi];
	console.log(`eval nghi tro ${SLUG}: ${kiem.nghi.length}`);
	const nhom = nhomLenh([...may, ...kemLenh]);
	if (process.argv.includes("--liet-ke")) {
		for (const [lenh, ds] of nhom)
			console.log(`  ${ds.map(khoa).join(", ")} :: ${lenh}`);
		for (const l of loi) console.log(l);
		process.exit(0);
	}
	const truoc = tepHoSoDaKy(hoSo);
	const dong = [];
	const dem = { GIU: 0, DO: 0, "DO-SAN-NEN": 0, "CHAP-CHON": 0, HOAN: 0 };
	const traLai = [];
	try {
		for (const [thu, [lenh, ds]] of nhom.entries()) {
			console.log(
				`[${thu + 1}/${nhom.length}] ${ds.map(khoa).join(", ")} :: ${lenh}`,
			);
			const lyDo = hoan(lenh, ds);
			if (lyDo) {
				for (const e of ds) dong.push(`HOAN ${ten(khoa(e))} (${lyDo})`);
				dem.HOAN += ds.length;
				continue;
			}
			const ma = chayLenh(lenh);
			traLai.push(...traLaiHoSoDaKy(hoSo, truoc));
			const kq = phanXu(
				ds,
				ma,
				() => chayLenh(lenh, layCayNen(nen)),
				() => {
					const lai = chayLenh(lenh);
					traLai.push(...traLaiHoSoDaKy(hoSo, truoc));
					return lai;
				},
			);
			for (const k of kq) {
				dem[k.loai] += 1;
				dong.push(dongKetQua(k));
				console.log(dongKetQua(k));
			}
		}
	} finally {
		goCayNen();
	}
	console.log("---- ket qua ----");
	for (const e of daBo) console.log(`BO RA ${ten(khoa(e))}`);
	for (const d of dong) console.log(d);
	for (const t of new Set(traLai))
		console.log(`TRA LAI ${t} (lenh do ghi vao ho so da ky)`);
	for (const l of loi) console.log(l);
	const giuHong = GIU.giuDuong.filter(
		(k) =>
			!dong.includes(`GIU ${ten(k)}`) &&
			!dong.some((d) => d.startsWith(`HOAN ${ten(k)}`)),
	);
	for (const k of giuHong) console.log(`DOI CHUNG GIU HONG: ${k}`);
	console.log(
		`KET LUAN: ${dem.GIU} GIU, ${dem.DO} DO, ${dem["DO-SAN-NEN"]} DO-SAN-NEN, ${dem["CHAP-CHON"]} CHAP-CHON, ${dem.HOAN} HOAN, ${daBo.length} BO RA, ${loi.length} loi nghi, ${nhom.length} lenh`,
	);
	if (dem.DO > 0 || loi.length > 0 || giuHong.length > 0) process.exit(1);
	process.exit(dem.HOAN > 0 ? GIU.maHoan : 0);
}

if (import.meta.main) chay();
