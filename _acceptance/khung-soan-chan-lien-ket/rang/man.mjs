import { mkdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { tre } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import { LENH } from "../../soan-okr-trong-khung/rang/kich-ban.mjs";
import {
	bamNutChu,
	CHON,
	chuanBi,
	choThay,
	choYen,
	docCuoc,
	GOC,
	ghi,
	guiTin,
	KHUNG,
	ket,
	khongDo,
	m,
	MAN,
	mo,
	moCuocMoi,
	moPhien,
	moTrang,
	mui,
	saiThem,
	the,
	trang,
} from "../../soan-okr-trong-khung/rang/man-chung.mjs";

const GIAY_MS = 1000;
const HOP_MS = 10 * GIAY_MS;
const DI_MS = 30 * GIAY_MS;
const QUAN_SAT_MS = 3 * GIAY_MS;
const CHU = "Ưu tiên giữ khách";
const RANG = dirname(fileURLToPath(import.meta.url));
const EVIDENCE = join(RANG, "..", "evidence");
const LIEN_KET = 'a[href$="/tai-lieu"]';

const PHAN = {
	man: ["khong-chan"],
	luot: ["dung-luot"],
};

const arg = (ten) => {
	const i = process.argv.indexOf(ten);
	return i < 0 ? null : (process.argv[i + 1] ?? null);
};
const phan = arg("--phan") ?? "man";
const doDo = arg("--kiem-do-do");
if (!PHAN[phan]) {
	console.log(`KHONG DO DUOC: --phan phai la man hoac luot`);
	process.exit(2);
}
if (doDo !== null && !PHAN[phan].includes(doDo)) {
	console.log(
		`KHONG DO DUOC: --kiem-do-do cua ${phan} phai la ${PHAN[phan].join(", ")}`,
	);
	process.exit(2);
}

const lenh = `bun scripts/lan-do/tien-de.mjs --chay "bun ${relative(GOC, join(RANG, "man.mjs"))} --phan ${phan}${doDo ? ` --kiem-do-do ${doDo}` : ""}"`;

async function boChan(p) {
	const va = { so: 0 };
	await p.setRequestInterception(true);
	p.on("request", async (r) => {
		if (r.resourceType() !== "script" || !r.url().includes("/_next/"))
			return r.continue();
		try {
			const res = await fetch(r.url());
			const goc = await res.text();
			const moi = goc.replace(
				/useChanLienKet\)?\(\s*g\?\.coThayDoi === true,\s*chan\s*\)/g,
				(khop) => {
					va.so += 1;
					return khop.replace("g?.coThayDoi === true", "false");
				},
			);
			await r.respond({
				status: res.status,
				headers: {
					"content-type":
						res.headers.get("content-type") ??
						"application/javascript; charset=utf-8",
				},
				body: moi,
			});
		} catch {
			await r.continue().catch(() => {});
		}
	});
	return va;
}

async function anh(t, ten) {
	const thuMuc = doDo ? the.ra : EVIDENCE;
	mkdirSync(thuMuc, { recursive: true });
	const tep = join(thuMuc, `${ten}.png`);
	await t.p.screenshot({ path: tep });
	ghi(`   ANH ${relative(GOC, tep)}`);
}

const trangThai = (p) =>
	p.evaluate(
		(khung, hoi) => ({
			duong: location.pathname,
			record: new URLSearchParams(location.search).get("record"),
			khung: [...document.querySelectorAll(khung)].some((k) =>
				k.checkVisibility(),
			),
			hop: [...document.querySelectorAll(hoi)]
				.filter((h) => h.checkVisibility())
				.map((h) => h.innerText)
				.join(" | "),
		}),
		KHUNG,
		CHON.hopHoi,
	);

async function lienKet(p) {
	const co = await choThay(
		p,
		(khung, chon) =>
			[...document.querySelectorAll(`:is(${khung}) ${chon}`)].some((a) =>
				a.checkVisibility(),
			),
		"lien ket Toi Kho tai lieu",
		MAN.cho.manMs,
		KHUNG,
		LIEN_KET,
	);
	if (!co)
		await khongDo(
			"khung khong co lien ket «Tới Kho tài liệu» (can quan tri va kho chua co trang chien luoc)",
		);
	return p.evaluateHandle(
		(khung, chon) =>
			[...document.querySelectorAll(`:is(${khung}) ${chon}`)].find((a) =>
				a.checkVisibility(),
			),
		KHUNG,
		LIEN_KET,
	);
}

async function choHop(p, tieuDe) {
	return choThay(
		p,
		(hoi, chu) =>
			[...document.querySelectorAll(hoi)].some(
				(h) => h.checkVisibility() && h.innerText.includes(chu),
			),
		`hop hoi «${tieuDe}»`,
		HOP_MS,
		CHON.hopHoi,
		tieuDe,
	);
}

async function choHetHop(p) {
	return choThay(
		p,
		(hoi) =>
			![...document.querySelectorAll(hoi)].some((h) => h.checkVisibility()),
		"hop dong",
		HOP_MS,
		CHON.hopHoi,
	);
}

async function choDangSoan(p) {
	return choThay(
		p,
		(khung, chon) => document.querySelectorAll(`:is(${khung}) ${chon}`).length > 0,
		"Kara dang soan",
		MAN.cho.manMs,
		KHUNG,
		CHON.dangLam,
	);
}

async function choDaRoi(p) {
	return choThay(
		p,
		() =>
			location.pathname.endsWith("/tai-lieu") &&
			!new URLSearchParams(location.search).has("record"),
		"da toi Kho tai lieu",
		DI_MS,
	);
}

function ketBuoc(nhan, loi) {
	if (loi === null) ghi(`kcl ${nhan}: dat`);
	else saiThem(`kcl ${nhan}: ${loi}`);
}

async function bamVaQuanSat(t, nhan, tieuDe) {
	const truoc = await trangThai(t.p);
	await (await lienKet(t.p)).asElement().click();
	const hop = await choHop(t.p, tieuDe);
	if (!hop) {
		await tre(QUAN_SAT_MS);
		const sau = await trangThai(t.p);
		ghi(`   ${nhan}: khong hop · ${JSON.stringify(sau)}`);
		return sau.duong !== truoc.duong || sau.record !== truoc.record
			? "lien ket di luon"
			: "khong hop hoi";
	}
	const sau = await trangThai(t.p);
	if (sau.record !== truoc.record || sau.duong !== truoc.duong)
		return "hop hien nhung dia chi da doi";
	return null;
}

async function buocA(t, kho, cuocId) {
	const nhan = `${kho} a`;
	if (!(await guiTin(t, LENH.chamNop1, { choXong: false })))
		await khongDo(`${nhan}: luot khong toi mo hinh`);
	if (!(await choDangSoan(t.p))) await khongDo(`${nhan}: khong thay Kara dang soan`);
	const loi = await bamVaQuanSat(t, nhan, m.trang.hoiDong.tieuDe);
	if (loi) return ketBuoc(nhan, loi);
	await anh(t, `kcl-dang-soan-${kho}`);
	await bamNutChu(t.p, `${CHON.hopHoi} button`, m.trang.hoiDong.thoi);
	await choHetHop(t.p);
	const oLai = await trangThai(t.p);
	if (!oLai.khung || oLai.record !== `soan:${cuocId}`)
		return ketBuoc(nhan, `o lai mat khung · ${JSON.stringify(oLai)}`);
	const loi2 = await bamVaQuanSat(t, `${nhan} lan 2`, m.trang.hoiDong.tieuDe);
	if (loi2) return ketBuoc(nhan, `lan 2: ${loi2}`);
	await bamNutChu(t.p, `${CHON.hopHoi} button`, m.trang.hoiDong.nut);
	const roi = await choDaRoi(t.p);
	ghi(`   ${nhan}: sau khi roi ${JSON.stringify(await trangThai(t.p))}`);
	ketBuoc(nhan, roi ? null : "chon roi ma khong toi Kho tai lieu");
}

async function buocB(t, kho, cuocId) {
	const nhan = `${kho} b`;
	if (!(await moTrang(t, cuocId))) await khongDo(`${nhan}: khong mo lai duoc khung`);
	if (!(await choYen(t.p))) await khongDo(`${nhan}: Kara khong ranh`);
	const o = await t.p.waitForFunction(
		(chon) =>
			[...document.querySelectorAll(chon)].find(
				(x) => x.checkVisibility() && !x.disabled,
			) ?? null,
		{ timeout: MAN.cho.manMs, polling: MAN.cho.nhipMs },
		CHON.oSoan,
	);
	await o.asElement().click();
	await t.p.keyboard.type(CHU);
	const loi = await bamVaQuanSat(t, nhan, mui.dialog.boThayDoi.tieuDe);
	if (loi) return ketBuoc(nhan, loi);
	await anh(t, `kcl-go-do-${kho}`);
	await bamNutChu(t.p, `${CHON.hopHoi} button`, mui.dialog.boThayDoi.tiepTuc);
	await choHetHop(t.p);
	const con = await t.p.evaluate(
		(chon) =>
			[...document.querySelectorAll(chon)].find((x) => x.checkVisibility())
				?.value ?? null,
		CHON.oSoan,
	);
	const sau = await trangThai(t.p);
	ghi(`   ${nhan}: o soan «${con}» · ${JSON.stringify(sau)}`);
	ketBuoc(
		nhan,
		con !== CHU
			? `chu trong o soan doi thanh «${con}»`
			: sau.record !== `soan:${cuocId}`
				? "dia chi mat record"
				: null,
	);
}

async function buocC(t, cuocId) {
	const nhan = "1280 c";
	if (!(await choYen(t.p))) await khongDo(`${nhan}: Kara khong ranh`);
	await t.p.evaluate((chon) => {
		const o = [...document.querySelectorAll(chon)].find((x) => x.checkVisibility());
		if (o) {
			o.value = "";
			o.dispatchEvent(new Event("input", { bubbles: true }));
		}
	}, CHON.oSoan);
	if (!(await guiTin(t, LENH.chamNop1, { choXong: false })))
		await khongDo(`${nhan}: luot khong toi mo hinh`);
	if (!(await choDangSoan(t.p))) await khongDo(`${nhan}: khong thay Kara dang soan`);
	const truoc = await trangThai(t.p);
	await (await lienKet(t.p)).asElement().focus();
	const dungCho = await t.p.evaluate(
		(chon) => document.activeElement?.matches(chon) === true,
		LIEN_KET,
	);
	if (!dungCho) return ketBuoc(nhan, "khong focus duoc lien ket");
	await t.p.keyboard.press("Enter");
	const hop = await choHop(t.p, m.trang.hoiDong.tieuDe);
	const sau = await trangThai(t.p);
	ghi(`   ${nhan}: Enter → ${JSON.stringify(sau)}`);
	if (hop) {
		await bamNutChu(t.p, `${CHON.hopHoi} button`, m.trang.hoiDong.thoi);
		await choHetHop(t.p);
	}
	ketBuoc(
		nhan,
		!hop
			? sau.duong !== truoc.duong
				? "lien ket di luon"
				: "khong hop hoi"
			: sau.record !== `soan:${cuocId}`
				? "dia chi doi"
				: null,
	);
}

async function phanMan() {
	for (const kho of [1280, 375]) {
		const t = await trang(MAN.kho[kho], "light", the.qt);
		try {
			const va = doDo === "khong-chan" ? await boChan(t.p) : null;
			const cuoc = await moCuocMoi();
			if (!(await mo(t, cuoc.id))) await khongDo(`${kho}: khong mo duoc cuoc`);
			await buocA(t, kho, cuoc.id);
			if (va) {
				ghi(`   (chieu do khong-chan: tat chan lien ket trong ${va.so} cho cua ma da dung)`);
				if (va.so === 0)
					await khongDo("chieu do khong-chan: khong tim thay loi goi chan trong ma da dung");
				return;
			}
			await buocB(t, kho, cuoc.id);
			if (kho === 1280) await buocC(t, cuoc.id);
			if (t.loi.length > 0) saiThem(`kcl ${kho}: console loi ${t.loi.join(" | ")}`);
		} finally {
			await t.dong();
		}
	}
}

async function huyLuot(p, phien, cuocId) {
	const kq = await p.evaluate(
		async (phien, cuocId) => {
			const res = await fetch(
				`/eve/agents/okr/eve/v1/session/${encodeURIComponent(phien)}/cancel`,
				{
					method: "POST",
					headers: { "x-crm-cuoc-soan": cuocId, "content-type": "application/json" },
					body: "{}",
				},
			);
			return `${res.status}`;
		},
		phien,
		cuocId,
	);
	ghi(`   (chieu do dung-luot: goi huy luot phia may chu → ${kq})`);
}

async function phanLuot() {
	const t = await trang(MAN.kho[1280], "light", the.qt);
	try {
		const cuoc = await moCuocMoi();
		if (!(await mo(t, cuoc.id))) await khongDo("luot: khong mo duoc cuoc");
		const truoc = await docCuoc(cuoc.id);
		if (!(await guiTin(t, LENH.chamNop1, { choXong: false })))
			await khongDo("luot: luot khong toi mo hinh");
		if (!(await choDangSoan(t.p))) await khongDo("luot: khong thay Kara dang soan");
		const loi = await bamVaQuanSat(t, "luot", m.trang.hoiDong.tieuDe);
		if (loi) await khongDo(`luot: ${loi}`);
		await bamNutChu(t.p, `${CHON.hopHoi} button`, m.trang.hoiDong.nut);
		if (!(await choDaRoi(t.p))) await khongDo("luot: chon roi ma khong toi Kho tai lieu");
		if (doDo === "dung-luot")
			await huyLuot(t.p, (await docCuoc(cuoc.id)).phien, cuoc.id);
		const han = Date.now() + MAN.cho.luotMs;
		let sau = await docCuoc(cuoc.id);
		while (Date.now() < han && sau.nop <= truoc.nop) {
			await tre(MAN.cho.nhipMs);
			sau = await docCuoc(cuoc.id);
		}
		if (sau.nop === truoc.nop + 1 && sau.lanNop !== truoc.lanNop)
			ghi(`kcl luot: luot chay het · nop ${truoc.nop}→${sau.nop}`);
		else
			saiThem(
				`kcl luot: luot bi dung · nop ${truoc.nop}→${sau.nop} · lanNop ${truoc.lanNop}→${sau.lanNop}`,
			);
	} finally {
		await t.dong();
	}
}

await moPhien(lenh);
try {
	await chuanBi(`kcl-${phan}`);
	ghi(`PHAN ${phan}${doDo ? ` · chieu do ${doDo}` : ""}`);
	if (phan === "man") await phanMan();
	else await phanLuot();
} catch (loi) {
	await khongDo(`phan ${phan}: ${loi?.stack ?? loi}`);
}
await ket();
