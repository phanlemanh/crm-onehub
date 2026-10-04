import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { soLanThuToiDa } from "@crm/db/agent-tasks";
import { khoNguonGia } from "@crm/db/test/blob-nguon-gia";
import { parseSoanTuNguonPayload } from "@crm/validation/tai-lieu-nguon";
import { MOC_KET_MS } from "../../../_acceptance/kho-nguon-khong-ket/rang/dem-ket";
import { DISPATCH } from "../agent/lib/dispatch-config";
import { TAI_LIEU_AGENT } from "../agent/lib/tai-lieu-config";
import { dongNguonMoCoi } from "../agent/lib/tai-lieu-phien";
import { chaySoanTuNguon } from "../agent/lib/tai-lieu-soan";
import {
	claimDue,
	completeTask,
	DIRECT_KINDS,
	type LeasedTask,
	retireExhausted,
} from "../agent/lib/tasks";
import dispatch from "../agent/schedules/dispatch";
import {
	DOAN_QUYET_DINH,
	datQuyTacViet,
	docxTu,
	donTaiLieu,
	gieoNguoi,
	gieoNguon,
	gieoTrang,
	gieoViec,
} from "./support/tai-lieu-gieo";

const CAU_MO_COI = "Máy soạn dừng giữa chừng — bấm Soạn lại để thử lần nữa.";
const CAU_DOC_LOI = "Chưa đọc được tệp — bấm Soạn lại để thử lần nữa.";
const LY_DO_CU = "Chưa soạn được — máy soạn báo lỗi: 500";
const NHIP_DISPATCH_MS = 60_000;
const KIND = "soan-tu-nguon";

let nguoiId = "";

beforeAll(async () => {
	nguoiId = await gieoNguoi();
	await datQuyTacViet(nguoiId, "## Quy tắc viết\n\nViết ngắn.");
});

afterAll(async () => {
	await donTaiLieu([nguoiId]);
});

type Viec = "lease" | "cho" | "nghi" | "dong" | "khong";

type O = {
	ten: string;
	muc: string;
	lyDo?: string;
	viec: Viec;
	mong: string;
	mongLyDo: string | null;
};

const O_MO_COI: readonly O[] = [
	{
		ten: "CHO_DOC+lease",
		muc: "CHO_DOC",
		viec: "lease",
		mong: "CHO_DOC",
		mongLyDo: null,
	},
	{
		ten: "CHO_DOC+cho",
		muc: "CHO_DOC",
		viec: "cho",
		mong: "CHO_DOC",
		mongLyDo: null,
	},
	{
		ten: "CHO_DOC+nghi",
		muc: "CHO_DOC",
		viec: "nghi",
		mong: "LOI",
		mongLyDo: CAU_MO_COI,
	},
	{
		ten: "CHO_DOC+dong",
		muc: "CHO_DOC",
		viec: "dong",
		mong: "LOI",
		mongLyDo: CAU_MO_COI,
	},
	{
		ten: "CHO_DOC+khong",
		muc: "CHO_DOC",
		viec: "khong",
		mong: "LOI",
		mongLyDo: CAU_MO_COI,
	},
	{
		ten: "CHO_SOAN",
		muc: "CHO_SOAN",
		viec: "dong",
		mong: "CHO_SOAN",
		mongLyDo: null,
	},
	{
		ten: "DANG_SOAN",
		muc: "DANG_SOAN",
		viec: "dong",
		mong: "DANG_SOAN",
		mongLyDo: null,
	},
	{
		ten: "LOI-cu",
		muc: "LOI",
		lyDo: LY_DO_CU,
		viec: "dong",
		mong: "LOI",
		mongLyDo: LY_DO_CU,
	},
	{
		ten: "DA_SOAN",
		muc: "DA_SOAN",
		lyDo: "Đã soạn bản đề xuất.",
		viec: "dong",
		mong: "DA_SOAN",
		mongLyDo: "Đã soạn bản đề xuất.",
	},
	{
		ten: "CAN_GO_TAY",
		muc: "CAN_GO_TAY",
		lyDo: "Cần gõ tay — 2/2 trang là bản quét, máy không đọc được chữ.",
		viec: "dong",
		mong: "CAN_GO_TAY",
		mongLyDo: "Cần gõ tay — 2/2 trang là bản quét, máy không đọc được chữ.",
	},
];

async function gieoO(
	o: O,
): Promise<{ nguonId: string; taskId: string | null }> {
	const trangId = await gieoTrang(nguoiId);
	const nguon = await gieoNguon({
		tep: "quyet-dinh.docx",
		trangId,
		taiBoiId: nguoiId,
		byte: docxTu([...DOAN_QUYET_DINH, o.ten]),
		trangThai: o.muc,
	});
	if (o.lyDo) {
		await db.taiLieuNguon.update({
			where: { id: nguon.id },
			data: { lyDo: o.lyDo },
		});
	}
	const viec = await gieoViec(nguon.id);
	if (o.viec === "lease") {
		const claimed = await claimDue(
			50,
			{ only: [KIND] },
			DISPATCH.visible.leaseMs,
		);
		if (!claimed.some((t) => t.id === viec.id)) {
			throw new Error(`kn-mo-coi: claimDue khong lay viec cua ${o.ten}`);
		}
		for (const t of claimed) {
			if (t.id !== viec.id) {
				await db.agentTask.update({
					where: { id: t.id },
					data: { leasedUntil: null, attempts: { decrement: 1 } },
				});
			}
		}
	}
	if (o.viec === "cho") {
		await db.agentTask.update({
			where: { id: viec.id },
			data: { attempts: 1, leasedUntil: new Date(Date.now() - 60_000) },
		});
	}
	if (o.viec === "nghi") {
		await db.agentTask.update({
			where: { id: viec.id },
			data: {
				attempts: soLanThuToiDa(KIND),
				leasedUntil: new Date(Date.now() - 60_000),
			},
		});
		const nghi = await retireExhausted();
		if (!nghi.some((t) => t.id === viec.id)) {
			throw new Error(
				`kn-mo-coi: retireExhausted khong cho nghi viec cua ${o.ten}`,
			);
		}
	}
	if (o.viec === "dong") await completeTask(viec.id, "thu");
	if (o.viec === "khong") {
		await db.agentTask.delete({ where: { id: viec.id } });
		return { nguonId: nguon.id, taskId: null };
	}
	return { nguonId: nguon.id, taskId: viec.id };
}

async function docNguon(id: string) {
	return db.taiLieuNguon.findUniqueOrThrow({
		where: { id },
		select: { trangThai: true, lyDo: true },
	});
}

async function dongViecMo(nguonIds: readonly string[]): Promise<void> {
	for (const id of nguonIds) {
		await db.agentTask.updateMany({
			where: {
				kind: KIND,
				finishedAt: null,
				payload: { path: ["nguonId"], equals: id },
			},
			data: { finishedAt: new Date(), outcome: "thu", leasedUntil: null },
		});
	}
}

describe("kn-mo-coi", () => {
	test("kn-mo-coi: ma tran 10 o viet truoc, chi CHO_DOC khong con viec mo ve LOI", async () => {
		expect(O_MO_COI.length).toBe(10);
		await dongNguonMoCoi();
		const gieo: { o: O; nguonId: string }[] = [];
		for (const o of O_MO_COI)
			gieo.push({ o, nguonId: (await gieoO(o)).nguonId });
		const tra = await dongNguonMoCoi();
		const sai: string[] = [];
		for (const { o, nguonId } of gieo) {
			const h = await docNguon(nguonId);
			if (h.trangThai !== o.mong) {
				if (o.ten === "CHO_DOC+lease" || o.ten === "CHO_DOC+cho") {
					sai.push(`kn-mo-coi: dong nguon co viec lease song (${o.ten})`);
				} else if (o.ten === "DA_SOAN" || o.ten === "CAN_GO_TAY") {
					sai.push(`kn-mo-coi: doi trang thai nguon da soan (${o.ten})`);
				} else if (o.ten === "CHO_SOAN") {
					sai.push("kn-mo-coi: doi trang thai CHO_SOAN");
				} else {
					sai.push(`${o.ten}: muc ${h.trangThai}, mong ${o.mong}`);
				}
			}
			if (h.trangThai === o.mong && h.lyDo !== o.mongLyDo) {
				sai.push(`kn-mo-coi: lyDo lech cau da hua (${o.ten}): ${h.lyDo}`);
			}
		}
		expect(sai).toEqual([]);
		expect(tra).toBe(3);
		expect(await dongNguonMoCoi()).toBe(0);
		await dongViecMo(gieo.map((g) => g.nguonId));
	});

	test("kn-mo-coi: can lease x so luot + mot nhip moi luot khong vuot moc 30 phut", () => {
		expect(DIRECT_KINDS as readonly string[]).toContain(KIND);
		const can =
			DISPATCH.visible.leaseMs * soLanThuToiDa(KIND) +
			soLanThuToiDa(KIND) * NHIP_DISPATCH_MS;
		expect(MOC_KET_MS).toBe(30 * 60_000);
		expect(can).toBeLessThanOrEqual(MOC_KET_MS);
	});

	test("kn-mo-coi: mot nhip dispatch that dua nguon mo coi ve LOI", async () => {
		await dongViecMo(
			(await db.taiLieuNguon.findMany({ select: { id: true } })).map(
				(n) => n.id,
			),
		);
		const { nguonId } = await gieoO({
			ten: "nhip",
			muc: "CHO_DOC",
			viec: "nghi",
			mong: "LOI",
			mongLyDo: CAU_MO_COI,
		});
		const viec: Promise<unknown>[] = [];
		await dispatch.run({
			receive: async () => ({}),
			waitUntil: (p: Promise<unknown>) => {
				viec.push(p);
			},
			appAuth: null,
		} as unknown as Parameters<typeof dispatch.run>[0]);
		await Promise.allSettled(viec);
		const h = await docNguon(nguonId);
		expect(`${h.trangThai} ${h.lyDo}`).toBe(`LOI ${CAU_MO_COI}`);
	});
});

describe("kn-soan-lai", () => {
	test("kn-soan-lai: nguon LOI do doc tep nem, viec moi cung khuon payload, chay lai voi tep lanh di tiep CHO_SOAN", async () => {
		const trangId = await gieoTrang(nguoiId);
		const nguon = await gieoNguon({
			tep: "quyet-dinh.docx",
			trangId,
			taiBoiId: nguoiId,
			byte: docxTu([...DOAN_QUYET_DINH, "soan lai"]),
		});
		const nem = khoNguonGia();
		nem.doc = async () => {
			throw new Error("blob tam thoi loi");
		};
		await chaySoanTuNguon(await gieoViec(nguon.id), nem);
		const loi = await docNguon(nguon.id);
		expect(`${loi.trangThai} ${loi.lyDo}`).toBe(`LOI ${CAU_DOC_LOI}`);
		expect(TAI_LIEU_AGENT.lyDo.docLoi).toBe(CAU_DOC_LOI);
		await db.taiLieuNguon.update({
			where: { id: nguon.id },
			data: { trangThai: "CHO_DOC", lyDo: null },
		});
		const moi = await gieoViec(nguon.id);
		const task: LeasedTask = {
			...moi,
			payload: parseSoanTuNguonPayload({ nguonId: nguon.id }),
		};
		const lanh = khoNguonGia();
		lanh.daPut.set(nguon.pathname, nguon.byte);
		await chaySoanTuNguon(task, lanh);
		const sau = await docNguon(nguon.id);
		if (sau.trangThai !== "CHO_SOAN") {
			throw new Error(
				`kn-soan-lai: nguon LOI khong soan lai duoc (${sau.trangThai} ${sau.lyDo})`,
			);
		}
	});
});
