import { tre } from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import { DEM, LENH, TEN } from "./kich-ban.mjs";
import {
	anh,
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
	the,
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

const SO = { [`${TEN.k11}/khoi`]: "100", [`${TEN.k11}/dich`]: "150", [`${TEN.k12}/khoi`]: "5", [`${TEN.k12}/dich`]: "9" };
const giongSo = (so) => Object.entries(SO).every(([k, v]) => so[k] === v);
const inSo = (so) => Object.entries(so).map(([k, v]) => `${k}=${v}`).join(" · ");

function doiDong(du) {
	const chaMoi = new Map(du.dong.filter((d) => d.loai === "muc-tieu-moi").map((d) => [d.khoa, d.id]));
	return {
		...du,
		dong: du.dong.map((d) =>
			d.loai === "muc-tieu-moi"
				? { ...d, khoa: d.id, khoaDong: `id:${d.id}` }
				: { ...d, khoa: d.id, khoaDong: `id:${d.id}`, chaKhoa: chaMoi.get(d.chaKhoa) ?? d.chaKhoa },
		),
	};
}

function khoaTheoId(than) {
	const mot = (o) => (o?.result?.data?.dong ? { ...o, result: { ...o.result, data: doiDong(o.result.data) } } : o);
	return Array.isArray(than) ? than.map(mot) : mot(than);
}

async function giaKhoaTheoId(t) {
	await t.p.setRequestInterception(true);
	t.p.on("request", async (r) => {
		if (!r.url().includes("okr.soanDanhSach")) return r.continue();
		try {
			const res = await fetch(r.url(), { headers: { ...r.headers(), cookie: `${the.tl.ten}=${the.tl.gia}; lang=vi` } });
			const than = khoaTheoId(await res.json());
			await r.respond({ status: res.status, contentType: "application/json", body: JSON.stringify(than) });
		} catch {
			await r.continue();
		}
	});
	ghi("   (chieu do khoa-theo-id: khoa cua moi dong dat bang id dong, tu dau toi cuoi)");
}

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
		if (doDo === "khoa-theo-id") await giaKhoaTheoId(t);
		if (!(await mo(t, cuoc.id)) || !(await nop1(t))) await khongDo("khong dung duoc ban nhap dau");
		await bamTrongDong(t.p, TEN.k12, m.dong.themKr);
		await choBienNhan(t.p, TEN.k12);
		for (const [k, v] of Object.entries(SO)) {
			const [ten, o] = k.split("/");
			if (!(await goSo(t.p, ten, o, v))) await khongDo(`khong go duoc o ${k}`);
		}
		const dau = await docSo(t.p);
		ghi(`   da go: ${inSo(dau)}`);
		const idCua = (ten) =>
			t.p.evaluate((ten) => [...document.querySelectorAll("[data-dong]")].find((d) => d.checkVisibility() && d.textContent?.includes(ten))?.getAttribute("data-dong") ?? null, ten);
		const idCu = { cho: await idCua(TEN.k11), nhan: await idCua(TEN.k12) };
		if (!(await guiTin(t, LENH.nopLai))) await khongDo("Kara khong nop lai");
		await choThay(t.p, (chon) => document.querySelectorAll(chon).length === 2, "moc nop lai", MAN.cho.luotMs, CHON.moc);
		await choYen(t.p);
		const idMoi = { cho: await idCua(TEN.k11), nhan: await idCua(TEN.k12) };
		ghi(`   id KR cho: ${idCu.cho} → ${idMoi.cho} · id KR da nhan: ${idCu.nhan} → ${idMoi.nhan}`);
		const doiId = idCu.cho && idMoi.cho && idCu.cho !== idMoi.cho;
		const sauNop = await docSo(t.p);
		ghi(`   sau nop lai: ${inSo(sauNop)}`);
		buoc(1, !doiId ? "khong dung duoc doi chung: id KR cho khong doi sau nop lai" : giongSo(sauNop) ? null : "mat so sau nop lai");
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
		await anh(t, "E11b-sau-tai-lai", doDo);
		const hydrat = t.loi.find((l) => /hydrat/i.test(l));
		buoc(3, hydrat ? "loi hydration" : giongSo(sauTai) ? null : "mat so sau tai lai");
		if (!doDo) kiem(`console khong loi (${t.loi.length})`, t.loi.length === 0);
		for (const l of t.loi.slice(0, 5)) ghi(`   console: ${l.slice(0, 200)}`);
	} finally {
		await t.dong();
	}
}

const SO_DU = {
	[TEN.k11]: ["10", "20"],
	[TEN.k12]: ["50", "30"],
	[TEN.k21]: ["5", "15"],
	[TEN.k22]: ["60", "80"],
};
const KR_LE = { ten: TEN.k13, khoi: "2", dich: "4" };

async function demBang(p) {
	return p.evaluate(() => ({
		nhan: document.querySelectorAll('[data-slot="proposed-change-receipt"]').length,
		cho: document.querySelectorAll("[data-the-cho]").length,
		thieu: document.querySelectorAll("[data-con-thieu] [data-thieu]").length,
	}));
}

async function inDem(p, nhan) {
	const d = await demBang(p);
	ghi(`   ${nhan}: nhan ${d.nhan} · cho ${d.cho} · con thieu ${d.thieu}`);
}

async function bamNhom(p, tenMt) {
	const ok = await p.evaluate((ten) => {
		const nhom = [...document.querySelectorAll('[data-slot="kara-proposal-group"]')].find((g) => g.checkVisibility() && g.textContent?.includes(ten));
		const nut = nhom?.querySelector('[data-slot="kara-batch"]');
		if (!nut || nut.disabled) return false;
		nut.click();
		return true;
	}, tenMt);
	if (ok) await tre(MAN.cho.yenMs);
	return ok;
}

async function demCsdl(cuoc) {
	const [{ mt }] = await sql(`SELECT count(*)::int AS mt FROM "okrObjective" WHERE "cycleId" = $1 AND "departmentId" = $2`, [cuoc.cycleId, cuoc.departmentId]);
	const [{ kr }] = await sql(
		`SELECT count(*)::int AS kr FROM "okrKeyResult" k JOIN "okrObjective" o ON o.id = k."objectiveId" WHERE o."cycleId" = $1 AND o."departmentId" = $2`,
		[cuoc.cycleId, cuoc.departmentId],
	);
	return { mt, kr };
}

export async function phanDuaVao({ doDo, nop1 }) {
	const cuoc = await moCuoc();
	const t = await trang({ rong: 1440, cao: 900 });
	const canMt = DEM.nop1.mucTieu + (doDo === "dem-sai" ? 1 : 0);
	const canKr = DEM.nop1.kr;
	try {
		if (!(await mo(t, cuoc.id)) || !(await nop1(t))) await khongDo("khong dung duoc ban nhap dau");
		await inDem(t.p, "sau ban nhap dau");
		for (const [ten, [khoi, dich]] of Object.entries(SO_DU)) {
			if (!(await goSo(t.p, ten, "khoi", khoi)) || !(await goSo(t.p, ten, "dich", dich))) await khongDo(`khong go duoc so cho ${ten}`);
		}
		if (!(await goSo(t.p, KR_LE.ten, "khoi", KR_LE.khoi))) await khongDo(`khong go duoc Khoi diem cho ${KR_LE.ten}`);
		await inDem(t.p, "sau khi go so");
		for (const ten of [TEN.m1, TEN.m2]) {
			const soTruoc = (await demBang(t.p)).nhan;
			if (!(await bamNhom(t.p, ten))) await khongDo(`khong bam duoc nut nhom cua ${ten}`);
			await choThay(
				t.p,
				(n) => document.querySelectorAll('[data-slot="proposed-change-receipt"]').length > n,
				`bien nhan nhom ${ten}`,
				MAN.cho.manMs,
				soTruoc,
			);
			await inDem(t.p, `sau nhom ${ten}`);
		}
		if (!(await bamTrongDong(t.p, KR_LE.ten, m.dong.themKr))) await khongDo(`khong nhan le duoc ${KR_LE.ten}`);
		await choBienNhan(t.p, KR_LE.ten);
		await inDem(t.p, "sau nhan le KR thu nam");
		await choThay(t.p, () => !!document.querySelector("[data-con-thieu] [data-thieu]"), "con thieu", 15000);
		const chan = await t.p.evaluate(() => ({
			khoa: document.querySelector('[data-nut="dua-vao"]')?.disabled ?? null,
			thieu: [...document.querySelectorAll("[data-con-thieu] [data-thieu]")].map((b) => ({ id: b.getAttribute("data-thieu"), chu: b.textContent?.trim(), nut: b.tagName })),
		}));
		ghi(`   chan: dua vao khoa ${chan.khoa} · con thieu ${JSON.stringify(chan.thieu)}`);
		await anh(t, "E12b-con-thieu", doDo);
		buoc(1, chan.khoa !== true ? "con thieu ma Dua vao khong khoa" : chan.thieu.length !== 1 || chan.thieu[0].chu !== KR_LE.ten || chan.thieu[0].nut !== "BUTTON" ? "Con thieu khong liet dung KR thu nam" : null);
		await t.p.click(`[data-con-thieu] [data-thieu="${chan.thieu[0]?.id}"]`);
		await tre(MAN.cho.yenMs);
		const focus = await t.p.evaluate(() => document.activeElement?.id ?? "");
		ghi(`   focus: ${focus}`);
		buoc(2, focus === `dich-${chan.thieu[0]?.id}` ? null : "bam Con thieu khong dua focus toi o Dich cua KR do");
		await t.p.keyboard.type(KR_LE.dich);
		await t.p.keyboard.press("Tab");
		await tre(MAN.cho.yenMs);
		const nut = await t.p.evaluate(() => {
			const b = document.querySelector('[data-nut="dua-vao"]');
			return { khoa: b?.disabled, chu: b?.textContent?.trim() };
		});
		const truoc = await demCsdl(cuoc);
		await t.p.click('[data-nut="dua-vao"]');
		await choThay(t.p, () => !!document.querySelector('[role="alertdialog"]'), "hop xac nhan", 10000);
		const hop = await t.p.evaluate(() => document.querySelector('[role="alertdialog"]')?.textContent ?? "");
		ghi(`   nut «${nut.chu}» · hop «${hop.slice(0, 200)}»`);
		buoc(3, nut.khoa || nut.chu !== m.banNhap.duaVao(String(DEM.nop1.mucTieu), String(canKr)) ? "nut Dua vao sai chu hay con khoa" : !hop.includes(cuoc.tenDonVi) || !hop.includes(cuoc.tenChuKy) ? "hop xac nhan thieu don vi hay chu ky" : null);
		await t.p.evaluate((nhan) => [...document.querySelectorAll('[role="alertdialog"] button')].find((b) => b.textContent?.trim() === nhan)?.click(), m.banNhap.xacNhan.nut);
		await choThay(t.p, () => !!document.querySelector("[data-da-dua-vao]"), "da dua vao", 30000);
		await anh(t, "E12b-da-dua-vao", doDo);
		const sau = await demCsdl(cuoc);
		const soMt = sau.mt - truoc.mt;
		const soKr = sau.kr - truoc.kr;
		const kr = await sql(
			`SELECT k.title, k."startValue"::float AS s, k."targetValue"::float AS d FROM "okrKeyResult" k JOIN "okrObjective" o ON o.id = k."objectiveId" WHERE o."cycleId" = $1 AND o."departmentId" = $2 AND k.title = ANY($3)`,
			[cuoc.cycleId, cuoc.departmentId, [...Object.keys(SO_DU), KR_LE.ten]],
		);
		const [c] = await sql(`SELECT "trangThai", "duaVaoLuc" FROM "okrCuocSoan" WHERE id = $1`, [cuoc.id]);
		ghi(`   CSDL truoc ${truoc.mt} MT/${truoc.kr} KR · sau ${sau.mt}/${sau.kr} · tao ${soMt} Muc tieu, ${soKr} KR · cuoc ${c.trangThai} duaVaoLuc ${c.duaVaoLuc ? "co" : "rong"}`);
		for (const x of kr) ghi(`   KR ${x.title}: ${x.s} → ${x.d}`);
		const soDung = [...Object.entries(SO_DU), [KR_LE.ten, [KR_LE.khoi, KR_LE.dich]]].every(([ten, [khoi, dich]]) =>
			kr.some((x) => x.title === ten && x.s === Number(khoi) && x.d === Number(dich)),
		);
		buoc(
			4,
			soMt !== canMt
				? `so muc tieu: ${soMt} != ${canMt}`
				: soKr !== canKr
					? `so kr: ${soKr} != ${canKr}`
					: !soDung
						? "so cua KR trong co so du lieu khac so da go"
						: c.trangThai !== "da-dua-vao" || !c.duaVaoLuc
							? "cuoc chua thanh da dua vao"
							: null,
		);
		const xong = await t.p.evaluate(
			(nhan) => ({
				bien: document.querySelector('[data-da-dua-vao] [data-slot="alert-title"]')?.textContent?.trim() ?? "",
				lienKet: document.querySelector('[data-nut="xem-theo-don-vi"]')?.getAttribute("href") ?? "",
				conNut: [...document.querySelectorAll('[data-dong] button, [data-slot="kara-proposal-group"] button')].filter((b) => nhan.includes(b.textContent?.trim() ?? "")).length,
			}),
			[m.dong.themMucTieu, m.dong.themKr, m.dong.themCanChinh, m.dong.boQua, mui.proposedChange.undo],
		);
		ghi(`   bien nhan «${xong.bien}» · lien ket ${xong.lienKet} · nut quyet con ${xong.conNut}`);
		buoc(5, xong.bien !== m.banNhap.daTao(String(DEM.nop1.mucTieu)) || !xong.lienKet.includes("/okr/theo-don-vi") ? "thieu bien nhan Da tao hay lien ket" : xong.conNut > 0 ? "con nut quyet hay Hoan tac" : null);
		if (!doDo) kiem(`console khong loi (${t.loi.length})`, t.loi.length === 0);
		for (const l of t.loi.slice(0, 5)) ghi(`   console: ${l.slice(0, 200)}`);
	} finally {
		await t.dong();
	}
}
