import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type {
	BangCotCachChia,
	BangCotOutput,
	PlanListInput,
} from "../src/onboarding/onboarding.contracts";
import { OnboardingService } from "../src/onboarding/onboarding.service";
import { ONBOARDING } from "../src/onboarding/onboarding-config";
import { gieoBoPhan, gieoNguoi } from "./dieu-phoi-gieo";

const DAY_MS = 24 * 60 * 60 * 1000;

let demToken = 0;

function token(): string {
	demToken += 1;
	return `qldm${Date.now().toString(36)}x${demToken}`;
}

function dichVu(): OnboardingService {
	return new OnboardingService(db);
}

function loc(input: Partial<PlanListInput> & { q: string }): PlanListInput {
	return {
		sort: "",
		dir: "asc",
		page: 1,
		pageSize: ONBOARDING.danhMuc.pageSize,
		status: "dang-chay",
		boPhan: [],
		nguoiCam: [],
		...input,
	};
}

type BuocGieo = { label: string; departmentId: string; xong?: boolean };

async function gieoKeHoach(input: {
	tenCongTy: string;
	ownerId: string;
	buoc: BuocGieo[];
	dong?: boolean;
	imNgay?: number;
	batDau?: Date;
}) {
	const congTy = await db.company.create({ data: { name: input.tenCongTy } });
	const plan = await db.onboardingPlan.create({
		data: {
			companyId: congTy.id,
			ownerId: input.ownerId,
			startedAt: input.batDau ?? new Date(),
			targetDays: 30,
			closedAt: input.dong ? new Date() : null,
		},
	});
	await db.onboardingStep.createMany({
		data: input.buoc.map((b, i) => ({
			planId: plan.id,
			label: b.label,
			departmentId: b.departmentId,
			dueAt: new Date(),
			completedAt: b.xong ? new Date() : null,
			position: i,
		})),
	});
	if (input.imNgay !== undefined) {
		await db.$executeRawUnsafe(
			`UPDATE "onboardingStep" SET "updatedAt" = now() - ($2::int * interval '1 day') WHERE "planId" = $1`,
			plan.id,
			input.imNgay,
		);
	}
	return plan;
}

function idsCua(kq: { rows: { id: string }[] }): string[] {
	return kq.rows.map((r) => r.id);
}

function cotTheoKhoa(bang: BangCotOutput): Record<string, number> {
	return Object.fromEntries(bang.cot.map((c) => [c.khoa, c.tong]));
}

function moiIdMotLan(bang: BangCotOutput): string[] {
	return bang.cot.flatMap((c) => c.the.map((t) => t.id));
}

describe("khong-khop", () => {
	test("khong-khop: loc hay tim ra khong ke hoach nao thi la khong khop, khong phai chua co", async () => {
		const service = dichVu();
		const t = token();
		const [a, b, nguoi] = await Promise.all([
			gieoBoPhan(),
			gieoBoPhan(),
			gieoNguoi(),
		]);
		for (const ten of ["Mot", "Hai"]) {
			await gieoKeHoach({
				tenCongTy: `${t} ${ten}`,
				ownerId: nguoi.id,
				buoc: [{ label: "Ky", departmentId: a.id }],
			});
		}

		const theoBoPhan = await service.manDanhMuc(loc({ q: t, boPhan: [b.id] }));
		expect(`${theoBoPhan.trangThai} total=${theoBoPhan.total}`).toBe(
			"ST-danhmuc-khongkhop total=0",
		);

		const theoTim = await service.manDanhMuc(loc({ q: `${t}-khong-co` }));
		expect(theoTim.trangThai).toBe("ST-danhmuc-khongkhop");

		const doiChung = await service.manDanhMuc(loc({ q: t, boPhan: [a.id] }));
		expect(doiChung.trangThai).toBe("ST-danhmuc-codulieu");
		expect(doiChung.rows).toHaveLength(2);

		const conKhuon = await db.onboardingTemplate.findMany({
			where: { archivedAt: null },
			select: { id: true },
		});
		for (const k of conKhuon) await service.archiveTemplate({ id: k.id });
		await db.onboardingPlan.deleteMany({});

		const trong = await service.manDanhMuc(loc({ q: "" }));
		expect(trong.trangThai).toBe("ST-danhmuc-chuacokhuon");
	});
});

describe("tim-ten-cong-ty", () => {
	test("tim-ten-cong-ty: tim khong phan biet hoa thuong, total bang so khop", async () => {
		const service = dichVu();
		const t = token();
		const [dep, nguoi] = await Promise.all([gieoBoPhan(), gieoNguoi()]);
		for (const ten of ["Công ty Alpha", "Beta Holdings", "Gamma"]) {
			await gieoKeHoach({
				tenCongTy: `${ten} ${t}`,
				ownerId: nguoi.id,
				buoc: [{ label: "Ky", departmentId: dep.id }],
			});
		}

		const alpha = await service.listPlans(
			loc({ q: `ALPHA ${t.toUpperCase()}` }),
		);
		expect(`total=${alpha.total}`).toBe("total=1");
		expect(alpha.rows[0]?.companyName).toBe(`Công ty Alpha ${t}`);

		const hold = await service.listPlans(loc({ q: `hold` }));
		const holdCuaToi = hold.rows.filter((r) => r.companyName.endsWith(t));
		expect(holdCuaToi.map((r) => r.companyName)).toEqual([
			`Beta Holdings ${t}`,
		]);
		expect(hold.total).toBe(hold.rows.length);

		const tatCa = await service.listPlans(loc({ q: t }));
		expect(`total=${tatCa.total}`).toBe("total=3");
		expect(tatCa.rows).toHaveLength(3);
	});
});

describe("sap-toan-tap", () => {
	const KHOA = ["companyName", "startedAt", "imNgay", "buocXong"] as const;
	const CHIEU = ["asc", "desc"] as const;
	const CA = KHOA.flatMap((khoa) => CHIEU.map((dir) => ({ khoa, dir })));
	const TEN = ["An", "Bình", "Chi", "Dung", "Én"];
	const soChu = new Intl.Collator("vi", { sensitivity: "base", numeric: true });

	test("sap-toan-tap: tam ca, thu tu dung tren toan tap qua ba trang", async () => {
		expect(CA).toHaveLength(8);
		const service = dichVu();
		const t = token();
		const [dep, nguoi] = await Promise.all([gieoBoPhan(), gieoNguoi()]);
		const goc = Date.UTC(2026, 0, 1);

		const gieo: {
			id: string;
			companyName: string;
			startedAt: number;
			imNgay: number;
			buocXong: number;
		}[] = [];
		for (let i = 0; i < 30; i += 1) {
			const companyName = `${t} ${TEN[i % 5]}`;
			const buocXong = i % 4;
			const imNgay = (i % 5) + 1;
			const startedAt = goc + (i % 5) * DAY_MS;
			const plan = await gieoKeHoach({
				tenCongTy: companyName,
				ownerId: nguoi.id,
				batDau: new Date(startedAt),
				imNgay,
				buoc: [0, 1, 2, 3].map((j) => ({
					label: `B${j}`,
					departmentId: dep.id,
					xong: j < buocXong,
				})),
			});
			gieo.push({ id: plan.id, companyName, startedAt, imNgay, buocXong });
		}

		for (const { khoa, dir } of CA) {
			const chieu = dir === "desc" ? -1 : 1;
			const soSanh = (
				a: (typeof gieo)[number],
				b: (typeof gieo)[number],
			): number => {
				const giaTri =
					khoa === "companyName"
						? soChu.compare(a.companyName, b.companyName)
						: a[khoa] - b[khoa];
				return chieu * giaTri || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
			};
			const mongDoi = [...gieo].sort(soSanh).map((g) => g.id);

			const nhan: string[] = [];
			for (const page of [1, 2, 3]) {
				const kq = await service.listPlans(
					loc({ q: t, sort: khoa, dir, page, pageSize: 10 }),
				);
				nhan.push(...idsCua(kq));
			}

			expect(`${khoa} ${dir}: ${nhan.join(",")}`).toBe(
				`${khoa} ${dir}: ${mongDoi.join(",")}`,
			);
			expect(new Set(nhan).size).toBe(30);
		}
	});
});

describe("phan-trang", () => {
	test("phan-trang: trang hai la phan con lai, total la toan tap", async () => {
		const service = dichVu();
		const t = token();
		const [dep, nguoi] = await Promise.all([gieoBoPhan(), gieoNguoi()]);
		const gieo: string[] = [];
		for (let i = 0; i < 27; i += 1) {
			const plan = await gieoKeHoach({
				tenCongTy: `${t} ${i}`,
				ownerId: nguoi.id,
				buoc: [{ label: "Ky", departmentId: dep.id }],
			});
			gieo.push(plan.id);
		}

		const mot = await service.listPlans(loc({ q: t, pageSize: 25 }));
		expect(`${mot.rows.length}/${mot.total}`).toBe("25/27");

		const hai = await service.listPlans(loc({ q: t, pageSize: 25, page: 2 }));
		expect(`trang hai: ${hai.rows.length}/${hai.total}`).toBe(
			"trang hai: 2/27",
		);
		expect(idsCua(hai).filter((id) => idsCua(mot).includes(id))).toEqual([]);

		expect([...idsCua(mot), ...idsCua(hai)].sort()).toEqual([...gieo].sort());
	});
});

describe("loc-va-dem", () => {
	test("loc-va-dem: sau ca loc, so dem canh lua chon bang so hang khi chon no", async () => {
		const service = dichVu();
		const t = token();
		const [a, b, u1, u2] = await Promise.all([
			gieoBoPhan(),
			gieoBoPhan(),
			gieoNguoi(),
			gieoNguoi(),
		]);
		const cap: [string, string, boolean][] = [
			[a.id, u1.id, false],
			[a.id, u2.id, false],
			[b.id, u1.id, false],
			[a.id, u1.id, false],
			[b.id, u2.id, false],
			[a.id, u1.id, true],
			[b.id, u2.id, true],
		];
		const plans: {
			plan: { id: string };
			dep: string;
			owner: string;
			dong: boolean;
		}[] = [];
		for (const [i, [dep, owner, dong]] of cap.entries()) {
			plans.push({
				plan: await gieoKeHoach({
					tenCongTy: `${t} ${i}`,
					ownerId: owner,
					dong,
					buoc: [{ label: "Ky", departmentId: dep }],
				}),
				dep,
				owner,
				dong,
			});
		}

		const CA: {
			ten: string;
			nhom: "trangThai" | "boPhan" | "nguoiCam";
			giaTri: string;
			chon: Partial<PlanListInput>;
			khop: (p: (typeof plans)[number]) => boolean;
		}[] = [
			{
				ten: "tab dang chay",
				nhom: "trangThai",
				giaTri: "dang-chay",
				chon: { status: "dang-chay" },
				khop: (p) => !p.dong,
			},
			{
				ten: "tab da dong",
				nhom: "trangThai",
				giaTri: "da-dong",
				chon: { status: "da-dong" },
				khop: (p) => p.dong,
			},
			{
				ten: "bo phan A",
				nhom: "boPhan",
				giaTri: a.id,
				chon: { boPhan: [a.id] },
				khop: (p) => !p.dong && p.dep === a.id,
			},
			{
				ten: "bo phan B",
				nhom: "boPhan",
				giaTri: b.id,
				chon: { boPhan: [b.id] },
				khop: (p) => !p.dong && p.dep === b.id,
			},
			{
				ten: "nguoi 1",
				nhom: "nguoiCam",
				giaTri: u1.id,
				chon: { nguoiCam: [u1.id] },
				khop: (p) => !p.dong && p.owner === u1.id,
			},
			{
				ten: "nguoi 2",
				nhom: "nguoiCam",
				giaTri: u2.id,
				chon: { nguoiCam: [u2.id] },
				khop: (p) => !p.dong && p.owner === u2.id,
			},
		];
		expect(CA).toHaveLength(6);

		const truocKhiChon = await service.listPlans(loc({ q: t }));
		let soCap = 0;
		for (const ca of CA) {
			const kq = await service.listPlans(loc({ q: t, ...ca.chon }));
			const mongDoi = plans
				.filter(ca.khop)
				.map((p) => p.plan.id)
				.sort();
			expect(`${ca.ten}: ${[...idsCua(kq)].sort().join(",")}`).toBe(
				`${ca.ten}: ${mongDoi.join(",")}`,
			);
			expect(kq.total).toBe(mongDoi.length);
			const nguon =
				ca.nhom === "trangThai"
					? await service.listPlans(loc({ q: t, status: "tat-ca" }))
					: truocKhiChon;
			const dem = nguon.facetCounts[ca.nhom]?.[ca.giaTri] ?? 0;
			expect(`${ca.ten}: dem ${dem} hang ${kq.total}`).toBe(
				`${ca.ten}: dem ${kq.total} hang ${kq.total}`,
			);
			soCap += 1;
		}
		expect(soCap).toBe(6);

		const chiNguoi1 = await service.listPlans(loc({ q: t, nguoiCam: [u1.id] }));
		const chiNguoi1BoPhanB = await service.listPlans(
			loc({ q: t, nguoiCam: [u1.id], boPhan: [b.id] }),
		);
		expect(
			`bo phan B khi da chon nguoi 1: dem ${chiNguoi1.facetCounts.boPhan?.[b.id] ?? 0} hang ${chiNguoi1BoPhanB.total}`,
		).toBe(
			`bo phan B khi da chon nguoi 1: dem ${chiNguoi1BoPhanB.total} hang ${chiNguoi1BoPhanB.total}`,
		);
	});
});

async function bangCot(
	service: OnboardingService,
	cachChia: BangCotCachChia,
	them: Partial<PlanListInput> & { q: string },
): Promise<BangCotOutput> {
	return service.bangCot({ ...loc(them), cachChia });
}

describe("bang-cot-buoc", () => {
	test("bang-cot-buoc: moi buoc dang tac mot cot, xong moi buoc o cot rieng", async () => {
		const service = dichVu();
		const t = token();
		const [dep, nguoi] = await Promise.all([gieoBoPhan(), gieoNguoi()]);
		const buoc = (xong: number): BuocGieo[] =>
			["Ký hợp đồng", "Đào tạo"].map((label, i) => ({
				label,
				departmentId: dep.id,
				xong: i < xong,
			}));
		const plans = [];
		for (const [i, xong] of [0, 0, 1, 2].entries()) {
			plans.push(
				await gieoKeHoach({
					tenCongTy: `${t} ${i}`,
					ownerId: nguoi.id,
					buoc: buoc(xong),
				}),
			);
		}

		const bang = await bangCot(service, "buoc", { q: t });
		expect(bang.cot.map((c) => `${c.khoa}=${c.tong}`)).toEqual([
			"Ký hợp đồng=2",
			"Đào tạo=1",
			"xong=1",
		]);
		expect(bang.cot.find((c) => c.khoa === "xong")?.the[0]?.id).toBe(
			plans[3]?.id,
		);
		const ids = moiIdMotLan(bang);
		expect(ids.sort()).toEqual(plans.map((p) => p.id).sort());
	});
});

describe("bang-cot-bo-phan", () => {
	test("bang-cot-bo-phan: cot theo bo phan cua buoc dang tac, theo id", async () => {
		const service = dichVu();
		const t = token();
		const [a, b, nguoi] = await Promise.all([
			gieoBoPhan(0),
			gieoBoPhan(1),
			gieoNguoi(),
		]);
		const buoc = (depDang: string, xongDau: boolean): BuocGieo[] => [
			{ label: "Dau", departmentId: b.id, xong: xongDau },
			{ label: "Sau", departmentId: depDang },
		];
		const plans = [
			await gieoKeHoach({
				tenCongTy: `${t} 1`,
				ownerId: nguoi.id,
				buoc: buoc(a.id, true),
			}),
			await gieoKeHoach({
				tenCongTy: `${t} 2`,
				ownerId: nguoi.id,
				buoc: buoc(a.id, false),
			}),
			await gieoKeHoach({
				tenCongTy: `${t} 3`,
				ownerId: nguoi.id,
				buoc: buoc(a.id, true),
			}),
			await gieoKeHoach({
				tenCongTy: `${t} 4`,
				ownerId: nguoi.id,
				buoc: [{ label: "Xong", departmentId: a.id, xong: true }],
			}),
		];

		const bang = await bangCot(service, "bo-phan", { q: t });
		expect(cotTheoKhoa(bang)).toEqual({ [a.id]: 2, [b.id]: 1, xong: 1 });
		expect(moiIdMotLan(bang).sort()).toEqual(plans.map((p) => p.id).sort());

		await service.updateDepartment({ id: a.id, name: `Ten moi ${t}` });
		const sauDoiTen = await bangCot(service, "bo-phan", { q: t });
		expect(sauDoiTen.cot.find((c) => c.khoa === a.id)?.nhan).toBe(
			`Ten moi ${t}`,
		);
	});
});

describe("bang-cot-bac", () => {
	test("bang-cot-bac: nam cot theo thu tu bac, moi ghi danh o bac cao nhat", async () => {
		const service = dichVu();
		const t = token();
		const [a, b, nguoi] = await Promise.all([
			gieoBoPhan(),
			gieoBoPhan(),
			gieoNguoi(),
		]);
		const plan = await gieoKeHoach({
			tenCongTy: `${t} chinh`,
			ownerId: nguoi.id,
			buoc: [{ label: "Ky", departmentId: a.id }],
		});
		const khac = await gieoKeHoach({
			tenCongTy: `${t} khac`,
			ownerId: nguoi.id,
			buoc: [{ label: "Ky", departmentId: b.id }],
		});
		const luc = new Date();
		const MA_TRAN: {
			cot: string;
			moc: Partial<
				Record<"accountAt" | "courseAt" | "activeAt" | "dealAt", Date>
			>;
		}[] = [
			{ cot: "chua-tai-khoan", moc: {} },
			{ cot: "co-tai-khoan", moc: { accountAt: luc } },
			{ cot: "khoa-hoc", moc: { accountAt: luc, courseAt: luc } },
			{
				cot: "hoat-dong",
				moc: { accountAt: luc, courseAt: luc, activeAt: luc },
			},
			{
				cot: "giao-dich",
				moc: { accountAt: luc, courseAt: luc, activeAt: luc, dealAt: luc },
			},
			{ cot: "giao-dich", moc: { dealAt: luc } },
		];
		const mongDoi: Record<string, string> = {};
		for (const [i, dong] of MA_TRAN.entries()) {
			const contact = await db.contact.create({
				data: { firstName: `${t} nguoi ${i}` },
			});
			const ghi = await db.onboardingEnrollment.create({
				data: {
					planId: plan.id,
					contactId: contact.id,
					source: "tay",
					...dong.moc,
				},
			});
			mongDoi[ghi.id] = dong.cot;
		}
		const contactKhac = await db.contact.create({
			data: { firstName: `${t} ngoai` },
		});
		const ghiKhac = await db.onboardingEnrollment.create({
			data: { planId: khac.id, contactId: contactKhac.id, source: "tay" },
		});

		const bang = await bangCot(service, "bac", { q: t });
		expect(bang.cot.map((c) => c.khoa)).toEqual([
			"chua-tai-khoan",
			"co-tai-khoan",
			"khoa-hoc",
			"hoat-dong",
			"giao-dich",
		]);
		let soAssert = 0;
		for (const [id, cot] of Object.entries(mongDoi)) {
			const nam = bang.cot
				.filter((c) => c.the.some((the) => the.id === id))
				.map((c) => c.khoa);
			expect(`${id}: ${nam.join(",")}`).toBe(`${id}: ${cot}`);
			soAssert += 1;
		}
		expect(soAssert).toBe(6);

		const theoBoPhan = await bangCot(service, "bac", { q: t, boPhan: [a.id] });
		const ids = moiIdMotLan(theoBoPhan);
		expect(ids).not.toContain(ghiKhac.id);
		expect(ids.sort()).toEqual(Object.keys(mongDoi).sort());
	});
});

describe("bang-cot-trang-thai", () => {
	test("bang-cot-trang-thai: hai cot dang chay va da dong", async () => {
		const service = dichVu();
		const t = token();
		const [dep, nguoi] = await Promise.all([gieoBoPhan(), gieoNguoi()]);
		const plans = [];
		for (const [i, dong] of [false, false, true].entries()) {
			plans.push(
				await gieoKeHoach({
					tenCongTy: `${t} ${i}`,
					ownerId: nguoi.id,
					dong,
					buoc: [{ label: "Ky", departmentId: dep.id }],
				}),
			);
		}

		const bang = await bangCot(service, "trang-thai", {
			q: t,
			status: "tat-ca",
		});
		expect(bang.cot.map((c) => `${c.khoa}=${c.tong}`)).toEqual([
			"dang-chay=2",
			"da-dong=1",
		]);
		expect(moiIdMotLan(bang).sort()).toEqual(plans.map((p) => p.id).sort());
	});
});

describe("tran-cot", () => {
	test("tran-cot: cot dai cat o tran cau hinh, tieu de mang tong that", async () => {
		const service = dichVu();
		const t = token();
		const [dep, nguoi] = await Promise.all([gieoBoPhan(), gieoNguoi()]);
		const tran = ONBOARDING.bangCot.tranThe;
		for (let i = 0; i < tran + 3; i += 1) {
			await gieoKeHoach({
				tenCongTy: `${t} ${i}`,
				ownerId: nguoi.id,
				buoc: [{ label: "Ky", departmentId: dep.id }],
			});
		}

		const bang = await bangCot(service, "buoc", { q: t });
		const cot = bang.cot.find((c) => c.khoa === "Ky");
		expect(bang.tranThe).toBe(tran);
		expect(`the ${cot?.the.length} tong ${cot?.tong}`).toBe(
			`the ${tran} tong ${tran + 3}`,
		);
	});
});

describe("bang-cot-khong-phan-trang", () => {
	const CACH_CHIA: BangCotCachChia[] = ["buoc", "bo-phan", "bac", "trang-thai"];
	const DAU_VAO: { ten: string; trang: Partial<PlanListInput> }[] = [
		{ ten: "khong co trang", trang: {} },
		{
			ten: "co page=2",
			trang: { page: 2, pageSize: ONBOARDING.danhMuc.pageSize },
		},
	];

	test("bang-cot-khong-phan-trang: tam ca, tong cac cot bang toan tap da loc", async () => {
		const service = dichVu();
		const t = token();
		const [dep, nguoi] = await Promise.all([gieoBoPhan(), gieoNguoi()]);
		const soKeHoach = ONBOARDING.danhMuc.pageSize + 2;
		const planIds: string[] = [];
		const ghiDanhIds: string[] = [];
		for (let i = 0; i < soKeHoach; i += 1) {
			const plan = await gieoKeHoach({
				tenCongTy: `${t} ${i}`,
				ownerId: nguoi.id,
				buoc: [{ label: "Ky", departmentId: dep.id }],
			});
			planIds.push(plan.id);
			const contact = await db.contact.create({
				data: { firstName: `${t} ${i}` },
			});
			const ghi = await db.onboardingEnrollment.create({
				data: { planId: plan.id, contactId: contact.id, source: "tay" },
			});
			ghiDanhIds.push(ghi.id);
		}

		let soCa = 0;
		for (const cachChia of CACH_CHIA) {
			for (const { ten, trang } of DAU_VAO) {
				const bang = await bangCot(service, cachChia, { q: t, ...trang });
				const tong = bang.cot.reduce((s, c) => s + c.tong, 0);
				const mongDoi = cachChia === "bac" ? ghiDanhIds : planIds;
				expect(`${cachChia} ${ten}: tong ${tong}`).toBe(
					`${cachChia} ${ten}: tong ${mongDoi.length}`,
				);
				expect(moiIdMotLan(bang).sort()).toEqual([...mongDoi].sort());
				soCa += 1;
			}
		}
		expect(soCa).toBe(8);
	});
});
