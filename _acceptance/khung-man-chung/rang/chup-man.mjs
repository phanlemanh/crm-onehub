import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const HERE = dirname(TEP_NAY);
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "khung-man-chung";
const CHI_DO = process.argv.includes("--chi-do");

const NGUONG = { tieuDePx: 4, noiDungPx: 8, cungHangPx: 8 };
const KHO = { rong: 1280, hep: 375, bienDuoi: 767, bienTren: 768 };
const GIU_KHOA_MS = 60_000;
const CHO_MS = 30_000;

const CAY_DO = {
	1: {
		nhan: "ban sao fallback Lien he ve Spinner",
		tenCay: "kmc-chup-man-chieu-do-1",
		chiBuoc: "1",
		tep: "apps/app/app/(app)/[slug]/contacts/page.tsx",
		cam: (s) =>
			s
				.replace('<KhungXuong hinh="bang" />', "<Spinner />")
				.replace(
					'import { KhungXuong } from "@crm/ui/components/khung-xuong";',
					'import { Spinner } from "@crm/ui/components/spinner";',
				),
		dauVet: "<Spinner />",
		ghim: /buoc 1: lienhe khong thay khung xuong/,
	},
	2: {
		nhan: "ban sao bo basis-full cua mo ta",
		tenCay: "kmc-chup-man-chieu-do-2",
		chiBuoc: "5",
		tep: "apps/app/components/page-shell.tsx",
		cam: (s) =>
			s.replace(
				'"order-1 basis-full text-balance text-muted-foreground text-sm md:order-last"',
				'"order-1 text-balance text-muted-foreground text-sm md:order-last"',
			),
		dauVet: '"order-1 text-balance',
		ghim: /kmc-dau-trang: mo ta chen hang nut o 1280/,
	},
};

const coChieuDo = process.argv.find(
	(a) => a === "--chieu-do" || a.startsWith("--chieu-do="),
);
if (coChieuDo) {
	const buoc = coChieuDo.split("=")[1] ?? "1";
	const cay = CAY_DO[buoc];
	if (!cay) {
		console.log(`KHONG DO DUOC: chup-man khong co chieu do ${buoc}`);
		process.exit(2);
	}
	const { chieuDo } = await import("../../kho-tai-lieu/rang/man-lib.mjs");
	await chieuDo(TEP_NAY, cay);
}

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/chup-man.mjs"`,
	);
	process.exit(2);
}

process.env.BANG_CHUNG ??= join(
	GOC,
	".acceptance-runs",
	HO_SO,
	CHI_DO ? "do" : "evidence",
);
mkdirSync(process.env.BANG_CHUNG, { recursive: true });

const { cho, chay, moDo } = await import("../../kho-tai-lieu/rang/man-lib.mjs");

const d = await moDo();
const BANG = process.env.BANG_CHUNG;

async function giuKhoa(bang) {
	let nha = () => {};
	const daNha = new Promise((r) => {
		nha = r;
	});
	let sanSang = () => {};
	const daKhoa = new Promise((r) => {
		sanSang = r;
	});
	const xong = d.db
		.$transaction(
			async (tx) => {
				await tx.$executeRawUnsafe(
					`LOCK TABLE "${bang}" IN ACCESS EXCLUSIVE MODE`,
				);
				sanSang();
				await daNha;
			},
			{ timeout: GIU_KHOA_MS + 10_000, maxWait: 10_000 },
		)
		.catch((e) => {
			sanSang();
			return e;
		});
	await daKhoa;
	const loiSom = await Promise.race([xong, cho(50).then(() => null)]);
	if (loiSom instanceof Error) {
		throw new Error(`khong khoa duoc bang ${bang}: ${String(loiSom).slice(0, 200)}`);
	}
	return async () => {
		nha();
		const ket = await xong;
		if (ket instanceof Error) {
			throw new Error(`giao dich khoa ${bang} loi: ${String(ket).slice(0, 200)}`);
		}
	};
}

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

const doHop = (t) =>
	t.evaluate(() => {
		const hop = (s) => {
			const e = [...document.querySelectorAll(s)].find(
				(x) => x.getClientRects().length > 0 && !x.closest("[hidden]"),
			);
			if (!e) return null;
			const r = e.getBoundingClientRect();
			return {
				top: r.top,
				bottom: r.bottom,
				h: r.height,
				cy: r.top + r.height / 2,
				chu: (e.innerText ?? "").trim(),
			};
		};
		const dau = hop('[data-slot="page-shell-header"]');
		const noiDung =
			hop('[data-slot="page-shell-content"]') ??
			hop('[data-khung-xuong] [data-khung-hang="doan"]') ??
			hop("[data-khung-xuong]") ??
			hop('[data-slot="page-shell"] > :not([data-slot="page-shell-header"])');
		return {
			tieuDe:
				hop('[data-slot="page-shell-title"]') ??
				hop('[data-khung-xuong] [data-khung-hang="tieu-de"] > :first-child'),
			breadcrumb: hop('[data-slot="breadcrumb"]'),
			moTa: hop('[data-slot="page-shell-description"]'),
			nut: hop(
				'[data-slot="page-shell-actions"] > :is(button, a, [data-slot="skeleton"], div)',
			),
			dau,
			noiDung,
			khung: document.querySelector("[data-khung-xuong]:not([hidden] *)") !== null,
			loi: document.querySelector("[data-vung-tai-loi]") !== null,
		};
	});

async function choDieu(t, ham, moTa) {
	try {
		await t.waitForFunction(ham, { timeout: CHO_MS, polling: 100 });
	} catch {
		throw new Error(`het ${CHO_MS} ms cho: ${moTa}`);
	}
}

function dong(o) {
	const f = (h) => (h ? `${Math.round(h.top)}/${Math.round(h.h)}` : "-");
	return `tieuDe ${f(o.tieuDe)} breadcrumb ${f(o.breadcrumb)} noiDung ${f(o.noiDung)} khung ${o.khung} loi ${o.loi}`;
}

async function chup(t, ten) {
	await cho(200);
	await t.screenshot({ path: join(BANG, ten), fullPage: false });
	console.log(`  anh ${ten}`);
}

function kiemQuanHe(o, rong, man) {
	const loi = [];
	if (!o.tieuDe || !o.moTa) return loi;
	if (rong >= KHO.bienTren && o.nut) {
		if (Math.abs(o.tieuDe.cy - o.nut.cy) > NGUONG.cungHangPx) {
			loi.push(`${man} ${rong}: tieu de va nut khong cung hang`);
		}
		if (o.moTa.top < o.tieuDe.bottom - 1) {
			loi.push(
				rong === KHO.rong
					? "kmc-dau-trang: mo ta chen hang nut o 1280"
					: `${man} ${rong}: mo ta khong nam duoi tieu de`,
			);
		}
	}
	if (rong < KHO.bienTren && o.nut) {
		if (o.moTa.bottom > o.nut.top + 1) {
			loi.push(`${man} ${rong}: mo ta khong dung tren nut`);
		}
		if (o.nut.top < o.tieuDe.bottom - 1) {
			loi.push(`${man} ${rong}: nut cung hang tieu de duoi 768`);
		}
	}
	return loi;
}

async function manDangTai(nguoi, ma, duong, bang, rong, choXong) {
	const t = await trangMoi(nguoi, rong);
	const nha = await giuKhoa(bang);
	const di = t
		.goto(`${d.APP}/${d.slug()}${duong}`, { waitUntil: "load", timeout: 120_000 })
		.catch((e) => e);
	let truoc = null;
	try {
		await choDieu(
			t,
			() => {
				const hien = (s) =>
					[...document.querySelectorAll(s)].some(
						(e) => e.getClientRects().length > 0 && !e.closest("[hidden]"),
					);
				return hien('[data-slot="page-shell-title"], [data-slot="breadcrumb"]');
			},
			`${ma} tieu de luc tai`,
		);
		await cho(500);
		truoc = await doHop(t);
		await chup(t, `kmc-${ma}-dangtai-${rong}.png`);
	} finally {
		await nha();
	}
	await di;
	await choDieu(t, choXong, `${ma} tai xong`);
	await t.waitForNetworkIdle({ idleTime: 500, timeout: CHO_MS }).catch(() => null);
	const sau = await doHop(t);
	await chup(t, `kmc-${ma}-xong-${rong}.png`);
	await t.close();
	return { truoc, sau };
}

function soCap(ma, rong, { truoc, sau }) {
	const loi = [];
	const coChu = (o) =>
		(o?.tieuDe?.chu ?? "") !== "" || (o?.breadcrumb?.chu ?? "") !== "";
	if (!truoc?.khung) loi.push(`${ma} khong thay khung xuong`);
	if (!coChu(truoc)) loi.push(`${ma} ${rong}: luc tai khong co chu tieu de`);
	const hang = (o) => o?.tieuDe ?? o?.breadcrumb;
	const a = hang(truoc);
	const b = hang(sau);
	if (a && b && (Math.abs(a.top - b.top) > NGUONG.tieuDePx || Math.abs(a.h - b.h) > NGUONG.tieuDePx) && truoc.tieuDe && sau.tieuDe) {
		loi.push(`${ma} ${rong}: hang tieu de lech ${dong(truoc)} -> ${dong(sau)}`);
	}
	if (truoc?.noiDung && sau?.noiDung && Math.abs(truoc.noiDung.top - sau.noiDung.top) > NGUONG.noiDungPx) {
		loi.push(`${ma} ${rong}: vung noi dung lech ${dong(truoc)} -> ${dong(sau)}`);
	}
	console.log(`  do ${ma} ${rong}: ${dong(truoc ?? {})} => ${dong(sau ?? {})}`);
	return [...loi, ...kiemQuanHe(sau ?? {}, rong, ma)];
}

let daGieo = false;

async function gieoKeHoach(nguoi) {
	if (daGieo) return;
	daGieo = true;
	const khuon = await d.hoi(nguoi.cookie, "onboarding.listTemplates");
	if (khuon.length > 0) return;
	const phong = await d.hoi(nguoi.cookie, "onboarding.listDepartments", { archived: false });
	if (phong.length === 0) throw new Error("kho do khong co phong ban de gieo khuon");
	const moi = await d.lam(nguoi.cookie, "onboarding.createTemplate", {
		name: "Khuôn mẫu kmc",
		partnerType: null,
		steps: [{ label: "Gọi chào", departmentId: phong[0].id, position: 0, offsetDays: 0 }],
	});
	const congTy = await d.db.company.findFirst({ select: { id: true }, orderBy: { createdAt: "asc" } });
	if (!congTy) throw new Error("kho do khong co cong ty de gieo ke hoach");
	await d.lam(nguoi.cookie, "onboarding.createFromTemplate", {
		companyId: congTy.id,
		templateId: moi.id,
		startedAt: new Date().toISOString().slice(0, 10),
		ownerId: nguoi.id,
	});
}

const MAN = [
	{ ma: "lienhe", duong: "/contacts", bang: "contact", xong: () => document.querySelector("[data-khung-xuong]") === null && document.querySelector('[data-slot="table-container"], [data-slot="empty"]') !== null },
	{ ma: "truong", duong: "/settings/fields", bang: "fieldDefinition", xong: () => document.querySelector("[data-khung-xuong]") === null },
	{ ma: "caidat", duong: "/settings/onboarding", bang: "onboardingTemplate", xong: () => document.querySelector("[data-khung-xuong]") === null },
	{ ma: "toancanh", duong: "/okr/toan-canh", bang: "okrCycle", xong: () => document.querySelector("[data-khung-xuong]") === null && document.querySelector('[data-slot="tabs-list"]') !== null },
	{ ma: "chiendich", duong: null, bang: "campaign", xong: () => document.querySelector("[data-khung-xuong]") === null && document.querySelector('[data-slot="page-shell-title"]') !== null },
	{ ma: "tailieu", duong: "/tai-lieu", bang: "taiLieuTrang", xong: () => document.querySelector("[data-khung-xuong]") === null },
];

try {
	const quanTri = await d.nguoiMoi("kmc", "owner", "Lan Kmc");
	await d.batTrinhDuyet(quanTri.cookie);
	await d.moTrang(quanTri.cookie, KHO.rong, "/contacts");

	execFileSync("bun", ["run", "okr:mau"], { cwd: GOC, stdio: "inherit", env: process.env });
	for (const [i, ten] of ["Quy định công tác phí", "Chính sách thử việc"].entries()) {
		await d.taoTrangDangDung(quanTri, {
			ten,
			loai: "quy-dinh",
			noiDung: `## Mục ${i + 1}\n\nNội dung mẫu của ${ten}.\n`,
		});
	}
	const cacView = await d.hoi(quanTri.cookie, "savedViews.list", { entity: "CONTACT" });
	const view =
		cacView[0] ??
		(await d.lam(quanTri.cookie, "savedViews.create", {
			entity: "CONTACT",
			name: "Liên hệ mẫu kmc",
			shared: true,
			filters: { q: "", sort: "", dir: "asc", archived: false, filters: {} },
		}));
	const chienDich = await d.lam(quanTri.cookie, "campaigns.create", {
		name: "Gọi lại tháng 10 (mẫu kmc)",
		savedViewId: view.id,
	});
	MAN[4].duong = `/campaigns/${chienDich.id}`;

	if (process.argv.includes("--tham")) {
		for (const duong of ["/okr/toan-canh", "/tai-lieu"]) {
			for (const rong of [KHO.rong, KHO.hep]) {
				const t = await trangMoi(quanTri, rong);
				await t.goto(`${d.APP}/${d.slug()}${duong}`, { waitUntil: "load", timeout: 120_000 });
				await t.waitForNetworkIdle({ idleTime: 500, timeout: CHO_MS }).catch(() => null);
				const o = await t.evaluate(() => {
					const h = (s) => {
						const e = [...document.querySelectorAll(s)].find((x) => x.getClientRects().length > 0);
						if (!e) return null;
						const r = e.getBoundingClientRect();
						return `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`;
					};
					return {
						moTa: h('[data-slot="page-shell-description"]'),
						tabs: h('[data-slot="tabs-list"]'),
						khungTab: h("[data-khung-tab]"),
						chonKy: h('[data-slot="select-trigger"], [data-slot="period-select"] button, [data-slot="popover-trigger"]'),
						noiDung: h('[data-slot="page-shell-content"]'),
					};
				});
				console.log(`tham ${duong} ${rong}: ${JSON.stringify(o)}`);
				await t.close();
			}
		}
		await d.ket("chup-man-tham");
	}

	if (chay(1)) {
		await d.chayBuoc(1, async () => {
			const loi = [];
			for (const man of MAN) {
				for (const rong of [KHO.rong, KHO.hep]) {
					const cap = await manDangTai(quanTri, man.ma, man.duong, man.bang, rong, man.xong);
					if (man.ma === "lienhe" && !cap.truoc?.khung) {
						loi.push("buoc 1: lienhe khong thay khung xuong");
						continue;
					}
					loi.push(...soCap(man.ma, rong, cap));
				}
			}
			for (const l of loi) console.log(`  ${l}`);
			d.dat(1, loi.length === 0, loi.join(" · "));
		});
	}

	if (chay(2)) {
		await d.chayBuoc(2, async () => {
			const loi = [];
			for (const rong of [KHO.rong, KHO.hep]) {
				const t = await trangMoi(quanTri, rong);
				await t.goto(`${d.APP}/${d.slug()}/campaigns/khong-co-chien-dich-nay`, { waitUntil: "load", timeout: 120_000 });
				await choDieu(t, () => document.querySelector("[data-vung-tai-loi]") !== null, "khung loi chien dich");
				const o = await doHop(t);
				if (!o.breadcrumb?.chu) loi.push(`chiendich loi ${rong}: mat breadcrumb`);
				const coNut = await t.evaluate(() => [...document.querySelectorAll("[data-vung-tai-loi] button")].some((b) => b.innerText.trim() === "Thử lại"));
				if (!coNut) loi.push(`chiendich loi ${rong}: thieu nut Thử lại`);
				await chup(t, `kmc-chiendich-loi-${rong}.png`);
				await t.close();

				await gieoKeHoach(quanTri);
				const t2 = await trangMoi(quanTri, rong);
				await t2.setRequestInterception(true);
				let chan = false;
				t2.on("request", (r) => {
					if (chan && r.url().includes("onboarding.manDanhMuc")) {
						r.respond({ status: 500, contentType: "application/json", body: JSON.stringify([{ error: { json: { message: "kmc chan", code: -32603, data: { code: "INTERNAL_SERVER_ERROR", httpStatus: 500 } } } }]) });
						return;
					}
					r.continue();
				});
				await t2.goto(`${d.APP}/${d.slug()}/onboarding`, { waitUntil: "load", timeout: 120_000 });
				await t2.waitForNetworkIdle({ idleTime: 500, timeout: CHO_MS }).catch(() => null);
				chan = true;
				const chip = await t2.evaluate(() => {
					const ds = [...document.querySelectorAll("button")].filter((b) => b.getClientRects().length > 0);
					const nut = ds.find((b) => /Đã đóng/.test(b.innerText));
					nut?.click();
					return { bam: nut ? nut.innerText : null, so: ds.length };
				});
				console.log(`  onboarding ${rong}: chip ${JSON.stringify(chip)}`);
				if (!chip.bam) {
					const o = await t2.$('[data-slot="page-shell-content"] input');
					if (o) await o.type("kmc", { delay: 30 });
				}
				try {
					await choDieu(t2, () => document.querySelector('[data-vung-tai-loi][data-trang-thai="ST-danhmuc-loi"]') !== null, "khung loi danh muc");
				} catch (e) {
					await t2.screenshot({ path: join(BANG, `kmc-loi-onboarding-${rong}.png` ) }).catch(() => null);
					throw e;
				}
				const coNut2 = await t2.evaluate(() => [...document.querySelectorAll("[data-vung-tai-loi] button")].some((b) => b.innerText.trim() === "Thử lại"));
				if (!coNut2) loi.push(`onboarding loi ${rong}: thieu nut Thử lại`);
				await chup(t2, `kmc-onboarding-loi-${rong}.png`);
				await t2.close();
			}
			for (const l of loi) console.log(`  ${l}`);
			d.dat(2, loi.length === 0, loi.join(" · "));
		});
	}

	if (chay(3)) {
		await d.chayBuoc(3, async () => {
			const loi = [];
			await d.db.onboardingTemplate.updateMany({ where: { archivedAt: null }, data: { archivedAt: new Date() } });
			for (const rong of [KHO.rong, KHO.hep]) {
				const t = await trangMoi(quanTri, rong);
				await t.goto(`${d.APP}/${d.slug()}/onboarding`, { waitUntil: "load", timeout: 120_000 });
				await choDieu(t, () => document.querySelector('[data-slot="page-shell-note"]') !== null, "dong ly do onboarding");
				const o = await t.evaluate(() => {
					const dong = document.querySelector('[data-slot="page-shell-note"]');
					const nut = [...document.querySelectorAll('[data-slot="page-shell-actions"] button')].find((b) => b.innerText.trim() === "Kế hoạch mới");
					const r = (e) => e?.getBoundingClientRect();
					return {
						tat: nut?.disabled === true,
						tro: nut?.getAttribute("aria-describedby") === dong?.id,
						duoiTieuDe: r(dong).top >= r(document.querySelector('[data-slot="page-shell-title"]')).bottom - 1,
					};
				});
				if (!o.tat || !o.tro || !o.duoiTieuDe) loi.push(`onboarding khoa ${rong}: ${JSON.stringify(o)}`);
				loi.push(...kiemQuanHe(await doHop(t), rong, "onboarding"));
				await chup(t, `kmc-onboarding-khoa-${rong}.png`);
				await t.close();
			}
			for (const l of loi) console.log(`  ${l}`);
			d.dat(3, loi.length === 0, loi.join(" · "));
		});
	}

	if (chay(4)) {
		await d.chayBuoc(4, async () => {
			const loi = [];
			for (const rong of [KHO.rong, KHO.hep]) {
				const t = await trangMoi(quanTri, rong);
				await t.goto(`${d.APP}/${d.slug()}/tai-lieu`, { waitUntil: "load", timeout: 120_000 });
				await choDieu(t, () => document.querySelector('[data-slot="page-shell-actions"] a, [data-slot="page-shell-actions"] button') !== null, "nut dau trang tai lieu");
				loi.push(...kiemQuanHe(await doHop(t), rong, "tailieu"));
				await chup(t, `kmc-tailieu-dautrang-${rong}.png`);
				await t.close();
			}
			for (const l of loi) console.log(`  ${l}`);
			d.dat(4, loi.length === 0, loi.join(" · "));
		});
	}

	if (chay(5)) {
		await d.chayBuoc(5, async () => {
			const loi = [];
			for (const rong of [KHO.bienDuoi, KHO.bienTren, KHO.rong]) {
				const t = await trangMoi(quanTri, rong);
				await t.goto(`${d.APP}/${d.slug()}/contacts`, { waitUntil: "load", timeout: 120_000 });
				await choDieu(t, () => document.querySelector("[data-khung-xuong]") === null, "lien he tai xong");
				loi.push(...kiemQuanHe(await doHop(t), rong, "lienhe"));
				if (rong !== KHO.rong) await chup(t, `kmc-lienhe-bien-${rong}.png`);
				await t.close();
			}
			for (const l of loi) console.log(`  ${l}`);
			d.dat(5, loi.length === 0, loi.join(" · "));
		});
	}

	await d.ket("chup-man");
} catch (e) {
	await d.khongDoDuoc(e);
}
