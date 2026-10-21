import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { db } from "@crm/db";
import { OKR_NHAC } from "@crm/db/okr-nhac";
import { dauTuanVN, ngayVN } from "@crm/db/onboarding-nhac";
import type { MucTuTin } from "@crm/validation/okr-cap-nhat";
import { CHI_SO_OKR } from "@crm/validation/okr-chi-so";
import { OKR_PROGRAM_MAC_DINH } from "@crm/validation/okr-chuong-trinh";
import { OKR_HIEN_THI } from "@crm/validation/okr-hien-thi";
import { trangThaiHoiY } from "@crm/validation/okr-hoi-y";
import { goiYDiem } from "@crm/validation/okr-khep";
import {
	KIEU_KR,
	type KieuKr,
	kiemSoTheoKieu,
	krInput,
} from "@crm/validation/okr-kr";
import { mauNoiDung } from "@crm/validation/okr-mau";
import { crmHopKieu, parseOkrNguon } from "@crm/validation/okr-nguon";
import { LoiBoMau, OKR_MAU } from "../scripts/okr-mau/cau-hinh";
import { dienBien } from "../scripts/okr-mau/dien-bien";
import { docBoOkrMau, type KichBan } from "../scripts/okr-mau/khuon";
import {
	idMau,
	kiemWorkspace,
	napBoOkrMau,
	napTrong,
	xoaBoOkrMau,
	xoaTrong,
} from "../scripts/okr-mau/nap";
import { kiemDongKy } from "../src/okr/khep";
import type { MucMoCoi } from "../src/okr/okr.contracts";
import { OKR } from "../src/okr/okr-config";
import type { BangChamOutput } from "../src/okr/okr-khep.contracts";
import type {
	HopTuanOutput,
	ToanCanhOutput,
} from "../src/okr/okr-xem.contracts";
import type { TreeOutput } from "../src/to-chuc/to-chuc.contracts";
import {
	BANG_DEM,
	chayLenh,
	congTy,
	congTyChu,
	demThamChieu,
	lamSachOkr,
	napMau,
	nguoiMau,
	tapIdMau,
	vanTay,
	vanTayHoiY,
	vanTayKho,
} from "./okr-mau-san";
import {
	doc,
	dungSan,
	goi,
	goiQuery,
	nguoiMoi,
	ok,
	phien,
	phienCua,
	taoNam,
} from "./okr-san";

dungSan();

const MOC_THU_NAM = new Date("2026-11-12T15:00:00+07:00");
const TUAN = [
	"2026-10-05",
	"2026-10-12",
	"2026-10-19",
	"2026-10-26",
	"2026-11-02",
	"2026-11-09",
];
const CHU_KY = {
	nam: idMau("chu-ky", "nam"),
	namKe: idMau("chu-ky", "nam-ke"),
	quy3: idMau("chu-ky", "quy3"),
	quy4: idMau("chu-ky", "quy4"),
};
const ngay = (d: Date) => d.toISOString().slice(0, 10);
const CHO = 120_000;

const bo = congTy();
const krTheoKichBan = (kb: KichBan) =>
	bo.mucTieu
		.filter((m) => m.chuKy !== "quy3" && m.trangThai === "cong-bo")
		.flatMap((m) =>
			m.krs.filter((k) => k.kichBan === kb).map((k) => idMau("kr", k.ma)),
		);
const phongBanMau = bo.phongBan.map((p) => idMau("pb", p.ma));
const phongBanLuuTruMau = bo.phongBanLuuTru.map((p) => idMau("pb", p.ma));

async function ceo() {
	return phienCua(nguoiMau(bo.nguoi.find((n) => n.vai === "admin")?.ma ?? ""));
}

async function mucTieuThieuCanChinh(): Promise<string[]> {
	const ds = await db.okrObjective.findMany({
		where: {
			id: { startsWith: OKR_MAU.tienTo },
			cycleId: CHU_KY.quy4,
			level: "phong-ban",
			status: "cong-bo",
			hienThi: "cong-khai",
			alignments: { none: {} },
		},
		select: { title: true },
	});
	return ds.map((m) => m.title);
}

async function krCrmSaiKieu(): Promise<string[]> {
	const ds = await db.okrKeyResult.findMany({
		where: { id: { startsWith: OKR_MAU.tienTo }, source: "crm" },
		select: { id: true, kind: true },
	});
	return ds.filter((k) => !crmHopKieu(k.kind as KieuKr)).map((k) => k.id);
}

async function dangBanToanCongTy(
	cookie: string,
): Promise<HopTuanOutput["dangBan"]> {
	const ra: HopTuanOutput["dangBan"] = [];
	for (const id of phongBanMau) {
		const h = await doc<HopTuanOutput>("okr.hopTuan", cookie, {
			cycleId: CHU_KY.quy4,
			unit: { loai: "pb", id },
		});
		ra.push(...h.dangBan);
	}
	return ra;
}

afterAll(async () => {
	setSystemTime();
	await lamSachOkr();
	await xoaBoOkrMau(db);
}, CHO);

describe("to-chuc-mau", () => {
	async function soVoiTep() {
		const cay = await doc<TreeOutput>("org.tree", "quan");
		const bp = cay.divisions.filter((d) => d.id.startsWith(OKR_MAU.tienTo));
		expect(
			bp.map((d) => ({
				ten: d.name,
				truong: d.head?.email,
				pb: d.departments.map((p) => ({ ten: p.name, truong: p.head?.email })),
			})),
		).toEqual(
			bo.boPhan.map((b) => ({
				ten: b.ten,
				truong: `${b.truong}@${OKR_MAU.mienThu}`,
				pb: bo.phongBan
					.filter((p) => p.boPhan === b.ma)
					.map((p) => ({
						ten: p.ten,
						truong: `${p.truong}@${OKR_MAU.mienThu}`,
					})),
			})),
		);
		const nguoi = cay.people.filter((p) => p.id.startsWith(OKR_MAU.tienTo));
		expect(
			Object.fromEntries(
				nguoi.map((p) => [p.email, p.primaryDepartmentId]),
			).valueOf(),
		).toEqual(
			Object.fromEntries(
				bo.nguoi.map((n) => [
					`${n.ma}@${OKR_MAU.mienThu}`,
					idMau("pb", n.phongBan),
				]),
			),
		);
		for (const p of nguoi) expect(p.email).toMatch(/@mau\.onehub\.test$/);
		const member = await db.member.findMany({
			where: { userId: { startsWith: OKR_MAU.tienTo } },
			select: { userId: true, role: true },
		});
		expect(Object.fromEntries(member.map((m) => [m.userId, m.role]))).toEqual(
			Object.fromEntries(bo.nguoi.map((n) => [nguoiMau(n.ma), n.vai])),
		);
		const okr = bo.nguoi.filter((n) => n.vai === "okr").map((n) => n.phongBan);
		expect([...new Set(okr)].sort()).toEqual([
			"nhan-su",
			"phap-che",
			"tai-chinh",
		]);
	}

	test(
		"kho sạch: cây, người, vai khớp tệp công ty",
		async () => {
			await lamSachOkr();
			await napMau(MOC_THU_NAM);
			await soVoiTep();
		},
		CHO,
	);

	test(
		"kho có sẵn người và phòng ban ngoài bộ mẫu: phần mẫu đúng, phần sẵn có đứng nguyên",
		async () => {
			await xoaBoOkrMau(db);
			const pbNgoai = await Promise.all(
				["ngoai-a", "ngoai-b"].map((ten, i) =>
					db.department.create({
						data: { name: `pb ${ten}`, position: 900 + i },
					}),
				),
			);
			const truoc = await db.department.findMany({
				where: { id: { in: pbNgoai.map((p) => p.id) } },
			});
			await napMau(MOC_THU_NAM);
			await soVoiTep();
			expect(
				await db.department.findMany({
					where: { id: { in: pbNgoai.map((p) => p.id) } },
				}),
			).toEqual(truoc);
			await db.department.deleteMany({
				where: { id: { in: pbNgoai.map((p) => p.id) } },
			});
		},
		CHO,
	);

	test("kiemWorkspace ném mã 4 kèm hướng dẫn khi không có hàng workspace", async () => {
		const gia = {
			organization: { findUnique: async () => null },
		} as unknown as Parameters<typeof kiemWorkspace>[0];
		const loi = await kiemWorkspace(gia).catch((e) => e);
		expect(loi).toBeInstanceOf(LoiBoMau);
		expect((loi as LoiBoMau).ma).toBe(OKR_MAU.ma.sai);
		expect((loi as LoiBoMau).message).toContain("db:seed");
		expect((loi as LoiBoMau).message).toContain("dev:session");
		const co = {
			organization: { findUnique: async () => ({ id: "workspace" }) },
		} as unknown as Parameters<typeof kiemWorkspace>[0];
		await kiemWorkspace(co);
	});

	test("chiều đỏ: tệp đổi trưởng Pháp chế sang người Nhân sự bị chặn ở bước đọc tệp", () => {
		const tho: { phongBan: { ma: string; truong: string }[] } = JSON.parse(
			congTyChu(),
		);
		const pc = tho.phongBan.find((p) => p.ma === "phap-che");
		if (!pc) throw new Error("tệp mất phòng Pháp chế");
		pc.truong = "tong-bich-ngoc";
		expect(() => docBoOkrMau(JSON.stringify(tho))).toThrow(
			"trưởng tong-bich-ngoc không thuộc phòng phap-che",
		);
	});
});

describe("toan-canh-mau", () => {
	beforeAll(async () => {
		await lamSachOkr();
		await napMau(MOC_THU_NAM);
	}, CHO);

	test(
		"bốn chu kỳ, OneHub năm, mọi phòng ban có mục tiêu quý 4 đã công bố",
		async () => {
			const cookie = await ceo();
			const { cycles } = await doc<{
				cycles: {
					id: string;
					kind: string;
					phase: string;
					startsOn: string;
					endsOn: string;
					parentId: string | null;
				}[];
			}>("okr.cycles", cookie);
			const mau = Object.fromEntries(
				cycles
					.filter((c) => c.id.startsWith(OKR_MAU.tienTo))
					.map((c) => [c.id, c]),
			);
			expect(Object.keys(mau).sort()).toEqual(Object.values(CHU_KY).sort());
			const [nam, namKe, q3, q4] = [
				mau[CHU_KY.nam],
				mau[CHU_KY.namKe],
				mau[CHU_KY.quy3],
				mau[CHU_KY.quy4],
			];
			if (!nam || !namKe || !q3 || !q4) throw new Error("thiếu chu kỳ mẫu");
			expect([namKe.kind, namKe.phase, namKe.parentId]).toEqual([
				"nam",
				"lap-ke-hoach",
				null,
			]);
			expect(namKe.startsOn > nam.endsOn).toBe(true);
			expect([nam.kind, q3.phase, q4.phase, q3.parentId, q4.parentId]).toEqual([
				"nam",
				"da-dong",
				"dang-chay",
				nam.id,
				nam.id,
			]);
			expect(
				q4.startsOn >= nam.startsOn &&
					q4.endsOn <= nam.endsOn &&
					q3.startsOn >= nam.startsOn,
			).toBe(true);
			expect(q3.endsOn < q4.startsOn).toBe(true);
			const tc = await doc<ToanCanhOutput>("okr.toanCanh", cookie, {
				cycleId: CHU_KY.quy4,
			});
			expect(
				tc.hang
					.filter((h) => h.key.startsWith(`pb:${OKR_MAU.tienTo}`))
					.map((h) => h.key)
					.sort(),
			).toEqual(phongBanMau.map((id) => `pb:${id}`).sort());
			for (const id of phongBanMau)
				expect(
					await db.okrObjective.count({
						where: {
							departmentId: id,
							cycleId: CHU_KY.quy4,
							status: "cong-bo",
						},
					}),
					id,
				).toBeGreaterThanOrEqual(1);
			expect(
				await db.okrObjective.count({
					where: { cycleId: CHU_KY.nam, level: "onehub", status: "cong-bo" },
				}),
			).toBe(3);
			const trangThai = await db.okrObjective.groupBy({
				by: ["status"],
				where: { cycleId: CHU_KY.quy4, id: { startsWith: OKR_MAU.tienTo } },
				_count: true,
			});
			const dem = Object.fromEntries(
				trangThai.map((t) => [t.status, t._count]),
			);
			expect([dem.nhap, dem["da-bo"]]).toEqual([1, 1]);
		},
		CHO,
	);

	test(
		"mọi mục tiêu phòng ban đã công bố căn chỉnh lên OneHub, cây căn chỉnh không kêu thiếu",
		async () => {
			expect(await mucTieuThieuCanChinh()).toEqual([]);
			const cay = await doc<{ chuaCanChinh: { objectiveId: string }[] }>(
				"okr.cayCanChinh",
				await ceo(),
				{ cycleId: CHU_KY.quy4 },
			);
			const mtPb = new Set(
				bo.mucTieu
					.filter(
						(m) =>
							m.chuKy === "quy4" &&
							m.cap === "phong-ban" &&
							m.trangThai === "cong-bo",
					)
					.map((m) => idMau("mt", m.ma)),
			);
			expect(cay.chuaCanChinh.filter((n) => mtPb.has(n.objectiveId))).toEqual(
				[],
			);
			const dich = await db.okrAlignment.findMany({
				where: { objectiveId: { in: [...mtPb] } },
				include: {
					targetObjective: true,
					targetKeyResult: { include: { objective: true } },
				},
			});
			for (const d of dich)
				expect(
					d.targetObjective?.level ?? d.targetKeyResult?.objective.level,
				).toBe("onehub");
		},
		CHO,
	);

	test(
		"chiều đỏ: gỡ một căn chỉnh thì phép đo gọi đúng tên mục tiêu",
		async () => {
			const mt = await db.okrObjective.findUniqueOrThrow({
				where: { id: idMau("mt", "q4-kho-van-1") },
			});
			await db.okrAlignment.deleteMany({ where: { objectiveId: mt.id } });
			expect(await mucTieuThieuCanChinh()).toEqual([mt.title]);
			await napMau(MOC_THU_NAM);
			expect(await mucTieuThieuCanChinh()).toEqual([]);
		},
		CHO,
	);

	test("không đơn vị nào vượt trần mặc định", async () => {
		const ds = await db.okrObjective.findMany({
			where: { id: { startsWith: OKR_MAU.tienTo }, status: { not: "da-bo" } },
			select: {
				cycleId: true,
				level: true,
				departmentId: true,
				divisionId: true,
				_count: { select: { keyResults: true } },
			},
		});
		const dem = new Map<string, number>();
		for (const m of ds) {
			const k = `${m.cycleId}:${m.level}:${m.departmentId ?? m.divisionId ?? ""}`;
			dem.set(k, (dem.get(k) ?? 0) + 1);
			expect(m._count.keyResults).toBeLessThanOrEqual(
				OKR_PROGRAM_MAC_DINH.krCap,
			);
		}
		for (const [k, n] of dem)
			expect(n, k).toBeLessThanOrEqual(OKR_PROGRAM_MAC_DINH.objectiveCap);
	});

	test(
		"trưởng phòng mẫu (không phải quản trị) thấy toàn cảnh và bảng họp tuần có KR đáng bàn",
		async () => {
			setSystemTime(MOC_THU_NAM);
			try {
				const truong = await phienCua(nguoiMau("nguyen-thi-lan"));
				const tc = await doc<ToanCanhOutput>("okr.toanCanh", truong, {
					cycleId: CHU_KY.quy4,
				});
				expect(
					tc.hang.filter((h) => h.key.startsWith(`pb:${OKR_MAU.tienTo}`))
						.length,
				).toBe(10);
				const h = await doc<HopTuanOutput>("okr.hopTuan", truong, {
					cycleId: CHU_KY.quy4,
					unit: { loai: "pb", id: idMau("pb", "kd-bac") },
				});
				expect(h.dangBan.length).toBeGreaterThanOrEqual(1);
			} finally {
				setSystemTime();
			}
		},
		CHO,
	);
});

describe("kieu-kr-mau", () => {
	beforeAll(async () => {
		await lamSachOkr();
		await napMau(MOC_THU_NAM);
	}, CHO);

	test(
		"sáu kiểu KR, mỗi kiểu ít nhất ba, số đúng luật; KR nguồn CRM đủ sáu bản chụp",
		async () => {
			const krs = await db.okrKeyResult.findMany({
				where: {
					objective: { cycleId: CHU_KY.quy4 },
					id: { startsWith: OKR_MAU.tienTo },
				},
				include: { nguonMay: true, soChup: { orderBy: { ngay: "asc" } } },
			});
			const dem = Object.fromEntries(
				KIEU_KR.map((k) => [k, krs.filter((x) => x.kind === k).length]),
			);
			for (const k of KIEU_KR) expect(dem[k], k).toBeGreaterThanOrEqual(3);
			for (const k of krs) {
				const nhap = krInput.safeParse({
					title: k.title,
					kind: k.kind,
					ownerUserId: k.ownerUserId,
					startValue: Number(k.startValue),
					targetValue: Number(k.targetValue),
					currentValue: Number(k.currentValue),
					unit: k.unit,
					dueOn: null,
					weight: Number(k.weight),
				});
				expect(nhap.success, k.id).toBe(true);
				expect(
					kiemSoTheoKieu(
						k.kind as KieuKr,
						Number(k.startValue),
						Number(k.targetValue),
					),
					k.id,
				).toBeNull();
			}
			const crm = krs.filter((k) => k.source === "crm");
			expect(crm.length).toBeGreaterThanOrEqual(5);
			for (const k of crm) {
				const n = parseOkrNguon(k.nguonMay);
				expect(n.loai).toBe("crm");
				expect(Object.keys(CHI_SO_OKR)).toContain(n.chiSo ?? "");
				expect(crmHopKieu(k.kind as KieuKr), k.id).toBe(true);
				expect(
					k.soChup.filter((c) => c.nguon === "crm").map((c) => ngay(c.ngay)),
				).toEqual(TUAN);
			}
			expect(await krCrmSaiKieu()).toEqual([]);
		},
		CHO,
	);

	test(
		"chiều đỏ: một KR nguồn CRM đổi sang kiểu mốc thì phép đo gọi tên nó",
		async () => {
			const k = idMau("kr", "q4-kd-bac-1-k1");
			await db.okrKeyResult.update({ where: { id: k }, data: { kind: "moc" } });
			expect(await krCrmSaiKieu()).toEqual([k]);
			await napMau(MOC_THU_NAM);
		},
		CHO,
	);
});

describe("sau-tuan-mau", () => {
	const MOC = [
		{ moc: new Date("2026-11-09T00:30:00+07:00"), tuan6: "2026-11-09" },
		{ moc: new Date("2026-11-12T15:00:00+07:00"), tuan6: "2026-11-09" },
		{ moc: new Date("2026-11-15T23:30:00+07:00"), tuan6: "2026-11-09" },
	];

	test("diễn biến thuần: bảng kịch bản × sáu tuần", () => {
		const bang = {
			deu: {
				giaTri: [10.5, 21, 31.5, 42, 52.5, 63],
				tuTin: ["cao", "cao", "cao", "cao", "cao", "cao"],
			},
			cham: {
				giaTri: [6, 12, 18, 24, 30, 36],
				tuTin: ["cao", "cao", "vua", "vua", "vua", "vua"],
			},
			tut: {
				giaTri: [9.5, 19, 28.5, 38, 38, 38],
				tuTin: ["cao", "cao", "cao", "vua", "vua", "thap"],
			},
			bo: { giaTri: [7, 14, 21], tuTin: ["vua", "vua", "thap"] },
			vuot: {
				giaTri: [23.8, 47.7, 71.5, 95.3, 119.2, 143],
				tuTin: ["cao", "cao", "cao", "cao", "cao", "cao"],
			},
			"ghi-chu": {
				giaTri: [9, 18, 27, 36, 45, 54],
				tuTin: ["cao", "cao", "cao", "vua", "vua", "vua"],
			},
			"chua-gui": {
				giaTri: [10, 20, 30, 40, 50],
				tuTin: ["cao", "cao", "vua", "vua", "cao"],
			},
		} satisfies Record<KichBan, { giaTri: number[]; tuTin: MucTuTin[] }>;

		for (const [kb, ky] of Object.entries(bang)) {
			const lan = dienBien({
				kieu: "tang-toi",
				khoi: 0,
				dich: 130,
				kichBan: kb as KichBan,
			});
			expect({
				kb,
				giaTri: lan.map((l) => l.giaTri),
				tuTin: lan.map((l) => l.tuTin),
			}).toEqual({ kb, ...ky });
		}
		expect(
			dienBien({ kieu: "moc", khoi: 0, dich: 1, kichBan: "vuot" }).map(
				(l) => l.giaTri,
			),
		).toEqual([0, 0, 0, 0, 1, 1]);
		expect(
			dienBien({ kieu: "giu-tren", khoi: 55, dich: 70, kichBan: "tut" }).map(
				(l) => l.giaTri,
			),
		).toEqual([72.8, 72.8, 72.8, 72.8, 72.8, 67.2]);
	});

	for (const { moc, tuan6 } of MOC) {
		test(
			`mốc ${moc.toISOString()}: sáu tuần, đáng bàn tụt và im đúng tập kịch bản, không gì ở tương lai`,
			async () => {
				await lamSachOkr();
				await napMau(moc);
				expect(dauTuanVN(moc)).toBe(tuan6);
				const krs = await db.okrKeyResult.findMany({
					where: {
						id: { startsWith: OKR_MAU.tienTo },
						objective: {
							status: "cong-bo",
							cycleId: { in: [CHU_KY.nam, CHU_KY.quy4] },
						},
					},
					include: { checkIns: { orderBy: { weekStart: "asc" } } },
				});
				for (const k of krs)
					expect(ngay(k.checkIns[0]?.weekStart ?? new Date(0)), k.id).toBe(
						"2026-10-05",
					);
				for (const id of krTheoKichBan("deu")) {
					const k = krs.find((x) => x.id === id);
					expect(
						k?.checkIns.map((c) => ngay(c.weekStart)),
						id,
					).toEqual(TUAN);
				}
				for (const id of krTheoKichBan("chua-gui")) {
					const k = krs.find((x) => x.id === id);
					expect(
						k?.checkIns.map((c) => ngay(c.weekStart)),
						id,
					).toEqual(TUAN.slice(0, 5));
				}
				const giam = krs.filter((k) => {
					const h = { cao: 2, vua: 1, thap: 0 } as const;
					const d = k.checkIns.map((c) => h[c.confidence as keyof typeof h]);
					return (
						d.every((v, i) => i === 0 || v <= (d[i - 1] ?? v)) &&
						d[0] === 2 &&
						d.includes(1) &&
						d.at(-1) === 0
					);
				});
				expect(giam.length).toBeGreaterThanOrEqual(3);
				for (const k of krs.filter((x) => x.source === "tay"))
					expect(Number(k.currentValue), k.id).toBe(
						Number(k.checkIns.at(-1)?.value),
					);
				const tuongLai = await db.okrCheckIn.count({
					where: { id: { startsWith: OKR_MAU.tienTo }, createdAt: { gt: moc } },
				});
				const phienTuongLai = await db.okrCheckInSession.count({
					where: {
						id: { startsWith: OKR_MAU.tienTo },
						submittedAt: { gt: moc },
					},
				});
				const chupTuongLai = await db.okrSoChup.count({
					where: {
						id: { startsWith: OKR_MAU.tienTo },
						ngay: {
							gt: new Date(
								`${ngay(new Date(moc.getTime() + 7 * 3600_000))}T00:00:00Z`,
							),
						},
					},
				});
				expect([tuongLai, phienTuongLai, chupTuongLai]).toEqual([0, 0, 0]);
				const phien = await db.okrCheckInSession.findMany({
					where: { id: { startsWith: OKR_MAU.tienTo } },
					include: { checkIns: true },
				});
				const cap = new Map<string, number>();
				for (const p of phien) {
					expect(p.submittedAt).not.toBeNull();
					for (const t of new Set(
						p.checkIns.map((c) => `${p.userId}:${ngay(c.weekStart)}`),
					))
						cap.set(t, (cap.get(t) ?? 0) + 1);
				}
				for (const [k, n] of cap) expect(n, k).toBe(1);

				setSystemTime(moc);
				try {
					const ban = await dangBanToanCongTy(await ceo());
					const tut = ban
						.filter((d) => d.lyDo.some((l) => l.loai === "tut"))
						.map((d) => d.keyResultId)
						.sort();
					const im = ban
						.filter((d) =>
							d.lyDo.some(
								(l) => l.loai === "im" && l.soNgay >= OKR_NHAC.imNgay,
							),
						)
						.map((d) => d.keyResultId)
						.sort();
					expect(tut).toEqual(krTheoKichBan("tut").sort());
					expect(im).toEqual(krTheoKichBan("bo").sort());
					expect(tut.length).toBeGreaterThanOrEqual(2);
					expect(im.length).toBeGreaterThanOrEqual(2);
				} finally {
					setSystemTime();
				}
			},
			CHO,
		);
	}

	test(
		"chiều đỏ: đồng hồ sang tuần sau thì không còn KR tụt — lời hứa theo hôm nay",
		async () => {
			await lamSachOkr();
			await napMau(MOC_THU_NAM);
			setSystemTime(new Date(MOC_THU_NAM.getTime() + 7 * 86_400_000));
			try {
				const ban = await dangBanToanCongTy(await ceo());
				expect(ban.filter((d) => d.lyDo.some((l) => l.loai === "tut"))).toEqual(
					[],
				);
			} finally {
				setSystemTime();
			}
		},
		CHO,
	);
});

describe("quy-3-mau", () => {
	beforeAll(async () => {
		await lamSachOkr();
		await napMau(MOC_THU_NAM);
	}, CHO);

	test(
		"quý 3 đã khép: mọi KR có điểm đúng gợi ý, điều học được, mang sang ba mục tiêu",
		async () => {
			const cookie = await ceo();
			const bang = await doc<BangChamOutput>("okr.bangCham", cookie, {
				cycleId: CHU_KY.quy3,
			});
			const mt = bang.mucTieu.filter((m) => m.id.startsWith(OKR_MAU.tienTo));
			expect(mt.length).toBe(phongBanMau.length + phongBanLuuTruMau.length);
			const pb = await db.okrObjective.findMany({
				where: { cycleId: CHU_KY.quy3 },
				select: { departmentId: true },
			});
			expect(pb.map((p) => p.departmentId).sort()).toEqual(
				[...phongBanMau, ...phongBanLuuTruMau].sort(),
			);
			let khac = 0;
			for (const m of mt) {
				expect(m.dieuHocDuoc.length, m.id).toBeGreaterThan(0);
				for (const k of m.krs) {
					const db_ = await db.okrKeyResult.findUniqueOrThrow({
						where: { id: k.id },
					});
					expect(k.soChot, k.id).toBe(Number(db_.currentValue));
					expect(k.diemGoiY, k.id).toBe(
						goiYDiem(k.kind, k.startValue, k.targetValue, k.soChot),
					);
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
			const ms = await db.okrMangSang.findMany({
				where: { id: { startsWith: OKR_MAU.tienTo } },
			});
			expect(ms.length).toBe(3);
			for (const m of ms) {
				const tu = await doc<{ mangSangToi: { objectiveId: string } | null }>(
					"okr.objective",
					cookie,
					{ id: m.tuObjectiveId },
				);
				const sang = await doc<{ mangSangTu: { objectiveId: string } | null }>(
					"okr.objective",
					cookie,
					{ id: m.sangObjectiveId },
				);
				expect([
					tu.mangSangToi?.objectiveId,
					sang.mangSangTu?.objectiveId,
				]).toEqual([m.sangObjectiveId, m.tuObjectiveId]);
			}
		},
		CHO,
	);

	test(
		"chiều đỏ: một KR mất điểm thì kỳ chưa đóng được",
		async () => {
			const k = idMau("kr", "q3-kho-van-k1");
			await db.okrDiemKr.update({
				where: { keyResultId: k },
				data: { diem: null },
			});
			expect((await kiemDongKy(db, CHU_KY.quy3)).conLai).toBe(1);
			await napMau(MOC_THU_NAM);
		},
		CHO,
	);
});

describe("moc-ghim-mau", () => {
	test(
		"cùng mốc ra cùng bộ, mốc khác ra bộ khác, không mốc là tuần này",
		async () => {
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
			const cuoi = await db.okrCheckIn.findFirstOrThrow({
				where: { id: { startsWith: OKR_MAU.tienTo } },
				orderBy: { weekStart: "desc" },
			});
			expect(ngay(cuoi.weekStart)).toBe(dauTuanVN(bayGio));
		},
		CHO,
	);

	test(
		"--moc sai dạng bị từ chối trước khi ghi",
		async () => {
			const truoc = await vanTayKho();
			for (const sai of ["2026-13-01", "mai", "2026-02-30"]) {
				const r = chayLenh([OKR_MAU.co.moc, sai]);
				expect(r.ma, sai).toBe(OKR_MAU.ma.sai);
				expect(r.loi).toContain(OKR_MAU.co.moc);
			}
			expect(await vanTayKho()).toEqual(truoc);
		},
		CHO,
	);
});

async function hangNgoai() {
	const nguoi = await db.user.upsert({
		where: { id: "ngoai-mau-nguoi" },
		create: {
			id: "ngoai-mau-nguoi",
			name: "Ngoài mẫu",
			email: "ngoai-mau@thu.test",
			updatedAt: new Date(),
		},
		update: {},
	});
	const pb = await db.department.upsert({
		where: { id: "ngoai-mau-pb" },
		create: { id: "ngoai-mau-pb", name: "pb ngoài mẫu", position: 950 },
		update: {},
	});
	const cty = await db.company.upsert({
		where: { id: "ngoai-mau-cty" },
		create: { id: "ngoai-mau-cty", name: "Công ty ngoài mẫu" },
		update: {},
	});
	const deal = await db.deal.upsert({
		where: { id: "ngoai-mau-deal" },
		create: {
			id: "ngoai-mau-deal",
			name: "Thoả thuận ngoài mẫu",
			companyId: cty.id,
			ownerId: nguoi.id,
		},
		update: {},
	});
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

const demBang = async () =>
	Object.fromEntries(
		Object.entries(await vanTay()).map(([k, ds]) => [k, ds.length]),
	);

const SAU_BANG = [
	"okrViecKr",
	"okrBangChung",
	"okrGhiNhan",
	"okrGhiNhanNhan",
	"okrMau",
	"okrMucTieuTuMau",
] as const;

const BANG_CO_MAU = [
	"user",
	"member",
	"division",
	"department",
	"orgPlacement",
	"okrCycle",
	"okrObjective",
	"okrNguoiXem",
	"okrTrail",
	"okrKeyResult",
	"okrAlignment",
	"okrNguonKr",
	"okrSoChup",
	"okrCheckInSession",
	"okrCheckIn",
	"okrDiemKr",
	"okrNhinLai",
	"okrMangSang",
	...SAU_BANG,
	"okrHoiY",
	"okrHoiYBanTruoc",
	"okrY",
	"okrYDongY",
	"okrChuDe",
] as const;

const bangCoHang = (dem: Record<string, number>) =>
	Object.keys(dem)
		.filter((bang) => (dem[bang] ?? 0) > 0)
		.sort();

describe("nap-lai-mau", () => {
	test(
		"nạp hai lần: cùng số hàng, hàng ngoài bộ mẫu không đổi",
		async () => {
			await lamSachOkr();
			await hangNgoai();
			const ngoai = await chupNgoai();
			await napMau(MOC_THU_NAM);
			const mot = await demBang();
			await napMau(MOC_THU_NAM);
			expect(await demBang()).toEqual(mot);
			expect(bangCoHang(mot)).toEqual([...BANG_CO_MAU].sort());
			expect(await chupNgoai()).toEqual(ngoai);
			await donNgoai();
		},
		CHO,
	);

	test(
		"chiều đỏ: nạp mà bỏ bước xoá bộ cũ thì hỏng",
		async () => {
			const loi = await db
				.$transaction((tx) => napTrong(tx, bo, MOC_THU_NAM))
				.catch((e) => e);
			expect(loi).toBeInstanceOf(Error);
		},
		CHO,
	);
});

describe("xoa-mau", () => {
	test(
		"dùng rồi mới xoá: không còn hàng nào trỏ vào thực thể mẫu, nạp lại được",
		async () => {
			await lamSachOkr();
			await hangNgoai();
			const ngoai = await chupNgoai();
			await napMau(new Date());
			const cookie = await ceo();
			expect(
				(
					await goi(
						"okr.moHopTuan",
						{
							cycleId: CHU_KY.quy4,
							unit: { loai: "pb", id: idMau("pb", "phap-che") },
						},
						cookie,
					)
				).status,
			).toBe(200);
			const chua = await phienCua(nguoiMau("an-khanh-linh"));
			const mo = await goi("okr.moCapNhat", { entry: "tab" }, chua);
			expect(mo.status, mo.loi).toBe(200);
			const gui = await goi(
				"okr.guiCapNhat",
				{
					sessionId: (mo.data as { sessionId: string }).sessionId,
					items: [
						{
							keyResultId: idMau("kr", "q4-phap-che-1-k1"),
							value: 1.8,
							confidence: "cao",
							note: "",
						},
					],
				},
				chua,
			);
			expect(gui.status, gui.loi).toBe(200);
			const ids = await tapIdMau();
			const truoc = await demThamChieu(ids);
			for (const bang of [
				"okrTrail",
				"okrCheckInSession",
				"session",
				"okrCheckIn",
				"okrKeyResult",
			])
				expect(
					Object.keys(truoc).some((k) => k.startsWith(`${bang}.`)),
					bang,
				).toBe(true);
			const r = chayLenh([OKR_MAU.co.xoa]);
			expect(r.ma, r.loi).toBe(0);
			expect(await demThamChieu(ids)).toEqual({});
			expect(await chupNgoai()).toEqual(ngoai);
			const lai = chayLenh([]);
			expect(lai.ma, lai.loi).toBe(0);
		},
		CHO,
	);

	test(
		"dữ liệu ngoài bộ mẫu đang giữ người mẫu: dừng mã 5, nêu bảng, không đổi gì",
		async () => {
			await db.deal.update({
				where: { id: "ngoai-mau-deal" },
				data: { ownerId: nguoiMau("do-minh-khoa") },
			});
			const truoc = await vanTayKho();
			const r = chayLenh([OKR_MAU.co.xoa]);
			expect(r.ma, r.loi).toBe(OKR_MAU.ma.dangGiu);
			expect(r.loi.toLowerCase()).toContain("deal");
			expect(await vanTayKho()).toEqual(truoc);
			await db.deal.update({
				where: { id: "ngoai-mau-deal" },
				data: { ownerId: "ngoai-mau-nguoi" },
			});
			await donNgoai();
		},
		CHO,
	);

	test(
		"xoá trên kho không có bộ mẫu thì báo không có gì để xoá",
		async () => {
			await xoaBoOkrMau(db);
			const r = chayLenh([OKR_MAU.co.xoa]);
			expect(r.ma, r.loi).toBe(0);
			expect(r.ra).toContain("không có bộ mẫu");
		},
		CHO,
	);
});

describe("okr-that-mau", () => {
	const CA = [
		{
			ten: "một chu kỳ thật",
			dung: async () => {
				await db.okrCycle.create({
					data: {
						id: "that-chu-ky",
						kind: "nam",
						name: "Năm thật",
						startsOn: new Date("2027-01-01"),
						endsOn: new Date("2027-12-31"),
					},
				});
			},
			dem: "1 chu kỳ, 0 mục tiêu, 0 KR",
		},
		{
			ten: "một mục tiêu thật trong chu kỳ mẫu",
			dung: async () => {
				await db.okrObjective.create({
					data: {
						id: "that-muc-tieu",
						cycleId: CHU_KY.quy4,
						level: "onehub",
						ownerUserId: phien.quan.nguoi,
						kind: "cam-ket",
						title: "Mục tiêu thật",
					},
				});
			},
			dem: "0 chu kỳ, 1 mục tiêu, 0 KR",
		},
		{
			ten: "một KR thật gắn vào mục tiêu mẫu",
			dung: async () => {
				await db.okrKeyResult.create({
					data: {
						id: "that-kr",
						objectiveId: idMau("mt", "q4-kd-bac-1"),
						title: "KR thật",
						kind: "tang-toi",
						ownerUserId: phien.quan.nguoi,
						startValue: 0,
						targetValue: 5,
						currentValue: 0,
					},
				});
			},
			dem: "0 chu kỳ, 0 mục tiêu, 1 KR",
		},
	];

	for (const ca of CA) {
		test(
			`${ca.ten}: nạp và xoá đều thoát 3, không đổi gì`,
			async () => {
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
			},
			CHO,
		);
	}

	test(
		"đối chứng: kho chỉ có bộ mẫu của lần trước thì nạp lại chạy",
		async () => {
			await lamSachOkr();
			await napMau(MOC_THU_NAM);
			const r = chayLenh([]);
			expect(r.ma, r.loi).toBe(0);
		},
		CHO,
	);
});

describe("bo-hong-mau", () => {
	type Tho = {
		nguoi: { ma: string }[];
		phongBan: { ma: string; truong: string }[];
		mucTieu: {
			krs: { kieu: string; khoi: number; dich: number; nguon?: object }[];
		}[];
	};
	const viTriKr = (
		tho: Tho,
		dk: (k: Tho["mucTieu"][number]["krs"][number]) => boolean,
	) => {
		for (const [i, m] of tho.mucTieu.entries())
			for (const [j, k] of m.krs.entries()) if (dk(k)) return [i, j] as const;
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
		test(
			`${ca.ten}: thoát 4 nêu đúng chỗ, không ghi`,
			async () => {
				const tho: Tho = JSON.parse(congTyChu());
				const duong = ca.pha(tho);
				const tep = join(mkdtempSync(join(tmpdir(), "okr-mau-")), "hong.json");
				writeFileSync(tep, JSON.stringify(tho));
				const truoc = await vanTayKho();
				const r = chayLenh([OKR_MAU.co.tep, tep]);
				expect(r.ma, r.loi).toBe(OKR_MAU.ma.sai);
				expect(r.loi).toContain(`${duong}:`);
				expect(await vanTayKho()).toEqual(truoc);
			},
			CHO,
		);
	}
});

describe("thu-tuc-that-mau", () => {
	test(
		"người chưa gửi tuần này gửi Cập nhật tuần thật; người vai chỉ OKR xem toàn cảnh nhưng không xem thoả thuận",
		async () => {
			await lamSachOkr();
			await napMau(MOC_THU_NAM);
			const mot = await demBang();
			const kr = idMau("kr", "q4-phap-che-1-k1");
			setSystemTime(MOC_THU_NAM);
			try {
				const chua = await phienCua(nguoiMau("an-khanh-linh"));
				const tuanT = new Date("2026-11-09T00:00:00Z");
				expect(
					await db.okrCheckIn.count({
						where: { keyResultId: kr, weekStart: tuanT },
					}),
				).toBe(0);
				const mo = await goi("okr.moCapNhat", { entry: "tab" }, chua);
				expect(mo.status, mo.loi).toBe(200);
				const phienId = (mo.data as { sessionId: string }).sessionId;
				const gui = await goi(
					"okr.guiCapNhat",
					{
						sessionId: phienId,
						items: [
							{ keyResultId: kr, value: 1.8, confidence: "cao", note: "" },
						],
					},
					chua,
				);
				expect(gui.status, gui.loi).toBe(200);
				expect(
					Number(
						(await db.okrKeyResult.findUniqueOrThrow({ where: { id: kr } }))
							.currentValue,
					),
				).toBe(1.8);
				expect(
					await db.okrCheckIn.count({
						where: { keyResultId: kr, weekStart: tuanT },
					}),
				).toBe(1);
				expect(
					(
						await db.okrCheckInSession.findUniqueOrThrow({
							where: { id: phienId },
						})
					).submittedAt,
				).not.toBeNull();
				const okr = await phienCua(nguoiMau("giang-hai-yen"));
				const tc = await doc<ToanCanhOutput>("okr.toanCanh", okr, {
					cycleId: CHU_KY.quy4,
				});
				expect(
					tc.hang.filter((h) => h.key.startsWith(`pb:${OKR_MAU.tienTo}`))
						.length,
				).toBe(10);
				expect((await goiQuery("deals.list", okr, {})).status).toBe(403);
				expect((await goiQuery("deals.list", await ceo(), {})).status).toBe(
					200,
				);
			} finally {
				setSystemTime();
			}
			await napMau(MOC_THU_NAM);
			expect(await demBang()).toEqual(mot);
		},
		CHO,
	);
});

describe("canh-kr-mau", () => {
	type DemViec = { xong: number; chua: number };
	const VIEC_KHAI = {
		"kd-bac": { xong: 1, chua: 2 },
		"kd-nam": { xong: 1, chua: 1 },
		"cham-soc": { xong: 2, chua: 1 },
		marketing: { xong: 1, chua: 2 },
		"kho-van": { xong: 1, chua: 1 },
		"dieu-phoi": { xong: 1, chua: 1 },
		"san-pham": { xong: 1, chua: 2 },
		"tai-chinh": { xong: 1, chua: 1 },
		"nhan-su": { xong: 1, chua: 1 },
		"phap-che": { xong: 1, chua: 1 },
	} satisfies Record<string, DemViec>;
	const TIEN = { startsWith: OKR_MAU.tienTo };
	const NGOAI = {
		nguoi2: "ngoai-mau-nguoi-2",
		chuKy: "ngoai-mau-chu-ky",
		mucTieu: "ngoai-mau-mt",
		kr: "ngoai-mau-kr",
		viec: "ngoai-mau-viec",
		ghiNhan: "ngoai-mau-gn",
	};
	const nhanMau = nguoiMau("tran-quoc-bao");

	async function viecTheoPhongBan(): Promise<Record<string, DemViec>> {
		const ds = await db.okrViecKr.findMany({
			where: { id: TIEN },
			select: {
				xongLuc: true,
				keyResult: {
					select: { objective: { select: { departmentId: true } } },
				},
			},
		});
		return Object.fromEntries(
			bo.phongBan.map((p) => {
				const cua = ds.filter(
					(v) => v.keyResult.objective.departmentId === idMau("pb", p.ma),
				);
				return [
					p.ma,
					{
						xong: cua.filter((v) => v.xongLuc !== null).length,
						chua: cua.filter((v) => v.xongLuc === null).length,
					},
				];
			}),
		);
	}

	async function mocXongCoBangChung(): Promise<string[]> {
		const ds = await db.okrKeyResult.findMany({
			where: { id: TIEN, kind: "moc", bangChung: { some: {} } },
			select: { id: true, currentValue: true, targetValue: true },
		});
		return ds
			.filter((k) => Number(k.currentValue) === Number(k.targetValue))
			.map((k) => k.id);
	}

	const demSau = (dem: Record<string, number>) =>
		Object.fromEntries(SAU_BANG.map((bang) => [bang, dem[bang] ?? -1]));

	async function idSauBang(): Promise<string[]> {
		const chon = { where: { id: TIEN }, select: { id: true } } as const;
		const ds = await Promise.all([
			db.okrViecKr.findMany(chon),
			db.okrBangChung.findMany(chon),
			db.okrGhiNhan.findMany(chon),
			db.okrMau.findMany(chon),
			db.okrMucTieuTuMau.findMany(chon),
		]);
		return ds.flat().map((x) => x.id);
	}

	async function dungNgoai() {
		const { nguoi } = await hangNgoai();
		await db.user.create({
			data: {
				id: NGOAI.nguoi2,
				name: "Ngoài mẫu hai",
				email: "ngoai-mau-2@thu.test",
				updatedAt: new Date(),
			},
		});
		const homNay = new Date(`${ngayVN(new Date())}T00:00:00Z`);
		await db.okrCycle.create({
			data: {
				id: NGOAI.chuKy,
				kind: "quy",
				name: "Quý ngoài mẫu",
				startsOn: homNay,
				endsOn: new Date(
					homNay.getTime() +
						7 * OKR_MAU.tuan.tuanMoiQuy * OKR_MAU.thoiGian.ngayMs,
				),
				phase: "dang-chay",
			},
		});
		await db.okrObjective.create({
			data: {
				id: NGOAI.mucTieu,
				cycleId: NGOAI.chuKy,
				level: "onehub",
				ownerUserId: nguoi,
				kind: "cam-ket",
				status: "cong-bo",
				publishedAt: new Date(),
				title: "Mục tiêu ngoài mẫu",
			},
		});
		await db.okrKeyResult.create({
			data: {
				id: NGOAI.kr,
				objectiveId: NGOAI.mucTieu,
				title: "KR ngoài mẫu",
				kind: "tang-toi",
				ownerUserId: nguoi,
				startValue: 0,
				targetValue: 5,
				currentValue: 0,
			},
		});
		await db.okrViecKr.create({
			data: {
				id: NGOAI.viec,
				keyResultId: NGOAI.kr,
				loai: "viec",
				tieuDe: "Việc ngoài mẫu",
				nguoiLamUserId: nguoi,
				taoBoiUserId: nguoi,
			},
		});
		await db.okrGhiNhan.create({
			data: {
				id: NGOAI.ghiNhan,
				objectiveId: NGOAI.mucTieu,
				keyResultId: NGOAI.kr,
				loiNhan: "Ghi nhận ngoài mẫu",
				tacGiaUserId: nguoi,
				nhan: { create: [{ userId: nhanMau }, { userId: NGOAI.nguoi2 }] },
			},
		});
	}

	async function chupNgoaiCanhKr() {
		return {
			viec: await db.okrViecKr.findUnique({ where: { id: NGOAI.viec } }),
			ghiNhan: await db.okrGhiNhan.findUnique({
				where: { id: NGOAI.ghiNhan },
			}),
			nhan: await db.okrGhiNhanNhan.findMany({
				where: { ghiNhanId: NGOAI.ghiNhan },
				orderBy: { userId: "asc" },
			}),
		};
	}

	async function donNgoaiCanhKr() {
		await db.okrGhiNhan.deleteMany({ where: { id: NGOAI.ghiNhan } });
		await db.okrViecKr.deleteMany({ where: { id: NGOAI.viec } });
		await db.okrKeyResult.deleteMany({ where: { id: NGOAI.kr } });
		await db.okrObjective.deleteMany({ where: { id: NGOAI.mucTieu } });
		await db.okrCycle.deleteMany({ where: { id: NGOAI.chuKy } });
		await db.user.deleteMany({ where: { id: NGOAI.nguoi2 } });
		await donNgoai();
	}

	test(
		"canh-kr: nạp có việc, bằng chứng, ghi nhận, mẫu; nạp lại không nhân đôi; xoá sạch sáu bảng, hàng ngoài đứng nguyên",
		async () => {
			expect(BANG_DEM.map((b) => b.bang)).toEqual(
				expect.arrayContaining([...SAU_BANG]),
			);
			for (const [pb, d] of Object.entries(VIEC_KHAI)) {
				expect(d.xong, pb).toBeGreaterThanOrEqual(1);
				expect(d.chua, pb).toBeGreaterThanOrEqual(1);
			}
			expect(Object.keys(VIEC_KHAI).sort()).toEqual(
				bo.phongBan.map((p) => p.ma).sort(),
			);

			await lamSachOkr();
			await napMau(MOC_THU_NAM);

			expect(await viecTheoPhongBan()).toEqual(VIEC_KHAI);
			expect((await mocXongCoBangChung()).length).toBeGreaterThanOrEqual(3);
			expect(
				await db.okrGhiNhan.count({ where: { id: TIEN } }),
			).toBeGreaterThanOrEqual(6);
			const mau = await db.okrMau.findMany({
				where: { id: TIEN },
				select: { id: true, noiDung: true },
			});
			expect(mau.length).toBe(3);
			for (const m of mau) {
				const r = mauNoiDung.safeParse(m.noiDung);
				expect(r.success, `${m.id}: ${r.error?.message ?? ""}`).toBe(true);
			}
			const tuMau = await db.okrMucTieuTuMau.findMany({
				where: { id: TIEN },
				select: {
					mauId: true,
					objective: { select: { id: true, cycleId: true } },
				},
			});
			expect(tuMau.length).toBe(2);
			for (const t of tuMau) {
				expect(t.objective.id.startsWith(OKR_MAU.tienTo)).toBe(true);
				expect(t.objective.cycleId).toBe(CHU_KY.quy4);
				expect(mau.map((m) => m.id)).toContain(t.mauId);
			}

			const mot = demSau(await demBang());
			for (const [bang, so] of Object.entries(mot))
				expect(so, bang).toBeGreaterThan(0);
			await napMau(MOC_THU_NAM);
			expect(demSau(await demBang())).toEqual(mot);

			await dungNgoai();
			const ngoai = await chupNgoaiCanhKr();
			const ids = [...(await tapIdMau()), ...(await idSauBang())];
			const loi = await db
				.$transaction((tx) => xoaTrong(tx), { timeout: CHO })
				.then(
					() => "",
					(e) => String(e),
				);
			expect(loi).toBe("");
			expect(demSau(await demBang())).toEqual(
				Object.fromEntries(SAU_BANG.map((bang) => [bang, 0])),
			);
			expect(await demThamChieu(ids)).toEqual({});
			expect(await chupNgoaiCanhKr()).toEqual({
				...ngoai,
				nhan: ngoai.nhan.filter((n) => n.userId !== nhanMau),
			});
			await donNgoaiCanhKr();
		},
		CHO,
	);
});

describe("hoi-y", () => {
	const SAU_BANG_HOI_Y = [
		"okrHoiY",
		"okrHoiYBanTruoc",
		"okrY",
		"okrYDongY",
		"okrChuDe",
		"okrHoiYHieu",
	] as const;
	const KY_NAM_KE = idMau("chu-ky", "nam-ke");
	const GIO = OKR_MAU.thoiGian.gioMs;
	const NGUOI_CHON = nguoiMau("le-hai-dang");

	const KHAI = {
		chuKyNamKeLapKeHoach: 1,
		hoiY: 1,
		nguoiChonLaQuanTriMau: 1,
		banTruoc: 4,
		y: 30,
		tacGia: 25,
		boPhanCoTacGia: 3,
		tacGiaVaiOkr: 4,
		dongY: 12,
		chuDe: 5,
		chuDeYLa: 1,
		chuDeDaKetLuan: 2,
		chuDeChon: 1,
		yChuaGom: 5,
	} as const;

	async function doHoiY() {
		const [ky, hoiY] = await Promise.all([
			db.okrCycle.count({
				where: { id: KY_NAM_KE, kind: "nam", phase: "lap-ke-hoach" },
			}),
			db.okrHoiY.findMany({
				where: { cycleId: KY_NAM_KE },
				include: {
					banTruoc: true,
					y: { include: { tacGia: { include: { members: true } } } },
					chuDe: true,
				},
			}),
		]);
		const h = hoiY[0];
		if (!h) throw new Error("kho không có lần hỏi ý trên chu kỳ năm kế");
		const tacGiaIds = [...new Set(h.y.map((y) => y.tacGiaUserId))];
		const boPhan = await db.orgPlacement.findMany({
			where: { userId: { in: tacGiaIds } },
			select: { primaryDepartment: { select: { divisionId: true } } },
		});
		const laQuanTri = await db.member.count({
			where: { userId: NGUOI_CHON, role: "admin" },
		});
		return {
			chuKyNamKeLapKeHoach: ky,
			hoiY: hoiY.length,
			nguoiChonLaQuanTriMau:
				h.nguoiChonUserId === NGUOI_CHON && laQuanTri > 0 ? 1 : 0,
			banTruoc: h.banTruoc?.cau.length ?? 0,
			y: h.y.length,
			tacGia: tacGiaIds.length,
			boPhanCoTacGia: new Set(
				boPhan.map((b) => b.primaryDepartment?.divisionId),
			).size,
			tacGiaVaiOkr: new Set(
				h.y
					.filter((y) => y.tacGia.members.some((m) => m.role === "okr"))
					.map((y) => y.tacGiaUserId),
			).size,
			dongY: await db.okrYDongY.count({ where: { y: { hoiYId: h.id } } }),
			chuDe: h.chuDe.length,
			chuDeYLa: h.chuDe.filter((c) => c.loai === "y-la").length,
			chuDeDaKetLuan: h.chuDe.filter((c) => c.ketLuan !== null).length,
			chuDeChon: h.chuDe.filter((c) => c.ketLuan === "chon").length,
			yChuaGom: h.y.filter((y) => y.chuDeId === null).length,
		};
	}

	async function demSauBang(): Promise<Record<string, number>> {
		const ra: Record<string, number> = {};
		for (const bang of SAU_BANG_HOI_Y) {
			const b = BANG_DEM.find((x) => x.bang === bang);
			if (!b) throw new Error(`BANG_DEM không có bảng ${bang}`);
			const rows = await db.$queryRawUnsafe<{ n: bigint }[]>(
				`SELECT count(*) AS n FROM "${b.bang}"`,
			);
			ra[bang] = Number(rows[0]?.n ?? 0);
		}
		return ra;
	}

	async function docY() {
		const ds = await db.okrY.findMany({
			where: { hoiY: { cycleId: KY_NAM_KE } },
			include: { chuDe: true },
		});
		return ds
			.map((y) => ({
				tacGia: y.tacGiaUserId,
				noiDung: y.noiDung,
				viSao: y.viSao,
				doBangGi: y.doBangGi,
				luc: y.createdAt.toISOString(),
				chuDe: y.chuDe?.ten ?? null,
				yLa: y.chuDe?.loai === "y-la",
			}))
			.sort((a, b) => a.noiDung.localeCompare(b.noiDung));
	}

	async function idSauBang(): Promise<string[]> {
		const ds = await Promise.all([
			db.okrHoiY.findMany({ select: { id: true } }),
			db.okrHoiYBanTruoc.findMany({ select: { id: true } }),
			db.okrY.findMany({ select: { id: true } }),
			db.okrChuDe.findMany({ select: { id: true } }),
		]);
		return ds.flat().map((x) => x.id);
	}

	test(
		"nạp bộ mẫu: chu kỳ năm kế ở lập kế hoạch, một lần hỏi ý đang gom — bảng khai so từng dòng",
		async () => {
			await lamSachOkr();
			await napMau(MOC_THU_NAM);
			expect(await doHoiY()).toEqual(KHAI);
			expect(bo.hoiY.nguoiChon).toBe("le-hai-dang");
			expect(bo.hoiY.banTruoc).toHaveLength(KHAI.banTruoc);
			expect(bo.hoiY.y).toHaveLength(KHAI.y);
			expect(bo.hoiY.dongY).toHaveLength(KHAI.dongY);
			expect(bo.hoiY.chuDe).toHaveLength(KHAI.chuDe - KHAI.chuDeYLa);
			expect(bo.hoiY.yLa).toHaveLength(KHAI.chuDeYLa);

			const h = await db.okrHoiY.findFirstOrThrow({
				where: { cycleId: KY_NAM_KE },
				include: { banTruoc: true, chuDe: { include: { y: true } } },
			});
			const t0 = new Date(
				MOC_THU_NAM.getTime() - OKR_MAU.hoiY.moTruocGio * GIO,
			);
			const han = new Date(t0.getTime() + OKR_MAU.hoiY.hanSauMoGio * GIO);
			expect(h.createdAt).toEqual(t0);
			expect(h.hanLuc).toEqual(han);
			expect(h.congBoLuc).toBeNull();
			expect(h.taoBoiUserId).toBe(NGUOI_CHON);
			expect(trangThaiHoiY(h, MOC_THU_NAM)).toBe("dang-gom");
			expect(trangThaiHoiY(h, new Date(han.getTime() - 1))).toBe("dang-mo");
			expect(h.banTruoc?.vietBoiUserId).toBe(NGUOI_CHON);
			expect(h.banTruoc?.boQua).toBe(false);
			expect(h.banTruoc?.cau).toEqual(bo.hoiY.banTruoc);
			expect(h.banTruoc?.niemPhongLuc).toEqual(
				new Date(t0.getTime() + OKR_MAU.hoiY.niemPhongSauMoGio * GIO),
			);

			const y = await db.okrY.findMany({
				where: { hoiYId: h.id },
				include: { dongY: true },
			});
			for (const m of bo.hoiY.y) {
				const dong = y.find(
					(x) =>
						x.tacGiaUserId === nguoiMau(m.tacGia) && x.noiDung === m.noiDung,
				);
				expect(dong, m.ma).toBeDefined();
				const luc = new Date(t0.getTime() + m.gio * GIO);
				expect(dong?.createdAt, m.ma).toEqual(luc);
				expect(dong?.viSao, m.ma).toBe(m.viSao);
				expect(dong?.doBangGi, m.ma).toBe(m.doBangGi);
				for (const d of dong?.dongY ?? []) {
					expect(d.createdAt.getTime(), m.ma).toBe(
						luc.getTime() + OKR_MAU.hoiY.dongYSauYGio * GIO,
					);
					expect(d.createdAt.getTime(), m.ma).toBeLessThan(han.getTime());
				}
			}
			const gomLuc = new Date(han.getTime() + OKR_MAU.hoiY.gomSauHanGio * GIO);
			for (const c of h.chuDe) {
				expect(c.createdAt, c.ten).toEqual(gomLuc);
				for (const x of c.y) expect(x.ganLuc, x.noiDung).toEqual(gomLuc);
			}

			const chon = h.chuDe.find((c) => c.ketLuan === "chon");
			expect(chon?.noiBanTruoc).toBe("cau-1");
			expect(chon?.cauMucTieu.length).toBeGreaterThan(0);
			expect(chon?.lyDo.length).toBeGreaterThan(0);
			const khac = h.chuDe.filter(
				(c) => c.ketLuan !== null && c.ketLuan !== "chon",
			);
			expect(khac).toHaveLength(1);
			expect(khac[0]?.noiBanTruoc).toBeNull();
			const yLa = h.chuDe.filter((c) => c.loai === "y-la");
			expect(yLa[0]?.y).toHaveLength(1);
			expect(yLa[0]?.ketLuan).toBeNull();

			const vet = await db.okrTrail.findMany({
				where: { cycleId: KY_NAM_KE },
				select: { action: true, actorUserId: true },
				orderBy: { action: "asc" },
			});
			expect(vet).toEqual([
				{ action: "mo-hoi-y", actorUserId: NGUOI_CHON },
				{ action: "niem-phong", actorUserId: NGUOI_CHON },
			]);
		},
		CHO,
	);

	test(
		"mốc là bây giờ (lệnh không --moc): lần hỏi ý đã qua hạn, chưa công bố — đang gom hôm nay",
		async () => {
			await lamSachOkr();
			const bayGio = new Date();
			await napMau(bayGio);
			const h = await db.okrHoiY.findFirstOrThrow({
				where: { cycleId: KY_NAM_KE },
			});
			expect(h.hanLuc.getTime()).toBeLessThan(bayGio.getTime());
			expect(h.congBoLuc).toBeNull();
			expect(trangThaiHoiY(h, new Date())).toBe("dang-gom");
		},
		CHO,
	);

	test(
		"vân tay phủ sáu bảng hỏi ý theo nội dung, không theo mã sinh: nạp lại cùng mốc ra cùng vân tay, đủ số hàng từng bảng",
		async () => {
			await lamSachOkr();
			await napMau(MOC_THU_NAM);
			const mot = await vanTayHoiY();
			const idMot = await idSauBang();
			await xoaBoOkrMau(db);
			await napMau(MOC_THU_NAM);
			const hai = await vanTayHoiY();
			expect(await idSauBang()).not.toEqual(idMot);
			expect(hai).toEqual(mot);
			expect(
				Object.fromEntries(
					Object.entries(await vanTay())
						.filter(([bang]) => SAU_BANG_HOI_Y.some((b) => b === bang))
						.map(([bang, ds]) => [bang, ds.length]),
				),
			).toEqual({
				okrHoiY: KHAI.hoiY,
				okrHoiYBanTruoc: 1,
				okrY: KHAI.y,
				okrYDongY: KHAI.dongY,
				okrChuDe: KHAI.chuDe,
				okrHoiYHieu: 0,
			});
			const chu = JSON.stringify(mot);
			for (const id of idMot) expect(chu.includes(id), id).toBe(false);
		},
		CHO,
	);

	test(
		"lệnh nạp và lệnh xoá in số lần hỏi ý thật, số chủ đề và số ý lạ tách riêng",
		async () => {
			await lamSachOkr();
			const tomTat = `${KHAI.hoiY} lần hỏi ý mục tiêu với ${KHAI.y} ý, ${KHAI.dongY} lượt đồng ý, ${KHAI.chuDe - KHAI.chuDeYLa} chủ đề + ${KHAI.chuDeYLa} ý lạ`;
			const nap = chayLenh([]);
			expect(nap.ma, nap.loi).toBe(0);
			expect(nap.ra).toContain(tomTat);
			const xoa = chayLenh([OKR_MAU.co.xoa]);
			expect(xoa.ma, xoa.loi).toBe(0);
			expect(xoa.ra).toContain(tomTat);
		},
		CHO,
	);

	test(
		"nạp hỏi ý mẫu hỏng giữa chừng: lỗi đi ra nguyên văn, bộ mẫu vừa nạp được dọn sạch, không ghi lỗi dọn",
		async () => {
			await lamSachOkr();
			const mau = congTy();
			const thanhVien = mau.nguoi.find(
				(n) => n.vai === "member" && n.ma !== mau.hoiY.nguoiChon,
			);
			if (!thanhVien) throw new Error("bộ mẫu không có thành viên thường");
			const hong = {
				...mau,
				hoiY: { ...mau.hoiY, nguoiChon: thanhVien.ma },
			};
			const ghiLoi: string[] = [];
			const goc = console.error;
			console.error = (...x: string[]) => {
				ghiLoi.push(x.join(" "));
			};
			try {
				const loi = await napBoOkrMau(db, hong, { moc: MOC_THU_NAM }).then(
					() => null,
					(e: Error) => e,
				);
				expect(loi).toBeInstanceOf(Error);
				expect(loi?.message).toBe(OKR.thongDiep.hoiY.chiQuanTri);
			} finally {
				console.error = goc;
			}
			expect({
				idMau: await tapIdMau(),
				hoiY: await db.okrHoiY.count(),
				ghiLoi,
			}).toEqual({ idMau: [], hoiY: 0, ghiLoi: [] });
		},
		CHO,
	);

	test("danh sách bảng đếm rút từ mô hình dữ liệu và chứa đủ sáu bảng hỏi ý", () => {
		expect(BANG_DEM.map((b) => b.bang)).toEqual(
			expect.arrayContaining([...SAU_BANG_HOI_Y]),
		);
	});

	test(
		"nạp lần hai: từng bảng trong sáu bảng bằng lần một, nội dung y hệt",
		async () => {
			await lamSachOkr();
			await napMau(MOC_THU_NAM);
			const mot = await demSauBang();
			const noiDung = await docY();
			expect(mot).toEqual({
				okrHoiY: KHAI.hoiY,
				okrHoiYBanTruoc: 1,
				okrY: KHAI.y,
				okrYDongY: KHAI.dongY,
				okrChuDe: KHAI.chuDe,
				okrHoiYHieu: 0,
			});
			await napMau(MOC_THU_NAM);
			expect(await demSauBang()).toEqual(mot);
			expect(await docY()).toEqual(noiDung);
			expect(await doHoiY()).toEqual(KHAI);
		},
		CHO,
	);

	test(
		"xoá bộ mẫu: sáu bảng không còn hàng mang mã thực thể mẫu, hàng ngoài bộ mẫu đứng nguyên",
		async () => {
			await lamSachOkr();
			await napMau(MOC_THU_NAM);
			const idMauSauBang = await idSauBang();
			expect(idMauSauBang.length).toBeGreaterThan(0);

			const ky = await taoNam("ngoai-hoi-y", 2033);
			const chon = await nguoiMoi("ngoai-hoi-y-chon", "admin");
			const tacGia = await nguoiMoi("ngoai-hoi-y-tac-gia", "member");
			const dongYNgoai = await nguoiMoi("ngoai-hoi-y-dong-y", "member");
			const { id: hoiYId } = ok<{ id: string }>(
				await goi(
					"okr.moHoiY",
					{
						cycleId: ky,
						cauHoi: "Hỏi ý ngoài bộ mẫu để thử xoá",
						loiMo: "",
						soLieu: [{ nhan: "Doanh thu năm", giaTri: "1 tỷ", ghiChu: "" }],
						hanLuc: new Date(Date.now() + 48 * GIO).toISOString(),
						nguoiChonUserId: chon,
					},
					await phienCua(chon),
				),
				"mo hoi y ngoai mau",
			);
			const gopY = async (cua: string, noiDung: string) =>
				ok<{ id: string }>(
					await goi(
						"okr.gopY",
						{ hoiYId, noiDung, viSao: "", doBangGi: "" },
						await phienCua(cua),
					),
					"gop y",
				).id;
			const dongY = async (cua: string, yId: string) =>
				ok(
					await goi("okr.dongY", { yId, bat: true }, await phienCua(cua)),
					"dong y",
				);
			const yNgoai = await gopY(tacGia, "Ý ngoài bộ mẫu do người ngoài góp");
			await dongY(dongYNgoai, yNgoai);
			await dongY(nguoiMau("ngo-van-toan"), yNgoai);
			const yCuaNguoiMau = await gopY(
				nguoiMau("bui-quang-huy"),
				"Ý của người mẫu góp vào lần hỏi ý ngoài bộ mẫu",
			);
			expect(await db.okrYDongY.count({ where: { yId: yNgoai } })).toBe(2);

			const chupNgoai = async () => ({
				hoiY: await db.okrHoiY.findUnique({ where: { id: hoiYId } }),
				y: await db.okrY.findUnique({ where: { id: yNgoai } }),
				dongY: await db.okrYDongY.findMany({
					where: { yId: yNgoai, userId: dongYNgoai },
				}),
			});
			const ngoai = await chupNgoai();
			expect(ngoai.hoiY).not.toBeNull();
			expect(ngoai.y).not.toBeNull();
			expect(ngoai.dongY).toHaveLength(1);
			const ids = [...(await tapIdMau()), ...idMauSauBang, yCuaNguoiMau];

			const dem = await db.$transaction((tx) => xoaTrong(tx), {
				timeout: CHO,
			});
			expect(dem).toMatchObject({
				hoiY: KHAI.hoiY,
				y: KHAI.y + 1,
				dongY: KHAI.dongY + 1,
				chuDe: KHAI.chuDe - KHAI.chuDeYLa,
				yLa: KHAI.chuDeYLa,
			});
			expect(await demSauBang()).toEqual({
				okrHoiY: 1,
				okrHoiYBanTruoc: 0,
				okrY: 1,
				okrYDongY: 1,
				okrChuDe: 0,
				okrHoiYHieu: 0,
			});
			expect(await demThamChieu(ids)).toEqual({});
			expect(await chupNgoai()).toEqual(ngoai);
			expect(
				await db.okrY.findUnique({ where: { id: yCuaNguoiMau } }),
			).toBeNull();

			await db.okrYDongY.deleteMany({ where: { yId: yNgoai } });
			await db.okrY.deleteMany({ where: { hoiYId } });
			await db.okrTrail.deleteMany({ where: { cycleId: ky } });
			await db.okrHoiY.deleteMany({ where: { id: hoiYId } });
			await db.okrCycle.deleteMany({ where: { id: ky } });
		},
		CHO,
	);

	type Tho = {
		hoiY: {
			nguoiChon: string;
			y: { ma: string; tacGia: string; gio: number }[];
			dongY: { y: string; nguoi: string }[];
			chuDe: {
				y: string[];
				ketLuan?: { loai: string; lyDo: string; noi?: string };
			}[];
		};
	};
	const ketLuanChon = (tho: Tho) =>
		tho.hoiY.chuDe.find((c) => c.ketLuan?.loai === "chon")?.ketLuan;
	const CA_HONG: { ten: string; pha: (tho: Tho) => string }[] = [
		{
			ten: "người chọn không phải quản trị",
			pha: (tho) => {
				tho.hoiY.nguoiChon = "pham-thu-trang";
				return "hoiY.nguoiChon";
			},
		},
		{
			ten: "người chọn góp ý",
			pha: (tho) => {
				const y = tho.hoiY.y[0];
				if (y) y.tacGia = tho.hoiY.nguoiChon;
				return "hoiY.y[0].tacGia";
			},
		},
		{
			ten: "một người góp bốn ý",
			pha: (tho) => {
				const dau = tho.hoiY.y[0]?.tacGia ?? "";
				for (const y of tho.hoiY.y.slice(0, 4)) y.tacGia = dau;
				return "hoiY.y[3].tacGia";
			},
		},
		{
			ten: "tác giả đồng ý ý của chính mình",
			pha: (tho) => {
				const d = tho.hoiY.dongY[0];
				const y = tho.hoiY.y.find((x) => x.ma === d?.y);
				if (d && y) d.nguoi = y.tacGia;
				return "hoiY.dongY[0]";
			},
		},
		{
			ten: "một ý nằm ở hai chủ đề",
			pha: (tho) => {
				const dau = tho.hoiY.chuDe[0]?.y[0] ?? "";
				tho.hoiY.chuDe[1]?.y.push(dau);
				return "hoiY.chuDe[1].y";
			},
		},
		{
			ten: "chủ đề chọn nối câu viết trước không có",
			pha: (tho) => {
				const k = ketLuanChon(tho);
				if (k) k.noi = "cau-5";
				return "hoiY.chuDe[0].ketLuan.noi";
			},
		},
		{
			ten: "lý do chọn quá dài cho «vì sao lúc này»",
			pha: (tho) => {
				const k = ketLuanChon(tho);
				if (k) k.lyDo = "x".repeat(501);
				return "hoiY.chuDe[0].ketLuan";
			},
		},
		{
			ten: "ý góp sau hạn",
			pha: (tho) => {
				const y = tho.hoiY.y[0];
				if (y) y.gio = OKR_MAU.hoiY.hanSauMoGio;
				return "hoiY.y[0].gio";
			},
		},
	];

	for (const ca of CA_HONG) {
		test(`tệp hỏng — ${ca.ten}: nêu đúng chỗ`, () => {
			const tho: Tho = JSON.parse(congTyChu());
			const duong = ca.pha(tho);
			expect(() => docBoOkrMau(JSON.stringify(tho))).toThrow(duong);
		});
	}
});

describe("gioi-han-duyet-mau", () => {
	const NGUOI_XEM = "tran-quoc-bao";
	const mauMt = { id: { startsWith: OKR_MAU.tienTo } } as const;
	const vetMau = { id: { startsWith: idMau("vet", "") } } as const;

	const docBo = async () => {
		const [gioiHan, choDuyet, traLai, nguoiXem, luuTru] = await Promise.all([
			db.okrObjective.findMany({
				where: { ...mauMt, hienThi: "gioi-han" },
				select: {
					id: true,
					level: true,
					departmentId: true,
					status: true,
					nguoiXem: { select: { userId: true, createdById: true } },
				},
			}),
			db.okrObjective.findMany({
				where: { ...mauMt, status: "cho-duyet" },
				select: { id: true, cycleId: true, publishedAt: true },
			}),
			db.okrTrail.findMany({
				where: { ...vetMau, action: "tra-lai" },
				select: {
					objectiveId: true,
					note: true,
					before: true,
					after: true,
					actorUserId: true,
				},
			}),
			db.okrNguoiXem.count({ where: { objectiveId: mauMt.id } }),
			db.department.findMany({
				where: { ...mauMt, archivedAt: { not: null } },
				select: {
					id: true,
					headUserId: true,
					okrObjectives: {
						select: { id: true, cycle: { select: { phase: true } } },
					},
				},
			}),
		]);
		return { gioiHan, choDuyet, traLai, nguoiXem, luuTru };
	};

	const dem = async () => ({
		nguoiXem: await db.okrNguoiXem.count({ where: { objectiveId: mauMt.id } }),
		vet: await db.okrTrail.count({ where: vetMau }),
	});

	test(
		"nạp: một mục tiêu giới hạn có một người xem, một chờ duyệt, một vết trả lại trên nháp, một phòng ban lưu trữ chỉ còn quý 3 đã khép, chương trình chưa bật duyệt, không mồ côi",
		async () => {
			await lamSachOkr();
			await napMau(MOC_THU_NAM);
			const b = await docBo();

			expect(b.gioiHan.length).toBe(1);
			expect(b.gioiHan[0]).toEqual({
				id: idMau("mt", "q4-phap-che-3"),
				level: "phong-ban",
				departmentId: idMau("pb", "phap-che"),
				status: "cong-bo",
				nguoiXem: [
					{
						userId: nguoiMau(NGUOI_XEM),
						createdById: nguoiMau("an-khanh-linh"),
					},
				],
			});
			expect(b.nguoiXem).toBe(1);
			expect(
				await db.okrAlignment.count({
					where: {
						OR: [
							{ objectiveId: idMau("mt", "q4-phap-che-3") },
							{ targetObjectiveId: idMau("mt", "q4-phap-che-3") },
							{
								targetKeyResult: { objectiveId: idMau("mt", "q4-phap-che-3") },
							},
						],
					},
				}),
			).toBe(0);
			expect(
				(
					await db.okrObjective.groupBy({
						by: ["hienThi"],
						where: mauMt,
						_count: { _all: true },
					})
				)
					.map((g) => g.hienThi)
					.sort(),
			).toEqual(["cong-khai", "gioi-han"]);

			expect(b.choDuyet).toEqual([
				{
					id: idMau("mt", "q4-kd-nam-3"),
					cycleId: CHU_KY.quy4,
					publishedAt: null,
				},
			]);
			const guiDuyet = await db.okrTrail.findMany({
				where: { ...vetMau, action: "gui-duyet" },
				select: {
					objectiveId: true,
					actorUserId: true,
					before: true,
					after: true,
				},
			});
			expect(guiDuyet.map((v) => v.objectiveId).sort()).toEqual(
				[idMau("mt", "q4-kd-nam-3"), idMau("mt", "q4-marketing-nhap")].sort(),
			);
			for (const v of guiDuyet) {
				expect(v.before).toEqual({ status: "nhap" });
				expect(v.after).toEqual({ status: "cho-duyet" });
			}

			expect(b.traLai.length).toBe(1);
			const tl = b.traLai[0];
			expect(tl?.objectiveId).toBe(idMau("mt", "q4-marketing-nhap"));
			expect(tl?.before).toEqual({ status: "cho-duyet" });
			expect(tl?.after).toEqual({ status: "nhap" });
			expect(tl?.actorUserId).toBe(nguoiMau("tran-quoc-bao"));
			expect((tl?.note ?? "").length).toBeGreaterThanOrEqual(
				OKR_HIEN_THI.lyDoTraLai.toiThieu,
			);
			expect(
				(
					await db.okrObjective.findUniqueOrThrow({
						where: { id: idMau("mt", "q4-marketing-nhap") },
					})
				).status,
			).toBe("nhap");

			expect(b.luuTru.map((d) => d.id)).toEqual(phongBanLuuTruMau);
			for (const d of b.luuTru) {
				expect(d.headUserId).toBeNull();
				expect(d.okrObjectives.length).toBeGreaterThanOrEqual(1);
				for (const o of d.okrObjectives)
					expect(o.cycle.phase, o.id).toBe("da-dong");
				expect(
					await db.orgPlacement.count({
						where: { primaryDepartmentId: d.id },
					}),
				).toBe(0);
			}

			const cookie = await ceo();
			expect(
				(await doc<{ duyetCongBo: boolean }>("okr.program", cookie))
					.duyetCongBo,
			).toBe(false);
			expect(await doc<MucMoCoi[]>("okr.moCoi", cookie, {})).toEqual([]);
		},
		CHO,
	);

	test(
		"nạp lại không nhân đôi người xem và vết mẫu; xoá để lại 0 hàng mẫu, hàng ngoài đứng nguyên",
		async () => {
			await lamSachOkr();
			await hangNgoai();
			await db.okrTrail.create({
				data: {
					id: "ngoai-mau-vet",
					actorUserId: "ngoai-mau-nguoi",
					action: "tra-lai",
					note: "vết ngoài bộ mẫu",
				},
			});
			const ngoai = await chupNgoai();
			const vetNgoai = await db.okrTrail.findUniqueOrThrow({
				where: { id: "ngoai-mau-vet" },
			});
			await napMau(MOC_THU_NAM);
			const mot = await dem();
			expect(mot).toEqual({ nguoiXem: 1, vet: 3 });
			await napMau(MOC_THU_NAM);
			expect(await dem()).toEqual(mot);
			expect(await db.okrTrail.count({ where: { action: "tra-lai" } })).toBe(2);

			const ids = await tapIdMau();
			const loi = await db
				.$transaction((tx) => xoaTrong(tx), { timeout: CHO })
				.then(
					() => "",
					(e) => String(e),
				);
			expect(loi).toBe("");
			expect(await dem()).toEqual({ nguoiXem: 0, vet: 0 });
			expect(
				await db.okrNguoiXem.count({
					where: {
						OR: [
							{ objectiveId: mauMt.id },
							{ userId: mauMt.id },
							{ createdById: mauMt.id },
						],
					},
				}),
			).toBe(0);
			expect(await demThamChieu(ids)).toEqual({});
			expect(await chupNgoai()).toEqual(ngoai);
			expect(
				await db.okrTrail.findUniqueOrThrow({ where: { id: "ngoai-mau-vet" } }),
			).toEqual(vetNgoai);
			await db.okrTrail.delete({ where: { id: "ngoai-mau-vet" } });
			await donNgoai();
		},
		CHO,
	);

	test(
		"chiều đỏ: phòng ban lưu trữ mà có mục tiêu quý 4 thì okr.moCoi trả mục đó",
		async () => {
			await lamSachOkr();
			await napMau(MOC_THU_NAM);
			const moi = idMau("mt", "q4-kho-lanh-do");
			await db.okrObjective.create({
				data: {
					id: moi,
					cycleId: CHU_KY.quy4,
					level: "phong-ban",
					departmentId: idMau("pb", "kho-lanh"),
					ownerUserId: nguoiMau("dinh-cong-son"),
					kind: "cam-ket",
					status: "cong-bo",
					title: "Mục tiêu quý 4 đặt nhầm vào phòng ban lưu trữ",
				},
			});
			const ra = await doc<MucMoCoi[]>("okr.moCoi", await ceo(), {});
			expect(ra.map((m) => m.objectiveId)).toEqual([moi]);
			expect(ra[0]?.lyDo).toEqual(["don-vi-luu-tru"]);
			await db.okrObjective.delete({ where: { id: moi } });
		},
		CHO,
	);
});

describe("okx", () => {
	const linh = () => nguoiMau("an-khanh-linh");
	const khoa = () => nguoiMau("do-minh-khoa");
	const lan = () => nguoiMau("nguyen-thi-lan");
	const NGOAI = "ngoai-mau-nguoi";
	const dongGiu = (loi: string) =>
		loi
			.split("\n")
			.map((d) => d.trim())
			.filter((d) => /^\S+\.\S+ \(\d+\)$/.test(d))
			.sort();

	async function viecMauQuaApi(tieuDe: string): Promise<string> {
		const r = await goi(
			"viec.create",
			{ tieuDe, nguoiThucHienId: khoa(), nguoiTheoDoiIds: [lan()] },
			await phienCua(khoa()),
		);
		expect(r.status, r.loi).toBe(200);
		return (r.data as { id: string }).id;
	}

	async function viecNgoai(data: {
		nguoiThucHienId?: string;
		chaId?: string;
	}): Promise<string> {
		const v = await db.viec.create({
			data: {
				tieuDe: "Việc của người ngoài",
				nguoiGiaoId: NGOAI,
				nguoiThucHienId: data.nguoiThucHienId ?? NGOAI,
				taoBoiId: NGOAI,
				chaId: data.chaId,
			},
		});
		return v.id;
	}

	async function donViecNgoai() {
		await db.viecPhuThuoc.deleteMany({ where: { taoBoiId: NGOAI } });
		await db.viec.deleteMany({
			where: { taoBoiId: NGOAI, chaId: { not: null } },
		});
		await db.viec.deleteMany({ where: { taoBoiId: NGOAI } });
		await db.tinHieu.deleteMany({ where: { nguoiGuiId: NGOAI } });
	}

	async function moi() {
		await lamSachOkr();
		await donViecNgoai();
		await xoaBoOkrMau(db);
		await hangNgoai();
		await napMau(new Date());
	}

	afterAll(async () => {
		await donViecNgoai();
		await donNgoai();
	}, CHO);

	test(
		"okx-viec: việc chung do người mẫu tạo qua API, kèm việc con của người mẫu, được dọn và nạp lại được",
		async () => {
			await moi();
			const cha = await viecMauQuaApi("Việc mẫu okx");
			const con = await viecMauQuaApi("Việc con mẫu okx");
			await db.viec.update({ where: { id: con }, data: { chaId: cha } });
			expect(
				await db.viec.count({ where: { taoBoiId: { in: [linh(), khoa()] } } }),
			).toBe(2);
			const ids = await tapIdMau();
			const r = chayLenh([OKR_MAU.co.xoa]);
			expect(r.ma, `okx-viec: xoa thoat ${r.ma} ${r.loi}`).toBe(0);
			expect(await db.viec.count({ where: { id: { in: [cha, con] } } })).toBe(
				0,
			);
			expect(
				await db.viecTheoDoi.count({ where: { viecId: { in: [cha, con] } } }),
			).toBe(0);
			expect(await demThamChieu(ids)).toEqual({});
			const lai = chayLenh([]);
			expect(lai.ma, lai.loi).toBe(0);
		},
		CHO,
	);

	test(
		"okx-tin-hieu: tín hiệu người mẫu gửi bị xoá, tín hiệu người ngoài giữ nguyên trừ cột lưu trữ",
		async () => {
			await moi();
			const cua = { muonLam: "a", daXayRa: "b", tieuDe: "c", man: "/okr" };
			const mau = await db.tinHieu.create({
				data: { ...cua, nguoiGuiId: linh() },
			});
			const ngoai = await db.tinHieu.create({
				data: { ...cua, nguoiGuiId: NGOAI, archivedById: khoa() },
			});
			const r = chayLenh([OKR_MAU.co.xoa]);
			expect(r.ma, r.loi).toBe(0);
			expect(
				await db.tinHieu.findUnique({ where: { id: mau.id } }),
				"okx-tin-hieu: con tin hieu cua nguoi mau",
			).toBeNull();
			const sau = await db.tinHieu.findUnique({ where: { id: ngoai.id } });
			expect(sau).toEqual({ ...ngoai, archivedById: null });
			await donViecNgoai();
		},
		CHO,
	);

	test(
		"okx-ngoai-giu: việc người ngoài giao cho người mẫu → mã 5, nêu viec.nguoiThucHienId, không đổi gì; đối chứng dương",
		async () => {
			await moi();
			const v = await viecNgoai({ nguoiThucHienId: linh() });
			const truoc = await vanTayKho();
			const r = chayLenh([OKR_MAU.co.xoa]);
			expect(r.ma, r.loi).toBe(OKR_MAU.ma.dangGiu);
			expect(r.loi).toContain("viec.nguoiThucHienId");
			expect(await vanTayKho()).toEqual(truoc);
			await db.viec.update({
				where: { id: v },
				data: { nguoiThucHienId: NGOAI },
			});
			const lai = chayLenh([OKR_MAU.co.xoa]);
			expect(lai.ma, lai.loi).toBe(0);
			await donViecNgoai();
		},
		CHO,
	);

	test(
		"okx-ngoai-giu-con: việc con của người ngoài dưới việc người mẫu → mã 5, nêu viec.chaId, không đổi gì",
		async () => {
			await moi();
			const cha = await viecMauQuaApi("Việc mẫu có con ngoài");
			await viecNgoai({ chaId: cha });
			const truoc = await vanTayKho();
			const r = chayLenh([OKR_MAU.co.xoa]);
			expect(r.ma, r.loi).toBe(OKR_MAU.ma.dangGiu);
			expect(r.loi).toContain("viec.chaId");
			expect(await vanTayKho()).toEqual(truoc);
			await donViecNgoai();
		},
		CHO,
	);

	test(
		"okx-ngoai-giu-phu-thuoc: phụ thuộc nối việc người mẫu với việc người ngoài → mã 5, nêu viecPhuThuoc, không đổi gì",
		async () => {
			await moi();
			const mau = await viecMauQuaApi("Việc mẫu có phụ thuộc ngoài");
			const ngoai = await viecNgoai({});
			await db.viecPhuThuoc.create({
				data: { truocId: mau, sauId: ngoai, taoBoiId: NGOAI },
			});
			const truoc = await vanTayKho();
			const r = chayLenh([OKR_MAU.co.xoa]);
			expect(r.ma, r.loi).toBe(OKR_MAU.ma.dangGiu);
			expect(r.loi).toContain("viecPhuThuoc");
			expect(await vanTayKho()).toEqual(truoc);
			await donViecNgoai();
		},
		CHO,
	);

	test(
		"okx-ngoai-giu-phu-thuoc-trong: phụ thuộc do người ngoài tạo giữa hai việc người mẫu → mã 5, nêu viecPhuThuoc.taoBoiId, không đổi gì",
		async () => {
			await moi();
			const a = await viecMauQuaApi("Việc mẫu A");
			const b = await viecMauQuaApi("Việc mẫu B");
			await db.viecPhuThuoc.create({
				data: { truocId: a, sauId: b, taoBoiId: NGOAI },
			});
			const truoc = await vanTayKho();
			const r = chayLenh([OKR_MAU.co.xoa]);
			expect(r.ma, r.loi).toBe(OKR_MAU.ma.dangGiu);
			expect(r.loi).toContain("viecPhuThuoc.taoBoiId");
			expect(await vanTayKho()).toEqual(truoc);
			await donViecNgoai();
		},
		CHO,
	);

	test(
		"okx-ten-giu: thông điệp liệt đúng tập khoá đang giữ, không in (User) trần",
		async () => {
			await moi();
			await db.deal.update({
				where: { id: "ngoai-mau-deal" },
				data: { ownerId: khoa() },
			});
			const motDeal = chayLenh([OKR_MAU.co.xoa]);
			expect(motDeal.ma, motDeal.loi).toBe(OKR_MAU.ma.dangGiu);
			expect(dongGiu(motDeal.loi)).toEqual(["deal.ownerId (1)"]);
			expect(motDeal.loi).not.toContain("(User)");
			await viecNgoai({ nguoiThucHienId: linh() });
			const hai = chayLenh([OKR_MAU.co.xoa]);
			expect(dongGiu(hai.loi)).toEqual([
				"deal.ownerId (1)",
				"viec.nguoiThucHienId (1)",
			]);
			await db.deal.update({
				where: { id: "ngoai-mau-deal" },
				data: { ownerId: NGOAI },
			});
			const motViec = chayLenh([OKR_MAU.co.xoa]);
			expect(dongGiu(motViec.loi)).toEqual(["viec.nguoiThucHienId (1)"]);
			await donViecNgoai();
		},
		CHO,
	);
});
