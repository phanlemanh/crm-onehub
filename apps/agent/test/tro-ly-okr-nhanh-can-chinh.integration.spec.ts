import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { danhSachDeXuat } from "@crm/db/okr-de-xuat";
import type { DongDeXuat } from "@crm/validation/okr-tro-ly";
import { dungGoiDeXuat, kiemLaiCua } from "../agent/lib/okr/goi-ngu-canh";
import nopDeXuat from "../agent/subagents/tro_ly_okr/tools/nop_de_xuat";
import { donDep, gieoNguoi, moXuong } from "./support/nhac-gieo";
import { donOkr, gieoChuKy, gieoMucTieu } from "./support/okr-gieo";
import { donTroLy, gieoCauHinhAi } from "./support/tro-ly-gieo";
import {
	dongDaNop,
	moViecDeXuat,
	type NguCanhCon,
	nguCanhCon,
	type ViecMo,
} from "./support/tro-ly-phien-con";

const khoaCu = process.env.AI_GATEWAY_API_KEY;

type NopRa = { ketQua: string; lyDo: string; soDong: number; biLoai: number };
type CongCuNop = {
	execute: (input: { dong: DongDeXuat[] }, ctx: NguCanhCon) => Promise<NopRa>;
};

let nguoi = "";
let chuKy = "";
let phong = "";
const id = {
	x: "",
	kx1: "",
	kx2: "",
	y: "",
	ky1: "",
	a: "",
	b: "",
	c: "",
	d: "",
};

const canChinh = (
	objectiveId: string,
	dich: { targetObjectiveId?: string; targetKeyResultId?: string },
): DongDeXuat => ({
	loai: "can-chinh",
	objectiveId,
	keyResultId: null,
	truong: null,
	truoc: null,
	sau: null,
	maVanDe: null,
	targetObjectiveId: dich.targetObjectiveId ?? null,
	targetKeyResultId: dich.targetKeyResultId ?? null,
	lyDo: "Mục tiêu phòng góp trực tiếp vào mục tiêu công ty.",
});

const nop = (viec: ViecMo, ds: DongDeXuat[]) =>
	(nopDeXuat as unknown as CongCuNop).execute(
		{ dong: ds },
		nguCanhCon(viec.phienGoc),
	);

async function danhSach(objectiveId: string) {
	const goi = await dungGoiDeXuat(objectiveId, nguoi, { keyResultId: null });
	return danhSachDeXuat(db, {
		objectiveId,
		keyResultIds: "moi",
		nac: "bat",
		now: new Date(),
		kiemLai: goi
			? kiemLaiCua(goi)
			: () => ({ qua: false, maLoai: "id-ngoai-goi" }),
	});
}

async function tapDich(objectiveId: string): Promise<Set<string>> {
	const goi = await dungGoiDeXuat(objectiveId, nguoi, { keyResultId: null });
	if (!goi) throw new Error(`khong dung duoc goi: ${objectiveId}`);
	return new Set(goi.dichCanChinh.map((d) => d.id));
}

async function kr(objectiveId: string, tieuDe: string, viTri: number) {
	return (
		await db.okrKeyResult.create({
			data: {
				objectiveId,
				title: tieuDe,
				kind: "tang-toi",
				ownerUserId: nguoi,
				startValue: 1,
				targetValue: 10,
				currentValue: 2,
				unit: "",
				position: viTri,
			},
		})
	).id;
}

const mucTieu = (cap: "onehub" | "phong-ban", tieuDe: string) =>
	gieoMucTieu({
		cycleId: chuKy,
		chu: nguoi,
		congBo: new Date(),
		cap,
		departmentId: cap === "phong-ban" ? phong : undefined,
		tieuDe,
	});

beforeAll(async () => {
	process.env.AI_GATEWAY_API_KEY = "khoa-thu";
	await moXuong();
	nguoi = (await gieoNguoi("Người gieo căn chỉnh")).id;
	chuKy = await gieoChuKy("dang-chay");
	phong = (
		await db.department.create({
			data: { name: `mn3-phong-nhanh-${Date.now()}`, position: 0 },
		})
	).id;
	await gieoCauHinhAi(new Date(Date.now() - 60_000), {
		aiOn: true,
		aiDeXuatPhamVi: "toan-cong-ty",
		aiTranThangUsd: 9,
	});
	id.x = await mucTieu("onehub", "Khối Kinh doanh về đích doanh thu quý");
	id.kx1 = await kr(id.x, "Doanh thu hợp đồng mới đạt 48 tỷ đồng", 0);
	id.kx2 = await kr(id.x, "Tỷ lệ gia hạn hợp đồng đạt 90%", 1);
	id.y = await mucTieu("onehub", "Khách hàng hài lòng hơn sau bán");
	id.ky1 = await kr(id.y, "Điểm hài lòng đạt 4,5", 0);
	id.a = await mucTieu("phong-ban", "Giữ đà tăng trưởng bán lẻ miền Bắc");
	id.b = await mucTieu("phong-ban", "Mở rộng tệp đối tác bán lẻ miền Bắc");
	id.c = await mucTieu("phong-ban", "Chuẩn hoá quy trình báo giá");
	id.d = await mucTieu("phong-ban", "Rút ngắn thời gian chốt hợp đồng");
	await db.okrAlignment.create({
		data: { objectiveId: id.a, targetKeyResultId: id.kx1 },
	});
	await db.okrAlignment.create({
		data: { objectiveId: id.b, targetObjectiveId: id.x },
	});
}, 30_000);

afterAll(async () => {
	if (khoaCu === undefined) delete process.env.AI_GATEWAY_API_KEY;
	else process.env.AI_GATEWAY_API_KEY = khoaCu;
	await donTroLy();
	await donOkr();
	await donDep();
}, 30_000);

describe("nhanh-can-chinh", () => {
	test("nhanh-can-chinh: da gop vao X (thang hay qua KR) thi X va moi KR cua X roi khoi tap dich", async () => {
		const nhanhX = [id.x, id.kx1, id.kx2];
		const khac = [id.y, id.ky1];
		for (const [ten, mt] of [
			["A qua KR", id.a],
			["B thang", id.b],
		] as const) {
			const tap = await tapDich(mt);
			const lot = nhanhX.filter((d) => tap.has(d));
			if (lot.length > 0) throw new Error(`nhanh chong: X (${ten})`);
			for (const d of khac) expect(tap.has(d), `mat dich khac: ${ten}`).toBe(true);
		}
		const tapC = await tapDich(id.c);
		for (const d of [...nhanhX, ...khac])
			expect(tapC.has(d), "doi chung C thieu dich").toBe(true);
	}, 30_000);

	test("nhanh-can-chinh: tro ly van nop Can chinh vao X thi dong bi loai id-ngoai-goi va khong hien", async () => {
		const viec = await moViecDeXuat({ objectiveId: id.a, nguoiYeuCau: nguoi });
		const ra = await nop(viec, [canChinh(id.a, { targetObjectiveId: id.x })]);
		expect(ra.biLoai).toBe(1);
		const hang = await db.okrDeXuat.findMany({ where: { taskId: viec.taskId } });
		expect(hang.map((h) => [h.trangThai, h.maLoai])).toEqual([
			["bi-loai", "id-ngoai-goi"],
		]);
		await dongDaNop(viec.taskId);
		const ds = await danhSach(id.a);
		expect(ds.dong.map((d) => d.id)).not.toContain(hang[0]?.id);
	}, 30_000);

	test("nhanh-can-chinh: dong cho cu vao nhanh X bien mat khi Muc tieu nhan can chinh vao X", async () => {
		const viec = await moViecDeXuat({ objectiveId: id.d, nguoiYeuCau: nguoi });
		const ra = await nop(viec, [canChinh(id.d, { targetKeyResultId: id.kx2 })]);
		expect(ra.biLoai).toBe(0);
		await dongDaNop(viec.taskId);
		const [dongCho] = await db.okrDeXuat.findMany({
			where: { taskId: viec.taskId, trangThai: "cho" },
			select: { id: true },
		});
		if (!dongCho) throw new Error("khong co dong cho de do");
		const truoc = await danhSach(id.d);
		expect(
			truoc.dong.map((d) => d.id),
			"doi chung: dong cho phai hien truoc khi can chinh",
		).toContain(dongCho.id);
		await db.okrAlignment.create({
			data: { objectiveId: id.d, targetObjectiveId: id.x },
		});
		const sau = await danhSach(id.d);
		expect(sau.dong.map((d) => d.id)).not.toContain(dongCho.id);
	}, 30_000);
});
