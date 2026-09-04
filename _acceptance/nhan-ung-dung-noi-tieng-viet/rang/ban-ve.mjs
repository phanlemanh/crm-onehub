import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";
import puppeteer from "puppeteer-core";
import { z } from "../../../packages/validation/node_modules/zod/index.js";
import { BE_MAT, CHUA_MO } from "./be-mat.mjs";
import { suySlug } from "./slug.mjs";

const CHO_TAI = Number(process.env.CHO_TAI ?? 120000);
const CHO_VE = Number(process.env.CHO_VE ?? 90000);
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const MAN = '[data-slot="page-shell"]';
const DUONG = process.env.DUONG ?? "companies";

const chan = process.argv[2] ?? "chu";

// Chan cua vong ③ chua dung — do la viec S3. Bao ro thay vi loi mo.
const CHUA_DUNG = new Set(["--chan"]);
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

async function goiTho(cookie, path, input) {
	const url = `${API}/api/trpc/${path}?input=${encodeURIComponent(JSON.stringify(input))}`;
	const res = await fetch(url, {
		headers: { Cookie: `${cookie.name}=${cookie.value}` },
	});
	if (!res.ok) throw new Error(`${path} ${res.status}`);
	return (await res.json()).result.data;
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

async function idBanGhi(cookie) {
	const [c, ct, d] = await Promise.all([
		goi(cookie, "companies.list", {}),
		goi(cookie, "contacts.list", {}),
		goi(cookie, "deals.list", {}),
	]);
	const lay = (r, ten) => {
		const id = r.rows[0]?.id;
		if (!id) {
			console.log(`RANG CUN: may chu khong tra ban ghi ${ten} nao`);
			process.exit(2);
		}
		return id;
	};
	return {
		company: lay(c, "cong ty"),
		contact: lay(ct, "ca nhan"),
		deal: lay(d, "thoa thuan"),
	};
}

const chu = z.string().trim().min(1);
const truong = z.object({
	label: chu,
	typeLabel: chu.nullish(),
	agentBrief: chu.nullish(),
	options: z.array(z.object({ label: chu })).nullish(),
});

const nguoi = z.object({ name: chu.nullish(), email: chu.nullish() }).nullish();
const ngay = z.string().nullish();

const dongCongTy = z.object({
	id: chu,
	name: chu,
	domain: chu.nullish(),
	industry: chu.nullish(),
	owner: nguoi,
	createdAt: ngay,
	lastActivityAt: ngay,
	archivedAt: ngay,
});
const dongCaNhan = z.object({
	id: chu,
	firstName: chu.nullish(),
	lastName: chu.nullish(),
	email: chu.nullish(),
	title: chu.nullish(),
	company: z.object({ name: chu.nullish() }).nullish(),
	owner: nguoi,
	createdAt: ngay,
	lastActivityAt: ngay,
	archivedAt: ngay,
});
const dongThoaThuan = z.object({
	id: chu,
	name: chu,
	currency: chu.nullish(),
	company: z.object({ name: chu.nullish() }).nullish(),
	owner: nguoi,
	createdAt: ngay,
	closeDate: ngay,
	lastActivityAt: ngay,
	archivedAt: ngay,
});

async function duLieuThu(cookie) {
	const [list, contacts, deals, users, workspace] = await Promise.all([
		goi(cookie, "companies.list", {}),
		goi(cookie, "contacts.list", {}),
		goi(cookie, "deals.list", {}),
		goi(cookie, "users.list", null),
		goi(cookie, "workspace.get", null),
	]);
	const congTy = z.object({ rows: z.array(dongCongTy) }).parse(list).rows;
	const caNhan = z.object({ rows: z.array(dongCaNhan) }).parse(contacts).rows;
	const thoaThuan = z
		.object({ rows: z.array(dongThoaThuan) })
		.parse(deals).rows;
	const doi = z
		.array(z.object({ name: chu.nullish(), email: chu.nullish() }))
		.parse(users);
	const noiLam = z.object({ name: chu.nullish() }).parse(workspace);
	const tienBaoCao = z
		.object({ reportingCurrency: chu.nullish() })
		.parse(deals).reportingCurrency;

	const ten = new Set();
	const nguon = new Set();
	const them = (v) => {
		if (v !== null && v !== undefined) nguon.add(v);
	};
	const themTen = (v) => {
		if (v !== null && v !== undefined) {
			nguon.add(v);
			ten.add(v);
		}
	};

	for (const row of congTy) {
		them(row.domain);
		them(row.industry);
		themTen(row.name);
		themTen(row.owner?.name);
		them(row.owner?.email);
	}
	for (const row of caNhan) {
		them(row.email);
		them(row.title);
		them(row.company?.name);
		themTen(row.firstName);
		themTen(row.lastName);
		themTen([row.firstName, row.lastName].filter(Boolean).join(" ") || null);
		themTen(row.owner?.name);
	}
	for (const row of thoaThuan) {
		themTen(row.name);
		them(row.company?.name);
		themTen(row.owner?.name);
		them(row.currency);
		them(row.currency?.toUpperCase());
	}
	for (const u of doi) {
		themTen(u.name);
		them(u.email);
	}
	themTen(noiLam.name);
	them(tienBaoCao);
	them(tienBaoCao?.toUpperCase());
	for (const tat of vietTat([...ten])) nguon.add(tat);

	const KIEU = [
		{ month: "short", day: "numeric" },
		{ month: "short", day: "numeric", year: "numeric" },
	];
	for (const row of [...congTy, ...thoaThuan, ...caNhan]) {
		const moc = [
			row.createdAt,
			row.lastActivityAt,
			row.archivedAt,
			row.closeDate,
		];
		for (const iso of moc) {
			if (iso === null || iso === undefined) continue;
			const d = new Date(iso);
			if (Number.isNaN(d.getTime())) continue;
			for (const locale of ["vi", "en"]) {
				for (const kieu of KIEU)
					nguon.add(new Intl.DateTimeFormat(locale, kieu).format(d));
			}
		}
	}

	for (const thucThe of ["COMPANY", "CONTACT", "DEAL"]) {
		const raw = await goiTho(cookie, "fields.list", {
			entity: thucThe,
			includeArchived: false,
		});
		for (const t of z.array(truong).parse(raw)) {
			them(t.label);
			them(t.typeLabel);
			them(t.agentBrief);
			for (const o of t.options ?? []) them(o.label);
		}
	}

	const chiTiet = z.object({
		city: chu.nullish(),
		country: chu.nullish(),
		description: chu.nullish(),
		contacts: z
			.array(z.object({ role: chu.nullish(), title: chu.nullish() }))
			.nullish(),
	});
	const chiTietCua = [
		["companies.byId", congTy.map((r) => r.id).slice(0, 8)],
		["deals.byId", thoaThuan.map((r) => r.id).slice(0, 8)],
	];
	for (const [thuTuc, ids] of chiTietCua) {
		for (const id of ids) {
			const t = chiTiet.parse(await goiTho(cookie, thuTuc, { id }));
			them(t.city);
			them(t.country);
			them(t.description);
			if (t.city && t.country) them(`${t.city}, ${t.country}`);
			for (const c of t.contacts ?? []) {
				them(c.role);
				them(c.title);
			}
		}
	}

	const hoatDong = z.object({
		entries: z.array(z.object({ subject: chu.nullish(), body: chu.nullish() })),
	});
	for (const row of congTy) {
		const id = row.id;
		const raw = await goiTho(cookie, "activities.timeline", {
			companyId: id,
			filter: "history",
			limit: 50,
		});
		for (const it of hoatDong.parse(raw).entries) {
			them(it.subject);
			if (it.body) {
				for (const dong of it.body.split(/\n+/)) them(dong.trim() || null);
			}
		}
	}

	for (const [khoa, ds] of [
		["contactId", caNhan],
		["dealId", thoaThuan],
	]) {
		for (const row of ds) {
			const raw = await goiTho(cookie, "activities.timeline", {
				[khoa]: row.id,
				filter: "history",
				limit: 50,
			});
			for (const it of hoatDong.parse(raw).entries) {
				them(it.subject);
				if (it.body) {
					for (const dong of it.body.split(/\n+/)) them(dong.trim() || null);
				}
			}
		}
	}

	for (const gt of khaiNgoaiLe()) nguon.add(gt);
	return { set: nguon, rows: congTy.length };
}

function khaiNgoaiLe() {
	const src = readFileSync(
		"_acceptance/nhan-ung-dung-noi-tieng-viet/ban-dich.md",
		"utf8",
	);
	const mo = src.indexOf("## Ngoại lệ khỏi luật dấu tiếng Việt");
	if (mo === -1) {
		console.log("RANG CUN: ban dich khong con muc ngoai le");
		process.exit(2);
	}
	const sau = src.indexOf("\n## ", mo + 1);
	const muc = src.slice(mo, sau === -1 ? undefined : sau);
	const ra = [];
	for (const m of muc.matchAll(/^\| [^|]+ \| `([^`]+)` \|/gm)) ra.push(m[1]);
	for (const m of muc.matchAll(
		/^\| `stage\.\*`[^|]*\| `([^`]+)` … `([^`]+)` \|/gm,
	)) {
		ra.push(m[1], m[2]);
	}
	for (const g of [
		"Demo booked",
		"Qualified to buy",
		"Decision maker in",
		"Contract sent",
		"Closed won",
		"Closed lost",
		"Unqualified",
	]) {
		ra.push(g);
	}
	if (ra.length === 0) {
		console.log("RANG CUN: doc muc ngoai le ra 0 gia tri — khuon bang da doi?");
		process.exit(2);
	}
	return ra;
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
		return (
			s.visibility !== "hidden" && s.display !== "none" && s.opacity !== "0"
		);
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
			if (el.closest('script,style,noscript,template,[translate="no"]')) continue;
			if (!nhinThay(el)) continue;
			them(n.nodeValue);
		}
		for (const el of scope.querySelectorAll("*")) {
			if (!nhinThay(el)) continue;
			if (el.closest('[translate="no"]')) continue;
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
		timeout: CHO_TAI,
	});
	await page.waitForSelector('[data-slot="table-head"]', { timeout: CHO_VE });
	if (CHO_DONG) {
		await page.waitForFunction(
			() =>
				document.querySelectorAll(
					'[data-slot="table-body"] [data-slot="table-row"]',
				).length > 0,
			{ timeout: CHO_VE },
		);
	} else {
		await new Promise((r) => setTimeout(r, 1500));
	}
	const lang = await page.evaluate(() => document.documentElement.lang);
	if (process.env.ANH) {
		await page.screenshot({
			path: `${process.env.ANH}-${locale}-${width}.png`,
		});
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
const CHI_SO = /^[\d\s.,:%–\-—/()+…·|≈~≥≤<>]*$/;

const cookie = phien();
const SLUG = await suySlug(cookie);
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
			{
				name: cookie.name,
				value: cookie.value,
				domain: "localhost",
				path: "/",
			},
			{ name: "lang", value: "vi", domain: "localhost", path: "/" },
		);
		await page.goto(`${APP}/${SLUG}/${DUONG}`, {
			waitUntil: "networkidle0",
			timeout: CHO_TAI,
		});
		await page.waitForSelector('[data-slot="table-head"]', { timeout: CHO_VE });
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
					nhan:
						el.getAttribute("aria-label") ?? el.textContent.trim().slice(0, 40),
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
			console.log(
				"RANG DO: 30 lan Tab khong toi duoc dieu khien mo menu tren thanh dau",
			);
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
				(b) =>
					b.getAttribute("aria-haspopup") === "menu" &&
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
			[
				...document.querySelectorAll(
					'[data-slot="dropdown-menu-content"] [role^="menuitem"], [data-slot="dropdown-menu-content"] [data-slot="dropdown-menu-item"]',
				),
			].map((el) => el.textContent.replace(/\s+/g, " ").trim()),
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

	if (chan === "ba-man") {
		const trung = await duLieuThu(cookie);
		const scope = [MAN, ...CHUA_MO];
		const BA_MAN = (process.env.MAN_LIST ?? "companies,contacts,deals").split(
			",",
		);
		let tongDu = 0;
		let tongLech = 0;
		for (const man of BA_MAN) {
			const doc = async (locale) => {
				const page = await browser.newPage();
				await page.setViewport({ width, height, deviceScaleFactor: 1 });
				await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
				await browser.setCookie(
					{
						name: cookie.name,
						value: cookie.value,
						domain: "localhost",
						path: "/",
					},
					{ name: "lang", value: locale, domain: "localhost", path: "/" },
				);
				await page.goto(`${APP}/${SLUG}/${man}`, {
					waitUntil: "networkidle0",
					timeout: CHO_TAI,
				});
				await page.waitForSelector('[data-slot="table-head"]', {
					timeout: CHO_VE,
				});
				await page.waitForFunction(
					() =>
						document.querySelectorAll(
							'[data-slot="table-body"] [data-slot="table-row"]',
						).length > 0,
					{ timeout: CHO_VE },
				);
				const lang = await page.evaluate(() => document.documentElement.lang);
				const chu = [...((await page.evaluate(DOC_CHU, scope)) ?? [])];
				const moDuoc = [];
				for (const bm of BE_MAT[man]) {
					const ok = await bm.mo(page).catch(() => false);
					if (ok) {
						moDuoc.push(bm.ten);
						chu.push(...((await page.evaluate(DOC_CHU, scope)) ?? []));
					}
					await bm.dong(page).catch(() => {});
				}
				await page.close();
				return { lang, chu, moDuoc };
			};
			const vi = await doc("vi");
			const en = await doc("en");
			if (vi.lang !== "vi" || en.lang !== "en") {
				console.log(
					`RANG CUN: lang lech o ${man} (vi->${vi.lang}, en->${en.lang})`,
				);
				process.exit(2);
			}
			const dem = (l) => {
				const m = new Map();
				for (const x of l) m.set(x, (m.get(x) ?? 0) + 1);
				return m;
			};
			const viDem = dem(vi.chu);
			const enDem = dem(en.chu);
			const duLieu = [...trung.set];
			const laDuLieu = (x) =>
				trung.set.has(x) || duLieu.some((d) => d.length > 2 && x.includes(d));
			const con = [...viDem.keys()]
				.filter((x) => enDem.has(x) && !laDuLieu(x) && !CHI_SO.test(x))
				.sort();
			const lan = con.reduce((n, x) => n + viDem.get(x), 0);
			const khai = BE_MAT[man].length;
			const lech = khai - vi.moDuoc.length;
			tongDu += lan;
			tongLech += Math.abs(lech) + Math.abs(khai - en.moDuoc.length);
			console.log(
				`\n-- man ${man} · be mat khai=${khai} · da mo vi=${vi.moDuoc.length} en=${en.moDuoc.length}`,
			);
			console.log(`   da mo: ${vi.moDuoc.join(" · ") || "(khong cai nao)"}`);
			if (lech !== 0) {
				const thieu = BE_MAT[man]
					.map((b) => b.ten)
					.filter((t) => !vi.moDuoc.includes(t));
				console.log(`   KHONG MO DUOC: ${thieu.join(" · ")}`);
			}
			console.log(`   CON LAI: ${con.length} chuoi / ${lan} lan`);
			for (const x of con)
				console.log(
					`      * ${JSON.stringify(x)}${viDem.get(x) > 1 ? ` x${viDem.get(x)}` : ""}`,
				);
		}
		console.log(`\nket qua: con lai=${tongDu} lan · be mat lech=${tongLech}`);
		process.exit(tongDu + tongLech > 0 ? 1 : 0);
	}

	if (chan === "ho-so") {
		const trung = await duLieuThu(cookie);
		const scope = [
			MAN,
			...CHUA_MO,
			'[data-slot="record-sheet"]',
			'[role="dialog"]',
		];
		const id = await idBanGhi(cookie);
		const HO_SO = [
			{ loai: "company", man: "companies", tabs: ["overview", "activity"] },
			{
				loai: "contact",
				man: "contacts",
				tabs: ["overview", "deals", "activity"],
			},
			{ loai: "deal", man: "deals", tabs: ["overview", "activity"] },
		];
		let tongDu = 0;
		for (const hs of HO_SO) {
			const doc = async (locale) => {
				const page = await browser.newPage();
				await page.setViewport({ width, height, deviceScaleFactor: 1 });
				await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
				await browser.setCookie(
					{
						name: cookie.name,
						value: cookie.value,
						domain: "localhost",
						path: "/",
					},
					{ name: "lang", value: locale, domain: "localhost", path: "/" },
				);
				const chu = [];
				const daMo = [];
				for (const tab of hs.tabs) {
					const url = `${APP}/${SLUG}/${hs.man}?record=${hs.loai}:${id[hs.loai]}&tab=${tab}`;
					await page.goto(url, { waitUntil: "networkidle0", timeout: CHO_TAI });
					await new Promise((r) => setTimeout(r, 1800));
					await page.evaluate(() => {
						for (const el of document.querySelectorAll("*")) {
							if (el.scrollHeight > el.clientHeight + 40)
								el.scrollTop = el.scrollHeight;
						}
					});
					await new Promise((r) => setTimeout(r, 800));
					const phan = (await page.evaluate(DOC_CHU, scope)) ?? [];
					if (phan.length === 0) {
						console.log(
							`RANG CUN: ho so ${hs.loai} tab ${tab} khong ve ra chu nao`,
						);
						process.exit(2);
					}
					chu.push(...phan);
					daMo.push(`${hs.loai}/${tab}`);
				}
				const lang = await page.evaluate(() => document.documentElement.lang);
				await page.close();
				return { lang, chu, daMo };
			};
			const vi = await doc("vi");
			const en = await doc("en");
			if (vi.lang !== "vi" || en.lang !== "en") {
				console.log(`RANG CUN: lang lech o ${hs.loai}`);
				process.exit(2);
			}
			const dem = (l) => {
				const m = new Map();
				for (const x of l) m.set(x, (m.get(x) ?? 0) + 1);
				return m;
			};
			const viDem = dem(vi.chu);
			const enDem = dem(en.chu);
			const duLieu = [...trung.set];
			const laDuLieu = (x) =>
				trung.set.has(x) || duLieu.some((d) => d.length > 2 && x.includes(d));
			const con = [...viDem.keys()]
				.filter((x) => enDem.has(x) && !laDuLieu(x) && !CHI_SO.test(x))
				.sort();
			const lan = con.reduce((n, x) => n + viDem.get(x), 0);
			tongDu += lan;
			console.log(
				`\n-- ho so ${hs.loai} · tab da mo=${vi.daMo.length} (${vi.daMo.join(" · ")})`,
			);
			console.log(`   CON LAI: ${con.length} chuoi / ${lan} lan`);
			for (const x of con)
				console.log(
					`      * ${JSON.stringify(x)}${viDem.get(x) > 1 ? ` x${viDem.get(x)}` : ""}`,
				);
		}
		console.log(`\nket qua: con lai=${tongDu} lan`);
		process.exit(tongDu > 0 ? 1 : 0);
	}

	if (chan === "dong-thoi-gian") {
		const trung = await duLieuThu(cookie);
		const scope = [
			MAN,
			...CHUA_MO,
			'[data-slot="record-sheet"]',
			"[data-sonner-toast]",
		];
		const id = await idBanGhi(cookie);
		const TAB = ["all", "notes", "email", "meetings", "upcoming", "done"];

		const moHoSo = async (page, locale, tab) => {
			await browser.setCookie(
				{
					name: cookie.name,
					value: cookie.value,
					domain: "localhost",
					path: "/",
				},
				{ name: "lang", value: locale, domain: "localhost", path: "/" },
			);
			await page.goto(
				`${APP}/${SLUG}/companies?record=company:${id.company}&tab=activity&timeline=${tab}`,
				{ waitUntil: "networkidle0", timeout: CHO_TAI },
			);
			await new Promise((r) => setTimeout(r, 1600));
		};

		const CHO_HONG = Number(process.env.CHO_HONG ?? 8000);
		const soanRoiGui = async (page) => {
			await page.evaluate(() => {
				window.__toast = [];
				const gom = (n) => {
					if (n.nodeType !== 1) return;
					if (n.matches?.("[data-sonner-toast]")) {
						const t = n.textContent.replace(/\s+/g, " ").trim();
						if (t && !window.__toast.includes(t)) window.__toast.push(t);
					}
					n.querySelectorAll?.("[data-sonner-toast]").forEach((e) => {
						const t = e.textContent.replace(/\s+/g, " ").trim();
						if (t && !window.__toast.includes(t)) window.__toast.push(t);
					});
				};
				new MutationObserver((ms) => {
					for (const m of ms) m.addedNodes.forEach(gom);
				}).observe(document.body, { childList: true, subtree: true });
			});
			const o = await page.$("textarea");
			if (!o) return null;
			await o.click();
			await o.type("Ghi thu tu phep do nghiem thu");
			await new Promise((r) => setTimeout(r, 300));
			await page.keyboard.down("Meta");
			await page.keyboard.press("Enter");
			await page.keyboard.up("Meta");
			await new Promise((r) => setTimeout(r, CHO_HONG));
			return page.evaluate(() => window.__toast ?? []);
		};

		const doc = async (locale) => {
			const page = await browser.newPage();
			await page.setViewport({ width, height, deviceScaleFactor: 1 });
			await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
			const chu = [];
			for (const tab of TAB) {
				await moHoSo(page, locale, tab);
				const phan = (await page.evaluate(DOC_CHU, scope)) ?? [];
				if (phan.length === 0) {
					console.log(
						`RANG CUN: tab dong thoi gian "${tab}" khong ve ra chu nao`,
					);
					process.exit(2);
				}
				chu.push(...phan);
			}
			const lang = await page.evaluate(() => document.documentElement.lang);
			await page.close();
			return { lang, chu };
		};

		const duongHong = async (locale, kieu) => {
			const page = await browser.newPage();
			await page.setViewport({ width, height, deviceScaleFactor: 1 });
			await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
			await moHoSo(page, locale, "all");
			let daChan = false;
			await page.setRequestInterception(true);
			page.on("request", (req) => {
				const laLenh =
					req.method() === "POST" && req.url().includes("activities.create");
				if (!laLenh) {
					req.continue();
					return;
				}
				daChan = true;
				if (kieu === "trinh-duyet") req.abort("failed");
				else
					req.continue({
						postData: JSON.stringify({ json: { type: "NOTE" } }),
					});
			});
			const toast = await soanRoiGui(page);
			await page.close();
			if (!daChan) {
				console.log(
					`RANG CUN: duong hong "${kieu}" khong bat duoc lenh nao — cu pha khong cham toi vat`,
				);
				process.exit(2);
			}
			return toast;
		};

		const vi = await doc("vi");
		const en = await doc("en");
		if (vi.lang !== "vi" || en.lang !== "en") {
			console.log(`RANG CUN: lang lech (vi->${vi.lang}, en->${en.lang})`);
			process.exit(2);
		}
		const dem = (l) => {
			const m = new Map();
			for (const x of l) m.set(x, (m.get(x) ?? 0) + 1);
			return m;
		};
		const viDem = dem(vi.chu);
		const enDem = dem(en.chu);
		const duLieu = [...trung.set];
		const laDuLieu = (x) =>
			trung.set.has(x) || duLieu.some((d) => d.length > 2 && x.includes(d));
		const con = [...viDem.keys()]
			.filter((x) => enDem.has(x) && !laDuLieu(x) && !CHI_SO.test(x))
			.sort();
		const lan = con.reduce((n, x) => n + viDem.get(x), 0);

		console.log(`-- sau tab dong thoi gian, hai thu tieng`);
		console.log(`   CON LAI: ${con.length} chuoi / ${lan} lan`);
		for (const x of con)
			console.log(
				`      * ${JSON.stringify(x)}${viDem.get(x) > 1 ? ` x${viDem.get(x)}` : ""}`,
			);

		const hongTD = await duongHong("vi", "trinh-duyet");
		const hongMC = await duongHong("vi", "may-chu");
		console.log(`\n-- duong hong (a) phia trinh duyet, o tieng Viet`);
		console.log(`   chu hien ra: ${JSON.stringify(hongTD)}`);
		console.log(`-- duong hong (b) may chu tu choi that, o tieng Viet`);
		console.log(`   chu hien ra: ${JSON.stringify(hongMC)}`);
		console.log(
			"   (b) KHONG phai chieu do — hop dong khai cau may chu van tieng Anh, vong ④",
		);

		const hongTDViet = (hongTD ?? []).some((t) => DAU_VIET.test(t));
		if (!hongTDViet) {
			console.log(`   DUONG (a) CHUA DAT: khong cau nao mang dau tieng Viet`);
		}
		console.log(
			`\nket qua: con lai=${lan} lan · duong hong (a) tieng Viet=${hongTDViet ? "co" : "khong"}`,
		);
		process.exit(lan > 0 || !hongTDViet ? 1 : 0);
	}

	if (chan === "trinh-doc-man-hinh") {
		const trung = await duLieuThu(cookie);
		const id = await idBanGhi(cookie);
		const DOC_TRO_NANG = (roots) => {
			const nhinThay = (el) => {
				const r = el.getBoundingClientRect();
				return r.width > 0 && r.height > 0;
			};
			const out = [];
			const trong = roots.flatMap((sel) => [...document.querySelectorAll(sel)]);
			if (trong.length === 0) return out;
			for (const el of trong.flatMap((g) => [...g.querySelectorAll("*")])) {
				if (!nhinThay(el)) continue;
				for (const a of [
					"aria-label",
					"aria-description",
					"aria-roledescription",
					"aria-placeholder",
					"title",
					"alt",
				]) {
					const v = el.getAttribute(a);
					if (v) out.push(v.replace(/\s+/g, " ").trim());
				}
				if (el.matches(".sr-only")) {
					const t = el.textContent.replace(/\s+/g, " ").trim();
					if (t) out.push(t);
				}
			}
			return out;
		};
		const doc = async (locale) => {
			const page = await browser.newPage();
			await page.setViewport({ width, height, deviceScaleFactor: 1 });
			await browser.setCookie(
				{
					name: cookie.name,
					value: cookie.value,
					domain: "localhost",
					path: "/",
				},
				{ name: "lang", value: locale, domain: "localhost", path: "/" },
			);
			const chu = [];
			for (const [man, tham] of [
				["companies", "?hide=nothing"],
				["contacts", "?hide=nothing"],
				["deals", "?hide=nothing"],
				["companies", `?record=company:${id.company}&tab=overview`],
				["contacts", `?record=contact:${id.contact}&tab=overview`],
				["deals", `?record=deal:${id.deal}&tab=overview`],
			]) {
				await page.goto(`${APP}/${SLUG}/${man}${tham}`, {
					waitUntil: "networkidle0",
					timeout: CHO_TAI,
				});
				await new Promise((r) => setTimeout(r, 1500));
				const phan = await page.evaluate(DOC_TRO_NANG, [
					MAN,
					'[data-slot="record-sheet"]',
					'[role="dialog"]',
				]);
				if (phan.length === 0) {
					console.log(`RANG CUN: ${man}${tham} khong co nhan tro nang nao`);
					process.exit(2);
				}
				chu.push(...phan);
			}
			const lang = await page.evaluate(() => document.documentElement.lang);
			await page.close();
			return { lang, chu };
		};
		const vi = await doc("vi");
		const en = await doc("en");
		if (vi.lang !== "vi" || en.lang !== "en") {
			console.log(`RANG CUN: lang lech (vi->${vi.lang}, en->${en.lang})`);
			process.exit(2);
		}
		const dem = (l) => {
			const m = new Map();
			for (const x of l) m.set(x, (m.get(x) ?? 0) + 1);
			return m;
		};
		const viDem = dem(vi.chu);
		const enDem = dem(en.chu);
		const duLieu = [...trung.set];
		const laDuLieu = (x) =>
			trung.set.has(x) || duLieu.some((d) => d.length > 2 && x.includes(d));
		const con = [...viDem.keys()]
			.filter((x) => enDem.has(x) && !laDuLieu(x) && !CHI_SO.test(x))
			.sort();
		const lan = con.reduce((n, x) => n + viDem.get(x), 0);
		console.log(
			`-- nhan chi trinh doc man hinh nghe: vi=${vi.chu.length} lan, en=${en.chu.length} lan`,
		);
		console.log(`-- CON LAI: ${con.length} chuoi / ${lan} lan`);
		for (const x of con) console.log(`   * ${JSON.stringify(x)}`);
		console.log(`ket qua: con lai=${lan} lan`);
		process.exit(lan > 0 ? 1 : 0);
	}

	if (chan === "doi-tieng") {
		const page = await browser.newPage();
		await page.setViewport({ width, height, deviceScaleFactor: 1 });
		await browser.setCookie(
			{
				name: cookie.name,
				value: cookie.value,
				domain: "localhost",
				path: "/",
			},
			{ name: "lang", value: "en", domain: "localhost", path: "/" },
		);
		await page.goto(`${APP}/${SLUG}/companies`, {
			waitUntil: "networkidle0",
			timeout: CHO_TAI,
		});
		await page.waitForSelector(
			'[data-slot="table-body"] [data-slot="table-row"]',
			{
				timeout: CHO_VE,
			},
		);

		const o = await page.$$(
			'[data-slot="table-body"] [data-slot="table-row"] [role="checkbox"]',
		);
		if (o.length === 0) {
			console.log(
				"RANG CUN: khong tim thay o danh dau de dung thanh chon dong",
			);
			process.exit(2);
		}
		await o[0].click();
		await new Promise((r) => setTimeout(r, 600));

		const doc = () => {
			const man = document.querySelector('[data-slot="page-shell"]');
			return {
				moc: performance.timeOrigin,
				chon: [
					...document.querySelectorAll(
						'[data-slot="table-body"] [role="checkbox"][data-state="checked"]',
					),
				].length,
				chu: man
					? man.textContent.replace(/\s+/g, " ").trim().slice(0, 400)
					: null,
			};
		};
		const truoc = await page.evaluate(doc);
		if (truoc.chon === 0) {
			console.log(
				"RANG CUN: chua chon duoc dong nao — thanh chon dong khong bat",
			);
			process.exit(2);
		}

		const nut = await page.$$("header button, button");
		let moduoc = false;
		for (const b of nut) {
			const co = await b.evaluate(
				(el) => el.getAttribute("aria-haspopup") === "menu",
			);
			if (!co) continue;
			await b.click().catch(() => {});
			await new Promise((r) => setTimeout(r, 500));
			const hang = await page.$$('[data-slot="dropdown-menu-item"]');
			for (const h of hang) {
				const t = await h.evaluate((el) => el.textContent.trim());
				if (t === "Tiếng Việt" || t === "Vietnamese" || t === "Tiếng Việt") {
					await h.click().catch(() => {});
					moduoc = true;
					break;
				}
			}
			if (moduoc) break;
			await page.keyboard.press("Escape").catch(() => {});
			await new Promise((r) => setTimeout(r, 200));
		}
		if (!moduoc) {
			console.log(
				"RANG CUN: khong tim thay hang doi tieng trong menu tai khoan",
			);
			process.exit(2);
		}
		await new Promise((r) => setTimeout(r, 2500));
		const sau = await page.evaluate(doc);

		const chuMoi = await page.evaluate(() => {
			const t = document.createElement("time");
			t.dateTime = new Date(Date.now() - 5 * 60_000).toISOString();
			t.setAttribute("data-local-date-kind", "relative-time");
			t.setAttribute(
				"data-local-date-value",
				new Date(Date.now() - 5 * 60_000).toISOString(),
			);
			t.textContent = "";
			document.body.appendChild(t);
			return new Promise((ok) => {
				setTimeout(() => ok(t.textContent ?? ""), 400);
			});
		});
		await page.close();

		const taiLai = truoc.moc !== sau.moc;
		const doiChu = truoc.chu !== sau.chu;
		const giuChon = sau.chon === truoc.chon;
		console.log(
			`-- truoc: ${truoc.chon} dong chon · ${JSON.stringify(truoc.chu?.slice(0, 70))}`,
		);
		console.log(
			`-- sau:   ${sau.chon} dong chon · ${JSON.stringify(sau.chu?.slice(0, 70))}`,
		);
		console.log(`   chu doi theo:            ${doiChu ? "co" : "KHONG"}`);
		console.log(
			`   trang KHONG tai lai:     ${taiLai ? "KHONG — da tai lai" : "dung"}`,
		);
		console.log(`   thanh chon dong con giu: ${giuChon ? "co" : "KHONG"}`);
		const DAU = /[ăâđêôơưáàảãạếềểễệíìỉĩịóòỏõọúùủũụ]/i;
		const chuThoiGianViet = DAU.test(chuMoi);
		console.log(
			`   chu thoi gian sau khi doi: ${JSON.stringify(chuMoi)} — ${chuThoiGianViet ? "tieng Viet" : "CON TIENG ANH"}`,
		);
		const hong =
			(doiChu ? 0 : 1) +
			(taiLai ? 1 : 0) +
			(giuChon ? 0 : 1) +
			(chuThoiGianViet ? 0 : 1);
		console.log(`ket qua: hong=${hong}`);
		process.exit(hong > 0 ? 1 : 0);
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
		if (process.env.XUAT) {
			const dong2 = (h) =>
				`| ${h.text} | ${h.boxWidth} | ${h.textWidth} | ${h.hien ?? h.text} | ${h.title ? "co" : "khong"} |`;
			appendFileSync(
				process.env.XUAT,
				`\n## ${DUONG} · ${width}px · tieng Viet\n| cot | be rong o | be rong chu | chu that hien ra | title |\n| --- | ---: | ---: | --- | --- |\n${vi.value.map(dong2).join("\n")}\n`,
			);
		}
		const nguong = width >= 1024 ? catTran + catCoBaCham : catTran;
		console.log(
			`ket qua ${width}px: cat tran=${catTran} · cat kem ba cham=${catCoBaCham} · tong=${vi.value.length} · hong=${nguong}`,
		);
		process.exit(nguong > 0 ? 1 : 0);
	}

	const trung = await duLieuThu(cookie);
	const scope =
		chan === "man"
			? [
					MAN,
					'[data-slot="dropdown-menu-content"]',
					'[data-slot="dropdown-menu-sub-content"]',
				]
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

	const con = [...viDem.keys()]
		.filter((s) => enDem.has(s) && dangXet(s))
		.sort();
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
		console.log(
			`   * ${JSON.stringify(s)}${viDem.get(s) > 1 ? ` x${viDem.get(s)}` : ""}`,
		);
	console.log(
		`-- KHONG MANG DAU TIENG VIET: chi co o ban vi ma khong dau (${khongDau.length} chuoi / ${lanKhongDau} lan)`,
	);
	for (const s of khongDau)
		console.log(
			`   * ${JSON.stringify(s)}${viDem.get(s) > 1 ? ` x${viDem.get(s)}` : ""}`,
		);
	console.log(
		`ket qua: con lai=${con.length} · khong dau=${khongDau.length} · lan=${lanCon + lanKhongDau}`,
	);
	process.exit(con.length + khongDau.length > 0 ? 1 : 0);
} finally {
	await browser.close();
}
