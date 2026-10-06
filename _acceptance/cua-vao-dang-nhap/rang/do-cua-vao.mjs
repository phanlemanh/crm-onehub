import { mkdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { authMessages } from "../../../apps/app/lib/messages/auth.ts";
import { cuaVaoMessages } from "../../../apps/app/lib/messages/cua-vao.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import { quaCallback, rutCauHook } from "./ma-loi-that.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "cua-vao-dang-nhap", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3840";
const API = process.env.API_URL ?? "http://localhost:3841";
const BO_KHO = process.env.CVDN_BO_KHO ?? "";
const CHO_MS = 120_000;
const SO_TAB_TOI_DA = 20;
const NGUONG_THUONG = 4.5;
const NGUONG_LON = 3;
const CO_LON_PX = 24;
const CO_LON_DAM_PX = 18.66;
const DAM = 700;
const SANG_TOI_THIEU = 0.9;
const TOI_TOI_DA = 0.2;

const KHO = [
	{ ten: "320", rong: 320, cao: 640, hep: true },
	{ ten: "768", rong: 768, cao: 1024, hep: true },
	{ ten: "1024", rong: 1024, cao: 768, hep: false },
	{ ten: "1440", rong: 1440, cao: 900, hep: false },
];
const GIAO_DIEN = ["light", "dark"];
const KHO_TAB = ["1440", "320"];
const CA_HTML = [
	["invalid_code", () => "invalid_code"],
	["state_mismatch", () => "state_mismatch"],
	["script", () => "<script>alert(1)</script>"],
	["img", () => '"><img src=x onerror=alert(1)>'],
	["dai", () => "x".repeat(2000)],
	[
		"no-one-can",
		() => {
			const cau = rutCauHook().find((c) => c.ten === "chua-khai")?.cau;
			if (!cau) throw new Error("khong rut duoc cau chua-khai tu auth.ts");
			return quaCallback(cau);
		},
	],
];

const auth = authMessages("vi");
const cv = cuaVaoMessages("vi");

export const MA_TRAN = [
	...GIAO_DIEN.flatMap((g) =>
		["nen", "theo-may", "khong-shader"].map((m) => `${g}-${m}`),
	),
	...KHO.flatMap((k) =>
		GIAO_DIEN.flatMap((g) =>
			["vi-tri", "tran-ngang", "anh"].map((m) => `${k.ten}-${g}-${m}`),
		),
	),
	...KHO_TAB.flatMap((k) =>
		GIAO_DIEN.flatMap((g) =>
			["tab", "tuong-phan"].map((m) => `${k}-${g}-${m}`),
		),
	),
	"signin-options-that",
	...CA_HTML.map(([ca]) => `html-${ca}`),
];

const dong = [];
function ghi(ma, dat, chu) {
	dong.push({ ma, dat, chu });
	console.log(`${dat ? "DUNG" : "SAI"} ${chu}`);
}

async function mo(trang, duong, giaoDien, kho) {
	await trang.emulateMediaFeatures([
		{ name: "prefers-color-scheme", value: giaoDien },
	]);
	await trang.setViewport({ width: kho.rong, height: kho.cao });
	await trang.goto(`${APP}${duong}`, {
		waitUntil: "networkidle0",
		timeout: CHO_MS,
	});
	await trang.waitForSelector("[data-khoi-huong-dan] [role=listitem]", {
		timeout: CHO_MS,
	});
}

async function tuongPhan(trang) {
	return trang.evaluate(
		({ NGUONG_THUONG, NGUONG_LON, CO_LON_PX, CO_LON_DAM_PX, DAM }) => {
			const ve = document.createElement("canvas").getContext("2d", {
				willReadFrequently: true,
			});
			const rgba = (mau) => {
				ve.clearRect(0, 0, 1, 1);
				ve.fillStyle = "#000";
				ve.fillStyle = mau;
				ve.fillRect(0, 0, 1, 1);
				const [r, g, b, a] = ve.getImageData(0, 0, 1, 1).data;
				return [r, g, b, a / 255];
			};
			const nen = (el) => {
				for (let e = el; e; e = e.parentElement) {
					const c = rgba(getComputedStyle(e).backgroundColor);
					if (c[3] > 0.99) return c;
				}
				return rgba(getComputedStyle(document.body).backgroundColor);
			};
			const kenh = (v) => {
				const s = v / 255;
				return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
			};
			const sang = ([r, g, b]) =>
				0.2126 * kenh(r) + 0.7152 * kenh(g) + 0.0722 * kenh(b);
			const tiLe = (a, b) => {
				const [x, y] = [sang(a), sang(b)].sort((m, n) => n - m);
				return (x + 0.05) / (y + 0.05);
			};
			const pha = (tren, duoi) =>
				tren.slice(0, 3).map((v, i) => tren[3] * v + (1 - tren[3]) * duoi[i]);
			window.__tiLe = (a, b) => tiLe(rgba(a), rgba(b));
			const phanTu = [
				...document.querySelectorAll("[data-khoi-huong-dan] *, [role=alert] *"),
			].filter((e) =>
				[...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()),
			);
			return phanTu.map((e) => {
				const cs = getComputedStyle(e);
				const duoi = nen(e);
				const chu = pha(rgba(cs.color), duoi);
				const co = Number.parseFloat(cs.fontSize);
				const lon =
					co >= CO_LON_PX ||
					(co >= CO_LON_DAM_PX && Number(cs.fontWeight) >= DAM);
				const r = tiLe(chu, duoi);
				return {
					chu: e.textContent.trim().slice(0, 40),
					tiLe: Math.round(r * 100) / 100,
					dat: r >= (lon ? NGUONG_LON : NGUONG_THUONG),
				};
			});
		},
		{ NGUONG_THUONG, NGUONG_LON, CO_LON_PX, CO_LON_DAM_PX, DAM },
	);
}

async function doMau(trang, giaoDien) {
	const kho = KHO.find((k) => k.ten === "1440");
	await mo(trang, "/sign-in", giaoDien, kho);
	const r = await trang.evaluate(() => {
		const ve = document.createElement("canvas").getContext("2d");
		ve.fillStyle = getComputedStyle(
			document.querySelector("main") ?? document.body,
		).backgroundColor;
		ve.fillRect(0, 0, 1, 1);
		const [red, g, b] = ve.getImageData(0, 0, 1, 1).data;
		const k = (v) => {
			const s = v / 255;
			return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
		};
		const cot = document
			.querySelector("[data-khoi-huong-dan]")
			?.closest("section");
		const shader = [
			...(cot?.querySelectorAll("[aria-hidden=true]") ?? []),
		].some(
			(e) =>
				e.getAttribute("data-slot") !== "luoi-cham" &&
				(e.getAttribute("class") ?? "").includes("radial-gradient"),
		);
		return {
			sang: 0.2126 * k(red) + 0.7152 * k(g) + 0.0722 * k(b),
			nen: `rgb(${red},${g},${b})`,
			dark: document.querySelectorAll(".dark").length,
			htmlDark: document.documentElement.classList.contains("dark"),
			shader,
		};
	});
	const nenDat =
		giaoDien === "light" ? r.sang > SANG_TOI_THIEU : r.sang < TOI_TOI_DA;
	ghi(
		`${giaoDien}-nen`,
		nenDat,
		`${giaoDien}: nen main ${r.nen} do sang ${r.sang.toFixed(3)}`,
	);
	const theoMay = giaoDien === "light" ? r.dark === 0 : r.htmlDark;
	ghi(
		`${giaoDien}-theo-may`,
		theoMay,
		giaoDien === "light"
			? `light: ${r.dark} phan tu mang lop dark (can 0)`
			: `dark: html mang lop dark theo may (${r.htmlDark})`,
	);
	ghi(
		`${giaoDien}-khong-shader`,
		!r.shader,
		`${giaoDien}: cot trai sign-in ${r.shader ? "CO" : "khong co"} AuthShader`,
	);
}

async function doKho(trang, kho, giaoDien) {
	await mo(trang, "/sign-in", giaoDien, kho);
	const r = await trang.evaluate((chuDangNhap) => {
		const the = document
			.querySelector("[data-khoi-huong-dan] > div")
			?.getBoundingClientRect();
		const nut = [...document.querySelectorAll("button[type=submit]")].find(
			(b) => b.textContent?.trim() === chuDangNhap,
		);
		const form = nut?.closest("form")?.getBoundingClientRect();
		const nutR = nut?.getBoundingClientRect();
		return {
			co: Boolean(the && nutR && form),
			theTop: the?.top ?? 0,
			theRight: the?.right ?? 0,
			nutBottom: nutR?.bottom ?? 0,
			formLeft: form?.left ?? 0,
			rong: document.documentElement.scrollWidth,
			khung: window.innerWidth,
		};
	}, auth.signIn.dangNhap);
	const ma = `${kho.ten}-${giaoDien}`;
	if (!r.co) {
		ghi(
			`${ma}-vi-tri`,
			false,
			`${ma}: khong thay khoi «${cv.lanDau.tieuDe}» hoac nut «${auth.signIn.dangNhap}»`,
		);
	} else if (kho.hep) {
		ghi(
			`${ma}-vi-tri`,
			r.theTop >= r.nutBottom,
			`${ma}: khoi huong dan top ${Math.round(r.theTop)} >= nut «${auth.signIn.dangNhap}» bottom ${Math.round(r.nutBottom)}`,
		);
	} else {
		ghi(
			`${ma}-vi-tri`,
			r.theRight <= r.formLeft,
			`${ma}: khoi huong dan right ${Math.round(r.theRight)} <= khung dang nhap left ${Math.round(r.formLeft)}`,
		);
	}
	ghi(
		`${ma}-tran-ngang`,
		r.rong <= r.khung,
		`${ma}: document scrollWidth ${r.rong} <= innerWidth ${r.khung}`,
	);
	const anh = join(RA, `cvdn-${ma}.png`);
	await trang.screenshot({ path: anh, fullPage: true });
	ghi(`${ma}-anh`, true, `${ma}: anh ${relative(GOC, anh)}`);
}

async function doTab(trang, kho, giaoDien, options) {
	await mo(trang, "/sign-in?error=access_denied", giaoDien, kho);
	const can = [
		`a:${auth.shell.homepage}`,
		"button:Google",
		"input:dia-chi",
		"input:mk",
		...(options.quenMatKhau ? [`a:${auth.signIn.quenMatKhau}`] : []),
		`button:${auth.signIn.dangNhap}`,
	];
	const lucTai = await trang.evaluate(() => {
		const e = document.activeElement;
		return e?.closest("[role=alert]") ? e.tagName : "";
	});
	await trang.evaluate(() => {
		document.activeElement?.blur();
		window.scrollTo(0, 0);
	});
	const thay = [];
	let vaoKhoi = "";
	for (let i = 0; i < SO_TAB_TOI_DA; i++) {
		await trang.keyboard.press("Tab");
		const d = await trang.evaluate(() => {
			const e = document.activeElement;
			if (!e || e === document.body) return null;
			const trongKhoi = Boolean(e.closest("[data-khoi-huong-dan]"));
			const ten =
				e.tagName === "A"
					? `a:${e.getAttribute("aria-label") ?? e.textContent?.trim()}`
					: e.tagName === "INPUT"
						? `input:${e.id}`
						: `${e.tagName.toLowerCase()}:${e.textContent?.trim()}`;
			return { ten, trongKhoi };
		});
		if (!d) break;
		if (d.trongKhoi && !vaoKhoi) vaoKhoi = d.ten;
		const nutHang = ["Google", "Microsoft"].find(
			(h) => d.ten.startsWith("button:") && d.ten.includes(h),
		);
		const ten = nutHang ? `button:${nutHang}` : d.ten;
		if (thay.length > 0 && ten === thay[0]) break;
		thay.push(ten);
	}
	const ma = `${kho.ten}-${giaoDien}`;
	const khop =
		JSON.stringify(thay.slice(0, can.length)) === JSON.stringify(can) &&
		!vaoKhoi &&
		!lucTai;
	const tienDe = options.google === true;
	ghi(
		`${ma}-tab`,
		khop && tienDe,
		!tienDe
			? `${ma}: tien de AC-12 khong dung — API tra google=${options.google}, khong co nut Google de do`
			: lucTai
				? `${ma}: o loi lay tieu diem luc tai (${lucTai})`
				: vaoKhoi
					? `${ma}: tieu diem vao khoi huong dan (${vaoKhoi})`
					: `${ma}: Tab ${thay.join(" -> ")}${khop ? " (khong phan tu nao cua khoi huong dan, o loi khong lay tieu diem luc tai)" : ` (can ${can.join(" -> ")})`}`,
	);
	const tp = await tuongPhan(trang);
	const truot = tp.filter((t) => !t.dat);
	ghi(
		`${ma}-tuong-phan`,
		tp.length > 0 && truot.length === 0,
		tp.length === 0
			? `${ma}: khong do duoc doan chu nao`
			: truot.length === 0
				? `${ma}: ${tp.length} doan chu dat AA (thap nhat ${Math.min(...tp.map((t) => t.tiLe))})`
				: `${ma}: ${truot.map((t) => `«${t.chu}» ${t.tiLe}`).join("; ")}`,
	);
}

async function doiChungTuongPhan(trang) {
	await tuongPhan(trang);
	const r = await trang.evaluate(() => window.__tiLe("#777777", "#ffffff"));
	const dung = Math.abs(r - 4.48) < 0.01;
	console.log(
		`GHI CHU doi-chung tuong-phan: #777/#fff = ${r.toFixed(2)} (can 4.48, duoi ${NGUONG_THUONG})`,
	);
	if (!dung) {
		console.log("KHONG DO DUOC: ham tuong phan tinh sai tren cap doi chung");
		process.exit(2);
	}
}

async function docSignInOptions() {
	const res = await fetch(`${API}/api/trpc/sso.signInOptions`);
	if (!res.ok) throw new Error(`signInOptions ${res.status}`);
	const than = await res.json();
	const data = than?.result?.data;
	return data?.json ?? data;
}

async function doSignInOptions(trang, options) {
	await mo(
		trang,
		"/sign-in",
		"light",
		KHO.find((k) => k.ten === "1440"),
	);
	const r = await trang.evaluate(() => ({
		nut: [...document.querySelectorAll("button[type=button]")].map(
			(b) => b.textContent?.trim() ?? "",
		),
		buoc: [
			...document.querySelectorAll(
				"[data-khoi-huong-dan] [data-slot=stepper-title]",
			),
		].map((t) => t.textContent ?? ""),
	}));
	const tenNut = [];
	if (options.google) tenNut.push("Google");
	if (options.microsoft) tenNut.push("Microsoft");
	for (const p of options.providers ?? []) tenNut.push(p.name);
	const tenHien = tenNut.filter((t) => r.nut.some((n) => n.includes(t)));
	const can =
		tenHien.length > 0 ? cv.buoc.nutNgoai.tieuDe(tenHien.join(", ")) : null;
	const dat = can
		? r.buoc[1] === can
		: !r.buoc.some((b) =>
				b.startsWith(cv.buoc.nutNgoai.tieuDe("").split(",")[0]),
			);
	ghi(
		"signin-options-that",
		dat,
		`signInOptions that: google=${options.google} microsoft=${options.microsoft} sso=${(options.providers ?? []).length} quenMatKhau=${options.quenMatKhau} -> buoc 2 «${r.buoc[1] ?? "-"}» voi nut {${tenHien.join(", ")}}`,
	);
}

function thoatHtml(g) {
	return g
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#x27;");
}

async function doHtml() {
	for (const [ca, lay] of CA_HTML) {
		const giaTri = lay();
		const res = await fetch(
			`${APP}/sign-in?${new URLSearchParams({ error: giaTri })}`,
			{
				headers: { "accept-language": "vi" },
				redirect: "manual",
			},
		);
		const html = await res.text();
		const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
			.map((m) => m[1])
			.join("\n");
		const ngoai = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
		const dang = [
			ngoai.includes(giaTri) ? "tho" : null,
			ngoai.includes(thoatHtml(giaTri)) ? "thoat HTML" : null,
			ngoai.includes(encodeURIComponent(giaTri)) ? "ma hoa URL" : null,
		].filter(Boolean);
		const theTho =
			giaTri.includes("<") &&
			(script.includes("<script>alert") || script.includes("<img src=x"));
		const coOLoi = html.includes(cv.loi.chung.tieuDe);
		const dat = res.status === 200 && coOLoi && dang.length === 0 && !theTho;
		ghi(
			`html-${ca}`,
			dat,
			dat
				? `html-${ca}: ngoai script khong chua gia tri; trong script khong the tho; co cau chung`
				: `html-${ca}: status ${res.status}, cau chung ${coOLoi}, ngoai script chua (${dang.join(", ") || "-"}), the tho trong script ${theTho}`,
		);
	}
}

async function main() {
	await canhCay();
	mkdirSync(RA, { recursive: true });
	const trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	try {
		const ctx = await trinhDuyet.createBrowserContext();
		const trang = await ctx.newPage();
		await trang.setExtraHTTPHeaders({ "accept-language": "vi" });

		const options = await docSignInOptions();
		for (const g of GIAO_DIEN) await doMau(trang, g);
		await doiChungTuongPhan(trang);
		for (const k of KHO) {
			if (BO_KHO && k.ten === BO_KHO) continue;
			for (const g of GIAO_DIEN) await doKho(trang, k, g);
		}
		for (const k of KHO.filter((x) => KHO_TAB.includes(x.ten))) {
			if (BO_KHO && k.ten === BO_KHO) continue;
			for (const g of GIAO_DIEN) await doTab(trang, k, g, options);
		}
		await doSignInOptions(trang, options);
		await doHtml();

		await trang.setViewport({ width: 1440, height: 900 });
		await trang.emulateMediaFeatures([
			{ name: "prefers-color-scheme", value: "light" },
		]);
		await trang.goto(`${APP}/dat-mat-khau/khong-hop-le`, {
			waitUntil: "networkidle0",
			timeout: CHO_MS,
		});
		const shell = join(RA, "cvdn-shell-1440-light.png");
		await trang.screenshot({ path: shell, fullPage: true });
		console.log(`GHI CHU anh bon trang kia: ${relative(GOC, shell)}`);
	} finally {
		await trinhDuyet.close();
	}

	const thay = new Set(dong.map((d) => d.ma));
	for (const ma of MA_TRAN) {
		if (!thay.has(ma)) ghi(ma, false, `thieu ${ma}`);
	}
	const sai = dong.filter((d) => !d.dat).length;
	const ma = sai === 0 ? 0 : 1;
	console.log(
		`KET LUAN ${dong.length - sai} DUNG, ${sai} SAI — ma thoat ${ma}`,
	);
	process.exit(ma);
}

main().catch((loi) => {
	console.log(`KHONG DO DUOC: ${loi.message}`);
	process.exit(2);
});
