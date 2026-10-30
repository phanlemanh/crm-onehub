import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { db } from "../../../packages/db/src/index.ts";
import { isMeasureDatabase } from "../../../packages/db/src/measure-database.ts";
import { dauTuanVN } from "../../../packages/db/src/onboarding-nhac.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import {
	APP,
	ket,
	khongDo,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import { chayChieuDo } from "./man-chieu-do.mjs";
import {
	BANG_CHUNG,
	bam,
	bamChu,
	CHU_TU_TIN,
	cho,
	choHet,
	choUrl,
	DO,
	DOC_SO,
	dong,
	dongTrang,
	dungDuLieu,
	duongBo,
	duongHop,
	giaTriCo,
	giaTriMoiCua,
	go,
	HOP,
	ketQua,
	lanCua,
	moTrang,
	moTrinhDuyet,
	nghi,
	THAM,
	tuanTruocCua,
} from "./man-lib.mjs";

const DO_TRAN = (khoi) => {
	const goc = document.documentElement;
	const truoc = goc.scrollWidth;
	const rong = window.innerWidth;
	const div = document.createElement("div");
	div.style.width = `${khoi}px`;
	div.style.height = "1px";
	document.body.appendChild(div);
	const voiKhoi = goc.scrollWidth;
	div.remove();
	return { truoc, rong, voiKhoi };
};

const DO_BANG = (lech) => {
	const hien = (el) => el.checkVisibility();
	const dongHien = [...document.querySelectorAll("[data-kr-hop]")].filter(hien);
	const dem = new Map();
	for (const d of dongHien) {
		const id = d.getAttribute("data-kr-hop");
		const cu = dem.get(id) ?? { dong: 0, ghiChu: [], mucDoi: [] };
		cu.dong += 1;
		cu.ghiChu.push(
			...[...d.querySelectorAll("[data-ghi-chu]")]
				.filter(hien)
				.map((e) => e.getAttribute("data-kho")),
		);
		cu.mucDoi.push(
			...[...d.querySelectorAll("[data-muc-doi]")]
				.filter(hien)
				.map((e) => e.getAttribute("data-kho")),
		);
		dem.set(id, cu);
	}
	const nut = [...document.querySelectorAll("[data-nut='cap-nhat-dong-kr']")]
		.filter(hien)
		.map((b) => {
			const r = b.getBoundingClientRect();
			return {
				kr: b.closest("[data-kr-hop]")?.getAttribute("data-kr-hop") ?? "-",
				trai: Math.round(r.left),
				phai: Math.round(r.right),
			};
		});
	const nhanCua = (el) => {
		const boc = el.parentElement;
		const nhan = boc?.firstElementChild;
		return nhan && nhan !== el ? [nhan] : [];
	};
	const goc = [
		...[...document.querySelectorAll("[data-ghi-chu], [data-muc-doi]")]
			.filter(hien)
			.flatMap((e) => [e, ...e.querySelectorAll("*"), ...nhanCua(e)]),
		...document.querySelectorAll(
			"[data-ly-do], [data-ly-do] *, [data-nut='cap-nhat-dong-kr'], [data-mo-kr], thead th",
		),
	].filter(hien);
	const xet = [...new Set(goc)];
	const cat = xet
		.filter((x) => x.scrollWidth > x.clientWidth + lech)
		.map(
			(x) =>
				`«${x.textContent.trim().slice(0, 40)}» ${x.scrollWidth}>${x.clientWidth}`,
		);
	return {
		thuTu: dongHien.map((d) => d.getAttribute("data-kr-hop")),
		dem: [...dem].map(([id, v]) => ({ id, ...v })),
		nut,
		rong: window.innerWidth,
		xet: xet.length,
		cat,
	};
};

const DOI_CHUNG_DEM = () => {
	const hien = (el) => el.checkVisibility();
	const d = [...document.querySelectorAll("[data-kr-hop]")].find(hien);
	if (!d) return { cach: "khong co dong", so: 0 };
	const an = [...d.querySelectorAll("[data-ghi-chu]")].find((e) => !hien(e));
	const dem = () =>
		[...d.querySelectorAll("[data-ghi-chu]")].filter(hien).length;
	if (an) {
		const doi = [];
		for (let e = an; e && e !== d; e = e.parentElement) {
			if (getComputedStyle(e).display !== "none") continue;
			doi.push([e, e.getAttribute("class")]);
			e.setAttribute(
				"class",
				(e.getAttribute("class") ?? "")
					.split(/\s+/)
					.filter((c) => !/(^|:)hidden$/.test(c))
					.join(" "),
			);
		}
		const so = dem();
		for (const [e, c] of doi) e.setAttribute("class", c ?? "");
		return { cach: `go class an cua ${doi.length} tang`, so };
	}
	const hienCo = [...d.querySelectorAll("[data-ghi-chu]")].find(hien);
	if (!hienCo) return { cach: "khong co ghi chu hien", so: 0 };
	const ban = hienCo.cloneNode(true);
	hienCo.after(ban);
	const so = dem();
	ban.remove();
	return { cach: "khong co ban an o kho nay, nhan ban ban dang hien", so };
};

const MO_CUON = () => {
	let them = 0;
	for (const e of document.querySelectorAll("*")) {
		if (!/(auto|scroll)/.test(getComputedStyle(e).overflowY)) continue;
		if (e.scrollHeight <= e.clientHeight + 1) continue;
		them = Math.max(them, e.scrollHeight - e.clientHeight);
		e.scrollTop = 0;
	}
	window.scrollTo(0, 0);
	return them;
};

async function chup(t, ten, trang) {
	const duong = join(BANG_CHUNG, `${ten}.png`);
	if (!trang) {
		await t.screenshot({ path: duong });
		return duong;
	}
	const khung = t.viewport();
	const them = await t.evaluate(MO_CUON);
	await t.setViewport({ ...khung, height: khung.height + them });
	await nghi(DO.cho.onDinhMs);
	await t.screenshot({ path: duong, fullPage: true });
	await t.setViewport(khung);
	await nghi(DO.cho.onDinhMs);
	return duong;
}

async function denHopTuan(t, n) {
	const the = `[data-the-con-bo] a[data-the='${HOP}']`;
	await cho(t, the);
	const bamThe = await bam(t, the);
	const url = await choUrl(t, { [THAM.xem]: HOP });
	const so = await cho(t, "[data-hang-so-hop]:not([aria-busy]) [data-o-so]");
	const dongCo = await cho(t, "[data-kr-hop]");
	return { bamThe, url, so, dongCo, n };
}

async function moConLai(t) {
	const co = await t.$("[data-con-lai='dong']");
	if (!co) return (await t.$("[data-con-lai='mo']")) !== null;
	await bam(t, "[data-con-lai='dong'] button");
	return t
		.waitForSelector("[data-con-lai='mo'] [data-kr-hop]", {
			visible: true,
			timeout: DO.cho.dieuHuongMs,
		})
		.then(() => true)
		.catch(() => false);
}

async function doBang(t, kho, nhan, soDong) {
	const d = await t.evaluate(DO_BANG, DO.lechPx);
	const sai1 = d.dem.filter((x) => x.dong !== 1 || x.ghiChu.length !== 1);
	const sai2 = d.dem.filter((x) => x.dong !== 1 || x.mucDoi.length !== 1);
	const lechKho = d.dem.filter(
		(x) =>
			x.ghiChu.some((k) => k !== kho.loai) ||
			x.mucDoi.some((k) => k !== kho.loai),
	);
	dong(
		"AC-8",
		d.thuTu.length === soDong &&
			d.dem.length === soDong &&
			sai1.length === 0 &&
			sai2.length === 0 &&
			lechKho.length === 0,
		`DEM DONG ${nhan}`,
		`${d.thuTu.length} dong hien / ${soDong} dong API · ${d.dem.length} KR · ghi chu hien moi KR ${[...new Set(d.dem.map((x) => x.ghiChu.length))].join(",")} · muc doi hien moi KR ${[...new Set(d.dem.map((x) => x.mucDoi.length))].join(",")} · ban hien ${[...new Set(d.dem.flatMap((x) => x.ghiChu))].join(",")}${sai1.length ? ` · ghi chu sai o ${sai1.map((x) => `${x.id}=${x.ghiChu.length}`).join(",")}` : ""}${sai2.length ? ` · muc doi sai o ${sai2.map((x) => `${x.id}=${x.mucDoi.length}`).join(",")}` : ""}${lechKho.length ? ` · ban hien khong phai ${kho.loai}` : ""}`,
	);
	const dc = await t.evaluate(DOI_CHUNG_DEM);
	dong(
		"AC-8",
		dc.so === 2,
		`DOI CHUNG DEM ${nhan}`,
		`${dc.cach} thi dem ra ${dc.so} (can 2)`,
	);
	const ngoai = d.nut.filter((b) => b.phai > d.rong || b.trai < 0);
	dong(
		"AC-8",
		d.nut.length > 0 && ngoai.length === 0,
		`NUT TRONG KHUNG ${nhan}`,
		`${d.nut.length} nut Cap nhat · phai lon nhat ${Math.max(...d.nut.map((b) => b.phai), 0)} <= ${d.rong}${ngoai.length ? ` · ra ngoai ${ngoai.map((b) => `${b.kr}[${b.trai},${b.phai}]`).join(" ")}` : ""}`,
	);
	const tr = await t.evaluate(DO_TRAN, DO.khoiTran);
	dong(
		"AC-8",
		tr.truoc <= tr.rong,
		`KHONG TRAN ${nhan}`,
		`scrollWidth ${tr.truoc} <= ${tr.rong}`,
	);
	dong(
		"AC-8",
		tr.voiKhoi > tr.rong,
		`DOI CHUNG TRAN ${nhan}`,
		`khoi ${DO.khoiTran}px lam scrollWidth ${tr.voiKhoi} > ${tr.rong}`,
	);
	dong(
		"AC-8",
		d.xet > 0 && d.cat.length === 0,
		`KHONG CAT CHU ${nhan}`,
		d.cat.length
			? `cat ${d.cat.join(" · ")}`
			: `${d.xet} phan tu (ghi chu, muc doi, nhan, nut) doc tron`,
	);
	return d.thuTu;
}

async function doNgan(t, nhan, thuTu, anh, ten) {
	const [, hai, ba] = thuTu;
	const N = thuTu.length;
	const moKr = await bam(t, `[data-mo-kr='${hai}']`);
	const dau = `[data-kr-sheet='${hai}'] [data-dau-ngan-kr]`;
	const thay = await cho(t, `${dau} [data-dem-kr]`);
	await nghi(DO.cho.onDinhMs);
	anh.push(await chup(t, ten, false));
	const d = await t.evaluate((c) => {
		const el = document.querySelector(c);
		return {
			dem: el?.querySelector("[data-dem-kr]")?.textContent.trim() ?? null,
			theoBang: !!el?.querySelector("[data-thu-tu-kr='bang']"),
			truoc: !!el?.querySelector("[data-nut='kr-truoc']"),
			ke: !!el?.querySelector("[data-nut='kr-ke']"),
		};
	}, dau);
	dong(
		"AC-8",
		moKr && thay && d.dem === `2/${N}` && d.theoBang && d.truoc && d.ke,
		`DEM NGAN ${nhan}`,
		`bam ten dong hai ${hai}: dem «${d.dem ?? "-"}» (can 2/${N}) · theo thu tu bang ${d.theoBang ? "co" : "KHONG"} · nut ‹ ${d.truoc ? "co" : "KHONG"} · nut › ${d.ke ? "co" : "KHONG"}`,
	);
	const bamKe = await bam(t, `[data-kr-sheet='${hai}'] [data-nut='kr-ke']`);
	const sang = await cho(t, `[data-kr-sheet='${ba}'] [data-dem-kr]`);
	const sau = await t.evaluate(() => {
		const s = [...document.querySelectorAll("[data-kr-sheet]")];
		const cuoi = s.at(-1);
		return {
			tatCa: s.map((e) => e.getAttribute("data-kr-sheet") ?? "?"),
			kr: cuoi?.getAttribute("data-kr-sheet") ?? null,
			dem: cuoi?.querySelector("[data-dem-kr]")?.textContent.trim() ?? null,
			record: decodeURIComponent(location.search),
		};
	});
	dong(
		"AC-8",
		bamKe && sang && sau.kr === ba && sau.dem === `3/${N}`,
		`NGAN KE ${nhan}`,
		`bam › ${bamKe ? "" : "HUT "}: ngan ${sau.kr ?? "-"} dem «${sau.dem ?? "-"}» (can dong ba ${ba}, 3/${N}) · ngan trong DOM ${sau.tatCa.join(",") || "0"} · url ${sau.record}`,
	);
}

async function mot(n, kho, theme, anh) {
	const nhan = `${kho.ten}-${theme.ten}`;
	const t = await moTrang(n.ck, duongBo(n), kho, theme.toi);
	const den = await denHopTuan(t, n);
	const mo = await moConLai(t);
	const soDong = n.hop.dangBan.length + n.hop.conLai.length;
	dong(
		"AC-8",
		den.bamThe && den.url && den.so && den.dongCo && mo,
		`DUONG ${nhan}`,
		`the con Hop tuan ${den.bamThe ? "bam" : "HUT"} · xemOkr ${den.url ? "dung" : "SAI"} · hang so ${den.so ? "co" : "KHONG"} · Con lai ${mo ? "mo" : "KHONG mo"}`,
	);
	await nghi(DO.cho.onDinhMs);
	anh.push(await chup(t, `htb-bang-${nhan}`, true));
	const thuTu = await doBang(t, kho, nhan, soDong);
	if (thuTu.length >= 3) await doNgan(t, nhan, thuTu, anh, `htb-ngan-${nhan}`);
	else dong("AC-8", false, `DEM NGAN ${nhan}`, `chi ${thuTu.length} dong hien`);
	await dongTrang(t);
}

async function phanAnh(n) {
	mkdirSync(BANG_CHUNG, { recursive: true });
	const anh = [];
	for (const kho of DO.kho)
		for (const theme of DO.theme) await mot(n, kho, theme, anh);
	const co = anh.filter((a) => existsSync(a));
	dong(
		"AC-8",
		co.length === DO.soAnh,
		"DU ANH",
		`${co.length}/${DO.soAnh} anh o ${BANG_CHUNG}`,
	);
	for (const a of co) console.log(`anh: ${a}`);
}

async function demSql(n) {
	const tuan = dauTuanVN(new Date());
	const [r] = await db.$queryRaw`
		SELECT COUNT(*)::int AS m,
			COUNT(*) FILTER (WHERE EXISTS (
				SELECT 1 FROM "okrCheckIn" c
				WHERE c."keyResultId" = k.id AND c."weekStart" = ${tuan}::date
			))::int AS n
		FROM "okrKeyResult" k
		JOIN "okrObjective" o ON o.id = k."objectiveId"
		WHERE o."cycleId" = ${n.cur}
			AND o."departmentId" = ${n.pb.id}
			AND o.level = 'phong-ban'
			AND o.status = 'cong-bo'`;
	return { n: r.n, m: r.m, tuan };
}

function chenhChu(kr, tu, den) {
	const chu = (so) => so.toLocaleString("vi-VN");
	const giaTri = (so) =>
		kr.unit === "%" ? `${chu(so)}%` : `${chu(so)} ${kr.unit}`.trim();
	if (den === tu) return null;
	return `${den > tu ? "+" : "−"}${giaTri(Math.abs(den - tu))}`;
}

const GAN_THEO_DOI = () => {
	const vet = (u) => {
		const q = new URL(u, location.href).searchParams;
		return `${new URL(u, location.href).pathname}|${q.get("donOkr")}|${q.get("xemOkr")}`;
	};
	window.__htbGoc = vet(location.href);
	window.__htbDoi = [];
	const ghi = (vi, u) => {
		const v = vet(u ?? location.href);
		if (v !== window.__htbGoc) window.__htbDoi.push(`${vi} ${v}`);
	};
	for (const k of ["pushState", "replaceState"]) {
		const goc = history[k].bind(history);
		history[k] = (s, t, u) => {
			if (u !== undefined && u !== null) ghi(k, String(u));
			return goc(s, t, u);
		};
	}
	addEventListener("popstate", () => ghi("popstate"));
	new MutationObserver(() => ghi("mutation")).observe(
		document.documentElement,
		{ subtree: true, childList: true },
	);
};

async function phanGui(n, run) {
	const k = n.hop.dangBan[0];
	if (!k) {
		console.log("khong do duoc: Dang ban khong co dong nao");
		return false;
	}
	const kr = await db.okrKeyResult.findUnique({
		where: { id: k.keyResultId },
		select: {
			id: true,
			kind: true,
			unit: true,
			startValue: true,
			targetValue: true,
		},
	});
	const lan0 = await lanCua(k.keyResultId);
	const tuan = n.hop.tuan;
	if (lan0.some((l) => l.tuan === tuan)) {
		console.log(`khong do duoc: K da cap nhat tuan nay (K ${k.keyResultId})`);
		return false;
	}
	if (kr.kind === "moc") {
		console.log(`khong do duoc: K ${k.keyResultId} la KR moc`);
		return false;
	}
	const truoc = tuanTruocCua(lan0, tuan).at(-1) ?? null;
	const giaMoi = giaTriMoiCua(kr, truoc?.giaTri ?? Number(kr.startValue));
	const ghiChu = `htb ${run}`;
	const tuTin = truoc?.tuTin ?? "vua";
	const so0 = await demSql(n);
	console.log(
		`tien de: K ${k.keyResultId} «${k.tieuDe}» dong mot Dang ban · ${lan0.length} lan, chua lan nao tuan ${tuan} · lan cuoi tuan truoc ${truoc ? `${truoc.giaTri} (${truoc.tuan})` : "khong co"} · da cap nhat SQL ${so0.n}/${so0.m}`,
	);

	const kho = DO.kho[0];
	let taiLai = 0;
	const t = await moTrang(n.ck, duongHop(n), kho, false, (p) => {
		p.on("domcontentloaded", () => {
			taiLai += 1;
		});
	});
	await cho(t, "[data-hang-so-hop]:not([aria-busy]) [data-o-so]");
	await cho(
		t,
		`[data-kr-hop='${k.keyResultId}'] [data-nut='cap-nhat-dong-kr']`,
	);
	const dauDuong = new URL(t.url());
	const taiGoc = taiLai;
	await t.evaluate(GAN_THEO_DOI);
	const soTruocUi = await t.evaluate(DOC_SO);

	const nut = `[data-kr-hop='${k.keyResultId}'] [data-nut='cap-nhat-dong-kr']`;
	const bamNut = await bam(t, nut);
	const hop = `[data-kr-sheet='${k.keyResultId}'] [data-khoi-cap-nhat-kr='mo']`;
	const moHop = await t
		.waitForSelector(hop, { visible: true, timeout: DO.cho.dieuHuongMs })
		.then(() => true)
		.catch(() => false);
	const docDuong = async () => {
		const u = new URL(t.url());
		const doi = await t
			.evaluate(() => window.__htbDoi ?? null)
			.catch(() => null);
		return {
			path: u.pathname,
			don: u.searchParams.get(THAM.don),
			xem: u.searchParams.get(THAM.xem),
			doi,
			tai: taiLai - taiGoc,
		};
	};
	const roiBang = (d) =>
		d.path !== dauDuong.pathname ||
		d.don !== dauDuong.searchParams.get(THAM.don) ||
		d.xem !== dauDuong.searchParams.get(THAM.xem) ||
		d.tai > 0 ||
		d.doi === null ||
		d.doi.length > 0;
	const motDuong = (d) =>
		`duong ${d.path} donOkr ${d.don} xemOkr ${d.xem} · tai lai ${d.tai} · doi ${d.doi === null ? "mat theo doi (trang moi)" : d.doi.length ? d.doi.join(" ; ") : "0"}`;
	const sauBam = await docDuong();
	if (!moHop || roiBang(sauBam)) {
		if (roiBang(sauBam))
			dong(
				"AC-4",
				false,
				"roi bang",
				`sau khi bam nut tren dong: ${motDuong(sauBam)}`,
			);
		dong(
			"AC-4",
			false,
			"mo hop",
			`nut ${bamNut ? "da bam" : "KHONG bam duoc"} · hop cap nhat cua K ${moHop ? "mo" : "KHONG mo"}`,
		);
		await dongTrang(t);
		return true;
	}
	const ngan = await t.$$eval("[data-kr-sheet]", (e) => e.length);
	dong(
		"AC-4",
		ngan === 0,
		"mo hop",
		`bam nut tren dong K mo hop cua K · ngan KR mo ${ngan}`,
	);
	await go(t, `${hop} [data-o='gia-tri'] input`, String(giaMoi));
	await bamChu(
		t,
		`${hop} [data-o='tu-tin'] [data-slot='toggle-group-item']`,
		CHU_TU_TIN[tuTin],
	);
	await go(t, `${hop} [data-o='ghi-chu'] input`, ghiChu);
	const sanSang = await t
		.waitForFunction(
			(h) =>
				document.querySelector(`${h} [data-nut='gui-cap-nhat-kr']`)
					?.disabled === false,
			{ timeout: DO.cho.dieuHuongMs, polling: DO.cho.nhipMs },
			hop,
		)
		.then(() => true)
		.catch(() => false);
	if (!sanSang) {
		dong(
			"AC-4",
			false,
			"gui",
			"nut Gui khong bat sau khi go gia tri, tu tin, ghi chu",
		);
		await dongTrang(t);
		return true;
	}
	await bam(t, `${hop} [data-nut='gui-cap-nhat-kr']`);
	const dongHop = await choHet(t, hop, DO.cho.guiMs);
	const hienGhi = await t
		.waitForFunction(
			(id, chu) =>
				[...document.querySelectorAll(`[data-kr-hop='${id}'] [data-ghi-chu]`)]
					.filter((e) => e.checkVisibility())
					.some((e) => e.textContent.includes(chu)),
			{ timeout: DO.cho.guiMs, polling: DO.cho.nhipMs },
			k.keyResultId,
			ghiChu,
		)
		.then(() => true)
		.catch(() => false);
	await nghi(DO.cho.onDinhMs);

	const lan1 = await lanCua(k.keyResultId);
	const moiLan = lan1.filter((l) => !lan0.some((x) => x.id === l.id));
	const lanMoi = moiLan[0] ?? null;
	dong(
		"AC-4",
		lan1.length === lan0.length + 1 &&
			moiLan.length === 1 &&
			lanMoi.giaTri === giaMoi &&
			lanMoi.ghiChu === ghiChu &&
			dongHop,
		"them dung mot lan",
		`SQL n0 ${lan0.length} → n1 ${lan1.length} · lan moi gia tri ${lanMoi?.giaTri ?? "-"} (go ${giaMoi}) · ghi chu «${lanMoi?.ghiChu ?? "-"}» · hop ${dongHop ? "dong" : "CON MO"}`,
	);
	const sauGui = await docDuong();
	dong(
		"AC-4",
		!roiBang(sauGui),
		roiBang(sauGui) ? "roi bang" : "o lai bang",
		motDuong(sauGui),
	);

	const tu = truoc?.giaTri ?? null;
	const mong = tu === null ? null : chenhChu(kr, tu, giaMoi);
	const dongK = await t.evaluate((id) => {
		const hien = (e) => e.checkVisibility();
		const d = [...document.querySelectorAll(`[data-kr-hop='${id}']`)].find(
			hien,
		);
		const g = d ? [...d.querySelectorAll("[data-ghi-chu]")].find(hien) : null;
		const m = d ? [...d.querySelectorAll("[data-muc-doi]")].find(hien) : null;
		return {
			phan: d ? (d.closest("[data-con-lai]") ? "con-lai" : "dang-ban") : null,
			conLai:
				document
					.querySelector("[data-con-lai]")
					?.getAttribute("data-con-lai") ?? null,
			ghiChu: g?.firstElementChild?.textContent.trim() ?? null,
			tren: m?.children[0]?.textContent.trim() ?? null,
			duoi: m?.children[1]?.textContent.trim() ?? null,
		};
	}, k.keyResultId);
	dong(
		"AC-4",
		hienGhi && dongK.ghiChu === `«${ghiChu}»`,
		"ghi chu tren dong",
		`dong K o ${dongK.phan ?? "-"}${dongK.phan === "con-lai" ? ` (Con lai ${dongK.conLai})` : ""} · ghi chu ${dongK.ghiChu ?? "-"} (can «${ghiChu}»)`,
	);
	dong(
		"AC-4",
		mong !== null && dongK.tren === mong,
		"muc doi tren dong",
		`dong tren «${dongK.tren ?? "-"}» (can ${mong ?? "-"} = ${giaMoi} − ${tu ?? "-"} tu SQL) · dong duoi «${dongK.duoi ?? "-"}»`,
	);
	const so1 = await demSql(n);
	const soSauUi = await t
		.waitForFunction(
			(can) => {
				const o = document.querySelector(
					"[data-hang-so-hop]:not([aria-busy]) [data-o-so='da-cap-nhat']",
				);
				return o?.children[1]?.children[0]?.textContent.trim() === can;
			},
			{ timeout: DO.cho.dieuHuongMs, polling: DO.cho.nhipMs },
			`${so1.n}/${so1.m}`,
		)
		.then(() => true)
		.catch(() => false);
	const soSau = await t.evaluate(DOC_SO);
	dong(
		"AC-4",
		soSauUi &&
			so1.n === so0.n + 1 &&
			soTruocUi === `${so0.n}/${so0.m}` &&
			soSau === `${so1.n}/${so1.m}`,
		"o da cap nhat",
		`truoc «${soTruocUi ?? "-"}» = SQL ${so0.n}/${so0.m} · sau «${soSau ?? "-"}» = SQL ${so1.n}/${so1.m}`,
	);
	await dongTrang(t);
	return true;
}

const phan =
	giaTriCo("--phan") ??
	(process.argv.includes("--chieu-do") ? "gui" : undefined);
if (phan !== "anh" && phan !== "gui") {
	console.log("KHONG DO DUOC: can --phan anh hoac --phan gui");
	process.exit(2);
}
if (process.argv.includes("--chieu-do")) {
	if (phan !== "gui") {
		console.log("KHONG DO DUOC: --chieu-do chi co o --phan gui");
		process.exit(2);
	}
	const loai = giaTriCo("--chieu-do");
	process.exit(await chayChieuDo(loai?.startsWith("--") ? undefined : loai));
}

const tenKho = (() => {
	try {
		return new URL(process.env.DATABASE_URL ?? "").pathname.replace(/^\//, "");
	} catch {
		return "";
	}
})();
if (!isMeasureDatabase(tenKho))
	await khongDo(
		`KHONG DO DUOC: can mot phien do (kho _do) — kho "${tenKho}". Chay qua scripts/lan-do/tien-de.mjs`,
	);
const cayKiem = await canhCay();
if (cayKiem.ket !== "dung-cay") await khongDo(...cayKiem.dong);
console.log(`ban do: ${APP}`);

await moTrinhDuyet();

let doDuoc = true;
try {
	const n = await dungDuLieu();
	if (phan === "anh") await phanAnh(n);
	else doDuoc = await phanGui(n, Date.now().toString(36));
} catch (loi) {
	console.log(`KHONG DO DUOC: thuoc vap loi: ${loi?.stack ?? loi}`);
	await db.$disconnect();
	await ket(2);
}
await db.$disconnect();
const { dung, sai } = ketQua();
if (!doDuoc) {
	console.log(`KET LUAN htb ${phan}: KHONG DO DUOC`);
	await ket(2);
}
console.log(`KET LUAN htb ${phan}: ${dung} DUNG, ${sai} SAI`);
await ket(sai === 0 ? 0 : 1);
