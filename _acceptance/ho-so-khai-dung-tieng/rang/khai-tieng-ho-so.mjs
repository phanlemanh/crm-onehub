import { execFileSync } from "node:child_process";
import {
	closeSync,
	existsSync,
	mkdirSync,
	openSync,
	readFileSync,
	renameSync,
	statSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { db } from "../../../packages/db/src/client.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import { dat } from "./du-lieu-thu.mjs";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const MIEN_APP = new URL(APP).hostname;
const CHO_TAI = Number(process.env.CHO_TAI ?? 120000);
const CHO_HIEN = Number(process.env.CHO_HIEN ?? 20000);
const NGUOI = process.env.NGUOI ?? "manh.phan@onemount.com";

const chan = process.argv[2] ?? "gioi-thieu";

let donVatThu = null;
let dongTrinhDuyet = null;

async function thoat(ma, ...dong) {
	for (const d of dong) console.log(d);
	if (dongTrinhDuyet) {
		try {
			await dongTrinhDuyet();
		} catch {}
	}
	if (donVatThu) {
		try {
			await donVatThu();
			console.log("-- DA DON vat thu");
		} catch (loi) {
			console.log(`   CANH BAO: khong don duoc vat thu — ${loi.message}`);
		}
	}
	process.exit(ma);
}

const cay = await canhCay();
for (const d of cay.dong) console.log(d);
if (cay.ket !== "dung-cay") {
	await thoat(
		2,
		`RANG CUN: dau moc khong ve qua ${APP} — dang do MOT CAY KHAC.`,
		`   Cay dang xet: ${GOC}`,
		"   Khong doc mot con so nao tren may chu do.",
	);
}
console.log(`-- CANH CAY: dau moc ve tu cay dang xet (${APP})`);

function phien() {
	const raw = execFileSync("bun", ["run", "dev:session", NGUOI], {
		cwd: join(GOC, "apps/api"),
		encoding: "utf8",
	});
	const line = raw.trim().split("\n").pop().trim();
	const eq = line.indexOf("=");
	return { name: line.slice(0, eq), value: line.slice(eq + 1) };
}

const HO_SO = '[data-slot="sheet-content"]';

async function goiMayChu(duong, dauVao) {
	const url = `${API}/api/trpc/${duong}?input=${encodeURIComponent(JSON.stringify(dauVao))}`;
	const res = await fetch(url, {
		headers: { Cookie: `${cookie.name}=${cookie.value}` },
	});
	if (!res.ok) {
		return thoat(
			2,
			`RANG CUN: ${duong} tra ${res.status} — may chu API song nhung tu choi lenh nay.`,
		);
	}
	return (await res.json()).result.data;
}

const DOC_VUNG = ({ canTim, goc }) => {
	const khung = [...document.querySelectorAll(goc)];
	if (khung.length === 0) return null;
	const ra = [];
	const nut = [];
	for (const k of khung) {
		const di = document.createTreeWalker(k, NodeFilter.SHOW_TEXT);
		for (let n = di.nextNode(); n; n = di.nextNode()) nut.push(n);
	}
	for (const n of nut) {
		const t = n.nodeValue.replace(/\s+/g, " ").trim();
		if (t === "") continue;
		const el = n.parentElement;
		if (!el || el.closest("script,style,noscript,template")) continue;
		const r = el.getBoundingClientRect();
		if (r.width === 0 || r.height === 0) continue;

		for (const gt of canTim) {
			const moc = gt.slice(0, 40);
			if (!t.includes(moc)) continue;
			const vung = el.closest('[lang="en"]');
			const trong = vung ? [...vung.querySelectorAll("[lang]")] : [];
			ra.push({
				gia_tri: gt.slice(0, 60),
				boc: vung !== null,
				the: el.tagName,
				so_phan_tu_khai: vung ? 1 + trong.length : 0,
				duong_the: vung ? [vung.tagName, ...trong.map((x) => x.tagName)] : [],
			});
		}
	}
	return ra;
};

const DEM_RONG = (goc) => {
	const khung = [...document.querySelectorAll(goc)];
	if (khung.length === 0) return null;
	return khung
		.flatMap((k) => [...k.querySelectorAll('[lang="en"]')])
		.filter((el) => (el.textContent ?? "").trim() === "").length;
};

function ghiVung(ten, muc) {
	if (!Array.isArray(muc.tieng_viet_lot)) {
		throw new Error(
			`BAN KHAI LECH BAN THAT: muc "${ten}" cua vung-khai.json thieu khoa\n` +
				"   tieng_viet_lot. Eval hoi dong E11 bao cham khoa nay o MOI muc, nen mot muc\n" +
				"   thieu no la hoi dong duoc bao doc mot thu khong ai ghi ra.\n" +
				"   Mot mang rong DAT SAN cung khong duoc: chua-do va khong-lot la hai chuyen\n" +
				"   khac nhau, va chi mot trong hai la ket qua do.",
		);
	}
	const thu_muc = join(GOC, "_acceptance/ho-so-khai-dung-tieng/evidence");
	if (!existsSync(thu_muc)) mkdirSync(thu_muc, { recursive: true });
	const tep = join(thu_muc, "vung-khai.json");
	const khoa = `${tep}.khoa`;

	// Doc-sua-ghi tren mot tep DUNG CHUNG. temp+rename chi lam MOT lan ghi nguyen
	// tu; no khong lam ca chuoi doc->sua->ghi nguyen tu. Bay executor hskt_* cung
	// ghi vao tep nay, moi cai mot khoa khac nhau: hai lan doc cung trang thai roi
	// lan rename sau thang la MAT mot muc, khong tien trinh nao bao loi. Khoa nay
	// giu trong mili giay, khong phai khoa tuan tu ca chan do.
	const den = Date.now() + 60_000;
	for (;;) {
		try {
			closeSync(openSync(khoa, "wx"));
			break;
		} catch (loi) {
			if (loi.code !== "EEXIST") throw loi;
			let qua = false;
			try {
				qua = Date.now() - statSync(khoa).mtimeMs > 30_000;
			} catch {
				continue;
			}
			if (qua) {
				unlinkSync(khoa);
				continue;
			}
			if (Date.now() > den) {
				throw new Error(
					`KHONG GHI DUOC BANG CHUNG: doi khoa ${khoa} qua 60 giay.\n` +
						"   Mot luot chay khac dang ghi vung-khai.json va chua nha khoa.",
				);
			}
			execFileSync("sleep", ["0.05"]);
		}
	}
	try {
		const cu = existsSync(tep) ? JSON.parse(readFileSync(tep, "utf8")) : {};
		cu[ten] = muc;
		const tam = `${tep}.${process.pid}.tam`;
		try {
			writeFileSync(tam, `${JSON.stringify(cu, null, 2)}\n`);
			renameSync(tam, tep);
		} finally {
			if (existsSync(tam)) unlinkSync(tam);
		}
	} finally {
		try {
			unlinkSync(khoa);
		} catch {}
	}
	console.log(`-- BANG CHUNG: ghi muc "${ten}" vao evidence/vung-khai.json`);
}

async function nhanGiaiDoan(ma) {
	const kichBan = `
import { dealStageLabel } from "./lib/deal-stage";
const ma = ${JSON.stringify(ma)};
console.log(JSON.stringify(Object.fromEntries(ma.map((m) => [m, dealStageLabel(m)]))));
`;
	let ra;
	try {
		ra = execFileSync("bun", ["-e", kichBan], {
			cwd: join(GOC, "apps/app"),
			encoding: "utf8",
		});
	} catch (loi) {
		return thoat(
			2,
			"KHONG DO DUOC: khong goi duoc dealStageLabel cua san pham — " +
				String(loi.stderr ?? loi.message).slice(0, 300),
		);
	}
	return JSON.parse(ra.trim().split("\n").pop());
}

const vung = await dat();
donVatThu = vung.don;
process.on("uncaughtException", async (loi) => {
	console.log(`RANG CUN: nem ra ngoai — ${loi.message}`);
	await thoat(2);
});
process.on("unhandledRejection", async (loi) => {
	console.log(`RANG CUN: loi bat dong bo — ${loi?.message ?? loi}`);
	await thoat(2);
});
const khongGian = await db.organization.findFirst({
	orderBy: { createdAt: "asc" },
});
if (!khongGian) {
	await thoat(2, "KHONG DO DUOC: khong co khong gian lam viec nao");
}

const cookie = phien();
const browser = await puppeteer.launch({
	executablePath: CHROME,
	headless: "new",
	args: ["--no-sandbox"],
});
dongTrinhDuyet = () => browser.close();

async function bamTab(page, nhan) {
	const co = await page
		.waitForFunction(
			(n) => {
				const k = document.querySelector('[data-slot="sheet-content"]');
				if (!k) return false;
				return [...k.querySelectorAll('[role="tab"]')].some(
					(b) => (b.textContent ?? "").trim().toLowerCase() === n.toLowerCase(),
				);
			},
			{ timeout: CHO_HIEN },
			nhan,
		)
		.then(() => true)
		.catch(() => false);
	if (!co) return false;
	const nut = await page.evaluateHandle((n) => {
		const k = document.querySelector('[data-slot="sheet-content"]');
		if (!k) return null;
		return (
			[...k.querySelectorAll('[role="tab"]')].find(
				(b) => (b.textContent ?? "").trim().toLowerCase() === n.toLowerCase(),
			) ?? null
		);
	}, nhan);
	const el = nut.asElement();
	if (!el) return false;
	await el.click();
	return true;
}

async function xem(duong, canTim, tab, gocRieng) {
	const page = await browser.newPage();
	await page.setViewport({ width: 1440, height: 1000 });
	await browser.setCookie(
		{ name: cookie.name, value: cookie.value, domain: MIEN_APP, path: "/" },
		{ name: "lang", value: "vi", domain: MIEN_APP, path: "/" },
	);
	const url = `${APP}/${khongGian.slug}/${duong}`;
	console.log(`-- MO MAN: ${url}`);
	await page.goto(url, { waitUntil: "load", timeout: CHO_TAI });
	await page
		.waitForFunction(() => document.documentElement.lang !== "", {
			timeout: CHO_TAI,
		})
		.catch(() => null);

	const tiengTrang = await page.evaluate(() => document.documentElement.lang);
	if (tiengTrang !== "vi") {
		await thoat(
			2,
			`RANG CUN: trang khong o lang=vi (doc duoc: ${JSON.stringify(tiengTrang)})`,
			"   Day la tien de thieu, KHONG phai chan do do.",
		);
	}

	async function choHien(bo_chon, khi) {
		const hien = await page
			.waitForSelector(bo_chon, { timeout: CHO_HIEN })
			.then(() => true)
			.catch(() => false);
		if (hien) return;
		const cuoi = page.url();
		await page.close();
		await thoat(
			2,
			`RANG CUN: cho ${CHO_HIEN}ms ${khi} ma khong thay ${bo_chon} tren ${url}.`,
			`   URL mo man: ${url}`,
			`   URL cuoi  : ${cuoi}`,
			"   Hai URL khac nhau thi doc ky: /crm/<loai>/<id> VON chuyen huong sang",
			"   /crm/<loai>?record=<loai>:<id>, do la binh thuong; con bi day sang",
			"   /onboarding/... la csdl chua co khoa nghien cuu.",
			"   KHONG doc con so nao: bang danh sach phia duoi da khai dung tu vong truoc,",
			"   nen do ca trang se bao xanh nho dung cho no khong do.",
		);
	}

	await choHien(HO_SO, "tam ho so mo ra");
	await page
		.waitForNetworkIdle({ idleTime: 500, timeout: CHO_HIEN })
		.catch(() => null);

	if (tab) {
		const bam = await bamTab(page, tab);
		if (!bam) {
			await page.close();
			await thoat(
				2,
				`RANG CUN: khong bam duoc tab ${JSON.stringify(tab)} tren ${url}.`,
				"   Tien de thieu — khong doc con so nao.",
			);
		}
		console.log(`-- DA BAM TAB: ${JSON.stringify(tab)}`);
	}

	const goc = gocRieng ?? HO_SO;
	if (goc !== HO_SO) {
		await choHien(goc, `sau khi bam tab ${JSON.stringify(tab ?? "")}`);
	}
	const thay = await page.evaluate(DOC_VUNG, { canTim, goc });
	const rong = await page.evaluate(DEM_RONG, goc);
	if (thay === null || rong === null) {
		await page.close();
		await thoat(
			2,
			`RANG CUN: khong thay vung can do tren ${url} (bo chon ${goc}).`,
			"   Man danh sach van ve, nhung tam ho so thi khong — day la tien de thieu.",
			"   KHONG doc con so nao: bang danh sach phia duoi da khai dung tu vong truoc,",
			"   nen do ca trang se bao xanh nho dung cho no khong do.",
		);
	}
	const chu = await page.evaluate(
		(g) => [...document.querySelectorAll(g)].map((k) => k.innerText).join("\n"),
		goc,
	);
	const viet = await page.evaluate((g) => {
		const dau =
			/[ăâđêôơưĂÂĐÊÔƠƯáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/;
		const lot = [];
		for (const k of document.querySelectorAll(g)) {
			const di = document.createTreeWalker(k, NodeFilter.SHOW_TEXT);
			for (let n = di.nextNode(); n; n = di.nextNode()) {
				const t = n.nodeValue.replace(/\s+/g, " ").trim();
				if (t === "" || !dau.test(t)) continue;
				if (n.parentElement?.closest('[lang="en"]')) lot.push(t.slice(0, 60));
			}
		}
		return lot;
	}, goc);
	await page.close();
	return { thay, rong, chu, url, viet };
}

function bao(ten, canTim, thay, mongBoc, viet) {
	let hong = 0;
	const muc = [];
	for (const gt of canTim) {
		const cho = thay.filter((x) => x.gia_tri === gt.slice(0, 60));
		if (cho.length === 0) {
			console.log(
				`   KHONG THAY TREN MAN [khong-thay:${ten}]: ${JSON.stringify(gt.slice(0, 60))}`,
			);
			hong += 1;
			continue;
		}
		const lech = cho.filter((x) => x.boc !== mongBoc);
		hong += lech.length;
		console.log(
			`   ${lech.length === 0 ? "dat    " : `KHONG DAT [lech-boc:${ten}]`} ${JSON.stringify(gt.slice(0, 48))} — ${cho.length} cho, lech ${lech.length}`,
		);
		muc.push(...cho);
	}
	ghiVung(ten, { mong_boc: mongBoc, cho: muc, tieng_viet_lot: viet });
	hong += viet.length;
	for (const v of viet) {
		console.log(`   [tieng-viet-lot] ${JSON.stringify(v)}`);
	}
	return hong;
}

let hong = 0;

if (chan === "gioi-thieu") {
	const tuMayChu = await goiMayChu("companies.byId", { id: vung.congTy.id });
	const gt = tuMayChu?.description;
	if (!gt) {
		await thoat(2, "KHONG DO DUOC: may chu khong tra ve truong gioi thieu");
	}
	console.log(
		`-- DAN SO: gioi thieu DOC TU MAY CHU trong chinh luot chay nay (companies.byId)\n` +
			`   cong ty ${JSON.stringify(tuMayChu.name)} · ${gt.length} ky tu`,
	);
	const { thay, viet } = await xem(`companies/${vung.congTy.id}`, [gt]);
	hong = bao(chan, [gt], thay, true, viet);
} else if (chan === "tom-tat-lien-he") {
	const tuMayChu = await goiMayChu("contacts.byId", { id: vung.caNhan.id });
	const gt = tuMayChu?.brief?.narrative;
	if (!gt) {
		await thoat(2, "KHONG DO DUOC: may chu khong tra ve tom tat cua ca nhan");
	}
	console.log(
		`-- DAN SO: tom tat DOC TU MAY CHU trong chinh luot chay nay (contacts.byId) · ${gt.length} ky tu`,
	);
	const { thay, viet } = await xem(`contacts/${vung.caNhan.id}`, [gt]);
	hong = bao(chan, [gt], thay, true, viet);
} else if (chan === "nganh") {
	const tuMayChu = await goiMayChu("companies.byId", { id: vung.congTy.id });
	const nganh = tuMayChu?.industry;
	if (!nganh) {
		await thoat(2, "KHONG DO DUOC: may chu khong tra ve truong nganh");
	}
	console.log(
		`-- DAN SO: nganh ${JSON.stringify(nganh)} DOC TU MAY CHU (companies.byId)`,
	);
	const { thay, viet } = await xem(`companies/${vung.congTy.id}`, [nganh]);
	hong = bao(chan, [nganh], thay, true, viet);
} else if (chan === "dong-thoi-gian") {
	const nhan = await nhanGiaiDoan([
		vung.doiGiaiDoan.meta.from,
		vung.doiGiaiDoan.meta.to,
	]);
	const canTim = [
		nhan[vung.doiGiaiDoan.meta.from],
		nhan[vung.doiGiaiDoan.meta.to],
	];
	console.log(
		"-- DAN SO: hai nhan giai doan lay tu dealStageLabel() CUA SAN PHAM:\n" +
			`     ${vung.doiGiaiDoan.meta.from} -> ${JSON.stringify(canTim[0])}\n` +
			`     ${vung.doiGiaiDoan.meta.to} -> ${JSON.stringify(canTim[1])}`,
	);
	console.log(
		"-- KHOANH VUNG: chi doc trong [data-slot=timeline], KHONG doc ca tam ho so.\n" +
			"   Thanh giai doan o dau ho so cung mang chinh hai nhan nay va DA khai dung tu\n" +
			"   vong truoc — do ca tam ho so la bao xanh nho dung cho no khong do.",
	);
	const { thay, viet } = await xem(
		`deals/${vung.doiGiaiDoan.dealId}`,
		canTim,
		"Hoạt động",
		'[data-slot="timeline"]',
	);
	hong = bao(chan, canTim, thay, true, viet);
} else if (chan === "khong-khai-thua") {
	const ct = await goiMayChu("companies.byId", { id: vung.congTy.id });
	const dia = [ct?.city, ct?.stateCode, ct?.country].filter(Boolean).join(", ");
	const canTim = [ct?.name, dia].filter(Boolean);
	if (canTim.length < 2) {
		await thoat(
			2,
			"KHONG DO DUOC: may chu khong tra ve ten cong ty hoac dia danh",
		);
	}
	console.log("-- Cac gia tri chieu nguoc DOC TU MAY CHU (companies.byId)");
	console.log(
		`-- DAN SO (chieu nguoc): ${canTim.map((x) => JSON.stringify(x)).join(" · ")}`,
	);
	const { thay, viet } = await xem(`companies/${vung.congTy.id}`, canTim);
	hong = bao(chan, canTim, thay, false, viet);

	const cn = await goiMayChu("contacts.byId", { id: vung.caNhan.id });
	const chucDanh = cn?.title;
	if (!chucDanh) {
		await thoat(2, "KHONG DO DUOC: may chu khong tra ve chuc danh");
	}
	console.log(
		`-- DAN SO (chieu nguoc, chuc danh): ${JSON.stringify(chucDanh)}`,
	);
	const r = await xem(`contacts/${vung.caNhan.id}`, [chucDanh]);
	hong += bao(`${chan}-chuc-danh`, [chucDanh], r.thay, false, r.viet);
} else if (chan === "ho-so-trong") {
	const TIEU_DE = process.env.NHAN_GIOI_THIEU ?? "Giới thiệu";

	console.log(
		"-- So khop KHONG phan biet hoa-thuong: tieu de khoi ve ra chu hoa bang\n" +
			"   text-transform, va innerText tra ve dung chu da bien doi.\n" +
			"-- AC-8 co HAI ve, chan nay do CA HAI:\n" +
			"   (a) khoi Gioi thieu VANG HAN khoi cay DOM — khong phai ve ra roi an bang CSS;\n" +
			"   (b) 0 phan tu khai lang=en co noi dung chu RONG.\n" +
			"-- Va mot DOI CHUNG DUONG: cung phep do tren mot cong ty CO gioi thieu phai\n" +
			"   THAY khoi do — neu khong, phep do chi dang khang dinh mot cai no khong biet tim.",
	);

	const co = (chu) =>
		chu.toLocaleLowerCase("vi").includes(TIEU_DE.toLocaleLowerCase("vi"));

	const trong = await xem(`companies/${vung.trong.id}`, []);
	const coKhoiTrong = co(trong.chu);
	console.log(
		`   (a) ho so CHUA enrichment: khoi ${JSON.stringify(TIEU_DE)} ${coKhoiTrong ? "VAN CO (sai)" : "vang han"}`,
	);
	if (coKhoiTrong) hong += 1;
	console.log(
		`   (b) so phan tu khai lang=en co noi dung RONG: ${trong.rong}` +
			(trong.rong > 0 ? ` [phan-tu-rong-dem-duoc:${trong.rong}]` : ""),
	);
	if (trong.rong > 0) hong += trong.rong;

	const day = await xem(`companies/${vung.congTy.id}`, []);
	const coKhoiDay = co(day.chu);
	console.log(
		`   doi chung duong: ho so CO gioi thieu — khoi ${JSON.stringify(TIEU_DE)} ${coKhoiDay ? "co mat" : "KHONG THAY (phep do khong biet tim khoi nay)"}`,
	);
	if (!coKhoiDay) {
		console.log(
			"      Thieu doi chung duong thi ve (a) la khang dinh AM TINH MOT MINH:\n" +
				"      no xanh ca khi bo chon sai, khi trang khong tai, khi nhan doi ten.",
		);
		hong += 1;
	}

	ghiVung(chan, {
		tieu_de_khoi: TIEU_DE,
		ho_so_trong: { co_khoi: coKhoiTrong, so_phan_tu_rong: trong.rong },
		doi_chung_duong: { co_khoi: coKhoiDay },
		tieng_viet_lot: [...trong.viet, ...day.viet],
	});
} else if (chan === "tieng-trang") {
	const r = await xem(`companies/${vung.congTy.id}`, []);
	console.log("   tieng cua trang: vi (da khang dinh trong xem())");
	const viet = await (async () => {
		const page = await browser.newPage();
		await page.goto(r.url, {
			waitUntil: "load",
			timeout: CHO_TAI,
		});
		await page.waitForSelector(HO_SO, { timeout: CHO_HIEN }).catch(() => null);
		const ra = await page.evaluate(() => {
			const di = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
			const dau =
				/[ăâđêôơưĂÂĐÊÔƠƯáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/;
			const lot = [];
			for (let n = di.nextNode(); n; n = di.nextNode()) {
				const t = n.nodeValue.replace(/\s+/g, " ").trim();
				if (t === "" || !dau.test(t)) continue;
				if (n.parentElement?.closest('[lang="en"]')) lot.push(t.slice(0, 60));
			}
			return lot;
		});
		await page.close();
		return ra;
	})();
	console.log(
		`   chuoi tieng Viet lot vao trong pham vi lang=en: ${viet.length}`,
	);
	for (const v of viet)
		console.log(`     [tieng-viet-lot] ${JSON.stringify(v)}`);
	hong += viet.length;
	ghiVung(chan, { tieng_trang: "vi", tieng_viet_lot: viet });
} else {
	await thoat(2, `KHONG DO DUOC: khong biet chan ${JSON.stringify(chan)}`);
}

await browser.close();
dongTrinhDuyet = null;
await vung.don();
donVatThu = null;
console.log("-- DA DON vat thu");
console.log(`ket qua: chan=${chan} · cho lech=${hong}`);
process.exit(hong > 0 ? 1 : 0);
