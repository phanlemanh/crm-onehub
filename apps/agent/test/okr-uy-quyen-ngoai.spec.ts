import { afterAll, beforeAll, describe, expect, spyOn, test } from "bun:test";
import { db } from "@crm/db";
import type { NopDeXuat } from "@crm/validation/okr-tro-ly";
import hookUyQuyen from "../agent/hooks/okr-uy-quyen";
import { TRO_LY_OKR } from "../agent/lib/okr/config";
import { nopDeXuatVao } from "../agent/lib/okr/nop-de-xuat";
import { nopTomTatVao } from "../agent/lib/okr/nop-tom-tat";
import { LOI_UY_QUYEN, SUBAGENT_TRO_LY_OKR } from "../agent/lib/okr/uy-quyen";
import { uyQuyenOkrState } from "../agent/lib/okr/uy-quyen-state";
import {
	SESSION_PURPOSES,
	type SessionPurpose,
} from "../agent/lib/session-purpose";
import viec from "../agent/subagents/tro_ly_okr/instructions/viec";
import ngoai from "../agent/tools/tro-ly-okr-ngoai";
import {
	type CongCuGia,
	type GiaiChiDan,
	type GiaiCongCu,
	type HanhDongYeuCau,
	phienAudit,
	type XuLyYeuCauHanhDong,
} from "./support/eve-kieu";
import { trongNguCanhEve } from "./support/eve-ngu-canh";
import { donDep, gieoNguoi, moXuong, TIEN_TO } from "./support/nhac-gieo";
import { donOkr, gieoChuKy, gieoMucTieu } from "./support/okr-gieo";
import { donTroLy, gieoCauHinhAi } from "./support/tro-ly-gieo";
import { moViecDeXuat, nguCanhCon } from "./support/tro-ly-phien-con";

async function giai(
	purpose: SessionPurpose,
): Promise<Record<string, CongCuGia> | null> {
	const moc = ngoai.events["step.started"] as unknown as GiaiCongCu;
	return (await moc({}, phienAudit(`ses-ngoai-${purpose}`, purpose))) ?? null;
}

describe("tro-ly-okr-ngoai", () => {
	test("ma trận viết trước: tám purpose, chỉ okr giữ subagent thật", async () => {
		let chay = 0;
		for (const purpose of SESSION_PURPOSES) {
			const congCu = await giai(purpose);
			chay++;
			if (purpose === "okr") {
				if (congCu !== null) throw new Error("phien okr bi de tro_ly_okr");
				continue;
			}
			const ten = Object.keys(congCu ?? {});
			if (ten.length !== 1 || ten[0] !== SUBAGENT_TRO_LY_OKR)
				throw new Error(`${purpose}: khong de tro_ly_okr`);
			const ket = (await congCu?.[SUBAGENT_TRO_LY_OKR]?.execute(
				{},
				phienAudit(`ses-ngoai-${purpose}`, purpose),
			)) as { ok: boolean; reason: string };
			expect(ket.ok).toBe(false);
			expect(ket.reason).toBe(TRO_LY_OKR.ngoaiPhien.lyDo);
		}
		expect(chay).toBe(8);
		expect(SESSION_PURPOSES.length).toBe(chay);
	});
});

describe("cong-tac-bo-de", () => {
	test("công tắc đo tắt công cụ đè, vắng thì như cũ", async () => {
		const ten = TRO_LY_OKR.ngoaiPhien.bienBoDe;
		const cu = process.env[ten];
		process.env[ten] = "1";
		try {
			if ((await giai("zalo")) !== null)
				throw new Error("cong tac bo de khong tat");
		} finally {
			if (cu === undefined) delete process.env[ten];
			else process.env[ten] = cu;
		}
		expect(Object.keys((await giai("zalo")) ?? {})).toEqual([
			SUBAGENT_TRO_LY_OKR,
		]);
		const moiTruong = process.env.NODE_ENV;
		process.env[ten] = "1";
		process.env.NODE_ENV = "production";
		try {
			if (Object.keys((await giai("zalo")) ?? {})[0] !== SUBAGENT_TRO_LY_OKR)
				throw new Error("cong tac bo de chay o production");
		} finally {
			if (cu === undefined) delete process.env[ten];
			else process.env[ten] = cu;
			if (moiTruong === undefined) delete process.env.NODE_ENV;
			else process.env.NODE_ENV = moiTruong;
		}
	});
});

const CAU_HOI_RIENG = "cau-hoi-rieng-h1";
const troLy = (callId: string): HanhDongYeuCau => ({
	kind: "subagent-call",
	callId,
	subagentName: SUBAGENT_TRO_LY_OKR,
});
const congKhac = (callId: string): HanhDongYeuCau => ({
	kind: "tool-call",
	callId,
	toolName: "search_crm",
});
const LOAI_XIN = [
	["tro_ly_okr", [[troLy(CAU_HOI_RIENG)]], 1],
	["cong cu khac", [[congKhac(CAU_HOI_RIENG)]], 0],
	["lan hai", [[troLy("a")], [troLy("b")]], 2],
] as const satisfies readonly (readonly [string, HanhDongYeuCau[][], number])[];

type KetHook = {
	ra: string;
	truoc: readonly string[];
	sau: readonly string[];
	dong: string[];
};

async function chayHook(
	purpose: SessionPurpose,
	loat: readonly HanhDongYeuCau[][],
): Promise<KetHook> {
	const moc = hookUyQuyen.events[
		"actions.requested"
	] as unknown as XuLyYeuCauHanhDong;
	const dong: string[] = [];
	const nghe = spyOn(console, "warn").mockImplementation(
		(...phan: string[]) => {
			dong.push(phan.map(String).join(" "));
		},
	);
	try {
		return await trongNguCanhEve(async () => {
			const truoc = [...uyQuyenOkrState.get().daGoi];
			let ra = "cho";
			try {
				for (const [i, actions] of loat.entries()) {
					moc(
						{
							type: "actions.requested",
							data: { actions: [...actions], turnId: "turn_1", stepIndex: i },
						},
						phienAudit(`ses-hook-${purpose}`, purpose),
					);
				}
			} catch (e) {
				ra = e instanceof Error ? e.message : String(e);
			}
			return { ra, truoc, sau: [...uyQuyenOkrState.get().daGoi], dong };
		});
	} finally {
		nghe.mockRestore();
	}
}

describe("hook", () => {
	test("ma trận viết trước: tám purpose × ba loại xin", async () => {
		let chay = 0;
		for (const purpose of SESSION_PURPOSES) {
			for (const [ten, loat, soDong] of LOAI_XIN) {
				const k = await chayHook(purpose, loat);
				chay++;
				if (k.dong.some((d) => d.includes(CAU_HOI_RIENG)))
					throw new Error("lo cau hoi trong log");
				if (purpose === "okr") {
					const mong =
						ten === "tro_ly_okr"
							? "cho"
							: ten === "cong cu khac"
								? LOI_UY_QUYEN.khacTroLy
								: LOI_UY_QUYEN.lanHai;
					if (ten === "cong cu khac" && k.ra !== mong)
						throw new Error("okr: khac tro ly khong bi chan");
					expect([ten, k.ra, k.dong.length]).toEqual([ten, mong, 0]);
					continue;
				}
				if (k.ra !== "cho") throw new Error(`${purpose}: hook van giet luot`);
				expect([purpose, ten, k.dong]).toEqual([
					purpose,
					ten,
					Array.from(
						{ length: soDong },
						() => `${TRO_LY_OKR.ngoaiPhien.dongNgoaiOkr}${purpose}`,
					),
				]);
				expect(k.sau).toEqual(k.truoc);
			}
		}
		expect(chay).toBe(SESSION_PURPOSES.length * LOAI_XIN.length);
	});
});

const khoaCu = process.env.AI_GATEWAY_API_KEY;
let nguoiGieo = "";
let chuKyGieo = "";

async function mucTieuCoKr(soThu: number) {
	const mucTieu = await gieoMucTieu({
		cycleId: chuKyGieo,
		chu: nguoiGieo,
		congBo: new Date(),
		cap: "onehub",
		tieuDe: `Mục tiêu nộp ngoài OKR ${soThu}`,
	});
	const kr = await db.okrKeyResult.create({
		data: {
			objectiveId: mucTieu,
			title: "Mở rộng mạng lưới đối tác",
			kind: "tang-toi",
			ownerUserId: nguoiGieo,
			startValue: 10,
			targetValue: 25,
			currentValue: 12,
			unit: "đối tác",
			position: 0,
		},
	});
	return { mucTieu, kr: kr.id };
}

function dongHoi(
	objectiveId: string,
	keyResultId: string,
): NopDeXuat["dong"][number] {
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

describe("nop-ngoai", () => {
	beforeAll(async () => {
		process.env.AI_GATEWAY_API_KEY = "khoa-thu";
		await moXuong();
		nguoiGieo = (await gieoNguoi("Người gieo nộp ngoài OKR")).id;
		chuKyGieo = await gieoChuKy("dang-chay");
		await gieoCauHinhAi(new Date(Date.now() - 60_000), {
			aiOn: true,
			aiDeXuatPhamVi: "toan-cong-ty",
			aiTranThangUsd: 9,
		});
	}, 30_000);

	afterAll(async () => {
		if (khoaCu === undefined) delete process.env.AI_GATEWAY_API_KEY;
		else process.env.AI_GATEWAY_API_KEY = khoaCu;
		await donTroLy();
		await donOkr();
		await donDep();
	});

	test("phiên con dưới phiên Zalo không nộp được, kể cả khi việc của phiên khác đang chạy", async () => {
		const khac = await mucTieuCoKr(1);
		const viecKhac = await moViecDeXuat({
			objectiveId: khac.mucTieu,
			nguoiYeuCau: (await gieoNguoi("Người yêu cầu phiên khác")).id,
		});
		const conZalo = nguCanhCon(`${TIEN_TO}goc-zalo-h1`) as never;
		const demDeXuat = () => db.okrDeXuat.count();
		const demTomTat = () => db.okrTomTat.count();
		const truoc = [await demDeXuat(), await demTomTat()];
		const deXuat = await nopDeXuatVao(
			{ dong: [dongHoi(khac.mucTieu, khac.kr)] },
			conZalo,
		);
		if (deXuat.ketQua !== "tu-choi" || (await demDeXuat()) !== truoc[0])
			throw new Error("nop_de_xuat: nhan viec cua phien khac");
		expect(JSON.stringify(deXuat)).toContain("not an OKR session");
		const tomTat = await nopTomTatVao({ cau: [] }, conZalo);
		if (tomTat.ketQua !== "tu-choi" || (await demTomTat()) !== truoc[1])
			throw new Error("nop_tom_tat: phien con ngoai OKR ghi duoc");
		expect(JSON.stringify(tomTat)).toContain("not an OKR session");

		const conThat = nguCanhCon(viecKhac.phienGoc) as never;
		const that = await nopDeXuatVao(
			{ dong: [dongHoi(khac.mucTieu, khac.kr)] },
			conThat,
		);
		if (that.ketQua !== "da-ghi" || (await demDeXuat()) <= truoc[0])
			throw new Error("doi chung: viec OKR that khong ghi duoc");
	}, 30_000);

	describe("khong-viec", () => {
		const chiDan = async (phienGoc: string): Promise<string | null> => {
			const moc = viec.events["session.started"] as unknown as GiaiChiDan;
			const ra = await moc({}, nguCanhCon(phienGoc) as never);
			return ra?.markdown ?? null;
		};

		test("phiên con không có việc nhận đúng chỉ dẫn trả câu lyDo; có việc thì như cũ", async () => {
			const { lyDo, chiDanKhongViec } = TRO_LY_OKR.ngoaiPhien;
			expect(lyDo).toContain("OKR");
			const khong = await chiDan(`${TIEN_TO}goc-khong-viec-h1`);
			if (khong !== chiDanKhongViec || !khong.includes(lyDo))
				throw new Error("phien con khong viec khong co chi dan");

			const muc = await mucTieuCoKr(2);
			const coViec = await moViecDeXuat({
				objectiveId: muc.mucTieu,
				nguoiYeuCau: (await gieoNguoi("Người yêu cầu có việc")).id,
			});
			const cua = await chiDan(coViec.phienGoc);
			if (cua === null || cua.includes(lyDo))
				throw new Error("phien con co viec nhan chi dan khong viec");

			await db.agentTask.update({
				where: { id: coViec.taskId },
				data: { finishedAt: new Date() },
			});
			if ((await chiDan(coViec.phienGoc)) !== null)
				throw new Error("viec da xong van nhan chi dan");
		}, 30_000);
	});
});
