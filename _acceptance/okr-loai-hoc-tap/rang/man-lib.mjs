import { execFileSync, spawn } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

export const HERE = dirname(fileURLToPath(import.meta.url));
export const GOC = join(HERE, "..", "..", "..");
export const HO_SO = "okr-loai-hoc-tap";
export const BANG_CHUNG =
	process.env.BANG_CHUNG ?? join(GOC, ".acceptance-runs", HO_SO, "evidence");
export const RONG = 1440;
export const HEP = 390;
export const CHO = 30_000;
export const MA = `h${Date.now().toString(36).slice(-6)}`;
export const CHI_BUOC = new Set(
	(process.env.CHI_BUOC ?? "").split(",").filter(Boolean),
);
export const chay = (n) => CHI_BUOC.size === 0 || CHI_BUOC.has(String(n));
export const cho = (ms) => new Promise((r) => setTimeout(r, ms));

const LOI_BO_QUA = /Download the React DevTools/;
const BIEN_PHIEN = [
	"DATABASE_URL",
	"APP_URL",
	"API_URL",
	"PHIEN_DO",
	"NEXT_PUBLIC_API_URL",
	"BANG_CHUNG",
];

function readlinkOr(p) {
	try {
		return execFileSync("readlink", [p], { encoding: "utf8" }).trim() || p;
	} catch {
		return p;
	}
}

export async function chieuDo(tepRang, cay) {
	console.log(`== chieu do: ${cay.nhan}`);
	const tam = mkdtempSync(join(tmpdir(), "olht-chieu-do-"));
	const sao = join(tam, "crm");
	const lenh = `bun scripts/lan-do/tien-de.mjs --chay "bun ${relative(GOC, tepRang)}"`;
	let con = null;
	const ngat = () => con?.kill("SIGINT");
	process.on("SIGINT", ngat);
	process.on("SIGTERM", ngat);
	let ket = { ma: 2, cau: "chua chay" };
	try {
		execFileSync(
			"git",
			["worktree", "add", "--detach", "--quiet", sao, "HEAD"],
			{ cwd: GOC, stdio: "inherit" },
		);
		const env = join(GOC, ".env");
		if (existsSync(env)) symlinkSync(readlinkOr(env), join(sao, ".env"));
		execFileSync("bun", ["install", "--frozen-lockfile", "--silent"], {
			cwd: sao,
			stdio: "inherit",
		});
		for (const f of readdirSync(HERE)) {
			if (!f.endsWith(".mjs")) continue;
			writeFileSync(
				join(sao, relative(GOC, HERE), f),
				readFileSync(join(HERE, f)),
			);
		}
		const tep = join(sao, cay.tep);
		const truoc = readFileSync(tep, "utf8");
		const sau = cay.cam(truoc);
		if (sau === truoc || !sau.includes(cay.dauVet)) {
			ket = { ma: 2, cau: `vet khong cam duoc vao ${cay.tep}` };
			return;
		}
		writeFileSync(tep, sau);
		const moiTruong = { ...process.env };
		for (const k of BIEN_PHIEN) delete moiTruong[k];
		moiTruong.PHIEN_DO_TEN_CAY = cay.tenCay;
		if (cay.chiBuoc) moiTruong.CHI_BUOC = cay.chiBuoc;
		let ra = "";
		const ma = await new Promise((xong) => {
			con = spawn("bash", ["-c", lenh], {
				cwd: sao,
				env: moiTruong,
				stdio: ["ignore", "pipe", "pipe"],
			});
			const ghi = (b) => {
				ra += b.toString();
				process.stdout.write(b);
			};
			con.stdout.on("data", ghi);
			con.stderr.on("data", ghi);
			con.on("error", () => xong(2));
			con.on("exit", (m) => xong(m ?? 2));
		});
		const ghim = ra.match(cay.ghim)?.[0] ?? null;
		if (ma === 2) ket = { ma: 2, cau: "ban sao thoat ma 2 (tien de thieu)" };
		else if (ma === 1 && ghim)
			ket = { ma: 0, cau: `DO DUNG GHIM: ma 1, in «${ghim}»` };
		else
			ket = {
				ma: 1,
				cau: `LOT: ma ${ma}, ${ghim ? "co ghim" : `khong thay ${cay.ghim}`}`,
			};
	} finally {
		process.off("SIGINT", ngat);
		process.off("SIGTERM", ngat);
		try {
			execFileSync("git", ["worktree", "remove", "--force", sao], {
				cwd: GOC,
				stdio: "ignore",
			});
		} catch {}
		rmSync(tam, { recursive: true, force: true });
		try {
			execFileSync("git", ["worktree", "prune"], { cwd: GOC, stdio: "ignore" });
		} catch {}
		console.log(`chieu do: ${ket.cau}`);
		process.exit(ket.ma);
	}
}

export async function moDo() {
	const { default: puppeteer } = await import("puppeteer-core");
	const { db } = await import("../../../packages/db/src/index.ts");
	const { WORKSPACE_ID } = await import(
		"../../../packages/db/src/workspace.ts"
	);
	const { canhCay } = await import(
		"../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs"
	);
	const { API, APP, CHO_TAI, CHROME, chiaCookie, khongDo, suySlug } =
		await import("../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs");

	mkdirSync(BANG_CHUNG, { recursive: true });
	const cayKiem = await canhCay();
	if (cayKiem.ket !== "dung-cay") await khongDo(...cayKiem.dong);

	const hong = [];
	const loiConsole = [];
	let trinhDuyet = null;
	let trangCuoi = null;
	let slug = "";

	const dat = (n, dung, cau) => {
		console.log(`buoc ${n}: ${dung ? "dat" : cau}`);
		if (!dung) hong.push(`buoc ${n}: ${cau}`);
		return dung;
	};

	const phienCua = (email) =>
		chiaCookie(
			execFileSync("bun", ["run", "dev:session", email], {
				cwd: join(GOC, "apps", "api"),
				encoding: "utf8",
			})
				.trim()
				.split("\n")
				.pop()
				.trim(),
		);

	async function datNguoi(email, vai, ten) {
		const n = await db.user.update({
			where: { email },
			data: { name: ten },
			select: { id: true },
		});
		await db.member.upsert({
			where: {
				organizationId_userId: { organizationId: WORKSPACE_ID, userId: n.id },
			},
			create: {
				id: `member-${n.id}`,
				organizationId: WORKSPACE_ID,
				userId: n.id,
				role: vai,
				createdAt: new Date(),
			},
			update: { role: vai },
		});
		await db.session.updateMany({
			where: { userId: n.id },
			data: { activeOrganizationId: WORKSPACE_ID },
		});
		return n.id;
	}

	async function nguoiMoi(khoa, vai, ten) {
		const email = `${khoa}${MA}@thu.test`;
		const cookie = phienCua(email);
		const id = await datNguoi(email, vai, ten);
		return { email, cookie, id, ten };
	}

	const mu = (c) => ({ Cookie: `${c.ten}=${c.gia}; lang=vi` });

	async function lam(c, duong, vao) {
		const r = await fetch(`${API}/api/trpc/${duong}`, {
			method: "POST",
			headers: { ...mu(c), "content-type": "application/json" },
			body: JSON.stringify(vao),
		});
		const t = await r.text();
		if (!r.ok) throw new Error(`${duong} tra ${r.status}: ${t.slice(0, 300)}`);
		return JSON.parse(t).result.data;
	}

	async function hoi(c, duong, vao) {
		const q =
			vao === undefined
				? ""
				: `?input=${encodeURIComponent(JSON.stringify(vao))}`;
		const r = await fetch(`${API}/api/trpc/${duong}${q}`, { headers: mu(c) });
		const t = await r.text();
		if (!r.ok) throw new Error(`${duong} tra ${r.status}: ${t.slice(0, 300)}`);
		return JSON.parse(t).result.data;
	}

	async function batTrinhDuyet(c) {
		slug = await suySlug(c);
		trinhDuyet = await puppeteer.launch({
			executablePath: CHROME,
			headless: true,
			args: ["--lang=vi-VN"],
		});
		return slug;
	}

	async function moTrang(c, rong, duong) {
		const t = await trinhDuyet.newPage();
		t.on("pageerror", (e) =>
			loiConsole.push(`${duong}: pageerror ${String(e).slice(0, 200)}`),
		);
		t.on("console", (m) => {
			if (m.type() !== "error") return;
			const s = m.text();
			if (LOI_BO_QUA.test(s)) return;
			loiConsole.push(`${duong}: console.error ${s.slice(0, 200)}`);
		});
		await t.evaluateOnNewDocument(() => {
			window.__hien = (e) =>
				e.checkVisibility() ||
				(getComputedStyle(e).display === "contents" &&
					(e.parentElement?.checkVisibility() ?? false));
			window.__tim = (s) =>
				[...document.querySelectorAll(s)].filter((e) => window.__hien(e));
			window.__theoChu = (s, chu) =>
				window
					.__tim(s)
					.filter((e) => (e.innerText ?? e.textContent ?? "").trim() === chu);
		});
		await t.setViewport({
			width: rong,
			height: rong < 500 ? 844 : 900,
			deviceScaleFactor: 1,
			isMobile: rong < 500,
			hasTouch: rong < 500,
		});
		const host = new URL(APP).hostname;
		await t.setCookie(
			{ name: c.ten, value: c.gia, domain: host, path: "/" },
			{ name: "lang", value: "vi", domain: host, path: "/" },
		);
		trangCuoi = t;
		await t.goto(`${APP}/${slug}${duong}`, {
			waitUntil: "load",
			timeout: CHO_TAI,
		});
		await t
			.waitForNetworkIdle({ idleTime: 500, timeout: CHO })
			.catch(() => null);
		await cho(1200);
		await donLopDev(t);
		return t;
	}

	async function donLopDev(t) {
		await t.evaluate(() =>
			document
				.querySelectorAll("nextjs-portal, [data-nextjs-toast]")
				.forEach((e) => {
					e.remove();
				}),
		);
	}

	async function doi(t, ham, ...doiSo) {
		try {
			await t.waitForFunction(ham, { timeout: CHO }, ...doiSo);
		} catch {
			throw new Error(
				`het ${CHO} ms cho: ${doiSo.map(String).join(" · ") || String(ham).slice(0, 120)}`,
			);
		}
	}

	async function bamSel(t, s) {
		await doi(t, (s) => window.__tim(s).length > 0, s);
		const el = await t.evaluateHandle((s) => window.__tim(s).at(-1), s);
		await el.click();
		await cho(500);
	}

	async function bamChu(t, s, chu) {
		await doi(t, (s, chu) => window.__theoChu(s, chu).length > 0, s, chu);
		const el = await t.evaluateHandle(
			(s, chu) => window.__theoChu(s, chu).at(-1),
			s,
			chu,
		);
		await el.click();
		await cho(500);
	}

	async function choDuong(t, duoi) {
		await doi(t, (duoi) => window.location.pathname.endsWith(duoi), duoi);
		await t
			.waitForNetworkIdle({ idleTime: 500, timeout: CHO })
			.catch(() => null);
		await cho(800);
		await donLopDev(t);
	}

	async function chup(t, ten) {
		await cho(300);
		await t.screenshot({ path: join(BANG_CHUNG, ten), fullPage: true });
		console.log(`  anh ${ten}`);
	}

	const cuonNgang = (t) =>
		t.evaluate(() => {
			const ra = [];
			const d = document.documentElement;
			if (d.scrollWidth > d.clientWidth + 1)
				ra.push(`trang ${d.scrollWidth}>${d.clientWidth}`);
			const k = document.querySelector('[data-slot="page-shell-scroll"]');
			if (k && k.scrollWidth > k.clientWidth + 1)
				ra.push(`khung ${k.scrollWidth}>${k.clientWidth}`);
			return ra;
		});

	async function chayBuoc(so, ham) {
		await ham().catch(async (e) => {
			await trangCuoi
				?.screenshot({
					path: join(BANG_CHUNG, `olht-loi-buoc-${so}.png`),
				})
				.catch(() => null);
			const cau = `buoc ${so}: nem ${String(e).slice(0, 300)}`;
			hong.push(cau);
			console.log(cau);
		});
	}

	async function ket(ten) {
		if (loiConsole.length > 0) {
			console.log(`loi console app: ${loiConsole.length}`);
			for (const l of loiConsole.slice(0, 10)) console.log(`  ${l}`);
			hong.push("loi console app");
		}
		const ma = hong.length === 0 ? 0 : 1;
		console.log(ma === 0 ? `${ten}: dat` : `${ten}: hong ${hong.length}`);
		await trinhDuyet?.close().catch(() => null);
		await db.$disconnect().catch(() => null);
		process.exit(ma);
	}

	async function khongDoDuoc(e) {
		console.log(`KHONG DO DUOC: ${String(e?.stack ?? e).slice(0, 600)}`);
		await trinhDuyet?.close().catch(() => null);
		await db.$disconnect().catch(() => null);
		process.exit(2);
	}

	return {
		db,
		APP,
		API,
		dat,
		nguoiMoi,
		lam,
		hoi,
		batTrinhDuyet,
		moTrang,
		doi,
		bamSel,
		bamChu,
		choDuong,
		chup,
		cuonNgang,
		chayBuoc,
		ket,
		khongDoDuoc,
		trangCuoi: () => trangCuoi,
		slug: () => slug,
	};
}

export function ngayVN(d = new Date()) {
	const s = new Date(d.getTime() + 7 * 3600_000).toISOString().slice(0, 10);
	return `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}`;
}
