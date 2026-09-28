import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { authMessages } from "../../../apps/app/lib/messages/auth.ts";
import { LANG_COOKIE } from "../../../apps/app/lib/locale/locale.ts";
import { db } from "../../../packages/db/src/client.ts";
import { PHIEN_DO } from "../../../scripts/lan-do/cau-hinh.mjs";
import {
	API,
	APP,
	CHROME,
	phien,
} from "../../cua-vao-noi-tieng-viet/rang/may-chu.mjs";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const RA = resolve(
	GOC,
	process.env.BANG_CHUNG ??
		".acceptance-runs/phien-chet-ve-dang-nhap/evidence",
);
const NGUOI = process.env.NGUOI ?? PHIEN_DO.nguoi;
const SIGN_IN = "/sign-in";
const CHO_MS = 60_000;
const CHO_CHUYEN_MS = 20_000;
const KHO_RONG = { width: 1280, height: 800 };
const KHO_HEP = { width: 375, height: 812 };
const DAU_STREAM = `NEXT_REDIRECT;replace;${SIGN_IN}`;

class KhongDo extends Error {}

const ketQua = [];

function ghi(dung, ten, giaTri) {
	ketQua.push(dung);
	console.log(dung ? `DUNG ${ten}` : `SAI ${ten} — ${giaTri}`);
}

function rutTuNguon(tep, mau, ten) {
	const khop = readFileSync(join(GOC, tep), "utf8").match(mau);
	if (!khop) throw new KhongDo(`khong rut duoc ${ten} tu ${tep}`);
	return khop[1];
}

const TIEU_DE_LANDING = rutTuNguon(
	"apps/app/app/(landing)/page.tsx",
	/title:\s*"([^"]+)"/,
	"tieu de landing",
);
const KHUON_TIEU_DE = rutTuNguon(
	"apps/app/app/layout.tsx",
	/template:\s*"([^"]+)"/,
	"khuon tieu de",
);
const TIEU_DE_DANG_NHAP = KHUON_TIEU_DE.replace(
	"%s",
	authMessages("vi").docTitle.signIn,
);

function taoPhien() {
	const cookie = phien(NGUOI);
	console.log(`cookie dat cho trinh duyet: ${cookie.name}, ${LANG_COOKIE}`);
	return cookie;
}

function dauCookie(cookie) {
	return `${cookie.name}=${cookie.value}; ${LANG_COOKIE}=vi`;
}

async function thuHoi(cookie) {
	const token = decodeURIComponent(cookie.value).split(".")[0];
	const { count } = await db.session.deleteMany({ where: { token } });
	if (count !== 1)
		throw new KhongDo(`thu hoi phien xoa ${count} hang, khong phai 1`);
}

async function trangThaiApi(cookie) {
	const r = await fetch(`${API}/api/trpc/workspace.get`, {
		headers: { cookie: dauCookie(cookie) },
	});
	return r.status;
}

async function tienDe(cookie) {
	const status = await trangThaiApi(cookie);
	if (status !== 401)
		throw new KhongDo(
			`phien chua chet — API workspace.get tra ${status} voi dung bo cookie cua trinh duyet`,
		);
}

async function layApp(cookie, duong) {
	const r = await fetch(`${APP}${duong}`, {
		headers: { cookie: dauCookie(cookie) },
		redirect: "manual",
	});
	const than = r.status === 200 ? await r.text() : "";
	const vi = r.headers.get("location");
	return {
		status: r.status,
		toi: vi ? new URL(vi, APP).pathname : null,
		than,
	};
}

async function doApi(slug) {
	const cookie = taoPhien();
	const agents = `/${slug}/agents`;

	const song = await trangThaiApi(cookie);
	ghi(song === 200, "api: workspace.get voi phien song", song);
	const truoc = await layApp(cookie, agents);
	ghi(
		truoc.toi !== SIGN_IN,
		`api: ${agents} voi phien song`,
		`${truoc.status} -> ${truoc.toi}`,
	);

	await thuHoi(cookie);
	await tienDe(cookie);
	ghi(true, "api: workspace.get voi phien thu hoi", 401);

	const sau = await layApp(cookie, agents);
	ghi(
		sau.status === 307 && sau.toi === SIGN_IN && !sau.than.includes("NEXT_REDIRECT"),
		`api: ${agents} voi phien thu hoi`,
		`${sau.status} -> ${sau.toi}`,
	);

	const goc = await layApp(cookie, "/");
	ghi(
		goc.status === 307 && goc.toi === SIGN_IN,
		"api: / voi phien thu hoi",
		`${goc.status} -> ${goc.toi}`,
	);

	const hq = await layApp(cookie, "/het-quyen");
	ghi(
		(hq.status === 307 && hq.toi === SIGN_IN) ||
			(hq.status === 200 && hq.than.includes(DAU_STREAM)),
		"api: /het-quyen voi phien thu hoi",
		`${hq.status} -> ${hq.toi ?? "(khong Location)"}`,
	);
}

async function moTrang(trinh, cookie, duong, kho, choDangNhap) {
	const trang = await trinh.newPage();
	await trang.setViewport({ ...kho, deviceScaleFactor: 1 });
	const host = new URL(APP).hostname;
	await trang.setCookie(
		{ name: cookie.name, value: cookie.value, domain: host, path: "/" },
		{ name: LANG_COOKIE, value: "vi", domain: host, path: "/" },
	);
	await trang.goto(`${APP}${duong}`, {
		waitUntil: "networkidle2",
		timeout: CHO_MS,
	});
	if (choDangNhap) {
		await trang
			.waitForFunction((d) => location.pathname === d, { timeout: CHO_CHUYEN_MS }, SIGN_IN)
			.catch(() => undefined);
		await trang
			.waitForFunction((t) => document.title === t, { timeout: CHO_CHUYEN_MS }, TIEU_DE_DANG_NHAP)
			.catch(() => undefined);
	}
	return trang;
}

async function docTrang(trang) {
	return trang.evaluate(() => ({
		duong: location.pathname,
		lang: document.documentElement.lang,
		tieuDe: document.title,
		chu: document.body.innerText,
	}));
}

async function chup(trang, ten) {
	const duong = join(RA, `${ten}.png`);
	await trang.screenshot({ path: duong, fullPage: false });
	console.log(`anh: ${relative(GOC, duong)}`);
}

async function dongThuHoi(trinh, cookie, duong, kho, ten) {
	const trang = await moTrang(trinh, cookie, duong, kho, true);
	const t = await docTrang(trang);
	await chup(trang, ten);
	await trang.close();
	const coLanding =
		t.tieuDe.includes(TIEU_DE_LANDING) || t.chu.includes(TIEU_DE_LANDING);
	const dung =
		t.duong === SIGN_IN &&
		t.lang === "vi" &&
		t.tieuDe === TIEU_DE_DANG_NHAP &&
		!coLanding;
	const moTa = coLanding
		? `hien landing cu (${TIEU_DE_LANDING})`
		: `duong ${t.duong}, lang ${t.lang}, tieu de «${t.tieuDe}»`;
	ghi(dung, `man: ${duong} ${kho.width}px voi phien thu hoi`, moTa);
}

async function doMan(slug) {
	mkdirSync(RA, { recursive: true });
	const thuHoiCookie = taoPhien();
	await thuHoi(thuHoiCookie);
	await tienDe(thuHoiCookie);

	const trinh = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
		handleSIGINT: false,
		handleSIGTERM: false,
	});
	try {
		const dong = [
			["/", "pcd-trang-goc-1280"],
			[`/${slug}/companies`, "pcd-cong-1280"],
			[`/${slug}/agents`, "pcd-agents-1280"],
			["/onboarding", "pcd-onboarding-1280"],
			["/het-quyen", "pcd-het-quyen-1280"],
		];
		for (const [duong, ten] of dong) {
			await dongThuHoi(trinh, thuHoiCookie, duong, KHO_RONG, ten);
		}
		await dongThuHoi(trinh, thuHoiCookie, "/", KHO_HEP, "pcd-trang-goc-375");

		const songCookie = taoPhien();
		const trang = await moTrang(trinh, songCookie, "/", KHO_RONG, false);
		const t = await docTrang(trang);
		await chup(trang, "pcd-song-1280");
		await trang.close();
		const coLanding =
			t.tieuDe.includes(TIEU_DE_LANDING) || t.chu.includes(TIEU_DE_LANDING);
		ghi(
			t.duong !== SIGN_IN && !coLanding,
			"man: / 1280px voi phien song",
			`duong ${t.duong}, tieu de «${t.tieuDe}»`,
		);
	} finally {
		await trinh.close();
	}
}

async function chay() {
	const cheDo = process.argv[2];
	if (cheDo !== "man" && cheDo !== "api")
		throw new KhongDo(`che do phai la man hoac api, nhan «${cheDo}»`);

	const cay = await canhCay();
	if (cay.ket !== "dung-cay") {
		for (const dong of cay.dong) console.log(dong);
		throw new KhongDo("may chu khong phuc vu cay nay");
	}

	const xuong = await db.organization.findFirst({ select: { slug: true } });
	if (!xuong) throw new KhongDo("khong co khong gian lam viec nao");

	if (cheDo === "api") await doApi(xuong.slug);
	else await doMan(xuong.slug);

	return ketQua.every(Boolean) ? 0 : 1;
}

let ma;
try {
	ma = await chay();
} catch (loi) {
	if (!(loi instanceof KhongDo)) console.error(loi);
	console.log(`KHONG DO DUOC: ${loi?.message ?? loi}`);
	ma = 2;
} finally {
	await db.$disconnect().catch(() => undefined);
}
console.log(`KET LUAN: ma ${ma}`);
process.exit(ma);
