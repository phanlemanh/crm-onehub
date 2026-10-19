import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import type { NopTraLoiInput } from "@crm/validation/okr-tra-loi";
import { TRO_LY_OKR_HOI } from "../agent/lib/config";
import type { NguCanhPhien } from "../agent/lib/phien";
import nopTraLoi from "../agent/tools/nop_tra_loi";
import { boMau } from "./support/bo-mau";
import { moXuong } from "./support/gieo";

const { idMau, lamSachOkr, napMau, xoaBoOkrMau } = await boMau();

const MOC_MAU = new Date("2026-11-12T15:00:00+07:00");
const GIOI_HAN = idMau("mt", "q4-phap-che-3");
const THANH_VIEN = idMau("nguoi", "ngo-van-toan");
const NGUOI_XEM = idMau("nguoi", "tran-quoc-bao");

type KetQua = {
	ok: boolean;
	reason?: string;
	ma?: string;
	so?: string;
	traLoi?: { cau: { chu: string; trich: { id: string; ten: string }[] }[] };
};
type CongCu = {
	execute: (input: NopTraLoiInput, ctx: NguCanhPhien) => Promise<KetQua>;
};
const nop = nopTraLoi as unknown as CongCu;

const phien = (userId: string): NguCanhPhien => ({
	session: {
		id: `nop-tra-loi-${userId}`,
		auth: {
			initiator: {
				authenticator: "crm-okr-cua",
				principalId: userId,
				principalType: "user",
				attributes: {
					purpose: "okr-hoi",
					cuocHoiId: `cuoc-${userId}`,
					vai: "member",
				},
			},
			current: null,
		},
	},
});

const traLoi = (cau: NonNullable<NopTraLoiInput["cau"]>): NopTraLoiInput => ({
	loai: "tra-loi",
	cauHoi: "OKR này thế nào?",
	cau,
});

type MucTieuCongKhai = {
	id: string;
	ten: string;
	kr: { id: string; tienDo: string };
};

let congKhai: MucTieuCongKhai;
let krGioiHan: string;

beforeAll(async () => {
	setSystemTime();
	await moXuong();
	await lamSachOkr();
	await xoaBoOkrMau(db);
	await napMau(MOC_MAU);
	setSystemTime(MOC_MAU);
	const mt = await db.okrObjective.findFirstOrThrow({
		where: {
			hienThi: "cong-khai",
			status: "cong-bo",
			keyResults: { some: {} },
		},
		select: {
			id: true,
			title: true,
			keyResults: { select: { id: true }, take: 1 },
		},
	});
	congKhai = {
		id: mt.id,
		ten: mt.title,
		kr: { id: mt.keyResults[0]?.id ?? "", tienDo: "" },
	};
	krGioiHan = (
		await db.okrKeyResult.findFirstOrThrow({
			where: { objectiveId: GIOI_HAN },
			select: { id: true },
		})
	).id;
}, 120_000);

afterAll(async () => {
	setSystemTime();
	await xoaBoOkrMau(db);
}, 120_000);

describe("hdo nop tra loi", () => {
	const O = [
		{
			ten: "objective-xem-duoc",
			loai: "objective",
			id: () => congKhai.id,
			ok: true,
		},
		{
			ten: "objective-gioi-han",
			loai: "objective",
			id: () => GIOI_HAN,
			ok: false,
		},
		{
			ten: "objective-ma-bia",
			loai: "objective",
			id: () => "mt-bia-khong-co",
			ok: false,
		},
		{ ten: "kr-xem-duoc", loai: "kr", id: () => congKhai.kr.id, ok: true },
		{ ten: "kr-gioi-han", loai: "kr", id: () => krGioiHan, ok: false },
		{ ten: "kr-ma-bia", loai: "kr", id: () => "kr-bia-khong-co", ok: false },
	] as const;
	let soO = 0;

	for (const o of O) {
		test(`${o.ten}: ${o.ok ? "nhan" : "tu choi ca cau tra loi, neu dung ma"}`, async () => {
			const kq = await nop.execute(
				traLoi([
					{
						chu: "Đây là Mục tiêu đang hỏi.",
						trich: [{ loai: o.loai, id: o.id() }],
					},
					{
						chu: "Câu kèm theo hợp lệ.",
						trich: [{ loai: "objective", id: congKhai.id }],
					},
				]),
				phien(THANH_VIEN),
			);
			expect(kq.ok).toBe(o.ok);
			if (o.ok) expect(kq.traLoi?.cau.length).toBe(2);
			else {
				expect(kq.ma).toBe(o.id());
				expect(kq.traLoi).toBeUndefined();
			}
			soO++;
		});
	}

	test("so o bang 6", () => {
		expect(soO).toBe(O.length);
		expect(O.length).toBe(6);
	});

	test("nguoi co ten trich Muc tieu va KR gioi han duoc nhan", async () => {
		const kq = await nop.execute(
			traLoi([
				{
					chu: "Mục tiêu pháp chế này đang được theo dõi.",
					trich: [
						{ loai: "objective", id: GIOI_HAN },
						{ loai: "kr", id: krGioiHan },
					],
				},
			]),
			phien(NGUOI_XEM),
		);
		expect(kq.ok).toBe(true);
	});

	test("so khop tien do thi nhan, ten trich la ten that", async () => {
		const mt = await db.okrObjective.findUniqueOrThrow({
			where: { id: congKhai.id },
			select: {
				keyResults: {
					select: {
						id: true,
						kind: true,
						startValue: true,
						targetValue: true,
						currentValue: true,
					},
				},
			},
		});
		const k = mt.keyResults[0];
		if (!k) throw new Error("thieu kr");
		const { tienDoKr, kieuKr } = await import("@crm/validation/okr-kr");
		const p = tienDoKr(
			kieuKr.parse(k.kind),
			k.startValue.toNumber(),
			k.targetValue.toNumber(),
			k.currentValue.toNumber(),
		);
		const kq = await nop.execute(
			traLoi([{ chu: `KR này đạt ${p}%.`, trich: [{ loai: "kr", id: k.id }] }]),
			phien(THANH_VIEN),
		);
		expect(kq.ok).toBe(true);
		expect(kq.traLoi?.cau[0]?.trich[0]?.ten.length).toBeGreaterThan(0);
		const lech = await nop.execute(
			traLoi([
				{ chu: `KR này đạt ${p + 37}%.`, trich: [{ loai: "kr", id: k.id }] },
			]),
			phien(THANH_VIEN),
		);
		expect(lech.ok).toBe(false);
		expect(lech.so).toBe(String(p + 37));
	});

	test("cau tra-loi khong trich gi bi tu choi, khong-biet thi khong can trich", async () => {
		const kq = await nop.execute(
			traLoi([
				{
					chu: "Mục tiêu này đang đúng nhịp.",
					trich: [{ loai: "objective", id: congKhai.id }],
				},
				{ chu: "Phòng pháp chế đang làm rất tốt.", trich: [] },
			]),
			phien(THANH_VIEN),
		);
		expect(kq.ok).toBe(false);
		expect(kq.reason).toContain("Câu 2");
		const khongBiet = await nop.execute(
			{
				loai: "khong-biet",
				cauHoi: "OKR này thế nào?",
				cau: [{ chu: "Kara không thấy Mục tiêu nào trả lời được.", trich: [] }],
			},
			phien(THANH_VIEN),
		);
		expect(khongBiet.ok).toBe(true);
	});

	test("ngoai-pham-vi khong cau nao bi tu choi vi nguoi doc se khong thay loi chi duong", async () => {
		const rong = await nop.execute(
			{ loai: "ngoai-pham-vi", cauHoi: "Liệt kê deals của công ty", cau: [] },
			phien(THANH_VIEN),
		);
		expect(rong.ok).toBe(false);
		expect(rong.reason).toBe(TRO_LY_OKR_HOI.loiNop.ngoaiPhamViRong);
		const coCau = await nop.execute(
			{
				loai: "ngoai-pham-vi",
				cauHoi: "Liệt kê deals của công ty",
				cau: [
					{ chu: "Kara ở đây chỉ đọc OKR; hãy hỏi Kara của CRM.", trich: [] },
				],
			},
			phien(THANH_VIEN),
		);
		expect(coCau.ok).toBe(true);
	});
});
