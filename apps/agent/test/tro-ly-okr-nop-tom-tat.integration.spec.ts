import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { dungGoiTomTat } from "@crm/db/okr-tom-tat";
import { dauTuanVN } from "@crm/db/onboarding-nhac";
import {
	OKR_PROGRAM_MAC_DINH,
	type OkrProgramSua,
	okrProgram,
} from "@crm/validation/okr-chuong-trinh";
import { LUAT_TOM_TAT } from "@crm/validation/okr-kiem-tom-tat";
import { parseNoiDungTomTat } from "@crm/validation/okr-tom-tat";
import {
	type CauTomTat,
	type DongDeXuat,
	ketQuaTroLy,
	okrTroLyViec,
} from "@crm/validation/okr-tro-ly";
import { OKR_MAU } from "../../api/scripts/okr-mau/cau-hinh";
import { idMau, xoaBoOkrMau } from "../../api/scripts/okr-mau/nap";
import { lamSachOkr, napMau } from "../../api/test/okr-mau-san";
import hookGoc from "../agent/hooks/okr-uy-quyen";
import { MUC_TOM_TAT } from "../agent/lib/okr/chi-dan-tom-tat";
import { goiTomTatThanhChiDan } from "../agent/lib/okr/goi-ngu-canh";
import { chayXepTomTat } from "../agent/lib/okr/lich-tom-tat";
import { ketThucTuKetQua } from "../agent/lib/okr/uy-quyen";
import { okrAuthAttributes } from "../agent/lib/okr/viec";
import { completeTask, noteSession } from "../agent/lib/tasks";
import chiDanViec from "../agent/subagents/tro_ly_okr/instructions/viec";
import nopDeXuat from "../agent/subagents/tro_ly_okr/tools/nop_de_xuat";
import nopTomTat from "../agent/subagents/tro_ly_okr/tools/nop_tom_tat";
import type { GiaiChiDan, XuLyKetQuaHanhDong } from "./support/eve-kieu";
import { moXuong } from "./support/nhac-gieo";
import {
	moViecDeXuat,
	type NguCanhCon,
	nguCanhCon,
	type ViecMo,
} from "./support/tro-ly-phien-con";

const CHO_DB = 120_000;
const TIEN_TO = `ntt-${(process.env.TEST_RUN_ID ?? "").slice(0, 8)}-`;
const MOC_MAU = new Date("2026-11-12T15:00:00+07:00");
const LUC_XEP = new Date("2026-11-24T06:00:00+07:00");
const LUC_CAP = new Date("2026-11-23T18:00:00+07:00");
const DONG_HO = new Date("2026-11-24T07:00:00+07:00");
const TOM_TAT = "okr-tom-tat-tuan";
const XEP = "okr-tom-tat-xep";
const KY = idMau("chu-ky", "quy4");
const PHONG = { a: "phap-che", b: "tai-chinh", ngoai: "kd-bac" } as const;
const NGUOI_GHI = idMau("nguoi", "an-khanh-linh");
const khoaCu = process.env.AI_GATEWAY_API_KEY;

type NopTomTatRa = {
	ketQua: string;
	lyDo: string;
	soCau: number;
	soBo: number;
};
type CongCuTomTat = {
	execute: (
		input: { cau: CauTomTat[] },
		ctx: NguCanhCon,
	) => Promise<NopTomTatRa>;
};
type CongCuDeXuat = {
	execute: (
		input: { dong: DongDeXuat[] },
		ctx: NguCanhCon,
	) => Promise<{ ketQua: string }>;
};

type ViecTomTat = ViecMo & { createdAt: Date; nac: string };

const pb = (ma: string) => idMau("pb", ma);

const khongDau = (chu: string) =>
	chu
		.normalize("NFD")
		.replace(/\p{M}/gu, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.toLowerCase();

let viecA: ViecTomTat;
let viecB: ViecTomTat;
let viecDeXuat: ViecMo;
let lanA1 = "";
let lanA2 = "";
let lanNgoai = "";

async function ghiCauHinh(sua: OkrProgramSua, lucGhi: Date): Promise<void> {
	const cu = await db.okrProgramConfig.findFirst({
		orderBy: { version: "desc" },
	});
	const truoc = cu
		? okrProgram.parse({ ...cu, aiTranThangUsd: cu.aiTranThangUsd.toNumber() })
		: OKR_PROGRAM_MAC_DINH;
	const moi = okrProgram.parse({ ...truoc, ...sua });
	await db.okrProgramConfig.create({
		data: {
			...moi,
			version: (cu?.version ?? 0) + 1,
			createdById: NGUOI_GHI,
			createdAt: lucGhi,
		},
	});
}

async function krMau(ma: string): Promise<string> {
	const kr = await db.okrKeyResult.findUniqueOrThrow({
		where: { id: idMau("kr", ma) },
		select: { id: true },
	});
	return kr.id;
}

async function capNhat(
	krMa: string,
	giaTri: number,
	tuTin: string,
	ghiChu: string,
): Promise<string> {
	const kr = await db.okrKeyResult.findUniqueOrThrow({
		where: { id: await krMau(krMa) },
		select: { id: true, ownerUserId: true },
	});
	const phien = await db.okrCheckInSession.create({
		data: {
			userId: kr.ownerUserId,
			entry: "web",
			openedAt: LUC_CAP,
			submittedAt: LUC_CAP,
			seconds: 30,
		},
	});
	const lan = await db.okrCheckIn.create({
		data: {
			keyResultId: kr.id,
			sessionId: phien.id,
			weekStart: new Date(`${dauTuanVN(LUC_CAP)}T00:00:00Z`),
			value: giaTri,
			confidence: tuTin,
			note: ghiChu,
			authorUserId: kr.ownerUserId,
			ownerUserId: kr.ownerUserId,
			createdAt: LUC_CAP,
		},
	});
	await db.okrKeyResult.update({
		where: { id: kr.id },
		data: { currentValue: giaTri },
	});
	return lan.id;
}

async function viecTomTatCua(ma: string): Promise<ViecTomTat> {
	const ds = await db.agentTask.findMany({
		where: { kind: TOM_TAT, finishedAt: null },
		select: { id: true, payload: true, createdAt: true },
	});
	const hang = ds.find((h) => {
		const p = okrTroLyViec.parse(h.payload);
		return (
			p.viec === "tom-tat-tuan" && p.departmentId === pb(ma) && p.cycleId === KY
		);
	});
	if (!hang) throw new Error(`chayXepTomTat khong xep viec cho ${ma}`);
	const p = okrTroLyViec.parse(hang.payload);
	const phienGoc = `${TIEN_TO}goc-${hang.id}`;
	await noteSession(hang.id, phienGoc);
	return {
		taskId: hang.id,
		phienGoc,
		createdAt: hang.createdAt,
		nac: p.viec === "tom-tat-tuan" ? p.nac : "",
	};
}

const nop = (viec: ViecMo, cau: CauTomTat[]) =>
	(nopTomTat as unknown as CongCuTomTat).execute(
		{ cau },
		nguCanhCon(viec.phienGoc),
	);

async function goiCua(viec: ViecTomTat, ma: string) {
	return dungGoiTomTat(
		db,
		{
			cycleId: KY,
			departmentId: pb(ma),
			tuan: dauTuanVN(new Date(LUC_XEP.getTime() - 1)),
			moc: viec.createdAt,
		},
		LUAT_TOM_TAT,
	);
}

async function hangTomTat(taskId: string) {
	return db.okrTomTat.findMany({ where: { taskId } });
}

beforeAll(async () => {
	process.env.AI_GATEWAY_API_KEY = "khoa-thu";
	setSystemTime();
	await moXuong();
	await lamSachOkr();
	await db.agentTask.deleteMany({ where: { kind: { in: [XEP, TOM_TAT] } } });
	await db.okrProgramConfig.deleteMany({
		where: { createdById: { startsWith: OKR_MAU.tienTo } },
	});
	await xoaBoOkrMau(db);
	await napMau(MOC_MAU);
	await ghiCauHinh(
		{
			aiOn: true,
			aiDeXuatPhamVi: "toan-cong-ty",
			aiTomTatPhamVi: "danh-sach",
			aiTomTatDonVi: [pb(PHONG.a), pb(PHONG.b)],
		},
		new Date("2026-11-20T00:00:00+07:00"),
	);
	lanA1 = await capNhat(
		"q4-phap-che-1-k2",
		45,
		"vua",
		"Đã áp mẫu chuẩn cho hợp đồng mùa Tết.",
	);
	lanA2 = await capNhat(
		"q4-phap-che-2-k2",
		28,
		"thap",
		"Nhiều câu hỏi mới về hợp đồng hàng lạnh.",
	);
	await capNhat("q4-phap-che-3-k1", 3, "vua", "Còn ba vụ đang thương lượng.");
	await capNhat("q4-tai-chinh-1-k1", 12, "cao", "");
	lanNgoai = await capNhat("q4-kd-bac-1-k1", 7, "vua", "");
	const xep = await db.agentTask.create({
		data: {
			kind: XEP,
			reason: XEP,
			subject: `${TIEN_TO}xep`,
			budget: 0,
			dueAt: LUC_XEP,
		},
		select: { id: true },
	});
	const ketQua = await chayXepTomTat(xep, LUC_XEP);
	if (ketQua !== "da-xep:2") throw new Error(`xep ra ${ketQua}`);
	viecA = await viecTomTatCua(PHONG.a);
	viecB = await viecTomTatCua(PHONG.b);
	setSystemTime(DONG_HO);
	viecDeXuat = await moViecDeXuat({
		objectiveId: idMau("mt", "q4-phap-che-1"),
		nguoiYeuCau: NGUOI_GHI,
	});
}, CHO_DB);

afterAll(async () => {
	setSystemTime();
	await db.okrTomTat.deleteMany({
		where: { taskId: { in: [viecA?.taskId, viecB?.taskId].filter(Boolean) } },
	});
	await db.agentTask.deleteMany({
		where: { kind: { in: [XEP, TOM_TAT, "okr-de-xuat"] } },
	});
	await db.okrProgramConfig.deleteMany({
		where: { createdById: { startsWith: OKR_MAU.tienTo } },
	});
	await lamSachOkr();
	await xoaBoOkrMau(db);
	if (khoaCu === undefined) delete process.env.AI_GATEWAY_API_KEY;
	else process.env.AI_GATEWAY_API_KEY = khoaCu;
}, CHO_DB);

describe("goi", () => {
	test(
		"tap Muc tieu cua goi bang tap Muc tieu cong khai da cong bo cua phong trong chu ky; goi khong chua ho ten thanh vien",
		async () => {
			const goi = await goiCua(viecA, PHONG.a);
			if (!goi) throw new Error("goi rong cho phong a");
			const trongGoi = [...new Set(goi.krs.map((k) => k.mucTieuId))].sort();
			const dieuKien = {
				cycleId: KY,
				level: "phong-ban",
				departmentId: pb(PHONG.a),
				status: "cong-bo",
			};
			const congKhai = (
				await db.okrObjective.findMany({
					where: { ...dieuKien, hienThi: "cong-khai" },
					select: { id: true },
				})
			)
				.map((m) => m.id)
				.sort();
			const khongCongKhai = await db.okrObjective.count({
				where: { ...dieuKien, hienThi: { not: "cong-khai" } },
			});
			console.log(
				`goi: ${trongGoi.length} muc tieu trong goi, ${congKhai.length} cong khai trong kho, ${khongCongKhai} khong cong khai`,
			);
			expect(khongCongKhai).toBeGreaterThan(0);
			expect(
				trongGoi.join(",") === congKhai.join(",")
					? []
					: [
							`goi lech cong khai: goi=${trongGoi.join(",")} kho=${congKhai.join(",")}`,
						],
			).toEqual([]);
			expect(goi.nguon.map((n) => n.id).sort()).toEqual([lanA1, lanA2].sort());

			const hoTen = (
				await db.member.findMany({
					select: { user: { select: { name: true } } },
				})
			)
				.map((m) => m.user.name)
				.filter((ten) => ten.trim().split(/\s+/).length >= 2);
			const chiDan = goiTomTatThanhChiDan(goi);
			const chuaTen = (chu: string) =>
				hoTen.filter((ten) => khongDau(chu).includes(khongDau(ten)));
			console.log(`goi: so ${hoTen.length} ho ten thanh vien trong kho`);
			expect(hoTen.length).toBeGreaterThan(0);
			expect(chuaTen(`${chiDan} ${hoTen[0]}`)).toEqual([hoTen[0] ?? ""]);
			expect(chuaTen(JSON.stringify(goi))).toEqual([]);
			expect(chuaTen(chiDan)).toEqual([]);
		},
		CHO_DB,
	);

	test(
		"chi dan dong cua phien con dung goi neo moc viec, trong the du lieu",
		async () => {
			const moc = chiDanViec.events["session.started"] as unknown as GiaiChiDan;
			const ra = await moc({}, nguCanhCon(viecA.phienGoc) as never);
			const goi = await goiCua(viecA, PHONG.a);
			if (!goi) throw new Error("goi rong cho phong a");
			expect(ra?.markdown).toBe(
				`${MUC_TOM_TAT}\n\n${goiTomTatThanhChiDan(goi)}`,
			);
			expect(ra?.markdown).toStartWith("## Tóm tắt tuần");
			expect(ra?.markdown).toContain("\n\n<du-lieu-okr>\n");
			expect(ra?.markdown).toContain(lanA1);
		},
		CHO_DB,
	);

	test(
		"chi dan dong cua viec okr-de-xuat khong chua doan dan tom tat, viec tom tat co",
		async () => {
			const moc = chiDanViec.events["session.started"] as unknown as GiaiChiDan;
			const deXuat =
				(await moc({}, nguCanhCon(viecDeXuat.phienGoc) as never))?.markdown ??
				"";
			const tomTat =
				(await moc({}, nguCanhCon(viecA.phienGoc) as never))?.markdown ?? "";
			expect(deXuat).toStartWith("<du-lieu-okr>");
			expect(deXuat).toContain(idMau("mt", "q4-phap-che-1"));
			expect({
				deXuatCoDanTomTat: deXuat.includes(MUC_TOM_TAT),
				deXuatCoNopTomTat: deXuat.includes("nop_tom_tat"),
				tomTatCoDanTomTat: tomTat.includes(MUC_TOM_TAT),
			}).toEqual({
				deXuatCoDanTomTat: false,
				deXuatCoNopTomTat: false,
				tomTatCoDanTomTat: true,
			});
			const thuMuc = join(import.meta.dir, "../agent/subagents/tro_ly_okr");
			const tinh: string[] = [];
			for (const ten of readdirSync(join(thuMuc, "instructions"))) {
				const mod = ten.endsWith(".ts")
					? await import(join(thuMuc, "instructions", ten))
					: null;
				if (mod?.default?.kind !== "eve:dynamic") tinh.push(ten);
			}
			expect({
				chiDanTinhTrongThuMuc: tinh,
				gocNoiNopTomTat: readFileSync(
					join(thuMuc, "instructions.md"),
					"utf8",
				).includes("nop_tom_tat"),
			}).toEqual({ chiDanTinhTrongThuMuc: [], gocNoiNopTomTat: false });
		},
		CHO_DB,
	);
});

describe("nop", () => {
	const lanh = (): CauTomTat[] => [
		{
			vanBan:
				"Phòng pháp chế đã cập nhật các kết quả then chốt công khai trong tuần.",
			nguon: [lanA1, lanA2],
		},
		{
			vanBan: "Tỷ lệ hợp đồng dùng mẫu chuẩn đang ở 45%.",
			nguon: [lanA1],
		},
		{
			vanBan:
				"Câu hỏi lặp lại gửi pháp chế còn 28 câu, ghi chú nêu nhiều câu hỏi mới về hợp đồng hàng lạnh.",
			nguon: [lanA2],
		},
	];
	const soLech = (): CauTomTat => ({
		vanBan: "Tỷ lệ hợp đồng dùng mẫu chuẩn đã chạm 77%.",
		nguon: [lanA1],
	});
	const ngoaiGoi = (): CauTomTat => ({
		vanBan: "Mức tự tin của phòng giữ ổn định trong tuần.",
		nguon: [lanNgoai],
	});

	test(
		"nop_de_xuat van tu choi viec tom tat",
		async () => {
			const ra = await (nopDeXuat as unknown as CongCuDeXuat).execute(
				{
					dong: [
						{
							loai: "hoi",
							objectiveId: idMau("mt", "q4-phap-che-1"),
							keyResultId: null,
							truong: null,
							truoc: null,
							sau: null,
							maVanDe: "khong-do-duoc",
							targetObjectiveId: null,
							targetKeyResultId: null,
							lyDo: "KR này chưa nói rõ cách đo",
						},
					],
				},
				nguCanhCon(viecA.phienGoc),
			);
			expect(ra.ketQua).toBe("tu-choi");
			expect(
				await db.okrDeXuat.count({ where: { taskId: viecA.taskId } }),
			).toBe(0);
		},
		CHO_DB,
	);

	test(
		"nop tu phien cua viec okr-de-xuat: tu choi, 0 hang",
		async () => {
			const ra = await nop(viecDeXuat, lanh());
			expect(ra).toMatchObject({ ketQua: "tu-choi", soCau: 0, soBo: 0 });
			expect(await hangTomTat(viecDeXuat.taskId)).toEqual([]);
			expect(await db.okrTomTat.count()).toBe(0);
		},
		CHO_DB,
	);

	test(
		"nop-lanh-do: ba cau lanh, mot so lech, mot nguon ngoai goi -> mot hang can-xem, bo dung ma",
		async () => {
			const ra = await nop(viecA, [...lanh(), soLech(), ngoaiGoi()]);
			expect(ra).toEqual({ ketQua: "da-ghi", lyDo: "", soCau: 3, soBo: 2 });
			const hang = await hangTomTat(viecA.taskId);
			expect(hang.length).toBe(1);
			const ban = hang[0];
			if (!ban) throw new Error("khong co hang");
			const noiDung = parseNoiDungTomTat(ban.cau);
			expect(noiDung.cau).toEqual(lanh());
			expect(noiDung.bo.map((b) => [b.vanBan, b.maBo])).toEqual([
				[soLech().vanBan, "so-lech"],
				[ngoaiGoi().vanBan, "nguon-ngoai-goi"],
			]);
			expect(noiDung.nac).toBe(viecA.nac);
			expect(viecA.nac).toBe("bat");
			expect({
				soCauBo: ban.soCauBo,
				trangThai: ban.trangThai,
				cycleId: ban.cycleId,
				departmentId: ban.departmentId,
			}).toEqual({
				soCauBo: 2,
				trangThai: "can-xem",
				cycleId: KY,
				departmentId: pb(PHONG.a),
			});
		},
		CHO_DB,
	);

	test(
		"nop-hai: lan nop thu hai tu choi, van mot hang",
		async () => {
			const ra = await nop(viecA, lanh());
			expect(ra).toMatchObject({ ketQua: "tu-choi", soCau: 0, soBo: 0 });
			expect((await hangTomTat(viecA.taskId)).length).toBe(1);
		},
		CHO_DB,
	);

	test(
		"ket-thuc: ket qua that cua phien con dong viec tom tat da-nop",
		async () => {
			const output = ketQuaTroLy.parse({ trangThai: "da-nop", maLoi: null });
			const ketQua = {
				kind: "subagent-result",
				subagentName: "tro_ly_okr",
				callId: "goi-tro-ly",
				isError: false,
				output,
			};
			expect(ketThucTuKetQua(ketQua)).toBe("da-nop");
			const hang = await db.agentTask.findUniqueOrThrow({
				where: { id: viecA.taskId },
			});
			const moc = hookGoc.events[
				"action.result"
			] as unknown as XuLyKetQuaHanhDong;
			await moc({ type: "action.result", data: { result: ketQua as never } }, {
				agent: { name: "crm" },
				channel: { kind: "crm" },
				session: {
					id: viecA.phienGoc,
					auth: {
						current: { attributes: okrAuthAttributes(hang) },
						initiator: null,
					},
				},
			} as never);
			const dong = await db.agentTask.findUniqueOrThrow({
				where: { id: viecA.taskId },
				select: { outcome: true, finishedAt: true },
			});
			expect([dong.outcome, dong.finishedAt !== null]).toEqual([
				"da-nop",
				true,
			]);
		},
		CHO_DB,
	);

	test(
		"phong-luu-tru: phong da luu tru luc nop -> thieu-du-lieu, 0 hang",
		async () => {
			await db.department.update({
				where: { id: pb(PHONG.b) },
				data: { archivedAt: DONG_HO },
			});
			try {
				const ra = await nop(viecB, [
					{ vanBan: "Tài chính cập nhật đều trong tuần.", nguon: ["x"] },
				]);
				expect(ra).toMatchObject({ ketQua: "thieu-du-lieu", soCau: 0 });
				expect(await hangTomTat(viecB.taskId)).toEqual([]);
			} finally {
				await db.department.update({
					where: { id: pb(PHONG.b) },
					data: { archivedAt: null },
				});
			}
		},
		CHO_DB,
	);

	test(
		"payload-hong: viec tom tat co payload khong doc duoc -> tu-choi, 0 hang",
		async () => {
			const cu = await db.agentTask.findUniqueOrThrow({
				where: { id: viecB.taskId },
				select: { payload: true },
			});
			await db.agentTask.update({
				where: { id: viecB.taskId },
				data: { payload: { viec: "tom-tat-tuan", departmentId: pb(PHONG.b) } },
			});
			try {
				const ra = await nop(viecB, lanh());
				expect(ra).toEqual({
					ketQua: "tu-choi",
					lyDo: "task payload unreadable",
					soCau: 0,
					soBo: 0,
				});
				expect(await hangTomTat(viecB.taskId)).toEqual([]);
			} finally {
				await db.agentTask.update({
					where: { id: viecB.taskId },
					data: { payload: cu.payload ?? {} },
				});
			}
		},
		CHO_DB,
	);

	test(
		"da-dong: nop sau khi viec tom tat da dong -> tu-choi, 0 hang",
		async () => {
			if (!(await completeTask(viecB.taskId, "hong:het-lease")))
				throw new Error("viec b da dong truoc ca nay");
			const ra = await nop(viecB, [
				{ vanBan: "Tài chính cập nhật đều trong tuần.", nguon: ["x"] },
			]);
			expect(ra).toEqual({
				ketQua: "tu-choi",
				lyDo: "task is not a running weekly summary",
				soCau: 0,
				soBo: 0,
			});
			expect(await hangTomTat(viecB.taskId)).toEqual([]);
		},
		CHO_DB,
	);
});
