import { join } from "node:path";
import {
	API,
	APP,
	BD,
	CO_DO,
	chuanBi,
	chup,
	db,
	GOC,
	idMau,
	KY4,
	KYKE,
	ketThuc,
	kiem,
	moKhung,
	moTrang,
	thamSo,
	tre,
	trpc,
	yen,
} from "./ban-do.mjs";

const { gieoGopY, SAN } = await import(
	join(GOC, "_acceptance/gop-y-dung-cho/rang/san-gop-y.mjs")
);
const { toChucMessages } = await import(
	join(GOC, "apps/app/lib/messages/to-chuc.ts")
);

const PHAN = thamSo("--phan");
const chay = (ten) => PHAN === null || PHAN === ten;
const { cookie, slug } = await chuanBi();
const KR_MAY = idMau("kr", SAN.ma.kr1);
const MT_A = idMau("mt", SAN.ma.a);
const MT_B = idMau("mt", SAN.ma.b);
const PB_BAC = idMau("pb", "kd-bac");
const PB_NAM = idMau("pb", "kd-nam");
const MT_C = idMau("mt", "q4-kd-nam-1");

const hien = (p, chon) =>
	p.$$eval(
		chon,
		(ds) =>
			ds.filter((e) => {
				for (let x = e; x; x = x.parentElement)
					if (getComputedStyle(x).display === "none") return false;
				const r = e.getBoundingClientRect();
				return r.width > 0 && r.height > 0;
			}).length,
	);

async function phanSoKr() {
	let soO = 0;
	for (const kho of [BD.kho[390], BD.kho[1440]]) {
		const { ctx, p } = await moTrang(cookie["truong-phong"], kho);
		await moKhung(p, slug, SAN.ma.a);
		const chon = `[data-okr-sheet] button[data-so-kr="${KR_MAY}"]`;
		if (CO_DO && kho.ten === "390")
			await p.$$eval(chon, (ds) => {
				for (const e of ds) e.removeAttribute("data-so-kr");
			});
		const so = await hien(p, chon);
		if (!kiem(so === 1, `khong thay nut so: ${kho.ten} (${so})`)) {
			await ctx.close();
			continue;
		}
		const nut = (await p.$$(chon)).at(0);
		const tatCa = await p.$$(chon);
		for (const n of tatCa)
			if (await n.evaluate((e) => e.getBoundingClientRect().width > 0)) {
				await n.click();
				break;
			}
		const mo = await p
			.waitForSelector(`[data-so-kr-sheet="${KR_MAY}"]`, {
				timeout: BD.cho.phanTu,
			})
			.catch(() => null);
		if (
			kiem(
				mo !== null && nut !== undefined,
				`nut so khong mo khung: ${kho.ten}`,
			)
		)
			console.log(`so kr ok ${kho.ten} hien=1 mo=1`);
		await chup(p, `E3-so-kr-${kho.ten}`);
		soO += 1;
		await ctx.close();
	}
	console.log(`so o: ${soO}`);
}

async function phanThem() {
	const vai = CO_DO ? "nhan-vien" : "quan-tri";
	const { ctx, p } = await moTrang(cookie[vai], BD.kho[1440]);
	await p.goto(
		`${APP}/${slug}/okr/theo-don-vi?kyOkr=${KYKE}&donOkr=pb:${PB_BAC}`,
		{
			waitUntil: "domcontentloaded",
		},
	);
	await p.waitForSelector("[data-hang-hanh-dong] [data-nut=them-muc-tieu]", {
		timeout: BD.cho.phanTu,
	});
	await yen(p);
	// AC-14 loi-hua-moi: dieu-huong-khu-muc-tieu AC-5 — nguoi khong co quyen van thay nut o dau trang nhung bi khoa; dem nut bam duoc.
	const so = await hien(p, "[data-nut=them-muc-tieu]:not(:disabled)");
	if (
		!kiem(so === 1, `khong thay nut them: ${CO_DO ? "thanh-vien" : "quan-tri"}`)
	) {
		await chup(p, "E11-them-khong-thay");
		await ctx.close();
		return;
	}
	const ten = `Mục tiêu lẻ R1d ${Date.now().toString(36)}`;
	await p.click("[data-nut=them-muc-tieu]");
	const o = await p.waitForSelector("input[id$='-ten']", {
		visible: true,
		timeout: BD.cho.phanTu,
	});
	await o.type(ten);
	await p.click("[data-nut=gui-muc-tieu]");
	const hang = await p
		.waitForFunction(
			(t) =>
				[...document.querySelectorAll("[data-hang-muc-tieu]")].some((h) =>
					h.textContent?.includes(t),
				),
			{ timeout: BD.cho.phanTu },
			ten,
		)
		.catch(() => null);
	await yen(p);
	await chup(p, "E11-them-muc-tieu");
	const xem = await trpc(API, cookie["quan-tri"]).hoi("okr.byUnit", {
		cycleId: KYKE,
		unit: { loai: "pb", id: PB_BAC },
	});
	const api = (xem?.objectives ?? []).some((m) => m.title === ten);
	if (
		kiem(
			hang !== null && api,
			`them khong luu: hang=${hang !== null} api=${api}`,
		)
	)
		console.log("them ok hien=1 luu=1 api=1");
	await ctx.close();
}

async function phanKara() {
	await gieoGopY({
		api: API,
		quanTri: cookie["quan-tri"],
		truong: cookie["truong-phong"],
	});
	let soO = 0;
	for (const cach of ["chuot", "enter"]) {
		const { ctx, p } = await moTrang(cookie["truong-phong"], BD.kho[390]);
		await p.goto(`${APP}/${slug}/okr?kyOkr=${KY4}`, {
			waitUntil: "domcontentloaded",
		});
		const chip = `[data-hang-muc-tieu="${MT_A}"] [data-chip-gop-y]`;
		await p.waitForSelector(chip, { timeout: BD.cho.phanTu });
		await yen(p);
		await moKhung(p, slug, SAN.ma.a);
		await p.goto(`${APP}/${slug}/okr?kyOkr=${KY4}`, {
			waitUntil: "domcontentloaded",
		});
		await p.waitForSelector(chip, { timeout: BD.cho.phanTu });
		await yen(p);
		await tre(1000);
		if (cach === "chuot") await p.click(chip);
		else {
			await p.focus(chip);
			await p.keyboard.press("Enter");
		}
		await p.waitForSelector("[data-vung-kara]", { timeout: BD.cho.phanTu });
		await tre(1500);
		if (CO_DO)
			await p.evaluate(() => {
				const k = document.querySelector("[data-cuon-ca-khung]");
				if (k) k.scrollTop = 0;
			});
		const d = await p.evaluate(() => {
			const khung = [...document.querySelectorAll("[data-cuon-ca-khung]")].find(
				(e) => e.getBoundingClientRect().height > 0,
			);
			const vung = document.querySelector("[data-vung-kara]");
			if (!khung || !vung) return null;
			const k = khung.getBoundingClientRect();
			const v = vung.getBoundingClientRect();
			return {
				tren: Math.round(v.top - k.top),
				cao: Math.round(k.height),
				cuon: khung.scrollTop,
			};
		});
		const neo = new URL(p.url()).searchParams.has("neoGopY");
		const dung =
			d !== null && d.tren >= 0 && d.tren <= d.cao - 40 && d.cuon > 0 && !neo;
		if (
			kiem(dung, `kara ngoai tam nhin: ${cach} ${JSON.stringify(d)} neo=${neo}`)
		)
			console.log(`kara ok ${cach} tren=${d?.tren}`);
		await chup(p, `E13-kara-${cach}`);
		soO += 1;
		await ctx.close();
	}
	console.log(`so o: ${soO}`);
}

/* trang-don-vi-mot-bang (AC-14): ô chọn đơn vị có tìm kiếm thay cây — mở ô
   chọn rồi bấm lựa chọn mang đúng tên phòng ban (đổi đơn vị phía trình duyệt như
   bấm cây, không tải lại trang). */
async function chonDon(p, idPb) {
	const { name } = await db.department.findUniqueOrThrow({
		where: { id: idPb },
		select: { name: true },
	});
	await p.click("[data-chon-don-vi]");
	await p.waitForSelector("[cmdk-item]", {
		visible: true,
		timeout: BD.cho.phanTu,
	});
	const muc = await p.evaluateHandle(
		(ten) =>
			[...document.querySelectorAll("[cmdk-item]")].find(
				(e) => e.querySelector(":scope > span")?.textContent?.trim() === ten,
			) ?? null,
		name,
	);
	await muc.asElement()?.click();
}

async function phanThuGon() {
	const nhanVien = idMau("nguoi", "do-minh-khoa");
	await trpc(API, cookie["truong-phong"]).lam("okr.updateObjective", {
		id: MT_B,
		ownerUserId: nhanVien,
	});
	let soO = 0;
	for (const cach of ["loc", "doi-don-vi"]) {
		const { ctx, p } = await moTrang(cookie["truong-phong"], BD.kho[1440]);
		const goc = `${APP}/${slug}/okr/theo-don-vi?kyOkr=${KY4}&donOkr=pb:${PB_BAC}`;
		await p.goto(goc, { waitUntil: "domcontentloaded" });
		// AC-14 cach-toi: nut mo/thu dong la o mui ten cua DataTable (trang-don-vi-mot-bang AC-3), khong nam trong o ten.
		const nutThu = (id) => `[data-mo-dong="${id}"]`;
		await p.waitForSelector(nutThu(MT_A), { timeout: BD.cho.phanTu });
		await yen(p);
		await p.click(nutThu(MT_A));
		await tre(500);
		const khac = cach === "loc" ? MT_B : MT_C;
		if (cach === "loc") {
			const u = new URL(p.url());
			u.searchParams.set("phuTrachOkr", nhanVien);
			await p.goto(u.toString(), { waitUntil: "domcontentloaded" });
		} else {
			await chonDon(p, PB_NAM);
		}
		await p.waitForSelector(nutThu(khac), { timeout: BD.cho.phanTu });
		await yen(p);
		await p.click(nutThu(khac));
		await tre(500);
		if (CO_DO)
			await p.evaluate((a) => {
				const u = new URL(location.href);
				const giu = (u.searchParams.get("expand") ?? "")
					.split(",")
					.filter((x) => x && x !== a);
				u.searchParams.set("expand", giu.join(","));
				history.replaceState(history.state, "", u.toString());
			}, MT_A);
		if (cach === "loc") {
			const u = new URL(p.url());
			u.searchParams.delete("phuTrachOkr");
			await p.goto(u.toString(), { waitUntil: "domcontentloaded" });
		} else {
			await chonDon(p, PB_BAC);
		}
		await p.waitForSelector(nutThu(MT_A), { timeout: BD.cho.phanTu });
		await yen(p);
		const mo = await p.$eval(nutThu(MT_A), (e) =>
			e.getAttribute("aria-expanded"),
		);
		const url = new URL(p.url()).searchParams.get("expand") ?? "";
		if (
			kiem(
				// AC-14 loi-hua-moi: trang-don-vi-mot-bang AC-3 — mac dinh moi dong thu, duong dan nho dong MO (expand) thay dong thu (thuMucTieu).
				mo === "true" && url.includes(MT_A),
				`mat id khuat: ${cach} (aria=${mo} url=${url})`,
			)
		)
			console.log(`thu-gon ok ${cach} A=${mo}`);
		await chup(p, `E18-thu-gon-${cach}`);
		soO += 1;
		await ctx.close();
	}
	console.log(`so o: ${soO}`);
}

async function phanKhoiPhuc() {
	const q = trpc(API, cookie["quan-tri"]);
	const duoi = Date.now().toString(36);
	const tenX = `Khối R1d đo ${duoi}`;
	const bp = (await q.lam("org.createDivision", { name: tenX })).id;
	const pb = (
		await q.lam("org.createDepartment", {
			name: `Phòng R1d đo ${duoi}`,
			divisionId: bp,
		})
	).id;
	await q.lam("org.archiveDepartment", { id: pb });
	await q.lam("org.archiveDivision", { id: bp });
	const m = toChucMessages("en");
	const mong = m.khoiPhucChaLuuTru.replace("{ten}", tenX);
	const { ctx, p } = await moTrang(cookie["quan-tri"], BD.kho[1440], {
		lang: CO_DO ? "vi" : "en",
	});
	const moDanhSach = async () => {
		await p.goto(`${APP}/${slug}/settings/organization`, {
			waitUntil: "domcontentloaded",
		});
		await p.waitForSelector("[data-slot=archived-list] button", {
			timeout: BD.cho.phanTu,
		});
		await yen(p);
		await p.click("[data-slot=archived-list] button");
		await tre(500);
	};
	await moDanhSach();
	const bam = await p.evaluate(
		(id, tenPb) => {
			const hang = [
				...document.querySelectorAll(
					"[data-slot=archived-list] li, [data-slot=archived-list] [data-slot=item]",
				),
			].find((h) => h.textContent?.includes(tenPb));
			const nut = hang?.querySelector("button");
			nut?.click();
			return nut ? true : false;
		},
		pb,
		`Phòng R1d đo ${duoi}`,
	);
	const toast = await p
		.waitForSelector("[data-chan-khoi-phuc]", { timeout: 15_000 })
		.catch(() => null);
	const chu = toast
		? await toast.evaluate((e) => e.textContent?.trim() ?? "")
		: "";
	await chup(p, "E20-khoi-phuc-chan-en");
	await moDanhSach();
	const conLuu = await p.evaluate(
		(tenPb) =>
			[...document.querySelectorAll("[data-slot=archived-list]")].some((h) =>
				h.textContent?.includes(tenPb),
			),
		`Phòng R1d đo ${duoi}`,
	);
	const pbDb = await db.department.findUniqueOrThrow({
		where: { id: pb },
		select: { archivedAt: true },
	});
	if (
		kiem(
			bam && chu === mong && conLuu && pbDb.archivedAt !== null,
			`toast khong khop ngon ngu: en (bam=${bam} chu=${chu} conLuu=${conLuu})`,
		)
	)
		console.log("khoi-phuc ok toast=en ten=1 con-luu-tru=1");
	await ctx.close();
}

if (chay("so-kr")) await phanSoKr();
if (chay("them")) await phanThem();
if (chay("kara")) await phanKara();
if (chay("thu-gon")) await phanThuGon();
if (chay("khoi-phuc")) await phanKhoiPhuc();
await ketThuc();
