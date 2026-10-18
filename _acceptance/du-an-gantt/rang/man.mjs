import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP_NAY), "..", "..", "..");
const HO_SO = "du-an-gantt";
const KHO_RONG = 1280;
const KHO_HEP = 375;
const CHO_MS = 20_000;
const NGAY_MS = 24 * 60 * 60 * 1000;
const GIO_VN_MS = 7 * 60 * 60 * 1000;

process.env.BANG_CHUNG ??= join(GOC, ".acceptance-runs", HO_SO, "evidence");
const lib = await import("../../kho-tai-lieu/rang/man-lib.mjs");

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/man.mjs"`,
	);
	process.exit(2);
}

const { duAnMessages } = await import(
	join(GOC, "apps/app/lib/messages/du-an.ts")
);
const { settingsMessages } = await import(
	join(GOC, "apps/app/lib/messages/settings.ts")
);
const D = duAnMessages("vi");
const S = settingsMessages("vi");
const d = await lib.moDo();

function ngayCong(goc, n) {
	return new Date(Date.parse(`${goc}T00:00:00.000Z`) + n * NGAY_MS)
		.toISOString()
		.slice(0, 10);
}

function thuHaiKe() {
	const homNay = new Date(Date.now() + GIO_VN_MS).toISOString().slice(0, 10);
	const thu = new Date(`${homNay}T00:00:00.000Z`).getUTCDay();
	return ngayCong(homNay, ((8 - thu) % 7) + 7);
}

async function choThay(t, ham, arg, moTa) {
	try {
		await t.waitForFunction(ham, { timeout: CHO_MS }, arg);
	} catch {
		throw new Error(`dg man: khong thay ${moTa}`);
	}
}

async function chupCa(t, ten, khung = false) {
	await t.evaluate(() => {
		for (const e of document.querySelectorAll(
			"nextjs-portal, [data-nextjs-toast]",
		))
			e.remove();
	});
	if (khung) {
		await lib.cho(600);
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

async function bamChu(t, sel, chu) {
	const el = await t.evaluateHandle(
		(s, c) =>
			[...document.querySelectorAll(s)].find(
				(e) => e.checkVisibility() && (e.textContent ?? "").trim() === c,
			) ?? null,
		sel,
		chu,
	);
	if (!(await el.evaluate((x) => x !== null)))
		throw new Error(`dg man: khong thay nut ${chu}`);
	await el.click();
	await lib.cho(400);
}

try {
	const chu = await d.nguoiMoi("dgm", "member", "Phạm Thu Hà");
	const quanTri = await d.nguoiMoi("dgq", "admin", "Lê Quang Vinh");
	await d.batTrinhDuyet(chu.cookie);

	const T2 = thuHaiKe();
	const le = ngayCong(T2, 7);
	await d.lam(quanTri.cookie, "lichLamViec.themNgayLe", {
		ngay: le,
		ten: `Nghỉ bù ${lib.MA}`,
	});
	const taoDuAn = async (ten) =>
		(await d.lam(chu.cookie, "duAn.tao", { ten: `${ten} ${lib.MA}` })).id;
	const P = await taoDuAn("Triển khai Ngân hàng An Phát");
	const P2 = await taoDuAn("Triển khai Ngân hàng Bắc Á");
	const P3 = await taoDuAn("Triển khai đợt thử");
	const viec = async (tieuDe, duAnId, batDau, han) =>
		(
			await d.lam(chu.cookie, "viec.create", {
				tieuDe: `${tieuDe} ${lib.MA}`,
				duAnId: duAnId ?? undefined,
				batDauNgay: batDau,
				hanNgay: han,
			})
		).id;
	const A = await viec("Ký hợp đồng triển khai", P, T2, ngayCong(T2, 2));
	const B = await viec(
		"Chuẩn bị dữ liệu khách hàng",
		P,
		ngayCong(T2, 3),
		ngayCong(T2, 4),
	);
	const C = await viec(
		"Đào tạo nhân viên quan hệ khách hàng",
		P,
		ngayCong(T2, 8),
		ngayCong(T2, 9),
	);
	await viec("Tuyển trưởng nhóm triển khai", P, null, null);
	const con = await d.lam(chu.cookie, "viec.taoCon", {
		chaId: A,
		tieuDe: `Rà điều khoản bảo mật ${lib.MA}`,
		hanNgay: ngayCong(T2, 1),
	});
	await d.lam(chu.cookie, "viec.sua", { id: con.id, batDauNgay: T2 });
	await d.lam(chu.cookie, "viec.doiTrangThai", { id: B, den: "DANG_LAM" });
	for (const [truocId, sauId] of [
		[A, B],
		[B, C],
	])
		await d.lam(chu.cookie, "duAn.phuThuocTao", { truocId, sauId });
	await d.lam(chu.cookie, "duAn.mocTao", {
		duAnId: P,
		ten: "Go-live",
		ngay: ngayCong(T2, 11),
		cho: [C],
	});
	await viec("Khảo sát chi nhánh", P2, T2, ngayCong(T2, 4));
	await d.lam(chu.cookie, "duAn.dong", { id: P3 });
	const rieng = await viec("Gọi lại anh Tuấn", null, null, ngayCong(T2, 1));
	void rieng;

	const lichCua = () => d.hoi(chu.cookie, "duAn.lich", { id: P });

	if (lib.chay(1))
		await d.chayBuoc(1, async () => {
			const loi = [];
			const t = await d.moTrang(chu.cookie, KHO_RONG, "/viec");
			await choThay(
				t,
				() => document.querySelector("[data-dong-du-an]") !== null,
				null,
				"dong phu du an",
			);
			await chupCa(t, "dg-cua-toi-1280");
			await bamPhanTu(t, "[data-o-pham-vi]");
			await choThay(
				t,
				() => document.querySelectorAll('[role="menuitem"]').length > 0,
				null,
				"menu pham vi",
			);
			const muc = await t.evaluate(() =>
				[...document.querySelectorAll('[role="menuitem"]')].map((e) =>
					(e.textContent ?? "").trim(),
				),
			);
			for (const can of [
				D.phamVi.cuaToi,
				D.phamVi.tatCa,
				D.phamVi.daDong.replace("{n}", "1"),
				D.phamVi.tao,
			])
				if (!muc.includes(can)) loi.push(`dg man: o pham vi thieu ${can}`);
			await chupCa(t, "dg-pham-vi-1280", true);
			await t.close();
			d.dat(1, loi.length === 0, loi.join(" · "));
		});

	if (lib.chay(2))
		await d.chayBuoc(2, async () => {
			const loi = [];
			const t = await d.moTrang(
				chu.cookie,
				KHO_RONG,
				"/viec?phamVi=tat-ca-du-an",
			);
			await choThay(
				t,
				() => document.querySelectorAll("tr[data-du-an]").length >= 2,
				null,
				"bang du an",
			);
			const coDong = await t.evaluate(
				(c) => (document.body.textContent ?? "").includes(c),
				D.ds.daDong.replace("{n}", "1"),
			);
			if (!coDong) loi.push("dg man: thieu dong gap da dong");
			await chupCa(t, "dg-ds-1280");
			await t.close();
			d.dat(2, loi.length === 0, loi.join(" · "));
		});

	if (lib.chay(3))
		await d.chayBuoc(3, async () => {
			const loi = [];
			const t = await d.moTrang(chu.cookie, KHO_RONG, `/viec?phamVi=${P}`);
			await choThay(
				t,
				() =>
					document.querySelectorAll("[data-gantt-bar]").length >= 3 &&
					document.querySelector("[data-gantt-moc]") !== null,
				null,
				"gantt",
			);
			const dem = await t.evaluate(() => ({
				muiTen: document.querySelectorAll("[data-gantt-dependency]").length,
				nghi: document.querySelectorAll("[data-off-day]").length,
				chuaLich: document.body.textContent ?? "",
			}));
			if (dem.muiTen < 2) loi.push(`dg man: thieu mui ten ${dem.muiTen}`);
			if (dem.nghi === 0) loi.push("dg man: khong to ngay nghi");
			await chupCa(t, "dg-gantt-1280");
			await t.close();
			d.dat(3, loi.length === 0, loi.join(" · "));
		});

	if (lib.chay(4))
		await d.chayBuoc(4, async () => {
			const loi = [];
			await d.lam(chu.cookie, "duAn.mocTao", {
				duAnId: P,
				ten: "Ký kết",
				ngay: ngayCong(T2, 3),
				cho: [B],
			});
			const lich = await lichCua();
			const kyKet = lich.moc.find((m) => m.ten === "Ký kết");
			if (!kyKet?.tre) {
				console.log("dg man: moc khong tre");
				loi.push("dg man: moc khong tre");
			}
			const t = await d.moTrang(chu.cookie, KHO_RONG, `/viec?phamVi=${P}`);
			await choThay(
				t,
				() => document.querySelector('[data-gantt-moc="Ký kết"]') !== null,
				null,
				"moc tre",
			);
			await chupCa(t, "dg-gantt-moc-tre-1280");
			await t.close();
			d.dat(4, loi.length === 0, loi.join(" · "));
		});

	if (lib.chay(5))
		await d.chayBuoc(5, async () => {
			const loi = [];
			const truoc = (await lichCua()).viec.find((v) => v.id === B);
			const t = await d.moTrang(chu.cookie, KHO_RONG, `/viec?phamVi=${P}`);
			await choThay(
				t,
				(id) => document.querySelector(`[data-viec="${id}"]`) !== null,
				A,
				"thanh A",
			);
			await t.focus(`[data-viec="${A}"]`);
			await t.keyboard.press("ArrowRight");
			await t.keyboard.press("ArrowRight");
			await t.keyboard.press("Enter");
			await choThay(
				t,
				(c) => (document.body.textContent ?? "").includes(c),
				D.gantt.daDoi.split("{n}")[0],
				"toast da doi",
			);
			await chupCa(t, "dg-gantt-da-doi-1280");
			const sau = (await lichCua()).viec.find((v) => v.id === B);
			if (!truoc || !sau || sau.batDau === truoc.batDau) {
				console.log("dg man: khong tu doi");
				loi.push("dg man: khong tu doi");
			}
			await t.close();
			d.dat(5, loi.length === 0, loi.join(" · "));
		});

	if (lib.chay(6))
		await d.chayBuoc(6, async () => {
			const loi = [];
			const t = await d.moTrang(
				chu.cookie,
				KHO_RONG,
				`/viec?phamVi=${P}&xemViec=danh-sach&record=viec:${B}`,
			);
			await choThay(
				t,
				() =>
					document.querySelector("[data-muc-phai-cho]") !== null &&
					document.querySelector("[data-o-bat-dau]") !== null,
				null,
				"khung viec",
			);
			await chupCa(t, "dg-khung-viec-1280", true);
			await t.close();

			const t2 = await d.moTrang(chu.cookie, KHO_RONG, `/viec?phamVi=${P}`);
			await bamPhanTu(t2, `[aria-label="${D.dai.thaoTac}"]`);
			await bamChu(t2, '[role="menuitem"]', D.dai.dong);
			await choThay(
				t2,
				() => document.querySelector('[role="alertdialog"]') !== null,
				null,
				"hop hoi dong",
			);
			const hoi = await t2.evaluate(
				() => document.querySelector('[role="alertdialog"]')?.textContent ?? "",
			);
			if (!hoi.includes(D.dai.hoiDong.split("{n}")[0]))
				loi.push("dg man: hop hoi dong sai");
			await chupCa(t2, "dg-hoi-dong-1280", true);
			await t2.close();

			const t3 = await d.moTrang(
				quanTri.cookie,
				KHO_RONG,
				"/settings/lich-lam-viec",
			);
			await choThay(
				t3,
				() =>
					document.querySelector("[data-the-nghi-tuan]") !== null &&
					document.querySelector("[data-the-ngay-le]") !== null,
				null,
				"trang lich lam viec",
			);
			const coTieuDe = await t3.evaluate(
				(c) => (document.body.textContent ?? "").includes(c),
				S.lichLamViec.tieuDe,
			);
			if (!coTieuDe) loi.push("dg man: trang lich thieu tieu de");
			await chupCa(t3, "dg-lich-lam-viec-1280");
			await t3.close();
			d.dat(6, loi.length === 0, loi.join(" · "));
		});

	if (lib.chay(7))
		await d.chayBuoc(7, async () => {
			const loi = [];
			const t = await d.moTrang(chu.cookie, KHO_HEP, `/viec?phamVi=${P}`);
			await choThay(
				t,
				() => document.querySelectorAll("[data-gantt-bar]").length >= 1,
				null,
				"gantt 375",
			);
			const rongGantt = await t.evaluate(
				() => document.documentElement.scrollWidth,
			);
			if (rongGantt > KHO_HEP) {
				console.log("dg man: 375 cuon ngang");
				loi.push(`dg man: 375 cuon ngang gantt ${rongGantt}`);
			}
			await chupCa(t, "dg-gantt-375");
			await t.close();
			const t2 = await d.moTrang(
				chu.cookie,
				KHO_HEP,
				"/viec?phamVi=tat-ca-du-an",
			);
			await choThay(
				t2,
				() =>
					document.querySelectorAll('[data-slot="item"][data-du-an]').length >=
					2,
				null,
				"the du an 375",
			);
			const rongDs = await t2.evaluate(
				() => document.documentElement.scrollWidth,
			);
			if (rongDs > KHO_HEP) {
				console.log("dg man: 375 cuon ngang");
				loi.push(`dg man: 375 cuon ngang ds ${rongDs}`);
			}
			await chupCa(t2, "dg-ds-375");
			await t2.close();
			d.dat(7, loi.length === 0, loi.join(" · "));
		});

	await d.ket(`${HO_SO} man`);
} catch (e) {
	await d.khongDoDuoc(e);
}
