import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { okrTroLyViec } from "@crm/validation/okr-tro-ly";
import type { NestExpressApplication } from "@nestjs/platform-express";
import {
	batDauMau,
	CHO_DB,
	dongMau,
	dungUngDung,
	ghiCauHinh,
	gieoDong,
	goi,
	ketThucMau,
	kr,
	mt,
	NAC_CAU_HINH,
	nguoi,
	ok,
	phienMau,
	tienDongHo,
} from "./tro-ly-okr-san";

const M1 = mt("q4-kd-bac-1");
const K1 = kr("q4-kd-bac-1-k1");
const K2 = kr("q4-kd-bac-1-k2");
const K3 = kr("q4-kd-bac-1-k3");

const NGUOI = {
	"hai-kr": "hoang-yen-nhi",
	"mot-kr": "do-minh-khoa",
	"khong-kr": "bui-quang-huy",
	"sua-muc-tieu": "nguyen-thi-lan",
	"quan-tri": "le-hai-dang",
} as const;
type Nguoi = keyof typeof NGUOI;

let app: NestExpressApplication;
const cookie = {} as Record<Nguoi, string>;
const id = { capBo: "", k1: "", k2: "", k3: "" };

beforeAll(async () => {
	await batDauMau();
	app = await dungUngDung();
	for (const k of Object.keys(NGUOI) as Nguoi[])
		cookie[k] = await phienMau(NGUOI[k]);
	await ghiCauHinh(app, cookie["quan-tri"], NAC_CAU_HINH.bat);
	await db.okrKeyResult.update({
		where: { id: K3 },
		data: { ownerUserId: nguoi(NGUOI["hai-kr"]) },
	});
	const m1 = await db.okrObjective.findUniqueOrThrow({
		where: { id: M1 },
		select: { title: true, keyResults: { select: { id: true, title: true } } },
	});
	const ten = (k: string) => m1.keyResults.find((x) => x.id === k)?.title ?? "";
	[id.capBo, id.k1, id.k2, id.k3] = (await gieoDong(M1, null, [
		dongMau({
			loai: "viet-lai",
			objectiveId: M1,
			truong: "title",
			truoc: m1.title,
			sau: "Bán lẻ miền Bắc lớn đều qua từng tháng",
		}),
		dongMau({
			loai: "viet-lai",
			objectiveId: M1,
			keyResultId: K1,
			truong: "kr.title",
			truoc: ten(K1),
			sau: `${ten(K1)} trong quý`,
		}),
		dongMau({
			loai: "viet-lai",
			objectiveId: M1,
			keyResultId: K2,
			truong: "kr.title",
			truoc: ten(K2),
			sau: `${ten(K2)}, rõ từng tuần`,
		}),
		dongMau({
			loai: "viet-lai",
			objectiveId: M1,
			keyResultId: K3,
			truong: "kr.title",
			truoc: ten(K3),
			sau: `${ten(K3)} của đối tác mới`,
		}),
	])) as [string, string, string, string];
}, CHO_DB);

afterAll(async () => {
	await ketThucMau(app);
}, CHO_DB);

async function dongViecDangChay(): Promise<void> {
	await db.agentTask.updateMany({
		where: { kind: "okr-de-xuat", finishedAt: null },
		data: { finishedAt: new Date(), outcome: "loi" },
	});
}

async function viecCua(taskId: string) {
	const viec = await db.agentTask.findUnique({
		where: { id: taskId },
		select: { kind: true, payload: true },
	});
	const doc = okrTroLyViec.safeParse(viec?.payload);
	if (
		viec?.kind !== "okr-de-xuat" ||
		!doc.success ||
		doc.data.viec !== "de-xuat"
	)
		throw new Error(
			`viec ${taskId} khong doc duoc: ${viec?.kind} ${doc.error?.message ?? doc.data?.viec}`,
		);
	return doc.data;
}

describe("k3-nhieu-kr", () => {
	test(
		"k3-nhieu-kr nho ca Muc tieu: hai KR va mot KR duoc nhan, khong KR nao bi 403, viec moi khong gan KR",
		async () => {
			const MA_TRAN = [
				{ ai: "hai-kr", mong: 200 },
				{ ai: "mot-kr", mong: 200 },
				{ ai: "khong-kr", mong: 403 },
			] as const;
			for (const ca of MA_TRAN) {
				await dongViecDangChay();
				tienDongHo();
				const tra = await goi(
					app,
					"okr.troLyDeXuat",
					"mutation",
					{ objectiveId: M1 },
					cookie[ca.ai],
				);
				if (ca.ai === "hai-kr" && tra.status === 403)
					throw new Error("nguoi phu trach hai kr bi tu choi");
				expect(`${ca.ai}: ${tra.status}`).toBe(`${ca.ai}: ${ca.mong}`);
				if (ca.mong !== 200) continue;
				const kq = tra.data as { bat: boolean; taskId: string };
				expect(`${ca.ai} bat=${kq.bat}`).toBe(`${ca.ai} bat=true`);
				const viec = await viecCua(kq.taskId);
				expect(`${ca.ai} keyResultId=${viec.keyResultId}`).toBe(
					`${ca.ai} keyResultId=null`,
				);
			}
			await dongViecDangChay();
		},
		CHO_DB,
	);

	test(
		"k3-nhieu-kr danh sach cua nguoi hai KR chi gom gop y cua hai KR do; quyet gop y cap Muc tieu bi 403; nguoi sua Muc tieu thay va nhan duoc",
		async () => {
			const ds = ok<{ dong: { id: string }[] }>(
				await goi(
					app,
					"okr.troLyDanhSach",
					"query",
					{ objectiveId: M1 },
					cookie["hai-kr"],
				),
				"danh sach hai-kr",
			);
			expect(ds.dong.map((d) => d.id).sort()).toEqual([id.k2, id.k3].sort());
			tienDongHo();
			const quyet = await goi(
				app,
				"okr.troLyQuyet",
				"mutation",
				{ deXuatId: id.capBo, cach: "nhan" },
				cookie["hai-kr"],
			);
			expect(`quyet cap muc tieu: ${quyet.status}`).toBe(
				"quyet cap muc tieu: 403",
			);
			const dsTruong = ok<{ dong: { id: string }[] }>(
				await goi(
					app,
					"okr.troLyDanhSach",
					"query",
					{ objectiveId: M1 },
					cookie["sua-muc-tieu"],
				),
				"danh sach sua-muc-tieu",
			);
			expect(dsTruong.dong.map((d) => d.id)).toContain(id.capBo);
			tienDongHo();
			ok(
				await goi(
					app,
					"okr.troLyQuyet",
					"mutation",
					{ deXuatId: id.capBo, cach: "nhan" },
					cookie["sua-muc-tieu"],
				),
				"sua-muc-tieu nhan gop y cap Muc tieu",
			);
		},
		CHO_DB,
	);
});
