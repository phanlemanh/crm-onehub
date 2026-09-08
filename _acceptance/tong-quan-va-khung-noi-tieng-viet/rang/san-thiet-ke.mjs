import { execFileSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readdirSync,
	writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import {
	APP,
	CAO,
	CHROME,
	HEP,
	phien,
	RONG,
	suySlug,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import { giuViet } from "../../man-cai-dat-noi-tieng-viet/rang/khoa-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "../../..");
const EV = resolve(HERE, "../evidence");
const JSDOM = `${GOC}/node_modules`;
const CHO_LANG = Number(process.env.CHO_LANG ?? 2500);
const CHO_BAM = 700;
// Chieu do cua chan tuong phan: cam mau chu gan den len tieu de (nen la den),
// roi doi chinh chan nay bao DUOI NGUONG. Khong cam duoc mau ma van xanh nghia
// la chan mu — mot thuoc chua tung do khong phan biet duoc "dat" voi "khong do".
const CHIEU_DO = process.argv.includes("--chieu-do");

// San thiet ke song trong plugin acceptance-gate. Ba nguon, theo thu tu:
// bien SAN_THIET_KE (khai tay) → CLAUDE_PLUGIN_ROOT (harness dat) → tu quet
// cache plugin. Vong chấm 2 chan o day vi phien cham KHONG co bien nao trong
// hai bien tren; mot phep do chi chay duoc khi harness nho dat bien la mot phep
// do biet truoc se co luc khong chay.
function timSan() {
	if (process.env.SAN_THIET_KE) return process.env.SAN_THIET_KE;
	const tuBien = process.env.CLAUDE_PLUGIN_ROOT
		? `${process.env.CLAUDE_PLUGIN_ROOT}/scripts/design-gate.mjs`
		: null;
	if (tuBien && existsSync(tuBien)) return tuBien;
	// Cache sap theo CHU thi 1.9.2 dung sau 1.20.1 — so theo SO tung doan.
	const soSanh = (a, b) => {
		const x = a.split(".").map(Number);
		const y = b.split(".").map(Number);
		for (let i = 0; i < 3; i += 1)
			if ((x[i] ?? 0) !== (y[i] ?? 0)) return (y[i] ?? 0) - (x[i] ?? 0);
		return 0;
	};
	const nha = `${process.env.HOME}/.claude/plugins/cache`;
	if (!existsSync(nha)) return tuBien ?? "";
	const ban = [];
	for (const cho of readdirSync(nha)) {
		const thuMuc = `${nha}/${cho}/acceptance-gate`;
		if (!existsSync(thuMuc)) continue;
		for (const v of readdirSync(thuMuc))
			if (/^\d+\.\d+\.\d+$/.test(v) && existsSync(`${thuMuc}/${v}/scripts/design-gate.mjs`))
				ban.push({ v, duong: `${thuMuc}/${v}/scripts/design-gate.mjs` });
	}
	ban.sort((a, b) => soSanh(a.v, b.v));
	return ban[0]?.duong ?? tuBien ?? "";
}

const SAN = timSan();

const KHUNG = (await import(`${GOC}/apps/app/lib/messages/khung-ung-dung.ts`))
	.khungUngDungMessages;

const KHUNG_HINH = [
	{ ten: "E18-tong-quan-vi", tieng: "vi", rong: RONG, nganKeo: false },
	{ ten: "E18-tong-quan-en", tieng: "en", rong: RONG, nganKeo: false },
	{ ten: "E18-ngan-keo-vi", tieng: "vi", rong: HEP, nganKeo: true },
];

// Sàn thiết kế chạy trên jsdom, và jsdom KHÔNG tải được stylesheet trỏ đường
// gốc-tương-đối (`/_next/…`) từ một file trên đĩa: nó rơi về "nền trắng" rồi
// báo tương phản thấp cho chữ sáng trên nền tối. Nội tuyến mọi quy tắc CSS vào
// chính trang trước khi lưu là cách cho sàn đo màu THẬT thay vì màu giả định.
const NOI_TUYEN_CSS = () => {
	const quyTac = [];
	for (const to of document.styleSheets) {
		try {
			for (const r of to.cssRules) quyTac.push(r.cssText);
		} catch {
			quyTac.push(`/* khong doc duoc: ${to.href ?? "(inline)"} */`);
		}
	}
	for (const l of document.querySelectorAll('link[rel="stylesheet"]'))
		l.remove();
	const the = document.createElement("style");
	the.setAttribute("data-noi-tuyen", "san-thiet-ke");
	the.textContent = quyTac.join("\n");
	document.head.append(the);
	return quyTac.length;
};

function chotSan() {
	if (!existsSync(SAN)) {
		console.log(
			`KHONG DO DUOC: khong tim duoc san thiet ke (da thu SAN_THIET_KE, CLAUDE_PLUGIN_ROOT, va quet cache plugin theo semver). Duong da thu: ${JSON.stringify(SAN)}.`,
		);
		process.exit(2);
	}
	if (!existsSync(`${JSDOM}/jsdom/package.json`)) {
		console.log(
			`KHONG DO DUOC: khong thay jsdom tai ${JSDOM}/jsdom — san chay che do dom can no. Chay bun install o goc kho.`,
		);
		process.exit(2);
	}
}

async function chup(trinhDuyet, cookie, slug, k) {
	const trang = await trinhDuyet.newPage();
	await trang.setViewport({ width: k.rong, height: CAO, deviceScaleFactor: 1 });
	await trang.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
	await trinhDuyet.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: "localhost", path: "/" },
		{ name: "lang", value: k.tieng, domain: "localhost", path: "/" },
	);
	const res = await trang.goto(`${APP}/${slug}`, {
		waitUntil: "networkidle0",
		timeout: 120000,
	});
	if ((res?.status() ?? 0) !== 200) {
		await trang.close();
		return { loi: `${APP}/${slug} tra ${res?.status()}` };
	}
	await new Promise((r) => setTimeout(r, CHO_LANG));

	let moNganKeo = false;
	if (k.nganKeo) {
		await trang
			.click(`button[aria-label="${KHUNG(k.tieng).nav.open}"]`)
			.catch(() => {});
		await new Promise((r) => setTimeout(r, CHO_BAM));
		moNganKeo = (await trang.$('[data-slot="sheet-content"]')) !== null;
		if (!moNganKeo) {
			await trang.close();
			return { loi: "khong mo duoc ngan keo di dong" };
		}
	}

	if (CHIEU_DO) {
		await trang.evaluate(() => {
			const the = document.createElement("style");
			the.textContent =
				'[data-slot="page-shell-title"], h1 { color: rgb(20, 20, 20) !important; }';
			document.head.append(the);
		});
		await new Promise((r) => setTimeout(r, 200));
	}
	const viPham = await trang.evaluate(DO_TUONG_PHAN);
	const soChu = await trang.evaluate(
		() =>
			[...document.body.querySelectorAll("*")].filter((el) =>
				[...el.childNodes].some(
					(n) => n.nodeType === 3 && (n.nodeValue ?? "").trim() !== "",
				),
			).length,
	);
	const soQuyTac = await trang.evaluate(NOI_TUYEN_CSS);
	mkdirSync(EV, { recursive: true });
	await trang.screenshot({ path: `${EV}/${k.ten}.png`, fullPage: false });
	writeFileSync(`${EV}/${k.ten}.html`, await trang.content());
	await trang.close();
	return { soQuyTac, moNganKeo, viPham, soChu };
}

// jsdom KHONG giai duoc oklch() va var() cua he token, nen no doc moi mau ve
// #ffffff roi bao "trang tren trang" — do 08/09 tren ca ba khung hinh. Chan
// tuong phan that chay trong TRINH DUYET, noi mau duoc tinh xong; luat P0
// low-contrast cua san bi thay bang phep do nay, moi luat khac cua san giu nguyen.
const DO_TUONG_PHAN = () => {
	const soRGB = (c) => {
		const m = c.match(/[\d.]+/g);
		return m ? m.slice(0, 3).map(Number) : null;
	};
	const sang = (rgb) => {
		const [r, g, b] = rgb.map((v) => {
			const x = v / 255;
			return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
		});
		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	};
	const ty = (a, b) => {
		const [x, y] = [sang(a), sang(b)].sort((p, q) => q - p);
		return (x + 0.05) / (y + 0.05);
	};
	// rgb(0, 0, 0) va rgba(0, 0, 0, 0) chi khac nhau o SO thanh phan — doc kenh
	// cuoi cua rgb() thanh alpha la cach bo qua nen den that (do 08/09).
	const trongSuot = (c) => {
		const m = c.match(/[\d.]+/g);
		return m !== null && m.length >= 4 && Number(m[3]) === 0;
	};
	const nen = (el) => {
		for (let e = el; e; e = e.parentElement) {
			const c = getComputedStyle(e).backgroundColor;
			const v = soRGB(c);
			if (v && !trongSuot(c)) return v;
		}
		const b = soRGB(getComputedStyle(document.body).backgroundColor);
		return b && !trongSuot(getComputedStyle(document.body).backgroundColor)
			? b
			: [255, 255, 255];
	};
	const ra = [];
	for (const el of document.body.querySelectorAll("*")) {
		const chu = [...el.childNodes]
			.filter((n) => n.nodeType === 3 && (n.nodeValue ?? "").trim() !== "")
			.map((n) => n.nodeValue.trim())
			.join(" ");
		if (chu === "") continue;
		const r = el.getBoundingClientRect();
		if (r.width <= 1 || r.height <= 1) continue;
		const st = getComputedStyle(el);
		if (st.visibility === "hidden" || st.display === "none" || st.opacity === "0")
			continue;
		const mau = soRGB(st.color);
		if (!mau) continue;
		const co = Number.parseFloat(st.fontSize);
		const dam = Number.parseInt(st.fontWeight, 10) >= 700;
		const to = co >= 24 || (co >= 18.66 && dam);
		const nguong = to ? 3 : 4.5;
		const t = ty(mau, nen(el));
		if (t < nguong)
			ra.push({
				chu: chu.slice(0, 60),
				ty: Number(t.toFixed(2)),
				nguong,
				co,
				mau: st.color,
				nen: `rgb(${nen(el).join(", ")})`,
			});
	}
	return ra;
};

function chamSan(ten) {
	try {
		const ra = execFileSync(
			"node",
			[SAN, `${EV}/${ten}.html`, "--jsdom", JSDOM],
			{ cwd: GOC, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
		);
		return { ma: 0, ra };
	} catch (e) {
		return { ma: e.status ?? 1, ra: `${e.stdout ?? ""}${e.stderr ?? ""}` };
	}
}

chotSan();
await giuViet();

const cookie = phien();
const slug = await suySlug(cookie);
const trinhDuyet = await puppeteer.launch({
	executablePath: CHROME,
	headless: "new",
	args: ["--no-sandbox", `--window-size=${RONG},${CAO}`],
});

const do_ = [];
let daCham = 0;
try {
	console.log(`-- workspace "${slug}" · san ${SAN} · jsdom ${JSDOM}`);
	for (const k of KHUNG_HINH) {
		const c = await chup(trinhDuyet, cookie, slug, k);
		if (c.loi !== undefined) {
			console.log(`KHONG DO DUOC: ${k.ten} — ${c.loi}`);
			await trinhDuyet.close();
			process.exit(2);
		}
		console.log(
			`-- ${k.ten}: ${k.rong}px · lang=${k.tieng}${k.nganKeo ? " · ngan keo MO" : ""} · noi tuyen ${c.soQuyTac} quy tac CSS`,
		);
		const s = chamSan(k.ten);
		daCham += 1;
		let bao = null;
		try {
			bao = JSON.parse(s.ra);
		} catch {
			console.log(`KHONG DO DUOC: ${k.ten} — san khong tra JSON doc duoc (ma ${s.ma}).`);
			await trinhDuyet.close();
			process.exit(2);
		}
		const p0 = (bao.findings ?? []).filter((f) => f.pTier === "P0");
		const p0Khac = p0.filter((f) => f.rule !== "low-contrast");
		console.log(
			`   san thiet ke: ma ${s.ma} · P0 tong ${p0.length} (low-contrast ${p0.length - p0Khac.length} — jsdom mu voi oklch/var, thay bang chan trinh duyet) · P0 khac ${p0Khac.length}`,
		);
		for (const f of p0Khac) console.log(`      P0 ${f.rule}: ${f.detail}`);
		if (p0Khac.length > 0) do_.push(`${k.ten}: ${p0Khac.length} P0 khong phai tuong phan`);
		console.log(
			`   tuong phan do trong trinh duyet: ${c.viPham.length} cho duoi nguong tren ${c.soChu} phan tu mang chu`,
		);
		for (const v of c.viPham.slice(0, 6))
			console.log(
				`      DUOI NGUONG ${v.ty}:1 (can ${v.nguong}) — ${JSON.stringify(v.chu)} · ${v.mau} tren ${v.nen}`,
			);
		if (c.viPham.length > 0) do_.push(`${k.ten}: ${c.viPham.length} cho tuong phan duoi nguong (do that)`);
		if (c.soChu === 0) {
			console.log(`KHONG DO DUOC: ${k.ten} — 0 phan tu mang chu de do tuong phan.`);
			await trinhDuyet.close();
			process.exit(2);
		}
	}
} finally {
	await trinhDuyet.close();
}

console.log(
	`\nket qua: cham ${daCham}/${KHUNG_HINH.length} khung hinh · ${do_.length} khung khong dat`,
);
for (const d of do_) console.log(`DO: ${d}`);
if (daCham === 0) {
	console.log("KHONG DO DUOC: 0 khung hinh duoc cham.");
	process.exit(2);
}
if (CHIEU_DO) {
	const batDuoc = do_.filter((d) => d.includes("tuong phan duoi nguong")).length;
	console.log(
		`\nCHIEU DO: cam mau chu gan den len tieu de o ca ${KHUNG_HINH.length} khung — chan bao duoi nguong o ${batDuoc} khung.`,
	);
	if (batDuoc === 0) {
		console.log(
			"DO: chan tuong phan KHONG do khi mau chu bi pha — thuoc dang mu.",
		);
		process.exit(1);
	}
	console.log("XANH: chan tuong phan do dung chieu no sinh ra de bat.");
	process.exit(0);
}
process.exit(do_.length > 0 ? 1 : 0);
