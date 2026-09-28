import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { LOAI_NHAC_OKR } from "@crm/db/okr-nhac";
import { mocNhac, viecCanNhac } from "@crm/db/onboarding-nhac";
import {
	guiCapNhatInput,
	LOI_KHUON_CAP_NHAT,
} from "@crm/validation/okr-cap-nhat";
import {
	type ViecCuaToiOutput,
	viecCuaToiOutput,
} from "../src/okr/okr.contracts";
import { OkrTraoDoiService } from "../src/okr/okr-trao-doi.service";
import {
	type AiHoacCookie,
	bpMoi,
	CHUONG_TRINH_RONG,
	datViTri,
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

const CHO_CA_MS = 60_000;

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
	const moc = mocNhac(luc);
	return moc >= luc ? moc : mocNhac(new Date(moc.getTime() + NGAY_MS));
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
	test(
		"vet-khuon: vet do ben ghi that tao sinh duoc giao; ba dot bien khuon hong nem neu ma dong; loi lan toi the va Tong quan",
		async () => {
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
			const tongQuanZ = await goiQuery("dashboard.summary", cZ, {
				scope: "me",
			});
			await db.okrTrail.update({
				where: { id: dong.id },
				data: { after: { ownerUserId: X } },
			});
			expect({
				theX: theX.status === 200,
				theZ: theZ.status === 200,
				tongQuanZ: tongQuanZ.status === 200,
			}).toEqual({ theX: false, theZ: false, tongQuanZ: false });
		},
		CHO_CA_MS,
	);
});

describe("kr-trung", () => {
	test(
		"kr-trung: lo co cung KR hai lan bi tu choi ca lo, khong ghi gi, phien van gui lai duoc; ma tran khuon 4 lo; doi chung lo hai KR khac nhau",
		async () => {
			await caiChuongTrinh();
			const quy = await kyDangChay("kt");
			const pb = await pbMoi("kt-p");
			const tp = await truongMoi("department", pb, "kt-tp");
			const M = await nguoiMoi("kt-m");
			const cM = await phienCua(M);
			const o = await mucTieu(
				quy,
				{ level: "phong-ban", departmentId: pb },
				tp.nguoi,
				tp.cookie,
			);
			const K1 = await taoKr(o, M, tp.cookie);
			const K2 = await taoKr(o, M, tp.cookie);
			await congBo(o, tp.cookie);
			const muc = (keyResultId: string, value: number, confidence: string) => ({
				keyResultId,
				value,
				confidence,
				note: "",
			});
			const phien = await moPhien(cM);
			const dem = async () => ({
				capNhat: await db.okrCheckIn.count({
					where: { keyResultId: { in: [K1, K2] } },
				}),
				vet: await db.okrTrail.count({
					where: { keyResultId: { in: [K1, K2] }, action: "cap-nhat-tuan" },
				}),
				k1: Number(
					(await db.okrKeyResult.findUniqueOrThrow({ where: { id: K1 } }))
						.currentValue,
				),
			});
			const truoc = await dem();
			const trung = await goi(
				"okr.guiCapNhat",
				{ sessionId: phien, items: [muc(K1, 7, "cao"), muc(K1, 8, "vua")] },
				cM,
			);
			const sau = await dem();
			const conMo = (
				await db.okrCheckInSession.findUniqueOrThrow({ where: { id: phien } })
			).submittedAt;
			if (
				trung.status !== 400 ||
				!trung.loi.includes(LOI_KHUON_CAP_NHAT.trungKr)
			) {
				throw new Error(
					`kr-trung: lo [K1,K1] lot khuon (${trung.status} ${trung.loi})`,
				);
			}
			expect({ sau, conMo }).toEqual({ sau: truoc, conMo: null });

			const khuon: [string, string[], boolean][] = [
				["[K1,K1]", ["k1", "k1"], false],
				["[K1,K2,K1]", ["k1", "k2", "k1"], false],
				["[K1,K2]", ["k1", "k2"], true],
				["[K1]", ["k1"], true],
			];
			expect(
				khuon.map(([ten, ds]) => [
					ten,
					guiCapNhatInput.safeParse({
						sessionId: "phien",
						items: ds.map((k) => muc(k, 1, "cao")),
					}).success,
				]),
			).toEqual(khuon.map(([ten, , hop]) => [ten, hop]));

			ok(
				await goi(
					"okr.guiCapNhat",
					{ sessionId: phien, items: [muc(K1, 7, "cao"), muc(K2, 1, "vua")] },
					cM,
				),
				"lo hai KR khac nhau",
			);
			expect(await db.okrCheckIn.count({ where: { sessionId: phien } })).toBe(
				2,
			);
		},
		CHO_CA_MS,
	);
});

describe("mot-luat-ghi", () => {
	test(
		"mot-luat-ghi: ma tran 5 nguoi x 3 cap KR — canEditKr, sua KR, gui cap nhat tuan cung mot cau tra loi va bang bang viet truoc",
		async () => {
			await caiChuongTrinh();
			const quy = await kyDangChay("ml");
			const bp = await bpMoi("ml-b");
			const pb = await pbMoi("ml-p", bp);
			const TB = await truongMoi("division", bp, "ml-tb");
			const TP = await truongMoi("department", pb, "ml-tp");
			const C = await nguoiMoi("ml-c");
			ok(await datViTri(C, pb), "xep C vao P");
			const Q = await nguoiMoi("ml-q", "admin");
			const N = await nguoiMoi("ml-n");
			const cC = await phienCua(C);
			const oP = await mucTieu(
				quy,
				{ level: "phong-ban", departmentId: pb },
				TP.nguoi,
				TP.cookie,
			);
			const oB = await mucTieu(
				quy,
				{ level: "bo-phan", divisionId: bp },
				TB.nguoi,
				TB.cookie,
			);
			const oN = await mucTieu(
				quy,
				{ level: "ca-nhan", personUserId: C },
				C,
				cC,
			);
			const kr = [
				["phong-ban", oP, await taoKr(oP, C, TP.cookie)],
				["bo-phan", oB, await taoKr(oB, C, TB.cookie)],
				["ca-nhan", oN, await taoKr(oN, C, cC)],
			] as const;
			await congBo(oP, TP.cookie);
			await congBo(oB, TB.cookie);
			await congBo(oN, cC);

			const nguoi = [
				["C", cC, [true, true, true]],
				["TP", TP.cookie, [true, false, true]],
				["TB", TB.cookie, [true, true, true]],
				["Q", await phienCua(Q), [false, false, false]],
				["N", await phienCua(N), [false, false, false]],
			] as const;
			const lech: string[] = [];
			const bang: Record<string, boolean[]> = {};
			for (const [ten, cookie, mongHang] of nguoi) {
				const hang: boolean[] = [];
				for (const [i, [cap, o, k]] of kr.entries()) {
					const xem = await goiQuery("okr.objective", cookie, { id: o });
					const a =
						xem.status === 200 &&
						(xem.data as { canEditKr: string[] }).canEditKr.includes(k);
					const sua = await goi(
						"okr.updateKeyResult",
						{ id: k, title: ma(`ml ${ten} ${cap}`) },
						cookie,
					);
					const b = sua.status === 200;
					const truoc = await db.okrCheckIn.count({
						where: { keyResultId: k },
					});
					const gui = await goi(
						"okr.guiCapNhat",
						{
							sessionId: await moPhien(cookie),
							items: [
								{ keyResultId: k, value: 25, confidence: "vua", note: "" },
							],
						},
						cookie,
					);
					const c = gui.status === 200;
					const sau = await db.okrCheckIn.count({ where: { keyResultId: k } });
					if (sau - truoc !== (c ? 1 : 0)) {
						lech.push(`${ten} x ${cap} dem ${sau - truoc}`);
					}
					const mong = mongHang[i];
					if (a !== b || b !== c || c !== mong) {
						lech.push(`${ten} x ${cap} a=${a} b=${b} c=${c}`);
					}
					hang.push(a);
				}
				bang[ten] = hang;
			}
			if (lech.length > 0) throw new Error(`mot-luat: ${lech.join(" | ")}`);
			expect(bang).toEqual(
				Object.fromEntries(
					nguoi.map(([ten, , mongHang]) => [ten, [...mongHang]]),
				),
			);
		},
		CHO_CA_MS,
	);
});

describe("the-truc-tiep", () => {
	test(
		"the-truc-tiep: nhac ten 14:00 D hien tren the o 14:05 D, 23:00 D, 08:31 D+1, 13:59 D+1, het o 14:01 D+1; tRPC bang service; ke hoach Tong quan van song",
		async () => {
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
			await db.okrComment.update({
				where: { id: c },
				data: { createdAt: luc },
			});
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
				quaTrpc.viec.some(
					(v) => v.loai === "okr-nhac-ten" && v.commentId === c,
				),
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
		},
		CHO_CA_MS,
	);
});

describe("du-duong", () => {
	test(
		"du-duong: nam loai muc OKR do duong ghi that tao, okr.viecCuaToi tra du nam loai va qua khuon dau ra",
		async () => {
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
			ok(
				await goi("okr.follow", { objectiveId: o3, on: true }, cX),
				"X theo o3",
			);
			ok(
				await goi(
					"okr.guiCapNhat",
					{
						sessionId: await moPhien(tp.cookie),
						items: [
							{ keyResultId: k3, value: 30, confidence: "cao", note: "" },
						],
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
		},
		CHO_CA_MS,
	);
});
