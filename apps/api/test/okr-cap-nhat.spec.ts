import {
	afterAll,
	afterEach,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { readFileSync } from "node:fs";
import { KHONG_TRONG_PHAM_VI } from "@crm/auth";
import { db } from "@crm/db";
import { chupKrCrm } from "@crm/db/okr-chi-so";
import { type ViecNhac, viecCanNhac } from "@crm/db/onboarding-nhac";
import { WORKSPACE_ID } from "@crm/db/workspace";
import type { GuiCapNhatInput } from "@crm/validation/okr-cap-nhat";
import { parseOkrNguon } from "@crm/validation/okr-nguon";
import { LOI_KHUON_TRAO_DOI } from "@crm/validation/okr-trao-doi";
import { type OkrVetSnapshot, parseOkrVet } from "@crm/validation/okr-vet";
import request from "supertest";
import type { ViecCuaToiOutput } from "../src/okr/okr.contracts";
import { OkrCapNhatService } from "../src/okr/okr-cap-nhat.service";
import { OKR } from "../src/okr/okr-config";
import { OkrSoService } from "../src/okr/okr-so.service";
import { OkrTraoDoiService } from "../src/okr/okr-trao-doi.service";
import { keoDaiPhien, sangPha } from "./okr-khep-san";
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

const CHO_MS = 30_000;
const tuChoi = (r: TraLoi) => `${r.status} ${r.loi}`;
const LY_DO_DOI_DICH = "doi dich ngoai ra giua ky";

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
	bangChung?: { url: string; ghiChu: string };
};

const gui = (sessionId: string, items: Muc[], ai: AiHoacCookie) =>
	goi("okr.guiCapNhat", { sessionId, items }, ai);

const datNguon = (vao: Json, ai: AiHoacCookie) =>
	goi("okr.datNguonKr", vao, ai);

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
		ok(await sangPha(quyCham, "cham-diem"), "cham diem");

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
		const ketQua: string[] = [];
		const mong: string[] = [];
		for (const [ten, hong, loi] of CA) {
			const ids = [tot.keyResultId, hong.keyResultId];
			const [demTruoc, soTruoc] = [await demLan(ids), await soHienTai(ids)];
			const r = await gui(await moPhien(cookieM), [tot, hong], cookieM);
			const [demSau, soSau] = [await demLan(ids), await soHienTai(ids)];
			ketQua.push(
				`${ten}: ${tuChoi(r)} · dem +${demSau - demTruoc} · so ${soSau.join("/")}`,
			);
			mong.push(`${ten}: ${loi} · dem +0 · so ${soTruoc.join("/")}`);
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

		const gui47 = await svc.guiCapNhat(m, { sessionId, items: [dung] }, t1);
		const p = await docPhien();
		const cuaK = await db.okrCheckIn.findMany({ where: { keyResultId: k } });
		const truocLai = await dem();
		const lai = await goi(
			"okr.guiCapNhat",
			{ sessionId, items: [{ ...dung, value: 26 }] },
			cookieM,
		);
		expect({
			gui: gui47,
			phien: [
				p.openedAt.toISOString(),
				p.submittedAt?.toISOString() ?? null,
				p.seconds,
			],
			phienCuaDong: cuaK.map((r) => r.sessionId),
			guiLanHai: `${tuChoi(lai)} · dem +${(await dem()) - truocLai}`,
		}).toEqual({
			gui: { written: 1, seconds: 47 },
			phien: [t0.toISOString(), t1.toISOString(), 47],
			phienCuaDong: [sessionId],
			guiLanHai: `400 ${C.phienDaGui} · dem +0`,
		});

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

describe("bang-chung", () => {
	test(
		"bang-chung: KR moc xong khong kem bang chung → 0 hang; kem hop le → 1 checkin + 1 bangChung cung giao dich, vet cap-nhat-tuan va dinh-bang-chung",
		async () => {
			await caiChuongTrinh();
			const quy = await kyDangChay("bc");
			const p = await pbMoi("bc-p");
			const tp = await truongMoi("department", p, "bc-tp");
			const m = await nguoiMoi("bc-m");
			ok(await datViTri(m, p), "xep m");
			const cookieM = await phienCua(m);
			const a = await mucTieu(
				quy,
				{ level: "phong-ban", departmentId: p },
				tp.nguoi,
				tp.cookie,
			);
			const kMoc = await taoKr(a, m, tp.cookie, {
				kind: "moc",
				startValue: 0,
				targetValue: 1,
				currentValue: 0,
			});
			await congBo(a, tp.cookie);

			const demBC = () =>
				db.okrBangChung.count({ where: { keyResultId: kMoc } });
			const demCK = () => db.okrCheckIn.count({ where: { keyResultId: kMoc } });

			ok(
				await gui(
					await moPhien(cookieM),
					[{ keyResultId: kMoc, value: 1, confidence: "cao", note: "" }],
					cookieM,
				),
				"xong khong kem",
			);
			expect([await demCK(), await demBC()]).toEqual([1, 0]);

			ok(
				await gui(
					await moPhien(cookieM),
					[
						{
							keyResultId: kMoc,
							value: 1,
							confidence: "cao",
							note: "",
							bangChung: {
								url: "https://drive.google.com/bc",
								ghiChu: "Ảnh chụp",
							},
						},
					],
					cookieM,
				),
				"xong kem bang chung",
			);
			expect([await demCK(), await demBC()]).toEqual([2, 1]);

			const bc = await db.okrBangChung.findFirstOrThrow({
				where: { keyResultId: kMoc },
			});
			expect([bc.url, bc.ghiChu, bc.tacGiaUserId]).toEqual([
				"https://drive.google.com/bc",
				"Ảnh chụp",
				m,
			]);

			const vetDinh = await db.okrTrail.count({
				where: { keyResultId: kMoc, action: "dinh-bang-chung" },
			});
			const vetCapNhat = await db.okrTrail.count({
				where: { keyResultId: kMoc, action: "cap-nhat-tuan" },
			});
			expect([vetDinh, vetCapNhat]).toEqual([1, 2]);
		},
		CHO_MS,
	);

	test(
		"bang-chung: url javascript: bi Zod tu choi truoc khi mo giao dich — 0 checkin moi, 0 bangChung, currentValue khong doi, phien van mo",
		async () => {
			await caiChuongTrinh();
			const quy = await kyDangChay("bc2");
			const p = await pbMoi("bc2-p");
			const tp = await truongMoi("department", p, "bc2-tp");
			const m = await nguoiMoi("bc2-m");
			ok(await datViTri(m, p), "xep m");
			const cookieM = await phienCua(m);
			const a = await mucTieu(
				quy,
				{ level: "phong-ban", departmentId: p },
				tp.nguoi,
				tp.cookie,
			);
			const kMoc = await taoKr(a, m, tp.cookie, {
				kind: "moc",
				startValue: 0,
				targetValue: 1,
				currentValue: 0,
			});
			await congBo(a, tp.cookie);

			const sid = await moPhien(cookieM);
			const truocSo = await soHienTai([kMoc]);
			const truocCK = await demLan([kMoc]);
			const r = await gui(
				sid,
				[
					{
						keyResultId: kMoc,
						value: 1,
						confidence: "cao",
						note: "",
						bangChung: { url: "javascript:x", ghiChu: "" },
					},
				],
				cookieM,
			);
			const sauSo = await soHienTai([kMoc]);
			const sauCK = await demLan([kMoc]);
			const bc = await db.okrBangChung.count({ where: { keyResultId: kMoc } });
			const phien = await db.okrCheckInSession.findUniqueOrThrow({
				where: { id: sid },
			});
			expect({
				status: r.status,
				so: sauSo,
				ck: sauCK,
				bc,
				submittedAt: phien.submittedAt,
			}).toEqual({
				status: 400,
				so: truocSo,
				ck: truocCK,
				bc: 0,
				submittedAt: null,
			});
		},
		CHO_MS,
	);

	test(
		"bang-chung: kem KR khong phai moc hoac moc gui chua xong — 400 cau ghim, bang khong doi",
		async () => {
			await caiChuongTrinh();
			const quy = await kyDangChay("bc3");
			const p = await pbMoi("bc3-p");
			const tp = await truongMoi("department", p, "bc3-tp");
			const m = await nguoiMoi("bc3-m");
			ok(await datViTri(m, p), "xep m");
			const cookieM = await phienCua(m);
			const a = await mucTieu(
				quy,
				{ level: "phong-ban", departmentId: p },
				tp.nguoi,
				tp.cookie,
			);
			const kTang = await taoKr(a, m, tp.cookie, {
				kind: "tang-toi",
				startValue: 0,
				targetValue: 10,
				currentValue: 0,
			});
			const kMoc = await taoKr(a, m, tp.cookie, {
				kind: "moc",
				startValue: 0,
				targetValue: 1,
				currentValue: 0,
			});
			await congBo(a, tp.cookie);

			const bcVao = { url: "https://drive.google.com/x", ghiChu: "" };
			const ca: [string, string, number][] = [
				["KR tang toi", kTang, 5],
				["KR moc chua xong", kMoc, 0],
			];
			const ket: string[] = [];
			for (const [ten, kr, value] of ca) {
				const truocCK = await demLan([kr]);
				const truocBC = await db.okrBangChung.count({
					where: { keyResultId: kr },
				});
				const r = await gui(
					await moPhien(cookieM),
					[
						{
							keyResultId: kr,
							value,
							confidence: "cao",
							note: "",
							bangChung: bcVao,
						},
					],
					cookieM,
				);
				const sauCK = await demLan([kr]);
				const sauBC = await db.okrBangChung.count({
					where: { keyResultId: kr },
				});
				ket.push(
					`${ten}: ${tuChoi(r)} · ck +${sauCK - truocCK} · bc +${sauBC - truocBC}`,
				);
			}
			expect(ket).toEqual([
				`KR tang toi: 400 ${T.canhKr.chiMocXongDinhDuoc} · ck +0 · bc +0`,
				`KR moc chua xong: 400 ${T.canhKr.chiMocXongDinhDuoc} · ck +0 · bc +0`,
			]);
		},
		CHO_MS,
	);

	test(
		"bang-chung: KR moc nguon may — xong theo currentValue da luu, khong theo gia tri client gui",
		async () => {
			await caiChuongTrinh();
			const quy = await kyDangChay("bc4");
			const p = await pbMoi("bc4-p");
			const tp = await truongMoi("department", p, "bc4-tp");
			const m = await nguoiMoi("bc4-m");
			ok(await datViTri(m, p), "xep m");
			const cookieM = await phienCua(m);
			const a = await mucTieu(
				quy,
				{ level: "phong-ban", departmentId: p },
				tp.nguoi,
				tp.cookie,
			);
			const kMoc = await taoKr(a, m, tp.cookie, {
				kind: "moc",
				startValue: 0,
				targetValue: 1,
				currentValue: 0,
			});
			await congBo(a, tp.cookie);
			await db.okrKeyResult.update({
				where: { id: kMoc },
				data: { source: "api", currentValue: 1 },
			});

			const demBC = () =>
				db.okrBangChung.count({ where: { keyResultId: kMoc } });

			ok(
				await gui(
					await moPhien(cookieM),
					[
						{
							keyResultId: kMoc,
							value: 0,
							confidence: "cao",
							note: "",
							bangChung: {
								url: "https://drive.google.com/may-xong",
								ghiChu: "",
							},
						},
					],
					cookieM,
				),
				"may bao xong (currentValue 1), client gui 0",
			);
			expect(await demBC()).toBe(1);

			await db.okrKeyResult.update({
				where: { id: kMoc },
				data: { currentValue: 0 },
			});
			const truocBC = await demBC();
			const r = await gui(
				await moPhien(cookieM),
				[
					{
						keyResultId: kMoc,
						value: 1,
						confidence: "cao",
						note: "",
						bangChung: {
							url: "https://drive.google.com/may-chua-xong",
							ghiChu: "",
						},
					},
				],
				cookieM,
			);
			expect(`${tuChoi(r)} · bc +${(await demBC()) - truocBC}`).toBe(
				`400 ${T.canhKr.chiMocXongDinhDuoc} · bc +0`,
			);
		},
		CHO_MS,
	);
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
		const O: [keyof typeof NGUOI, keyof typeof KR][] = [
			["TP", "KR1"],
			["TP2", "KR1"],
			["N", "KR1"],
			["M", "KR1"],
			["TB", "KR1"],
			["admin", "KR3"],
			["TP", "KR3"],
		];
		const tenCua = (id: string) =>
			Object.entries(NGUOI).find(([, v]) => v.id === id)?.[0] ?? id;
		const ketQua: string[] = [];
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
				ketQua.push(
					`${ai} × ${tenKr}: ${tuChoi(r)} · dem +${(await demLan([id])) - truoc}`,
				);
				continue;
			}
			const dong = await db.okrCheckIn.findFirstOrThrow({
				where: { sessionId: sid },
			});
			ketQua.push(
				`${ai} × ${tenKr}: ${r.status} · tac gia ${tenCua(dong.authorUserId)} · phu trach ${tenCua(dong.ownerUserId)} · ghi ho ${dong.onBehalf}`,
			);
		}
		const cam = `403 ${C.khongPhaiChuHayTruong} · dem +0`;
		expect(ketQua).toEqual([
			"TP × KR1: 200 · tac gia TP · phu trach M · ghi ho true",
			`TP2 × KR1: ${cam}`,
			`N × KR1: ${cam}`,
			"M × KR1: 200 · tac gia M · phu trach M · ghi ho false",
			"TB × KR1: 200 · tac gia TB · phu trach M · ghi ho true",
			"admin × KR3: 200 · tac gia admin · phu trach N · ghi ho true",
			`TP × KR3: ${cam}`,
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
		const ketQua: string[] = [];
		const mong: string[] = [];
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
						doi === "targetValue"
							? { id, [doi]: moi[doi], lyDoDoiDich: LY_DO_DOI_DICH }
							: { id, [doi]: moi[doi] },
						ai,
					);
					const sau = await docKr(id);
					const o = `${tenKr} · ${tenAi} · ${doi}: ${tuChoi(r)}`;
					const mo = `${tenKr} · ${tenAi} · ${doi}: ${mongO(tenKr, doi)}`;
					if (mongO(tenKr, doi) !== KHOA) {
						ketQua.push(o);
						mong.push(mo);
						continue;
					}
					const hienTai = Number(truoc.currentValue);
					ketQua.push(
						`${o} · hien tai ${hienTai}→${Number(sau.currentValue)} · ban ghi giu ${JSON.stringify(sau) === JSON.stringify(truoc)} · vet +${(await demVet(id)) - vetTruoc}`,
					);
					mong.push(
						`${mo} · hien tai ${hienTai}→${hienTai} · ban ghi giu true · vet +0`,
					);
				}
			}
		}

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
		const banGhi = (k: typeof sauTron) =>
			`dich ${Number(k.targetValue)} · hien tai ${Number(k.currentValue)}`;
		expect({
			maTran: ketQua,
			tron: `${tuChoi(tron)} · ${banGhi(sauTron)} · ban ghi giu ${JSON.stringify(sauTron) === JSON.stringify(truocTron)} · vet +${(await demVet(a)) - vetTron}`,
		}).toEqual({
			maTran: mong,
			tron: `${KHOA} · ${banGhi(truocTron)} · ban ghi giu true · vet +0`,
		});

		const bang = await goi(
			"okr.updateKeyResult",
			{
				id: a,
				currentValue: Number(sauTron.currentValue),
				targetValue: Number(sauTron.targetValue) + 9,
				lyDoDoiDich: LY_DO_DOI_DICH,
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

const GIO_MS = 3_600_000;
const NGAY_MS = 24 * GIO_MS;

const binhLuanMoi = async (vao: Json, ai: AiHoacCookie, nhan: string) =>
	ok<{ id: string }>(await goi("okr.addComment", vao, ai), nhan).id;

const theoDoiMt = (objectiveId: string, on: boolean, ai: AiHoacCookie) =>
	goi("okr.follow", { objectiveId, on }, ai);

const laOkr = (v: ViecNhac) => v.loai.startsWith("okr-");

async function phanOkr(userId: string, now: Date) {
	return (
		(await viecCanNhac(db, { now, userId, cuaSo: "truc-tiep" })).get(userId) ??
		[]
	).filter(laOkr);
}

function thuTucOkr(): string[] {
	const nguon = readFileSync(
		new URL("../src/generated/server.ts", import.meta.url),
		"utf8",
	);
	const khoi = nguon.slice(nguon.indexOf("  okr: t.router({"));
	return [
		...khoi
			.slice(0, khoi.indexOf("\n  }),"))
			.matchAll(/^ {4}(\w+): publicProcedure/gm),
	].map((x) => x[1] ?? "");
}

type DongBinhLuan = {
	id: string;
	body: string;
	keyResultId: string | null;
	keyResultTitle: string | null;
	author: { id: string };
	mentions: { id: string }[];
};

describe("trao-doi", () => {
	test("trao-doi: ma tran 3 binh luan x 5 cot, thu tu, vet khong noi dung, theo doi, 5 ca tu choi, router khong sua xoa", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("td");
		const pb = await pbMoi("td-p");
		const tr = await truongMoi("department", pb, "td-t");
		const M = await nguoiMoi("td-m");
		const R = await nguoiMoi("td-r");
		const D = await nguoiMoi("td-d");
		const [cM, cR] = [await phienCua(M), await phienCua(R)];
		await db.member.deleteMany({ where: { userId: D } });
		const C = phien.okr.nguoi;
		const dvP = { level: "phong-ban", departmentId: pb };
		const O = await mucTieu(quy, dvP, tr.nguoi, tr.cookie);
		const KR1 = await taoKr(O, M, tr.cookie);
		await taoKr(O, tr.nguoi, tr.cookie);
		await congBo(O, tr.cookie);
		const O2 = await mucTieu(quy, dvP, tr.nguoi, tr.cookie);
		const KR9 = await taoKr(O2, tr.nguoi, tr.cookie);

		const a = await binhLuanMoi(
			{ objectiveId: O, body: "a", mentionUserIds: [] },
			cM,
			"M a",
		);
		const b = await binhLuanMoi(
			{
				objectiveId: O,
				keyResultId: KR1,
				body: "b",
				mentionUserIds: [tr.nguoi, M],
			},
			"okr",
			"C b",
		);
		const c = await binhLuanMoi(
			{ objectiveId: O, body: "c", mentionUserIds: [] },
			tr.cookie,
			"T c",
		);

		const dong = await db.okrComment.findMany({
			where: { id: { in: [a, b, c] } },
			include: { mentions: true },
		});
		const hang = (id: string) => {
			const r = dong.find((x) => x.id === id);
			return r
				? [
						r.authorUserId,
						r.objectiveId,
						r.keyResultId,
						r.body,
						r.mentions.map((m) => m.userId).sort(),
					]
				: null;
		};
		expect({ a: hang(a), b: hang(b), c: hang(c) }).toEqual({
			a: [M, O, null, "a", []],
			b: [C, O, KR1, "b", [tr.nguoi, M].sort()],
			c: [tr.nguoi, O, null, "c", []],
		});

		const ds = await doc<{ comments: DongBinhLuan[] }>("okr.comments", cR, {
			objectiveId: O,
		});
		expect(
			ds.comments.map((x) => [
				x.id,
				x.body,
				x.author.id,
				x.keyResultId,
				x.keyResultTitle === null,
				x.mentions.map((m) => m.id).sort(),
			]),
		).toEqual([
			[a, "a", M, null, true, []],
			[b, "b", C, KR1, false, [tr.nguoi, M].sort()],
			[c, "c", tr.nguoi, null, true, []],
		]);

		const vet = await db.okrTrail.findMany({
			where: { objectiveId: O, action: "binh-luan" },
			orderBy: [{ at: "asc" }, { id: "asc" }],
		});
		const giaTri = (j: OkrVetSnapshot | null) =>
			Object.values(j ?? {}).flatMap((x) => (Array.isArray(x) ? x : [x]));
		expect({
			vet: vet.map((v) => [
				v.actorUserId,
				v.keyResultId,
				v.before,
				parseOkrVet(v.after),
			]),
			noiDung: vet
				.flatMap((v) => [
					...giaTri(parseOkrVet(v.before)),
					...giaTri(parseOkrVet(v.after)),
				])
				.filter((x) => ["a", "b", "c"].includes(String(x))),
		}).toEqual({
			vet: [
				[M, null, null, { commentId: a, keyResultId: null, mentions: [] }],
				[
					C,
					KR1,
					null,
					{ commentId: b, keyResultId: KR1, mentions: [tr.nguoi, M] },
				],
				[
					tr.nguoi,
					null,
					null,
					{ commentId: c, keyResultId: null, mentions: [] },
				],
			],
			noiDung: [],
		});

		for (const [ai, nhan] of [
			[cM, "M"],
			["okr", "C"],
			[tr.cookie, "T"],
		] as const)
			ok(await theoDoiMt(O, true, ai), `theo ${nhan}`);
		const demTheo = () => db.okrFollow.count({ where: { objectiveId: O } });
		const demVet = (action: string) =>
			db.okrTrail.count({ where: { objectiveId: O, action } });
		const sauBa = await demTheo();
		const theoLai = ok(await theoDoiMt(O, true, cM), "M theo lai");
		const sauTheoLai = await demTheo();
		const moM = await doc<{ following: boolean; followerCount: number }>(
			"okr.objective",
			cM,
			{ id: O },
		);
		const moR = await doc<{ following: boolean; followerCount: number }>(
			"okr.objective",
			cR,
			{ id: O },
		);
		const cuaM = await doc<{ objectives: { id: string; theoDoi: boolean }[] }>(
			"okr.mine",
			cM,
			{ cycleId: quy },
		);
		const bo = ok(await theoDoiMt(O, false, cM), "M bo theo");
		expect({
			sauBa,
			theoLai,
			sauTheoLai,
			moM: [moM.following, moM.followerCount],
			moR: [moR.following, moR.followerCount],
			mineM: cuaM.objectives.filter((o) => o.id === O).map((o) => o.theoDoi),
			bo,
			sauBo: await demTheo(),
			vetTheoDoi: await demVet("theo-doi"),
			vetBoTheoDoi: await demVet("bo-theo-doi"),
		}).toEqual({
			sauBa: 3,
			theoLai: { following: true, followerCount: 3 },
			sauTheoLai: 3,
			moM: [true, 3],
			moR: [false, 3],
			mineM: [true],
			bo: { following: false, followerCount: 2 },
			sauBo: 2,
			vetTheoDoi: 3,
			vetBoTheoDoi: 1,
		});

		const demGhi = async () => [
			await db.okrComment.count({ where: { objectiveId: { in: [O, O2] } } }),
			await db.okrMention.count({
				where: { comment: { objectiveId: { in: [O, O2] } } },
			}),
		];
		const truoc = await demGhi();
		const CA: [string, Json, string][] = [
			[
				"nhac D da roi",
				{ objectiveId: O, body: "x", mentionUserIds: [D] },
				`400 ${T.traoDoi.nhacKhongConThanhVien}`,
			],
			[
				"nhac ma la",
				{ objectiveId: O, body: "x", mentionUserIds: ["khong-co"] },
				`400 ${T.traoDoi.nhacKhongConThanhVien}`,
			],
			[
				"KR9 voi O",
				{ objectiveId: O, keyResultId: KR9, body: "x", mentionUserIds: [] },
				`400 ${T.traoDoi.krKhacMucTieu}`,
			],
			[
				"body rong",
				{ objectiveId: O, body: "", mentionUserIds: [] },
				`400 ${LOI_KHUON_TRAO_DOI.rong}`,
			],
			[
				"body 2001",
				{ objectiveId: O, body: "x".repeat(2001), mentionUserIds: [] },
				`400 ${LOI_KHUON_TRAO_DOI.quaDai}`,
			],
		];
		const ket: Record<string, string> = {};
		for (const [ten, vao] of CA)
			ket[ten] = tuChoi(await goi("okr.addComment", vao, cM));
		expect({ ket, dem: await demGhi() }).toEqual({
			ket: Object.fromEntries(CA.map(([ten, , loi]) => [ten, loi])),
			dem: truoc,
		});

		expect(
			thuTucOkr()
				.filter((t) => /Comment/i.test(t))
				.sort(),
		).toEqual(["addComment", "comments"]);
	});

	test("trao-doi: thanh vien de nhac ten — nguoi da roi workspace khong co, nguoi con co, vai chi OKR doc duoc, xep theo ten", async () => {
		const con = await nguoiMoi("td-tv-con");
		const chiOkr = await nguoiMoi("td-tv-okr", "okr");
		const roi = await nguoiMoi("td-tv-roi");
		await db.member.deleteMany({ where: { userId: roi } });
		const cOkr = await phienCua(chiOkr);
		const ds = await doc<{ id: string; name: string; email: string }[]>(
			"okr.thanhVien",
			cOkr,
		);
		const ids = ds.map((n) => n.id);
		const tenXep = [...ds]
			.sort(
				(a, b) =>
					a.name.localeCompare(b.name, "vi") ||
					a.email.localeCompare(b.email, "vi"),
			)
			.map((n) => n.id);
		const soThanhVien = await db.member.count({
			where: { organizationId: WORKSPACE_ID },
		});
		expect({
			con: ids.includes(con),
			chiOkr: ids.includes(chiOkr),
			roi: ids.includes(roi),
			xep: ids,
			dem: ds.length,
			khoa: Object.keys(ds[0] ?? {}).sort(),
		}).toEqual({
			con: true,
			chiOkr: true,
			roi: false,
			xep: tenXep,
			dem: soThanhVien,
			khoa: ["email", "id", "name"],
		});
	});
});

const KHOA_VIEC = [
	"loai",
	"krIds",
	"keyResultId",
	"objectiveId",
	"commentId",
] as const;

function khoaViec(ds: readonly ViecNhac[]): string[] {
	return ds.map((v) =>
		KHOA_VIEC.map((k) => {
			const x = k in v ? v[k as keyof typeof v] : undefined;
			return Array.isArray(x) ? x.join("+") : String(x ?? "-");
		}).join(" "),
	);
}

async function nhanhKeHoach(cookie: string) {
	const s = await doc<{ mySteps: Json; keHoachCanDeY: Json }>(
		"dashboard.summary",
		cookie,
		{ scope: "me" },
	);
	return { mySteps: s.mySteps, keHoachCanDeY: s.keHoachCanDeY };
}

describe("viec-cua-toi", () => {
	afterEach(() => setSystemTime());

	test("viec-cua-toi: G, H, F, A so tung phan tu voi viecCanNhac o hai moc now; tRPC bang service; ke hoach tren Tong quan khong doi", async () => {
		await keoDaiPhien();
		setSystemTime(new Date("2026-10-14T08:00:00Z"));
		await caiChuongTrinh();
		const quy = await kyDangChay("vc");
		const pb = await pbMoi("vc-p");
		const tp = await truongMoi("department", pb, "vc-tp");
		const G = await nguoiMoi("vc-g");
		const G2 = await nguoiMoi("vc-g2");
		const H = await nguoiMoi("vc-h");
		const F = await nguoiMoi("vc-f");
		const A = await nguoiMoi("vc-a");
		const [cG, cH, cF, cA] = [
			await phienCua(G),
			await phienCua(H),
			await phienCua(F),
			await phienCua(A),
		];
		const congTy = await db.company.create({ data: { name: ma("vc-ct") } });
		const keHoach = await db.onboardingPlan.create({
			data: {
				companyId: congTy.id,
				ownerId: G,
				startedAt: new Date(Date.now() - 8 * NGAY_MS),
				targetDays: 30,
			},
		});
		await db.onboardingStep.create({
			data: {
				planId: keHoach.id,
				departmentId: pb,
				label: "Goi dien",
				assigneeId: G,
				dueAt: new Date(Date.now() - NGAY_MS),
				position: 0,
			},
		});
		const keHoachTruoc = await nhanhKeHoach(cG);

		const dvP = { level: "phong-ban", departmentId: pb };
		const O = await mucTieu(quy, dvP, tp.nguoi, tp.cookie);
		const kG = await taoKr(O, G, tp.cookie);
		const kX = await taoKr(O, tp.nguoi, tp.cookie);
		await congBo(O, tp.cookie);
		ok(
			await goi("okr.updateKeyResult", { id: kX, ownerUserId: G2 }, tp.cookie),
			"doi chu kX",
		);
		const OG = await mucTieu(quy, { level: "ca-nhan", personUserId: G }, G, cG);
		await taoKr(OG, G, cG);
		ok(await theoDoiMt(O, true, cF), "F theo O");
		ok(
			await gui(
				await moPhien(cG),
				[{ keyResultId: kG, value: 30, confidence: "cao", note: "" }],
				cG,
			),
			"G cap nhat",
		);
		const c1 = await binhLuanMoi(
			{ objectiveId: O, body: "xin chao", mentionUserIds: [H] },
			tp.cookie,
			"tp nhac H",
		);
		await binhLuanMoi(
			{ objectiveId: O, body: "cua F", mentionUserIds: [] },
			cF,
			"F tu viet",
		);

		const vetDong = await db.okrTrail.findMany({
			where: { objectiveId: { in: [O, OG] } },
			orderBy: [{ at: "asc" }, { id: "asc" }],
		});
		const hinh = (action: string, keyResultId: string | null) => {
			const v = vetDong.find(
				(x) => x.action === action && x.keyResultId === keyResultId,
			);
			return v
				? [
						v.before === null ? null : Object.keys(parseOkrVet(v.before) ?? {}),
						Object.keys(parseOkrVet(v.after) ?? {}).sort(),
					]
				: null;
		};
		expect({
			taoKr: hinh("tao-kr", kG),
			suaKr: vetDong
				.filter((v) => v.action === "sua-kr" && v.keyResultId === kX)
				.map((v) => [parseOkrVet(v.before), parseOkrVet(v.after)]),
			binhLuan: hinh("binh-luan", null),
			capNhat: hinh("cap-nhat-tuan", kG),
		}).toEqual({
			taoKr: [null, ["kind", "startValue", "targetValue", "title"]],
			suaKr: [[{ ownerUserId: tp.nguoi }, { ownerUserId: G2 }]],
			binhLuan: [null, ["commentId", "keyResultId", "mentions"]],
			capNhat: [["currentValue"], ["confidence", "currentValue", "onBehalf"]],
		});

		const svc = ungDung().get(OkrTraoDoiService);
		const moc = Date.now();
		const ai = { G, H, F, A } as const;
		const thuc: Record<string, string[]> = {};
		const mong: Record<string, string[]> = {};
		for (const [tenMoc, lech] of [
			["+1h", GIO_MS],
			["+30h", 30 * GIO_MS],
		] as const) {
			const now = new Date(moc + lech);
			for (const [ten, id] of Object.entries(ai)) {
				thuc[`${tenMoc} ${ten}`] = khoaViec(
					(await svc.viecCuaToi(id, now)).viec,
				);
				mong[`${tenMoc} ${ten}`] = khoaViec(await phanOkr(id, now));
			}
		}
		expect(thuc).toEqual(mong);
		expect({
			G: thuc["+1h G"],
			H: thuc["+1h H"],
			F: thuc["+1h F"],
			A: thuc["+1h A"],
		}).toEqual({
			G: [`okr-duoc-giao - ${kG} ${O} -`],
			H: [`okr-nhac-ten - - ${O} ${c1}`],
			F: [`okr-theo-doi - - ${O} -`],
			A: [],
		});

		const quaTrpc: Record<string, ViecCuaToiOutput> = {};
		const quaSvc: Record<string, ViecCuaToiOutput> = {};
		for (const [ten, id, cookie] of [
			["G", G, cG],
			["H", H, cH],
			["F", F, cF],
			["A", A, cA],
		] as const) {
			quaTrpc[ten] = await doc<ViecCuaToiOutput>("okr.viecCuaToi", cookie);
			quaSvc[ten] = await svc.viecCuaToi(id);
		}
		expect(quaTrpc).toEqual(quaSvc);
		expect(
			Object.values(quaTrpc).map((x) => x.viec.map((v) => v.loai)),
		).toEqual([["okr-duoc-giao"], ["okr-nhac-ten"], ["okr-theo-doi"], []]);
		expect(await nhanhKeHoach(cG)).toEqual(keHoachTruoc);
	});

	test("viec-cua-toi: co lienQuanOkr ma tran 11 nguoi vai day du, doi chung duong", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("lq");
		const bp = await bpMoi("lq-b");
		const pb = await pbMoi("lq-p", bp);
		const tp = await truongMoi("department", pb, "lq-tp");
		const tbp = await truongMoi("division", bp, "lq-tbp");
		const pbLuu = await pbMoi("lq-luu");
		const luu = await truongMoi("department", pbLuu, "lq-luu");
		const pbTrong = await pbMoi("lq-trong");
		const truongTrong = await truongMoi("department", pbTrong, "lq-truong");
		await db.department.update({
			where: { id: pbLuu },
			data: { archivedAt: new Date() },
		});
		const nguoi = {
			krChay: await nguoiMoi("lq-kr"),
			mtChay: await nguoiMoi("lq-mt"),
			theoChay: await nguoiMoi("lq-theo"),
			khong: await nguoiMoi("lq-khong"),
			thamGia: await nguoiMoi("lq-tg"),
			mtBo: await nguoiMoi("lq-bo"),
			krLap: await nguoiMoi("lq-lap"),
			theoDong: await nguoiMoi("lq-dong"),
		};
		const dvP = { level: "phong-ban", departmentId: pb };
		const O = await mucTieu(quy, dvP, tp.nguoi, tp.cookie);
		await taoKr(O, nguoi.krChay, tp.cookie);
		await congBo(O, tp.cookie);
		await mucTieu(quy, dvP, nguoi.mtChay, tp.cookie);
		ok(await theoDoiMt(O, true, await phienCua(nguoi.theoChay)), "theo chay");
		ok(
			await goi(
				"okr.createObjective",
				{
					cycleId: quy,
					unit: dvP,
					title: ma("tham gia"),
					kind: "cam-ket",
					ownerUserId: tp.nguoi,
					participantIds: [nguoi.thamGia],
					whyNow: "",
				},
				tp.cookie,
			),
			"muc tieu tham gia",
		);
		const oBo = await mucTieu(quy, dvP, nguoi.mtBo, tp.cookie);
		ok(await goi("okr.dropObjective", { id: oBo }, tp.cookie), "bo");
		const namLap = await taoNam("lq-lap-nam", 2027);
		const quyLap = await taoQuy("lq-lap", namLap, "2027-01-01", "2027-03-31");
		const oLap = await mucTieu(quyLap, dvP, tp.nguoi, tp.cookie);
		await taoKr(oLap, nguoi.krLap, tp.cookie);
		const quyDong = await kyDangChay("lq-dong");
		const oDong = await mucTieu(quyDong, dvP, tp.nguoi, tp.cookie);
		ok(
			await theoDoiMt(oDong, true, await phienCua(nguoi.theoDong)),
			"theo dong",
		);
		for (const phase of ["cham-diem", "da-dong"] as const)
			ok(await sangPha(quyDong, phase), `dong ${phase}`);

		const co = async (userId: string) =>
			(await doc<ViecCuaToiOutput>("okr.viecCuaToi", await phienCua(userId)))
				.lienQuanOkr;
		const bang = {
			"phu trach KR o dang-chay": await co(nguoi.krChay),
			"phu trach muc tieu khong KR o dang-chay": await co(nguoi.mtChay),
			"truong phong ban": await co(truongTrong.nguoi),
			"truong bo phan": await co(tbp.nguoi),
			"chi theo doi o dang-chay": await co(nguoi.theoChay),
			"khong dinh gi": await co(nguoi.khong),
			"chi nguoi tham gia": await co(nguoi.thamGia),
			"chi muc tieu da bo": await co(nguoi.mtBo),
			"truong phong ban da luu tru": await co(luu.nguoi),
			"chi KR o lap-ke-hoach": await co(nguoi.krLap),
			"chi theo doi o da-dong": await co(nguoi.theoDong),
		};
		expect(bang).toEqual({
			"phu trach KR o dang-chay": true,
			"phu trach muc tieu khong KR o dang-chay": true,
			"truong phong ban": true,
			"truong bo phan": true,
			"chi theo doi o dang-chay": true,
			"khong dinh gi": false,
			"chi nguoi tham gia": false,
			"chi muc tieu da bo": false,
			"truong phong ban da luu tru": false,
			"chi KR o lap-ke-hoach": false,
			"chi theo doi o da-dong": false,
		});
		await taoKr(O, nguoi.khong, tp.cookie);
		expect({ "khong dinh gi, sau khi giao KR": await co(nguoi.khong) }).toEqual(
			{ "khong dinh gi, sau khi giao KR": true },
		);
	});

	test("viec-cua-toi: co lienQuanOkr truong phong ban khi moi chu ky dang-chay da sang cham-diem", async () => {
		const pb = await pbMoi("lq2-p");
		const tp = await truongMoi("department", pb, "lq2-tp");
		const chay = await db.okrCycle.findMany({
			where: { phase: "dang-chay" },
			select: { id: true },
		});
		const ids = chay.map((c) => c.id);
		await db.okrCycle.updateMany({
			where: { id: { in: ids } },
			data: { phase: "cham-diem" },
		});
		try {
			expect({
				"truong, khong chu ky chay": (
					await doc<ViecCuaToiOutput>("okr.viecCuaToi", tp.cookie)
				).lienQuanOkr,
				"so chu ky dang-chay": await db.okrCycle.count({
					where: { phase: "dang-chay" },
				}),
			}).toEqual({
				"truong, khong chu ky chay": false,
				"so chu ky dang-chay": 0,
			});
		} finally {
			await db.okrCycle.updateMany({
				where: { id: { in: ids } },
				data: { phase: "dang-chay" },
			});
		}
	});
});

describe("chua-noi-kenh", () => {
	test("chua-noi-kenh: U khong kenh van co okr-cap-nhat dung krIds, gui cap nhat ghi cung tap cot voi V co ZaloLink", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("nk");
		const U = await nguoiMoi("nk-u");
		const V = await nguoiMoi("nk-v");
		const [cU, cV] = [await phienCua(U), await phienCua(V)];
		await db.zaloLink.create({
			data: { crmUserId: V, zaloUserId: ma("zv"), zaloDisplayName: "Zalo V" },
		});
		try {
			const O = await mucTieu(
				quy,
				{ level: "onehub" },
				phien.quan.nguoi,
				"quan",
			);
			const KU = await taoKr(O, U, "quan");
			const KV = await taoKr(O, V, "quan");
			await congBo(O, "quan");
			const homKia = new Date(Date.now() - 2 * NGAY_MS);
			await db.okrObjective.update({
				where: { id: O },
				data: { publishedAt: homKia },
			});
			await db.okrKeyResult.updateMany({
				where: { objectiveId: O },
				data: { startLockedAt: homKia },
			});
			const kenhU = [
				await db.zaloLink.count({ where: { crmUserId: U } }),
				await db.slackMemberMatch.count({ where: { crmUserId: U } }),
			];
			const viecU = (await doc<ViecCuaToiOutput>("okr.viecCuaToi", cU)).viec;
			const viecV = (await doc<ViecCuaToiOutput>("okr.viecCuaToi", cV)).viec;
			const capNhat = (ds: ViecCuaToiOutput["viec"]) =>
				ds.flatMap((v) => (v.loai === "okr-cap-nhat" ? [v.krIds] : []));
			const truoc = await demLan([KU, KV]);
			for (const [k, cookie, nhan] of [
				[KU, cU, "U"],
				[KV, cV, "V"],
			] as const)
				ok(
					await gui(
						await moPhien(cookie),
						[{ keyResultId: k, value: 22, confidence: "vua", note: "" }],
						cookie,
					),
					`${nhan} gui`,
				);
			const cot = async (k: string) => {
				const r = await db.okrCheckIn.findFirstOrThrow({
					where: { keyResultId: k },
				});
				return Object.entries(r)
					.filter(([, x]) => x !== null)
					.map(([ten]) => ten)
					.sort();
			};
			expect({
				kenhU,
				capNhatU: capNhat(viecU),
				capNhatV: capNhat(viecV),
				them: (await demLan([KU, KV])) - truoc,
				cotU: await cot(KU),
			}).toEqual({
				kenhU: [0, 0],
				capNhatU: [[KU]],
				capNhatV: [[KV]],
				them: 2,
				cotU: await cot(KV),
			});
		} finally {
			await db.zaloLink.deleteMany({ where: { crmUserId: V } });
		}
	});
});

describe("chuyen-okr", () => {
	test("chuyen-okr: ma tran ban ghi truoc/sau, 4 ca tu choi, vet chuyen-viec, viecCanNhac cua nguoi di va nguoi nhan", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("co");
		const pb = await pbMoi("co-p");
		const tp = await truongMoi("department", pb, "co-tp");
		const H = await nguoiMoi("co-h");
		const Tn = await nguoiMoi("co-t");
		const Mb = await nguoiMoi("co-m");
		const Ng = await nguoiMoi("co-ngoai");
		const [cH, cMb] = [await phienCua(H), await phienCua(Mb)];
		await db.member.deleteMany({ where: { userId: Ng } });
		const dvP = { level: "phong-ban", departmentId: pb };

		const OA = await mucTieu(quy, dvP, tp.nguoi, tp.cookie);
		const KR1 = await taoKr(OA, H, tp.cookie);
		const KR2 = await taoKr(OA, H, tp.cookie);
		await congBo(OA, tp.cookie);
		const O1 = await mucTieu(quy, dvP, H, tp.cookie);
		const OB = await mucTieu(quy, dvP, H, tp.cookie);
		ok(await goi("okr.dropObjective", { id: OB }, tp.cookie), "bo OB");
		const OP = await mucTieu(quy, { level: "ca-nhan", personUserId: H }, H, cH);
		const KRP = await taoKr(OP, H, cH);
		const O2 = ok<{ id: string }>(
			await goi(
				"okr.createObjective",
				{
					cycleId: quy,
					unit: dvP,
					title: ma("o2"),
					kind: "cam-ket",
					ownerUserId: tp.nguoi,
					participantIds: [H],
					whyNow: "",
				},
				tp.cookie,
			),
			"O2",
		).id;
		const quyDong = await kyDangChay("co-dong");
		const OD = await mucTieu(quyDong, dvP, tp.nguoi, tp.cookie);
		const KR3 = await taoKr(OD, H, tp.cookie);
		await congBo(OD, tp.cookie);
		for (const phase of ["cham-diem", "da-dong"] as const)
			ok(await sangPha(quyDong, phase), `dong ${phase}`);
		await db.okrTrail.updateMany({
			where: { objectiveId: OD },
			data: { at: new Date(Date.now() - 3 * NGAY_MS) },
		});
		ok(
			await gui(
				await moPhien(cH),
				[
					{ keyResultId: KR1, value: 21, confidence: "cao", note: "" },
					{ keyResultId: KR2, value: 22, confidence: "vua", note: "" },
				],
				cH,
			),
			"H cap nhat",
		);

		const anh = async () => {
			const krs = await db.okrKeyResult.findMany({
				where: { id: { in: [KR1, KR2, KR3, KRP] } },
				select: { id: true, ownerUserId: true },
			});
			const mts = await db.okrObjective.findMany({
				where: { id: { in: [O1, OP, OB] } },
				select: { id: true, ownerUserId: true },
			});
			const chu = (id: string) =>
				[...krs, ...mts].find((x) => x.id === id)?.ownerUserId ?? null;
			return {
				KR1: chu(KR1),
				KR2: chu(KR2),
				O1: chu(O1),
				KR3: chu(KR3),
				OP: chu(OP),
				KRP: chu(KRP),
				OB: chu(OB),
				lanCapNhat: (
					await db.okrCheckIn.findMany({
						where: { keyResultId: { in: [KR1, KR2] } },
						select: { authorUserId: true },
					})
				).map((c) => c.authorUserId),
				thamGiaO2: (
					await db.okrParticipant.findMany({
						where: { objectiveId: O2 },
						select: { userId: true },
					})
				).map((p) => p.userId),
			};
		};
		const truoc = await anh();
		const CA: [string, () => Promise<TraLoi>, string][] = [
			[
				"member xem truoc",
				() => goiQuery("okr.transferPreview", cMb, { fromUserId: H }),
				`403 ${T.chuyen.canQuanTri}`,
			],
			[
				"member chuyen",
				() => goi("okr.transferWork", { fromUserId: H, toUserId: Tn }, cMb),
				`403 ${T.chuyen.canQuanTri}`,
			],
			[
				"H sang H",
				() => goi("okr.transferWork", { fromUserId: H, toUserId: H }),
				`400 ${T.chuyen.choChinhMinh}`,
			],
			[
				"H sang nguoi ngoai",
				() => goi("okr.transferWork", { fromUserId: H, toUserId: Ng }),
				`400 ${T.khongPhaiThanhVien(Ng)}`,
			],
		];
		const ket: Record<string, string> = {};
		for (const [ten, chay] of CA) ket[ten] = tuChoi(await chay());
		expect({ ket, anh: await anh() }).toEqual({
			ket: Object.fromEntries(CA.map(([ten, , loi]) => [ten, loi])),
			anh: truoc,
		});

		const xemTruoc = await doc("okr.transferPreview", "quan", {
			fromUserId: H,
		});
		const chuyen = ok(
			await goi("okr.transferWork", { fromUserId: H, toUserId: Tn }),
			"chuyen",
		);
		const vet = await db.okrTrail.findMany({
			where: {
				action: "chuyen-viec",
				objectiveId: { in: [OA, O1, OB, OP, O2, OD] },
			},
		});
		const now = new Date();
		expect({
			xemTruoc,
			chuyen,
			anh: await anh(),
			vet: vet
				.map(
					(v) =>
						`${v.keyResultId ?? v.objectiveId} ${JSON.stringify(v.before)} ${JSON.stringify(v.after)}`,
				)
				.sort(),
			viecH: khoaViec(await phanOkr(H, now)),
			viecT: khoaViec(await phanOkr(Tn, now)).sort(),
			xemTruocSau: await doc("okr.transferPreview", "quan", {
				fromUserId: H,
			}),
		}).toEqual({
			xemTruoc: { kr: 2, mucTieu: 1, viec: 0 },
			chuyen: { kr: 2, mucTieu: 1, viec: 0 },
			anh: {
				KR1: Tn,
				KR2: Tn,
				O1: Tn,
				KR3: H,
				OP: H,
				KRP: H,
				OB: H,
				lanCapNhat: [H, H],
				thamGiaO2: [],
			},
			vet: [KR1, KR2, O1]
				.map(
					(id) =>
						`${id} ${JSON.stringify({ ownerUserId: H })} ${JSON.stringify({ ownerUserId: Tn })}`,
				)
				.sort(),
			viecH: [],
			viecT: [
				`okr-duoc-giao - ${KR1} ${OA} -`,
				`okr-duoc-giao - ${KR2} ${OA} -`,
				`okr-duoc-giao - - ${O1} -`,
			].sort(),
			xemTruocSau: { kr: 0, mucTieu: 0, viec: 0 },
		});

		expect({
			xemTruoc: await doc("onboarding.transferPreview", "quan", {
				fromUserId: H,
			}),
			chuyen: ok(
				await goi("onboarding.transferWork", { fromUserId: H, toUserId: Tn }),
				"onboarding chuyen",
			),
		}).toEqual({
			xemTruoc: { keHoach: 0, buoc: 0, viec: 0 },
			chuyen: { keHoach: 0, buoc: 0, viec: 0 },
		});
	});
});

async function goiMa(
	thuTuc: string,
	loai: "query" | "mutation",
	vao: Json | undefined,
	cookie: string,
): Promise<string> {
	const server = ungDung().getHttpServer();
	const res =
		loai === "query"
			? await request(server)
					.get(
						`/api/trpc/${thuTuc}${vao === undefined ? "" : `?input=${encodeURIComponent(JSON.stringify(vao))}`}`,
					)
					.set("cookie", cookie)
			: await request(server)
					.post(`/api/trpc/${thuTuc}`)
					.set("cookie", cookie)
					.set("content-type", "application/json")
					.send(JSON.stringify(vao));
	return res.status === 200
		? "200"
		: `${res.status} ${res.body?.error?.data?.code} ${res.body?.error?.message}`;
}

describe("chi-okr", () => {
	test("chi-okr: ma tran 9 thu tuc moi cho vai okr, chuyen OKR tu choi theo quyen quan tri, doi tac van ngoai pham vi", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("ck");
		const C = phien.okr;
		const O = await mucTieu(quy, { level: "onehub" }, phien.quan.nguoi, "quan");
		const k = await taoKr(O, C.nguoi, "quan");
		await congBo(O, "quan");
		const hang: Record<string, string> = {};
		hang.capNhatTuan = await goiMa(
			"okr.capNhatTuan",
			"query",
			undefined,
			C.cookie,
		);
		const mo = await goi("okr.moCapNhat", { entry: "tab" }, "okr");
		hang.moCapNhat = mo.status === 200 ? "200" : tuChoi(mo);
		const sid =
			mo.status === 200 ? (mo.data as { sessionId: string }).sessionId : "";
		hang.guiCapNhat = await goiMa(
			"okr.guiCapNhat",
			"mutation",
			{
				sessionId: sid,
				items: [{ keyResultId: k, value: 25, confidence: "cao", note: "" }],
			},
			C.cookie,
		);
		hang.viecCuaToi = await goiMa(
			"okr.viecCuaToi",
			"query",
			undefined,
			C.cookie,
		);
		hang.comments = await goiMa(
			"okr.comments",
			"query",
			{ objectiveId: O },
			C.cookie,
		);
		hang.addComment = await goiMa(
			"okr.addComment",
			"mutation",
			{ objectiveId: O, body: "chao", mentionUserIds: [] },
			C.cookie,
		);
		hang.follow = await goiMa(
			"okr.follow",
			"mutation",
			{ objectiveId: O, on: true },
			C.cookie,
		);
		hang.transferPreview = await goiMa(
			"okr.transferPreview",
			"query",
			{ fromUserId: C.nguoi },
			C.cookie,
		);
		hang.transferWork = await goiMa(
			"okr.transferWork",
			"mutation",
			{ fromUserId: C.nguoi, toUserId: phien.quan.nguoi },
			C.cookie,
		);
		hang["contacts.list"] = await goiMa(
			"contacts.list",
			"query",
			undefined,
			C.cookie,
		);
		hang["deals.list"] = await goiMa(
			"deals.list",
			"query",
			undefined,
			C.cookie,
		);
		hang["dashboard.summary"] = await goiMa(
			"dashboard.summary",
			"query",
			{ scope: "me" },
			C.cookie,
		);
		const quanTri = `403 FORBIDDEN ${T.chuyen.canQuanTri}`;
		const ngoai = `403 FORBIDDEN ${KHONG_TRONG_PHAM_VI}`;
		expect(hang).toEqual({
			capNhatTuan: "200",
			moCapNhat: "200",
			guiCapNhat: "200",
			viecCuaToi: "200",
			comments: "200",
			addComment: "200",
			follow: "200",
			transferPreview: quanTri,
			transferWork: quanTri,
			"contacts.list": ngoai,
			"deals.list": ngoai,
			"dashboard.summary": ngoai,
		});
	});
});

type DongCapNhatMay = {
	keyResultId: string;
	currentValue: number;
	nguon: string;
	doCanh: boolean;
	soMay: { giaTri: number; ngay: string; nguon: string } | null;
};

describe("kr-may", () => {
	const krVoiSoChup: string[] = [];

	afterAll(async () => {
		await db.okrSoChup.deleteMany({
			where: { keyResultId: { in: krVoiSoChup } },
		});
	});

	test("kr-may: nguon crm/api giu so may, do canh dien san so moi nhat, lo thieu tu tin bi tu choi ca lo", async () => {
		await caiChuongTrinh();
		const quy = await kyDangChay("km");
		const chu = await nguoiMoi("km-chu");
		const cookieChu = await phienCua(chu);
		const NGAY = "2026-10-15";
		const TRONG_KY = new Date("2026-10-10T03:00:00Z");
		const TRUOC_KY = new Date("2025-01-10T03:00:00Z");

		const a = await mucTieu(
			quy,
			{ level: "ca-nhan", personUserId: chu },
			chu,
			cookieChu,
		);
		const krM = await taoKr(a, chu, cookieChu, {
			startValue: 0,
			targetValue: 20,
			currentValue: 0,
		});
		const krA = await taoKr(a, chu, cookieChu, {
			currentValue: 0,
		});
		const krC = await taoKr(a, chu, cookieChu, { currentValue: 5 });
		const krT = await taoKr(a, chu, cookieChu, { currentValue: 7 });

		ok(
			await datNguon(
				{
					keyResultId: krM,
					loai: "crm",
					chiSo: "thoa-thuan-moi",
					phamVi: { kieu: "nguoi", id: chu },
				},
				cookieChu,
			),
			"nguon M",
		);
		ok(await datNguon({ keyResultId: krA, loai: "api" }, cookieChu), "nguon A");
		await congBo(a, cookieChu);
		ok(
			await datNguon(
				{
					keyResultId: krC,
					loai: "crm",
					chiSo: "thoa-thuan-chot-duoc",
					phamVi: { kieu: "nguoi", id: chu },
				},
				cookieChu,
			),
			"do canh C",
		);

		const cty = await db.company.create({ data: { name: ma("cty-km") } });
		for (let i = 0; i < 15; i++) {
			await db.deal.create({
				data: {
					name: ma("thoa-thuan-moi"),
					companyId: cty.id,
					ownerId: chu,
					stage: "DEMO_BOOKED",
					createdAt: TRONG_KY,
				},
			});
		}
		for (let i = 0; i < 8; i++) {
			await db.deal.create({
				data: {
					name: ma("thoa-thuan-chot"),
					companyId: cty.id,
					ownerId: chu,
					stage: "CLOSED_WON",
					createdAt: TRUOC_KY,
					closedAt: TRONG_KY,
				},
			});
		}
		await chupKrCrm(db, krM, NGAY, parseOkrNguon);
		await chupKrCrm(db, krC, NGAY, parseOkrNguon);
		const so = ungDung().get(OkrSoService);
		await so.ghiSoKr(
			chu,
			{ id: krA, giaTri: 40 },
			new Date(`${NGAY}T03:00:00Z`),
		);
		krVoiSoChup.push(krM, krA, krC);

		const truoc = await doc<{ items: DongCapNhatMay[] }>(
			"okr.capNhatTuan",
			cookieChu,
		);
		const boKr = [krM, krA, krC, krT];
		const cuaBo = (items: DongCapNhatMay[]) =>
			items
				.filter((i) => boKr.includes(i.keyResultId))
				.sort(
					(x, y) => boKr.indexOf(x.keyResultId) - boKr.indexOf(y.keyResultId),
				)
				.map((i) => [
					i.keyResultId,
					i.currentValue,
					i.nguon,
					i.doCanh,
					i.soMay,
				]);
		expect(cuaBo(truoc.items)).toEqual([
			[krM, 15, "crm", false, { giaTri: 15, ngay: NGAY, nguon: "crm" }],
			[krA, 40, "api", false, { giaTri: 40, ngay: NGAY, nguon: "api" }],
			[krC, 5, "tay", true, { giaTri: 8, ngay: NGAY, nguon: "crm" }],
			[krT, 7, "tay", false, null],
		]);

		const demTruoc = await demLan(boKr);
		const sid = await moPhien(cookieChu);
		const tra = ok<{ written: number }>(
			await gui(
				sid,
				[
					{ keyResultId: krM, value: 99, confidence: "cao", note: "" },
					{ keyResultId: krA, value: 99, confidence: "cao", note: "" },
					{ keyResultId: krC, value: 8, confidence: "cao", note: "c" },
					{ keyResultId: krT, value: 7, confidence: "cao", note: "t" },
				],
				cookieChu,
			),
			"gui lo kr-may",
		);
		expect(tra.written).toBe(4);

		const dong = (
			await db.okrCheckIn.findMany({ where: { sessionId: sid } })
		).sort((x, y) => boKr.indexOf(x.keyResultId) - boKr.indexOf(y.keyResultId));
		expect(dong.map((r) => Number(r.value))).toEqual([15, 40, 8, 7]);
		expect(await soHienTai(boKr)).toEqual([15, 40, 8, 7]);
		expect(await demLan(boKr)).toBe(demTruoc + 4);

		const vet = await db.okrTrail.findMany({
			where: { action: "cap-nhat-tuan", keyResultId: { in: boKr } },
		});
		expect(
			vet
				.map((v) => {
					const sau = parseOkrVet(v.after);
					return [v.keyResultId, sau?.currentValue ?? null];
				})
				.sort(
					(x, y) => boKr.indexOf(String(x[0])) - boKr.indexOf(String(y[0])),
				),
		).toEqual([
			[krM, 15],
			[krA, 40],
			[krC, 8],
			[krT, 7],
		]);

		const demTruoc2 = await demLan(boKr);
		const soTruoc2 = await soHienTai(boKr);
		const sid2 = await moPhien(cookieChu);
		const loLo = await gui(
			sid2,
			[
				{ keyResultId: krM, value: 1, note: "" } as Muc,
				{ keyResultId: krA, value: 40, confidence: "cao", note: "" },
				{ keyResultId: krC, value: 9, confidence: "cao", note: "" },
				{ keyResultId: krT, value: 6, confidence: "cao", note: "" },
			],
			cookieChu,
		);
		expect(tuChoi(loLo)).toBe(`400 ${C.tuTinThieu}`);
		expect(await demLan(boKr)).toBe(demTruoc2);
		expect(await soHienTai(boKr)).toEqual(soTruoc2);
	});
});
