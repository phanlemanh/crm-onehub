// Hồ sơ _acceptance/lam-moi-goi-y-ke-hoach — E6: bấm cột Chốt được rồi cột Đang mở trên thanh giai đoạn của sheet
// deal thật, đo mili giây tới lúc thẻ gợi ý hiện và mất, giữ nguyên phần tử sheet. Chạy qua phiên đo:
//   bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/lam-moi-goi-y-ke-hoach/rang/man.mjs"
// Lượt tự thử chiều đỏ chạy TRƯỚC lượt thật, trên một deal riêng: giữ treo mọi yêu cầu đọc lại goiYCuaDeal sau
// lần tải đầu (không huỷ, để app không ghi lỗi console) — thẻ không được hiện, không thì thước không đo được gì.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const HO_SO = "lam-moi-goi-y-ke-hoach";
const KHO_RONG = 1280;
const TRAN_MS = 5_000;
const THE = "[data-goi-y-ke-hoach]";
const THANH = '[data-slot="stage-stepper"]';

process.env.BANG_CHUNG ??= join(GOC, ".acceptance-runs", HO_SO, "evidence");
const lib = await import("../../kho-tai-lieu/rang/man-lib.mjs");

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/man.mjs"`,
	);
	process.exit(2);
}

const { recordSheetMessages } = await import(
	join(GOC, "apps/app/lib/messages/record-sheet.ts")
);
const M = recordSheetMessages("vi").deal.goiYKeHoach;
const d = await lib.moDo();

function dong(ten, dung, ghiChu = "") {
	console.log(
		`${ten}: ${dung ? "DAT" : "KHONG DAT"}${ghiChu ? ` — ${ghiChu}` : ""}`,
	);
	return dung;
}

async function choTrong(t, ham, arg, tran) {
	const batDau = Date.now();
	try {
		await t.waitForFunction(ham, { timeout: tran, polling: 50 }, arg);
		return { dung: true, ms: Date.now() - batDau };
	} catch {
		return { dung: false, ms: Date.now() - batDau };
	}
}

const coThe = (t) =>
	t.evaluate((s) => {
		const e = document.querySelector(s);
		return e !== null && e.checkVisibility();
	}, THE);

async function giaiDoan(P) {
	const { stages } = await d.hoi(P.cookie, "giaiDoan.list");
	const mo = stages.find((g) => g.kind === "OPEN");
	const thang = stages.find((g) => g.kind === "WON");
	if (!mo || !thang)
		throw new Error("khong co giai doan Dang mo hay Chot duoc");
	return { mo, thang };
}

async function dealDangMo(P, gd, ten) {
	const cty = await d.lam(P.cookie, "companies.create", {
		name: `Công ty Làm Mới Gợi Ý ${ten} ${lib.MA}`,
	});
	const tenDeal = `Hợp đồng làm mới ${ten} ${lib.MA}`;
	const deal = await d.lam(P.cookie, "deals.create", {
		name: tenDeal,
		companyId: cty.id,
		ownerId: P.id,
		stage: gd.mo.id,
	});
	return { dealId: deal.id, tenDeal, tenCongTy: cty.name };
}

async function moSheet(P, x) {
	const t = await d.moTrang(
		P.cookie,
		KHO_RONG,
		`/deals?record=deal:${x.dealId}`,
	);
	const tai = await choTrong(
		t,
		(ten) => (document.body.innerText ?? "").includes(ten),
		x.tenDeal,
		30_000,
	);
	const coThanh = await t.evaluate(
		(s) => document.querySelector(s) !== null,
		THANH,
	);
	return { t, daTai: tai.dung && coThanh };
}

async function bamCot(t, nhan) {
	const nut = await t.evaluateHandle(
		(s, chu) =>
			[...(document.querySelector(s)?.querySelectorAll("button") ?? [])].find(
				(b) => (b.textContent ?? "").trim() === chu,
			) ?? null,
		THANH,
		nhan,
	);
	if (!(await nut.evaluate((x) => Boolean(x))))
		throw new Error(`khong thay cot «${nhan}» tren thanh giai doan`);
	await nut.click();
}

const theCoTen = (t, tenCongTy) =>
	choTrong(
		t,
		([s, tieuDe]) => {
			const e = document.querySelector(s);
			return (
				e !== null &&
				e.checkVisibility() &&
				(e.textContent ?? "").includes(tieuDe)
			);
		},
		[THE, M.tieuDe.replace("{congTy}", tenCongTy)],
		TRAN_MS,
	);

const sheetCuaDeal = (t, tenDeal) =>
	t.evaluateHandle(
		(ten) =>
			[...document.querySelectorAll('[role="dialog"]')].find((e) =>
				(e.textContent ?? "").includes(ten),
			) ?? null,
		tenDeal,
	);

try {
	const P = await d.nguoiMoi("lmgyp", "member", "Phạm Thu Hà");
	await d.batTrinhDuyet(P.cookie);
	const gd = await giaiDoan(P);

	await d.chayBuoc(0, async () => {
		const x = await dealDangMo(P, gd, "tự thử");
		const { t, daTai } = await moSheet(P, x);
		if (!daTai) throw new Error("tu thu: sheet khong tai");
		await t.setRequestInterception(true);
		t.on("request", (r) => {
			if (r.isInterceptResolutionHandled()) return;
			if (r.url().includes("goiYCuaDeal")) return;
			r.continue();
		});
		await bamCot(t, gd.thang.label);
		const k = await theCoTen(t, x.tenCongTy);
		const baoDo = !dong(
			"E6 hien sau thang",
			k.dung,
			"tu thu: treo doc lai goi y",
		);
		console.log(
			`E6 tu thu: ${baoDo ? "luot chan doc lai bao KHONG DAT" : "THUOC KHONG DO DUOC VAT HONG"}`,
		);
		await t.close();
		d.dat(0, baoDo, "tu thu chieu do khong do");
	});

	const x = await dealDangMo(P, gd, "thật");
	const { t, daTai } = await moSheet(P, x);

	await d.chayBuoc(1, async () => {
		const truoc = daTai && !(await coThe(t));
		if (!truoc) {
			console.log(
				"E6 truoc khi thang: KHONG DO DUOC — sheet khong tai hay da co the",
			);
			d.dat(1, false, "truoc khi thang khong do duoc");
			return;
		}
		const sheet = await sheetCuaDeal(t, x.tenDeal);
		await bamCot(t, gd.thang.label);
		const k = await theCoTen(t, x.tenCongTy);
		dong("E6 hien sau thang", k.dung, `${k.ms} ms`);
		const conSheet = await sheet.evaluate((e) => e?.isConnected === true);
		dong("E6 sheet khong dung lai", conSheet, "sau thang");
		await d.chup(t, "E6-sau-thang-1280.png");
		d.dat(1, k.dung && conSheet, `hien=${k.dung} sheet=${conSheet}`);

		await bamCot(t, gd.mo.label);
		const mat = await choTrong(
			t,
			(s) => document.querySelector(s) === null,
			THE,
			TRAN_MS,
		);
		dong("E6 an sau roi thang", mat.dung, `${mat.ms} ms`);
		const vanSheet = await sheet.evaluate((e) => e?.isConnected === true);
		dong("E6 sheet khong dung lai", vanSheet, "sau roi thang");
		await d.chup(t, "E6-sau-roi-thang-1280.png");
		d.dat(1, mat.dung && vanSheet, `an=${mat.dung} sheet=${vanSheet}`);
	});
	await t.close();

	await d.ket(`${HO_SO} man`);
} catch (e) {
	await d.khongDoDuoc(e);
}
