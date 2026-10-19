import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP_NAY), "..", "..", "..");
const HO_SO = "va-gantt-lich-bay-ngay";
const KHO_RONG = 1280;
const KHO_HEP = 375;
const CHO_MS = 20_000;
const LICH_MAC_DINH = [6, 7];

process.env.BANG_CHUNG ??= join(GOC, ".acceptance-runs", HO_SO, "evidence");
const lib = await import("../../kho-tai-lieu/rang/man-lib.mjs");

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/man.mjs"`,
	);
	process.exit(2);
}

const { settingsMessages } = await import(
	join(GOC, "apps/app/lib/messages/settings.ts")
);
const S = settingsMessages("vi").lichLamViec;
const d = await lib.moDo();

async function choThay(t, ham, arg, moTa) {
	try {
		await t.waitForFunction(ham, { timeout: CHO_MS }, arg);
	} catch {
		throw new Error(`vg man: khong thay ${moTa}`);
	}
}

async function chupCa(t, ten) {
	await t.evaluate(() => {
		for (const e of document.querySelectorAll(
			"nextjs-portal, [data-nextjs-toast]",
		))
			e.remove();
	});
	await d.chup(t, `${ten}.png`);
	writeFileSync(join(process.env.BANG_CHUNG, `${ten}.html`), await t.content());
}

function oChon(t) {
	return t.evaluate(() =>
		[...document.querySelectorAll('[data-thu][data-state="on"]')].map((e) =>
			e.getAttribute("data-thu"),
		),
	);
}

function soNgayNghi(t) {
	return t.evaluate(() => document.querySelectorAll("[data-off-day]").length);
}

async function moLich(cookie, rong) {
	const t = await d.moTrang(cookie, rong, "/settings/lich-lam-viec");
	await choThay(
		t,
		() =>
			document.querySelectorAll("[data-the-nghi-tuan] [data-thu]").length === 7,
		null,
		"bay o thu",
	);
	return t;
}

async function moGantt(cookie, rong, duAnId) {
	const t = await d.moTrang(
		cookie,
		rong,
		`/viec?phamVi=${duAnId}&xemViec=gantt`,
	);
	await choThay(
		t,
		() => document.querySelectorAll("[data-gantt-bar]").length >= 2,
		null,
		"gantt",
	);
	return t;
}

async function taiLai(t) {
	await t.reload({ waitUntil: "networkidle2" });
	await choThay(
		t,
		() =>
			document.querySelectorAll("[data-the-nghi-tuan] [data-thu]").length === 7,
		null,
		"bay o thu sau tai lai",
	);
	await lib.cho(400);
}

async function bamThu(t, thu) {
	const truoc = await t.evaluate(
		() => document.querySelectorAll("[data-sonner-toast]").length,
	);
	await t.click(`[data-the-nghi-tuan] [data-thu="${thu}"]`);
	await choThay(
		t,
		([chu, n]) =>
			[...document.querySelectorAll("[data-sonner-toast]")].filter((e) =>
				(e.textContent ?? "").includes(chu),
			).length > n,
		[S.daLuuTuan, truoc],
		`thong bao da luu sau khi bam ${thu}`,
	);
	await lib.cho(400);
}

async function bamHoanTac(t) {
	const nut = await t.evaluateHandle((chu) => {
		const ds = [...document.querySelectorAll("[data-sonner-toast] button")];
		return ds.find((e) => (e.textContent ?? "").trim() === chu) ?? null;
	}, S.hoanTac);
	if (!(await nut.evaluate((x) => x !== null)))
		throw new Error("vg man: khong thay nut hoan tac");
	await nut.click();
	await lib.cho(1500);
}

async function lichApi(cookie) {
	return (await d.hoi(cookie, "lichLamViec.get", undefined)).ngayNghiTuan;
}

function cuonNgang(t) {
	return t.evaluate(() => document.scrollingElement?.scrollWidth ?? 0);
}

try {
	const qt = await d.nguoiMoi("vgq", "admin", "Lê Quang Vinh");
	await d.batTrinhDuyet(qt.cookie);
	await d.lam(qt.cookie, "lichLamViec.datNgayNghiTuan", {
		ngayNghiTuan: LICH_MAC_DINH,
	});
	const P = (
		await d.lam(qt.cookie, "duAn.tao", { ten: `Mở kho Bình Dương ${lib.MA}` })
	).id;
	for (const [tieuDe, batDau, han] of [
		["Dựng kệ kho", "2026-10-22", "2026-10-27"],
		["Nhập hàng đợt đầu", "2026-10-23", "2026-10-26"],
	]) {
		await d.lam(qt.cookie, "viec.create", {
			tieuDe: `${tieuDe} ${lib.MA}`,
			duAnId: P,
			batDauNgay: batDau,
			hanNgay: han,
		});
	}

	if (lib.chay(1))
		await d.chayBuoc(1, async () => {
			const loi = [];
			const t = await moLich(qt.cookie, KHO_RONG);
			const on = await oChon(t);
			if (JSON.stringify(on) !== JSON.stringify(["6", "7"]))
				loi.push(`vg man: doi chung lich khong thay 2 o ${JSON.stringify(on)}`);
			await chupCa(t, "vg-lich-t7cn-1280");
			await t.close();
			const g = await moGantt(qt.cookie, KHO_RONG, P);
			if ((await soNgayNghi(g)) === 0)
				loi.push("vg man: doi chung khong to T7 CN");
			await chupCa(g, "vg-gantt-t7cn-1280");
			await g.close();
			d.dat(1, loi.length === 0, loi.join(" · "));
		});

	if (lib.chay(2))
		await d.chayBuoc(2, async () => {
			const loi = [];
			const t = await moLich(qt.cookie, KHO_RONG);
			await bamThu(t, 6);
			await bamThu(t, 7);
			await taiLai(t);
			const on = await oChon(t);
			if (on.length !== 0) loi.push(`vg man: lich bat lai ${on.length}`);
			await chupCa(t, "vg-lich-rong-1280");
			await t.close();
			const g = await moGantt(qt.cookie, KHO_RONG, P);
			const n = await soNgayNghi(g);
			if (n !== 0) loi.push(`vg man: gantt to ngay nghi ${n}`);
			await chupCa(g, "vg-gantt-rong-1280");
			await g.close();
			d.dat(2, loi.length === 0, loi.join(" · "));
		});

	if (lib.chay(3))
		await d.chayBuoc(3, async () => {
			const loi = [];
			const t = await moLich(qt.cookie, KHO_HEP);
			const on = await oChon(t);
			if (on.length !== 0) loi.push(`vg man: lich bat lai ${on.length}`);
			const rongLich = await cuonNgang(t);
			if (rongLich > KHO_HEP)
				loi.push(`vg man: 375 cuon ngang lich ${rongLich}`);
			await chupCa(t, "vg-lich-rong-375");
			await t.close();
			const g = await moGantt(qt.cookie, KHO_HEP, P);
			const n = await soNgayNghi(g);
			if (n !== 0) loi.push(`vg man: gantt to ngay nghi ${n}`);
			const rongGantt = await cuonNgang(g);
			if (rongGantt > KHO_HEP)
				loi.push(`vg man: 375 cuon ngang gantt ${rongGantt}`);
			await chupCa(g, "vg-gantt-rong-375");
			await g.close();
			d.dat(3, loi.length === 0, loi.join(" · "));
		});

	if (lib.chay(4))
		await d.chayBuoc(4, async () => {
			const loi = [];
			const t = await moLich(qt.cookie, KHO_RONG);
			await bamThu(t, 6);
			const luu1 = await lichApi(qt.cookie);
			if (JSON.stringify(luu1) !== JSON.stringify([6]))
				loi.push(`vg man: luu truoc hoan tac sai ${JSON.stringify(luu1)}`);
			await bamHoanTac(t);
			await taiLai(t);
			const on1 = await oChon(t);
			if (on1.length !== 0)
				loi.push(`vg man: hoan tac ra ${on1.length} buoc 1`);
			await chupCa(t, "vg-hoan-tac-ve-rong-1280");

			await bamThu(t, 7);
			await taiLai(t);
			await bamThu(t, 7);
			const luu2 = await lichApi(qt.cookie);
			if (JSON.stringify(luu2) !== JSON.stringify([]))
				loi.push(`vg man: luu truoc hoan tac sai ${JSON.stringify(luu2)}`);
			await bamHoanTac(t);
			await taiLai(t);
			const on2 = await oChon(t);
			if (JSON.stringify(on2) !== JSON.stringify(["7"]))
				loi.push(`vg man: hoan tac ra ${on2.length} buoc 2`);
			await chupCa(t, "vg-hoan-tac-ve-co-nghi-1280");
			await t.close();
			d.dat(4, loi.length === 0, loi.join(" · "));
		});

	await d.lam(qt.cookie, "lichLamViec.datNgayNghiTuan", {
		ngayNghiTuan: LICH_MAC_DINH,
	});
	await d.ket(`${HO_SO} man`);
} catch (e) {
	await d.khongDoDuoc(e);
}
