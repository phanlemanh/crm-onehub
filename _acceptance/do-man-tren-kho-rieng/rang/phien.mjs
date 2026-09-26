import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { dropMeasureDatabase } from "../../../packages/db/scripts/measure-db.ts";
import {
	measureDatabaseName,
	templateDatabaseName,
	treeSlug,
} from "../../../packages/db/src/measure-database.ts";
import { PHIEN_DO } from "../../../scripts/lan-do/cau-hinh.mjs";
import {
	coKho,
	databaseUrlCua,
	dungKhoGia,
	GOC,
	ketThuc,
	khang,
	khongDo,
	lech,
	MA,
	mayChu,
	RA,
	thoatKhongDo,
	vanTay,
	xoaKhoGia,
} from "./kho-gia.mjs";

const DO = "bun _acceptance/do-man-tren-kho-rieng/rang/do-trong-phien.mjs";
const TRAN_MS = 6 * 60_000;
const NHIP_MS = 500;
const cheDo = process.argv[2];
const khoGia = [];
const cayDaDung = new Set();

const ngu = (ms) => new Promise((xong) => setTimeout(xong, ms));

function sachMoiTruong(them) {
	const env = { ...process.env, ...them };
	for (const k of ["PHIEN_DO", "APP_URL", "API_URL"]) {
		if (!(k in them)) delete env[k];
	}
	return env;
}

function chay(lenh, them) {
	return chayLenh("bash", ["-c", lenh], them);
}

function chayLenh(may, thamSo, them) {
	const moiTruong = sachMoiTruong(them);
	if (them.PHIEN_DO_TEN_CAY) cayDaDung.add(them.PHIEN_DO_TEN_CAY);
	const con = spawn(may, thamSo, {
		cwd: GOC,
		env: moiTruong,
		stdio: ["ignore", "pipe", "pipe"],
	});
	const ra = { con, loi: "", ma: null, xongLuc: null };
	con.stdout.on("data", (d) => {
		ra.loi += d;
	});
	con.stderr.on("data", (d) => {
		ra.loi += d;
	});
	ra.xong = new Promise((xong) => {
		const han = setTimeout(() => {
			ra.quaTran = true;
			con.kill("SIGKILL");
		}, TRAN_MS);
		con.on("exit", (ma, tin) => {
			clearTimeout(han);
			ra.ma = ma ?? { SIGINT: 130, SIGTERM: 143, SIGKILL: 137 }[tin] ?? -1;
			ra.xongLuc = Date.now();
			xong(ra);
		});
	});
	return ra;
}

function phienDo(lenh, them) {
	return chayLenh("bun", ["scripts/lan-do/phien-do.mjs", "--chay", lenh], them);
}

function docJson(tep) {
	try {
		return JSON.parse(readFileSync(tep, "utf8"));
	} catch {
		return null;
	}
}

async function choTep(tep, dieu = () => true) {
	const han = Date.now() + TRAN_MS;
	while (Date.now() < han) {
		const j = docJson(tep);
		if (j && dieu(j)) return j;
		await ngu(NHIP_MS);
	}
	return null;
}

function tepGhi(cay) {
	return join(GOC, PHIEN_DO.ghi, measureDatabaseName(cay), "phien.json");
}

function congCua(url) {
	try {
		return Number(new URL(url).port);
	} catch {
		return -1;
	}
}

function trongDai(url) {
	const c = congCua(url);
	return c >= PHIEN_DO.cong.tu && c <= PHIEN_DO.cong.den;
}

function coNghe(cong) {
	const ra = spawnSync("lsof", ["-nP", `-iTCP:${cong}`, "-sTCP:LISTEN", "-t"], {
		encoding: "utf8",
	});
	return ra.stdout.trim().length > 0;
}

function nhomSong(pgid) {
	try {
		process.kill(-pgid, 0);
		return true;
	} catch {
		return false;
	}
}

function ra(ten) {
	const tep = join(RA, `${ten}-${MA}.json`);
	rmSync(tep, { force: true });
	return tep;
}

async function nhomCua(cay, pidPhien) {
	const ghi = await choTep(
		tepGhi(cay),
		(g) =>
			g.nhom?.length === 2 && (pidPhien === undefined || g.pid === pidPhien),
	);
	const nhom = (ghi?.nhom ?? []).map((n) => n.pgid);
	return {
		nhom,
		songLucDoc: nhom.length === 2 && nhom.every((g) => nhomSong(g)),
	};
}

async function sauPhien(j, kho, { nhom, songLucDoc }, ten) {
	khang(j !== null, `${ten}: lenh do da ghi JSON`);
	khang(
		trongDai(j?.appUrl) && trongDai(j?.apiUrl),
		`${ten}: hai cong cua phien nam trong dai (doi chung cho cong trong)`,
		`${j?.appUrl} ${j?.apiUrl}`,
	);
	khang(
		nhom.length === 2 && songLucDoc,
		`${ten}: phien co hai nhom may chu dang song luc chay (doi chung cho khong con tien trinh)`,
		nhom.join(","),
	);
	khang(
		!coNghe(congCua(j?.appUrl)) && !coNghe(congCua(j?.apiUrl)),
		`${ten}: hai cong cua phien khong con ai nghe`,
	);
	khang(!(await coKho(kho)), `${ten}: kho do khong con sau phien`, kho);
	const con = nhom.filter((pgid) => nhomSong(pgid));
	khang(
		con.length === 0,
		`${ten}: khong con tien trinh may chu nao cua phien`,
		con.join(","),
	);
}

async function dauCuoi() {
	const gia = await dungKhoGia("dc");
	khoGia.push(gia.ten);
	const truoc = await vanTay(gia.url);
	const cay = `dmk-dau-cuoi-${MA}`;
	const kho = measureDatabaseName(cay);
	const tep = ra("dau-cuoi");
	const p = phienDo(DO, {
		DATABASE_URL: gia.url,
		PHIEN_DO_TEN_CAY: cay,
		DO_RA: tep,
		DO_NGU: "2",
	});
	const may = await nhomCua(cay, p.con.pid);
	const nhom = may.nhom;
	await p.xong;
	const j = docJson(tep);
	if (!j) khongDo(`lenh do khong ghi ${tep}:\n${p.loi}`);
	khang(j.khoDb === kho, "DATABASE_URL tro kho do cua cay", j.khoDb);
	khang(trongDai(j.appUrl), "APP_URL trong dai cong", j.appUrl);
	khang(trongDai(j.apiUrl), "API_URL trong dai cong", j.apiUrl);
	khang(j.canh === "dung-cay", "may chu khong phuc vu cay nay", j.canh);
	khang(j.health === 200, "API_URL/health tra 200", String(j.health));
	khang(j.nguoiCo === true, "NGUOI khong co trong kho do", j.loiKho ?? "");
	khang(j.onboarded === true, "workspace cua kho do da qua onboarding");
	khang(p.ma === 0, "ma phien bang ma lenh do (0)", String(p.ma));
	khang(j.phienDo === kho, "PHIEN_DO bang ten kho", j.phienDo);
	khang(nhom.length === 2, "phien ghi hai nhom may chu", String(nhom.length));
	await sauPhien(j, kho, may, "dau-cuoi");
	const sau = await vanTay(gia.url);
	const doi = lech(truoc, sau);
	khang(doi.length === 0, "dau van tay kho chung khong doi", doi.join(", "));
	if (p.ma !== 0) console.log(p.loi);
}

async function mot(ca, cay, gia, { maDo, tin, maMong }) {
	const kho = measureDatabaseName(cay);
	const tep = ra(`don-${ca}`);
	const p = phienDo(DO, {
		DATABASE_URL: gia.url,
		PHIEN_DO_TEN_CAY: cay,
		DO_RA: tep,
		DO_NGU: tin ? "30" : "3",
		DO_MA: String(maDo),
	});
	const may = await nhomCua(cay, p.con.pid);
	const j = await choTep(tep);
	if (!j) khongDo(`ca ${ca}: lenh do khong ghi ${tep}:\n${p.loi}`);
	if (tin) p.con.kill(tin);
	await p.xong;
	khang(p.ma === maMong, `ca ${ca}: ma phien ${maMong}`, `${p.ma}`);
	await sauPhien(j, kho, may, `ca ${ca}`);
	if (p.ma !== maMong) console.log(p.loi);
}

async function donKhiDo() {
	const gia = await dungKhoGia("don");
	khoGia.push(gia.ten);
	const cay = `dmk-don-${MA}`;
	await mot("1-do", cay, gia, { maDo: 1, tin: null, maMong: 1 });
	await mot("2-sigint", cay, gia, { maDo: 0, tin: "SIGINT", maMong: 130 });
	await mot("3-sigterm", cay, gia, { maDo: 0, tin: "SIGTERM", maMong: 143 });

	const tep = ra("don-4-kill");
	const p = phienDo(DO, {
		DATABASE_URL: gia.url,
		PHIEN_DO_TEN_CAY: cay,
		DO_RA: tep,
		DO_NGU: "30",
	});
	const { nhom } = await nhomCua(cay, p.con.pid);
	const j = await choTep(tep);
	if (!j || nhom.length !== 2) khongDo(`ca 4: phien chua dung xong:\n${p.loi}`);
	const git = Date.now();
	p.con.kill("SIGKILL");
	await p.xong;
	await ngu(1000);
	khang(
		nhom.every((pgid) => nhomSong(pgid)),
		"ca 4: may chu con song ngay sau SIGKILL (mo coi that)",
	);
	const tep2 = ra("don-4-ke");
	const ke = phienDo(DO, {
		DATABASE_URL: gia.url,
		PHIEN_DO_TEN_CAY: cay,
		DO_RA: tep2,
		DO_PID_CU: nhom.join(","),
		DO_NGU: "3",
	});
	const mayKe = await nhomCua(cay, ke.con.pid);
	await ke.xong;
	const j2 = docJson(tep2);
	khang(ke.ma === 0, "ca 4: phien ke thoat 0", `${ke.ma}`);
	khang(
		(j2?.pidCuSong ?? []).length === 2 &&
			j2.pidCuSong.every((x) => x.song === false),
		"ca 4: may chu mo coi con song khi phien ke chay lenh",
		JSON.stringify(j2?.pidCuSong),
	);
	khang(
		(j2?.khoTaoLuc ?? 0) > git,
		"ca 4: phien ke chay tren kho do dung lai sau SIGKILL",
		String(j2?.khoTaoLuc),
	);
	if (ke.ma !== 0) console.log(ke.loi);
	khang(
		mayKe.nhom.every((g) => !nhom.includes(g)),
		"ca 4: phien ke co may chu rieng, khac nhom cua phien bi giet",
	);
	await sauPhien(j2, measureDatabaseName(cay), mayKe, "ca 4");
}

async function xepHang() {
	const gia = await dungKhoGia("hang");
	khoGia.push(gia.ten);
	const cay = `dmk-hang-${MA}`;
	const cayKhac = `dmk-hang-${MA}-khac`;
	const [tA, tB, tC] = [ra("hang-a"), ra("hang-b"), ra("hang-c")];
	const a = phienDo(DO, {
		DATABASE_URL: gia.url,
		PHIEN_DO_TEN_CAY: cay,
		DO_RA: tA,
		DO_NGU: "60",
	});
	const ghiA = await choTep(tepGhi(cay), (g) => g.nhom?.length === 2);
	const nhomA = (ghiA?.nhom ?? []).map((n) => n.pgid);
	if (nhomA.length !== 2) khongDo(`phien A khong dung xong:\n${a.loi}`);
	const b = phienDo(DO, {
		DATABASE_URL: gia.url,
		PHIEN_DO_TEN_CAY: cay,
		DO_RA: tB,
		DO_PID_CU: nhomA.join(","),
	});
	const c = phienDo(DO, {
		DATABASE_URL: gia.url,
		PHIEN_DO_TEN_CAY: cayKhac,
		DO_RA: tC,
	});
	let aSongSuot = true;
	while (!docJson(tA)?.ketThuc && a.ma === null) {
		if (!nhomA.every((pgid) => nhomSong(pgid))) aSongSuot = false;
		await ngu(NHIP_MS);
	}
	await Promise.all([a.xong, b.xong, c.xong]);
	const [ja, jb, jc] = [docJson(tA), docJson(tB), docJson(tC)];
	const cho = /cho phien khac|chờ phiên khác/;
	khang(cho.test(b.loi), "B in dong cho phien khac cua cay nay");
	khang(
		(jb?.batDau ?? 0) > (ja?.ketThuc ?? Number.POSITIVE_INFINITY),
		"hai phien cung cay chay chong",
		`A ket thuc ${ja?.ketThuc}, B bat dau ${jb?.batDau}`,
	);
	khang(
		(jb?.pidCuSong ?? []).length === 2 &&
			jb.pidCuSong.every((x) => x.song === false),
		"may chu cua A da tat khi B chay lenh",
	);
	khang(!cho.test(c.loi), "C (cay khac) khong cho");
	khang(
		(jc?.batDau ?? 0) < (ja?.ketThuc ?? 0) &&
			(jc?.ketThuc ?? 0) > (ja?.batDau ?? Number.POSITIVE_INFINITY),
		"khoang chay lenh cua C chong len A",
		`A [${ja?.batDau}, ${ja?.ketThuc}] C [${jc?.batDau}, ${jc?.ketThuc}]`,
	);
	khang(aSongSuot, "may chu cua A con song suot luc C dung va chay");
	khang(
		a.ma === 0 && b.ma === 0 && c.ma === 0,
		"A, B, C thoat 0",
		`${a.ma} ${b.ma} ${c.ma}`,
	);
	for (const p of [a, b, c]) if (p.ma !== 0) console.log(p.loi);
	cayDaDung.add(cayKhac);
}

async function tienDe() {
	const gia = await dungKhoGia("td");
	khoGia.push(gia.ten);
	const cay = `dmk-td-${MA}`;
	const kho = measureDatabaseName(cay);
	const truoc = await vanTay(gia.url);

	const tA = ra("td-a");
	const a = chay(
		`bun scripts/lan-do/tien-de.mjs --chay ${JSON.stringify(DO)}`,
		{
			DATABASE_URL: gia.url,
			PHIEN_DO_TEN_CAY: cay,
			APP_URL: "http://localhost:1",
			API_URL: "http://localhost:2",
			DO_RA: tA,
		},
	);
	await a.xong;
	const ja = docJson(tA);
	khang(a.ma === 0, "ca a: ma 0", `${a.ma}`);
	khang(ja?.khoDb === kho, "ca a: lenh do chay tren kho do cua cay", ja?.khoDb);
	khang(
		ja?.appUrl !== "http://localhost:1" && trongDai(ja?.appUrl),
		"ca a: APP_URL cua phien, khong phai cong eval dat san",
		ja?.appUrl,
	);
	khang(
		ja?.khoaNghienCuu === "lan-do-khong-phai-khoa-that",
		"ca a: khoa nghien cuu dat trong kho do",
		String(ja?.khoaNghienCuu),
	);
	const sau = await vanTay(gia.url);
	const doi = lech(truoc, sau);
	khang(doi.length === 0, "dau van tay kho chung doi", doi.join(", "));
	if (a.ma !== 0) console.log(a.loi);

	const tB = ra("td-b");
	const ngoai = join(RA, `td-b-ngoai-${MA}.txt`);
	const b = phienDo(
		`echo "$APP_URL" > ${ngoai}; bun scripts/lan-do/tien-de.mjs --chay '${DO}'`,
		{ DATABASE_URL: gia.url, PHIEN_DO_TEN_CAY: cay, DO_RA: tB },
	);
	await b.xong;
	const jb = docJson(tB);
	const appNgoai = existsSync(ngoai)
		? readFileSync(ngoai, "utf8").trim()
		: null;
	khang(!b.quaTran, "tien-de long dung phien thu hai (treo cho khoa)");
	khang(b.ma === 0, "ca b: ma 0", `${b.ma}`);
	khang(
		jb?.appUrl !== undefined && jb?.appUrl === appNgoai,
		"ca b: tien-de trong phien dung APP_URL cua phien ngoai",
		`${jb?.appUrl} vs ${appNgoai}`,
	);
	khang(!/cho phien khac|chờ phiên khác/.test(b.loi), "ca b: khong cho khoa");
	if (b.ma !== 0) console.log(b.loi);

	const mau = templateDatabaseName(cay);
	if (!(await coKho(mau))) khongDo(`ca c: kho mau ${mau} khong co sau ca a`);
	const urlMau = databaseUrlCua(mau);
	const truocMau = await vanTay(urlMau);
	const tC = ra("td-c");
	const c = chay(
		`bun scripts/lan-do/tien-de.mjs --chay ${JSON.stringify(DO)}`,
		{
			DATABASE_URL: urlMau,
			PHIEN_DO_TEN_CAY: cay,
			DO_RA: tC,
		},
	);
	await c.xong;
	const jc = docJson(tC);
	khang(c.ma === 0, "ca c: ma 0", `${c.ma}`);
	khang(
		jc?.khoDb === kho,
		"ca c: kho mau khong duoc coi la kho dung-mot-lan",
		jc?.khoDb,
	);
	const sauMau = await vanTay(urlMau);
	const doiMau = lech(truocMau, sauMau);
	khang(
		doiMau.length === 0,
		"ca c: dau van tay kho mau khong doi",
		doiMau.join(", "),
	);
	if (c.ma !== 0) console.log(c.loi);
}

const CHE_DO = {
	"dau-cuoi": dauCuoi,
	"don-khi-do": donKhiDo,
	"xep-hang": xepHang,
	"tien-de": tienDe,
};

if (!CHE_DO[cheDo]) {
	console.log(
		`phien.mjs: che do la "${cheDo}" — dung ${Object.keys(CHE_DO).join(" | ")}`,
	);
	process.exit(3);
}

try {
	mayChu();
	await CHE_DO[cheDo]();
} catch (loi) {
	await donPhien();
	thoatKhongDo(loi);
} finally {
	await donPhien();
}

async function donPhien() {
	for (const ten of khoGia) await xoaKhoGia(ten);
	for (const cay of cayDaDung) {
		for (const ten of [measureDatabaseName(cay), templateDatabaseName(cay)]) {
			await dropMeasureDatabase(mayChu(), ten).catch(() => {});
		}
		rmSync(join(GOC, "apps/app", `${PHIEN_DO.khoApp}-${treeSlug(cay)}`), {
			recursive: true,
			force: true,
		});
	}
	khoGia.length = 0;
	cayDaDung.clear();
}
ketThuc(`phien ${cheDo}`);
