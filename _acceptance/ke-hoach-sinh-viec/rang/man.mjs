// Hồ sơ _acceptance/ke-hoach-sinh-viec — E3b: chụp ô tạo kế hoạch (danh mục 1280, sheet công ty 1280,
// 375) và thẻ Bước của kế hoạch có Việc (1280). Chạy qua phiên đo:
//   bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/ke-hoach-sinh-viec/rang/man.mjs"
// Khuôn phiên đo dùng chung man-lib.mjs của kho-tai-lieu như viec-chung.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP_NAY), "..", "..", "..");
const HO_SO = "ke-hoach-sinh-viec";
const KHO_RONG = 1280;
const KHO_HEP = 375;
const CHO_MS = 20_000;

process.env.BANG_CHUNG ??= join(GOC, ".acceptance-runs", HO_SO, "evidence");
const lib = await import("../../kho-tai-lieu/rang/man-lib.mjs");

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/man.mjs"`,
	);
	process.exit(2);
}

const { onboardingMessages } = await import(
	join(GOC, "apps/app/lib/messages/onboarding.ts")
);
const { keHoachNoiMessages } = await import(
	join(GOC, "apps/app/lib/messages/ke-hoach-noi.ts")
);
const { taoViecChoBuoc } = await import(
	join(GOC, "packages/db/src/buoc-viec.ts")
);
const M = onboardingMessages("vi");
const K = M.tao.keHoach;
const NOI = keHoachNoiMessages("vi");
const d = await lib.moDo();

async function choThay(t, ham, arg, moTa) {
	try {
		await t.waitForFunction(ham, { timeout: CHO_MS }, arg);
	} catch {
		throw new Error(`kh man: khong thay ${moTa}`);
	}
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

async function chonKhuonVaCho(t, tenKhuon, loi) {
	await choThay(
		t,
		(c) => document.querySelector(`[aria-label="${c}"]`) !== null,
		K.template,
		"o chon khuon",
	);
	await t.click(`[aria-label="${K.template}"]`);
	await lib.cho(300);
	if (!(await bamChu(t, tenKhuon))) loi.push("kh man: khong chon duoc khuon");
	await choThay(
		t,
		() =>
			document.querySelectorAll('[data-khoi="nguoi-theo-phong"] [data-phong]')
				.length === 2,
		null,
		"hai hang phong ban",
	);
}

async function kiemHang(t, tenTruong, tenCam, loi) {
	const hang = await t.evaluate(() =>
		[...document.querySelectorAll("[data-phong]")].map(
			(x) => x.textContent ?? "",
		),
	);
	if (!hang[0]?.includes(tenTruong))
		loi.push("kh man: hang A khong dien truong phong");
	if (!hang[1]?.includes(tenCam) || !hang[1]?.includes(K.phongChuaCoTruong)) {
		loi.push("kh man: hang B khong dien nguoi cam trich");
	}
}

try {
	const chu = await d.nguoiMoi("khm", "member", "Phạm Thu Hà");
	const truong = await d.nguoiMoi("kht", "member", "Lê Quang Vinh");
	await d.batTrinhDuyet(chu.cookie);
	const phongA = await d.db.department.create({
		data: { name: `Kinh doanh ${lib.MA}`, position: 0, headUserId: truong.id },
	});
	const phongB = await d.db.department.create({
		data: { name: `Kế toán ${lib.MA}`, position: 1 },
	});
	const tenKhuon = `Khuôn sàn ${lib.MA}`;
	await d.db.onboardingTemplate.create({
		data: {
			name: tenKhuon,
			steps: [
				{
					label: "Ký hợp đồng",
					departmentId: phongA.id,
					position: 0,
					offsetDays: 0,
				},
				{
					label: "Mở tài khoản",
					departmentId: phongB.id,
					position: 1,
					offsetDays: 3,
				},
			],
		},
	});
	const congTy = await d.db.company.create({
		data: { name: `Công ty An Phát ${lib.MA}` },
	});

	if (lib.chay(1))
		await d.chayBuoc(1, async () => {
			const loi = [];
			const t = await d.moTrang(chu.cookie, KHO_RONG, "/onboarding");
			await choThay(
				t,
				(c) =>
					[...document.querySelectorAll("button")].some(
						(b) => (b.textContent ?? "").trim() === c,
					),
				K.toolbar,
				"nut ke hoach moi",
			);
			await bamChu(t, K.toolbar);
			await chonKhuonVaCho(t, tenKhuon, loi);
			await kiemHang(t, truong.ten, chu.ten, loi);
			await d.chup(t, "kh-o-tao-danh-muc-1280.png");
			await t.close();
			d.dat(1, loi.length === 0, loi.join(" · "));
		});

	if (lib.chay(2))
		await d.chayBuoc(2, async () => {
			const loi = [];
			const t = await d.moTrang(
				chu.cookie,
				KHO_RONG,
				`/companies?record=company:${congTy.id}&tab=plans`,
			);
			await choThay(
				t,
				(c) =>
					[...document.querySelectorAll("button")].some(
						(b) => (b.textContent ?? "").trim() === c,
					),
				NOI.congTy.tao,
				"nut tao ke hoach o sheet cong ty",
			);
			await bamChu(t, NOI.congTy.tao);
			await chonKhuonVaCho(t, tenKhuon, loi);
			await kiemHang(t, truong.ten, chu.ten, loi);
			await d.chup(t, "kh-o-tao-cong-ty-1280.png");
			await t.close();
			d.dat(2, loi.length === 0, loi.join(" · "));
		});

	if (lib.chay(3))
		await d.chayBuoc(3, async () => {
			const loi = [];
			const t = await d.moTrang(chu.cookie, KHO_HEP, "/onboarding");
			await choThay(
				t,
				(c) =>
					[...document.querySelectorAll("button")].some(
						(b) =>
							(b.textContent ?? "").trim() === c ||
							b.getAttribute("aria-label") === c,
					),
				K.toolbar,
				"nut ke hoach moi o 375",
			);
			if (!(await bamChu(t, K.toolbar))) {
				await t.click(`[aria-label="${K.toolbar}"]`);
				await lib.cho(300);
			}
			await chonKhuonVaCho(t, tenKhuon, loi);
			const tran = await d.cuonNgang(t);
			if (tran.length > 0) loi.push(`cuon ngang ${tran.join(", ")}`);
			await d.chup(t, "kh-o-tao-375.png");
			await t.close();
			d.dat(3, loi.length === 0, loi.join(" · "));
		});

	if (lib.chay(4))
		await d.chayBuoc(4, async () => {
			const loi = [];
			const plan = await d.db.onboardingPlan.create({
				data: {
					companyId: congTy.id,
					ownerId: chu.id,
					startedAt: new Date(),
					targetDays: 30,
				},
			});
			for (const [i, [nhan, phong, nguoi]] of [
				["Ký hợp đồng", phongA.id, truong.id],
				["Mở tài khoản", phongB.id, chu.id],
			].entries()) {
				const s = await d.db.onboardingStep.create({
					data: {
						planId: plan.id,
						label: nhan,
						departmentId: phong,
						dueAt: new Date(),
						position: i,
					},
				});
				await d.db.$transaction((tx) =>
					taoViecChoBuoc(tx, {
						stepId: s.id,
						planId: plan.id,
						tieuDe: nhan,
						hanNgay: new Date(`${lib.ngayVN()}T00:00:00.000Z`),
						nguoiGiaoId: chu.id,
						nguoiThucHienId: nguoi,
						nguon: "khuon",
						now: new Date(),
					}),
				);
			}
			const t = await d.moTrang(
				chu.cookie,
				KHO_RONG,
				`/onboarding?record=plan:${plan.id}`,
			);
			await choThay(
				t,
				() => document.querySelectorAll("[data-viec-cua-buoc]").length === 2,
				null,
				"chip viec tren hai buoc",
			);
			await d.chup(t, "kh-the-buoc-viec-1280.png");
			await t.close();
			d.dat(4, loi.length === 0, loi.join(" · "));
		});

	await d.ket(`${HO_SO} man`);
} catch (e) {
	await d.khongDoDuoc(e);
}
