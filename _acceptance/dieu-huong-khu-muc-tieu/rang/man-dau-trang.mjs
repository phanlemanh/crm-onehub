#!/usr/bin/env bun
/**
 * Đo đầu trang khu Mục tiêu trên trình duyệt thật (hồ sơ dieu-huong-khu-muc-tieu).
 *
 *   bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/dieu-huong-khu-muc-tieu/rang/man-dau-trang.mjs"
 *   EVAL=E2|AC8|E5|E15|E16 (vắng = chạy cả năm; TAI, SOAN chỉ chạy khi gọi tên) · --chieu-do <nut-giua-than|khung-cao|dich-goc|an-nut|nhap-sai-don>
 * Mọi dòng SAI đổ vào sổ lỗi của man-lib nên mã thoát khác 0 (trước 15/10 chỉ in, mã vẫn 0).
 *
 * Phiên đo riêng (kho _do + API + app của CÂY ĐANG XÉT), nạp bộ OKR mẫu, đăng nhập
 * bằng người mẫu qua dev:session, chụp vào evidence/, dọn mục tiêu tạo theo id.
 * Mã thoát: 0 đạt · 1 có dòng SAI · 2 không đo được.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP_NAY), "..", "..", "..");
const HO_SO = "dieu-huong-khu-muc-tieu";
const daThongCong = ["signed-off", "machine-cleared"].includes(
	/^status:\s*(\S+)/m.exec(
		readFileSync(join(GOC, "_acceptance", HO_SO, "contract.md"), "utf8"),
	)?.[1] ?? "",
);
process.env.BANG_CHUNG ??= daThongCong
	? join(GOC, ".acceptance-runs", HO_SO, "evidence")
	: join(GOC, "_acceptance", HO_SO, "evidence");
const BANG_CHUNG = process.env.BANG_CHUNG;
const lib = await import("../../kho-tai-lieu/rang/man-lib.mjs");

const OKR = "apps/app/app/(app)/[slug]/okr";
const CHIEU_DO = {
	"khung-cao": {
		nhan: "ban sao khung xuong hang hanh dong cao h-8 (32px) thay vi h-7 nhu nut that",
		tenCay: "dhk-chieu-do-khung",
		chiBuoc: "AC8",
		tep: `${OKR}/hanh-dong-khu.tsx`,
		cam: (s) =>
			s.replace(
				'<Skeleton className="h-7 w-56" data-hang-cho="" />',
				'<Skeleton className="h-8 w-56" data-hang-cho="" />',
			),
		dauVet: '<Skeleton className="h-8 w-56" data-hang-cho="" />',
		ghim: /SAI AC-8: dau trang nhay \d+: dinh thanh the \d+px luc cho -> \d+px sau khi tai/,
	},
	"nut-giua-than": {
		nhan: "ban sao dua nut Them muc tieu ve hang nut trong than Theo don vi",
		tenCay: "dhk-chieu-do-than",
		chiBuoc: "E2",
		tep: `${OKR}/theo-don-vi/theo-don-vi.tsx`,
		cam: (s) =>
			s.replace(
				'<div className="flex flex-wrap items-center gap-2" data-hang-nut>',
				'<div className="flex flex-wrap items-center gap-2" data-hang-nut><button data-nut="them-muc-tieu" type="button">Thêm mục tiêu</button>',
			),
		dauVet: 'data-hang-nut><button data-nut="them-muc-tieu"',
		ghim: /SAI AC-2: theo-don-vi 1440 — phai \d+px \(Thoa thuan \d+px\)|SAI AC-2: THAN theo-don-vi: [1-9]/,
	},
	"dich-goc": {
		nhan: "ban sao giai don vi dich luon tra cap cong ty",
		tenCay: "dhk-chieu-do-dich",
		chiBuoc: "E5",
		tep: `${OKR}/don-dich.ts`,
		cam: (s) =>
			s.replace(
				'	if (tab === "theo-don-vi") return { don: donUrl ?? GOC, nguon: "chon" };',
				'	return { don: GOC, nguon: "goc" };',
			),
		dauVet: '	return { don: GOC, nguon: "goc" };',
		ghim: /SAI AC-3: ngan tao khong mo sau khi bam o Cua toi/,
	},
	"an-nut": {
		nhan: "ban sao an nut Them muc tieu khi khong du quyen",
		tenCay: "dhk-chieu-do-an",
		chiBuoc: "E15",
		tep: `${OKR}/hanh-dong-khu.tsx`,
		cam: (s) =>
			s.replace(
				"	if (!q.duoc)\n		return (",
				"	if (!q.duoc) return null;\n	if (!q.duoc)\n		return (",
			),
		dauVet: "	if (!q.duoc) return null;",
		ghim: /SAI AC-5: \(a\) nut them-muc-tieu vang/,
	},
	"nhap-sai-don": {
		nhan: "ban sao mo hop nhap cho cap cong ty thay don vi dich",
		tenCay: "dhk-chieu-do-nhap",
		chiBuoc: "E16",
		tep: `${OKR}/hanh-dong-khu.tsx`,
		cam: (s) =>
			s.replace(
				"toi(q.dich.don, SEARCH_PARAM.okr.nhap)",
				'toi({ loai: "goc" }, SEARCH_PARAM.okr.nhap)',
			),
		dauVet: 'toi({ loai: "goc" }, SEARCH_PARAM.okr.nhap)',
		ghim: /SAI AC-4: xem truoc nhap gui goc, mong phong-ban/,
	},
};

const iDo = process.argv.indexOf("--chieu-do");
if (iDo >= 0) {
	const ten = process.argv[iDo + 1];
	const cay = CHIEU_DO[ten];
	if (!cay) {
		console.log(
			`KHONG DO DUOC: chieu do «${ten ?? ""}» khong co — ${Object.keys(CHIEU_DO).join(", ")}`,
		);
		process.exit(2);
	}
	await lib.chieuDo(TEP_NAY, cay);
}

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/man-dau-trang.mjs"`,
	);
	process.exit(2);
}

const CHON = new Set(
	`${process.env.EVAL ?? ""},${process.env.CHI_BUOC ?? ""}`
		.split(",")
		.map((s) => s.trim().toUpperCase())
		.filter(Boolean),
);
const chay = (e) => CHON.size === 0 || CHON.has(e);

const { chiaCookie } = await import(
	"../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs"
);
const { okrMessages } = await import(join(GOC, "apps/app/lib/messages/okr.ts"));
const M = okrMessages("vi");
const { okrSoanMessages } = await import(
	join(GOC, "apps/app/lib/messages/okr-soan.ts")
);
const MS = okrSoanMessages("vi");
const MAU = JSON.parse(
	readFileSync(join(GOC, "apps/api/scripts/okr-mau/cong-ty.json"), "utf8"),
);
const MIEN = "mau.onehub.test";
const idMau = (loai, ma) => `mau-okr-${loai}-${ma}`;
const d = await lib.moDo();
const sai = [];
const dong = (dung, cau) => {
	console.log(dung ? cau : `SAI ${cau}`);
	if (!dung) sai.push(cau);
	return dung;
};

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

const daTao = [];
const choMs = (ms) => new Promise((r) => setTimeout(r, ms));

async function doDau(t) {
	return t.evaluate(() => {
		const r = (s) => document.querySelector(s)?.getBoundingClientRect() ?? null;
		const nut =
			document.querySelector(
				"[data-slot=page-shell-actions] [data-nut=them-muc-tieu]",
			) ??
			[
				...document.querySelectorAll(
					"[data-slot=page-shell-actions] button, [data-slot=page-shell-actions] a",
				),
			].at(-1);
		const n = nut?.getBoundingClientRect() ?? null;
		const tl = r("[role=tablist]");
		const h1 = r("[data-slot=page-shell-title]");
		const mo = r("[data-slot=page-shell-description]");
		const hang = r("[data-slot=page-shell-actions]");
		return {
			phai: n ? Math.round(window.innerWidth - n.right) : null,
			dinhNut: n ? Math.round(n.top) : null,
			dinhThe: tl ? Math.round(tl.top) : null,
			h1: h1 ? Math.round(h1.top) : null,
			moTa: mo ? Math.round(mo.top) : null,
			hang: hang ? Math.round(hang.top) : null,
			tran: document.documentElement.scrollWidth - window.innerWidth,
		};
	});
}

const thuTu = (x) =>
	x.hang > x.moTa ? "tieu-de>mo-ta>hang" : "tieu-de>hang>mo-ta";

try {
	await napBoMau();
	const truongBo = new Set(MAU.boPhan.map((b) => b.truong));
	const truongPhong = new Set(MAU.phongBan.map((p) => p.truong));
	const thuong = MAU.nguoi.find(
		(n) => n.vai === "member" && !truongBo.has(n.ma) && !truongPhong.has(n.ma),
	);
	const quanTriMa = MAU.nguoi.find((n) => n.vai === "admin").ma;
	const P1 = MAU.phongBan.find((p) => p.ma === "kd-bac");
	const P2 = MAU.phongBan.find((p) => p.ma === "kd-nam");
	if (!thuong || !P1 || !P2) {
		console.log(
			"KHONG DO DUOC: bo mau thieu nguoi thuong hoac phong kd-bac/kd-nam",
		);
		process.exit(2);
	}
	const QT = phienCua(`${quanTriMa}@${MIEN}`);
	const TP1 = phienCua(`${P1.truong}@${MIEN}`);
	const TV = phienCua(`${thuong.ma}@${MIEN}`);
	await d.batTrinhDuyet(QT);
	const kyLap = idMau("chu-ky", "nam-ke");
	const P1_ID = idMau("pb", P1.ma);
	const P2_ID = idMau("pb", P2.ma);

	if (chay("E2")) {
		console.log("== E2 (AC-2): hang hanh dong o dau trang, canh Thoa thuan");
		const TRANG = [
			["cua-toi", "/okr"],
			["cap-nhat-tuan", "/okr/cap-nhat-tuan"],
			["theo-don-vi", "/okr/theo-don-vi"],
			["toan-canh", "/okr/toan-canh"],
			["suc-khoe", "/okr/toan-canh/suc-khoe"],
			["hoi-y", "/okr/hoi-y"],
		];
		for (const kho of [1440, 390]) {
			const tD = await d.moTrang(QT, kho, "/deals");
			await d.doi(
				tD,
				() =>
					document.querySelector(
						"[data-slot=page-shell-actions] button, [data-slot=page-shell-actions] a",
					) !== null,
			);
			const deals = await doDau(tD);
			dong(
				deals.phai !== null,
				`DOI CHUNG deals ${kho}: nut chinh Thoa thuan phai ${deals.phai}px`,
			);
			await tD.screenshot({
				path: join(BANG_CHUNG, `dau-trang-deals-${kho}.png`),
			});
			await tD.close();
			for (const [the, duong] of TRANG) {
				const t = await d.moTrang(QT, kho, `${duong}?kyOkr=${kyLap}`);
				await d.doi(
					t,
					() => document.querySelector("[data-nut=them-muc-tieu]") !== null,
				);
				await choMs(600);
				const x = await doDau(t);
				const lech = Math.abs((x.phai ?? 9999) - (deals.phai ?? 0));
				let dung = x.tran <= 0;
				let ly = `tran ngang ${x.tran}px`;
				if (kho === 1440) {
					dung = dung && lech <= 1 && x.dinhNut < x.dinhThe;
					ly = `phai ${x.phai}px (Thoa thuan ${deals.phai}px) · dinh nut ${x.dinhNut} < dinh thanh the ${x.dinhThe} · ${ly}`;
				} else {
					dung = dung && thuTu(x) === thuTu(deals) && x.h1 < x.hang;
					ly = `thu tu ${thuTu(x)} (Thoa thuan ${thuTu(deals)}) · ${ly}`;
				}
				dong(dung, `${dung ? "NUT" : "AC-2:"} ${the} ${kho}: ${ly}`);
				await t.screenshot({
					path: join(BANG_CHUNG, `dau-trang-${the}-${kho}.png`),
				});
				if (the === "theo-don-vi" && kho === 1440) {
					const soNut = await t.evaluate(
						() =>
							[
								...document.querySelectorAll(
									"main [data-nut=them-muc-tieu], main [data-nut=nhap-bang-tinh], main [data-nhom-soan]",
								),
							].filter((e) => !e.closest("[data-slot=page-shell-header]"))
								.length,
					);
					dong(
						soNut === 0,
						`${soNut === 0 ? "" : "AC-2: "}THAN theo-don-vi: ${soNut} nut tao/nhap/soan trong main ngoai [data-slot=page-shell-header]`,
					);
				}
				await t.close();
			}
			const tK = await d.moTrang(TV, kho, "/okr");
			await d.doi(
				tK,
				() => document.querySelector("[data-nut=them-muc-tieu]") !== null,
			);
			await choMs(600);
			const k = await tK.evaluate(() => {
				const n = document.querySelector("[data-nut=them-muc-tieu]");
				const id = n?.getAttribute("aria-describedby");
				const g = id ? document.getElementById(id) : null;
				return {
					tat: n?.disabled === true,
					coGhi: g?.getAttribute("data-slot") === "page-shell-note",
					chu: g?.textContent ?? "",
				};
			});
			dong(
				k.tat && k.coGhi,
				`${k.tat && k.coGhi ? "KHOA" : "AC-2: KHOA"} ${kho}: nut chinh ${k.tat ? "disabled" : "BAT"}, aria-describedby ${k.coGhi ? "tro page-shell-note" : "KHONG tro page-shell-note"}`,
			);
			await tK.screenshot({ path: join(BANG_CHUNG, `khoa-ly-do-${kho}.png`) });
			await tK.close();
		}
		const can = [
			...[
				"cua-toi",
				"cap-nhat-tuan",
				"theo-don-vi",
				"toan-canh",
				"suc-khoe",
				"hoi-y",
			].flatMap((t) => [1440, 390].map((k) => `dau-trang-${t}-${k}.png`)),
			"dau-trang-deals-1440.png",
			"dau-trang-deals-390.png",
			"khoa-ly-do-1440.png",
			"khoa-ly-do-390.png",
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
				? "DUNG AC-2: 12/12 o + than 0 nut + 2/2 khoa"
				: `AC-2: ${sl} o sai`,
		);
	}

	if (chay("AC8")) {
		console.log("== AC-8: dau trang khong nhay khi quyen tai xong");
		for (const kho of [1440, 390]) {
			const mo = await d.moTrang(TP1, kho, "/okr/hoi-y");
			const t = await mo.browser().newPage();
			await mo.close();
			await t.setViewport({
				width: kho,
				height: kho < 500 ? 844 : 900,
				deviceScaleFactor: 1,
				isMobile: kho < 500,
				hasTouch: kho < 500,
			});
			const host = new URL(d.APP).hostname;
			await t.setCookie(
				{ name: TP1.ten, value: TP1.gia, domain: host, path: "/" },
				{ name: "lang", value: "vi", domain: host, path: "/" },
			);
			await t.setRequestInterception(true);
			const giu = [];
			let tha = false;
			t.on("request", (r) => {
				if (!tha && r.url().includes("okr.danhSach")) giu.push(r);
				else r.continue().catch(() => null);
			});
			await t.goto(`${d.APP}/${d.slug()}/okr`, {
				waitUntil: "load",
				timeout: 120_000,
			});
			for (let i = 0; i < 80 && giu.length === 0; i += 1) await choMs(250);
			const coCho = await t
				.waitForFunction(
					() => document.querySelector("[data-hang-cho]") !== null,
					{ timeout: 20_000 },
				)
				.then(() => true)
				.catch(() => false);
			if (giu.length === 0 || !coCho) {
				console.log(
					`KHONG DO DUOC: AC-8 ${kho}: khong giu duoc truy van quyen (giu ${giu.length}, khung xuong ${coCho ? "co" : "vang"})`,
				);
				for (const id of daTao)
					await d.db.okrObjective.delete({ where: { id } }).catch(() => null);
				process.exit(2);
			}
			const doThe = () =>
				t.evaluate(() =>
					Math.round(
						document.querySelector("[role=tablist]")?.getBoundingClientRect()
							.top ?? -1,
					),
				);
			await choMs(400);
			const truoc = await doThe();
			tha = true;
			for (const r of giu) await r.continue().catch(() => null);
			await d.doi(
				t,
				() =>
					document.querySelector("[data-nut=them-muc-tieu]") !== null &&
					document.querySelector("[data-hang-cho]") === null,
			);
			await choMs(500);
			const sau = await doThe();
			dong(
				truoc === sau,
				`${truoc === sau ? "KHONG NHAY" : "AC-8: dau trang nhay"} ${kho}: dinh thanh the ${truoc}px luc cho -> ${sau}px sau khi tai`,
			);
			await t.close();
		}
	}

	if (CHON.has("SOAN")) {
		console.log(
			"== SOAN (AC-4, loi hua khung-okr-truoc-r1): quan tri, chua noi Kara",
		);
		if (process.env.OKR_AGENT_BRIDGE_SECRET) {
			console.log(
				"KHONG DO DUOC: SOAN can phien do TAT cau noi Kara — chay voi OKR_AGENT_BRIDGE_SECRET= (rong)",
			);
			process.exit(2);
		}
		const t = await d.moTrang(QT, 1440, `/okr/theo-don-vi?kyOkr=${kyLap}`);
		await d.doi(
			t,
			() => document.querySelector("[data-nut=them-muc-tieu]") !== null,
		);
		await choMs(800);
		const n = await t.evaluate(() => {
			const hang = document.querySelector("[data-hang-hanh-dong]");
			const nhom = hang?.querySelector("[data-nhom-soan]") ?? null;
			return {
				coNhom: Boolean(nhom),
				khoa: nhom?.querySelector("button")?.disabled ?? null,
				coI: Boolean(nhom?.querySelector("[data-nut=thong-tin-soan]")),
				trongThan: Boolean(
					document.querySelector("[data-hang-nut] [data-nhom-soan]"),
				),
			};
		});
		let chuI = "";
		if (n.coI) {
			await d.bamSel(t, "[data-hang-hanh-dong] [data-nut=thong-tin-soan]");
			chuI = await t.evaluate(
				() =>
					document.querySelector("[data-thong-tin-soan]")?.textContent ?? "",
			);
		}
		await t.screenshot({
			path: join(BANG_CHUNG, "soan-chua-cau-hinh-1440.png"),
		});
		const dung =
			n.coNhom &&
			n.khoa === true &&
			chuI.includes(MS.nut.chuaCauHinh) &&
			!n.trongThan;
		dong(
			dung,
			dung
				? "DUNG SOAN: quan tri thay nhom soan khoa o hang hanh dong dau trang, «i» noi chua cau hinh"
				: `AC-4: quan tri chua noi Kara — nhom soan ${n.coNhom ? "co" : "VANG"} o dau trang, khoa ${n.khoa}, «i» «${chuI.slice(0, 60)}», con trong than ${n.trongThan}`,
		);
		await t.close();
	}

	if (CHON.has("TAI")) {
		console.log(
			"== TAI (AC-8 o Theo don vi sau nap san may chu): tai cung, moc tieu de so voi du lieu",
		);
		for (const kho of [1440, 390]) {
			const mo = await d.moTrang(TP1, kho, "/okr/hoi-y");
			const t = await mo.browser().newPage();
			await mo.close();
			await t.setViewport({
				width: kho,
				height: kho < 500 ? 844 : 900,
				deviceScaleFactor: 1,
				isMobile: kho < 500,
				hasTouch: kho < 500,
			});
			const host = new URL(d.APP).hostname;
			await t.setCookie(
				{ name: TP1.ten, value: TP1.gia, domain: host, path: "/" },
				{ name: "lang", value: "vi", domain: host, path: "/" },
			);
			await t.evaluateOnNewDocument(() => {
				const moc = { h1: -1, nut: -1, cho: false, dinhDau: -1, dinhCuoi: -1 };
				Object.assign(window, { __mocTai: moc });
				const soi = () => {
					const bay = performance.now();
					const the = document.querySelector("[role=tablist]");
					if (moc.h1 < 0 && document.querySelector("h1")) {
						moc.h1 = bay;
						moc.dinhDau = Math.round(the?.getBoundingClientRect().top ?? -1);
					}
					if (document.querySelector("[data-hang-cho]")) moc.cho = true;
					if (moc.nut < 0 && document.querySelector("[data-nut=them-muc-tieu]"))
						moc.nut = bay;
					if (moc.dinhDau < 0 && the)
						moc.dinhDau = Math.round(the.getBoundingClientRect().top);
				};
				new MutationObserver(soi).observe(document, {
					childList: true,
					subtree: true,
				});
			});
			const batDau = Date.now();
			await t.goto(`${d.APP}/${d.slug()}/okr/theo-don-vi`, {
				waitUntil: "load",
				timeout: 120_000,
			});
			await d.doi(
				t,
				() => document.querySelector("[data-nut=them-muc-tieu]") !== null,
			);
			await choMs(500);
			const moc = await t.evaluate(() => {
				const m = Reflect.get(window, "__mocTai");
				m.dinhCuoi = Math.round(
					document.querySelector("[role=tablist]")?.getBoundingClientRect()
						.top ?? -1,
				);
				return m;
			});
			const dung =
				moc.h1 >= 0 &&
				moc.nut >= 0 &&
				moc.h1 <= moc.nut &&
				moc.dinhDau === moc.dinhCuoi;
			dong(
				dung,
				`${dung ? "DUNG TAI" : "TAI: sai"} ${kho}: tieu de ${Math.round(moc.h1)}ms · nut them ${Math.round(moc.nut)}ms · khung xuong trinh duyet ${moc.cho ? "co" : "khong"} · dinh thanh the ${moc.dinhDau}px -> ${moc.dinhCuoi}px · tong ${Date.now() - batDau}ms`,
			);
			await t.close();
		}
	}

	if (chay("E5")) {
		console.log(
			"== E5 (AC-3): tao tu Cua toi vao dung don vi dich (may chu that)",
		);
		const ten = `DHK thu tao ${lib.MA}`;
		const t = await d.moTrang(TP1, 1440, "/okr");
		await d.doi(
			t,
			() =>
				document.querySelector("[data-nut=them-muc-tieu]:not([disabled])") !==
				null,
		);
		await d.bamSel(t, "[data-nut=them-muc-tieu]");
		let moNgan = true;
		try {
			await d.choDuong(t, "/okr/theo-don-vi");
			await d.doi(t, () => document.querySelector("[id$='-ten']") !== null);
		} catch {
			moNgan = false;
		}
		if (
			!dong(
				moNgan,
				moNgan
					? "ngan tao mo tren Theo don vi"
					: "AC-3: ngan tao khong mo sau khi bam o Cua toi",
			)
		) {
			await t.screenshot({ path: join(BANG_CHUNG, "tao-tu-cua-toi.png") });
		} else {
			const url = new URL(t.url());
			dong(
				url.searchParams.get("donOkr") === `pb:${P1_ID}`,
				`${url.searchParams.get("donOkr") === `pb:${P1_ID}` ? "" : "AC-3: "}duong dan donOkr=${url.searchParams.get("donOkr")} (mong pb:${P1_ID})`,
			);
			await t.click("[id$='-ten']");
			await t.keyboard.type(ten);
			await t.screenshot({ path: join(BANG_CHUNG, "tao-tu-cua-toi.png") });
			await d.bamSel(t, "[data-nut=gui-muc-tieu]");
			let mt = null;
			for (let i = 0; i < 40 && !mt; i += 1) {
				mt = await d.db.okrObjective.findFirst({
					where: { title: ten },
					select: { id: true, level: true, departmentId: true, cycleId: true },
				});
				if (!mt) await choMs(250);
			}
			if (mt) daTao.push(mt.id);
			const cyc = await d.hoi(TP1, "okr.cycles");
			const dung =
				mt?.level === "phong-ban" &&
				mt.departmentId === P1_ID &&
				mt.cycleId === cyc.currentId;
			dong(
				dung,
				dung
					? `DUNG AC-3: muc tieu «${ten}» thuoc phong-ban P1, ky ${mt.cycleId}`
					: `AC-3: muc tieu «${ten}» ${mt ? `level ${mt.level} dep ${mt.departmentId} ky ${mt.cycleId}` : "khong thay trong kho"}`,
			);
		}
		await t.close();
		const t2 = await d.moTrang(
			TP1,
			1440,
			`/okr/theo-don-vi?donOkr=pb:${P2_ID}`,
		);
		await d.doi(t2, () => document.querySelector("[role=tab]") !== null);
		await t2.evaluate(() =>
			[...document.querySelectorAll("[role=tab]")]
				.find((x) => new URL(x.href).pathname.endsWith("/okr"))
				?.click(),
		);
		await d.choDuong(t2, "/okr");
		await d.doi(
			t2,
			() => document.querySelector("[data-nut=them-muc-tieu]") !== null,
		);
		await choMs(500);
		const r = await t2.evaluate(() => {
			const n = document.querySelector("[data-nut=them-muc-tieu]");
			const a =
				n?.tagName === "A" ? n : (n?.querySelector("a") ?? n?.closest("a"));
			return { bat: n && !n.disabled, href: a?.getAttribute("href") ?? "" };
		});
		const dich = new URL(r.href || "/", "http://x").searchParams.get("donOkr");
		dong(
			r.bat && dich === `pb:${P1_ID}`,
			`${r.bat && dich === `pb:${P1_ID}` ? "DUNG AC-3 di-ve: nut bat, dich phong-ban P1" : `AC-3 di-ve: nut ${r.bat ? "bat" : "khoa"}, dich ${dich}`}`,
		);
		await t2.close();
	}

	if (chay("E15")) {
		console.log("== E15 (AC-5): khoa kem ly do, may chu that");
		const t = await d.moTrang(TV, 1440, "/okr");
		await d.doi(
			t,
			() =>
				document.querySelector("[data-nut=them-muc-tieu]") !== null ||
				document.querySelector("[data-hang-cho]") === null,
		);
		await choMs(800);
		const a = await t.evaluate(() => {
			const n = document.querySelector("[data-nut=them-muc-tieu]");
			const g = document.getElementById(
				n?.getAttribute("aria-describedby") ?? "-",
			);
			return {
				co: Boolean(n),
				tat: n?.disabled === true,
				chu: g?.textContent ?? "",
			};
		});
		if (!a.co) dong(false, "AC-5: (a) nut them-muc-tieu vang");
		else
			dong(
				a.tat && a.chu === M.khoaTao.chuaDan,
				`${a.tat && a.chu === M.khoaTao.chuaDan ? "" : "AC-5: "}(a) thanh vien: nut ${a.tat ? "khoa" : "bat"}, ly do «${a.chu}»`,
			);
		await t.close();
		const t2 = await d.moTrang(
			TP1,
			1440,
			`/okr/theo-don-vi?donOkr=pb:${P2_ID}`,
		);
		await d.doi(
			t2,
			() => document.querySelector("[data-nut=them-muc-tieu]") !== null,
		);
		await choMs(800);
		const mong = M.khoaTao.khongSua.replace("{ten}", P2.ten);
		const b = await t2.evaluate(() => {
			const n = document.querySelector("[data-nut=them-muc-tieu]");
			const g = document.getElementById(
				n?.getAttribute("aria-describedby") ?? "-",
			);
			return { tat: n?.disabled === true, chu: g?.textContent ?? "" };
		});
		dong(
			b.tat && b.chu === mong,
			`${b.tat && b.chu === mong ? "" : "AC-5: "}(b) truong P1 o P2: nut ${b.tat ? "khoa" : "bat"}, ly do «${b.chu}»`,
		);
		await t2.close();
		let tuChoi = false;
		try {
			const cyc = await d.hoi(TV, "okr.cycles");
			await d.lam(TV, "okr.createObjective", {
				cycleId: cyc.currentId,
				level: "phong-ban",
				divisionId: null,
				departmentId: P2_ID,
				title: `DHK khong quyen ${lib.MA}`,
				kind: "cam-ket",
			});
		} catch (e) {
			tuChoi = /403|FORBIDDEN|400/.test(String(e));
		}
		dong(
			tuChoi,
			`${tuChoi ? "" : "AC-5: "}may chu tu choi tao cua thanh vien: ${tuChoi ? "khop" : "KHONG tu choi"}`,
		);
		const t3 = await d.moTrang(TP1, 1440, "/okr");
		await d.doi(
			t3,
			() => document.querySelector("[data-nut=them-muc-tieu]") !== null,
		);
		await choMs(500);
		const bat = await t3.evaluate(
			() =>
				!document
					.querySelector("[data-nut=them-muc-tieu]")
					?.hasAttribute("disabled"),
		);
		dong(
			bat,
			`${bat ? "" : "AC-5: "}DOI CHUNG truong P1 o /okr: nut ${bat ? "bat" : "khoa"}`,
		);
		await t3.close();
		const sl = sai.filter((s) => s.startsWith("AC-5")).length;
		dong(
			sl === 0,
			sl === 0
				? "DUNG AC-5 may chu: 2/2 ca khoa dung cau + tu choi khop"
				: `AC-5: ${sl} cho sai`,
		);
	}

	if (chay("E16")) {
		console.log("== E16 (AC-4): «…» Nhap tu Cua toi gui dung don vi");
		const t = await d.moTrang(TP1, 1440, "/okr");
		const gui = [];
		t.on("request", (r) => {
			if (r.url().includes("okr.previewImport"))
				gui.push(r.postData() ?? decodeURIComponent(r.url()));
		});
		await d.doi(
			t,
			() =>
				document.querySelector("[data-nut=them-cach]:not([disabled])") !== null,
		);
		await d.bamSel(t, "[data-nut=them-cach]");
		await d.bamSel(t, "[data-nut=nhap-bang-tinh]");
		await d.choDuong(t, "/okr/theo-don-vi");
		await d.doi(
			t,
			() => document.querySelector("[role=dialog] textarea") !== null,
		);
		await t.click("[role=dialog] textarea");
		await t.keyboard.type(
			`Mục tiêu nhập ${lib.MA}\tKR một\ttăng tới\t0\t10\tlần\t${P1.truong}@${MIEN}`,
		);
		await d.bamChu(t, "[role=dialog] button", M.nhap.xemTruoc);
		for (let i = 0; i < 40 && gui.length === 0; i += 1) await choMs(250);
		const than = gui.join(" ");
		const dung = than.includes(P1_ID) && than.includes("pb");
		dong(
			dung,
			dung
				? "DUNG AC-4: xem truoc nhap gui don vi phong-ban P1"
				: `AC-4: xem truoc nhap gui ${than.includes(P1_ID) ? "?" : "goc"}, mong phong-ban P1 — «${than.slice(0, 160)}»`,
		);
		await t.close();
	}
} catch (e) {
	await lib.cho(0);
	console.log(`KHONG DO DUOC: ${String(e?.stack ?? e).slice(0, 500)}`);
	for (const id of daTao)
		await d.db.okrObjective.delete({ where: { id } }).catch(() => null);
	process.exit(2);
}
for (const id of daTao)
	await d.db.okrObjective.delete({ where: { id } }).catch(() => null);
console.log(
	sai.length === 0 ? "KET LUAN: dat" : `KET LUAN: ${sai.length} dong SAI`,
);
for (const cau of sai) d.dat("SAI", false, cau);
await d.ket("man-dau-trang");
