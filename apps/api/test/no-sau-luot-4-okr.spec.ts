import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { LOAI_NHAC_OKR } from "@crm/db/okr-nhac";
import {
	type ViecCuaToiOutput,
	viecCuaToiOutput,
} from "../src/okr/okr.contracts";
import { OkrTraoDoiService } from "../src/okr/okr-trao-doi.service";
import {
	type AiHoacCookie,
	CHUONG_TRINH_RONG,
	doc,
	dungSan,
	goi,
	type Json,
	kyDangChay,
	ma,
	nguoiMoi,
	ok,
	pbMoi,
	phienCua,
	truongMoi,
	ungDung,
} from "./okr-san";

dungSan();

const GIO_MS = 3_600_000;
const NGAY_MS = 24 * GIO_MS;

const caiChuongTrinh = async () =>
	ok(await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }), "cau hinh");

async function mucTieu(
	cycleId: string,
	unit: Json,
	ownerUserId: string,
	ai: AiHoacCookie,
): Promise<string> {
	return ok<{ id: string }>(
		await goi(
			"okr.createObjective",
			{
				cycleId,
				unit,
				title: ma("muc tieu"),
				kind: "cam-ket",
				ownerUserId,
				participantIds: [],
				whyNow: "",
			},
			ai,
		),
		"tao muc tieu",
	).id;
}

async function taoKr(
	objectiveId: string,
	ownerUserId: string,
	ai: AiHoacCookie,
): Promise<string> {
	return ok<{ id: string }>(
		await goi(
			"okr.createKeyResult",
			{
				objectiveId,
				title: ma("kr"),
				kind: "tang-toi",
				ownerUserId,
				startValue: 10,
				targetValue: 50,
				currentValue: 20,
				unit: "khách",
				dueOn: null,
				weight: 1,
			},
			ai,
		),
		"tao kr",
	).id;
}

const congBo = async (id: string, ai: AiHoacCookie) =>
	ok(await goi("okr.publishObjective", { id }, ai), "cong bo");

const moPhien = async (ai: AiHoacCookie) =>
	ok<{ sessionId: string }>(
		await goi("okr.moCapNhat", { entry: "tab" }, ai),
		"mo phien",
	).sessionId;

describe("du-duong", () => {
	test("du-duong: nam loai muc OKR do duong ghi that tao, okr.viecCuaToi tra du nam loai va qua khuon dau ra", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("dd");
		await db.okrCycle.update({
			where: { id: quy },
			data: { updateWeekday: 1 },
		});
		const pb = await pbMoi("dd-p");
		const tp = await truongMoi("department", pb, "dd-tp");
		const X = await nguoiMoi("dd-x");
		const cX = await phienCua(X);
		const dvP = { level: "phong-ban", departmentId: pb };

		const o1 = await mucTieu(quy, dvP, tp.nguoi, tp.cookie);
		const k1 = await taoKr(o1, X, tp.cookie);
		await congBo(o1, tp.cookie);
		await db.okrKeyResult.update({
			where: { id: k1 },
			data: { startLockedAt: new Date(Date.now() - 20 * NGAY_MS) },
		});

		const o2 = await mucTieu(quy, dvP, tp.nguoi, tp.cookie);
		const k2 = await taoKr(o2, tp.nguoi, tp.cookie);
		await congBo(o2, tp.cookie);
		ok(
			await goi("okr.updateKeyResult", { id: k2, ownerUserId: X }, tp.cookie),
			"giao k2 cho X",
		);
		ok(
			await goi(
				"okr.addComment",
				{ objectiveId: o2, body: "nho X", mentionUserIds: [X] },
				tp.cookie,
			),
			"nhac ten X",
		);

		const o3 = await mucTieu(quy, dvP, tp.nguoi, tp.cookie);
		const k3 = await taoKr(o3, tp.nguoi, tp.cookie);
		await congBo(o3, tp.cookie);
		ok(await goi("okr.follow", { objectiveId: o3, on: true }, cX), "X theo o3");
		ok(
			await goi(
				"okr.guiCapNhat",
				{
					sessionId: await moPhien(tp.cookie),
					items: [{ keyResultId: k3, value: 30, confidence: "cao", note: "" }],
				},
				tp.cookie,
			),
			"tp cap nhat k3",
		);

		const quaTrpc = await doc<ViecCuaToiOutput>("okr.viecCuaToi", cX);
		const loai = [...new Set(quaTrpc.viec.map((v) => v.loai))].sort();
		const mong = [...LOAI_NHAC_OKR].sort();
		if (JSON.stringify(loai) !== JSON.stringify(mong)) {
			throw new Error(
				`du-duong: thieu ${mong.filter((l) => !loai.includes(l)).join(", ")}`,
			);
		}
		expect(viecCuaToiOutput.parse(quaTrpc)).toEqual(quaTrpc);
		const svc = ungDung().get(OkrTraoDoiService);
		expect(
			(await svc.viecCuaToi(X, new Date(Date.now() + 60_000))).viec.map(
				(v) => v.loai,
			),
		).toEqual(quaTrpc.viec.map((v) => v.loai));
	});
});
