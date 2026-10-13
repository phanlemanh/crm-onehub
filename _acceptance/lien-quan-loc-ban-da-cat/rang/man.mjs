import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "lien-quan-loc-ban-da-cat";
const CHIEU_DO = process.argv.includes("--chieu-do");

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/man.mjs"`,
	);
	process.exit(2);
}

process.env.BANG_CHUNG ??= join(GOC, ".acceptance-runs", HO_SO, "evidence");
const NOI_GIU = join(GOC, "_acceptance", HO_SO, "evidence");
const HOP_DONG = join(GOC, "_acceptance", HO_SO, "contract.md");
const DA_THONG_CONG = new Set(["signed-off", "machine-cleared"]);
const ANH = [
	"lqc-gap-1440.png",
	"lqc-mo-1440.png",
	"lqc-ngan-cat-1440.png",
	"lqc-gap-390.png",
	"lqc-mo-390.png",
];
const NGAN = "[data-slot='sheet-content'],[data-slot='drawer-content']";

const { chay, HEP, MA, moDo, RONG } = await import(
	"../../kho-tai-lieu/rang/man-lib.mjs"
);
const { crmMessages } = await import(join(GOC, "apps/app/lib/messages/crm.ts"));
const { dealMessages } = await import(
	join(GOC, "apps/app/lib/messages/deals.ts")
);
const { recordSheetMessages } = await import(
	join(GOC, "apps/app/lib/messages/record-sheet.ts")
);

const VI = crmMessages("vi");
const RS = recordSheetMessages("vi");
const DEAL = dealMessages("vi");

const d = await moDo();

const cho = (ms) => new Promise((r) => setTimeout(r, ms));

async function yen(t) {
	let truoc = null;
	for (let lan = 0; lan < 40; lan += 1) {
		const x = await t.evaluate((sel) => {
			const r = document.querySelector(sel)?.getBoundingClientRect();
			return r ? `${Math.round(r.x)}:${Math.round(r.y)}` : "khong-ngan";
		}, NGAN);
		if (x === truoc) return;
		truoc = x;
		await cho(250);
	}
}

async function chup(t, ten) {
	await t.evaluate(() => {
		for (const e of document.querySelectorAll(
			"nextjs-portal, [data-nextjs-toast], .tsqd-parent-container, .tsqd-open-btn-container",
		))
			e.remove();
	});
	await yen(t);
	await t.screenshot({ path: join(process.env.BANG_CHUNG, ten) });
	console.log(`  anh ${ten}`);
}

async function choThay(t, ham, arg, moTa, ms = 20_000) {
	try {
		await t.waitForFunction(ham, { timeout: ms }, arg);
	} catch {
		throw new Error(`man: khong thay ${moTa}`);
	}
}

async function bamNut(t, chu, trong = "body") {
	const nut = await t.evaluateHandle(
		(c, goc) =>
			[...document.querySelectorAll(`${goc} button`)].find(
				(b) => (b.textContent ?? "").trim() === c,
			) ?? null,
		chu,
		trong,
	);
	if (!(await nut.evaluate((x) => Boolean(x))))
		throw new Error(`man: khong thay nut «${chu}»`);
	await nut.evaluate((x) => x.scrollIntoView({ block: "center" }));
	await cho(200);
	await nut.click();
}

const tranNgang = (t) =>
	t.evaluate((sel) => {
		const ra = [];
		const goc = document.documentElement;
		if (goc.scrollWidth > goc.clientWidth + 1)
			ra.push(`trang ${goc.scrollWidth}>${goc.clientWidth}`);
		const n = document.querySelector(sel);
		if (n && n.scrollWidth > n.clientWidth + 1)
			ra.push(`ngan ${n.scrollWidth}>${n.clientWidth}`);
		return ra;
	}, NGAN);

const loiDongGap = (t, nhanGap) =>
	t.evaluate(
		(sel, nhan) => {
			const ngan = document.querySelector(sel)?.getBoundingClientRect();
			if (!ngan) return ["khong thay ngan"];
			const mep = Math.min(ngan.right, document.documentElement.clientWidth);
			const nut = [...document.querySelectorAll("button")].find(
				(b) => (b.textContent ?? "").trim() === nhan,
			);
			const vat = [
				...(nut ? [nut, ...nut.querySelectorAll("*")] : []),
				...document.querySelectorAll("[data-da-luu-tru], [data-da-luu-tru] *"),
			];
			if (!nut) return ["khong thay nut gap"];
			return vat
				.filter((e) => e.getClientRects().length)
				.filter((e) => e.getBoundingClientRect().right > mep + 0.5)
				.map(
					(e) =>
						`${e.tagName.toLowerCase()} ${(e.textContent ?? "").trim().slice(0, 30)} ${Math.round(e.getBoundingClientRect().right)}>${Math.round(mep)}`,
				);
		},
		NGAN,
		nhanGap,
	);

const dongTrongTab = (t) =>
	t.evaluate(() => {
		const tab = document.querySelector(
			'[role="tabpanel"][data-state="active"]',
		);
		return tab?.innerText ?? "";
	});

async function gieo(chu, coCat) {
	const congTy = await d.lam(chu.cookie, "companies.create", {
		name: `Công ty liên quan ${MA} ${Math.random().toString(36).slice(2, 6)}`,
	});
	const tao = (ten) =>
		d.lam(chu.cookie, "deals.create", {
			name: `${ten} ${MA}`,
			companyId: congTy.id,
			ownerId: chu.id,
		});
	const dangDung = await tao("Thoả thuận đang chạy");
	const cat = [];
	if (coCat) {
		for (const ten of ["Thoả thuận đã cất một", "Thoả thuận đã cất hai"]) {
			const deal = await tao(ten);
			await d.lam(chu.cookie, "deals.archive", { id: deal.id });
			cat.push(deal);
		}
		const nguoi = await d.lam(chu.cookie, "contacts.create", {
			firstName: "Người đã cất",
			lastName: MA,
			companyId: congTy.id,
		});
		await d.lam(chu.cookie, "contacts.archive", { id: nguoi.id });
	}
	return { congTy, dangDung, cat };
}

async function moTabThoaThuan(chu, rong, congTyId) {
	const t = await d.moTrang(
		chu.cookie,
		rong,
		`/companies?record=company:${congTyId}&tab=deals`,
	);
	await choThay(
		t,
		() =>
			document.querySelector('[role="tabpanel"][data-state="active"]') !== null,
		null,
		"tab Thoa thuan cua ngan cong ty",
	);
	return t;
}

async function kiemGap(t, g, n, loi) {
	const nhan = RS.archivedRows.toggle(String(n));
	await choThay(
		t,
		(c) =>
			[...document.querySelectorAll("button")].some(
				(b) => (b.textContent ?? "").trim() === c,
			),
		nhan,
		"dong gap",
	);
	const chu = await dongTrongTab(t);
	if (!chu.includes(g.dangDung.name)) loi.push("thieu thoa thuan dang dung");
	for (const c of g.cat)
		if (chu.includes(c.name))
			loi.push(`thoa thuan da cat lan vao bang: ${c.name}`);
	return nhan;
}

async function kiemMo(t, g, loi) {
	await choThay(
		t,
		(n) => document.querySelectorAll("[data-da-luu-tru]").length === n,
		g.cat.length,
		"dong da cat mo ra",
	);
	const chu = await dongTrongTab(t);
	if (!chu.includes(RS.archivedRows.on)) loi.push("dong da cat thieu ngay cat");
	for (const c of g.cat)
		if (!chu.includes(c.name)) loi.push(`dong mo thieu ${c.name}`);
}

async function buocMot(chu, rong, hau, loi) {
	const g = await gieo(chu, !CHIEU_DO);
	const t = await moTabThoaThuan(chu, rong, g.congTy.id);
	const nhan = await kiemGap(t, g, 2, loi);
	await chup(t, `lqc-gap-${hau}.png`);
	await bamNut(t, nhan);
	await kiemMo(t, g, loi);
	if (rong < 500) {
		const lo = await loiDongGap(t, nhan);
		if (lo.length) loi.push(`dong gap tran o ${rong}: ${lo.join(", ")}`);
		const tran = await tranNgang(t);
		if (tran.length)
			console.log(
				`  khung co san (gioi han da biet, NM1b): ${tran.join(", ")}`,
			);
	}
	await chup(t, `lqc-mo-${hau}.png`);
	return { t, g };
}

try {
	const chu = await d.nguoiMoi("lqc", "owner", "Phan Kiểm Liên Quan");
	await d.batTrinhDuyet(chu.cookie);

	if (chay(1))
		await d.chayBuoc(1, async () => {
			const loi = [];
			const { t, g } = await buocMot(chu, RONG, "1440", loi);
			const dau = g.cat.at(-1);
			await bamNut(t, dau.name, "[data-da-luu-tru]");
			await choThay(
				t,
				(id) =>
					new URL(location.href).searchParams
						.get("record")
						?.endsWith(`deal:${id}`) ?? false,
				dau.id,
				"duong dan mo ngan thoa thuan da cat",
			);
			await choThay(
				t,
				() => document.querySelector("[data-dai-luu-tru]") !== null,
				null,
				"dai luu tru cua ngan thoa thuan da cat",
			);
			await chup(t, "lqc-ngan-cat-1440.png");
			await t.close();
			d.dat(1, loi.length === 0, loi.join(" · "));
		});

	if (chay(2))
		await d.chayBuoc(2, async () => {
			const loi = [];
			const g = await gieo(chu, true);
			const t = await d.moTrang(
				chu.cookie,
				RONG,
				`/deals?record=deal:${g.dangDung.id}`,
			);
			await choThay(
				t,
				(ten) => document.body.innerText.includes(ten),
				g.dangDung.name,
				"ngan thoa thuan dang dung",
			);
			const menu = await t.evaluateHandle(
				(c) =>
					[...document.querySelectorAll('button[aria-haspopup="menu"]')].find(
						(b) =>
							(b.textContent ?? "").includes(c) ||
							b.getAttribute("aria-label") === c,
					) ?? null,
				VI.sheet.moreActions,
			);
			if (!(await menu.evaluate((x) => Boolean(x))))
				throw new Error("man: khong thay menu ngan");
			await menu.click();
			const mucLuuTru = VI.sheet.archive(DEAL.noun);
			await choThay(
				t,
				() => document.querySelectorAll("[role=menuitem]").length > 0,
				null,
				"menu ngan mo",
			);
			const muc = await t.evaluateHandle(
				(c) =>
					[...document.querySelectorAll("[role=menuitem]")].find(
						(e) => (e.textContent ?? "").trim() === c,
					) ?? null,
				mucLuuTru,
			);
			if (!(await muc.evaluate((x) => Boolean(x))))
				throw new Error("man: khong thay muc Luu tru");
			await muc.click();
			await choThay(
				t,
				() => document.querySelector("[data-dai-luu-tru]") !== null,
				null,
				"dai luu tru sau khi cat",
			);
			await t.close();
			const t2 = await moTabThoaThuan(chu, RONG, g.congTy.id);
			const nhan = RS.archivedRows.toggle("3");
			await choThay(
				t2,
				(c) =>
					[...document.querySelectorAll("button")].some(
						(b) => (b.textContent ?? "").trim() === c,
					),
				nhan,
				"dong gap +3 sau khi cat",
			);
			const chuTab = await dongTrongTab(t2);
			if (chuTab.includes(g.dangDung.name))
				loi.push("thoa thuan vua cat van o bang dang dung");
			await t2.close();
			d.dat(2, loi.length === 0, loi.join(" · "));
		});

	if (chay(3))
		await d.chayBuoc(3, async () => {
			const loi = [];
			const { t } = await buocMot(chu, HEP, "390", loi);
			await t.close();
			d.dat(3, loi.length === 0, loi.join(" · "));
		});

	const trangThai =
		/^status:\s*(\S+)/m.exec(readFileSync(HOP_DONG, "utf8"))?.[1] ?? "";
	const daThongCong = DA_THONG_CONG.has(trangThai);
	if (daThongCong)
		console.log(
			`  ho so ${trangThai}: khong chep anh sang _acceptance/${HO_SO}/evidence/ — anh o ${process.env.BANG_CHUNG}`,
		);
	if (!daThongCong && !CHIEU_DO) {
		mkdirSync(NOI_GIU, { recursive: true });
		for (const ten of ANH) {
			const nguon = join(process.env.BANG_CHUNG, ten);
			if (existsSync(nguon)) copyFileSync(nguon, join(NOI_GIU, ten));
		}
	}

	await d.ket(`${HO_SO} man`);
} catch (e) {
	await d.khongDoDuoc(e);
}
