import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { GOC } from "../../man-cai-dat-noi-tieng-viet/rang/lat.mjs";
import { giuDoc, nangLenViet } from "../../man-cai-dat-noi-tieng-viet/rang/khoa-cay.mjs";

import {
	APP,
	CAO,
	CHI_SO,
	CHROME,
	DAU_VIET,
	datTrinhDuyet,
	docCay,
	docKhai,
	doRongTrang,
	fileCaiDat,
	goiApi,
	goiApiMem,
	goiApiTao,
	gomTrang,
	HEP,
	ket,
	khongDo,
	MAN,
	moManMem,
	phien,
	RONG,
	sinhRouteCaiDat,
	soCap,
	suySlug,
	tsCua,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";

await giuDoc();

const HERE = dirname(fileURLToPath(import.meta.url));
const LUAT_CO_2 = new Set(["so-thuan", "du-lieu-nguoi-nhap", "doan-ma-chep"]);
const KHO = {
	ketNoi: "apps/app/lib/messages/settings-ket-noi.ts",
	khoaApi: "apps/app/lib/messages/settings-khoa-api.ts",
	sso: "apps/app/lib/messages/settings-sso.ts",
	thanhVien: "apps/app/lib/messages/settings-thanh-vien.ts",
	theoDoi: "apps/app/lib/messages/settings-theo-doi.ts",
};

const CAU_RONG = [
	{
		ten: "chua co khoa API nao",
		kho: "khoaApi",
		khoa: "bang.trong",
		man: "/settings/api-keys",
		dung: async () => ({ san: true }),
	},
	{
		ten: "chua co nha cung cap SSO nao",
		kho: "sso",
		khoa: "bang.trong",
		man: "/settings/sso",
		dung: async () => ({ san: true }),
	},
	{
		ten: "khong ai khop bo loc thanh vien",
		kho: "thanhVien",
		khoa: "bang.trong",
		man: "/settings/members",
		go: "zzqq-khong-ai-mang-ten-nay",
		dung: async () => ({ san: true }),
	},
	{
		ten: "chua co ten mien duoc phep nao",
		kho: "theoDoi",
		khoa: "tenMien.trong",
		man: "/settings/tracking",
		dung: async (_cookie, trang_thai) =>
			trang_thai.theoDoi.domains.length === 0
				? { san: true }
				: {
						san: false,
						vi_sao: `workspace da co ${trang_thai.theoDoi.domains.length} ten mien va tracking.removeDomain tu choi vai tro "${trang_thai.noiLam.viewerRole}"`,
					},
	},
	{
		ten: "chua co nguon truy cap nao",
		kho: "theoDoi",
		khoa: "nguon.trong",
		man: "/settings/tracking",
		dung: async (cookie) => {
			const ra = await goiApiMem(cookie, "tracking.sources", null);
			if (ra.loi !== undefined) return { san: false, vi_sao: ra.loi };
			const so = (ra.gia.rows ?? ra.gia ?? []).length;
			return so === 0
				? { san: true }
				: { san: false, vi_sao: `tracking.sources da co ${so} nguon` };
		},
	},
	{
		ten: "chua co kenh Slack nao",
		kho: "ketNoi",
		khoa: "kenh.chuaCoKenh",
		man: "/settings/connections/slack",
		dung: async (_cookie, trang_thai) =>
			trang_thai.slack.connected
				? { san: true }
				: { san: false, vi_sao: "Slack chua cam vao workspace nay" },
	},
];

const BIEU_THUC = {
	"ten khoa API": ["row.name ?? t.bang.chuaDatTen"],
	"ten mien duoc phep": ["domain.host"],
	"ten nha cung cap SSO": ["row.name"],
	"ten kenh Slack": ["channel.name"],
	"ten va email thanh vien": ["row.name", "row.email"],
};

function routeKhaiKhongDung() {
	const khai = docKhai(`${HERE}/lat-cai-dat-2.json`, "lat-cai-dat-2");
	return khai.route_khong_dung_duoc ?? [];
}

async function chotRouteKhaiChet(cookie, slug, khai, neo) {
	const mo = async (route) => {
		const ra = await moManMem(cookie, slug, route, "vi", RONG);
		await ra.trang.close();
		return ra.loi;
	};
	if ((await mo(neo)) !== null)
		await khongDo(
			`KHONG DO DUOC: tien de thieu — neo ${neo} khong mo duoc, nen moi route deu trong giong route khai chet va chot nay mu.`,
		);
	const chet = [];
	for (const x of khai)
		if ((await mo(x.route)) === null)
			chet.push(
				`ROUTE KHAI CHET: ${x.route} khai khong dung duoc (${x.vi_sao}) nhung no mo duoc va dung dung cho — go dong khai di.`,
			);
	return chet;
}

function batLuat(bang, ten) {
	const co = (bang.luat ?? []).map((l) => l.ten);
	const la = co.filter((t) => !LUAT_CO_2.has(t));
	if (la.length > 0) {
		console.log(
			`KHONG DO DUOC: ${ten} khai luat khong ai cai dat: ${la.join(" · ")}`,
		);
		process.exit(2);
	}
	return new Set(co);
}

function boVo(nut) {
	const ts = tsCua();
	let n = nut;
	while (n && (ts.isSatisfiesExpression(n) || ts.isAsExpression(n)))
		n = n.expression;
	return n;
}

function goiKho(kho, tieng) {
	const ts = tsCua();
	const nguon = docCay(KHO[kho]);
	let goc = null;
	const di = (n) => {
		if (
			ts.isVariableDeclaration(n) &&
			ts.isIdentifier(n.name) &&
			n.name.text === tieng
		)
			goc = boVo(n.initializer);
		ts.forEachChild(n, di);
	};
	ts.forEachChild(nguon, di);
	return goc;
}

function giaTriKho(kho, tieng, duong) {
	const ts = tsCua();
	let o = goiKho(kho, tieng);
	for (const buoc of duong.split(".")) {
		if (o === null || !ts.isObjectLiteralExpression(o)) return null;
		const p = o.properties.find(
			(x) =>
				ts.isPropertyAssignment(x) &&
				(ts.isIdentifier(x.name) || ts.isStringLiteral(x.name)) &&
				x.name.text === buoc,
		);
		if (p === undefined) return null;
		o = boVo(p.initializer);
	}
	if (o === null) return null;
	if (ts.isStringLiteral(o) || ts.isNoSubstitutionTemplateLiteral(o))
		return o.text;
	return null;
}

function demNutDocKhoa(khoa) {
	const ts = tsCua();
	const cho = [];
	for (const f of fileCaiDat()) {
		const nguon = docCay(f);
		const di = (n) => {
			if (
				ts.isPropertyAccessExpression(n) &&
				ts.isPropertyAccessExpression(n.expression) &&
				`${n.expression.name.text}.${n.name.text}` === khoa
			)
				cho.push(
					`${f}:${nguon.getLineAndCharacterOfPosition(n.getStart(nguon)).line + 1}`,
				);
			ts.forEachChild(n, di);
		};
		ts.forEachChild(nguon, di);
	}
	return cho;
}

function toTien(nut) {
	const ts = tsCua();
	let n = nut.parent;
	while (n) {
		if (ts.isJsxElement(n)) return n.openingElement;
		if (ts.isJsxSelfClosingElement(n)) return n;
		n = n.parent;
	}
	return null;
}

function mangKhongDich(mo) {
	const ts = tsCua();
	if (mo === null) return false;
	return mo.attributes.properties.some(
		(a) =>
			ts.isJsxAttribute(a) &&
			ts.isIdentifier(a.name) &&
			a.name.text === "translate" &&
			a.initializer !== undefined &&
			ts.isStringLiteral(a.initializer) &&
			a.initializer.text === "no",
	);
}

function timBocJsx(file, chu) {
	const ts = tsCua();
	const nguon = docCay(file);
	const ra = [];
	const di = (n) => {
		if (
			ts.isJsxExpression(n) &&
			n.expression !== undefined &&
			n.parent !== undefined &&
			(ts.isJsxElement(n.parent) || ts.isJsxFragment(n.parent)) &&
			n.expression.getText(nguon) === chu
		) {
			const mo = toTien(n);
			ra.push({
				dong: nguon.getLineAndCharacterOfPosition(n.getStart(nguon)).line + 1,
				the: mo === null ? "?" : mo.tagName.getText(nguon),
				khongDich: mangKhongDich(mo),
			});
		}
		ts.forEachChild(n, di);
	};
	ts.forEachChild(nguon, di);
	return ra;
}

function chuCaiDau(ten, email) {
	const nhan = ten?.trim() || email?.trim() || "";
	const phan = nhan.split(/\s+/).filter(Boolean);
	if (phan.length === 0) return "?";
	if (phan.length === 1) return phan[0].slice(0, 2).toUpperCase();
	return (phan[0].slice(0, 1) + phan.at(-1).slice(0, 1)).toUpperCase();
}

async function trangThai(cookie) {
	const noiLam = await goiApi(cookie, "workspace.get", null);
	const thanhVien = await goiApi(cookie, "workspace.members", {});
	const choPhep = await goiApiMem(cookie, "workspace.allowances", null);
	const theoDoi = await goiApi(cookie, "tracking.settings", null);
	const slack = await goiApi(cookie, "slack.status", null);
	const ssoCauHinh = await goiApi(cookie, "sso.settings", null);
	const ssoBang = await goiApi(cookie, "sso.list", {});
	return { noiLam, thanhVien, choPhep, theoDoi, slack, ssoCauHinh, ssoBang };
}

function dungBoi(tt) {
	const bang = docKhai(`${HERE}/khong-dich-cua-lat.json`, "khong-dich-cua-lat");
	const luat = batLuat(bang, "khong-dich-cua-lat.json");
	const nguoi = new Set();
	for (const v of [tt.noiLam.name, tt.noiLam.website, tt.noiLam.slug])
		if (v) nguoi.add(v);
	for (const m of tt.thanhVien.rows ?? []) {
		if (m.name) nguoi.add(m.name);
		if (m.email) nguoi.add(m.email);
		nguoi.add(chuCaiDau(m.name, m.email));
	}
	for (const r of tt.choPhep.gia?.rows ?? []) {
		if (r.email) nguoi.add(r.email);
		if (r.invitedByName) nguoi.add(r.invitedByName);
	}
	for (const d of tt.theoDoi.domains ?? []) nguoi.add(d.host);
	const vat = [
		tt.theoDoi.snippet,
		tt.theoDoi.tagManagerSnippet,
		tt.theoDoi.scriptUrl,
		tt.theoDoi.siteId,
	].filter(Boolean);
	const khai = new Map((bang.dong ?? []).map((d) => [d.gia_tri, d]));
	const khoiNgoai = bang.ngoai_lat?.khoi ?? [];
	const ngoaiLat = new Map();
	for (const k of khoiNgoai) for (const c of k.chuoi ?? []) ngoaiLat.set(c, k);
	const mienDau = new Map((bang.mien_dau ?? []).map((d) => [d.chuoi, d]));
	const dung = new Set();
	const boi = (chu, o) => {
		if (luat.has("so-thuan") && CHI_SO.test(chu)) return "so-thuan";
		if (luat.has("du-lieu-nguoi-nhap") && nguoi.has(chu))
			return "du-lieu-nguoi-nhap";
		if (
			luat.has("doan-ma-chep") &&
			o?.khongDich === true &&
			vat.some((v) => v.includes(chu))
		)
			return "doan-ma-chep";
		if (khai.has(chu)) {
			dung.add(chu);
			return "bang-khai";
		}
		return null;
	};
	return { boi, khai, dung, nguoi, vat, khoiNgoai, ngoaiLat, mienDau };
}

function demThem(m, chu) {
	m.set(chu, (m.get(chu) ?? 0) + 1);
}

function inNgoaiLat(khoiNgoai, thay, lan) {
	if (khoiNgoai.length === 0) {
		console.log(
			"ngoai lat (gioi han da khai): 0 chuoi — ban khai khong co khoi nao",
		);
		return 0;
	}
	let tong = 0;
	for (const k of khoiNgoai) {
		const co = (k.chuoi ?? []).filter((c) => thay.has(c));
		const lanKhoi = co.reduce((s, c) => s + (lan.get(c) ?? 0), 0);
		tong += co.length;
		console.log(
			`ngoai lat (gioi han da khai): ${co.length} chuoi tu ${k.nguon} tren ${k.route ?? "moi route"} — ${lanKhoi} lan duoc mien. Day la GIOI HAN DA KHAI, khong phai da dich.`,
		);
	}
	return tong;
}

function chetNgoaiLat(khoiNgoai, thay, daDo) {
	const chet = [];
	for (const k of khoiNgoai) {
		if (k.route !== undefined && !daDo.has(k.route)) {
			console.log(
				`   BO QUA CHET: khoi ${k.nguon} khai route ${k.route} ma route do khong do duoc luot nay.`,
			);
			continue;
		}
		for (const c of k.chuoi ?? [])
			if (!thay.has(c))
				chet.push(
					`MIEN TRU CHET: ${JSON.stringify(c)} khai ngoai lat tu ${k.nguon} ma khong con tren man ${k.route ?? "nao"}.`,
				);
	}
	return chet;
}

function danhSachRoute() {
	const boQua = routeKhaiKhongDung();
	const r = sinhRouteCaiDat([...MAN, ...boQua.map((x) => x.route)]);
	for (const x of boQua)
		console.log(`-- route khai khong dung duoc: ${x.route} — ${x.vi_sao}`);
	if (r.do.length === 0) {
		console.log("KHONG DO DUOC: thu muc settings/ sinh ra 0 route cua lat.");
		process.exit(2);
	}
	return r;
}

async function docHaiLuot(cookie, slug, man, rong) {
	const ra = {};
	for (const tieng of ["vi", "en"]) {
		const mo = await moManMem(cookie, slug, man, tieng, rong);
		if (mo.loi !== null) {
			await mo.trang.close();
			return { tuChoi: `${man} (lang=${tieng}) — ${mo.loi[0]}` };
		}
		const gia = await gomTrang(mo.trang);
		await mo.trang.close();
		if (gia === null || gia.length === 0)
			return {
				tuChoi: `${man} (lang=${tieng}) gom ra ${gia === null ? "khong co khung man" : "0 chuoi"}`,
			};
		ra[tieng] = gia;
	}
	return ra;
}

async function chanHaiTieng(cookie, slug) {
	const tt = await trangThai(cookie);
	const mt = dungBoi(tt);
	const r = danhSachRoute();
	const tuChoi = [];
	const daDo = new Set();
	const thayNgoai = new Set();
	const thayDau = new Set();
	const lanNgoai = new Map();
	const lanDau = new Map();
	let doDuoc = 0;
	let hong = 0;
	let capTong = 0;
	for (const man of r.do) {
		const hai = await docHaiLuot(cookie, slug, man, RONG);
		if (hai.tuChoi !== undefined) {
			tuChoi.push(hai.tuChoi);
			console.log(`\n-- man ${man}: TU CHOI DO — ${hai.tuChoi}`);
			continue;
		}
		doDuoc += 1;
		daDo.add(man);
		for (const g of hai.vi) {
			if (mt.ngoaiLat.has(g.chu)) thayNgoai.add(g.chu);
			if (mt.mienDau.has(g.chu)) thayDau.add(g.chu);
		}
		const k = soCap(hai.vi, hai.en, mt.boi);
		capTong += k.soCap;
		console.log(
			`\n-- man ${man} · vi=${hai.vi.length} chuoi · en=${hai.en.length} chuoi · cap doi chieu=${k.soCap}`,
		);
		if (hai.vi.length !== hai.en.length) {
			console.log(
				`   VE 1 HONG: so chuoi hai luot khong bang nhau (vi=${hai.vi.length}, en=${hai.en.length}).`,
			);
			hong += 1;
		}
		for (const l of k.lech.slice(0, 5))
			console.log(
				`   VE 1 HONG: cap ${l.so} lech duong DOM — vi=${l.vi} · en=${l.en}`,
			);
		const trung = [];
		const khongDau = [];
		for (const o of k.trung) {
			if (mt.ngoaiLat.has(o.chu)) {
				demThem(lanNgoai, o.chu);
				continue;
			}
			trung.push(o);
		}
		for (const o of k.khongDau) {
			if (mt.ngoaiLat.has(o.chu)) {
				demThem(lanNgoai, o.chu);
				continue;
			}
			if (mt.mienDau.has(o.chu)) {
				demThem(lanDau, o.chu);
				continue;
			}
			khongDau.push(o);
		}
		for (const o of trung)
			console.log(
				`   VE 2 HONG: ${JSON.stringify(o.chu)} giong het o hai luot ma bang khong khai — ${o.khoa}`,
			);
		for (const o of khongDau)
			console.log(
				`   VE 3 HONG: chuoi luot vi khong mang dau — ${JSON.stringify(o.chu)} — ${o.khoa}`,
			);
		console.log(
			`   ve 1: ${k.lech.length} cap lech · ve 2: ${trung.length} cap giong nhau · ve 3: ${khongDau.length} chuoi khong dau`,
		);
		hong += k.lech.length + trung.length + khongDau.length;
	}
	console.log("");
	const soNgoai = inNgoaiLat(mt.khoiNgoai, thayNgoai, lanNgoai);
	const soDau = [...mt.mienDau.keys()].filter((c) => thayDau.has(c)).length;
	const lanDauTong = [...lanDau.values()].reduce((s, n) => s + n, 0);
	console.log(
		`mien dau (tu muon tieng Viet khong them dau): ${soDau} chuoi — ${lanDauTong} lan duoc mien o ve 3.`,
	);
	const chet = chetNgoaiLat(mt.khoiNgoai, thayNgoai, daDo);
	chet.push(
		...(await chotRouteKhaiChet(cookie, slug, routeKhaiKhongDung(), r.do[0])),
	);
	if (daDo.size > 0)
		for (const c of mt.mienDau.keys())
			if (!thayDau.has(c))
				chet.push(
					`MIEN TRU CHET: ${JSON.stringify(c)} khai mien dau ma khong con tren man nao.`,
				);
	for (const d of chet) console.log(`   ${d}`);
	console.log(
		`\nket qua: route do duoc ${doDuoc}/${r.do.length} (thu muc sinh ra ${r.het.length}, tru ${MAN.length} route dot mot) · ${capTong} cap doi chieu · ngoai lat (gioi han da khai)=${soNgoai} · mien dau=${soDau} · mien tru chet=${chet.length} · hong=${hong}`,
	);
	if (hong + chet.length > 0) await ket(1);
	if (tuChoi.length > 0) {
		console.log(
			`KHONG DO DUOC: ${tuChoi.length} route khong dung duoc va ban khai lat-cai-dat-2.json khong co dong khai ly do cho chung:`,
		);
		for (const d of tuChoi) console.log(`   ${d}`);
		await ket(2);
	}
	if (capTong === 0) {
		await khongDo(
			"KHONG DO DUOC: 0 cap chuoi de doi chieu. Tap quan sat rong khong bao gio la dat.",
		);
	}
	await ket(0);
}

async function chanKhongDich(cookie, slug) {
	const tt = await trangThai(cookie);
	const mt = dungBoi(tt);
	const r = danhSachRoute();
	const ung = new Map();
	const tuChoi = [];
	const lechDoDai = [];
	const daDo = new Set();
	const thayNgoai = new Set();
	const lanNgoai = new Map();
	let coThuocTinh = 0;
	for (const man of r.do) {
		const hai = await docHaiLuot(cookie, slug, man, RONG);
		if (hai.tuChoi !== undefined) {
			tuChoi.push(hai.tuChoi);
			continue;
		}
		daDo.add(man);
		for (const g of hai.vi) if (mt.ngoaiLat.has(g.chu)) thayNgoai.add(g.chu);
		if (hai.vi.length !== hai.en.length)
			lechDoDai.push(
				`${man} — luot vi ra ${hai.vi.length} nut co chu, luot en ra ${hai.en.length}. Tap ung vien khong con doi xung nen chieu THUA mu voi phan duoi.`,
			);
		for (let i = 0; i < hai.vi.length; i += 1) {
			const b = hai.en[i];
			const kd = hai.vi[i].khongDich || (b?.khongDich ?? false);
			const giong =
				b !== undefined &&
				hai.vi[i].khoa === b.khoa &&
				hai.vi[i].chu === b.chu;
			if (kd) coThuocTinh += 1;
			if (!kd && !giong) continue;
			const cu = ung.get(hai.vi[i].chu) ?? { cho: new Set(), kd: false };
			cu.cho.add(man);
			cu.kd = cu.kd || kd;
			ung.set(hai.vi[i].chu, cu);
		}
	}
	if (ung.size === 0) {
		await khongDo(
			"KHONG DO DUOC: tap ung vien khong-dich rong tren moi route. Tap quan sat rong khong bao gio la dat.",
		);
	}
	console.log(
		`-- ung vien sinh tu man that: ${ung.size} gia tri (${coThuocTinh} lan mang translate="no")`,
	);
	const thua = [];
	for (const [gt, o] of [...ung].sort()) {
		const ly = mt.boi(gt, { khongDich: o.kd });
		const ngoai = ly === null && mt.ngoaiLat.has(gt);
		if (ngoai) {
			thayNgoai.add(gt);
			demThem(lanNgoai, gt);
		}
		console.log(
			`   ${(ly ?? (ngoai ? "ngoai-lat" : "CHUA KHAI")).padEnd(20)} ${JSON.stringify(gt)}${o.kd ? ' [translate="no"]' : ""} <- ${[...o.cho].join(" ")}`,
		);
		if (ly === null && !ngoai) thua.push(gt);
	}
	const khongCoThuocTinh = [...ung]
		.filter(([gt, o]) => !o.kd && mt.khai.has(gt))
		.map(([gt]) => gt);
	for (const gt of khongCoThuocTinh)
		console.log(
			`THIEU THUOC TINH: ${JSON.stringify(gt)} co trong bang khong-dich nhung phan tu chua no KHONG mang translate="no" — trinh duyet se tu dich no.`,
		);

	const thieu = [...mt.khai.keys()].filter((v) => !mt.dung.has(v));
	for (const v of thieu)
		console.log(
			`THIEU MOT DONG: bang khai gia tri ${JSON.stringify(v)} nhung khong man nao con no.`,
		);
	for (const v of thua)
		console.log(
			`THUA MOT GIA TRI: man that co ${JSON.stringify(v)} ma bang khong khai — no phai duoc dich, hoac phai co mot dong khai ly do.`,
		);
	console.log("");
	const soNgoai = inNgoaiLat(mt.khoiNgoai, thayNgoai, lanNgoai);
	const chet = chetNgoaiLat(mt.khoiNgoai, thayNgoai, daDo);
	for (const d of chet) console.log(`   ${d}`);
	console.log(
		`\nket qua: thieu dong=${thieu.length} · thua gia tri=${thua.length} · thieu thuoc tinh=${khongCoThuocTinh.length} · ngoai lat (gioi han da khai)=${soNgoai} · mien tru chet=${chet.length} · route khong do duoc=${tuChoi.length} · route lech do dai hai luot=${lechDoDai.length}`,
	);
	for (const d of tuChoi) console.log(`   TU CHOI DO: ${d}`);
	for (const d of lechDoDai) console.log(`   LECH DO DAI: ${d}`);
	if (lechDoDai.length > 0) await ket(1);
	if (chet.length > 0) await ket(1);
	if (khongCoThuocTinh.length > 0) await ket(1);
	if (thieu.length > 0 || thua.length > 0 || tuChoi.length > 0) await ket(2);
	await ket(0);
}

function layTheoDuong(goc, duong) {
	let cho = [goc];
	for (const doan of duong.split(".")) {
		const mang = doan.endsWith("[]");
		const ten = mang ? doan.slice(0, -2) : doan;
		cho = cho.flatMap((x) => (x === null || x === undefined ? [] : [x[ten]]));
		if (mang) cho = cho.flatMap((x) => (Array.isArray(x) ? x : []));
	}
	return cho.filter((x) => String(x ?? "") === x && x !== "");
}

async function chanDuLieuNguoiNhap(cookie, slug) {
	await nangLenViet();
	const bang = docKhai(`${HERE}/du-lieu-nguoi-nhap.json`, "du-lieu-nguoi-nhap");
	const donKhongXong = [];
	const don = async (ten, duong, vao) => {
		const r = await goiApiTao(cookie, duong, vao);
		if (r.loi !== undefined) donKhongXong.push(`${ten} — ${r.loi}`);
	};
	console.log(
		'-- CHAN MA: phan tu JSX boc bieu thuc truong phai mang translate="no"',
	);
	let thieuMa = 0;
	let khongMap = 0;
	for (const o of bang.o) {
		const chu = BIEU_THUC[o.truong];
		if (chu === undefined) {
			console.log(
				`   KHONG BIET DO: truong ${JSON.stringify(o.truong)} chua co bieu thuc ghim trong chan nay.`,
			);
			khongMap += 1;
			continue;
		}
		for (const c of chu) {
			const thay = timBocJsx(o.file, c);
			if (thay.length === 0) {
				console.log(
					`   DO: khong con nut JSX nao boc ${JSON.stringify(c)} trong ${o.file}.`,
				);
				thieuMa += 1;
				continue;
			}
			for (const t of thay) {
				console.log(
					`   ${t.khongDich ? "co  " : "THIEU"} translate="no" — ${o.file}:${t.dong} <${t.the}> boc ${JSON.stringify(c)}`,
				);
				if (!t.khongDich) thieuMa += 1;
			}
		}
	}

	console.log(
		"\n-- CHAN MAN: chi cho thu gieo duoc qua API that khong can OAuth",
	);
	const gieoDuoc = [];
	const khongGieo = [];
	for (const o of bang.o) {
		if (o.gieo_duoc !== true) {
			khongGieo.push(
				`${o.truong} — ${o.vi_sao ?? "ban khai ghi gieo_duoc=false"}`,
			);
		}
	}
	let thieuMan = 0;
	const khongDoSan = [];
	const tt = await trangThai(cookie);

	const ten = `chan-do-${Date.now()}`;
	const tao = await goiApiTao(cookie, "apiKeys.create", {
		name: ten,
		expiresInDays: null,
	});
	if (tao.loi !== undefined) {
		khongGieo.push(`ten khoa API — ${tao.loi}`);
	} else {
		gieoDuoc.push(`ten khoa API — da tao ${JSON.stringify(ten)}`);
		const mo = await moManMem(cookie, slug, "/settings/api-keys", "vi", RONG);
		if (mo.loi !== null) {
			await mo.trang.close();
			await don("khoa API gieo thu", "apiKeys.revoke", { id: tao.gia.id });
			await khongDo(`KHONG DO DUOC: ${mo.loi[0]}`);
		}
		const gia = await gomTrang(mo.trang);
		await mo.trang.close();
		await don("khoa API gieo thu", "apiKeys.revoke", { id: tao.gia.id });
		const cho = (gia ?? []).filter((g) => g.chu === ten);
		if (cho.length === 0) {
			console.log(
				`   DO: da tao khoa ${JSON.stringify(ten)} ma man khong hien no.`,
			);
			thieuMan += 1;
		}
		for (const c of cho) {
			console.log(
				`   ${c.khongDich ? "co  " : "THIEU"} translate="no" — /settings/api-keys ${c.khoa} = ${JSON.stringify(c.chu)}`,
			);
			if (!c.khongDich) thieuMan += 1;
		}
	}

	const themMien = await goiApiTao(cookie, "tracking.addDomain", {
		host: `chan-do-${Date.now()}.example`,
		scope: "SITE_AND_SUBDOMAINS",
	});
	if (themMien.loi !== undefined) {
		khongGieo.push(`ten mien duoc phep — ${themMien.loi}`);
	} else {
		gieoDuoc.push("ten mien duoc phep — da them mot ten mien");
		await don("ten mien gieo thu", "tracking.removeDomain", { id: themMien.gia.id });
	}

	console.log("\n-- CHAN MAN: do VAT SAN CO tren workspace nay");
	for (const o of bang.o) {
		if (o.do_san_duoc !== true) {
			if (o.vi_sao_san !== undefined)
				khongGieo.push(`${o.truong} (vat san co) — ${o.vi_sao_san}`);
			continue;
		}
		const gia = layTheoDuong(tt, o.nguon_san);
		if (gia.length === 0) {
			console.log(
				`   KHONG DO DUOC: ${o.truong} khai do_san_duoc nhung ${o.nguon_san} khong tra ve gia tri nao — tap quan sat rong khong bao gio la dat.`,
			);
			khongDoSan.push(`${o.truong} — ${o.nguon_san} rong`);
			continue;
		}
		const mo = await moManMem(cookie, slug, o.route, "vi", RONG);
		if (mo.loi !== null) {
			await mo.trang.close();
			khongDoSan.push(`${o.truong} — ${mo.loi[0]}`);
			continue;
		}
		const nut = (await gomTrang(mo.trang)) ?? [];
		await mo.trang.close();
		for (const v of gia) {
			const cho = nut.filter((n) => n.chu === v);
			if (cho.length === 0) {
				console.log(
					`   DO: ${o.truong} — ${JSON.stringify(v)} co trong ${o.nguon_san} ma man ${o.route} khong ve ra no.`,
				);
				thieuMan += 1;
				continue;
			}
			gieoDuoc.push(`${o.truong} (san co) — ${JSON.stringify(v)} tren ${o.route}`);
			for (const c of cho) {
				console.log(
					`   ${c.khongDich ? "co  " : "THIEU"} translate="no" — ${o.route} ${c.khoa} = ${JSON.stringify(c.chu)}`,
				);
				if (!c.khongDich) thieuMan += 1;
			}
		}
	}

	console.log("\n-- gieo duoc:");
	for (const d of gieoDuoc) console.log(`   ${d}`);
	console.log("-- khong gieo duoc:");
	for (const d of khongGieo) console.log(`   ${d}`);
	console.log(
		`\nket qua: chan ma thieu thuoc tinh=${thieuMa} · truong chua ghim bieu thuc=${khongMap} · chan man thieu thuoc tinh=${thieuMan}`,
	);
	if (thieuMa > 0 || thieuMan > 0) await ket(1);
	if (khongMap > 0) await ket(2);
	if (khongDoSan.length > 0) {
		for (const d of khongDoSan) console.log(`   KHONG DO DUOC: ${d}`);
		console.log(
			"KHONG DO DUOC: mot o khai do_san_duoc ma khong do duoc — khai va thuc te lech nhau.",
		);
		await ket(2);
	}
	if (donKhongXong.length > 0) {
		for (const d of donKhongXong) console.log(`   DON KHONG XONG: ${d}`);
		console.log(
			"KHONG DO DUOC: du lieu gieo thu co the con o lai workspace — lenh don that bai, khong duoc tinh la dat.",
		);
		await ket(2);
	}
	await ket(0);
}

async function chanTrangThaiRong(cookie, slug) {
	const tt = await trangThai(cookie);
	const doDuoc = [];
	const khongDung = [];
	const sai = [];
	let khongDau = 0;
	for (const c of CAU_RONG) {
		const cho = giaTriKho(c.kho, "vi", c.khoa);
		if (cho === null) {
			khongDung.push(`${c.ten} — kho chuoi ${c.kho} khong co khoa ${c.khoa}`);
			continue;
		}
		const co = await c.dung(cookie, tt);
		if (!co.san) {
			khongDung.push(`${c.ten} — ${co.vi_sao}`);
			continue;
		}
		const mo = await moManMem(cookie, slug, c.man, "vi", RONG);
		if (mo.loi !== null) {
			await mo.trang.close();
			khongDung.push(`${c.ten} — ${mo.loi[0]}`);
			continue;
		}
		if (c.go !== undefined) {
			const o = await mo.trang.$('[data-slot="input-group-control"]');
			if (o === null) {
				await mo.trang.close();
				khongDung.push(`${c.ten} — man khong ve ra o tim de go vao`);
				continue;
			}
			await o.type(c.go);
			await new Promise((r) => setTimeout(r, 1500));
		}
		const chu = await mo.trang.evaluate(() =>
			document.body.textContent.replace(/\s+/g, " "),
		);
		await mo.trang.close();
		if (!chu.includes(cho)) {
			sai.push(
				`${c.ten} — trang thai DUNG DUOC va man mo duoc, nhung man khong hien cau rong ${JSON.stringify(cho)}. Day KHONG phai gioi han: o nay do duoc va no sai.`,
			);
			continue;
		}
		doDuoc.push({ ten: c.ten, chu: cho });
		const dau = DAU_VIET.test(cho);
		if (!dau) khongDau += 1;
		console.log(
			`   ${dau ? "co dau" : "KHONG DAU"} — ${c.ten}: ${JSON.stringify(cho)} (${c.man})`,
		);
	}
	console.log(`\n-- dung duoc ${doDuoc.length}/${CAU_RONG.length} o:`);
	for (const d of doDuoc) console.log(`   ${d.ten}`);
	console.log("-- khong dung duoc:");
	for (const d of khongDung) console.log(`   ${d}`);
	console.log(
		`\nket qua: dung duoc=${doDuoc.length} · khong dung duoc=${khongDung.length} · o dung duoc ma khong co dau tieng Viet=${khongDau} · o do duoc ma man hien sai=${sai.length}`,
	);
	for (const d of sai) console.log(`   DO: ${d}`);
	if (khongDau > 0 || sai.length > 0) await ket(1);
	if (doDuoc.length === 0) {
		console.log(
			"KHONG DO DUOC: khong dung duoc o nao. Tap quan sat rong khong bao gio la dat.",
		);
		await ket(2);
	}
	if (khongDung.length > 0) {
		console.log(
			`GIOI HAN DA KHAI: ${khongDung.length}/${CAU_RONG.length} o khong dung duoc tren may nay (ly do o tren) — chan nay KHONG ha xuong doc ma roi ghi dat cho chung; danh sach mang sang cong ky.`,
		);
		await ket(0);
	}
	await ket(0);
}

async function chanOauth(cookie, slug) {
	const bang = docKhai(`${HERE}/oauth-ma-tran.json`, "oauth-ma-tran");
	const doi = bang.nguon.length * bang.trang_thai.length;
	if (bang.o.length !== doi) {
		console.log(
			`KHONG DO DUOC: ban khai co ${bang.o.length} o ma ma tran doi ${doi}.`,
		);
		await ket(2);
	}
	const tren = new Set();
	const tuChoi = [];
	for (const man of [
		"/settings/connections",
		...bang.nguon
			.map(
				(n) =>
					({
						google: "/settings/connections/google",
						microsoft: "/settings/connections/microsoft",
						slack: "/settings/connections/slack",
						tiepNhan: "/settings/connections/intake",
					})[n],
			)
			.filter(Boolean),
	]) {
		const mo = await moManMem(cookie, slug, man, "vi", RONG);
		if (mo.loi !== null) {
			await mo.trang.close();
			tuChoi.push(`${man}: ${mo.loi[0]}`);
			continue;
		}
		const gia = await gomTrang(mo.trang);
		await mo.trang.close();
		for (const g of gia ?? []) tren.add(g.chu);
	}
	if (tuChoi.length > 0) {
		for (const t of tuChoi) console.log(`   TU CHOI DO man ${t}`);
		console.log(
			`KHONG DO DUOC: tien de thieu — ${tuChoi.length} man cua ma tran khong mo duoc. O nao le ra quan sat tren man se tut xuong muc ma ma tong van bang ${doi}, nen ket qua nay khong noi len dieu gi.`,
		);
		await ket(2);
	}
	if (tren.size === 0) {
		console.log(
			"KHONG DO DUOC: bon man ket noi gom ra 0 chuoi. Tap quan sat rong khong bao gio la dat.",
		);
		await ket(2);
	}
	let quanSat = 0;
	let mucMa = 0;
	let khongCo = 0;
	let hong = 0;
	console.log("\n-- ma tran OAuth, bon nguon x nam trang thai:");
	for (const o of bang.o) {
		const ten = `${o.nguon} x ${o.trang_thai}`;
		if (o.khoa === undefined) {
			if (o.khong_ton_tai === undefined && o.dung_chung === undefined) {
				console.log(
					`   O THIEU: ${ten} — khong khoa, khong dung_chung, khong ly do.`,
				);
				hong += 1;
				continue;
			}
			khongCo += 1;
			console.log(
				`   khong ton tai  ${ten.padEnd(28)} ${o.khong_ton_tai ?? o.dung_chung}`,
			);
			continue;
		}
		const nhom = o.khoa.split(".")[0];
		const chuVi = giaTriKho("ketNoi", "vi", o.khoa);
		const chuEn = giaTriKho("ketNoi", "en", o.khoa);
		if (chuVi === null) {
			console.log(`   O THIEU: ${ten} — kho chuoi khong co khoa ${o.khoa}.`);
			hong += 1;
			continue;
		}
		const nut = demNutDocKhoa(`${nhom}.${o.khoa.split(".")[1]}`);
		if (nut.length === 0) {
			console.log(
				`   O THIEU: ${ten} — khong con nut cay cu phap nao doc ${o.khoa}.`,
			);
			hong += 1;
			continue;
		}
		if (chuVi === chuEn) {
			console.log(
				`   O HONG: ${ten} — ban vi cua ${o.khoa} y het ban en, tuc khoa nay chua dich: ${JSON.stringify(chuVi)}`,
			);
			hong += 1;
			continue;
		}
		if (!DAU_VIET.test(chuVi)) {
			console.log(
				`   O HONG: ${ten} — ban vi cua ${o.khoa} khong mang dau: ${JSON.stringify(chuVi)}`,
			);
			hong += 1;
			continue;
		}
		if (tren.has(chuVi)) {
			quanSat += 1;
			console.log(
				`   quan sat tren man ${ten.padEnd(28)} ${o.khoa} = ${JSON.stringify(chuVi)}`,
			);
			continue;
		}
		mucMa += 1;
		console.log(
			`   do muc ma       ${ten.padEnd(28)} ${o.khoa} = ${JSON.stringify(chuVi)} · ${nut.length} nut: ${nut.join(" ")}`,
		);
	}
	const tong = quanSat + mucMa + khongCo;
	console.log(
		`\nket qua: quan sat tren man=${quanSat} + do muc ma=${mucMa} + khai khong ton tai=${khongCo} = ${tong} · doi ${doi} · o hong=${hong}`,
	);
	if (hong > 0) await ket(1);
	if (tong !== doi) {
		console.log(`KHONG DO DUOC: thieu ${doi - tong} o cua ma tran.`);
		await ket(2);
	}
	await ket(0);
}

function gomTrangTri(s) {
	return s
		.replace(/\s+/g, " ")
		.replace(/\s+>/g, ">")
		.replace(/<\s+/g, "<")
		.trim();
}

function lechByte(a, b) {
	const x = Buffer.from(a, "utf8");
	const y = Buffer.from(b, "utf8");
	const n = Math.min(x.length, y.length);
	for (let i = 0; i < n; i += 1) if (x[i] !== y[i]) return i;
	return x.length === y.length ? -1 : n;
}

async function docDoanTrenMan(trang) {
	return trang.evaluate(() =>
		[...document.querySelectorAll('pre, code, [translate="no"]')]
			.filter((el) => {
				const r = el.getBoundingClientRect();
				return r.width > 0 && r.height > 0;
			})
			.map((el) => ({
				the: el.tagName.toLowerCase(),
				chu: (el.tagName === "INPUT" ? el.value : el.textContent) ?? "",
				khongDich: Boolean(el.closest('[translate="no"]')),
				chungCu: el.matches("pre, code"),
			}))
			.concat(
				[...document.querySelectorAll("input[translate='no']")].map((el) => ({
					the: "input",
					chu: el.value ?? "",
					khongDich: true,
					chungCu: false,
				})),
			)
			.filter((o) => o.chu.trim() !== ""),
	);
}

async function doTheScript(cookie, slug, tieng) {
	const mo = await moManMem(cookie, slug, "/settings/tracking", tieng, RONG);
	if (mo.loi !== null) {
		await mo.trang.close();
		return { loi: mo.loi[0] };
	}
	const nut = await mo.trang.$$('[data-slot="accordion-trigger"]');
	if (nut.length < 2) {
		await mo.trang.close();
		return { loi: "man theo doi khong ve ra hai muc gap cua the script" };
	}
	const html = await mo.trang.$$eval("pre", (els) =>
		els.map((el) => el.textContent),
	);
	await nut[1].click();
	await new Promise((r) => setTimeout(r, 900));
	const gtm = await mo.trang.$$eval("pre", (els) =>
		els.map((el) => el.textContent),
	);
	const doan = await docDoanTrenMan(mo.trang);
	await mo.trang.close();
	return { html: html[0] ?? null, gtm: gtm[gtm.length - 1] ?? null, doan };
}

async function chanDoanMaChep(cookie, slug) {
	const bang = docKhai(`${HERE}/doan-ma-chep.json`, "doan-ma-chep");
	const neoVat = docKhai(`${HERE}/lat-cai-dat-2.json`, "lat-cai-dat-2").neo?.file_vat_chep;
	const fileRieng = new Set(bang.doan.map((d) => d.file)).size;
	if (Number.isInteger(neoVat) && neoVat !== fileRieng) {
		console.log(
			`KHONG DO DUOC: neo file_vat_chep ghim ${neoVat} ma bang doan-ma-chep.json co ${fileRieng} file rieng. Day la kiem tu-nhat-quan giua hai ban khai tay, khong phai dem tren dia — lech nghia la mot trong hai ban khai da lac.`,
		);
		await ket(2);
	}
	console.log(`neo: ${fileRieng}/${neoVat} file co vat chep — khop`);
	const tt = await trangThai(cookie);
	const lech = [];
	const nguonDaSo = new Set();
	const khongDo2 = [];
	const daDo = [];
	const ungVien = new Map();

	const buocPhaiCo = bang.doan.filter((d) => d.phai_co_translate_no !== true);
	if (buocPhaiCo.length > 0) {
		console.log(
			`KHONG DO DUOC: ${buocPhaiCo.length} dong khai phai_co_translate_no khac true (${buocPhaiCo.map((d) => d.ten).join(" · ")}). Chan nay chi cai dat ve TRUE — no doi thuoc tinh o MOI ung vien, nen mot dong khai false se duoc cham sai.`,
		);
		await ket(2);
	}

	for (const tieng of ["vi", "en"]) {
		const ra = await doTheScript(cookie, slug, tieng);
		if (ra.loi !== undefined) {
			khongDo2.push(`the script theo doi (lang=${tieng}) — ${ra.loi}`);
			continue;
		}
		for (const d of ra.doan) ungVien.set(d.chu.replace(/\s+/g, " ").trim(), d);
		const mongHtml = tt.theoDoi.snippet;
		const mongGtm = tt.theoDoi.tagManagerSnippet;
		if (String(mongHtml ?? "") !== mongHtml || String(mongGtm ?? "") !== mongGtm) {
			khongDo2.push(
				`the script (lang=${tieng}) — tracking.settings khong tra ve snippet/tagManagerSnippet, nen khong co nguon ngoai man de so`,
			);
			continue;
		}
		for (const [ten, that, mong] of [
			["the script theo doi", ra.html, mongHtml],
			["the script qua Tag Manager", ra.gtm, mongGtm],
		]) {
			if (that === null) {
				khongDo2.push(`${ten} (lang=${tieng}) — man khong ve ra khoi ma`);
				continue;
			}
			daDo.push(`${ten} (lang=${tieng})`);
			const gonMan = gomTrangTri(that);
			const gonNguon = gomTrangTri(mong);
			nguonDaSo.add(gonNguon);
			const i = lechByte(gonMan, gonNguon);
			if (i === -1) {
				console.log(
					`   khop tung byte voi NGUON NGOAI MAN (tracking.settings) — ${ten} (lang=${tieng}); man xuong dong cho de doc nen hai ben cung gom khoang trang trang tri truoc khi so — moi ky tu khac deu duoc so tung byte`,
				);
				continue;
			}
			lech.push(
				`${ten} (lang=${tieng}) lech tu byte ${i}: man co ${JSON.stringify(gonMan.slice(Math.max(0, i - 12), i + 12))} · nguon (tracking.settings) co ${JSON.stringify(gonNguon.slice(Math.max(0, i - 12), i + 12))}`,
			);
		}
	}

	for (const tieng of ["vi", "en"]) {
		const ten = `chan-do-${Date.now()}`;
		const mo = await moManMem(cookie, slug, "/settings/api-keys", tieng, RONG);
		if (mo.loi !== null) {
			await mo.trang.close();
			khongDo2.push(`khoa API vua tao (lang=${tieng}) — ${mo.loi[0]}`);
			continue;
		}
		let traVe = null;
		mo.trang.on("response", async (res) => {
			if (!res.url().includes("apiKeys.create")) return;
			try {
				const j = await res.json();
				const d = Array.isArray(j) ? j[0]?.result?.data : j?.result?.data;
				if (d !== undefined && d !== null) traVe = d.json ?? d;
			} catch {}
		});
		const nut = await mo.trang.$('[data-slot="page-shell-actions"] button');
		if (nut === null) {
			await mo.trang.close();
			khongDo2.push(
				`khoa API vua tao (lang=${tieng}) — man khong ve ra nut tao khoa`,
			);
			continue;
		}
		await nut.click();
		await new Promise((r) => setTimeout(r, 900));
		const o = await mo.trang.$("form input");
		if (o === null) {
			await mo.trang.close();
			khongDo2.push(
				`khoa API vua tao (lang=${tieng}) — hop tao khoa khong mo ra`,
			);
			continue;
		}
		await o.type(ten);
		const gui = await mo.trang.$('button[type="submit"]');
		if (gui === null) {
			await mo.trang.close();
			khongDo2.push(
				`khoa API vua tao (lang=${tieng}) — hop tao khoa khong co nut gui`,
			);
			continue;
		}
		await gui.click();
		await new Promise((r) => setTimeout(r, 3500));
		const tren = await mo.trang.$$eval("input[translate='no']", (els) =>
			els.map((el) => el.value),
		);
		const doan = await docDoanTrenMan(mo.trang);
		await mo.trang.close();
		for (const d of doan) ungVien.set(d.chu.replace(/\s+/g, " ").trim(), d);
		if (traVe === null || traVe.key === undefined || traVe.key === null) {
			const don = await goiApiMem(cookie, "apiKeys.list", {});
			for (const row of don.gia?.rows ?? [])
				if (row.name === ten)
					await goiApiTao(cookie, "apiKeys.revoke", { id: row.id });
			khongDo2.push(
				`khoa API vua tao (lang=${tieng}) — khong bat duoc gia tri tra ve cua apiKeys.create`,
			);
			continue;
		}
		await goiApiTao(cookie, "apiKeys.revoke", { id: traVe.id });
		daDo.push(`khoa API vua tao (lang=${tieng})`);
		const thay = tren.find((v) => v.startsWith("crm_")) ?? null;
		if (thay === null) {
			lech.push(
				`khoa API vua tao (lang=${tieng}) — man khong hien khoa nao trong o translate="no"`,
			);
			continue;
		}
		const i = lechByte(thay, traVe.key);
		if (i === -1) {
			console.log(`   khop tung byte — khoa API vua tao (lang=${tieng})`);
			continue;
		}
		lech.push(
			`khoa API vua tao (lang=${tieng}) lech tu byte ${i}: man co ${JSON.stringify(thay)} · API tra ve ${JSON.stringify(traVe.key)}`,
		);
	}

	for (const route of [...new Set(bang.doan.map((d) => d.route))].sort())
		for (const tieng of ["vi", "en"]) {
			const mo = await moManMem(cookie, slug, route, tieng, RONG);
			if (mo.loi !== null) {
				await mo.trang.close();
				khongDo2.push(`ung vien tren ${route} (lang=${tieng}) — ${mo.loi[0]}`);
				continue;
			}
			const doan = await docDoanTrenMan(mo.trang);
			await mo.trang.close();
			for (const d of doan)
				ungVien.set(d.chu.replace(/\s+/g, " ").trim(), d);
		}

	if (tt.ssoCauHinh.canConfigure)
		for (const tieng of ["vi", "en"]) {
			const ten = "chan-do-sso";
			const nhan = `URI chuyen huong o hop them nha cung cap SSO (lang=${tieng})`;
			const mo = await moManMem(cookie, slug, "/settings/sso", tieng, RONG);
			if (mo.loi !== null) {
				await mo.trang.close();
				khongDo2.push(`${nhan} — ${mo.loi[0]}`);
				continue;
			}
			const nut = await mo.trang.$('[data-slot="sheet-trigger"]');
			if (nut === null) {
				await mo.trang.close();
				khongDo2.push(`${nhan} — man khong ve ra nut them nha cung cap`);
				continue;
			}
			await nut.click();
			await new Promise((r) => setTimeout(r, 900));
			const o = await mo.trang.$('[data-slot="sheet-content"] form input');
			if (o === null) {
				await mo.trang.close();
				khongDo2.push(`${nhan} — hop them nha cung cap khong mo ra`);
				continue;
			}
			await o.type(ten);
			await new Promise((r) => setTimeout(r, 400));
			const tren = await mo.trang.$$eval(
				'[data-slot="sheet-content"] input[readonly][translate="no"]',
				(els) => els.map((el) => el.value),
			);
			const doan = await docDoanTrenMan(mo.trang);
			await mo.trang.close();
			for (const d of doan) ungVien.set(d.chu.replace(/\s+/g, " ").trim(), d);
			daDo.push(nhan);
			const mong = `${tt.ssoCauHinh.callbackBase}/${ten}`;
			nguonDaSo.add(gomTrangTri(mong));
			if (tren.length !== 1) {
				lech.push(
					`${nhan} — hop co ${tren.length} o chi-doc mang translate="no", mong dung mot`,
				);
				continue;
			}
			const i = lechByte(tren[0], mong);
			if (i === -1) {
				console.log(
					`   khop tung byte voi NGUON NGOAI MAN (sso.settings callbackBase + ten nha cung cap vua go) — ${nhan}`,
				);
				continue;
			}
			lech.push(
				`${nhan} lech tu byte ${i}: man co ${JSON.stringify(tren[0])} · nguon co ${JSON.stringify(mong)}`,
			);
		}
	if (!tt.ssoCauHinh.canConfigure)
		khongDo2.push(
			`URI chuyen huong o hop them nha cung cap SSO — sso.settings tra canConfigure=false cho vai tro "${tt.noiLam.viewerRole}", nut them bi khoa`,
		);
	if ((tt.ssoBang.rows ?? []).length === 0)
		khongDo2.push(
			"URI chuyen huong tren tung dong bang SSO — bang SSO khong co dong nao",
		);
	if (!tt.slack.connected)
		khongDo2.push(
			"lenh moi bot vao kenh Slack — Slack chua cam vao workspace nay",
		);

	console.log("\n-- bang doan ma chep, doi chieu voi nguon ngoai man:");
	for (const d of bang.doan)
		console.log(`   ${d.nguon.padEnd(14)} ${d.ten} <- ${d.file}`);
	console.log(`\n-- ung vien sinh tu DOM: ${ungVien.size} khoi`);
	for (const [chu, o] of [...ungVien].sort())
		console.log(
			`   ${o.khongDich ? 'translate="no"' : "KHONG CO thuoc tinh"} <${o.the}> ${JSON.stringify(chu.slice(0, 70))}`,
		);
	const chungCu = [...ungVien.values()].filter((o) => o.chungCu);
	console.log(
		`   trong do ${chungCu.length} khoi <pre>/<code> la CHUNG CU — go thuoc tinh boc chung la chan nay do; ${ungVien.size - chungCu.length} khoi con lai TIM THAY BANG CHINH thuoc tinh translate="no", nen chung khong khai duoc gi ve viec thieu thuoc tinh.`,
	);
	console.log("\n-- doi chieu HAI CHIEU bang <-> man:");
	const dongKhongAiDo = [];
	for (const d of bang.doan) {
		const doRoi = daDo.some((x) => x.startsWith(d.ten));
		const khaiKhongDo = khongDo2.some((x) => x.startsWith(d.ten));
		console.log(
			`   ${doRoi ? "da do   " : khaiKhongDo ? "khai khong do" : "KHONG AI DO"} ${d.ten}`,
		);
		if (!doRoi && !khaiKhongDo) dongKhongAiDo.push(d.ten);
	}
	const chungCuLa = chungCu.filter(
		(o) => !nguonDaSo.has(gomTrangTri(o.chu)),
	);
	for (const o of chungCuLa)
		console.log(
			`   THUA: khoi <${o.the}> tren man ${JSON.stringify(o.chu.slice(0, 60))} khong khop nguon nao da so — bang khong co dong cho no.`,
		);
	const khongMangThuocTinh = [...ungVien.values()].filter((o) => !o.khongDich);

	console.log(`\n-- da do: ${daDo.length} luot`);
	for (const d of daDo) console.log(`   ${d}`);
	console.log(`-- lech so voi nguon: ${lech.length}`);
	for (const d of lech) console.log(`   DO: ${d}`);
	console.log(`-- khong do duoc: ${khongDo2.length}`);
	for (const d of khongDo2) console.log(`   ${d}`);
	if (lech.length > 0 || khongMangThuocTinh.length > 0 || chungCuLa.length > 0) {
		for (const o of khongMangThuocTinh)
			console.log(
				`   DO: khoi ma ${JSON.stringify(o.chu.slice(0, 40))} khong nam trong phan tu mang translate="no".`,
			);
		await ket(1);
	}
	if (dongKhongAiDo.length > 0) {
		console.log(
			`KHONG DO DUOC: ${dongKhongAiDo.length} dong khai khong duoc do va cung khong co dong khai ly do khong do duoc: ${dongKhongAiDo.join(" · ")}.`,
		);
		await ket(2);
	}
	if (daDo.length === 0) {
		await khongDo(
			"KHONG DO DUOC: 0 doan do duoc. Tap quan sat rong khong bao gio la dat.",
		);
	}
	if (khongDo2.length > 0)
		console.log(
			`GIOI HAN DA KHAI: ${khongDo2.length} vat khong do duoc tren may nay (ly do o tren) — ${daDo.length} vat do duoc deu khop tung byte; danh sach mang sang cong ky.`,
		);
	await ket(0);
}

async function chanBeRong(cookie, slug) {
	const r = danhSachRoute();
	const tuChoi = [];
	let nhan = 0;
	let viTran = 0;
	let caHai = 0;
	let enTran = 0;
	for (const man of r.do) {
		const lay = async (tieng) => {
			const mo = await moManMem(cookie, slug, man, tieng, HEP);
			if (mo.loi !== null) {
				await mo.trang.close();
				return null;
			}
			const gia = await doRongTrang(mo.trang);
			await mo.trang.close();
			return gia === null ? null : new Map(gia.map((g) => [g.khoa, g]));
		};
		const vi = await lay("vi");
		const en = await lay("en");
		if (vi === null || en === null) {
			tuChoi.push(man);
			console.log(`\n-- man ${man} o ${HEP}px: TU CHOI DO`);
			continue;
		}
		const cap = [...vi.keys()].filter((k) => {
			const b = en.get(k);
			return b !== undefined && b.chu !== vi.get(k).chu;
		});
		console.log(
			`\n-- man ${man} o ${HEP}px · phan tu co chu: vi=${vi.size} en=${en.size} · nhan dich duoc=${cap.length}`,
		);
		nhan += cap.length;
		for (const k of cap) {
			const a = vi.get(k);
			const b = en.get(k);
			const ta = a.scrollWidth > a.clientWidth;
			const tb = b.scrollWidth > b.clientWidth;
			if (!ta && !tb) continue;
			if (ta && tb) {
				caHai += 1;
				console.log(
					`   TRAN CA HAI LUOT: ${JSON.stringify(a.chu)} — vi ${a.scrollWidth}/${a.clientWidth}px · en ${b.scrollWidth}/${b.clientWidth}px — ${k}`,
				);
				continue;
			}
			if (ta) {
				viTran += 1;
				console.log(
					`   TRAN: ${JSON.stringify(a.chu)} — vi ${a.scrollWidth}/${a.clientWidth}px · doi chung en ${b.scrollWidth}/${b.clientWidth}px vua — ${k}`,
				);
				continue;
			}
			enTran += 1;
			console.log(
				`   DOI CHUNG DUONG: ban en tran ma ban vi vua: ${JSON.stringify(b.chu)} — en ${b.scrollWidth}/${b.clientWidth}px — ${k}`,
			);
		}
	}
	console.log(
		`\nGIOI HAN KE THUA: chan nay mu voi vung chua cho xuong dong — no chung "khong cho nao bi cat", khong chung "moi nhan vua mat".`,
	);
	console.log(
		`\nket qua ${HEP}px: ${nhan} nhan dich duoc tren ${r.do.length - tuChoi.length}/${r.do.length} route · vi tran ma en vua=${viTran} · tran ca hai luot=${caHai} · en tran ma vi vua=${enTran}`,
	);
	if (viTran + caHai > 0) await ket(1);
	if (nhan === 0) {
		await khongDo(
			`KHONG DO DUOC: 0 nhan dich duoc o ${HEP}px. Tap quan sat rong khong bao gio la dat.`,
		);
	}
	if (tuChoi.length > 0) {
		console.log(`KHONG DO DUOC: khong dung duoc route: ${tuChoi.join(" · ")}`);
		await ket(2);
	}
	await ket(0);
}

const BO_CHAN = {
	"hai-tieng": chanHaiTieng,
	"khong-dich": chanKhongDich,
	"du-lieu-nguoi-nhap": chanDuLieuNguoiNhap,
	"trang-thai-rong": chanTrangThaiRong,
	oauth: chanOauth,
	"doan-ma-chep": chanDoanMaChep,
	"be-rong": chanBeRong,
};

const chan = process.argv[2] ?? "";
if (BO_CHAN[chan] === undefined) {
	console.log(
		`KHONG DO DUOC: chan phai la mot trong: ${Object.keys(BO_CHAN).join(" | ")}. Nhan duoc: ${JSON.stringify(chan)}`,
	);
	process.exit(2);
}

docKhai(`${HERE}/lat-cai-dat-2.json`, "lat-cai-dat-2");

const cookie = phien();
const slug = await suySlug(cookie);
const trinhDuyet = await puppeteer.launch({
	executablePath: CHROME,
	headless: "new",
	args: ["--no-sandbox", `--window-size=${RONG},${CAO}`],
});
datTrinhDuyet(trinhDuyet);

const boQuaCuoi = routeKhaiKhongDung();
const r = sinhRouteCaiDat([...MAN, ...boQuaCuoi.map((x) => x.route)]);
console.log(
	`-- kho ${GOC} · workspace "${slug}" · vai tro nguoi do se doc tu may chu · ${r.do.length} route cua lat (thu muc sinh ${r.het.length}) · chan ${chan}`,
);

await BO_CHAN[chan](cookie, slug);
