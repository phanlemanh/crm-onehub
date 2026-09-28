import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { OKR } from "../src/okr/okr-config";
import {
	batDauMau,
	CHO_DB,
	doiDauVao,
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

const MT = mt("q4-kd-bac-1");
const K1 = kr("q4-kd-bac-1-k1");
const K2 = kr("q4-kd-bac-1-k2");
const K3 = kr("q4-kd-bac-1-k3");
const DICH_CAN_CHINH = mt("n2");
const MT_KHOA = mt("q3-kd-bac");
const TRUONG = "nguyen-thi-lan";
const TRUONG_BO_PHAN = "tran-quoc-bao";

type Quyet = { ok: true } | { ok: false; lyDo: string };
type NutCay = { id: string; objectiveId: string; children: NutCay[] };

let app: NestExpressApplication;
let cookieTruong = "";
let cookieBoPhan = "";
const dong = {
	tenMucTieu: "",
	tenKr: "",
	canChinh: "",
	cauHoi: "",
	bac: "",
};

const soVet = (objectiveId: string) =>
	db.okrTrail.count({ where: { objectiveId } });

const hang = (id: string) => db.okrDeXuat.findUniqueOrThrow({ where: { id } });

const KHOA = ["loai", "truong", "keyResultId", "truoc", "dich"] as const;

async function khoaCua(id: string) {
	const h = await hang(id);
	return Object.fromEntries(KHOA.map((k) => [k, h[k]]));
}

function quyet(
	deXuatId: string,
	cach: "nhan" | "sua" | "bac" | "bo-qua",
	cookie: string,
	giaTri?: string,
) {
	tienDongHo();
	return goi(
		app,
		"okr.troLyQuyet",
		"mutation",
		{ deXuatId, cach, giaTri },
		cookie,
	);
}

function coLienKet(nut: NutCay, cha: string | null): boolean {
	if (cha === DICH_CAN_CHINH && nut.objectiveId === MT) return true;
	const la = nut.id === DICH_CAN_CHINH ? DICH_CAN_CHINH : cha;
	return nut.children.some((c) => coLienKet(c, la));
}

beforeAll(async () => {
	await batDauMau();
	app = await dungUngDung();
	cookieTruong = await phienMau(TRUONG);
	cookieBoPhan = await phienMau(TRUONG_BO_PHAN);
	await ghiCauHinh(app, await phienMau("le-hai-dang"), NAC_CAU_HINH.bat);
	const mtHienTai = await db.okrObjective.findUniqueOrThrow({
		where: { id: MT },
		select: { title: true, whyNow: true },
	});
	const k2 = await db.okrKeyResult.findUniqueOrThrow({
		where: { id: K2 },
		select: { title: true },
	});
	const ids = await gieoDong(MT, null, [
		dongMau({
			loai: "viet-lai",
			objectiveId: MT,
			truong: "title",
			truoc: mtHienTai.title,
			sau: "Bán lẻ miền Bắc lớn đều qua từng tháng",
		}),
		dongMau({
			loai: "viet-lai",
			objectiveId: MT,
			keyResultId: K2,
			truong: "kr.title",
			truoc: k2.title,
			sau: `${k2.title}, rõ từng tuần`,
		}),
		dongMau({
			loai: "can-chinh",
			objectiveId: MT,
			targetObjectiveId: DICH_CAN_CHINH,
			lyDo: "Mục tiêu này góp vào giao đúng hẹn.",
		}),
		dongMau({
			loai: "hoi",
			objectiveId: MT,
			maVanDe: "khong-do-duoc",
			lyDo: "Câu hỏi giúp làm rõ cách đo.",
		}),
		dongMau({
			loai: "viet-lai",
			objectiveId: MT,
			truong: "whyNow",
			truoc: mtHienTai.whyNow,
			sau: `${mtHienTai.whyNow} Đây là mùa đối tác cần kho nhất.`,
		}),
	]);
	[dong.tenMucTieu, dong.tenKr, dong.canChinh, dong.cauHoi, dong.bac] = ids as [
		string,
		string,
		string,
		string,
		string,
	];
}, CHO_DB);

afterAll(async () => {
	await ketThucMau(app);
}, CHO_DB);

describe("quyet", () => {
	test(
		"(1) Nhận viết lại tên Mục tiêu: tên mới, một hàng vết có note, dòng 'nhan'",
		async () => {
			const h = await hang(dong.tenMucTieu);
			const vetTruoc = await db.okrTrail.findMany({
				where: { objectiveId: MT },
				select: { id: true },
			});
			ok(await quyet(dong.tenMucTieu, "nhan", cookieTruong), "nhan ten");
			const mtDoc = ok<{ title: string }>(
				await goi(app, "okr.objective", "query", { id: MT }, cookieTruong),
				"doc muc tieu",
			);
			expect(mtDoc.title).toBe(h.sau ?? "");
			const moi = await db.okrTrail.findMany({
				where: {
					objectiveId: MT,
					id: { notIn: vetTruoc.map((v) => v.id) },
				},
			});
			expect(moi).toHaveLength(1);
			expect(moi[0]).toMatchObject({
				note: `${OKR.troLy.ghiChuVet}${dong.tenMucTieu}`,
				actorUserId: nguoi(TRUONG),
				action: "sua",
			});
			const sau = await hang(dong.tenMucTieu);
			expect(sau).toMatchObject({
				trangThai: "nhan",
				giaTriCuoi: h.sau,
				nguoiQuyet: nguoi(TRUONG),
			});
			expect(sau.quyetLuc).not.toBeNull();
		},
		CHO_DB,
	);

	test(
		"(2) Sửa rồi nhận tên KR: 'sua', giaTriCuoi là chữ người gõ",
		async () => {
			const goRa = "Có 60 cuộc hẹn đầu tiên với đối tác mới";
			const truoc = await soVet(MT);
			ok(await quyet(dong.tenKr, "sua", cookieTruong, goRa), "sua kr");
			const k = await db.okrKeyResult.findUniqueOrThrow({
				where: { id: K2 },
				select: { title: true },
			});
			expect(k.title).toBe(goRa);
			expect(await soVet(MT)).toBe(truoc + 1);
			expect(await hang(dong.tenKr)).toMatchObject({
				trangThai: "sua",
				giaTriCuoi: goRa,
				nguoiQuyet: nguoi(TRUONG),
			});
		},
		CHO_DB,
	);

	test(
		"(3) Nhận Căn chỉnh: cây căn chỉnh có liên kết, một hàng vết",
		async () => {
			const truoc = await soVet(MT);
			ok(await quyet(dong.canChinh, "nhan", cookieTruong), "nhan can chinh");
			expect(await soVet(MT)).toBe(truoc + 1);
			const { cycleId } = await db.okrObjective.findUniqueOrThrow({
				where: { id: MT },
				select: { cycleId: true },
			});
			const cay = ok<{ roots: NutCay[] }>(
				await goi(app, "okr.cayCanChinh", "query", { cycleId }, cookieTruong),
				"cay can chinh",
			);
			expect(cay.roots.some((r) => coLienKet(r, null))).toBe(true);
			expect((await hang(dong.canChinh)).trangThai).toBe("nhan");
		},
		CHO_DB,
	);

	test(
		"(4) Bỏ qua câu hỏi: 'bo-qua', 0 hàng vết, trường khoá không đổi",
		async () => {
			const truoc = await soVet(MT);
			const khoa = await khoaCua(dong.cauHoi);
			ok(await quyet(dong.cauHoi, "bo-qua", cookieTruong), "bo qua");
			expect(await soVet(MT)).toBe(truoc);
			const h = await hang(dong.cauHoi);
			expect(h.trangThai).toBe("bo-qua");
			expect(h.nguoiQuyet).toBe(nguoi(TRUONG));
			expect(await khoaCua(dong.cauHoi)).toEqual(khoa);
		},
		CHO_DB,
	);

	test(
		"(bac) Bác dòng viết lại: 'bac', người và lúc quyết, 0 hàng vết, trường khoá không đổi",
		async () => {
			const truoc = await soVet(MT);
			const khoa = await khoaCua(dong.bac);
			ok(await quyet(dong.bac, "bac", cookieTruong), "bac");
			expect(await soVet(MT)).toBe(truoc);
			const h = await hang(dong.bac);
			expect(h.trangThai).toBe("bac");
			expect(h.nguoiQuyet).toBe(nguoi(TRUONG));
			expect(h.quyetLuc).not.toBeNull();
			expect(h.giaTriCuoi).toBeNull();
			expect(await khoaCua(dong.bac)).toEqual(khoa);
		},
		CHO_DB,
	);

	test(
		"(5) Hai lần quyết đồng thời cùng dòng: đúng một thành công, một hàng vết",
		async () => {
			await doiDauVao(app, cookieTruong, K3);
			const ten = (
				await db.okrObjective.findUniqueOrThrow({
					where: { id: MT },
					select: { title: true },
				})
			).title;
			const [id] = await gieoDong(MT, null, [
				dongMau({
					loai: "viet-lai",
					objectiveId: MT,
					truong: "title",
					truoc: ten,
					sau: `${ten}, dễ theo dõi hơn`,
				}),
			]);
			const deXuatId = id ?? "";
			const truoc = await soVet(MT);
			const [a, b] = await Promise.all([
				quyet(deXuatId, "nhan", cookieTruong),
				quyet(deXuatId, "nhan", cookieBoPhan),
			]);
			const thanhCong = [a, b].filter((r) => r.status === 200);
			expect(thanhCong.length, "quyet hai lan").toBe(1);
			const loi = [a, b].find((r) => r.status !== 200);
			expect(loi?.status).toBe(409);
			expect(loi?.loi).toBe(OKR.thongDiep.troLy.daQuyet);
			expect(await soVet(MT)).toBe(truoc + 1);
		},
		CHO_DB,
	);

	test(
		"(quyet-lai) thẻ A nhận rồi thẻ B nhận cùng dòng: B nhận lỗi gọn, không hàng vết thứ hai",
		async () => {
			await doiDauVao(app, cookieTruong, K3);
			const tenK1 = (
				await db.okrKeyResult.findUniqueOrThrow({
					where: { id: K1 },
					select: { title: true },
				})
			).title;
			const [id] = await gieoDong(MT, null, [
				dongMau({
					loai: "viet-lai",
					objectiveId: MT,
					keyResultId: K1,
					truong: "kr.title",
					truoc: tenK1,
					sau: `${tenK1}, rõ từng tuần`,
				}),
			]);
			const deXuatId = id ?? "";
			const truoc = await soVet(MT);
			ok(await quyet(deXuatId, "nhan", cookieTruong), "the A");
			const b = await quyet(deXuatId, "nhan", cookieBoPhan);
			expect({ status: b.status, loi: b.loi }).toEqual({
				status: 409,
				loi: OKR.thongDiep.troLy.daQuyet,
			});
			expect(await soVet(MT)).toBe(truoc + 1);
		},
		CHO_DB,
	);

	test(
		"(6) Chu kỳ khoá sửa: Nhận lỗi có lý do của OkrService, dòng vẫn 'cho', 0 hàng vết",
		async () => {
			const ten = (
				await db.okrObjective.findUniqueOrThrow({
					where: { id: MT_KHOA },
					select: { title: true },
				})
			).title;
			const [id] = await gieoDong(MT_KHOA, null, [
				dongMau({
					loai: "viet-lai",
					objectiveId: MT_KHOA,
					truong: "title",
					truoc: ten,
					sau: `${ten}, rõ từng tuần`,
				}),
			]);
			const deXuatId = id ?? "";
			const truoc = await soVet(MT_KHOA);
			const r = await quyet(deXuatId, "nhan", cookieTruong);
			expect({ status: r.status, loi: r.loi }).toEqual({
				status: 400,
				loi: OKR.thongDiep.kyDaKhoa,
			});
			expect((await hang(deXuatId)).trangThai).toBe("cho");
			expect(await soVet(MT_KHOA)).toBe(truoc);
		},
		CHO_DB,
	);

	test(
		"(dau-ra) troLyQuyet trả { ok: true } khi thành công",
		async () => {
			await doiDauVao(app, cookieTruong, K3);
			const [id] = await gieoDong(MT, null, [
				dongMau({
					loai: "hoi",
					objectiveId: MT,
					maVanDe: "trung-y",
					lyDo: "Câu hỏi giúp làm rõ cách đo.",
				}),
			]);
			const kq = ok<Quyet>(
				await quyet(id ?? "", "bo-qua", cookieTruong),
				"bo qua",
			);
			expect(kq).toEqual({ ok: true });
		},
		CHO_DB,
	);
});
