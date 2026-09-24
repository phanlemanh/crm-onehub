import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { db } from "../../../packages/db/src/index.ts";
import { WORKSPACE_ID } from "../../../packages/db/src/workspace.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import {
	APP,
	CHO_TAI,
	CHROME,
	chiaCookie,
	datTrinhDuyet,
	goiApiTao,
	ket,
	khongDo,
	suySlug,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const BANG_CHUNG = join(HERE, "..", "evidence");
const KHO = [320, 375, 768, 1024, 1440];
const TIENG = ["vi", "en"];
const CAO = 900;
const O_MONG = 10;
const KY_MONG = 50;
const MA = `ttcman${Date.now().toString(36)}`;
const LOI_HYDRATE = /hydrat/i;
const CHO_HYDRATE_MS = 1000;
const NHAN = {
	vi: {
		truong: "Trưởng phòng ban",
		nhap: "Nhập từ bảng tính",
		them: "Thêm bộ phận",
		xem: "Xem trước",
		luu: "Lưu",
		hong: "Dòng hỏng",
	},
	en: {
		truong: "Department head",
		nhap: "Import from spreadsheet",
		them: "Add division",
		xem: "Preview",
		luu: "Save",
		hong: "Broken rows",
	},
};

mkdirSync(BANG_CHUNG, { recursive: true });

const cay = await canhCay();
if (cay.ket !== "dung-cay") await khongDo(...cay.dong);

const QUAN_TRI = `${MA}-quan-tri@thu.test`;
const cookie = chiaCookie(
	execFileSync("bun", ["run", "dev:session", QUAN_TRI], {
		cwd: join(HERE, "..", "..", "..", "apps", "api"),
		encoding: "utf8",
	})
		.trim()
		.split("\n")
		.pop()
		.trim(),
);
const quanTri = await db.user.findUniqueOrThrow({
	where: { email: QUAN_TRI },
	select: { id: true },
});
await db.member.upsert({
	where: {
		organizationId_userId: { organizationId: WORKSPACE_ID, userId: quanTri.id },
	},
	create: {
		id: `member-${quanTri.id}`,
		organizationId: WORKSPACE_ID,
		userId: quanTri.id,
		role: "admin",
		createdAt: new Date(),
	},
	update: { role: "admin" },
});
await db.session.updateMany({
	where: { userId: quanTri.id },
	data: { activeOrganizationId: WORKSPACE_ID },
});
const slug = await suySlug(cookie);

async function goi(duong, vao) {
	const kq = await goiApiTao(cookie, duong, vao);
	if (kq.loi) throw new Error(kq.loi);
	return kq.gia;
}

async function donDep() {
	const nguoi = { startsWith: MA };
	await db.orgSecondaryDepartment.deleteMany({ where: { userId: nguoi } });
	await db.orgPlacement.deleteMany({ where: { userId: nguoi } });
	await db.department.updateMany({
		where: { name: nguoi },
		data: { headUserId: null, divisionId: null },
	});
	await db.division.updateMany({
		where: { name: nguoi },
		data: { headUserId: null },
	});
	await db.department.deleteMany({ where: { name: nguoi } });
	await db.division.deleteMany({ where: { name: nguoi } });
	await db.member.deleteMany({ where: { userId: nguoi } });
	await db.user.deleteMany({ where: { id: nguoi } });
	await db.session.deleteMany({ where: { user: { email: QUAN_TRI } } });
	await db.member.deleteMany({ where: { user: { email: QUAN_TRI } } });
	await db.user.deleteMany({ where: { email: QUAN_TRI } });
}

async function dung(...dong) {
	await donDep();
	await khongDo(...dong);
}

const TEN = [
	"An",
	"Bình",
	"Chi",
	"Dũng",
	"Giang",
	"Hà",
	"Khánh",
	"Linh",
	"Minh",
	"Nga",
	"Phúc",
	"Quân",
	"Sơn",
];
const nguoiIds = [];
try {
	for (const [i, ten] of TEN.entries()) {
		const id = `${MA}-u${i}`;
		const bay = new Date();
		await db.user.create({
			data: {
				id,
				name: `${ten} ${MA}`,
				email: `${id}@thu.test`,
				emailVerified: true,
				createdAt: bay,
				updatedAt: bay,
			},
		});
		await db.member.create({
			data: {
				id: `member-${id}`,
				organizationId: WORKSPACE_ID,
				userId: id,
				role: "member",
				createdAt: bay,
			},
		});
		nguoiIds.push(id);
	}
	const bp = [];
	for (const ten of ["Kinh doanh", "Vận hành", "Tài chính"]) {
		bp.push((await goi("org.createDivision", { name: `${MA} ${ten}` })).id);
	}
	const pb = [];
	const khung = [
		[bp[0], "Vùng 1"],
		[bp[0], "Vùng 2"],
		[bp[1], "Chăm sóc khách hàng"],
		[bp[1], "Kho vận"],
		[bp[2], "Kế toán"],
		[null, "Pháp chế"],
	];
	for (const [divisionId, ten] of khung) {
		pb.push(
			(await goi("org.createDepartment", { name: `${MA} ${ten}`, divisionId }))
				.id,
		);
	}
	for (const [i, id] of nguoiIds.slice(0, 12).entries()) {
		await goi("org.setPlacement", {
			userId: id,
			primaryDepartmentId: pb[i % 6],
			secondaryDepartmentIds: [],
			managerUserId: null,
		});
	}
	for (const i of [0, 1, 2, 4]) {
		await goi("org.setHead", {
			kind: "department",
			id: pb[i],
			userId: nguoiIds[i],
		});
	}
	await goi("org.setHead", {
		kind: "division",
		id: bp[0],
		userId: nguoiIds[6],
	});
} catch (e) {
	await dung(`KHONG DO DUOC: tien de thieu — ${e.message}`);
}

const trinhDuyet = await puppeteer.launch({
	executablePath: CHROME,
	headless: true,
});
datTrinhDuyet(trinhDuyet);

async function moTrang(tieng, rong) {
	const trang = await trinhDuyet.newPage();
	const loi = [];
	trang.on("pageerror", (e) => {
		if (LOI_HYDRATE.test(String(e))) loi.push(String(e));
	});
	trang.on("console", (m) => {
		if (m.type() === "error" && LOI_HYDRATE.test(m.text())) loi.push(m.text());
	});
	await trang.setViewport({ width: rong, height: CAO });
	const host = new URL(APP).hostname;
	await trang.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: tieng, domain: host, path: "/" },
	);
	await trang.goto(`${APP}/${slug}/settings/organization`, {
		waitUntil: "load",
		timeout: CHO_TAI,
	});
	const hien = await trang
		.waitForSelector("[data-do-phu]", { timeout: CHO_TAI, visible: true })
		.catch(() => null);
	if (!hien)
		await dung(
			`KHONG DO DUOC: ${rong}/${tieng} man To chuc khong hien dong do phu`,
		);
	await trang
		.waitForNetworkIdle({ idleTime: 500, timeout: CHO_TAI })
		.catch(() => null);
	await new Promise((r) => setTimeout(r, CHO_HYDRATE_MS));
	return { trang, loi };
}

const khongTran = (trang) =>
	trang.evaluate(
		() => document.documentElement.scrollWidth <= window.innerWidth,
	);

const thay = (trang, chon) =>
	trang.evaluate((c) => {
		const e = document.querySelector(c);
		if (!e) return false;
		const r = e.getBoundingClientRect();
		return r.width > 0 && r.height > 0;
	}, chon);

const coChuThay = (trang, chu) =>
	trang.evaluate((c) => {
		const tim = [
			...document.querySelectorAll("[data-ten], [data-slot='badge'], span"),
		].find((e) => e.textContent?.trim() === c);
		if (!tim) return false;
		const r = tim.getBoundingClientRect();
		return r.width > 0 && r.height > 0;
	}, chu);

async function bamNut(trang, chu, vung = "body") {
	const ok = await trang.evaluate(
		(c, v) => {
			const b = [...document.querySelectorAll(`${v} button`)].find((x) =>
				x.textContent?.trim().startsWith(c),
			);
			if (!b) return false;
			b.click();
			return true;
		},
		chu,
		vung,
	);
	if (!ok) throw new Error(`khong thay nut ${chu}`);
}

const hopKhongTran = (trang) =>
	trang.evaluate(() => {
		const h = document.querySelector('[role="dialog"]');
		if (!h) return false;
		const r = h.getBoundingClientRect();
		return (
			r.left >= 0 &&
			r.right <= window.innerWidth + 1 &&
			document.documentElement.scrollWidth <= window.innerWidth
		);
	});

let khang = 0;
let o = 0;
const hong = [];
const kiem = (nhan, dat) => {
	khang += 1;
	if (!dat) hong.push(nhan);
};

for (const rong of KHO) {
	for (const tieng of TIENG) {
		const { trang, loi } = await moTrang(tieng, rong);
		o += 1;
		const n = `${rong}/${tieng}`;
		kiem(`${n}: tran ngang`, await khongTran(trang));
		kiem(`${n}: dong do phu khong thay`, await thay(trang, "[data-do-phu]"));
		let du = true;
		for (const ten of ["Kinh doanh", "Vận hành", "Tài chính"]) {
			if (!(await coChuThay(trang, `${MA} ${ten}`))) du = false;
		}
		kiem(`${n}: thieu ten bo phan`, du);
		kiem(
			`${n}: khong thay huy hieu truong`,
			await coChuThay(trang, NHAN[tieng].truong),
		);
		await trang.screenshot({
			path: join(BANG_CHUNG, `to-chuc-${rong}-${tieng}.png`),
			fullPage: true,
		});
		for (const l of loi) hong.push(`${n}: loi hydrate ${l.slice(0, 4000)}`);

		if (tieng === "vi" && (rong === 1440 || rong === 375)) {
			await trang.click(`[data-phong-ban] [data-nguoi="${nguoiIds[0]}"]`);
			await trang.waitForSelector('[role="dialog"]', {
				visible: true,
				timeout: CHO_TAI,
			});
			await new Promise((r) => setTimeout(r, 300));
			kiem(`${n}: hop vi tri tran`, await hopKhongTran(trang));
			await trang.screenshot({ path: join(BANG_CHUNG, `vi-tri-${rong}.png`) });
			await trang.keyboard.press("Escape");
			await trang.waitForFunction(
				() => !document.querySelector('[role="dialog"]'),
				{ timeout: CHO_TAI },
			);

			await bamNut(trang, NHAN.vi.nhap);
			await trang.waitForSelector('[role="dialog"] textarea', {
				visible: true,
				timeout: CHO_TAI,
			});
			const lo = [
				`${nguoiIds[0]}@thu.test\t${MA} Vùng 1\t${MA} Kinh doanh\t`,
				`${nguoiIds[1]}@thu.test\t${MA} Vùng 2\t${MA} Kinh doanh\t`,
				`${nguoiIds[2]}@thu.test\t${MA} Kế toán\t${MA} Tài chính\t`,
				`khong-ai-${MA}@thu.test\t${MA} Kế toán\t\t`,
				`${nguoiIds[3]}@thu.test\t${MA} Kho vận\t${MA} Kinh doanh\t`,
			].join("\n");
			await trang.type('[role="dialog"] textarea', lo);
			await bamNut(trang, NHAN.vi.xem, '[role="dialog"]');
			await trang.waitForSelector('[role="dialog"] tbody tr', {
				visible: true,
				timeout: CHO_TAI,
			});
			kiem(`${n}: xem truoc tran`, await hopKhongTran(trang));
			const soLoi = await trang.evaluate(
				(nhan) => document.querySelectorAll(`[aria-label="${nhan}"] li`).length,
				NHAN.vi.hong,
			);
			kiem(`${n}: dong hong ${soLoi} != 2`, soLoi === 2);
			await trang.screenshot({
				path: join(BANG_CHUNG, `nhap-xem-truoc-${rong}.png`),
			});
			await trang.keyboard.press("Escape");
		}

		if (tieng === "vi" && rong === 1440) {
			await trang.reload({ waitUntil: "load" });
			await trang.waitForSelector("[data-do-phu]", {
				visible: true,
				timeout: CHO_TAI,
			});
			await new Promise((r) => setTimeout(r, CHO_HYDRATE_MS));
			const tenBp = `${MA} Kinh doanh`;
			let moBang = false;
			for (let i = 0; i < 80 && !moBang; i += 1) {
				await trang.keyboard.press("Tab");
				moBang = await trang.evaluate(
					(t) =>
						document.activeElement?.textContent?.includes(t) &&
						document.activeElement?.hasAttribute("aria-expanded"),
					tenBp,
				);
			}
			const truoc = await trang.evaluate(() =>
				document.activeElement?.getAttribute("aria-expanded"),
			);
			await trang.keyboard.press("Enter");
			await new Promise((r) => setTimeout(r, 200));
			const sau = await trang.evaluate(() =>
				document.activeElement?.getAttribute("aria-expanded"),
			);
			kiem("ban phim: Enter khong doi aria-expanded", moBang && truoc !== sau);
			if (sau === "false") await trang.keyboard.press("Enter");
			let toiNguoi = false;
			for (let i = 0; i < 80 && !toiNguoi; i += 1) {
				await trang.keyboard.press("Tab");
				toiNguoi = await trang.evaluate(
					() => document.activeElement?.hasAttribute("data-nguoi") ?? false,
				);
			}
			await trang.keyboard.press("Enter");
			const moHop = await trang
				.waitForSelector('[role="dialog"]', { visible: true, timeout: 5000 })
				.then(() => true)
				.catch(() => false);
			kiem("ban phim: Enter tren nguoi khong mo hop thoai", toiNguoi && moHop);
			await trang.screenshot({ path: join(BANG_CHUNG, "ban-phim.png") });
			await trang.keyboard.press("Escape");

			const moi = `${MA} Mới`;
			await bamNut(trang, NHAN.vi.them);
			await trang.waitForSelector('[role="dialog"] input', {
				visible: true,
				timeout: CHO_TAI,
			});
			await trang.type('[role="dialog"] input', moi);
			await bamNut(trang, NHAN.vi.luu, '[role="dialog"]');
			const coMoi = await trang
				.waitForFunction(
					(t) =>
						[...document.querySelectorAll("[data-bo-phan] [data-ten]")].some(
							(e) => e.textContent?.trim() === t,
						),
					{ timeout: CHO_TAI },
					moi,
				)
				.then(() => true)
				.catch(() => false);
			kiem("E22: bo phan moi khong hien", coMoi);
			const soTruoc = await trang.evaluate(
				() => document.querySelectorAll("[data-bo-phan]").length,
			);
			await bamNut(trang, NHAN.vi.them);
			await trang.waitForSelector('[role="dialog"] input', {
				visible: true,
				timeout: CHO_TAI,
			});
			await trang.type('[role="dialog"] input', moi.toUpperCase());
			await bamNut(trang, NHAN.vi.luu, '[role="dialog"]');
			const cau = `Đã có «${moi.toUpperCase()}» ở cấp này.`;
			const coLoi = await trang
				.waitForFunction(
					(c) =>
						document
							.querySelector('[role="dialog"] [role="alert"]')
							?.textContent?.includes(c),
					{ timeout: CHO_TAI },
					cau,
				)
				.then(() => true)
				.catch(() => false);
			const soSau = await trang.evaluate(
				() => document.querySelectorAll("[data-bo-phan]").length,
			);
			kiem(
				"E22: ten trung khong bao loi hoac cay doi",
				coLoi && soSau === soTruoc,
			);
			await trang.screenshot({ path: join(BANG_CHUNG, "ten-trung.png") });
		}
		await trang.close();
	}
}

await donDep();
console.log(`o=${o}/${O_MONG} khang-dinh=${khang}/${KY_MONG}`);
if (o !== O_MONG || khang !== KY_MONG) {
	await khongDo(
		`KHONG DO DUOC: ma tran lech ban khai — o=${o} khang-dinh=${khang}`,
	);
}
for (const h of hong) console.log(`HONG ${h}`);
await ket(hong.length === 0 ? 0 : 1);
