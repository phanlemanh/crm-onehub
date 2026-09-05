import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { GOC, lat } from "./lat.mjs";

export const HERE = dirname(fileURLToPath(import.meta.url));
export const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
export const APP = process.env.APP_URL ?? "http://localhost:3000";
export const API = process.env.API_URL ?? "http://localhost:3001";
export const CHO_TAI = Number(process.env.CHO_TAI ?? 120000);
export const CHO_LANG = Number(process.env.CHO_LANG ?? 2500);
export const RONG = Number(process.env.BE_RONG ?? 1440);
export const HEP = Number(process.env.BE_RONG_HEP ?? 360);
export const CAO = Number(process.env.CAO ?? 1000);
export const NGUOI = process.env.NGUOI ?? "manh.phan@onemount.com";
export const BANG = `${HERE}/khong-dich-cua-lat.json`;
export const MAN = ["/settings", "/settings/currencies"];
export const LUAT_CO = new Set([
	"so-thuan",
	"du-lieu-nguoi-nhap",
	"ma-va-ten-dong-tien",
	"ten-model",
	"gia-tri-bi-che",
]);
export const CHI_SO = /^[\d\s.,:;%–\-—/()+=?…·|≈~≥≤<>]*$/;
export const DAU_VIET =
	/[ăâđêôơưĂÂĐÊÔƠƯáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵÁÀẢÃẠẮẰẲẴẶẤẦẨẪẬÉÈẺẼẸẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌỐỒỔỖỘỚỜỞỠỢÚÙỦŨỤỨỪỬỮỰÝỲỶỸỴ]/;
export const CHE = /^[•●○*·\s]{3,}/;

let trinhDuyet = null;

export function datTrinhDuyet(t) {
	trinhDuyet = t;
}

export async function ket(ma) {
	if (trinhDuyet !== null) await trinhDuyet.close().catch(() => {});
	process.exit(ma);
}

export async function khongDo(...dong) {
	for (const d of dong) console.log(d);
	await ket(2);
}

export function phien() {
	if (process.env.PHIEN) return chiaCookie(process.env.PHIEN.trim());
	const ra = execFileSync("bun", ["run", "dev:session", NGUOI], {
		cwd: `${GOC}/apps/api`,
		encoding: "utf8",
	});
	return chiaCookie(ra.trim().split("\n").pop().trim());
}

export function chiaCookie(dong) {
	const dau = dong.indexOf("=");
	if (dau < 1) {
		console.log(
			"KHONG DO DUOC: tien de thieu — khong doc duoc cookie phien tu `bun run dev:session`.",
		);
		process.exit(2);
	}
	return { ten: dong.slice(0, dau), gia: dong.slice(dau + 1) };
}

export function mu(cookie, tieng) {
	return {
		Cookie: `${cookie.ten}=${cookie.gia}${tieng ? `; lang=${tieng}` : ""}`,
	};
}

export async function goiApi(cookie, duong, vao) {
	const url = `${API}/api/trpc/${duong}?input=${encodeURIComponent(
		JSON.stringify({ json: vao }),
	)}`;
	const res = await fetch(url, { redirect: "manual", headers: mu(cookie) });
	if (res.status >= 300 && res.status < 400) {
		await khongDo(
			`KHONG DO DUOC: tien de thieu — ${duong} tra ${res.status} va doi chuyen huong. Phien dang nhap khong con hieu luc.`,
		);
	}
	if (!res.ok) {
		await khongDo(
			`KHONG DO DUOC: tien de thieu — ${duong} tra ${res.status}, may chu api khong phuc vu duoc.`,
		);
	}
	return (await res.json()).result.data;
}

export async function suySlug(cookie) {
	if (process.env.SLUG) return process.env.SLUG;
	const res = await fetch(`${APP}/`, {
		redirect: "manual",
		headers: mu(cookie, "vi"),
	});
	const dich = res.headers.get("location");
	if (!dich) {
		await khongDo(
			`KHONG DO DUOC: tien de thieu — ${APP}/ tra ${res.status} ma khong co Location, khong suy duoc slug.`,
		);
	}
	const dau = new URL(dich, APP).pathname
		.replace(/^\/+|\/+$/g, "")
		.split("/")[0];
	if (!dau || dau === "sign-in") {
		await khongDo(
			`KHONG DO DUOC: tien de thieu — ${APP}/ chi tro ve "${dich}". Phien dang nhap khong hop le.`,
		);
	}
	return dau;
}

export async function canhCong(cookie, slug) {
	for (const man of MAN) {
		for (const tieng of ["vi", "en"]) {
			const duong = `/${slug}${man}`;
			const res = await fetch(`${APP}${duong}`, {
				redirect: "manual",
				headers: mu(cookie, tieng),
			});
			if (res.status >= 300 && res.status < 400) {
				await khongDo(
					`KHONG DO DUOC: tien de thieu — ${duong} (lang=${tieng}) tra ${res.status} va doi di ${res.headers.get("location")}.`,
					"   Chan nay KHONG di theo lenh chuyen huong: vong truoc da do nham man vi di theo no.",
				);
			}
			if (res.status !== 200) {
				await khongDo(
					`KHONG DO DUOC: tien de thieu — ${duong} (lang=${tieng}) tra ${res.status}, khong phai 200.`,
				);
			}
		}
	}
}

export const GOM = () => {
	const goc = (
		document.querySelector('[data-slot="page-shell-scroll"]') ??
		document.querySelector("main")
	)?.parentElement;
	if (!goc) return null;
	const nhinThay = (el) => {
		const r = el.getBoundingClientRect();
		if (r.width === 0 || r.height === 0) return false;
		const s = getComputedStyle(el);
		return (
			s.visibility !== "hidden" && s.display !== "none" && s.opacity !== "0"
		);
	};
	const duong = (el) => {
		const p = [];
		let e = el;
		while (e && e !== goc && e.parentElement) {
			p.push(
				`${e.tagName.toLowerCase()}:${[...e.parentElement.children].indexOf(e)}`,
			);
			e = e.parentElement;
		}
		return p.reverse().join("/");
	};
	const ra = [];
	const di = document.createTreeWalker(goc, NodeFilter.SHOW_TEXT);
	for (let n = di.nextNode(); n; n = di.nextNode()) {
		const el = n.parentElement;
		if (!el) continue;
		if (el.closest("script,style,noscript,template")) continue;
		if (!nhinThay(el)) continue;
		const t = (n.nodeValue ?? "").replace(/\s+/g, " ").trim();
		if (t === "") continue;
		ra.push({
			khoa: `${duong(el)}#${[...el.childNodes].indexOf(n)}`,
			chu: t,
			khongDich: Boolean(el.closest('[translate="no"]')),
		});
	}
	for (const el of goc.querySelectorAll("input,textarea")) {
		if (!nhinThay(el)) continue;
		const v = (el.value ?? "").replace(/\s+/g, " ").trim();
		if (v === "") continue;
		ra.push({
			khoa: `${duong(el)}@value`,
			chu: v,
			khongDich: Boolean(el.closest('[translate="no"]')),
		});
	}
	for (const el of goc.querySelectorAll("*")) {
		if (!nhinThay(el)) continue;
		for (const a of ["placeholder", "title", "aria-label", "alt"]) {
			const v = el.getAttribute(a);
			if (v === null || v.trim() === "") continue;
			ra.push({
				khoa: `${duong(el)}@${a}`,
				chu: v.replace(/\s+/g, " ").trim(),
				khongDich: Boolean(el.closest('[translate="no"]')),
			});
		}
	}
	return ra;
};

export const DO_RONG = () => {
	const goc = (
		document.querySelector('[data-slot="page-shell-scroll"]') ??
		document.querySelector("main")
	)?.parentElement;
	if (!goc) return null;
	const nhinThay = (el) => {
		for (let a = el; a && a !== goc; a = a.parentElement) {
			const ra = a.getBoundingClientRect();
			if (ra.width <= 1 || ra.height <= 1) return false;
		}
		const s = getComputedStyle(el);
		return (
			s.visibility !== "hidden" && s.display !== "none" && s.opacity !== "0"
		);
	};
	const duong = (el) => {
		const p = [];
		let e = el;
		while (e && e !== goc && e.parentElement) {
			p.push(
				`${e.tagName.toLowerCase()}:${[...e.parentElement.children].indexOf(e)}`,
			);
			e = e.parentElement;
		}
		return p.reverse().join("/");
	};
	const ra = [];
	for (const el of goc.querySelectorAll("*")) {
		if (el.closest("script,style,noscript,template")) continue;
		if (!nhinThay(el)) continue;
		const rieng = [...el.childNodes]
			.filter((n) => n.nodeType === 3)
			.map((n) => (n.nodeValue ?? "").replace(/\s+/g, " ").trim())
			.filter((t) => t !== "")
			.join(" ");
		if (rieng === "") continue;
		ra.push({
			khoa: duong(el),
			chu: rieng,
			day: el.textContent.replace(/\s+/g, " ").trim(),
			scrollWidth: el.scrollWidth,
			clientWidth: el.clientWidth,
			scrollHeight: el.scrollHeight,
			clientHeight: el.clientHeight,
		});
	}
	return ra;
};

export async function moManMem(cookie, slug, man, tieng, rong, sau) {
	const trang = await trinhDuyet.newPage();
	await trang.setViewport({ width: rong, height: CAO, deviceScaleFactor: 1 });
	await trang.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
	await trinhDuyet.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: "localhost", path: "/" },
		{ name: "lang", value: tieng, domain: "localhost", path: "/" },
	);
	const doi = `/${slug}${man}`;
	const res = await trang.goto(`${APP}${doi}`, {
		waitUntil: "networkidle0",
		timeout: CHO_TAI,
	});
	const chuoi = res?.request().redirectChain() ?? [];
	if (chuoi.length > 0) {
		return {
			trang,
			loi: [
				`KHONG DO DUOC: tien de thieu — ${doi} bi chuyen huong ${chuoi.length} chang truoc khi ve.`,
				"   Chan nay KHONG do man den sau mot lenh chuyen huong.",
			],
		};
	}
	if (new URL(trang.url()).pathname !== doi) {
		return {
			trang,
			loi: [
				`KHONG DO DUOC: tien de thieu — xin ${doi} nhung dung o ${new URL(trang.url()).pathname}.`,
			],
		};
	}
	await new Promise((r) => setTimeout(r, sau ?? CHO_LANG));
	const langThat = await trang.evaluate(() => document.documentElement.lang);
	if (langThat !== tieng) {
		return {
			trang,
			loi: [
				`KHONG DO DUOC: tien de thieu — xin lang=${tieng} nhung trang ve lang=${langThat}.`,
			],
		};
	}
	return { trang, loi: null };
}

export async function moMan(cookie, slug, man, tieng, rong, sau) {
	const ra = await moManMem(cookie, slug, man, tieng, rong, sau);
	if (ra.loi !== null) await khongDo(...ra.loi);
	return ra.trang;
}

export async function docMan(cookie, slug, man, tieng, rong) {
	const trang = await moMan(cookie, slug, man, tieng, rong);
	const gia = await trang.evaluate(GOM);
	await trang.close();
	if (gia === null) {
		await khongDo(
			`KHONG DO DUOC: tien de thieu — ${man} khong co khung man de gom chu.`,
		);
	}
	if (gia.length === 0) {
		await khongDo(
			`KHONG DO DUOC: ${man} (lang=${tieng}) gom ra 0 chuoi. Tap quan sat rong khong bao gio la dat.`,
		);
	}
	return gia;
}

export const THU_MUC_CAI_DAT = "apps/app/app/(app)/[slug]/settings";

let tsGoi = null;

export function tsCua() {
	if (tsGoi === null) tsGoi = createRequire(import.meta.url)("typescript");
	return tsGoi;
}

export function docCay(duong) {
	const ts = tsCua();
	return ts.createSourceFile(
		duong,
		readFileSync(`${GOC}/${duong}`, "utf8"),
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
}

export function docKhai(duong, ten) {
	if (!existsSync(duong)) {
		console.log(
			`KHONG DO DUOC: tien de thieu — chua co ban khai ${ten} tai ${duong.replace(`${GOC}/`, "")}.`,
		);
		process.exit(2);
	}
	return JSON.parse(readFileSync(duong, "utf8"));
}

export function sinhRouteCaiDat(bo = []) {
	const ra = [];
	const di = (thuMuc, duoi) => {
		for (const m of readdirSync(thuMuc, { withFileTypes: true })) {
			if (m.isDirectory()) di(join(thuMuc, m.name), `${duoi}/${m.name}`);
			else if (m.name === "page.tsx") ra.push(`/settings${duoi}`);
		}
	};
	di(`${GOC}/${THU_MUC_CAI_DAT}`, "");
	const loai = new Set(bo);
	return { het: ra.sort(), do: ra.filter((r) => !loai.has(r)).sort() };
}

export function fileCaiDat() {
	const ra = [];
	const di = (thuMuc, duoi) => {
		for (const m of readdirSync(thuMuc, { withFileTypes: true })) {
			if (m.isDirectory()) di(join(thuMuc, m.name), `${duoi}/${m.name}`);
			else if (m.name.endsWith(".tsx"))
				ra.push(`${THU_MUC_CAI_DAT}${duoi}/${m.name}`);
		}
	};
	di(`${GOC}/${THU_MUC_CAI_DAT}`, "");
	return ra.sort();
}

export async function goiApiTao(cookie, duong, vao) {
	const res = await fetch(`${API}/api/trpc/${duong}`, {
		method: "POST",
		redirect: "manual",
		headers: { ...mu(cookie), "content-type": "application/json" },
		body: JSON.stringify(vao),
	});
	if (res.status >= 300 && res.status < 400) {
		return { loi: `${duong} tra ${res.status} va doi chuyen huong.` };
	}
	const chu = await res.text();
	if (!res.ok) {
		let ly = chu.slice(0, 160);
		try {
			ly = JSON.parse(chu).error?.message ?? ly;
		} catch {}
		return { loi: `${duong} tra ${res.status}: ${ly}` };
	}
	return { gia: JSON.parse(chu).result.data };
}

export async function gomTrang(trang) {
	return trang.evaluate(GOM);
}

export async function doRongTrang(trang) {
	return trang.evaluate(DO_RONG);
}

export function soCap(vi, en, boi) {
	const n = Math.min(vi.length, en.length);
	const ra = { soCap: n, lech: [], trung: [], khongDau: [] };
	for (let i = 0; i < n; i += 1) {
		if (vi[i].khoa !== en[i].khoa) {
			ra.lech.push({ so: i, vi: vi[i].khoa, en: en[i].khoa });
			continue;
		}
		const ly = boi(vi[i].chu, vi[i]);
		if (ly !== null) continue;
		if (vi[i].chu === en[i].chu) ra.trung.push(vi[i]);
		else if (!DAU_VIET.test(vi[i].chu)) ra.khongDau.push(vi[i]);
	}
	return ra;
}

export async function goiApiMem(cookie, duong, vao) {
	const url = `${API}/api/trpc/${duong}?input=${encodeURIComponent(
		JSON.stringify({ json: vao }),
	)}`;
	const res = await fetch(url, { redirect: "manual", headers: mu(cookie) });
	const chu = await res.text();
	if (!res.ok) {
		let ly = chu.slice(0, 160);
		try {
			ly = JSON.parse(chu).error?.message ?? ly;
		} catch {}
		return { loi: `${duong} tra ${res.status}: ${ly}` };
	}
	return { gia: JSON.parse(chu).result.data };
}
