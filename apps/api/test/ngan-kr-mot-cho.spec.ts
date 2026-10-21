import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { homNayVN } from "@crm/validation/ngay-vn";
import { LOI_KHUON_CAP_NHAT, mucCapNhat } from "@crm/validation/okr-cap-nhat";
import { objectiveOutput } from "../src/okr/okr.contracts";
import {
	type CanhKrOutput,
	canhKrOutput,
} from "../src/okr/okr-canh-kr.contracts";
import { dienBienOutput } from "../src/okr/okr-xem.contracts";
import {
	type AiHoacCookie,
	bpMoi,
	CHUONG_TRINH_RONG,
	datViTri,
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
} from "./okr-san";

type HopCapNhatKr = {
	krCapNhatTuSheet: (mt: Json, kr: Json) => Json;
	mucGui: (
		kr: Json,
		o: { giaTri: string; tuTin: string | null; ghiChu: string },
		bangChung: string,
	) => Json;
};

const DUONG_HOP = `${import.meta.dir}/../../app/app/(app)/[slug]/okr/hop-thoai-cap-nhat-kr.tsx`;
const hopCapNhatKr: HopCapNhatKr = await import(DUONG_HOP);

const CHO_MS = 60_000;

dungSan();

const moPhien = async (ai: AiHoacCookie) =>
	ok<{ sessionId: string }>(
		await goi("okr.moCapNhat", { entry: "sheet" }, ai),
		"mo phien",
	).sessionId;

const demLan = (keyResultId: string) =>
	db.okrCheckIn.count({ where: { keyResultId } });

async function docLai(objectiveId: string, keyResultId: string, ai: string) {
	const mt = objectiveOutput.parse(
		await doc("okr.objective", ai, { id: objectiveId }),
	);
	const kr = mt.keyResults.find((k) => k.id === keyResultId);
	if (!kr) throw new Error(`khong doc lai duoc KR ${keyResultId}`);
	const canh: CanhKrOutput = canhKrOutput.parse(
		await doc("okr.canhKr", ai, { keyResultId }),
	);
	const lichSu = dienBienOutput.parse(
		await doc("okr.dienBien", ai, { keyResultId }),
	);
	const homNay = homNayVN(new Date());
	const tuanNay = lichSu.diem.reduce<(typeof lichSu.diem)[number] | null>(
		(cu, d) => (d.tuan <= homNay ? d : cu),
		null,
	);
	return { mt, kr, canh, tuanNay };
}

describe("vk7-ghi-that", () => {
	test(
		"vk7-ghi-that: hop cap nhat dung payload cua chinh hop, ghi dung mot lan cho K voi muc tu tin da chon; thieu tu tin thi tu choi, khong ghi",
		async () => {
			ok(await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }), "cau hinh");
			const quy = await kyDangChay("vk7");
			const bp = await bpMoi("vk7-b");
			const pb = await pbMoi("vk7-p", bp);
			const tp = await truongMoi("department", pb, "vk7-tp");
			const chu = await nguoiMoi("vk7-chu");
			ok(await datViTri(chu, pb), "xep chu kr");
			const cookieChu = await phienCua(chu);
			const objectiveId = ok<{ id: string }>(
				await goi(
					"okr.createObjective",
					{
						cycleId: quy,
						unit: { level: "phong-ban", departmentId: pb },
						title: ma("muc tieu"),
						kind: "cam-ket",
						ownerUserId: tp.nguoi,
						participantIds: [],
						whyNow: "",
					},
					tp.cookie,
				),
				"tao muc tieu",
			).id;
			const k = ok<{ id: string }>(
				await goi(
					"okr.createKeyResult",
					{
						objectiveId,
						title: ma("kr"),
						kind: "tang-toi",
						ownerUserId: chu,
						startValue: 0,
						targetValue: 100,
						currentValue: 0,
						unit: "khách",
						dueOn: null,
						weight: 1,
					},
					tp.cookie,
				),
				"tao kr",
			).id;
			ok(
				await goi("okr.publishObjective", { id: objectiveId }, tp.cookie),
				"cong bo",
			);

			const dungMuc = async (giaTri: string, tuTin: string) => {
				const { mt, kr } = await docLai(objectiveId, k, cookieChu);
				return mucCapNhat.parse(
					hopCapNhatKr.mucGui(
						hopCapNhatKr.krCapNhatTuSheet(mt, kr),
						{ giaTri, tuTin, ghiChu: "" },
						"",
					),
				);
			};

			ok(
				await goi(
					"okr.guiCapNhat",
					{
						sessionId: await moPhien(cookieChu),
						items: [await dungMuc("20", "thap")],
					},
					cookieChu,
				),
				"lan cap nhat truoc bai",
			);
			const truoc = await demLan(k);
			expect(`doi chung duong: K co lich su ${truoc >= 1}`).toBe(
				"doi chung duong: K co lich su true",
			);

			const muc = await dungMuc("37", "cao");
			const sessionId = await moPhien(cookieChu);
			ok(
				await goi("okr.guiCapNhat", { sessionId, items: [muc] }, cookieChu),
				"gui tu hop",
			);
			const sau = await demLan(k);
			const moi = await db.okrCheckIn.findMany({
				where: { keyResultId: k, sessionId },
				select: { value: true, confidence: true },
			});
			const doc1 = await docLai(objectiveId, k, cookieChu);
			expect({
				soLan: `so lan cap nhat: ${truoc}->${sau}`,
				muc,
				moi: moi.map((r) => [Number(r.value), r.confidence]),
				hienTai: doc1.kr.currentValue,
				canh: doc1.canh.kr.id,
				lichSu: [doc1.tuanNay?.giaTri ?? null, doc1.tuanNay?.tuTin ?? null],
			}).toEqual({
				soLan: `so lan cap nhat: ${truoc}->${truoc + 1}`,
				muc: { keyResultId: k, value: 37, confidence: "cao", note: "" },
				moi: [[37, "cao"]],
				hienTai: 37,
				canh: k,
				lichSu: [37, "cao"],
			});

			const thieuTuTin = Object.fromEntries(
				Object.entries(await dungMuc("45", "vua")).filter(
					([khoa]) => khoa !== "confidence",
				),
			);
			const tuChoi = await goi(
				"okr.guiCapNhat",
				{ sessionId: await moPhien(cookieChu), items: [thieuTuTin] },
				cookieChu,
			);
			const sauTuChoi = await demLan(k);
			const doc2 = await docLai(objectiveId, k, cookieChu);
			expect({
				status: tuChoi.status,
				loi: tuChoi.loi.includes(LOI_KHUON_CAP_NHAT.tuTin),
				soLan: `so lan cap nhat: ${sau}->${sauTuChoi}`,
				hienTai: doc2.kr.currentValue,
			}).toEqual({
				status: 400,
				loi: true,
				soLan: `so lan cap nhat: ${sau}->${sau}`,
				hienTai: 37,
			});
		},
		CHO_MS,
	);
});
