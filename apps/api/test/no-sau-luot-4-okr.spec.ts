import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { LOAI_NHAC_OKR } from "@crm/db/okr-nhac";
import { viecCanNhac } from "@crm/db/onboarding-nhac";
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
	goiQuery,
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

function sangSau(luc: Date): Date {
	const ngay = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Ho_Chi_Minh",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(luc);
	const moc = new Date(`${ngay}T08:31:00+07:00`);
	return moc > luc ? moc : new Date(moc.getTime() + NGAY_MS);
}

async function viecNhacSang(userId: string, sau: Date) {
	const now = sangSau(sau);
	return (
		(await viecCanNhac(db, { now, userId, cuaSo: "buoi-sang" })).get(userId) ??
		[]
	);
}

async function loiCua(chay: () => Promise<unknown>): Promise<string> {
	try {
		await chay();
		return "";
	} catch (e) {
		return e instanceof Error ? e.message : String(e);
	}
}

describe("vet-khuon", () => {
	test("vet-khuon: vet do ben ghi that tao sinh duoc giao; ba dot bien khuon hong nem neu ma dong; loi lan toi the va Tong quan", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("vk");
		await db.okrCycle.update({
			where: { id: quy },
			data: { updateWeekday: 1 },
		});
		const C = await nguoiMoi("vk-c");
		const X = await nguoiMoi("vk-x");
		const Z = await nguoiMoi("vk-z");
		const [cX, cZ] = [await phienCua(X), await phienCua(Z)];
		const o = await mucTieu(quy, { level: "onehub" }, C, "quan");
		const k1 = await taoKr(o, C, "quan");
		const kZ = await taoKr(o, Z, "quan");
		await congBo(o, "quan");
		await db.okrKeyResult.update({
			where: { id: kZ },
			data: { startLockedAt: new Date(Date.now() - 20 * NGAY_MS) },
		});
		await db.okrTrail.updateMany({
			where: { objectiveId: o },
			data: { at: new Date(Date.now() - 3 * NGAY_MS) },
		});
		ok(
			await goi("okr.updateKeyResult", { id: k1, ownerUserId: X }, "quan"),
			"quan tri giao k1 cho X",
		);
		const dong = await db.okrTrail.findFirstOrThrow({
			where: { keyResultId: k1, action: "sua-kr" },
			orderBy: [{ at: "desc" }, { id: "desc" }],
		});
		const giao = (await viecNhacSang(X, dong.at)).filter(
			(v) => v.loai === "okr-duoc-giao",
		);
		expect(giao).toEqual([
			{
				loai: "okr-duoc-giao",
				objectiveId: o,
				keyResultId: k1,
				nhan: expect.any(String),
			},
		]);

		const cauLoi = `Vết OKR ${dong.id} không đọc được`;
		const ca: Record<string, string> = {};
		for (const [ten, after] of [
			["ownerUserId so", { ownerUserId: 123 }],
			["after chuoi", "x"],
			["after mang", [1]],
		] as const) {
			await db.okrTrail.update({ where: { id: dong.id }, data: { after } });
			ca[ten] = await loiCua(() => viecNhacSang(X, dong.at));
		}
		const nuot = Object.entries(ca).filter(([, l]) => !l.includes(cauLoi));
		if (nuot.length > 0) {
			throw new Error(
				`vet-khuon: vet hong bi nuot (${nuot.map(([t]) => t).join(", ")})`,
			);
		}

		await db.okrTrail.update({
			where: { id: dong.id },
			data: { after: { title: "t" } },
		});
		expect(await loiCua(() => viecNhacSang(X, dong.at))).toBe("");
		expect(
			(await viecNhacSang(X, dong.at)).filter(
				(v) => v.loai === "okr-duoc-giao" && v.keyResultId === k1,
			),
		).toEqual([]);

		await db.okrTrail.update({
			where: { id: dong.id },
			data: { after: { ownerUserId: 123 } },
		});
		const theX = await goiQuery("okr.viecCuaToi", cX);
		const theZ = await goiQuery("okr.viecCuaToi", cZ);
		const tongQuanZ = await goiQuery("dashboard.summary", cZ, { scope: "me" });
		await db.okrTrail.update({
			where: { id: dong.id },
			data: { after: { ownerUserId: X } },
		});
		expect({
			theX: theX.status === 200,
			theZ: theZ.status === 200,
			tongQuanZ: tongQuanZ.status === 200,
		}).toEqual({ theX: false, theZ: false, tongQuanZ: false });
	});
});

describe("the-truc-tiep", () => {
	test("the-truc-tiep: nhac ten 14:00 D hien tren the o 14:05 D, 23:00 D, 08:31 D+1, 13:59 D+1, het o 14:01 D+1; tRPC bang service; ke hoach Tong quan van song", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("tt");
		const pb = await pbMoi("tt-p");
		const tp = await truongMoi("department", pb, "tt-tp");
		const X = await nguoiMoi("tt-x");
		const cX = await phienCua(X);
		const o = await mucTieu(
			quy,
			{ level: "phong-ban", departmentId: pb },
			tp.nguoi,
			tp.cookie,
		);
		await taoKr(o, tp.nguoi, tp.cookie);
		await congBo(o, tp.cookie);
		const c = ok<{ id: string }>(
			await goi(
				"okr.addComment",
				{ objectiveId: o, body: "nho X", mentionUserIds: [X] },
				tp.cookie,
			),
			"nhac ten X",
		).id;
		const ngay = new Intl.DateTimeFormat("en-CA", {
			timeZone: "Asia/Ho_Chi_Minh",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}).format(new Date());
		const luc = new Date(`${ngay}T14:00:00+07:00`);
		await db.okrComment.update({ where: { id: c }, data: { createdAt: luc } });
		const svc = ungDung().get(OkrTraoDoiService);
		const moc: [string, number][] = [
			["14:05 D", 5 * 60_000],
			["23:00 D", 9 * GIO_MS],
			["08:31 D+1", 18 * GIO_MS + 31 * 60_000],
			["13:59 D+1", 24 * GIO_MS - 60_000],
			["14:01 D+1", 24 * GIO_MS + 60_000],
		];
		const bang: Record<string, boolean> = {};
		for (const [ten, lech] of moc) {
			const viec = (await svc.viecCuaToi(X, new Date(luc.getTime() + lech)))
				.viec;
			bang[ten] = viec.some(
				(v) => v.loai === "okr-nhac-ten" && v.commentId === c,
			);
		}
		if (!bang["14:05 D"]) throw new Error("the-truc-tiep: vang luc 14:05 D");
		expect(bang).toEqual({
			"14:05 D": true,
			"23:00 D": true,
			"08:31 D+1": true,
			"13:59 D+1": true,
			"14:01 D+1": false,
		});

		await db.okrComment.update({
			where: { id: c },
			data: { createdAt: new Date(Date.now() - 60_000) },
		});
		const quaTrpc = await doc<ViecCuaToiOutput>("okr.viecCuaToi", cX);
		const quaSvc = await svc.viecCuaToi(X);
		expect(quaTrpc.viec.map((v) => v.loai)).toEqual(
			quaSvc.viec.map((v) => v.loai),
		);
		expect(
			quaTrpc.viec.some((v) => v.loai === "okr-nhac-ten" && v.commentId === c),
		).toBe(true);

		const congTy = await db.company.create({ data: { name: ma("tt-ct") } });
		const keHoach = await db.onboardingPlan.create({
			data: {
				companyId: congTy.id,
				ownerId: X,
				startedAt: new Date(Date.now() - 6 * NGAY_MS),
				targetDays: 30,
			},
		});
		await db.onboardingStep.create({
			data: {
				planId: keHoach.id,
				departmentId: pb,
				label: "Goi dien",
				assigneeId: X,
				dueAt: new Date(Date.now() + 2 * NGAY_MS),
				position: 0,
			},
		});
		const tongQuan = await doc<{ keHoachCanDeY: { planId: string }[] }>(
			"dashboard.summary",
			cX,
			{ scope: "me" },
		);
		expect(tongQuan.keHoachCanDeY.map((k) => k.planId)).toContain(keHoach.id);
	});
});

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
