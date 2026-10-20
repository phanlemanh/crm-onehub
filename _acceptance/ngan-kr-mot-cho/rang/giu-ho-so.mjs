import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
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
	giuDuong: ["cap-nhat-tuan-okr#E18", "no-sau-luot-4-okr#E8"],
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

function tepDoiCuaVong() {
	const nen = git("merge-base", "HEAD", GIU.nhanhNen).trim();
	const tep = git("diff", "--name-only", nen)
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

function chayLenh(lenh) {
	const r = spawnSync("bash", ["-c", lenh], {
		cwd: GOC,
		stdio: ["ignore", "inherit", "inherit"],
		timeout: GIU.hetGioMs,
	});
	return r.error ? `het gio ${GIU.hetGioMs / PHUT_MS} phut` : r.status;
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
	const tatCa = tapKhop(hoSo, tep);
	const thieu = GIU.kiemDuong.filter((k) => !tatCa.some((e) => khoa(e) === k));
	if (thieu.length > 0) {
		console.log(`KHONG DO DUOC: doi chung duong thieu ${thieu.join(", ")}`);
		process.exit(2);
	}
	const { may, kemLenh, boQua } = chiaTap(tatCa);
	console.log(
		`khop ${tatCa.length} eval · ${may.length} test/script · ${kemLenh.length} ui-check cung lenh · bo qua ${boQua.length}`,
	);
	for (const e of boQua)
		console.log(`BO QUA ${e.hoSo}/${e.id} (${e.executor}, lenh rieng)`);
	const { nghi, loi } = kiemNghi(hoSo);
	console.log(`eval nghi tro ${SLUG}: ${nghi.length}`);
	const nhom = nhomLenh([...may, ...kemLenh]);
	if (process.argv.includes("--liet-ke")) {
		for (const [lenh, ds] of nhom)
			console.log(`  ${ds.map(khoa).join(", ")} :: ${lenh}`);
		for (const l of loi) console.log(l);
		process.exit(0);
	}
	const dong = [];
	let soDo = 0;
	let soHoan = 0;
	for (const [thu, [lenh, ds]] of nhom.entries()) {
		console.log(
			`[${thu + 1}/${nhom.length}] ${ds.map(khoa).join(", ")} :: ${lenh}`,
		);
		const lyDo = hoan(lenh, ds);
		if (lyDo) {
			for (const e of ds) dong.push(`HOAN ${ten(khoa(e))} (${lyDo})`);
			soHoan += ds.length;
			continue;
		}
		const ma = chayLenh(lenh);
		for (const e of ds) {
			const d =
				ma === e.ky ? `GIU ${ten(khoa(e))}` : `DO ${ten(khoa(e))}: ${ma}`;
			if (ma !== e.ky) soDo += 1;
			dong.push(d);
			console.log(d);
		}
	}
	console.log("---- ket qua ----");
	for (const d of dong) console.log(d);
	for (const l of loi) console.log(l);
	const giuHong = GIU.giuDuong.filter(
		(k) =>
			!dong.includes(`GIU ${ten(k)}`) &&
			!dong.some((d) => d.startsWith(`HOAN ${ten(k)}`)),
	);
	for (const k of giuHong) console.log(`DOI CHUNG GIU HONG: ${k}`);
	console.log(
		`KET LUAN: ${dong.length - soDo - soHoan} GIU, ${soDo} DO, ${soHoan} HOAN, ${loi.length} loi nghi, ${nhom.length} lenh`,
	);
	if (soDo > 0 || loi.length > 0 || giuHong.length > 0) process.exit(1);
	process.exit(soHoan > 0 ? GIU.maHoan : 0);
}

if (import.meta.main) chay();
