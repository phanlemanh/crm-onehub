import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { BanNhap, MucTieuNhap } from "@crm/validation/okr-cuoc-soan";
import { noiDungSoan } from "@crm/validation/okr-tro-ly";
import { TRO_LY_OKR_SOAN } from "../agent/lib/config";
import type { KetQuaNop } from "../agent/lib/nop-ban-nhap";
import type { NguCanhPhien } from "../agent/lib/phien";
import nopBanNhap from "../agent/tools/nop_ban_nhap";
import {
	BAN_CHUONG_TRINH,
	donDep,
	gieoCuoc,
	gieoNguoi,
	moXuong,
	TIEN_TO,
} from "./support/gieo";
import { gieoCanhGoi } from "./support/gieo-goi";

type CongCu = {
	execute: (input: BanNhap, ctx: NguCanhPhien) => Promise<KetQuaNop>;
};
const nop = (input: BanNhap, ctx: NguCanhPhien) =>
	(nopBanNhap as unknown as CongCu).execute(input, ctx);

const PHIEN_1 = `${TIEN_TO}phien-1`;
const SO_NGUOI_GO = 37;

const nguCanh = (
	sessionId: string,
	userId: string,
	cuocSoanId: string,
	them: Record<string, string> = {},
): NguCanhPhien => ({
	session: {
		id: sessionId,
		auth: {
			initiator: {
				authenticator: "crm-okr-cua",
				principalId: userId,
				principalType: "user",
				attributes: { purpose: "okr-soan", cuocSoanId, vai: "member", ...them },
			},
			current: null,
		},
	},
});

let canh: Awaited<ReturnType<typeof gieoCanhGoi>>;
beforeAll(async () => {
	await moXuong();
	canh = await gieoCanhGoi({ vaiNguoiMo: "member" });
}, 60_000);
afterAll(donDep);

const mucTieu = (b: BanNhap, i: number): MucTieuNhap => {
	const m = b.mucTieu[i];
	if (!m) throw new Error(`thieu muc tieu ${i}`);
	return m;
};

function banNhapTron(
	tenCapTren: string,
	tenThanhVien: string,
	idCanChinh: string,
): BanNhap {
	return {
		mucTieu: [
			{
				khoa: "m1",
				ten: "Đối tác miền Bắc gắn bó lâu dài",
				viSaoLucNay: "Mùa Tết đối tác cân nhắc đổi nhà vận chuyển",
				loai: "cam-ket",
				viSao: "Kỳ trước trượt gia hạn",
				canChinhId: idCanChinh,
				kr: [
					{
						khoa: "k11",
						ten: "Tỷ lệ đối tác gia hạn hợp đồng",
						kieu: "tang-toi",
						donVi: "%",
						khoiDiemGoiY: canh.soChotKyTruoc,
						viSao: "Đo kết quả giữ chân",
					},
					{
						khoa: "k12",
						ten: "Số khiếu nại giao hàng",
						kieu: "giam-xuong",
						donVi: "vụ",
						viSao: "Đối trọng chất lượng",
					},
					{
						khoa: "k13",
						ten: "Đạt 100 % đối tác gia hạn",
						kieu: "tang-toi",
						donVi: "%",
						viSao: "số mới → so-moi",
					},
					{
						khoa: "k14",
						ten: "Số hợp đồng gia hạn",
						kieu: "tang-toi",
						donVi: "hợp đồng",
						dich: 25,
						viSao: "đích không trống → dich-khong-trong",
					},
				],
			},
			{
				khoa: "m2",
				ten: tenCapTren,
				viSaoLucNay: "",
				loai: "tham-vong",
				viSao: "chép cấp trên → chep-cap-tren",
				kr: [
					{
						khoa: "k21",
						ten: "Ra mắt bảng giá mới, đích: 1",
						kieu: "moc",
						donVi: "mốc",
						viSao: "mốc có đích số",
					},
					{
						khoa: "k22",
						ten: `Giao ${tenThanhVien} theo dõi đại lý`,
						kieu: "tang-toi",
						donVi: "đại lý",
						viSao: "nói về người",
					},
				],
			},
			{
				khoa: "m3",
				ten: "Kênh đại lý miền Trung có mặt",
				viSaoLucNay: "",
				loai: "tham-vong",
				viSao: "vì",
				canChinhId: "id-la",
				kr: [
					{
						khoa: "k31",
						ten: "Số đại lý mới ký",
						kieu: "tang-toi",
						donVi: "",
						viSao: "không đơn vị",
					},
					{
						khoa: "k32",
						ten: "KPI đại lý hoạt động",
						kieu: "giu-tren",
						donVi: "%",
						viSao: "từ cấm",
					},
				],
			},
		],
	};
}

const tron = () =>
	banNhapTron(
		canh.tenMucTieuCapTren,
		canh.tenThanhVien[0] ?? "",
		canh.idCapTren[0] ?? "",
	);

function banNhapLai(ten: string): BanNhap {
	const b = tron();
	return {
		mucTieu: [
			mucTieu(b, 0),
			{
				...mucTieu(b, 2),
				ten,
				canChinhId: canh.idCapTren[1] ?? null,
				kr: [
					{
						khoa: "k31",
						ten: "Số đại lý mới ký",
						kieu: "tang-toi",
						donVi: "đại lý",
						viSao: "đo",
					},
					{
						khoa: "k33",
						ten: "Tỷ lệ đại lý hoạt động",
						kieu: "giu-tren",
						donVi: "%",
						viSao: "đối trọng",
					},
				],
			},
		],
	};
}

describe("nop-ban-nhap", () => {
	test("bản nháp trộn: dòng lành cho với cuocSoanId, dòng đỏ bi-loai đúng mã, tool trả danh sách bị loại, soLuot không đổi (cửa đếm), dich luôn null", async () => {
		const truoc = await db.okrCuocSoan.findUniqueOrThrow({
			where: { id: canh.cuocSoanId },
			select: { soLuot: true },
		});
		const ra = await nop(
			tron(),
			nguCanh(PHIEN_1, canh.nguoiMo.id, canh.cuocSoanId),
		);
		expect(ra.ketQua).toBe("da-ghi");
		expect(ra.biLoai.map((b) => [b.khoa, b.maLoai]).sort()).toEqual(
			[
				["k13", "so-moi"],
				["k14", "dich-khong-trong"],
				["k21", "moc-co-dich-so"],
				["k22", "noi-ve-nguoi"],
				["k31", "khong-don-vi"],
				["k32", "tu-cam"],
				["m2", "chep-cap-tren"],
				["m3:cc", "id-ngoai-goi"],
			].sort(),
		);
		const hang = await db.okrDeXuat.findMany({
			where: { cuocSoanId: canh.cuocSoanId },
			orderBy: { createdAt: "asc" },
		});
		expect(
			hang.every(
				(h) =>
					h.dich === null &&
					h.taskId === PHIEN_1 &&
					h.objectiveId === "" &&
					h.taoRaId === null &&
					h.nguoiYeuCau === canh.nguoiMo.id &&
					h.noiDung !== null &&
					h.hienLuc === null,
			),
		).toBe(true);
		expect(hang.filter((h) => h.trangThai === "cho").length).toBe(ra.soDong);
		expect(ra.soDong).toBe(5);
		expect(
			hang
				.filter((h) => h.trangThai === "bi-loai")
				.map((h) => h.maLoai)
				.sort(),
		).toEqual(ra.biLoai.map((b) => b.maLoai).sort());
		const sau = await db.okrCuocSoan.findUniqueOrThrow({
			where: { id: canh.cuocSoanId },
			select: { soLuot: true },
		});
		expect(sau.soLuot).toBe(truoc.soLuot);
	});

	test("nộp lại dòng có khoá đã bác → bi-loai da-bac; số người gõ trong sự kiện message.received được nhận", async () => {
		const ctx = nguCanh(PHIEN_1, canh.nguoiMo.id, canh.cuocSoanId);
		const m1 = await db.okrDeXuat.findFirstOrThrow({
			where: {
				cuocSoanId: canh.cuocSoanId,
				loai: "muc-tieu-moi",
				trangThai: "cho",
			},
		});
		await db.okrDeXuat.update({
			where: { id: m1.id },
			data: {
				trangThai: "bac",
				nguoiQuyet: canh.nguoiMo.id,
				quyetLuc: new Date(),
			},
		});
		const lai = banNhapLai(`Có ${SO_NGUOI_GO} đại lý mới ở miền Trung`);
		const chuaGo = await nop(lai, ctx);
		expect(chuaGo.biLoai.find((x) => x.khoa === "m3")?.maLoai).toBe("so-moi");
		await db.agentEvent.create({
			data: {
				id: `${TIEN_TO}sk-go-1`,
				sessionId: PHIEN_1,
				type: TRO_LY_OKR_SOAN.suKien.nguoiGo,
				data: { message: `Tôi muốn ${SO_NGUOI_GO} đại lý mới` },
				emittedAt: new Date(),
			},
		});
		const ra = await nop(lai, ctx);
		expect(ra.biLoai.find((x) => x.khoa === "m1")?.maLoai).toBe("da-bac");
		expect(ra.biLoai.some((x) => x.khoa === "m3")).toBe(false);
		const canChinh = await db.okrDeXuat.findMany({
			where: { cuocSoanId: canh.cuocSoanId, loai: "can-chinh-moi" },
			select: { noiDung: true },
		});
		const dich = (khoa: string) =>
			canChinh
				.map((h) => noiDungSoan.parse(h.noiDung))
				.filter((n) => n.khoa === khoa)
				.map((n) =>
					n.loai === "can-chinh-moi"
						? [n.targetObjectiveId, n.targetKeyResultId]
						: [],
				)
				.at(-1);
		expect(dich("m1:cc")).toEqual([canh.idCapTren[0] ?? "", null]);
		expect(dich("m3:cc")).toEqual([null, canh.idCapTren[1] ?? ""]);
	});

	test("mỗi lần nộp một inputHash riêng cho mọi hàng của lần đó, kể cả hai bản giống hệt", async () => {
		const ctx = nguCanh(PHIEN_1, canh.nguoiMo.id, canh.cuocSoanId);
		const truoc = new Set(
			(
				await db.okrDeXuat.findMany({
					where: { cuocSoanId: canh.cuocSoanId },
					select: { id: true },
				})
			).map((h) => h.id),
		);
		await nop(tron(), ctx);
		await nop(tron(), ctx);
		const moi = (
			await db.okrDeXuat.findMany({
				where: { cuocSoanId: canh.cuocSoanId },
				select: { id: true, inputHash: true },
			})
		).filter((h) => !truoc.has(h.id));
		const nhom = new Map<string, number>();
		for (const h of moi)
			nhom.set(h.inputHash, (nhom.get(h.inputHash) ?? 0) + 1);
		expect(nhom.size).toBe(2);
		expect([...nhom.values()][0]).toBe([...nhom.values()][1]);
		expect(nhom.has(canh.cuocSoanId)).toBe(false);
	});

	test("dòng trùng khoá với hàng người đã nhận hay sửa → không tạo hàng mới, không đổi hàng cũ, trả giuNguyen", async () => {
		const ctx = nguCanh(PHIEN_1, canh.nguoiMo.id, canh.cuocSoanId);
		const krCho = async (ten: string) =>
			db.okrDeXuat.findFirstOrThrow({
				where: {
					cuocSoanId: canh.cuocSoanId,
					loai: "kr-moi",
					sau: ten,
					trangThai: "cho",
				},
				orderBy: { createdAt: "desc" },
			});
		const nhan = await krCho("Số khiếu nại giao hàng");
		const sua = await krCho("Tỷ lệ đối tác gia hạn hợp đồng");
		await db.okrDeXuat.update({
			where: { id: nhan.id },
			data: {
				trangThai: "nhan",
				nguoiQuyet: canh.nguoiMo.id,
				quyetLuc: new Date(),
			},
		});
		await db.okrDeXuat.update({
			where: { id: sua.id },
			data: {
				trangThai: "sua",
				giaTriCuoi: "Tỷ lệ đối tác lớn gia hạn",
				nguoiQuyet: canh.nguoiMo.id,
				quyetLuc: new Date(),
			},
		});
		const dem = (ten: string) =>
			db.okrDeXuat.count({
				where: { cuocSoanId: canh.cuocSoanId, loai: "kr-moi", sau: ten },
			});
		const truocNhan = await dem(nhan.sau ?? "");
		const truocSua = await dem(sua.sau ?? "");
		const ra = await nop(tron(), ctx);
		expect(ra.giuNguyen.map((g) => [g.khoa, g.trangThai]).sort()).toEqual([
			["k11", "sua"],
			["k12", "nhan"],
		]);
		expect(ra.biLoai.some((b) => b.khoa === "k11" || b.khoa === "k12")).toBe(
			false,
		);
		expect(await dem(nhan.sau ?? "")).toBe(truocNhan);
		expect(await dem(sua.sau ?? "")).toBe(truocSua);
		expect(
			await db.okrDeXuat.findUniqueOrThrow({ where: { id: nhan.id } }),
		).toEqual({
			...nhan,
			trangThai: "nhan",
			quyetLuc: expect.any(Date),
			nguoiQuyet: canh.nguoiMo.id,
		});
		expect(
			(await db.okrDeXuat.findUniqueOrThrow({ where: { id: sua.id } }))
				.giaTriCuoi,
		).toBe("Tỷ lệ đối tác lớn gia hạn");
	});

	test("hai dòng cùng khoá trong một bản → lỗi tool «dong trung khoa», không ghi", async () => {
		const b = tron();
		const m1 = mucTieu(b, 0);
		const trung: BanNhap = {
			mucTieu: [m1, { ...mucTieu(b, 2), khoa: "m9", ten: m1.ten }],
		};
		const truoc = await db.okrDeXuat.count({
			where: { cuocSoanId: canh.cuocSoanId },
		});
		await expect(
			nop(trung, nguCanh(PHIEN_1, canh.nguoiMo.id, canh.cuocSoanId)),
		).rejects.toThrow(`${TRO_LY_OKR_SOAN.tuChoi.dongTrungKhoa}: m9`);
		expect(
			await db.okrDeXuat.count({ where: { cuocSoanId: canh.cuocSoanId } }),
		).toBe(truoc);
	});

	test("cuocSoanId khác cuộc của phiên → từ chối 'cuoc khong thuoc phien', không ghi", async () => {
		const khac = (await gieoNguoi("Người khác")).id;
		const cuocKhac = await gieoCuoc({
			cycleId: canh.chuKy.nay,
			departmentId: canh.phong.id,
			nguoiMoUserId: khac,
		});
		const truoc = await db.okrDeXuat.count({
			where: { cuocSoanId: cuocKhac.id },
		});
		const ra = await nop(
			tron(),
			nguCanh(`${TIEN_TO}phien-2`, canh.nguoiMo.id, cuocKhac.id),
		);
		if (ra.ketQua !== "tu-choi") throw new Error("nop cho cuoc khac");
		expect(ra.lyDo).toBe(TRO_LY_OKR_SOAN.tuChoi.cuocKhongThuocPhien);
		expect(
			await db.okrDeXuat.count({ where: { cuocSoanId: cuocKhac.id } }),
		).toBe(truoc);
	});

	test("phiên không mang vai hay mục đích okr-soan → từ chối 'sai muc dich'", async () => {
		const ra = await nop(
			tron(),
			nguCanh(PHIEN_1, canh.nguoiMo.id, canh.cuocSoanId, { vai: "khach" }),
		);
		expect(ra).toMatchObject({
			ketQua: "tu-choi",
			lyDo: TRO_LY_OKR_SOAN.tuChoi.saiMucDich,
		});
	});

	test("nấc tắt (AI tắt ở cấu hình) → từ chối 'don-vi-chua-bat', không ghi", async () => {
		const ct = await db.okrProgramConfig.findUniqueOrThrow({
			where: { version: BAN_CHUONG_TRINH },
			select: { aiOn: true },
		});
		const truoc = await db.okrDeXuat.count({
			where: { cuocSoanId: canh.cuocSoanId },
		});
		await db.okrProgramConfig.update({
			where: { version: BAN_CHUONG_TRINH },
			data: { aiOn: false },
		});
		try {
			const ra = await nop(
				tron(),
				nguCanh(PHIEN_1, canh.nguoiMo.id, canh.cuocSoanId),
			);
			expect(ra).toMatchObject({
				ketQua: "tu-choi",
				lyDo: TRO_LY_OKR_SOAN.tuChoi.donViChuaBat,
			});
			expect(
				await db.okrDeXuat.count({ where: { cuocSoanId: canh.cuocSoanId } }),
			).toBe(truoc);
		} finally {
			await db.okrProgramConfig.update({
				where: { version: BAN_CHUONG_TRINH },
				data: { aiOn: ct.aiOn },
			});
		}
	});

	test("nấc bật theo danh sách bộ phận, cuộc phòng ban lưu divisionId rỗng → nấc tính theo bộ phận cha của phòng: bật bộ phận cha thì ghi, bật bộ phận khác thì từ chối", async () => {
		const ct = await db.okrProgramConfig.findUniqueOrThrow({
			where: { version: BAN_CHUONG_TRINH },
			select: { aiSoanPhamVi: true, aiSoanDonVi: true },
		});
		const cuoc = await gieoCuoc({
			cycleId: canh.chuKy.nay,
			level: "phong-ban",
			departmentId: canh.phong.id,
			nguoiMoUserId: canh.nguoiMo.id,
			sessionId: `${TIEN_TO}phien-bo-phan`,
		});
		const batCho = async (donVi: string[]) => {
			await db.okrProgramConfig.update({
				where: { version: BAN_CHUONG_TRINH },
				data: { aiSoanPhamVi: "danh-sach", aiSoanDonVi: donVi },
			});
			return nop(tron(), nguCanh(cuoc.sessionId, canh.nguoiMo.id, cuoc.id));
		};
		try {
			const cha = await batCho([canh.boPhan.id]);
			const khac = await batCho([`${TIEN_TO}bo-phan-khac`]);
			expect({
				divisionId: cuoc.divisionId,
				cha: cha.ketQua,
				khac: [khac.ketQua, khac.lyDo],
			}).toEqual({
				divisionId: null,
				cha: "da-ghi",
				khac: ["tu-choi", TRO_LY_OKR_SOAN.tuChoi.donViChuaBat],
			});
		} finally {
			await db.okrProgramConfig.update({
				where: { version: BAN_CHUONG_TRINH },
				data: { aiSoanPhamVi: ct.aiSoanPhamVi, aiSoanDonVi: ct.aiSoanDonVi },
			});
		}
	});

	test("chu kỳ rời pha lập kế hoạch → từ chối có tên, không ghi", async () => {
		const truoc = await db.okrDeXuat.count({
			where: { cuocSoanId: canh.cuocSoanId },
		});
		await db.okrCycle.update({
			where: { id: canh.chuKy.nay },
			data: { phase: "dang-chay" },
		});
		try {
			const ra = await nop(
				tron(),
				nguCanh(PHIEN_1, canh.nguoiMo.id, canh.cuocSoanId),
			);
			expect(ra).toMatchObject({
				ketQua: "tu-choi",
				lyDo: TRO_LY_OKR_SOAN.tuChoi.chuKyKhongLapKeHoach,
			});
			expect(
				await db.okrDeXuat.count({ where: { cuocSoanId: canh.cuocSoanId } }),
			).toBe(truoc);
		} finally {
			await db.okrCycle.update({
				where: { id: canh.chuKy.nay },
				data: { phase: "lap-ke-hoach" },
			});
		}
	});
});
