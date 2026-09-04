import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
export const APP = process.env.APP_URL ?? "http://localhost:3300";
export const API = process.env.API_URL ?? "http://localhost:3301";
export const CHROME =
	process.env.CHROME ??
	"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

export const LANG = "lang";

function tuChoi(vi) {
	console.log(`KHONG DO DUOC: ${vi}`);
	process.exit(2);
}

async function song(url, giay) {
	const han = Date.now() + giay * 1000;
	while (Date.now() < han) {
		try {
			const r = await fetch(url, { redirect: "manual" });
			if (r.status > 0) return true;
		} catch {}
		await new Promise((r) => setTimeout(r, 500));
	}
	return false;
}

export async function khoChuoi() {
	const ra = execFileSync(
		"bun",
		[
			"-e",
			'const { authMessages } = await import("./apps/app/lib/messages/auth.ts");' +
				'const MAU = "Đất Xanh";' +
				'const phang = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [' +
				'k, v instanceof Function ? v(MAU) : v && typeof v === "object" ? phang(v) : v]));' +
				'console.log(JSON.stringify({ vi: phang(authMessages("vi")), en: phang(authMessages("en")), mau: MAU }))',
		],
		{ cwd: GOC, encoding: "utf8" },
	);
	return JSON.parse(ra.trim().split("\n").pop());
}

export async function chotMayChu() {
	const giay = Number(process.env.CHO_MAY_CHU ?? 20);

	if (!(await song(`${APP}/sign-in`, giay)))
		tuChoi(`may chu ung dung ${APP} khong tra loi sau ${giay} giay`);
	if (!(await song(`${API}/api/trpc/sso.signInOptions`, giay)))
		tuChoi(`may chu API ${API} khong tra loi sau ${giay} giay`);

	const kho = await khoChuoi();
	const moc = kho.vi.signIn.title;
	const html = await (
		await fetch(`${APP}/sign-in`, { headers: { Cookie: `${LANG}=vi` } })
	).text();

	if (!html.includes(moc))
		tuChoi(
			`may chu ${APP} KHONG phuc vu cay nay. Kho chuoi tren dia noi tieu de man dang nhap la ` +
				`${JSON.stringify(moc)}, nhung trang tra ve khong chua chuoi do. ` +
				"Do mot cay khac thi moi so do deu vo nghia.",
		);

	return kho;
}

export function phien(email = "manh.phan@onemount.com") {
	const raw = execFileSync("bun", ["run", "dev:session", email], {
		cwd: `${GOC}/apps/api`,
		encoding: "utf8",
	});
	const dong = raw.trim().split("\n").pop().trim();
	const eq = dong.indexOf("=");
	if (eq < 0) tuChoi(`khong tao duoc phien cho ${email}: ${dong}`);
	return { name: dong.slice(0, eq), value: dong.slice(eq + 1) };
}

export { tuChoi };
