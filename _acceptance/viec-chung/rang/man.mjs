import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP_NAY), "..", "..", "..");
const HO_SO = "viec-chung";
const KHO_RONG = 1280;
const KHO_HEP = 375;
const CHO_MS = 20_000;
const NGAY_MS = 24 * 60 * 60 * 1000;
const GIO_VN_MS = 7 * 60 * 60 * 1000;

const CAY_DO = {
	nhan: "ban sao an the Lich su bang CSS",
	tenCay: "vc-man-chieu-do",
	chiBuoc: "2",
	tep: "packages/ui/src/styles/globals.css",
	cam: (s) =>
		`${s}\n[role="tab"][id$="-trigger-lich-su"]{display:none!important}\n`,
	dauVet: '[role="tab"][id$="-trigger-lich-su"]{display:none!important}',
	ghim: /vc man: thieu lich su/,
};

process.env.BANG_CHUNG ??= join(GOC, ".acceptance-runs", HO_SO, "evidence");
const lib = await import("../../kho-tai-lieu/rang/man-lib.mjs");

if (process.argv.includes("--chieu-do")) await lib.chieuDo(TEP_NAY, CAY_DO);

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/man.mjs"`,
	);
	process.exit(2);
}

const { viecMessages } = await import(
	join(GOC, "apps/app/lib/messages/viec.ts")
);
const { taoViec } = await import(join(GOC, "packages/db/src/viec-ghi.ts"));
const V = viecMessages("vi");
const d = await lib.moDo();

function ngayHan(soNgay) {
	const vn = new Date(Date.now() + GIO_VN_MS + soNgay * NGAY_MS);
	return new Date(`${vn.toISOString().slice(0, 10)}T00:00:00.000Z`);
}

async function choThay(t, ham, arg, moTa) {
	try {
		await t.waitForFunction(ham, { timeout: CHO_MS }, arg);
	} catch {
		throw new Error(`vc man: khong thay ${moTa}`);
	}
}

const NGAN = "[data-slot='sheet-content']";
const CHIP_KY_VONG = { "giao-cho-toi": 2, "toi-giao": 0, "dang-theo-doi": 0 };

async function yen(t) {
	let truoc = null;
	for (let lan = 0; lan < 40; lan += 1) {
		const x = await t.evaluate((sel) => {
			const r = document.querySelector(sel)?.getBoundingClientRect();
			if (!r || Math.round(r.right) !== window.innerWidth) return null;
			return `${Math.round(r.x)}:${Math.round(r.y)}:${Math.round(r.width)}`;
		}, NGAN);
		if (x !== null && x === truoc) return;
		truoc = x;
		await lib.cho(250);
	}
	throw new Error("vc man: ngan khong yen");
}

async function foto(t, ten) {
	await yen(t);
	await t.evaluate(() => {
		for (const e of document.querySelectorAll(
			"nextjs-portal, [data-nextjs-toast]",
		))
			e.remove();
	});
	await t.screenshot({ path: join(process.env.BANG_CHUNG, ten) });
	console.log(`  anh ${ten}`);
}

function dem(t, sel) {
	return t.evaluate(
		(s) =>
			[...document.querySelectorAll(s)].filter((e) => e.checkVisibility())
				.length,
		sel,
	);
}

async function bamChu(t, chu, goc = "body") {
	const nut = await t.evaluateHandle(
		(c, g) =>
			[
				...document.querySelectorAll(
					`${g} button, ${g} [role="tab"], ${g} [role="option"]`,
				),
			].find(
				(b) => (b.textContent ?? "").trim() === c && b.checkVisibility(),
			) ?? null,
		chu,
		goc,
	);
	if (!(await nut.evaluate((x) => Boolean(x)))) return false;
	await nut.evaluate((x) => x.scrollIntoView({ block: "center" }));
	await nut.click();
	await lib.cho(300);
	return true;
}

try {
	const chu = await d.nguoiMoi("vcm", "member", "Phạm Thu Hà");
	const giao = await d.nguoiMoi("vcg", "member", "Lê Quang Vinh");
	await d.batTrinhDuyet(chu.cookie);
	const congTy = await d.db.company.create({
		data: { name: `Công ty An Phát ${lib.MA}` },
	});
	const deal = await d.db.deal.create({
		data: {
			name: `Thoả thuận An Phát ${lib.MA}`,
			companyId: congTy.id,
			ownerId: chu.id,
		},
	});
	const gan = [{ loai: "deal", id: deal.id }];
	for (const [tieuDe, soNgay] of [
		[`Gửi bảng phí ${lib.MA}`, -2],
		[`Gọi xác nhận ${lib.MA}`, 0],
	]) {
		await d.db.$transaction((tx) =>
			taoViec(tx, {
				nguoiId: giao.id,
				tieuDe,
				nguoiThucHienId: chu.id,
				hanNgay: ngayHan(soNgay),
				gan,
				nguon: "web",
				now: new Date(),
			}),
		);
	}

	if (lib.chay(1))
		await d.chayBuoc(1, async () => {
			const loi = [];
			const t = await d.moTrang(chu.cookie, KHO_RONG, "/viec");
			await choThay(
				t,
				() => document.querySelectorAll("[data-nhom] [data-dem]").length === 3,
				null,
				"ba chip co so",
			);
			const chip = await t.evaluate(() =>
				Object.fromEntries(
					[...document.querySelectorAll("[data-nhom]")].map((e) => [
						e.getAttribute("data-nhom"),
						Number(e.querySelector("[data-dem]")?.textContent ?? Number.NaN),
					]),
				),
			);
			if (JSON.stringify(chip) !== JSON.stringify(CHIP_KY_VONG))
				loi.push(`vc man: so chip ${JSON.stringify(chip)}`);
			if ((await dem(t, "tr[data-viec]")) !== 2)
				loi.push("vc man: thieu dong bang o 1280");
			if ((await dem(t, '[data-slot="item"][data-viec]')) !== 0)
				loi.push("vc man: the dong hien o 1280");
			const doDo = await t.evaluate(
				() =>
					document.querySelector('tr[data-viec] [data-tone="error"]') !== null,
			);
			if (!doDo) loi.push("dong qua han khong co data-tone=error");
			await d.chup(t, "vc-viec-cua-toi-1280.png");
			await t.close();
			d.dat(1, loi.length === 0, loi.join(" · "));
		});

	if (lib.chay(2))
		await d.chayBuoc(2, async () => {
			const loi = [];
			const t = await d.moTrang(chu.cookie, KHO_RONG, "/viec");
			await choThay(
				t,
				() => document.querySelector("tr[data-viec]") !== null,
				null,
				"dong viec",
			);
			await t.click("tr[data-viec]");
			await choThay(
				t,
				() => decodeURIComponent(location.search).includes("record=viec:"),
				null,
				"khung viec tren duong dan",
			);
			await choThay(
				t,
				() => document.querySelector("[data-nut-trang-thai] button") !== null,
				null,
				"nut trang thai",
			);
			if (!(await bamChu(t, V.nut.batDau, NGAN)))
				loi.push("khong co nut Bat dau");
			await choThay(
				t,
				(c) =>
					(
						document.querySelector("[data-trang-thai-viec]")?.textContent ?? ""
					).includes(c),
				V.trangThai.DANG_LAM,
				"nhan Dang lam",
			);
			if (!(await bamChu(t, V.khung.tabLichSu, `${NGAN} [role="tablist"]`))) {
				loi.push("vc man: thieu lich su");
			} else {
				await choThay(
					t,
					() =>
						document.querySelector(
							'[data-lich-su-viec] [data-vet="doi-trang-thai"]',
						) !== null,
					null,
					"dong doi trang thai",
				);
			}
			await foto(t, "vc-khung-viec-1280.png");
			await t.close();
			d.dat(2, loi.length === 0, loi.join(" · "));
		});

	if (lib.chay(3))
		await d.chayBuoc(3, async () => {
			const loi = [];
			const tieuDe = `Gửi hồ sơ cho ${lib.MA}`;
			const t = await d.moTrang(
				chu.cookie,
				KHO_RONG,
				`/deals?record=deal:${deal.id}&tab=activity`,
			);
			await choThay(
				t,
				(c) => document.querySelector(`[aria-label="${c}"]`) !== null,
				V.oSoan.loai,
				"loai Viec",
			);
			await t.click(`[aria-label="${V.oSoan.loai}"]`);
			await choThay(
				t,
				() => document.querySelector("[data-o-soan-viec] input") !== null,
				null,
				"o soan viec",
			);
			await t.type("[data-o-soan-viec] input", tieuDe);
			await t.click(`[role="combobox"][aria-label="${V.oSoan.nguoiThucHien}"]`);
			await lib.cho(300);
			if (!(await bamChu(t, giao.ten)))
				loi.push("khong chon duoc nguoi thuc hien");
			const dauKhoi = await t.evaluate(() => {
				const k = document.querySelector("[data-khoi-viec]");
				const cha = k?.parentElement;
				if (!k || !cha) return false;
				return (
					cha.firstElementChild === k ||
					cha.parentElement?.firstElementChild === cha
				);
			});
			if (!dauKhoi) loi.push("vc man: khoi Viec khong o dau the Hoat dong");
			const hang = await t.evaluate(
				(nhan) =>
					nhan.map((a) =>
						Boolean(
							document
								.querySelector(`[data-o-soan-viec] [aria-label="${a}"]`)
								?.checkVisibility(),
						),
					),
				[V.oSoan.nguoiThucHien, V.oSoan.nguoiTheoDoi],
			);
			if (hang.includes(false)) loi.push("vc man: hang o soan thieu o chon");
			await foto(t, "vc-o-soan-1280.png");
			if (!(await bamChu(t, V.oSoan.giao))) loi.push("khong co nut Giao viec");
			await choThay(
				t,
				(c) =>
					(
						document.querySelector("[data-khoi-viec]")?.textContent ?? ""
					).includes(c),
				tieuDe,
				"khoi Viec co viec vua giao",
			);
			await foto(t, "vc-o-soan-da-giao-1280.png");
			await t.close();
			d.dat(3, loi.length === 0, loi.join(" · "));
		});

	if (lib.chay(4))
		await d.chayBuoc(4, async () => {
			const loi = [];
			const t = await d.moTrang(chu.cookie, KHO_HEP, "/viec");
			await choThay(
				t,
				() =>
					[
						...document.querySelectorAll('[data-slot="item"][data-viec]'),
					].filter((e) => e.checkVisibility()).length >= 2,
				null,
				"the dong hien o 375",
			);
			if ((await dem(t, "tr[data-viec]")) !== 0)
				loi.push("vc man: bang hien o 375");
			const tran = await d.cuonNgang(t);
			if (tran.length > 0) loi.push(`cuon ngang ${tran.join(", ")}`);
			await d.chup(t, "vc-viec-cua-toi-375.png");
			await t.close();
			d.dat(4, loi.length === 0, loi.join(" · "));
		});

	await d.ket(`${HO_SO} man`);
} catch (e) {
	await d.khongDoDuoc(e);
}
