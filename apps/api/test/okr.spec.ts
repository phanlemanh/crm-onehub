import { describe, expect, spyOn, test } from "bun:test";
import {
	canManageSettings,
	KHONG_TRONG_PHAM_VI,
	workspaceRoleOf,
} from "@crm/auth";
import { db } from "@crm/db";
import { chonChuKyHienTai } from "@crm/db/okr-tien-do";
import { parseOkrVet } from "@crm/validation/okr-vet";
import type { NutCanChinh } from "../src/okr/okr.contracts";
import { OkrAccessService } from "../src/okr/okr-access.service";
import { OKR } from "../src/okr/okr-config";
import { sangPha } from "./okr-khep-san";
import {
	type AiHoacCookie,
	bpMoi,
	CHUONG_TRINH_RONG,
	dangChay,
	datViTri,
	doc,
	dungSan,
	goi,
	goiQuery,
	type Json,
	kyDangChay,
	ma,
	nguoiMoi,
	ok,
	pbMoi,
	phien,
	phienCua,
	tao,
	taoNam,
	taoQuy,
	truongMoi,
	ungDung,
} from "./okr-san";

const T = OKR.thongDiep;

dungSan();

type ChuKyDoc = {
	id: string;
	kind: string;
	phase: string;
	startsOn: string;
	endsOn: string;
	breakStartsOn: string | null;
	breakEndsOn: string | null;
};

type ChuongTrinh = {
	objectiveCap: number;
	krCap: number;
	capMode: string;
	scoreScale: string;
	weightsOn: boolean;
	personalOn: boolean;
	aiOn: boolean;
	aiDeXuatPhamVi: string;
	aiDeXuatDonVi: string[];
	aiTomTatPhamVi: string;
	aiTomTatDonVi: string[];
	aiDeXuatAnPhamVi: string;
	aiDeXuatAnDonVi: string[];
	aiTomTatAnPhamVi: string;
	aiTomTatAnDonVi: string[];
	aiTranThangUsd: number;
	aiSoanPhamVi: string;
	aiSoanDonVi: string[];
	aiSoanAnPhamVi: string;
	aiSoanAnDonVi: string[];
	aiTranThangDatOkrUsd: number | null;
	duyetCongBo: boolean;
	version: number;
	canManage: boolean;
};

describe("chu-ky", () => {
	test("chu-ky: nam va quy doc lai dung 16 o, tu choi 5 ca, hien tai theo ngay VN", async () => {
		const nam = await taoNam("nam", 2026);
		const quy = await tao(
			"okr.createCycle",
			{
				kind: "quy",
				name: ma("q4"),
				parentId: nam,
				startsOn: "2026-10-01",
				endsOn: "2026-12-31",
				breakStartsOn: "2026-11-01",
				breakEndsOn: "2026-11-03",
				updateWeekday: 1,
			},
			"q4",
		);
		ok(await goi("okr.setCyclePhase", { id: quy, phase: "dang-chay" }), "pha");
		const rows = await db.okrCycle.findMany({
			where: { id: { in: [nam, quy] } },
			orderBy: { kind: "asc" },
		});
		const ngay = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);
		const mong = [
			["nam", null, "2026-01-01", "2026-12-31", null, null, 1, "lap-ke-hoach"],
			[
				"quy",
				nam,
				"2026-10-01",
				"2026-12-31",
				"2026-11-01",
				"2026-11-03",
				1,
				"dang-chay",
			],
		];
		expect(
			rows.map((r) => [
				r.kind,
				r.parentId,
				ngay(r.startsOn),
				ngay(r.endsOn),
				ngay(r.breakStartsOn),
				ngay(r.breakEndsOn),
				r.updateWeekday,
				r.phase,
			]),
		).toEqual(mong);

		const truoc = await db.okrCycle.count();
		const tuChoi = [
			{
				vao: {
					kind: "quy",
					name: ma("x"),
					parentId: nam,
					startsOn: "2026-12-01",
					endsOn: "2027-01-31",
					breakStartsOn: null,
					breakEndsOn: null,
					updateWeekday: 1,
				},
				ai: "quan",
				loi: "Quý phải nằm trọn trong năm cha.",
			},
			{
				vao: {
					kind: "quy",
					name: ma("y"),
					parentId: nam,
					startsOn: "2026-11-15",
					endsOn: "2026-12-15",
					breakStartsOn: null,
					breakEndsOn: null,
					updateWeekday: 1,
				},
				ai: "quan",
				loi: "Chồng ngày",
			},
			{
				vao: {
					kind: "nam",
					name: ma("z"),
					parentId: null,
					startsOn: "2027-01-01",
					endsOn: "2027-12-31",
					breakStartsOn: null,
					breakEndsOn: null,
					updateWeekday: 1,
				},
				ai: "thuong",
				loi: "Cần quyền quản trị",
			},
			{
				vao: {
					kind: "nam",
					name: ma("w"),
					parentId: null,
					startsOn: "2027-01-01",
					endsOn: "2027-12-31",
					breakStartsOn: null,
					breakEndsOn: null,
					updateWeekday: 1,
				},
				ai: "okr",
				loi: "Cần quyền quản trị",
			},
		] as const;
		for (const c of tuChoi) {
			const r = await goi("okr.createCycle", c.vao, c.ai);
			expect(`${c.ai}: ${r.loi}`).toStartWith(`${c.ai}: ${c.loi}`);
			expect(r.status).not.toBe(200);
		}
		const lui = await goi("okr.setCyclePhase", {
			id: quy,
			phase: "lap-ke-hoach",
		});
		expect(lui.loi).toBe("Pha chu kỳ chỉ đi tới, không lùi.");
		expect(await db.okrCycle.count()).toBe(truoc);

		const cs = (await doc<{ cycles: ChuKyDoc[] }>("okr.cycles")).cycles;
		const raNgay = (id: string) => {
			const c = cs.find((x) => x.id === id);
			return c ? [c.startsOn, c.endsOn, c.breakStartsOn, c.breakEndsOn] : null;
		};
		expect(raNgay(nam)).toEqual(["2026-01-01", "2026-12-31", null, null]);
		expect(raNgay(quy)).toEqual([
			"2026-10-01",
			"2026-12-31",
			"2026-11-01",
			"2026-11-03",
		]);
		expect(chonChuKyHienTai(cs, "2026-11-15")?.id).toBe(quy);

		const nam27 = await taoNam("nam27", 2027);
		const q1 = await taoQuy("q1-27", nam27, "2027-01-01", "2027-03-31");
		const cs2 = (await doc<{ cycles: ChuKyDoc[] }>("okr.cycles")).cycles;
		expect(chonChuKyHienTai(cs2, "2026-11-15")?.id).toBe(quy);
		expect(chonChuKyHienTai(cs2, "2027-01-15")?.id).not.toBe(quy);
		expect(chonChuKyHienTai(cs2, "2027-01-15")?.id).toBe(q1);

		const namB = await taoNam("nam-b", 2026);
		const q4KeHoach = await taoQuy("q4-b", namB, "2026-10-01", "2026-12-31");
		const cs3 = (await doc<{ cycles: ChuKyDoc[] }>("okr.cycles")).cycles;
		const keHoach = cs3.filter((c) => c.id === q4KeHoach || c.id === q1);
		expect(keHoach.map((c) => c.phase)).toEqual([
			"lap-ke-hoach",
			"lap-ke-hoach",
		]);
		expect(chonChuKyHienTai(keHoach, "2026-11-20")?.id).toBe(q4KeHoach);
		expect(chonChuKyHienTai(cs3, "2026-11-20")?.id).toBe(quy);
	});

	test("chu-ky: chay lai mot luot o TZ=America/Los_Angeles, chuoi ngay khong lech", async () => {
		const tzCu = process.env.TZ;
		process.env.TZ = "America/Los_Angeles";
		try {
			expect(new Date(2026, 0, 1).getTimezoneOffset()).toBe(480);
			const nam = await taoNam("nam-la", 2026);
			const quy = await tao(
				"okr.createCycle",
				{
					kind: "quy",
					name: ma("q4-la"),
					parentId: nam,
					startsOn: "2026-10-01",
					endsOn: "2026-12-31",
					breakStartsOn: "2026-11-01",
					breakEndsOn: "2026-11-03",
					updateWeekday: 1,
				},
				"q4 la",
			);
			const rows = await db.okrCycle.findMany({
				where: { id: { in: [nam, quy] } },
				orderBy: { kind: "asc" },
			});
			const ngay = (d: Date | null) =>
				d ? d.toISOString().slice(0, 10) : null;
			expect(
				rows.map((r) => [
					ngay(r.startsOn),
					ngay(r.endsOn),
					ngay(r.breakStartsOn),
					ngay(r.breakEndsOn),
				]),
			).toEqual([
				["2026-01-01", "2026-12-31", null, null],
				["2026-10-01", "2026-12-31", "2026-11-01", "2026-11-03"],
			]);
			const cs = (await doc<{ cycles: ChuKyDoc[] }>("okr.cycles")).cycles;
			const raNgay = (id: string) => {
				const c = cs.find((x) => x.id === id);
				return c
					? [c.startsOn, c.endsOn, c.breakStartsOn, c.breakEndsOn]
					: null;
			};
			expect([raNgay(nam), raNgay(quy)]).toEqual([
				["2026-01-01", "2026-12-31", null, null],
				["2026-10-01", "2026-12-31", "2026-11-01", "2026-11-03"],
			]);
		} finally {
			if (tzCu === undefined) delete process.env.TZ;
			else process.env.TZ = tzCu;
		}
	});
});

describe("chuong-trinh", () => {
	test("chuong-trinh: ghi cau hinh tang version, dong cu giu nguyen, thanh vien bi 403", async () => {
		const dau = {
			objectiveCap: 5,
			krCap: 5,
			capMode: "chan",
			scoreScale: "0-100",
			weightsOn: false,
			personalOn: true,
		} as const;
		const v1 = ok<ChuongTrinh>(
			await goi("okr.setProgram", dau),
			"cau hinh dau",
		);
		const chupCu = await db.okrProgramConfig.findUniqueOrThrow({
			where: { version: v1.version },
		});

		const moi = {
			objectiveCap: 2,
			krCap: 2,
			capMode: "canh-bao",
			scoreScale: "0-1",
			weightsOn: true,
			personalOn: false,
		} as const;
		const aiGiuNguyen = {
			aiOn: v1.aiOn,
			aiDeXuatPhamVi: v1.aiDeXuatPhamVi,
			aiDeXuatDonVi: v1.aiDeXuatDonVi,
			aiTomTatPhamVi: v1.aiTomTatPhamVi,
			aiTomTatDonVi: v1.aiTomTatDonVi,
			aiDeXuatAnPhamVi: v1.aiDeXuatAnPhamVi,
			aiDeXuatAnDonVi: v1.aiDeXuatAnDonVi,
			aiTomTatAnPhamVi: v1.aiTomTatAnPhamVi,
			aiTomTatAnDonVi: v1.aiTomTatAnDonVi,
			aiTranThangUsd: v1.aiTranThangUsd,
			aiSoanPhamVi: v1.aiSoanPhamVi,
			aiSoanDonVi: v1.aiSoanDonVi,
			aiSoanAnPhamVi: v1.aiSoanAnPhamVi,
			aiSoanAnDonVi: v1.aiSoanAnDonVi,
			aiTranThangDatOkrUsd: v1.aiTranThangDatOkrUsd,
			duyetCongBo: v1.duyetCongBo,
		};
		const v2 = ok<ChuongTrinh>(
			await goi("okr.setProgram", moi),
			"cau hinh moi",
		);
		expect(v2).toEqual({
			...aiGiuNguyen,
			...moi,
			version: v1.version + 1,
			canManage: true,
		});

		const hai = await db.okrProgramConfig.findMany({
			orderBy: { version: "desc" },
			take: 2,
		});
		expect(hai.map((r) => r.version)).toEqual([v1.version + 1, v1.version]);
		expect(hai[1]).toEqual(chupCu);
		expect(hai[0]?.createdById).toBe(phien.quan.nguoi);

		expect(await doc<ChuongTrinh>("okr.program")).toEqual({
			...aiGiuNguyen,
			...moi,
			version: v1.version + 1,
			canManage: true,
		});
		expect(await doc<ChuongTrinh>("okr.program", "thuong")).toEqual({
			...aiGiuNguyen,
			...moi,
			version: v1.version + 1,
			canManage: false,
		});

		const soDong = await db.okrProgramConfig.count();
		const cam = await goi("okr.setProgram", dau, "thuong");
		expect(`${cam.status} ${cam.loi}`).toBe(
			"403 Cần quyền quản trị để mở chu kỳ hay đổi cấu hình chương trình.",
		);
		expect(await db.okrProgramConfig.count()).toBe(soDong);

		const vet = await db.okrTrail.findMany({
			where: { actorUserId: phien.quan.nguoi, action: "cau-hinh" },
			orderBy: { at: "asc" },
		});
		expect(vet.map((v) => parseOkrVet(v.after)?.version)).toEqual([
			v1.version,
			v1.version + 1,
		]);
	});

	test("chuong-trinh: quyen quan tri chuong trinh la canManageSettings, doc va ghi cung mot co", async () => {
		const ra: string[] = [];
		for (const ai of ["chu", "quan", "thuong", "okr"] as const) {
			const duoc = canManageSettings(await workspaceRoleOf(phien[ai].nguoi));
			const access = await doc<{ canManageProgram: boolean }>("okr.access", ai);
			const ct = await doc<ChuongTrinh>("okr.program", ai);
			const ghi = await goi(
				"okr.setCyclePhase",
				{ id: ma("khong-co"), phase: "dang-chay" },
				ai,
			);
			ra.push(
				`${ai} ${duoc} ${access.canManageProgram} ${ct.canManage} ${ghi.status}`,
			);
		}
		expect(ra).toEqual([
			"chu true true true 404",
			"quan true true true 404",
			"thuong false false false 403",
			"okr false false false 403",
		]);
	});
});

type Tra = { id: string; canhBao: string | null };

const mucTieuVao = (
	cycleId: string,
	unit: Json,
	ownerUserId: string,
	them: Record<string, Json> = {},
) => ({
	cycleId,
	unit,
	title: ma("muc tieu"),
	kind: "cam-ket",
	ownerUserId,
	participantIds: [],
	whyNow: "",
	...them,
});

const krVao = (
	objectiveId: string,
	ownerUserId: string,
	them: Record<string, Json> = {},
) => ({
	objectiveId,
	title: ma("kr"),
	kind: "tang-toi",
	ownerUserId,
	startValue: 10,
	targetValue: 50,
	currentValue: 20,
	unit: "khách",
	dueOn: null,
	weight: 1,
	...them,
});

const taoMucTieu = async (
	vao: Json,
	ai: AiHoacCookie = "quan",
	nhan = "tao muc tieu",
) => ok<Tra>(await goi("okr.createObjective", vao, ai), nhan);

const taoKr = async (vao: Json, ai: AiHoacCookie = "quan", nhan = "tao kr") =>
	ok<Tra>(await goi("okr.createKeyResult", vao, ai), nhan).id;

const caiChuongTrinh = async (them: Record<string, Json> = {}) =>
	ok<{ version: number }>(
		await goi("okr.setProgram", { ...CHUONG_TRINH_RONG, ...them }),
		"cau hinh",
	);

const tuChoi = (r: { status: number; loi: string }) => `${r.status} ${r.loi}`;

describe("chuong-trinh", () => {
	test("chuong-trinh: tran muc tieu canh-bao roi chan, OKR ca nhan tat roi bat", async () => {
		await caiChuongTrinh({ objectiveCap: 2, capMode: "canh-bao" });
		const quy = await kyDangChay("tran");
		const goc = { level: "onehub" };
		const quan = phien.quan.nguoi;
		const ba = [];
		for (const _ of [1, 2, 3])
			ba.push(await taoMucTieu(mucTieuVao(quy, goc, quan)));
		expect(ba.map((r) => r.canhBao)).toEqual([
			null,
			null,
			T.vuotTranMucTieu(2),
		]);

		await caiChuongTrinh({ objectiveCap: 2, capMode: "chan" });
		const dem = () => db.okrObjective.count({ where: { cycleId: quy } });
		const truoc = await dem();
		const thu4 = await goi("okr.createObjective", mucTieuVao(quy, goc, quan));
		expect(tuChoi(thu4)).toBe(`400 ${T.vuotTranMucTieu(3)}`);
		expect(await dem()).toBe(truoc);

		const caNhan = { level: "ca-nhan", personUserId: quan };
		await caiChuongTrinh({ personalOn: false });
		const tat = await goi("okr.createObjective", mucTieuVao(quy, caNhan, quan));
		expect(tuChoi(tat)).toBe(`400 ${T.caNhanTat}`);
		expect(await dem()).toBe(truoc);
		await caiChuongTrinh({ personalOn: true });
		const bat = await taoMucTieu(mucTieuVao(quy, caNhan, quan));
		expect(bat.canhBao).toBeNull();
		expect(await dem()).toBe(truoc + 1);
	});
});

describe("muc-tieu", () => {
	test("muc-tieu: bon cap doc lai 36 o, tu choi 3 ca, sua dung 3 o", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("mt");
		const bp = await bpMoi("bp");
		const pb = await pbMoi("pb", bp);
		const truongP = await truongMoi("department", pb, "truong-p");
		const truongB = await truongMoi("division", bp, "truong-b");
		const thamGia = await nguoiMoi("tham-gia");
		const quan = phien.quan.nguoi;
		const thuong = phien.thuong.nguoi;

		const bonLuot = [
			{
				ai: truongP.cookie,
				vao: mucTieuVao(
					quy,
					{ level: "phong-ban", departmentId: pb },
					truongP.nguoi,
					{
						kind: "tham-vong",
						participantIds: [thamGia],
						whyNow: "Khách mới giảm hai quý liền",
					},
				),
			},
			{
				ai: truongB.cookie,
				vao: mucTieuVao(
					quy,
					{ level: "bo-phan", divisionId: bp },
					truongB.nguoi,
					{
						whyNow: "Bộ phận mới gộp",
					},
				),
			},
			{
				ai: "quan",
				vao: mucTieuVao(quy, { level: "onehub" }, quan, {
					kind: "tham-vong",
					participantIds: [thamGia, truongB.nguoi],
					whyNow: "Năm bản lề",
				}),
			},
			{
				ai: "thuong",
				vao: mucTieuVao(
					quy,
					{ level: "ca-nhan", personUserId: thuong },
					thuong,
					{
						participantIds: [truongP.nguoi],
					},
				),
			},
		];
		const ids: string[] = [];
		for (const [i, l] of bonLuot.entries())
			ids.push((await taoMucTieu(l.vao, l.ai, `luot ${i + 1}`)).id);

		const docLai = async () => {
			const rows = await db.okrObjective.findMany({
				where: { id: { in: ids } },
				include: { participants: true },
			});
			return ids.map((id) => {
				const r = rows.find((x) => x.id === id);
				return r
					? [
							r.level,
							r.divisionId,
							r.departmentId,
							r.personUserId,
							r.ownerUserId,
							r.kind,
							r.status,
							r.whyNow,
							r.participants.length,
						]
					: null;
			});
		};
		expect(await docLai()).toEqual([
			[
				"phong-ban",
				null,
				pb,
				null,
				truongP.nguoi,
				"tham-vong",
				"nhap",
				"Khách mới giảm hai quý liền",
				1,
			],
			[
				"bo-phan",
				bp,
				null,
				null,
				truongB.nguoi,
				"cam-ket",
				"nhap",
				"Bộ phận mới gộp",
				0,
			],
			["onehub", null, null, null, quan, "tham-vong", "nhap", "Năm bản lề", 2],
			["ca-nhan", null, null, thuong, thuong, "cam-ket", "nhap", "", 1],
		]);

		const dem = () => db.okrObjective.count({ where: { cycleId: quy } });
		const truoc = await dem();
		const thieuPb = await goi(
			"okr.createObjective",
			mucTieuVao(quy, { level: "phong-ban" }, truongP.nguoi),
			truongP.cookie,
		);
		expect(thieuPb.status).toBe(400);
		expect(thieuPb.loi).toContain("departmentId");
		const haiO = await goi(
			"okr.createObjective",
			mucTieuVao(
				quy,
				{ level: "bo-phan", divisionId: bp, departmentId: pb },
				truongB.nguoi,
			),
			truongB.cookie,
		);
		expect(haiO.status).toBe(400);
		expect(haiO.loi).toContain("departmentId");
		const nguoiLa = await goi(
			"okr.createObjective",
			mucTieuVao(quy, { level: "onehub" }, "khong-co"),
		);
		expect(tuChoi(nguoiLa)).toBe(`400 ${T.khongPhaiThanhVien("khong-co")}`);
		expect(await dem()).toBe(truoc);

		const tenMoi = ma("ten moi");
		ok(
			await goi(
				"okr.updateObjective",
				{
					id: ids[0] ?? "",
					title: tenMoi,
					kind: "cam-ket",
					participantIds: [thuong, quan],
				},
				truongP.cookie,
			),
			"sua",
		);
		const sau = await db.okrObjective.findUniqueOrThrow({
			where: { id: ids[0] ?? "" },
			include: { participants: { orderBy: { userId: "asc" } } },
		});
		expect([
			sau.title,
			sau.kind,
			sau.participants.map((p) => p.userId),
		]).toEqual([tenMoi, "cam-ket", [thuong, quan].sort()]);
		expect([
			sau.level,
			sau.departmentId,
			sau.ownerUserId,
			sau.status,
			sau.whyNow,
		]).toEqual([
			"phong-ban",
			pb,
			truongP.nguoi,
			"nhap",
			"Khách mới giảm hai quý liền",
		]);
	});
});

type KrDoc = {
	id: string;
	kind: string;
	owner: { name: string };
	progress: number;
};

describe("sau-kieu-kr", () => {
	test("sau-kieu-kr: 6 kieu doc lai 54 o, tu choi 4 ca, xoa de vet, owner roi van doc duoc", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("kr");
		const quan = phien.quan.nguoi;
		const mt = (await taoMucTieu(mucTieuVao(quy, { level: "onehub" }, quan)))
			.id;
		const chu: string[] = [];
		for (const k of ["a", "b", "c", "d", "e", "f"])
			chu.push(await nguoiMoi(`kr-${k}`));
		const bang = [
			["tang-toi", 10, 50, 20, "khách", "2026-12-15", 2],
			["giam-xuong", 30, 10, 25, "ngày", null, 1],
			["giu-tren", 0, 95, 96, "%", "2026-11-30", 1.5],
			["giu-duoi", 0, 5, 3, "lỗi", null, 0.5],
			["moc", 0, 1, 0, "", "2026-12-31", 1],
			["phan-tram", 0, 100, 37.5, "%", null, 3],
		] as const;
		const nguoi = (i: number) => chu[i] ?? "";
		const krIds: string[] = [];
		for (const [
			i,
			[kind, startValue, targetValue, currentValue, unit, dueOn, weight],
		] of bang.entries())
			krIds.push(
				await taoKr(
					krVao(mt, nguoi(i), {
						kind,
						startValue,
						targetValue,
						currentValue,
						unit,
						dueOn,
						weight,
					}),
					"quan",
					kind,
				),
			);

		const rows = await db.okrKeyResult.findMany({
			where: { objectiveId: mt },
			orderBy: { position: "asc" },
		});
		expect(
			rows.map((r) => [
				r.kind,
				Number(r.startValue),
				Number(r.targetValue),
				Number(r.currentValue),
				r.unit,
				r.dueOn ? r.dueOn.toISOString().slice(0, 10) : null,
				Number(r.weight),
				r.ownerUserId,
				r.source,
			]),
		).toEqual(bang.map((b, i) => [...b, nguoi(i), "tay"]));

		const truoc = await db.okrKeyResult.count({ where: { objectiveId: mt } });
		const ca = [
			[{ kind: "la" }, "kind"],
			[
				{ kind: "tang-toi", startValue: 50, targetValue: 50 },
				T.soTheoKieu["dich-phai-lon-hon-khoi-diem"],
			],
			[
				{ kind: "giam-xuong", startValue: 10, targetValue: 20 },
				T.soTheoKieu["dich-phai-nho-hon-khoi-diem"],
			],
			[
				{ kind: "phan-tram", startValue: 0, targetValue: 101 },
				T.soTheoKieu["phan-tram-ngoai-0-100"],
			],
		] as const;
		for (const [them, loi] of ca) {
			const r = await goi("okr.createKeyResult", krVao(mt, quan, them));
			expect(`${them.kind}: ${r.status}`).toBe(`${them.kind}: 400`);
			if (them.kind === "la") expect(r.loi).toContain(loi);
			else expect(r.loi).toBe(loi);
		}
		expect(await db.okrKeyResult.count({ where: { objectiveId: mt } })).toBe(
			truoc,
		);

		const moc = krIds[4] ?? "";
		ok(await goi("okr.removeKeyResult", { id: moc }), "xoa kr");
		expect(await db.okrKeyResult.count({ where: { objectiveId: mt } })).toBe(5);
		expect(
			await db.okrTrail.findFirst({
				where: { keyResultId: moc, action: "xoa-kr" },
			}),
		).not.toBeNull();

		const giam = krIds[1] ?? "";
		const cookieChuKr = await phienCua(nguoi(1));
		const doiKieu = await goi(
			"okr.updateKeyResult",
			{ id: giam, kind: "giu-tren" },
			cookieChuKr,
		);
		expect(tuChoi(doiKieu)).toBe(`403 ${T.khongSuaDuocKr}`);
		ok(
			await goi(
				"okr.updateKeyResult",
				{ id: giam, title: ma("ten kr moi"), currentValue: 25 },
				cookieChuKr,
			),
			"chu kr sua ten",
		);

		const roi = nguoi(0);
		await db.member.deleteMany({ where: { userId: roi } });
		const ct = await doc<{ keyResults: KrDoc[] }>("okr.objective", "quan", {
			id: mt,
		});
		expect(
			ct.keyResults.map((k) => [k.kind, k.owner.name, k.progress]),
		).toEqual([
			["tang-toi", roi, 25],
			["giam-xuong", nguoi(1), 25],
			["giu-tren", nguoi(2), 100],
			["giu-duoi", nguoi(3), 100],
			["phan-tram", nguoi(5), 38],
		]);
	});

	test("sau-kieu-kr: vi tri KR moi sau khi xoa khong trung", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("kr-vt");
		const quan = phien.quan.nguoi;
		const mt = (await taoMucTieu(mucTieuVao(quy, { level: "onehub" }, quan)))
			.id;
		const dau = await taoKr(krVao(mt, quan));
		await taoKr(krVao(mt, quan));
		await taoKr(krVao(mt, quan));
		ok(await goi("okr.removeKeyResult", { id: dau }), "xoa kr dau");
		await taoKr(krVao(mt, quan));
		const viTri = (
			await db.okrKeyResult.findMany({
				where: { objectiveId: mt },
				orderBy: { position: "asc" },
			})
		).map((k) => k.position);
		expect(viTri).toEqual([1, 2, 3]);
	});
});

type CoSo = {
	cycleId: string;
	a: string;
	b: string;
	c: string;
	krSua: string;
	krXoa: string;
	nguon: string;
	dich: string;
	gopXoa: string;
};

const THU_TUC_GHI: { ten: string; vao: (f: CoSo) => Json }[] = [
	{
		ten: "createObjective",
		vao: (f) => mucTieuVao(f.cycleId, { level: "onehub" }, phien.quan.nguoi),
	},
	{ ten: "updateObjective", vao: (f) => ({ id: f.a, title: ma("ten sua") }) },
	{ ten: "publishObjective", vao: (f) => ({ id: f.b }) },
	{ ten: "dropObjective", vao: (f) => ({ id: f.c }) },
	{
		ten: "createKeyResult",
		vao: (f) => krVao(f.a, phien.quan.nguoi),
	},
	{ ten: "updateKeyResult", vao: (f) => ({ id: f.krSua, currentValue: 33 }) },
	{ ten: "removeKeyResult", vao: (f) => ({ id: f.krXoa }) },
	{
		ten: "addAlignment",
		vao: (f) => ({
			objectiveId: f.nguon,
			targetObjectiveId: f.dich,
			targetKeyResultId: null,
		}),
	},
	{ ten: "removeAlignment", vao: (f) => ({ id: f.gopXoa }) },
	{ ten: "previewImport", vao: (f) => loGoc(f.cycleId) },
	{
		ten: "applyImport",
		vao: (f) => ({ ...loGoc(f.cycleId), congBo: false }),
	},
];

const oNhap = (...o: string[]) => o.join("\t");

const loGoc = (cycleId: string) => ({
	cycleId,
	unit: { loai: "goc" },
	text: oNhap(
		ma("nhap pha"),
		"KR pha",
		"mốc",
		"",
		"",
		"",
		`${phien.quan.nguoi}@thu.test`,
	),
});

async function dungCoSo(cycleId: string): Promise<CoSo> {
	const quan = phien.quan.nguoi;
	const goc = { level: "onehub" };
	const a = (await taoMucTieu(mucTieuVao(cycleId, goc, quan))).id;
	const b = (await taoMucTieu(mucTieuVao(cycleId, goc, quan))).id;
	const c = (await taoMucTieu(mucTieuVao(cycleId, goc, quan))).id;
	const krSua = await taoKr(krVao(a, quan));
	const krXoa = await taoKr(krVao(a, quan));
	await taoKr(krVao(b, quan));
	const dich = (await taoMucTieu(mucTieuVao(cycleId, goc, quan))).id;
	const krDich = await taoKr(krVao(dich, quan));
	ok(await goi("okr.publishObjective", { id: dich }), "cong bo dich");
	const nguon = (
		await taoMucTieu(
			mucTieuVao(cycleId, { level: "ca-nhan", personUserId: quan }, quan),
		)
	).id;
	const gopXoa = await tao(
		"okr.addAlignment",
		{ objectiveId: nguon, targetObjectiveId: null, targetKeyResultId: krDich },
		"gan co so",
	);
	return { cycleId, a, b, c, krSua, krXoa, nguon, dich, gopXoa };
}

describe("cong-bo", () => {
	test("cong-bo: khoa khoi diem, can KR, bo giu KR va can chinh", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("cb");
		const quan = phien.quan.nguoi;
		const goc = { level: "onehub" };
		const a = (await taoMucTieu(mucTieuVao(quy, goc, quan))).id;
		const k1 = await taoKr(krVao(a, quan));
		const k2 = await taoKr(
			krVao(a, quan, {
				kind: "giam-xuong",
				startValue: 40,
				targetValue: 10,
				currentValue: 35,
			}),
		);
		ok(await goi("okr.publishObjective", { id: a }), "cong bo");
		const mtA = await db.okrObjective.findUniqueOrThrow({ where: { id: a } });
		expect([mtA.status, mtA.publishedAt !== null]).toEqual(["cong-bo", true]);
		const khoa = await db.okrKeyResult.findMany({
			where: { objectiveId: a },
			orderBy: { position: "asc" },
		});
		expect(khoa.map((k) => [k.id, k.startLockedAt !== null])).toEqual([
			[k1, true],
			[k2, true],
		]);
		const lai = await goi("okr.publishObjective", { id: a });
		expect(tuChoi(lai)).toBe(`400 ${T.daCongBo}`);

		const doiKhoi = await goi("okr.updateKeyResult", {
			id: k1,
			startValue: 12,
		});
		expect(tuChoi(doiKhoi)).toBe(`400 ${T.khoiDiemDaKhoa}`);
		const docK1 = () =>
			db.okrKeyResult.findUniqueOrThrow({ where: { id: k1 } });
		expect(Number((await docK1()).startValue)).toBe(10);
		ok(
			await goi("okr.updateKeyResult", {
				id: k1,
				startValue: 10,
				targetValue: 60,
				lyDoDoiDich: "doi dich ngoai ra giua ky",
			}),
			"doi dich",
		);
		const doiHienTai = await goi("okr.updateKeyResult", {
			id: k1,
			currentValue: 30,
		});
		expect(tuChoi(doiHienTai)).toBe(`400 ${T.hienTaiQuaCapNhat}`);
		const k1Sau = await docK1();
		expect([
			Number(k1Sau.startValue),
			Number(k1Sau.targetValue),
			Number(k1Sau.currentValue),
		]).toEqual([10, 60, 20]);

		const k3 = await taoKr(krVao(a, quan));
		expect(
			(await db.okrKeyResult.findUniqueOrThrow({ where: { id: k3 } }))
				.startLockedAt,
		).not.toBeNull();

		const rong = (await taoMucTieu(mucTieuVao(quy, goc, quan))).id;
		const khongKr = await goi("okr.publishObjective", { id: rong });
		expect(tuChoi(khongKr)).toBe(`400 ${T.congBoCanKr}`);
		expect(
			(await db.okrObjective.findUniqueOrThrow({ where: { id: rong } })).status,
		).toBe("nhap");

		await db.okrAlignment.create({
			data: { objectiveId: a, targetObjectiveId: rong },
		});
		const demKr = () => db.okrKeyResult.count({ where: { objectiveId: a } });
		const demGop = () => db.okrAlignment.count({ where: { objectiveId: a } });
		const [krTruoc, gopTruoc] = [await demKr(), await demGop()];
		ok(await goi("okr.dropObjective", { id: a }), "bo");
		const bo = await db.okrObjective.findUniqueOrThrow({ where: { id: a } });
		expect([
			bo.status,
			bo.droppedAt !== null,
			await demKr(),
			await demGop(),
		]).toEqual(["da-bo", true, krTruoc, gopTruoc]);
		expect([krTruoc, gopTruoc]).toEqual([3, 1]);
		const suaBo = await goi("okr.updateObjective", {
			id: a,
			title: ma("sua sau bo"),
		});
		expect(tuChoi(suaBo)).toBe(`400 ${T.daBo}`);
	});

	test("cong-bo: khoa pha, thu tuc ghi x 2 pha deu 400 va ban ghi khong doi", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("pha");
		const f1 = await dungCoSo(quy);
		const duong: Json[] = [];
		for (const t of THU_TUC_GHI) {
			const r = await goi(`okr.${t.ten}`, t.vao(f1));
			duong.push([t.ten, "dang-chay", r.status, r.loi]);
		}
		expect(duong).toEqual(
			THU_TUC_GHI.map((t) => [t.ten, "dang-chay", 200, ""]),
		);

		const f2 = await dungCoSo(quy);
		const chup = () =>
			db.okrObjective.findMany({
				where: { cycleId: quy },
				include: {
					keyResults: { orderBy: { id: "asc" } },
					participants: true,
					alignments: { orderBy: { id: "asc" } },
				},
				orderBy: { id: "asc" },
			});
		const truoc = await chup();
		const ketQua: Json[] = [];
		for (const pha of ["cham-diem", "da-dong"] as const) {
			ok(await sangPha(quy, pha), pha);
			for (const t of THU_TUC_GHI) {
				const r = await goi(`okr.${t.ten}`, t.vao(f2));
				ketQua.push([t.ten, pha, r.status, r.loi]);
			}
		}
		expect(ketQua).toEqual(
			["cham-diem", "da-dong"].flatMap((pha) =>
				THU_TUC_GHI.map((t) => [t.ten, pha, 400, T.kyDaKhoa]),
			),
		);
		expect(await chup()).toEqual(truoc);
	});

	test("cong-bo: khoi diem doc lai trong transaction, cong bo chen giua khong lot", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("cb-chen");
		const quan = phien.quan.nguoi;
		const a = (await taoMucTieu(mucTieuVao(quy, { level: "onehub" }, quan))).id;
		const k = await taoKr(krVao(a, quan));
		const quyen = ungDung().get(OkrAccessService);
		const goc = quyen.assertSuaKr.bind(quyen);
		const chen = spyOn(quyen, "assertSuaKr").mockImplementationOnce(
			async (userId, id) => {
				const r = await goc(userId, id);
				ok(await goi("okr.publishObjective", { id: a }), "cong bo chen");
				return r;
			},
		);
		const r = await goi("okr.updateKeyResult", { id: k, startValue: 12 });
		chen.mockRestore();
		const sau = await db.okrKeyResult.findUniqueOrThrow({ where: { id: k } });
		expect([
			tuChoi(r),
			Number(sau.startValue),
			sau.startLockedAt !== null,
		]).toEqual([`400 ${T.khoiDiemDaKhoa}`, 10, true]);
	});
});

describe("vet-okr", () => {
	test("vet-okr: chuoi thu tuc ghi de dung mot dong vet moi thu tuc, khong qua activity", async () => {
		await caiChuongTrinh();
		const activityTruoc = await db.activity.count();
		const bp = await bpMoi("vet-bp");
		const pb = await pbMoi("vet-pb", bp);
		const truongP = await truongMoi("department", pb, "vet-p");
		const truongB = await truongMoi("division", bp, "vet-b");
		const k = await nguoiMoi("vet-k");
		const cookieK = await phienCua(k);
		const nam = await taoNam("vet-nam", 2026);
		const quan = phien.quan.nguoi;
		const chu = phien.chu.nguoi;
		const dich = (await taoMucTieu(mucTieuVao(nam, { level: "onehub" }, quan)))
			.id;
		await taoKr(krVao(dich, quan));
		ok(await goi("okr.publishObjective", { id: dich }), "cong bo dich nam");

		const quy = await tao(
			"okr.createCycle",
			{
				kind: "quy",
				name: ma("vet-q"),
				parentId: nam,
				startsOn: "2026-10-01",
				endsOn: "2026-12-31",
				breakStartsOn: null,
				breakEndsOn: null,
				updateWeekday: 1,
			},
			"tao chu ky",
		);
		ok(
			await goi("okr.setCyclePhase", { id: quy, phase: "dang-chay" }, "chu"),
			"doi pha",
		);
		const cauHinh = ok<{ version: number }>(
			await goi(
				"okr.setProgram",
				{ ...CHUONG_TRINH_RONG, objectiveCap: 7 },
				"chu",
			),
			"cau hinh",
		);
		const mt = (
			await taoMucTieu(
				mucTieuVao(
					quy,
					{ level: "phong-ban", departmentId: pb },
					truongP.nguoi,
				),
				truongP.cookie,
			)
		).id;
		ok(
			await goi(
				"okr.updateObjective",
				{ id: mt, title: ma("ten vet moi") },
				truongB.cookie,
			),
			"sua",
		);
		const kr = await taoKr(krVao(mt, k), truongP.cookie);
		ok(
			await goi("okr.updateKeyResult", { id: kr, currentValue: 40 }, cookieK),
			"sua kr",
		);
		const gop = ok<{ id: string }>(
			await goi(
				"okr.addAlignment",
				{ objectiveId: mt, targetObjectiveId: dich, targetKeyResultId: null },
				truongB.cookie,
			),
			"gan can chinh",
		).id;
		ok(
			await goi("okr.removeAlignment", { id: gop }, truongP.cookie),
			"go can chinh",
		);
		ok(
			await goi("okr.publishObjective", { id: mt }, truongB.cookie),
			"cong bo",
		);
		ok(await goi("okr.dropObjective", { id: mt }, truongP.cookie), "bo");

		const docVet = () =>
			db.okrTrail.findMany({
				where: {
					OR: [
						{ objectiveId: mt },
						{ cycleId: quy },
						{ action: "cau-hinh", actorUserId: chu },
					],
				},
				orderBy: [{ at: "asc" }, { id: "asc" }],
			});
		const vet = await docVet();
		expect(
			vet.map((v) => [
				v.actorUserId,
				v.action,
				v.keyResultId ?? v.objectiveId ?? v.cycleId,
			]),
		).toEqual([
			[quan, "tao-chu-ky", quy],
			[chu, "doi-pha", quy],
			[chu, "cau-hinh", null],
			[truongP.nguoi, "tao", mt],
			[truongB.nguoi, "sua", mt],
			[truongP.nguoi, "tao-kr", kr],
			[k, "sua-kr", kr],
			[truongB.nguoi, "gan-can-chinh", mt],
			[truongP.nguoi, "go-can-chinh", mt],
			[truongB.nguoi, "cong-bo", mt],
			[truongP.nguoi, "bo", mt],
		]);
		const doc2 = vet.map((v) => ({
			action: v.action,
			before: parseOkrVet(v.before),
			after: parseOkrVet(v.after),
		}));
		const dong = (a: string) => doc2.find((d) => d.action === a);
		expect(dong("cau-hinh")?.after?.version).toBe(cauHinh.version);
		expect(dong("tao")?.before).toBeNull();
		const sua = dong("sua");
		expect(sua?.before?.title).not.toBe(sua?.after?.title);
		expect([sua?.before?.kind, sua?.after?.kind]).toEqual([
			undefined,
			undefined,
		]);
		expect([dong("cong-bo")?.before, dong("cong-bo")?.after]).toEqual([
			{ status: "nhap" },
			{ status: "cong-bo" },
		]);
		const gan = {
			alignmentId: gop,
			targetObjectiveId: dich,
			targetKeyResultId: null,
		};
		expect([
			dong("gan-can-chinh")?.before,
			dong("gan-can-chinh")?.after,
		]).toEqual([null, gan]);
		expect([dong("go-can-chinh")?.before, dong("go-can-chinh")?.after]).toEqual(
			[gan, null],
		);
		expect(await db.activity.count()).toBe(activityTruoc);

		ok(await sangPha(quy, "cham-diem"), "cham diem");
		expect((await docVet()).length).toBe(vet.length + 1);
	});
});

type Nguoi = "p1" | "p2" | "b1" | "b2" | "k" | "admin" | "member";

describe("quyen-ban-ghi", () => {
	test("quyen-ban-ghi: ma tran 7 nguoi x 8 viec dung bang hang, doc du 200, b1 kiem p3", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("qbg");
		const quan = phien.quan.nguoi;

		const bp1 = await bpMoi("qbg-b1");
		const pb1 = await pbMoi("qbg-p1", bp1);
		const pb2 = await pbMoi("qbg-p2", bp1);
		const bp2 = await bpMoi("qbg-b2");
		const pb3 = await pbMoi("qbg-p3", bp2);

		const truongP1 = await truongMoi("department", pb1, "qbg-truong-p1");
		const truongP2 = await truongMoi("department", pb2, "qbg-truong-p2");
		const truongB1 = await truongMoi("division", bp1, "qbg-truong-b1");
		const truongB2 = await truongMoi("division", bp2, "qbg-truong-b2");

		const k = await nguoiMoi("qbg-k");
		const cookieK = await phienCua(k);
		const memberTran = await nguoiMoi("qbg-tran");
		const cookieTran = await phienCua(memberTran);

		const dvOnehub = { level: "onehub" };
		const dvP1 = { level: "phong-ban", departmentId: pb1 };
		const dvP2 = { level: "phong-ban", departmentId: pb2 };
		const dvB1 = { level: "bo-phan", divisionId: bp1 };
		const dvB2 = { level: "bo-phan", divisionId: bp2 };

		const mtOnehub = await taoMucTieu(mucTieuVao(quy, dvOnehub, quan), "quan");
		const mtB1 = await taoMucTieu(
			mucTieuVao(quy, dvB1, truongB1.nguoi),
			truongB1.cookie,
		);
		const mtB2 = await taoMucTieu(
			mucTieuVao(quy, dvB2, truongB2.nguoi),
			truongB2.cookie,
		);
		const mtP1 = await taoMucTieu(
			mucTieuVao(quy, dvP1, truongP1.nguoi),
			truongP1.cookie,
		);
		const mtP2 = await taoMucTieu(
			mucTieuVao(quy, dvP2, truongP2.nguoi),
			truongP2.cookie,
		);
		const krK = await taoKr(krVao(mtP1.id, k), truongP1.cookie);

		const NGUOI = {
			p1: truongP1.cookie,
			p2: truongP2.cookie,
			b1: truongB1.cookie,
			b2: truongB2.cookie,
			k: cookieK,
			admin: "quan",
			member: cookieTran,
		} satisfies Record<Nguoi, AiHoacCookie>;
		const THU_TU: Nguoi[] = ["p1", "p2", "b1", "b2", "k", "admin", "member"];

		const KY_VONG = {
			p1: [true, true, false, false, false, false, true, false],
			p2: [false, false, true, false, false, false, false, false],
			b1: [true, true, true, true, false, false, true, false, true],
			b2: [false, false, false, false, true, false, false, false],
			k: [false, false, false, false, false, false, true, false],
			admin: [false, false, false, false, false, true, false, true],
			member: [false, false, false, false, false, false, false, false],
		} satisfies Record<Nguoi, boolean[]>;

		const targetCongBo = async () => {
			const mt = await taoMucTieu(
				mucTieuVao(quy, dvP1, truongP1.nguoi),
				truongP1.cookie,
				"cb target",
			);
			await taoKr(krVao(mt.id, truongP1.nguoi), truongP1.cookie, "cb kr");
			return mt.id;
		};

		const ketQua = {} as Record<Nguoi, boolean[]>;
		let dem = 0;
		for (const nguoi of THU_TU) {
			const cookie = NGUOI[nguoi];
			const viec: boolean[] = [];
			viec.push(
				(
					await goi(
						"okr.updateObjective",
						{ id: mtP1.id, title: ma("qbg-sua-p1") },
						cookie,
					)
				).status === 200,
			);
			const congBoId = await targetCongBo();
			viec.push(
				(await goi("okr.publishObjective", { id: congBoId }, cookie)).status ===
					200,
			);
			viec.push(
				(
					await goi(
						"okr.updateObjective",
						{ id: mtP2.id, title: ma("qbg-sua-p2") },
						cookie,
					)
				).status === 200,
			);
			viec.push(
				(
					await goi(
						"okr.updateObjective",
						{ id: mtB1.id, title: ma("qbg-sua-b1") },
						cookie,
					)
				).status === 200,
			);
			viec.push(
				(
					await goi(
						"okr.updateObjective",
						{ id: mtB2.id, title: ma("qbg-sua-b2") },
						cookie,
					)
				).status === 200,
			);
			viec.push(
				(
					await goi(
						"okr.updateObjective",
						{ id: mtOnehub.id, title: ma("qbg-sua-oh") },
						cookie,
					)
				).status === 200,
			);
			dem += 1;
			viec.push(
				(
					await goi(
						"okr.updateKeyResult",
						{ id: krK, currentValue: 20 + dem },
						cookie,
					)
				).status === 200,
			);
			viec.push(
				(
					await goi(
						"okr.createCycle",
						{
							kind: "nam",
							name: ma("qbg-taochuky"),
							parentId: null,
							startsOn: "2031-01-01",
							endsOn: "2031-12-31",
							breakStartsOn: null,
							breakEndsOn: null,
							updateWeekday: 1,
						},
						cookie,
					)
				).status === 200,
			);
			ketQua[nguoi] = viec;
		}

		ok(await datViTri(truongB1.nguoi, null, [pb3]), "xep b1 vao p3");
		ok(
			await goi("org.setHead", {
				kind: "department",
				id: pb3,
				userId: truongB1.nguoi,
			}),
			"truong p3 la b1",
		);
		const mtP3 = await taoMucTieu(
			mucTieuVao(
				quy,
				{ level: "phong-ban", departmentId: pb3 },
				truongB1.nguoi,
			),
			truongB1.cookie,
			"tao p3",
		);
		ketQua.b1.push(
			(
				await goi(
					"okr.updateObjective",
					{ id: mtP3.id, title: ma("qbg-sua-p3") },
					truongB1.cookie,
				)
			).status === 200,
		);

		expect(ketQua).toEqual(KY_VONG);

		for (const nguoi of THU_TU) {
			const cookie = NGUOI[nguoi];
			await doc("okr.objective", cookie, { id: mtOnehub.id });
			await doc("okr.byUnit", cookie, { cycleId: quy, unit: { loai: "goc" } });
		}
	});
});

describe("chi-okr", () => {
	test("chi-okr: vai chi-okr lam truong ghi duoc OKR phong ban, khong truong tu choi dung thong diep, doi tac 403", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("chiokr");
		const pb = await pbMoi("chiokr-p");

		const truong = await nguoiMoi("chiokr-truong", "okr");
		ok(await datViTri(truong, pb), "xep truong vao pb");
		ok(
			await goi("org.setHead", { kind: "department", id: pb, userId: truong }),
			"truong pb",
		);
		const cookieTruong = await phienCua(truong);

		const mt = await taoMucTieu(
			mucTieuVao(quy, { level: "phong-ban", departmentId: pb }, truong),
			cookieTruong,
			"chiokr tao",
		);
		const krId = await taoKr(krVao(mt.id, truong), cookieTruong, "chiokr kr");
		ok(
			await goi("okr.publishObjective", { id: mt.id }, cookieTruong),
			"chiokr cong bo",
		);

		const mtSau = await db.okrObjective.findUniqueOrThrow({
			where: { id: mt.id },
		});
		expect([mtSau.status, mtSau.publishedAt !== null]).toEqual([
			"cong-bo",
			true,
		]);
		const krSau = await db.okrKeyResult.findUniqueOrThrow({
			where: { id: krId },
		});
		expect(krSau.startLockedAt !== null).toBe(true);

		await doc("org.tree", cookieTruong);

		const thuong = await nguoiMoi("chiokr-thuong", "okr");
		const cookieThuong = await phienCua(thuong);
		await doc("okr.byUnit", cookieThuong, {
			cycleId: quy,
			unit: { loai: "pb", id: pb },
		});
		const tuChoiTao = await goi(
			"okr.createObjective",
			mucTieuVao(quy, { level: "phong-ban", departmentId: pb }, thuong),
			cookieThuong,
		);
		expect(tuChoiTao.status).toBe(403);
		expect(tuChoiTao.loi).toBe(T.khongSuaDuocDonVi);
		expect(tuChoiTao.loi).not.toBe(KHONG_TRONG_PHAM_VI);

		for (const cookie of [cookieTruong, cookieThuong]) {
			const contacts = await goiQuery("contacts.list", cookie, {});
			expect(contacts.status).toBe(403);
			expect(contacts.loi).toBe(KHONG_TRONG_PHAM_VI);
			const deals = await goiQuery("deals.list", cookie, {});
			expect(deals.status).toBe(403);
			expect(deals.loi).toBe(KHONG_TRONG_PHAM_VI);
		}
	});
});

describe("cua-toi", () => {
	test("cua-toi: okr.mine gom owner, participant va KR cua toi; P3 khong lien quan; access dung headOf", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("cuatoi");

		const pb1 = await pbMoi("ct-p1");
		const pb2 = await pbMoi("ct-p2");
		const pb3 = await pbMoi("ct-p3");

		const truong = await nguoiMoi("ct-truong");
		ok(await datViTri(truong, pb1, [pb2, pb3]), "xep truong");
		ok(
			await goi("org.setHead", { kind: "department", id: pb1, userId: truong }),
			"truong p1",
		);
		ok(
			await goi("org.setHead", { kind: "department", id: pb2, userId: truong }),
			"truong p2",
		);
		ok(
			await goi("org.setHead", { kind: "department", id: pb3, userId: truong }),
			"truong p3",
		);
		const cookieTruong = await phienCua(truong);

		const k = await nguoiMoi("ct-k");
		const cookieK = await phienCua(k);
		const memberTrang = await nguoiMoi("ct-trang");
		const cookieTrang = await phienCua(memberTrang);

		const mtP1 = await taoMucTieu(
			mucTieuVao(quy, { level: "phong-ban", departmentId: pb1 }, truong),
			cookieTruong,
			"ct p1",
		);
		await taoKr(krVao(mtP1.id, k), cookieTruong, "ct kr k");
		const mtP2 = await taoMucTieu(
			mucTieuVao(quy, { level: "phong-ban", departmentId: pb2 }, truong, {
				participantIds: [k],
			}),
			cookieTruong,
			"ct p2",
		);
		const mtCaNhan = await taoMucTieu(
			mucTieuVao(quy, { level: "ca-nhan", personUserId: k }, k),
			cookieK,
			"ct ca nhan",
		);
		const mtP3 = await taoMucTieu(
			mucTieuVao(quy, { level: "phong-ban", departmentId: pb3 }, truong),
			cookieTruong,
			"ct p3",
		);

		const mine = await doc<{
			objectives: { id: string; keyResults: { laCuaToi: boolean }[] }[];
		}>("okr.mine", cookieK, { cycleId: quy });
		expect(mine.objectives.map((o) => o.id).sort()).toEqual(
			[mtP1.id, mtP2.id, mtCaNhan.id].sort(),
		);
		expect(mine.objectives.some((o) => o.id === mtP3.id)).toBe(false);
		const soCuaToi = mine.objectives
			.flatMap((o) => o.keyResults)
			.filter((kr) => kr.laCuaToi).length;
		expect(soCuaToi).toBe(1);

		const mineTrang = await doc<{ objectives: unknown[] }>(
			"okr.mine",
			cookieTrang,
			{ cycleId: quy },
		);
		expect(mineTrang.objectives).toEqual([]);

		const byUnitTrang = await doc<{ objectives: { id: string }[] }>(
			"okr.byUnit",
			cookieTrang,
			{ cycleId: quy, unit: { loai: "pb", id: pb1 } },
		);
		expect(byUnitTrang.objectives.map((o) => o.id)).toContain(mtP1.id);

		const accessTruong = await doc<{
			canManageProgram: boolean;
			headOf: { divisions: string[]; departments: string[] };
		}>("okr.access", cookieTruong);
		expect(accessTruong.headOf.departments).toContain(pb1);
		expect(accessTruong.canManageProgram).toBe(false);

		const accessAdmin = await doc<{
			canManageProgram: boolean;
			headOf: { divisions: string[]; departments: string[] };
		}>("okr.access", "quan");
		expect(accessAdmin.canManageProgram).toBe(true);
		expect(accessAdmin.headOf).toEqual({ divisions: [], departments: [] });
	});
});

describe("dem-theo-don-vi", () => {
	test("dem-theo-don-vi: dem muc tieu da cong bo dung tung don vi, bo nhap va da bo, rieng tung chu ky", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("dem");
		const quyKhac = await kyDangChay("dem-khac");
		const bp = await bpMoi("dem-bp");
		const pb = await pbMoi("dem-pb", bp);
		const pbRong = await pbMoi("dem-pb-rong", bp);
		const truongB = await truongMoi("division", bp, "dem-b");
		const truongP = await truongMoi("department", pb, "dem-p");
		const k = await nguoiMoi("dem-k");
		const cookieK = await phienCua(k);

		const congBo = async (
			cycleId: string,
			unit: Json,
			owner: string,
			ai: AiHoacCookie,
		) => {
			const id = (await taoMucTieu(mucTieuVao(cycleId, unit, owner), ai)).id;
			await taoKr(krVao(id, owner), ai);
			ok(await goi("okr.publishObjective", { id }, ai), "cong bo");
			return id;
		};
		const goc = { level: "onehub" };
		const donB = { level: "bo-phan", divisionId: bp };
		const donP = { level: "phong-ban", departmentId: pb };
		const quan = phien.quan.nguoi;

		await congBo(quy, goc, quan, "quan");
		await taoMucTieu(mucTieuVao(quy, goc, quan));
		await congBo(quy, donB, truongB.nguoi, truongB.cookie);
		await congBo(quy, donP, truongP.nguoi, truongP.cookie);
		await congBo(quy, donP, truongP.nguoi, truongP.cookie);
		const bo = await congBo(quy, donP, truongP.nguoi, truongP.cookie);
		ok(await goi("okr.dropObjective", { id: bo }, truongP.cookie), "bo");
		await congBo(quy, { level: "ca-nhan", personUserId: k }, k, cookieK);
		await congBo(quyKhac, donP, truongP.nguoi, truongP.cookie);

		const khoa = ["goc", `bp:${bp}`, `pb:${pb}`, `pb:${pbRong}`, `nguoi:${k}`];
		const docDem = async (cycleId: string, ai: AiHoacCookie) => {
			const dem = await doc<Record<string, number>>("okr.countByUnit", ai, {
				cycleId,
			});
			return khoa.map((x) => [x, dem[x] ?? 0]);
		};
		expect(await docDem(quy, "quan")).toEqual([
			["goc", 1],
			[`bp:${bp}`, 1],
			[`pb:${pb}`, 2],
			[`pb:${pbRong}`, 0],
			[`nguoi:${k}`, 1],
		]);
		expect(await docDem(quy, "thuong")).toEqual(await docDem(quy, "quan"));
		expect(await docDem(quyKhac, "okr")).toEqual([
			["goc", 0],
			[`bp:${bp}`, 0],
			[`pb:${pb}`, 1],
			[`pb:${pbRong}`, 0],
			[`nguoi:${k}`, 0],
		]);
	});
});

type CayCanChinh = { roots: NutCanChinh[]; chuaCanChinh: NutCanChinh[] };

function choCua(cay: CayCanChinh, id: string): [string, boolean][] {
	const ra: [string, boolean][] = [];
	const di = (n: NutCanChinh, cha: string) => {
		if (n.id === id) ra.push([cha, n.lapLai]);
		for (const con of n.children) di(con, n.id);
	};
	for (const n of [...cay.roots, ...cay.chuaCanChinh]) di(n, "-");
	return ra.sort((x, y) => x[0].localeCompare(y[0]));
}

const theoCha = (...cho: [string, boolean][]) =>
	cho.sort((x, y) => x[0].localeCompare(y[0]));

describe("can-chinh", () => {
	test("can-chinh: gan nhieu-nhieu len cap tren da cong bo, cay lapLai, 6 ca tu choi, go", async () => {
		await caiChuongTrinh();
		const C = T.canChinh;
		const quan = phien.quan.nguoi;
		const nam = await taoNam("cc-nam", 2026);
		const quy = await taoQuy("cc", nam, "2026-10-01", "2026-12-31");
		await dangChay(quy);
		const quyKhac = await taoQuy("cc-khac", nam, "2026-07-01", "2026-09-30");
		const bp = await bpMoi("cc-bp");
		const pb = await pbMoi("cc-pb", bp);
		const pb2 = await pbMoi("cc-pb2", bp);
		const truongB = await truongMoi("division", bp, "cc-b");
		const truongP = await truongMoi("department", pb, "cc-p");
		const truongP2 = await truongMoi("department", pb2, "cc-p2");
		const congBo = async (
			cycleId: string,
			unit: Json,
			owner: string,
			ai: AiHoacCookie,
		) => {
			const id = (await taoMucTieu(mucTieuVao(cycleId, unit, owner), ai)).id;
			const kr = await taoKr(krVao(id, owner), ai);
			ok(await goi("okr.publishObjective", { id }, ai), "cong bo");
			return { id, kr };
		};
		const goc = { level: "onehub" };
		const O = (await taoMucTieu(mucTieuVao(quy, goc, quan))).id;
		const kr1 = await taoKr(krVao(O, quan));
		const kr2 = await taoKr(krVao(O, quan));
		ok(await goi("okr.publishObjective", { id: O }), "cong bo O");
		const donViB = { level: "bo-phan", divisionId: bp };
		const B = await congBo(quy, donViB, truongB.nguoi, truongB.cookie);
		const Bnam = await congBo(nam, donViB, truongB.nguoi, truongB.cookie);
		const P = await congBo(
			quy,
			{ level: "phong-ban", departmentId: pb },
			truongP.nguoi,
			truongP.cookie,
		);
		const P2 = await congBo(
			quy,
			{ level: "phong-ban", departmentId: pb2 },
			truongP2.nguoi,
			truongP2.cookie,
		);
		const Onhap = (await taoMucTieu(mucTieuVao(quy, goc, quan))).id;
		const Okhac = await congBo(quyKhac, goc, quan, "quan");

		const gan = (
			objectiveId: string,
			dich: { mt?: string; kr?: string },
			ai: AiHoacCookie = truongP.cookie,
		) =>
			goi(
				"okr.addAlignment",
				{
					objectiveId,
					targetObjectiveId: dich.mt ?? null,
					targetKeyResultId: dich.kr ?? null,
				},
				ai,
			);
		const demP = () => db.okrAlignment.count({ where: { objectiveId: P.id } });
		const cayQuy = () =>
			doc<CayCanChinh>("okr.alignmentTree", "thuong", { cycleId: quy });

		ok(await gan(P.id, { kr: kr1 }), "P -> KR1");
		ok(await gan(P.id, { mt: B.id }), "P -> B");
		expect(choCua(await cayQuy(), P.id)).toEqual(
			theoCha([kr1, false], [B.id, true]),
		);
		ok(await gan(P.id, { mt: Bnam.id }), "P -> B nam");
		expect(await demP()).toBe(3);

		const cay = await cayQuy();
		expect(choCua(cay, P.id)).toEqual(
			theoCha([kr1, false], [B.id, true], [Bnam.id, true]),
		);
		expect(cay.roots.map((n) => n.id).sort()).toEqual([O, Onhap].sort());
		expect(
			cay.roots
				.find((n) => n.id === O)
				?.children.map((n) => [n.loai, n.id, n.children.map((c) => c.id)]),
		).toEqual([
			["kr", kr1, [P.id]],
			["kr", kr2, []],
		]);
		expect(choCua(cay, P2.id)).toEqual([["-", false]]);
		expect(
			choCua(
				await doc<CayCanChinh>("okr.alignmentTree", "thuong", {
					cycleId: nam,
				}),
				P.id,
			),
		).toEqual([[Bnam.id, false]]);

		const ungVien = await doc<{
			targets: { objectiveId: string; keyResultId: string | null }[];
		}>("okr.alignmentTargets", "thuong", { objectiveId: P.id });
		expect(
			new Set(
				ungVien.targets.map((t) => `${t.objectiveId}/${t.keyResultId ?? ""}`),
			),
		).toEqual(
			new Set([
				`${O}/`,
				`${O}/${kr1}`,
				`${O}/${kr2}`,
				`${B.id}/`,
				`${B.id}/${B.kr}`,
				`${Bnam.id}/`,
				`${Bnam.id}/${Bnam.kr}`,
			]),
		);
		expect(ungVien.targets.length).toBe(7);

		const ca: [string, string, { mt?: string; kr?: string }, string, string][] =
			[
				["P -> P2 cung cap", P.id, { mt: P2.id }, truongP.cookie, C.cungCap],
				["B -> P cap thap hon", B.id, { mt: P.id }, truongB.cookie, C.cungCap],
				["P -> P", P.id, { mt: P.id }, truongP.cookie, C.chinhNo],
				["P -> nhap", P.id, { mt: Onhap }, truongP.cookie, C.chuaCongBo],
				["P -> quy khac", P.id, { mt: Okhac.id }, truongP.cookie, C.khacChuKy],
				["gan lai P -> B", P.id, { mt: B.id }, truongP.cookie, C.daGan],
			];
		const ketQua: Json[] = [];
		for (const [nhan, nguon, dich, ai] of ca) {
			const r = await gan(nguon, dich, ai);
			ketQua.push([nhan, r.status, r.loi]);
		}
		expect([
			await demP(),
			await db.okrAlignment.count({ where: { objectiveId: B.id } }),
		]).toEqual([3, 0]);
		expect(ketQua).toEqual(ca.map(([nhan, , , , loi]) => [nhan, 400, loi]));

		expect(tuChoi(await gan(P.id, {}))).toBe(`400 ${C.khongCoDich}`);
		expect(tuChoi(await gan(P.id, { mt: O, kr: kr1 }))).toBe(
			`400 ${C.khongCoDich}`,
		);
		expect(tuChoi(await gan(P.id, { mt: O }, "thuong"))).toBe(
			`403 ${T.khongSuaDuocDonVi}`,
		);
		expect(await demP()).toBe(3);

		const chiTiet = await doc<{
			alignments: {
				targetObjectiveId: string;
				targetKeyResultId: string | null;
				alignmentId: string;
			}[];
		}>("okr.objective", "thuong", { id: P.id });
		expect(
			chiTiet.alignments.map((g) => [g.targetObjectiveId, g.targetKeyResultId]),
		).toEqual([
			[O, kr1],
			[B.id, null],
			[Bnam.id, null],
		]);

		const xoaDich = await goi("okr.removeKeyResult", { id: kr1 });
		expect(tuChoi(xoaDich)).toBe(`400 ${T.krDangLaDich}`);
		expect(await db.okrKeyResult.count({ where: { id: kr1 } })).toBe(1);
		ok(await goi("okr.removeKeyResult", { id: kr2 }), "xoa kr khong la dich");
		expect(await db.okrKeyResult.count({ where: { id: kr2 } })).toBe(0);

		const gopB = chiTiet.alignments.find((g) => g.targetObjectiveId === B.id);
		expect(
			tuChoi(
				await goi(
					"okr.removeAlignment",
					{ id: gopB?.alignmentId ?? "" },
					"thuong",
				),
			),
		).toBe(`403 ${T.khongSuaDuocDonVi}`);
		expect(await demP()).toBe(3);
		ok(
			await goi(
				"okr.removeAlignment",
				{ id: gopB?.alignmentId ?? "" },
				truongP.cookie,
			),
			"go P -> B",
		);
		expect(await demP()).toBe(2);
		expect(choCua(await cayQuy(), P.id)).toEqual(
			theoCha([kr1, false], [Bnam.id, true]),
		);

		const gopP2 = ok<{ id: string }>(
			await gan(P2.id, { mt: O }, truongP2.cookie),
			"P2 -> O",
		).id;
		ok(await goi("okr.dropObjective", { id: P2.id }, truongP2.cookie), "bo P2");
		const demP2 = () =>
			db.okrAlignment.count({ where: { objectiveId: P2.id } });
		expect([
			tuChoi(await gan(P2.id, { kr: kr1 }, truongP2.cookie)),
			tuChoi(await goi("okr.removeAlignment", { id: gopP2 }, truongP2.cookie)),
			await demP2(),
		]).toEqual([`400 ${T.daBo}`, `400 ${T.daBo}`, 1]);
	});
});

type XemNhap = {
	rows: { line: number; error: string | null }[];
	summary: { valid: number; invalid: number; objectives: number };
};
type GhiNhap = { written: number; objectives: number; keyResults: number };

describe("nhap-bang-tinh", () => {
	test("nhap-bang-tinh: truong P xem truoc roi ghi, nhap lai 0 dong, cong bo, lo qua dai, tran chan, quyen", async () => {
		const N = T.nhap;
		await caiChuongTrinh();
		const quy = await kyDangChay("nhap");
		const p = await pbMoi("P nhap");
		const truong = await truongMoi("department", p, "truong P");
		const email = `${truong.nguoi}@thu.test`;
		const mtA = ma("Tăng doanh thu");
		const mtB = ma("Giữ chân khách");
		const vao = {
			cycleId: quy,
			unit: { loai: "pb", id: p },
			text: [
				oNhap("Mục tiêu", "KR", "Kiểu", "Khởi điểm", "Đích", "Đơn vị", "Email"),
				oNhap(
					mtA,
					"Doanh thu quý",
					"Tăng tới",
					"1000",
					"2.000,5",
					"triệu",
					email.toUpperCase(),
				),
				"",
				oNhap(mtA, "Khách mới", "mốc", "", "", "", email),
				oNhap(mtB, "Tỉ lệ giữ", "phần trăm", "", "90", "%", email),
				oNhap(mtB, "KR lạ", "tăng tới", "0", "10", "", "la@khac.test"),
			].join("\n"),
		};
		const demMt = () =>
			db.okrObjective.count({ where: { cycleId: quy, departmentId: p } });
		const demVetLo = () =>
			db.okrTrail.count({ where: { cycleId: quy, action: "nhap-bang-tinh" } });

		const xem = ok<XemNhap>(
			await goi("okr.previewImport", vao, truong.cookie),
			"xem truoc",
		);
		expect(xem.rows.map((r) => [r.line, r.error])).toEqual([
			[2, null],
			[4, null],
			[5, null],
			[6, N.emailLa],
		]);
		expect(xem.summary).toEqual({ valid: 3, invalid: 1, objectives: 2 });
		expect([await demMt(), await demVetLo()]).toEqual([0, 0]);

		const ghi = ok<GhiNhap>(
			await goi("okr.applyImport", { ...vao, congBo: false }, truong.cookie),
			"ghi",
		);
		expect(ghi).toEqual({ written: 3, objectives: 2, keyResults: 3 });
		const mts = await db.okrObjective.findMany({
			where: { cycleId: quy, departmentId: p },
			include: { keyResults: { orderBy: { position: "asc" } } },
			orderBy: { position: "asc" },
		});
		expect(
			mts.map((m) => [
				m.title,
				m.level,
				m.status,
				m.kind,
				m.ownerUserId,
				m.publishedAt,
				m.keyResults.map((k) => [
					k.title,
					k.kind,
					Number(k.startValue),
					Number(k.targetValue),
					Number(k.currentValue),
					k.unit,
					k.ownerUserId,
					k.source,
					k.position,
					k.startLockedAt,
				]),
			]),
		).toEqual([
			[
				mtA,
				"phong-ban",
				"nhap",
				"cam-ket",
				truong.nguoi,
				null,
				[
					[
						"Doanh thu quý",
						"tang-toi",
						1000,
						2000.5,
						1000,
						"triệu",
						truong.nguoi,
						"tay",
						0,
						null,
					],
					["Khách mới", "moc", 0, 1, 0, "", truong.nguoi, "tay", 1, null],
				],
			],
			[
				mtB,
				"phong-ban",
				"nhap",
				"cam-ket",
				truong.nguoi,
				null,
				[
					[
						"Tỉ lệ giữ",
						"phan-tram",
						0,
						90,
						0,
						"%",
						truong.nguoi,
						"tay",
						0,
						null,
					],
				],
			],
		]);
		const vetLo = await db.okrTrail.findMany({
			where: { cycleId: quy, action: "nhap-bang-tinh" },
		});
		expect(
			vetLo.map((v) => [v.actorUserId, v.before, parseOkrVet(v.after)]),
		).toEqual([
			[
				truong.nguoi,
				null,
				{ unit: `pb:${p}`, cycleId: quy, objectives: 2, keyResults: 3 },
			],
		]);
		const vetTao = await db.okrTrail.findMany({
			where: { action: "tao", objectiveId: { in: mts.map((m) => m.id) } },
			orderBy: { at: "asc" },
		});
		expect(vetTao.map((v) => [v.objectiveId, v.actorUserId])).toEqual(
			mts.map((m) => [m.id, truong.nguoi]),
		);

		const ghiLai = ok<GhiNhap>(
			await goi("okr.applyImport", { ...vao, congBo: false }, truong.cookie),
			"ghi lai",
		);
		expect([ghiLai, await demMt(), await demVetLo()]).toEqual([
			{ written: 0, objectives: 0, keyResults: 0 },
			2,
			1,
		]);

		const xemLai = ok<XemNhap>(
			await goi("okr.previewImport", vao, truong.cookie),
			"xem lai",
		);
		expect(xemLai.rows.map((r) => r.error)).toEqual([
			N.daCo,
			N.daCo,
			N.daCo,
			N.emailLa,
		]);
		const mtC = ma("Công bố ngay");
		ok<GhiNhap>(
			await goi(
				"okr.applyImport",
				{
					...vao,
					text: oNhap(mtC, "KR công bố", "giữ trên", "0", "5", "", email),
					congBo: true,
				},
				truong.cookie,
			),
			"ghi cong bo",
		);
		const c = await db.okrObjective.findFirstOrThrow({
			where: { cycleId: quy, title: mtC },
			include: { keyResults: true },
		});
		expect([
			c.status,
			c.publishedAt !== null,
			c.keyResults.map((k) => k.startLockedAt !== null),
		]).toEqual(["cong-bo", true, [true]]);

		const truocQuaDai = [await demMt(), await demVetLo()];
		const quaDai = {
			...vao,
			text: Array.from({ length: 1001 }, (_, i) =>
				oNhap(`${mtA} ${i}`, "KR lô", "mốc", "", "", "", email),
			).join("\n"),
		};
		const quaDaiRa = [
			await goi("okr.previewImport", quaDai, truong.cookie),
			await goi("okr.applyImport", { ...quaDai, congBo: false }, truong.cookie),
		].map(tuChoi);
		expect(quaDaiRa).toEqual([
			`400 ${N.loQuaDai(OKR.lo.toiDaDong)}`,
			`400 ${N.loQuaDai(OKR.lo.toiDaDong)}`,
		]);
		expect([await demMt(), await demVetLo()]).toEqual(truocQuaDai);

		const q = await pbMoi("Q khong truong");
		const demQ = () =>
			db.okrObjective.count({ where: { cycleId: quy, departmentId: q } });
		const baMoi = {
			cycleId: quy,
			unit: { loai: "pb", id: q },
			text: ["Một", "Hai", "Ba"]
				.map((t) => oNhap(ma(t), "KR một", "mốc", "", "", "", email))
				.join("\n"),
		};
		await caiChuongTrinh({ capMode: "chan", objectiveCap: 2 });
		const vetTruocTran = await demVetLo();
		const tran = [
			await goi("okr.previewImport", baMoi),
			await goi("okr.applyImport", { ...baMoi, congBo: false }),
		].map(tuChoi);
		expect(tran).toEqual([`400 ${N.vuotTran(2)}`, `400 ${N.vuotTran(2)}`]);
		expect([await demQ(), await demVetLo()]).toEqual([0, vetTruocTran]);
		const laiQuaTran = await goi(
			"okr.applyImport",
			{ ...vao, congBo: false },
			truong.cookie,
		);
		expect([
			laiQuaTran.status,
			laiQuaTran.data,
			await demMt(),
			await demVetLo(),
		]).toEqual([
			200,
			{ written: 0, objectives: 0, keyResults: 0 },
			3,
			vetTruocTran,
		]);

		await caiChuongTrinh({ objectiveCap: 2 });
		const tuChoiThuong = [
			await goi("okr.previewImport", vao, "thuong"),
			await goi("okr.applyImport", { ...vao, congBo: false }, "thuong"),
		].map(tuChoi);
		expect(tuChoiThuong).toEqual([
			`403 ${T.khongSuaDuocDonVi}`,
			`403 ${T.khongSuaDuocDonVi}`,
		]);

		const mtQuan = ma("Quản trị nhập");
		const loQuan = {
			...vao,
			text: oNhap(mtQuan, "KR quản trị", "mốc", "", "", "", email),
		};
		const quanXem = await goi("okr.previewImport", loQuan);
		const quanGhi = await goi("okr.applyImport", { ...loQuan, congBo: false });
		const quanKhongTruong = await goi("okr.applyImport", {
			...baMoi,
			congBo: false,
		});
		expect(
			[quanXem, quanGhi, quanKhongTruong].map((r) => [r.status, r.data]),
		).toEqual([
			[
				200,
				{
					rows: [
						{
							line: 1,
							objective: mtQuan,
							keyResult: "KR quản trị",
							kind: "mốc",
							start: "",
							target: "",
							unit: "",
							email,
							error: null,
						},
					],
					summary: { valid: 1, invalid: 0, objectives: 1 },
				},
			],
			[200, { written: 1, objectives: 1, keyResults: 1 }],
			[200, { written: 3, objectives: 3, keyResults: 3 }],
		]);
		const chuMoi = await db.okrObjective.findMany({
			where: { cycleId: quy, OR: [{ title: mtQuan }, { departmentId: q }] },
			select: { departmentId: true, ownerUserId: true },
			orderBy: { position: "asc" },
		});
		expect(chuMoi.map((m) => [m.departmentId, m.ownerUserId])).toEqual([
			[p, truong.nguoi],
			[q, phien.quan.nguoi],
			[q, phien.quan.nguoi],
			[q, phien.quan.nguoi],
		]);
		expect(phien.quan.nguoi).not.toBe(truong.nguoi);
	});

	test("nhap-bang-tinh: ten 250 ky tu la loi dong va khong ghi, tran KR khi chan co doi chung duong", async () => {
		const N = T.nhap;
		await caiChuongTrinh();
		const quy = await kyDangChay("nhap-dai");
		const p = await pbMoi("P dai");
		const email = `${phien.quan.nguoi}@thu.test`;
		const dai = `${ma("dai")} ${"x".repeat(250)}`.slice(0, 250);
		const ngan = ma("Ngắn");
		const lo = {
			cycleId: quy,
			unit: { loai: "pb", id: p },
			text: [
				oNhap(dai, "KR dài", "mốc", "", "", "", email),
				oNhap(ngan, "KR ngắn", "mốc", "", "", "", email),
			].join("\n"),
		};
		const xem = ok<XemNhap>(await goi("okr.previewImport", lo), "xem dai");
		expect(xem.rows.map((r) => [r.line, r.error])).toEqual([
			[1, N.doDai],
			[2, null],
		]);
		const ghi = ok<GhiNhap>(
			await goi("okr.applyImport", { ...lo, congBo: false }),
			"ghi dai",
		);
		const tieuDe = (
			await db.okrObjective.findMany({
				where: { cycleId: quy, departmentId: p },
				select: { title: true },
			})
		).map((m) => m.title);
		expect([ghi, tieuDe]).toEqual([
			{ written: 1, objectives: 1, keyResults: 1 },
			[ngan],
		]);
		const lai = ok<GhiNhap>(
			await goi("okr.applyImport", { ...lo, congBo: false }),
			"ghi lai dai",
		);
		expect([
			lai,
			await db.okrObjective.count({ where: { cycleId: quy, departmentId: p } }),
		]).toEqual([{ written: 0, objectives: 0, keyResults: 0 }, 1]);

		await caiChuongTrinh({ capMode: "chan", krCap: 2 });
		const q = await pbMoi("Q tran kr");
		const demQ = () =>
			db.okrObjective.count({ where: { cycleId: quy, departmentId: q } });
		const demVetLo = () =>
			db.okrTrail.count({ where: { cycleId: quy, action: "nhap-bang-tinh" } });
		const loKr = (soKr: number) => {
			const mt = ma("Trần KR");
			return {
				cycleId: quy,
				unit: { loai: "pb", id: q },
				text: Array.from({ length: soKr }, (_, i) =>
					oNhap(mt, `KR số ${i}`, "mốc", "", "", "", email),
				).join("\n"),
			};
		};
		const vuot = loKr(3);
		const vetTruoc = await demVetLo();
		const tuChoiKr = [
			await goi("okr.previewImport", vuot),
			await goi("okr.applyImport", { ...vuot, congBo: false }),
		].map(tuChoi);
		expect(tuChoiKr).toEqual([
			`400 ${T.vuotTranKr(2)}`,
			`400 ${T.vuotTranKr(2)}`,
		]);
		expect([await demQ(), await demVetLo()]).toEqual([0, vetTruoc]);
		const vua = loKr(2);
		const vuaXem = await goi("okr.previewImport", vua);
		const vuaGhi = await goi("okr.applyImport", { ...vua, congBo: false });
		expect([vuaXem.status, vuaGhi.status, vuaGhi.data, await demQ()]).toEqual([
			200,
			200,
			{ written: 2, objectives: 1, keyResults: 2 },
			1,
		]);
		await caiChuongTrinh();
	});
});
