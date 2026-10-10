import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "hoan-tac-loat-dung-id";
const CHIEU_DO = process.argv.includes("--chieu-do");
const CHIEU_DO_LAM_MOI = process.argv.includes("--chieu-do-lam-moi");

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
const ANH = ["htl-luu-tru-bo-qua-1440.png", "htl-hoan-tac-1440.png"];
const NGAY_CU = new Date("2026-09-01T03:00:00.000Z");

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
const HO = `Hoàn tác đúng ${MA}`;

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

const dongCo = (t) =>
	t.evaluate(
		(ho) =>
			[...document.querySelectorAll("tbody tr")]
				.map((r) => r.textContent ?? "")
				.filter((x) => x.includes(ho)),
		HO,
	);

const chuToast = (t) =>
	t.evaluate(
		() => document.querySelector("[data-sonner-toaster]")?.textContent ?? "",
	);

async function bamTrongToast(t, chu) {
	const nut = await t.evaluateHandle(
		(c) =>
			[...document.querySelectorAll("[data-sonner-toaster] button")].find(
				(b) => (b.textContent ?? "").trim() === c,
			) ?? null,
		chu,
	);
	if (!(await nut.evaluate((x) => Boolean(x))))
		throw new Error(`man: khong thay nut «${chu}» tren toast`);
	await nut.click();
}

try {
	const chu = await d.nguoiMoi("htl", "owner", "Phan Kiểm Hoàn Tác");
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
			const [a, b, p] = nguoi;
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

			if (!CHIEU_DO)
				await d.db.contact.update({
					where: { id: p.id },
					data: { archivedAt: NGAY_CU },
				});

			const chonHet = await t.$(`[aria-label="${CHON_TAT_CA}"]`);
			if (!chonHet) throw new Error("man: khong thay o chon tat ca");
			await chonHet.click();
			await cho(400);
			const thaoTac = await t.evaluateHandle(
				(c) =>
					[...document.querySelectorAll("button")].find(
						(x) => (x.textContent ?? "").trim() === c,
					) ?? null,
				VI.bulkMenu.actions,
			);
			if (!(await thaoTac.evaluate((x) => Boolean(x))))
				throw new Error("man: khong thay nut Thao tac");
			await thaoTac.click();
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

			const mongLuuTru = `${CT.bulk.archived(formatCount(2, CT.noun, "vi"))} ${VI.bulk.boQua("1")}`;
			await choThay(
				t,
				(m) =>
					(
						document.querySelector("[data-sonner-toaster]")?.textContent ?? ""
					).includes(m),
				mongLuuTru,
				"ban bi bo qua",
			);
			const toastLuuTru = await chuToast(t);
			if (toastLuuTru.includes("No ") || toastLuuTru.includes("with id"))
				loi.push(`toast luu tru in loi tho: ${toastLuuTru}`);
			await choThay(
				t,
				(ho) =>
					[...document.querySelectorAll("tbody tr")].filter((r) =>
						(r.textContent ?? "").includes(ho),
					).length === 0,
				HO,
				"bang rong sau luu tru",
			);
			await chup(t, "htl-luu-tru-bo-qua-1440.png");

			if (CHIEU_DO_LAM_MOI) {
				await t.setRequestInterception(true);
				t.on("request", (r) =>
					r.url().includes("contacts.list") ? r.abort() : r.continue(),
				);
			}

			await bamTrongToast(t, VI.sheet.hoanTac);
			const mongKhoiPhuc = CT.bulk.restored(formatCount(2, CT.noun, "vi"));
			await choThay(
				t,
				(m) =>
					(
						document.querySelector("[data-sonner-toaster]")?.textContent ?? ""
					).includes(m),
				mongKhoiPhuc,
				"toast khoi phuc",
			);
			try {
				await t.waitForFunction(
					(ho) =>
						[...document.querySelectorAll("tbody tr")].filter((r) =>
							(r.textContent ?? "").includes(ho),
						).length === 2,
					{ timeout: 20_000 },
					HO,
				);
			} catch {
				throw new Error("man: danh sach khong ve dung 2 dong");
			}
			await cho(800);
			const dong = await dongCo(t);
			if (dong.length !== 2) loi.push(`bang co ${dong.length} dong, mong 2`);
			if (dong.some((x) => x.includes("Châu")))
				loi.push("ban nguoi khac da cat hien lai");
			await chup(t, "htl-hoan-tac-1440.png");

			const sau = await d.db.contact.findMany({
				where: { id: { in: [a.id, b.id, p.id] } },
				select: { id: true, archivedAt: true },
			});
			const theoId = new Map(sau.map((x) => [x.id, x.archivedAt]));
			if (theoId.get(a.id) !== null || theoId.get(b.id) !== null)
				loi.push("hai ban vua cat chua ve");
			if (theoId.get(p.id)?.toISOString() !== NGAY_CU.toISOString())
				loi.push(
					`ban nguoi khac cat bi doi: ${theoId.get(p.id)?.toISOString() ?? "null"}`,
				);
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
	if (!daThongCong && !CHIEU_DO && !CHIEU_DO_LAM_MOI) {
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
