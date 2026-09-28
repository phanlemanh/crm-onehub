import { afterAll, beforeAll, describe, expect, setSystemTime, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { db } from "@crm/db";
import { OKR_NHAC } from "@crm/db/okr-nhac";
import { dauTuanVN } from "@crm/db/onboarding-nhac";
import { CHI_SO_OKR } from "@crm/validation/okr-chi-so";
import { OKR_PROGRAM_MAC_DINH } from "@crm/validation/okr-chuong-trinh";
import { goiYDiem } from "@crm/validation/okr-khep";
import { KIEU_KR, type KieuKr, kiemSoTheoKieu, krInput } from "@crm/validation/okr-kr";
import { crmHopKieu, parseOkrNguon } from "@crm/validation/okr-nguon";
import { kiemDongKy } from "../src/okr/khep";
import type { BangChamOutput } from "../src/okr/okr-khep.contracts";
import type { HopTuanOutput, ToanCanhOutput } from "../src/okr/okr-xem.contracts";
import type { TreeOutput } from "../src/to-chuc/to-chuc.contracts";
import { LoiBoMau, OKR_MAU } from "../scripts/okr-mau/cau-hinh";
import { dienBien } from "../scripts/okr-mau/dien-bien";
import { docBoOkrMau, type KichBan } from "../scripts/okr-mau/khuon";
import { idMau, kiemWorkspace, napTrong, xoaBoOkrMau } from "../scripts/okr-mau/nap";
import { doc, dungSan, goi, goiQuery, phien, phienCua } from "./okr-san";
import {
	chayLenh,
	congTy,
	congTyTho,
	demThamChieu,
	lamSachOkr,
	napMau,
	nguoiMau,
	tapIdMau,
	vanTay,
	vanTayKho,
} from "./okr-mau-san";

dungSan();

const MOC_THU_NAM = new Date("2026-11-12T15:00:00+07:00");
const TUAN = ["2026-10-05", "2026-10-12", "2026-10-19", "2026-10-26", "2026-11-02", "2026-11-09"];
const CHU_KY = { nam: idMau("chu-ky", "nam"), quy3: idMau("chu-ky", "quy3"), quy4: idMau("chu-ky", "quy4") };
const ngay = (d: Date) => d.toISOString().slice(0, 10);
const CHO = 120_000;

const bo = congTy();
const krTheoKichBan = (kb: KichBan) =>
	bo.mucTieu.filter((m) => m.chuKy !== "quy3" && m.trangThai === "cong-bo").flatMap((m) => m.krs.filter((k) => k.kichBan === kb).map((k) => idMau("kr", k.ma)));
const phongBanMau = bo.phongBan.map((p) => idMau("pb", p.ma));

async function ceo() {
	return phienCua(nguoiMau(bo.nguoi.find((n) => n.vai === "admin")?.ma ?? ""));
}

async function mucTieuThieuCanChinh(): Promise<string[]> {
	const ds = await db.okrObjective.findMany({
		where: { id: { startsWith: OKR_MAU.tienTo }, cycleId: CHU_KY.quy4, level: "phong-ban", status: "cong-bo", alignments: { none: {} } },
		select: { title: true },
	});
	return ds.map((m) => m.title);
}

async function krCrmSaiKieu(): Promise<string[]> {
	const ds = await db.okrKeyResult.findMany({ where: { id: { startsWith: OKR_MAU.tienTo }, source: "crm" }, select: { id: true, kind: true } });
	return ds.filter((k) => !crmHopKieu(k.kind as KieuKr)).map((k) => k.id);
}

async function dangBanToanCongTy(cookie: string): Promise<HopTuanOutput["dangBan"]> {
	const ra: HopTuanOutput["dangBan"] = [];
	for (const id of phongBanMau) {
		const h = await doc<HopTuanOutput>("okr.hopTuan", cookie, { cycleId: CHU_KY.quy4, unit: { loai: "pb", id } });
		ra.push(...h.dangBan);
	}
	return ra;
}

afterAll(async () => {
	setSystemTime();
	await lamSachOkr();
	await xoaBoOkrMau(db);
});

describe("to-chuc-mau", () => {
	async function soVoiTep() {
		const cay = await doc<TreeOutput>("org.tree", "quan");
		const bp = cay.divisions.filter((d) => d.id.startsWith(OKR_MAU.tienTo));
		expect(bp.map((d) => ({ ten: d.name, truong: d.head?.email, pb: d.departments.map((p) => ({ ten: p.name, truong: p.head?.email })) }))).toEqual(
			bo.boPhan.map((b) => ({
				ten: b.ten,
				truong: `${b.truong}@${OKR_MAU.mienThu}`,
				pb: bo.phongBan.filter((p) => p.boPhan === b.ma).map((p) => ({ ten: p.ten, truong: `${p.truong}@${OKR_MAU.mienThu}` })),
			})),
		);
		const nguoi = cay.people.filter((p) => p.id.startsWith(OKR_MAU.tienTo));
		expect(Object.fromEntries(nguoi.map((p) => [p.email, p.primaryDepartmentId])).valueOf()).toEqual(
			Object.fromEntries(bo.nguoi.map((n) => [`${n.ma}@${OKR_MAU.mienThu}`, idMau("pb", n.phongBan)])),
		);
		for (const p of nguoi) expect(p.email).toMatch(/@mau\.onehub\.test$/);
		const member = await db.member.findMany({ where: { userId: { startsWith: OKR_MAU.tienTo } }, select: { userId: true, role: true } });
		expect(Object.fromEntries(member.map((m) => [m.userId, m.role]))).toEqual(Object.fromEntries(bo.nguoi.map((n) => [nguoiMau(n.ma), n.vai])));
		const okr = bo.nguoi.filter((n) => n.vai === "okr").map((n) => n.phongBan);
		expect([...new Set(okr)].sort()).toEqual(["nhan-su", "phap-che", "tai-chinh"]);
	}

	test("kho sạch: cây, người, vai khớp tệp công ty", async () => {
		await lamSachOkr();
		await napMau(MOC_THU_NAM);
		await soVoiTep();
	}, CHO);

	test("kho có sẵn người và phòng ban ngoài bộ mẫu: phần mẫu đúng, phần sẵn có đứng nguyên", async () => {
		await xoaBoOkrMau(db);
		const pbNgoai = await Promise.all(["ngoai-a", "ngoai-b"].map((ten, i) => db.department.create({ data: { name: `pb ${ten}`, position: 900 + i } })));
		const truoc = await db.department.findMany({ where: { id: { in: pbNgoai.map((p) => p.id) } } });
		await napMau(MOC_THU_NAM);
		await soVoiTep();
		expect(await db.department.findMany({ where: { id: { in: pbNgoai.map((p) => p.id) } } })).toEqual(truoc);
		await db.department.deleteMany({ where: { id: { in: pbNgoai.map((p) => p.id) } } });
	}, CHO);

	test("kiemWorkspace ném mã 4 kèm hướng dẫn khi không có hàng workspace", async () => {
		const gia = { organization: { findUnique: async () => null } } as unknown as Parameters<typeof kiemWorkspace>[0];
		const loi = await kiemWorkspace(gia).catch((e) => e);
		expect(loi).toBeInstanceOf(LoiBoMau);
		expect((loi as LoiBoMau).ma).toBe(OKR_MAU.ma.sai);
		expect((loi as LoiBoMau).message).toContain("db:seed");
		expect((loi as LoiBoMau).message).toContain("dev:session");
		const co = { organization: { findUnique: async () => ({ id: "workspace" }) } } as unknown as Parameters<typeof kiemWorkspace>[0];
		await kiemWorkspace(co);
	});

	test("chiều đỏ: tệp đổi trưởng Pháp chế sang người Nhân sự bị chặn ở bước đọc tệp", () => {
		const tho = congTyTho() as { phongBan: { ma: string; truong: string }[] };
		const pc = tho.phongBan.find((p) => p.ma === "phap-che");
		if (!pc) throw new Error("tệp mất phòng Pháp chế");
		pc.truong = "tong-bich-ngoc";
		expect(() => docBoOkrMau(tho)).toThrow("trưởng tong-bich-ngoc không thuộc phòng phap-che");
	});
});

describe("toan-canh-mau", () => {
	beforeAll(async () => {
		await lamSachOkr();
		await napMau(MOC_THU_NAM);
	}, CHO);

	test("ba chu kỳ, OneHub năm, mọi phòng ban có mục tiêu quý 4 đã công bố", async () => {
		const cookie = await ceo();
		const { cycles } = await doc<{ cycles: { id: string; kind: string; phase: string; startsOn: string; endsOn: string; parentId: string | null }[] }>("okr.cycles", cookie);
		const mau = Object.fromEntries(cycles.filter((c) => c.id.startsWith(OKR_MAU.tienTo)).map((c) => [c.id, c]));
		expect(Object.keys(mau).sort()).toEqual(Object.values(CHU_KY).sort());
		const [nam, q3, q4] = [mau[CHU_KY.nam], mau[CHU_KY.quy3], mau[CHU_KY.quy4]];
		if (!nam || !q3 || !q4) throw new Error("thiếu chu kỳ mẫu");
		expect([nam.kind, q3.phase, q4.phase, q3.parentId, q4.parentId]).toEqual(["nam", "da-dong", "dang-chay", nam.id, nam.id]);
		expect(q4.startsOn >= nam.startsOn && q4.endsOn <= nam.endsOn && q3.startsOn >= nam.startsOn).toBe(true);
		expect(q3.endsOn < q4.startsOn).toBe(true);
		const tc = await doc<ToanCanhOutput>("okr.toanCanh", cookie, { cycleId: CHU_KY.quy4 });
		expect(tc.hang.filter((h) => h.key.startsWith(`pb:${OKR_MAU.tienTo}`)).map((h) => h.key).sort()).toEqual(phongBanMau.map((id) => `pb:${id}`).sort());
		for (const id of phongBanMau)
			expect(await db.okrObjective.count({ where: { departmentId: id, cycleId: CHU_KY.quy4, status: "cong-bo" } }), id).toBeGreaterThanOrEqual(1);
		expect(await db.okrObjective.count({ where: { cycleId: CHU_KY.nam, level: "onehub", status: "cong-bo" } })).toBe(3);
		const trangThai = await db.okrObjective.groupBy({ by: ["status"], where: { cycleId: CHU_KY.quy4, id: { startsWith: OKR_MAU.tienTo } }, _count: true });
		const dem = Object.fromEntries(trangThai.map((t) => [t.status, t._count]));
		expect([dem.nhap, dem["da-bo"]]).toEqual([1, 1]);
	}, CHO);

	test("mọi mục tiêu phòng ban đã công bố căn chỉnh lên OneHub, cây căn chỉnh không kêu thiếu", async () => {
		expect(await mucTieuThieuCanChinh()).toEqual([]);
		const cay = await doc<{ chuaCanChinh: { objectiveId: string }[] }>("okr.cayCanChinh", await ceo(), { cycleId: CHU_KY.quy4 });
		const mtPb = new Set(bo.mucTieu.filter((m) => m.chuKy === "quy4" && m.cap === "phong-ban" && m.trangThai === "cong-bo").map((m) => idMau("mt", m.ma)));
		expect(cay.chuaCanChinh.filter((n) => mtPb.has(n.objectiveId))).toEqual([]);
		const dich = await db.okrAlignment.findMany({ where: { objectiveId: { in: [...mtPb] } }, include: { targetObjective: true, targetKeyResult: { include: { objective: true } } } });
		for (const d of dich) expect(d.targetObjective?.level ?? d.targetKeyResult?.objective.level).toBe("onehub");
	}, CHO);

	test("chiều đỏ: gỡ một căn chỉnh thì phép đo gọi đúng tên mục tiêu", async () => {
		const mt = await db.okrObjective.findUniqueOrThrow({ where: { id: idMau("mt", "q4-kho-van-1") } });
		await db.okrAlignment.deleteMany({ where: { objectiveId: mt.id } });
		expect(await mucTieuThieuCanChinh()).toEqual([mt.title]);
		await napMau(MOC_THU_NAM);
		expect(await mucTieuThieuCanChinh()).toEqual([]);
	}, CHO);

	test("không đơn vị nào vượt trần mặc định", async () => {
		const ds = await db.okrObjective.findMany({ where: { id: { startsWith: OKR_MAU.tienTo }, status: { not: "da-bo" } }, select: { cycleId: true, level: true, departmentId: true, divisionId: true, _count: { select: { keyResults: true } } } });
		const dem = new Map<string, number>();
		for (const m of ds) {
			const k = `${m.cycleId}:${m.level}:${m.departmentId ?? m.divisionId ?? ""}`;
			dem.set(k, (dem.get(k) ?? 0) + 1);
			expect(m._count.keyResults).toBeLessThanOrEqual(OKR_PROGRAM_MAC_DINH.krCap);
		}
		for (const [k, n] of dem) expect(n, k).toBeLessThanOrEqual(OKR_PROGRAM_MAC_DINH.objectiveCap);
	});

	test("trưởng phòng mẫu (không phải quản trị) thấy toàn cảnh và bảng họp tuần có KR đáng bàn", async () => {
		setSystemTime(MOC_THU_NAM);
		try {
			const truong = await phienCua(nguoiMau("nguyen-thi-lan"));
			const tc = await doc<ToanCanhOutput>("okr.toanCanh", truong, { cycleId: CHU_KY.quy4 });
			expect(tc.hang.filter((h) => h.key.startsWith(`pb:${OKR_MAU.tienTo}`)).length).toBe(10);
			const h = await doc<HopTuanOutput>("okr.hopTuan", truong, { cycleId: CHU_KY.quy4, unit: { loai: "pb", id: idMau("pb", "kd-bac") } });
			expect(h.dangBan.length).toBeGreaterThanOrEqual(1);
		} finally {
			setSystemTime();
		}
	}, CHO);
});

describe("kieu-kr-mau", () => {
	beforeAll(async () => {
		await lamSachOkr();
		await napMau(MOC_THU_NAM);
	}, CHO);

	test("sáu kiểu KR, mỗi kiểu ít nhất ba, số đúng luật; KR nguồn CRM đủ sáu bản chụp", async () => {
		const krs = await db.okrKeyResult.findMany({ where: { objective: { cycleId: CHU_KY.quy4 }, id: { startsWith: OKR_MAU.tienTo } }, include: { nguonMay: true, soChup: { orderBy: { ngay: "asc" } } } });
		const dem = Object.fromEntries(KIEU_KR.map((k) => [k, krs.filter((x) => x.kind === k).length]));
		for (const k of KIEU_KR) expect(dem[k], k).toBeGreaterThanOrEqual(3);
		for (const k of krs) {
			const nhap = krInput.safeParse({ title: k.title, kind: k.kind, ownerUserId: k.ownerUserId, startValue: Number(k.startValue), targetValue: Number(k.targetValue), currentValue: Number(k.currentValue), unit: k.unit, dueOn: null, weight: Number(k.weight) });
			expect(nhap.success, k.id).toBe(true);
			expect(kiemSoTheoKieu(k.kind as KieuKr, Number(k.startValue), Number(k.targetValue)), k.id).toBeNull();
		}
		const crm = krs.filter((k) => k.source === "crm");
		expect(crm.length).toBeGreaterThanOrEqual(5);
		for (const k of crm) {
			const n = parseOkrNguon(k.nguonMay);
			expect(n.loai).toBe("crm");
			expect(Object.keys(CHI_SO_OKR)).toContain(n.chiSo ?? "");
			expect(crmHopKieu(k.kind as KieuKr), k.id).toBe(true);
			expect(k.soChup.filter((c) => c.nguon === "crm").map((c) => ngay(c.ngay))).toEqual(TUAN);
		}
		expect(await krCrmSaiKieu()).toEqual([]);
	}, CHO);

	test("chiều đỏ: một KR nguồn CRM đổi sang kiểu mốc thì phép đo gọi tên nó", async () => {
		const k = idMau("kr", "q4-kd-bac-1-k1");
		await db.okrKeyResult.update({ where: { id: k }, data: { kind: "moc" } });
		expect(await krCrmSaiKieu()).toEqual([k]);
		await napMau(MOC_THU_NAM);
	}, CHO);
});

describe("sau-tuan-mau", () => {
	const MOC = [
		{ moc: new Date("2026-11-09T00:30:00+07:00"), tuan6: "2026-11-09" },
		{ moc: new Date("2026-11-12T15:00:00+07:00"), tuan6: "2026-11-09" },
		{ moc: new Date("2026-11-15T23:30:00+07:00"), tuan6: "2026-11-09" },
	];

	test("diễn biến thuần: bảng kịch bản × sáu tuần", () => {
		const bang: Record<KichBan, { giaTri: number[]; tuTin: string[] }> = {
			deu: { giaTri: [10.5, 21, 31.5, 42, 52.5, 63], tuTin: ["cao", "cao", "cao", "cao", "cao", "cao"] },
			cham: { giaTri: [6, 12, 18, 24, 30, 36], tuTin: ["cao", "cao", "vua", "vua", "vua", "vua"] },
			tut: { giaTri: [9.5, 19, 28.5, 38, 38, 38], tuTin: ["cao", "cao", "cao", "vua", "vua", "thap"] },
			bo: { giaTri: [7, 14, 21], tuTin: ["vua", "vua", "thap"] },
			vuot: { giaTri: [23.8, 47.7, 71.5, 95.3, 119.2, 143], tuTin: ["cao", "cao", "cao", "cao", "cao", "cao"] },
			"ghi-chu": { giaTri: [9, 18, 27, 36, 45, 54], tuTin: ["cao", "cao", "cao", "vua", "vua", "vua"] },
			"chua-gui": { giaTri: [10, 20, 30, 40, 50], tuTin: ["cao", "cao", "vua", "vua", "cao"] },
		};
		for (const [kb, ky] of Object.entries(bang)) {
			const lan = dienBien({ kieu: "tang-toi", khoi: 0, dich: 130, kichBan: kb as KichBan });
			expect({ kb, giaTri: lan.map((l) => l.giaTri), tuTin: lan.map((l) => l.tuTin) }).toEqual({ kb, ...ky });
		}
		expect(dienBien({ kieu: "moc", khoi: 0, dich: 1, kichBan: "vuot" }).map((l) => l.giaTri)).toEqual([0, 0, 0, 0, 1, 1]);
		expect(dienBien({ kieu: "giu-tren", khoi: 55, dich: 70, kichBan: "tut" }).map((l) => l.giaTri)).toEqual([72.8, 72.8, 72.8, 72.8, 72.8, 67.2]);
	});

	for (const { moc, tuan6 } of MOC) {
		test(`mốc ${moc.toISOString()}: sáu tuần, đáng bàn tụt và im đúng tập kịch bản, không gì ở tương lai`, async () => {
			await lamSachOkr();
			await napMau(moc);
			expect(dauTuanVN(moc)).toBe(tuan6);
			const krs = await db.okrKeyResult.findMany({
				where: { id: { startsWith: OKR_MAU.tienTo }, objective: { status: "cong-bo", cycleId: { in: [CHU_KY.nam, CHU_KY.quy4] } } },
				include: { checkIns: { orderBy: { weekStart: "asc" } } },
			});
			for (const k of krs) expect(ngay(k.checkIns[0]?.weekStart ?? new Date(0)), k.id).toBe("2026-10-05");
			for (const id of krTheoKichBan("deu")) {
				const k = krs.find((x) => x.id === id);
				expect(k?.checkIns.map((c) => ngay(c.weekStart)), id).toEqual(TUAN);
			}
			for (const id of krTheoKichBan("chua-gui")) {
				const k = krs.find((x) => x.id === id);
				expect(k?.checkIns.map((c) => ngay(c.weekStart)), id).toEqual(TUAN.slice(0, 5));
			}
			const giam = krs.filter((k) => {
				const h = { cao: 2, vua: 1, thap: 0 } as const;
				const d = k.checkIns.map((c) => h[c.confidence as keyof typeof h]);
				return d.every((v, i) => i === 0 || v <= (d[i - 1] ?? v)) && d[0] === 2 && d.includes(1) && d.at(-1) === 0;
			});
			expect(giam.length).toBeGreaterThanOrEqual(3);
			for (const k of krs.filter((x) => x.source === "tay")) expect(Number(k.currentValue), k.id).toBe(Number(k.checkIns.at(-1)?.value));
			const tuongLai = await db.okrCheckIn.count({ where: { id: { startsWith: OKR_MAU.tienTo }, createdAt: { gt: moc } } });
			const phienTuongLai = await db.okrCheckInSession.count({ where: { id: { startsWith: OKR_MAU.tienTo }, submittedAt: { gt: moc } } });
			const chupTuongLai = await db.okrSoChup.count({ where: { id: { startsWith: OKR_MAU.tienTo }, ngay: { gt: new Date(`${ngay(new Date(moc.getTime() + 7 * 3600_000))}T00:00:00Z`) } } });
			expect([tuongLai, phienTuongLai, chupTuongLai]).toEqual([0, 0, 0]);
			const phien = await db.okrCheckInSession.findMany({ where: { id: { startsWith: OKR_MAU.tienTo } }, include: { checkIns: true } });
			const cap = new Map<string, number>();
			for (const p of phien) {
				expect(p.submittedAt).not.toBeNull();
				for (const t of new Set(p.checkIns.map((c) => `${p.userId}:${ngay(c.weekStart)}`))) cap.set(t, (cap.get(t) ?? 0) + 1);
			}
			for (const [k, n] of cap) expect(n, k).toBe(1);

			setSystemTime(moc);
			try {
				const ban = await dangBanToanCongTy(await ceo());
				const tut = ban.filter((d) => d.lyDo.some((l) => l.loai === "tut")).map((d) => d.keyResultId).sort();
				const im = ban.filter((d) => d.lyDo.some((l) => l.loai === "im" && l.soNgay >= OKR_NHAC.imNgay)).map((d) => d.keyResultId).sort();
				expect(tut).toEqual(krTheoKichBan("tut").sort());
				expect(im).toEqual(krTheoKichBan("bo").sort());
				expect(tut.length).toBeGreaterThanOrEqual(2);
				expect(im.length).toBeGreaterThanOrEqual(2);
			} finally {
				setSystemTime();
			}
		}, CHO);
	}

	test("chiều đỏ: đồng hồ sang tuần sau thì không còn KR tụt — lời hứa theo hôm nay", async () => {
		await lamSachOkr();
		await napMau(MOC_THU_NAM);
		setSystemTime(new Date(MOC_THU_NAM.getTime() + 7 * 86_400_000));
		try {
			const ban = await dangBanToanCongTy(await ceo());
			expect(ban.filter((d) => d.lyDo.some((l) => l.loai === "tut"))).toEqual([]);
		} finally {
			setSystemTime();
		}
	}, CHO);
});

describe("quy-3-mau", () => {
	beforeAll(async () => {
		await lamSachOkr();
		await napMau(MOC_THU_NAM);
	}, CHO);

	test("quý 3 đã khép: mọi KR có điểm đúng gợi ý, điều học được, mang sang ba mục tiêu", async () => {
		const cookie = await ceo();
		const bang = await doc<BangChamOutput>("okr.bangCham", cookie, { cycleId: CHU_KY.quy3 });
		const mt = bang.mucTieu.filter((m) => m.id.startsWith(OKR_MAU.tienTo));
		expect(mt.length).toBe(10);
		const pb = await db.okrObjective.findMany({ where: { cycleId: CHU_KY.quy3 }, select: { departmentId: true } });
		expect(pb.map((p) => p.departmentId).sort()).toEqual([...phongBanMau].sort());
		let khac = 0;
		for (const m of mt) {
			expect(m.dieuHocDuoc.length, m.id).toBeGreaterThan(0);
			for (const k of m.krs) {
				const db_ = await db.okrKeyResult.findUniqueOrThrow({ where: { id: k.id } });
				expect(k.soChot, k.id).toBe(Number(db_.currentValue));
				expect(k.diemGoiY, k.id).toBe(goiYDiem(k.kind, k.startValue, k.targetValue, k.soChot));
				expect(k.diem, k.id).not.toBeNull();
				if (k.diem !== k.diemGoiY) {
					khac += 1;
					expect((k.lyDo ?? "").length, k.id).toBeGreaterThan(0);
				}
			}
		}
		expect(khac).toBeGreaterThanOrEqual(2);
		expect(bang.conLai).toBe(0);
		expect((await kiemDongKy(db, CHU_KY.quy3)).conLai).toBe(0);
		const ms = await db.okrMangSang.findMany({ where: { id: { startsWith: OKR_MAU.tienTo } } });
		expect(ms.length).toBe(3);
		for (const m of ms) {
			const tu = await doc<{ mangSangToi: { objectiveId: string } | null }>("okr.objective", cookie, { id: m.tuObjectiveId });
			const sang = await doc<{ mangSangTu: { objectiveId: string } | null }>("okr.objective", cookie, { id: m.sangObjectiveId });
			expect([tu.mangSangToi?.objectiveId, sang.mangSangTu?.objectiveId]).toEqual([m.sangObjectiveId, m.tuObjectiveId]);
		}
	}, CHO);

	test("chiều đỏ: một KR mất điểm thì kỳ chưa đóng được", async () => {
		const k = idMau("kr", "q3-kho-van-k1");
		await db.okrDiemKr.update({ where: { keyResultId: k }, data: { diem: null } });
		expect((await kiemDongKy(db, CHU_KY.quy3)).conLai).toBe(1);
		await napMau(MOC_THU_NAM);
	}, CHO);
});

describe("moc-ghim-mau", () => {
	test("cùng mốc ra cùng bộ, mốc khác ra bộ khác, không mốc là tuần này", async () => {
		await lamSachOkr();
		await napMau(MOC_THU_NAM);
		const a = await vanTay();
		await xoaBoOkrMau(db);
		await napMau(MOC_THU_NAM);
		expect(await vanTay()).toEqual(a);
		await napMau(new Date("2026-11-19T15:00:00+07:00"));
		expect(await vanTay()).not.toEqual(a);
		const bayGio = new Date();
		const r = chayLenh([]);
		expect(r.ma, r.loi).toBe(0);
		const cuoi = await db.okrCheckIn.findFirstOrThrow({ where: { id: { startsWith: OKR_MAU.tienTo } }, orderBy: { weekStart: "desc" } });
		expect(ngay(cuoi.weekStart)).toBe(dauTuanVN(bayGio));
	}, CHO);

	test("--moc sai dạng bị từ chối trước khi ghi", async () => {
		const truoc = await vanTayKho();
		for (const sai of ["2026-13-01", "mai", "2026-02-30"]) {
			const r = chayLenh([OKR_MAU.co.moc, sai]);
			expect(r.ma, sai).toBe(OKR_MAU.ma.sai);
			expect(r.loi).toContain(OKR_MAU.co.moc);
		}
		expect(await vanTayKho()).toEqual(truoc);
	}, CHO);
});

async function hangNgoai() {
	const nguoi = await db.user.upsert({ where: { id: "ngoai-mau-nguoi" }, create: { id: "ngoai-mau-nguoi", name: "Ngoài mẫu", email: "ngoai-mau@thu.test", updatedAt: new Date() }, update: {} });
	const pb = await db.department.upsert({ where: { id: "ngoai-mau-pb" }, create: { id: "ngoai-mau-pb", name: "pb ngoài mẫu", position: 950 }, update: {} });
	const cty = await db.company.upsert({ where: { id: "ngoai-mau-cty" }, create: { id: "ngoai-mau-cty", name: "Công ty ngoài mẫu" }, update: {} });
	const deal = await db.deal.upsert({ where: { id: "ngoai-mau-deal" }, create: { id: "ngoai-mau-deal", name: "Thoả thuận ngoài mẫu", companyId: cty.id, ownerId: nguoi.id }, update: {} });
	return { nguoi: nguoi.id, pb: pb.id, cty: cty.id, deal: deal.id };
}

async function chupNgoai() {
	return {
		nguoi: await db.user.findUnique({ where: { id: "ngoai-mau-nguoi" } }),
		pb: await db.department.findUnique({ where: { id: "ngoai-mau-pb" } }),
		cty: await db.company.findUnique({ where: { id: "ngoai-mau-cty" } }),
		deal: await db.deal.findUnique({ where: { id: "ngoai-mau-deal" } }),
	};
}

async function donNgoai() {
	await db.deal.deleteMany({ where: { id: "ngoai-mau-deal" } });
	await db.company.deleteMany({ where: { id: "ngoai-mau-cty" } });
	await db.department.deleteMany({ where: { id: "ngoai-mau-pb" } });
	await db.user.deleteMany({ where: { id: "ngoai-mau-nguoi" } });
}

const demBang = async () => Object.fromEntries(Object.entries(await vanTay()).map(([k, ds]) => [k, ds.length]));

describe("nap-lai-mau", () => {
	test("nạp hai lần: cùng số hàng, hàng ngoài bộ mẫu không đổi", async () => {
		await lamSachOkr();
		await hangNgoai();
		const ngoai = await chupNgoai();
		await napMau(MOC_THU_NAM);
		const mot = await demBang();
		await napMau(MOC_THU_NAM);
		expect(await demBang()).toEqual(mot);
		for (const [bang, so] of Object.entries(mot)) expect(so, bang).toBeGreaterThan(0);
		expect(await chupNgoai()).toEqual(ngoai);
		await donNgoai();
	}, CHO);

	test("chiều đỏ: nạp mà bỏ bước xoá bộ cũ thì hỏng", async () => {
		const loi = await db.$transaction((tx) => napTrong(tx, bo, MOC_THU_NAM)).catch((e) => e);
		expect(loi).toBeInstanceOf(Error);
	}, CHO);
});

describe("xoa-mau", () => {
	test("dùng rồi mới xoá: không còn hàng nào trỏ vào thực thể mẫu, nạp lại được", async () => {
		await lamSachOkr();
		await hangNgoai();
		const ngoai = await chupNgoai();
		await napMau(new Date());
		const cookie = await ceo();
		expect((await goi("okr.moHopTuan", { cycleId: CHU_KY.quy4, unit: { loai: "pb", id: idMau("pb", "phap-che") } }, cookie)).status).toBe(200);
		const chua = await phienCua(nguoiMau("an-khanh-linh"));
		const mo = await goi("okr.moCapNhat", { entry: "tab" }, chua);
		expect(mo.status, mo.loi).toBe(200);
		const gui = await goi("okr.guiCapNhat", { sessionId: (mo.data as { sessionId: string }).sessionId, items: [{ keyResultId: idMau("kr", "q4-phap-che-1-k1"), value: 1.8, confidence: "cao", note: "" }] }, chua);
		expect(gui.status, gui.loi).toBe(200);
		const ids = await tapIdMau();
		const truoc = await demThamChieu(ids);
		for (const bang of ["okrTrail", "okrCheckInSession", "session", "okrCheckIn", "okrKeyResult"])
			expect(Object.keys(truoc).some((k) => k.startsWith(`${bang}.`)), bang).toBe(true);
		const r = chayLenh([OKR_MAU.co.xoa]);
		expect(r.ma, r.loi).toBe(0);
		expect(await demThamChieu(ids)).toEqual({});
		expect(await chupNgoai()).toEqual(ngoai);
		const lai = chayLenh([]);
		expect(lai.ma, lai.loi).toBe(0);
	}, CHO);

	test("dữ liệu ngoài bộ mẫu đang giữ người mẫu: dừng mã 5, nêu bảng, không đổi gì", async () => {
		await db.deal.update({ where: { id: "ngoai-mau-deal" }, data: { ownerId: nguoiMau("do-minh-khoa") } });
		const truoc = await vanTayKho();
		const r = chayLenh([OKR_MAU.co.xoa]);
		expect(r.ma, r.loi).toBe(OKR_MAU.ma.dangGiu);
		expect(r.loi.toLowerCase()).toContain("deal");
		expect(await vanTayKho()).toEqual(truoc);
		await db.deal.update({ where: { id: "ngoai-mau-deal" }, data: { ownerId: "ngoai-mau-nguoi" } });
		await donNgoai();
	}, CHO);

	test("xoá trên kho không có bộ mẫu thì báo không có gì để xoá", async () => {
		await xoaBoOkrMau(db);
		const r = chayLenh([OKR_MAU.co.xoa]);
		expect(r.ma, r.loi).toBe(0);
		expect(r.ra).toContain("không có bộ mẫu");
	}, CHO);
});

describe("okr-that-mau", () => {
	const CA = [
		{
			ten: "một chu kỳ thật",
			dung: async () => {
				await db.okrCycle.create({ data: { id: "that-chu-ky", kind: "nam", name: "Năm thật", startsOn: new Date("2027-01-01"), endsOn: new Date("2027-12-31") } });
			},
			dem: "1 chu kỳ, 0 mục tiêu, 0 KR",
		},
		{
			ten: "một mục tiêu thật trong chu kỳ mẫu",
			dung: async () => {
				await db.okrObjective.create({ data: { id: "that-muc-tieu", cycleId: CHU_KY.quy4, level: "onehub", ownerUserId: phien.quan.nguoi, kind: "cam-ket", title: "Mục tiêu thật" } });
			},
			dem: "0 chu kỳ, 1 mục tiêu, 0 KR",
		},
		{
			ten: "một KR thật gắn vào mục tiêu mẫu",
			dung: async () => {
				await db.okrKeyResult.create({ data: { id: "that-kr", objectiveId: idMau("mt", "q4-kd-bac-1"), title: "KR thật", kind: "tang-toi", ownerUserId: phien.quan.nguoi, startValue: 0, targetValue: 5, currentValue: 0 } });
			},
			dem: "0 chu kỳ, 0 mục tiêu, 1 KR",
		},
	];

	for (const ca of CA) {
		test(`${ca.ten}: nạp và xoá đều thoát 3, không đổi gì`, async () => {
			await lamSachOkr();
			await napMau(MOC_THU_NAM);
			await ca.dung();
			const truoc = await vanTayKho();
			for (const args of [[], [OKR_MAU.co.xoa]]) {
				const r = chayLenh(args);
				expect(r.ma, `${args.join(" ")} ${r.loi}`).toBe(OKR_MAU.ma.okrThat);
				expect(r.loi).toContain("workspace đã có OKR thật");
				expect(r.loi).toContain(ca.dem);
			}
			expect(await vanTayKho()).toEqual(truoc);
			await db.okrKeyResult.deleteMany({ where: { id: "that-kr" } });
			await db.okrObjective.deleteMany({ where: { id: "that-muc-tieu" } });
			await db.okrCycle.deleteMany({ where: { id: "that-chu-ky" } });
			const lai = chayLenh([]);
			expect(lai.ma, lai.loi).toBe(0);
		}, CHO);
	}

	test("đối chứng: kho chỉ có bộ mẫu của lần trước thì nạp lại chạy", async () => {
		await lamSachOkr();
		await napMau(MOC_THU_NAM);
		const r = chayLenh([]);
		expect(r.ma, r.loi).toBe(0);
	}, CHO);
});

describe("bo-hong-mau", () => {
	type Tho = {
		nguoi: { ma: string }[];
		phongBan: { ma: string; truong: string }[];
		mucTieu: { krs: { kieu: string; khoi: number; dich: number; nguon?: object }[] }[];
	};
	const viTriKr = (tho: Tho, dk: (k: Tho["mucTieu"][number]["krs"][number]) => boolean) => {
		for (const [i, m] of tho.mucTieu.entries()) for (const [j, k] of m.krs.entries()) if (dk(k)) return [i, j] as const;
		throw new Error("không có KR khớp");
	};
	const CA: { ten: string; pha: (tho: Tho) => string }[] = [
		{
			ten: "KR tăng tới có đích nhỏ hơn khởi điểm",
			pha: (tho) => {
				const [i, j] = viTriKr(tho, (k) => k.kieu === "tang-toi" && !k.nguon);
				const k = tho.mucTieu[i]?.krs[j];
				if (k) k.dich = k.khoi - 1;
				return `mucTieu[${i}].krs[${j}]`;
			},
		},
		{
			ten: "trưởng Pháp chế là người Nhân sự",
			pha: (tho) => {
				const i = tho.phongBan.findIndex((p) => p.ma === "phap-che");
				const p = tho.phongBan[i];
				if (p) p.truong = "tong-bich-ngoc";
				return `phongBan[${i}].truong`;
			},
		},
		{
			ten: "KR nguồn CRM kiểu mốc",
			pha: (tho) => {
				const [i, j] = viTriKr(tho, (k) => Boolean(k.nguon));
				const k = tho.mucTieu[i]?.krs[j];
				if (k) {
					k.kieu = "moc";
					k.khoi = 0;
					k.dich = 1;
				}
				return `mucTieu[${i}].krs[${j}].nguon`;
			},
		},
		{
			ten: "hai người cùng mã",
			pha: (tho) => {
				const a = tho.nguoi[0];
				const b = tho.nguoi[1];
				if (a && b) b.ma = a.ma;
				return "nguoi";
			},
		},
	];

	test("tệp gốc qua được bước đọc", () => {
		expect(() => congTy()).not.toThrow();
	});

	for (const ca of CA) {
		test(`${ca.ten}: thoát 4 nêu đúng chỗ, không ghi`, async () => {
			const tho = congTyTho() as Tho;
			const duong = ca.pha(tho);
			const tep = join(mkdtempSync(join(tmpdir(), "okr-mau-")), "hong.json");
			writeFileSync(tep, JSON.stringify(tho));
			const truoc = await vanTayKho();
			const r = chayLenh([OKR_MAU.co.tep, tep]);
			expect(r.ma, r.loi).toBe(OKR_MAU.ma.sai);
			expect(r.loi).toContain(`${duong}:`);
			expect(await vanTayKho()).toEqual(truoc);
		}, CHO);
	}
});

describe("thu-tuc-that-mau", () => {
	test("người chưa gửi tuần này gửi Cập nhật tuần thật; người vai chỉ OKR xem toàn cảnh nhưng không xem thoả thuận", async () => {
		await lamSachOkr();
		await napMau(MOC_THU_NAM);
		const mot = await demBang();
		const kr = idMau("kr", "q4-phap-che-1-k1");
		setSystemTime(MOC_THU_NAM);
		try {
			const chua = await phienCua(nguoiMau("an-khanh-linh"));
			const tuanT = new Date("2026-11-09T00:00:00Z");
			expect(await db.okrCheckIn.count({ where: { keyResultId: kr, weekStart: tuanT } })).toBe(0);
			const mo = await goi("okr.moCapNhat", { entry: "tab" }, chua);
			expect(mo.status, mo.loi).toBe(200);
			const phienId = (mo.data as { sessionId: string }).sessionId;
			const gui = await goi("okr.guiCapNhat", { sessionId: phienId, items: [{ keyResultId: kr, value: 1.8, confidence: "cao", note: "" }] }, chua);
			expect(gui.status, gui.loi).toBe(200);
			expect(Number((await db.okrKeyResult.findUniqueOrThrow({ where: { id: kr } })).currentValue)).toBe(1.8);
			expect(await db.okrCheckIn.count({ where: { keyResultId: kr, weekStart: tuanT } })).toBe(1);
			expect((await db.okrCheckInSession.findUniqueOrThrow({ where: { id: phienId } })).submittedAt).not.toBeNull();
			const okr = await phienCua(nguoiMau("giang-hai-yen"));
			const tc = await doc<ToanCanhOutput>("okr.toanCanh", okr, { cycleId: CHU_KY.quy4 });
			expect(tc.hang.filter((h) => h.key.startsWith(`pb:${OKR_MAU.tienTo}`)).length).toBe(10);
			expect((await goiQuery("deals.list", okr, {})).status).toBe(403);
			expect((await goiQuery("deals.list", await ceo(), {})).status).toBe(200);
		} finally {
			setSystemTime();
		}
		await napMau(MOC_THU_NAM);
		expect(await demBang()).toEqual(mot);
	}, CHO);
});
