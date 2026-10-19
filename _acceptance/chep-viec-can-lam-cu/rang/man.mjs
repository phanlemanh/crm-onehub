import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP_NAY), "..", "..", "..");
const HO_SO = "chep-viec-can-lam-cu";
const KHO_RONG = 1280;
const KHO_HEP = 375;
const CHO_MS = 20_000;
const NGAY_MS = 24 * 60 * 60 * 1000;
const LOC_CU = "filterClause(input.filter), CHUA_CHEP]";
const LOC_BO = "filterClause(input.filter)]";
const THE_CU = ["Sắp tới", "Đã xong", "Upcoming", "Done"];

const CAY_DO = {
	nhan: "ban sao bo loc da chep o loi doc dong thoi gian",
	tenCay: "cvc-man-chieu-do",
	chiBuoc: "1",
	tep: "apps/api/src/activities/activities.service.ts",
	cam: (s) => s.replace(LOC_CU, LOC_BO),
	dauVet: LOC_BO,
	ghim: /cvc man: viec da chep con tren dong thoi gian/,
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

const { chepViecCanLam } = await import(
	join(GOC, "packages/db/src/viec-ghi.ts")
);
const d = await lib.moDo();

async function choThay(t, ham, arg, moTa) {
	try {
		await t.waitForFunction(ham, { timeout: CHO_MS }, arg);
	} catch {
		throw new Error(`cvc man: khong thay ${moTa}`);
	}
}

async function soi(t, tieuDe) {
	return t.evaluate(
		(tieu, cam) => {
			const the = [
				...document.querySelectorAll('[data-slot="toggle-group-item"]'),
			]
				.map((n) => (n.textContent ?? "").replace(/\d+/g, "").trim())
				.filter((chu) => cam.includes(chu));
			const oTich = [...document.querySelectorAll("li")].filter(
				(li) =>
					!li.closest("[data-khoi-viec]") &&
					li.querySelector('[role="checkbox"]') !== null,
			).length;
			const dongCu = [...document.querySelectorAll("li")].some(
				(li) =>
					!li.closest("[data-khoi-viec]") &&
					(li.textContent ?? "").includes(tieu),
			);
			const trongKhoi = (
				document.querySelector("[data-khoi-viec]")?.textContent ?? ""
			).includes(tieu);
			return { the, oTich, dongCu, trongKhoi };
		},
		tieuDe,
		THE_CU,
	);
}

async function buoc(n, kho, anh, tieuDe, dealId, chu) {
	await d.chayBuoc(n, async () => {
		const loi = [];
		const t = await d.moTrang(
			chu.cookie,
			kho,
			`/deals?record=deal:${dealId}&tab=activity`,
		);
		await choThay(
			t,
			(c) =>
				(
					document.querySelector("[data-khoi-viec]")?.textContent ?? ""
				).includes(c),
			tieuDe,
			"khoi Viec co viec da chep",
		);
		await lib.cho(500);
		const k = await soi(t, tieuDe);
		if (k.the.length > 0) loi.push(`cvc man: con the ${k.the.join(", ")}`);
		if (k.oTich > 0) loi.push(`cvc man: con o tich ${k.oTich}`);
		if (k.dongCu) loi.push("cvc man: viec da chep con tren dong thoi gian");
		if (!k.trongKhoi) loi.push("cvc man: khoi Viec thieu viec da chep");
		if (kho === KHO_HEP) {
			const tran = await d.cuonNgang(t);
			if (tran.length > 0) loi.push(`cvc man: cuon ngang ${tran.join(", ")}`);
		}
		await d.chup(t, anh);
		await t.close();
		d.dat(n, loi.length === 0, loi.join(" · "));
	});
}

try {
	const chu = await d.nguoiMoi("cvcm", "member", "Phạm Thu Hà");
	const quanTri = await d.nguoiMoi("cvcq", "admin", "Lê Quang Vinh");
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
	const tieuDe = `Gửi hồ sơ năng lực ${lib.MA}`;
	const goc = await d.db.activity.create({
		data: {
			type: "TASK",
			subject: tieuDe,
			occurredAt: new Date(),
			dueAt: new Date(Date.now() - 2 * NGAY_MS),
			dealId: deal.id,
			companyId: congTy.id,
			createdById: chu.id,
		},
		select: { id: true },
	});
	await d.db.$transaction((tx) =>
		chepViecCanLam(tx, {
			activityId: goc.id,
			nguoiChay: { id: quanTri.id, ten: quanTri.ten },
			now: new Date(),
		}),
	);

	if (lib.chay(1))
		await buoc(1, KHO_RONG, "cvc-thoa-thuan-1280.png", tieuDe, deal.id, chu);
	if (lib.chay(2))
		await buoc(2, KHO_HEP, "cvc-thoa-thuan-375.png", tieuDe, deal.id, chu);

	await d.ket(`${HO_SO} man`);
} catch (e) {
	await d.khongDoDuoc(e);
}
