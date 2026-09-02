import { execFileSync } from "node:child_process";
import puppeteer from "puppeteer-core";
import { z } from "../../../packages/validation/node_modules/zod/index.js";

const chuTrong = z.string().trim().min(1);
const dongCongTy = z.object({
	name: chuTrong.nullish(),
	domain: chuTrong.nullish(),
	industry: chuTrong.nullish(),
	createdAt: chuTrong.nullish(),
	lastActivityAt: chuTrong.nullish(),
	archivedAt: chuTrong.nullish(),
	owner: z.object({ name: chuTrong.nullish(), email: chuTrong.nullish() }).nullish(),
});
const danhSachCongTy = z.object({ rows: z.array(dongCongTy) });
const danhSachNguoi = z.array(
	z.object({ name: chuTrong.nullish(), email: chuTrong.nullish() }),
);
const khongGian = z.object({ name: chuTrong.nullish() });

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const SLUG = process.env.SLUG ?? "crm";
const MAN = '[data-slot="page-shell"]';
const DUONG = process.env.DUONG ?? "companies";

const chan = process.argv[2] ?? "chu";

// Chan cua vong ③ chua dung — do la viec S3. Bao ro thay vi loi mo.
const CHUA_DUNG = new Set([
	"--chan", "ba-man", "ho-so", "dong-thoi-gian", "no-vong-1",
	"trinh-doc-man-hinh", "khai-tieng", "doi-tieng", "giai-doan",
]);
if (CHUA_DUNG.has(chan)) {
	console.log(
		`CHUA DUNG: chan "${process.argv.slice(2).join(" ")}" cua vong ③ chua duoc xay.\n` +
			"Hop dong da khai no o evals.yaml va config.yaml; viec dung no thuoc buoc S3.\n" +
			"Chan dang chay duoc o ban sao nay: man | be-rong | chu | ban-phim (thua ke tu vong ①).",
	);
	process.exit(2);
}
const width = Number(process.env.BE_RONG ?? 1440);
const height = Number(process.env.CAO ?? 1000);

function phien() {
	const raw = execFileSync(
		"bun",
		["run", "dev:session", "manh.phan@onemount.com"],
		{ cwd: "apps/api", encoding: "utf8" },
	);
	const line = raw.trim().split("\n").pop().trim();
	const eq = line.indexOf("=");
	return { name: line.slice(0, eq), value: line.slice(eq + 1) };
}

async function goi(cookie, path, input) {
	const url = `${API}/api/trpc/${path}?input=${encodeURIComponent(JSON.stringify({ json: input }))}`;
	const res = await fetch(url, {
		headers: { Cookie: `${cookie.name}=${cookie.value}` },
	});
	if (!res.ok) throw new Error(`${path} ${res.status}`);
	return (await res.json()).result.data;
}

function vietTat(names) {
	const out = execFileSync(
		"bun",
		[
			"run",
			"_acceptance/tieng-viet-cho-crm/rang/viet-tat.ts",
			JSON.stringify(names),
		],
		{ encoding: "utf8" },
	);
	return JSON.parse(out.trim().split("\n").pop());
}

async function duLieuThu(cookie) {
	const [list, users, workspace] = await Promise.all([
		goi(cookie, "companies.list", {}).then((v) => danhSachCongTy.parse(v)),
		goi(cookie, "users.list", null).then((v) => danhSachNguoi.parse(v)),
		goi(cookie, "workspace.get", null).then((v) => khongGian.parse(v)),
	]);
	const ten = new Set();
	const nguon = new Set();
	for (const row of list.rows) {
		for (const value of [row.name, row.domain, row.industry]) {
			if (value) nguon.add(value);
		}
		if (row.name) ten.add(row.name);
		if (row.owner?.name) {
			nguon.add(row.owner.name);
			ten.add(row.owner.name);
		}
		if (row.owner?.email) nguon.add(row.owner.email);
	}
	for (const user of users) {
		if (user.name) {
			nguon.add(user.name);
			ten.add(user.name);
		}
		if (user.email) nguon.add(user.email);
	}
	if (workspace?.name) {
		nguon.add(workspace.name);
		ten.add(workspace.name);
	}
	for (const tat of vietTat([...ten])) nguon.add(tat);

	const KIEU = [
		{ month: "short", day: "numeric" },
		{ month: "short", day: "numeric", year: "numeric" },
	];
	for (const row of list.rows) {
		for (const iso of [row.createdAt, row.lastActivityAt, row.archivedAt]) {
			if (!iso) continue;
			const d = new Date(iso);
			for (const locale of ["vi", "en"]) {
				for (const kieu of KIEU) {
					nguon.add(new Intl.DateTimeFormat(locale, kieu).format(d));
				}
			}
		}
	}
	return { set: nguon, rows: list.rows.length };
}

const DOC_CHU = (roots) => {
	const scopes = roots
		? roots.flatMap((sel) => [...document.querySelectorAll(sel)])
		: [document.body];
	if (scopes.length === 0) return null;
	const nhinThay = (el) => {
		const r = el.getBoundingClientRect();
		if (r.width === 0 || r.height === 0) return false;
		const s = getComputedStyle(el);
		return s.visibility !== "hidden" && s.display !== "none" && s.opacity !== "0";
	};
	const out = [];
	const them = (raw) => {
		if (raw === null || raw === undefined) return;
		for (const piece of raw.split(/\n+/)) {
			const t = piece.replace(/\s+/g, " ").trim();
			if (t !== "") out.push(t);
		}
	};
	for (const scope of scopes) {
		const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
		for (let n = walker.nextNode(); n; n = walker.nextNode()) {
			const el = n.parentElement;
			if (!el) continue;
			if (el.closest("script,style,noscript,template")) continue;
			if (!nhinThay(el)) continue;
			them(n.nodeValue);
		}
		for (const el of scope.querySelectorAll("*")) {
			if (!nhinThay(el)) continue;
			for (const attr of [
				"placeholder",
				"title",
				"aria-label",
				"aria-roledescription",
				"alt",
			]) {
				them(el.getAttribute(attr));
			}
		}
	}
	return out;
};

const DOC_TIEU_DE = () =>
	[...document.querySelectorAll('[data-slot="table-head"]')]
		.filter((th) => th.getBoundingClientRect().width > 0)
		.filter((th) => th.textContent.trim() !== "")
		.map((th) => {
		const holder = th.querySelector("span,button,div") ?? th;
		const text = th.textContent.replace(/\s+/g, " ").trim();
		const probe = document.createElement("span");
		probe.style.cssText =
			"position:absolute;left:-9999px;white-space:nowrap;visibility:hidden";
		const cs = getComputedStyle(holder);
		probe.style.font = cs.font;
		probe.style.letterSpacing = cs.letterSpacing;
		probe.textContent = text;
		document.body.appendChild(probe);
		const textWidth = probe.getBoundingClientRect().width;
		probe.remove();
		const cut = [...th.querySelectorAll("*")].find(
			(e) =>
				getComputedStyle(e).textOverflow === "ellipsis" &&
				e.scrollWidth > e.clientWidth + 0.5,
		);
		const box = holder.getBoundingClientRect().width;
		const ten =
			th.getAttribute("title") ??
			th.querySelector("[title]")?.getAttribute("title") ??
			null;
		const rong = (s) => {
			probe.textContent = s;
			document.body.appendChild(probe);
			const w = probe.getBoundingClientRect().width;
			probe.remove();
			return w;
		};
		let hien = text;
		if (textWidth > box + 0.5) {
			hien = "";
			for (let i = 1; i <= text.length; i += 1) {
				if (rong(`${text.slice(0, i)}…`) > box) break;
				hien = `${text.slice(0, i)}…`;
			}
		}
		return {
			text,
			hien,
			boxWidth: Number(box.toFixed(2)),
			textWidth: Number(textWidth.toFixed(2)),
			bicat: textWidth > box + 0.5,
			coBaCham: Boolean(cut),
			title: ten,
		};
	});

const TRANG = process.env.TRANG ?? "";
const CHO_DONG = process.env.CHO_DONG !== "0";
const MO = process.env.MO ?? "";

async function quetMenu(page, doc, arg) {
	const gom = [];
	const nut = await page.$$("button");
	for (const b of nut) {
		const co = await b.evaluate(
			(el) => el.getAttribute("aria-haspopup") === "menu",
		);
		if (!co) continue;
		await b.click().catch(() => {});
		await new Promise((r) => setTimeout(r, 500));
		const mo = await page.$$('[data-slot="dropdown-menu-content"]');
		if (mo.length === 0) continue;
		gom.push(...((await page.evaluate(doc, arg)) ?? []));
		const con = await page.$$('[data-slot="dropdown-menu-sub-trigger"]');
		for (const sub of con) {
			await sub.hover().catch(() => {});
			await new Promise((r) => setTimeout(r, 500));
			gom.push(...((await page.evaluate(doc, arg)) ?? []));
		}
		await page.keyboard.press("Escape").catch(() => {});
		await new Promise((r) => setTimeout(r, 250));
	}
	return gom;
}

async function ve(browser, cookie, locale, doc, arg) {
	const page = await browser.newPage();
	await page.setViewport({ width, height, deviceScaleFactor: 1 });
	await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
	await browser.setCookie(
		{ name: cookie.name, value: cookie.value, domain: "localhost", path: "/" },
		{ name: "lang", value: locale, domain: "localhost", path: "/" },
	);
	await page.goto(`${APP}/${SLUG}/${DUONG}${TRANG}`, {
		waitUntil: "networkidle0",
		timeout: 60000,
	});
	await page.waitForSelector('[data-slot="table-head"]', { timeout: 30000 });
	if (CHO_DONG) {
		await page.waitForFunction(
			() =>
				document.querySelectorAll(
					'[data-slot="table-body"] [data-slot="table-row"]',
				).length > 0,
			{ timeout: 30000 },
		);
	} else {
		await new Promise((r) => setTimeout(r, 1500));
	}
	const lang = await page.evaluate(() => document.documentElement.lang);
	if (process.env.ANH) {
		await page.screenshot({ path: `${process.env.ANH}-${locale}-${width}.png` });
	}
	const value = await page.evaluate(doc, arg);
	if (MO === "menu") {
		const them = await quetMenu(page, doc, [
			'[data-slot="dropdown-menu-content"]',
			'[data-slot="dropdown-menu-sub-content"]',
		]);
		if (them.length === 0) throw new Error("RANG CUN: khong mo duoc menu nao");
		value.push(...them);
	}
	return { page, lang, value };
}

const DAU_VIET =
	/[ăâđêôơưĂÂĐÊÔƠƯáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵÁÀẢÃẠẮẰẲẴẶẤẦẨẪẬÉÈẺẼẸẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌỐỒỔỖỘỚỜỞỠỢÚÙỦŨỤỨỪỬỮỰÝỲỶỸỴ]/;
const CHI_SO = /^[\d\s.,:%–\-—/()+…·|]*$/;

const cookie = phien();
const browser = await puppeteer.launch({
	executablePath: CHROME,
	headless: "new",
	args: ["--no-sandbox", `--window-size=${width},${height}`],
});

try {
	if (chan === "ban-phim") {
		const page = await browser.newPage();
		await page.setViewport({ width, height, deviceScaleFactor: 1 });
		await browser.setCookie(
			{ name: cookie.name, value: cookie.value, domain: "localhost", path: "/" },
			{ name: "lang", value: "vi", domain: "localhost", path: "/" },
		);
		await page.goto(`${APP}/${SLUG}/${DUONG}`, {
			waitUntil: "networkidle0",
			timeout: 60000,
		});
		await page.waitForSelector('[data-slot="table-head"]', { timeout: 30000 });
		let buoc = 0;
		let toi = null;
		for (let i = 1; i <= 30; i += 1) {
			await page.keyboard.press("Tab");
			const o = await page.evaluate(() => {
				const el = document.activeElement;
				if (!el) return null;
				const cs = getComputedStyle(el);
				const r = el.getBoundingClientRect();
				return {
					tag: el.tagName.toLowerCase(),
					nhan: el.getAttribute("aria-label") ?? el.textContent.trim().slice(0, 40),
					popup: el.getAttribute("aria-haspopup"),
					vong:
						cs.outlineStyle !== "none" && Number.parseFloat(cs.outlineWidth) > 0
							? `outline ${cs.outlineWidth} ${cs.outlineColor}`
							: cs.boxShadow !== "none"
								? `box-shadow ${cs.boxShadow}`
								: null,
					x: Math.round(r.x),
					y: Math.round(r.y),
					w: Math.round(r.width),
					h: Math.round(r.height),
				};
			});
			if (o === null) continue;
			if (o.popup === "menu" && o.y < 60) {
				buoc = i;
				toi = o;
				break;
			}
		}
		if (toi === null) {
			console.log("RANG DO: 30 lan Tab khong toi duoc dieu khien mo menu tren thanh dau");
			process.exit(1);
		}
		const khung = {
			x: Math.max(0, toi.x - 8),
			y: Math.max(0, toi.y - 8),
			width: toi.w + 16,
			height: toi.h + 16,
		};
		const coTieuDiem = await page.screenshot({
			clip: khung,
			path: "_acceptance/tieng-viet-cho-crm/evidence/E10-step1.png",
		});
		await page.evaluate(() => document.activeElement?.blur());
		await new Promise((r) => setTimeout(r, 400));
		const khongTieuDiem = await page.screenshot({
			clip: khung,
			path: "_acceptance/tieng-viet-cho-crm/evidence/E10-step0-khong-tieu-diem.png",
		});
		const khac = Buffer.compare(coTieuDiem, khongTieuDiem) !== 0;
		await page.evaluate(() => {
			const el = [...document.querySelectorAll("button")].find(
				(b) => b.getAttribute("aria-haspopup") === "menu" &&
					b.getBoundingClientRect().y < 60,
			);
			el?.focus();
		});
		await new Promise((r) => setTimeout(r, 300));
		console.log(`-- Tab lan ${buoc} dung o: <${toi.tag}> nhan="${toi.nhan}"`);
		console.log(
			`   anh nut khi CO tieu diem khac anh khi KHONG tieu diem: ${khac ? "co" : "KHONG"}`,
		);
		await page.keyboard.press("Enter");
		await new Promise((r) => setTimeout(r, 700));
		const menu = await page.evaluate(() =>
			[...document.querySelectorAll('[data-slot="dropdown-menu-content"] [role^="menuitem"], [data-slot="dropdown-menu-content"] [data-slot="dropdown-menu-item"]')].map(
				(el) => el.textContent.replace(/\s+/g, " ").trim(),
			),
		);
		await page.screenshot({
			path: "_acceptance/tieng-viet-cho-crm/evidence/E10-step2.png",
		});
		console.log(`   menu sau khi Enter: ${JSON.stringify(menu)}`);
		const coVong = khac;
		const coMenu = menu.length > 0;
		console.log(
			`ket qua: vong tieu diem=${coVong ? "co" : "KHONG"} · menu mo=${coMenu ? "co" : "KHONG"} · so dong=${menu.length}`,
		);
		process.exit(coVong && coMenu ? 0 : 1);
	}

	if (chan === "be-rong") {
		const vi = await ve(browser, cookie, "vi", DOC_TIEU_DE);
		const en = await ve(browser, cookie, "en", DOC_TIEU_DE);
		let catTran = 0;
		let catCoBaCham = 0;
		const dong = (h) =>
			`   ${(h.bicat ? (h.coBaCham ? "cat + ba cham" : "CAT TRAN") : "du").padEnd(14)} ${h.text.padEnd(22)} hien="${h.hien}"${" ".repeat(Math.max(0, 22 - h.hien.length))} o=${String(h.boxWidth).padStart(7)}px chu=${String(h.textWidth).padStart(7)}px title=${h.title ? "co" : "khong"}`;
		console.log(`-- tieng Viet o ${width}px, lang=${vi.lang}`);
		for (const h of vi.value) {
			if (h.bicat && h.coBaCham) catCoBaCham += 1;
			if (h.bicat && !h.coBaCham) catTran += 1;
			console.log(dong(h));
		}
		console.log(`-- doi chieu tieng Anh cung ${width}px, lang=${en.lang}`);
		for (const h of en.value) console.log(dong(h));
		console.log(
			`ket qua ${width}px: cat tran=${catTran} · cat kem ba cham=${catCoBaCham} · tong=${vi.value.length}`,
		);
		process.exit(catTran > 0 ? 1 : 0);
	}

	const trung = await duLieuThu(cookie);
	const scope =
		chan === "man"
			? [MAN, '[data-slot="dropdown-menu-content"]', '[data-slot="dropdown-menu-sub-content"]']
			: null;
	const vi = await ve(browser, cookie, "vi", DOC_CHU, scope);
	const en = await ve(browser, cookie, "en", DOC_CHU, scope);
	if (vi.lang !== "vi" || en.lang !== "en") {
		console.log(`RANG CUN: lang lech (vi->${vi.lang}, en->${en.lang})`);
		process.exit(2);
	}
	if (vi.value === null || en.value === null) {
		console.log(`RANG CUN: khong tim thay pham vi ${scope}`);
		process.exit(2);
	}

	const dem = (list) => {
		const m = new Map();
		for (const s of list) m.set(s, (m.get(s) ?? 0) + 1);
		return m;
	};
	const viDem = dem(vi.value);
	const enDem = dem(en.value);
	const duLieu = [...trung.set];
	const laDuLieu = (s) =>
		trung.set.has(s) || duLieu.some((d) => d.length > 2 && s.includes(d));
	const dangXet = (s) => !laDuLieu(s) && !CHI_SO.test(s);

	const con = [...viDem.keys()].filter((s) => enDem.has(s) && dangXet(s)).sort();
	const khongDau = [...viDem.keys()]
		.filter((s) => !enDem.has(s) && dangXet(s) && !DAU_VIET.test(s))
		.sort();
	const lanCon = con.reduce((n, s) => n + viDem.get(s), 0);
	const lanKhongDau = khongDau.reduce((n, s) => n + viDem.get(s), 0);

	console.log(
		`-- pham vi: ${scope ? "man cong ty" : "ca trang"}${TRANG ? ` ${TRANG}` : ""}${MO ? ` mo=${MO}` : ""} · du lieu thu sinh tu may chu: ${trung.set.size} gia tri tren ${trung.rows} dong`,
	);
	console.log(
		`-- chuoi nhin thay: vi=${viDem.size} en=${enDem.size} (${vi.value.length}/${en.value.length} lan)`,
	);
	console.log(
		`-- CON LAI: giong het o ca hai thu tieng, khong phai du lieu (${con.length} chuoi / ${lanCon} lan)`,
	);
	for (const s of con)
		console.log(`   * ${JSON.stringify(s)}${viDem.get(s) > 1 ? ` x${viDem.get(s)}` : ""}`);
	console.log(
		`-- KHONG MANG DAU TIENG VIET: chi co o ban vi ma khong dau (${khongDau.length} chuoi / ${lanKhongDau} lan)`,
	);
	for (const s of khongDau)
		console.log(`   * ${JSON.stringify(s)}${viDem.get(s) > 1 ? ` x${viDem.get(s)}` : ""}`);
	console.log(
		`ket qua: con lai=${con.length} · khong dau=${khongDau.length} · lan=${lanCon + lanKhongDau}`,
	);
	process.exit(con.length + khongDau.length > 0 ? 1 : 0);
} finally {
	await browser.close();
}
