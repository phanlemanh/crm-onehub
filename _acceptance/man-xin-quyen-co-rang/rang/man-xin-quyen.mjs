import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import {
	APP,
	CHROME,
	LANG,
	chotMayChu,
	phien,
	tuChoi,
} from "../../cua-vao-noi-tieng-viet/rang/may-chu.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

export const GOC = resolve(HERE, "../../..");
export const EMAIL = process.env.EMAIL_DO ?? "man-xin-quyen@localhost";

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
	await chotMayChu();
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

const LENH = {
	"tien-de": lenhTienDe,
};

const ten = process.argv[2];
const lenh = LENH[ten];
if (!lenh) {
	console.error(`lenh khong biet: ${ten}. Co: ${Object.keys(LENH).join(" ")}`);
	process.exit(2);
}
await lenh();
