import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "luu-tru-truong-khong-hoi";
const CHIEU_DO = process.argv.includes("--chieu-do");
const CHIEU_DO_API = process.argv.includes("--chieu-do-api");

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
	"ltk-toast-1440.png",
	"ltk-hoan-tac-1440.png",
	"ltk-toast-390.png",
	"ltk-ngan-1440.png",
];
const NGAN = "[data-slot='sheet-content'],[data-slot='drawer-content']";

const { chay, HEP, MA, moDo, RONG } = await import(
	"../../kho-tai-lieu/rang/man-lib.mjs"
);
const { crmMessages } = await import(join(GOC, "apps/app/lib/messages/crm.ts"));

const VI = crmMessages("vi");

const d = await moDo();

const cho = (ms) => new Promise((r) => setTimeout(r, ms));

async function chup(t, ten) {
	await t.evaluate(() => {
		for (const e of document.querySelectorAll(
			"nextjs-portal, [data-nextjs-toast], .tsqd-parent-container, .tsqd-open-btn-container",
		))
			e.remove();
	});
	await cho(400);
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

async function bamPhanTu(t, timPhanTu, arg, moTa) {
	const nut = await t.evaluateHandle(timPhanTu, arg);
	if (!(await nut.evaluate((x) => Boolean(x))))
		throw new Error(`man: khong thay ${moTa}`);
	await nut.evaluate((x) => x.scrollIntoView({ block: "center" }));
	await cho(200);
	await nut.click();
	await cho(300);
}

const timNutChu = ([chu, goc]) =>
	[...document.querySelectorAll(`${goc} button`)].find(
		(b) => (b.textContent ?? "").trim() === chu,
	) ?? null;

const timMenuDong = (nhan) =>
	[...document.querySelectorAll("button")].find(
		(b) => b.querySelector(".sr-only")?.textContent?.trim() === nhan,
	) ?? null;

const timMucMenu = (chu) =>
	[...document.querySelectorAll("[role=menuitem]")].find(
		(e) => (e.textContent ?? "").trim() === chu,
	) ?? null;

const soHopHoi = (t) =>
	t.evaluate(() => document.querySelectorAll('[role="alertdialog"]').length);

const trongKhung = (t, chu) =>
	t.evaluate((c) => {
		const b = [
			...document.querySelectorAll("[data-sonner-toaster] button"),
		].find((x) => (x.textContent ?? "").trim() === c);
		const r = b?.getBoundingClientRect();
		return r
			? r.left >= 0 &&
					r.right <= document.documentElement.clientWidth + 1 &&
					r.top >= 0 &&
					r.bottom <= window.innerHeight + 1
			: false;
	}, chu);

async function nhomCua(t, nhan, goc) {
	return t.evaluate(
		async ([n, g, menu, tieuDe, khoiPhuc]) => {
			const vung = document.querySelector(g) ?? document.body;
			const dangDung = [...vung.querySelectorAll("button")].some(
				(b) => b.querySelector(".sr-only")?.textContent?.trim() === menu,
			);
			const nutGap = [...vung.querySelectorAll("button")].find((b) =>
				(b.textContent ?? "").trim().startsWith(tieuDe),
			);
			if (nutGap && nutGap.getAttribute("aria-expanded") !== "true") {
				nutGap.click();
				await new Promise((r) => setTimeout(r, 400));
			}
			const daCat = [...vung.querySelectorAll("li")].some(
				(li) =>
					[...li.querySelectorAll("span")].some(
						(sp) => (sp.textContent ?? "").trim() === n,
					) &&
					[...li.querySelectorAll("button")].some(
						(b) => (b.textContent ?? "").trim() === khoiPhuc,
					),
			);
			return { dangDung, daCat };
		},
		[
			nhan,
			goc,
			VI.fields.moreFor(nhan),
			VI.fields.archivedRow,
			VI.fields.restore,
		],
	);
}

async function kiemNhomCat(t, nhan, goc, loi, buoc) {
	await cho(1200);
	const n = await nhomCua(t, nhan, goc);
	if (n.dangDung || !n.daCat)
		loi.push(
			`man: truong khong sang nhom Da luu tru (${buoc}: dang dung ${n.dangDung}, da luu tru ${n.daCat})`,
		);
}

async function kiemNhomVe(t, nhan, goc, loi, buoc) {
	for (let lan = 0; lan < 20; lan += 1) {
		const n = await nhomCua(t, nhan, goc);
		if (n.dangDung && !n.daCat) return;
		await cho(500);
	}
	const n = await nhomCua(t, nhan, goc);
	loi.push(
		`man: truong khong ve nhom dang dung (${buoc}: dang dung ${n.dangDung}, da luu tru ${n.daCat})`,
	);
}

async function taoTruong(chu, so) {
	return d.lam(chu.cookie, "fields.create", {
		entity: "COMPANY",
		label: `ZZ ltk ${so} ${MA}`,
		type: "TEXT",
		agentFilled: false,
	});
}

async function daCat(chu, id) {
	const ds = await d.hoi(chu.cookie, "fields.list", {
		entity: "COMPANY",
		includeArchived: true,
	});
	const f = ds.find((x) => x.id === id);
	if (!f) throw new Error(`man: may chu khong tra truong ${id}`);
	return f.archived === true;
}

async function choToastCat(t, nhan) {
	if (CHIEU_DO) throw new Error("man: khong thay toast luu tru");
	await choThay(
		t,
		(c) =>
			(
				document.querySelector("[data-sonner-toaster]")?.textContent ?? ""
			).includes(c),
		VI.fields.archived(nhan),
		"toast luu tru",
	);
}

async function hoanTac(t, chu, f, loi, buoc) {
	if (!(await daCat(chu, f.id)))
		loi.push(`${buoc}: may chu chua bao truong da luu tru sau «Lưu trữ»`);
	if (!CHIEU_DO_API)
		await bamPhanTu(
			t,
			timNutChu,
			[VI.sheet.hoanTac, "[data-sonner-toaster]"],
			"nut Hoan tac",
		);
	await cho(1500);
	if (await daCat(chu, f.id))
		throw new Error("man: hoan tac khong khoi phuc tren may chu");
}

try {
	const chu = await d.nguoiMoi("ltk", "owner", "Phan Kiểm Lưu Trữ Trường");
	await d.batTrinhDuyet(chu.cookie);

	if (chay(1))
		await d.chayBuoc(1, async () => {
			const loi = [];
			const f = await taoTruong(chu, 1);
			const t = await d.moTrang(
				chu.cookie,
				RONG,
				"/settings/fields?thucThe=company",
			);
			await choThay(
				t,
				(n) => document.body.innerText.includes(n),
				f.label,
				"truong vua tao",
			);
			if (!CHIEU_DO) {
				await bamPhanTu(
					t,
					timMenuDong,
					VI.fields.moreFor(f.label),
					"menu dong",
				);
				await bamPhanTu(t, timMucMenu, VI.fields.archive, "muc Luu tru");
			}
			await choToastCat(t, f.label);
			if ((await soHopHoi(t)) !== 0) loi.push("menu dong van mo hop hoi lai");
			await chup(t, "ltk-toast-1440.png");
			await kiemNhomCat(t, f.label, "main", loi, "buoc 1");
			await hoanTac(t, chu, f, loi, "buoc 1");
			await kiemNhomVe(t, f.label, "main", loi, "buoc 1");
			await choThay(
				t,
				(c) =>
					(
						document.querySelector("[data-sonner-toaster]")?.textContent ?? ""
					).includes(c),
				VI.fields.restored(f.label),
				"toast khoi phuc",
			);
			await chup(t, "ltk-hoan-tac-1440.png");
			await t.close();
			d.dat(1, loi.length === 0, loi.join(" · "));
		});

	if (chay(2))
		await d.chayBuoc(2, async () => {
			const loi = [];
			const f = await taoTruong(chu, 2);
			const t = await d.moTrang(
				chu.cookie,
				HEP,
				`/settings/fields?thucThe=company&truong=${encodeURIComponent(f.key)}`,
			);
			if (!CHIEU_DO)
				await bamPhanTu(
					t,
					timNutChu,
					[VI.fields.archive, "body"],
					"nut Luu tru cua trinh sua",
				);
			await choToastCat(t, f.label);
			if ((await soHopHoi(t)) !== 0) loi.push("trinh sua van mo hop hoi lai");
			const conTrinhSua = await t.evaluate(
				(c) =>
					[...document.querySelectorAll("button")].some(
						(b) => (b.textContent ?? "").trim() === c,
					),
				VI.fields.archive,
			);
			if (conTrinhSua) loi.push("trinh sua khong dong sau Luu tru");
			if (!(await trongKhung(t, VI.sheet.hoanTac)))
				loi.push("nut Hoan tac ngoai khung nhin o 390");
			await chup(t, "ltk-toast-390.png");
			await kiemNhomCat(t, f.label, "main", loi, "buoc 2");
			await hoanTac(t, chu, f, loi, "buoc 2");
			await kiemNhomVe(t, f.label, "main", loi, "buoc 2");
			await t.close();
			d.dat(2, loi.length === 0, loi.join(" · "));
		});

	if (chay(3))
		await d.chayBuoc(3, async () => {
			const loi = [];
			const f = await taoTruong(chu, 3);
			const t = await d.moTrang(
				chu.cookie,
				RONG,
				"/companies?manageFields=company",
			);
			await choThay(
				t,
				([sel, n]) =>
					(document.querySelector(sel)?.textContent ?? "").includes(n),
				[NGAN, f.label],
				"ngan Quan ly truong",
			);
			if (!CHIEU_DO) {
				await bamPhanTu(
					t,
					timMenuDong,
					VI.fields.moreFor(f.label),
					"menu dong trong ngan",
				);
				await bamPhanTu(
					t,
					timMucMenu,
					VI.fields.archive,
					"muc Luu tru trong ngan",
				);
			}
			await choToastCat(t, f.label);
			if ((await soHopHoi(t)) !== 0) loi.push("ngan van mo hop hoi lai");
			await kiemNhomCat(t, f.label, NGAN, loi, "buoc 3");
			await hoanTac(t, chu, f, loi, "buoc 3");
			await kiemNhomVe(t, f.label, NGAN, loi, "buoc 3");
			const conNgan = await t.evaluate(
				(sel) => document.querySelector(sel) !== null,
				NGAN,
			);
			if (!conNgan) throw new Error("man: hoan tac dong ngan");
			await chup(t, "ltk-ngan-1440.png");
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
	if (!daThongCong && !CHIEU_DO && !CHIEU_DO_API) {
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
