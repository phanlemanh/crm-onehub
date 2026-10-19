import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP_NAY), "..", "..", "..");
const HO_SO = "kanban-viec";
const KHO_RONG = 1280;
const KHO_HEP = 375;
const CHO_MS = 20_000;
const NGAY_MS = 24 * 60 * 60 * 1000;
const GIO_VN_MS = 7 * 60 * 60 * 1000;
const DAI_TIEU_DE = 160;

process.env.BANG_CHUNG ??= join(GOC, ".acceptance-runs", HO_SO, "evidence");
const lib = await import("../../kho-tai-lieu/rang/man-lib.mjs");

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/man.mjs"`,
	);
	process.exit(2);
}

const { viecMessages } = await import(
	join(GOC, "apps/app/lib/messages/viec.ts")
);
const { taoViec, taoViecCon, doiTrangThai } = await import(
	join(GOC, "packages/db/src/viec-ghi.ts")
);
const V = viecMessages("vi");
const d = await lib.moDo();

function ngayHan(soNgay) {
	const vn = new Date(Date.now() + GIO_VN_MS + soNgay * NGAY_MS);
	return new Date(`${vn.toISOString().slice(0, 10)}T00:00:00.000Z`);
}

async function choThay(t, ham, arg, moTa) {
	try {
		await t.waitForFunction(ham, { timeout: CHO_MS }, arg);
	} catch {
		throw new Error(`kv man: khong thay ${moTa}`);
	}
}

const NGAN = "[data-slot='sheet-content']";

async function yen(t) {
	let truoc = null;
	let lien = 0;
	for (let lan = 0; lan < 60; lan += 1) {
		const x = await t.evaluate((sel) => {
			const r = document.querySelector(sel)?.getBoundingClientRect();
			if (!r) return "khong-ngan";
			if (Math.round(r.right) !== window.innerWidth) return null;
			if (r.x > window.innerWidth / 2) return null;
			return `${Math.round(r.x)}:${Math.round(r.y)}:${Math.round(r.width)}`;
		}, NGAN);
		if (x === "khong-ngan") return;
		lien = x !== null && x === truoc ? lien + 1 : 0;
		if (lien >= 2) return;
		truoc = x;
		await lib.cho(250);
	}
	throw new Error("kv man: ngan khong yen");
}

async function chupCa(t, ten, ngan = false) {
	await yen(t);
	await t.evaluate(() => {
		for (const e of document.querySelectorAll(
			"nextjs-portal, [data-nextjs-toast]",
		))
			e.remove();
	});
	if (ngan) {
		await t.screenshot({ path: join(process.env.BANG_CHUNG, `${ten}.png`) });
		console.log(`  anh ${ten}.png`);
	} else {
		await d.chup(t, `${ten}.png`);
	}
	writeFileSync(join(process.env.BANG_CHUNG, `${ten}.html`), await t.content());
}

async function bamPhanTu(t, sel) {
	await choThay(
		t,
		(s) => [...document.querySelectorAll(s)].some((e) => e.checkVisibility()),
		sel,
		sel,
	);
	const el = await t.evaluateHandle(
		(s) =>
			[...document.querySelectorAll(s)].find((e) => e.checkVisibility()) ??
			null,
		sel,
	);
	await el.evaluate((x) => x.scrollIntoView({ block: "center" }));
	await el.click();
	await lib.cho(400);
}

try {
	const chu = await d.nguoiMoi("kvm", "member", "Phạm Thu Hà");
	const giao = await d.nguoiMoi("kvg", "member", "Lê Quang Vinh");
	await d.batTrinhDuyet(chu.cookie);
	const congTy = await d.db.company.create({
		data: { name: `Công ty An Phát ${lib.MA}` },
	});
	const deal = await d.db.deal.create({
		data: {
			name: `Thoả thuận An Phát ${lib.MA}`,
			companyId: congTy.id,
			ownerId: chu.id,
		},
	});
	const gan = [{ loai: "deal", id: deal.id }];
	const now = new Date();
	const ma = await d.db.$transaction(async (tx) => {
		const tao = (tieuDe, soNgay) =>
			taoViec(tx, {
				nguoiId: giao.id,
				tieuDe,
				nguoiThucHienId: chu.id,
				hanNgay: ngayHan(soNgay),
				gan,
				nguon: "web",
				now,
			});
		const cha = await tao(`Triển khai đại lý An Phát ${lib.MA}`, 14);
		const k1 = await taoViecCon(tx, {
			chaId: cha.id,
			nguoiId: chu.id,
			tieuDe: `Ký phụ lục hoa hồng ${lib.MA}`,
			nguoiThucHienId: giao.id,
			hanNgay: ngayHan(2),
			now,
		});
		const k2 = await taoViecCon(tx, {
			chaId: cha.id,
			nguoiId: giao.id,
			tieuDe: `Đặt lịch đào tạo môi giới ${lib.MA}`,
			nguoiThucHienId: chu.id,
			hanNgay: ngayHan(4),
			now,
		});
		await doiTrangThai(tx, {
			viecId: k1.id,
			nguoiId: chu.id,
			den: "XONG",
			nguon: "web",
			now,
		});
		const w = await tao(`Gửi bảng phí mới cho anh Tuấn ${lib.MA}`, -1);
		const dai = await tao(
			`Rà ${"lại danh sách môi giới chưa kích hoạt và gọi từng người ".repeat(4)}`.slice(
				0,
				DAI_TIEU_DE,
			),
			6,
		);
		const dang = await tao(`Rà danh sách môi giới ${lib.MA}`, 3);
		await doiTrangThai(tx, {
			viecId: dang.id,
			nguoiId: chu.id,
			den: "DANG_LAM",
			nguon: "web",
			now,
		});
		const cho = await tao(`Báo cáo doanh số quý 3 ${lib.MA}`, 1);
		await doiTrangThai(tx, {
			viecId: cho.id,
			nguoiId: chu.id,
			den: "CHO_DANH_GIA",
			nguon: "web",
			now,
		});
		const xong = await tao(`Cập nhật hồ sơ pháp lý ${lib.MA}`, -2);
		await doiTrangThai(tx, {
			viecId: xong.id,
			nguoiId: chu.id,
			den: "XONG",
			nguon: "web",
			now,
		});
		const huy = await tao(`Hẹn lịch thăm chi nhánh ${lib.MA}`, 5);
		await doiTrangThai(tx, {
			viecId: huy.id,
			nguoiId: giao.id,
			den: "HUY",
			nguon: "web",
			now,
		});
		return { cha: cha.id, k2: k2.id, w: w.id, dai: dai.id };
	});
	const BANG = "/viec?xemViec=bang";

	if (lib.chay(1))
		await d.chayBuoc(1, async () => {
			const loi = [];
			const t = await d.moTrang(chu.cookie, KHO_RONG, BANG);
			await choThay(
				t,
				() => document.querySelectorAll("[data-board-column]").length === 4,
				null,
				"bon cot",
			);
			const cot = await t.evaluate(() =>
				[...document.querySelectorAll("[data-board-column]")].map((c) =>
					c.getAttribute("data-board-column"),
				),
			);
			if (
				JSON.stringify(cot) !==
				JSON.stringify(["CHUA_LAM", "DANG_LAM", "CHO_DANH_GIA", "XONG"])
			)
				loi.push(`kv man: cot sai ${JSON.stringify(cot)}`);
			const theCha = await t.evaluate(
				(id) =>
					document.querySelector(`[data-the-viec="${id}"]`)?.textContent ?? "",
				ma.cha,
			);
			if (!theCha.includes("1/2")) loi.push("kv man: the cha thieu dem con");
			const theCon = await t.evaluate(
				(id) =>
					document.querySelector(`[data-the-viec="${id}"]`)?.textContent ?? "",
				ma.k2,
			);
			if (!theCon.includes("Thuộc:"))
				loi.push("kv man: the con thieu dong thuoc");
			const coHuy = await t.evaluate(
				(c) => (document.body.textContent ?? "").includes(c),
				"Đã huỷ (1)",
			);
			if (!coHuy) loi.push("kv man: thieu dong gap huy");
			await chupCa(t, "kv-bang-1280");
			await t.close();
			d.dat(1, loi.length === 0, loi.join(" · "));
		});

	if (lib.chay(2))
		await d.chayBuoc(2, async () => {
			const loi = [];
			const t = await d.moTrang(chu.cookie, KHO_RONG, BANG);
			await bamPhanTu(t, `[data-the-viec="${ma.w}"] [data-chuyen-sang]`);
			await choThay(
				t,
				() => document.querySelectorAll("[data-dich]").length > 0,
				null,
				"menu chuyen sang",
			);
			const dich = await t.evaluate(() =>
				[...document.querySelectorAll("[data-dich]")].map((e) =>
					e.getAttribute("data-dich"),
				),
			);
			if (
				JSON.stringify(dich) !==
				JSON.stringify(["DANG_LAM", "CHO_DANH_GIA", "XONG"])
			)
				loi.push(`kv man: menu sai dich ${JSON.stringify(dich)}`);
			await chupCa(t, "kv-menu-1280");
			await t.close();
			d.dat(2, loi.length === 0, loi.join(" · "));
		});

	if (lib.chay(3))
		await d.chayBuoc(3, async () => {
			const loi = [];
			const t = await d.moTrang(chu.cookie, KHO_RONG, BANG);
			await bamPhanTu(t, `[data-the-viec="${ma.cha}"] [data-chuyen-sang]`);
			await bamPhanTu(t, '[data-dich="XONG"]');
			const hoi = V.con.hoiXong.replace("{n}", "1");
			await choThay(
				t,
				(c) => (document.body.textContent ?? "").includes(c),
				hoi,
				"hop hoi lai dong cha",
			);
			await chupCa(t, "kv-hoi-dong-cha-1280");
			const tt = await d.db.viec.findUniqueOrThrow({
				where: { id: ma.cha },
				select: { trangThai: true },
			});
			if (tt.trangThai !== "CHUA_LAM") loi.push("kv man: hoi lai van ghi");
			await t.close();
			d.dat(3, loi.length === 0, loi.join(" · "));
		});

	if (lib.chay(4))
		await d.chayBuoc(4, async () => {
			const loi = [];
			const t = await d.moTrang(
				chu.cookie,
				KHO_RONG,
				`${BANG}&record=viec:${ma.cha}`,
			);
			await choThay(
				t,
				() => document.querySelector("[data-muc-viec-con]") !== null,
				null,
				"muc viec con",
			);
			if ((await t.$("[data-them-viec-con]")) === null)
				loi.push("kv man: khung cha thieu nut them");
			await chupCa(t, "kv-khung-cha-1280", true);
			await t.close();
			const t2 = await d.moTrang(
				chu.cookie,
				KHO_RONG,
				`${BANG}&record=viec:${ma.k2}`,
			);
			await choThay(
				t2,
				() => document.querySelector("[data-thuoc-viec]") !== null,
				null,
				"dong thuoc viec",
			);
			if ((await t2.$("[data-them-viec-con]")) !== null)
				loi.push("kv man: khung con co nut them");
			await chupCa(t2, "kv-khung-con-1280", true);
			await t2.close();
			d.dat(4, loi.length === 0, loi.join(" · "));
		});

	if (lib.chay(5))
		await d.chayBuoc(5, async () => {
			const loi = [];
			const t = await d.moTrang(chu.cookie, KHO_HEP, BANG);
			await choThay(
				t,
				() => document.querySelectorAll("[data-board-column]").length === 4,
				null,
				"bon cot o 375",
			);
			const tran = await d.cuonNgang(t);
			if (tran.length > 0) loi.push(`kv man: cuon ngang ${tran.join(", ")}`);
			await chupCa(t, "kv-bang-375");
			await bamPhanTu(t, `[data-the-viec="${ma.dai}"] [data-chuyen-sang]`);
			await bamPhanTu(t, '[data-dich="DANG_LAM"]');
			await lib.cho(1500);
			const sau = await d.db.viec.findUniqueOrThrow({
				where: { id: ma.dai },
				select: { trangThai: true },
			});
			if (sau.trangThai !== "DANG_LAM") loi.push("kv man: menu 375 khong doi");
			await t.close();
			d.dat(5, loi.length === 0, loi.join(" · "));
		});

	await d.ket(`${HO_SO} man`);
} catch (e) {
	await d.khongDoDuoc(e);
}
