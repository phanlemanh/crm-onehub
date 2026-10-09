import { tre } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import { TEN } from "./kich-ban.mjs";
import { bamNutChu, choThay, ghi, KHUNG, khongDo, KY, m, MAN, PHONG, sql } from "./man-chung.mjs";

export const SO_DU = {
	[TEN.k11]: ["10", "20"],
	[TEN.k12]: ["50", "30"],
	[TEN.k13]: ["2", "4"],
	[TEN.k21]: ["5", "15"],
	[TEN.k22]: ["60", "80"],
};

export async function goSo(p, ten, o, chu) {
	const h = await p.evaluateHandle(
		(khung, ten, o) =>
			[...document.querySelectorAll(`:is(${khung}) [data-dong]`)]
				.find((d) => d.checkVisibility() && d.textContent?.includes(ten))
				?.closest("[data-the-kr]")
				?.querySelector(`input[id^="${o}-"]`) ?? null,
		KHUNG,
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

export async function bamNhom(p, tenMt) {
	const truoc = await p.evaluate(() => document.querySelectorAll('[data-slot="proposed-change-receipt"]').length);
	const ok = await p.evaluate((ten) => {
		const nhom = [...document.querySelectorAll('[data-slot="kara-proposal-group"]')].find((g) => g.checkVisibility() && g.textContent?.includes(ten));
		const nut = nhom?.querySelector('[data-slot="kara-batch"]');
		if (!nut || nut.disabled) return false;
		nut.click();
		return true;
	}, tenMt);
	if (!ok) return false;
	return choThay(p, (n) => document.querySelectorAll('[data-slot="proposed-change-receipt"]').length > n, `bien nhan nhom ${tenMt}`, MAN.cho.manMs, truoc);
}

export async function duaVaoTatCa(p, soMt = [TEN.m1, TEN.m2], soDu = SO_DU) {
	for (const [ten, [khoi, dich]] of Object.entries(soDu)) {
		if (!(await goSo(p, ten, "khoi", khoi)) || !(await goSo(p, ten, "dich", dich))) await khongDo(`khong go duoc so cho ${ten}`);
	}
	for (const ten of soMt) if (!(await bamNhom(p, ten))) await khongDo(`khong nhan duoc nhom ${ten}`);
	await tre(MAN.cho.yenMs);
	const nut = await p.evaluate(() => {
		const b = document.querySelector('[data-nut="dua-vao"]');
		return { co: !!b, khoa: b?.disabled ?? null, chu: b?.innerText.trim() ?? "" };
	});
	ghi(`   nut «${nut.chu}» khoa ${nut.khoa}`);
	if (!nut.co || nut.khoa) await khongDo("nut Dua vao khoa sau khi nhan va go du so");
	await p.click('[data-nut="dua-vao"]');
	if (!(await choThay(p, () => !!document.querySelector('[role="alertdialog"]'), "hop xac nhan dua vao", 10000))) await khongDo("khong hien hop xac nhan Dua vao");
}

export async function xacNhanDuaVao(p) {
	await bamNutChu(p, '[role="alertdialog"] button', m.banNhap.xacNhan.nut);
	return choThay(p, () => !!document.querySelector("[data-da-dua-vao]"), "bien nhan da dua vao", 30000);
}

export async function demCsdl() {
	const [{ mt }] = await sql(
		`SELECT count(*)::int AS mt FROM "okrObjective" WHERE "cycleId" = $1 AND level = 'phong-ban' AND "departmentId" = $2 AND status <> 'da-bo'`,
		[KY, PHONG],
	);
	return mt;
}

export async function demManNen(p) {
	return p.evaluate(() => {
		const ds = [...document.querySelectorAll('[data-trang-thai="ST-donvi-danhsach"]')].find((o) => o.checkVisibility());
		return ds ? (ds.firstElementChild?.children.length ?? 0) : 0;
	});
}
