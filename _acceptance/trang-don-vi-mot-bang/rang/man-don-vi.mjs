#!/usr/bin/env bun
/**
 * Đo trang Theo đơn vị một bảng trên trình duyệt thật (hồ sơ trang-don-vi-mot-bang).
 *
 *   EVAL=E2|E3|E4|E5|E17 bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/trang-don-vi-mot-bang/rang/man-don-vi.mjs"
 *   (vắng EVAL = chạy cả năm)
 *
 * Phiên đo riêng (kho _do + API + app của CÂY ĐANG XÉT), nạp bộ OKR mẫu, đăng nhập
 * quản trị mẫu qua dev:session, chụp vào evidence/. Chu kỳ đo: «Quý 4 · mẫu».
 * E3 đặt pha của chu kỳ đó sang cham-diem TRÊN KHO ĐO rồi trả lại pha cũ.
 * Mã thoát: 0 đạt · 1 có dòng SAI · 2 không đo được.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP_NAY), "..", "..", "..");
const HO_SO = "trang-don-vi-mot-bang";
// Hồ sơ đã thông cổng thì ảnh ra .acceptance-runs/: làn ghim lại dừng khi lệnh đo chạm cây hồ sơ đã ký
// (bài học DH1 9b770cdfd).
const daThongCong = ["signed-off", "machine-cleared"].includes(
	/^status:\s*(\S+)/m.exec(
		readFileSync(join(GOC, "_acceptance", HO_SO, "contract.md"), "utf8"),
	)?.[1] ?? "",
);
process.env.BANG_CHUNG ??= daThongCong
	? join(GOC, ".acceptance-runs", HO_SO, "evidence")
	: join(GOC, "_acceptance", HO_SO, "evidence");
const BANG_CHUNG = process.env.BANG_CHUNG;

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/man-don-vi.mjs"`,
	);
	process.exit(2);
}

const lib = await import("../../kho-tai-lieu/rang/man-lib.mjs");
const { chiaCookie } = await import(
	"../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs"
);
const { okrMessages } = await import(join(GOC, "apps/app/lib/messages/okr.ts"));
const { okrToanCanhMessages } = await import(
	join(GOC, "apps/app/lib/messages/okr-toan-canh.ts")
);
const { okrKhepMessages } = await import(
	join(GOC, "apps/app/lib/messages/okr-khep.ts")
);
const M = okrMessages("vi");
const NHAN_XEM = {
	"danh-sach": M.danhSach,
	cay: M.cayCanChinh,
	"hop-tuan": okrToanCanhMessages("vi").hopTuan.cachXem,
	cham: okrKhepMessages("vi").cham.cachXem,
};

const CHON = new Set(
	`${process.env.EVAL ?? ""},${process.env.CHI_BUOC ?? ""}`
		.split(",")
		.map((s) => s.trim().toUpperCase())
		.filter(Boolean),
);
const chay = (e) => CHON.size === 0 || CHON.has(e);

const MAU = JSON.parse(
	readFileSync(join(GOC, "apps/api/scripts/okr-mau/cong-ty.json"), "utf8"),
);
const MIEN = "mau.onehub.test";
const idMau = (loai, ma) => `mau-okr-${loai}-${ma}`;
const KY = idMau("chu-ky", "quy4");
const d = await lib.moDo();
const sai = [];
const dong = (dung, cau) => {
	console.log(dung ? cau : `SAI ${cau}`);
	if (!dung) sai.push(cau);
	return dung;
};
const choMs = (ms) => new Promise((r) => setTimeout(r, ms));
const duongDon = (don, them = "") =>
	`/okr/theo-don-vi?kyOkr=${KY}${don ? `&donOkr=${don}` : ""}${them}`;

const phienCua = (email) =>
	chiaCookie(
		execFileSync("bun", ["run", "dev:session", email], {
			cwd: join(GOC, "apps", "api"),
			encoding: "utf8",
		})
			.trim()
			.split("\n")
			.pop()
			.trim(),
	);

async function napBoMau() {
	const co = await d.db.okrCycle.count();
	if (co > 0) return;
	const nap = spawnSync("bun", ["scripts/okr-mau.ts"], {
		cwd: join(GOC, "apps", "api"),
		env: process.env,
		encoding: "utf8",
	});
	if (nap.status !== 0) {
		console.log(
			`KHONG DO DUOC: nap bo OKR mau thoat ${nap.status}: ${`${nap.stdout}${nap.stderr}`.trim().split("\n").at(-1)}`,
		);
		process.exit(2);
	}
}

/* Kho đo: mục tiêu công bố (số của okr.countByUnit cho quản trị) và tập mục
   tiêu mà okr.danhSach liệt kê cho phòng ban (mọi trạng thái trừ «da-bo»,
   quản trị không bị giới hạn hiển thị). */
const demCongBo = (pbId) =>
	d.db.okrObjective.count({
		where: {
			cycleId: KY,
			level: "phong-ban",
			departmentId: pbId,
			status: "cong-bo",
		},
	});
const tenTrenBang = async (pbId) =>
	(
		await d.db.okrObjective.findMany({
			where: {
				cycleId: KY,
				level: "phong-ban",
				departmentId: pbId,
				status: { not: "da-bo" },
			},
			select: { title: true },
		})
	)
		.map((m) => m.title)
		.sort();

const choBang = (t) =>
	d.doi(
		t,
		() =>
			document.querySelector("[data-hang-muc-tieu]") !== null &&
			document.querySelector("[data-slot=page-shell-content] thead") !== null,
	);

/* Trang đã dựng xong (mọi cách xem): ô chọn hiện, không còn khối aria-busy. */
const choDung = (t) =>
	d.doi(
		t,
		() =>
			window.__tim("[data-chon-don-vi]").length > 0 &&
			document.querySelector(
				"[data-slot=page-shell-content] [aria-busy=true]",
			) === null,
	);

async function soNutThan(t) {
	return t.evaluate(
		() =>
			[
				...document.querySelectorAll(
					"main [data-nut=them-muc-tieu], main [data-nut=nhap-bang-tinh], main [data-nhom-soan]",
				),
			].filter((e) => !e.closest("[data-slot=page-shell-header]")).length,
	);
}

/* Khoảng từ đáy thanh thẻ (không có thẻ: đáy đầu trang) tới đỉnh hàng tiêu đề bảng. */
async function doKhoang(t) {
	return t.evaluate(() => {
		const th = document
			.querySelector("[data-slot=page-shell-content] thead")
			?.getBoundingClientRect();
		const tl = document
			.querySelector("[data-slot=page-shell] [role=tablist]")
			?.getBoundingClientRect();
		const hd = document
			.querySelector("[data-slot=page-shell-header]")
			?.getBoundingClientRect();
		const day = tl ? tl.bottom : (hd?.bottom ?? null);
		return {
			khoang: th && day !== null ? Math.round(th.top - day) : null,
			nguon: tl ? "day thanh the" : "day dau trang",
		};
	});
}

async function doHang(t) {
	return t.evaluate(() => {
		const hien = (e) =>
			Boolean(e) &&
			e.offsetParent !== null &&
			e.getBoundingClientRect().width > 0;
		const hop = document.querySelector("[data-hang-cong-cu-don-vi]");
		const thanh = hop?.parentElement ?? null;
		const nut = [...(thanh?.querySelectorAll("button") ?? [])].filter(hien);
		const theoChu = (re) =>
			nut.find((b) => re.test((b.innerText ?? "").trim())) ?? null;
		const cs = {
			"o chon": document.querySelector("[data-chon-don-vi]"),
			"cach xem":
				[...document.querySelectorAll("[data-view-switch]")].find(hien) ?? null,
			"o loc nhanh": theoChu(/^(Tất cả|Cần bàn|Chưa góp vào đâu)/),
			Loc: theoChu(/^Lọc/),
			"Sap xep": theoChu(/^Sắp xếp/),
		};
		const tam = {};
		const vang = [];
		for (const [k, e] of Object.entries(cs)) {
			if (!hien(e)) {
				vang.push(k);
				continue;
			}
			const r = e.getBoundingClientRect();
			tam[k] = r.top + r.height / 2;
		}
		const gt = Object.values(tam);
		return {
			k: gt.length,
			lech:
				gt.length > 0 ? Math.round(Math.max(...gt) - Math.min(...gt)) : null,
			vang,
			tam,
		};
	});
}

async function doThan(t) {
	return t.evaluate(() => ({
		the: document.querySelectorAll("main [data-don-vi]").length,
		hangNut: document.querySelectorAll("main [data-hang-nut]").length,
		tran: {
			sw: document.documentElement.scrollWidth,
			iw: window.innerWidth,
		},
	}));
}

/* Vị trí ô chọn và cách xem đang hiện (ToggleGroup ≥ md, Select < md). */
async function viTri(t) {
	return t.evaluate(() => {
		const hien = (e) => Boolean(e) && e.offsetParent !== null;
		const o = [...document.querySelectorAll("[data-chon-don-vi]")].find(hien);
		const x = [...document.querySelectorAll("[data-view-switch]")].find(hien);
		const r = (e) => {
			if (!e) return null;
			const b = e.getBoundingClientRect();
			return { top: Math.round(b.top), left: Math.round(b.left) };
		};
		const dangXem = x
			? x.getAttribute("data-view-switch") === "nut"
				? (x.querySelector("[data-state=on]")?.textContent ?? "").trim()
				: (
						x.querySelector("[data-slot=select-value]")?.textContent ?? ""
					).trim()
			: "";
		return {
			o: r(o),
			x: r(x),
			xHien: Boolean(x),
			ten: (o?.innerText ?? "").trim(),
			dangXem,
		};
	});
}

async function moOChon(t, go) {
	await d.bamSel(t, "[data-chon-don-vi]");
	await d.doi(t, () => document.querySelector("[cmdk-input]") !== null);
	if (go) {
		await t.click("[cmdk-input]");
		await t.keyboard.type(go);
		await choMs(500);
	}
}

const luaChonDangMo = (t) =>
	t.evaluate(() =>
		[...document.querySelectorAll("[cmdk-item]")].map((e) => {
			const s = e.querySelectorAll(":scope > span");
			return {
				ten: (s[0]?.textContent ?? "").trim(),
				goiY: (s[1]?.textContent ?? "").trim(),
			};
		}),
	);

const soTuGoiY = (goiY) => {
	const m = goiY.match(/·\s*(\d+) mục tiêu\s*$/);
	if (m) return Number(m[1]);
	return /chưa đặt\s*$/.test(goiY) ? 0 : null;
};

let phaCu = null;
async function traPha() {
	if (phaCu === null) return;
	await d.db.okrCycle
		.update({ where: { id: KY }, data: { phase: phaCu } })
		.catch(() => null);
	phaCu = null;
}

try {
	await napBoMau();
	const quanTriMa = MAU.nguoi.find((n) => n.vai === "admin").ma;
	const pbMa = (ma) => MAU.phongBan.find((p) => p.ma === ma);
	const P_DS = pbMa("phap-che");
	const P_A = pbMa("kd-bac");
	const P_B = pbMa("kd-nam");
	const B = MAU.boPhan.find((b) => b.ma === "kinh-doanh");
	if (!P_DS || !P_A || !P_B || !B) {
		console.log(
			"KHONG DO DUOC: bo mau thieu phong phap-che/kd-bac/kd-nam hoac bo phan kinh-doanh",
		);
		process.exit(2);
	}
	const ky = await d.db.okrCycle.findUnique({
		where: { id: KY },
		select: { phase: true },
	});
	if (!ky) {
		console.log(`KHONG DO DUOC: kho do khong co chu ky ${KY}`);
		process.exit(2);
	}
	const QT = phienCua(`${quanTriMa}@${MIEN}`);
	await d.batTrinhDuyet(QT);
	const DON_DS = `pb:${idMau("pb", P_DS.ma)}`;

	if (chay("E2")) {
		console.log("== E2 (AC-2): mot hang cong cu, khoang canh Thoa thuan");
		const soDS = (await tenTrenBang(idMau("pb", P_DS.ma))).length;
		if (soDS < 3) {
			console.log(
				`KHONG DO DUOC: ${P_DS.ten} chi co ${soDS} muc tieu trong kho do (can >= 3)`,
			);
			process.exit(2);
		}
		const khoangDeals = [];
		for (const kho of [1440, 390]) {
			for (let lan = 0; lan < (kho === 1440 ? 2 : 1); lan += 1) {
				const tD = await d.moTrang(QT, kho, "/deals");
				await d.doi(
					tD,
					() =>
						document.querySelector("[data-slot=page-shell-content] thead") !==
						null,
				);
				await choMs(400);
				if (kho === 1440) khoangDeals.push(await doKhoang(tD));
				if (lan === 0) await d.chup(tD, `deals-${kho}.png`);
				await tD.close();
			}
		}
		const [kD1, kD2] = khoangDeals;
		dong(
			kD1.khoang !== null && kD1.khoang === kD2.khoang,
			`${kD1.khoang !== null && kD1.khoang === kD2.khoang ? "" : "AC-2: "}DOI CHUNG DUONG: khoang Thoa thuan do hai lan ${kD1.khoang}px · ${kD2.khoang}px (${kD1.nguon}) — lech ${kD1.khoang === null || kD2.khoang === null ? "?" : Math.abs(kD1.khoang - kD2.khoang)}`,
		);

		let khoangLech = null;
		let tranNgang = 0;
		let theDonVi = 0;
		let soHang = 0;
		for (const kho of [1440, 390]) {
			const t = await d.moTrang(QT, kho, duongDon(DON_DS));
			await choBang(t);
			await choMs(500);
			if (kho === 1440) {
				const h = await doHang(t);
				const motHang = h.k === 5 && h.lech !== null && h.lech <= 4;
				if (motHang) soHang = 1;
				dong(
					motHang,
					`${motHang ? "" : "AC-2: "}HANG 1440: ${h.k} dieu khien, dinh lech toi da ${h.lech}px${h.vang.length > 0 ? ` · vang ${h.vang.join(", ")}` : ""}`,
				);
				const k = await doKhoang(t);
				khoangLech =
					k.khoang === null || kD1.khoang === null
						? null
						: Math.abs(k.khoang - kD1.khoang);
				dong(
					khoangLech !== null && khoangLech <= 2,
					khoangLech !== null && khoangLech <= 2
						? `KHOANG 1440: don vi ${k.khoang}px · Thoa thuan ${kD1.khoang}px (${k.nguon} / ${kD1.nguon})`
						: `AC-2: khoang lech ${khoangLech ?? "?"}px — KHOANG 1440: don vi ${k.khoang}px · Thoa thuan ${kD1.khoang}px`,
				);
				const th = await doThan(t);
				theDonVi = th.the;
				dong(
					th.the === 0 && th.hangNut === 0,
					`${th.the === 0 && th.hangNut === 0 ? "" : "AC-2: "}THAN 1440: ${th.the} [data-don-vi] card, ${th.hangNut} [data-hang-nut]`,
				);
			} else {
				const th = await doThan(t);
				const ngang = await d.cuonNgang(t);
				tranNgang = ngang.length;
				dong(
					th.tran.sw <= th.tran.iw && ngang.length === 0,
					`${th.tran.sw <= th.tran.iw && ngang.length === 0 ? "" : "AC-2: "}TRAN 390: scrollWidth ${th.tran.sw} <= innerWidth ${th.tran.iw}${ngang.length > 0 ? ` · ${ngang.join(", ")}` : ""}`,
				);
			}
			await d.chup(t, `don-vi-danh-sach-${kho}.png`);
			const nutMo = await t.evaluateHandle(
				() => window.__tim("[data-mo-dong]")[0],
			);
			await nutMo.click();
			await choMs(400);
			const mo = await t.evaluate(() => ({
				mo:
					document
						.querySelector("[data-mo-dong]")
						?.getAttribute("aria-expanded") === "true",
				kr: window.__tim("[data-kr]").length,
			}));
			dong(
				mo.mo && mo.kr > 0,
				`${mo.mo && mo.kr > 0 ? "" : "AC-2: "}MO KR ${kho}: aria-expanded ${mo.mo} · ${mo.kr} dong KR hien`,
			);
			await d.chup(t, `don-vi-mo-kr-${kho}.png`);
			await t.close();

			const tC = await d.moTrang(QT, kho, duongDon(DON_DS));
			await choBang(tC);
			await moOChon(tC, "mien");
			const lc = await luaChonDangMo(tC);
			dong(
				lc.length > 0,
				`${lc.length > 0 ? "" : "AC-2: "}CHON ${kho}: go «mien» -> ${lc.map((x) => x.ten).join(" | ")}`,
			);
			await d.chup(tC, `don-vi-chon-${kho}.png`);
			await tC.close();
		}
		// Ảnh Họp tuần cho E14 chụp ở pha GỐC của chu kỳ (không pha chấm, không
		// biểu ngữ cam); E3 ghi Họp tuần pha chấm dưới tên khác.
		const phaE2 = (
			await d.db.okrCycle.findUnique({
				where: { id: KY },
				select: { phase: true },
			})
		)?.phase;
		if (phaE2 === "cham-diem" || phaE2 === "da-dong") {
			console.log(
				`KHONG DO DUOC: chu ky ${KY} dang o pha ${phaE2} — anh Hop tuan cua E14 can pha thuong`,
			);
			process.exit(2);
		}
		for (const kho of [1440, 390]) {
			const tH = await d.moTrang(QT, kho, duongDon(DON_DS, "&xemOkr=hop-tuan"));
			await choDung(tH);
			await choMs(500);
			// Mở nhóm «Còn lại n KR» (nếu có) để ảnh có dòng dữ liệu, không chỉ trạng thái trống.
			const moConLai = await tH.evaluate(() => {
				const n = [...document.querySelectorAll("main button")].find((b) =>
					/^Còn lại \d+ KR/.test((b.textContent ?? "").trim()),
				);
				n?.click();
				return Boolean(n);
			});
			if (moConLai) await choMs(500);
			await d.chup(tH, `don-vi-hop-tuan-${kho}.png`);
			await tH.close();
		}
		console.log(`  anh Hop tuan chup o pha ${phaE2}`);

		const can = [
			"don-vi-danh-sach-1440.png",
			"don-vi-danh-sach-390.png",
			"don-vi-mo-kr-1440.png",
			"don-vi-mo-kr-390.png",
			"don-vi-chon-1440.png",
			"don-vi-chon-390.png",
			"deals-1440.png",
			"deals-390.png",
			"don-vi-hop-tuan-1440.png",
			"don-vi-hop-tuan-390.png",
		];
		const thieu = can.filter((f) => !existsSync(join(BANG_CHUNG, f)));
		if (thieu.length > 0) {
			console.log(`KHONG DO DUOC: thieu anh ${thieu.join(", ")}`);
			process.exit(2);
		}
		const sl = sai.filter((s) => s.startsWith("AC-2")).length;
		dong(
			sl === 0,
			sl === 0
				? `DUNG AC-2: ${soHang} hang · khoang lech ${khoangLech}px · ${theDonVi} the don vi · ${tranNgang} tran`
				: (sai
						.find((s) => s.startsWith("AC-2: khoang lech"))
						?.split(" — ")[0] ?? `AC-2: ${sl} cho sai`),
		);
	}

	if (chay("E3")) {
		console.log(
			"== E3 (AC-4): o chon va cach xem dung yen qua 4 cach xem x 2 kho",
		);
		if (ky.phase !== "cham-diem") {
			phaCu = ky.phase;
			await d.db.okrCycle.update({
				where: { id: KY },
				data: { phase: "cham-diem" },
			});
			console.log(
				`-- kho do: pha chu ky ${KY} ${phaCu} -> cham-diem (se tra lai)`,
			);
		}
		// Họp tuần pha chấm có biểu ngữ cam — không đè ảnh pha thường của E2 (E14).
		const tenAnhE3 = (xem) => (xem === "hop-tuan" ? "hop-tuan-cham" : xem);
		let dat = 0;
		for (const kho of [1440, 390]) {
			let goc = null;
			for (const xem of ["danh-sach", "cay", "hop-tuan", "cham"]) {
				const t = await d.moTrang(
					QT,
					kho,
					duongDon(DON_DS, xem === "danh-sach" ? "" : `&xemOkr=${xem}`),
				);
				await choDung(t);
				await choMs(600);
				const v = await viTri(t);
				const nut = await soNutThan(t);
				if (xem === "danh-sach") goc = v;
				const lech = (a, b) =>
					a && b
						? Math.max(Math.abs(a.top - b.top), Math.abs(a.left - b.left))
						: Number.POSITIVE_INFINITY;
				const lo = lech(v.o, goc?.o);
				const lx = lech(v.x, goc?.x);
				const dungXem = v.dangXem === NHAN_XEM[xem];
				const dungDon = v.ten === P_DS.ten;
				if (kho === 390 && !v.xHien) {
					dong(false, `AC-4: ${xem} 390 — cach xem bi giau sau Lọc`);
				}
				const dung =
					v.xHien && lo <= 1 && lx <= 1 && nut === 0 && dungXem && dungDon;
				if (dung) dat += 1;
				dong(
					dung,
					`${dung ? "" : "AC-4: "}VI TRI ${xem} ${kho}: o chon (${v.o?.top},${v.o?.left}) · cach xem (${v.x?.top},${v.x?.left}) · nut than ${nut} · lech ${lo === Number.POSITIVE_INFINITY ? "?" : lo}/${lx === Number.POSITIVE_INFINITY ? "?" : lx}px · dang xem «${v.dangXem}» · don «${v.ten}»`,
				);
				if (xem !== "danh-sach")
					await d.chup(t, `don-vi-${tenAnhE3(xem)}-${kho}.png`);
				await t.close();
			}
		}
		await traPha();
		const thieu = ["hop-tuan", "cham", "cay"]
			.flatMap((x) => [1440, 390].map((k) => `don-vi-${tenAnhE3(x)}-${k}.png`))
			.filter((f) => !existsSync(join(BANG_CHUNG, f)));
		if (thieu.length > 0) {
			console.log(`KHONG DO DUOC: thieu anh ${thieu.join(", ")}`);
			process.exit(2);
		}
		dong(dat === 8, dat === 8 ? "DUNG AC-4: 8/8 o" : `AC-4: ${dat}/8 o dung`);
	}

	if (chay("E4")) {
		console.log("== E4 (AC-8): 390 mang cham — khung dang tai khong nhay");
		/* Bộ lấy mẫu trong trang, mỗi 50ms. `idDich` vắng: «có bảng» = có dòng mục
		   tiêu bất kỳ; có: chỉ dòng của các id đó (điều hướng mềm sang đơn vị đích). */
		const lapMau = (idDich) => {
			window.__mau = [];
			const dich = idDich ? new Set(idDich) : null;
			const hien = (e) =>
				e.getClientRects().length > 0 &&
				e.closest("[hidden]") === null &&
				getComputedStyle(e).visibility !== "hidden";
			const tat = (s) => [...document.querySelectorAll(s)].filter(hien);
			const doc = (s, canh) => {
				const n = tat(s)[0];
				return n ? Math.round(n.getBoundingClientRect()[canh]) : null;
			};
			const lay = () => {
				const oThat = tat("[data-chon-don-vi]");
				const oKhung = tat("[data-hang-cong-cu-don-vi-khung]");
				const dau = oThat[0] ?? oKhung[0]?.firstElementChild ?? null;
				const hang = tat("[data-hang-muc-tieu]").filter(
					(e) => !dich || dich.has(e.getAttribute("data-hang-muc-tieu")),
				);
				window.__mau.push({
					luc: Math.round(performance.now()),
					cay: tat("[data-nut-cay]").length + tat("[role=tree]").length,
					o: oThat.length + oKhung.length,
					dinh: dau ? Math.round(dau.getBoundingClientRect().top) : null,
					xuong: tat("[data-slot=skeleton]").length,
					quay: tat(
						"[data-slot=page-shell-content] [data-slot=spinner], [data-slot=page-shell-content] .animate-spin",
					).length,
					hang: hang.length > 0,
					nd: doc("[data-slot=page-shell-content]", "top"),
					tl: doc("[role=tablist]", "bottom"),
					loai: oThat[0] ? "that" : oKhung[0] ? "khung" : "-",
					dau: ["page-shell-actions", "page-shell-header"]
						.map((k) => {
							const n = tat(`[data-slot=${k}]`)[0];
							if (!n) return `${k} -`;
							const r = n.getBoundingClientRect();
							return `${k} ${Math.round(r.top)}-${Math.round(r.bottom)}`;
						})
						.join(", "),
				});
			};
			lay();
			const id = setInterval(() => {
				lay();
				if (window.__mau.at(-1)?.hang) clearInterval(id);
			}, 50);
		};
		const trangThaiMau = (t) =>
			t
				.evaluate(() => {
					const m = window.__mau ?? [];
					const cuoi = m.at(-1);
					return {
						noiDung: Boolean(cuoi && cuoi.nd !== null),
						xuong: Boolean(cuoi && cuoi.xuong > 0 && !cuoi.hang),
						hang: m.some((x) => x.hang),
					};
				})
				.catch(() => ({ noiDung: false, xuong: false, hang: false }));
		const dinhDaDung = (t) =>
			t.evaluate(() => {
				const o = [...document.querySelectorAll("[data-chon-don-vi]")].find(
					(e) => e.offsetParent !== null,
				);
				return o ? Math.round(o.getBoundingClientRect().top) : null;
			});
		/* Chặn đúng yêu cầu tRPC okr.danhSach của trình duyệt cho tới khi thả. */
		const datChan = async (t) => {
			await t.setRequestInterception(true);
			const c = { tha: false, giu: [], so: 0 };
			t.on("request", (r) => {
				if (r.isInterceptResolutionHandled()) return;
				if (!c.tha && /\/api\/trpc\/[^?]*okr\.danhSach/.test(r.url())) {
					c.so += 1;
					c.giu.push(r);
					return;
				}
				r.continue().catch(() => null);
			});
			c.thaRa = () => {
				c.tha = true;
				for (const r of c.giu.splice(0)) r.continue().catch(() => null);
			};
			return c;
		};
		/* Chấm một chuỗi mẫu; `canXuong` false = ca không có pha tải phía trình duyệt. */
		const cham = (mau, dinhCuoi, nhan, canXuong) => {
			const iHang = mau.findIndex((x) => x.hang);
			const tai = mau.slice(0, iHang + 1);
			const dangTai = mau.slice(0, iHang).filter((x) => x.xuong > 0);
			const c = Math.max(0, ...tai.map((x) => x.cay));
			const o = Math.max(0, ...tai.map((x) => x.o));
			const v = Math.max(0, ...tai.map((x) => x.quay));
			const dinh = tai.filter((x) => x.dinh !== null).map((x) => x.dinh);
			const lech =
				dinh.length > 0
					? Math.max(...dinh.map((x) => Math.abs(x - dinhCuoi)))
					: null;
			let truocDo = "";
			for (const x of tai) {
				const k = `${x.loai} dinh ${x.dinh} · noi dung ${x.nd} · day the ${x.tl} · xuong ${x.xuong > 0 ? "co" : "khong"} · bang ${x.hang ? "co" : "khong"} · ${x.dau}`;
				if (k !== truocDo) console.log(`  ${x.luc}ms: ${k}`);
				truocDo = k;
			}
			dong(
				true,
				`${nhan}: ${tai.length} mau · cay toi da ${c} · o chon toi da ${o} · dinh o chon lech ${lech ?? "?"}px · vong quay toan trang ${v} · khung xuong ${dangTai.length} mau`,
			);
			const ten = nhan === "MAU 390" ? "" : "(mem) ";
			if (c > 0) dong(false, `AC-8: ${ten}cay toi da ${c} dong luc dang tai`);
			if (o > 1) dong(false, `AC-8: ${ten}${o} o chon cung luc luc dang tai`);
			if (lech === null || lech > 1)
				dong(
					false,
					`AC-8: ${ten}dinh o chon lech ${lech ?? "?"}px giua dang tai va da dung`,
				);
			if (v > 0)
				dong(false, `AC-8: ${ten}vong quay toan trang ${v} luc dang tai`);
			if (canXuong && dangTai.length === 0)
				dong(
					false,
					`AC-8: ${ten}khong co [data-slot=skeleton] trong mau dang tai`,
				);
			return { c, o, v, lech, xuong: dangTai.length };
		};

		/* (1) Tải cứng với độ trễ 800ms. */
		const duong = duongDon(DON_DS);
		const t = await d.moTrang(QT, 390, duong);
		await choBang(t);
		await t.evaluateOnNewDocument(lapMau, null);
		const cdp = await t.createCDPSession();
		await cdp.send("Network.enable");
		await cdp.send("Network.emulateNetworkConditions", {
			offline: false,
			latency: 800,
			downloadThroughput: -1,
			uploadThroughput: -1,
		});
		const chanCung = await datChan(t);
		const di = t
			.goto(`${d.APP}/${d.slug()}${duong}`, {
				waitUntil: "load",
				timeout: 180_000,
			})
			.catch((e) => e);
		let anhCung = null;
		const han = Date.now() + 120_000;
		while (Date.now() < han) {
			const tt = await trangThaiMau(t);
			const chupGi =
				tt.xuong && anhCung !== "khung xuong"
					? "khung xuong"
					: tt.noiDung && anhCung === null
						? tt.hang
							? "khung dau tien (da co bang)"
							: "khung dau tien"
						: null;
			if (chupGi) {
				await t.screenshot({ path: join(BANG_CHUNG, "dang-tai-390.png") });
				anhCung = chupGi;
				if (tt.xuong) chanCung.thaRa();
			}
			if (tt.hang) break;
			await choMs(25);
		}
		chanCung.thaRa();
		const ketDi = await di;
		if (ketDi instanceof Error) throw ketDi;
		await t
			.waitForNetworkIdle({ idleTime: 500, timeout: 60_000 })
			.catch(() => null);
		await choMs(1500);
		const mau = await t.evaluate(() => window.__mau ?? []);
		const dinhCuoi = await dinhDaDung(t);
		await cdp
			.send("Network.emulateNetworkConditions", {
				offline: false,
				latency: 0,
				downloadThroughput: -1,
				uploadThroughput: -1,
			})
			.catch(() => null);
		await t.close();
		const iHang = mau.findIndex((x) => x.hang);
		if (iHang < 0 || dinhCuoi === null) {
			console.log(
				`KHONG DO DUOC: ${iHang < 0 ? "khong thay [data-hang-muc-tieu] trong mau" : "khong thay o chon sau khi dung"} (${mau.length} mau)`,
			);
			process.exit(2);
		}
		if (!anhCung || !existsSync(join(BANG_CHUNG, "dang-tai-390.png"))) {
			console.log("KHONG DO DUOC: khong chup duoc anh dang-tai-390.png");
			process.exit(2);
		}
		const dauTien = mau.find((x) => x.nd !== null);
		const khongPhaTai = Boolean(dauTien?.hang);
		console.log(
			`  tai cung: ${chanCung.so} yeu cau okr.danhSach tu trinh duyet bi giu · dinh o chon da dung ${dinhCuoi} · anh dang-tai-390.png = ${anhCung}`,
		);
		if (khongPhaTai)
			console.log(
				"KHONG PHA TAI: khung dau tien da co bang (trang dung o may chu) — dieu kien khung xuong khong ap dung cho tai cung",
			);
		const cung = cham(mau, dinhCuoi, "MAU 390", !khongPhaTai);

		/* (2) Điều hướng MỀM: từ đơn vị A chọn đơn vị B trong ô chọn, okr.danhSach
		   của trình duyệt bị giữ tới khi đã thấy (hoặc hết chờ) khung đang tải. */
		const P_MEM = MAU.phongBan.find((p) => p.ma === "kd-bac");
		const idMem = idMau("pb", P_MEM.ma);
		const idDich = (
			await d.db.okrObjective.findMany({
				where: {
					cycleId: KY,
					level: "phong-ban",
					departmentId: idMem,
					status: { not: "da-bo" },
				},
				select: { id: true },
			})
		).map((x) => x.id);
		if (idDich.length === 0) {
			console.log(`KHONG DO DUOC: ${P_MEM.ten} khong co muc tieu trong kho do`);
			process.exit(2);
		}
		const t2 = await d.moTrang(QT, 390, duong);
		await choBang(t2);
		const chanMem = await datChan(t2);
		await moOChon(t2, "mien bac");
		await t2.evaluate(lapMau, idDich);
		const chonB = await t2.evaluateHandle(
			(ten) =>
				[...document.querySelectorAll("[cmdk-item]")].find(
					(e) =>
						(e.querySelector(":scope > span")?.textContent ?? "").trim() ===
						ten,
				) ?? null,
			P_MEM.ten,
		);
		if (!(await chonB.evaluate((e) => e !== null))) {
			console.log(
				`KHONG DO DUOC: o chon khong co lua chon «${P_MEM.ten}» sau khi go «mien bac»`,
			);
			process.exit(2);
		}
		await chonB.click();
		let anhMem = false;
		const hanMem = Date.now() + 15_000;
		while (Date.now() < hanMem) {
			const tt = await trangThaiMau(t2);
			if (tt.xuong && !anhMem) {
				await t2.screenshot({
					path: join(BANG_CHUNG, "dang-tai-mem-390.png"),
				});
				anhMem = true;
				break;
			}
			if (tt.hang) break;
			await choMs(25);
		}
		const soMem = chanMem.so;
		chanMem.thaRa();
		await d
			.doi(t2, () => (window.__mau ?? []).some((x) => x.hang))
			.catch(() => null);
		await t2
			.waitForNetworkIdle({ idleTime: 500, timeout: 30_000 })
			.catch(() => null);
		await choMs(800);
		const mauMem = await t2.evaluate(() => window.__mau ?? []);
		const dinhMem = await dinhDaDung(t2);
		const donMem = new URL(t2.url()).searchParams.get("donOkr");
		await t2.close();
		if (soMem === 0 || !mauMem.some((x) => x.hang) || dinhMem === null) {
			console.log(
				`KHONG DO DUOC: dieu huong mem — ${soMem === 0 ? "trinh duyet khong goi okr.danhSach sau khi chon" : !mauMem.some((x) => x.hang) ? "khong thay dong cua don vi dich" : "khong thay o chon sau khi dung"} (donOkr=${donMem})`,
			);
			process.exit(2);
		}
		console.log(
			`  mem: ${soMem} yeu cau okr.danhSach bi giu · donOkr=${donMem} · dinh o chon da dung ${dinhMem} · anh dang-tai-mem-390.png ${anhMem ? "luc dang tai" : "KHONG chup duoc"}`,
		);
		const mem = cham(mauMem, dinhMem, "MAU MEM 390", true);
		const sl = sai.filter((s) => s.startsWith("AC-8")).length;
		dong(
			sl === 0,
			sl === 0
				? `DUNG AC-8: tai cung ${khongPhaTai ? "khong pha tai" : `khung xuong ${cung.xuong} mau`} · 0 cay · ${Math.max(cung.o, mem.o)} o chon · lech ${cung.lech}/${mem.lech}px · 0 vong quay · mem khung xuong ${mem.xuong} mau`
				: sai.find((s) => s.startsWith("AC-8")),
		);
	}

	if (chay("E5")) {
		console.log("== E5 (AC-1): o chon doi don vi, bang khop kho do");
		const idA = idMau("pb", P_A.ma);
		const idB = idMau("pb", P_B.ma);
		const tenA = await tenTrenBang(idA);
		const tenB = await tenTrenBang(idB);
		const t = await d.moTrang(QT, 1440, duongDon(`pb:${idA}`));
		await choBang(t);
		await moOChon(t);
		const tatCa = await luaChonDangMo(t);
		for (const P of [P_A, P_B]) {
			const lc = tatCa.find((x) => x.ten === P.ten);
			const n = lc ? soTuGoiY(lc.goiY) : null;
			const kho = await demCongBo(idMau("pb", P.ma));
			dong(
				n === kho,
				`${n === kho ? "" : "AC-1: "}SO CHON ${P.ten}: o chon ${n ?? `? («${lc?.goiY ?? "vang"}»)`} · kho do ${kho}`,
			);
		}
		await t.keyboard.press("Escape");
		await choMs(400);
		const truoc = new URL(t.url()).searchParams.get("donOkr");
		await moOChon(t, "mien nam");
		const loc = await luaChonDangMo(t);
		const khop = loc.some((x) => x.ten === P_B.ten);
		dong(
			khop,
			`${khop ? "" : "AC-1: "}TIM «mien nam»: ${loc.map((x) => x.ten).join(" | ") || "(trong)"}`,
		);
		if (khop) {
			const el = await t.evaluateHandle(
				(ten) =>
					[...document.querySelectorAll("[cmdk-item]")].find(
						(e) =>
							(e.querySelector(":scope > span")?.textContent ?? "").trim() ===
							ten,
					),
				P_B.ten,
			);
			await el.click();
		}
		let doiUrl = true;
		try {
			await d.doi(
				t,
				(id) =>
					new URL(location.href).searchParams.get("donOkr") === `pb:${id}`,
				idB,
			);
		} catch {
			doiUrl = false;
		}
		if (!doiUrl) {
			dong(false, "AC-1: URL khong doi sau khi chon");
		} else {
			await t
				.waitForNetworkIdle({ idleTime: 500, timeout: 30_000 })
				.catch(() => null);
			await d
				.doi(
					t,
					(ds) => {
						const ten = [...document.querySelectorAll("[data-mo-muc-tieu]")]
							.map((e) => e.textContent.trim())
							.sort();
						return JSON.stringify(ten) === ds;
					},
					JSON.stringify(tenB),
				)
				.catch(() => null);
			await choMs(500);
			const bang = await t.evaluate(() =>
				[...document.querySelectorAll("[data-mo-muc-tieu]")]
					.map((e) => e.textContent.trim())
					.sort(),
			);
			const url = new URL(t.url()).searchParams.get("donOkr");
			const bangKhop = JSON.stringify(bang) === JSON.stringify(tenB);
			const khacA = JSON.stringify(tenB) !== JSON.stringify(tenA);
			dong(
				url === `pb:${idB}` && url !== truoc && bangKhop && khacA,
				`${bangKhop && khacA ? "" : "AC-1: "}CHON: URL donOkr=${url} · bang ${bang.length} dong · kho do ${tenB.length} muc tieu${bangKhop ? "" : ` · bang [${bang.join(" | ")}] / kho [${tenB.join(" | ")}]`}${khacA ? "" : " · trung tap P_a"}`,
			);
			await d.chup(t, "don-vi-chon-xong-1440.png");
		}
		await t.close();
		const sl = sai.filter((s) => s.startsWith("AC-1")).length;
		dong(
			sl === 0,
			sl === 0
				? "DUNG AC-1: bang khop kho do cho P_b · so khop"
				: (sai.find((s) => s.startsWith("AC-1: URL")) ?? `AC-1: ${sl} cho sai`),
		);
	}

	if (chay("E17")) {
		console.log("== E17 (AC-7): don vi truc thuoc va chan bang khop kho do");
		const bpId = idMau("bp", B.ma);
		const con = await d.db.department.findMany({
			where: { divisionId: bpId, archivedAt: null },
			select: { id: true, name: true },
		});
		const t = await d.moTrang(QT, 1440, duongDon(`bp:${bpId}`));
		await d.doi(
			t,
			() => document.querySelectorAll("[data-don-vi-con] a").length > 0,
		);
		await choMs(500);
		const o = await t.evaluate(() =>
			[...document.querySelectorAll("[data-don-vi-con] a")].map((a) => ({
				ten: (
					a.querySelector("[data-slot=item-title]")?.textContent ?? ""
				).trim(),
				so: (
					a.querySelector("[data-slot=item-description]")?.textContent ?? ""
				).trim(),
				href: a.getAttribute("href") ?? "",
			})),
		);
		const tenCon = con.map((c) => c.name).sort();
		const tenO = o.map((x) => x.ten).sort();
		dong(
			JSON.stringify(tenCon) === JSON.stringify(tenO),
			`${JSON.stringify(tenCon) === JSON.stringify(tenO) ? "" : "AC-7: "}CON ${B.ten}: trang ${tenO.length} o [${tenO.join(" | ")}] · kho do ${tenCon.length} phong ban`,
		);
		let khop = 0;
		for (const x of o) {
			const c = con.find((y) => y.name === x.ten);
			const kho = c ? await demCongBo(c.id) : null;
			const n =
				x.so === M.donViBang.chuaDatOkr
					? 0
					: Number(x.so.match(/^(\d+) mục tiêu$/)?.[1] ?? Number.NaN);
			const dung = n === kho;
			if (dung) khop += 1;
			if (!dung && x.so === M.donViBang.chuaDatOkr)
				dong(false, `AC-7: o ${x.ten} hien Chưa đặt OKR, kho do ${kho}`);
			else
				dong(
					dung,
					`${dung ? "" : "AC-7: "}SO CON ${x.ten}: o ${Number.isNaN(n) ? `«${x.so}»` : n} · kho do ${kho}`,
				);
		}
		await d.chup(t, "don-vi-truc-thuoc-1440.png");
		const dau = o[0];
		const khoaDau = new URL(dau.href, "http://x").searchParams.get("donOkr");
		const giuKy =
			new URL(dau.href, "http://x").searchParams.get("kyOkr") === KY;
		dong(
			giuKy,
			`${giuKy ? "" : "AC-7: "}LIEN KET ${dau.ten}: donOkr=${khoaDau} · kyOkr ${giuKy ? "giu" : "MAT"}`,
		);
		const oDau = await t.evaluateHandle(() =>
			document.querySelector("[data-don-vi-con] a"),
		);
		await oDau.click();
		let sang = true;
		try {
			await d.doi(
				t,
				(k) => new URL(location.href).searchParams.get("donOkr") === k,
				khoaDau,
			);
			await t
				.waitForNetworkIdle({ idleTime: 500, timeout: 30_000 })
				.catch(() => null);
			await d.doi(
				t,
				() =>
					document.querySelector("[data-dong-don-vi]") !== null &&
					document.querySelector("[data-hang-muc-tieu]") !== null,
			);
		} catch {
			sang = false;
		}
		let chanKhop = false;
		dong(
			sang,
			sang
				? `SANG trang ${dau.ten}`
				: `AC-7: bam o ${dau.ten} khong sang trang cua no`,
		);
		if (sang) {
			await choMs(800);
			const ch = await t.evaluate(() => ({
				chan: (
					document.querySelector("[data-dong-don-vi]")?.textContent ?? ""
				).trim(),
				dong: document.querySelectorAll("[data-hang-muc-tieu]").length,
			}));
			const k = Number(ch.chan.match(/(\d+) mục tiêu ·/)?.[1] ?? Number.NaN);
			chanKhop = k === ch.dong;
			dong(
				chanKhop,
				`${chanKhop ? "" : "AC-7: "}SO CHAN ${dau.ten}: chan bang ${Number.isNaN(k) ? `«${ch.chan}»` : k} muc tieu · bang ${ch.dong} dong`,
			);
			await d.chup(t, "don-vi-con-dau-1440.png");
		}
		await t.close();
		const sl = sai.filter((s) => s.startsWith("AC-7")).length;
		dong(
			sl === 0,
			sl === 0
				? `DUNG AC-7: ${khop}/${o.length} o con khop kho do · chan bang khop bang`
				: (sai.find((s) => s.startsWith("AC-7: o ")) ?? `AC-7: ${sl} cho sai`),
		);
	}
} catch (e) {
	await traPha();
	await d.khongDoDuoc(e);
}
await traPha();
console.log(
	sai.length === 0 ? "KET LUAN: dat" : `KET LUAN: ${sai.length} dong SAI`,
);
// d.ket chỉ đếm sổ «hong» của thư viện — đẩy dòng SAI vào đó để mã thoát là 1.
if (sai.length > 0) d.dat("ket", false, `${sai.length} dong SAI`);
await d.ket("man-don-vi");
