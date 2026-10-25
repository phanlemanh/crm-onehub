import { mkdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";
import { SO_KR_MOC } from "../../../packages/validation/src/okr-kr.ts";
import {
	APP,
	CHROME,
	datTrinhDuyet,
	khongDo,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import {
	AN_CONG_CU_DEV,
	BANG_CHUNG,
	CHU,
	DO,
	docBo,
	duongBo,
	duongSoan,
	khoaRecord,
	nghi,
	THAM,
	THU_MUC_HTML,
} from "./man-soan-du-lieu.mjs";

let dung = 0;
let sai = 0;
export const ketQua = () => ({ dung, sai });
function kd(ac, dat, chu) {
	if (dat) dung += 1;
	else sai += 1;
	console.log(dat ? chu : `SAI ${ac}: ${chu}`);
}

let trinhDuyet = null;
export async function moTrinhDuyet() {
	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	datTrinhDuyet(trinhDuyet);
}

async function moTrang(cookie, duong, kho, toi = false) {
	const ctx = await trinhDuyet.createBrowserContext();
	const t = await ctx.newPage();
	const host = new URL(APP).hostname;
	await t.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	await t.setViewport({ width: kho.rong, height: kho.cao });
	await t.emulateMediaFeatures([
		{ name: "prefers-color-scheme", value: toi ? "dark" : "light" },
	]);
	await t.evaluateOnNewDocument(
		(css, laToi) => {
			document.addEventListener("DOMContentLoaded", () => {
				const s = document.createElement("style");
				s.textContent = css;
				document.head.appendChild(s);
				document.documentElement.classList.toggle("dark", laToi);
				document.documentElement.style.colorScheme = laToi ? "dark" : "light";
			});
		},
		AN_CONG_CU_DEV,
		toi,
	);
	await t.goto(`${APP}${duong}`, {
		waitUntil: "domcontentloaded",
		timeout: DO.cho.taiMs,
	});
	const dich = new URL(t.url()).pathname;
	if (dich.startsWith("/sign-in") || dich.includes("/onboarding"))
		await khongDo(`KHONG DO DUOC: ${duong} bi day ve ${dich}`);
	await t.bringToFront();
	return t;
}

const dongTrang = (t) => t.browserContext().close();

async function cho(t, chon, ms = DO.cho.taiMs) {
	const thay = await t
		.waitForFunction(
			(c) =>
				[...document.querySelectorAll(c)].some(
					(el) =>
						el.getClientRects().length > 0 &&
						getComputedStyle(el).visibility !== "hidden" &&
						Object.keys(el).some((k) => k.startsWith("__reactFiber")),
				),
			{ timeout: ms, polling: DO.cho.nhipMs },
			chon,
		)
		.then(() => true)
		.catch(() => false);
	await nghi(DO.cho.onDinhMs);
	return thay;
}

const choDieuKien = (t, fn, arg, ms) =>
	t
		.waitForFunction(fn, { timeout: ms, polling: DO.cho.nhipMs }, arg)
		.then(() => true)
		.catch(() => false);

async function bam(t, chon) {
	for (let i = 0; i < DO.cuon.soLan; i += 1) {
		const r = await t.evaluate((c) => {
			const el = [...document.querySelectorAll(c)].find(
				(e) =>
					e.getClientRects().length > 0 &&
					getComputedStyle(e).visibility !== "hidden",
			);
			if (!el) return null;
			const b = el.getBoundingClientRect();
			const x = b.left + b.width / 2;
			const y = b.top + b.height / 2;
			const trung = document.elementFromPoint(x, y);
			return {
				x,
				y,
				tren: b.top,
				duoi: b.bottom,
				cao: window.innerHeight,
				trung: !!trung && (trung === el || el.contains(trung)),
			};
		}, chon);
		if (r === null) return false;
		if (r.tren >= 0 && r.duoi <= r.cao && r.trung) {
			await t.mouse.click(r.x, r.y);
			return true;
		}
		await t.mouse.move(r.x, r.cao / 2);
		await t.mouse.wheel({
			deltaY:
				r.tren >= 0 && r.duoi <= r.cao
					? r.y - r.cao / 2
					: r.tren < 0
						? r.tren - DO.cuon.lePx
						: r.duoi - r.cao + DO.cuon.lePx,
		});
		await nghi(DO.cho.cuonMs);
	}
	return false;
}

async function choKhung(t) {
	const xong = await cho(t, "[data-khung-soan-bo='xong']", DO.cho.khungMs);
	if (!xong) {
		const trang = await t.evaluate(
			() =>
				document
					.querySelector("[data-khung-soan-bo]")
					?.getAttribute("data-khung-soan-bo") ?? "khong co khung",
		);
		console.log(`  khung soan chua xong: ${trang}`);
	}
	return xong;
}

async function choLuu(t, soKr) {
	const du = await choDieuKien(
		t,
		(n) => {
			const goc = document.querySelector("[data-khung-soan-bo]");
			if (!goc) return false;
			const mt = goc.querySelector("[data-dong-moi][data-dong-mt]");
			const kr = goc.querySelectorAll("[data-dong-kr-moi][data-dong-kr]");
			const dang = goc.querySelectorAll("[data-luu='dang-luu']");
			return mt !== null && kr.length >= n && dang.length === 0;
		},
		soKr,
		DO.cho.luuMs,
	);
	await nghi(DO.cho.onDinhMs);
	return du;
}

const go = async (t, chu) => {
	if (chu) await t.keyboard.type(chu, { delay: DO.cho.phimMs });
};

async function goKr(t, kr) {
	await go(t, kr.ten);
	await t.keyboard.press("Tab");
	await go(t, kr.khoi);
	await t.keyboard.press("Tab");
	await go(t, kr.dich);
	await t.keyboard.press("Tab");
	await go(t, kr.donVi);
	await t.keyboard.press("Enter");
	await nghi(DO.cho.onDinhMs);
}

async function goBo(t, bo) {
	await go(t, bo.mt);
	await t.keyboard.press("Enter");
	await nghi(DO.cho.onDinhMs);
	for (const kr of bo.kr) await goKr(t, kr);
}

const focusODau = (t) =>
	t.evaluate(() => {
		const a = document.activeElement;
		return (
			a?.matches?.("[data-dong-moi] [data-o-nhap='ten']") === true &&
			a.closest("[data-tai-lieu-bo]") !== null
		);
	});

const DOC_TAI_LIEU = () => {
	const tl = document.querySelector("[data-tai-lieu-bo]");
	const mt = tl
		? [...tl.querySelectorAll("[data-dong-mt]")].map((s) => ({
				id: s.getAttribute("data-dong-mt"),
				ten:
					s.querySelector(":scope > [data-o-nhap='ten']")?.value ??
					s.querySelector("[data-o-nhap='ten']")?.value ??
					"",
				kr: s.querySelectorAll("[data-dong-kr]").length,
			}))
		: [];
	const cot = document.querySelector("[data-o='cot-ben']");
	return {
		tieuDe:
			document
				.querySelector("[data-khung-soan-bo]")
				?.closest("[role='dialog']")
				?.querySelector("[data-slot$='title']")
				?.textContent.trim() ?? null,
		tenBo: document.querySelector("[data-ten-bo]")?.textContent.trim() ?? null,
		mt,
		chatLuong: !!cot?.querySelector("[data-khoi='chat-luong']"),
		gopY: !!cot?.querySelector("[data-khoi='gop-y-kara']"),
	};
};

const tapChu = (ds) => ds.map((m) => `${m.ten}(${m.kr} KR)`).join(" | ") || "-";

export async function e2(n) {
	const t = await moTrang(
		n.ck.mo,
		duongBo(n, n.pb.mo.id, n.ky.keHoach),
		DO.kho.rong,
	);
	try {
		await cho(t, "[data-nut='them-muc-tieu']");
		const moHop = await bam(t, "[data-nut='them-muc-tieu']");
		const coDong = moHop && (await cho(t, "[data-duong='soan']"));
		if (
			!coDong ||
			!(await bam(t, "[data-duong='soan']")) ||
			!(await choKhung(t))
		) {
			kd("AC-1", false, "MO: khong mo duoc che do Soan tu hop Them muc tieu");
			return;
		}
		const api = (await docBo(n.api.mo, n.ky.keHoach, n.pb.mo.id)).map((m) => ({
			id: m.id,
			ten: m.title,
			kr: m.keyResults.length,
		}));
		const record = new URL(t.url()).searchParams.get(THAM.record) ?? "";
		const truoc = await t.evaluate(DOC_TAI_LIEU);
		await t.reload({ waitUntil: "domcontentloaded", timeout: DO.cho.taiMs });
		const moLai = await choKhung(t);
		const sau = await t.evaluate(DOC_TAI_LIEU);
		const khop = (d) => JSON.stringify(d.mt) === JSON.stringify(api);
		const tenMong = `${n.pb.mo.name} · ${n.tenKy[n.ky.keHoach]}`;
		const loi = [
			record.split(",").includes(khoaRecord(n.ky.keHoach, n.pb.mo.id))
				? null
				: `url record «${record}»`,
			truoc.tieuDe === CHU.dauKhung.tieuDe ? null : `tieu de «${truoc.tieuDe}»`,
			truoc.tenBo === tenMong
				? null
				: `ten bo «${truoc.tenBo}» (mong ${tenMong})`,
			truoc.chatLuong && truoc.gopY ? null : "cot ben thieu khoi",
		].filter(Boolean);
		if (!khop(truoc)) {
			kd(
				"AC-1",
				false,
				`MO: tap lech — tai lieu ${tapChu(truoc.mt)} · API ${tapChu(api)}`,
			);
			return;
		}
		if (!moLai || !khop(sau)) {
			kd("AC-1", false, `MO: tai lai mat — ${tapChu(sau.mt)}`);
			return;
		}
		kd(
			"AC-1",
			loi.length === 0,
			`MO: ${api.length} muc tieu = API · tai lai giu${loi.length ? ` · lech ${loi.join("; ")}` : ""}`,
		);
	} finally {
		await dongTrang(t);
	}
}

const VIET = {
	mt: "Thu công nợ đúng hạn trong năm tới",
	kr: [
		{
			ten: "Tiền thu về đúng hạn mỗi tháng",
			khoi: "2",
			dich: "3,5",
			donVi: "tỷ ₫",
			mong: { kind: "tang-toi", startValue: 2, targetValue: 3.5 },
		},
		{
			ten: "Số ngày hoá đơn tồn đọng",
			khoi: "10",
			dich: "4",
			donVi: "ngày",
			mong: { kind: "giam-xuong", startValue: 10, targetValue: 4 },
		},
		{
			ten: "Ra mắt cổng đối soát công nợ",
			khoi: "",
			dich: "",
			donVi: "",
			mong: { kind: "moc", ...SO_KR_MOC },
		},
	],
};

const BAM_BO = {
	mt: "Tuyển đủ người cho mùa cao điểm",
	kr: [
		{
			ten: "Số nhân sự kho mới nhận việc",
			khoi: "0",
			dich: "40",
			donVi: "người",
		},
		{
			ten: "Thời gian tuyển một vị trí",
			khoi: "30",
			dich: "14",
			donVi: "ngày",
		},
		{
			ten: "Ra mắt chương trình giới thiệu ứng viên",
			khoi: "",
			dich: "",
			donVi: "",
		},
	],
};

function soKrLech(kr, mong, nguoi) {
	const l = [];
	if (!kr) return ["thieu KR"];
	if (kr.title !== mong.ten) l.push(`ten «${kr.title}»`);
	if (kr.kind !== mong.mong.kind) l.push(`kind ${kr.kind}`);
	if (kr.startValue !== mong.mong.startValue) l.push(`khoi ${kr.startValue}`);
	if (kr.targetValue !== mong.mong.targetValue)
		l.push(`dich ${kr.targetValue}`);
	if (kr.unit !== mong.donVi) l.push(`don vi «${kr.unit}»`);
	if (kr.owner?.id !== nguoi) l.push(`nguoi ${kr.owner?.id}`);
	return l;
}

export async function e4(n) {
	const t = await moTrang(
		n.ck.viet,
		duongBo(n, n.pb.viet.id, n.ky.keHoach),
		DO.kho.rong,
	);
	try {
		await cho(t, "[data-nut='them-muc-tieu']");
		await bam(t, "[data-nut='them-muc-tieu']");
		await cho(t, "[data-duong='soan']");
		await bam(t, "[data-duong='soan']");
		if (!(await choKhung(t))) {
			kd("AC-2", false, "VIET: khong mo duoc che do Soan");
			return;
		}
		if (!(await focusODau(t)))
			await bam(t, "[data-dong-moi] [data-o-nhap='ten']");
		await goBo(t, VIET);
		const daLuu = await choLuu(t, VIET.kr.length);
		await t.reload({ waitUntil: "domcontentloaded", timeout: DO.cho.taiMs });
		await choKhung(t);
		const dom = await t.evaluate(DOC_TAI_LIEU);
		const bo = await docBo(n.api.viet, n.ky.keHoach, n.pb.viet.id);
		const mt = bo.length === 1 ? bo[0] : null;
		const ct = mt ? await n.api.viet.hoi("okr.objective", { id: mt.id }) : null;
		const krs = ct?.keyResults ?? [];
		if (krs.length !== VIET.kr.length) {
			kd(
				"AC-2",
				false,
				`VIET: ${krs.length} KR · ${bo.length} muc tieu${daLuu ? "" : " · cho luu het gio"}`,
			);
			return;
		}
		const lech = [
			mt.status === "nhap" ? null : `trang thai ${mt.status}`,
			mt.title === VIET.mt ? null : `ten muc tieu «${mt.title}»`,
			mt.kind === "cam-ket" ? null : `loai ${mt.kind}`,
			mt.owner?.id === n.nguoi.viet ? null : `nguoi muc tieu ${mt.owner?.id}`,
			...VIET.kr.flatMap((k, i) =>
				soKrLech(krs[i], k, n.nguoi.viet).map((x) => `kr-${i + 1} ${x}`),
			),
			dom.mt.length === 1 &&
			dom.mt[0].ten === VIET.mt &&
			dom.mt[0].kr === VIET.kr.length
				? null
				: `tai lai: ${tapChu(dom.mt)}`,
		].filter(Boolean);
		kd(
			"AC-2",
			lech.length === 0,
			lech.length === 0
				? "VIET: 1 muc tieu nhap · 3 KR khop · tai lai giu"
				: `VIET: lech ${lech.join("; ")}`,
		);
	} finally {
		await dongTrang(t);
	}
}

const DEM_BAM = () => {
	window.__bamVk10 = 0;
	window.addEventListener(
		"pointerdown",
		() => {
			window.__bamVk10 += 1;
		},
		true,
	);
};

async function tichHet(t) {
	for (;;) {
		const chon = await t.evaluate(() => {
			const o = [
				...document.querySelectorAll(
					"[data-danh-sach-cong-bo] [data-muc-cong-bo] button[role='checkbox']",
				),
			].find((b) => b.getAttribute("aria-checked") !== "true");
			if (!o) return null;
			o.setAttribute("data-vk10-tich", "");
			return "[data-vk10-tich]";
		});
		if (chon === null) return;
		await bam(t, chon);
		await t.evaluate(() =>
			document
				.querySelector("[data-vk10-tich]")
				?.removeAttribute("data-vk10-tich"),
		);
		await nghi(DO.cho.cuonMs);
	}
}

export async function e11(n) {
	const t = await moTrang(
		n.ck.bam,
		duongBo(n, n.pb.bam.id, n.ky.keHoach),
		DO.kho.rong,
	);
	try {
		if (!(await cho(t, "[data-nut='soan-bo-okr']"))) {
			kd("AC-6", false, "BAM: trang bo trong khong co nut Soan bo OKR");
			return;
		}
		await t.evaluate(DEM_BAM);
		await bam(t, "[data-nut='soan-bo-okr']");
		if (!(await choKhung(t))) {
			kd("AC-6", false, "BAM: khong mo duoc che do Soan");
			return;
		}
		if (!(await focusODau(t)))
			await bam(t, "[data-dong-moi] [data-o-nhap='ten']");
		await goBo(t, BAM_BO);
		await choLuu(t, BAM_BO.kr.length);
		const nhan = CHU.congBo.nut("1");
		const san = await choDieuKien(
			t,
			(chu) => {
				const b = document.querySelector(
					"[data-o='tai-lieu'] [data-nut='cong-bo-bo']",
				);
				return b?.textContent.trim() === chu && !b.disabled;
			},
			nhan,
			DO.cho.luuMs,
		);
		if (!san) {
			kd("AC-6", false, `BAM: nut cong bo khong doc «${nhan}»`);
			return;
		}
		await bam(t, "[data-o='tai-lieu'] [data-nut='cong-bo-bo']");
		await cho(t, "[role='alertdialog'] [data-danh-sach-cong-bo]");
		await tichHet(t);
		await bam(t, "[role='alertdialog'] [data-slot='alert-dialog-action']");
		const xong = await cho(t, "[data-bien-nhan-cong-bo]", DO.cho.luuMs);
		const soBam = await t.evaluate(() => window.__bamVk10);
		const bo = await docBo(n.api.bam, n.ky.keHoach, n.pb.bam.id);
		const ct =
			bo.length === 1
				? await n.api.bam.hoi("okr.objective", { id: bo[0].id })
				: null;
		const khoa = ct?.keyResults.filter((k) => k.startLocked).length ?? 0;
		const congBo = `CONG BO: ${ct?.status ?? `${bo.length} muc tieu`} · ${khoa} KR`;
		kd("AC-6", soBam <= DO.bamToiDa, `BAM ${soBam}`);
		kd(
			"AC-6",
			xong &&
				ct?.status === "cong-bo" &&
				ct.keyResults.length === BAM_BO.kr.length &&
				khoa === BAM_BO.kr.length,
			congBo,
		);
	} finally {
		await dongTrang(t);
	}
}

const DEM_NGAN = () => ({
	vung: document.querySelectorAll("[data-okr-sheet] [data-vung-kara]").length,
	neo: document.querySelectorAll("[data-okr-sheet] [data-gop-y]").length,
	chip: [
		...document.querySelectorAll("[data-okr-sheet] [data-chip-gop-y]"),
	].map((e) => e.textContent.trim()),
});

const duongNgan = (n) =>
	`${duongBo(n, n.pb.gopY.id, n.ky.cur)}&${THAM.record}=objective:${n.gopY.mt}`;

export async function e13(n) {
	const t = await moTrang(n.ck.gopY, duongNgan(n), DO.kho.rong);
	try {
		await cho(t, `[data-okr-sheet='${n.gopY.mt}'] [data-slot$='title']`);
		await cho(t, "[data-okr-sheet] [data-chip-gop-y]", DO.cho.apiMs);
		const d = await t.evaluate(DEM_NGAN);
		const dong = `NGAN vung ${d.vung} neo ${d.neo} chip ${d.chip.length}`;
		console.log(dong);
		const chipDung = d.chip.length === 1 && d.chip[0].includes("1");
		if (d.vung !== 0 || d.neo !== 0 || !chipDung) {
			kd("AC-7", false, `${dong}${chipDung ? "" : ` «${d.chip.join(" | ")}»`}`);
			return;
		}
		await bam(t, "[data-okr-sheet] [data-chip-gop-y]");
		const mo = await choKhung(t);
		await cho(t, "[data-o='cot-ben'] [data-gop-y]", DO.cho.apiMs);
		await nghi(DO.cho.onDinhMs);
		const sau = await t.evaluate((mt) => {
			const s = document.querySelector(
				`[data-tai-lieu-bo] [data-dong-mt='${mt}']`,
			);
			const r = s?.getBoundingClientRect();
			const vung = document
				.querySelector("[data-o='tai-lieu']")
				?.getBoundingClientRect();
			return {
				thay: !!r && !!vung && r.top >= vung.top - 1 && r.top < vung.bottom,
				the: document.querySelectorAll("[data-o='cot-ben'] [data-gop-y]")
					.length,
			};
		}, n.gopY.mt);
		kd(
			"AC-7",
			mo && sau.thay && sau.the >= 1,
			`${dong} · chip mo che do Soan, muc tieu ${sau.thay ? "trong tam nhin" : "ngoai tam nhin"} · ${sau.the} the o cot ben`,
		);
	} finally {
		await dongTrang(t);
	}
}

const DOC_KR = (kr) =>
	document.querySelector(
		`[data-tai-lieu-bo] [data-dong-kr='${kr}'] [data-o-nhap='ten']`,
	)?.value ?? null;

export async function e9(n) {
	const t = await moTrang(
		n.ck.gopY,
		duongSoan(n, n.pb.gopY.id, n.ky.cur),
		DO.kho.rong,
	);
	try {
		await choKhung(t);
		const chon = `[data-o='cot-ben'] [data-gop-y='${n.gopY.deXuatId}'] [data-hanh-dong='nhan']`;
		if (!(await cho(t, chon, DO.cho.apiMs))) {
			if (await bam(t, "[data-o='cot-ben'] [data-nut='nho-kara-doc']"))
				await cho(t, chon, DO.cho.khungMs);
		}
		if (!(await bam(t, chon))) {
			kd("AC-5", false, "GOP Y: khong thay the de xuat o cot ben");
			return;
		}
		await cho(t, "[data-slot='proposed-change-receipt'] button", DO.cho.apiMs);
		const docApi = async () =>
			(
				await n.api.gopY.hoi("okr.objective", { id: n.gopY.mt })
			).keyResults.find((k) => k.id === n.gopY.kr)?.title;
		const sauNhan = await docApi();
		const manNhan = await t.evaluate(DOC_KR, n.gopY.kr);
		if (sauNhan !== n.gopY.moi) {
			kd("AC-5", false, `GOP Y: nhan khong ghi — API «${sauNhan}»`);
			return;
		}
		await bam(t, "[data-slot='proposed-change-receipt'] button");
		await choDieuKien(
			t,
			([kr, cu]) =>
				document.querySelector(
					`[data-tai-lieu-bo] [data-dong-kr='${kr}'] [data-o-nhap='ten']`,
				)?.value === cu,
			[n.gopY.kr, n.gopY.cu],
			DO.cho.apiMs,
		);
		await nghi(DO.cho.onDinhMs * 2);
		const sauHoan = await docApi();
		const manHoan = await t.evaluate(DOC_KR, n.gopY.kr);
		if (sauHoan !== n.gopY.cu) {
			kd(
				"AC-5",
				false,
				`GOP Y: hoan tac khong ve — API «${sauHoan}», man «${manHoan}»`,
			);
			return;
		}
		kd(
			"AC-5",
			manNhan === n.gopY.moi && manHoan === n.gopY.cu,
			`GOP Y: nhan → moi · hoan tac → cu${manNhan === n.gopY.moi ? "" : ` · man sau nhan «${manNhan}»`}${manHoan === n.gopY.cu ? "" : ` · man sau hoan tac «${manHoan}»`}`,
		);
	} finally {
		await dongTrang(t);
	}
}

async function dienO(t, chon, chu) {
	const co = await t.evaluate((c) => {
		const o = document.querySelector(c);
		if (!o) return false;
		o.focus();
		o.select();
		return true;
	}, chon);
	if (!co) return false;
	if (chu === "") await t.keyboard.press("Backspace");
	else await t.keyboard.type(chu, { delay: DO.cho.phimMs });
	return true;
}

const tonTai = async (api, id) =>
	api
		.hoi("okr.objective", { id })
		.then((mt) => mt.status !== "da-bo")
		.catch((e) => {
			if (String(e).includes("NOT_FOUND") || String(e).includes(" 404"))
				return false;
			throw e;
		});

async function xoaMucTieuMoi(t) {
	await bam(t, "[data-nut='them-muc-tieu-bo']");
	await nghi(DO.cho.onDinhMs);
	const oMoi = await t.evaluate(() => {
		const ds = [
			...document.querySelectorAll("[data-tai-lieu-bo] [data-dong-moi]"),
		];
		const s = ds.at(-1);
		s?.setAttribute("data-vk10-xoa", "");
		return !!s;
	});
	if (!oMoi) return { loi: "khong co dong muc tieu moi" };
	const chon = "[data-vk10-xoa] > [data-o-nhap='ten']";
	await dienO(t, chon, "Đo vk10 · mục tiêu thử xoá");
	await t.keyboard.press("Tab");
	const coId = await choDieuKien(
		t,
		() =>
			document.querySelector("[data-vk10-xoa]")?.hasAttribute("data-dong-mt"),
		null,
		DO.cho.luuMs,
	);
	if (!coId) return { loi: "muc tieu moi khong luu" };
	const id = await t.evaluate(() =>
		document.querySelector("[data-vk10-xoa]").getAttribute("data-dong-mt"),
	);
	for (const ten of [
		"Đo vk10 · mục tiêu thử xoá lần một",
		"Đo vk10 · mục tiêu thử xoá lần hai",
	]) {
		await dienO(t, chon, ten);
		await t.keyboard.press("Tab");
		await nghi(DO.cho.onDinhMs);
		await choDieuKien(
			t,
			() => !document.querySelector("[data-vk10-xoa][data-luu='dang-luu']"),
			null,
			DO.cho.luuMs,
		);
	}
	await bam(t, "[data-vk10-xoa] [data-nut='menu-muc-tieu']");
	await cho(t, "[data-nut='xoa-muc-tieu']", DO.cho.apiMs);
	await bam(t, "[data-nut='xoa-muc-tieu']");
	await cho(
		t,
		"[role='alertdialog'] [data-slot='alert-dialog-action']",
		DO.cho.apiMs,
	);
	await bam(t, "[role='alertdialog'] [data-slot='alert-dialog-action']");
	await nghi(DO.cho.onDinhMs * 2);
	return { id };
}

async function suaKrCongBo(n, t, mt) {
	const kr = mt.keyResults[0];
	const chon = `[data-tai-lieu-bo] [data-dong-kr='${kr.id}'] [data-o-nhap='ten']`;
	const moi = `${kr.title} · đo vk10`;
	await dienO(t, chon, moi);
	await t.keyboard.press("Tab");
	await nghi(DO.cho.onDinhMs * 2);
	const sau = (
		await n.api.sua.hoi("okr.objective", { id: mt.id })
	).keyResults.find((k) => k.id === kr.id);
	return { kr, moi, sau };
}

async function xoaKrNhap(n, t, mt) {
	const kr = mt.keyResults[0];
	const goc = `[data-tai-lieu-bo] [data-dong-kr='${kr.id}']`;
	for (const o of ["ten", "khoi", "dich", "don-vi"])
		await dienO(t, `${goc} [data-o-nhap='${o}']`, "");
	await t.evaluate((c) => {
		const o = document.querySelector(c);
		o?.focus();
		o?.setSelectionRange(0, 0);
	}, `${goc} [data-o-nhap='ten']`);
	await t.keyboard.press("Backspace");
	await nghi(DO.cho.onDinhMs * 2);
	const sau = await n.api.sua.hoi("okr.objective", { id: mt.id });
	return { kr, vang: !sau.keyResults.some((k) => k.id === kr.id) };
}

export async function e20(n) {
	const bo = await docBo(n.api.sua, n.ky.cur, n.pb.sua.id);
	const congBo = bo.find(
		(m) => m.status === "cong-bo" && m.keyResults.length > 0,
	);
	const nhap = bo.find((m) => m.status === "nhap" && m.keyResults.length > 0);
	if (!congBo || !nhap)
		await khongDo(
			`KHONG DO DUOC: bo ${n.pb.sua.name} thieu muc tieu cong bo hay nhap co KR`,
		);
	const t = await moTrang(
		n.ck.sua,
		duongSoan(n, n.pb.sua.id, n.ky.cur),
		DO.kho.rong,
	);
	try {
		if (!(await choKhung(t))) {
			kd("AC-3", false, "XOA MT: khong mo duoc che do Soan");
			return;
		}
		const xoa = await xoaMucTieuMoi(t);
		const conMt = xoa.id ? await tonTai(n.api.sua, xoa.id) : null;
		const sua = await suaKrCongBo(n, t, congBo);
		const xoaKr = await xoaKrNhap(n, t, nhap);
		const oMot = xoa.loi
			? `XOA MT: ${xoa.loi}`
			: `XOA MT: ${conMt ? "con" : "vang"}`;
		const soGiu =
			sua.sau?.startValue === sua.kr.startValue &&
			sua.sau?.targetValue === sua.kr.targetValue;
		const oHai = `SUA KR CONG BO: ${sua.sau?.title === sua.moi ? "ten moi" : `ten «${sua.sau?.title}»`}, so ${soGiu ? "giu" : "doi"}`;
		const oBa = `XOA KR: ${xoaKr.vang ? "vang" : "con"}`;
		const dat = !xoa.loi && conMt === false;
		kd(
			"AC-3",
			dat && sua.sau?.title === sua.moi && soGiu && xoaKr.vang,
			`${oMot} · ${oHai} · ${oBa}`,
		);
	} finally {
		await dongTrang(t);
	}
}

const DO_TRAN = () => {
	const iw = window.innerWidth;
	const hop = document
		.querySelector("[data-khung-soan-bo]")
		?.closest("[role='dialog']");
	const cat = (el) => {
		for (
			let p = el.parentElement;
			p && p !== hop.parentElement;
			p = p.parentElement
		)
			if (getComputedStyle(p).overflowX !== "visible") return true;
		return false;
	};
	const cuon = (el) => {
		const o = getComputedStyle(el).overflowX;
		return (
			(o === "auto" || o === "scroll") && el.scrollWidth > el.clientWidth + 1
		);
	};
	const tran = hop
		? [...hop.querySelectorAll("*")].filter((el) => {
				const r = el.getBoundingClientRect();
				const vuot =
					r.width > 0 && r.height > 0 && (r.right > iw + 1 || r.left < -1);
				return (vuot && !cat(el)) || cuon(el);
			}).length
		: -1;
	return { sw: document.documentElement.scrollWidth, iw, tran };
};

const DO_RONG = () => {
	const tl = document.querySelector("[data-o='tai-lieu']");
	const cb = document.querySelector("[data-o='cot-ben']");
	const hien = (e) => !!e && e.getClientRects().length > 0;
	const p = document.createElement("div");
	p.style.width = "var(--container-assist-rail)";
	p.style.position = "absolute";
	document.body.appendChild(p);
	const rail = p.getBoundingClientRect().width;
	p.remove();
	const ke = (e, canh) =>
		e
			? Number.parseFloat(getComputedStyle(e)[`border${canh}Width`]) > 0
			: false;
	const giua =
		tl && cb
			? [...tl.parentElement.children].filter(
					(e) =>
						e !== tl &&
						e !== cb &&
						e.compareDocumentPosition(tl) & 2 &&
						e.compareDocumentPosition(cb) & 4,
				).length
			: 0;
	return {
		haiO: hien(tl) && hien(cb),
		rail,
		cot: cb ? cb.getBoundingClientRect().width : 0,
		duongKe: Number(ke(tl, "Right")) + Number(ke(cb, "Left")) + giua,
	};
};

const DO_HEP = () => {
	const hop = document
		.querySelector("[data-khung-soan-bo]")
		?.closest("[role='dialog']");
	const r = hop?.getBoundingClientRect();
	return {
		phu:
			!!r &&
			Math.abs(r.left) <= 1 &&
			Math.abs(r.top) <= 1 &&
			Math.abs(r.width - window.innerWidth) <= 1 &&
			Math.abs(r.height - window.innerHeight) <= 1,
		the: [...(hop?.querySelectorAll("[role='tab']") ?? [])].map((e) =>
			e.textContent.trim(),
		),
	};
};

const HTML_DA_DUNG = () => {
	const css = [...document.styleSheets]
		.map((s) => {
			try {
				return [...s.cssRules].map((r) => r.cssText).join("\n");
			} catch {
				return "";
			}
		})
		.join("\n");
	const lop = [
		...document.querySelectorAll(
			"[role='dialog'], [role='alertdialog'], [data-slot$='overlay']",
		),
	]
		.filter(
			(e) => !e.parentElement?.closest("[role='dialog'], [role='alertdialog']"),
		)
		.map((e) => e.outerHTML)
		.join("\n");
	const h = document.documentElement;
	return `<!doctype html>\n<html lang="${h.lang}" class="${h.className}" style="${h.getAttribute("style") ?? ""}">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<style>\n${css}\n</style>\n</head>\n<body class="${document.body.className}">\n${lop}\n</body>\n</html>\n`;
};

const daLuuHtml = [];
async function luuHtml(t, trangThai, kho) {
	mkdirSync(THU_MUC_HTML, { recursive: true });
	const tep = `${trangThai}-${kho.ten}.html`;
	writeFileSync(join(THU_MUC_HTML, tep), await t.evaluate(HTML_DA_DUNG));
	daLuuHtml.push(tep);
}

async function chup(t, ten) {
	mkdirSync(BANG_CHUNG, { recursive: true });
	await nghi(DO.cho.onDinhMs);
	await t.screenshot({ path: join(BANG_CHUNG, `${ten}.png`) });
}

async function moSoan(cookie, duong, kho, toi, cho2) {
	const t = await moTrang(cookie, duong, kho, toi);
	await choKhung(t);
	if (cho2) await cho(t, cho2, DO.cho.apiMs);
	return t;
}

async function gopY(n, kho, toi) {
	const t = await moSoan(
		n.ck.gopY,
		duongSoan(n, n.pb.gopY.id, n.ky.cur),
		kho,
		toi,
		kho === DO.kho.rong ? "[data-o='cot-ben'] [data-gop-y]" : null,
	);
	return t;
}

async function boMoMoKr(n, kho) {
	const t = await moSoan(
		n.ck.mo,
		duongSoan(n, n.pb.mo.id, n.ky.keHoach),
		kho,
		false,
	);
	await t.evaluate(() => {
		const o = document.querySelector(
			"[data-tai-lieu-bo] [data-dong-mt] > [data-o-nhap='ten']",
		);
		o?.focus();
		o?.setSelectionRange(o.value.length, o.value.length);
	});
	await t.keyboard.press("Enter");
	await cho(t, "[data-dong-kr-moi]", DO.cho.apiMs);
	return t;
}

async function e16Rong(n) {
	const kho = DO.kho.rong;
	const t = await gopY(n, kho, false);
	const r = await t.evaluate(DO_RONG);
	await chup(t, "soan-1280-sang");
	await luuHtml(t, "gop-y", kho);
	await dongTrang(t);
	const t2 = await gopY(n, kho, true);
	await chup(t2, "soan-1280-toi");
	await dongTrang(t2);
	return r;
}

async function e16Hep(n) {
	const kho = DO.kho.hep;
	const t = await gopY(n, kho, false);
	const h = await t.evaluate(DO_HEP);
	const bo = await t.evaluate(DO_TRAN);
	await chup(t, "soan-375-sang");
	await luuHtml(t, "gop-y", kho);
	const coThe = await bam(t, `[role='dialog'] [role='tab']:last-of-type`);
	await nghi(DO.cho.onDinhMs);
	const cot = await t.evaluate(DO_TRAN);
	if (coThe) await chup(t, "the-chat-luong-375-sang");
	await dongTrang(t);
	const t2 = await gopY(n, kho, true);
	await chup(t2, "soan-375-toi");
	await dongTrang(t2);
	const t3 = await boMoMoKr(n, kho);
	const dongMoi = await t3.evaluate(DO_TRAN);
	await dongTrang(t3);
	return { ...h, bo, cot, dongMoi, coThe };
}

async function e16Trang(n) {
	for (const kho of [DO.kho.rong, DO.kho.hep]) {
		const tr = await moSoan(
			n.ck.trong,
			duongSoan(n, n.pb.trong.id, n.ky.keHoach),
			kho,
			false,
		);
		if (kho === DO.kho.rong) await chup(tr, "trong-1280-sang");
		await luuHtml(tr, "trong", kho);
		await dongTrang(tr);
		const cx = await moSoan(
			n.ck.gopY,
			duongSoan(n, n.pb.gopY.id, n.ky.daDong),
			kho,
			false,
			"[data-ly-do-chi-xem]",
		);
		await luuHtml(cx, "chi-xem", kho);
		await dongTrang(cx);
	}
	for (const [kho, toi] of [
		[DO.kho.rong, false],
		[DO.kho.rong, true],
		[DO.kho.hep, false],
	]) {
		const t = await moSoan(
			n.ck.mo,
			duongSoan(n, n.pb.mo.id, n.ky.keHoach),
			kho,
			toi,
		);
		await bam(t, "[data-o='tai-lieu'] [data-nut='cong-bo-bo']");
		await cho(t, "[role='alertdialog'] [data-danh-sach-cong-bo]", DO.cho.apiMs);
		if (kho === DO.kho.rong)
			await chup(t, `hoi-cong-bo-1280-${toi ? "toi" : "sang"}`);
		if (!toi) await luuHtml(t, "hoi-cong-bo", kho);
		await dongTrang(t);
	}
	for (const toi of [false, true]) {
		const t = await moTrang(n.ck.gopY, duongNgan(n), DO.kho.rong, toi);
		await cho(t, "[data-okr-sheet] [data-chip-gop-y]", DO.cho.khungMs);
		await chup(t, `ngan-1280-${toi ? "toi" : "sang"}`);
		await dongTrang(t);
	}
}

export async function e16(n) {
	const r = await e16Rong(n);
	const h = await e16Hep(n);
	await e16Trang(n);
	const rongDung =
		r.haiO && Math.abs(r.cot - r.rail) <= DO.lechPx && r.duongKe === 1;
	const kho1280 = rongDung
		? "KHO 1280: hai o"
		: `KHO 1280: ${r.haiO ? "hai o" : "thieu o"} · cot ben ${r.cot}px / rail ${r.rail}px · ${r.duongKe} duong ke`;
	const theDung =
		h.phu &&
		h.the.length === 2 &&
		h.the[0] === CHU.theSoan.bo &&
		h.the[1] === CHU.theSoan.cotBen &&
		h.coThe;
	const tran = [
		["the bo", h.bo],
		["the chat luong", h.cot],
		["dong KR moi", h.dongMoi],
	].filter(([, d]) => d.sw > d.iw || d.tran !== 0);
	const kho375 = theDung
		? "KHO 375: hai the"
		: `KHO 375: ${h.phu ? "phu man" : "khong phu man"} · the «${h.the.join(" | ")}»`;
	const khongTran = tran.length === 0;
	if (!khongTran)
		kd(
			"AC-10",
			false,
			`KHO 375: tran — ${tran.map(([ten, d]) => `${ten} scrollWidth ${d.sw}/${d.iw}, ${d.tran} phan tu vuot khung`).join("; ")}`,
		);
	kd(
		"AC-10",
		rongDung && theDung && khongTran,
		`${kho1280} · ${kho375} · ${khongTran ? "khong tran" : "tran"}`,
	);
	const thieu = DO.anh.filter((ten) => {
		try {
			return statSync(join(BANG_CHUNG, `${ten}.png`)).size === 0;
		} catch {
			return true;
		}
	});
	kd(
		"AC-10",
		thieu.length === 0,
		`ANH ${DO.anh.length - thieu.length}/${DO.anh.length}${thieu.length ? ` · thieu ${thieu.join(", ")}` : ""}`,
	);
	const htmlMong = DO.html.flatMap((tt) => [
		`${tt}-${DO.kho.rong.ten}.html`,
		`${tt}-${DO.kho.hep.ten}.html`,
	]);
	writeFileSync(
		join(THU_MUC_HTML, "danh-sach.json"),
		`${JSON.stringify({ tep: daLuuHtml }, null, 2)}\n`,
	);
	console.log(
		`HTML ${daLuuHtml.length}/${htmlMong.length} vao ${THU_MUC_HTML}: ${daLuuHtml.join(", ")}`,
	);
}
