import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "kara-trang-thai-toan-crm";
const CHIEU_DO = process.argv.includes("--chieu-do");

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/man.mjs"`,
	);
	process.exit(2);
}

process.env.BANG_CHUNG ??= join(GOC, ".acceptance-runs", HO_SO, "evidence");
const NOI_GIU = join(GOC, "_acceptance", HO_SO, "evidence");

const { chay, HEP, MA, moDo, RONG } = await import(
	"../../kho-tai-lieu/rang/man-lib.mjs"
);
const { crmMessages } = await import(join(GOC, "apps/app/lib/messages/crm.ts"));
const { contactMessages } = await import(
	join(GOC, "apps/app/lib/messages/contacts.ts")
);
const { companyMessages } = await import(
	join(GOC, "apps/app/lib/messages/companies.ts")
);
const { dealMessages } = await import(
	join(GOC, "apps/app/lib/messages/deals.ts")
);

const VI = crmMessages("vi");
const DANH_TU = {
	contact: contactMessages("vi").noun,
	company: companyMessages("vi").noun,
	deal: dealMessages("vi").noun,
};
const THU_TUC = { contact: "contacts", company: "companies", deal: "deals" };
const THU_TUC_WEB = "tracking.contactActivity";

const d = await moDo();

async function nganDungYen(t) {
	let truoc = null;
	for (let lan = 0; lan < 40; lan += 1) {
		const x = await t.evaluate(() => {
			const n = document.querySelector(
				"[data-slot='sheet-content'],[data-slot='drawer-content']",
			);
			const r = n?.getBoundingClientRect();
			return r ? `${Math.round(r.x)}:${Math.round(r.y)}` : null;
		});
		if (x !== null && x === truoc) return;
		truoc = x;
		await new Promise((r) => setTimeout(r, 250));
	}
	throw new Error("ngan khong dung yen");
}

async function chupNgan(t, ten) {
	await nganDungYen(t);
	await t.screenshot({ path: join(process.env.BANG_CHUNG, ten) });
	console.log(`  anh ${ten}`);
}

async function choChu(t, chu, moTa) {
	try {
		await t.waitForFunction(
			(c) => (document.body.innerText ?? "").includes(c),
			{ timeout: 20_000 },
			chu,
		);
	} catch {
		throw new Error(`khong thay ${moTa}`);
	}
}

async function bamChu(t, sel, chu) {
	const ok = await t.evaluate(
		(s, c) => {
			const el = window
				.__tim(s)
				.find((e) => (e.innerText ?? e.textContent ?? "").trim() === c);
			return Boolean(el);
		},
		sel,
		chu,
	);
	if (!ok) throw new Error(`khong thay ${sel} «${chu}»`);
	const el = await t.evaluateHandle(
		(s, c) =>
			window
				.__tim(s)
				.find((e) => (e.innerText ?? e.textContent ?? "").trim() === c),
		sel,
		chu,
	);
	await el.click();
	await new Promise((r) => setTimeout(r, 800));
}

async function moMenu(t) {
	await nganDungYen(t);
	const el = await t.evaluateHandle(
		(c) =>
			[
				...document.querySelectorAll(
					"[data-slot='sheet-content'] button, [data-slot='drawer-content'] button",
				),
			].find((b) => (b.textContent ?? "").includes(c)),
		VI.sheet.moreActions,
	);
	if (!(await el.evaluate((x) => Boolean(x))))
		throw new Error("khong thay nut menu ngan");
	await el.click();
	await new Promise((r) => setTimeout(r, 600));
}

const docMan = (t) =>
	t.evaluate(() => {
		const tran = [];
		const goc = document.documentElement;
		if (goc.scrollWidth > goc.clientWidth + 1)
			tran.push(`trang ${goc.scrollWidth}>${goc.clientWidth}`);
		const ngan = document.querySelector(
			"[data-slot='sheet-content'],[data-slot='drawer-content']",
		);
		if (ngan && ngan.scrollWidth > ngan.clientWidth + 1)
			tran.push(`ngan ${ngan.scrollWidth}>${ngan.clientWidth}`);
		return { tran, chu: document.body.innerText ?? "" };
	});

async function chanWeb(t) {
	t.removeAllListeners("console");
	console.log(
		"  bo qua console cua trang nay: loi cua tracking.contactActivity la chinh kich thich cua buoc",
	);
	await t.setRequestInterception(true);
	t.on("request", (req) => {
		const url = new URL(req.url());
		const duong = url.pathname.replace(/^\/api\/trpc\//, "");
		if (
			!url.pathname.startsWith("/api/trpc/") ||
			!duong.includes(THU_TUC_WEB)
		) {
			req.continue();
			return;
		}
		const viTri = duong.split(",").indexOf(THU_TUC_WEB);
		const vao = JSON.parse(url.searchParams.get("input") ?? "{}");
		const muc = vao[String(viTri)];
		vao[String(viTri)] =
			muc && "json" in muc ? { json: { contactId: 0 } } : { contactId: 0 };
		url.searchParams.set("input", JSON.stringify(vao));
		req.continue({ url: url.toString() });
	});
}

async function moWebLoi(chu, rong, nguoi, ten) {
	const t = await d.moTrang(
		chu.cookie,
		rong,
		`/contacts?record=contact:${nguoi}&tab=activity`,
	);
	await chanWeb(t);
	const dich = new URL(t.url());
	dich.searchParams.set("tab", "overview");
	await t.goto(dich.toString(), { waitUntil: "load" });
	await choChu(t, VI.web.loiTieuDe, "khung loi hoat dong web");
	const m = await docMan(t);
	await chupNgan(t, ten);
	await t.close();
	return m;
}

async function gieo() {
	const cty = await d.db.company.create({
		data: { name: `Thép Hòa Phát ${MA}`, domain: `hoaphat-${MA}.test` },
		select: { id: true, name: true },
	});
	const nguoi = await d.db.contact.create({
		data: { firstName: "Hà", lastName: `Nguyễn ${MA}`, companyId: cty.id },
		select: { id: true },
	});
	return { cty, nguoi: nguoi.id };
}

try {
	const chu = await d.nguoiMoi("kts", "owner", "Phan Kiểm Thử");
	await d.batTrinhDuyet(chu.cookie);
	const { cty, nguoi } = await gieo();
	const thoaThuan = await d.lam(chu.cookie, "deals.create", {
		name: `Hợp đồng thép ${MA}`,
		companyId: cty.id,
		ownerId: chu.id,
		amountCents: null,
		expectedCloseDate: null,
	});
	const tenNguoi = `Hà Nguyễn ${MA}`;

	if (chay(1))
		await d.chayBuoc(1, async () => {
			const m = await moWebLoi(chu, RONG, nguoi, "kts-web-loi-1440.png");
			const loi = [];
			if (!m.chu.includes(VI.web.loiTieuDe))
				loi.push("khong thay khung loi web");
			if (!m.chu.includes("Thử lại")) loi.push("khong thay Thu lai");
			d.dat(1, loi.length === 0, loi.join(" · "));
		});

	if (chay(2))
		await d.chayBuoc(2, async () => {
			const loi = [];
			for (const [loai, id, ten] of [
				["contact", nguoi, tenNguoi],
				["company", cty.id, cty.name],
				["deal", thoaThuan.id, thoaThuan.name ?? `Hợp đồng thép ${MA}`],
			]) {
				const t = await d.moTrang(
					chu.cookie,
					RONG,
					`/contacts?record=${loai}:${id}`,
				);
				await moMenu(t);
				await bamChu(t, "[role=menuitem]", VI.sheet.archive(DANH_TU[loai]));
				await choChu(t, VI.sheet.archived(ten), `toast luu tru ${loai}`);
				const daLuu = await d.hoi(chu.cookie, `${THU_TUC[loai]}.byId`, { id });
				if (daLuu.archivedAt == null) loi.push(`${loai}: chua luu tru`);
				if (loai === "contact") await chupNgan(t, "kts-toast-luu-tru-1440.png");
				if (!CHIEU_DO) await bamChu(t, "button", VI.sheet.hoanTac);
				await new Promise((r) => setTimeout(r, 1500));
				const sau = await d.hoi(chu.cookie, `${THU_TUC[loai]}.byId`, { id });
				if (sau.archivedAt != null)
					loi.push(`luu-tru: sau hoan tac van con ngay luu tru (${loai})`);
				else
					console.log(`  luu-tru ${loai}: da luu tru -> hoan tac -> dang dung`);
				if (loai === "contact") await chupNgan(t, "kts-sau-hoan-tac-1440.png");
				await t.close();
			}
			d.dat(2, loi.length === 0, loi.join(" · "));
		});

	if (chay(3))
		await d.chayBuoc(3, async () => {
			const loi = [];
			const m1 = await moWebLoi(chu, HEP, nguoi, "kts-web-loi-390.png");
			if (m1.tran.length > 0)
				loi.push(`390 web loi tran: ${m1.tran.join(", ")}`);
			if (!m1.chu.includes(VI.web.loiTieuDe))
				loi.push("390 khong thay khung loi web");
			const t = await d.moTrang(
				chu.cookie,
				HEP,
				`/contacts?record=contact:${nguoi}`,
			);
			await moMenu(t);
			await bamChu(t, "[role=menuitem]", VI.sheet.archive(DANH_TU.contact));
			await choChu(t, VI.sheet.archived(tenNguoi), "toast luu tru 390");
			const nut = await t.evaluate((c) => {
				const b = window
					.__tim("button")
					.find((e) => (e.innerText ?? "").trim() === c);
				const r = b?.getBoundingClientRect();
				return r
					? {
							trong:
								r.left >= 0 &&
								r.right <= document.documentElement.clientWidth + 1,
						}
					: null;
			}, VI.sheet.hoanTac);
			if (!nut?.trong) loi.push("390 nut Hoan tac ngoai khung nhin");
			const m2 = await docMan(t);
			if (m2.tran.length > 0) loi.push(`390 toast tran: ${m2.tran.join(", ")}`);
			await chupNgan(t, "kts-toast-luu-tru-390.png");
			await bamChu(t, "button", VI.sheet.hoanTac);
			await t.close();
			d.dat(3, loi.length === 0, loi.join(" · "));
		});

	mkdirSync(NOI_GIU, { recursive: true });
	for (const ten of [
		"kts-web-loi-1440.png",
		"kts-toast-luu-tru-1440.png",
		"kts-sau-hoan-tac-1440.png",
		"kts-web-loi-390.png",
		"kts-toast-luu-tru-390.png",
	]) {
		const nguon = join(process.env.BANG_CHUNG, ten);
		if (existsSync(nguon) && !CHIEU_DO) copyFileSync(nguon, join(NOI_GIU, ten));
	}

	await d.ket("kara-trang-thai-toan-crm man");
} catch (e) {
	await d.khongDoDuoc(e);
}
