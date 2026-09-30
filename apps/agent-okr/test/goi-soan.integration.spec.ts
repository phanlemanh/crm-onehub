import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { docCuoc } from "@crm/db/okr-cuoc-soan";
import { docTenThanhVien } from "@crm/db/okr-goi-soan";
import { chuanHoa } from "@crm/validation/okr-kiem";
import loiDanGoi from "../agent/instructions/goi";
import { TRO_LY_OKR_SOAN } from "../agent/lib/config";
import {
	catTheoThuTu,
	type GoiSoan,
	goiKiemTu,
	goiSoan,
	goiThanhChiDan,
	LOP,
	uocToken,
} from "../agent/lib/goi-soan";
import { donDep, ma, moXuong } from "./support/gieo";
import {
	CAU_CHEN,
	CHU_DE_XUAT,
	gieoCanhGoi,
	TIEN_TO_TRANG,
} from "./support/gieo-goi";

let canh: Awaited<ReturnType<typeof gieoCanhGoi>>;
let canhOkr: Awaited<ReturnType<typeof gieoCanhGoi>>;

beforeAll(async () => {
	await donDep();
	await moXuong();
	canh = await gieoCanhGoi({ vaiNguoiMo: "member" });
	canhOkr = await gieoCanhGoi({ vaiNguoiMo: "okr" });
}, 60_000);
afterAll(donDep);

const THE = TRO_LY_OKR_SOAN.goi.the;
const viTri = (chu: string, lop: string) =>
	chu.indexOf(`<${THE} lop="${lop}">`);
const goiCua = async (
	cuocSoanId: string,
	vai: "member" | "okr" = "member",
): Promise<GoiSoan> => {
	const goi = await goiSoan(cuocSoanId, { vai });
	if (!goi) throw new Error("khong dung duoc goi");
	return goi;
};

type SuKienPhien = (
	event: { type: "session.started" },
	ctx: {
		session: {
			id: string;
			auth: {
				current: null;
				initiator: { attributes: Record<string, string> } | null;
			};
		};
	},
) => Promise<{ markdown: string } | null>;

const phienBatDau = (
	loiDanGoi as unknown as { events: Record<string, SuKienPhien> }
).events;

const moPhien = (attributes: Record<string, string> | null) =>
	phienBatDau["session.started"]?.(
		{ type: "session.started" },
		{
			session: {
				id: ma(),
				auth: {
					current: null,
					initiator: attributes ? { attributes } : null,
				},
			},
		},
	);

describe("goi-soan", () => {
	test("thứ tự lớp tăng dần; mỗi lớp bọc thẻ dữ liệu kèm câu dặn", async () => {
		const chu = goiThanhChiDan(await goiCua(canh.cuocSoanId));
		const vt = LOP.map((l) => viTri(chu, l));
		expect(
			vt.every((v) => v >= 0),
			`thieu lop: ${LOP.filter((_, i) => (vt[i] ?? -1) < 0).join(",")}`,
		).toBe(true);
		for (let i = 1; i < vt.length; i += 1)
			expect(vt[i]).toBeGreaterThan(vt[i - 1] ?? 0);
		expect(
			chu.match(new RegExp(TRO_LY_OKR_SOAN.goi.cauDanDuLieu, "g"))?.length,
		).toBe(LOP.length);
		expect(chu.match(new RegExp(`</${THE}>`, "g"))?.length).toBe(LOP.length);
	});

	test("lớp 0/5 chỉ bản đang dùng của loại chien-luoc; không bản đề xuất; không quy-dinh", async () => {
		const goi = await goiCua(canh.cuocSoanId);
		expect(
			goi.lop05
				.map((t) => t.ten)
				.filter((t) => t.startsWith(TIEN_TO_TRANG))
				.sort(),
		).toEqual([...canh.tenTrangChienLuoc].sort());
		if (JSON.stringify(goi.lop05).includes(CHU_DE_XUAT))
			throw new Error("goi chua ban de xuat");
		expect(JSON.stringify(goi.lop05)).not.toContain(canh.chuQuyDinh);
		expect(JSON.stringify(goi.lop05)).toContain(CAU_CHEN);
	});

	test("lớp 1n: mô tả phòng và bộ phận, chức danh — không tên; lớp 2a: KR cấp trên có tiến độ và id, ngang cấp chỉ tên, ứng viên Căn chỉnh có id", async () => {
		const goi = await goiCua(canh.cuocSoanId);
		expect(goi.lop1.donVi.moTa).toBe(canh.moTaPhong);
		expect(goi.lop1.cha?.moTa).toBe(canh.moTaBoPhan);
		expect(goi.lop1.truong?.chucDanh).toBe(canh.chucDanhTruong);
		expect(
			goi.lop2a.capTren.every((m) =>
				m.kr.every((k) => k.tienDo === null || Number.isFinite(k.tienDo)),
			),
		).toBe(true);
		expect(goi.lop2a.ungVienCanChinh.map((u) => u.id).sort()).toEqual(
			[...canh.idCapTren].sort(),
		);
		expect(goi.lop2a.ngangCap).toEqual([canh.tenMucTieuNgangCap]);
		expect(goi.lop2a.ngangCap.join()).not.toContain("kr");
	});

	test("lớp 3 là chuỗi tóm gọn (tự tin đầu/cuối, tuần im, hai ghi chú cuối), không phải danh sách thô; lớp 4 bảy chỉ số", async () => {
		const goi = await goiCua(canh.cuocSoanId);
		const chu = goiThanhChiDan(goi);
		expect(chu).toMatch(/tự tin (cao|vừa|thấp) → (cao|vừa|thấp)/);
		expect(chu).toMatch(/im \d+ tuần/);
		expect(chu).not.toContain('"weekStart"');
		expect(goi.lop4.chiSo.length).toBe(7);
	});

	test("vai okr của phiên → lớp 4 rỗng, kể cả khi người mở trong kho là member", async () => {
		expect((await goiCua(canhOkr.cuocSoanId, "okr")).lop4.chiSo).toEqual([]);
		const cungCuoc = await goiCua(canh.cuocSoanId, "okr");
		expect(cungCuoc.lop4.chiSo, "vai lay tu kho thay vi tu phien").toEqual([]);
		expect(cungCuoc.lop1.nguoiHoi.vai).toBe("okr");
	});

	test("tập tên đối chiếu ≥ 40 rồi không tên nào trong gói; đối chứng dương bắt được tên chèn", async () => {
		const ten = await docTenThanhVien(db);
		if (ten.length < 40) throw new Error("tap ten rong");
		const goi = await goiCua(canh.cuocSoanId);
		const chu = goiThanhChiDan(goi);
		const lot = ten.filter((t) => chu.includes(t));
		expect(lot, `ten nguoi trong goi: ${lot.join(", ")}`).toEqual([]);
		const gia: GoiSoan = {
			...goi,
			lop1: {
				...goi.lop1,
				truong: { chucDanh: `Trưởng phòng ${canh.tenTruong}` },
			},
		};
		const lotGia = ten.filter((t) => goiThanhChiDan(gia).includes(t));
		expect(lotGia.length, "doi chung duong khong bat duoc ten").toBeGreaterThan(
			0,
		);
	});

	test("uocToken = ceil(ký tự ÷ hệ số); gói quá trần cắt 3-tom-gon → 3-kr → ngang-cap → 2a-kr, không đụng 0-5 và 1; bảng daCat ghi vào cuộc", async () => {
		expect(uocToken("a".repeat(26))).toBe(10);
		const goi = await goiCua(canh.cuocSoanId);
		const mau = goi.lop3.mucTieu[0];
		if (!mau) throw new Error("ky truoc rong");
		const to: GoiSoan = {
			...goi,
			lop3: {
				...goi.lop3,
				mucTieu: Array.from({ length: 40 }, (_, i) => ({
					...mau,
					ten: `MT ${i}`,
					kr: mau.kr.map((k) => ({
						...k,
						capNhat: k.capNhat.map((c) => ({
							...c,
							ghiChu: `${c.ghiChu} ${"x".repeat(300)}`,
						})),
					})),
				})),
			},
		};
		const truoc = goiThanhChiDan(to);
		expect(uocToken(truoc)).toBeGreaterThan(TRO_LY_OKR_SOAN.goi.tranTong);
		const { goi: sau, daCat } = catTheoThuTu(to);
		const chuSau = goiThanhChiDan(sau);
		expect(daCat.buoc[0]).toBe("3-tom-gon");
		expect(uocToken(chuSau)).toBeLessThanOrEqual(TRO_LY_OKR_SOAN.goi.tranTong);
		expect(daCat).toMatchObject({
			truocToken: uocToken(truoc),
			sauToken: uocToken(chuSau),
		});
		for (const lop of TRO_LY_OKR_SOAN.goi.lopKhongCat) {
			const doan = (c: string) =>
				c.slice(viTri(c, lop), c.indexOf(`</${THE}>`, viTri(c, lop)));
			expect(doan(chuSau), `cat lop cam: ${lop.replace("0-5", "5")}`).toBe(
				doan(truoc),
			);
		}
		await goiSoan(canh.cuocSoanId, { vai: "member", ghiDaCat: true });
		const cuoc = await docCuoc(db, canh.cuocSoanId);
		expect(cuoc?.daCat).toMatchObject({
			truocToken: expect.any(Number),
			sauToken: expect.any(Number),
			buoc: expect.any(Array),
		});
	});

	test("cắt đủ bốn bước theo đúng thứ tự khi ba bước đầu chưa đủ; gói dưới trần không cắt gì", async () => {
		const goi = await goiCua(canh.cuocSoanId);
		const mau = goi.lop3.mucTieu[0];
		const krTren = goi.lop2a.capTren[0]?.kr[0];
		if (!mau || !krTren) throw new Error("canh thieu du lieu");
		const to: GoiSoan = {
			...goi,
			lop2a: {
				...goi.lop2a,
				capTren: goi.lop2a.capTren.map((m, i) =>
					i === 0
						? {
								...m,
								kr: Array.from({ length: 250 }, (_, j) => ({
									...krTren,
									ten: `KR cấp trên ${j}`,
								})),
							}
						: m,
				),
				ngangCap: Array.from(
					{ length: 150 },
					(_, i) => `Mục tiêu ngang cấp số ${i} ${"y".repeat(40)}`,
				),
			},
			lop3: {
				...goi.lop3,
				mucTieu: Array.from({ length: 40 }, (_, i) => ({
					...mau,
					ten: `MT ${i}`,
				})),
			},
		};
		const { goi: sau, daCat } = catTheoThuTu(to);
		expect(daCat.buoc).toEqual([...TRO_LY_OKR_SOAN.goi.thuTuCat]);
		expect(uocToken(goiThanhChiDan(sau))).toBeLessThanOrEqual(
			TRO_LY_OKR_SOAN.goi.tranTong,
		);
		expect(sau.lop05).toEqual(goi.lop05);
		expect(sau.lop1).toEqual(goi.lop1);
		const nho = catTheoThuTu(goi);
		expect(nho.daCat.buoc).toEqual([]);
		expect(goiThanhChiDan(nho.goi)).toBe(goiThanhChiDan(goi));
	});

	test("goiKiemTu: số trong gói, id Căn chỉnh, tên thành viên, khoá đã bác đọc qua khuôn dòng soạn", async () => {
		const hang = (ten: string, trangThai: string) =>
			db.okrDeXuat.create({
				data: {
					taskId: canh.sessionId,
					objectiveId: "",
					loai: "muc-tieu-moi",
					sau: ten,
					lyDo: "vì sao",
					trangThai,
					inputHash: ma(),
					nguoiYeuCau: canh.nguoiMo.id,
					cuocSoanId: canh.cuocSoanId,
					noiDung: {
						loai: "muc-tieu-moi",
						khoa: ma().slice(-20),
						viSaoLucNay: "",
						loaiMucTieu: "cam-ket",
						canChinhId: null,
						viSao: "vì sao",
					},
				},
			});
		await hang("Mục tiêu đã bị bác", "bac");
		await hang("Mục tiêu đang chờ duyệt", "cho");
		const goi = await goiCua(canh.cuocSoanId);
		const kiem = await goiKiemTu(goi, { soNguoiGo: new Set(["7"]) });
		for (const so of ["85", "70", "18", "31", "3", "5"])
			expect(kiem.soTrongGoi.has(so), `thieu so trong goi: ${so}`).toBe(true);
		expect([...kiem.idCanChinh].sort()).toEqual([...canh.idCapTren].sort());
		expect(kiem.soNguoiGo).toEqual(new Set(["7"]));
		expect(kiem.tenThanhVien.length).toBeGreaterThanOrEqual(40);
		expect(kiem.tenCapTren).toContain("Tỷ lệ lấp đầy mùa thấp điểm");
		expect([...kiem.khoaDaBac]).toEqual([
			`muc-tieu-moi:${chuanHoa("Mục tiêu đã bị bác")}`,
		]);
	});

	test("instructions/goi: session.started đọc cuocSoanId và vai từ initiator, không đúc phiên, không có turn.started", async () => {
		expect(Object.keys(phienBatDau)).toEqual(["session.started"]);
		const cu = await docCuoc(db, canh.cuocSoanId);
		const ra = await moPhien({
			purpose: TRO_LY_OKR_SOAN.purpose,
			cuocSoanId: canh.cuocSoanId,
			vai: "member",
		});
		expect(ra?.markdown).toContain(`<${THE} lop="0-5">`);
		expect(ra?.markdown).toBe(goiThanhChiDan(await goiCua(canh.cuocSoanId)));
		const sau = await docCuoc(db, canh.cuocSoanId);
		expect(sau?.sessionId, "session.started dua phien moi").toBe(cu?.sessionId);
		expect(sau?.cacPhien).toEqual(cu?.cacPhien ?? []);
		const okr = await moPhien({
			purpose: TRO_LY_OKR_SOAN.purpose,
			cuocSoanId: canh.cuocSoanId,
			vai: "okr",
		});
		expect(okr?.markdown).toBe(
			goiThanhChiDan(await goiCua(canh.cuocSoanId, "okr")),
		);
		expect(await moPhien(null)).toBeNull();
		expect(
			await moPhien({ purpose: TRO_LY_OKR_SOAN.purpose, vai: "member" }),
		).toBeNull();
		expect(
			await moPhien({
				purpose: TRO_LY_OKR_SOAN.purpose,
				cuocSoanId: canh.cuocSoanId,
			}),
		).toBeNull();
		expect(
			await moPhien({
				purpose: TRO_LY_OKR_SOAN.purpose,
				cuocSoanId: canh.cuocSoanId,
				vai: "khach",
			}),
		).toBeNull();
	});

	test("lời dặn tĩnh: câu hỏi mở đầu đúng khuôn «1. …?» rồi «- gợi ý: A · B»; gọi nop_ban_nhap; nhắc thẻ dữ liệu", () => {
		const loiDan = readFileSync(
			join(import.meta.dir, "..", "agent", "instructions.md"),
			"utf8",
		);
		const dong = loiDan.split("\n");
		const hoi = dong.findIndex((d) => /^\s*\d+[.)]\s+(.+\?)\s*$/.test(d));
		expect(hoi, "loi dan thieu mau cau hoi danh so").toBeGreaterThanOrEqual(0);
		const goiY = dong[hoi + 1]?.match(/^\s*[-•*]?\s*gợi ý:\s*(.+)$/i)?.[1];
		expect(goiY?.split(/\s*[·|]\s*/).filter(Boolean).length).toBe(2);
		expect(loiDan).toContain("nop_ban_nhap");
		expect(loiDan).toContain(THE);
		expect(loiDan).not.toContain("nop_de_xuat");
	});
});
