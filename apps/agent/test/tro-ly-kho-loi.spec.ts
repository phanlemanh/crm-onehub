import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { cauLoiHoi, TAI_LIEU_HOI } from "@crm/validation/tai-lieu-hoi";
import type { SendFn } from "eve/channels";
import { AgentTriggerService } from "../../api/src/agent/agent-trigger.service";
import { TaiLieuHoiService } from "../../api/src/tai-lieu/tai-lieu-hoi.service";
import hookDong from "../agent/hooks/dong-tro-ly-kho";
import { TAI_LIEU_AGENT } from "../agent/lib/tai-lieu-config";
import {
	dongHoiKhoKhiPhienHong,
	dongHoiKhoQuaHan,
	drainHoiKho,
	guiHoiKho,
	phanLoaiLoi,
	tokenHoiKho,
} from "../agent/lib/tai-lieu-hoi-phien";
import loiDan from "../agent/subagents/tro_ly_kho/instructions";
import nopTraLoi from "../agent/subagents/tro_ly_kho/tools/nop_tra_loi";
import readPage from "../agent/subagents/tro_ly_kho/tools/read_page";
import LOI from "./fixtures/loi-gateway.json";
import {
	ctxConCua,
	donTroLyKho,
	gieoNguoi,
	goiCongCu,
	type KetQuaConEve,
	ketQuaConEve,
	ma,
	type NguCanhGoi,
	type Nguoi,
	trangDaDuyet,
} from "./support/tro-ly-kho-gia";

let quanTri: Nguoi;

beforeAll(async () => {
	quanTri = await gieoNguoi("owner");
});

afterAll(async () => {
	await donTroLyKho();
});

type NguCanhKho = {
	session: {
		id: string;
		auth: {
			current: { attributes: Record<string, string> };
			initiator: { attributes: Record<string, string> };
		};
	};
	channel: { kind: string; continuationToken: string };
};

type SuKienKetQua = {
	type: "action.result";
	data: {
		result: {
			kind: string;
			subagentName: string;
			isError?: boolean;
			output: KetQuaConEve["output"];
		};
	};
};

async function hangKho(): Promise<{ hoiId: string; ctx: NguCanhKho }> {
	const phienGoc = ma("ses-goc");
	const hang = await db.taiLieuHoi.create({
		data: {
			nguoiHoiId: quanTri.id,
			kenh: "CRM",
			cauHoi: "Câu lỗi?",
			phienId: phienGoc,
		},
	});
	const thuocTinh = { purpose: "kho", hoiId: hang.id };
	return {
		hoiId: hang.id,
		ctx: {
			session: {
				id: phienGoc,
				auth: {
					current: { attributes: thuocTinh },
					initiator: { attributes: thuocTinh },
				},
			},
			channel: {
				kind: "crm",
				continuationToken: `crm:${tokenHoiKho(hang.id)}`,
			},
		},
	};
}

function xuLyKetQuaCua<T>(): T {
	const xuLy = hookDong.events?.["action.result"];
	if (!xuLy) throw new Error("hook dong-tro-ly-kho thieu action.result");
	return xuLy as unknown as T;
}

type XuLy = (e: SuKienKetQua, c: NguCanhKho) => Promise<void>;
type BatDau = (e: { type: "session.started" }, c: NguCanhGoi) => Promise<void>;
async function ketQuaCon(
	ctx: NguCanhKho,
	hoiId: string,
	loi?: string,
): Promise<void> {
	const result = ketQuaConEve(hoiId, loi);
	await xuLyKetQuaCua<XuLy>()({ type: "action.result", data: { result } }, ctx);
}

describe("tlk-loi", () => {
	test("tlk-loi: sau ca dong dung ly do va cau cho nguoi hoi", async () => {
		const ca: [
			string,
			(h: { hoiId: string; ctx: NguCanhKho }) => Promise<void>,
			string,
		][] = [
			[
				"402 het tin dung",
				(h) => ketQuaCon(h.ctx, h.hoiId, LOI.hetTinDung),
				"het-tran",
			],
			[
				"het ngan sach thang",
				(h) => ketQuaCon(h.ctx, h.hoiId, LOI.hetNganSachThang),
				"het-tran",
			],
			["loi 500", (h) => ketQuaCon(h.ctx, h.hoiId, LOI.loiKhac), "loi-model"],
			["xong khong nop", (h) => ketQuaCon(h.ctx, h.hoiId), "loi-model"],
			[
				"turn.failed het tran",
				async (h) => {
					expect(
						await dongHoiKhoKhiPhienHong(
							`crm:${tokenHoiKho(h.hoiId)}`,
							LOI.hetNganSachThang,
						),
					).toBe(true);
				},
				"het-tran",
			],
		];
		for (const [ten, lam, lyDo] of ca) {
			const h = await hangKho();
			await lam(h);
			const hang = await db.taiLieuHoi.findUniqueOrThrow({
				where: { id: h.hoiId },
			});
			expect(`tlk-loi: ${ten}: ${hang.trangThai} ${hang.lyDo}`).toBe(
				`tlk-loi: ${ten}: LOI ${lyDo}`,
			);
			const ra = await new TaiLieuHoiService(
				db,
				new AgentTriggerService(db),
			).ketQua(quanTri, h.hoiId);
			const cau = ra.trangThai === "LOI" ? cauLoiHoi(ra.lyDo) : "";
			expect(`tlk-loi: cau ${ten}: ${cau}`).toBe(
				`tlk-loi: cau ${ten}: ${lyDo === "het-tran" ? TAI_LIEU_HOI.hetTran : TAI_LIEU_HOI.chuaTraLoi}`,
			);
		}
		expect(phanLoaiLoi("budget")).toBe("loi-model");
	});

	test("tlk-loi: hang dang hoi qua han dong qua-han o nhip dispatch", async () => {
		const cu = await db.taiLieuHoi.create({
			data: {
				nguoiHoiId: quanTri.id,
				kenh: "CRM",
				hoiLuc: new Date(Date.now() - TAI_LIEU_AGENT.hoi.hanTraLoiMs - 60_000),
			},
		});
		await dongHoiKhoQuaHan(new Date());
		const hang = await db.taiLieuHoi.findUniqueOrThrow({
			where: { id: cu.id },
		});
		expect(hang.trangThai).toBe("LOI");
		expect(hang.lyDo).toBe("qua-han");
		const conLai = await db.taiLieuHoi.count({
			where: {
				trangThai: "DANG_HOI",
				hoiLuc: { lt: new Date(Date.now() - TAI_LIEU_AGENT.hoi.hanTraLoiMs) },
			},
		});
		expect(conLai, "tlk-loi: con 1 hang DANG_HOI qua han").toBe(0);
	});

	test("tlk-loi: viec hoi-kho dong theo hang da dong, khong mo coi", async () => {
		const api = new TaiLieuHoiService(db, new AgentTriggerService(db));
		const viecCua = (hoiId: string) =>
			db.agentTask.findFirstOrThrow({
				where: { kind: "hoi-kho", payload: { path: ["hoiId"], equals: hoiId } },
				select: { finishedAt: true },
			});
		const a = await api.hoi(quanTri, { cauHoi: "Câu quá hạn chưa gửi?" });
		await db.taiLieuHoi.update({
			where: { id: a.hoiId },
			data: {
				hoiLuc: new Date(Date.now() - TAI_LIEU_AGENT.hoi.hanTraLoiMs - 60_000),
			},
		});
		await dongHoiKhoQuaHan(new Date());
		expect(
			(await viecCua(a.hoiId)).finishedAt,
			"tlk-loi: viec cua hang qua han mo coi",
		).not.toBeNull();

		const b = await api.hoi(quanTri, { cauHoi: "Câu đã đóng trước khi gửi?" });
		await db.taiLieuHoi.update({
			where: { id: b.hoiId },
			data: { trangThai: "LOI", lyDo: "loi-model", xongLuc: new Date() },
		});
		const send = (async () => {
			throw new Error("khong duoc gui");
		}) as unknown as SendFn;
		expect(await guiHoiKho(b.hoiId, send)).toBeNull();
		expect(
			(await viecCua(b.hoiId)).finishedAt,
			"tlk-loi: viec cua hang da dong mo coi",
		).not.toBeNull();
	});
});

describe("tlk-hoi-dau-cuoi", () => {
	test("tlk-hoi-dau-cuoi: hoi qua API, drainHoiKho mo phien kho, tro ly nop, ket qua da tra loi", async () => {
		const trang = await trangDaDuyet(
			quanTri,
			`Nghỉ phép năm ${ma("np")}`,
			"## Số ngày\n\nMỗi năm có mười hai ngày nghỉ phép.",
		);
		const api = new TaiLieuHoiService(db, new AgentTriggerService(db));
		const { hoiId } = await api.hoi(quanTri, {
			cauHoi: "Nghỉ phép năm bao nhiêu ngày?",
		});
		const gui: {
			tin: string;
			thuocTinh: Record<string, string>;
			token: string;
		}[] = [];
		const send = (async (
			tin: string,
			tuyChon: {
				auth: { attributes: Record<string, string> };
				continuationToken: string;
			},
		) => {
			gui.push({
				tin,
				thuocTinh: tuyChon.auth.attributes,
				token: tuyChon.continuationToken,
			});
			return { id: `ses-goc-${hoiId}` };
		}) as unknown as SendFn;
		await drainHoiKho(send);
		await drainHoiKho(send);
		const cuaToi = gui.filter((g) => g.thuocTinh.hoiId === hoiId);
		expect(cuaToi.length).toBe(1);
		expect(cuaToi[0]?.thuocTinh.purpose).toBe("kho");
		expect(cuaToi[0]?.token).toBe(tokenHoiKho(hoiId));
		expect(cuaToi[0]?.tin).toBe(TAI_LIEU_AGENT.hoi.tinGoc(hoiId));
		const viec = await db.agentTask.findFirstOrThrow({
			where: { kind: "hoi-kho", payload: { path: ["hoiId"], equals: hoiId } },
		});
		expect(viec.finishedAt).not.toBeNull();

		const con = ctxConCua(`ses-goc-${hoiId}`);
		await (
			loiDan as unknown as { events: { "session.started": BatDau } }
		).events["session.started"]({ type: "session.started" }, con);
		const doc = await goiCongCu<{ phienBan: number }>(
			readPage,
			{ slug: trang.slug },
			con,
		);
		if (!doc.ok) throw new Error(doc.loi);
		const nop = await goiCongCu(
			nopTraLoi,
			{
				loai: "tra-loi",
				cau: [
					{
						chu: "Mỗi năm có mười hai ngày.",
						trich: [
							{
								slug: trang.slug,
								phienBan: doc.ra.phienBan,
								doan: "Mỗi năm có mười hai ngày nghỉ phép.",
							},
						],
					},
				],
			},
			con,
		);
		expect(nop.ok).toBe(true);
		const kq = await api.ketQua(quanTri, hoiId);
		expect(kq.trangThai).toBe("TRA_LOI");
	});
});
