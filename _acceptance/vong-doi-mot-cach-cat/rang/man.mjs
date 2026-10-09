import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "vong-doi-mot-cach-cat";
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
	"vdc-ngan-da-cat-1440.png",
	"vdc-ngan-da-cat-390.png",
	"vdc-kanban-1440.png",
	"vdc-kanban-390.png",
	"vdc-hoan-tac-loat-1440.png",
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
const { messages: uiMessages } = await import(
	join(GOC, "packages/ui/src/lib/messages.ts")
);

const VI = crmMessages("vi");
const DEAL = dealMessages("vi");
const RS = recordSheetMessages("vi");
const CHON_TAT_CA = uiMessages("vi").table.selectAllRows;

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

const trongKhung = (t, chu, trong = "body") =>
	t.evaluate(
		(c, goc) => {
			const b = [...document.querySelectorAll(`${goc} button`)].find(
				(x) => (x.textContent ?? "").trim() === c,
			);
			const r = b?.getBoundingClientRect();
			return r
				? r.left >= 0 &&
						r.right <= document.documentElement.clientWidth + 1 &&
						r.top >= 0 &&
						r.bottom <= window.innerHeight + 1
				: false;
		},
		chu,
		trong,
	);

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

async function gieoThoaThuan(chu, daCat) {
	const congTy = await d.db.company.create({
		data: { name: `Công ty lưu trữ ${MA}` },
		select: { id: true },
	});
	const deal = await d.db.deal.create({
		data: {
			name: `Thoả thuận đã cất ${MA} ${Math.random().toString(36).slice(2, 6)}`,
			companyId: congTy.id,
			ownerId: chu.id,
			createdAt: new Date("2026-09-01T03:00:00.000Z"),
			stageChangedAt: new Date("2026-09-01T03:00:00.000Z"),
			archivedAt: daCat ? new Date("2026-09-15T03:00:00.000Z") : null,
		},
		select: { id: true, name: true, updatedAt: true },
	});
	return deal;
}

async function moNganDaCat(chu, rong, deal) {
	const t = await d.moTrang(chu.cookie, rong, `/deals?record=deal:${deal.id}`);
	await choThay(
		t,
		() => document.querySelector("[data-dai-luu-tru]") !== null,
		null,
		"dai luu tru",
	);
	return t;
}

async function kiemNgan(t, deal, loi) {
	const dai = await t.evaluate(
		() => document.querySelector("[data-dai-luu-tru]")?.innerText ?? "",
	);
	if (!dai.includes(VI.sheet.daLuuTruNgay))
		loi.push("dai thieu chu Da luu tru ngay");
	if (!dai.includes(VI.bulk.restore)) loi.push("dai thieu nut Khoi phuc");
	const oTen = await t.evaluate((nhan) => {
		const tab = document.querySelector(
			'[role="tabpanel"][data-state="active"]',
		);
		const l = [...(tab?.querySelectorAll("label") ?? [])].find(
			(x) => (x.textContent ?? "").trim() === nhan,
		);
		const b = l?.parentElement?.querySelector("button");
		return b ? b.matches(":disabled") : null;
	}, RS.deal.fields.name);
	if (oTen !== true) loi.push(`o ten khong tat (${oTen})`);
	for (const nhan of [RS.deal.fields.name, RS.deal.description]) {
		const truoc = await t.evaluate(
			(sel) =>
				document.querySelectorAll(
					`${sel} input:not([type=hidden]), ${sel} textarea, [role=listbox]`,
				).length,
			NGAN,
		);
		await t.evaluate((n) => {
			const tab = document.querySelector(
				'[role="tabpanel"][data-state="active"]',
			);
			const l = [...(tab?.querySelectorAll("label") ?? [])].find(
				(x) => (x.textContent ?? "").trim() === n,
			);
			const b =
				l?.parentElement?.querySelector("button") ??
				tab?.querySelector(`[aria-label="${n}"]`);
			b?.scrollIntoView({ block: "center" });
		}, nhan);
		const vung = await t.evaluateHandle((n) => {
			const tab = document.querySelector(
				'[role="tabpanel"][data-state="active"]',
			);
			const l = [...(tab?.querySelectorAll("label") ?? [])].find(
				(x) => (x.textContent ?? "").trim() === n,
			);
			return (
				l?.parentElement?.querySelector("button") ??
				tab?.querySelector(`[aria-label="${n}"]`) ??
				null
			);
		}, nhan);
		if (await vung.evaluate((x) => Boolean(x))) {
			const r = await vung.evaluate((x) => {
				const b = x.getBoundingClientRect();
				return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
			});
			await t.mouse.click(r.x, r.y);
			await cho(400);
			await t.keyboard.type(" sua thu");
			await t.keyboard.press("Enter");
			await cho(600);
		} else loi.push(`khong thay o ${nhan}`);
		const mo = await t.evaluate(
			(sel) =>
				document.querySelectorAll(
					`${sel} input:not([type=hidden]), ${sel} textarea, [role=listbox]`,
				).length,
			NGAN,
		);
		if (mo > truoc) loi.push(`bam ${nhan} mo cho sua (${truoc} -> ${mo})`);
	}
	const sau = await d.db.deal.findUniqueOrThrow({
		where: { id: deal.id },
		select: { updatedAt: true },
	});
	if (sau.updatedAt.getTime() !== deal.updatedAt.getTime())
		loi.push("updatedAt doi sau khi bam o");
}

async function doiChungDangDung(chu, loi) {
	const deal = await gieoThoaThuan(chu, false);
	const t = await d.moTrang(chu.cookie, RONG, `/deals?record=deal:${deal.id}`);
	await choThay(
		t,
		(n) => document.body.innerText.includes(n),
		deal.name,
		"thoa thuan dang dung",
	);
	const o = await t.evaluateHandle((n) => {
		const tab = document.querySelector(
			'[role="tabpanel"][data-state="active"]',
		);
		const l = [...(tab?.querySelectorAll("label") ?? [])].find(
			(x) => (x.textContent ?? "").trim() === n,
		);
		return l?.parentElement?.querySelector("button") ?? null;
	}, RS.deal.fields.name);
	if (!(await o.evaluate((x) => Boolean(x)))) {
		loi.push("doi chung: khong thay o ten");
		await t.close();
		return;
	}
	await o.evaluate((x) => x.scrollIntoView({ block: "center" }));
	await o.click();
	await cho(400);
	const moO = await t.evaluate(
		(sel) =>
			document.querySelectorAll(`${sel} input:not([type=hidden])`).length,
		NGAN,
	);
	if (moO === 0) loi.push("doi chung: bam o ten khong mo cho sua");
	await t.keyboard.type(" sua thu");
	await t.keyboard.press("Enter");
	let doi = false;
	for (let lan = 0; lan < 20 && !doi; lan += 1) {
		await cho(300);
		const sau = await d.db.deal.findUniqueOrThrow({
			where: { id: deal.id },
			select: { updatedAt: true },
		});
		doi = sau.updatedAt.getTime() !== deal.updatedAt.getTime();
	}
	if (!doi) loi.push("doi chung: sua o ten khong ghi xuong db");
	console.log(`  doi chung dang dung: mo cho sua ${moO > 0}, ghi db ${doi}`);
	await t.close();
}

async function kanban(chu, rong, ten, loi) {
	const t = await d.moTrang(chu.cookie, rong, "/deals?view=board");
	await choThay(
		t,
		(c) =>
			[...document.querySelectorAll("button")].some(
				(b) => (b.textContent ?? "").trim() === c,
			),
		DEAL.archivedToggle,
		"nut Da luu tru tren Kanban",
	);
	await chup(t, ten);
	return t;
}

try {
	const chu = await d.nguoiMoi("vdc", "owner", "Phan Kiểm Vòng Đời");
	await d.batTrinhDuyet(chu.cookie);

	if (chay(1))
		await d.chayBuoc(1, async () => {
			const loi = [];
			const deal = await gieoThoaThuan(chu, !CHIEU_DO);
			const t = await moNganDaCat(chu, RONG, deal);
			await kiemNgan(t, deal, loi);
			await chup(t, "vdc-ngan-da-cat-1440.png");
			await t.close();
			if (!CHIEU_DO) await doiChungDangDung(chu, loi);
			d.dat(1, loi.length === 0, loi.join(" · "));
		});

	if (chay(2))
		await d.chayBuoc(2, async () => {
			const loi = [];
			const deal = await gieoThoaThuan(chu, true);
			const t = await kanban(chu, RONG, "vdc-kanban-1440.png", loi);
			const truocBam = await t.evaluate(
				(ten) => document.body.innerText.includes(ten),
				deal.name,
			);
			if (truocBam) loi.push("Kanban hien ca thoa thuan da cat truoc khi bam");
			await bamNut(t, DEAL.archivedToggle);
			await choThay(
				t,
				(ten) => document.body.innerText.includes(ten),
				deal.name,
				"thoa thuan da cat trong bang",
			);
			const url = new URL(t.url());
			if (url.searchParams.get("archived") !== "true")
				loi.push(`url khong co archived=true (${url.search})`);
			await t.close();
			d.dat(2, loi.length === 0, loi.join(" · "));
		});

	if (chay(3))
		await d.chayBuoc(3, async () => {
			const loi = [];
			const deal = await gieoThoaThuan(chu, true);
			const t = await moNganDaCat(chu, HEP, deal);
			const tran = await tranNgang(t);
			if (tran.length > 0) loi.push(`ngan tran ${tran.join(", ")}`);
			if (!(await trongKhung(t, VI.bulk.restore, "[data-dai-luu-tru]")))
				loi.push("Khoi phuc ngoai khung nhin");
			await chup(t, "vdc-ngan-da-cat-390.png");
			await t.close();
			const k = await kanban(chu, HEP, "vdc-kanban-390.png", loi);
			const tranK = await tranNgang(k);
			if (tranK.length > 0) loi.push(`kanban tran ${tranK.join(", ")}`);
			if (!(await trongKhung(k, DEAL.archivedToggle)))
				loi.push("Da luu tru ngoai khung nhin");
			await k.close();
			console.log(
				`  390: ${loi.length === 0 ? "khong tran, nut trong khung" : loi.join(", ")}`,
			);
			d.dat(3, loi.length === 0, loi.join(" · "));
		});

	if (chay(4))
		await d.chayBuoc(4, async () => {
			const loi = [];
			const deal = await gieoThoaThuan(chu, true);
			const t = await moNganDaCat(chu, RONG, deal);
			await bamNut(t, VI.bulk.restore, "[data-dai-luu-tru]");
			await choThay(
				t,
				() => document.querySelector("[data-dai-luu-tru]") === null,
				null,
				"dai mat sau khoi phuc",
			);
			const sau = await d.db.deal.findUniqueOrThrow({
				where: { id: deal.id },
				select: { archivedAt: true },
			});
			if (sau.archivedAt !== null) loi.push("archivedAt van con");
			await t.close();
			d.dat(4, loi.length === 0, loi.join(" · "));
		});

	if (chay(5))
		await d.chayBuoc(5, async () => {
			const loi = [];
			const nguoi = [];
			for (const i of [1, 2, 3])
				nguoi.push(
					await d.db.contact.create({
						data: { firstName: `Lan ${i}`, lastName: `Hoàn tác ${MA}` },
						select: { id: true },
					}),
				);
			const t = await d.moTrang(
				chu.cookie,
				RONG,
				`/contacts?q=${encodeURIComponent(MA)}`,
			);
			await choThay(
				t,
				() => document.querySelectorAll("tbody tr").length >= 3,
				null,
				"ba ca nhan trong bang",
			);
			const chonHet = await t.$(`[aria-label="${CHON_TAT_CA}"]`);
			if (!chonHet) throw new Error("man: khong thay o chon tat ca");
			await chonHet.click();
			await cho(400);
			await bamNut(t, VI.bulkMenu.actions);
			await choThay(
				t,
				(c) =>
					[...document.querySelectorAll("[role=menuitem]")].some(
						(e) => (e.textContent ?? "").trim() === c,
					),
				VI.bulk.archive,
				"muc Luu tru",
			);
			const muc = await t.evaluateHandle(
				(c) =>
					[...document.querySelectorAll("[role=menuitem]")].find(
						(e) => (e.textContent ?? "").trim() === c,
					),
				VI.bulk.archive,
			);
			await muc.click();
			try {
				await t.waitForFunction(
					() => document.querySelectorAll("tbody tr").length < 3,
					{ timeout: 20_000 },
				);
			} catch {
				loi.push("ba dong khong roi bang sau luu tru");
			}
			await choThay(
				t,
				(c) =>
					[...document.querySelectorAll("[data-sonner-toaster] button")].some(
						(b) => (b.textContent ?? "").trim() === c,
					),
				VI.sheet.hoanTac,
				"Hoan tac tren toast",
			);
			await cho(800);
			if (!(await trongKhung(t, VI.sheet.hoanTac, "[data-sonner-toaster]")))
				loi.push("Hoan tac ngoai khung nhin");
			await bamNut(t, VI.sheet.hoanTac, "[data-sonner-toaster]");
			await choThay(
				t,
				() => document.querySelectorAll("tbody tr").length >= 3,
				null,
				"ba dong co lai",
			);
			await cho(500);
			const conCat = await d.db.contact.count({
				where: {
					id: { in: nguoi.map((x) => x.id) },
					archivedAt: { not: null },
				},
			});
			if (conCat !== 0) loi.push(`${conCat} ca nhan con luu tru`);
			await chup(t, "vdc-hoan-tac-loat-1440.png");
			await t.close();
			d.dat(5, loi.length === 0, loi.join(" · "));
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
