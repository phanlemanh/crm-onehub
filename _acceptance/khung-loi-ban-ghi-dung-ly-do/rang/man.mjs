import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "khung-loi-ban-ghi-dung-ly-do";
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
const ANH = ["klg-khong-con-1440.png", "klg-khong-con-390.png"];
const NGAN = "[data-slot='sheet-content'],[data-slot='drawer-content']";

const { chay, HEP, MA, moDo, RONG } = await import(
	"../../kho-tai-lieu/rang/man-lib.mjs"
);
const { karaBanGhiMessages } = await import(
	join(GOC, "apps/app/lib/messages/kara-ban-ghi.ts")
);
const { messages: uiMessages } = await import(
	join(GOC, "packages/ui/src/lib/messages.ts")
);

const VI = karaBanGhiMessages("vi").khung;
const THU_LAI = uiMessages("vi").karaKhung.thuLai;

const d = await moDo();

async function nganDungYen(t) {
	let truoc = null;
	for (let lan = 0; lan < 40; lan += 1) {
		const x = await t.evaluate((sel) => {
			const r = document.querySelector(sel)?.getBoundingClientRect();
			return r ? `${Math.round(r.x)}:${Math.round(r.y)}` : null;
		}, NGAN);
		if (x !== null && x === truoc) return;
		truoc = x;
		await new Promise((r) => setTimeout(r, 250));
	}
	throw new Error("ngan khong dung yen");
}

async function chup(t, ten) {
	await t.evaluate(() => {
		for (const e of document.querySelectorAll(
			"nextjs-portal, [data-nextjs-toast], .tsqd-parent-container, .tsqd-open-btn-container",
		))
			e.remove();
	});
	await nganDungYen(t);
	await t.screenshot({ path: join(process.env.BANG_CHUNG, ten) });
	console.log(`  anh ${ten}`);
}

async function caNhanDaXoa() {
	const nguoi = await d.db.contact.create({
		data: { firstName: "Lan", lastName: `Đã xoá ${MA}` },
		select: { id: true },
	});
	if (!CHIEU_DO) await d.db.contact.delete({ where: { id: nguoi.id } });
	return nguoi.id;
}

async function moKhung(chu, rong, id) {
	const t = await d.moTrang(chu.cookie, rong, `/contacts?record=contact:${id}`);
	t.removeAllListeners("console");
	console.log(
		"  bo qua console cua trang nay: loi NOT_FOUND cua contacts.byId la chinh kich thich cua buoc",
	);
	try {
		await t.waitForSelector("[data-khung-tai-loi][data-ly-do='khong-con']", {
			timeout: 20_000,
		});
	} catch {
		throw new Error("man: khong thay khung khong con");
	}
	return t;
}

const docKhung = (t) =>
	t.evaluate(
		(sel, thuLai, dong) => {
			const k = document.querySelector("[data-khung-tai-loi]");
			const nut = [...(k?.querySelectorAll("button") ?? [])];
			const nutDong = nut.find((b) => (b.textContent ?? "").trim() === dong);
			const r = nutDong?.getBoundingClientRect();
			const goc = document.documentElement;
			const ngan = document.querySelector(sel);
			const tran = [];
			if (goc.scrollWidth > goc.clientWidth + 1)
				tran.push(`trang ${goc.scrollWidth}>${goc.clientWidth}`);
			if (ngan && ngan.scrollWidth > ngan.clientWidth + 1)
				tran.push(`ngan ${ngan.scrollWidth}>${ngan.clientWidth}`);
			return {
				chu: k?.innerText ?? "",
				coThuLai: nut.some((b) => (b.textContent ?? "").trim() === thuLai),
				coDong: Boolean(nutDong),
				dongTrongKhung: r
					? r.left >= 0 &&
						r.right <= goc.clientWidth + 1 &&
						r.bottom <= window.innerHeight + 1
					: false,
				tran,
			};
		},
		NGAN,
		THU_LAI,
		VI.khongCon.dong,
	);

function kiemKhung(k) {
	const loi = [];
	if (!k.chu.includes(VI.khongCon.tieuDe)) loi.push("thieu tieu de khong con");
	if (!k.chu.includes(VI.khongCon.moTa)) loi.push("thieu mo ta khong con");
	if (k.chu.includes(VI.loiMoTa)) loi.push("con cau kiem tra ket noi");
	if (k.coThuLai) loi.push("con nut Thu lai");
	if (!k.coDong) loi.push("thieu nut Dong");
	return loi;
}

async function bamDong(t) {
	const nut = await t.evaluateHandle(
		(dong) =>
			[...document.querySelectorAll("[data-khung-tai-loi] button")].find(
				(b) => (b.textContent ?? "").trim() === dong,
			) ?? null,
		VI.khongCon.dong,
	);
	await nut.click();
	try {
		await t.waitForFunction(
			(sel) => document.querySelector(sel) === null,
			{
				timeout: 10_000,
			},
			NGAN,
		);
		return true;
	} catch {
		return false;
	}
}

try {
	const chu = await d.nguoiMoi("klg", "owner", "Phan Kiểm Khung");
	await d.batTrinhDuyet(chu.cookie);

	if (chay(1))
		await d.chayBuoc(1, async () => {
			const id = await caNhanDaXoa();
			const t = await moKhung(chu, RONG, id);
			const k = await docKhung(t);
			const loi = kiemKhung(k);
			await chup(t, "klg-khong-con-1440.png");
			if (!(await bamDong(t))) loi.push("bam Dong ngan van mo");
			console.log(`  1440: «${k.chu.replace(/\s+/g, " ").trim()}»`);
			await t.close();
			d.dat(1, loi.length === 0, loi.join(" · "));
		});

	if (chay(2))
		await d.chayBuoc(2, async () => {
			const id = await caNhanDaXoa();
			const t = await moKhung(chu, HEP, id);
			const k = await docKhung(t);
			const loi = kiemKhung(k);
			if (k.tran.length > 0) loi.push(`tran ngang ${k.tran.join(", ")}`);
			if (!k.dongTrongKhung) loi.push("nut Dong ngoai khung nhin");
			await chup(t, "klg-khong-con-390.png");
			console.log(
				`  390: tran ${k.tran.length === 0 ? "khong" : k.tran.join(", ")} · Dong trong khung ${k.dongTrongKhung}`,
			);
			await t.close();
			d.dat(2, loi.length === 0, loi.join(" · "));
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
