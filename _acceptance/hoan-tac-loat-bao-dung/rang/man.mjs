import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "hoan-tac-loat-bao-dung";
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
const ANH = ["hlb-da-ve-1440.png"];

const { chay, MA, moDo, RONG } = await import(
	"../../kho-tai-lieu/rang/man-lib.mjs"
);
const { crmMessages } = await import(join(GOC, "apps/app/lib/messages/crm.ts"));
const { contactMessages } = await import(
	join(GOC, "apps/app/lib/messages/contacts.ts")
);
const { formatCount } = await import(
	join(GOC, "packages/ui/src/lib/format.ts")
);
const { messages: uiMessages } = await import(
	join(GOC, "packages/ui/src/lib/messages.ts")
);

const VI = crmMessages("vi");
const CT = contactMessages("vi");
const CHON_TAT_CA = uiMessages("vi").table.selectAllRows;
const HO = `Hoàn tác báo đúng ${MA}`;

mkdirSync(process.env.BANG_CHUNG, { recursive: true });
for (const ten of ANH)
	rmSync(join(process.env.BANG_CHUNG, ten), { force: true });

const d = await moDo();

const cho = (ms) => new Promise((r) => setTimeout(r, ms));

async function chup(t, ten) {
	await t.evaluate(() => {
		for (const e of document.querySelectorAll(
			"nextjs-portal, [data-nextjs-toast], .tsqd-parent-container, .tsqd-open-btn-container",
		))
			e.remove();
	});
	await cho(300);
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

const soDong = (t) =>
	t.evaluate(
		(ho) =>
			[...document.querySelectorAll("tbody tr")].filter((r) =>
				(r.textContent ?? "").includes(ho),
			).length,
		HO,
	);

const chuToast = (t) =>
	t.evaluate(
		() => document.querySelector("[data-sonner-toaster]")?.textContent ?? "",
	);

async function bamTheoChu(t, boChon, chu, moTa) {
	const nut = await t.evaluateHandle(
		([s, c]) =>
			[...document.querySelectorAll(s)].find(
				(b) => (b.textContent ?? "").trim() === c,
			) ?? null,
		[boChon, chu],
	);
	if (!(await nut.evaluate((x) => Boolean(x))))
		throw new Error(`man: khong thay ${moTa}`);
	await nut.click();
}

try {
	const chu = await d.nguoiMoi("hlb", "owner", "Phan Kiểm Báo Đúng");
	await d.batTrinhDuyet(chu.cookie);

	if (chay(1))
		await d.chayBuoc(1, async () => {
			const loi = [];
			const nguoi = [];
			for (const ten of ["An", "Bình", "Châu"])
				nguoi.push(
					await d.db.contact.create({
						data: { firstName: ten, lastName: HO },
						select: { id: true },
					}),
				);
			const ids = nguoi.map((x) => x.id);
			const t = await d.moTrang(
				chu.cookie,
				RONG,
				`/contacts?q=${encodeURIComponent(MA)}`,
			);
			await choThay(
				t,
				(ho) =>
					[...document.querySelectorAll("tbody tr")].filter((r) =>
						(r.textContent ?? "").includes(ho),
					).length === 3,
				HO,
				"ba ca nhan trong bang truoc khi bam",
			);

			const chonHet = await t.$(`[aria-label="${CHON_TAT_CA}"]`);
			if (!chonHet) throw new Error("man: khong thay o chon tat ca");
			await chonHet.click();
			await cho(400);
			await bamTheoChu(t, "button", VI.bulkMenu.actions, "nut Thao tac");
			await choThay(
				t,
				(c) =>
					[...document.querySelectorAll("[role=menuitem]")].some(
						(e) => (e.textContent ?? "").trim() === c,
					),
				VI.bulk.archive,
				"muc Luu tru",
			);
			await bamTheoChu(t, "[role=menuitem]", VI.bulk.archive, "muc Luu tru");

			const mongLuuTru = CT.bulk.archived(formatCount(3, CT.noun, "vi"));
			await choThay(
				t,
				(m) =>
					(
						document.querySelector("[data-sonner-toaster]")?.textContent ?? ""
					).includes(m),
				mongLuuTru,
				"toast luu tru",
			);
			await choThay(
				t,
				(ho) =>
					[...document.querySelectorAll("tbody tr")].filter((r) =>
						(r.textContent ?? "").includes(ho),
					).length === 0,
				HO,
				"bang rong sau luu tru",
			);

			if (!CHIEU_DO)
				await d.db.contact.updateMany({
					where: { id: { in: ids } },
					data: { archivedAt: null },
				});

			await bamTheoChu(
				t,
				"[data-sonner-toaster] button",
				VI.sheet.hoanTac,
				"nut Hoan tac tren toast",
			);
			await choThay(
				t,
				(m) =>
					(
						document.querySelector("[data-sonner-toaster]")?.textContent ?? ""
					).includes(m),
				VI.bulk.daVeTruoc("3"),
				"toast da ve truoc",
			);
			const toast = await chuToast(t);
			if (toast.includes(VI.bulk.hoanTacLoi))
				loi.push("toast van bao chua hoan tac duoc");
			try {
				await t.waitForFunction(
					(ho) =>
						[...document.querySelectorAll("tbody tr")].filter((r) =>
							(r.textContent ?? "").includes(ho),
						).length === 3,
					{ timeout: 20_000 },
					HO,
				);
			} catch {
				loi.push(`bang co ${await soDong(t)} dong, mong 3`);
			}
			const trongKhung = await t.evaluate((m) => {
				const e = [
					...document.querySelectorAll(
						'[data-sonner-toast]:not([data-removed="true"])',
					),
				].find((x) => (x.textContent ?? "").includes(m));
				if (!e) return false;
				const r = e.getBoundingClientRect();
				return (
					r.top >= 0 &&
					r.bottom <= window.innerHeight &&
					r.left >= 0 &&
					r.right <= window.innerWidth
				);
			}, VI.bulk.daVeTruoc("3"));
			if (!trongKhung) loi.push("toast nam ngoai khung nhin");
			await chup(t, "hlb-da-ve-1440.png");

			const sau = await d.db.contact.findMany({
				where: { id: { in: ids } },
				select: { archivedAt: true },
			});
			if (sau.length !== 3 || sau.some((x) => x.archivedAt !== null))
				loi.push("may chu con ban mang moc luu tru");
			await t.close();
			d.dat(1, loi.length === 0, loi.join(" · "));
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
