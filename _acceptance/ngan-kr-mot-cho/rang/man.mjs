import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tachLoiConsole } from "./loi-console.mjs";

const TEP = fileURLToPath(import.meta.url);
const HERE = dirname(TEP);
const GOC = join(HERE, "..", "..", "..");
const ANH = join(GOC, "_acceptance/ngan-kr-mot-cho/evidence");
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const GIAY_MS = 1000;
const MAN = {
	chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	kho: {
		1440: { rong: 1440, cao: 1000 },
		390: { rong: 390, cao: 844 },
	},
	cho: { manMs: 120 * GIAY_MS, yenMs: 1500 },
	soAnh: 8,
	soBam: 3,
	rongChen: "4000px",
};
const CONG_CAM = new Set(["3000", "3001"]);

export function tachChong(record) {
	return (record ?? "").split(",").filter(Boolean);
}

export const dinhChong = (record) => tachChong(record).at(-1) ?? null;

export function giaTriCu(krMau, dienBien) {
	if (!krMau.kichBan) return krMau.khoi;
	return (
		dienBien({ ...krMau, kichBan: krMau.kichBan }).at(-1)?.giaTri ?? krMau.khoi
	);
}

export function diemTuanNay(dienBienOut, homNay) {
	return dienBienOut.diem.reduce(
		(cu, d) => (d.tuan <= homNay && d.giaTri !== null ? d : cu),
		null,
	);
}

export function giuDuoi(truoc, sau) {
	return (
		truoc.length === sau.length &&
		truoc.slice(0, -1).every((r, i) => r === sau[i])
	);
}

export function congCuaUrl(url) {
	const u = new URL(url);
	return u.port || (u.protocol === "https:" ? "443" : "80");
}

function doTran(rongChen) {
	const trang = document.scrollingElement ?? document.documentElement;
	const tran = () => trang.scrollWidth > trang.clientWidth + 1;
	const truoc = tran();
	const rong = document.createElement("div");
	rong.style.width = rongChen;
	rong.style.height = "1px";
	document.body.appendChild(rong);
	const doiChung = tran();
	rong.remove();
	return { truoc, doiChung };
}

function tuKiem() {
	const loi = [];
	const dat = (nhan, dung) => {
		if (!dung) loi.push(nhan);
	};
	dat("tachChong rong", tachChong(null).length === 0);
	dat(
		"tachChong hai tang",
		JSON.stringify(tachChong("objective:m,kr:k")) ===
			JSON.stringify(["objective:m", "kr:k"]),
	);
	dat("dinhChong", dinhChong("objective:m,kr:k") === "kr:k");
	dat(
		"giuDuoi dung",
		giuDuoi(["objective:m", "kr:a"], ["objective:m", "kr:b"]),
	);
	dat("giuDuoi doi do dai", !giuDuoi(["kr:a"], ["objective:m", "kr:b"]));
	dat(
		"giuDuoi doi duoi",
		!giuDuoi(["objective:m", "kr:a"], ["objective:x", "kr:b"]),
	);
	const db = {
		diem: [
			{ tuan: "2026-10-05", giaTri: 3, tuTin: "vua" },
			{ tuan: "2026-10-12", giaTri: 5, tuTin: "cao" },
			{ tuan: "2026-10-19", giaTri: null, tuTin: null },
		],
	};
	dat("diemTuanNay", diemTuanNay(db, "2026-10-20")?.giaTri === 5);
	dat("diemTuanNay truoc ky", diemTuanNay(db, "2026-10-01") === null);
	dat("giaTriCu khong kich ban", giaTriCu({ khoi: 7 }, () => []) === 7);
	dat(
		"giaTriCu lan cuoi",
		giaTriCu({ khoi: 0, kichBan: "deu" }, () => [
			{ giaTri: 2 },
			{ giaTri: 4 },
		]) === 4,
	);
	dat("congCuaUrl", congCuaUrl("http://localhost:3500") === "3500");
	for (const l of loi) console.log(`SAI tu kiem: ${l}`);
	console.log(loi.length === 0 ? "DUNG tu kiem" : "SAI tu kiem");
	process.exit(loi.length === 0 ? 0 : 1);
}

if (process.argv.includes("--tu-kiem")) tuKiem();

const dong = [];
let sai = 0;

function ket(ma) {
	for (const d of dong) console.log(d);
	console.log(
		`KET LUAN: ${dong.filter((d) => d.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
	);
	process.exit(ma);
}
function khongDo(cau) {
	dong.push(`KHONG DO DUOC: ${cau}`);
	ket(2);
}
function kiem(nhan, dat) {
	dong.push(`${dat ? "DUNG" : "SAI"} ${nhan}`);
	if (!dat) sai += 1;
	return dat;
}

const doiSo = (ten) =>
	process.argv.includes(ten)
		? (process.argv[process.argv.indexOf(ten) + 1] ?? "")
		: "";

async function suySlug(cookie) {
	const res = await fetch(`${APP}/`, {
		redirect: "manual",
		headers: { cookie: `${cookie.ten}=${cookie.gia}; lang=vi` },
	});
	const dich = res.headers.get("location");
	if (!dich) return null;
	const dau = new URL(dich, APP).pathname
		.replace(/^\/+|\/+$/g, "")
		.split("/")[0];
	return dau &&
		!["onboarding", "sign-in", "het-quyen"].some((x) => dau.startsWith(x))
		? dau
		: null;
}

async function doKho(tenKho, ca) {
	const { default: puppeteer } = await import("puppeteer-core");
	const { trpc, ngayVN, tre } = await import(
		"../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs"
	);
	const kho = MAN.kho[tenKho];
	const host = new URL(APP).hostname;
	const goi = trpc(API, ca.cookie);
	const trinhDuyet = await puppeteer.launch({
		executablePath: MAN.chrome,
		headless: true,
	});
	try {
		const ctx = await trinhDuyet.createBrowserContext();
		await ctx.setCookie(
			{ name: ca.cookie.ten, value: ca.cookie.gia, domain: host, path: "/" },
			{ name: "lang", value: "vi", domain: host, path: "/" },
		);
		const p = await ctx.newPage();
		await p.setViewport({
			width: kho.rong,
			height: kho.cao,
			deviceScaleFactor: 1,
		});
		p.setDefaultNavigationTimeout(MAN.cho.manMs);
		p.setDefaultTimeout(MAN.cho.manMs);
		const loiConsole = [];
		p.on("console", (msg) => {
			if (msg.type() === "error") loiConsole.push(msg.text());
		});
		const chup = async (ten) => {
			await tre(MAN.cho.yenMs);
			await p.evaluate(() => {
				for (const s of [
					"nextjs-portal",
					".tsqd-parent-container",
					".tsqd-open-btn-container",
				])
					for (const el of document.querySelectorAll(s)) el.remove();
			});
			const tep = join(ANH, `${ten}-${tenKho}.png`);
			await p.screenshot({ path: tep });
			dong.push(`ANH ${tep.slice(GOC.length + 1)}`);
		};
		const record = () => new URL(p.url()).searchParams.get("record");
		const choDinh = (dich) =>
			p.waitForFunction(
				(d) =>
					(new URLSearchParams(location.search).get("record") ?? "")
						.split(",")
						.filter(Boolean)
						.at(-1) === d,
				{},
				dich,
			);
		const trangDonVi = `${APP}/${ca.slug}/okr/theo-don-vi?kyOkr=${ca.ky}&donOkr=pb:${ca.pb}&expand=${ca.m}`;
		const nutDong = async () => {
			await p.waitForFunction(
				(ten) =>
					[...document.querySelectorAll('[data-nut="cap-nhat-dong-kr"]')].some(
						(b) => (b.getAttribute("aria-label") ?? "").includes(ten),
					),
				{},
				ca.tenK,
			);
			return p.evaluateHandle(
				(ten) =>
					[...document.querySelectorAll('[data-nut="cap-nhat-dong-kr"]')].find(
						(b) => (b.getAttribute("aria-label") ?? "").includes(ten),
					),
				ca.tenK,
			);
		};
		const hop = `[data-hop-cap-nhat-kr="${ca.k}"]`;
		const goGiaTri = async (giaTri) => {
			const o = await p.$eval(
				`${hop} input[id="${ca.k}-gia-tri"]`,
				(e) => e.value,
			);
			await p.keyboard.press("End");
			for (let i = 0; i < o.length; i += 1) await p.keyboard.press("Backspace");
			await p.keyboard.type(String(giaTri));
		};
		const bamTuTin = async (muc) => {
			const nut = await p.evaluateHandle(
				(h, nhan) =>
					[...document.querySelectorAll(`${h} [data-o="tu-tin"] button`)].find(
						(b) => (b.textContent ?? "").trim().endsWith(nhan),
					),
				hop,
				ca.nhanTuTin[muc],
			);
			await p.waitForFunction(
				(h) =>
					(document.querySelector(h)?.getAnimations({ subtree: true }) ?? [])
						.length === 0,
				{},
				hop,
			);
			await nut.click();
			const chon = await p.$$eval(`${hop} [data-o="tu-tin"] button`, (ds) =>
				ds.map(
					(b) =>
						`${(b.textContent ?? "").trim()}=${b.getAttribute("data-state")}`,
				),
			);
			dong.push(`TU TIN ${tenKho} bam ${muc}: ${chon.join(" ")}`);
		};
		const guiVaDong = async () => {
			await p.click(`${hop} [data-nut="gui-cap-nhat-kr"]`);
			await p.waitForFunction(
				(h) => document.querySelector(h) === null,
				{},
				hop,
			);
		};
		const docLai = async () => {
			const db = await goi.hoi("okr.dienBien", { keyResultId: ca.k });
			const mt = await goi.hoi("okr.objective", { id: ca.m });
			const kr = mt.keyResults.find((x) => x.id === ca.k);
			return { diem: diemTuanNay(db, ngayVN()), hienTai: kr?.currentValue };
		};
		const capNhatTuDong = async (giaTri, muc, tenAnh) => {
			await p.evaluate(() => {
				window.__demBam = 0;
				document.addEventListener(
					"click",
					(e) => {
						if (e.isTrusted) window.__demBam += 1;
					},
					true,
				);
			});
			await (await nutDong()).click();
			await p.waitForSelector(hop, { visible: true });
			const tieuDiem = await p.evaluate(
				(k) => document.activeElement?.id === `${k}-gia-tri`,
				ca.k,
			);
			kiem(`${tenKho} dong: o gia tri co tieu diem khi hop mo`, tieuDiem);
			await goGiaTri(giaTri);
			await bamTuTin(muc);
			const diemMoi = await p
				.waitForSelector(`${hop} [data-diem-moi]`, { timeout: 10 * GIAY_MS })
				.then(() => true)
				.catch(() => false);
			kiem(`${tenKho} dong: hop co diem moi truoc khi gui`, diemMoi);
			await chup(tenAnh);
			await guiVaDong();
			const soBam = await p.evaluate(() => window.__demBam);
			kiem(`${tenKho} dong: so bam ${soBam}`, soBam === MAN.soBam);
			const lai = await docLai();
			kiem(
				`${tenKho} dong: doc lai gia tri ${lai.diem?.giaTri}/${lai.hienTai} tu tin ${lai.diem?.tuTin} (go ${giaTri}, bam ${muc})`,
				lai.diem?.giaTri === giaTri &&
					lai.hienTai === giaTri &&
					lai.diem?.tuTin === muc,
			);
		};

		await p.goto(trangDonVi, { waitUntil: "load" });
		await p.evaluate(() => document.fonts.ready);
		if (tenKho === "1440") {
			await capNhatTuDong(ca.cu + 1, ca.tuTin.dong, "hop-dong");

			await p.click(`[data-kr="${ca.k}"]`);
			await choDinh(`kr:${ca.k}`);
			await p.waitForSelector(`[data-kr-sheet="${ca.k}"] [data-than-ngan-kr]`, {
				visible: true,
			});
			kiem(
				`ngan 1440: mo tu dong, record=${record()}`,
				dinhChong(record()) === `kr:${ca.k}`,
			);
			await chup("ngan-kr");
			const oHienTai = `[data-kr-sheet="${ca.k}"] [data-muc-ngan="so"] [data-o-so="hien-tai"]`;
			const dongLichSu = `[data-kr-sheet="${ca.k}"] [data-muc-ngan="lich-su"] [data-lan-cap-nhat]`;
			await p.waitForSelector(dongLichSu);
			const hienTruoc = await p.$eval(oHienTai, (e) => e.textContent ?? "");
			const lichTruoc = await p.$$eval(dongLichSu, (ds) => ds.length);
			await p.click(`[data-kr-sheet="${ca.k}"] [data-nut="cap-nhat-ngan-kr"]`);
			await p.waitForSelector(hop, { visible: true });
			await goGiaTri(ca.cu + 2);
			await bamTuTin(ca.tuTin.ngan);
			await guiVaDong();
			await p
				.waitForFunction(
					(s, cu) => (document.querySelector(s)?.textContent ?? "") !== cu,
					{ timeout: 30 * GIAY_MS },
					oHienTai,
					hienTruoc,
				)
				.catch(() => {});
			const hienSau = await p.$eval(oHienTai, (e) => e.textContent ?? "");
			const moiNhat = `${dongLichSu} [data-gia-tri-lan]`;
			const coSoMoi = (chu, so) => new RegExp(`(^|\\D)${so}(\\D|$)`).test(chu);
			await p
				.waitForFunction(
					(s, so) =>
						new RegExp(`(^|\\D)${so}(\\D|$)`).test(
							document.querySelector(s)?.textContent ?? "",
						),
					{ timeout: 30 * GIAY_MS },
					moiNhat,
					ca.cu + 2,
				)
				.catch(() => {});
			const lichSau = await p.$$eval(dongLichSu, (ds) => ds.length);
			const chuMoiNhat = await p.$eval(moiNhat, (e) => e.textContent ?? "");
			kiem(
				`ngan 1440: sau gui ngan van mo tren K (record=${record()})`,
				dinhChong(record()) === `kr:${ca.k}` &&
					(await p.$(`[data-kr-sheet="${ca.k}"]`)) !== null,
			);
			kiem(
				`ngan 1440: Hien tai doi (${hienTruoc} -> ${hienSau})`,
				hienSau !== hienTruoc,
			);
			kiem(
				`ngan 1440: lich su moi nhat «${chuMoiNhat}» hien ${ca.cu + 2} (dong ${lichTruoc} -> ${lichSau}, gom theo tuan)`,
				coSoMoi(chuMoiNhat, ca.cu + 2) && lichSau >= lichTruoc,
			);
			const lai = await docLai();
			kiem(
				`ngan 1440: doc lai ${lai.diem?.giaTri} tu tin ${lai.diem?.tuTin}`,
				lai.diem?.giaTri === ca.cu + 2 && lai.diem?.tuTin === ca.tuTin.ngan,
			);
			await chup("ngan-sau-cap-nhat");

			const chongTruoc = tachChong(record());
			await p.click(`[data-kr-sheet="${ca.k}"] [data-nut="kr-ke"]`);
			await choDinh(`kr:${ca.kKe}`);
			await p.waitForSelector(
				`[data-kr-sheet="${ca.kKe}"] [data-than-ngan-kr]`,
				{ visible: true },
			);
			const chongSau = tachChong(record());
			kiem(
				`kr-ke 1440: ${chongTruoc.join(",")} -> ${chongSau.join(",")}`,
				giuDuoi(chongTruoc, chongSau) && chongSau[0] === `objective:${ca.m}`,
			);
			await chup("kr-ke");

			await p.goto(`${APP}/${ca.slug}/okr/quanh-muc-tieu/${ca.m}`, {
				waitUntil: "load",
			});
			await p.waitForSelector(`[data-quanh-the="${ca.k}"]`, { visible: true });
			await p.click(`[data-quanh-the="${ca.k}"]`);
			await choDinh(`kr:${ca.k}`).catch(() => {});
			kiem(
				`so-do 1440: record=${record()}`,
				dinhChong(record()) === `kr:${ca.k}`,
			);
			await chup("so-do");

			await p.goto(`${APP}/${ca.slug}`, { waitUntil: "load" });
			const oCuaToi = `[data-kr-cua-toi="${ca.k}"] [data-mo-kr="${ca.k}"]`;
			await p.waitForSelector(oCuaToi, { visible: true });
			await p.click(oCuaToi);
			await choDinh(`kr:${ca.k}`).catch(() => {});
			kiem(
				`cua-toi 1440: record=${record()}`,
				dinhChong(record()) === `kr:${ca.k}`,
			);
			await chup("cua-toi");
		} else {
			await capNhatTuDong(ca.cu + 3, ca.tuTin.hep, "hop-dong");
			await p.click(`[data-kr="${ca.k}"]`);
			await choDinh(`kr:${ca.k}`).catch(() => {});
			kiem(
				`ngan 390: mo tu dong, record=${record()}`,
				dinhChong(record()) === `kr:${ca.k}`,
			);
			const drawer = await p
				.waitForSelector(
					`[data-slot="drawer-content"] [data-kr-sheet="${ca.k}"] [data-than-ngan-kr]`,
					{
						visible: true,
						timeout: 30 * GIAY_MS,
					},
				)
				.then(() => true)
				.catch(() => false);
			kiem("ngan 390: ngan KR la Drawer", drawer);
			const dau = await p.evaluate(
				(k) =>
					["cap-nhat-ngan-kr", "kr-truoc", "kr-ke"].map(
						(n) =>
							document.querySelector(
								`[data-kr-sheet="${k}"] [data-nut="${n}"]`,
							) !== null,
					),
				ca.k,
			);
			kiem(
				`ngan 390: dau ngan co Cap nhat, ‹ › (${dau.join(",")})`,
				dau.every(Boolean),
			);
			const t = await p.evaluate(doTran, MAN.rongChen);
			kiem(`ngan 390: khong cuon ngang (${t.truoc})`, t.truoc === false);
			kiem(
				"ngan 390: doi chung do — chen khoi rong thi bao tran",
				t.doiChung === true,
			);
			await chup("ngan");
		}
		const { biet, moi } = tachLoiConsole(loiConsole);
		for (const l of new Set(biet))
			dong.push(
				`BIET ${tenKho}: loi console co y het tren nen merge-base — ${l}`,
			);
		kiem(
			`${tenKho}: console khong loi moi (${moi.length})${moi.length ? ` — ${moi[0]}` : ""}`,
			moi.length === 0,
		);
		await ctx.close();
	} finally {
		await trinhDuyet.close().catch(() => {});
	}
}

async function dungCa() {
	const { idMau } = await import(
		"../../../apps/api/scripts/okr-mau/cau-hinh.ts"
	);
	const { dienBien } = await import(
		"../../../apps/api/scripts/okr-mau/dien-bien.ts"
	);
	const { okrMessages } = await import(
		join(GOC, "apps/app/lib/messages/okr.ts")
	);
	const caMan = JSON.parse(readFileSync(join(HERE, "ca-man.json"), "utf8"));
	const bo = JSON.parse(
		readFileSync(join(GOC, "apps/api/scripts/okr-mau/cong-ty.json"), "utf8"),
	);
	const mtMau = bo.mucTieu.find((m) => m.ma === caMan.mucTieu);
	const krMau = mtMau?.krs.find((k) => k.ma === caMan.kr);
	if (!mtMau || !krMau) khongDo(`bo mau khong co ${caMan.mucTieu}/${caMan.kr}`);
	if (krMau.chu !== caMan.nguoiXem)
		khongDo(`${caMan.kr} khong do ${caMan.nguoiXem} phu trach`);
	return {
		caMan,
		m: idMau("mt", caMan.mucTieu),
		k: idMau("kr", caMan.kr),
		ky: idMau("chu-ky", caMan.chuKy),
		pb: idMau("pb", caMan.phongBan),
		tenK: krMau.ten,
		cu: giaTriCu(krMau, dienBien),
		nhanTuTin: okrMessages("vi").capNhat.mucTuTin,
	};
}

async function themKrThu4(ca, phien) {
	const goiChu = phien.trpc(
		API,
		phien.phienCookie(phien.thuMau(ca.caMan.chuMucTieu)),
	);
	const mt = await goiChu.hoi("okr.objective", { id: ca.m });
	if (mt.keyResults.length >= ca.caMan.soKr) return mt;
	const k = mt.keyResults.find((x) => x.id === ca.k);
	if (!k) khongDo(`okr.objective ${ca.m} khong co ${ca.k}`);
	for (let i = mt.keyResults.length; i < ca.caMan.soKr; i += 1)
		await goiChu.lam("okr.createKeyResult", {
			...ca.caMan.krThem,
			title: `${ca.caMan.krThem.title} · ${i + 1}`,
			ownerUserId: k.owner.id,
			objectiveId: ca.m,
		});
	return goiChu.hoi("okr.objective", { id: ca.m });
}

if (process.argv.includes("--kho")) {
	const tenKho = doiSo("--kho");
	try {
		await doKho(tenKho, JSON.parse(doiSo("--ca")));
	} catch (loi) {
		khongDo(`kho ${tenKho}: ${loi?.message ?? loi}`);
	}
	ket(sai === 0 ? 0 : 1);
}

for (const [ten, url] of [
	["APP_URL", APP],
	["API_URL", API],
])
	if (CONG_CAM.has(congCuaUrl(url)))
		khongDo(
			`${ten} ${url} la cong cua nguoi — chay qua config:executors.script.vk7_man`,
		);
mkdirSync(ANH, { recursive: true });
const phien = await import("../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs");
const { canhCay } = await import(
	"../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs"
);
const cay = await canhCay();
if (cay.ket !== "dung-cay")
	khongDo(
		`${APP} khong phuc vu cay dang xet (${cay.ket}) — ${cay.dong.join(" · ")}`,
	);
if (!phien.laKhoDo())
	khongDo(
		"DATABASE_URL khong phai kho do rieng — chay qua config:executors.script.vk7_man",
	);
const nap = phien.napBoMau();
if (nap.ma !== 0)
	khongDo(`okr:mau --moc ${nap.moc} thoat ${nap.ma}: ${nap.dong}`);
dong.push(`GHI NAP okr:mau --moc ${nap.moc}: ${nap.dong}`);
const ca = await dungCa();
let mt;
try {
	mt = await themKrThu4(ca, phien);
} catch (loi) {
	khongDo(
		`them KR thu ${ca.caMan.soKr} qua okr.createKeyResult: ${loi?.message ?? loi}`,
	);
}
const viTri = mt.keyResults.findIndex((x) => x.id === ca.k);
const kKe = mt.keyResults[viTri + 1]?.id;
if (mt.keyResults.length !== ca.caMan.soKr || viTri < 0 || !kKe)
	khongDo(
		`M ${ca.m} co ${mt.keyResults.length} KR, K o vi tri ${viTri} — can ${ca.caMan.soKr} KR va KR ke`,
	);
const hienTaiK = mt.keyResults[viTri].currentValue;
if (hienTaiK !== ca.cu)
	khongDo(`gia tri cu cua K tu writer ${ca.cu} khac kho ${hienTaiK}`);
dong.push(
	`GHI CA M=${ca.m} K=${ca.k} (vi tri ${viTri + 1}/${mt.keyResults.length}) cu=${ca.cu} ke=${kKe}`,
);
const cookie = phien.phienCookie(phien.thuMau(ca.caMan.nguoiXem));
const slug = await suySlug(cookie);
if (!slug) khongDo(`${APP}/ khong chuyen toi trang chinh cua workspace`);
const caKho = {
	m: ca.m,
	k: ca.k,
	kKe,
	ky: ca.ky,
	pb: ca.pb,
	tenK: ca.tenK,
	cu: ca.cu,
	tuTin: ca.caMan.tuTin,
	nhanTuTin: ca.nhanTuTin,
	cookie,
	slug,
};
let soAnh = 0;
for (const tenKho of Object.keys(MAN.kho).sort(
	(a, b) => Number(b) - Number(a),
)) {
	const r = spawnSync(
		"bun",
		[TEP, "--kho", tenKho, "--ca", JSON.stringify(caKho)],
		{
			cwd: GOC,
			env: process.env,
			encoding: "utf8",
			maxBuffer: 64 << 20,
		},
	);
	for (const d of `${r.stdout}`
		.split("\n")
		.filter((x) => /^(DUNG|SAI|ANH|KHONG DO DUOC)/.test(x))) {
		dong.push(d);
		if (d.startsWith("SAI")) sai += 1;
		if (d.startsWith("ANH")) soAnh += 1;
	}
	if (r.status === 2)
		khongDo(
			`tien trinh kho ${tenKho} khong do duoc: ${`${r.stderr}`.trim().split("\n").slice(-2).join(" | ")}`,
		);
	if (r.status !== 0 && r.status !== 1)
		khongDo(`tien trinh kho ${tenKho} thoat ${r.status}`);
}
kiem(`du ${MAN.soAnh} anh (${soAnh})`, soAnh >= MAN.soAnh);
ket(sai === 0 ? 0 : 1);
