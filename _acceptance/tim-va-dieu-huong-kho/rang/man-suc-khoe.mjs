import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
const HERE = dirname(TEP_NAY);
const GOC = join(HERE, "..", "..", "..");
const HO_SO = "tim-va-dieu-huong-kho";

const KHUNG_CU = [
	[
		'<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">',
		'<div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2">',
	],
	[
		'"min-w-0 flex-auto text-balance font-medium text-2xl tracking-tight md:text-3xl"',
		'"col-start-1 row-start-1 min-w-0 self-center text-balance font-medium text-2xl tracking-tight md:text-3xl"',
	],
	[
		'"order-last basis-full text-balance text-muted-foreground text-sm"',
		'"col-span-full row-start-2 text-balance text-muted-foreground text-sm"',
	],
	[
		'"flex flex-wrap items-center gap-2"',
		'"col-start-2 row-start-1 flex flex-wrap items-center gap-2 self-center justify-self-end"',
	],
];

const CAY_DO = {
	1: {
		nhan: "ban sao an tab Suc khoe",
		tenCay: "tdk-man-suc-khoe-chieu-do",
		chiBuoc: "1",
		tep: "apps/app/app/(app)/[slug]/tai-lieu/danh-sach.tsx",
		cam: (s) => s.replace('data-tab-suc-khoe=""', 'data-tab-an=""'),
		dauVet: 'data-tab-an=""',
		ghim: /buoc 1: khong thay tab Suc khoe/,
	},
	2: {
		nhan: "ban sao tra khung dau trang ve luoi cu",
		tenCay: "tdk-man-suc-khoe-chieu-do-2",
		chiBuoc: "2",
		tep: "apps/app/components/page-shell.tsx",
		cam: (s) => KHUNG_CU.reduce((acc, [moi, cu]) => acc.replace(moi, cu), s),
		dauVet: "grid-cols-[minmax(0,1fr)_auto]",
		ghim: /buoc 2: .*tieu de de len nut/,
	},
};

const coChieuDo = process.argv.find(
	(a) => a === "--chieu-do" || a.startsWith("--chieu-do="),
);
if (coChieuDo) {
	const buoc = coChieuDo.split("=")[1] ?? "1";
	const cay = CAY_DO[buoc];
	if (!cay) {
		console.log(
			`KHONG DO DUOC: man-suc-khoe khong co chieu do cho buoc ${buoc}`,
		);
		process.exit(2);
	}
	const { chieuDo } = await import("../../kho-tai-lieu/rang/man-lib.mjs");
	await chieuDo(TEP_NAY, cay);
}

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/man-suc-khoe.mjs"`,
	);
	process.exit(2);
}

process.env.BANG_CHUNG ??= join(GOC, ".acceptance-runs", HO_SO, "evidence");

const { cho, chay, HEP, MA, moDo, RONG } = await import(
	"../../kho-tai-lieu/rang/man-lib.mjs"
);
const { deLenNhau } = await import("./khung.mjs");

const d = await moDo();

const NGAY_MS = 24 * 60 * 60 * 1000;
const TONG_CHO = 30;
const MOT_TRANG = 25;
const MONG_KHOI = {
	"qua-han": 2,
	"cho-duyet": 1,
	gay: 3,
	"chua-co": 3,
	"mo-coi": 7,
	"chua-tra-loi": 0,
	"bao-sai": 0,
};

const docKhoi = (t) =>
	t.evaluate(() =>
		Object.fromEntries(
			window.__tim("[data-khoi-suc-khoe]").map((k) => [
				k.getAttribute("data-khoi-suc-khoe"),
				{
					so: Number(k.querySelector("[data-so]")?.getAttribute("data-so")),
					hien: k.querySelector("[data-so]")?.innerText.trim() ?? "",
				},
			]),
		),
	);

function soSanhKhoi(khoi) {
	const loi = [];
	for (const [id, n] of Object.entries(MONG_KHOI)) {
		const k = khoi[id];
		if (!k) loi.push(`thieu khoi ${id}`);
		else if (k.so !== n || k.hien !== String(n))
			loi.push(`${id}: ${k.hien} thay vi ${n}`);
	}
	return loi;
}

async function moSucKhoe(c, rong) {
	const t = await d.moTrang(c, rong, "/tai-lieu");
	const coTab = await t.$("[data-tab-suc-khoe]");
	if (!coTab) return { t, coTab: false };
	await d.bamSel(t, "[data-tab-suc-khoe]");
	await d.doi(t, () => window.__tim("[data-khoi-suc-khoe]").length === 7);
	await cho(500);
	return { t, coTab: true };
}

async function chonCombobox(t, khoa, nhan) {
	await d.bamSel(t, `[${khoa}]`);
	await d.doi(
		t,
		(nhan) =>
			window.__tim("[cmdk-item]").some((e) => e.innerText.startsWith(nhan)),
		nhan,
	);
	const muc = await t.evaluateHandle(
		(nhan) =>
			window.__tim("[cmdk-item]").find((e) => e.innerText.startsWith(nhan)),
		nhan,
	);
	await muc.click();
	await t
		.waitForNetworkIdle({ idleTime: 500, timeout: 30_000 })
		.catch(() => null);
	await cho(800);
}

try {
	const nguoi = await d.nguoiMoi("t", "member", "Lê Thu Trang");
	const khac = await d.nguoiMoi("k", "member", "Vũ Thanh Mai");
	const ws = await d.batTrinhDuyet(nguoi.cookie);
	const lk = (s) => `[tới ${s}](/${ws}/tai-lieu/${s})`;
	const tao = (ten, noiDung, them = {}) =>
		d.taoTrangDangDung(nguoi, { ten, loai: "quy-dinh", noiDung, ...them });
	const chuaA = `tdk-chua-co-a-${MA}`;
	const chuaB = `tdk-chua-co-b-${MA}`;
	const slug = {};
	const n1 = await d.lam(nguoi.cookie, "taiLieu.create", {
		ten: `Sức khoẻ N1 nháp ${MA}`,
		loai: "quy-dinh",
		chuTrangId: nguoi.id,
		departmentId: null,
		noiDung: "Nháp.\n",
	});
	slug.n1 = n1.slug;
	slug.p2 = await tao(`Sức khoẻ P2 ${MA}`, "Đích.\n");
	slug.p1 = await tao(
		`Sức khoẻ P1 ${MA}`,
		`Xem ${lk(slug.p2)} và ${lk(chuaB)}.\n`,
	);
	slug.p3 = await tao(`Sức khoẻ P3 ${MA}`, `Xem ${lk(slug.p2)}.\n`);
	slug.p4 = await tao(`Sức khoẻ P4 ${MA}`, `Xem ${lk(chuaA)}.\n`);
	slug.p5 = await tao(
		`Sức khoẻ P5 ${MA}`,
		`Xem ${lk(chuaA)} và ${lk(slug.n1)}.\n`,
	);
	slug.p6 = await tao(`Sức khoẻ P6 ${MA}`, "Không dẫn đi đâu.\n");
	slug.q1 = await tao(`Quá hạn Q1 ${MA}`, "Hết hạn hôm qua.\n");
	slug.q2 = await tao(`Quá hạn Q2 ${MA}`, "Hết hạn tuần trước.\n");
	await d.db.taiLieuTrang.update({
		where: { slug: slug.q1 },
		data: { xacMinhDen: new Date(Date.now() - NGAY_MS) },
	});
	await d.db.taiLieuTrang.update({
		where: { slug: slug.q2 },
		data: { xacMinhDen: new Date(Date.now() - 7 * NGAY_MS) },
	});
	console.log(`-- gieo do thi suc khoe tren ${ws}`);

	if (chay(1))
		await d.chayBuoc(1, async () => {
			const { t, coTab } = await moSucKhoe(nguoi.cookie, RONG);
			if (!coTab) {
				await d.chup(t, "tdk-suc-khoe-1440.png");
				await t.close();
				d.dat(1, false, "khong thay tab Suc khoe");
				return;
			}
			const loi = soSanhKhoi(await docKhoi(t));
			await d.chup(t, "tdk-suc-khoe-1440.png");
			await t.close();
			d.dat(1, loi.length === 0, loi.join(" · "));
		});

	if (chay(2))
		await d.chayBuoc(2, async () => {
			const { t, coTab } = await moSucKhoe(nguoi.cookie, HEP);
			if (!coTab) {
				await t.close();
				d.dat(2, false, "390: khong thay tab Suc khoe");
				return;
			}
			const loi = soSanhKhoi(await docKhoi(t));
			const tran = await d.cuonNgang(t);
			if (tran.length > 0) loi.push(`390 cuon ngang: ${tran.join(", ")}`);
			const de = await deLenNhau(t);
			if (de.length > 0) loi.push(`390: ${de.join(", ")}`);
			await d.chup(t, "tdk-suc-khoe-390.png");
			await t.close();
			d.dat(2, loi.length === 0, loi.join(" · "));
		});

	if (chay(3))
		await d.chayBuoc(3, async () => {
			const dvA = await d.db.department.create({
				data: { name: `Phòng Kinh doanh ${MA}`, position: 990 },
			});
			const dvB = await d.db.department.create({
				data: { name: `Phòng Nhân sự ${MA}`, position: 991 },
			});
			const l1 = await tao(`Lọc L1 ${MA}`, "Trang L1.\n", {
				departmentId: dvA.id,
			});
			await tao(`Lọc L2 ${MA}`, "Trang L2.\n", { departmentId: dvB.id });
			await d.taoTrangDangDung(khac, {
				ten: `Lọc L3 ${MA}`,
				loai: "quy-dinh",
				noiDung: "Trang L3.\n",
				departmentId: dvA.id,
			});
			const t = await d.moTrang(nguoi.cookie, RONG, "/tai-lieu");
			await chonCombobox(t, "data-loc-don-vi", dvA.name);
			await chonCombobox(t, "data-loc-chu", nguoi.ten);
			const doc = () =>
				t.evaluate(() => ({
					q: window.location.search,
					trang: window
						.__tim("[data-bang-trang] [data-trang]")
						.map((e) => e.getAttribute("data-trang")),
				}));
			const sau = await doc();
			await d.chup(t, "tdk-loc-1440.png");
			await t.reload({ waitUntil: "load" });
			await t
				.waitForNetworkIdle({ idleTime: 500, timeout: 30_000 })
				.catch(() => null);
			await cho(1200);
			const taiLai = await doc();
			await t.close();
			const hep = await d.moTrang(nguoi.cookie, HEP, `/tai-lieu${sau.q}`);
			await d.doi(
				hep,
				() => window.__tim("[data-the-trang] [data-trang]").length > 0,
			);
			const theHep = await hep.evaluate(() =>
				window
					.__tim("[data-the-trang] [data-trang]")
					.map((e) => e.getAttribute("data-trang")),
			);
			const tranHep = await d.cuonNgang(hep);
			const deHep = await deLenNhau(hep);
			await d.chup(hep, "tdk-loc-390.png");
			await hep.close();
			const loi = [];
			if (tranHep.length > 0)
				loi.push(`390 cuon ngang: ${tranHep.join(", ")}`);
			if (deHep.length > 0) loi.push(`390: ${deHep.join(", ")}`);
			if (JSON.stringify(theHep) !== JSON.stringify([l1]))
				loi.push(`390 danh sach sau loc: ${theHep.join(", ")}`);
			const q = new URLSearchParams(sau.q);
			if (q.get("donVi") !== dvA.id) loi.push("URL khong co don vi");
			if (q.get("chuTrang") !== nguoi.id) loi.push("URL khong co chu trang");
			if (JSON.stringify(sau.trang) !== JSON.stringify([l1]))
				loi.push(`danh sach sau loc: ${sau.trang.join(", ")}`);
			if (JSON.stringify(taiLai.trang) !== JSON.stringify(sau.trang))
				loi.push("tai lai mat loc");
			d.dat(3, loi.length === 0, loi.join(" · "));
		});

	if (chay(4))
		await d.chayBuoc(4, async () => {
			const c = await tao(`Chờ duyệt nhiều ${MA}`, "Gốc.\n");
			const coSan = await d.db.taiLieuDeXuat.count({
				where: { trangThai: "CHO_DUYET", trang: { chuTrangId: nguoi.id } },
			});
			for (let i = coSan; i < TONG_CHO; i += 1) {
				await d.lam(khac.cookie, "taiLieu.propose", {
					slug: c,
					noiDung: `Bản chờ số ${i}.\n`,
				});
			}
			const t = await d.moTrang(
				nguoi.cookie,
				RONG,
				"/tai-lieu?tabTaiLieu=cho-duyet",
			);
			await d.doi(t, () => window.__tim("[data-de-xuat]").length > 0);
			const mot = await t.evaluate(() => window.__tim("[data-de-xuat]").length);
			await d.bamChu(t, "button", "Tiếp");
			await t
				.waitForNetworkIdle({ idleTime: 500, timeout: 30_000 })
				.catch(() => null);
			await cho(1000);
			const hai = await t.evaluate(() => ({
				so: window.__tim("[data-de-xuat]").length,
				q: window.location.search,
			}));
			await d.chup(t, "tdk-cho-duyet-trang-2.png");
			await t.close();
			const hep = await d.moTrang(nguoi.cookie, HEP, `/tai-lieu${hai.q}`);
			await d.doi(hep, () => window.__tim("[data-de-xuat]").length > 0);
			const tranHep = await d.cuonNgang(hep);
			await d.chup(hep, "tdk-cho-duyet-trang-2-390.png");
			await hep.close();
			const loi = [];
			if (mot !== MOT_TRANG) loi.push(`trang 1 co ${mot} dong`);
			if (hai.so !== TONG_CHO - MOT_TRANG)
				loi.push(`trang 2 co ${hai.so} dong`);
			if (tranHep.length > 0)
				loi.push(`390 cuon ngang: ${tranHep.join(", ")}`);
			if (new URLSearchParams(hai.q).get("page") !== "2")
				loi.push("URL khong sang trang 2");
			d.dat(4, loi.length === 0, loi.join(" · "));
		});

	await d.ket("man-suc-khoe");
} catch (e) {
	await d.khongDoDuoc(e);
}
