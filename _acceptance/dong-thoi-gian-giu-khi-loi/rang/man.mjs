import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "dong-thoi-gian-giu-khi-loi";
const CHIEU_DO = process.argv.includes("--chieu-do");
const SO_HOAT_DONG = 35;
const TRANG_DAU = 30;
const THU_TUC = "activities.timeline";

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
	"dtg-xem-cu-loi-1440.png",
	"dtg-sau-thu-lai-1440.png",
	"dtg-xem-cu-loi-390.png",
];

const { chay, HEP, MA, moDo, RONG } = await import(
	"../../kho-tai-lieu/rang/man-lib.mjs"
);
const { crmMessages } = await import(join(GOC, "apps/app/lib/messages/crm.ts"));
const { messages: uiMessages } = await import(
	join(GOC, "packages/ui/src/lib/messages.ts")
);

const VI = crmMessages("vi");
const THU_LAI = uiMessages("vi").karaKhung.thuLai;

const d = await moDo();
const chan = { bat: false };

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

async function chup(t, ten) {
	await nganDungYen(t);
	await t.screenshot({ path: join(process.env.BANG_CHUNG, ten) });
	console.log(`  anh ${ten}`);
}

async function choDieu(t, ham, arg, moTa) {
	try {
		await t.waitForFunction(ham, { timeout: 20_000 }, arg);
	} catch {
		throw new Error(`man: khong thay ${moTa}`);
	}
}

const soDong = (t) =>
	t.evaluate(
		() => document.querySelectorAll("[data-slot=timeline] > li").length,
	);

async function bamNut(t, chu, trong) {
	const el = await t.evaluateHandle(
		(c, goc) =>
			[
				...document.querySelectorAll(
					goc
						.split(",")
						.map((s) => `${s} button`)
						.join(","),
				),
			].find((b) => (b.textContent ?? "").trim() === c) ?? null,
		chu,
		trong,
	);
	if (!(await el.evaluate((x) => Boolean(x)))) {
		const co = await t.evaluate(
			(goc) =>
				[
					...document.querySelectorAll(
						goc
							.split(",")
							.map((s) => `${s} button`)
							.join(","),
					),
				]
					.map((b) => (b.textContent ?? "").trim())
					.filter(Boolean)
					.slice(-8)
					.join(" | "),
			trong,
		);
		throw new Error(`man: khong thay nut «${chu}» — co: ${co}`);
	}
	await el.evaluate((x) => x.scrollIntoView({ block: "center" }));
	await new Promise((r) => setTimeout(r, 300));
	await el.click();
}

function datChan(t) {
	t.on("request", (req) => {
		const url = new URL(req.url());
		const duong = url.pathname.replace(/^\/api\/trpc\//, "");
		if (
			!chan.bat ||
			!url.pathname.startsWith("/api/trpc/") ||
			!duong.includes(THU_TUC)
		) {
			req.continue();
			return;
		}
		const vao = JSON.parse(url.searchParams.get("input") ?? "{}");
		duong.split(",").forEach((ten, viTri) => {
			const muc = vao[String(viTri)];
			const than = muc && "json" in muc ? muc.json : muc;
			if (ten === THU_TUC && than?.cursor) than.limit = 1000;
		});
		url.searchParams.set("input", JSON.stringify(vao));
		req.continue({ url: url.toString() });
	});
}

const docMan = (t) =>
	t.evaluate((thuLai) => {
		const tran = [];
		const goc = document.documentElement;
		if (goc.scrollWidth > goc.clientWidth + 1)
			tran.push(`trang ${goc.scrollWidth}>${goc.clientWidth}`);
		const ngan = document.querySelector(
			"[data-slot='sheet-content'],[data-slot='drawer-content']",
		);
		if (ngan && ngan.scrollWidth > ngan.clientWidth + 1)
			tran.push(`ngan ${ngan.scrollWidth}>${ngan.clientWidth}`);
		const nut = [
			...document.querySelectorAll("[data-dtg-loi='xem-cu'] button"),
		].find((b) => (b.textContent ?? "").trim() === thuLai);
		const r = nut?.getBoundingClientRect();
		const trongKhung = r
			? r.left >= 0 && r.right <= document.documentElement.clientWidth + 1
			: false;
		return { tran, trongKhung };
	}, THU_LAI);

async function moXemCuLoi(chu, rong, nguoi, ten) {
	const t = await d.moTrang(
		chu.cookie,
		rong,
		`/contacts?record=contact:${nguoi}&tab=activity`,
	);
	t.removeAllListeners("console");
	console.log(
		"  bo qua console cua trang nay: loi BAD_REQUEST cua activities.timeline la chinh kich thich cua buoc",
	);
	await t.setRequestInterception(true);
	datChan(t);
	await choDieu(
		t,
		(n) => document.querySelectorAll("[data-slot=timeline] > li").length === n,
		TRANG_DAU,
		`trang dau ${TRANG_DAU} dong`,
	);
	const truoc = await soDong(t);
	chan.bat = !CHIEU_DO;
	await bamNut(
		t,
		VI.timeline.showOlder,
		"[data-slot='sheet-content'],[data-slot='drawer-content']",
	);
	await choDieu(
		t,
		(c) =>
			(
				document.querySelector("[data-dtg-loi='xem-cu']")?.textContent ?? ""
			).includes(c),
		VI.timeline.xemCuLoi,
		"thong bao xem cu loi",
	);
	await t.evaluate(() => {
		for (const e of document.querySelectorAll(
			"nextjs-portal, [data-nextjs-toast], .tsqd-parent-container, .tsqd-open-btn-container",
		))
			e.remove();
		document
			.querySelector("[data-dtg-loi='xem-cu']")
			?.scrollIntoView({ block: "center" });
	});
	await new Promise((r) => setTimeout(r, 400));
	const sau = await soDong(t);
	const khungLoi = await t.evaluate(
		() => document.querySelector("[data-vung-tai-loi]") !== null,
	);
	const man = await docMan(t);
	await chup(t, ten);
	return { t, truoc, sau, khungLoi, man };
}

async function gieo(chu) {
	const nguoi = await d.db.contact.create({
		data: { firstName: "Lan", lastName: `Phạm ${MA}` },
		select: { id: true },
	});
	const goc = Date.now();
	await d.db.activity.createMany({
		data: Array.from({ length: SO_HOAT_DONG }, (_, i) => ({
			type: "NOTE",
			body: `Ghi chú gọi khách số ${i + 1}`,
			occurredAt: new Date(goc - (i + 1) * 6 * 3_600_000),
			contactId: nguoi.id,
			createdById: chu.id,
		})),
	});
	return nguoi.id;
}

try {
	const chu = await d.nguoiMoi("dtg", "owner", "Phan Kiểm Thử");
	await d.batTrinhDuyet(chu.cookie);
	const nguoi = await gieo(chu);

	if (chay(1))
		await d.chayBuoc(1, async () => {
			const loi = [];
			const { t, truoc, sau, khungLoi } = await moXemCuLoi(
				chu,
				RONG,
				nguoi,
				"dtg-xem-cu-loi-1440.png",
			);
			if (truoc !== TRANG_DAU) loi.push(`truoc ${truoc} dong`);
			if (sau !== truoc) loi.push(`danh sach doi ${truoc}->${sau}`);
			if (khungLoi) loi.push("khung loi thay ca danh sach");
			chan.bat = false;
			await bamNut(t, THU_LAI, "[data-dtg-loi='xem-cu']");
			await choDieu(
				t,
				(n) =>
					document.querySelectorAll("[data-slot=timeline] > li").length === n,
				SO_HOAT_DONG,
				`sau thu lai ${SO_HOAT_DONG} dong`,
			);
			const conThongBao = await t.evaluate(
				() => document.querySelector("[data-dtg-loi]") !== null,
			);
			if (conThongBao) loi.push("thong bao con sau thu lai");
			await chup(t, "dtg-sau-thu-lai-1440.png");
			console.log(
				`  xem cu: ${truoc} dong -> loi giu ${sau} dong -> thu lai ${SO_HOAT_DONG} dong`,
			);
			await t.close();
			d.dat(1, loi.length === 0, loi.join(" · "));
		});

	if (chay(2))
		await d.chayBuoc(2, async () => {
			const loi = [];
			const { t, truoc, sau, khungLoi, man } = await moXemCuLoi(
				chu,
				HEP,
				nguoi,
				"dtg-xem-cu-loi-390.png",
			);
			if (sau !== truoc) loi.push(`390 danh sach doi ${truoc}->${sau}`);
			if (khungLoi) loi.push("390 khung loi thay ca danh sach");
			if (man.tran.length > 0) loi.push(`390 tran: ${man.tran.join(", ")}`);
			if (!man.trongKhung) loi.push("390 nut Thu lai ngoai khung nhin");
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

	await d.ket("dong-thoi-gian-giu-khi-loi man");
} catch (e) {
	await d.khongDoDuoc(e);
}
