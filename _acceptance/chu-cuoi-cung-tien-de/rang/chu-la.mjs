import { execFileSync, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
	cpSync,
	mkdirSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const API = join(ROOT, "apps/api");
const RA = join(ROOT, ".acceptance-runs/chu-cuoi-cung-tien-de");
const TEP = "test/workspace-thanh-vien.spec.ts";
const PHAM_VI = {
	gop: "46a52ade5b9fb48f823288f8063ec13141935d48",
	tu: "5ed8c45547fdcf096c5dde8b7ace42b43fc64f9b",
	toi: "2aff077d0cb4966a90d014a9a70c91a45d5c8f6a",
};

const CCC = {
	goc: "058bb75f8d9766ffe7654384201642664be83c21",
	ca: "chu cuoi cung khong go duoc, hai chu thi go duoc",
	nhom: "chu-cuoi-cung",
	cau: "The workspace needs an owner. Make someone else an owner first.",
	chuLa: "ccc-chu-la",
	memberLa: "ccc-member-la",
	dotBien: {
		G: {
			tep: "src/workspace/workspace.service.ts",
			sau: "async removeMember(",
			moc: "owners.length <= 1",
			thay: "owners.length < 1",
		},
		F: {
			tep: TEP,
			moc: "\t\t} finally {\n\t\t\tawait traVai(daHa);\n\t\t}",
			thay: "\t\t} catch (loi) {\n\t\t\tthrow loi;\n\t\t}\n\t\tawait traVai(daHa);",
		},
		T: {
			tep: TEP,
			sau: "async function traVai(",
			moc: "where: { id: { in: ids } },",
			thay: 'where: { organizationId: WORKSPACE_ID, role: "member" },',
		},
	},
};

class Dung extends Error {
	constructor(ma, thongDiep) {
		super(thongDiep);
		this.ma = ma;
	}
}

function dung(ma, thongDiep) {
	throw new Dung(ma, thongDiep);
}

function git(thamSo) {
	return execFileSync("git", ["-C", ROOT, ...thamSo], {
		encoding: "utf8",
		maxBuffer: 64 << 20,
	});
}

const GOC = git(["rev-parse", process.env.CCC_GOC ?? CCC.goc]).trim();

const DO = `import { afterAll, beforeAll } from "bun:test";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";

const NGUOI = [
	["${CCC.chuLa}", "owner"],
	["${CCC.memberLa}", "member"],
];

beforeAll(async () => {
	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		create: { id: WORKSPACE_ID, name: "CRM", slug: "crm", createdAt: new Date() },
		update: {},
	});
	for (const [id, vai] of NGUOI) {
		await db.user.upsert({
			where: { id },
			create: { id, name: id, email: id + "@example.com", emailVerified: true, createdAt: new Date(), updatedAt: new Date() },
			update: {},
		});
		await db.member.upsert({
			where: { organizationId_userId: { organizationId: WORKSPACE_ID, userId: id } },
			create: { id: id + "-m", organizationId: WORKSPACE_ID, userId: id, role: vai, createdAt: new Date() },
			update: { role: vai },
		});
	}
});

afterAll(async () => {
	for (const [id, vai] of NGUOI) {
		const hang = await db.member.findUnique({
			where: { organizationId_userId: { organizationId: WORKSPACE_ID, userId: id } },
			select: { role: true },
		});
		const that = hang?.role ?? "vang";
		console.log((that === vai ? "VAI-GIU " : "VAI-MAT ") + id + " " + that);
	}
	for (const [id] of NGUOI) {
		await db.member.deleteMany({ where: { userId: id } });
		await db.user.deleteMany({ where: { id } });
	}
});

import "../workspace-thanh-vien.spec.ts";
`;

function apDotBien(sao, ten) {
	const d = CCC.dotBien[ten];
	const duong = join(sao, d.tep);
	const noiDung = readFileSync(duong, "utf8");
	const tu = d.sau ? noiDung.indexOf(d.sau) : 0;
	const vi = tu < 0 ? -1 : noiDung.indexOf(d.moc, tu);
	if (vi < 0) dung(2, `TIEN DE: khong con moc dot bien ${ten} trong ${d.tep}`);
	writeFileSync(
		duong,
		noiDung.slice(0, vi) + d.thay + noiDung.slice(vi + d.moc.length),
	);
}

function saoChep(ban, dotBien = []) {
	const sao = join(RA, `sao-${ban}-${randomBytes(4).toString("hex")}`);
	mkdirSync(sao, { recursive: true });
	symlinkSync(join(API, "node_modules"), join(sao, "node_modules"));
	for (const muc of ["package.json", "tsconfig.json", "src", "test"])
		cpSync(join(API, muc), join(sao, muc), { recursive: true });
	if (ban === "goc")
		writeFileSync(join(sao, TEP), git(["show", `${GOC}:apps/api/${TEP}`]));
	for (const ten of dotBien) apDotBien(sao, ten);
	mkdirSync(join(sao, "test/.do"), { recursive: true });
	writeFileSync(join(sao, "test/.do/do.spec.ts"), DO);
	return sao;
}

function chayBun(noi, thamSo) {
	const ket = spawnSync("bun", thamSo, {
		cwd: noi,
		env: { ...process.env, CRM_TELEMETRY_DISABLED: "1", NODE_ENV: "test" },
		encoding: "utf8",
		maxBuffer: 64 << 20,
	});
	return { ma: ket.status, ra: `${ket.stdout}${ket.stderr}` };
}

function thuocTinh(chuoi, ten) {
	const m = chuoi.match(new RegExp(`\\b${ten}="([^"]*)"`));
	return m ? m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&") : "";
}

function junit(noi, dich) {
	mkdirSync(RA, { recursive: true });
	const duong = join(RA, `junit-${randomBytes(4).toString("hex")}.xml`);
	const chay = chayBun(noi, [
		"test",
		"--preload",
		"./test/setup.ts",
		dich,
		"--reporter=junit",
		`--reporter-outfile=${duong}`,
		...(dich.includes(".do/") ? ["-t", CCC.nhom] : []),
	]);
	let xml = "";
	try {
		xml = readFileSync(duong, "utf8");
	} catch {
		dung(
			1,
			`RANG DO: bun test khong ghi junit (ma ${chay.ma})\n${chay.ra.slice(-2000)}`,
		);
	}
	const ca = [
		...xml.matchAll(/<testcase ([^>]*?)(\/>|>([\s\S]*?)<\/testcase>)/g),
	].map((m) => ({
		ten: thuocTinh(m[1], "name"),
		nhom: thuocTinh(m[1], "classname"),
		hong: /<failure/.test(m[3] ?? ""),
		bo: /<skipped/.test(m[3] ?? ""),
	}));
	return { ...chay, ca };
}

function trangThaiCa(ket) {
	const c = ket.ca.find((x) => x.nhom === CCC.nhom && x.ten === CCC.ca);
	if (!c) return "vang";
	if (c.bo) return "skipped";
	return c.hong ? "failed" : "passed";
}

function vai(ra) {
	return {
		chu:
			(ra.match(new RegExp(`VAI-(GIU|MAT) ${CCC.chuLa} (\\S+)`)) ?? [])[1] ??
			"vang",
		member:
			(ra.match(new RegExp(`VAI-(GIU|MAT) ${CCC.memberLa} (\\S+)`)) ?? [])[1] ??
			"vang",
	};
}

function voiSao(ban, dotBien, viec) {
	const sao = saoChep(ban, dotBien);
	try {
		return viec(sao);
	} finally {
		rmSync(sao, { recursive: true, force: true });
	}
}

function luotDo(ban, dotBien) {
	return voiSao(ban, dotBien, (sao) => {
		const ket = junit(sao, "./test/.do/do.spec.ts");
		return { ...ket, trang: trangThaiCa(ket), vai: vai(ket.ra) };
	});
}

function chuLa() {
	const sua = luotDo("sua", []);
	console.log(`ban sua + chu la: ca ${sua.trang}, ma thoat ${sua.ma}`);
	const goc = luotDo("goc", []);
	console.log(`ban goc ${GOC.slice(0, 8)} + chu la: ca ${goc.trang}`);
	if (goc.trang !== "failed")
		dung(
			2,
			`TIEN DE: ban goc cung chu la khong do (ca ${goc.trang}) — khong tai hien loi`,
		);
	const loi = [];
	if (sua.trang !== "passed" || sua.ma !== 0)
		loi.push(`RANG DO: ban sua + chu la: ca ${sua.trang}, ma ${sua.ma}`);
	if (!goc.ra.includes(CCC.cau))
		loi.push(`RANG CUN: ban goc do nhung dau ra khong co '${CCC.cau}'`);
	if (loi.length) dung(1, loi.join("\n"));
	console.log(
		"ccc chu-la: ban sua passed voi chu la, ban goc do dung cau ghim",
	);
}

function traVai() {
	const luot = [
		["sua", [], "GIU", "GIU"],
		["sua", ["G"], "GIU", "GIU"],
		["sua", ["G", "F"], "MAT", null],
		["sua", ["T"], null, "MAT"],
	];
	const loi = [];
	for (const [ban, dotBien, chuKy, memberKy] of luot) {
		const k = luotDo(ban, dotBien);
		const ten = dotBien.length ? dotBien.join("+") : "khong dot bien";
		console.log(
			`${ten}: ca ${k.trang} · chu la VAI-${k.vai.chu} · member la VAI-${k.vai.member}`,
		);
		if (dotBien.includes("G") && k.trang !== "failed")
			loi.push(`TIEN DE: ${ten} khong ep duoc ca do (ca ${k.trang})`);
		if (chuKy && k.vai.chu !== chuKy)
			loi.push(
				`RANG ${chuKy === "GIU" ? "DO" : "CUN"}: ${ten} chu la VAI-${k.vai.chu}, ky vong VAI-${chuKy}`,
			);
		if (memberKy && k.vai.member !== memberKy)
			loi.push(
				`RANG ${memberKy === "GIU" ? "DO" : "CUN"}: ${ten} member la VAI-${k.vai.member}, ky vong VAI-${memberKy}`,
			);
	}
	if (loi.length) dung(1, loi.join("\n"));
	console.log(
		"ccc tra-vai: vai giu ca khi ca xanh lan khi ca do; tra ngoai finally va tra cho moi member deu bi bat",
	);
}

function khongChuLa() {
	const dem = chayBun(API, [
		"-e",
		'const { db } = await import("@crm/db"); const { WORKSPACE_ID } = await import("@crm/db/workspace"); console.log("CHU-LA=" + await db.member.count({ where: { organizationId: WORKSPACE_ID, role: "owner" } }));',
	]);
	const so = (dem.ra.match(/CHU-LA=(\d+)/) ?? [])[1];
	console.log(`owner cua workspace truoc luot: ${so ?? "khong doc duoc"}`);
	if (so !== "0")
		dung(
			2,
			`TIEN DE: co so du lieu cua luot co ${so ?? "?"} owner truoc khi chay — khong do duoc nhanh khong chu la\n${dem.ra.slice(-800)}`,
		);
	const sua = junit(API, `./${TEP}`);
	const goc = voiSao("goc", [], (sao) => junit(sao, `./${TEP}`));
	const khoa = (k) =>
		k.ca
			.map((c) => `${c.nhom}::${c.ten}`)
			.sort()
			.join("\n");
	const hong = sua.ca.filter((c) => c.hong || c.bo).length;
	console.log(
		`ban sua: ma ${sua.ma}, ${sua.ca.length} ca, ${hong} do/bo · ban goc: ${goc.ca.length} ca`,
	);
	const loi = [];
	if (sua.ma !== 0 || hong)
		loi.push(`RANG DO: ban sua ma ${sua.ma}, ${hong} ca do/bo`);
	if (khoa(sua) !== khoa(goc)) loi.push("RANG DO: tap ca ban sua khac ban goc");
	if (loi.length) dung(1, loi.join("\n"));
	console.log(
		"ccc khong-chu-la: 0 owner truoc luot, ban sua xanh, tap ca bang ban goc",
	);
}

function dotBien() {
	const doiChung = luotDo("sua", []);
	const hong = luotDo("sua", ["G"]);
	console.log(
		`doi chung + chu la: ca ${doiChung.trang} · guard hong + chu la: ca ${hong.trang}`,
	);
	const loi = [];
	if (doiChung.trang !== "passed")
		loi.push(`RANG CUN: doi chung khong passed (ca ${doiChung.trang})`);
	if (hong.trang !== "failed")
		loi.push(`RANG CUN: guard hong ma ca van ${hong.trang}`);
	else if (!hong.ra.includes(CCC.cau))
		loi.push(`RANG CUN: guard hong, ca do nhung khong co '${CCC.cau}'`);
	if (loi.length) dung(1, loi.join("\n"));
	console.log(
		"ccc dot-bien: doi chung passed, guard hong thi ca do dung cau ghim",
	);
}

function t1Globs() {
	const dong = readFileSync(
		join(ROOT, "_acceptance/config.yaml"),
		"utf8",
	).split("\n");
	const dau = dong.findIndex((d) => /^\s{2}t1_skip_globs:\s*$/.test(d));
	if (dau < 0)
		dung(2, "TIEN DE: config.yaml khong con risk_tiers.t1_skip_globs");
	const glob = [];
	for (const d of dong.slice(dau + 1)) {
		if (/^\s{2}\S/.test(d)) break;
		const m = d.match(/^\s+-\s+"([^"]+)"/);
		if (m) glob.push(m[1]);
	}
	return glob;
}

function ngoaiPhamVi(danhSach, globs) {
	return danhSach.filter(
		(t) =>
			!t.startsWith("_acceptance/") &&
			t !== `apps/api/${TEP}` &&
			!globs.some((g) => new Bun.Glob(g).match(t)),
	);
}

function phamVi() {
	const globs = t1Globs();
	const mau = [
		`apps/api/${TEP}`,
		"apps/api/src/workspace/workspace.service.ts",
		"PRODUCT-MAP.md",
		"_acceptance/x/contract.md",
	];
	const bat = ngoaiPhamVi(mau, globs);
	if (bat.join(",") !== "apps/api/src/workspace/workspace.service.ts")
		dung(1, `RANG CUN: danh sach mau goi ten ${JSON.stringify(bat)}`);
	for (const sha of [PHAM_VI.tu, PHAM_VI.toi]) {
		try {
			git(["cat-file", "-e", `${sha}^{commit}`]);
		} catch {
			dung(2, `KHONG DO DUOC: khong co commit neo ${sha}`);
		}
	}
	const that = git(["diff", "--name-only", `${PHAM_VI.tu}...${PHAM_VI.toi}`])
		.trim()
		.split("\n")
		.filter(Boolean);
	const lot = ngoaiPhamVi(that, globs);
	console.log(
		`diff ${PHAM_VI.tu.slice(0, 8)}...${PHAM_VI.toi.slice(0, 8)} (gop ${PHAM_VI.gop.slice(0, 9)}): ${that.length} tep, ngoai pham vi: ${lot.length}`,
	);
	if (lot.length)
		dung(1, `RANG DO: diff cham tep ngoai pham vi: ${lot.join(", ")}`);
	console.log(
		"ccc pham-vi: mau goi ten dung workspace.service.ts, diff that chi cham tep kiem",
	);
}

const CHAN = {
	"chu-la": chuLa,
	"tra-vai": traVai,
	"khong-chu-la": khongChuLa,
	"dot-bien": dotBien,
	"pham-vi": phamVi,
};

if (import.meta.main) {
	const i = process.argv.indexOf("--chan");
	const ten = i < 0 ? undefined : process.argv[i + 1];
	try {
		if (!CHAN[ten])
			dung(2, `chu-la: dung --chan ${Object.keys(CHAN).join("|")}`);
		console.log(`chu-la --chan ${ten} · goc ${GOC.slice(0, 8)}`);
		CHAN[ten]();
	} catch (e) {
		if (!(e instanceof Dung)) throw e;
		console.log(e.message);
		process.exit(e.ma);
	}
}
