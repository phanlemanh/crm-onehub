import { readdirSync } from "node:fs";
import puppeteer from "puppeteer-core";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GOC } from "../../man-cai-dat-noi-tieng-viet/rang/lat.mjs";
import { giuDoc } from "../../man-cai-dat-noi-tieng-viet/rang/khoa-cay.mjs";
import {
	canhCong,
	datTrinhDuyet,
	docKhai,
	doRongMan,
	gomTrang,
	ket,
	khongDo,
	moManMem,
	phien,
	soCap,
	suySlug,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";

await giuDoc();

const HERE = dirname(fileURLToPath(import.meta.url));
const THU_MUC = "apps/app/app/(app)/[slug]/(agent-builder)";
const RONG = 1280;
const CAO = 900;
const CHROME =
	"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const HEP = Number(process.env.BE_RONG_HEP ?? 360);

function sinhRoute() {
	const ra = [];
	const di = (thuMuc, duoi) => {
		for (const m of readdirSync(thuMuc, { withFileTypes: true })) {
			if (m.isDirectory()) {
				const ten = m.name.startsWith("(") ? duoi : `${duoi}/${m.name}`;
				di(join(thuMuc, m.name), ten);
			} else if (m.name === "page.tsx" && duoi !== "") ra.push(duoi);
		}
	};
	di(join(GOC, THU_MUC), "");
	return ra.sort();
}

function routeCanVat() {
	const k = docKhai(`${HERE}/route-cua-lat.json`, "route-cua-lat");
	return new Map((k.can_vat ?? []).map((x) => [x.route, x]));
}

function chiaRoute() {
	const het = sinhRoute();
	const canVat = routeCanVat();
	const chuaChot = [];
	const doDuoc = [];
	for (const r of het) {
		const v = canVat.get(r);
		if (v === undefined) doDuoc.push(r);
		else chuaChot.push(v);
	}
	return { het, doDuoc, chuaChot };
}

function inChuaChot(chuaChot) {
	if (chuaChot.length === 0) return;
	console.log(
		`\nCHUA DO DUOC — ${chuaChot.length} route can mot ban ghi that ma cach gieo CHUA CHOT:`,
	);
	for (const v of chuaChot)
		console.log(`   ${v.route} — can ${v.vat}. ${v.cach_gieo}`);
}

function ngoaiLat() {
	const b = docKhai(`${HERE}/khong-dich-cua-lat.json`, "khong-dich-cua-lat");
	const ra = new Map();
	for (const k of b.ngoai_lat?.khoi ?? [])
		for (const c of k.chuoi) ra.set(c, k);
	for (const c of b.ngoai_lat?.mien_dau ?? [])
		ra.set(c, { file: "(dau phan cach)", vi_sao: "ky tu phan cach, khong phai chu" });
	return ra;
}

async function chanHaiTieng(cookie, slug) {
	const { het, doDuoc, chuaChot } = chiaRoute();
	const ngoai = ngoaiLat();
	const thayNgoai = new Set();
	let hong = 0;
	let capTong = 0;
	const tuChoi = [];
	for (const man of doDuoc) {
		const lay = async (tieng) => {
			const mo = await moManMem(cookie, slug, man, tieng, RONG);
			if (mo.loi !== null) {
				await mo.trang.close();
				return null;
			}
			const gia = await gomTrang(mo.trang);
			await mo.trang.close();
			return gia;
		};
		const vi = await lay("vi");
		const en = await lay("en");
		if (vi === null || en === null) {
			tuChoi.push(man);
			console.log(`\n-- man ${man}: TU CHOI DO`);
			continue;
		}
		if (vi.length === 0) {
			console.log(
				`KHONG DO DUOC: man ${man} gom ra 0 chuoi. Tap quan sat rong khong bao gio la dat.`,
			);
			await ket(2);
		}
		const k = soCap(vi, en, () => null);
		capTong += k.soCap;
		console.log(
			`\n-- man ${man} · vi=${vi.length} en=${en.length} · cap doi chieu=${k.soCap}`,
		);
		for (const o of k.lech)
			console.log(`   VE 1 HONG: lech duong DOM o cap ${o.so} — ${o.vi} vs ${o.en}`);
		for (const o of k.trung) {
			const n = ngoai.get(o.chu);
			if (n !== undefined) {
				thayNgoai.add(o.chu);
				continue;
			}
			console.log(`   VE 2 HONG: hai luot y het — ${JSON.stringify(o.chu)}`);
			hong += 1;
		}
		for (const o of k.khongDau)
			console.log(`   VE 3 HONG: luot vi khong mang dau — ${JSON.stringify(o.chu)}`);
		hong += k.lech.length + k.khongDau.length;
	}
	const chet = [...ngoai.keys()].filter((c) => !thayNgoai.has(c));
	console.log(
		`\nngoai lat (gioi han da khai): ${thayNgoai.size} chuoi sinh tu file hoan sang dot hai — day la GIOI HAN, khong phai da dich.`,
	);
	for (const c of chet)
		console.log(
			`   NGOAI LAT CHET: ${JSON.stringify(c)} khai ngoai lat ma khong con ve ra tren man nao — go no khoi ban khai.`,
		);
	inChuaChot(chuaChot);
	console.log(
		`\nket qua: route do duoc ${doDuoc.length}/${het.length} (thu muc sinh ra ${het.length}, chua chot cach gieo ${chuaChot.length}) · ${capTong} cap doi chieu · ngoai lat=${thayNgoai.size} · hong=${hong} · tu choi do=${tuChoi.length}`,
	);
	if (hong > 0 || chet.length > 0) await ket(1);
	if (tuChoi.length > 0) await ket(2);
	if (chuaChot.length > 0) {
		console.log(
			"KHONG DO DUOC: con route chua chot cach gieo — hop dong doi danh sach do RONG, nen day chua phai mot lat da do het.",
		);
		await ket(2);
	}
	await ket(0);
}

async function chanKhongDich(cookie, slug) {
	const bang = docKhai(`${HERE}/khong-dich-cua-lat.json`, "khong-dich-cua-lat");
	const { doDuoc, chuaChot } = chiaRoute();
	const thay = new Map();
	for (const man of doDuoc)
		for (const tieng of ["vi", "en"]) {
			const mo = await moManMem(cookie, slug, man, tieng, RONG);
			if (mo.loi !== null) {
				await mo.trang.close();
				console.log(`KHONG DO DUOC: ${man} (${tieng}) — ${mo.loi[0]}`);
				await ket(2);
			}
			const gia = (await gomTrang(mo.trang)) ?? [];
			await mo.trang.close();
			for (const g of gia) {
				const cu = thay.get(g.chu) ?? { vi: null, en: null };
				cu[tieng] = g.chu;
				thay.set(g.chu, cu);
			}
		}
	const thieu = [];
	const lech = [];
	for (const d of bang.dong) {
		const o = thay.get(d.gia_tri);
		if (o === undefined) {
			thieu.push(`${d.gia_tri} (${d.luat}) khai trong bang ma khong man nao ve ra`);
			continue;
		}
		if (o.vi !== null && o.en !== null && o.vi !== o.en)
			lech.push(`${d.gia_tri} khac nhau giua hai luot: vi=${o.vi} en=${o.en}`);
	}
	inChuaChot(chuaChot);
	console.log(
		`\nket qua: ${bang.dong.length} dong bang · so gia tri hai luot=${bang.dong.length - thieu.length} · thieu=${thieu.length} · lech gia tri=${lech.length}`,
	);
	for (const d of thieu) console.log(`   THIEU: ${d}`);
	for (const d of lech) console.log(`   LECH GIA TRI: ${d}`);
	if (lech.length > 0) await ket(1);
	if (thieu.length > 0) await ket(2);
	if (bang.dong.length === 0) {
		console.log("KHONG DO DUOC: bang khong-dich rong. Tap quan sat rong khong bao gio la dat.");
		await ket(2);
	}
	await ket(0);
}

async function chanBeRong(cookie, slug) {
	const { doDuoc, chuaChot } = chiaRoute();
	let nhan = 0;
	let viTran = 0;
	let caHai = 0;
	for (const man of doDuoc) {
		const vi = await doRongMan(cookie, slug, man, "vi", HEP);
		const en = await doRongMan(cookie, slug, man, "en", HEP);
		if (vi === null || en === null) {
			console.log(`\n-- man ${man} o ${HEP}px: TU CHOI DO`);
			continue;
		}
		const cap = [...vi.keys()].filter((k) => {
			const b = en.get(k);
			return b !== undefined && b.chu !== vi.get(k).chu;
		});
		nhan += cap.length;
		console.log(`\n-- man ${man} o ${HEP}px · nhan dich duoc=${cap.length}`);
		for (const k of cap) {
			const a = vi.get(k);
			const b = en.get(k);
			const ta = a.scrollWidth > a.clientWidth;
			const tb = b.scrollWidth > b.clientWidth;
			if (ta && tb) {
				caHai += 1;
				console.log(
					`   TRAN CA HAI LUOT: ${JSON.stringify(a.chu)} — vi ${a.scrollWidth}/${a.clientWidth}px · en ${b.scrollWidth}/${b.clientWidth}px`,
				);
			} else if (ta) {
				viTran += 1;
				console.log(
					`   TRAN: ${JSON.stringify(a.chu)} — vi ${a.scrollWidth}/${a.clientWidth}px · doi chung en vua`,
				);
			}
		}
	}
	inChuaChot(chuaChot);
	console.log(
		`\nket qua ${HEP}px: ${nhan} nhan dich duoc · vi tran ma en vua=${viTran} · tran ca hai luot=${caHai}`,
	);
	if (nhan === 0) {
		console.log("KHONG DO DUOC: 0 nhan dich duoc. Tap quan sat rong khong bao gio la dat.");
		await ket(2);
	}
	if (viTran + caHai > 0) await ket(1);
	await ket(0);
}

function chanDuLieuNguoiNhap() {
	const bang = docKhai(`${HERE}/du-lieu-nguoi-nhap.json`, "du-lieu-nguoi-nhap");
	const khongDoDuoc = [];
	for (const o of bang.o)
		if (o.gieo_duoc !== true && o.do_san_duoc !== true)
			khongDoDuoc.push(`${o.truong} o ${o.file.split("/").pop()} — ${o.vi_sao_san ?? o.vi_sao}`);
	console.log(`bang du lieu nguoi nhap: ${bang.o.length} o`);
	for (const d of khongDoDuoc) console.log(`   KHONG DO DUOC: ${d}`);
	if (khongDoDuoc.length === bang.o.length) {
		console.log(
			"KHONG DO DUOC: khong o nao do duoc tren may nay — cach gieo vat that chua chot. Tap quan sat rong khong bao gio la dat.",
		);
		process.exit(2);
	}
	console.log(`XANH: ${bang.o.length - khongDoDuoc.length} o do duoc.`);
	process.exit(0);
}

const chan = process.argv[2];
if (chan === "du-lieu-nguoi-nhap") chanDuLieuNguoiNhap();

const cookie = phien();
const slug = await suySlug(cookie);
await canhCong(cookie, slug);

datTrinhDuyet(
	await puppeteer.launch({
		executablePath: CHROME,
		headless: "new",
		args: ["--no-sandbox", `--window-size=${RONG},${CAO}`],
	}),
);

if (chan === "hai-tieng") await chanHaiTieng(cookie, slug);
else if (chan === "khong-dich") await chanKhongDich(cookie, slug);
else if (chan === "be-rong") await chanBeRong(cookie, slug);
else {
	console.log(`KHONG DO DUOC: chua biet chan ${JSON.stringify(chan)}.`);
	process.exit(2);
}
