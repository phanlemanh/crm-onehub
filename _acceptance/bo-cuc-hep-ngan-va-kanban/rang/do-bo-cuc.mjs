import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const HERE = dirname(TEP_NAY);
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "bo-cuc-hep-ngan-va-kanban";
const CHI_DO = process.argv.includes("--chi-do");

const HEP = 375;
const RONG = 1440;
const CHO_MS = 30_000;
const RONG_TIEU_DE_TOI_THIEU = 120;
const PHAN_TU_NGAN_TOI_THIEU = 100;
const MA = `bch${Date.now().toString(36).slice(-5)}`;

const dai = (dau) => `${dau}${MA}`.padEnd(120, "x");
const TEN_THOA_THUAN_DAI = dai("ThoaThuanDai");
const TEN_CONG_TY = dai("CongTyDai");
const TEN_NGUOI_DAI = dai("NguoiPhuTrachDai");
const NHAN_MO_DAI = `Decision maker bought-in review ${MA}`;
const NHAN_MO_NGAN = `Gần ${MA}`;
const NHAN_CHOT_DAI = `Closed won after procurement ${MA}`;

const TEP_STATS = "apps/app/components/detail-sheet.tsx";
const TEP_BOARD = "apps/app/app/(app)/[slug]/deals/deals-board.tsx";
const TEP_DEAL = "apps/app/components/crm/record-sheet/deal-sheet.tsx";
const TEP_STEPPER = "apps/app/components/crm/stage-stepper.tsx";
const TEP_CONG_TY = "apps/app/components/crm/record-sheet/company-sheet.tsx";

const CAY_DO = {
	1: {
		nhan: "ban sao hang so lieu tro ve mot hang flex",
		tenCay: "bch-chieu-do-1",
		chiBuoc: "2",
		tep: TEP_STATS,
		cam: (s) =>
			s.replace(
				'className="grid shrink-0 grid-cols-2 border-b bg-muted/40 md:flex md:divide-x"',
				'className="flex shrink-0 divide-x border-b bg-muted/40"',
			),
		dauVet: 'className="flex shrink-0 divide-x border-b bg-muted/40"',
		ghim: /bch-man: ngan so lieu mot hang/,
	},
	2: {
		nhan: "ban sao the Kanban bo flex-wrap",
		tenCay: "bch-chieu-do-2",
		chiBuoc: "1",
		tep: TEP_BOARD,
		cam: (s) =>
			s.replace(
				'className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1"',
				'className="flex items-center justify-between gap-2"',
			),
		dauVet: 'className="flex items-center justify-between gap-2"',
		ghim: /bch-man: the kanban khong xuong dong/,
	},
	3: {
		nhan: "ban sao the Kanban bo bien the xuong dong cua nhan",
		tenCay: "bch-chieu-do-3",
		chiBuoc: "1",
		tep: TEP_BOARD,
		cam: (s) =>
			s.replace(
				"<DealStageMenu dealId={card.id} stage={card.stage} wrapLabel />",
				"<DealStageMenu dealId={card.id} stage={card.stage} />",
			),
		dauVet: "<DealStageMenu dealId={card.id} stage={card.stage} />",
		ghim: /bch-man: the kanban cat nhan/,
	},
	4: {
		nhan: "ban sao o Phu trach bo xuongDongDienThoai",
		tenCay: "bch-chieu-do-4",
		chiBuoc: "2",
		tep: TEP_DEAL,
		cam: (s) =>
			s.replace(
				"<OwnerCell owner={deal.owner} xuongDongDienThoai />",
				"<OwnerCell owner={deal.owner} />",
			),
		dauVet: "<OwnerCell owner={deal.owner} />",
		ghim: /bch-man: ngan so lieu cat chu/,
	},
	5: {
		nhan: "ban sao ten buoc tra truncate",
		tenCay: "bch-chieu-do-5",
		chiBuoc: "3",
		tep: TEP_STEPPER,
		cam: (s) =>
			s.replace(
				'<span className="block wrap-anywhere md:truncate">',
				'<span className="block truncate">',
			),
		dauVet: '<span className="block truncate">',
		ghim: /bch-man: thanh giai doan cat chu/,
	},
	7: {
		nhan: "ban sao tieu de dau ngan bo be rong toi thieu",
		tenCay: "bch-chieu-do-7",
		chiBuoc: "6",
		tep: TEP_STATS,
		cam: (s) =>
			s.replace(
				'<div className="min-w-32 flex-1 space-y-0.5 pt-0.5">',
				'<div className="min-w-0 flex-1 space-y-0.5 pt-0.5">',
			),
		dauVet: '<div className="min-w-0 flex-1 space-y-0.5 pt-0.5">',
		ghim: /bch-man: tieu de ngan bi bop/,
	},
	8: {
		nhan: "ban sao o Phu trach chi hien anh dai dien",
		tenCay: "bch-chieu-do-8",
		chiBuoc: "2",
		tep: TEP_DEAL,
		cam: (s) =>
			s.replace(
				"<OwnerCell owner={deal.owner} xuongDongDienThoai />",
				"<OwnerCell owner={deal.owner} compact />",
			),
		dauVet: "<OwnerCell owner={deal.owner} compact />",
		ghim: /bch-man: ngan so lieu thieu ten phu trach/,
	},
	9: {
		nhan: "ban sao ten buoc khong xuong dong khong cat",
		tenCay: "bch-chieu-do-9",
		chiBuoc: "6",
		tep: TEP_STEPPER,
		cam: (s) =>
			s.replace(
				'<span className="block wrap-anywhere md:truncate">',
				'<span className="block whitespace-nowrap">',
			),
		dauVet: '<span className="block whitespace-nowrap">',
		ghim: /bch-man: tran ngang ngan/,
	},
	10: {
		nhan: "ban sao o Phu trach ngan cong ty bo xuongDongDienThoai",
		tenCay: "bch-chieu-do-10",
		chiBuoc: "4",
		tep: TEP_CONG_TY,
		cam: (s) =>
			s.replace(
				"<OwnerCell owner={company.owner} xuongDongDienThoai />",
				"<OwnerCell owner={company.owner} />",
			),
		dauVet: "<OwnerCell owner={company.owner} />",
		ghim: /bch-man: ngan cong ty cat chu/,
	},
	6: {
		nhan: "ban sao buoc chot bo bien the xuong dong",
		tenCay: "bch-chieu-do-6",
		chiBuoc: "3",
		tep: TEP_STEPPER,
		cam: (s) =>
			s.replace(
				/(<DealStageIndicator\s+stage=\{stage\}\s+)wrapLabel\s+(className="text-xs")/,
				"$1$2",
			),
		dauVet: "<DealStageIndicator stage={stage} wrapLabel className=",
		ghim: /bch-man: thanh giai doan cat chu Closed won/,
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
		console.log(
			`bch-man-do: ${lot.length}/${ket.length} chieu do khong ra dung ghim`,
		);
		process.exit(1);
	}
	console.log(`bch-man-do: ${ket.length}/${ket.length} chieu do ra dung ghim`);
	process.exit(0);
}

const coChieuDo = process.argv.find((a) => a.startsWith("--chieu-do"));
if (coChieuDo) {
	const so = coChieuDo.split("=")[1] ?? "1";
	const cay = CAY_DO[so];
	if (!cay) {
		console.log(`KHONG DO DUOC: do-bo-cuc khong co chieu do ${so}`);
		process.exit(2);
	}
	const { chieuDo } = await import("../../kho-tai-lieu/rang/man-lib.mjs");
	await chieuDo(TEP_NAY, cay);
}

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/do-bo-cuc.mjs"`,
	);
	process.exit(2);
}

process.env.BANG_CHUNG ??= join(GOC, ".acceptance-runs", HO_SO, "evidence");
mkdirSync(process.env.BANG_CHUNG, { recursive: true });

const { chay, moDo } = await import("../../kho-tai-lieu/rang/man-lib.mjs");

const d = await moDo();
const BANG = process.env.BANG_CHUNG;

const SEL_NGAN = '[data-slot="drawer-content"], [data-slot="sheet-content"]';

async function chup(t, ten) {
	await t.screenshot({ path: join(BANG, ten), fullPage: true });
	console.log(`  anh ${ten}`);
}

async function moBangCot(c, rong) {
	return d.moTrang(c, rong, "/deals?view=board");
}

async function moNganTuThe(t, id) {
	const nut = await t.waitForSelector(`[data-open-deal="${id}"]`, {
		timeout: CHO_MS,
	});
	await nut.evaluate((e) =>
		e.scrollIntoView({ block: "center", inline: "center" }),
	);
	await nut.click();
	await t.waitForSelector('[data-slot="detail-sheet-stats"]', {
		visible: true,
		timeout: CHO_MS,
	});
	await t.waitForSelector('[data-slot="stage-stepper"]', {
		visible: true,
		timeout: CHO_MS,
	});
	await new Promise((r) => setTimeout(r, 800));
}

const doThe = (t, id) =>
	t.evaluate((id) => {
		const li = document.querySelector(`[data-board-card="${id}"]`);
		if (!li) return null;
		const r = li.getBoundingClientRect();
		let dem = 0;
		const tran = [];
		for (const e of li.querySelectorAll("*")) {
			if (!e.checkVisibility()) continue;
			const q = e.getBoundingClientRect();
			if (q.width === 0 && q.height === 0) continue;
			dem += 1;
			if (q.right > r.right + 1 || q.left < r.left - 1)
				tran.push(
					`${e.tagName.toLowerCase()}${e.getAttribute("data-slot") ? `[${e.getAttribute("data-slot")}]` : ""} ${Math.round(q.right - r.right)}px`,
				);
		}
		const nhan = li.querySelector('[data-slot="status-indicator-label"]');
		const si = li.querySelector('[data-slot="status-indicator"]');
		const av = li.querySelector('[data-slot="avatar"]');
		const qs = si?.getBoundingClientRect();
		const qa = av?.getBoundingClientRect();
		return {
			dem,
			tran,
			nhan: nhan?.textContent?.trim() ?? null,
			catNhan: !nhan || nhan.scrollWidth > nhan.clientWidth + 1,
			hangRieng: qs && qa ? qs.top >= qa.bottom - 1 : null,
			cungHang:
				qs && qa
					? Math.abs((qs.top + qs.bottom) / 2 - (qa.top + qa.bottom) / 2) <= 4
					: null,
		};
	}, id);

const doStats = (t) =>
	t.evaluate(() => {
		const dl = [
			...document.querySelectorAll('[data-slot="detail-sheet-stats"]'),
		]
			.filter((e) => e.checkVisibility())
			.at(-1);
		if (!dl) return null;
		const o = [...dl.children];
		const dinh = o.map((x) => Math.round(x.getBoundingClientRect().top));
		let chu = 0;
		let phanTu = 0;
		const cat = [];
		for (const x of o) {
			const nhan = x.querySelector("dt")?.textContent?.trim() ?? "?";
			chu += x.querySelectorAll("dt, dd").length;
			for (const e of [x, ...x.querySelectorAll("*")]) {
				if (!e.checkVisibility()) continue;
				if (getComputedStyle(e).display === "inline") continue;
				if (!e.textContent?.trim()) continue;
				phanTu += 1;
				if (e.scrollWidth > e.clientWidth + 1) {
					cat.push(nhan);
					break;
				}
			}
		}
		const cuoi = o.at(-1)?.querySelector("dd")?.textContent ?? "";
		return { o: o.length, dinh, chu, phanTu, cat, cuoi };
	});

const doThanh = (t) =>
	t.evaluate(() => {
		const ol = [...document.querySelectorAll('[data-slot="stage-stepper"]')]
			.filter((e) => e.checkVisibility())
			.at(-1);
		if (!ol) return null;
		return [...ol.children].map((li) => {
			const e =
				li.querySelector('[data-slot="status-indicator-label"]') ??
				li.querySelector("button > span") ??
				li.firstElementChild;
			const nut = li.querySelector("button");
			const o = li.getBoundingClientRect();
			const q = e?.getBoundingClientRect();
			return {
				ten: e?.textContent?.trim() ?? "",
				cat:
					!e ||
					e.scrollWidth > e.clientWidth + 1 ||
					q.right > o.right + 1 ||
					q.left < o.left - 1,
				cham: Boolean(li.querySelector('[data-slot="status-indicator-label"]')),
				cao: Math.round((nut ?? li).getBoundingClientRect().height),
			};
		});
	});

const doTranNgan = (t) =>
	t.evaluate((sel) => {
		const k = [...document.querySelectorAll(sel)]
			.filter((e) => e.checkVisibility())
			.at(-1);
		if (!k) return { loi: "khong thay ngan" };
		const r = k.getBoundingClientRect();
		const cuon = (v) => v === "auto" || v === "scroll";
		const khungNgang = (p) => {
			const st = getComputedStyle(p);
			return cuon(st.overflowX) && !cuon(st.overflowY);
		};
		const catChu = (p) => getComputedStyle(p).textOverflow === "ellipsis";
		const boQua = (e) => {
			for (let p = e.parentElement; p && p !== k; p = p.parentElement) {
				if (khungNgang(p) || catChu(p)) return true;
			}
			return false;
		};
		const ten = (e) =>
			`${e.tagName.toLowerCase()}${e.getAttribute("data-slot") ? `[${e.getAttribute("data-slot")}]` : ""} .${String(e.className).slice(0, 60)} «${(e.textContent ?? "").trim().slice(0, 30)}»`;
		let dem = 0;
		const tran = [];
		for (const e of k.querySelectorAll("*")) {
			if (!e.checkVisibility()) continue;
			const q = e.getBoundingClientRect();
			if (q.width === 0 && q.height === 0) continue;
			if (boQua(e)) continue;
			dem += 1;
			if (q.right > r.right + 1 || q.left < r.left - 1) tran.push(ten(e));
			const st = getComputedStyle(e);
			if (
				cuon(st.overflowY) &&
				!khungNgang(e) &&
				e.scrollWidth > e.clientWidth + 1
			)
				tran.push(`cuon ngang ${ten(e)}`);
		}
		const tieuDe = k.querySelector(
			'[data-slot="drawer-title"], [data-slot="sheet-title"]',
		);
		return {
			dem,
			tran: tran.slice(0, 5),
			so: tran.length,
			rongTieuDe: tieuDe ? Math.round(tieuDe.getBoundingClientRect().width) : 0,
		};
	}, SEL_NGAN);

const cuonTrang = (t) =>
	t.evaluate(() => {
		const e = document.documentElement;
		return e.scrollWidth > e.clientWidth + 1
			? `${e.scrollWidth}>${e.clientWidth}`
			: null;
	});

try {
	const quanTri = await d.nguoiMoi(`${MA}qt`, "owner", "Lan Bch");
	const nguoiDai = await d.nguoiMoi(`${MA}dai`, "member", TEN_NGUOI_DAI);
	await d.batTrinhDuyet(quanTri.cookie);

	const c = quanTri.cookie;
	const moDai = await d.lam(c, "giaiDoan.create", {
		label: NHAN_MO_DAI,
		kind: "OPEN",
	});
	const moNgan = await d.lam(c, "giaiDoan.create", {
		label: NHAN_MO_NGAN,
		kind: "OPEN",
	});
	const chotDai = await d.lam(c, "giaiDoan.create", {
		label: NHAN_CHOT_DAI,
		kind: "WON",
	});
	const cty = await d.lam(c, "companies.create", {
		name: TEN_CONG_TY,
		ownerId: nguoiDai.id,
	});
	const taoDeal = async (name, ownerId, stage) => {
		const r = await d.lam(c, "deals.create", {
			name,
			companyId: cty.id,
			ownerId,
			stage,
		});
		return r.id;
	};
	const idDai = await taoDeal(TEN_THOA_THUAN_DAI, nguoiDai.id, moDai.id);
	const idChot = await taoDeal(`ThoaThuanChot${MA}`, nguoiDai.id, chotDai.id);
	const idNgan = await taoDeal(`Ngắn ${MA}`, quanTri.id, moNgan.id);
	console.log(`gieo: 3 giai doan, 1 cong ty, 3 thoa thuan (${MA})`);

	if (chay(1)) {
		await d.chayBuoc(1, async () => {
			const loi = [];
			for (const rong of [HEP, RONG]) {
				const t = await moBangCot(c, rong);
				await t.waitForSelector(`[data-board-card="${idDai}"]`, {
					timeout: CHO_MS,
				});
				const k = await doThe(t, idDai);
				if (!k) {
					loi.push(`bch-man: khong thay the DAI o ${rong}`);
					await t.close();
					continue;
				}
				console.log(
					`  do buoc 1 (${rong}): ${k.dem} phan tu trong the, nhan «${k.nhan}», cat ${k.catNhan}, hang rieng ${k.hangRieng}`,
				);
				for (const x of k.tran)
					loi.push(`bch-man: the kanban tran vien ${rong} ${x}`);
				if (k.nhan !== NHAN_MO_DAI)
					loi.push(`bch-man: the kanban sai nhan ${rong} «${k.nhan}»`);
				if (k.catNhan) loi.push(`bch-man: the kanban cat nhan ${rong}`);
				if (rong === HEP && k.hangRieng !== true)
					loi.push("bch-man: the kanban khong xuong dong");
				await chup(t, `bch-kanban-${rong}.png`);
				await t.close();
			}
			for (const l of loi) console.log(`  ${l}`);
			d.dat(1, loi.length === 0, loi.join(" · "));
		});
	}

	if (chay(2)) {
		await d.chayBuoc(2, async () => {
			const loi = [];
			const t = await moBangCot(c, HEP);
			await moNganTuThe(t, idDai);
			const s = await doStats(t);
			if (!s) loi.push("bch-man: khong thay hang so lieu");
			else {
				console.log(
					`  do buoc 2: ${s.o} o, ${s.chu} o chu, ${s.phanTu} phan tu chu, dinh ${s.dinh.join(",")}`,
				);
				if (s.o !== 4) loi.push(`bch-man: ngan so lieu ${s.o} o, ky vong 4`);
				if (s.chu !== 8)
					loi.push(`bch-man: ngan so lieu ${s.chu} o chu, ky vong 8`);
				if (!(s.dinh[2] > s.dinh[0] && s.dinh[3] > s.dinh[1]))
					loi.push("bch-man: ngan so lieu mot hang");
				for (const n of s.cat) loi.push(`bch-man: ngan so lieu cat chu ${n}`);
				if (!s.cuoi.replace(/\s/g, "").includes(TEN_NGUOI_DAI))
					loi.push("bch-man: ngan so lieu thieu ten phu trach");
				console.log(`  ${s.chu} o chu, phu trach ${s.cuoi.length} ky tu`);
			}
			await chup(t, "bch-ngan-thoa-thuan-375.png");
			await t.close();
			for (const l of loi) console.log(`  ${l}`);
			d.dat(2, loi.length === 0, loi.join(" · "));
		});
	}

	if (chay(3)) {
		await d.chayBuoc(3, async () => {
			const loi = [];
			for (const [ten, id, anh] of [
				["DAI", idDai, "bch-giai-doan-375.png"],
				["CHOT", idChot, "bch-giai-doan-chot-375.png"],
			]) {
				const t = await moBangCot(c, HEP);
				await moNganTuThe(t, id);
				const b = await doThanh(t);
				if (!b) {
					loi.push(`bch-man: khong thay thanh giai doan ${ten}`);
					await t.close();
					continue;
				}
				console.log(`  do buoc 3 (${ten}): ${b.length} buoc`);
				for (const x of b)
					if (x.cat) loi.push(`bch-man: thanh giai doan cat chu ${x.ten}`);
				if (ten === "DAI" && !b.some((x) => x.ten === NHAN_MO_DAI))
					loi.push("bch-man: thanh giai doan thieu buoc mo dai");
				if (ten === "CHOT" && !b.some((x) => x.cham && x.ten === NHAN_CHOT_DAI))
					loi.push("bch-man: thanh giai doan thieu buoc chot dai");
				await chup(t, anh);
				await t.close();
			}
			for (const l of loi) console.log(`  ${l}`);
			d.dat(3, loi.length === 0, loi.join(" · "));
		});
	}

	if (chay(4)) {
		await d.chayBuoc(4, async () => {
			const loi = [];
			const t = await d.moTrang(c, HEP, `/companies?record=company:${cty.id}`);
			await t.waitForSelector('[data-slot="detail-sheet-stats"]', {
				visible: true,
				timeout: CHO_MS,
			});
			await new Promise((r) => setTimeout(r, 800));
			const s = await doStats(t);
			if (!s) loi.push("bch-man: khong thay hang so lieu cong ty");
			else {
				console.log(
					`  do buoc 4: ${s.o} o, ${s.chu} o chu, dinh ${s.dinh.join(",")}`,
				);
				if (!(s.dinh[2] > s.dinh[0] && s.dinh[3] > s.dinh[1]))
					loi.push("bch-man: ngan cong ty mot hang");
				for (const n of s.cat) loi.push(`bch-man: ngan cong ty cat chu ${n}`);
				if (!s.cuoi.replace(/\s/g, "").includes(TEN_NGUOI_DAI))
					loi.push("bch-man: ngan cong ty thieu ten phu trach");
			}
			await chup(t, "bch-ngan-cong-ty-375.png");
			await t.close();
			for (const l of loi) console.log(`  ${l}`);
			d.dat(4, loi.length === 0, loi.join(" · "));
		});
	}

	if (chay(5)) {
		await d.chayBuoc(5, async () => {
			const loi = [];
			const t = await moBangCot(c, RONG);
			await t.waitForSelector(`[data-board-card="${idNgan}"]`, {
				timeout: CHO_MS,
			});
			const k = await doThe(t, idNgan);
			console.log(`  do buoc 5: the NGAN cung hang ${k?.cungHang}`);
			if (!k || k.cungHang !== true)
				loi.push("bch-man: 1440 the kanban tach hang");
			await moNganTuThe(t, idNgan);
			const s = await doStats(t);
			if (!s || new Set(s.dinh).size !== 1)
				loi.push(`bch-man: 1440 so lieu khong cung hang ${s?.dinh.join(",")}`);
			const b = await doThanh(t);
			const cao = new Set((b ?? []).map((x) => x.cao));
			console.log(
				`  do buoc 5: ${b?.length ?? 0} buoc, chieu cao ${[...cao].join(",")}`,
			);
			if (!b || cao.size !== 1) loi.push("bch-man: 1440 giai doan xuong dong");
			await chup(t, "bch-ngan-1440.png");
			await t.close();
			for (const l of loi) console.log(`  ${l}`);
			d.dat(5, loi.length === 0, loi.join(" · "));
		});
	}

	if (chay(6)) {
		await d.chayBuoc(6, async () => {
			const loi = [];
			const t = await moBangCot(c, HEP);
			const a = await cuonTrang(t);
			if (a) loi.push(`bch-man: tran ngang bang cot ${a}`);
			await moNganTuThe(t, idDai);
			const b = await cuonTrang(t);
			if (b) loi.push(`bch-man: tran ngang trang co ngan ${b}`);
			const n = await doTranNgan(t);
			if (n.loi) loi.push(`bch-man: tran ngang ${n.loi}`);
			else {
				console.log(
					`  do buoc 6: ${n.dem} phan tu trong ngan, tran ${n.so}, tieu de rong ${n.rongTieuDe}px`,
				);
				if (n.dem < PHAN_TU_NGAN_TOI_THIEU)
					loi.push(`bch-man: tran ngang do qua it phan tu ${n.dem}`);
				if (n.rongTieuDe < RONG_TIEU_DE_TOI_THIEU)
					loi.push(`bch-man: tieu de ngan bi bop ${n.rongTieuDe}px`);
				for (const x of n.tran) loi.push(`bch-man: tran ngang ngan ${x}`);
			}
			await t.close();
			for (const l of loi) console.log(`  ${l}`);
			d.dat(6, loi.length === 0, loi.join(" · "));
		});
	}

	await d.ket("do-bo-cuc");
} catch (e) {
	await d.khongDoDuoc(e);
}
