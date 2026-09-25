import { describe, expect, test } from "bun:test";
import { KHONG_TRONG_PHAM_VI } from "@crm/auth";
import { db } from "@crm/db";
import { parseOkrVet } from "@crm/validation/okr-vet";
import { OKR } from "../src/okr/okr-config";
import { chonChuKyHienTai } from "../src/okr/tien-do";
import {
	type AiHoacCookie,
	bpMoi,
	CHUONG_TRINH_RONG,
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
	version: number;
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
		const v1 = ok<{ version: number }>(
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
		const v2 = ok<{ version: number }>(
			await goi("okr.setProgram", moi),
			"cau hinh moi",
		);
		expect(v2).toEqual({ ...moi, version: v1.version + 1 });

		const hai = await db.okrProgramConfig.findMany({
			orderBy: { version: "desc" },
			take: 2,
		});
		expect(hai.map((r) => r.version)).toEqual([v1.version + 1, v1.version]);
		expect(hai[1]).toEqual(chupCu);
		expect(hai[0]?.createdById).toBe(phien.quan.nguoi);

		expect(await doc<ChuongTrinh>("okr.program")).toEqual({
			...moi,
			version: v1.version + 1,
		});
		expect(await doc<ChuongTrinh>("okr.program", "thuong")).toEqual({
			...moi,
			version: v1.version + 1,
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
});

type CoSo = {
	cycleId: string;
	a: string;
	b: string;
	c: string;
	krSua: string;
	krXoa: string;
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
];

async function dungCoSo(cycleId: string): Promise<CoSo> {
	const quan = phien.quan.nguoi;
	const goc = { level: "onehub" };
	const a = (await taoMucTieu(mucTieuVao(cycleId, goc, quan))).id;
	const b = (await taoMucTieu(mucTieuVao(cycleId, goc, quan))).id;
	const c = (await taoMucTieu(mucTieuVao(cycleId, goc, quan))).id;
	const krSua = await taoKr(krVao(a, quan));
	const krXoa = await taoKr(krVao(a, quan));
	await taoKr(krVao(b, quan));
	return { cycleId, a, b, c, krSua, krXoa };
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
				currentValue: 30,
			}),
			"doi dich",
		);
		const k1Sau = await docK1();
		expect([
			Number(k1Sau.startValue),
			Number(k1Sau.targetValue),
			Number(k1Sau.currentValue),
		]).toEqual([10, 60, 30]);

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
				include: { keyResults: { orderBy: { id: "asc" } }, participants: true },
				orderBy: { id: "asc" },
			});
		const truoc = await chup();
		const ketQua: Json[] = [];
		for (const pha of ["cham-diem", "da-dong"]) {
			ok(await goi("okr.setCyclePhase", { id: quy, phase: pha }), pha);
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
		expect(await db.activity.count()).toBe(activityTruoc);

		ok(
			await goi("okr.setCyclePhase", { id: quy, phase: "cham-diem" }),
			"cham diem",
		);
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

		const NGUOI: Record<Nguoi, AiHoacCookie> = {
			p1: truongP1.cookie,
			p2: truongP2.cookie,
			b1: truongB1.cookie,
			b2: truongB2.cookie,
			k: cookieK,
			admin: "quan",
			member: cookieTran,
		};
		const THU_TU: Nguoi[] = ["p1", "p2", "b1", "b2", "k", "admin", "member"];

		const KY_VONG: Record<Nguoi, boolean[]> = {
			p1: [true, true, false, false, false, false, true, false],
			p2: [false, false, true, false, false, false, false, false],
			b1: [true, true, true, true, false, false, true, false, true],
			b2: [false, false, false, false, true, false, false, false],
			k: [false, false, false, false, false, false, true, false],
			admin: [false, false, false, false, false, true, false, true],
			member: [false, false, false, false, false, false, false, false],
		};

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
