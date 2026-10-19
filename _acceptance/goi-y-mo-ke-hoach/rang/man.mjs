// Hồ sơ _acceptance/goi-y-mo-ke-hoach — E6: thẻ gợi ý trên sheet deal thật, khổ 1280 và 375. Chạy qua phiên đo:
//   bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/goi-y-mo-ke-hoach/rang/man.mjs"
// Ba lượt tự thử chiều đỏ chạy TRƯỚC lượt thật, trên một deal riêng: gỡ thẻ khỏi trang người nhận, chèn thẻ
// giả vào trang người khác, chèn lại thẻ sau «Bỏ qua» — mỗi lượt phải báo KHONG DAT, không thì cả eval hỏng
// (bài học DA3: thước màn phải đỏ được trên vật hỏng trước khi tin màu xanh).
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const HO_SO = "goi-y-mo-ke-hoach";
const KHO_RONG = 1280;
const KHO_HEP = 375;
const CHO_MS = 20_000;
const THE = "[data-goi-y-ke-hoach]";

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

const tuThu = [];
function dong(ten, dung, ghiChu = "") {
	console.log(
		`${ten}: ${dung ? "DAT" : "KHONG DAT"}${ghiChu ? ` — ${ghiChu}` : ""}`,
	);
	return dung;
}

async function choDuoc(t, ham, arg) {
	try {
		await t.waitForFunction(ham, { timeout: CHO_MS }, arg);
		return true;
	} catch {
		return false;
	}
}

const coThe = (t) =>
	t.evaluate((s) => {
		const e = document.querySelector(s);
		return e !== null && e.checkVisibility();
	}, THE);

async function sheetDaTai(t, tenDeal) {
	return choDuoc(
		t,
		(ten) => (document.body.innerText ?? "").includes(ten),
		tenDeal,
	);
}

async function kiemThe(t, tenCongTy) {
	const hien = await choDuoc(
		t,
		(s) => document.querySelector(s)?.checkVisibility() === true,
		THE,
	);
	if (!hien) return { dung: false, ly: "khong thay the" };
	const thu = await t.evaluate(
		(s, mo, bo) => {
			const e = document.querySelector(s);
			const nut = [...(e?.querySelectorAll("button") ?? [])].map((b) =>
				(b.textContent ?? "").trim(),
			);
			const ten = e?.querySelector('[translate="no"]');
			const r = e?.getBoundingClientRect();
			return {
				chu: e?.textContent ?? "",
				coMo: nut.includes(mo),
				coBo: nut.includes(bo),
				ten: ten?.textContent ?? "",
				tran: r ? r.right > window.innerWidth + 1 : true,
			};
		},
		THE,
		M.mo,
		M.boQua,
	);
	const tieuDe = M.tieuDe.replace("{congTy}", tenCongTy);
	const ly = [];
	if (!thu.chu.includes(tieuDe)) ly.push("thieu tieu de");
	if (!thu.coMo || !thu.coBo) ly.push("thieu nut");
	if (thu.ten !== tenCongTy) ly.push("ten cong ty khong translate=no");
	if (thu.tran) ly.push("the tran ngang");
	return { dung: ly.length === 0, ly: ly.join(", ") };
}

async function bamBoQua(t) {
	const nut = await t.evaluateHandle(
		(s, chu) =>
			[...(document.querySelector(s)?.querySelectorAll("button") ?? [])].find(
				(b) => (b.textContent ?? "").trim() === chu,
			) ?? null,
		THE,
		M.boQua,
	);
	if (!(await nut.evaluate((x) => Boolean(x)))) return false;
	await nut.click();
	await lib.cho(1500);
	return true;
}

async function dealThang(P, ten) {
	const { stages } = await d.hoi(P.cookie, "giaiDoan.list");
	const mo = stages.find((g) => g.kind === "OPEN");
	const thang = stages.find((g) => g.kind === "WON");
	if (!mo || !thang) throw new Error("khong co giai doan mo hay thang");
	const cty = await d.lam(P.cookie, "companies.create", {
		name: `Công ty Cổ phần Đầu tư và Phát triển Thương mại Dịch vụ An Phát Hưng Thịnh ${ten} ${lib.MA}`,
	});
	const tenDeal = `Hợp đồng gợi ý ${ten} ${lib.MA}`;
	const deal = await d.lam(P.cookie, "deals.create", {
		name: tenDeal,
		companyId: cty.id,
		ownerId: P.id,
		stage: mo.id,
	});
	await d.lam(P.cookie, "deals.setStage", { id: deal.id, stage: thang.id });
	return { dealId: deal.id, tenDeal, tenCongTy: cty.name };
}

try {
	const P = await d.nguoiMoi("gyp", "member", "Phạm Thu Hà");
	const Q = await d.nguoiMoi("gyq", "member", "Lê Quang Vinh");
	await d.batTrinhDuyet(P.cookie);

	await d.chayBuoc(0, async () => {
		const x = await dealThang(P, "tự thử");
		const duong = `/deals?record=deal:${x.dealId}`;

		const t1 = await d.moTrang(P.cookie, KHO_RONG, duong);
		await sheetDaTai(t1, x.tenDeal);
		await t1.evaluate((s) => document.querySelector(s)?.remove(), THE);
		const k1 = await kiemThe(t1, x.tenCongTy);
		tuThu.push(!dong("E6 the hien 1280", k1.dung, "tu thu: go the"));
		await t1.close();

		const t2 = await d.moTrang(Q.cookie, KHO_RONG, duong);
		const daTai = await sheetDaTai(t2, x.tenDeal);
		await t2.evaluate((s) => {
			const gia = document.createElement("div");
			gia.setAttribute(s.slice(1, -1), "gia");
			gia.textContent = "the gia";
			document.body.prepend(gia);
		}, THE);
		tuThu.push(
			!dong(
				"E6 nguoi khac khong thay",
				daTai && !(await coThe(t2)),
				"tu thu: chen the gia",
			),
		);
		await t2.close();

		const t3 = await d.moTrang(P.cookie, KHO_RONG, duong);
		await sheetDaTai(t3, x.tenDeal);
		await choDuoc(t3, (s) => document.querySelector(s) !== null, THE);
		const banSao = await t3.evaluate(
			(s) => document.querySelector(s)?.outerHTML ?? "",
			THE,
		);
		await bamBoQua(t3);
		await t3.evaluate((html) => {
			const o = document.createElement("div");
			o.innerHTML = html;
			if (o.firstElementChild) document.body.prepend(o.firstElementChild);
		}, banSao);
		tuThu.push(!dong("E6 bo qua", !(await coThe(t3)), "tu thu: chen lai the"));
		await t3.close();

		const daDo = tuThu.length === 3 && tuThu.every(Boolean);
		console.log(
			`E6 tu thu: ${daDo ? "ca ba luot bao KHONG DAT" : "THUOC KHONG DO DUOC VAT HONG"}`,
		);
		d.dat(0, daDo, "tu thu chieu do khong do");
	});

	const x = await dealThang(P, "thật");
	const duong = `/deals?record=deal:${x.dealId}`;

	await d.chayBuoc(1, async () => {
		const t = await d.moTrang(P.cookie, KHO_RONG, duong);
		await sheetDaTai(t, x.tenDeal);
		const k = await kiemThe(t, x.tenCongTy);
		dong("E6 the hien 1280", k.dung, k.ly);
		await d.chup(t, "E6-the-1280.png");
		await t.close();
		d.dat(1, k.dung, k.ly);
	});

	await d.chayBuoc(2, async () => {
		const t = await d.moTrang(P.cookie, KHO_HEP, duong);
		await sheetDaTai(t, x.tenDeal);
		const k = await kiemThe(t, x.tenCongTy);
		const tran = await d.cuonNgang(t);
		const dung = k.dung && tran.length === 0;
		dong("E6 the hien 375", dung, [k.ly, ...tran].filter(Boolean).join(", "));
		await d.chup(t, "E6-the-375.png");
		await t.close();
		d.dat(2, dung, [k.ly, ...tran].filter(Boolean).join(", "));
	});

	await d.chayBuoc(3, async () => {
		const t = await d.moTrang(Q.cookie, KHO_RONG, duong);
		const daTai = await sheetDaTai(t, x.tenDeal);
		if (!daTai) {
			console.log(
				"E6 nguoi khac: KHONG DO DUOC — sheet cua nguoi khac khong tai",
			);
			d.dat(3, false, "sheet nguoi khac khong tai");
			await t.close();
			return;
		}
		const khong = !(await coThe(t));
		dong("E6 nguoi khac khong thay", khong);
		await d.chup(t, "E6-nguoi-khac-1280.png");
		await t.close();
		d.dat(3, khong, "nguoi khac thay the");
	});

	await d.chayBuoc(4, async () => {
		const t = await d.moTrang(P.cookie, KHO_RONG, duong);
		await sheetDaTai(t, x.tenDeal);
		await choDuoc(t, (s) => document.querySelector(s) !== null, THE);
		const bam = await bamBoQua(t);
		const mat = bam && !(await coThe(t));
		const g = await d.db.goiYKeHoach.findFirst({ where: { dealId: x.dealId } });
		const dung = mat && g?.trangThai === "BO_QUA";
		dong("E6 bo qua", dung, `the mat=${mat} trangThai=${g?.trangThai}`);
		await d.chup(t, "E6-sau-bo-qua-1280.png");
		await t.close();
		d.dat(4, dung, "bo qua khong ghi");
	});

	await d.ket(`${HO_SO} man`);
} catch (e) {
	await d.khongDoDuoc(e);
}
