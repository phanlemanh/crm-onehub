import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db, setPrismaLogSink } from "@crm/db";
import { OKR_SO } from "@crm/db/okr-so-config";
import { MA_CHI_SO, type PhamViChiSo } from "@crm/validation/okr-chi-so";
import { chupSoOkr, type DocO } from "../agent/lib/okr-chup";
import { docOSheet } from "../agent/lib/okr-sheets";
import {
	datBienSheets,
	EMAIL_SHEETS,
	googleTheoO,
	oGia,
	sinhKhoa,
} from "./support/google-gia";
import { gieoNguoi, ma, moXuong } from "./support/nhac-gieo";
import {
	donOkr,
	gieoBoPhan,
	gieoChuKy,
	gieoKr,
	gieoMucTieu,
	gieoNguonKr,
	gieoPhongBan,
} from "./support/okr-gieo";

const TRAN_MOT_LUOT_MS = 20_000;
const TRAN_GOOGLE_TREO_MS = 60_000;
const KHOI_KR = 20;
const BAN_GHI_MOI_DON_VI = 10;

const DEM_DUOC = process.env.PRISMA_LOG_QUERIES === "true";

function vn(luc: string): Date {
	return new Date(`${luc}+07:00`);
}

let cau = 0;

function batDem() {
	cau = 0;
	setPrismaLogSink((r) => {
		if (r.level === "query") cau += 1;
		else if (r.level === "error") console.error(r.message);
	});
}

function tatDem(): number {
	setPrismaLogSink((r) => {
		if (r.level === "error") console.error(r.message);
	});
	return cau;
}

type Nen = Awaited<ReturnType<typeof gieoNen>>;

const tao = {
	company: [] as string[],
	contact: [] as string[],
	deal: [] as string[],
	savedView: [] as string[],
	campaign: [] as string[],
	activity: [] as string[],
	touch: [] as string[],
	plan: [] as string[],
	step: [] as string[],
	enrollment: [] as string[],
	form: [] as string[],
	thread: [] as string[],
	message: [] as string[],
};

async function gieoNen() {
	const nguoi: { id: string; email: string; phongBan: string }[] = [];
	const B1 = await gieoBoPhan(null);
	const B2 = await gieoBoPhan(null);
	const phong = [
		await gieoPhongBan(null, B1),
		await gieoPhongBan(null, B1),
		await gieoPhongBan(null, B2),
		await gieoPhongBan(null, B2),
	];
	for (let i = 0; i < 8; i += 1) {
		const u = await gieoNguoi(`Nguoi ${i}`);
		const phongBan = phong[Math.floor(i / 2)] ?? "";
		await db.orgPlacement.create({
			data: { userId: u.id, primaryDepartmentId: phongBan },
		});
		nguoi.push({ id: u.id, email: u.email, phongBan });
	}
	const cty = await db.company.create({ data: { name: ma() } });
	tao.company.push(cty.id);
	const chu = nguoi[0]?.id ?? "";
	const view = await db.savedView.create({
		data: { entity: "CONTACT", name: ma(), filters: {}, ownerId: chu },
	});
	tao.savedView.push(view.id);
	const chienDich = await db.campaign.create({
		data: { name: ma(), savedViewId: view.id, createdById: chu },
	});
	tao.campaign.push(chienDich.id);
	const keHoach = await db.onboardingPlan.createManyAndReturn({
		data: nguoi.map((n) => ({
			companyId: cty.id,
			ownerId: n.id,
			startedAt: vn("2030-12-01T09:00:00"),
			targetDays: 30,
		})),
		select: { id: true },
	});
	tao.plan.push(...keHoach.map((k) => k.id));
	const phamVi: PhamViChiSo[] = [
		{ kieu: "toan-cong-ty" },
		{ kieu: "bo-phan", id: B1 },
		{ kieu: "phong-ban", id: phong[0] ?? "" },
		{ kieu: "nguoi", id: chu },
	];
	return {
		nguoi,
		cty: cty.id,
		chienDich: chienDich.id,
		keHoach: keHoach.map((k) => k.id),
		phamVi,
		chu,
	};
}

async function gieoBanGhi(nen: Nen, tu: number, den: number, luc: Date) {
	const donVi = Array.from({ length: den - tu }, (_, i) => tu + i);
	const cuaDonVi = (k: number) => {
		const n = nen.nguoi[k % nen.nguoi.length];
		const plan = nen.keHoach[k % nen.keHoach.length];
		if (!n || !plan) throw new Error(`không có người thứ ${k}`);
		return { n, plan };
	};
	const caNhan = await db.contact.createManyAndReturn({
		data: donVi.map((k) => ({
			firstName: ma(),
			companyId: nen.cty,
			ownerId: cuaDonVi(k).n.id,
		})),
		select: { id: true, ownerId: true },
	});
	tao.contact.push(...caNhan.map((c) => c.id));
	const moiDonVi = donVi.map((k, i) => ({
		...cuaDonVi(k),
		contact: caNhan[i]?.id ?? "",
	}));
	const deal = await db.deal.createManyAndReturn({
		data: moiDonVi.flatMap(({ n }) => [
			{
				name: ma(),
				companyId: nen.cty,
				ownerId: n.id,
				stage: "CLOSED_WON" as const,
				closedAt: luc,
				createdAt: luc,
			},
			{
				name: ma(),
				companyId: nen.cty,
				ownerId: n.id,
				stage: "CLOSED_WON" as const,
				closedAt: luc,
				createdAt: luc,
			},
			{
				name: ma(),
				companyId: nen.cty,
				ownerId: n.id,
				stage: "DEMO_BOOKED" as const,
				createdAt: luc,
			},
		]),
		select: { id: true },
	});
	tao.deal.push(...deal.map((d) => d.id));
	const hoatDong = await db.activity.createManyAndReturn({
		data: moiDonVi.flatMap(({ n, contact }) => [
			{ type: "CALL" as const, contactId: contact, createdById: n.id },
			{ type: "CALL" as const, contactId: contact, createdById: n.id },
		]),
		select: { id: true, contactId: true, createdById: true },
	});
	tao.activity.push(...hoatDong.map((h) => h.id));
	const cham = await db.campaignTouch.createManyAndReturn({
		data: hoatDong.map((h) => ({
			campaignId: nen.chienDich,
			contactId: h.contactId ?? "",
			activityId: h.id,
			outcome: "MEETING" as const,
			createdById: h.createdById ?? "",
			createdAt: luc,
		})),
		select: { id: true },
	});
	tao.touch.push(...cham.map((c) => c.id));
	const buoc = await db.onboardingStep.createManyAndReturn({
		data: moiDonVi.map(({ n, plan }, i) => ({
			planId: plan,
			label: ma(),
			departmentId: n.phongBan,
			assigneeId: n.id,
			completedAt: luc,
			dueAt: vn("2031-01-20T09:00:00"),
			position: tu + i,
		})),
		select: { id: true },
	});
	tao.step.push(...buoc.map((b) => b.id));
	const ghiDanh = await db.onboardingEnrollment.createManyAndReturn({
		data: moiDonVi.map(({ plan, contact }) => ({
			planId: plan,
			contactId: contact,
			accountAt: luc,
			source: "thu",
		})),
		select: { id: true },
	});
	tao.enrollment.push(...ghiDanh.map((g) => g.id));
	const form = await db.formSubmission.createManyAndReturn({
		data: moiDonVi.map(({ contact }) => ({
			contactId: contact,
			filedAt: luc,
			host: "thu.test",
			path: "/lien-he",
			fields: {},
			dedupeKey: ma(),
		})),
		select: { id: true },
	});
	tao.form.push(...form.map((f) => f.id));
	const goc = moiDonVi.flatMap(({ n }) => [
		{ goc: ma(), tu: n.email },
		{ goc: ma(), tu: n.email },
	]);
	const chuoi = await db.emailThread.createManyAndReturn({
		data: goc.map((g) => ({
			rootMessageId: g.goc,
			subject: g.goc,
			firstMessageAt: luc,
			lastMessageAt: luc,
			messageCount: 1,
		})),
		select: { id: true, rootMessageId: true },
	});
	tao.thread.push(...chuoi.map((c) => c.id));
	const tuCua = new Map(goc.map((g) => [g.goc, g.tu]));
	const thu = await db.emailMessage.createManyAndReturn({
		data: chuoi.map((c) => ({
			threadId: c.id,
			rfcMessageId: c.rootMessageId,
			direction: "OUTBOUND" as const,
			fromEmail: tuCua.get(c.rootMessageId) ?? "",
			recipients: [],
			subject: c.rootMessageId,
			sentAt: luc,
		})),
		select: { id: true },
	});
	tao.message.push(...thu.map((m) => m.id));
	return (
		deal.length +
		cham.length +
		buoc.length +
		ghiDanh.length +
		form.length +
		thu.length
	);
}

async function gieoKhoiKr(
	nen: Nen,
	cycleId: string,
	soKhoi: number,
): Promise<string[]> {
	const objectiveId = await gieoMucTieu({
		cycleId,
		chu: nen.chu,
		congBo: vn("2030-12-20T09:00:00"),
	});
	const ds: string[] = [];
	for (let khoi = 0; khoi < soKhoi; khoi += 1) {
		for (let j = 0; j < KHOI_KR; j += 1) {
			const chiSo = MA_CHI_SO[j % MA_CHI_SO.length] ?? "thoa-thuan-moi";
			const phamVi = nen.phamVi[j % nen.phamVi.length] ?? {
				kieu: "toan-cong-ty",
			};
			const kr = await gieoKr({
				objectiveId,
				chu: nen.chu,
				khoa: vn("2030-12-20T09:00:00"),
				nguon: "crm",
				viTri: khoi * KHOI_KR + j,
			});
			await gieoNguonKr(kr, nen.chu, {
				loai: "crm",
				chiSo,
				phamVi,
				bac: chiSo === "ghi-danh-dat-bac" ? "tai-khoan" : undefined,
			});
			ds.push(kr);
		}
	}
	return ds;
}

async function soDong(ids: string[]): Promise<number> {
	return db.okrSoChup.count({ where: { keyResultId: { in: ids } } });
}

async function donBanGhi() {
	const trong = (ids: string[]) => ({ id: { in: ids } });
	await db.emailMessage.deleteMany({ where: trong(tao.message) });
	await db.emailThread.deleteMany({ where: trong(tao.thread) });
	await db.formSubmission.deleteMany({ where: trong(tao.form) });
	await db.onboardingEnrollment.deleteMany({ where: trong(tao.enrollment) });
	await db.onboardingStep.deleteMany({ where: trong(tao.step) });
	await db.onboardingPlan.deleteMany({ where: trong(tao.plan) });
	await db.campaignTouch.deleteMany({ where: trong(tao.touch) });
	await db.activity.deleteMany({ where: trong(tao.activity) });
	await db.campaign.deleteMany({ where: trong(tao.campaign) });
	await db.savedView.deleteMany({ where: trong(tao.savedView) });
	await db.deal.deleteMany({ where: trong(tao.deal) });
	await db.contact.deleteMany({ where: trong(tao.contact) });
	await db.company.deleteMany({ where: trong(tao.company) });
}

let nen: Nen;

beforeAll(async () => {
	tatDem();
	await donOkr();
	await moXuong();
	nen = await gieoNen();
}, 120_000);

afterAll(async () => {
	await donBanGhi();
	await donOkr();
	setPrismaLogSink(null);
}, 120_000);

describe("hieu-nang", () => {
	test("(a) 200 KR crm, 2.000 bản ghi: một lượt ghi 200 dòng dưới 20 000 ms, số câu mỗi KR không đổi theo số KR", async () => {
		const nhip = vn("2031-02-11T01:00:00");
		const ky = await gieoChuKy("dang-chay", 1, {
			tu: "2031-01-01",
			den: "2031-03-31",
		});
		const luc = vn("2031-01-15T10:00:00");
		const mucCho = await gieoMucTieu({
			cycleId: ky,
			chu: nen.chu,
			congBo: luc,
		});
		const krCho = await gieoKr({
			objectiveId: mucCho,
			chu: nen.chu,
			khoa: luc,
			nguon: "bang-tinh",
		});
		await gieoNguonKr(krCho, nen.chu, {
			loai: "bang-tinh",
			sheetId: "sheet-cho",
			o: "A1",
			thuLuc: nhip,
		});
		const khongDoc: DocO = async () => ({ giaTri: 0 });

		batDem();
		const khung = await chupSoOkr(nhip, { docO: khongDoc });
		const cauKhung = tatDem();
		expect(`khung: ghi ${khung.ghi}, bỏ qua ${khung.boQua}`).toBe(
			"khung: ghi 0, bỏ qua 1",
		);

		const banGhi20 = await gieoBanGhi(nen, 0, KHOI_KR, luc);
		const bo20 = await gieoKhoiKr(nen, ky, 1);
		batDem();
		await chupSoOkr(nhip, { docO: khongDoc });
		const cau20 = tatDem();

		const banGhi200 =
			banGhi20 + (await gieoBanGhi(nen, KHOI_KR, 10 * KHOI_KR, luc));
		const bo200 = await gieoKhoiKr(nen, ky, 10);
		expect(`bản ghi nguồn ${banGhi20} rồi ${banGhi200}`).toBe(
			`bản ghi nguồn ${KHOI_KR * BAN_GHI_MOI_DON_VI} rồi ${10 * KHOI_KR * BAN_GHI_MOI_DON_VI}`,
		);
		batDem();
		const bat = performance.now();
		const luot = await chupSoOkr(nhip, { docO: khongDoc });
		const ms = performance.now() - bat;
		const cau200 = tatDem();

		const dong200 = await soDong(bo200);
		console.log(
			`hieu-nang (a): 200 KR ghi ${dong200} dòng trong ${Math.round(ms)} ms (lượt trả ghi ${luot.ghi})`,
		);
		expect(
			`${bo20.length} KR ghi ${await soDong(bo20)} dòng; ${bo200.length} KR ghi ${dong200} dòng`,
		).toBe("20 KR ghi 20 dòng; 200 KR ghi 200 dòng");
		expect(
			`một lượt 200 KR: ${ms < TRAN_MOT_LUOT_MS ? "dưới" : "TRÊN"} ${TRAN_MOT_LUOT_MS} ms`,
		).toBe(`một lượt 200 KR: dưới ${TRAN_MOT_LUOT_MS} ms`);

		if (!DEM_DUOC) return;
		const moiKr20 = (cau20 - cauKhung) / bo20.length;
		const moiKr200 = (cau200 - cauKhung) / bo200.length;
		console.log(
			`hieu-nang (a): khung ${cauKhung} câu; số câu mỗi KR ở bộ 20 = ${moiKr20}, ở bộ 200 = ${moiKr200}`,
		);
		expect(`đếm được câu truy vấn: ${cau20 > cauKhung}`).toBe(
			"đếm được câu truy vấn: true",
		);
		expect(`số câu mỗi KR: bộ 20 = ${moiKr20}, bộ 200 = ${moiKr200}`).toBe(
			`số câu mỗi KR: bộ 20 = ${moiKr20}, bộ 200 = ${moiKr20}`,
		);
	}, 120_000);

	test("(b) 50 KR crm + 20 KR bảng tính, Google treo: một lượt dưới 60 000 ms, KR chưa đọc được đọc ở lượt kế", async () => {
		const nhip = vn("2032-02-11T01:00:00");
		const ky = await gieoChuKy("dang-chay", 1, {
			tu: "2032-01-01",
			den: "2032-03-31",
		});
		const luc = vn("2032-01-15T10:00:00");
		const muc = await gieoMucTieu({ cycleId: ky, chu: nen.chu, congBo: luc });
		const crm: string[] = [];
		for (let i = 0; i < 50; i += 1) {
			const kr = await gieoKr({
				objectiveId: muc,
				chu: nen.chu,
				khoa: luc,
				nguon: "crm",
				viTri: i,
			});
			await gieoNguonKr(kr, nen.chu, {
				loai: "crm",
				chiSo: "thoa-thuan-moi",
				phamVi: { kieu: "toan-cong-ty" },
			});
			crm.push(kr);
		}
		const bangTinh: string[] = [];
		for (let i = 0; i < 20; i += 1) {
			const kr = await gieoKr({
				objectiveId: muc,
				chu: nen.chu,
				khoa: luc,
				nguon: "bang-tinh",
				viTri: 50 + i,
			});
			await gieoNguonKr(kr, nen.chu, {
				loai: "bang-tinh",
				sheetId: `sheet-${i}`,
				o: "A1",
			});
			bangTinh.push(kr);
		}
		const traBien = datBienSheets({
			email: EMAIL_SHEETS,
			khoa: (await sinhKhoa()).pemEnv,
		});
		let treo = true;
		const g = googleTheoO((sheetId) =>
			treo ? "treo" : oGia(Number(sheetId.slice(6))),
		);
		const docO = docOSheet(g.f);
		const tran = OKR_SO.sheets.toiDaMoiNhip * OKR_SO.sheets.soLanThu;
		const goiMoiLuot: number[] = [];
		const luot = async (luc: Date) => {
			const truoc = g.goi.length;
			await chupSoOkr(luc, { docO });
			goiMoiLuot.push(g.goi.length - truoc);
		};

		try {
			const bat = performance.now();
			await luot(nhip);
			const ms = performance.now() - bat;
			const goi1 = goiMoiLuot[0] ?? 0;
			const dong1 = {
				crm: await soDong(crm),
				bangTinh: await soDong(bangTinh),
			};
			console.log(
				`hieu-nang (b): lượt Google treo ${Math.round(ms)} ms, gọi fetch ${goi1} lần (trần ${tran}), dòng crm ${dong1.crm}, dòng bảng tính ${dong1.bangTinh}`,
			);
			expect(
				`lượt Google treo: ${ms < TRAN_GOOGLE_TREO_MS ? "dưới" : "TRÊN"} ${TRAN_GOOGLE_TREO_MS} ms`,
			).toBe(`lượt Google treo: dưới ${TRAN_GOOGLE_TREO_MS} ms`);
			expect(`gọi fetch ${goi1} lần, trong trần: ${goi1 <= tran}`).toBe(
				`gọi fetch ${goi1} lần, trong trần: true`,
			);
			expect(`gọi fetch lượt treo: ${goi1 > 0}`).toBe(
				"gọi fetch lượt treo: true",
			);
			expect(dong1).toEqual({ crm: 50, bangTinh: 0 });

			treo = false;
			await luot(new Date(nhip.getTime() + 60_000));
			const dong2 = await soDong(bangTinh);
			expect(`lượt kế đọc được ${dong2 > 0}`).toBe("lượt kế đọc được true");
			for (let k = 1; k <= 2 && (await soDong(bangTinh)) < 20; k += 1) {
				await luot(
					new Date(nhip.getTime() + k * OKR_SO.sheets.thuLaiMs + 60_000),
				);
			}
			const dong3 = await db.okrSoChup.findMany({
				where: { keyResultId: { in: bangTinh } },
				select: { giaTri: true },
			});
			console.log(
				`hieu-nang (b): gọi fetch mỗi lượt ${goiMoiLuot.join(" / ")}; dòng bảng tính sau lượt kế ${dong2}, cuối ${dong3.length}`,
			);
			expect(goiMoiLuot.filter((n) => n > tran)).toEqual([]);
			expect(dong3.map((d) => Number(d.giaTri)).sort((x, y) => x - y)).toEqual(
				Array.from({ length: 20 }, (_, i) => i),
			);
		} finally {
			traBien();
		}
	}, 180_000);
});
