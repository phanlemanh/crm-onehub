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
import { type ViecNhac, viecCanNhac } from "@crm/db/onboarding-nhac";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { parseNhacPayload } from "@crm/validation/nhac-ke-hoach";
import { chayNhac, chuDeNhac, lenLichNhac } from "../agent/lib/nhac-ke-hoach";
import { dungTin } from "../agent/lib/tin-nhac";
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
	NGAY_NHAC,
	ngayCach,
	PHUT_SAU,
} from "./support/nhac-gui-gieo";
import {
	batBot,
	binhLuan,
	donOkr,
	GIO_MS,
	gieoBoPhan,
	gieoChuKy,
	gieoKr,
	gieoMucTieu,
	gieoPhongBan,
	guiCapNhat,
	noiZalo,
	tatBot,
	theoDoi,
	vet,
	voiToken,
} from "./support/okr-gieo";
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
];

function vn(luc: string): Date {
	return new Date(`${luc}+07:00`);
}

async function tinh(now: Date) {
	setSystemTime(now);
	return viecCanNhac(db, { now });
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
		["thu Hai tuan sau", vn("2026-10-19T07:00:00")],
	] as const;
	const MONG = [["K1", "K2"], ["K2"], ["K2"], ["K2"], ["K1", "K2", "K3"]];

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
		return { A, C, K2, ten };
	}

	function capNhatCua(
		kq: Map<string, ViecNhac[]>,
		userId: string,
		ten: Map<string, string>,
	): string[] {
		const v = cua(kq, userId).find((m) => m.loai === "okr-cap-nhat");
		return v && v.loai === "okr-cap-nhat"
			? v.krIds.map((id) => ten.get(id) ?? id)
			: [];
	}

	test("nhac-cap-nhat: ma tran 5 thoi diem x krIds cua A", async () => {
		const g = await gieo();
		const thay = [];
		for (const [o, luc] of O_MATRAN) {
			thay.push({ o, krIds: capNhatCua(await tinh(luc), g.A.id, g.ten) });
		}
		expect(thay, "ma tran 5 o okr-cap-nhat").toEqual(
			O_MATRAN.map(([o], i) => ({ o, krIds: MONG[i] })),
		);
		expect(
			thay.filter((t) => t.krIds.some((k) => k === "KN" || k === "KL")),
			"KR nhap va KR chu ky khac pha khong bao gio co mat",
		).toEqual([]);
	});

	test("nhac-cap-nhat: bien tuan VN thu Hai 06:59 (Chu nhat 23:59 UTC)", async () => {
		const g = await gieo();
		const kq = await tinh(vn("2026-10-19T06:59:00"));
		expect(
			{ o: "thu Hai tuan sau 06:59", krIds: capNhatCua(kq, g.A.id, g.ten) },
			"tuan tinh theo gio VN",
		).toEqual({ o: "thu Hai tuan sau 06:59", krIds: ["K1", "K2", "K3"] });
	});

	test("nhac-cap-nhat: chu ky updateWeekday 3 -> thu Hai, thu Ba khong, thu Tu co", async () => {
		const g = await gieo();
		const thay = [];
		for (const [o, luc] of [
			["thu Hai", vn("2026-10-12T10:00:00")],
			["thu Ba", vn("2026-10-13T10:00:00")],
			["thu Tu", vn("2026-10-14T10:00:00")],
		] as const) {
			thay.push({ o, krIds: capNhatCua(await tinh(luc), g.C.id, g.ten) });
		}
		expect(thay, "ma tran updateWeekday 3").toEqual([
			{ o: "thu Hai", krIds: [] },
			{ o: "thu Ba", krIds: [] },
			{ o: "thu Tu", krIds: ["KC"] },
		]);
	});

	test("nhac-cap-nhat: gui K2 thi viec bien mat o lan tinh ke", async () => {
		const g = await gieo();
		const truoc = capNhatCua(
			await tinh(vn("2026-10-19T08:00:00")),
			g.A.id,
			g.ten,
		);
		await guiCapNhat(g.K2, g.A.id, vn("2026-10-19T08:10:00"));
		const sau = capNhatCua(
			await tinh(vn("2026-10-19T08:15:00")),
			g.A.id,
			g.ten,
		);
		expect({ truoc, sau }).toEqual({
			truoc: ["K1", "K2", "K3"],
			sau: ["K1", "K3"],
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
				d.includes(`${APP_URL}/${s}/okr/cap-nhat-tuan?tu=nhac`),
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
			conLai: text.includes("và 2 việc nữa"),
		}).toEqual({
			dongDau: "Chào An, sáng nay có 12 việc cần bạn để ý.",
			soDaGui: 10,
			daGuiDau: "okr-cap-nhat",
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
