import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { type GoiTomTat, ghiTomTat } from "@crm/db/okr-tom-tat";
import { MINUTE_MS, NGAY_MS, OKR_TOM_TAT } from "@crm/db/okr-tro-ly-danh-muc";
import { dauNgayVN, ngayVN } from "@crm/db/onboarding-nhac";
import type { OkrProgramSua } from "@crm/validation/okr-chuong-trinh";
import { LUAT_TOM_TAT } from "@crm/validation/okr-kiem-tom-tat";
import type { CauTomTat } from "@crm/validation/okr-tro-ly";
import { okrTroLyViec } from "@crm/validation/okr-tro-ly";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { chayXepTomTat } from "../../agent/agent/lib/okr/lich-tom-tat";
import { claimDue, completeTask } from "../../agent/agent/lib/tasks";
import { OKR } from "../src/okr/okr-config";
import {
	batDauMau,
	CHO_DB,
	datDongHo,
	dungUngDung,
	ghiCauHinh,
	ketThucMau,
	nguoi,
	tienDongHo,
} from "./tro-ly-okr-san";
import {
	type BanTra,
	cauLanh,
	cookieCua,
	type DocTra,
	type Duong,
	datGioiHan,
	docTomTat,
	donTomTat,
	ghiBan,
	goiCua,
	goiQua,
	HAI_DUONG,
	KY,
	KY_KHAC,
	LUC,
	lanTrongKho,
	motNguonMoiKr,
	mucTieuCuaNguon,
	nguoiNgoai,
	nguoiThayMucTieu,
	PHONG_UNG_VIEN,
	pb,
	phongCoNguon,
	QUAN_TRI,
	SAU,
	soThamChieu,
	thanhVienCua,
	truongCua,
	vietSo,
	xemDuocMucTieu,
} from "./tro-ly-okr-tom-tat-san";

const VAI = [
	"thanh-vien",
	"truong-phong",
	"phong-khac",
	"vai-okr",
	"quan-tri",
] as const;
type VaiXem = (typeof VAI)[number];

const BAN = ["bat-hien", "bat-can-xem", "an-hien", "phong-tat"] as const;
type LoaiBan = (typeof BAN)[number];

const CO_BAN = {
	"bat-hien": true,
	"bat-can-xem": false,
	"an-hien": false,
	"phong-tat": false,
} as const satisfies Record<LoaiBan, boolean>;

const LECH_GIA_TRI = 7919;
const PHONG_THEM = ["tai-chinh", "nhan-su", "phap-che"] as const;

type CanhDoc = {
	maPhong: Record<LoaiBan, string>;
	nguoiCua: Record<LoaiBan, ReturnType<typeof nguoiCuaPhong>>;
	o2: string;
	cauB: CauTomTat[];
	lan1: string;
	kr3: string;
	lan4: string;
};

type CanhTrangThai = {
	e: string;
	f: string;
	truongE: string;
	ngoaiE: string;
	nowXep: Date;
};

let app: NestExpressApplication;
let canh: CanhDoc;
let canhTt: CanhTrangThai;

function chonB(goi: GoiTomTat) {
	const nguon = motNguonMoiKr(goi);
	const mucTieu = [...new Set(nguon.map((n) => mucTieuCuaNguon(goi, n)))];
	for (const o2 of mucTieu) {
		const n2 = nguon.find((n) => mucTieuCuaNguon(goi, n) === o2);
		const khac = nguon.filter((n) => mucTieuCuaNguon(goi, n) !== o2);
		const c1 = khac.find(
			(n) => n.giaTri !== 0 && !soThamChieu(goi, n).includes(n.giaTri),
		);
		const [c3, c4] = khac.filter((n) => n.id !== c1?.id);
		if (n2 && c1 && c3 && c4) return { o2, n2, c1, c3, c4 };
	}
	return null;
}

function cauCuaB(ban: BanTra | null): number[] | null {
	if (!ban) return null;
	return ban.cau.map((c) => canh.cauB.findIndex((x) => x.vanBan === c.vanBan));
}

const docB = async (vai: VaiXem, duong: Duong) =>
	cauCuaB(
		(
			await docTomTat(
				app,
				duong,
				await cookieCua(canh.nguoiCua["bat-hien"][vai]),
				{ cycleId: KY, departmentId: pb(canh.maPhong["bat-hien"]) },
				`doc B ${vai} ${duong}`,
			)
		).ban,
	);

async function soSanhB(muon: Record<VaiXem, number[]>) {
	const thuc: string[] = [];
	const doi: string[] = [];
	for (const vai of VAI)
		for (const duong of HAI_DUONG) {
			thuc.push(`${vai} ${duong}: ${JSON.stringify(await docB(vai, duong))}`);
			doi.push(`${vai} ${duong}: ${JSON.stringify(muon[vai])}`);
		}
	return { thuc, doi };
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

function nguoiCuaPhong(
	ma: string,
	phongKhac: string,
	vaiOkr: string,
	thanhVien?: string,
) {
	const tv = thanhVien ?? thanhVienCua(ma)[0];
	if (!tv) throw new Error(`phong ${ma} khong co thanh vien thuong`);
	return {
		"thanh-vien": tv,
		"truong-phong": truongCua(ma),
		"phong-khac": phongKhac,
		"vai-okr": vaiOkr,
		"quan-tri": QUAN_TRI,
	};
}

function gioXepSauNgayCapNhat(thuCapNhat: number): Date {
	const THU_TRONG_TUAN = 7;
	for (let lui = 0; lui < THU_TRONG_TUAN; lui += 1) {
		const ngay = new Date(dauNgayVN(LUC).getTime() - lui * NGAY_MS);
		const thu = new Date(`${ngayVN(ngay)}T00:00:00Z`).getUTCDay();
		if (((thu + THU_TRONG_TUAN - 1) % THU_TRONG_TUAN) + 1 !== thuCapNhat)
			continue;
		return new Date(
			ngay.getTime() +
				NGAY_MS +
				OKR_TOM_TAT.gioXep.gio * 60 * MINUTE_MS +
				OKR_TOM_TAT.gioXep.phut * MINUTE_MS,
		);
	}
	throw new Error(`khong tim duoc ngay cap nhat thu ${thuCapNhat}`);
}

beforeAll(async () => {
	await batDauMau();
	await donTomTat();
	app = await dungUngDung();
	const coNguon = await phongCoNguon(1);
	let pick: { ma: string; ket: NonNullable<ReturnType<typeof chonB>> } | null =
		null;
	for (const p of coNguon) {
		const ket = chonB(p.goi);
		if (ket) {
			pick = { ma: p.ma, ket };
			break;
		}
	}
	if (!pick) throw new Error("bo mau khong co phong du cho ca doc");
	const conLai = coNguon.map((p) => p.ma).filter((m) => m !== pick.ma);
	const [c, a, d] = conLai;
	if (!c || !a || !d)
		throw new Error(`bo mau thieu phong co cap nhat: ${conLai.length}`);
	const maPhong = {
		"bat-hien": pick.ma,
		"bat-can-xem": c,
		"an-hien": a,
		"phong-tat": d,
	};
	const tatCa = Object.values(maPhong);
	const phongKhac = nguoiNgoai(tatCa, "member");
	const vaiOkr = nguoiNgoai(tatCa, "okr");
	const thay = await nguoiThayMucTieu(pick.ket.o2);
	const tvB = thanhVienCua(pick.ma).find((m) => !thay.has(nguoi(m)));
	if (!tvB) throw new Error(`phong ${pick.ma} khong co thanh vien bi chan`);
	const { c1, c3, c4, n2 } = pick.ket;
	canh = {
		maPhong,
		nguoiCua: {
			"bat-hien": nguoiCuaPhong(pick.ma, phongKhac, vaiOkr, tvB),
			"bat-can-xem": nguoiCuaPhong(c, phongKhac, vaiOkr),
			"an-hien": nguoiCuaPhong(a, phongKhac, vaiOkr),
			"phong-tat": nguoiCuaPhong(d, phongKhac, vaiOkr),
		},
		o2: pick.ket.o2,
		cauB: [
			cauLanh(0, c1.id),
			{
				vanBan: `Chỉ số của phòng ghi nhận mức ${vietSo(c1.giaTri)}.`,
				nguon: [c1.id],
			},
			cauLanh(1, n2.id),
			cauLanh(2, c3.id),
			cauLanh(3, c4.id),
		],
		lan1: c1.id,
		kr3: c3.keyResultId,
		lan4: c4.id,
	};
	const conChoTt = [
		...PHONG_UNG_VIEN.filter((m) => !tatCa.includes(m)),
		...PHONG_THEM,
	];
	const tt: string[] = [];
	for (const m of conChoTt) if (await goiCua(pb(m))) tt.push(m);
	const [e, f] = tt;
	if (!e || !f) throw new Error(`thieu phong cho trang-thai: ${tt.length}`);
	const ky = await db.okrCycle.findUniqueOrThrow({
		where: { id: KY },
		select: { updateWeekday: true },
	});
	canhTt = {
		e,
		f,
		truongE: truongCua(e),
		ngoaiE: nguoiNgoai([e], "member"),
		nowXep: gioXepSauNgayCapNhat(ky.updateWeekday),
	};
}, CHO_DB);

afterAll(async () => {
	await donTomTat();
	await ketThucMau(app);
}, CHO_DB);

describe("trang-thai", () => {
	let taskE = "";
	let oE = "";
	let banE = "";
	let tuanE = "";
	let soCauE = -1;

	const docE = async (
		ma: string,
		duong: Duong,
		v: { cycleId?: string; departmentId?: string } = {},
	): Promise<DocTra> =>
		docTomTat(
			app,
			duong,
			await cookieCua(ma),
			{
				cycleId: v.cycleId ?? KY,
				departmentId: v.departmentId ?? pb(canhTt.e),
			},
			`doc ${ma} ${duong}`,
		);

	const coDong = (t: DocTra) =>
		`ban=${t.ban === null ? "null" : `${t.ban.cau.length} cau`} dangSoan=${t.dangSoan} chuaCapNhat=${t.chuaCapNhat}`;

	test(
		"trang-thai cho-xa: việc của tuần do chayXepTomTat ghi, chưa xả → dangSoan; phòng chế độ ẩn có việc mở vẫn không có cờ nào",
		async () => {
			datDongHo(new Date(canhTt.nowXep.getTime() - 60 * MINUTE_MS));
			const sua: OkrProgramSua = {
				aiOn: true,
				aiTomTatPhamVi: "danh-sach",
				aiTomTatDonVi: [pb(canhTt.e)],
				aiTomTatAnPhamVi: "danh-sach",
				aiTomTatAnDonVi: [pb(canhTt.f)],
			};
			await ghiCauHinh(app, await cookieCua(QUAN_TRI), sua);
			datDongHo(canhTt.nowXep);
			const xep = await db.agentTask.create({
				data: {
					kind: "okr-tom-tat-xep",
					reason: "okr-tom-tat-xep",
					subject: "okr-tom-tat-xep:thu",
					budget: 0,
					dueAt: canhTt.nowXep,
					createdAt: canhTt.nowXep,
				},
				select: { id: true },
			});
			const ketQua = await chayXepTomTat(xep, canhTt.nowXep);
			const viec = await db.agentTask.findMany({
				where: { kind: "okr-tom-tat-tuan", createdAt: canhTt.nowXep },
				select: { id: true, payload: true, startedAt: true },
			});
			const phongCo = viec.map((v) => {
				const p = okrTroLyViec.parse(v.payload);
				return p.viec === "tom-tat-tuan" ? `${p.departmentId}:${p.nac}` : "";
			});
			expect({ ketQua, phongCo: [...phongCo].sort() }).toEqual({
				ketQua: "da-xep:2",
				phongCo: [`${pb(canhTt.e)}:bat`, `${pb(canhTt.f)}:an`].sort(),
			});
			taskE =
				viec.find((_, i) => phongCo[i]?.startsWith(pb(canhTt.e)))?.id ?? "";
			tienDongHo(MINUTE_MS);
			for (const duong of HAI_DUONG) {
				const t = await docE(canhTt.truongE, duong);
				expect(t.dangSoan ? "dang soan dung" : "dang soan lech: cho-xa").toBe(
					"dang soan dung",
				);
				expect(coDong(t)).toBe("ban=null dangSoan=true chuaCapNhat=false");
				const an = await docE(canhTt.truongE, duong, {
					departmentId: pb(canhTt.f),
				});
				expect(coDong(an)).toBe("ban=null dangSoan=false chuaCapNhat=false");
			}
		},
		CHO_DB,
	);

	test(
		"trang-thai dang-chay: việc đã được nhận (markRunning) vẫn là đang soạn",
		async () => {
			tienDongHo(MINUTE_MS);
			const nhan = await claimDue(10, { only: ["okr-tom-tat-tuan"] });
			expect(nhan.map((n) => n.id)).toContain(taskE);
			tienDongHo(MINUTE_MS);
			for (const duong of HAI_DUONG) {
				const t = await docE(canhTt.truongE, duong);
				expect(
					t.dangSoan ? "dang soan dung" : "dang soan lech: dang-chay",
				).toBe("dang soan dung");
				expect(coDong(t)).toBe("ban=null dangSoan=true chuaCapNhat=false");
			}
		},
		CHO_DB,
	);

	test(
		"trang-thai da-nop: đóng da-nop với bản → hết đang soạn và có bản đủ câu",
		async () => {
			const hang = await db.agentTask.findUniqueOrThrow({
				where: { id: taskE },
				select: { createdAt: true, payload: true },
			});
			const p = okrTroLyViec.parse(hang.payload);
			if (p.viec !== "tom-tat-tuan")
				throw new Error("viec E khong phai tom tat");
			const goi = await goiCua(pb(canhTt.e), hang.createdAt);
			if (!goi) throw new Error("phong E khong co goi");
			const nguon = motNguonMoiKr(goi);
			const dau = nguon[0];
			if (!dau) throw new Error("phong E khong co nguon");
			const oEBan = mucTieuCuaNguon(goi, dau);
			const cau = nguon
				.filter((n) => mucTieuCuaNguon(goi, n) === oEBan)
				.slice(0, 2)
				.map((n, i) => cauLanh(i, n.id));
			tienDongHo(MINUTE_MS);
			const ghi = await ghiTomTat(
				db,
				{
					taskId: taskE,
					cycleId: KY,
					departmentId: pb(canhTt.e),
					tuan: p.tuan,
					moc: hang.createdAt,
					inputHash: p.inputHash,
					nac: "bat",
					cau,
				},
				LUAT_TOM_TAT,
			);
			expect(ghi.trangThai).toBe("hien");
			banE = ghi.id;
			tuanE = p.tuan;
			soCauE = cau.length;
			expect(await completeTask(taskE, "da-nop")).not.toBeNull();
			tienDongHo(MINUTE_MS);
			for (const duong of HAI_DUONG) {
				const t = await docE(canhTt.truongE, duong);
				expect(coDong(t)).toBe(
					`ban=${cau.length} cau dangSoan=false chuaCapNhat=false`,
				);
				expect(t.ban?.id).toBe(ghi.id);
			}
			oE = oEBan;
		},
		CHO_DB,
	);

	test(
		"trang-thai loc-het: người xem không xem được Mục tiêu nào của các nguồn → bản khác null với danh sách câu rỗng; người xem được nhận đủ câu",
		async () => {
			tienDongHo(MINUTE_MS);
			await datGioiHan(app, oE, canhTt.truongE);
			const nhin = {
				ngoai: await xemDuocMucTieu(nguoi(canhTt.ngoaiE), oE),
				truong: await xemDuocMucTieu(nguoi(canhTt.truongE), oE),
			};
			expect(nhin).toEqual({ ngoai: false, truong: true });
			tienDongHo(MINUTE_MS);
			for (const duong of HAI_DUONG) {
				const bi = await docE(canhTt.ngoaiE, duong);
				expect(
					bi.ban === null ? "loc het thanh null" : `${bi.ban.cau.length} cau`,
				).toBe("0 cau");
				const duoc = await docE(canhTt.truongE, duong);
				expect(duoc.ban?.cau.length).toBe(soCauE);
				expect(bi.ban?.id).toBe(duoc.ban?.id ?? "khac");
			}
		},
		CHO_DB,
	);

	test(
		"trang-thai chu-ky-khac: chu kỳ không có lần cập nhật nào trong 7 ngày → chưa cập nhật, không lấy bản của chu kỳ kia",
		async () => {
			const soLan = await db.okrCheckIn.count({
				where: {
					keyResult: {
						objective: { cycleId: KY_KHAC, departmentId: pb(canhTt.e) },
					},
					createdAt: {
						gte: new Date(Date.now() - OKR_TOM_TAT.cuaSoNgay * NGAY_MS),
					},
				},
			});
			expect(soLan).toBe(0);
			for (const duong of HAI_DUONG) {
				const khac = await docE(canhTt.truongE, duong, { cycleId: KY_KHAC });
				expect(coDong(khac)).toBe("ban=null dangSoan=false chuaCapNhat=true");
				const dung = await docE(canhTt.truongE, duong);
				expect(dung.ban).not.toBeNull();
			}
		},
		CHO_DB,
	);

	const tuanSau = (tuan: string) =>
		new Date(new Date(`${tuan}T00:00:00Z`).getTime() + 7 * NGAY_MS)
			.toISOString()
			.slice(0, 10);

	const nguonE = async () => {
		const goi = await goiCua(pb(canhTt.e));
		const n = goi ? motNguonMoiKr(goi)[0] : undefined;
		if (!n) throw new Error("phong E khong co nguon");
		return n.id;
	};

	const boBan = async (id: string) => {
		const hang = await db.okrTomTat.delete({
			where: { id },
			select: { taskId: true },
		});
		await db.agentTask.delete({ where: { id: hang.taskId } });
	};

	const banLot = (t: DocTra) =>
		t.ban === null
			? "khong ban"
			: `ban tuan truoc lot: ${t.ban.id === banE ? "tuan truoc" : t.ban.id}`;

	test(
		"trang-thai tuan-moi-nhat: tuần trước có bản hiện, tuần này bản cần xem → không bản, không lùi về tuần trước; phản hồi vào bản tuần trước bị từ chối",
		async () => {
			tienDongHo(MINUTE_MS);
			const truoc = await docE(canhTt.truongE, "trpc");
			expect(truoc.ban?.id).toBe(banE);
			const moi = await ghiBan({
				ma: "e-tuan-sau",
				departmentId: pb(canhTt.e),
				nac: "bat",
				tuan: tuanSau(tuanE),
				cau: [
					{
						vanBan: "Chỉ số của phòng đạt mức 987654.",
						nguon: [await nguonE()],
					},
				],
			});
			expect(moi.trangThai).toBe("can-xem");
			tienDongHo(MINUTE_MS);
			const soHang = await db.okrTomTatPhanHoi.count({
				where: { tomTatId: banE },
			});
			for (const duong of HAI_DUONG) {
				const t = await docE(canhTt.truongE, duong);
				expect(banLot(t)).toBe("khong ban");
				expect(coDong(t)).toBe("ban=null dangSoan=false chuaCapNhat=false");
				const tra = await goiQua(
					app,
					"phanHoi",
					duong,
					{ tomTatId: banE, huuIch: true },
					await cookieCua(canhTt.truongE),
				);
				expect(`${tra.status} ${tra.loi}`).toBe(
					`404 ${OKR.thongDiep.troLy.khongCoTomTat(banE)}`,
				);
			}
			expect(
				await db.okrTomTatPhanHoi.count({ where: { tomTatId: banE } }),
			).toBe(soHang);
			await boBan(moi.id);
			tienDongHo(MINUTE_MS);
			expect((await docE(canhTt.truongE, "trpc")).ban?.id).toBe(banE);
		},
		CHO_DB,
	);

	test(
		"trang-thai chua-cap-nhat-sau-ban: bản mới nhất còn trong 8 ngày nhưng 7 ngày qua không có cập nhật → chuaCapNhat, không bản",
		async () => {
			const lan = await db.okrCheckIn.findMany({
				where: {
					keyResult: {
						objective: {
							cycleId: KY,
							departmentId: pb(canhTt.e),
							level: "phong-ban",
							status: "cong-bo",
							hienThi: "cong-khai",
						},
					},
				},
				select: {
					createdAt: true,
					session: { select: { submittedAt: true } },
				},
			});
			const cuoi = Math.max(
				...lan.map((l) => (l.session.submittedAt ?? l.createdAt).getTime()),
			);
			expect(Number.isFinite(cuoi)).toBe(true);
			datDongHo(new Date(cuoi + 6 * NGAY_MS));
			const moi = await ghiBan({
				ma: "e-chua-cap-nhat",
				departmentId: pb(canhTt.e),
				nac: "bat",
				tuan: tuanSau(tuanE),
				cau: [cauLanh(0, await nguonE())],
			});
			expect(moi.trangThai).toBe("hien");
			const lucDoc = new Date(
				cuoi + OKR_TOM_TAT.cuaSoNgay * NGAY_MS + MINUTE_MS,
			);
			datDongHo(lucDoc);
			const taoLuc = (
				await db.okrTomTat.findUniqueOrThrow({
					where: { id: moi.id },
					select: { createdAt: true },
				})
			).createdAt;
			expect(
				lucDoc.getTime() - taoLuc.getTime() <
					OKR_TOM_TAT.hienTrongNgay * NGAY_MS,
			).toBe(true);
			for (const duong of HAI_DUONG) {
				const t = await docE(canhTt.truongE, duong);
				expect(
					t.ban === null
						? "khong ban"
						: `ban cu lot khi chua cap nhat: ${t.ban.id}`,
				).toBe("khong ban");
				expect(coDong(t)).toBe("ban=null dangSoan=false chuaCapNhat=true");
			}
			await boBan(moi.id);
		},
		CHO_DB,
	);
});

describe("doc", () => {
	const banId = {} as Record<LoaiBan, string>;

	beforeAll(async () => {
		datDongHo(new Date(LUC.getTime() - 10 * MINUTE_MS));
		const { maPhong } = canh;
		await ghiCauHinh(app, await cookieCua(QUAN_TRI), {
			aiOn: true,
			aiTomTatPhamVi: "danh-sach",
			aiTomTatDonVi: [pb(maPhong["bat-hien"]), pb(maPhong["bat-can-xem"])],
			aiTomTatAnPhamVi: "danh-sach",
			aiTomTatAnDonVi: [pb(maPhong["an-hien"])],
		});
		datDongHo(SAU(MINUTE_MS));
		const nguonDau = async (ma: string) => {
			const goi = await goiCua(pb(ma));
			const n = goi ? motNguonMoiKr(goi)[0] : undefined;
			if (!n) throw new Error(`phong ${ma} khong co nguon`);
			return n;
		};
		const ghi = {
			"bat-hien": await ghiBan({
				ma: "b",
				departmentId: pb(maPhong["bat-hien"]),
				nac: "bat",
				cau: canh.cauB,
			}),
			"bat-can-xem": await ghiBan({
				ma: "c",
				departmentId: pb(maPhong["bat-can-xem"]),
				nac: "bat",
				cau: [
					cauLanh(0, (await nguonDau(maPhong["bat-can-xem"])).id),
					{
						vanBan: "Chỉ số của phòng đạt mức 987654.",
						nguon: [(await nguonDau(maPhong["bat-can-xem"])).id],
					},
				],
			}),
			"an-hien": await ghiBan({
				ma: "a",
				departmentId: pb(maPhong["an-hien"]),
				nac: "an",
				cau: [cauLanh(0, (await nguonDau(maPhong["an-hien"])).id)],
			}),
			"phong-tat": await ghiBan({
				ma: "d",
				departmentId: pb(maPhong["phong-tat"]),
				nac: "bat",
				cau: [cauLanh(0, (await nguonDau(maPhong["phong-tat"])).id)],
			}),
		};
		expect(
			Object.fromEntries(
				BAN.map((b) => [b, `${ghi[b].trangThai} bo ${ghi[b].soCauBo}`]),
			),
		).toEqual({
			"bat-hien": "hien bo 0",
			"bat-can-xem": "can-xem bo 1",
			"an-hien": "hien bo 0",
			"phong-tat": "hien bo 0",
		});
		for (const b of BAN) banId[b] = ghi[b].id;
		datDongHo(SAU(30 * MINUTE_MS));
	}, CHO_DB);

	test(
		"ma-tran: người × bản × tRPC và REST — chỉ bản nấc bật trạng thái hiện được trả, mỗi nguồn bằng hàng OkrCheckIn",
		async () => {
			const lanKho = await lanTrongKho(canh.cauB.flatMap((c) => c.nguon));
			const vanBanB = canh.cauB.map((c) => c.vanBan).sort();
			const lech = new Set<string>();
			const thuc: string[] = [];
			const muon: string[] = [];
			let soO = 0;
			let soKhangDinh = 0;
			for (const ban of BAN)
				for (const vai of VAI) {
					soO += 1;
					for (const duong of HAI_DUONG) {
						const ma = canh.nguoiCua[ban][vai];
						const o = `${vai} x ${ban} x ${duong}`;
						const t = await docTomTat(
							app,
							duong,
							await cookieCua(ma),
							{ cycleId: KY, departmentId: pb(canh.maPhong[ban]) },
							o,
						);
						soKhangDinh += 1;
						const co = t.ban !== null;
						if (co !== CO_BAN[ban]) lech.add(`o lech: ${vai} x ${ban}`);
						thuc.push(`${o}: ${co ? t.ban?.id : "khong ban"}`);
						muon.push(`${o}: ${CO_BAN[ban] ? banId[ban] : "khong ban"}`);
						if (!t.ban || !CO_BAN[ban]) continue;
						thuc.push(
							`${o} cau: ${t.ban.cau
								.map((c) => c.vanBan)
								.sort()
								.join(" | ")}`,
						);
						muon.push(`${o} cau: ${vanBanB.join(" | ")}`);
						for (const c of t.ban.cau)
							for (const n of c.nguon) {
								thuc.push(
									`${o} nguon ${n.id}: ${n.keyResultId} ${n.ngay} ${n.giaTri} ${n.tuTin} ${JSON.stringify(n.ghiChu)}`,
								);
								const k = lanKho.get(n.id);
								muon.push(
									`${o} nguon ${n.id}: ${k?.keyResultId} ${k?.ngay} ${k?.giaTri} ${k?.tuTin} ${JSON.stringify(k?.ghiChu)}`,
								);
							}
					}
				}
			console.log(
				`ma-tran: ${soO} o x ${HAI_DUONG.length} duong = ${soKhangDinh} khang dinh`,
			);
			expect(soKhangDinh).toBe(BAN.length * VAI.length * HAI_DUONG.length);
			expect(lech.size > 0 ? [...lech].join("; ") : "ma tran khop").toBe(
				"ma tran khop",
			);
			expect(thuc).toEqual(muon);
		},
		CHO_DB,
	);

	test(
		"loc-quyen: Mục tiêu nguồn của câu 2 chuyển giới hạn → người không xem được mất câu 2, câu khác còn; trưởng phòng và quản trị vẫn thấy",
		async () => {
			tienDongHo(MINUTE_MS);
			await datGioiHan(app, canh.o2, canh.nguoiCua["bat-hien"]["truong-phong"]);
			const BI_CHAN: readonly VaiXem[] = [
				"thanh-vien",
				"phong-khac",
				"vai-okr",
			];
			const nhin: string[] = [];
			for (const vai of VAI)
				nhin.push(
					`${vai}: ${await xemDuocMucTieu(nguoi(canh.nguoiCua["bat-hien"][vai]), canh.o2)}`,
				);
			expect(nhin).toEqual(VAI.map((v) => `${v}: ${!BI_CHAN.includes(v)}`));
			tienDongHo(MINUTE_MS);
			const lot: string[] = [];
			for (const vai of BI_CHAN)
				for (const duong of HAI_DUONG)
					if ((await docB(vai, duong))?.includes(2))
						lot.push(`cau lot quyen: ${vai} x cau 2`);
			expect(lot.length > 0 ? [...new Set(lot)].join("; ") : "khong lot").toBe(
				"khong lot",
			);
			const day = [0, 1, 2, 3, 4];
			const { thuc, doi } = await soSanhB({
				"thanh-vien": [0, 1, 3, 4],
				"truong-phong": day,
				"phong-khac": [0, 1, 3, 4],
				"vai-okr": [0, 1, 3, 4],
				"quan-tri": day,
			});
			expect(thuc).toEqual(doi);
		},
		CHO_DB,
	);

	test(
		"sua-value: sửa thẳng giá trị lần cập nhật nguồn câu 1 → câu 1 vắng, câu khác còn",
		async () => {
			const lan = await db.okrCheckIn.findUniqueOrThrow({
				where: { id: canh.lan1 },
				select: { value: true },
			});
			await db.okrCheckIn.update({
				where: { id: canh.lan1 },
				data: { value: lan.value.toNumber() + LECH_GIA_TRI },
			});
			const lot: string[] = [];
			for (const vai of VAI)
				for (const duong of HAI_DUONG)
					if ((await docB(vai, duong))?.includes(1))
						lot.push("so cu lot: cau 1");
			expect(lot[0] ?? "so cu da bo").toBe("so cu da bo");
			const { thuc, doi } = await soSanhB({
				"thanh-vien": [0, 3, 4],
				"truong-phong": [0, 2, 3, 4],
				"phong-khac": [0, 3, 4],
				"vai-okr": [0, 3, 4],
				"quan-tri": [0, 2, 3, 4],
			});
			expect(thuc).toEqual(doi);
		},
		CHO_DB,
	);

	test(
		"xoa-kr: xoá thẳng KR nguồn câu 3 → câu 3 vắng",
		async () => {
			await xoaKr(canh.kr3);
			const { thuc, doi } = await soSanhB({
				"thanh-vien": [0, 4],
				"truong-phong": [0, 2, 4],
				"phong-khac": [0, 4],
				"vai-okr": [0, 4],
				"quan-tri": [0, 2, 4],
			});
			expect(thuc).toEqual(doi);
		},
		CHO_DB,
	);

	test(
		"xoa-lan: xoá thẳng riêng lần cập nhật nguồn câu 4, giữ KR → câu 4 vắng",
		async () => {
			const kr = await db.okrCheckIn.findUniqueOrThrow({
				where: { id: canh.lan4 },
				select: { keyResultId: true },
			});
			await db.okrCheckIn.delete({ where: { id: canh.lan4 } });
			expect(
				await db.okrKeyResult.count({ where: { id: kr.keyResultId } }),
			).toBe(1);
			const { thuc, doi } = await soSanhB({
				"thanh-vien": [0],
				"truong-phong": [0, 2],
				"phong-khac": [0],
				"vai-okr": [0],
				"quan-tri": [0, 2],
			});
			expect(thuc).toEqual(doi);
		},
		CHO_DB,
	);
});
