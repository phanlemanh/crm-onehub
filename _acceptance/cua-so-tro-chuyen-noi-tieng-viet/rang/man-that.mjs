import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import {
	APP,
	canhCong,
	datTrinhDuyet,
	docKhai,
	ket,
	mu,
	phien,
	suySlug,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import { GOC } from "../../man-cai-dat-noi-tieng-viet/rang/lat.mjs";
import { docHoiThoaiGieo } from "./gieo-va-don.mjs";

const ts = createRequire(import.meta.url)("typescript");
const HERE = dirname(fileURLToPath(import.meta.url));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const RONG = 1280;
const CAO = 900;
const HEP = Number(process.env.BE_RONG_HEP ?? 360);

function khoOSoan() {
	const ma = [
		'import {oSoanMessages} from "./lib/messages/agent-builder-o-soan";',
		'console.log(JSON.stringify(oSoanMessages("vi")));',
	].join("\n");
	const r = spawnSync("bun", ["-e", ma], { cwd: join(GOC, "apps/app"), encoding: "utf8" });
	if (r.status !== 0) {
		console.log(`KHONG DO DUOC: khong doc duoc kho chuoi o soan — ${(r.stderr ?? "").trim().split("\n").slice(-2).join(" | ")}`);
		process.exit(2);
	}
	return JSON.parse(r.stdout);
}

function laySau(goc, duong) {
	let o = goc;
	for (const b of duong.split(".")) {
		if (!(o instanceof Object) || !(b in o)) return null;
		o = o[b];
	}
	return String(o) === o && o.length > 0 ? o : null;
}
const CHO_LANG = Number(process.env.CHO_LANG_MS ?? 6000);
const DAU = /[àáâãèéêìíòóôõùúýăđĩũơưạ-ỹ]/i;
const VUNG_DU_LIEU = [
	'[data-slot="message-scroller-item"]',
	"[data-composer-text]",
	'[translate="no"]',
];

let trinhDuyet = null;

function routeCuaLat(gieo) {
	return ["/chat", `/chat/${gieo.id}`];
}

async function moMan(cookie, slug, man, tieng, rong) {
	const trang = await trinhDuyet.newPage();
	await trang.setViewport({ width: rong, height: CAO, deviceScaleFactor: 1 });
	await trinhDuyet.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: "localhost", path: "/" },
		{ name: "lang", value: tieng, domain: "localhost", path: "/" },
	);
	const duong = `/${slug}${man}`;
	const res = await trang.goto(`${APP}${duong}`, {
		waitUntil: "domcontentloaded",
		timeout: 30_000,
	});
	await new Promise((r) => setTimeout(r, CHO_LANG));
	if (res === null || res.status() >= 400)
		return { trang, loi: `${duong} tra HTTP ${res === null ? "khong ro" : res.status()}` };
	if (new URL(trang.url()).pathname !== duong)
		return { trang, loi: `xin ${duong} nhung dung o ${new URL(trang.url()).pathname}` };
	const lang = await trang.evaluate(() => document.documentElement.lang);
	if (lang !== tieng) return { trang, loi: `xin lang=${tieng} nhung trang ve lang=${lang}` };
	return { trang, loi: null };
}

async function gomMan(cookie, slug, man, tieng, rong = RONG) {
	const mo = await moMan(cookie, slug, man, tieng, rong);
	if (mo.loi !== null) {
		await mo.trang.close();
		console.log(`KHONG DO DUOC: ${mo.loi}`);
		await ket(2);
	}
	const gia = await mo.trang.evaluate((vungDuLieu) => {
		const goc =
			(document.querySelector('[data-slot="page-shell-scroll"]') ??
				document.querySelector("main"))?.parentElement;
		if (!goc) return null;
		const duong = (el) => {
			const p = [];
			let e = el;
			while (e && e !== goc && e.parentElement) {
				p.push(`${e.tagName.toLowerCase()}:${[...e.parentElement.children].indexOf(e)}`);
				e = e.parentElement;
			}
			return p.reverse().join("/");
		};
		const hien = (el) => {
			const r = el.getBoundingClientRect();
			if (r.width === 0 || r.height === 0) return false;
			const st = getComputedStyle(el);
			return st.visibility !== "hidden" && st.display !== "none" && st.opacity !== "0";
		};
		const ra = [];
		const di = document.createTreeWalker(goc, NodeFilter.SHOW_TEXT);
		for (let n = di.nextNode(); n; n = di.nextNode()) {
			const el = n.parentElement;
			if (!el || el.closest("script,style,noscript,template") || !hien(el)) continue;
			const chu = (n.nodeValue ?? "").replace(/\s+/g, " ").trim();
			if (chu === "") continue;
			ra.push({
				khoa: `${duong(el)}#${[...el.childNodes].indexOf(n)}`,
				chu,
				duLieu: vungDuLieu.some((v) => el.closest(v) !== null),
			});
		}
		for (const el of goc.querySelectorAll("[aria-label]")) {
			const chu = (el.getAttribute("aria-label") ?? "").trim();
			if (chu === "" || !hien(el)) continue;
			ra.push({
				khoa: `${duong(el)}@aria-label`,
				chu,
				duLieu: vungDuLieu.some((v) => el.closest(v) !== null),
			});
		}
		return ra;
	}, VUNG_DU_LIEU);
	await mo.trang.close();
	if (gia === null) {
		console.log(`KHONG DO DUOC: ${man} khong co khung man de gom chu.`);
		await ket(2);
	}
	return gia;
}

function batBuocCoGieo() {
	const gieo = docHoiThoaiGieo();
	if (gieo === null) {
		console.log(
			"KHONG DO DUOC: vang tao pham hoi thoai gieo — chay chan gieo-va-don truoc, va chan nay TUYET DOI khong tu gieo bu.",
		);
		process.exit(2);
	}
	return gieo;
}

function daDanhDau(nguon, bieuThuc) {
	const cay = ts.createSourceFile("x.tsx", nguon, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	let ra = null;
	const di = (n) => {
		if (ts.isJsxElement(n)) {
			const con = n.children.some(
				(c) => ts.isJsxExpression(c) && c.expression !== undefined && c.expression.getText() === bieuThuc,
			);
			if (con) {
				const th = n.openingElement.attributes.properties.find(
					(a) => ts.isJsxAttribute(a) && a.name.getText() === "translate",
				);
				const gia = th?.initializer;
				ra = {
					co: gia !== undefined && ts.isStringLiteral(gia) && gia.text === "no",
					the: n.openingElement.tagName.getText(),
					dong: cay.getLineAndCharacterOfPosition(n.getStart()).line + 1,
				};
			}
		}
		if (ra === null) ts.forEachChild(n, di);
	};
	di(cay);
	return ra;
}

function chanDuLieuNguoiNhap() {
	const bang = docKhai(`${HERE}/du-lieu-nguoi-nhap.json`, "du-lieu-nguoi-nhap");
	if (bang.o.length === 0) {
		console.log("KHONG DO DUOC: bang du lieu nguoi nhap rong. Tap quan sat rong khong bao gio la dat.");
		process.exit(2);
	}
	const mat = [];
	const thieu = [];
	for (const o of bang.o) {
		const thay = daDanhDau(readFileSync(`${GOC}/${o.file}`, "utf8"), o.bieu_thuc);
		if (thay === null) {
			thieu.push(`${o.truong}: khong con phan tu JSX nao boc {${o.bieu_thuc}} trong ${o.file} — ban khai da cu`);
			continue;
		}
		if (thay.co) {
			console.log(`   XANH ${o.truong}: <${thay.the}> boc {${o.bieu_thuc}} mang translate="no" (${o.file.split("/").pop()}:${thay.dong})`);
			continue;
		}
		mat.push(`${o.truong}: <${thay.the}> boc {${o.bieu_thuc}} KHONG mang translate="no" — ${o.file}:${thay.dong}`);
	}
	for (const d of mat) console.log(`   HONG: ${d}`);
	for (const d of thieu) console.log(`   KHONG DO DUOC: ${d}`);
	console.log(`\nket qua: ${bang.o.length} o · xanh=${bang.o.length - mat.length - thieu.length} · hong=${mat.length} · ban khai cu=${thieu.length}`);
	if (mat.length > 0) process.exit(1);
	if (thieu.length > 0) process.exit(2);
	process.exit(0);
}

async function chanHaiTieng(cookie, slug, gieo) {
	const b = docKhai(`${HERE}/khong-dich-cua-lat.json`, "khong-dich-cua-lat");
	const khongDich = new Set([
		...b.dong.map((d) => d.gia_tri),
		...(b.mien_dau ?? []),
	]);
	let hong = 0;
	let capTong = 0;
	for (const man of routeCuaLat(gieo)) {
		const vi = await gomMan(cookie, slug, man, "vi");
		const en = await gomMan(cookie, slug, man, "en");
		if (vi.length === 0) {
			console.log(`KHONG DO DUOC: man ${man} gom ra 0 chuoi.`);
			await ket(2);
		}
		if (vi.length !== en.length) {
			console.log(`VE 1 HONG: man ${man} · vi=${vi.length} chuoi, en=${en.length} chuoi`);
			hong += 1;
		}
		const banEn = new Map(en.map((g) => [g.khoa, g.chu]));
		let capMan = 0;
		for (const g of vi) {
			const doi = banEn.get(g.khoa);
			if (doi === undefined) continue;
			capMan += 1;
			if (g.duLieu && !g.khoa.endsWith("@aria-label")) continue;
			if (g.chu === doi && !khongDich.has(g.chu)) {
				console.log(`VE 2 HONG: ${man} vi tri ${g.khoa} hai luot y het — ${JSON.stringify(g.chu)}`);
				hong += 1;
			}
			if (!DAU.test(g.chu) && g.chu !== doi && !khongDich.has(g.chu)) {
				console.log(`VE 3 HONG: ${man} luot vi khong mang dau — ${JSON.stringify(g.chu)}`);
				hong += 1;
			}
		}
		capTong += capMan;
		console.log(`-- man ${man} · vi=${vi.length} en=${en.length} · cap doi chieu=${capMan}`);
	}
	console.log(`\nket qua: ${capTong} cap doi chieu tren 2 route · hong=${hong}`);
	if (hong > 0) await ket(1);
	if (capTong === 0) {
		console.log("KHONG DO DUOC: 0 cap doi chieu. Tap quan sat rong khong bao gio la dat.");
		await ket(2);
	}
	await ket(0);
}

async function chanKhongDich(cookie, slug, gieo) {
	const bang = docKhai(`${HERE}/khong-dich-cua-lat.json`, "khong-dich-cua-lat");
	const viTri = new Map();
	const vungDuLieu = [];
	for (const man of routeCuaLat(gieo)) {
		const vi = await gomMan(cookie, slug, man, "vi");
		const en = new Map((await gomMan(cookie, slug, man, "en")).map((g) => [g.khoa, g.chu]));
		for (const g of vi) {
			const doi = en.get(g.khoa);
			if (doi === undefined) continue;
			if (g.duLieu && !g.khoa.endsWith("@aria-label"))
				vungDuLieu.push({ man, khoa: g.khoa, chu: g.chu, doi });
			const cu = viTri.get(g.chu) ?? [];
			cu.push({ man, khoa: g.khoa, doi });
			viTri.set(g.chu, cu);
		}
	}

	const lech = [];
	const thieu = [];
	const gioiHan = [];
	let soSanh = 0;

	for (const d of vungDuLieu) {
		soSanh += 1;
		if (d.doi !== d.chu)
			lech.push(
				`du lieu nguoi nhap / tac nhan sinh o ${d.man} vi tri ${d.khoa}: luot vi ve ra ${JSON.stringify(d.chu)} ma luot en ve ra ${JSON.stringify(d.doi)} — noi dung nay dang bi DICH`,
			);
	}

	for (const d of bang.dong) {
		const cho = viTri.get(d.gia_tri) ?? [];
		if (cho.length === 0) {
			if (d.ngoai_man_do_duoc === true) {
				gioiHan.push(`${d.gia_tri} (${d.luat}) — ${d.vi_sao}`);
				continue;
			}
			thieu.push(`${d.gia_tri} (${d.luat}) khai trong bang ma khong vi tri nao ve ra`);
			continue;
		}
		for (const v of cho) {
			soSanh += 1;
			if (v.doi !== d.gia_tri)
				lech.push(
					`${d.gia_tri} (${d.luat}) o ${v.man} vi tri ${v.khoa}: luot en ve ra ${JSON.stringify(v.doi)} — gia tri nay dang bi DICH`,
				);
		}
	}

	console.log(
		`ket qua: ${vungDuLieu.length} vi tri du lieu (nguoi nhap + tac nhan sinh) · ${bang.dong.length} dong bang thuong hieu · so vi tri doi chieu HAI LUOT=${soSanh} · gioi han da khai=${gioiHan.length} · thieu=${thieu.length} · bi dich=${lech.length}`,
	);
	for (const d of gioiHan) console.log(`   GIOI HAN DA KHAI: ${d}`);
	for (const d of thieu) console.log(`   THIEU: ${d}`);
	for (const d of lech) console.log(`   BI DICH: ${d}`);
	if (lech.length > 0) await ket(1);
	if (thieu.length > 0) await ket(2);
	if (soSanh === 0) {
		console.log("KHONG DO DUOC: khong vi tri nao doi chieu duoc hai luot.");
		await ket(2);
	}
	if (vungDuLieu.length === 0) {
		console.log(
			"KHONG DO DUOC: khong vi tri du lieu nao — vung du lieu khai ra khong con doi tuong tren man.",
		);
		await ket(2);
	}
	await ket(0);
}

async function chanTrangThai(cookie, slug, gieo) {
	const bang = docKhai(`${HERE}/trang-thai-cua-lat.json`, "trang-thai-cua-lat");
	const kho = khoOSoan();
	const chet = [];
	for (const o of bang.o)
		if (laySau(kho, o.duong) === null)
			chet.push(`${o.ma} tro vao ${o.duong} — khong con gia tri that trong kho chuoi`);
	if (chet.length > 0) {
		console.log("KHONG DO DUOC: ban khai trang thai co duong chet — thieu tien de.");
		for (const d of chet) console.log(`   ${d}`);
		await ket(2);
	}

	const doDuoc = bang.o.filter((o) => o.dung_duoc === true);
	if (doDuoc.length === 0) {
		console.log("KHONG DO DUOC: khong o trang thai nao khai dung duoc. Tap quan sat rong khong bao gio la dat.");
		await ket(2);
	}

	const veRa = new Map();
	for (const man of [...new Set(bang.o.map((o) => o.man))]) {
		const duongMan = man === "/chat/[chatId]" ? `/chat/${gieo.id}` : man;
		const gia = await gomMan(cookie, slug, duongMan, "vi");
		veRa.set(man, gia.map((g) => g.chu));
	}

	let hong = 0;
	for (const o of bang.o) {
		const mong = laySau(kho, o.duong);
		const co = (veRa.get(o.man) ?? []).some((c) => c.includes(mong));
		if (o.dung_duoc === true) {
			if (co) console.log(`   XANH ${o.ma} tren ${o.man}: ${JSON.stringify(mong)}`);
			else {
				console.log(`   HONG ${o.ma}: khai dung duoc tren ${o.man} ma chu cua no khong ve ra — ${JSON.stringify(mong)}`);
				hong += 1;
			}
			continue;
		}
		if (co) {
			console.log(`   HONG ${o.ma}: khai KHONG dung duoc ma chu cua no VE RA tren ${o.man} — ban khai da cu, ${JSON.stringify(mong)}`);
			hong += 1;
			continue;
		}
		console.log(`   GIOI HAN ${o.ma} (${o.man}): ${o.vi_sao}`);
	}
	console.log(`\nket qua: ${bang.o.length} o trang thai · do duoc ${doDuoc.length} · gioi han da khai ${bang.o.length - doDuoc.length} · hong=${hong}`);
	if (hong > 0) await ket(1);
	await ket(0);
}

async function chanBeRong(cookie, slug, gieo) {
	let nhan = 0;
	let tran = 0;
	for (const man of routeCuaLat(gieo)) {
		const doc = async (tieng) => {
			const mo = await moMan(cookie, slug, man, tieng, HEP);
			if (mo.loi !== null) {
				await mo.trang.close();
				console.log(`KHONG DO DUOC: ${mo.loi}`);
				await ket(2);
			}
			const gia = await mo.trang.evaluate(() => {
				const ra = [];
				for (const el of document.body.querySelectorAll("*")) {
					if (el.children.length > 0) continue;
					const chu = (el.textContent ?? "").trim();
					if (chu === "") continue;
					const r = el.getBoundingClientRect();
					if (r.width <= 1 || r.height <= 1) continue;
					ra.push({ chu, tran: el.scrollWidth > el.clientWidth, khoa: ra.length });
				}
				return ra;
			});
			await mo.trang.close();
			return gia;
		};
		const vi = await doc("vi");
		const en = await doc("en");
		const cap = vi.filter((g, i) => en[i] !== undefined && en[i].chu !== g.chu);
		nhan += cap.length;
		console.log(`-- man ${man} o ${HEP}px · nhan nhin thay duoc va dich duoc=${cap.length}`);
		if (cap.length === 0) {
			console.log(`KHONG DO DUOC: man ${man} khong nhan nao dich duoc o ${HEP}px.`);
			await ket(2);
		}
		for (const g of cap)
			if (g.tran && !en[g.khoa].tran) {
				console.log(`   TRAN: ${JSON.stringify(g.chu)} — luot vi tran, doi chung en vua`);
				tran += 1;
			}
	}
	console.log(`\nket qua ${HEP}px: ${nhan} nhan dich duoc · vi tran ma en vua=${tran}`);
	if (tran > 0) await ket(1);
	await ket(0);
}

const chan = process.argv[2];
if (chan === "du-lieu-nguoi-nhap") chanDuLieuNguoiNhap();
const gieo = batBuocCoGieo();
const cookie = phien();
const slug = await suySlug(cookie);
await canhCong(cookie, slug);
datTrinhDuyet(
	(trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: "new",
		args: ["--no-sandbox", `--window-size=${RONG},${CAO}`],
	})),
);

if (chan === "hai-tieng") await chanHaiTieng(cookie, slug, gieo);
else if (chan === "khong-dich") await chanKhongDich(cookie, slug, gieo);
else if (chan === "be-rong") await chanBeRong(cookie, slug, gieo);
else if (chan === "trang-thai") await chanTrangThai(cookie, slug, gieo);
else {
	console.log(`KHONG DO DUOC: chua biet chan ${JSON.stringify(chan)}.`);
	await ket(2);
}
