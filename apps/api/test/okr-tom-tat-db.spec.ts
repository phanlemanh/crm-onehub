import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { dieuKienXemMucTieu, nguCanhXemOkr } from "@crm/db/okr-hien-thi";
import {
	type BanHien,
	banTuanChoQuanTri,
	docTomTatChoNguoiXem,
	dungGoiTomTat,
	type GoiTomTat,
	ghiTomTat,
	type NguonGoi,
	TomTatDaCo,
	trangThaiTuan,
} from "@crm/db/okr-tom-tat";
import {
	MINUTE_MS,
	NGAY_MS,
	OKR_TOM_TAT,
	TRO_LY_OKR_TRAN,
} from "@crm/db/okr-tro-ly-danh-muc";
import { dauTuanVN } from "@crm/db/onboarding-nhac";
import { WORKSPACE_ID } from "@crm/db/workspace";
import type { OkrProgramSua } from "@crm/validation/okr-chuong-trinh";
import { LUAT_TOM_TAT } from "@crm/validation/okr-kiem-tom-tat";
import { parseNoiDungTomTat } from "@crm/validation/okr-tom-tat";
import type { CauTomTat } from "@crm/validation/okr-tro-ly";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { OKR_MAU } from "../scripts/okr-mau/cau-hinh";
import { idMau } from "../scripts/okr-mau/nap";
import { OkrCapNhatService } from "../src/okr/okr-cap-nhat.service";
import { congTy } from "./okr-mau-san";
import {
	batDauMau,
	CHO_DB,
	dungUngDung,
	ghiCauHinh,
	ketThucMau,
	MOC_MAU,
	nguoi,
	phienMau,
	TIEN_TO_TLO,
} from "./tro-ly-okr-san";

const KY = idMau("chu-ky", "quy4");
const KY_KHAC = idMau("chu-ky", "quy3");
const TUAN = dauTuanVN(MOC_MAU);
const LUC = new Date(MOC_MAU.getTime() + 60 * MINUTE_MS);
const SAU = (ms: number) => new Date(LUC.getTime() + ms);
const LECH_GIA_TRI = 7919;
const LAM_TRON = 10_000;

const BAT: OkrProgramSua = {
	aiOn: true,
	aiTomTatPhamVi: "toan-cong-ty",
	aiTomTatDonVi: [],
	aiTomTatAnPhamVi: "tat",
	aiTomTatAnDonVi: [],
};

const AN: OkrProgramSua = {
	aiTomTatPhamVi: "tat",
	aiTomTatAnPhamVi: "toan-cong-ty",
};

const phongMau = congTy().phongBan.map((p) => idMau("pb", p.ma));
const phongLuuTru = congTy().phongBanLuuTru.map((p) => idMau("pb", p.ma));

const vietSo = (n: number) => String(n).replace(".", ",");

const goiCua = (departmentId: string, moc = LUC) =>
	dungGoiTomTat(
		db,
		{ cycleId: KY, departmentId, tuan: TUAN, moc },
		LUAT_TOM_TAT,
	);

const mucTieuCongKhai = (departmentId: string) => ({
	cycleId: KY,
	level: "phong-ban",
	departmentId,
	status: "cong-bo",
	hienThi: "cong-khai",
});

let app: NestExpressApplication;
let cookieQuanTri = "";
const quanTri = nguoi("le-hai-dang");

type Chon = {
	a: string;
	b: string;
	c: string;
	p: string;
	q: string;
	r: string;
	s: string;
	goi: Map<string, GoiTomTat>;
	cauB: CauTomTat[];
	o1: string;
	s0Kr: string;
	xId: string;
	dId: string;
	kKr: string;
};

let chon: Chon;
let nguoiBiChan = "";

async function viecGieo(v: {
	ma: string;
	departmentId: string;
	cycleId?: string;
	trangThai: "cho" | "chay" | "xong";
}): Promise<string> {
	const hang = await db.agentTask.create({
		data: {
			kind: "okr-tom-tat-tuan",
			reason: "okr-tom-tat-tuan",
			subject: `${TIEN_TO_TLO}tt-${v.ma}`,
			budget: 0,
			dueAt: LUC,
			createdAt: LUC,
			attempts: v.trangThai === "cho" ? 0 : 1,
			startedAt: v.trangThai === "cho" ? null : LUC,
			leasedUntil: v.trangThai === "chay" ? SAU(MINUTE_MS) : null,
			finishedAt: v.trangThai === "xong" ? LUC : null,
			outcome: v.trangThai === "xong" ? "da-nop" : null,
			payload: {
				viec: "tom-tat-tuan",
				departmentId: v.departmentId,
				cycleId: v.cycleId ?? KY,
				tuan: TUAN,
				inputHash: `hash-${v.ma}`,
				nac: "bat",
			},
		},
		select: { id: true },
	});
	return hang.id;
}

function soThamChieu(goi: GoiTomTat, n: NguonGoi): number[] {
	const kr = goi.krs.find((k) => k.id === n.keyResultId);
	return [
		n.truoc,
		n.chenhLech === null ? null : Math.abs(n.chenhLech),
		n.tienDo,
		kr?.khoiDiem,
		kr?.dich,
	].flatMap((x) => (x === null || x === undefined ? [] : [x]));
}

function mucTieuCuaNguon(goi: GoiTomTat, n: NguonGoi): string {
	return goi.krs.find((k) => k.id === n.keyResultId)?.mucTieuId ?? "";
}

function motNguonMoiKr(goi: GoiTomTat): NguonGoi[] {
	const thay = new Set<string>();
	return goi.nguon.filter((n) => {
		if (thay.has(n.keyResultId)) return false;
		thay.add(n.keyResultId);
		return true;
	});
}

const TIEN_DO_DAY = 100;

function nguonTienDo(goi: GoiTomTat, krTay: ReadonlySet<string>) {
	return (n: NguonGoi) => {
		const kr = goi.krs.find((k) => k.id === n.keyResultId);
		return (
			kr !== undefined &&
			krTay.has(kr.id) &&
			(kr.kieu === "tang-toi" || kr.kieu === "giam-xuong") &&
			n.tienDo !== TIEN_DO_DAY &&
			n.tienDo !== n.giaTri &&
			!soThamChieu(goi, { ...n, tienDo: n.giaTri }).includes(n.tienDo)
		);
	};
}

function chonB(goi: GoiTomTat, krTay: ReadonlySet<string>) {
	const nguon = motNguonMoiKr(goi);
	const theoMt = new Map<string, NguonGoi[]>();
	for (const n of nguon) {
		const mt = mucTieuCuaNguon(goi, n);
		theoMt.set(mt, [...(theoMt.get(mt) ?? []), n]);
	}
	for (const [o2, ds2] of theoMt) {
		if (ds2.length < 3) continue;
		const x = ds2.find(
			(n) => n.giaTri !== 0 && !soThamChieu(goi, n).some((t) => t === n.giaTri),
		);
		if (!x) continue;
		const conLai = ds2.filter((n) => n.id !== x.id);
		const hopTienDo = nguonTienDo(goi, krTay);
		const o1 = [...theoMt.keys()].find(
			(m) => m !== o2 && (theoMt.get(m) ?? []).some(hopTienDo),
		);
		const s0 = o1 ? theoMt.get(o1)?.find(hopTienDo) : undefined;
		const [d, k] = conLai;
		if (!o1 || !s0 || !d || !k) continue;
		return { o1, s0, tienDo: s0.tienDo, x, d, k };
	}
	return null;
}

async function xoaKr(keyResultId: string): Promise<void> {
	await db.$transaction([
		db.okrCheckIn.deleteMany({ where: { keyResultId } }),
		db.okrSoChup.deleteMany({ where: { keyResultId } }),
		db.okrNguonKr.deleteMany({ where: { keyResultId } }),
		db.okrDoiDich.deleteMany({ where: { keyResultId } }),
		db.okrDiemKr.deleteMany({ where: { keyResultId } }),
		db.okrViecKr.deleteMany({ where: { keyResultId } }),
		db.okrBangChung.deleteMany({ where: { keyResultId } }),
		db.okrGhiNhan.deleteMany({ where: { keyResultId } }),
		db.okrKeyResult.delete({ where: { id: keyResultId } }),
	]);
}

function chiSoCau(ban: BanHien | null): number[] {
	if (!ban) return [-1];
	return ban.cau.map((c) => chon.cauB.findIndex((x) => x.vanBan === c.vanBan));
}

const docB = (nguoiXem: string, now = SAU(30 * MINUTE_MS)) =>
	docTomTatChoNguoiXem(
		db,
		{ cycleId: KY, departmentId: chon.b, nguoiXem, now },
		LUAT_TOM_TAT,
	);

beforeAll(async () => {
	await batDauMau();
	app = await dungUngDung();
	cookieQuanTri = await phienMau("le-hai-dang");
	await ghiCauHinh(app, cookieQuanTri, BAT);
	const goi = new Map<string, GoiTomTat>();
	for (const pb of phongMau) {
		const g = await goiCua(pb);
		if (g) goi.set(pb, g);
	}
	const krTay = new Set(
		(
			await db.okrKeyResult.findMany({
				where: { source: "tay" },
				select: { id: true },
			})
		).map((k) => k.id),
	);
	let pick: (ReturnType<typeof chonB> & { b: string }) | null = null;
	for (const [pb, g] of goi) {
		const ket = chonB(g, krTay);
		if (ket) {
			pick = { ...ket, b: pb };
			break;
		}
	}
	if (!pick) throw new Error("bo mau khong co phong du cho ca doc-hien");
	const conLai = [...goi.keys()].filter(
		(pb) =>
			pb !== pick.b && motNguonMoiKr(goi.get(pb) as GoiTomTat).length >= 2,
	);
	const [a, c, p, q, r, luuTru] = conLai;
	if (!a || !c || !p || !q || !r || !luuTru)
		throw new Error(`bo mau thieu phong co cap nhat: ${conLai.length}`);
	chon = {
		a,
		b: pick.b,
		c,
		p,
		q,
		r,
		s: luuTru,
		goi,
		cauB: [
			{ vanBan: "Phòng giữ nhịp cập nhật đều đặn.", nguon: [pick.s0.id] },
			{
				vanBan: `Chỉ số của phòng ghi nhận mức ${vietSo(pick.x.giaTri)}.`,
				nguon: [pick.x.id],
			},
			{ vanBan: "Có ghi chú mới trong tuần.", nguon: [pick.d.id] },
			{ vanBan: "Phòng có thêm cập nhật trong tuần.", nguon: [pick.k.id] },
			{
				vanBan: `Tiến độ đạt ${vietSo(pick.tienDo)}% theo lần cập nhật này.`,
				nguon: [pick.s0.id],
			},
		],
		o1: pick.o1,
		s0Kr: pick.s0.keyResultId,
		xId: pick.x.id,
		dId: pick.d.id,
		kKr: pick.k.keyResultId,
	};
}, CHO_DB);

afterAll(async () => {
	await ketThucMau(app);
}, CHO_DB);

describe("goi", () => {
	test(
		"goi-cong-khai: tập Mục tiêu và lần cập nhật trong gói bằng tập đọc thẳng; phòng lưu trữ không có gói",
		async () => {
			const tu = new Date(LUC.getTime() - OKR_TOM_TAT.cuaSoNgay * NGAY_MS);
			const lech: string[] = [];
			let khongCongKhai = 0;
			let soNguon = 0;
			for (const pb of phongMau) {
				const goi = await goiCua(pb);
				if (!goi) {
					lech.push(`${pb}:null`);
					continue;
				}
				const [thang, lanThang] = await Promise.all([
					db.okrObjective.findMany({
						where: mucTieuCongKhai(pb),
						select: { id: true },
					}),
					db.okrCheckIn.findMany({
						where: {
							keyResult: { objective: mucTieuCongKhai(pb) },
							session: { submittedAt: { gte: tu, lt: LUC } },
						},
						select: { id: true },
					}),
				]);
				khongCongKhai += await db.okrObjective.count({
					where: {
						cycleId: KY,
						departmentId: pb,
						status: "cong-bo",
						NOT: { hienThi: "cong-khai" },
					},
				});
				const tap = (ds: string[]) => [...new Set(ds)].sort().join(",");
				if (
					tap(goi.krs.map((k) => k.mucTieuId)) !== tap(thang.map((o) => o.id))
				)
					lech.push(`${pb}:muc-tieu`);
				if (tap(goi.nguon.map((n) => n.id)) !== tap(lanThang.map((l) => l.id)))
					lech.push(`${pb}:lan`);
				soNguon += goi.nguon.length;
			}
			expect(khongCongKhai).toBeGreaterThan(0);
			expect(soNguon).toBeGreaterThan(0);
			expect(
				lech.length > 0
					? `goi lech cong khai: ${lech.join(", ")}`
					: "goi khop cong khai",
			).toBe("goi khop cong khai");
			for (const pb of phongLuuTru) expect(await goiCua(pb)).toBeNull();
		},
		CHO_DB,
	);

	test(
		"goi-khong-ten: JSON gói không chứa họ tên nào của bảng thành viên; mỗi lần cập nhật mang lần trước và chênh lệch do mã tính",
		async () => {
			const ten = (
				await db.member.findMany({
					where: { organizationId: WORKSPACE_ID },
					select: { user: { select: { name: true } } },
				})
			)
				.map((m) => m.user.name.trim())
				.filter(
					(t) => t.split(/\s+/).length >= TRO_LY_OKR_TRAN.soChuHoTenToiThieu,
				);
			const lot: string[] = [];
			let soGoi = 0;
			for (const [pb, goi] of chon.goi) {
				soGoi += 1;
				const chu = JSON.stringify(goi).toLowerCase();
				for (const t of ten)
					if (chu.includes(t.toLowerCase())) lot.push(`${pb}:${t}`);
				for (const kr of goi.krs)
					for (const l of kr.lan)
						if (
							l.truoc !== null &&
							l.chenhLech !==
								Math.round((l.giaTri - l.truoc) * LAM_TRON) / LAM_TRON
						)
							lot.push(`${pb}:chenh:${l.id}`);
			}
			console.log(`goi-khong-ten: da so ${ten.length} ten tren ${soGoi} goi`);
			expect(ten.length).toBeGreaterThan(0);
			expect(soGoi).toBeGreaterThan(0);
			expect(lot).toEqual([]);
		},
		CHO_DB,
	);
});

describe("ghi", () => {
	test(
		"ghi-can-xem: ba câu lành và hai câu đỏ → cần xem, bỏ hai câu kèm mã; ghi lần hai ném TomTatDaCo",
		async () => {
			const goi = chon.goi.get(chon.a) as GoiTomTat;
			const [n1, n2] = motNguonMoiKr(goi);
			if (!n1 || !n2) throw new Error("phong a thieu nguon");
			const taskId = await viecGieo({
				ma: "a",
				departmentId: chon.a,
				trangThai: "xong",
			});
			const cau: CauTomTat[] = [
				{ vanBan: "Tuần này phòng có cập nhật đều đặn.", nguon: [n1.id] },
				{
					vanBan: `Chỉ số của phòng ghi nhận mức ${vietSo(n1.giaTri)}.`,
					nguon: [n1.id],
				},
				{
					vanBan: `Chỉ số khác ghi nhận mức ${vietSo(n2.giaTri)}.`,
					nguon: [n2.id],
				},
				{ vanBan: "Chỉ số của phòng đạt mức 987654.", nguon: [n1.id] },
				{
					vanBan: "Phòng có thêm cập nhật ngoài gói.",
					nguon: [`${TIEN_TO_TLO}khong-co`],
				},
			];
			const ket = await ghiTomTat(
				db,
				{
					taskId,
					cycleId: KY,
					departmentId: chon.a,
					tuan: TUAN,
					inputHash: "hash-a",
					nac: "bat",
					cau,
					moc: LUC,
				},
				LUAT_TOM_TAT,
			);
			expect({ trangThai: ket.trangThai, soCauBo: ket.soCauBo }).toEqual({
				trangThai: "can-xem",
				soCauBo: 2,
			});
			const hang = await db.okrTomTat.findUniqueOrThrow({
				where: { id: ket.id },
			});
			const noiDung = parseNoiDungTomTat(hang.cau);
			expect({
				trangThai: hang.trangThai,
				soCauBo: hang.soCauBo,
				nac: noiDung.nac,
				cau: noiDung.cau.map((c) => c.vanBan),
				bo: noiDung.bo.map((b) => b.maBo),
				tuan: hang.tuan.toISOString().slice(0, 10),
			}).toEqual({
				trangThai: "can-xem",
				soCauBo: 2,
				nac: "bat",
				cau: cau.slice(0, 3).map((c) => c.vanBan),
				bo: ["so-lech", "nguon-ngoai-goi"],
				tuan: TUAN,
			});
			const lai = (v: { taskId: string; tuan: string }) =>
				ghiTomTat(
					db,
					{
						...v,
						cycleId: KY,
						departmentId: chon.a,
						inputHash: "hash-a2",
						nac: "bat",
						cau: cau.slice(0, 1),
						moc: LUC,
					},
					LUAT_TOM_TAT,
				);
			const khacTask = await viecGieo({
				ma: "a2",
				departmentId: chon.a,
				trangThai: "xong",
			});
			await expect(
				lai({ taskId: khacTask, tuan: TUAN }),
			).rejects.toBeInstanceOf(TomTatDaCo);
			await expect(
				lai({ taskId, tuan: dauTuanVN(new Date(LUC.getTime() - 7 * NGAY_MS)) }),
			).rejects.toBeInstanceOf(TomTatDaCo);
			expect(
				await db.okrTomTat.count({
					where: { cycleId: KY, departmentId: chon.a },
				}),
			).toBe(1);
			await db.agentTask.delete({ where: { id: khacTask } });
		},
		CHO_DB,
	);
});

describe("trang-thai-tuan", () => {
	test(
		"trang-thai-tuan: chờ xả và đang chạy là đang soạn; việc đã đóng hay của chu kỳ khác thì không; cửa sổ không có cập nhật là chưa cập nhật",
		async () => {
			await viecGieo({ ma: "p", departmentId: chon.p, trangThai: "cho" });
			await viecGieo({ ma: "q", departmentId: chon.q, trangThai: "chay" });
			await viecGieo({ ma: "r", departmentId: chon.r, trangThai: "xong" });
			await viecGieo({
				ma: "r-ky-khac",
				departmentId: chon.r,
				cycleId: KY_KHAC,
				trangThai: "cho",
			});
			const o = (departmentId: string, now = LUC) =>
				trangThaiTuan(db, { cycleId: KY, departmentId, now }, LUAT_TOM_TAT);
			expect({
				choXa: await o(chon.p),
				dangChay: await o(chon.q),
				daDong: await o(chon.r),
				khongCapNhat: await o(chon.r, SAU(20 * NGAY_MS)),
			}).toEqual({
				choXa: { dangSoan: true, chuaCapNhat: false },
				dangChay: { dangSoan: true, chuaCapNhat: false },
				daDong: { dangSoan: false, chuaCapNhat: false },
				khongCapNhat: { dangSoan: false, chuaCapNhat: true },
			});
		},
		CHO_DB,
	);
});

describe("doc", () => {
	test(
		"doc-hien: bản hiện đọc được với mọi câu, kèm dữ liệu nguồn và số lần cập nhật",
		async () => {
			const taskId = await viecGieo({
				ma: "b",
				departmentId: chon.b,
				trangThai: "xong",
			});
			const ket = await ghiTomTat(
				db,
				{
					taskId,
					cycleId: KY,
					departmentId: chon.b,
					tuan: TUAN,
					inputHash: "hash-b",
					nac: "bat",
					cau: chon.cauB,
					moc: LUC,
				},
				LUAT_TOM_TAT,
			);
			expect(ket.trangThai).toBe("hien");
			const ban = await docB(quanTri);
			const goiB = chon.goi.get(chon.b) as GoiTomTat;
			const nguonX = goiB.nguon.find((n) => n.id === chon.xId);
			const krX = goiB.krs.find((k) => k.id === nguonX?.keyResultId);
			expect(chiSoCau(ban)).toEqual([0, 1, 2, 3, 4]);
			expect({
				id: ban?.id,
				tuan: ban?.tuan,
				soLanCapNhat: ban?.soLanCapNhat,
				phanHoiCuaToi: ban?.phanHoiCuaToi,
				nguon1: ban?.cau[1]?.nguon.map(
					(n) => `${n.id}|${n.giaTri}|${n.mucTieuId}`,
				),
			}).toEqual({
				id: ket.id,
				tuan: TUAN,
				soLanCapNhat: goiB.nguon.length,
				phanHoiCuaToi: null,
				nguon1: [`${chon.xId}|${nguonX?.giaTri}|${krX?.mucTieuId}`],
			});
			const a = await docTomTatChoNguoiXem(
				db,
				{
					cycleId: KY,
					departmentId: chon.a,
					nguoiXem: quanTri,
					now: SAU(30 * MINUTE_MS),
				},
				LUAT_TOM_TAT,
			);
			expect(a).toBeNull();
			expect(
				await docB(quanTri, SAU((OKR_TOM_TAT.hienTrongNgay + 1) * NGAY_MS)),
			).toBeNull();
		},
		CHO_DB,
	);

	test(
		"doc-tien-do-lan-dan: KR có lần cập nhật mới sau khi ghi bản thì câu nói tiến độ của lần được dẫn vẫn còn",
		async () => {
			const kr = await db.okrKeyResult.findUniqueOrThrow({
				where: { id: chon.s0Kr },
				select: { ownerUserId: true, targetValue: true, currentValue: true },
			});
			const dich = kr.targetValue.toNumber();
			const capNhat = app.get(OkrCapNhatService);
			const luc = SAU(10 * MINUTE_MS);
			const { sessionId } = await capNhat.moCapNhat(
				kr.ownerUserId,
				{ entry: "tab" },
				luc,
			);
			await capNhat.guiCapNhat(
				kr.ownerUserId,
				{
					sessionId,
					items: [
						{
							keyResultId: chon.s0Kr,
							value: dich,
							confidence: "cao",
							note: "",
						},
					],
				},
				luc,
			);
			const sau = await db.okrKeyResult.findUniqueOrThrow({
				where: { id: chon.s0Kr },
				select: { currentValue: true },
			});
			expect({
				truoc: kr.currentValue.toNumber() === dich,
				sau: sau.currentValue.toNumber(),
			}).toEqual({ truoc: false, sau: dich });
			const ca = chiSoCau(await docB(quanTri));
			expect(
				ca.includes(4) ? "tien do lan dan con" : "tien do lan dan mat: cau 4",
			).toBe("tien do lan dan con");
			expect(ca).toEqual([0, 1, 2, 3, 4]);
		},
		CHO_DB,
	);

	test(
		"doc-loc-quyen: Mục tiêu nguồn chuyển giới hạn thì người không xem được mất câu đó, quản trị vẫn thấy",
		async () => {
			await db.okrObjective.update({
				where: { id: chon.o1 },
				data: { hienThi: "gioi-han" },
			});
			const ma = congTy()
				.nguoi.map((n) => nguoi(n.ma))
				.filter((u) => u !== quanTri);
			const nc = await nguCanhXemOkr(db, ma);
			let nguoiXem: string | null = null;
			for (const u of ma) {
				const n = nc.get(u);
				if (!n || n.quanTri) continue;
				const thay = await db.okrObjective.count({
					where: { AND: [{ id: chon.o1 }, dieuKienXemMucTieu(n)] },
				});
				if (thay === 0) {
					nguoiXem = u;
					break;
				}
			}
			if (!nguoiXem) throw new Error("khong co nguoi xem bi chan");
			expect({
				nguoiXem: chiSoCau(await docB(nguoiXem)),
				quanTri: chiSoCau(await docB(quanTri)),
			}).toEqual({ nguoiXem: [1, 2, 3], quanTri: [0, 1, 2, 3, 4] });
			nguoiBiChan = nguoiXem;
		},
		CHO_DB,
	);

	test(
		"doc-sua-value: sửa giá trị lần cập nhật được dẫn thì câu mang số cũ bị bỏ lúc hiện",
		async () => {
			const lan = await db.okrCheckIn.findUniqueOrThrow({
				where: { id: chon.xId },
				select: { value: true },
			});
			await db.okrCheckIn.update({
				where: { id: chon.xId },
				data: { value: lan.value.toNumber() + LECH_GIA_TRI },
			});
			const qt = chiSoCau(await docB(quanTri));
			const nx = chiSoCau(await docB(nguoiBiChan));
			expect(
				qt.includes(1) || nx.includes(1) ? "so cu lot: cau 1" : "so cu da bo",
			).toBe("so cu da bo");
			expect({ quanTri: qt, nguoiXem: nx }).toEqual({
				quanTri: [0, 2, 3, 4],
				nguoiXem: [2, 3],
			});
		},
		CHO_DB,
	);

	test(
		"doc-xoa-lan: xoá riêng lần cập nhật được dẫn thì câu đó bị bỏ",
		async () => {
			await db.okrCheckIn.delete({ where: { id: chon.dId } });
			expect({
				quanTri: chiSoCau(await docB(quanTri)),
				nguoiXem: chiSoCau(await docB(nguoiBiChan)),
			}).toEqual({ quanTri: [0, 3, 4], nguoiXem: [3] });
		},
		CHO_DB,
	);

	test(
		"doc-xoa-kr: xoá KR nguồn thì câu đó bị bỏ; hết câu vẫn trả bản với danh sách rỗng",
		async () => {
			await xoaKr(chon.kKr);
			const nx = await docB(nguoiBiChan);
			expect({
				quanTri: chiSoCau(await docB(quanTri)),
				nguoiXem: nx === null ? null : nx.cau.length,
			}).toEqual({ quanTri: [0, 4], nguoiXem: 0 });
		},
		CHO_DB,
	);

	test(
		"doc-nac-an: bản ghi ở chế độ ẩn không hiện cho người xem",
		async () => {
			const goi = chon.goi.get(chon.c) as GoiTomTat;
			const [n] = goi.nguon;
			if (!n) throw new Error("phong c thieu nguon");
			const taskId = await viecGieo({
				ma: "c",
				departmentId: chon.c,
				trangThai: "xong",
			});
			const ket = await ghiTomTat(
				db,
				{
					taskId,
					cycleId: KY,
					departmentId: chon.c,
					tuan: TUAN,
					inputHash: "hash-c",
					nac: "an",
					cau: [{ vanBan: "Phòng giữ nhịp cập nhật đều đặn.", nguon: [n.id] }],
					moc: LUC,
				},
				LUAT_TOM_TAT,
			);
			expect(ket.trangThai).toBe("hien");
			expect(
				await docTomTatChoNguoiXem(
					db,
					{
						cycleId: KY,
						departmentId: chon.c,
						nguoiXem: quanTri,
						now: SAU(30 * MINUTE_MS),
					},
					LUAT_TOM_TAT,
				),
			).toBeNull();
		},
		CHO_DB,
	);
});

describe("hang-cu-hong", () => {
	test(
		"hang-cu-hong: một hàng cũ hỏng khuôn của tuần trước không làm hỏng bản đang đọc hay bảng quản trị",
		async () => {
			const taskId = await viecGieo({
				ma: "b-cu",
				departmentId: chon.b,
				trangThai: "xong",
			});
			await db.okrTomTat.create({
				data: {
					taskId,
					cycleId: KY,
					departmentId: chon.b,
					tuan: new Date(`${dauTuanVN(SAU(-7 * NGAY_MS))}T00:00:00.000Z`),
					cau: { nac: "bat", cau: "hong" },
					soCauBo: 0,
					trangThai: "hien",
					inputHash: "hash-b-cu",
					createdAt: SAU(-7 * NGAY_MS),
				},
			});
			const ban = await docB(quanTri);
			const qt = await banTuanChoQuanTri(
				db,
				{ cycleId: KY, now: SAU(45 * MINUTE_MS) },
				LUAT_TOM_TAT,
			);
			expect({
				cau: chiSoCau(ban),
				tuan: qt.tuan,
				b: qt.phong.find((d) => d.departmentId === chon.b)?.soCau,
			}).toEqual({ cau: [0, 4], tuan: TUAN, b: 5 });
		},
		CHO_DB,
	);
});

describe("luu-tru", () => {
	test(
		"phong-luu-tru-co-ban: phòng có bản rồi bị lưu trữ thì người xem nhận null và bảng quản trị bỏ phòng đó",
		async () => {
			const goi = chon.goi.get(chon.s) as GoiTomTat;
			const [n] = goi.nguon;
			if (!n) throw new Error("phong s thieu nguon");
			const taskId = await viecGieo({
				ma: "s",
				departmentId: chon.s,
				trangThai: "xong",
			});
			const ket = await ghiTomTat(
				db,
				{
					taskId,
					cycleId: KY,
					departmentId: chon.s,
					tuan: TUAN,
					moc: LUC,
					inputHash: "hash-s",
					nac: "bat",
					cau: [{ vanBan: "Phòng giữ nhịp cập nhật đều đặn.", nguon: [n.id] }],
				},
				LUAT_TOM_TAT,
			);
			const doc = () =>
				docTomTatChoNguoiXem(
					db,
					{
						cycleId: KY,
						departmentId: chon.s,
						nguoiXem: quanTri,
						now: SAU(45 * MINUTE_MS),
					},
					LUAT_TOM_TAT,
				);
			const coTrongQuanTri = async () =>
				(
					await banTuanChoQuanTri(
						db,
						{ cycleId: KY, now: SAU(45 * MINUTE_MS) },
						LUAT_TOM_TAT,
					)
				).phong.some((p) => p.departmentId === chon.s);
			const truoc = {
				trangThai: ket.trangThai,
				soCau: (await doc())?.cau.length ?? null,
				quanTri: await coTrongQuanTri(),
			};
			await db.department.update({
				where: { id: chon.s },
				data: { archivedAt: SAU(40 * MINUTE_MS) },
			});
			expect({
				truoc,
				sau: { ban: await doc(), quanTri: await coTrongQuanTri() },
			}).toEqual({
				truoc: { trangThai: "hien", soCau: 1, quanTri: true },
				sau: { ban: null, quanTri: false },
			});
		},
		CHO_DB,
	);
});

describe("quan-tri", () => {
	test(
		"quan-tri: mọi phòng của tuần gần nhất với nấc, trạng thái, số câu, câu bỏ; phòng lưu trữ không có dòng",
		async () => {
			const ban = await banTuanChoQuanTri(
				db,
				{ cycleId: KY, now: SAU(60 * MINUTE_MS) },
				LUAT_TOM_TAT,
			);
			const mau = ban.phong.filter((p) =>
				p.departmentId.startsWith(OKR_MAU.tienTo),
			);
			const theo = new Map(mau.map((p) => [p.departmentId, p]));
			const dong = (
				nac: string,
				trangThai: string,
				soCau: number,
				bo: number,
			) => `${nac} ${trangThai} ${soCau} ${bo}`;
			const mongDoi = new Map<string, string>([
				[chon.a, dong("bat", "can-xem", 3, 2)],
				[chon.b, dong("bat", "hien", 5, 0)],
				[chon.c, dong("an", "hien", 1, 0)],
				[chon.p, dong("bat", "dang-soan", 0, 0)],
				[chon.q, dong("bat", "dang-soan", 0, 0)],
				[chon.r, dong("bat", "khong-lam-duoc", 0, 0)],
			]);
			const thuc = phongMau.map((pb) => {
				const d = theo.get(pb);
				return `${pb}: ${d ? dong(d.nac, d.trangThai, d.soCau, d.soCauBo) : "khong co dong"}`;
			});
			const muon = phongMau.map((pb) =>
				pb === chon.s
					? `${pb}: khong co dong`
					: `${pb}: ${mongDoi.get(pb) ?? dong("bat", "chua-cap-nhat", 0, 0)}`,
			);
			expect(ban.tuan).toBe(TUAN);
			expect(thuc).toEqual(muon);
			expect(theo.get(chon.a)?.bo.map((b) => b.maBo)).toEqual([
				"so-lech",
				"nguon-ngoai-goi",
			]);
			expect({
				huuIch: theo.get(chon.b)?.huuIch,
				khong: theo.get(chon.b)?.khongHuuIch,
			}).toEqual({ huuIch: 0, khong: 0 });
			for (const pb of phongLuuTru) expect(theo.has(pb)).toBe(false);
		},
		CHO_DB,
	);

	test(
		"nac-phong-an: nấc hiện tại của phòng không còn bật thì bản bật cũng không hiện",
		async () => {
			await ghiCauHinh(app, cookieQuanTri, AN);
			expect(await docB(quanTri, SAU(90 * MINUTE_MS))).toBeNull();
		},
		CHO_DB,
	);
});
