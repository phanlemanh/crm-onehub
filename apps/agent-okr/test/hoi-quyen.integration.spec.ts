import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { dieuKienXemMucTieu, nguCanhXemOkr } from "@crm/db/okr-hien-thi";
import type { docOkr as docOkrTheoQuyen, LocTim } from "../agent/lib/hoi-doc";
import type { NguCanhPhien } from "../agent/lib/phien";
import docOkr from "../agent/tools/doc_okr";
import timOkr from "../agent/tools/tim_okr";
import { boMau } from "./support/bo-mau";
import { moXuong } from "./support/gieo";

const { idMau, lamSachOkr, napMau, xoaBoOkrMau } = await boMau();

const MOC_MAU = new Date("2026-11-12T15:00:00+07:00");
const GIOI_HAN = idMau("mt", "q4-phap-che-3");
const CHU_KY_Q4 = idMau("chu-ky", "quy4");
const NGUOI = [
	{ ma: "le-hai-dang", thay: true },
	{ ma: "nguyen-thi-lan", thay: false },
	{ ma: "ngo-van-toan", thay: false },
	{ ma: "thai-minh-chau", thay: false },
	{ ma: "tran-quoc-bao", thay: true },
] as const;
const CONG_CU = ["tim_okr", "doc_okr"] as const;

type KetQua = { ok: boolean; mucTieu?: unknown; reason?: string };
type CongCu<DauVao> = {
	execute: (input: DauVao, ctx: NguCanhPhien) => Promise<KetQua>;
};
const tim = timOkr as unknown as CongCu<LocTim>;
const doc = docOkr as unknown as CongCu<
	Parameters<typeof docOkrTheoQuyen>[1]
>;

const phien = (userId: string, purpose = "okr-hoi"): NguCanhPhien => ({
	session: {
		id: `hoi-quyen-${userId}`,
		auth: {
			initiator: {
				authenticator: "crm-okr-cua",
				principalId: userId,
				principalType: "user",
				attributes: { purpose, cuocHoiId: `cuoc-${userId}`, vai: "member" },
			},
			current: null,
		},
	},
});

async function tapThay(userId: string) {
	const nc = (await nguCanhXemOkr(db, [userId])).get(userId);
	if (!nc) throw new Error(`thieu ngu canh xem cua ${userId}`);
	const hang = await db.okrObjective.findMany({
		where: {
			AND: [
				dieuKienXemMucTieu(nc),
				{ status: "cong-bo" },
				{ cycleId: CHU_KY_Q4 },
			],
		},
		select: { id: true, keyResults: { select: { id: true } } },
	});
	return {
		mucTieu: hang.map((h) => h.id).sort(),
		kr: hang.flatMap((h) => h.keyResults.map((k) => k.id)).sort(),
	};
}

type MtRa = { id: string; kr: { id: string }[] };
const maMt = (ds: MtRa[]) => ds.map((m) => m.id).sort();
const maKr = (ds: MtRa[]) => ds.flatMap((m) => m.kr.map((k) => k.id)).sort();

type MucTieuGioiHan = { ten: string; kr: { id: string; title: string }[] };

let gioiHan: MucTieuGioiHan;
let soKhangDinh = 0;

beforeAll(async () => {
	setSystemTime();
	await moXuong();
	await lamSachOkr();
	await xoaBoOkrMau(db);
	await napMau(MOC_MAU);
	setSystemTime(MOC_MAU);
	const g = await db.okrObjective.findUniqueOrThrow({
		where: { id: GIOI_HAN },
		select: { title: true, keyResults: { select: { id: true, title: true } } },
	});
	gioiHan = { ten: g.title, kr: g.keyResults };
}, 120_000);

afterAll(async () => {
	setSystemTime();
	await xoaBoOkrMau(db);
}, 120_000);

describe("hdo quyen doc", () => {
	for (const n of NGUOI) {
		test(`tim_okr ${n.ma}: tap Muc tieu va KR bang dieuKienXemMucTieu`, async () => {
			const uid = idMau("nguoi", n.ma);
			const mong = await tapThay(uid);
			expect(mong.mucTieu.includes(GIOI_HAN)).toBe(n.thay);
			const kq = await tim.execute({ cycleId: CHU_KY_Q4 }, phien(uid));
			const ds = (kq as { mucTieu: MtRa[] }).mucTieu;
			expect(maMt(ds)).toEqual(mong.mucTieu);
			expect(maKr(ds)).toEqual(mong.kr);
			const json = JSON.stringify(kq);
			const lo = [
				GIOI_HAN,
				gioiHan.ten,
				...gioiHan.kr.flatMap((k) => [k.id, k.title]),
			];
			for (const x of lo) expect(json.includes(x)).toBe(n.thay);
			const theoChu = await tim.execute(
				{ tu: gioiHan.kr[0]?.title.slice(0, 18) ?? "x" },
				phien(uid),
			);
			expect(JSON.stringify(theoChu).includes(GIOI_HAN)).toBe(n.thay);
			soKhangDinh++;
		});

		test(`doc_okr ${n.ma}: Muc tieu va KR gioi han nhu khong ton tai`, async () => {
			const uid = idMau("nguoi", n.ma);
			const bia = await doc.execute(
				{ loai: "objective", id: "khong-co-that" },
				phien(uid),
			);
			expect(bia.ok).toBe(false);
			const mt = await doc.execute(
				{ loai: "objective", id: GIOI_HAN },
				phien(uid),
			);
			const kr = await doc.execute(
				{ loai: "kr", id: gioiHan.kr[0]?.id ?? "" },
				phien(uid),
			);
			expect(mt.ok).toBe(n.thay);
			expect(kr.ok).toBe(n.thay);
			if (!n.thay) {
				expect(mt).toEqual(bia);
				expect(kr).toEqual(bia);
			}
			soKhangDinh++;
		});
	}

	test("rong: chu ky khong co OKR tra rong", async () => {
		const uid = idMau("nguoi", "le-hai-dang");
		const kq = await tim.execute(
			{ cycleId: idMau("chu-ky", "nam-ke") },
			phien(uid),
		);
		expect(kq).toMatchObject({ ok: true, rong: true, mucTieu: [] });
	});

	test("so khang dinh bang so o ma tran", () => {
		expect(soKhangDinh).toBe(NGUOI.length * CONG_CU.length);
	});
});
