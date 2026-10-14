import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import {
	type DongDeXuat,
	dongGopY,
	dongTuHang,
} from "@crm/validation/okr-tro-ly";
import nopDeXuat from "../agent/subagents/tro_ly_okr/tools/nop_de_xuat";
import { donDep, gieoNguoi, moXuong } from "./support/nhac-gieo";
import { donOkr, gieoChuKy, gieoMucTieu } from "./support/okr-gieo";
import { donTroLy, gieoCauHinhAi } from "./support/tro-ly-gieo";
import {
	dongDaNop,
	moViecDeXuat,
	type NguCanhCon,
	nguCanhCon,
} from "./support/tro-ly-phien-con";

const khoaCu = process.env.AI_GATEWAY_API_KEY;
const CAN_CU = "Mảng X chiếm 30% doanh thu Q3";
const LY_DO = "Tăng tỷ lệ chốt bán lẻ kéo doanh thu hợp đồng mới.";

type NopRa = { ketQua: string; lyDo: string; soDong: number; biLoai: number };
type CongCuNop = {
	execute: (input: { dong: DongDeXuat[] }, ctx: NguCanhCon) => Promise<NopRa>;
};

let nguoi = "";
let chuKy = "";
let phong = "";
const id = { x: "", kx1: "", kx2: "", a: "" };

const canChinh = (
	targetKeyResultId: string,
	canCu: string | null,
): DongDeXuat => ({
	loai: "can-chinh",
	objectiveId: id.a,
	keyResultId: null,
	truong: null,
	truoc: null,
	sau: null,
	maVanDe: null,
	targetObjectiveId: null,
	targetKeyResultId,
	lyDo: LY_DO,
	canCu,
});

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
	nguoi = (await gieoNguoi("Người gieo căn cứ")).id;
	chuKy = await gieoChuKy("dang-chay");
	phong = (
		await db.department.create({
			data: { name: `l4-phong-can-cu-${Date.now()}`, position: 0 },
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
	id.a = await mucTieu("phong-ban", "Giữ đà tăng trưởng bán lẻ miền Bắc");
}, 30_000);

afterAll(async () => {
	if (khoaCu === undefined) delete process.env.AI_GATEWAY_API_KEY;
	else process.env.AI_GATEWAY_API_KEY = khoaCu;
	await donTroLy();
	await donOkr();
	await donDep();
}, 30_000);

describe("l4-can-cu", () => {
	test("l4-can-cu: căn cứ đi qua công cụ nop_de_xuat tới hàng đề xuất và đọc lại được", async () => {
		const viec = await moViecDeXuat({ objectiveId: id.a, nguoiYeuCau: nguoi });
		const ra = await (nopDeXuat as unknown as CongCuNop).execute(
			{ dong: [canChinh(id.kx1, CAN_CU), canChinh(id.kx2, null)] },
			nguCanhCon(viec.phienGoc),
		);
		expect([ra.ketQua, ra.biLoai]).toEqual(["da-ghi", 0]);
		await dongDaNop(viec.taskId);
		const hang = await db.okrDeXuat.findMany({
			where: { taskId: viec.taskId },
			orderBy: [{ createdAt: "asc" }, { id: "asc" }],
		});
		const theoDich = new Map(
			hang.map((h) => [dongTuHang(h).targetKeyResultId, dongTuHang(h)]),
		);
		const coCanCu = theoDich.get(id.kx1);
		if (coCanCu?.canCu !== CAN_CU)
			throw new Error(
				`can cu Kara bi roi khi nop: ${JSON.stringify(coCanCu?.canCu)}`,
			);
		expect(theoDich.get(id.kx2)?.canCu ?? null).toBeNull();
		const doiTruoc = hang[0];
		if (!doiTruoc) throw new Error("khong co hang de dung dong doi truoc");
		expect(dongTuHang({ ...doiTruoc, noiDung: null }).canCu ?? null).toBeNull();
	}, 30_000);

	test("l4-can-cu: dongGopY từ chối căn cứ sai chỗ và quá trần", () => {
		const goc = canChinh("kr-x", null);
		const ca: [string, unknown, boolean][] = [
			["can-chinh co can cu", { ...goc, canCu: CAN_CU }, true],
			["can-chinh can cu 200", { ...goc, canCu: "a".repeat(200) }, true],
			["can-chinh can cu 201", { ...goc, canCu: "a".repeat(201) }, false],
			[
				"viet-lai co can cu",
				{
					...goc,
					loai: "viet-lai",
					truong: "title",
					truoc: "Tên cũ",
					sau: "Tên mới rõ hơn",
					targetKeyResultId: null,
					canCu: CAN_CU,
				},
				false,
			],
			[
				"hoi co can cu",
				{
					...goc,
					loai: "hoi",
					maVanDe: "kr-la-viec",
					targetKeyResultId: null,
					canCu: CAN_CU,
				},
				false,
			],
		];
		const ket = ca.map(([ten, vao]) => [ten, dongGopY.safeParse(vao).success]);
		expect(ket).toEqual(ca.map(([ten, , qua]) => [ten, qua]));
		expect(ket).toHaveLength(5);
	});
});
