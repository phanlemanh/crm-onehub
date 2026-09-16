import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import {
	APP,
	CHROME,
	LANG,
	phien,
	tuChoi,
} from "../../cua-vao-noi-tieng-viet/rang/may-chu.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

const KHAI = JSON.parse(readFileSync(`${HERE}/o-ghim.json`, "utf8"));
export const O_GHIM = KHAI.o;
export const TEN_NCC = KHAI.ten_nha_cung_cap;
export const CO_DAU =
	/[ăâđêôơưàáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũỳýỵỷỹâấầậẩẫăắằặẳẵêếềệểễôốồộổỗơớờợởỡưứừựửữ]/i;

export const DOC_O = (o) =>
	o.map((x) => {
		const n = document.querySelectorAll(x.chon);
		const el = x.chi < 0 ? n[n.length + x.chi] : n[x.chi];
		return { ten: x.ten, chu: el ? el.textContent.trim() : null };
	});

export const GOC = resolve(HERE, "../../..");
export const EMAIL = process.env.EMAIL_DO ?? "man-xin-quyen@localhost";
export const KHO_GOC = process.env.KHO_GOC ?? GOC;

const DOC_KHO =
	'const { authMessages } = await import("./apps/app/lib/messages/auth.ts");' +
	'const MAU = "Đất Xanh";' +
	"const phang = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [" +
	'k, v instanceof Function ? v(MAU) : v && typeof v === "object" ? phang(v) : v]));' +
	'console.log(JSON.stringify({ vi: phang(authMessages("vi")), en: phang(authMessages("en")), mau: MAU }))';

export function khoChuoiTai(goc) {
	const ra = execFileSync("bun", ["-e", DOC_KHO], { cwd: goc, encoding: "utf8" });
	return JSON.parse(ra.trim().split("\n").pop());
}

export async function chotCay() {
	const kho = khoChuoiTai(KHO_GOC);
	const moc = kho.vi.signIn.title;
	const html = await (
		await fetch(`${APP}/sign-in`, { headers: { Cookie: `${LANG}=vi` } })
	).text();
	if (!html.includes(moc)) {
		tuChoi(
			`may chu ${APP} KHONG phuc vu cay ${KHO_GOC}. Kho chuoi cua cay do noi tieu de man dang nhap la ` +
				`${JSON.stringify(moc)}, nhung trang tra ve khong chua chuoi do. ` +
				"Do mot cay khac thi moi so do deu vo nghia.",
		);
	}
	return kho;
}

export function gieo(cauHinh) {
	let ra;
	try {
		ra = execFileSync("bun", ["run", "dev:grant-needed", EMAIL, cauHinh], {
			cwd: `${GOC}/apps/api`,
			encoding: "utf8",
		});
	} catch (loi) {
		const chi = String(loi?.stderr ?? loi?.message ?? loi).trim();
		tuChoi(`lenh gieo trang thai ${cauHinh} khong chay duoc: ${chi}`);
	}
	const dong = ra.trim().split("\n").pop().trim();
	if (!dong.startsWith("grant-needed=")) {
		tuChoi(`khong gieo duoc trang thai ${cauHinh}: ${dong}`);
	}
	return dong.slice("grant-needed=".length);
}

export async function moTrinhDuyet() {
	return puppeteer.launch({
		executablePath: CHROME,
		headless: "new",
		args: ["--no-sandbox"],
	});
}

export async function moMan(browser, tieng, cookie, app = APP) {
	const page = await browser.newPage();
	await page.setCookie(
		{ name: LANG, value: tieng, url: app },
		{ name: cookie.name, value: cookie.value, url: app },
	);
	await page.goto(`${app}/grant-access`, {
		waitUntil: "networkidle0",
		timeout: 60000,
	});
	return { page, duong: new URL(page.url()).pathname };
}

async function lenhTienDe() {
	await chotCay();
	const cookie = phien(EMAIL);

	const gieoDuoc = gieo("both");
	if (gieoDuoc !== "google,microsoft") {
		tuChoi(`gieo both nhung trang thai tra ve la "${gieoDuoc}"`);
	}

	const browser = await moTrinhDuyet();
	let loi = null;
	try {
		const vao = await moMan(browser, "vi", cookie);
		if (vao.duong !== "/grant-access") {
			tuChoi(`da gieo ma /grant-access van chuyen huong ve ${vao.duong}`);
		}
		await vao.page.close();

		gieo("clear");
		const ra = await moMan(browser, "vi", cookie);
		if (ra.duong === "/grant-access") {
			loi =
				"go gieo roi ma /grant-access VAN dung — phep gieo khong phan biet duoc hai trang thai";
		} else {
			console.log(
				`DAT: gieo -> /grant-access dung; go gieo -> chuyen huong ve ${ra.duong}`,
			);
		}
		await ra.page.close();
	} finally {
		await browser.close();
		gieo("clear");
	}

	if (loi) {
		console.log(`DO: ${loi}`);
		process.exit(1);
	}
}


async function docHaiTieng(browser, cookie, doc) {
	const ra = {};
	for (const t of ["vi", "en"]) {
		const { page, duong } = await moMan(browser, t, cookie);
		if (duong !== "/grant-access") {
			await page.close();
			await browser.close();
			tuChoi(`luot ${t} bi day ve ${duong} — man khong dung ra thi moi so do deu vo nghia`);
		}
		ra[t] = await doc(page);
		await page.close();
	}
	return ra;
}

function quanHeBaVe(ten, vi, en, loi) {
	if (vi === en) loi.push(`o "${ten}": luot vi va en giong het nhau: "${vi}"`);
	if (!CO_DAU.test(vi)) loi.push(`o "${ten}": luot vi khong mang dau tieng Viet: "${vi}"`);
}

function ket(loi, dat) {
	if (loi.length) {
		for (const d of loi) console.log(`DO: ${d}`);
		process.exit(1);
	}
	console.log(`DAT: ${dat}`);
}

async function lenhNamO() {
	await chotCay();
	const cookie = phien(EMAIL);
	gieo("both");
	const browser = await moTrinhDuyet();
	const loi = [];
	try {
		const doc = await docHaiTieng(browser, cookie, (page) =>
			page.evaluate(DOC_O, O_GHIM),
		);
		const thieu = doc.vi.filter((x) => x.chu === null).map((x) => x.ten);
		if (thieu.length) tuChoi(`khong bat duoc o: ${thieu.join(" · ")}`);
		if (doc.vi.length !== O_GHIM.length) {
			tuChoi(`do duoc ${doc.vi.length} o, ban khai ghim ${O_GHIM.length}`);
		}
		const rieng = new Set(doc.vi.map((x) => x.chu));
		if (rieng.size !== O_GHIM.length) {
			loi.push(
				`hai o tra cung mot chuoi — bo chon trung: ${doc.vi.map((x) => `${x.ten}="${x.chu}"`).join(" · ")}`,
			);
		}
		for (let i = 0; i < O_GHIM.length; i++) {
			quanHeBaVe(O_GHIM[i].ten, doc.vi[i].chu, doc.en[i].chu, loi);
		}
	} finally {
		await browser.close();
		gieo("clear");
	}
	ket(loi, `${O_GHIM.length} o, moi o quan he ba ve dat`);
}

async function lenhBaNhanh() {
	const kho = await chotCay();
	const cookie = phien(EMAIL);
	const browser = await moTrinhDuyet();
	const loi = [];
	try {
		for (const [cauHinh, khoa] of [
			["google", "google"],
			["both", "both"],
		]) {
			gieo(cauHinh);
			const { page, duong } = await moMan(browser, "vi", cookie);
			if (duong !== "/grant-access") tuChoi(`nhanh ${cauHinh} bi day ve ${duong}`);
			const chu = await page.$eval("h2 + p", (e) => e.textContent.trim());
			await page.close();
			const mong = kho.vi.grantAccess[khoa];
			if (chu !== mong) {
				loi.push(`nhanh ${cauHinh}: man dung ra "${chu}" nhung khoa ${khoa} la "${mong}"`);
			}
			if (cauHinh === "google" && chu === kho.vi.grantAccess.both) {
				loi.push("nhanh google dung ra dung cau cua khoa both");
			}
		}
		for (const t of ["vi", "en"]) {
			const ba = ["google", "microsoft", "both"].map((k) => kho[t].grantAccess[k]);
			if (new Set(ba).size !== 3) {
				loi.push(`kho chuoi ${t}: ba nhanh khong khac nhau tung doi mot`);
			}
		}
		console.log("GIOI HAN DA KHAI: nhanh chi-Microsoft chi do o lop kho chuoi, chua render that");
	} finally {
		await browser.close();
		gieo("clear");
	}
	ket(loi, "hai nhanh dung that dung cau cua minh, ba nhanh khac nhau o kho chuoi");
}

async function lenhTieuDeTaiLieu() {
	await chotCay();
	const cookie = phien(EMAIL);
	gieo("both");
	const browser = await moTrinhDuyet();
	const loi = [];
	try {
		const tieu = await docHaiTieng(browser, cookie, (page) => page.title());
		quanHeBaVe("tieu de tai lieu", tieu.vi, tieu.en, loi);
	} finally {
		await browser.close();
		gieo("clear");
	}
	ket(loi, "tieu de tai lieu doi theo tieng cua nguoi doc");
}

async function lenhKhongDich() {
	await chotCay();
	const cookie = phien(EMAIL);
	gieo("both");
	const browser = await moTrinhDuyet();
	const loi = [];
	try {
		const ten = await docHaiTieng(browser, cookie, (page) =>
			page.evaluate(
				(c) => [...document.querySelectorAll(c)].map((e) => e.textContent.trim()),
				TEN_NCC.chon,
			),
		);
		if (ten.vi.length !== TEN_NCC.so_mong) {
			tuChoi(
				`bat duoc ${ten.vi.length} phan tu mang translate="no" trong than man, ban khai ghim ${TEN_NCC.so_mong}`,
			);
		}
		for (let i = 0; i < ten.vi.length; i++) {
			if (ten.vi[i] !== ten.en[i]) {
				loi.push(`ten nha cung cap thu ${i + 1} khac nhau hai luot: vi="${ten.vi[i]}" en="${ten.en[i]}"`);
			}
		}
	} finally {
		await browser.close();
		gieo("clear");
	}
	ket(loi, `${TEN_NCC.so_mong} ten nha cung cap nguyen van va mang translate="no"`);
}

const LENH = {
	"tien-de": lenhTienDe,
	"nam-o": lenhNamO,
	"ba-nhanh": lenhBaNhanh,
	"tieu-de-tai-lieu": lenhTieuDeTaiLieu,
	"khong-dich": lenhKhongDich,
};

const ten = process.argv[2];
const lenh = LENH[ten];
if (!lenh) {
	console.error(`lenh khong biet: ${ten}. Co: ${Object.keys(LENH).join(" ")}`);
	process.exit(2);
}
await lenh();
