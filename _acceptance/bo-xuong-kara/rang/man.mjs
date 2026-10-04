import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dungPhongMau } from "./phong-mau.mjs";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

const MAN = {
	chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	designDoc: "docs/superpowers/specs/2026-10-04-bo-xuong-kara-design.md",
	viDu: "packages/ui/src/components/kara/vi-du/phong-mau.tsx",
	evals: "_acceptance/bo-xuong-kara/evals.yaml",
	anh: "_acceptance/bo-xuong-kara/evidence",
	tien: "ST-phongmau-",
	kho: [
		{ ten: "1440", rong: 1440, cao: 1000 },
		{ ten: "768", rong: 768, cao: 1024 },
		{ ten: "375", rong: 375, cao: 812 },
	],
	nen: ["light", "dark"],
	o: [360, 1080],
	caoODo: 600,
	choChuBanMs: 5000,
	nhipMs: 100,
	caoThuLai: 28,
	lechPx: 1,
	lanCuon: 400,
	trangThai: {
		banNhap: "ST-phongmau-ban-nhap",
		dangSoan: "ST-phongmau-dang-soan",
		loi: "ST-phongmau-loi",
		hoiThoai: "ST-phongmau-hoi-thoai",
	},
	chuDung: "Dừng",
	chuBan: "Kara đang soạn bản nháp…",
	soDauNhom: "3 đề xuất",
	soSauNhom: "1 đề xuất",
	chuNhanNhom: "Đã thêm 2 dòng theo Kara",
	chuHoanTac: "Hoàn tác",
	chuThuLai: "Thử lại",
};

const KIEM_DO_DO = (() => {
	const i = process.argv.indexOf("--kiem-do-do");
	return i === -1 ? null : process.argv[i + 1];
})();

const dong = [];
let sai = 0;

function ghi(ok, chu) {
	dong.push(`${ok ? "OK " : "SAI"} ${chu}`);
	if (!ok) sai += 1;
}

function khongDoDuoc(loi) {
	console.log(`KHONG DO DUOC: ${loi}`);
	process.exit(2);
}

function tapBang() {
	const chu = readFileSync(join(GOC, MAN.designDoc), "utf8");
	const dau = chu.indexOf("<!-- <<<UX-STATE-TABLE -->");
	const cuoi = chu.indexOf("<!-- UX-STATE-TABLE>>> -->");
	if (dau === -1 || cuoi === -1) khongDoDuoc("design doc khong co UX-STATE-TABLE");
	return [...chu.slice(dau, cuoi).matchAll(/^\|\s*(ST-[\w-]+)\s*\|/gm)]
		.map((m) => m[1])
		.filter((id) => id.startsWith(MAN.tien));
}

function tapViDu() {
	const chu = readFileSync(join(GOC, MAN.viDu), "utf8");
	return [...chu.matchAll(/id: "(ST-phongmau-[\w-]+)"/g)].map((m) => m[1]);
}

function anhJudgment() {
	const chu = readFileSync(join(GOC, MAN.evals), "utf8");
	return [...chu.matchAll(/"(_acceptance\/bo-xuong-kara\/evidence\/E11-[^"]+\.png)"/g)].map(
		(m) => m[1],
	);
}

function napPuppeteer() {
	const bun = join(GOC, "node_modules/.bun");
	const thuMuc = readdirSync(bun).find((t) => t.startsWith("puppeteer-core@"));
	if (!thuMuc) khongDoDuoc("khong tim thay puppeteer-core");
	const goi = join(bun, thuMuc, "node_modules/puppeteer-core");
	return createRequire(join(goi, "package.json"))(goi);
}

async function cho(trang, ham, ...doiSo) {
	const lan = MAN.choChuBanMs / MAN.nhipMs;
	for (let i = 0; i < lan; i += 1) {
		if (await trang.evaluate(ham, ...doiSo)) return true;
		await new Promise((ok) => setTimeout(ok, MAN.nhipMs));
	}
	return false;
}

async function mo(trang, phong, id, nen, them = "") {
	await trang.goto(`${phong.url}/?state=${id}&theme=${nen}${them}`, {
		waitUntil: "networkidle0",
	});
	const co = await cho(trang, () => document.querySelector("[data-phong-mau-khung]") !== null);
	if (!co) khongDoDuoc(`trang ${id} khong dung duoc`);
}

const coChuBan = (chu) => {
	const dau = document.querySelector('[data-slot="kara-artifact-header"]');
	const st = dau?.querySelector('[role="status"]');
	return Boolean(st?.textContent?.includes(chu));
};

async function doTran(trang, nhan) {
	if (KIEM_DO_DO === "tran")
		await trang.evaluate(() => {
			const d = document.createElement("div");
			d.style.width = "2000px";
			d.style.height = "1px";
			document.body.appendChild(d);
		});
	const [rong, khung] = await trang.evaluate(() => [
		document.documentElement.scrollWidth,
		window.innerWidth,
	]);
	ghi(rong <= khung, rong <= khung ? `${nhan} khong tran (${rong}/${khung})` : `tran ngang: ${nhan} ${rong} > ${khung}`);
}

async function doCot375(trang, nhan) {
	if (KIEM_DO_DO === "chong-cot")
		await trang.evaluate(() => {
			const v = document.querySelector('[data-phong-mau-vung="hoi-thoai"]');
			v.style.width = "380px";
			v.style.minWidth = "380px";
		});
	const kq = await trang.evaluate(() => {
		const a = document.querySelector('[data-phong-mau-vung="hoi-thoai"]').getBoundingClientRect();
		const b = document.querySelector('[data-phong-mau-vung="ban-nhap"]').getBoundingClientRect();
		return { a: { r: a.right, w: a.width, b: a.bottom }, b: { r: b.right, w: b.width, t: b.top }, k: window.innerWidth };
	});
	const vuaKhung = kq.a.r <= kq.k + MAN.lechPx && kq.b.r <= kq.k + MAN.lechPx;
	ghi(vuaKhung, vuaKhung ? `${nhan} hai vung vua khung` : `cot vuot khung: ${nhan} ${kq.a.r}/${kq.b.r} > ${kq.k}`);
	ghi(kq.a.b <= kq.b.t + MAN.lechPx, `${nhan} hai vung khong chong (${kq.a.b} <= ${kq.b.t})`);
}

async function doO(trang, phong) {
	for (const o of MAN.o) {
		await trang.setViewport({ width: 1440, height: MAN.caoODo });
		await mo(trang, phong, MAN.trangThai.banNhap, "light", `&pane=${o}`);
		if (KIEM_DO_DO === "cuon-trang")
			await trang.evaluate(() => {
				const t = document.querySelector('[data-slot="kara-artifact-content"]');
				t.style.overflow = "visible";
				const k = document.querySelector("[data-phong-mau-khung]");
				k.classList.remove("md:h-dvh");
				document.querySelector('[data-slot="kara-artifact"]').classList.remove("overflow-hidden", "h-full");
			});
		const rong = await trang.evaluate(
			() => document.querySelector('[data-slot="kara-artifact"]').getBoundingClientRect().width,
		);
		ghi(Math.abs(rong - o) <= MAN.lechPx, `o ${o}: kara-artifact rong ${rong}`);
		const tam = await trang.evaluate(() => {
			const r = document.querySelector('[data-slot="kara-artifact-content"]').getBoundingClientRect();
			return { x: r.x + r.width / 2, y: r.y + Math.min(r.height / 2, 200) };
		});
		await trang.mouse.move(tam.x, tam.y);
		await trang.mouse.wheel({ deltaY: MAN.lanCuon });
		await new Promise((ok) => setTimeout(ok, 400));
		const cuon = await trang.evaluate(() => ({
			than: document.querySelector('[data-slot="kara-artifact-content"]').scrollTop,
			trang: window.scrollY,
		}));
		const dung = cuon.than > 0 && cuon.trang === 0;
		ghi(dung, dung ? `o ${o}: than cuon ${cuon.than}, trang giu 0` : `trang cuon thay than: o ${o} than=${cuon.than} trang=${cuon.trang}`);
	}
}

async function doDangSoan(trang, phong) {
	await trang.setViewport({ width: 1440, height: 1000 });
	await mo(trang, phong, MAN.trangThai.dangSoan, "light");
	await cho(trang, coChuBan, MAN.chuBan);
	if (KIEM_DO_DO === "khong-khoa")
		await trang.evaluate(() => {
			const n = document.querySelector('[data-slot="proposed-change"] button[data-variant="default"]');
			n.disabled = false;
		});
	const kq = await trang.evaluate((chuDung, chuHoanTac) => {
		const chinh = [...document.querySelectorAll('[data-slot="proposed-change"] button[data-variant="default"]')];
		const hoanTac = [...document.querySelectorAll('[data-slot="kara-artifact"] button')].filter(
			(b) => b.textContent.trim() === chuHoanTac,
		);
		return {
			soChinh: chinh.length,
			moChinh: chinh.filter((b) => !b.matches(":disabled")).length,
			dung: document.querySelector(`button[aria-label="${chuDung}"]`) !== null,
			soHoanTac: hoanTac.length,
			moHoanTac: hoanTac.filter((b) => !b.matches(":disabled")).length,
		};
	}, MAN.chuDung, MAN.chuHoanTac);
	ghi(kq.soChinh > 0 && kq.moChinh === 0, kq.moChinh === 0 ? `dang soan: ${kq.soChinh} nut chinh khoa` : `nut cho mo khi ban: ${kq.moChinh}/${kq.soChinh}`);
	ghi(kq.dung, "dang soan: o soan co nut Dung");
	ghi(kq.soHoanTac > 0 && kq.moHoanTac === 0, `dang soan: ${kq.soHoanTac} nut Hoan tac khoa`);
}

async function doNhom(trang, phong) {
	await trang.setViewport({ width: 1440, height: 1000 });
	await mo(trang, phong, MAN.trangThai.banNhap, "light");
	const nhan = () => document.querySelector('[data-slot="kara-proposal-group"] [data-slot="kara-label"]').textContent;
	const truoc = await trang.evaluate(nhan);
	ghi(truoc.includes(MAN.soDauNhom), `nhom truoc: ${truoc}`);
	await trang.click('[data-slot="kara-batch"]');
	await new Promise((ok) => setTimeout(ok, 200));
	const sau = await trang.evaluate(
		(chuNhan) => ({
			nhan: document.querySelector('[data-slot="kara-proposal-group"] [data-slot="kara-label"]').textContent,
			bienNhan: [...document.querySelectorAll('[role="status"]')].some((e) => e.textContent.includes(chuNhan)),
		}),
		MAN.chuNhanNhom,
	);
	ghi(sau.bienNhan && sau.nhan.includes(MAN.soSauNhom), `nhan ca nhom: ${sau.nhan}, bien nhan ${sau.bienNhan}`);
	await trang.evaluate((chuNhan, chuHoanTac) => {
		const st = [...document.querySelectorAll('[role="status"]')].find((e) => e.textContent.includes(chuNhan));
		[...st.querySelectorAll("button")].find((b) => b.textContent.trim() === chuHoanTac).click();
	}, MAN.chuNhanNhom, MAN.chuHoanTac);
	await new Promise((ok) => setTimeout(ok, 200));
	const lai = await trang.evaluate(nhan);
	ghi(lai.includes(MAN.soDauNhom), `hoan tac nhom: ${lai}`);
}

async function doThuLai(trang, phong) {
	await trang.setViewport({ width: 1440, height: 1000 });
	await mo(trang, phong, MAN.trangThai.loi, "light");
	const cao = await trang.evaluate((chu) => {
		const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === chu);
		return b ? b.getBoundingClientRect().height : -1;
	}, MAN.chuThuLai);
	ghi(cao === MAN.caoThuLai, `nut Thu lai cao ${cao}`);
}

const bang = tapBang();
const viDu = tapViDu();
if (bang.length === 0) khongDoDuoc("bang trang thai rong");
for (const id of bang) ghi(viDu.includes(id), viDu.includes(id) ? `vi du co ${id}` : `thieu trang thai: ${id}`);
for (const id of viDu) if (!bang.includes(id)) ghi(false, `vi du thua trang thai: ${id}`);

const phong = await dungPhongMau();
const kiemCay = await (await fetch(`${phong.url}/__cay`)).text();
if (kiemCay !== GOC) khongDoDuoc(`phong mau cua cay khac: ${kiemCay} != ${GOC}`);

const puppeteer = napPuppeteer();
mkdirSync(join(GOC, MAN.anh), { recursive: true });
const trinhDuyet = await puppeteer.launch({ executablePath: MAN.chrome, headless: true });
let soAnh = 0;
try {
	const trang = await trinhDuyet.newPage();
	const loiTrang = [];
	trang.on("pageerror", (e) => loiTrang.push(String(e)));
	const chiDo = KIEM_DO_DO
		? { tran: "chup", "chup-som": "chup", "chong-cot": "chup", "khong-khoa": "dang-soan", "cuon-trang": "o" }[KIEM_DO_DO]
		: null;
	if (KIEM_DO_DO && !chiDo) khongDoDuoc(`kiem-do-do la: ${KIEM_DO_DO}`);
	if (!chiDo || chiDo === "chup") {
		const tap = chiDo ? (KIEM_DO_DO === "chup-som" ? [MAN.trangThai.dangSoan] : [MAN.trangThai.hoiThoai]) : bang;
		const kho = KIEM_DO_DO === "chong-cot" ? MAN.kho.filter((k) => k.ten === "375") : MAN.kho;
		for (const id of tap)
			for (const k of kho)
				for (const nen of MAN.nen) {
					await trang.setViewport({ width: k.rong, height: k.cao });
					await mo(trang, phong, id, nen);
					if (id === MAN.trangThai.dangSoan) {
						if (KIEM_DO_DO !== "chup-som") await cho(trang, coChuBan, MAN.chuBan);
						const co = await trang.evaluate(coChuBan, MAN.chuBan);
						ghi(co, co ? `${id}-${k.ten}-${nen} co chu ban` : `thieu chu ban: ${id}-${k.ten}-${nen}`);
					}
					const tep = join(GOC, MAN.anh, `E11-${id}-${k.ten}-${nen}.png`);
					if (!KIEM_DO_DO) {
						await trang.screenshot({ path: tep, fullPage: true });
						soAnh += 1;
					}
					await doTran(trang, `${id}-${k.ten}-${nen}`);
					if (k.ten === "375") await doCot375(trang, `${id}-${nen}`);
				}
	}
	if (!chiDo || chiDo === "o") await doO(trang, phong);
	if (!chiDo || chiDo === "dang-soan") await doDangSoan(trang, phong);
	if (!chiDo) {
		await doNhom(trang, phong);
		await doThuLai(trang, phong);
	}
	ghi(loiTrang.length === 0, loiTrang.length === 0 ? "khong loi trang" : `loi trang: ${loiTrang.slice(0, 3).join(" | ")}`);
} finally {
	await trinhDuyet.close();
	phong.dung();
}

if (!KIEM_DO_DO) {
	const ky = bang.length * MAN.kho.length * MAN.nen.length;
	ghi(soAnh === ky, `so anh ${soAnh} = ${bang.length} trang thai x ${MAN.kho.length} kho x ${MAN.nen.length} nen = ${ky}`);
	for (const a of anhJudgment()) {
		const co = existsSync(join(GOC, a)) && statSync(join(GOC, a)).size > 0;
		ghi(co, co ? `anh E12 co: ${a}` : `thieu anh E12: ${a}`);
	}
}

for (const d of dong) console.log(d);
if (sai > 0) {
	console.log(`DO: ${sai} muc sai`);
	process.exit(1);
}
console.log(`XANH: ${dong.length} muc`);
