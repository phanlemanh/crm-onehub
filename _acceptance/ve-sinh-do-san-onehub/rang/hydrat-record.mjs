import { mkdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
	APP,
	chuanBi,
	duongDonVi,
	duongKhung,
	GOC,
	KHUNG,
	KY,
	ket,
	khongDo,
	MAN,
	mo as moKhung,
	moCuoc,
	moPhien,
	sql,
	the,
	trang,
} from "../../soan-okr-trong-khung/rang/man-chung.mjs";

const RANG = dirname(fileURLToPath(import.meta.url));
const ANH = join(GOC, ".acceptance-runs", "ve-sinh-do-san-onehub", "evidence");
const DEAL = "seed-deal-wise-1";
const LOI_HYDRAT = /hydrat/i;
const EVE_OKR = "/eve/agents/okr";
const MONG_DO = process.argv.includes("--mong-do");

const DO = {
	kho: [
		{ ten: "1440", rong: 1440, cao: 1000 },
		{ ten: "390", rong: 390, cao: 844 },
	],
	luotRecord: 5,
	luotKhongRecord: 2,
	choYenMs: 2500,
	choNganMs: 60_000,
	nguongTaiHien: 3,
	soKhongRecord: 8,
};

const lenh = `bun scripts/lan-do/tien-de.mjs --chay "bun ${relative(GOC, join(RANG, "hydrat-record.mjs"))}${MONG_DO ? " --mong-do" : ""}"`;
await moPhien(lenh);
await chuanBi("ve-sinh-hydrat");
mkdirSync(ANH, { recursive: true });

const [deal] = await sql(`SELECT name FROM "deal" WHERE id = $1`, [DEAL]);
if (!deal) await khongDo(`KHONG DO DUOC: tien de thieu thoa thuan ${DEAL}`);
const cuoc = await moCuoc();
if (cuoc.trangThai !== "dang")
	await khongDo(
		`KHONG DO DUOC: cuoc ${cuoc.id} o trang thai ${cuoc.trangThai}, can dang`,
	);

const amMay = await trang(MAN.kho[1440], "light", the.tl);
const daKhoi = await moKhung(amMay, cuoc.id);
await amMay.dong();
const [phienCuoc] = await sql(
	`SELECT "sessionId" FROM "okrCuocSoan" WHERE id = $1`,
	[cuoc.id],
);
if (!daKhoi || !phienCuoc || phienCuoc.sessionId.startsWith("cho-eve:"))
	await khongDo(
		`KHONG DO DUOC: cuoc ${cuoc.id} chua co phien eve that sau khi nguoi mo mo khung`,
	);

const slug = the.slug;
const daoDonVi = duongDonVi();
const O = {
	D1: {
		url: `${APP}/${slug}/deals?record=${encodeURIComponent(`deal:${DEAL}`)}`,
		cookie: the.qt,
		ngan: "deal",
	},
	D2: {
		url: `${daoDonVi}&record=${encodeURIComponent(`deal:${DEAL}`)}`,
		cookie: the.qt,
		ngan: "deal",
	},
	D3: { url: duongKhung(cuoc.id), cookie: the.qt, ngan: "soan", eve: "khong" },
	D4: { url: duongKhung(cuoc.id), cookie: the.tl, ngan: "soan", eve: "co" },
};

const KHONG_RECORD = [
	`${APP}/${slug}`,
	`${APP}/${slug}/deals`,
	`${APP}/${slug}/contacts`,
	`${APP}/${slug}/companies`,
	`${APP}/${slug}/okr`,
	daoDonVi,
	`${APP}/${slug}/okr/toan-canh?kyOkr=${encodeURIComponent(KY)}`,
	`${APP}/${slug}/settings/giai-doan`,
];
if (KHONG_RECORD.length !== DO.soKhongRecord) {
	console.log("KHONG DO DUOC: ma tran khong-record lech");
	await ket(2);
}

const hong = [];
const demLoi = {};
const eve = { D3: 0, D4: 0, cam403: 0 };

const cho = (ms) => new Promise((r) => setTimeout(r, ms));

async function nganDung(p, o) {
	const han = Date.now() + DO.choNganMs;
	while (Date.now() < han) {
		const kq = await p.evaluate(
			(khung, ngan, tenDeal) => {
				const k = [...document.querySelectorAll(khung)].find((x) =>
					x.checkVisibility(),
				);
				if (!k) return false;
				if (ngan === "deal") return (k.textContent ?? "").includes(tenDeal);
				const s = k.querySelector("[data-trang-soan]");
				return s !== null && s.getAttribute("data-trang-soan") !== "dang-mo";
			},
			KHUNG,
			o.ngan,
			deal.name,
		);
		if (kq) return true;
		await cho(MAN.cho.nhipMs);
	}
	return false;
}

async function trangCoNoiDung(p) {
	return p.evaluate(() => {
		const khungCho = [
			...document.querySelectorAll("[data-khung-xuong]"),
		].filter((x) => x.checkVisibility());
		const main = document.querySelector("main") ?? document.body;
		return khungCho.length === 0 && (main.textContent ?? "").trim().length > 0;
	});
}

async function mo(nhan, url, cookie, kho, luot, them) {
	const t = await trang(kho, "light", cookie);
	const yeuCau = [];
	t.p.on("request", (r) => {
		if (r.url().includes(EVE_OKR)) yeuCau.push(r.url());
	});
	const bi403 = [];
	t.p.on("response", (r) => {
		if (r.status() === 403) bi403.push(r.url());
	});
	try {
		await t.p.goto(url, { waitUntil: "load", timeout: DO.choNganMs });
		if (them) await them(t.p);
		await cho(DO.choYenMs);
		const loi = t.loi.filter((d) => LOI_HYDRAT.test(d));
		for (const d of loi)
			hong.push(`HONG ${nhan} ${kho.ten} luot ${luot}: ${d}`);
		return { loi: loi.length, yeuCau, bi403, p: t.p, dong: t.dong };
	} catch (e) {
		await t.dong();
		throw e;
	}
}

for (const [ten, o] of Object.entries(O)) {
	demLoi[ten] = 0;
	for (const kho of DO.kho) {
		const soLuot = DO.luotRecord;
		for (let luot = 1; luot <= soLuot; luot += 1) {
			let nganOk = false;
			let coNoiDung = false;
			const r = await mo(ten, o.url, o.cookie, kho, luot, async (p) => {
				nganOk = await nganDung(p, o);
				coNoiDung = await trangCoNoiDung(p);
			});
			demLoi[ten] += r.loi;
			if (!MONG_DO) {
				if (!nganOk)
					hong.push(
						`HONG ${ten} ${kho.ten} luot ${luot}: ngan khong mo dung ban ghi`,
					);
				if (!coNoiDung)
					hong.push(
						`HONG ${ten} ${kho.ten} luot ${luot}: trang duoi khong co noi dung`,
					);
				const eveOkr = r.yeuCau.length;
				const cam = r.bi403.filter((u) => u.includes(EVE_OKR)).length;
				eve.cam403 += cam;
				if (o.eve === "khong") {
					eve.D3 += eveOkr;
					if (eveOkr > 0 || r.bi403.length > 0)
						hong.push(
							`HONG D3 ${kho.ten} luot ${luot}: goi luong cuoc nguoi khac (${eveOkr} yeu cau, ${r.bi403.length} phan hoi 403)`,
						);
				}
				if (o.eve === "co") {
					eve.D4 += eveOkr;
					if (eveOkr === 0 || cam > 0)
						hong.push(
							`HONG D4 ${kho.ten} luot ${luot}: nguoi mo khong tai luong (${eveOkr} yeu cau, ${cam} phan hoi 403)`,
						);
				}
				if (luot === soLuot) {
					const duong = join(ANH, `${ten}-${kho.ten}.png`);
					await r.p.screenshot({ path: duong });
					console.log(`anh ${relative(GOC, duong)}`);
				}
			}
			await r.dong();
		}
	}
}

const tong = Object.values(demLoi).reduce((a, b) => a + b, 0);

if (MONG_DO) {
	const taiHien = [];
	for (const [ten, k] of Object.entries(demLoi)) {
		const n = DO.kho.length * DO.luotRecord;
		const nhan =
			k >= DO.nguongTaiHien
				? "tai hien"
				: k > 0
					? "tai hien yeu"
					: "khong tai hien";
		if (k >= DO.nguongTaiHien) taiHien.push(ten);
		console.log(`O ${ten}: ${k}/${n} loi hydrat — ${nhan}`);
	}
	for (const d of hong) console.log(d);
	console.log(`MONG DO: k=${tong} tai-hien=${taiHien.join(",") || "-"}`);
	await ket(taiHien.length > 0 ? 0 : 1);
}

let khongRecord = 0;
let loiKhongRecord = 0;
for (const url of KHONG_RECORD) {
	for (const kho of DO.kho) {
		for (let luot = 1; luot <= DO.luotKhongRecord; luot += 1) {
			const duong = new URL(url).pathname;
			const r = await mo(`K ${duong}`, url, the.qt, kho, luot);
			khongRecord += 1;
			loiKhongRecord += r.loi;
			await r.dong();
		}
	}
}

const soLan = Object.keys(O).length * DO.kho.length * DO.luotRecord;
for (const d of hong) console.log(d);
console.log(`D3: ${eve.D3} yeu cau ${EVE_OKR}`);
console.log(`D4: ${eve.D4} yeu cau ${EVE_OKR}, ${eve.cam403} phan hoi 403`);
console.log(`hydrat-record: ${soLan} lan mo, ${tong} loi hydrat`);
console.log(
	`khong-record: ${khongRecord} lan mo, ${loiKhongRecord} loi hydrat`,
);
await ket(hong.length > 0 ? 1 : 0);
