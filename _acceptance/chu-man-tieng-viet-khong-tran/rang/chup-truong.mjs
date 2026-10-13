import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const HERE = dirname(TEP_NAY);
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "chu-man-tieng-viet-khong-tran";
const CHI_DO = process.argv.includes("--chi-do");

const KHO = { hep: 360, rong: 1280 };
const NGUONG = { oToiThieu: 72, mepPhai: 1, lech: 0.5 };
const CHO_MS = 30_000;
const SO_NHAN = 11;
const TEN_DAI =
	"Ngày gia hạn hợp đồng khung với đối tác phân phối miền Trung năm sau, kèm số điện thoại người phụ trách ký phụ lục và đầu mối nhận hoá đơn của chi nhánh";
const KIEU = [
	"TEXT",
	"LONG_TEXT",
	"NUMBER",
	"DATE",
	"CHECKBOX",
	"SELECT",
	"URL",
	"EMAIL",
	"PHONE",
	"USER",
];
const NHAN_NAV = { vi: "Vị trí trang", en: "Breadcrumb" };

const TEP_DS = "apps/app/components/crm/fields/fields-list.tsx";
const CAY_DO = {
	1: {
		nhan: "ban sao tra lai o w-18 va cau mo ta dai",
		tenCay: "cmt-chup-truong-chieu-do-1",
		chiBuoc: "1",
		tep: TEP_DS,
		cam: (s) =>
			s
				.replace('className="min-w-18 shrink-0 justify-center"', 'className="w-18 shrink-0 justify-center"')
				.replace("{fieldTypeNgan(TYPE_KEY[field.type], locale)}", "{fieldTypeLabel(TYPE_KEY[field.type], locale)}"),
		dauVet: 'className="w-18 shrink-0 justify-center"',
		ghim: /cmt-man: truong vi 360 nhan kieu tran/,
	},
	2: {
		nhan: "ban sao nut ten bo min-w-0 va truncate",
		tenCay: "cmt-chup-truong-chieu-do-2",
		chiBuoc: "1",
		tep: TEP_DS,
		cam: (s) =>
			s
				.replace(
					'className="flex min-w-0 flex-1 flex-col gap-px text-left"',
					'className="flex flex-1 flex-col gap-px text-left"',
				)
				.replace(
					'<span className="w-full truncate font-medium text-foreground text-xs">',
					'<span className="w-full whitespace-nowrap font-medium text-foreground text-xs">',
				),
		dauVet: '"flex flex-1 flex-col gap-px text-left"',
		ghim: /cmt-man: truong vi 360 nhan kieu ra ngoai hang/,
	},
};

const coChieuDo = process.argv.find(
	(a) => a === "--chieu-do" || a.startsWith("--chieu-do="),
);
if (coChieuDo) {
	const so = coChieuDo.split("=")[1] ?? "1";
	const cay = CAY_DO[so];
	if (!cay) {
		console.log(`KHONG DO DUOC: chup-truong khong co chieu do ${so}`);
		process.exit(2);
	}
	const { chieuDo } = await import("../../kho-tai-lieu/rang/man-lib.mjs");
	await chieuDo(TEP_NAY, cay);
}

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/chup-truong.mjs"`,
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

async function trangMoi(nguoi, rong, ngonNgu) {
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
		{ name: "lang", value: ngonNgu, domain: host, path: "/" },
	);
	return t;
}

async function choDieu(t, ham, moTa) {
	try {
		await t.waitForFunction(ham, { timeout: CHO_MS, polling: 100 }, SO_NHAN);
	} catch {
		throw new Error(`het ${CHO_MS} ms cho: ${moTa}`);
	}
}

const doTruong = (t, tenDai) =>
	t.evaluate((tenDai) => {
		const nhan = [...document.querySelectorAll("[data-nhan-kieu]")].filter(
			(e) => e.getClientRects().length > 0,
		);
		const o = nhan.map((e) => {
			const r = e.getBoundingClientRect();
			const hang = e.closest("[data-slot='sortable-item']") ?? e.parentElement;
			const h = hang.getBoundingClientRect();
			return {
				kieu: e.dataset.nhanKieu,
				chu: e.innerText.trim(),
				scroll: e.scrollWidth,
				client: e.clientWidth,
				rong: r.width,
				trai: r.left,
				phai: r.right,
				trongHang: r.left >= h.left - 0.5 && r.right <= h.right + 0.5,
			};
		});
		const nutDai = [...document.querySelectorAll("button")].find(
			(b) => b.getClientRects().length > 0 && b.innerText.includes(tenDai.slice(0, 20)),
		);
		const tenEl = nutDai?.querySelector("span");
		const hangDai = nutDai?.parentElement;
		const nhanDai = hangDai?.querySelector("[data-nhan-kieu]");
		return {
			o,
			cuonNgang: document.scrollingElement.scrollWidth > window.innerWidth,
			tenDaiCat: tenEl ? tenEl.scrollWidth > tenEl.clientWidth : null,
			nhanDaiTron: nhanDai ? nhanDai.scrollWidth <= nhanDai.clientWidth : null,
		};
	}, tenDai);

function soTruong(kq, ngonNgu, rong) {
	const loi = [];
	const ma = `truong ${ngonNgu} ${rong}`;
	if (kq.o.length !== SO_NHAN) loi.push(`${ma}: co ${kq.o.length}/${SO_NHAN} nhan kieu`);
	for (const o of kq.o) {
		if (o.scroll > o.client) {
			loi.push(`cmt-man: ${ma} nhan kieu tran (${o.kieu} «${o.chu}» ${o.scroll}>${o.client})`);
		}
		if (o.rong < NGUONG.oToiThieu - NGUONG.lech) {
			loi.push(`${ma}: o ${o.kieu} hep ${o.rong.toFixed(1)} px`);
		}
		if (!o.trongHang) loi.push(`cmt-man: ${ma} nhan kieu ra ngoai hang (${o.kieu})`);
	}
	if (kq.o.length > 0) {
		const phai = kq.o.map((o) => o.phai);
		const lech = Math.max(...phai) - Math.min(...phai);
		if (lech > NGUONG.mepPhai) loi.push(`${ma}: mep phai lech ${lech.toFixed(1)} px`);
	}
	if (kq.cuonNgang) loi.push(`cmt-man: ${ma} trang cuon ngang`);
	if (kq.tenDaiCat !== true) loi.push(`${ma}: ten truong dai khong bi cat (${kq.tenDaiCat})`);
	if (kq.nhanDaiTron !== true) loi.push(`${ma}: nhan kieu hang ten dai khong tron (${kq.nhanDaiTron})`);
	const dong = kq.o.map((o) => `${o.kieu}:«${o.chu}» ${o.scroll}/${o.client} r${Math.round(o.rong)} p${Math.round(o.phai)}`).join(" · ");
	console.log(`  do ${ma}: ${dong} · cuonNgang ${kq.cuonNgang} · tenDaiCat ${kq.tenDaiCat}`);
	return loi;
}

try {
	const quanTri = await d.nguoiMoi("cmt", "owner", "Lan Cmt");
	await d.batTrinhDuyet(quanTri.cookie);
	await d.moTrang(quanTri.cookie, KHO.rong, "/contacts");

	const coSan = await d.hoi(quanTri.cookie, "fields.list", { entity: "CONTACT", includeArchived: false });
	const daCo = new Set(coSan.map((f) => f.label));
	for (const [i, kieu] of KIEU.entries()) {
		const label = `Trường mẫu ${i + 1}`;
		if (daCo.has(label)) continue;
		await d.lam(quanTri.cookie, "fields.create", {
			entity: "CONTACT",
			label,
			type: kieu,
			options: kieu === "SELECT" ? [{ label: "Một" }, { label: "Hai" }] : [],
		});
	}
	if (!daCo.has(TEN_DAI)) {
		await d.lam(quanTri.cookie, "fields.create", { entity: "CONTACT", label: TEN_DAI, type: "PHONE" });
	}
	const cacView = await d.hoi(quanTri.cookie, "savedViews.list", { entity: "CONTACT" });
	const view =
		cacView[0] ??
		(await d.lam(quanTri.cookie, "savedViews.create", {
			entity: "CONTACT",
			name: "Liên hệ mẫu cmt",
			shared: true,
			filters: { q: "", sort: "", dir: "asc", archived: false, filters: {} },
		}));
	const chienDich = await d.lam(quanTri.cookie, "campaigns.create", {
		name: "Gọi lại mẫu cmt",
		savedViewId: view.id,
	});

	if (chay(1)) {
		await d.chayBuoc(1, async () => {
			const loi = [];
			for (const ngonNgu of ["vi", "en"]) {
				for (const rong of [KHO.hep, KHO.rong]) {
					const t = await trangMoi(quanTri, rong, ngonNgu);
					await t.goto(`${d.APP}/${d.slug()}/settings/fields?thucThe=contact`, { waitUntil: "load", timeout: 120_000 });
					await choDieu(
						t,
						(n) => [...document.querySelectorAll("[data-nhan-kieu]")].filter((e) => e.getClientRects().length > 0).length >= n,
						`truong ${ngonNgu} ${rong} du nhan kieu`,
					);
					await t.waitForNetworkIdle({ idleTime: 500, timeout: CHO_MS }).catch(() => null);
					loi.push(...soTruong(await doTruong(t, TEN_DAI), ngonNgu, rong));
					await cho(200);
					await t.screenshot({ path: join(BANG, `cmt-truong-${ngonNgu}-${rong}.png`), fullPage: false });
					console.log(`  anh cmt-truong-${ngonNgu}-${rong}.png`);
					await t.close();
				}
			}
			for (const l of loi) console.log(`  ${l}`);
			d.dat(1, loi.length === 0, loi.join(" · "));
		});
	}

	if (chay(2)) {
		await d.chayBuoc(2, async () => {
			const loi = [];
			for (const ngonNgu of ["vi", "en"]) {
				const t = await trangMoi(quanTri, KHO.rong, ngonNgu);
				await t.goto(`${d.APP}/${d.slug()}/campaigns/${chienDich.id}`, { waitUntil: "load", timeout: 120_000 });
				await choDieu(
					t,
					() => [...document.querySelectorAll('nav[data-slot="breadcrumb"]')].some((e) => e.getClientRects().length > 0),
					`breadcrumb chien dich ${ngonNgu}`,
				);
				const nhan = await t.evaluate(() =>
					[...document.querySelectorAll('nav[data-slot="breadcrumb"]')]
						.filter((e) => e.getClientRects().length > 0)
						.map((e) => e.getAttribute("aria-label")),
				);
				console.log(`  do nav ${ngonNgu}: ${JSON.stringify(nhan)}`);
				if (nhan.length === 0 || nhan.some((x) => x !== NHAN_NAV[ngonNgu])) {
					loi.push(`cmt-man: nav ${ngonNgu} doc ${JSON.stringify(nhan)} thay vi ${NHAN_NAV[ngonNgu]}`);
				}
				await t.close();
			}
			for (const l of loi) console.log(`  ${l}`);
			d.dat(2, loi.length === 0, loi.join(" · "));
		});
	}

	await d.ket("chup-truong");
} catch (e) {
	await d.khongDoDuoc(e);
}
