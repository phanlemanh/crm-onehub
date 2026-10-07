import { SOAN_UI } from "../../../apps/app/app/(app)/[slug]/okr/soan/cau-hinh.ts";
import { tre } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import { LENH, TEN } from "./kich-ban.mjs";
import {
	bamTrongDong,
	buoc,
	CHON,
	choBienNhan,
	choThay,
	choYen,
	ghi,
	guiTin,
	khongDo,
	kiem,
	m,
	MAN,
	mo,
	moCuoc,
	mui,
	sql,
	trang,
} from "./man-chung.mjs";

async function goSo(p, ten, o, chu) {
	const h = await p.evaluateHandle(
		(ten, o) =>
			[...document.querySelectorAll("[data-dong]")]
				.find((d) => d.textContent?.includes(ten))
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

async function docSo(p) {
	return p.evaluate(
		(ds) =>
			Object.fromEntries(
				ds.flatMap((ten) => {
					const d = [...document.querySelectorAll("[data-dong]")].find((x) => x.textContent?.includes(ten));
					const vung = d?.closest("[data-the-kr]") ?? d;
					return ["khoi", "dich"].map((o) => [`${ten}/${o}`, vung?.querySelector(`input[id^="${o}-"]`)?.value ?? null]);
				}),
			),
		[TEN.k11, TEN.k12],
	);
}

const SO = { [`${TEN.k11}/khoi`]: "10", [`${TEN.k11}/dich`]: "20", [`${TEN.k12}/khoi`]: "50", [`${TEN.k12}/dich`]: "30" };
const giongSo = (so) => Object.entries(SO).every(([k, v]) => so[k] === v);
const inSo = (so) => Object.entries(so).map(([k, v]) => `${k}=${v}`).join(" · ");

async function bamTab(p, i) {
	await p.evaluate((i) => {
		const tab = document.querySelectorAll('[data-khung="hep"] [role="tab"]')[i];
		tab?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }));
	}, i);
	await tre(MAN.cho.yenMs);
}

export async function phanSo({ doDo, nop1 }) {
	const cuoc = await moCuoc();
	const t = await trang({ rong: 1440, cao: 900 });
	try {
		if (!(await mo(t, cuoc.id)) || !(await nop1(t))) await khongDo("khong dung duoc ban nhap dau");
		await bamTrongDong(t.p, TEN.k12, m.dong.themKr);
		await choBienNhan(t.p, TEN.k12);
		for (const [k, v] of Object.entries(SO)) {
			const [ten, o] = k.split("/");
			if (!(await goSo(t.p, ten, o, v))) await khongDo(`khong go duoc o ${k}`);
		}
		const dau = await docSo(t.p);
		ghi(`   da go: ${inSo(dau)}`);
		const idCu = await t.p.evaluate(() => [...document.querySelectorAll("[data-dong]")].map((d) => d.getAttribute("data-dong")));
		if (!(await guiTin(t, LENH.nopLai))) await khongDo("Kara khong nop lai");
		await choThay(t.p, (chon) => document.querySelectorAll(chon).length === 2, "moc nop lai", MAN.cho.luotMs, CHON.moc);
		await choYen(t.p);
		const idMoi = await t.p.evaluate(() => [...document.querySelectorAll("[data-dong]")].map((d) => d.getAttribute("data-dong")));
		ghi(`   id dong doi sau nop lai: ${idMoi.filter((x) => !idCu.includes(x)).length}/${idMoi.length}`);
		if (doDo === "khoa-theo-id") {
			await t.p.evaluate(
				(tien, idMoi) => {
					for (const k of Object.keys(sessionStorage).filter((x) => x.startsWith(tien))) {
						const so = JSON.parse(sessionStorage.getItem(k) ?? "{}");
						const theoId = Object.fromEntries(
							Object.values(so).map((v, i) => [`id-cu-${i}`, { khoiDiem: v.khoiDiem, dich: v.dich }]),
						);
						sessionStorage.setItem(k, JSON.stringify(theoId));
					}
					return idMoi.length;
				},
				SOAN_UI.khoaSo,
				idMoi,
			);
			ghi("   (chieu do khoa-theo-id: so luu theo id dong cu, doc lai trang)");
			await t.p.reload({ waitUntil: "load" });
			await choYen(t.p);
		}
		const sauNop = await docSo(t.p);
		ghi(`   sau nop lai: ${inSo(sauNop)}`);
		buoc(1, giongSo(sauNop) ? null : "mat so sau nop lai");
		await t.p.setViewport({ width: 375, height: MAN.kho[375].cao });
		await tre(MAN.cho.yenMs);
		await bamTab(t.p, 0);
		await bamTab(t.p, 1);
		await choThay(t.p, () => !!document.querySelector("[data-dong]"), "tab ban nhap", 10000);
		const sauTab = await docSo(t.p);
		ghi(`   sau doi tab: ${inSo(sauTab)}`);
		buoc(2, giongSo(sauTab) ? null : "mat so khi doi tab");
		if (doDo === "doc-luc-dung") {
			await t.p.evaluate(() => sessionStorage.clear());
			ghi("   (chieu do doc-luc-dung: kho phien trong khi dung lai trang)");
		}
		await t.p.reload({ waitUntil: "load" });
		await choThay(t.p, () => [...document.querySelectorAll("[data-dong]")].some((o) => o.checkVisibility()), "dong sau tai lai", 30000);
		await tre(MAN.cho.yenMs);
		const sauTai = await docSo(t.p);
		ghi(`   sau tai lai: ${inSo(sauTai)}`);
		const hydrat = t.loi.find((l) => /hydrat/i.test(l));
		buoc(3, hydrat ? "loi hydration" : giongSo(sauTai) ? null : "mat so sau tai lai");
		if (!doDo) kiem(`console khong loi (${t.loi.length})`, t.loi.length === 0);
		for (const l of t.loi.slice(0, 5)) ghi(`   console: ${l.slice(0, 200)}`);
	} finally {
		await t.dong();
	}
}

export async function phanDuaVao({ doDo, nop1 }) {
	const cuoc = await moCuoc();
	const t = await trang({ rong: 1440, cao: 900 });
	const canMt = doDo === "dem-sai" ? 2 : 1;
	const canKr = 3;
	try {
		if (!(await mo(t, cuoc.id)) || !(await nop1(t))) await khongDo("khong dung duoc ban nhap dau");
		for (const [ten, nhan] of [
			[TEN.m1, m.dong.themMucTieu],
			[TEN.k11, m.dong.themKr],
			[TEN.k12, m.dong.themKr],
			[TEN.k13, m.dong.themKr],
			[TEN.m2, m.dong.boQua],
		]) {
			if (!(await bamTrongDong(t.p, ten, nhan))) await khongDo(`khong bam duoc «${nhan}» tren «${ten}»`);
			await choBienNhan(t.p, ten);
		}
		await goSo(t.p, TEN.k11, "khoi", "10");
		await goSo(t.p, TEN.k11, "dich", "20");
		await goSo(t.p, TEN.k12, "khoi", "50");
		const chan = await t.p.evaluate(() => ({
			khoa: document.querySelector('[data-nut="dua-vao"]')?.disabled ?? null,
			thieu: [...document.querySelectorAll("[data-con-thieu] [data-thieu]")].map((b) => ({ id: b.getAttribute("data-thieu"), chu: b.textContent?.trim(), nut: b.tagName })),
		}));
		ghi(`   chan: dua vao khoa ${chan.khoa} · con thieu ${JSON.stringify(chan.thieu)}`);
		buoc(1, chan.khoa !== true ? "con thieu ma Dua vao khong khoa" : chan.thieu.length !== 1 || chan.thieu[0].chu !== TEN.k12 || chan.thieu[0].nut !== "BUTTON" ? "Con thieu khong liet dung KR thieu so" : null);
		await t.p.click(`[data-con-thieu] [data-thieu="${chan.thieu[0]?.id}"]`);
		await tre(MAN.cho.yenMs);
		const focus = await t.p.evaluate(() => document.activeElement?.id ?? "");
		ghi(`   focus: ${focus}`);
		buoc(2, focus === `dich-${chan.thieu[0]?.id}` ? null : "bam Con thieu khong dua focus toi o trong dau tien");
		await t.p.keyboard.type("30");
		await t.p.keyboard.press("Tab");
		await tre(MAN.cho.yenMs);
		const nut = await t.p.evaluate(() => {
			const b = document.querySelector('[data-nut="dua-vao"]');
			return { khoa: b?.disabled, chu: b?.textContent?.trim() };
		});
		await t.p.click('[data-nut="dua-vao"]');
		await choThay(t.p, () => !!document.querySelector('[role="alertdialog"]'), "hop xac nhan", 10000);
		const hop = await t.p.evaluate(() => document.querySelector('[role="alertdialog"]')?.textContent ?? "");
		ghi(`   nut «${nut.chu}» · hop «${hop.slice(0, 200)}»`);
		buoc(3, nut.khoa || nut.chu !== m.banNhap.duaVao("1", String(canKr)) ? "nut Dua vao sai chu hay con khoa" : !hop.includes(cuoc.tenDonVi) || !hop.includes(cuoc.tenChuKy) ? "hop xac nhan thieu don vi hay chu ky" : null);
		await t.p.evaluate((nhan) => [...document.querySelectorAll('[role="alertdialog"] button')].find((b) => b.textContent?.trim() === nhan)?.click(), m.banNhap.xacNhan.nut);
		await choThay(t.p, () => !!document.querySelector("[data-da-dua-vao]"), "da dua vao", 30000);
		const [mt] = await sql(`SELECT count(*)::int AS n FROM "okrObjective" WHERE "cycleId" = $1 AND "departmentId" = $2 AND title = $3`, [cuoc.cycleId, cuoc.departmentId, TEN.m1]);
		const kr = await sql(
			`SELECT k.title, k."startValue"::float AS s, k."targetValue"::float AS d FROM "okrKeyResult" k JOIN "okrObjective" o ON o.id = k."objectiveId" WHERE o."cycleId" = $1 AND o."departmentId" = $2 AND o.title = $3`,
			[cuoc.cycleId, cuoc.departmentId, TEN.m1],
		);
		const [c] = await sql(`SELECT "trangThai", "duaVaoLuc" FROM "okrCuocSoan" WHERE id = $1`, [cuoc.id]);
		ghi(`   so muc tieu tao: ${mt.n} · so KR tao: ${kr.length} · ${kr.map((x) => `${x.title} ${x.s}→${x.d}`).join(" · ")} · cuoc ${c.trangThai} duaVaoLuc ${c.duaVaoLuc ? "co" : "rong"}`);
		const dung11 = kr.some((x) => x.title === TEN.k11 && x.s === 10 && x.d === 20);
		const dung12 = kr.some((x) => x.title === TEN.k12 && x.s === 50 && x.d === 30);
		buoc(
			4,
			mt.n !== canMt
				? `so muc tieu: ${mt.n} != ${canMt}`
				: kr.length !== canKr
					? `so kr: ${kr.length} != ${canKr}`
					: !dung11 || !dung12
						? "so cua KR trong co so du lieu khac so da go"
						: c.trangThai !== "da-dua-vao" || !c.duaVaoLuc
							? "cuoc chua thanh da dua vao"
							: null,
		);
		const sau = await t.p.evaluate(
			(nhan) => ({
				bien: document.querySelector('[data-da-dua-vao] [data-slot="alert-title"]')?.textContent?.trim() ?? "",
				lienKet: document.querySelector('[data-nut="xem-theo-don-vi"]')?.getAttribute("href") ?? "",
				conNut: [...document.querySelectorAll("[data-dong] button")].filter((b) => nhan.includes(b.textContent?.trim() ?? "")).length,
			}),
			[m.dong.themMucTieu, m.dong.themKr, m.dong.themCanChinh, m.dong.boQua, mui.proposedChange.undo],
		);
		ghi(`   bien nhan «${sau.bien}» · lien ket ${sau.lienKet} · nut quyet con ${sau.conNut}`);
		buoc(5, sau.bien !== m.banNhap.daTao("1") || !sau.lienKet.includes("/okr/theo-don-vi") ? "thieu bien nhan Da tao hay lien ket" : sau.conNut > 0 ? "con nut quyet hay Hoan tac" : null);
		if (!doDo) kiem(`console khong loi (${t.loi.length})`, t.loi.length === 0);
		for (const l of t.loi.slice(0, 5)) ghi(`   console: ${l.slice(0, 200)}`);
	} finally {
		await t.dong();
	}
}
