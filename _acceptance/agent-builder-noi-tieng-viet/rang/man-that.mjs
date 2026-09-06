import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
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

const ts = createRequire(import.meta.url)("typescript");
const HERE = dirname(fileURLToPath(import.meta.url));
const THU_MUC = "apps/app/app/(app)/[slug]/(agent-builder)";
const RONG = 1280;
const CAO = 900;
const CHROME =
	"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const HEP = Number(process.env.BE_RONG_HEP ?? 360);
const CHO_LANG_TRANG_THAI = 5000;

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
		console.log(`   ${v.route} — can ${v.vat}. ${v.vi_sao_chua_do}`);
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

async function kiemChuaChot(cookie, slug, chuaChot) {
	const xau = [];
	for (const v of chuaChot) {
		const man = v.route.replace(/\[[^\]]+\]/g, `khong-co-that-${Date.now()}`);
		const mo = await moManMem(cookie, slug, man, "vi", RONG);
		if (mo.loi === null) {
			const gia = (await gomTrang(mo.trang)) ?? [];
			if (gia.length > 0)
				xau.push(
					`${v.route} khai la CAN mot ban ghi that, nhung mo bang mot dinh danh khong co that van ve ra ${gia.length} chuoi — ban khai da cu.`,
				);
		}
		await mo.trang.close();
	}
	return xau;
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
	const khaiSai = await kiemChuaChot(cookie, slug, chuaChot);
	for (const d of khaiSai) console.log(`   KHAI SAI: ${d}`);
	hong += khaiSai.length;
	inChuaChot(chuaChot);
	console.log(
		`\nket qua: route do duoc ${doDuoc.length}/${het.length} (thu muc sinh ra ${het.length}, chua chot cach gieo ${chuaChot.length}) · ${capTong} cap doi chieu · ngoai lat=${thayNgoai.size} · hong=${hong} · tu choi do=${tuChoi.length}`,
	);
	if (hong > 0 || chet.length > 0) await ket(1);
	if (tuChoi.length > 0) await ket(2);
	if (chuaChot.length > 0)
		console.log(
			`GIOI HAN DA KHAI: ${chuaChot.length} route can mot ban ghi that — khong co phep do man o vong nay, va ca ${chuaChot.length} da duoc chung la THAT SU khong dung duoc bang mot dinh danh khong co that.`,
		);
	await ket(0);
}

async function chanKhongDich(cookie, slug) {
	const bang = docKhai(`${HERE}/khong-dich-cua-lat.json`, "khong-dich-cua-lat");
	const { doDuoc, chuaChot } = chiaRoute();
	const ngoaiLatChuoi = [];
	for (const k of bang.ngoai_lat?.khoi ?? [])
		for (const c of k.chuoi) ngoaiLatChuoi.push({ gia_tri: c, luat: `ngoai lat — ${k.file}` });
	const het = [...bang.dong, ...ngoaiLatChuoi];

	const viTri = new Map();
	for (const man of doDuoc) {
		const lay = async (tieng) => {
			const mo = await moManMem(cookie, slug, man, tieng, RONG);
			if (mo.loi !== null) {
				await mo.trang.close();
				console.log(`KHONG DO DUOC: ${man} (${tieng}) — ${mo.loi[0]}`);
				await ket(2);
			}
			const gia = (await gomTrang(mo.trang)) ?? [];
			await mo.trang.close();
			return new Map(gia.map((g) => [g.khoa, g.chu]));
		};
		const vi = await lay("vi");
		const en = await lay("en");
		for (const [k, chu] of vi) {
			const doi = en.get(k);
			if (doi === undefined) continue;
			const cu = viTri.get(chu) ?? [];
			cu.push({ man, khoa: k, doi });
			viTri.set(chu, cu);
		}
	}

	const lech = [];
	const gioiHan = [];
	const thieu = [];
	let soSanh = 0;
	for (const d of het) {
		const cho = viTri.get(d.gia_tri) ?? [];
		if (cho.length === 0) {
			if (d.ngoai_man_do_duoc === true) {
				gioiHan.push(`${d.gia_tri} (${d.luat}) — ${d.vi_sao}`);
				continue;
			}
			thieu.push(`${d.gia_tri} (${d.luat}) khai trong bang ma khong vi tri nao tren man do duoc ve ra no`);
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
	inChuaChot(chuaChot);
	console.log(
		`\nket qua: ${bang.dong.length} dong bang + ${ngoaiLatChuoi.length} chuoi ngoai lat · so vi tri doi chieu HAI LUOT=${soSanh} · gioi han da khai=${gioiHan.length} · thieu=${thieu.length} · bi dich=${lech.length}`,
	);
	for (const d of gioiHan) console.log(`   GIOI HAN DA KHAI: ${d}`);
	for (const d of thieu) console.log(`   THIEU: ${d}`);
	for (const d of lech) console.log(`   BI DICH: ${d}`);
	if (lech.length > 0) await ket(1);
	if (thieu.length > 0) await ket(2);
	if (soSanh === 0) {
		console.log(
			"KHONG DO DUOC: khong vi tri nao doi chieu duoc hai luot. Tap quan sat rong khong bao gio la dat.",
		);
		await ket(2);
	}
	await ket(0);
}

async function chanBeRongTienDe(cookie, slug) {
	const { doDuoc } = chiaRoute();
	let nhan = 0;
	const chatCung = [];
	for (const man of doDuoc) {
		const mo = await moManMem(cookie, slug, man, "vi", HEP);
		if (mo.loi !== null) {
			await mo.trang.close();
			continue;
		}
		const ra = await mo.trang.evaluate(() => {
			const goc =
				(document.querySelector('[data-slot="page-shell-scroll"]') ??
					document.querySelector("main"))?.parentElement ?? document.body;
			const ds = [];
			for (const el of goc.querySelectorAll("*")) {
				if (el.children.length > 0) continue;
				const chu = (el.textContent ?? "").trim();
				if (chu === "") continue;
				const st = getComputedStyle(el);
				ds.push({
					chu,
					chatCung:
						st.whiteSpace === "nowrap" ||
						st.textOverflow === "ellipsis" ||
						st.overflowX === "hidden",
				});
			}
			return ds;
		});
		await mo.trang.close();
		nhan += ra.length;
		for (const o of ra) if (o.chatCung) chatCung.push(`${man}: ${JSON.stringify(o.chu)}`);
	}
	const kho = khoChuoiCuaLat();
	const cuaLat = new Set();
	const gom = (o) => {
		for (const v of Object.values(o))
			if (v instanceof Object) gom(v);
			else if (String(v) === v) cuaLat.add(v);
	};
	gom(kho);
	const cuaLatChat = chatCung.filter((d) => [...cuaLat].some((c) => d.includes(JSON.stringify(c).slice(1, -1))));
	console.log(
		`tien de be rong o ${HEP}px: ${nhan} nhan doc duoc · hop CHAT CUNG=${chatCung.length} · trong do mang chu CUA LAT nay=${cuaLatChat.length}`,
	);
	for (const d of chatCung.slice(0, 10)) console.log(`   HOP CHAT: ${d}`);
	if (nhan === 0) {
		console.log("KHONG DO DUOC: 0 nhan doc duoc. Tap quan sat rong khong bao gio la dat.");
		await ket(2);
	}
	if (cuaLatChat.length === 0) {
		console.log(
			"KHONG DO DUOC: khong chu nao CUA LAT NAY nam trong mot hop chat cung tren man do duoc — moi hop chua chu cua lat deu CHO XUONG DONG, nen mot nhan dai chi wrap chu khong bao gio tran. Thieu tien de de chung chieu do cua chan be-rong.",
		);
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

function khoChuoiCuaLat() {
	const ma = [
		'import {khungMessages} from "./lib/messages/agent-builder-khung";',
		'import {tacNhanMessages} from "./lib/messages/agent-builder-tac-nhan";',
		'import {ketQuaMessages} from "./lib/messages/agent-builder-ket-qua";',
		'const g=(t)=>({khung:khungMessages(t),"tac-nhan":tacNhanMessages(t),"ket-qua":ketQuaMessages(t)});',
		'console.log(JSON.stringify({...g("vi"),__en:g("en")}));',
	].join("\n");
	const r = spawnSync("bun", ["-e", ma], {
		cwd: join(GOC, "apps/app"),
		encoding: "utf8",
	});
	if (r.status !== 0) {
		console.log(
			`KHONG DO DUOC: khong doc duoc ba kho chuoi cua lat — ${(r.stderr ?? "").trim().split("\n").slice(-3).join(" | ")}`,
		);
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

async function chanTrangThai(cookie, slug) {
	const bang = docKhai(`${HERE}/trang-thai-cua-lat.json`, "trang-thai-cua-lat");
	const kho = khoChuoiCuaLat();
	const { chuaChot } = chiaRoute();
	const canVat = new Set(chuaChot.map((v) => v.route));

	const chet = [];
	for (const o of bang.o) {
		if (o.khong_co_chu === true) continue;
		if (laySau(kho[o.kho], o.duong) === null)
			chet.push(`${o.ma} tro vao ${o.kho}.${o.duong} — khong con gia tri that trong kho chuoi`);
	}
	if (chet.length > 0) {
		console.log("KHONG DO DUOC: ban khai trang thai co duong chet — thieu tien de.");
		for (const d of chet) console.log(`   ${d}`);
		await ket(2);
	}

	const doDuoc = bang.o.filter((o) => o.dung_duoc === true);
	const khongDung = bang.o.filter((o) => o.dung_duoc !== true);
	if (doDuoc.length === 0) {
		console.log(
			"KHONG DO DUOC: khong o trang thai nao khai dung duoc. Tap quan sat rong khong bao gio la dat.",
		);
		await ket(2);
	}

	const canDo = [];
	for (const o of bang.o) {
		if (o.khong_co_chu === true) continue;
		canDo.push(laySau(kho[o.kho], o.duong));
	}
	const veRa = new Map();
	for (const man of [...new Set(doDuoc.map((o) => o.man))]) {
		const mo = await moManMem(cookie, slug, man, "vi", RONG, CHO_LANG_TRANG_THAI);
		if (mo.loi !== null) {
			await mo.trang.close();
			console.log(`KHONG DO DUOC: man ${man} khong dung duoc — ${mo.loi[0]}`);
			await ket(2);
		}
		const thay = await mo.trang.evaluate((ds) => {
			const hien = (el) => {
				for (let e = el; e; e = e.parentElement) {
					const r = e.getBoundingClientRect();
					if (r.width <= 1 || r.height <= 1) return false;
					const st = getComputedStyle(e);
					if (st.visibility === "hidden" || st.display === "none") return false;
				}
				return true;
			};
			return ds.map((chu) =>
				[...document.body.querySelectorAll("*")].some(
					(el) =>
						el.children.length === 0 &&
						(el.textContent ?? "").includes(chu) &&
						hien(el),
				),
			);
		}, canDo);
		await mo.trang.close();
		if (!thay.some(Boolean)) {
			console.log(
				`KHONG DO DUOC: man ${man} khong ve ra chuoi nao trong ban khai. Tap quan sat rong khong bao gio la dat.`,
			);
			await ket(2);
		}
		veRa.set(man, new Map(canDo.map((c, i) => [c, thay[i]])));
	}

	let hong = 0;
	for (const o of doDuoc) {
		const mong = laySau(kho[o.kho], o.duong);
		const co = veRa.get(o.man)?.get(mong) === true;
		if (co) {
			console.log(`   XANH ${o.ma} tren ${o.man}: ${JSON.stringify(mong)}`);
			continue;
		}
		console.log(
			`   HONG ${o.ma}: khai dung duoc tren ${o.man} ma chu cua no khong ve ra — ${JSON.stringify(mong)}`,
		);
		hong += 1;
	}

	for (const o of khongDung) {
		if (o.khong_co_chu === true) {
			console.log(`   GIOI HAN ${o.ma}: khong co doi tuong — ${o.vi_sao}`);
			continue;
		}
		const mong = laySau(kho[o.kho], o.duong);
		const hien = [...veRa.entries()].filter(([, m]) => m.get(mong) === true);
		if (hien.length > 0) {
			console.log(
				`   HONG ${o.ma}: khai KHONG dung duoc ma chu cua no ve ra o ${hien.map(([m]) => m).join(" · ")} — ban khai da cu, ${JSON.stringify(mong)}`,
			);
			hong += 1;
			continue;
		}
		const nhan = canVat.has(o.man) ? "can mot ban ghi that" : "khong ve ra tren man do duoc";
		console.log(`   GIOI HAN ${o.ma} (${o.man}, ${nhan}): ${o.vi_sao}`);
	}

	console.log(
		`\nket qua: ${bang.o.length} o trang thai · do duoc ${doDuoc.length} · gioi han da khai ${khongDung.length} · hong=${hong}`,
	);
	if (hong > 0) await ket(1);
	await ket(0);
}

function daDanhDau(nguon, bieuThuc) {
	const cay = ts.createSourceFile("x.tsx", nguon, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	let ra = null;
	const di = (n) => {
		if (ts.isJsxElement(n)) {
			const con = n.children.some(
				(c) =>
					ts.isJsxExpression(c) &&
					c.expression !== undefined &&
					c.expression.getText() === bieuThuc,
			);
			if (con) {
				const t = n.openingElement.attributes.properties.find(
					(a) => ts.isJsxAttribute(a) && a.name.getText() === "translate",
				);
				const gia = t?.initializer;
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
	const het = [
		...bang.o.map((o) => ({ ...o, trong: true })),
		...(bang.ngoai_lat ?? []).map((o) => ({ ...o, trong: false })),
	];
	if (het.length === 0) {
		console.log("KHONG DO DUOC: bang du lieu nguoi nhap rong. Tap quan sat rong khong bao gio la dat.");
		process.exit(2);
	}
	const mat = [];
	const thieu = [];
	console.log(`bang du lieu nguoi nhap: ${bang.o.length} o trong lat · ${(bang.ngoai_lat ?? []).length} o ngoai lat`);
	for (const o of het) {
		const nguon = readFileSync(`${GOC}/${o.file}`, "utf8");
		const thay = daDanhDau(nguon, o.bieu_thuc);
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
	console.log(`\nket qua: ${het.length} o · xanh=${het.length - mat.length - thieu.length} · hong=${mat.length} · ban khai cu=${thieu.length}`);
	if (mat.length > 0) process.exit(1);
	if (thieu.length > 0) process.exit(2);
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
else if (chan === "trang-thai") await chanTrangThai(cookie, slug);
else if (chan === "be-rong-tien-de") await chanBeRongTienDe(cookie, slug);
else {
	console.log(`KHONG DO DUOC: chua biet chan ${JSON.stringify(chan)}.`);
	process.exit(2);
}
