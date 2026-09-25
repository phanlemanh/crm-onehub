import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { db } from "@crm/db";
import type { GuiCapNhatInput } from "@crm/validation/okr-cap-nhat";
import { parseOkrVet } from "@crm/validation/okr-vet";
import { OkrCapNhatService } from "../src/okr/okr-cap-nhat.service";
import { OKR } from "../src/okr/okr-config";
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
	phien,
	phienCua,
	type TraLoi,
	taoNam,
	taoQuy,
	truongMoi,
	ungDung,
} from "./okr-san";

const T = OKR.thongDiep;
const C = T.capNhat;

dungSan();

const tuChoi = (r: TraLoi) => `${r.status} ${r.loi}`;

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
	them: Record<string, Json> = {},
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
				...them,
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

type Muc = {
	keyResultId: string;
	value: Json;
	confidence?: string;
	note: string;
};

const gui = (sessionId: string, items: Muc[], ai: AiHoacCookie) =>
	goi("okr.guiCapNhat", { sessionId, items }, ai);

function thuHaiVN(d: Date): string {
	const [nam, thang, ngay] = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Ho_Chi_Minh",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	})
		.format(d)
		.split("-")
		.map(Number);
	const hom = new Date(Date.UTC(nam ?? 0, (thang ?? 1) - 1, ngay ?? 1));
	hom.setUTCDate(hom.getUTCDate() - ((hom.getUTCDay() + 6) % 7));
	return hom.toISOString().slice(0, 10);
}

const soHienTai = async (ids: string[]) =>
	(
		await db.okrKeyResult.findMany({
			where: { id: { in: ids } },
			select: { id: true, currentValue: true },
		})
	)
		.sort((x, y) => ids.indexOf(x.id) - ids.indexOf(y.id))
		.map((k) => Number(k.currentValue));

const demLan = (ids: string[]) =>
	db.okrCheckIn.count({ where: { keyResultId: { in: ids } } });

type DongCapNhat = {
	keyResultId: string;
	currentValue: number;
	lastConfidence: string | null;
	updatedThisWeek: boolean;
};

describe("gui-lo", () => {
	test("gui-lo: lo ba muc ghi 30 o, vet 3 dong, lo hai giu dong cu, router khong co thu tuc sua xoa, 10 ca tu choi ca lo", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("gl");
		const bp = await bpMoi("gl-b");
		const pb = await pbMoi("gl-p", bp);
		const tp = await truongMoi("department", pb, "gl-tp");
		const m = await nguoiMoi("gl-m");
		ok(await datViTri(m, pb), "xep m");
		const n = await nguoiMoi("gl-n");
		ok(await datViTri(n, pb), "xep n");
		const cookieM = await phienCua(m);
		const dvP = { level: "phong-ban", departmentId: pb };

		const a = await mucTieu(quy, dvP, tp.nguoi, tp.cookie);
		const k1 = await taoKr(a, m, tp.cookie, {
			kind: "tang-toi",
			startValue: 0,
			targetValue: 10,
			currentValue: 0,
		});
		const k2 = await taoKr(a, m, tp.cookie, {
			kind: "moc",
			startValue: 0,
			targetValue: 1,
			currentValue: 0,
		});
		const k3 = await taoKr(a, m, tp.cookie, {
			kind: "phan-tram",
			startValue: 0,
			targetValue: 100,
			currentValue: 0,
		});
		const kN = await taoKr(a, n, tp.cookie);
		await congBo(a, tp.cookie);

		const nhap = await mucTieu(quy, dvP, tp.nguoi, tp.cookie);
		const kNhap = await taoKr(nhap, m, tp.cookie);
		const bo = await mucTieu(quy, dvP, tp.nguoi, tp.cookie);
		const kBo = await taoKr(bo, m, tp.cookie);
		await congBo(bo, tp.cookie);
		ok(await goi("okr.dropObjective", { id: bo }, tp.cookie), "bo");
		const quyCham = await kyDangChay("gl-cham");
		const cham = await mucTieu(quyCham, dvP, tp.nguoi, tp.cookie);
		const kCham = await taoKr(cham, m, tp.cookie);
		await congBo(cham, tp.cookie);
		ok(
			await goi("okr.setCyclePhase", { id: quyCham, phase: "cham-diem" }),
			"cham diem",
		);

		const baKr = [k1, k2, k3];
		const truocGui = await doc<{ items: DongCapNhat[] }>(
			"okr.capNhatTuan",
			cookieM,
		);
		expect(
			truocGui.items
				.map((i) => [i.keyResultId, i.lastConfidence, i.updatedThisWeek])
				.sort(),
		).toEqual(baKr.map((id) => [id, null, false]).sort());

		const sid = await moPhien(cookieM);
		const tuanTruoc = thuHaiVN(new Date());
		const tra = ok<{ written: number }>(
			await gui(
				sid,
				[
					{ keyResultId: k1, value: 7, confidence: "cao", note: "a" },
					{ keyResultId: k2, value: 1, confidence: "vua", note: "b" },
					{ keyResultId: k3, value: 40, confidence: "thap", note: "c" },
				],
				cookieM,
			),
			"gui lo",
		);
		const tuan = thuHaiVN(new Date());
		expect([tra.written, tuan]).toEqual([3, tuanTruoc]);

		const dong = (
			await db.okrCheckIn.findMany({ where: { sessionId: sid } })
		).sort((x, y) => baKr.indexOf(x.keyResultId) - baKr.indexOf(y.keyResultId));
		expect(
			dong.map((r) => [
				r.keyResultId,
				r.weekStart.toISOString().slice(0, 10),
				Number(r.value),
				r.confidence,
				r.note,
				r.authorUserId,
				r.ownerUserId,
				r.onBehalf,
				r.channel,
				r.sessionId,
			]),
		).toEqual([
			[k1, tuan, 7, "cao", "a", m, m, false, "web", sid],
			[k2, tuan, 1, "vua", "b", m, m, false, "web", sid],
			[k3, tuan, 40, "thap", "c", m, m, false, "web", sid],
		]);
		expect(await soHienTai(baKr)).toEqual([7, 1, 40]);

		const vet = await db.okrTrail.findMany({
			where: { action: "cap-nhat-tuan", keyResultId: { in: baKr } },
		});
		expect(
			vet
				.map((v) => {
					const truoc = parseOkrVet(v.before);
					const sau = parseOkrVet(v.after);
					return [
						v.keyResultId,
						v.actorUserId,
						truoc?.currentValue ?? null,
						sau?.currentValue ?? null,
						sau?.confidence ?? null,
					];
				})
				.sort(
					(x, y) => baKr.indexOf(String(x[0])) - baKr.indexOf(String(y[0])),
				),
		).toEqual([
			[k1, m, 0, 7, "cao"],
			[k2, m, 0, 1, "vua"],
			[k3, m, 0, 40, "thap"],
		]);

		const cu = dong[0];
		const sid2 = await moPhien(cookieM);
		ok(
			await gui(
				sid2,
				[{ keyResultId: k1, value: 8, confidence: "cao", note: "" }],
				cookieM,
			),
			"lo hai",
		);
		const cuaK1 = await db.okrCheckIn.findMany({
			where: { keyResultId: k1 },
			orderBy: { createdAt: "asc" },
		});
		expect(cuaK1.map((r) => [r.id, Number(r.value), r.sessionId])).toEqual([
			[cu?.id ?? "", 7, sid],
			[cuaK1[1]?.id ?? "", 8, sid2],
		]);

		const nguon = readFileSync(
			new URL("../src/generated/server.ts", import.meta.url),
			"utf8",
		);
		const khoi = nguon.slice(nguon.indexOf("  okr: t.router({"));
		const thuTuc = [
			...khoi
				.slice(0, khoi.indexOf("\n  }),"))
				.matchAll(/^ {4}(\w+): publicProcedure/gm),
		].map((x) => x[1] ?? "");
		expect(thuTuc.length).toBeGreaterThan(20);
		expect(thuTuc.filter((t) => /CheckIn|CapNhat/i.test(t)).sort()).toEqual([
			"capNhatTuan",
			"guiCapNhat",
			"moCapNhat",
		]);

		const tot: Muc = {
			keyResultId: k1,
			value: 9,
			confidence: "cao",
			note: "",
		};
		const CA: [string, Muc, string][] = [
			[
				"thieu confidence",
				{ keyResultId: k2, value: 1, note: "" },
				`400 ${C.tuTinThieu}`,
			],
			[
				"confidence rat-cao",
				{ keyResultId: k2, value: 1, confidence: "rat-cao", note: "" },
				`400 ${C.tuTinThieu}`,
			],
			[
				"value ba",
				{ keyResultId: k3, value: "ba", confidence: "cao", note: "" },
				`400 ${C.giaTriKhongPhaiSo}`,
			],
			[
				"moc = 2",
				{ keyResultId: k2, value: 2, confidence: "cao", note: "" },
				`400 ${C.giaTri["moc-chi-0-1"]}`,
			],
			[
				"phan-tram = 120",
				{ keyResultId: k3, value: 120, confidence: "cao", note: "" },
				`400 ${C.giaTri["phan-tram-ngoai-0-100"]}`,
			],
			[
				"note 201 ky tu",
				{
					keyResultId: k3,
					value: 50,
					confidence: "cao",
					note: "a".repeat(201),
				},
				`400 ${C.ghiChuQuaDai}`,
			],
			[
				"KR nguoi khac, M khong sua duoc don vi",
				{ keyResultId: kN, value: 30, confidence: "cao", note: "" },
				`403 ${C.khongPhaiChuHayTruong}`,
			],
			[
				"KR cua muc tieu nhap",
				{ keyResultId: kNhap, value: 30, confidence: "cao", note: "" },
				`400 ${C.mucTieuChuaCongBo}`,
			],
			[
				"KR cua muc tieu da bo",
				{ keyResultId: kBo, value: 30, confidence: "cao", note: "" },
				`400 ${C.mucTieuChuaCongBo}`,
			],
			[
				"chu ky pha cham-diem",
				{ keyResultId: kCham, value: 30, confidence: "cao", note: "" },
				`400 ${C.kyKhongChay}`,
			],
		];
		const ketQua: Json[] = [];
		const mong: Json[] = [];
		for (const [ten, hong, loi] of CA) {
			const ids = [tot.keyResultId, hong.keyResultId];
			const [demTruoc, soTruoc] = [await demLan(ids), await soHienTai(ids)];
			const r = await gui(await moPhien(cookieM), [tot, hong], cookieM);
			const [demSau, soSau] = [await demLan(ids), await soHienTai(ids)];
			ketQua.push([ten, tuChoi(r), demSau - demTruoc, soSau]);
			mong.push([ten, loi, 0, soTruoc]);
		}
		expect(ketQua).toEqual(mong);

		const sau = await doc<{ items: DongCapNhat[] }>("okr.capNhatTuan", cookieM);
		expect(
			sau.items
				.map((i) => [
					i.keyResultId,
					i.currentValue,
					i.lastConfidence,
					i.updatedThisWeek,
				])
				.sort(),
		).toEqual(
			[
				[k1, 8, "cao", true],
				[k2, 1, "vua", true],
				[k3, 40, "thap", true],
			].sort(),
		);
	});
});

describe("phien-giay", () => {
	test("phien-giay: mo luc T gui luc T+47s ghi 47 giay, khuon chat, phien nguoi khac, gui lan hai, lo loi khong dong phien", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("pg");
		const m = await nguoiMoi("pg-m");
		const n = await nguoiMoi("pg-n");
		const [cookieM, cookieN] = [await phienCua(m), await phienCua(n)];
		const mt = await mucTieu(
			quy,
			{ level: "onehub" },
			phien.quan.nguoi,
			"quan",
		);
		const k = await taoKr(mt, m, "quan");
		await congBo(mt, "quan");
		const svc = ungDung().get(OkrCapNhatService);

		const t0 = new Date("2026-10-06T03:00:00.000Z");
		const t1 = new Date(t0.getTime() + 47_000);
		const { sessionId } = await svc.moCapNhat(m, { entry: "tab" }, t0);
		const docPhien = () =>
			db.okrCheckInSession.findUniqueOrThrow({ where: { id: sessionId } });
		expect((await docPhien()).openedAt.toISOString()).toBe(t0.toISOString());

		const dung: GuiCapNhatInput["items"][number] = {
			keyResultId: k,
			value: 25,
			confidence: "cao",
			note: "",
		};
		const dem = () => db.okrCheckIn.count({ where: { keyResultId: k } });
		const CA: [string, Json, AiHoacCookie, (r: TraLoi) => string][] = [
			[
				"tu tin la",
				{ sessionId, items: [{ ...dung, confidence: "la" }] },
				cookieM,
				(r) => tuChoi(r),
			],
			[
				"them seconds",
				{ sessionId, items: [dung], seconds: 1 },
				cookieM,
				(r) => `${r.status} ${r.loi.includes("seconds")}`,
			],
			[
				"them authorUserId",
				{ sessionId, items: [dung], authorUserId: m },
				cookieM,
				(r) => `${r.status} ${r.loi.includes("authorUserId")}`,
			],
			[
				"phien cua nguoi khac",
				{ sessionId, items: [dung] },
				cookieN,
				(r) => tuChoi(r),
			],
		];
		const ketQua: Json[] = [];
		for (const [ten, vao, ai, bieu] of CA) {
			const truoc = await dem();
			const r = await goi("okr.guiCapNhat", vao, ai);
			ketQua.push([
				ten,
				bieu(r),
				(await dem()) - truoc,
				(await docPhien()).submittedAt?.toISOString() ?? null,
			]);
		}
		expect(ketQua).toEqual([
			["tu tin la", `400 ${C.tuTinThieu}`, 0, null],
			["them seconds", "400 true", 0, null],
			["them authorUserId", "400 true", 0, null],
			["phien cua nguoi khac", `403 ${C.phienKhongCua}`, 0, null],
		]);

		expect(await svc.guiCapNhat(m, { sessionId, items: [dung] }, t1)).toEqual({
			written: 1,
			seconds: 47,
		});
		const p = await docPhien();
		expect([
			p.openedAt.toISOString(),
			p.submittedAt?.toISOString() ?? null,
			p.seconds,
		]).toEqual([t0.toISOString(), t1.toISOString(), 47]);
		const cuaK = await db.okrCheckIn.findMany({ where: { keyResultId: k } });
		expect(cuaK.map((r) => r.sessionId)).toEqual([sessionId]);

		const truocLai = await dem();
		const lai = await goi(
			"okr.guiCapNhat",
			{ sessionId, items: [{ ...dung, value: 26 }] },
			cookieM,
		);
		expect([tuChoi(lai), (await dem()) - truocLai]).toEqual([
			`400 ${C.phienDaGui}`,
			0,
		]);

		const sid2 = await moPhien(cookieM);
		const hong = await gui(sid2, [{ ...dung, confidence: "la" }], cookieM);
		const p2 = await db.okrCheckInSession.findUniqueOrThrow({
			where: { id: sid2 },
		});
		expect([tuChoi(hong), p2.submittedAt]).toEqual([
			`400 ${C.tuTinThieu}`,
			null,
		]);
		const lai2 = await gui(sid2, [{ ...dung, value: 27 }], cookieM);
		expect([
			lai2.status,
			(await db.okrCheckInSession.findUniqueOrThrow({ where: { id: sid2 } }))
				.submittedAt !== null,
			await dem(),
		]).toEqual([200, true, 2]);
	});
});

describe("ghi-ho", () => {
	test("ghi-ho: ma tran 5 nguoi x KR1 va 2 o KR3, ghi ho mang tac gia va nguoi phu trach", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("gh");
		const bp = await bpMoi("gh-b");
		const p = await pbMoi("gh-p", bp);
		const p2 = await pbMoi("gh-p2", bp);
		const tp = await truongMoi("department", p, "gh-tp");
		const tp2 = await truongMoi("department", p2, "gh-tp2");
		const tb = await truongMoi("division", bp, "gh-tb");
		const m = await nguoiMoi("gh-m");
		ok(await datViTri(m, p), "xep m");
		const n = await nguoiMoi("gh-n");
		ok(await datViTri(n, p), "xep n");
		const [cookieM, cookieN] = [await phienCua(m), await phienCua(n)];

		const a = await mucTieu(
			quy,
			{ level: "phong-ban", departmentId: p },
			tp.nguoi,
			tp.cookie,
		);
		const kr1 = await taoKr(a, m, tp.cookie);
		await taoKr(a, n, tp.cookie);
		await congBo(a, tp.cookie);
		const goc = await mucTieu(
			quy,
			{ level: "onehub" },
			phien.quan.nguoi,
			"quan",
		);
		const kr3 = await taoKr(goc, n, "quan");
		await congBo(goc, "quan");

		const NGUOI = {
			TP: { id: tp.nguoi, cookie: tp.cookie },
			TP2: { id: tp2.nguoi, cookie: tp2.cookie },
			N: { id: n, cookie: cookieN },
			M: { id: m, cookie: cookieM },
			TB: { id: tb.nguoi, cookie: tb.cookie },
			admin: { id: phien.quan.nguoi, cookie: "quan" },
		};
		const KR = { KR1: kr1, KR3: kr3 };
		const CHU = { KR1: m, KR3: n };
		const O: [keyof typeof NGUOI, keyof typeof KR][] = [
			["TP", "KR1"],
			["TP2", "KR1"],
			["N", "KR1"],
			["M", "KR1"],
			["TB", "KR1"],
			["admin", "KR3"],
			["TP", "KR3"],
		];
		const ketQua: Json[] = [];
		let so = 0;
		for (const [ai, tenKr] of O) {
			const nguoi = NGUOI[ai];
			const id = KR[tenKr];
			so += 1;
			const truoc = await demLan([id]);
			const sid = await moPhien(nguoi.cookie);
			const r = await gui(
				sid,
				[{ keyResultId: id, value: 20 + so, confidence: "vua", note: "" }],
				nguoi.cookie,
			);
			if (r.status !== 200) {
				ketQua.push([ai, tenKr, tuChoi(r), (await demLan([id])) - truoc]);
				continue;
			}
			const dong = await db.okrCheckIn.findFirstOrThrow({
				where: { sessionId: sid },
			});
			ketQua.push([
				ai,
				tenKr,
				200,
				dong.authorUserId === nguoi.id,
				dong.ownerUserId === CHU[tenKr],
				dong.onBehalf,
			]);
		}
		expect(ketQua).toEqual([
			["TP", "KR1", 200, true, true, true],
			["TP2", "KR1", `403 ${C.khongPhaiChuHayTruong}`, 0],
			["N", "KR1", `403 ${C.khongPhaiChuHayTruong}`, 0],
			["M", "KR1", 200, true, true, false],
			["TB", "KR1", 200, true, true, true],
			["admin", "KR3", 200, true, true, true],
			["TP", "KR3", `403 ${C.khongPhaiChuHayTruong}`, 0],
		]);
	});
});

describe("xoa-kr-da-cap-nhat", () => {
	test("xoa-kr-da-cap-nhat: KR chua cap nhat xoa duoc, KR co 2 lan cap nhat bi tu choi 400 va giu nguyen", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("xk");
		const p = await pbMoi("xk-p");
		const tp = await truongMoi("department", p, "xk-tp");
		const m = await nguoiMoi("xk-m");
		const cookieM = await phienCua(m);
		const a = await mucTieu(
			quy,
			{ level: "phong-ban", departmentId: p },
			tp.nguoi,
			tp.cookie,
		);
		const kra = await taoKr(a, m, tp.cookie);
		const krb = await taoKr(a, m, tp.cookie);
		await congBo(a, tp.cookie);
		for (const value of [25, 30]) {
			ok(
				await gui(
					await moPhien(cookieM),
					[{ keyResultId: kra, value, confidence: "cao", note: "" }],
					cookieM,
				),
				`cap nhat ${value}`,
			);
		}
		const lanA = async () =>
			(
				await db.okrCheckIn.findMany({
					where: { keyResultId: kra },
					orderBy: { id: "asc" },
				})
			).map((r) => [r.id, Number(r.value)]);
		const truoc = await lanA();
		expect(truoc.length).toBe(2);

		const xoaB = await goi("okr.removeKeyResult", { id: krb }, tp.cookie);
		const xoaA = await goi("okr.removeKeyResult", { id: kra }, tp.cookie);
		expect([
			tuChoi(xoaB),
			await db.okrKeyResult.count({ where: { id: krb } }),
			tuChoi(xoaA),
			await db.okrKeyResult.count({ where: { id: kra } }),
			await lanA(),
		]).toEqual(["200 ", 0, `400 ${T.krDaCapNhat}`, 1, truoc]);
	});
});

type KrCo = { id: string; hienTaiQuaCapNhat: boolean };

describe("hien-tai-khoa", () => {
	test("hien-tai-khoa: 24 o 3 KR x 2 nguoi x 4 thay doi, o tron, doi chung, co tren okr.objective, cap nhat tuan van doi so", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("ht");
		const namKh = await taoNam("ht-kh-nam", 2026);
		const quyKh = await taoQuy("ht-kh", namKh, "2026-10-01", "2026-12-31");
		const p = await pbMoi("ht-p");
		const tp = await truongMoi("department", p, "ht-tp");
		const m = await nguoiMoi("ht-m");
		ok(await datViTri(m, p), "xep m");
		const cookieM = await phienCua(m);
		const dvP = { level: "phong-ban", departmentId: p };

		const mtA = await mucTieu(quy, dvP, tp.nguoi, tp.cookie);
		const a = await taoKr(mtA, m, tp.cookie);
		await congBo(mtA, tp.cookie);
		const mtB = await mucTieu(quy, dvP, tp.nguoi, tp.cookie);
		const b = await taoKr(mtB, m, tp.cookie);
		const mtC = await mucTieu(quyKh, dvP, tp.nguoi, tp.cookie);
		const c = await taoKr(mtC, m, tp.cookie);
		await congBo(mtC, tp.cookie);

		const KR: [string, string][] = [
			["a", a],
			["b", b],
			["c", c],
		];
		const AI: [string, AiHoacCookie][] = [
			["TP", tp.cookie],
			["M", cookieM],
		];
		const DOI = ["currentValue", "targetValue", "title", "unit"] as const;
		const KHOA = `400 ${T.hienTaiQuaCapNhat}`;
		const mongO = (kr: string, doi: string) =>
			kr === "a" && doi === "currentValue" ? KHOA : "200 ";
		const docKr = (id: string) =>
			db.okrKeyResult.findUniqueOrThrow({ where: { id } });
		const demVet = (id: string) =>
			db.okrTrail.count({ where: { keyResultId: id } });

		let so = 0;
		const ketQua: Json[] = [];
		const mong: Json[] = [];
		for (const [tenKr, id] of KR) {
			for (const [tenAi, ai] of AI) {
				for (const doi of DOI) {
					so += 1;
					const moi = {
						currentValue: 20 + so,
						targetValue: 60 + so,
						title: ma(`ht-ten-${so}`),
						unit: `dv${so}`,
					};
					const truoc = await docKr(id);
					const vetTruoc = await demVet(id);
					const r = await goi(
						"okr.updateKeyResult",
						{ id, [doi]: moi[doi] },
						ai,
					);
					const sau = await docKr(id);
					const o: Json[] = [tenKr, tenAi, doi, tuChoi(r)];
					const mo: Json[] = [tenKr, tenAi, doi, mongO(tenKr, doi)];
					if (mongO(tenKr, doi) === KHOA) {
						o.push(
							Number(truoc.currentValue),
							Number(sau.currentValue),
							JSON.stringify(sau) === JSON.stringify(truoc),
							(await demVet(id)) - vetTruoc,
						);
						mo.push(
							Number(truoc.currentValue),
							Number(truoc.currentValue),
							true,
							0,
						);
					}
					ketQua.push(o);
					mong.push(mo);
				}
			}
		}
		expect(ketQua).toEqual(mong);

		const truocTron = await docKr(a);
		const vetTron = await demVet(a);
		const tron = await goi(
			"okr.updateKeyResult",
			{
				id: a,
				currentValue: Number(truocTron.currentValue) + 5,
				targetValue: Number(truocTron.targetValue) + 7,
			},
			tp.cookie,
		);
		const sauTron = await docKr(a);
		expect([
			"tron",
			tuChoi(tron),
			Number(sauTron.targetValue),
			Number(sauTron.currentValue),
			JSON.stringify(sauTron) === JSON.stringify(truocTron),
			(await demVet(a)) - vetTron,
		]).toEqual([
			"tron",
			KHOA,
			Number(truocTron.targetValue),
			Number(truocTron.currentValue),
			true,
			0,
		]);

		const bang = await goi(
			"okr.updateKeyResult",
			{
				id: a,
				currentValue: Number(sauTron.currentValue),
				targetValue: Number(sauTron.targetValue) + 9,
			},
			tp.cookie,
		);
		const sauBang = await docKr(a);
		expect([
			tuChoi(bang),
			Number(sauBang.targetValue),
			Number(sauBang.currentValue),
		]).toEqual([
			"200 ",
			Number(sauTron.targetValue) + 9,
			Number(sauTron.currentValue),
		]);

		const co: Json[] = [];
		for (const [tenKr, id, mt] of [
			["a", a, mtA],
			["b", b, mtB],
			["c", c, mtC],
		] as const) {
			const ct = await doc<{ keyResults: KrCo[] }>("okr.objective", tp.cookie, {
				id: mt,
			});
			co.push([
				tenKr,
				ct.keyResults.find((k) => k.id === id)?.hienTaiQuaCapNhat ?? null,
			]);
		}
		expect(co).toEqual([
			["a", true],
			["b", false],
			["c", false],
		]);

		const lanTruoc = await demLan([a]);
		ok(
			await gui(
				await moPhien(cookieM),
				[{ keyResultId: a, value: 33, confidence: "vua", note: "" }],
				cookieM,
			),
			"cap nhat tuan a",
		);
		expect([
			Number((await docKr(a)).currentValue),
			(await demLan([a])) - lanTruoc,
		]).toEqual([33, 1]);
	});
});
