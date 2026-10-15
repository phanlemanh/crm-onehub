import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const HERE = dirname(TEP_NAY);
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "loc-va-kieu-xem-chung";
const CHI_DO = process.argv.includes("--chi-do");

const KHO = { hep: 360, rong: 1280 };
const CHO_MS = 30_000;
const MAN = [
	{ ten: "thoa-thuan", duong: "/deals", soDem: 3, coKieuXem: true, coGap: true },
	{ ten: "onboarding", duong: "/onboarding", soDem: 2, coKieuXem: true, coGap: false },
	{ ten: "tai-lieu", duong: "/tai-lieu", soDem: 6, coKieuXem: false, coGap: false },
];
const NHOM_LOC = {
	"thoa-thuan": "Trạng thái",
	onboarding: "Trạng thái kế hoạch",
	"tai-lieu": null,
};

const TEP_ITEM = "packages/ui/src/components/toggle-group.tsx";
const TEP_DEALS = "apps/app/app/(app)/[slug]/deals/deals-table.tsx";
const TEP_TRANG = "apps/app/app/(app)/[slug]/tai-lieu/danh-sach-trang.tsx";
const DONG_LOC =
	"const [{ loai, donVi, chu, page, archived }, doi] = useLocTaiLieu();";
const CAY_DO = {
	1: {
		nhan: "ban sao ve so dem bang opacity-60",
		tenCay: "lkx-chup-loc-chieu-do-1",
		chiBuoc: "1",
		tep: TEP_ITEM,
		cam: (s) =>
			s.replace(
				'className="text-muted-foreground tabular-nums"',
				'className="tabular-nums opacity-60"',
			),
		dauVet: 'className="tabular-nums opacity-60"',
		ghim: /lkx-man: thoa-thuan 1280 so dem mo/,
	},
	2: {
		nhan: "ban sao thoa thuan giau o chon kieu xem tren dien thoai",
		tenCay: "lkx-chup-loc-chieu-do-2",
		chiBuoc: "1",
		tep: TEP_DEALS,
		cam: (s) =>
			s
				.replace(
					"const viewToggle = (\n\t\t<ViewSwitch",
					'const viewToggle = (\n\t\t<div className="hidden md:block">\n\t\t<ViewSwitch',
				)
				.replace(
					"\t\t/>\n\t);\n\n\tconst archivedButton",
					"\t\t/>\n\t\t</div>\n\t);\n\n\tconst archivedButton",
				),
		dauVet: '<div className="hidden md:block">',
		ghim: /lkx-man: thoa-thuan 360 khong co o chon kieu xem/,
	},
	3: {
		nhan: "ban sao tai lieu doc loai la null tu dau",
		tenCay: "lkx-chup-loc-chieu-do-3",
		chiBuoc: "2",
		tep: TEP_TRANG,
		cam: (s) =>
			s.replace(
				DONG_LOC,
				"const [{ donVi, chu, page, archived }, doi] = useLocTaiLieu();\n\tconst loai: LoaiTrang | null = null;",
			),
		dauVet: "const loai: LoaiTrang | null = null;",
		ghim: /lkx-man: tai lieu mo duong dan mat loai/,
	},
	4: {
		nhan: "ban sao tai lieu dong bang loai luc dung",
		tenCay: "lkx-chup-loc-chieu-do-4",
		chiBuoc: "1b",
		tep: TEP_TRANG,
		cam: (s) =>
			s
				.replace('"use client";\n', '"use client";\nimport { useState } from "react";\n')
				.replace(
					DONG_LOC,
					"const [{ loai: loaiDau, donVi, chu, page, archived }, doi] = useLocTaiLieu();\n\tconst [loai] = useState(loaiDau);",
				),
		dauVet: "const [loai] = useState(loaiDau);",
		ghim: /lkx-man: tai lieu bam chip danh sach dung yen/,
	},
};

if (CHI_DO) {
	const ket = [];
	for (const so of Object.keys(CAY_DO)) {
		const r = spawnSync("bun", [relative(GOC, TEP_NAY), `--chieu-do=${so}`], {
			cwd: GOC,
			stdio: "inherit",
		});
		ket.push({ so, ma: r.status });
		console.log(`chieu do ${so}: ma ${r.status}`);
	}
	const lot = ket.filter((k) => k.ma !== 0);
	if (lot.length > 0) {
		console.log(`lkx-man-do: ${lot.length}/${ket.length} chieu do khong ra dung ghim`);
		process.exit(1);
	}
	console.log(`lkx-man-do: ${ket.length}/${ket.length} chieu do ra dung ghim`);
	process.exit(0);
}

const coChieuDo = process.argv.find((a) => a.startsWith("--chieu-do"));
if (coChieuDo) {
	const so = coChieuDo.split("=")[1] ?? "1";
	const cay = CAY_DO[so];
	if (!cay) {
		console.log(`KHONG DO DUOC: chup-loc khong co chieu do ${so}`);
		process.exit(2);
	}
	const { chieuDo } = await import("../../kho-tai-lieu/rang/man-lib.mjs");
	await chieuDo(TEP_NAY, cay);
}

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/chup-loc.mjs"`,
	);
	process.exit(2);
}

process.env.BANG_CHUNG ??= join(GOC, ".acceptance-runs", HO_SO, "evidence");
mkdirSync(process.env.BANG_CHUNG, { recursive: true });

const { cho, chay, moDo } = await import("../../kho-tai-lieu/rang/man-lib.mjs");

const d = await moDo();
const BANG = process.env.BANG_CHUNG;

async function trangMoi(nguoi, rong) {
	const t = await d.trangCuoi().browser().newPage();
	await t.setViewport({
		width: rong,
		height: rong < 500 ? 844 : 900,
		deviceScaleFactor: 1,
		isMobile: rong < 500,
		hasTouch: rong < 500,
	});
	const host = new URL(d.APP).hostname;
	await t.setCookie(
		{ name: nguoi.cookie.ten, value: nguoi.cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	return t;
}

async function choDieu(t, ham, moTa, ...thamSo) {
	try {
		await t.waitForFunction(ham, { timeout: CHO_MS, polling: 100 }, ...thamSo);
	} catch {
		throw new Error(`het ${CHO_MS} ms cho: ${moTa}`);
	}
}

const doMan = (t) =>
	t.evaluate(() => {
		const hien = (e) => e.getClientRects().length > 0;
		const mau = document.createElement("span");
		mau.className = "text-muted-foreground";
		document.body.appendChild(mau);
		const mauPhu = getComputedStyle(mau).color;
		mau.remove();
		const doMo = (e) => {
			let mo = 1;
			for (let n = e; n && n !== document.documentElement; n = n.parentElement)
				mo *= Number(getComputedStyle(n).opacity);
			return mo;
		};
		const so = [...document.querySelectorAll('[data-slot="toggle-group-item-count"]')]
			.filter(hien)
			.map((e) => ({
				chu: e.textContent.trim(),
				mau: getComputedStyle(e).color,
				mo: Number(doMo(e).toFixed(3)),
			}));
		return {
			mauPhu,
			so,
			nut: [...document.querySelectorAll('[data-view-switch="nut"]')].filter(hien).length,
			chon: [...document.querySelectorAll('[data-view-switch="chon"]')].filter(hien).length,
			cuonNgang: document.scrollingElement.scrollWidth > window.innerWidth,
		};
	});

function soMan(kq, man, rong) {
	const loi = [];
	const ma = `${man.ten} ${rong}`;
	if (kq.so.length < man.soDem) loi.push(`lkx-man: ${ma} thieu so dem (${kq.so.length}/${man.soDem})`);
	for (const o of kq.so) {
		if (o.mau !== kq.mauPhu || o.mo < 1) loi.push(`lkx-man: ${ma} so dem mo («${o.chu}» ${o.mau} mo ${o.mo})`);
	}
	if (man.coKieuXem) {
		if (rong === KHO.hep && (kq.chon < 1 || kq.nut > 0))
			loi.push(`lkx-man: ${ma} khong co o chon kieu xem (chon ${kq.chon} nut ${kq.nut})`);
		if (rong === KHO.rong && (kq.nut < 1 || kq.chon > 0))
			loi.push(`lkx-man: ${ma} khong co nhom nut kieu xem (nut ${kq.nut} chon ${kq.chon})`);
	}
	if (kq.cuonNgang) loi.push(`lkx-man: ${ma} trang cuon ngang`);
	console.log(
		`  do ${ma}: so ${kq.so.map((o) => `«${o.chu}» ${o.mau} mo ${o.mo}`).join(" · ")} · mauPhu ${kq.mauPhu} · nut ${kq.nut} chon ${kq.chon} · cuonNgang ${kq.cuonNgang}`,
	);
	return loi;
}

const tenHangDau = (t) =>
	t.evaluate(() => {
		const h = [...document.querySelectorAll("[data-trang]")].find(
			(e) => e.getClientRects().length > 0,
		);
		return h ? h.textContent.trim() : null;
	});

const chipDangBat = (t, nhan) =>
	t.evaluate((nhan) => {
		const nhom = [...document.querySelectorAll('[data-slot="toggle-group"]')].filter(
			(g) => g.getClientRects().length > 0 && (nhan === null || g.getAttribute("aria-label") === nhan),
		);
		const on = nhom
			.flatMap((g) => [...g.querySelectorAll('[data-slot="toggle-group-item"][data-state="on"]')])
			.find((e) => e.getClientRects().length > 0);
		if (!on) return null;
		return [...on.childNodes]
			.filter((n) => n.nodeType === Node.TEXT_NODE)
			.map((n) => n.textContent)
			.join("")
			.trim();
	}, nhan);

async function bamChip(t, nhan, chu) {
	const ok = await t.evaluate(
		(nhan, chu) => {
			const chip = [...document.querySelectorAll('[data-slot="toggle-group"]')]
				.filter((g) => nhan === null || g.getAttribute("aria-label") === nhan)
				.flatMap((g) => [...g.querySelectorAll('[data-slot="toggle-group-item"]')])
				.find(
					(e) =>
						e.getClientRects().length > 0 &&
						[...e.childNodes]
							.filter((n) => n.nodeType === Node.TEXT_NODE)
							.map((n) => n.textContent)
							.join("")
							.trim() === chu,
				);
			chip?.click();
			return Boolean(chip);
		},
		nhan,
		chu,
	);
	if (!ok) throw new Error(`khong thay chip «${chu}»`);
}

try {
	const quanTri = await d.nguoiMoi("lkx", "owner", "Lan Lkx");
	await d.batTrinhDuyet(quanTri.cookie);
	await d.moTrang(quanTri.cookie, KHO.rong, "/deals");

	const congTy = await d.lam(quanTri.cookie, "companies.create", { name: "Đối tác mẫu lkx" });
	const { stages } = await d.hoi(quanTri.cookie, "giaiDoan.list");
	const mo = stages.find((g) => g.kind === "OPEN");
	const chot = stages.find((g) => g.kind === "WON");
	if (!mo || !chot) throw new Error("tien de: giaiDoan.list thieu giai doan OPEN hay WON");
	for (const [i, g] of [mo, mo, chot].entries()) {
		await d.lam(quanTri.cookie, "deals.create", {
			name: `Thoả thuận mẫu lkx ${i + 1}`,
			companyId: congTy.id,
			ownerId: quanTri.id,
			stage: g.id,
		});
	}
	const boPhan = await d.hoi(quanTri.cookie, "onboarding.listDepartments");
	const pb = boPhan.find((b) => !b.archivedAt);
	if (!pb) throw new Error("tien de: chua co phong ban de gieo khuon onboarding");
	const khuon = await d.lam(quanTri.cookie, "onboarding.createTemplate", {
		name: "Khuôn mẫu lkx",
		partnerType: null,
		steps: [{ label: "Gọi chào", departmentId: pb.id, position: 0, offsetDays: 0 }],
	});
	await d.lam(quanTri.cookie, "onboarding.createFromTemplate", {
		companyId: congTy.id,
		templateId: khuon.id,
		startedAt: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date()),
		ownerId: quanTri.id,
	});
	for (const [ten, loai] of [
		["Quy định mẫu lkx", "quy-dinh"],
		["Chính sách mẫu lkx", "chinh-sach"],
		["Quy trình mẫu lkx", "quy-trinh"],
	]) {
		await d.taoTrangDangDung(quanTri, { ten, loai, noiDung: `${ten}.\n` });
	}

	const moMan = async (rong, duong) => {
		const t = await trangMoi(quanTri, rong);
		await t.goto(`${d.APP}/${d.slug()}${duong}`, { waitUntil: "load", timeout: 120_000 });
		await t.waitForNetworkIdle({ idleTime: 500, timeout: CHO_MS }).catch(() => null);
		return t;
	};

	if (chay(1)) {
		await d.chayBuoc(1, async () => {
			const loi = [];
			for (const man of MAN) {
				for (const rong of [KHO.hep, KHO.rong]) {
					const t = await moMan(rong, man.duong);
					if (rong === KHO.hep && man.coGap) {
						await t.evaluate(() => {
							const nut = [...document.querySelectorAll("button[aria-controls][aria-expanded]")].find(
								(b) =>
									b.getClientRects().length > 0 &&
									document.getElementById(b.getAttribute("aria-controls"))?.querySelector('[data-slot="toggle-group"]'),
							);
							nut?.click();
						});
					}
					await choDieu(
						t,
						(n) =>
							[...document.querySelectorAll('[data-slot="toggle-group-item-count"]')].filter(
								(e) => e.getClientRects().length > 0,
							).length >= n,
						`${man.ten} ${rong} du so dem`,
						man.soDem,
					).catch((e) => loi.push(`lkx-man: ${man.ten} ${rong} thieu so dem (${e.message})`));
					await cho(300);
					loi.push(...soMan(await doMan(t), man, rong));
					await t.screenshot({ path: join(BANG, `lkx-${man.ten}-${rong}.png`), fullPage: false });
					console.log(`  anh lkx-${man.ten}-${rong}.png`);
					await t.close();
				}
			}
			for (const l of loi) console.log(`  ${l}`);
			d.dat(1, loi.length === 0, loi.join(" · "));
		});
	}

	if (chay("1b")) {
		await d.chayBuoc("1b", async () => {
			const loi = [];
			const t = await moMan(KHO.rong, "/tai-lieu");
			await choDieu(t, () => document.querySelector("[data-trang]") !== null, "tai lieu co hang");
			const truoc = await tenHangDau(t);
			const dieuHuong = await t.evaluate(() => performance.getEntriesByType("navigation").length);
			await t.evaluate(() => document.querySelector('[data-loai="chinh-sach"]')?.click());
			const doi = await t
				.waitForFunction(
					(truoc) => {
						const h = [...document.querySelectorAll("[data-trang]")].find((e) => e.getClientRects().length > 0);
						return h && h.textContent.trim() !== truoc;
					},
					{ timeout: CHO_MS, polling: 100 },
					truoc,
				)
				.then(() => true)
				.catch(() => false);
			const sau = await tenHangDau(t);
			const dieuHuongSau = await t.evaluate(() => performance.getEntriesByType("navigation").length);
			console.log(`  do tai-lieu bam chip: truoc «${truoc}» sau «${sau}» dieuHuong ${dieuHuong}->${dieuHuongSau}`);
			if (!doi) loi.push("lkx-man: tai lieu bam chip danh sach dung yen");
			if (dieuHuongSau !== dieuHuong) loi.push("lkx-man: tai lieu bam chip tai lai trang");
			await t.close();
			for (const l of loi) console.log(`  ${l}`);
			d.dat("1b", loi.length === 0, loi.join(" · "));
		});
	}

	if (chay(2)) {
		await d.chayBuoc(2, async () => {
			const loi = [];
			const cachChon = [
				{ man: "thoa-thuan", duong: "/deals", nhan: NHOM_LOC["thoa-thuan"], chu: "Đã chốt" },
				{ man: "onboarding", duong: "/onboarding", nhan: NHOM_LOC.onboarding, chu: "Đã đóng" },
				{ man: "tai-lieu", duong: "/tai-lieu", nhan: null, chu: "Chính sách" },
			];
			for (const c of cachChon) {
				const t = await moMan(KHO.rong, c.duong);
				await choDieu(
					t,
					() => document.querySelector('[data-slot="toggle-group-item"]') !== null,
					`${c.man} co chip`,
				);
				await bamChip(t, c.nhan, c.chu);
				await choDieu(
					t,
					(chu) =>
						[...document.querySelectorAll('[data-slot="toggle-group-item"][data-state="on"]')].some((e) =>
							e.textContent.includes(chu),
						),
					`${c.man} chip ${c.chu} bat`,
					c.chu,
				);
				await cho(500);
				const href = await t.evaluate(() => location.href);
				await t.close();
				const moi = await trangMoi(quanTri, KHO.rong);
				await moi.goto(href, { waitUntil: "load", timeout: 120_000 });
				await moi.waitForNetworkIdle({ idleTime: 500, timeout: CHO_MS }).catch(() => null);
				await choDieu(
					moi,
					() => document.querySelector('[data-slot="toggle-group-item"]') !== null,
					`${c.man} mo lai co chip`,
				);
				const bat = await chipDangBat(moi, c.nhan);
				console.log(`  do ${c.man} mo duong dan ${href}: chip dang bat «${bat}»`);
				if (bat !== c.chu) {
					loi.push(
						c.man === "tai-lieu"
							? "lkx-man: tai lieu mo duong dan mat loai"
							: `lkx-man: ${c.man} mo duong dan mat bo loc («${bat}» thay vi «${c.chu}»)`,
					);
				}
				await moi.close();
			}
			for (const l of loi) console.log(`  ${l}`);
			d.dat(2, loi.length === 0, loi.join(" · "));
		});
	}

	await d.ket("chup-loc");
} catch (e) {
	await d.khongDoDuoc(e);
}
