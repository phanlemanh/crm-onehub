import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { lienQuanOkr } from "@crm/db/okr-nhac";
import { type ViecNhac, viecCanNhac } from "@crm/db/onboarding-nhac";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { parseNhacPayload } from "@crm/validation/nhac-ke-hoach";
import { chayNhac, chuDeNhac, lenLichNhac } from "../agent/lib/nhac-ke-hoach";
import { dungTin, TIEU_DE } from "../agent/lib/tin-nhac";
import { ZALO } from "../agent/lib/zalo-config";
import {
	gieoKeHoach,
	gieoNguoi,
	moXuong,
	noiSlack,
	slackGia,
} from "./support/nhac-gieo";
import {
	dongCo,
	HAN_XA,
	HOM_QUA,
	hangCua,
	lucVN,
	NGAY_MAI,
	NGAY_NHAC,
	ngayCach,
	PHUT_SAU,
	PHUT_TRUOC,
} from "./support/nhac-gui-gieo";
import {
	batBot,
	binhLuan,
	donOkr,
	GIO_MS,
	ghiNhan,
	gieoBoPhan,
	gieoChuKy,
	gieoHoiY,
	gieoKr,
	gieoMucTieu,
	gieoPhongBan,
	gieoY,
	guiCapNhat,
	noiZalo,
	tatBot,
	theoDoi,
	vet,
	voiToken,
} from "./support/okr-gieo";
import { buocCuaMuc, buocXongLuc, nhan, vetXong } from "./support/tra-loi-gieo";
import { zaloGia } from "./support/zalo-gia";

const APP_URL = "https://crm.test";

const KHOA_MA = [
	"loai",
	"planId",
	"stepId",
	"krIds",
	"keyResultId",
	"objectiveId",
	"commentId",
	"ghiNhanId",
];

function vn(luc: string): Date {
	return new Date(`${luc}+07:00`);
}

async function tinh(now: Date) {
	setSystemTime(now);
	return viecCanNhac(db, { now, cuaSo: "truc-tiep" });
}

function cua(kq: Map<string, ViecNhac[]>, userId: string): ViecNhac[] {
	return kq.get(userId) ?? [];
}

async function slug(): Promise<string> {
	const x = await db.organization.findUniqueOrThrow({
		where: { id: WORKSPACE_ID },
		select: { slug: true },
	});
	return x.slug ?? "";
}

async function hangCuaNguoi(userId: string) {
	return db.agentTask.findMany({
		where: {
			kind: "nhac-ke-hoach",
			subject: { startsWith: `user:${userId}:` },
		},
	});
}

async function guiQuaZalo(userId: string, goc: Date) {
	const z = zaloGia();
	const s = slackGia();
	setSystemTime(goc);
	const ket = await voiToken(async () =>
		chayNhac(await hangCua(userId), {
			fetcher: s.fetcher,
			zaloFetcher: z.fetcher,
			appUrl: APP_URL,
		}),
	);
	const hang = await hangCua(userId);
	return { z, s, ket, hang, payload: parseNhacPayload(hang.payload) };
}

beforeEach(async () => {
	await donOkr();
	await moXuong();
});

afterEach(() => {
	setSystemTime();
});

afterAll(async () => {
	await donOkr();
	await tatBot();
});

describe("nhac-cap-nhat", () => {
	const TUAN_TRUOC = vn("2026-10-05T10:00:00");
	const O_MATRAN = [
		["thu Hai 07:00 truoc gio nhac", vn("2026-10-12T07:00:00")],
		["thu Hai sau khi A gui K1", vn("2026-10-12T09:35:00")],
		["thu Tu", vn("2026-10-14T10:00:00")],
		["Chu nhat 23:00", vn("2026-10-18T23:00:00")],
		["thu Hai tuan sau 06:59", vn("2026-10-19T06:59:00")],
		["thu Hai tuan sau 09:00", vn("2026-10-19T09:00:00")],
	] as const;
	const MONG = [
		{ coViec: true, krIds: ["K1", "K2"] },
		{ coViec: true, krIds: ["K2"] },
		{ coViec: true, krIds: ["K2", "K3"] },
		{ coViec: true, krIds: ["K2", "K3"] },
		{ coViec: true, krIds: ["K1", "K2", "K3"] },
		{ coViec: true, krIds: ["K1", "K2", "K3"] },
	];

	async function gieo() {
		const A = await gieoNguoi("An");
		const C = await gieoNguoi("Cuong");
		const chay = await gieoChuKy("dang-chay", 1);
		const o1 = await gieoMucTieu({
			cycleId: chay,
			chu: A.id,
			congBo: TUAN_TRUOC,
		});
		const K1 = await gieoKr({
			objectiveId: o1,
			chu: A.id,
			khoa: TUAN_TRUOC,
			viTri: 0,
		});
		const K2 = await gieoKr({
			objectiveId: o1,
			chu: A.id,
			khoa: TUAN_TRUOC,
			viTri: 1,
		});
		const K3 = await gieoKr({
			objectiveId: o1,
			chu: A.id,
			khoa: vn("2026-10-12T09:00:00"),
			viTri: 2,
		});
		const nhap = await gieoMucTieu({ cycleId: chay, chu: A.id, congBo: null });
		const KN = await gieoKr({ objectiveId: nhap, chu: A.id, khoa: null });
		const lap = await gieoChuKy("lap-ke-hoach", 1);
		const oLap = await gieoMucTieu({
			cycleId: lap,
			chu: A.id,
			congBo: TUAN_TRUOC,
		});
		const KL = await gieoKr({ objectiveId: oLap, chu: A.id, khoa: TUAN_TRUOC });
		const thuTu = await gieoChuKy("dang-chay", 3);
		const oC = await gieoMucTieu({
			cycleId: thuTu,
			chu: C.id,
			congBo: TUAN_TRUOC,
		});
		const KC = await gieoKr({ objectiveId: oC, chu: C.id, khoa: TUAN_TRUOC });
		await guiCapNhat(K1, A.id, vn("2026-10-12T09:30:00"));
		const ten = new Map([
			[K1, "K1"],
			[K2, "K2"],
			[K3, "K3"],
			[KN, "KN"],
			[KL, "KL"],
			[KC, "KC"],
		]);
		return { A, C, K2, K3, ten };
	}

	function capNhatCua(
		kq: Map<string, ViecNhac[]>,
		userId: string,
		ten: Map<string, string>,
	): { coViec: boolean; krIds: string[] } {
		const v = cua(kq, userId).find((m) => m.loai === "okr-cap-nhat");
		return v && v.loai === "okr-cap-nhat"
			? { coViec: true, krIds: v.krIds.map((id) => ten.get(id) ?? id) }
			: { coViec: false, krIds: [] };
	}

	test("nhac-cap-nhat: ma tran 6 thoi diem x [co viec, krIds] cua A", async () => {
		const g = await gieo();
		const thay = [];
		for (const [o, luc] of O_MATRAN) {
			thay.push({ o, ...capNhatCua(await tinh(luc), g.A.id, g.ten) });
		}
		const mong = O_MATRAN.map(([o], i) => ({ o, ...MONG[i] }));
		expect(
			thay.filter((t, i) => !Bun.deepEquals(t, mong[i])),
			"o lech so voi ma tran viet truoc",
		).toEqual([]);
		expect(thay, "ma tran 6 o okr-cap-nhat").toEqual(mong);
		expect(
			thay.filter((t) => t.krIds.some((k) => k === "KN" || k === "KL")),
			"KR nhap va KR chu ky khac pha khong bao gio co mat",
		).toEqual([]);
	});

	test("nhac-cap-nhat: chu ky updateWeekday 3 -> thu Hai, thu Ba khong, thu Tu co", async () => {
		const g = await gieo();
		const thay = [];
		for (const [o, luc] of [
			["thu Hai", vn("2026-10-12T10:00:00")],
			["thu Ba", vn("2026-10-13T10:00:00")],
			["thu Tu", vn("2026-10-14T10:00:00")],
		] as const) {
			thay.push({ o, ...capNhatCua(await tinh(luc), g.C.id, g.ten) });
		}
		expect(thay, "ma tran updateWeekday 3").toEqual([
			{ o: "thu Hai", coViec: false, krIds: [] },
			{ o: "thu Ba", coViec: false, krIds: [] },
			{ o: "thu Tu", coViec: true, krIds: ["KC"] },
		]);
	});

	test("nhac-cap-nhat: thu Tu A gui du K2 va K3 -> lan tinh ke khong con viec okr-cap-nhat", async () => {
		const g = await gieo();
		const truoc = capNhatCua(
			await tinh(vn("2026-10-14T10:00:00")),
			g.A.id,
			g.ten,
		);
		await guiCapNhat(g.K2, g.A.id, vn("2026-10-14T10:10:00"));
		await guiCapNhat(g.K3, g.A.id, vn("2026-10-14T10:10:00"));
		const kq = await tinh(vn("2026-10-14T10:15:00"));
		expect({
			truoc,
			sau: {
				coViec: cua(kq, g.A.id).some((v) => v.loai === "okr-cap-nhat"),
			},
		}).toEqual({
			truoc: { coViec: true, krIds: ["K2", "K3"] },
			sau: { coViec: false },
		});
	});
});

describe("nhac-im", () => {
	const NOW = vn("2026-10-14T10:00:00");
	const truocNgay = (n: number) => ngayCach(NOW, -n);

	test("nhac-im: ma tran 6 KR x [nguoi phu trach, truong, nguoi truong]", async () => {
		const T = await gieoNguoi("Tam");
		const TB = await gieoNguoi("Bao");
		const P = await gieoNguoi("Phuc");
		const P2 = await gieoNguoi("Phong");
		const D = await gieoPhongBan(T.id);
		const V = await gieoBoPhan(TB.id);
		const D2 = await gieoPhongBan(null, V);
		const chay = await gieoChuKy("dang-chay", 1);
		const mt = (chu: string, departmentId: string, soNgay: number) =>
			gieoMucTieu({
				cycleId: chay,
				chu,
				cap: "phong-ban",
				departmentId,
				congBo: truocNgay(soNgay),
			});
		const kr = new Map<string, { ten: string; chu: string }>();
		const oD = await mt(P.id, D, 30);
		for (const n of [13, 14, 20]) {
			const id = await gieoKr({
				objectiveId: oD,
				chu: P.id,
				khoa: truocNgay(30),
			});
			await guiCapNhat(id, P.id, truocNgay(n));
			kr.set(id, { ten: `k${n}`, chu: P.id });
		}
		const mot = async (chu: string, dv: string, ten: string) => {
			const o = await mt(chu, dv, 21);
			const id = await gieoKr({ objectiveId: o, chu, khoa: truocNgay(21) });
			kr.set(id, { ten, chu });
			return id;
		};
		await mot(P.id, D, "k21");
		await mot(P2.id, D2, "k21-bo-phan");
		const kT = await mot(T.id, D, "k21-T-tu-phu-trach");
		const nguoi = new Map([
			[T.id, "T"],
			[TB.id, "TB"],
			[P.id, "P"],
			[P2.id, "P2"],
		]);
		const kq = await tinh(NOW);
		const im = [...kq].flatMap(([userId, ds]) =>
			ds.flatMap((v) => (v.loai === "okr-kr-im" ? [{ userId, v }] : [])),
		);
		const thay = [...kr].map(([id, k]) => {
			const cuaKr = im.filter((x) => x.v.keyResultId === id);
			return {
				kr: k.ten,
				chu: cuaKr.some((x) => x.userId === k.chu && x.v.chuTen === null),
				truong: cuaKr
					.filter((x) => x.v.chuTen !== null)
					.map((x) => `${nguoi.get(x.userId)}:${x.v.chuTen}`),
				soNgay: [...new Set(cuaKr.map((x) => x.v.soNgay))],
			};
		});
		const demT = im.filter((x) => x.userId === T.id && x.v.keyResultId === kT);
		expect(
			{ T_nhan_cho_KR_cua_minh: demT.length },
			"T nhan dung mot viec cho KR minh tu phu trach",
		).toEqual({ T_nhan_cho_KR_cua_minh: 1 });
		expect(thay, "ma tran 6 KR").toEqual([
			{ kr: "k13", chu: false, truong: [], soNgay: [] },
			{ kr: "k14", chu: true, truong: [], soNgay: [14] },
			{ kr: "k20", chu: true, truong: [], soNgay: [20] },
			{ kr: "k21", chu: true, truong: ["T:Phuc"], soNgay: [21] },
			{ kr: "k21-bo-phan", chu: true, truong: ["TB:Phong"], soNgay: [21] },
			{ kr: "k21-T-tu-phu-trach", chu: true, truong: [], soNgay: [21] },
		]);
	});
});

describe("mot-tin", () => {
	const goc = lucVN(NGAY_NHAC, PHUT_SAU);

	async function gieoA() {
		const A = await gieoNguoi("An");
		const X = await gieoNguoi("Xuan");
		await noiZalo(A.id, "ZA");
		await batBot();
		await gieoKeHoach({
			camTrich: A.id,
			batDau: ngayCach(goc, -HAN_XA),
			imTu: ngayCach(goc, -7),
			buoc: [{ nhan: "Tre", giao: A.id, han: ngayCach(goc, HOM_QUA) }],
		});
		const chay = await gieoChuKy("dang-chay", 1);
		const oA = await gieoMucTieu({
			cycleId: chay,
			chu: A.id,
			congBo: ngayCach(goc, -20),
		});
		const KA = await gieoKr({
			objectiveId: oA,
			chu: A.id,
			khoa: ngayCach(goc, -20),
		});
		await binhLuan({
			objectiveId: oA,
			tacGia: X.id,
			nhacTen: [A.id],
			luc: new Date(goc.getTime() - 2 * GIO_MS),
		});
		return { A, oA, KA };
	}

	test("mot-tin: A co 2 viec ke hoach + 3 viec OKR -> mot hang, mot tin, daGui chi ma", async () => {
		const g = await gieoA();
		setSystemTime(goc);
		await lenLichNhac(goc);
		await lenLichNhac(goc);
		const hang = await hangCuaNguoi(g.A.id);
		expect(
			{ soHang: hang.length, subject: hang[0]?.subject },
			"dung mot hang cho A",
		).toEqual({ soHang: 1, subject: chuDeNhac(g.A.id, goc) });
		const r = await guiQuaZalo(g.A.id, goc);
		const gui = r.z.guiToi("ZA");
		const text = gui[0]?.body.text ?? "";
		const s = await slug();
		const daGui = r.payload.daGui ?? [];
		expect({
			ket: r.ket,
			soGuiZalo: gui.length,
			soGuiSlack: r.s.goi.length,
			dongDau: text.split("\n")[0],
			capNhatTruocQuaHan:
				text.indexOf("Cập nhật tuần") >= 0 &&
				text.indexOf("Cập nhật tuần") < text.indexOf("Quá hạn"),
			dongCapNhat: dongCo(text, "KR chờ cập nhật").map((d) =>
				d.includes(`${APP_URL}/${s}/okr?tu=nhac`),
			),
			dongNhacTen: dongCo(text, "nhắc tên bạn").map((d) =>
				d.includes(`/okr?record=objective:${g.oA}`),
			),
			soDaGui: daGui.length,
			khoaLa: daGui.flatMap((m) =>
				Object.keys(m).filter((k) => !KHOA_MA.includes(k)),
			),
			loai: daGui.map((m) => m.loai),
		}).toEqual({
			ket: "da-gui",
			soGuiZalo: 1,
			soGuiSlack: 0,
			dongDau: "Chào An, sáng nay có 5 việc cần bạn để ý.",
			capNhatTruocQuaHan: true,
			dongCapNhat: [true],
			dongNhacTen: [true],
			soDaGui: 5,
			khoaLa: [],
			loai: [
				"okr-cap-nhat",
				"buoc-qua-han",
				"ke-hoach-im",
				"okr-kr-im",
				"okr-nhac-ten",
			],
		});
	});

	test("mot-tin: tran 12 viec -> daGui 10, okr-cap-nhat khong bi cat", async () => {
		const A = await gieoNguoi("An");
		const O = await gieoNguoi("Oanh");
		await noiZalo(A.id, "ZA");
		await batBot();
		for (const i of Array.from({ length: 11 }, (_, k) => k)) {
			await gieoKeHoach({
				camTrich: O.id,
				batDau: ngayCach(goc, -HAN_XA),
				imTu: ngayCach(goc, HOM_QUA),
				buoc: [
					{ nhan: `Tre ${i}`, giao: A.id, han: ngayCach(goc, HOM_QUA - i) },
				],
			});
		}
		const chay = await gieoChuKy("dang-chay", 1);
		const o = await gieoMucTieu({
			cycleId: chay,
			chu: A.id,
			congBo: ngayCach(goc, -7),
		});
		await gieoKr({ objectiveId: o, chu: A.id, khoa: ngayCach(goc, -7) });
		setSystemTime(goc);
		await lenLichNhac(goc);
		const r = await guiQuaZalo(A.id, goc);
		const text = r.z.guiToi("ZA")[0]?.body.text ?? "";
		const daGui = (r.payload.daGui ?? []).map((m) => m.loai);
		expect({
			dongDau: text.split("\n")[0],
			soDaGui: daGui.length,
			daGuiDau: daGui[0],
			daGuiCoCapNhat: daGui.includes("okr-cap-nhat"),
			conLai: text.includes("và 2 việc nữa"),
		}).toEqual({
			dongDau: "Chào An, sáng nay có 12 việc cần bạn để ý.",
			soDaGui: 10,
			daGuiDau: "okr-cap-nhat",
			daGuiCoCapNhat: true,
			conLai: true,
		});
	});

	test("mot-tin: tran 2.000 ky tu Zalo ap cho ca tin, daGui chi gom dong da in", async () => {
		const A = await gieoNguoi("An");
		await noiZalo(A.id, "ZA");
		await batBot();
		const chay = await gieoChuKy("dang-chay", 1);
		const o = await gieoMucTieu({
			cycleId: chay,
			chu: A.id,
			congBo: ngayCach(goc, -20),
		});
		const ten = new Map<string, string>();
		for (const i of Array.from({ length: 8 }, (_, k) => k)) {
			const t = `${i}${"K".repeat(299)}`;
			ten.set(
				await gieoKr({
					objectiveId: o,
					chu: A.id,
					tieuDe: t,
					khoa: ngayCach(goc, -20),
					viTri: i,
				}),
				t,
			);
		}
		setSystemTime(goc);
		await lenLichNhac(goc);
		const r = await guiQuaZalo(A.id, goc);
		const text = r.z.guiToi("ZA")[0]?.body.text ?? "";
		const daGui = r.payload.daGui ?? [];
		const imDaGui = new Set(
			daGui.flatMap((m) => (m.loai === "okr-kr-im" ? [m.keyResultId] : [])),
		);
		const tong = 1 + ten.size;
		expect({
			vuaTran: text.length <= ZALO.tranKyTu,
			biCat: daGui.length < tong,
			inDungDaGui: [...ten].map(
				([id, t]) => text.includes(`«${t}»`) === imDaGui.has(id),
			),
			conLai: text.includes(`và ${tong - daGui.length} việc nữa`),
			capNhatDau: daGui[0]?.loai,
		}).toEqual({
			vuaTran: true,
			biCat: true,
			inDungDaGui: [...ten].map(() => true),
			conLai: true,
			capNhatDau: "okr-cap-nhat",
		});
	});

	test("mot-tin: nguoi chi co viec ke hoach giu cau chao cu", async () => {
		const P = await gieoNguoi("Phuong");
		const O = await gieoNguoi("Oanh");
		await noiZalo(P.id, "ZP");
		await batBot();
		await gieoKeHoach({
			camTrich: O.id,
			batDau: ngayCach(goc, -HAN_XA),
			imTu: ngayCach(goc, HOM_QUA),
			buoc: [{ nhan: "Tre", giao: P.id, han: ngayCach(goc, HOM_QUA) }],
		});
		setSystemTime(goc);
		await lenLichNhac(goc);
		const r = await guiQuaZalo(P.id, goc);
		const text = r.z.guiToi("ZP")[0]?.body.text ?? "";
		expect(text.split("\n")[0]).toBe(
			"Chào Phuong, sáng nay có 1 việc 30 ngày đầu cần bạn để ý.",
		);
	});

	test("mot-tin: B co ZaloLink, khong ke hoach, chi mot KR cho cap nhat -> mot hang, mot tin", async () => {
		const B = await gieoNguoi("Binh");
		await noiZalo(B.id, "ZB");
		await batBot();
		const chay = await gieoChuKy("dang-chay", 1);
		const o = await gieoMucTieu({
			cycleId: chay,
			chu: B.id,
			congBo: ngayCach(goc, -7),
		});
		const K = await gieoKr({
			objectiveId: o,
			chu: B.id,
			khoa: ngayCach(goc, -7),
		});
		setSystemTime(goc);
		await lenLichNhac(goc);
		const hang = await hangCuaNguoi(B.id);
		expect(hang.length, "B khong co hang").toBe(1);
		const r = await guiQuaZalo(B.id, goc);
		const gui = r.z.guiToi("ZB");
		expect({
			soGui: gui.length,
			outcome: r.hang.outcome,
			daGui: r.payload.daGui,
			dongDau: gui[0]?.body.text.split("\n")[0],
		}).toEqual({
			soGui: 1,
			outcome: "da-gui:1",
			daGui: [{ loai: "okr-cap-nhat", krIds: [K] }],
			dongDau: "Chào Binh, sáng nay có 1 việc cần bạn để ý.",
		});
	});

	test("mot-tin: su kien khoi - duoc giao, theo doi, nhac ten; ngoai 24 gio va tu lam khong sinh viec", async () => {
		const X = await gieoNguoi("Xuan");
		const G = await gieoNguoi("Giang");
		const G2 = await gieoNguoi("Giao");
		const G3 = await gieoNguoi("Gia");
		const F = await gieoNguoi("Phi");
		const chay = await gieoChuKy("dang-chay", 1);
		const truoc2 = new Date(goc.getTime() - 2 * GIO_MS);
		const truoc25 = new Date(goc.getTime() - 25 * GIO_MS);
		const oX = await gieoMucTieu({
			cycleId: chay,
			chu: X.id,
			congBo: ngayCach(goc, -2),
		});
		const kG = await gieoKr({
			objectiveId: oX,
			chu: G.id,
			tieuDe: "KR giao G",
			khoa: null,
		});
		await vet({
			action: "tao-kr",
			nguoiLam: X.id,
			objectiveId: oX,
			keyResultId: kG,
			luc: truoc2,
		});
		const kTu = await gieoKr({
			objectiveId: oX,
			chu: G.id,
			khoa: null,
			viTri: 1,
		});
		await vet({
			action: "tao-kr",
			nguoiLam: G.id,
			objectiveId: oX,
			keyResultId: kTu,
			luc: truoc2,
		});
		const kG2 = await gieoKr({
			objectiveId: oX,
			chu: G2.id,
			khoa: null,
			viTri: 2,
		});
		await vet({
			action: "sua-kr",
			nguoiLam: X.id,
			objectiveId: oX,
			keyResultId: kG2,
			sau: { ownerUserId: G2.id },
			luc: truoc2,
		});
		const kG3 = await gieoKr({
			objectiveId: oX,
			chu: G3.id,
			khoa: null,
			viTri: 3,
		});
		await vet({
			action: "tao-kr",
			nguoiLam: X.id,
			objectiveId: oX,
			keyResultId: kG3,
			luc: truoc25,
		});
		const kX = await gieoKr({
			objectiveId: oX,
			chu: X.id,
			khoa: ngayCach(goc, -2),
			viTri: 4,
		});
		await theoDoi(oX, F.id);
		await guiCapNhat(kX, X.id, truoc2);
		await binhLuan({
			objectiveId: oX,
			tacGia: X.id,
			nhacTen: [G.id, X.id],
			luc: truoc2,
		});
		await binhLuan({ objectiveId: oX, tacGia: F.id, luc: truoc2 });
		const kq = await tinh(goc);
		const tomTat = (userId: string) =>
			cua(kq, userId)
				.filter((v) => v.loai !== "okr-cap-nhat" && v.loai !== "okr-kr-im")
				.map((v) =>
					v.loai === "okr-duoc-giao"
						? `giao:${v.keyResultId === kG ? "kG" : v.keyResultId === kG2 ? "kG2" : v.keyResultId}`
						: v.loai === "okr-theo-doi"
							? `theo:${v.capNhat}/${v.binhLuan}`
							: v.loai,
				);
		expect({
			G: tomTat(G.id),
			G2: tomTat(G2.id),
			G3: tomTat(G3.id),
			F: tomTat(F.id),
			X: tomTat(X.id),
		}).toEqual({
			G: ["giao:kG", "okr-nhac-ten"],
			G2: ["giao:kG2"],
			G3: [],
			F: ["theo:1/1"],
			X: [],
		});
		const tin = dungTin(
			"Giang",
			lucVN(NGAY_NHAC, PHUT_SAU),
			[...cua(kq, G.id), ...cua(kq, F.id)],
			() => null,
			"tron",
		);
		expect({
			giao: dongCo(tin.text, "Bạn phụ trách KR «KR giao G»").length,
			theo: dongCo(tin.text, "có 1 cập nhật, 1 bình luận mới").length,
			nhac: dongCo(tin.text, "Xuan nhắc tên bạn ở").length,
		}).toEqual({ giao: 1, theo: 1, nhac: 1 });
	});

	test("mot-tin: danh so ca dong OKR, xong tro vao dong OKR khong danh dau buoc nao, xong tro vao dong ke hoach danh dau dung buoc", async () => {
		const g = await gieoA();
		setSystemTime(goc);
		await lenLichNhac(goc);
		const r = await guiQuaZalo(g.A.id, goc);
		const daGui = r.payload.daGui ?? [];
		const loaiDs = daGui.map((m) => m.loai);
		const soOkr = loaiDs.indexOf("okr-cap-nhat") + 1;
		const soBuoc = loaiDs.indexOf("buoc-qua-han") + 1;
		const text = r.z.guiToi("ZA")[0]?.body.text ?? "";
		const cacDong = text.split("\n");
		expect(
			{
				soOkr,
				soBuoc,
				danhSoOkr: cacDong.some((d) => d.startsWith(`${soOkr}. `)),
				danhSoBuoc: cacDong.some((d) => d.startsWith(`${soBuoc}. `)),
			},
			"dong OKR va dong ke hoach deu duoc danh so lien tuc trong daGui",
		).toEqual({ soOkr: 1, soBuoc: 2, danhSoOkr: true, danhSoBuoc: true });

		const stepId = buocCuaMuc(daGui, soBuoc);
		const truocOkr = await nhan("ZA", `xong ${soOkr}`, goc);
		expect(
			{
				traLoi: truocOkr.tra[0],
				buocXong: await buocXongLuc(stepId),
				soVetXong: (await vetXong(stepId)).length,
			},
			"xong tro vao dong OKR bi tu choi, khong danh dau buoc 30 ngay nao",
		).toEqual({
			traLoi: `${ZALO.loi.khongPhaiBuoc(soOkr, TIEU_DE["okr-cap-nhat"], null)} ${ZALO.loi.chuaDanhDau}`,
			buocXong: null,
			soVetXong: 0,
		});

		const sauBuoc = await nhan("ZA", `xong ${soBuoc}`, goc);
		expect(
			{
				buocXong: (await buocXongLuc(stepId)) !== null,
				soVetXong: (await vetXong(stepId)).length,
				traLoiDungBuoc: (sauBuoc.tra[0] ?? "").includes(`${soBuoc} · Tre (`),
			},
			"xong tro vao dong ke hoach danh dau dung buoc do, con dong OKR van khong dinh gi",
		).toEqual({ buocXong: true, soVetXong: 1, traLoiDungBuoc: true });
	});
});

describe("chua-noi-kenh", () => {
	const goc = lucVN(NGAY_NHAC, PHUT_SAU);

	async function gieoU() {
		const U = await gieoNguoi("Uyen");
		const chay = await gieoChuKy("dang-chay", 1);
		const o = await gieoMucTieu({
			cycleId: chay,
			chu: U.id,
			congBo: ngayCach(goc, -7),
		});
		const K = await gieoKr({
			objectiveId: o,
			chu: U.id,
			khoa: ngayCach(goc, -7),
		});
		await batBot();
		return { U, K };
	}

	async function chay(userId: string) {
		setSystemTime(goc);
		await lenLichNhac(goc);
		const z = zaloGia();
		const s = slackGia();
		const ket = await voiToken(async () =>
			chayNhac(await hangCua(userId), {
				fetcher: s.fetcher,
				zaloFetcher: z.fetcher,
				appUrl: APP_URL,
			}),
		);
		return {
			ket,
			outcome: (await hangCua(userId)).outcome,
			goi: z.goi.length + s.goi.length,
		};
	}

	test("chua-noi-kenh: xuong khong noi Slack -> khong-slack, khong goi gi", async () => {
		const g = await gieoU();
		await db.account.deleteMany({ where: { providerId: "slack" } });
		const viec = cua(await tinh(goc), g.U.id).map((v) =>
			v.loai === "okr-cap-nhat" ? v.krIds : v.loai,
		);
		expect({ viec, ...(await chay(g.U.id)) }).toEqual({
			viec: [[g.K]],
			ket: "khong-slack",
			outcome: "khong-slack",
			goi: 0,
		});
	});

	test("chua-noi-kenh: xuong co Slack, U khong khop -> khong-khop, khong goi gi", async () => {
		const g = await gieoU();
		const khac = await gieoNguoi("Khac");
		await noiSlack(khac.id);
		expect(await chay(g.U.id)).toEqual({
			ket: "khong-khop",
			outcome: "khong-khop",
			goi: 0,
		});
	});
});

describe("su-kien", () => {
	const goc = lucVN(NGAY_NHAC, PHUT_SAU);
	const LOAI_SU_KIEN = ["okr-duoc-giao", "okr-nhac-ten", "okr-theo-doi"];

	test("su-kien: ma tran 8 nguoi x [loai, ma dich, so dem]; tu lam, ngoai 24 gio, nguoi da roi khong sinh viec", async () => {
		const X = await gieoNguoi("Xuan");
		const G = await gieoNguoi("Giang");
		const G2 = await gieoNguoi("Giao");
		const G3 = await gieoNguoi("Gia");
		const H = await gieoNguoi("Hoa");
		const F = await gieoNguoi("Phi");
		const N = await gieoNguoi("Nam");
		const D = await gieoNguoi("Duc", false);
		const chay = await gieoChuKy("dang-chay", 1);
		const t2 = new Date(goc.getTime() - 2 * GIO_MS);
		const t25 = new Date(goc.getTime() - 25 * GIO_MS);
		const oX = await gieoMucTieu({
			cycleId: chay,
			chu: X.id,
			congBo: ngayCach(goc, -2),
		});
		let viTri = 0;
		const krMoi = async (chu: string, nguoiTao: string, luc: Date) => {
			viTri += 1;
			const tieuDe = `KR ${viTri}`;
			const id = await gieoKr({
				objectiveId: oX,
				chu,
				tieuDe,
				khoa: ngayCach(goc, -2),
				viTri,
			});
			await vet({
				action: "tao-kr",
				nguoiLam: nguoiTao,
				objectiveId: oX,
				keyResultId: id,
				sau: {
					title: tieuDe,
					kind: "tang-toi",
					startValue: 0,
					targetValue: 100,
				},
				luc,
			});
			return id;
		};
		const kG = await krMoi(G.id, X.id, t2);
		await krMoi(G.id, G.id, t2);
		const kG2 = await krMoi(X.id, X.id, t25);
		await db.okrKeyResult.update({
			where: { id: kG2 },
			data: { ownerUserId: G2.id },
		});
		await vet({
			action: "sua-kr",
			nguoiLam: X.id,
			objectiveId: oX,
			keyResultId: kG2,
			truoc: { ownerUserId: X.id },
			sau: { ownerUserId: G2.id },
			luc: t2,
		});
		const oG3 = await gieoMucTieu({
			cycleId: chay,
			chu: G3.id,
			cap: "phong-ban",
			departmentId: await gieoPhongBan(null),
			congBo: ngayCach(goc, -2),
		});
		await vet({
			action: "chuyen-viec",
			nguoiLam: X.id,
			objectiveId: oG3,
			truoc: { ownerUserId: X.id },
			sau: { ownerUserId: G3.id },
			luc: t2,
		});
		await krMoi(D.id, X.id, t2);
		await krMoi(N.id, X.id, t25);
		const kX = await krMoi(X.id, X.id, t25);
		await theoDoi(oX, F.id, ngayCach(goc, -3));
		const oN = await gieoMucTieu({
			cycleId: chay,
			chu: X.id,
			congBo: ngayCach(goc, -2),
		});
		const kN = await gieoKr({
			objectiveId: oN,
			chu: X.id,
			khoa: ngayCach(goc, -2),
		});
		await theoDoi(oN, N.id, ngayCach(goc, -3));
		await guiCapNhat(kN, X.id, t25);
		await binhLuan({ objectiveId: oN, tacGia: X.id, luc: t25 });
		await guiCapNhat(kX, X.id, t2);
		await guiCapNhat(kG, G.id, t2);
		await guiCapNhat(kX, X.id, t25);
		const c1 = await binhLuan({
			objectiveId: oX,
			tacGia: X.id,
			nhacTen: [H.id, X.id, D.id],
			keyResultId: kG,
			luc: t2,
		});
		await binhLuan({ objectiveId: oX, tacGia: F.id, luc: t2 });
		await binhLuan({
			objectiveId: oX,
			tacGia: X.id,
			nhacTen: [N.id],
			luc: t25,
		});
		const kq = await tinh(goc);
		const ten = new Map<string, string>([
			[kG, "kG"],
			[kG2, "kG2"],
			[oG3, "oG3"],
			[oX, "oX"],
			[oN, "oN"],
			[c1, "c1"],
		]);
		const nhan = (id: string | undefined) => (id ? (ten.get(id) ?? id) : "-");
		const tomTat = (userId: string) =>
			cua(kq, userId)
				.filter((v) => LOAI_SU_KIEN.includes(v.loai))
				.map((v) => {
					switch (v.loai) {
						case "okr-duoc-giao":
							return `${v.loai} ${nhan(v.keyResultId ?? v.objectiveId)}`;
						case "okr-nhac-ten":
							return `${v.loai} ${nhan(v.commentId)}`;
						case "okr-theo-doi":
							return `${v.loai} ${nhan(v.objectiveId)} ${v.capNhat}/${v.binhLuan}`;
						default:
							return v.loai;
					}
				});
		expect({
			G: tomTat(G.id),
			G2: tomTat(G2.id),
			G3: tomTat(G3.id),
			H: tomTat(H.id),
			X: tomTat(X.id),
			F: tomTat(F.id),
			N: tomTat(N.id),
			D: kq.has(D.id) ? "co trong Map" : "khong trong Map",
		}).toEqual({
			G: ["okr-duoc-giao kG"],
			G2: ["okr-duoc-giao kG2"],
			G3: ["okr-duoc-giao oG3"],
			H: ["okr-nhac-ten c1"],
			X: [],
			F: ["okr-theo-doi oX 2/1"],
			N: [],
			D: "khong trong Map",
		});
	});
});

describe("ghi-nhan", () => {
	const goc = lucVN(NGAY_NHAC, PHUT_SAU);
	const TEN_MUC_TIEU = "Chốt kho mới quý 4";
	const CHO_MS = 30_000;

	async function gieoBa() {
		const O = await gieoNguoi("Oanh");
		const A = await gieoNguoi("An");
		const B = await gieoNguoi("Binh");
		await noiZalo(A.id, "ZA");
		await batBot();
		const chay = await gieoChuKy("dang-chay", 1);
		const mt = await gieoMucTieu({
			cycleId: chay,
			chu: O.id,
			tieuDe: TEN_MUC_TIEU,
			congBo: ngayCach(goc, -20),
		});
		return { O, A, B, mt };
	}

	test(
		"ghi-nhan: tin sang co dung mot dong — O gui cho A, B trong cua so; A nhan mot dong ten O va ten muc tieu, B co muc, O khong hang",
		async () => {
			const g = await gieoBa();
			const id = await ghiNhan({
				objectiveId: g.mt,
				tacGia: g.O.id,
				nhan: [g.A.id, g.B.id],
				luc: new Date(goc.getTime() - 2 * GIO_MS),
			});
			setSystemTime(goc);
			await lenLichNhac(goc);
			const mucCua = async (userId: string) =>
				(await hangCuaNguoi(userId)).map(
					(h) => parseNhacPayload(h.payload).muc,
				);
			const mucB = await mucCua(g.B.id);
			const soHangO = (await hangCuaNguoi(g.O.id)).length;
			const r = await guiQuaZalo(g.A.id, goc);
			const text = r.z.guiToi("ZA")[0]?.body.text ?? "";
			const dongGhiNhan = text
				.split("\n")
				.filter((d) => d.includes("ghi nhận bạn"));
			expect({
				ket: r.ket,
				tieuDe: text.split("\n").includes(TIEU_DE["okr-ghi-nhan"]),
				soDong: dongGhiNhan.length,
				coTenO: dongGhiNhan.map((d) => d.includes("Oanh")),
				coTenMucTieu: dongGhiNhan.map((d) => d.includes(TEN_MUC_TIEU)),
				daGui: r.payload.daGui,
				mucB,
				soHangO,
			}).toEqual({
				ket: "da-gui",
				tieuDe: true,
				soDong: 1,
				coTenO: [true],
				coTenMucTieu: [true],
				daGui: [{ loai: "okr-ghi-nhan", ghiNhanId: id }],
				mucB: [[{ loai: "okr-ghi-nhan", ghiNhanId: id }]],
				soHangO: 0,
			});
		},
		CHO_MS,
	);

	test(
		"ghi-nhan: ngoai cua so — 08:29 hom qua va 08:30:00.001 hom nay — khong dong, A khong hang",
		async () => {
			const g = await gieoBa();
			await ghiNhan({
				objectiveId: g.mt,
				tacGia: g.O.id,
				nhan: [g.A.id],
				luc: ngayCach(lucVN(NGAY_NHAC, PHUT_TRUOC), HOM_QUA),
			});
			await ghiNhan({
				objectiveId: g.mt,
				tacGia: g.O.id,
				nhan: [g.A.id],
				luc: new Date(lucVN(NGAY_NHAC, 0).getTime() + 1),
			});
			setSystemTime(goc);
			await lenLichNhac(goc);
			expect((await hangCuaNguoi(g.A.id)).length).toBe(0);
		},
		CHO_MS,
	);
});

describe("hoi-y", () => {
	const goc = lucVN(NGAY_NHAC, PHUT_SAU);
	const MOC_SANG = lucVN(NGAY_NHAC, 0);
	const HAN = new Date("2026-10-14T17:00:00+07:00");
	const CHO_MS = 30_000;

	async function gieoNam() {
		const P = await gieoNguoi("Phuc");
		const A = await gieoNguoi("An");
		const B = await gieoNguoi("Binh");
		const R = await gieoNguoi("Rong", false);
		await noiZalo(A.id, "ZA");
		await noiZalo(B.id, "ZB");
		await batBot();
		const ky = await gieoChuKy("lap-ke-hoach", 1);
		const nhan = (
			await db.okrCycle.findUniqueOrThrow({
				where: { id: ky },
				select: { name: true },
			})
		).name;
		return { P, A, B, R, ky, nhan };
	}

	async function mucCua(userId: string) {
		return (await hangCuaNguoi(userId)).flatMap(
			(h) => parseNhacPayload(h.payload).muc,
		);
	}

	test(
		"hoi-y: lan hoi y dang mo — tin sang 08:31 cua A co dung mot dong hoi y kem ten chu ky, han gio VN va duong mo …/okr/hoi-y; B da gop, P nguoi chon, R da roi khong co hang",
		async () => {
			const g = await gieoNam();
			const h = await gieoHoiY({
				cycleId: g.ky,
				nguoiChon: g.P.id,
				han: HAN,
				mo: new Date(goc.getTime() - 3 * GIO_MS),
			});
			await gieoY(h, g.B.id, new Date(goc.getTime() - 2 * GIO_MS));
			setSystemTime(goc);
			await lenLichNhac(goc);
			const mucCuaA = await mucCua(g.A.id);
			const soHang = {
				B: (await hangCuaNguoi(g.B.id)).length,
				P: (await hangCuaNguoi(g.P.id)).length,
				R: (await hangCuaNguoi(g.R.id)).length,
			};
			const r = await guiQuaZalo(g.A.id, goc);
			const text = r.z.guiToi("ZA")[0]?.body.text ?? "";
			const dongHoiY = text.split("\n").filter((d) => d.includes("hỏi ý"));
			expect({
				ket: r.ket,
				tieuDe: text.split("\n").includes(TIEU_DE["okr-hoi-y-gop"]),
				mucCuaA,
				soHang,
				daGui: r.payload.daGui,
				soDong: dongHoiY.length,
			}).toEqual({
				ket: "da-gui",
				tieuDe: true,
				mucCuaA: [{ loai: "okr-hoi-y-gop", hoiYId: h, cycleId: g.ky }],
				soHang: { B: 0, P: 0, R: 0 },
				daGui: [{ loai: "okr-hoi-y-gop", hoiYId: h, cycleId: g.ky }],
				soDong: 1,
			});
			expect(dongHoiY[0]).toBe(
				`1. Công ty đang hỏi ý cho mục tiêu ${g.nhan} — hạn 17:00 14/10 — ${APP_URL}/${await slug()}/okr/hoi-y?kyOkr=${g.ky}`,
			);
		},
		CHO_MS,
	);

	test(
		"hoi-y: sau han khong ai co hang; luc dung han cung khong",
		async () => {
			const g = await gieoNam();
			await gieoHoiY({ cycleId: g.ky, nguoiChon: g.P.id, han: goc });
			setSystemTime(goc);
			await lenLichNhac(goc);
			expect((await hangCuaNguoi(g.A.id)).length).toBe(0);
		},
		CHO_MS,
	);

	test(
		"hoi-y: da cong bo — B da gop nhan mot dong «da cong bo» kem duong mo; A chua gop, R da roi sau khi gop khong co; cong bo ngoai cua so 08:30 khong dong",
		async () => {
			const g = await gieoNam();
			const trong = await gieoHoiY({
				cycleId: g.ky,
				nguoiChon: g.P.id,
				han: new Date(goc.getTime() - 3 * GIO_MS),
				congBo: new Date(MOC_SANG.getTime() - 2 * GIO_MS),
			});
			await gieoY(trong, g.B.id, new Date(goc.getTime() - 6 * GIO_MS));
			await gieoY(trong, g.R.id, new Date(goc.getTime() - 6 * GIO_MS));
			setSystemTime(goc);
			await lenLichNhac(goc);
			const mucB = await mucCua(g.B.id);
			const soHang = {
				A: (await hangCuaNguoi(g.A.id)).length,
				R: (await hangCuaNguoi(g.R.id)).length,
			};
			const r = await guiQuaZalo(g.B.id, goc);
			const text = r.z.guiToi("ZB")[0]?.body.text ?? "";
			const dongCongBo = text
				.split("\n")
				.filter((d) => d.includes("xem ý của bạn đi đâu"));
			expect({
				ket: r.ket,
				mucB,
				soHang,
				tieuDe: text.split("\n").includes(TIEU_DE["okr-hoi-y-cong-bo"]),
				dongCongBo: dongCongBo.length,
			}).toEqual({
				ket: "da-gui",
				mucB: [{ loai: "okr-hoi-y-cong-bo", hoiYId: trong, cycleId: g.ky }],
				soHang: { A: 0, R: 0 },
				tieuDe: true,
				dongCongBo: 1,
			});
			expect(dongCongBo[0]).toBe(
				`1. Mục tiêu ${g.nhan} đã công bố — xem ý của bạn đi đâu — ${APP_URL}/${await slug()}/okr/hoi-y?kyOkr=${g.ky}`,
			);
		},
		CHO_MS,
	);

	test(
		"hoi-y: cong bo luc 08:30:00.001 hom nay va 08:30 hom qua deu ngoai cua so — B khong hang",
		async () => {
			const g = await gieoNam();
			const muon = await gieoHoiY({
				cycleId: g.ky,
				nguoiChon: g.P.id,
				han: new Date(goc.getTime() - 3 * GIO_MS),
				congBo: new Date(MOC_SANG.getTime() + 1),
			});
			await gieoY(muon, g.B.id, new Date(goc.getTime() - 6 * GIO_MS));
			const ky2 = await gieoChuKy("lap-ke-hoach", 1);
			const som = await gieoHoiY({
				cycleId: ky2,
				nguoiChon: g.P.id,
				han: new Date(goc.getTime() - 60 * GIO_MS),
				congBo: ngayCach(MOC_SANG, HOM_QUA),
			});
			await gieoY(som, g.B.id, new Date(goc.getTime() - 70 * GIO_MS));
			setSystemTime(goc);
			await lenLichNhac(goc);
			expect((await hangCuaNguoi(g.B.id)).length).toBe(0);
		},
		CHO_MS,
	);
});

describe("hien-thi", () => {
	const goc = lucVN(NGAY_NHAC, PHUT_SAU);
	const TEN_MUC_TIEU = "Mở rộng kho phía Nam";
	const CHO_MS = 60_000;

	async function gieoG() {
		const X = await gieoNguoi("Xuan");
		const K = await gieoNguoi("Khoa");
		const F = await gieoNguoi("Phi");
		await noiZalo(K.id, "ZK");
		await noiZalo(F.id, "ZF");
		await batBot();
		const chay = await gieoChuKy("dang-chay", 1);
		const G = await gieoMucTieu({
			cycleId: chay,
			chu: X.id,
			tieuDe: TEN_MUC_TIEU,
			congBo: ngayCach(goc, -20),
		});
		const kK = await gieoKr({
			objectiveId: G,
			chu: K.id,
			khoa: ngayCach(goc, -3),
		});
		await theoDoi(G, F.id, ngayCach(goc, -5));
		await theoDoi(G, K.id, ngayCach(goc, -5));
		const luc = new Date(goc.getTime() - 2 * GIO_MS);
		await binhLuan({
			objectiveId: G,
			tacGia: X.id,
			nhacTen: [F.id, K.id],
			luc,
		});
		await ghiNhan({ objectiveId: G, tacGia: X.id, nhan: [F.id], luc });
		return { X, K, F, G, kK };
	}

	const cuaG = (kq: Map<string, ViecNhac[]>, userId: string, G: string) =>
		cua(kq, userId).filter((v) => "objectiveId" in v && v.objectiveId === G);

	test(
		"hien-thi: G gioi han — F 0 muc neu G va khong hang nhac, K van co okr-cap-nhat, okr-theo-doi va tin co ten G; dat lai cong khai thi F co lai muc",
		async () => {
			const g = await gieoG();
			await db.okrObjective.update({
				where: { id: g.G },
				data: { hienThi: "gioi-han" },
			});
			const kq = await tinh(goc);
			const capNhatK = cua(kq, g.K.id).find((v) => v.loai === "okr-cap-nhat");
			expect({
				F: cuaG(kq, g.F.id, g.G),
				FTatCa: cua(kq, g.F.id),
				kCapNhat: capNhatK?.loai === "okr-cap-nhat" ? capNhatK.krIds : [],
				kTheoDoi: cuaG(kq, g.K.id, g.G).some((v) => v.loai === "okr-theo-doi"),
			}).toEqual({
				F: [],
				FTatCa: [],
				kCapNhat: [g.kK],
				kTheoDoi: true,
			});

			await lenLichNhac(goc);
			const soHangF = (await hangCuaNguoi(g.F.id)).length;
			const tinK = await guiQuaZalo(g.K.id, goc);
			const textK = tinK.z.guiToi("ZK")[0]?.body.text ?? "";
			expect({
				soHangF,
				tinKCoTenG: textK.includes(TEN_MUC_TIEU),
			}).toEqual({ soHangF: 0, tinKCoTenG: true });

			await db.agentTask.deleteMany({ where: { kind: "nhac-ke-hoach" } });
			await db.okrObjective.update({
				where: { id: g.G },
				data: { hienThi: "cong-khai" },
			});
			const sau = await tinh(goc);
			expect(
				cuaG(sau, g.F.id, g.G)
					.map((v) => v.loai)
					.sort(),
				"doi chung: cong khai lai thi F co lai ba muc",
			).toEqual(["okr-ghi-nhan", "okr-nhac-ten", "okr-theo-doi"]);
			await lenLichNhac(goc);
			const tinF = await guiQuaZalo(g.F.id, goc);
			expect(tinF.z.guiToi("ZF")[0]?.body.text ?? "").toContain(TEN_MUC_TIEU);
		},
		CHO_MS,
	);
});

describe("duyet", () => {
	const goc = lucVN(NGAY_NHAC, PHUT_SAU);
	const mai = lucVN(NGAY_MAI, PHUT_SAU);
	const LY_DO = "Chưa có KR đo khách hàng mới";
	const TEN = {
		g1: "Mở rộng kho Bình Dương",
		g2: "Giữ chân khách lớn",
		g3: "Khách hàng mới quý 4",
		g4: "Chuẩn hoá hợp đồng",
	} as const;
	const CHO_MS = 60_000;

	async function gieo() {
		const H = await gieoNguoi("Hà");
		const T = await gieoNguoi("Tâm");
		const M = await gieoNguoi("Minh");
		await noiZalo(H.id, "ZH");
		await noiZalo(T.id, "ZT");
		await batBot();
		const b1 = await gieoBoPhan(H.id);
		const p1 = await gieoPhongBan(T.id, b1);
		await gieoPhongBan(null, await gieoBoPhan(M.id));
		const p3 = await gieoPhongBan(null);
		const chay = await gieoChuKy("dang-chay", 1);
		const moi = async (tieuDe: string, departmentId: string) => {
			const id = await gieoMucTieu({
				cycleId: chay,
				chu: T.id,
				tieuDe,
				congBo: null,
				cap: "phong-ban",
				departmentId,
			});
			await gieoKr({ objectiveId: id, chu: T.id, khoa: null });
			return id;
		};
		const G1 = await moi(TEN.g1, p1);
		const G2 = await moi(TEN.g2, p1);
		const G3 = await moi(TEN.g3, p1);
		const G4 = await moi(TEN.g4, p3);
		const guiLuc = new Date(goc.getTime() - 3 * GIO_MS);
		for (const id of [G1, G2, G3, G4]) {
			await vet({
				action: "gui-duyet",
				nguoiLam: T.id,
				objectiveId: id,
				truoc: { status: "nhap" },
				sau: { status: "cho-duyet" },
				luc: guiLuc,
			});
			if (id !== G3)
				await db.okrObjective.update({
					where: { id },
					data: { status: "cho-duyet" },
				});
		}
		await vet({
			action: "tra-lai",
			nguoiLam: H.id,
			objectiveId: G3,
			truoc: { status: "cho-duyet" },
			sau: { status: "nhap" },
			ghiChu: LY_DO,
			luc: new Date(goc.getTime() - 2 * GIO_MS),
		});
		return { H, T, M, G1, G2, G3, G4 };
	}

	const mucCua = async (userId: string, luc: Date) =>
		(await hangCuaNguoi(userId))
			.filter((h) => h.subject === chuDeNhac(userId, luc))
			.flatMap((h) => parseNhacPayload(h.payload).muc)
			.filter((m) => m.loai === "okr-cho-duyet" || m.loai === "okr-tra-lai")
			.map((m) => `${m.loai}:${"objectiveId" in m ? m.objectiveId : ""}`)
			.sort();

	test(
		"duyet: tin sáng hai ngày liền của H đều có G1, G2; T có dòng trả lại kèm lý do trong cửa sổ, hết sang ngày sau; M không mục; duyệt G1 thì H còn G2",
		async () => {
			const g = await gieo();
			setSystemTime(goc);
			await lenLichNhac(goc);
			const ngay1 = {
				h: await mucCua(g.H.id, goc),
				t: await mucCua(g.T.id, goc),
				m: await mucCua(g.M.id, goc),
			};
			const textH =
				(await guiQuaZalo(g.H.id, goc)).z.guiToi("ZH")[0]?.body.text ?? "";
			const textT =
				(await guiQuaZalo(g.T.id, goc)).z.guiToi("ZT")[0]?.body.text ?? "";
			setSystemTime(mai);
			await lenLichNhac(mai);
			const ngay2 = {
				h: await mucCua(g.H.id, mai),
				t: await mucCua(g.T.id, mai),
				m: await mucCua(g.M.id, mai),
			};
			await db.okrObjective.update({
				where: { id: g.G1 },
				data: { status: "cong-bo", publishedAt: mai },
			});
			await vet({
				action: "duyet",
				nguoiLam: g.H.id,
				objectiveId: g.G1,
				truoc: { status: "cho-duyet" },
				sau: { status: "cong-bo" },
				luc: mai,
			});
			const sauDuyet = cua(await tinh(mai), g.H.id)
				.flatMap((v) => (v.loai === "okr-cho-duyet" ? [v.objectiveId] : []))
				.sort();
			const dongH = textH.split("\n");
			const dongT = textT.split("\n");
			console.log(
				`duyet ngay 1: ${JSON.stringify(ngay1)}\nngay 2: ${JSON.stringify(ngay2)}\ntin H:\n${textH}\ntin T:\n${textT}`,
			);
			const cho = (id: string) => `okr-cho-duyet:${id}`;
			expect({
				ngay1,
				ngay2,
				sauDuyet,
				tieuDeH: dongH.includes(TIEU_DE["okr-cho-duyet"]),
				dongH: [TEN.g1, TEN.g2, TEN.g4].map(
					(t) => dongH.filter((d) => d.includes(t)).length,
				),
				tieuDeT: dongT.includes(TIEU_DE["okr-tra-lai"]),
				dongT: dongT.filter((d) => d.includes(TEN.g3) && d.includes(LY_DO))
					.length,
			}).toEqual({
				ngay1: {
					h: [cho(g.G1), cho(g.G2)].sort(),
					t: [`okr-tra-lai:${g.G3}`],
					m: [],
				},
				ngay2: { h: [cho(g.G1), cho(g.G2)].sort(), t: [], m: [] },
				sauDuyet: [g.G2],
				tieuDeH: true,
				dongH: [1, 1, 0],
				tieuDeT: true,
				dongT: 1,
			});
		},
		CHO_MS,
	);
});

describe("ky-an", () => {
	const TUAN_TRUOC = vn("2026-10-05T10:00:00");
	const LUC = vn("2026-10-12T10:00:00");
	const AN_LUC = vn("2026-10-08T09:00:00");
	const MO = vn("2026-10-10T09:00:00");
	const HAN = vn("2026-10-14T17:00:00");
	const LOAI = ["okr-cap-nhat", "okr-cho-duyet", "okr-hoi-y-gop"];
	const CHO_MS = 60_000;

	async function gieo() {
		const U = await gieoNguoi("Uyen");
		const T = await gieoNguoi("Tam");
		const P = await gieoNguoi("Phuc");
		const W = await gieoNguoi("Vinh");
		const p1 = await gieoPhongBan(T.id, await gieoBoPhan(U.id));
		const gieoKy = async (anLuc: Date | null) => {
			const cycleId = await gieoChuKy("dang-chay", 1, undefined, anLuc);
			const mt = await gieoMucTieu({ cycleId, chu: U.id, congBo: TUAN_TRUOC });
			const kr = await gieoKr({ objectiveId: mt, chu: U.id, khoa: TUAN_TRUOC });
			const duyet = await gieoMucTieu({
				cycleId,
				chu: T.id,
				congBo: null,
				cap: "phong-ban",
				departmentId: p1,
			});
			await gieoKr({ objectiveId: duyet, chu: T.id, khoa: null });
			await db.okrObjective.update({
				where: { id: duyet },
				data: { status: "cho-duyet" },
			});
			const hoiY = await gieoHoiY({
				cycleId,
				nguoiChon: P.id,
				han: HAN,
				mo: MO,
			});
			return {
				cycleId,
				muc: [
					`okr-cap-nhat:${kr}`,
					`okr-cho-duyet:${duyet}`,
					`okr-hoi-y-gop:${hoiY}`,
				],
			};
		};
		const X = await gieoKy(AN_LUC);
		const V = await gieoKy(null);
		const mtW = await gieoMucTieu({
			cycleId: X.cycleId,
			chu: W.id,
			congBo: TUAN_TRUOC,
		});
		await gieoKr({ objectiveId: mtW, chu: W.id, khoa: TUAN_TRUOC });
		return { U, W, X, V };
	}

	function mucCua(kq: Map<string, ViecNhac[]>, userId: string): string[] {
		return cua(kq, userId)
			.flatMap((v) => {
				if (!LOAI.includes(v.loai)) return [];
				if (v.loai === "okr-cap-nhat")
					return v.krIds.map((id) => `${v.loai}:${id}`);
				if (v.loai === "okr-cho-duyet") return [`${v.loai}:${v.objectiveId}`];
				if (v.loai === "okr-hoi-y-gop") return [`${v.loai}:${v.hoiYId}`];
				return [];
			})
			.sort();
	}

	test(
		"ky-an: nhac cua U chi co cap nhat tuan, cho duyet, hoi y cua V; lienQuanOkr cua nguoi chi co du lieu o X la false; hien lai X thi muc cua X quay lai",
		async () => {
			const g = await gieo();
			const truoc = {
				muc: mucCua(await tinh(LUC), g.U.id),
				lienQuanW: await lienQuanOkr(db, g.W.id),
			};
			expect(truoc, "chu ky an").toEqual({
				muc: [...g.V.muc].sort(),
				lienQuanW: false,
			});
			await db.okrCycle.update({
				where: { id: g.X.cycleId },
				data: { anLuc: null },
			});
			const sau = {
				muc: mucCua(await tinh(LUC), g.U.id),
				lienQuanW: await lienQuanOkr(db, g.W.id),
			};
			expect(sau, "hien lai X").toEqual({
				muc: [...g.X.muc, ...g.V.muc].sort(),
				lienQuanW: true,
			});
		},
		CHO_MS,
	);
});
