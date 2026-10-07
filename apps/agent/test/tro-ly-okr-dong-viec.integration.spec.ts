import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import {
	type DongGopY,
	ketQuaTroLy,
	type NopDeXuat,
} from "@crm/validation/okr-tro-ly";
import hookGoc from "../agent/hooks/okr-uy-quyen";
import { TRO_LY_OKR } from "../agent/lib/okr/config";
import { nopDeXuatVao } from "../agent/lib/okr/nop-de-xuat";
import { dongViecOkr } from "../agent/lib/okr/viec";
import { completeTask, noteSession } from "../agent/lib/tasks";
import type { XuLyKetQuaHanhDong } from "./support/eve-kieu";
import { donDep, gieoNguoi, moXuong, TIEN_TO } from "./support/nhac-gieo";
import { donOkr, gieoChuKy, gieoMucTieu } from "./support/okr-gieo";
import { donTroLy, gieoCauHinhAi } from "./support/tro-ly-gieo";
import {
	moViecDeXuat,
	nguCanhCon,
	nguCanhGoc,
	type ViecMo,
} from "./support/tro-ly-phien-con";

const CHO_DB = 120_000;
const khoaCu = process.env.AI_GATEWAY_API_KEY;

let nguoi = "";
let chuKy = "";
let soMucTieu = 0;

type HamNop = typeof nopDeXuatVao;

type ODeXuat = {
	ten: string;
	chuan: (v: ViecMo, ids: { mucTieu: string; kr: string }) => Promise<void>;
	soDong: number;
	ketQua: string;
	outcome: string | null;
	goiLai?: boolean;
	phienKhac?: boolean;
};

const O_GOP_Y: readonly ODeXuat[] = [
	{
		ten: "ghi-2-dong",
		chuan: async () => {},
		soDong: 2,
		ketQua: "da-ghi",
		outcome: "da-nop",
	},
	{
		ten: "ghi-0-dong",
		chuan: async () => {},
		soDong: 0,
		ketQua: "da-ghi",
		outcome: "da-nop",
	},
	{
		ten: "muc-tieu-da-xoa",
		chuan: async (_v, ids) => {
			await db.okrKeyResult.delete({ where: { id: ids.kr } });
			await db.okrObjective.delete({ where: { id: ids.mucTieu } });
		},
		soDong: 1,
		ketQua: "thieu-du-lieu",
		outcome: "khong-lam-duoc:thieu-du-lieu",
	},
	{
		ten: "payload-hong",
		chuan: async (v) => {
			await db.agentTask.update({
				where: { id: v.taskId },
				data: { payload: {} },
			});
		},
		soDong: 1,
		ketQua: "tu-choi",
		outcome: "khong-lam-duoc:khuon-hong",
	},
	{
		ten: "viec-da-dong",
		chuan: async (v) => {
			await completeTask(v.taskId, TRO_LY_OKR.ketThuc.hetLease);
		},
		soDong: 1,
		ketQua: "tu-choi",
		outcome: TRO_LY_OKR.ketThuc.hetLease,
	},
	{
		ten: "da-nop-roi",
		chuan: async () => {},
		soDong: 1,
		ketQua: "tu-choi",
		outcome: "da-nop",
		goiLai: true,
	},
	{
		ten: "viec-tom-tat",
		chuan: async () => {},
		soDong: 1,
		ketQua: "tu-choi",
		outcome: null,
		phienKhac: true,
	},
];

function dongHoi(objectiveId: string, keyResultId: string): DongGopY {
	return {
		loai: "hoi",
		objectiveId,
		keyResultId,
		truong: null,
		truoc: null,
		sau: null,
		maVanDe: "khong-do-duoc",
		targetObjectiveId: null,
		targetKeyResultId: null,
		lyDo: "KR này chưa nói rõ cách đo",
	};
}

async function mucTieuCoKr(): Promise<{ mucTieu: string; kr: string }> {
	soMucTieu += 1;
	const mucTieu = await gieoMucTieu({
		cycleId: chuKy,
		chu: nguoi,
		congBo: new Date(),
		cap: "onehub",
		tieuDe: `Mở rộng kênh đối tác số ${soMucTieu}`,
	});
	const kr = await db.okrKeyResult.create({
		data: {
			objectiveId: mucTieu,
			title: "Mở rộng mạng lưới đối tác",
			kind: "tang-toi",
			ownerUserId: nguoi,
			startValue: 10,
			targetValue: 25,
			currentValue: 12,
			unit: "đối tác",
			position: 0,
		},
	});
	return { mucTieu, kr: kr.id };
}

async function viecTomTatGia(): Promise<ViecMo> {
	const hang = await db.agentTask.create({
		data: {
			kind: "okr-tom-tat-tuan",
			reason: "okr-tom-tat-tuan",
			subject: `${TIEN_TO}tom-tat-gia-${soMucTieu}`,
			budget: 0,
			dueAt: new Date(),
			attempts: 1,
			payload: {},
		},
	});
	const phienGoc = `${TIEN_TO}goc-${hang.id}`;
	await noteSession(hang.id, phienGoc);
	return { taskId: hang.id, phienGoc };
}

async function ketCuc(taskId: string): Promise<string | null> {
	const h = await db.agentTask.findUniqueOrThrow({
		where: { id: taskId },
		select: { outcome: true, finishedAt: true },
	});
	return h.finishedAt ? h.outcome : null;
}

async function nguoiYeuCauMoi(): Promise<string> {
	soMucTieu += 1;
	return (await gieoNguoi(`Người yêu cầu ${soMucTieu}`)).id;
}

async function kiemOGopY(ham: HamNop): Promise<string[]> {
	const lech: string[] = [];
	for (const o of O_GOP_Y) {
		const ids = await mucTieuCoKr();
		const viecDeXuat = await moViecDeXuat({
			objectiveId: ids.mucTieu,
			nguoiYeuCau: await nguoiYeuCauMoi(),
		});
		const viec = o.phienKhac ? await viecTomTatGia() : viecDeXuat;
		const dong: NopDeXuat["dong"] = Array.from({ length: o.soDong }, (_, i) =>
			i === 0
				? dongHoi(ids.mucTieu, ids.kr)
				: {
						...dongHoi(ids.mucTieu, ids.kr),
						keyResultId: null,
						maVanDe: "muc-tieu-la-so",
					},
		);
		await o.chuan(viec, ids);
		const ctx = nguCanhCon(viec.phienGoc) as never;
		if (o.goiLai) await ham({ dong }, ctx);
		const ra = await ham({ dong }, ctx);
		const that = await ketCuc(viec.taskId);
		if (ra.ketQua !== o.ketQua) lech.push(`ketQua lech: ${o.ten} ${ra.ketQua}`);
		if (that !== o.outcome)
			lech.push(`tool khong dong viec: ${o.ten} (${that ?? "mo"})`);
	}
	console.log(`gop-y so o: ${O_GOP_Y.length}`);
	return lech;
}

const nopKhongDong: HamNop = async (input, ctx, kiem) => {
	const hang = await db.agentTask.findFirst({
		where: {
			sessionId: (ctx as { session: { parent: { rootSessionId: string } } })
				.session.parent.rootSessionId,
		},
		select: { id: true, finishedAt: true },
	});
	const ra = await nopDeXuatVao(input, ctx, kiem);
	if (hang && !hang.finishedAt)
		await db.agentTask.update({
			where: { id: hang.id },
			data: { finishedAt: null, outcome: null },
		});
	return ra;
};

type KetQuaCon = {
	kind: "subagent-result";
	subagentName: string;
	callId: string;
	isError: boolean;
	output: unknown;
};

type OLuoi = {
	ten: string;
	dongTruoc: string | null;
	ketQua: KetQuaCon;
	outcome: string | null;
};

const ketQuaCon = (p: Partial<KetQuaCon>): KetQuaCon => ({
	kind: "subagent-result",
	subagentName: "tro_ly_okr",
	callId: "goi-tro-ly",
	isError: false,
	output: "done",
	...p,
});

const O_LUOI: readonly OLuoi[] = [
	{
		ten: "da-dong+khong-loi",
		dongTruoc: "da-nop",
		ketQua: ketQuaCon({}),
		outcome: "da-nop",
	},
	{
		ten: "da-dong+loi",
		dongTruoc: "da-nop",
		ketQua: ketQuaCon({
			isError: true,
			output: { code: "SUBAGENT_EXECUTION_FAILED", message: "x" },
		}),
		outcome: "da-nop",
	},
	{
		ten: "mo+loi",
		dongTruoc: null,
		ketQua: ketQuaCon({
			isError: true,
			output: { code: "MODEL_CALL_FAILED", message: "x" },
		}),
		outcome: "hong:MODEL_CALL_FAILED",
	},
	{
		ten: "mo+khong-loi",
		dongTruoc: null,
		ketQua: ketQuaCon({}),
		outcome: TRO_LY_OKR.ketThuc.khongNop,
	},
	{
		ten: "subagent-khac",
		dongTruoc: null,
		ketQua: ketQuaCon({ subagentName: "agent_runner" }),
		outcome: null,
	},
];

type XuLyLuoi = (viec: ViecMo, ketQua: KetQuaCon) => Promise<void>;

const quaHook: XuLyLuoi = async (viec, ketQua) => {
	const moc = hookGoc.events["action.result"] as unknown as XuLyKetQuaHanhDong;
	await moc(
		{ type: "action.result", data: { result: ketQua as never } },
		nguCanhGoc(viec.taskId, viec.phienGoc) as never,
	);
};

function ketThucCu(r: KetQuaCon): string | null {
	if (r.kind !== "subagent-result" || r.subagentName !== "tro_ly_okr")
		return null;
	if (r.isError) return "hong:SUBAGENT_ERROR";
	const kq = ketQuaTroLy.safeParse(r.output);
	if (!kq.success) return "hong:ket-qua-hong";
	return kq.data.trangThai === "da-nop" ? "da-nop" : "khong-lam-duoc:khong-ro";
}

const luoiCu: XuLyLuoi = async (viec, ketQua) => {
	const k = ketThucCu(ketQua);
	if (k) await dongViecOkr(viec.taskId, k);
};

async function kiemLuoi(xuLy: XuLyLuoi): Promise<string[]> {
	const lech: string[] = [];
	for (const o of O_LUOI) {
		const ids = await mucTieuCoKr();
		const viec = await moViecDeXuat({
			objectiveId: ids.mucTieu,
			nguoiYeuCau: await nguoiYeuCauMoi(),
		});
		if (o.dongTruoc) await completeTask(viec.taskId, o.dongTruoc);
		await xuLy(viec, o.ketQua);
		const that = await ketCuc(viec.taskId);
		if (that !== o.outcome) lech.push(`luoi lech: ${o.ten} (${that ?? "mo"})`);
	}
	console.log(`luoi so o: ${O_LUOI.length}`);
	return lech;
}

beforeAll(async () => {
	process.env.AI_GATEWAY_API_KEY = "khoa-thu";
	await moXuong();
	nguoi = (await gieoNguoi("Người gieo đóng việc")).id;
	chuKy = await gieoChuKy("dang-chay");
	await gieoCauHinhAi(new Date(Date.now() - 60_000), {
		aiOn: true,
		aiDeXuatPhamVi: "toan-cong-ty",
		aiTranThangUsd: 9,
	});
}, 30_000);

afterAll(async () => {
	if (khoaCu === undefined) delete process.env.AI_GATEWAY_API_KEY;
	else process.env.AI_GATEWAY_API_KEY = khoaCu;
	await db.agentTask.deleteMany({
		where: { subject: { startsWith: `${TIEN_TO}tom-tat-gia-` } },
	});
	await donTroLy();
	await donOkr();
	await donDep();
}, 30_000);

describe("gop-y", () => {
	test(
		"gop-y: nop_de_xuat dong viec dung ket cuc o moi o cua ma tran",
		async () => {
			expect(await kiemOGopY(nopDeXuatVao)).toEqual([]);
		},
		CHO_DB,
	);

	test(
		"gop-y doi chung: ban khong dong viec bi bat o ghi-0-dong",
		async () => {
			const lech = await kiemOGopY(nopKhongDong);
			expect(
				lech.some((l) => l.startsWith("tool khong dong viec: ghi-0-dong")),
			).toBe(true);
		},
		CHO_DB,
	);
});

describe("luoi", () => {
	test(
		"luoi: hook phien goc giu ket cuc cua tool, chi dong viec con mo",
		async () => {
			expect(await kiemLuoi(quaHook)).toEqual([]);
		},
		CHO_DB,
	);

	test(
		"luoi doi chung: ham ket cuc cu doc khuon ket qua bi bat o mo+khong-loi",
		async () => {
			const lech = await kiemLuoi(luoiCu);
			expect(lech).toContain("luoi lech: mo+khong-loi (hong:ket-qua-hong)");
			console.log("luoi doc khuon ket qua cu");
		},
		CHO_DB,
	);
});
