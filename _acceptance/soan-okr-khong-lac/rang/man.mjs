import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { crmMessages } from "../../../apps/app/lib/messages/crm.ts";
import { recordSheetMessages } from "../../../apps/app/lib/messages/record-sheet.ts";
import { tre } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import { DEM, LENH, TEN } from "../../soan-okr-trang-rieng/rang/kich-ban.mjs";
import {
	buoc,
	CHON,
	chuanBi,
	choThay,
	choYen,
	ghi,
	guiTin,
	KY,
	ket,
	khongDo,
	kiem,
	m,
	MAN,
	mo,
	moCuoc,
	moPhien,
	moTrang,
	mui,
	sql,
	the,
	trang,
	choSoDong,
} from "../../soan-okr-trang-rieng/rang/man-chung.mjs";
import { bam, ROOT, SOAN } from "./chung.mjs";

const TU_DAY = fileURLToPath(import.meta.url);
const TEP_DAY = path.relative(ROOT, TU_DAY);
const EVIDENCE = path.join(ROOT, "_acceptance/soan-okr-khong-lac/evidence");
const CAU_K2C = JSON.parse(fs.readFileSync(path.join(ROOT, "_acceptance/ly-do-tu-choi-nop-theo-locale/rang/cau-da-duyet.json"), "utf8"));
const KHO = {
	390: { rong: 390, cao: 844 },
	1440: { rong: 1440, cao: 1000 },
};
const PHA_KHAC = "dang-chay";
const LIEN_HE = { id: "k2b-lien-he-thu", ten: "Khách thử K2b" };
const VET_NOP = {
	tep: `${SOAN}/moc-nop.ts`,
	tu: "\t\tconst loi = khongThanh(item);\n",
	thanh: "\t\tconst loi = null;\n",
};
const mLh = recordSheetMessages("vi");
const mCrm = crmMessages("vi");
const NGAN = '[role="dialog"]';

const arg = (ten) => {
	const i = process.argv.indexOf(ten);
	return i < 0 ? null : (process.argv[i + 1] ?? null);
};
const kho = arg("--kho");
const doDo = arg("--kiem-do-do");
if (doDo !== null && doDo !== "nop") {
	console.log("KHONG DO DUOC: --kiem-do-do chi nhan 'nop'");
	process.exit(2);
}
if (kho !== null && !KHO[kho]) {
	console.log(`KHONG DO DUOC: --kho phai la ${Object.keys(KHO).join(" hoac ")}`);
	process.exit(2);
}
const duoi = doDo ? ` --kiem-do-do ${doDo}` : "";

function chayCon(k) {
	const r = spawnSync("bun", [TU_DAY, "--kho", k, ...(doDo ? ["--kiem-do-do", doDo] : [])], {
		cwd: ROOT,
		env: process.env,
		stdio: "inherit",
	});
	return r.status ?? 2;
}

async function cha() {
	if (!doDo) {
		const ma = [];
		for (const k of Object.keys(KHO)) ma.push([k, chayCon(k)]);
		ghi(`TONG: ${ma.map(([k, x]) => `kho ${k} thoat ${x}`).join(" · ")}`);
		const cuoi = ma.some(([, x]) => x === 2) ? 2 : ma.some(([, x]) => x !== 0) ? 1 : 0;
		ghi(`KET LUAN: ma thoat ${cuoi}`);
		process.exit(cuoi);
	}
	const duong = path.join(ROOT, VET_NOP.tep);
	const truoc = fs.readFileSync(duong, "utf8");
	const bamTruoc = bam(VET_NOP.tep);
	if (!truoc.includes(VET_NOP.tu)) {
		ghi(`KHONG DO DUOC: khong thay dong can pha trong ${VET_NOP.tep}`);
		process.exit(2);
	}
	let ma = 2;
	try {
		fs.writeFileSync(duong, truoc.replace(VET_NOP.tu, VET_NOP.thanh));
		ghi(`(chieu do nop: ${VET_NOP.tep} bo xet ket qua nop — man cua phien do bien dich lai)`);
		ma = chayCon("1440");
	} finally {
		fs.writeFileSync(duong, truoc);
	}
	if (bam(VET_NOP.tep) !== bamTruoc) {
		ghi(`TEP KHONG TRA LAI: ${VET_NOP.tep}`);
		process.exit(3);
	}
	ghi(`tep tra lai nguyen: ${VET_NOP.tep}`);
	ghi(`KET LUAN: chieu do nop — ma thoat ${ma}`);
	process.exit(ma);
}

const hep = () => Number(kho) < 768;

async function anh(t, ten) {
	const thu = doDo ? the.ra : EVIDENCE;
	fs.mkdirSync(thu, { recursive: true });
	const tep = path.join(thu, `${ten}-${kho}.png`);
	await t.p.screenshot({ path: tep });
	ghi(`   ANH ${path.relative(ROOT, tep)}`);
}

async function chonTab(t, giaTri) {
	if (!hep()) return true;
	const i = giaTri === "tro-chuyen" ? 0 : 1;
	const tab = (await t.p.$$('[data-khung="hep"] [role="tab"]'))[i];
	if (!tab) return false;
	await tab.click();
	return choThay(
		t.p,
		(i) => document.querySelectorAll('[data-khung="hep"] [role="tab"]')[i]?.getAttribute("aria-selected") === "true",
		`tab ${giaTri}`,
		10000,
		i,
	);
}

async function goSo(p, ten, o, chu) {
	const h = await p.evaluateHandle(
		(ten, o) =>
			[...document.querySelectorAll("[data-dong]")]
				.find((d) => d.checkVisibility() && d.textContent?.includes(ten))
				?.closest("[data-the-kr]")
				?.querySelector(`input[id^="${o}-"]`) ?? null,
		ten,
		o,
	);
	const el = h.asElement();
	if (!el) return false;
	await el.click({ clickCount: 3 });
	await p.keyboard.type(chu);
	await p.keyboard.press("Tab");
	await tre(MAN.cho.nhipMs);
	return true;
}

async function docMan(p) {
	return p.evaluate(() => ({
		tabBanNhap: document.querySelectorAll('[data-khung="hep"] [role="tab"]')[1]?.getAttribute("aria-selected") ?? null,
		loc: [...document.querySelectorAll('[data-nut="loc-cho"]')].find((b) => b.checkVisibility())?.getAttribute("aria-pressed") ?? null,
		tabSoan: new URL(location.href).searchParams.get("tabSoan"),
		ngan: !!document.querySelector('[role="dialog"]'),
	}));
}

async function lienHe() {
	await sql(
		`INSERT INTO contact (id, "firstName", "enrichmentStatus", "updatedAt") VALUES ($1, $2, 'COMPLETE', now()) ON CONFLICT (id) DO NOTHING`,
		[LIEN_HE.id, LIEN_HE.ten],
	);
	return LIEN_HE.id;
}

async function trangThaiBanGhi(t, cuocId) {
	const id = await lienHe();
	if (!(await moTrang(t, cuocId, "?tabSoan=ban-nhap"))) await khongDo("khong mo lai duoc trang soan o tab Ban nhap");
	await choThay(t.p, () => [...document.querySelectorAll('[data-nut="loc-cho"]')].some((b) => b.checkVisibility()), "nut loc", 15000);
	await t.p.evaluate(() => [...document.querySelectorAll('[data-nut="loc-cho"]')].find((b) => b.checkVisibility())?.click());
	await choThay(t.p, () => [...document.querySelectorAll('[data-nut="loc-cho"]')].some((b) => b.checkVisibility() && b.getAttribute("aria-pressed") === "true"), "loc bat", 10000);
	const truoc = await docMan(t.p);
	ghi(`   truoc khi mo ban ghi: ${JSON.stringify(truoc)}`);
	const url = new URL(t.p.url());
	url.searchParams.set("record", `contact:${id}`);
	await t.p.goto(url.toString(), { waitUntil: "load" });
	const ngan = await choThay(t.p, (ngan) => !!document.querySelector(`${ngan} [role="tab"]`), "ngan ban ghi", MAN.cho.manMs, NGAN);
	if (!ngan)
		ghi(
			`   chan doan ngan: ${JSON.stringify(
				await t.p.evaluate(() => ({
										dialog: [...document.querySelectorAll('[role="dialog"]')].map((d) => d.getAttribute("data-slot")),
					tab: [...document.querySelectorAll('[role="tab"]')].map((x) => `${x.textContent?.trim()}@${x.closest("[data-slot]")?.getAttribute("data-slot")}`),
				})),
			)}`,
		);
	const tabNgan = await t.p.evaluateHandle(
		(ngan, nhan) => [...document.querySelectorAll(`${ngan} [role="tab"]`)].find((x) => x.textContent?.trim() === nhan) ?? null,
		NGAN,
		mLh.tabs.activity,
	);
	const hoatDong = !!tabNgan.asElement();
	if (hoatDong) await tabNgan.asElement().click();
	await choThay(
		t.p,
		(ngan, nhan) => [...document.querySelectorAll(`${ngan} [role="tab"]`)].some((x) => x.textContent?.trim() === nhan && x.getAttribute("aria-selected") === "true"),
		"tab Hoat dong",
		10000,
		NGAN,
		mLh.tabs.activity,
	);
	const moNgan = await t.p.evaluate(() => new URL(location.href).search);
	ghi(`   ngan mo: ${ngan} · tab Hoat dong ${hoatDong} · url ${moNgan}`);
	fs.mkdirSync(the.ra, { recursive: true });
	await t.p.screenshot({ path: path.join(the.ra, `E10-ngan-mo-${kho}.png`) });
	const nutDong = await t.p.evaluateHandle(
		(ngan, nhan) => [...document.querySelectorAll(`${ngan} button`)].find((b) => b.textContent?.trim() === nhan) ?? null,
		NGAN,
		mCrm.sheet.close,
	);
	if (nutDong.asElement()) await nutDong.asElement().click();
	const dong = await choThay(t.p, (ngan) => !document.querySelector(ngan), "ngan dong", 10000, NGAN);
	await tre(MAN.cho.yenMs * 2);
	const sau = await docMan(t.p);
	ghi(`   sau khi dong ngan: ${JSON.stringify(sau)}`);
	await anh(t, "E10-hep-co-ban-ghi");
	buoc(
		1,
		!ngan || !hoatDong ? "khong mo duoc ngan ban ghi hay tab Hoat dong" :
		!dong ? "ngan khong dong" :
		hep() && sau.tabBanNhap !== "true" ? `tab Ban nhap khong con chon sau khi dong ngan (aria-selected ${sau.tabBanNhap})` :
		sau.loc !== "true" ? `bo loc chi dong cho tat sau khi dong ngan (aria-pressed ${sau.loc})` :
		null,
	);
}

async function trangThaiNop(t, cuocId) {
	if (!(await moTrang(t, cuocId))) await khongDo("khong mo lai duoc trang soan");
	await choYen(t.p);
	if (!(await chonTab(t, "tro-chuyen"))) await khongDo("khong chon duoc tab Tro chuyen");
	await sql(`UPDATE "okrCycle" SET phase = $2 WHERE id = $1`, [KY, PHA_KHAC]);
	let tuChoi;
	try {
		tuChoi = await guiTin(t, LENH.nop2);
	} finally {
		await sql(`UPDATE "okrCycle" SET phase = $2 WHERE id = $1`, [KY, MAN.phaSoan]);
	}
	if (!tuChoi) await khongDo("lan nop bi tu choi khong xong luot");
	if (!(await guiTin(t, LENH.nopLai))) await khongDo("lan nop lai khong xong luot");
	await choThay(t.p, () => document.querySelectorAll('[data-kara-turn="checkpoint"]').length >= 2, "hai moc", MAN.cho.luotMs);
	await tre(MAN.cho.yenMs * 2);
	const can = [
		mui.karaKhung.mocDau(m.moc.dau(String(DEM.nop1.mucTieu), String(DEM.nop1.kr))),
		mui.karaKhung.moc(
			[m.moc.themKr(String(DEM.nop2.themKr)), m.moc.sua(String(DEM.nop2.sua)), m.moc.chuyen(String(DEM.nop2.chuyen)), m.moc.bo(String(DEM.nop2.bo))].join(" · "),
		),
	];
	const canDong = m.moc.nopKhongThanh(CAU_K2C.vi.chuKyKhongLapKeHoach);
	const co = await t.p.evaluate((chon) => {
		const thuTu = [...document.querySelectorAll('[data-kara-turn="checkpoint"],[data-nop-khong-thanh]')].map((d) =>
			d.matches('[data-kara-turn="checkpoint"]') ? "moc" : `khong-thanh:${d.getAttribute("data-nop-khong-thanh")}`,
		);
		return {
			moc: [...document.querySelectorAll(chon)].map((b) => b.textContent?.trim() ?? ""),
			soMoc: document.querySelectorAll('[data-kara-turn="checkpoint"]').length,
			khongThanh: [...document.querySelectorAll("[data-nop-khong-thanh]")].map((d) => ({ loai: d.getAttribute("data-nop-khong-thanh"), chu: d.textContent?.trim() ?? "" })),
			thuTu: thuTu.join(","),
		};
	}, CHON.moc);
	ghi(`   moc: ${JSON.stringify(co.moc)} · khong thanh ${JSON.stringify(co.khongThanh)} · thu tu ${co.thuTu}`);
	await anh(t, "E10-nop-tu-choi");
	buoc(
		2,
		co.soMoc !== 2 ? `so moc ${co.soMoc}, mong 2` :
		co.khongThanh.length !== 1 || co.khongThanh[0].loai !== "tu-choi" ? `can dung 1 dong he thong tu-choi, thay ${JSON.stringify(co.khongThanh)}` :
		co.khongThanh[0].chu !== canDong ? `dong he thong sai chu, can «${canDong}»` :
		co.thuTu !== "moc,khong-thanh:tu-choi,moc" ? `dong he thong khong o cho lan nop bi tu choi (${co.thuTu})` :
		JSON.stringify(co.moc) !== JSON.stringify(can) ? `moc sai chu, can ${JSON.stringify(can)}` :
		null,
	);
}

async function chanHoanTac(t) {
	await t.p.setRequestInterception(true);
	t.p.on("request", (r) => {
		const than = r.postData() ?? "";
		if (r.method() === "POST" && r.url().includes("/api/trpc/okr.soanQuyet") && than.includes('"quyet":"hoan"')) {
			ghi("   (chan hoan tac: tra 409 CONFLICT)");
			return r.respond({
				status: 409,
				contentType: "application/json",
				body: JSON.stringify([
					{ error: { message: "xung dot", code: -32009, data: { code: "CONFLICT", httpStatus: 409, path: "okr.soanQuyet" } } },
				]),
			});
		}
		return r.continue();
	});
}

async function trangThaiNhom(t) {
	if (!(await chonTab(t, "ban-nhap"))) await khongDo("khong chon duoc tab Ban nhap");
	for (const [ten, [khoi, dich]] of [[TEN.k11, ["10", "20"]], [TEN.k12, ["50", "30"]]]) {
		if (!(await goSo(t.p, ten, "khoi", khoi)) || !(await goSo(t.p, ten, "dich", dich))) await khongDo(`khong go duoc so cho ${ten}`);
	}
	const nhan = m.dong.daThemNhom("1", "2");
	const bamNhom = await t.p.evaluate(() => {
		const nut = [...document.querySelectorAll('[data-slot="kara-proposal-group"] [data-slot="kara-batch"]')].find((b) => b.checkVisibility() && !b.disabled);
		nut?.click();
		return !!nut;
	});
	if (!bamNhom) await khongDo("khong co nut nhan ca nhom");
	const coBienNhan = await choThay(
		t.p,
		(nhan) => [...document.querySelectorAll('[data-slot="kara-proposal-group"] [data-slot="proposed-change-receipt"]')].some((r) => r.textContent?.includes(nhan)),
		"bien nhan nhom",
		MAN.cho.manMs,
		nhan,
	);
	if (!coBienNhan) await khongDo("nhan ca nhom khong ra bien nhan nhom");
	await chanHoanTac(t);
	const bamHoan = await t.p.evaluate(
		(nhan, hoan) => {
			const r = [...document.querySelectorAll('[data-slot="kara-proposal-group"] [data-slot="proposed-change-receipt"]')].find((x) => x.textContent?.includes(nhan));
			const nut = r && [...r.querySelectorAll("button")].find((b) => b.textContent?.trim() === hoan || b.getAttribute("aria-label") === hoan);
			nut?.click();
			return !!nut;
		},
		nhan,
		mui.proposedChange.undo,
	);
	const coLoi = await choThay(t.p, () => !!document.querySelector('[data-loi="nhom"]'), "loi nhom", 15000);
	const sau = await t.p.evaluate((nhan) => {
		const loi = document.querySelector('[data-loi="nhom"]');
		const nhom = loi?.closest('[data-slot="kara-proposal-group"]');
		const bienNhan = [...(nhom?.querySelectorAll('[data-slot="proposed-change-receipt"]') ?? [])].find((x) => x.textContent?.includes(nhan));
		return {
			chu: loi?.textContent?.trim() ?? "",
			conBienNhan: !!bienNhan,
			ngaySau: loi?.previousElementSibling?.getAttribute("data-slot") ?? "",
			hien: loi?.checkVisibility() ?? false,
		};
	}, nhan);
	ghi(`   hoan tac nhom: bam ${bamHoan} · loi ${JSON.stringify(sau)}`);
	await anh(t, "E10-hoan-nhom-loi");
	buoc(
		3,
		!bamHoan ? "khong co nut Hoan tac tren bien nhan nhom" :
		!coLoi || !sau.hien ? "hoan tac nhom that bai ma khong co cau loi [data-loi=nhom]" :
		sau.chu !== m.loiQuyet.dongCu ? `cau loi sai, can «${m.loiQuyet.dongCu}»` :
		!sau.conBienNhan ? "bien nhan nhom bien mat sau khi hoan tac that bai" :
		sau.ngaySau !== "proposed-change-receipt" ? "cau loi khong nam ngay duoi bien nhan nhom" :
		null,
	);
}

async function con() {
	await moPhien(`bun scripts/lan-do/tien-de.mjs --chay "bun ${TEP_DAY} --kho ${kho}${duoi}"`);
	try {
		await chuanBi(`k2b-khong-lac-${kho}${doDo ? "-do" : ""}`);
		ghi(`KHO ${kho}${doDo ? ` · chieu do ${doDo}` : ""}`);
		const cuoc = await moCuoc();
		const t = await trang(KHO[kho]);
		try {
			if (!(await mo(t, cuoc.id))) await khongDo("trang soan khong mo duoc luot dau");
			if (!(await guiTin(t, LENH.nop1)) || !(await chonTab(t, "ban-nhap")) || !(await choSoDong(t.p, DEM.nop1.mucTieu + DEM.nop1.kr)))
				await khongDo("khong dung duoc ban nhap dau");
			if (!doDo) await trangThaiBanGhi(t, cuoc.id);
			await trangThaiNop(t, cuoc.id);
			if (!doDo) await trangThaiNhom(t);
			const loi = t.loi.filter((x) => !x.includes("409"));
			if (!doDo) kiem(`console khong loi (${loi.length})${loi.length ? `: ${loi.slice(0, 3).join(" | ")}` : ""}`, loi.length === 0);
		} finally {
			await t.dong();
		}
	} catch (loi) {
		await khongDo(`kho ${kho}: ${loi?.stack ?? loi}`);
	}
	await ket();
}

await (kho ? con() : cha());
