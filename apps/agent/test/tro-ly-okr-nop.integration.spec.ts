import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { danhSachDeXuat } from "@crm/db/okr-de-xuat";
import type { DongGopY } from "@crm/validation/okr-tro-ly";
import hookGoc from "../agent/hooks/okr-uy-quyen";
import { dungGoiDeXuat, kiemLaiCua } from "../agent/lib/okr/goi-ngu-canh";
import nopDeXuat from "../agent/subagents/tro_ly_okr/tools/nop_de_xuat";
import type { XuLyKetQuaHanhDong } from "./support/eve-kieu";
import { donDep, gieoNguoi, moXuong } from "./support/nhac-gieo";
import { donOkr, gieoChuKy, gieoMucTieu } from "./support/okr-gieo";
import { donTroLy, gieoCauHinhAi } from "./support/tro-ly-gieo";
import {
	dongDaNop,
	moViecDeXuat,
	type NguCanhCon,
	nguCanhCon,
	nguCanhGoc,
	type ViecMo,
} from "./support/tro-ly-phien-con";

const khoaCu = process.env.AI_GATEWAY_API_KEY;
const TEN_THANH_VIEN = "Trần Thị Bảo Ngọc";

type NopRa = { ketQua: string; lyDo: string; soDong: number; biLoai: number };
type CongCuNop = {
	execute: (input: { dong: DongGopY[] }, ctx: NguCanhCon) => Promise<NopRa>;
};

let nguoi = "";
let chuKy = "";
let phong = "";

function dong(
	p: Partial<DongGopY> & Pick<DongGopY, "loai" | "objectiveId">,
): DongGopY {
	return {
		keyResultId: null,
		truong: null,
		truoc: null,
		sau: null,
		maVanDe: null,
		targetObjectiveId: null,
		targetKeyResultId: null,
		lyDo: "Câu gọn hơn, nói rõ kết quả.",
		...p,
	};
}

async function nop(viec: ViecMo, ds: DongGopY[]): Promise<NopRa> {
	return (nopDeXuat as unknown as CongCuNop).execute(
		{ dong: ds },
		nguCanhCon(viec.phienGoc),
	);
}

async function mucTieu(v: {
	cap: "onehub" | "phong-ban";
	tieuDe: string;
	whyNow?: string;
}): Promise<string> {
	const id = await gieoMucTieu({
		cycleId: chuKy,
		chu: nguoi,
		congBo: new Date(),
		cap: v.cap,
		departmentId: v.cap === "phong-ban" ? phong : undefined,
		tieuDe: v.tieuDe,
	});
	if (v.whyNow) {
		await db.okrObjective.update({ where: { id }, data: { whyNow: v.whyNow } });
	}
	return id;
}

async function kr(v: {
	objectiveId: string;
	tieuDe: string;
	kieu?: "tang-toi" | "giam-xuong";
	khoi: number;
	dich: number;
	hienTai: number;
	donVi?: string;
	viTri: number;
}): Promise<string> {
	const k = await db.okrKeyResult.create({
		data: {
			objectiveId: v.objectiveId,
			title: v.tieuDe,
			kind: v.kieu ?? "tang-toi",
			ownerUserId: nguoi,
			startValue: v.khoi,
			targetValue: v.dich,
			currentValue: v.hienTai,
			unit: v.donVi ?? "",
			position: v.viTri,
		},
	});
	return k.id;
}

async function quyet(id: string, trangThai: "bac" | "bo-qua"): Promise<void> {
	const { count } = await db.okrDeXuat.updateMany({
		where: { id, trangThai: "cho" },
		data: { trangThai, nguoiQuyet: nguoi, quyetLuc: new Date() },
	});
	if (count !== 1) throw new Error(`khong quyet duoc dong ${id}`);
}

async function hangCua(taskId: string) {
	return db.okrDeXuat.findMany({
		where: { taskId },
		orderBy: [{ createdAt: "asc" }, { id: "asc" }],
	});
}

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

async function capNhatTuan(keyResultId: string, giaTri: number): Promise<void> {
	await db.okrKeyResult.update({
		where: { id: keyResultId },
		data: { currentValue: giaTri },
	});
}

beforeAll(async () => {
	process.env.AI_GATEWAY_API_KEY = "khoa-thu";
	await moXuong();
	nguoi = (await gieoNguoi("Người gieo nộp đề xuất")).id;
	await gieoNguoi(TEN_THANH_VIEN);
	chuKy = await gieoChuKy("dang-chay");
	phong = (
		await db.department.create({
			data: { name: `mn3-phong-nop-${Date.now()}`, position: 0 },
		})
	).id;
	await gieoCauHinhAi(new Date(Date.now() - 60_000), {
		aiOn: true,
		aiDeXuatPhamVi: "toan-cong-ty",
		aiTranThangUsd: 9,
	});
}, 30_000);

afterAll(async () => {
	if (khoaCu === undefined) delete process.env.AI_GATEWAY_API_KEY;
	else process.env.AI_GATEWAY_API_KEY = khoaCu;
	await donTroLy();
	await donOkr();
	await donDep();
}, 30_000);

describe("tro-ly-okr-nop", () => {
	test("nop-ghi: mười dòng đỏ một mỗi mã và ba dòng lành; đọc lại chạy lại bộ kiểm", async () => {
		const dichId = await mucTieu({
			cap: "onehub",
			tieuDe: "Mở rộng thị phần của OneHub",
		});
		await kr({
			objectiveId: dichId,
			tieuDe: "Nâng tầm thương hiệu OneHub trên thị trường",
			khoi: 1,
			dich: 3,
			hienTai: 1,
			viTri: 0,
		});
		const a = await mucTieu({
			cap: "phong-ban",
			tieuDe: "Tăng trưởng kênh đối tác phía Nam",
			whyNow: "Kênh đối tác đang chững lại",
		});
		const k1 = await kr({
			objectiveId: a,
			tieuDe: "Mở rộng mạng lưới đối tác",
			khoi: 10,
			dich: 25,
			hienTai: 12,
			donVi: "đối tác",
			viTri: 0,
		});
		const k2 = await kr({
			objectiveId: a,
			tieuDe: "Gọi 50 cuộc cho đối tác mới",
			kieu: "giam-xuong",
			khoi: 5,
			dich: 50,
			hienTai: 5,
			viTri: 1,
		});
		const mt = { loai: "hoi" as const, objectiveId: a };

		const v0 = await moViecDeXuat({ objectiveId: a, nguoiYeuCau: nguoi });
		expect(
			await nop(v0, [
				dong({
					...mt,
					keyResultId: k1,
					maVanDe: "khong-do-duoc",
					lyDo: "KR này chưa nói rõ cách đo",
				}),
			]),
		).toMatchObject({ ketQua: "da-ghi", soDong: 1, biLoai: 0 });
		await dongDaNop(v0.taskId);
		const [r0] = await hangCua(v0.taskId);
		await quyet(r0?.id ?? "", "bac");
		await capNhatTuan(k2, 6);

		const lanh = [
			dong({
				loai: "viet-lai",
				objectiveId: a,
				truong: "title",
				truoc: "Tăng trưởng kênh đối tác phía Nam",
				sau: "Đưa kênh đối tác phía Nam thành nguồn doanh thu chính",
			}),
			dong({
				loai: "viet-lai",
				objectiveId: a,
				keyResultId: k1,
				truong: "kr.title",
				truoc: "Mở rộng mạng lưới đối tác",
				sau: "Tăng số đối tác từ 10 lên 25",
			}),
			dong({
				loai: "can-chinh",
				objectiveId: a,
				targetObjectiveId: dichId,
				lyDo: "Mục tiêu này góp phần vào mục tiêu công ty",
			}),
		];
		const v1 = await moViecDeXuat({ objectiveId: a, nguoiYeuCau: nguoi });
		const ra1 = await nop(v1, [
			...lanh,
			dong({
				loai: "viet-lai",
				objectiveId: a,
				keyResultId: "kr-khong-co-trong-goi",
				truong: "kr.title",
				truoc: "Mở rộng mạng lưới đối tác",
				sau: "Mở rộng mạng lưới đối tác chiến lược",
			}),
			dong({
				loai: "viet-lai",
				objectiveId: a,
				truong: "whyNow",
				truoc: "Kênh đối tác đang chững lại",
				sau: "kênh đối tác đang chững lại.",
			}),
			dong({
				loai: "viet-lai",
				objectiveId: a,
				truong: "whyNow",
				truoc: "Kênh đối tác đang chững lại",
				sau: "Kênh đối tác đang chững lại, cần tăng 99% trong quý",
			}),
			dong({
				loai: "viet-lai",
				objectiveId: a,
				truong: "title",
				truoc: "Tăng trưởng kênh đối tác phía Nam",
				sau: "Đưa kênh đối tác lên đầu bảng xếp hạng",
			}),
			dong({
				...mt,
				keyResultId: k1,
				maVanDe: "trung-y",
				lyDo: `Nên hỏi ${TEN_THANH_VIEN} cách đo KR này`,
			}),
		]);
		expect(ra1).toMatchObject({ ketQua: "da-ghi", soDong: 3, biLoai: 5 });
		await dongDaNop(v1.taskId);
		await capNhatTuan(k2, 7);

		const v2 = await moViecDeXuat({ objectiveId: a, nguoiYeuCau: nguoi });
		const ra2 = await nop(v2, [
			dong({
				loai: "viet-lai",
				objectiveId: a,
				truong: "title",
				truoc: "Tăng trưởng kênh đối tác phía Nam",
				sau: "Nâng tầm thương hiệu OneHub trên thị trường",
			}),
			dong({
				...mt,
				keyResultId: k2,
				maVanDe: "kr-la-viec",
				lyDo: "KR này đang đo việc làm, chưa đo kết quả",
			}),
			dong({
				loai: "can-chinh",
				objectiveId: a,
				targetKeyResultId: k1,
				lyDo: "Gắn vào KR của chính mục tiêu",
			}),
			dong({
				...mt,
				keyResultId: k1,
				maVanDe: "khong-do-duoc",
				lyDo: "Chưa rõ con số nào cho biết KR đạt",
			}),
			{ ...(lanh[1] as DongGopY), lyDo: "Nói rõ điểm đầu và điểm đích" },
		]);
		expect(ra2).toMatchObject({ ketQua: "da-ghi", soDong: 0, biLoai: 5 });
		await dongDaNop(v2.taskId);

		const hang = [...(await hangCua(v1.taskId)), ...(await hangCua(v2.taskId))];
		expect(hang.filter((h) => h.trangThai === "cho").length).toBe(3);
		expect(hang.every((h) => h.nac === "bat")).toBe(true);
		expect(
			hang
				.filter((h) => h.trangThai === "bi-loai")
				.map((h) => h.maLoai)
				.sort(),
		).toEqual(
			[
				"chep-cap-tren",
				"da-bac",
				"dang-cho",
				"dich-ngoai-tap",
				"id-ngoai-goi",
				"khong-doi",
				"noi-ve-nguoi",
				"so-moi",
				"trung-luat",
				"tu-cam",
			].sort(),
		);
		const tatCa = await db.okrDeXuat.groupBy({
			by: ["trangThai"],
			where: { objectiveId: a },
			_count: true,
		});
		expect(
			Object.fromEntries(tatCa.map((g) => [g.trangThai, g._count])),
		).toEqual({ bac: 1, cho: 3, "bi-loai": 10 });

		const idLanh = hang.filter((h) => h.trangThai === "cho").map((h) => h.id);
		const truoc = await danhSach(a);
		expect(truoc.dong.map((d) => d.id).sort()).toEqual([...idLanh].sort());

		await db.okrKeyResult.update({
			where: { id: k1 },
			data: { startValue: 11 },
		});
		const sau = await danhSach(a);
		if (sau.dong.length === 3) throw new Error("doc lai khong kiem lai");
		expect(sau.dong.map((d) => d.sau).sort()).toEqual(
			[lanh[0]?.sau, lanh[2]?.sau].sort(),
		);
	}, 60_000);

	test("khong-moi-lai: bác, bỏ qua không mời lại; người sửa trường thì mở lại; truoc cũ thì hết hạn", async () => {
		const x = await mucTieu({ cap: "onehub", tieuDe: "Mở rộng thị phần" });
		const b = await mucTieu({
			cap: "phong-ban",
			tieuDe: "Giữ chân đối tác lâu dài",
			whyNow: "Đối tác rời đi nhiều hơn trước",
		});
		const l1 = await kr({
			objectiveId: b,
			tieuDe: "Tăng tỷ lệ đối tác quay lại",
			khoi: 20,
			dich: 40,
			hienTai: 25,
			donVi: "%",
			viTri: 0,
		});
		const l2 = await kr({
			objectiveId: b,
			tieuDe: "Giảm thời gian phản hồi đối tác",
			kieu: "giam-xuong",
			khoi: 48,
			dich: 24,
			hienTai: 40,
			donVi: "giờ",
			viTri: 1,
		});
		const baDong = (
			tenKr: string,
			sau: string,
			lyDoHoi: string,
			lyDoCc: string,
		) => [
			dong({
				loai: "viet-lai",
				objectiveId: b,
				keyResultId: l1,
				truong: "kr.title",
				truoc: tenKr,
				sau,
			}),
			dong({
				loai: "hoi",
				objectiveId: b,
				keyResultId: l1,
				maVanDe: "kr-la-viec",
				lyDo: lyDoHoi,
			}),
			dong({
				loai: "can-chinh",
				objectiveId: b,
				targetObjectiveId: x,
				lyDo: lyDoCc,
			}),
		];

		const v1 = await moViecDeXuat({ objectiveId: b, nguoiYeuCau: nguoi });
		expect(
			await nop(
				v1,
				baDong(
					"Tăng tỷ lệ đối tác quay lại",
					"Nâng tỷ lệ đối tác quay lại hợp tác",
					"KR này có đang đo việc làm không",
					"Giữ chân đối tác giúp mở rộng thị phần",
				),
			),
		).toMatchObject({ ketQua: "da-ghi", soDong: 3, biLoai: 0 });
		await dongDaNop(v1.taskId);
		const [vl, hoi, cc] = await hangCua(v1.taskId);
		await quyet(vl?.id ?? "", "bac");
		await quyet(hoi?.id ?? "", "bo-qua");
		await quyet(cc?.id ?? "", "bac");
		await capNhatTuan(l2, 36);

		const v2 = await moViecDeXuat({ objectiveId: b, nguoiYeuCau: nguoi });
		await nop(
			v2,
			baDong(
				"Tăng tỷ lệ đối tác quay lại",
				"Tăng số đối tác quay lại hợp tác",
				"Nên nói rõ KR đo kết quả gì",
				"Mục tiêu này nối với thị phần",
			),
		);
		await dongDaNop(v2.taskId);
		const lan2 = await hangCua(v2.taskId);
		const vl2 = lan2.find((h) => h.loai === "viet-lai");
		if (vl2?.trangThai === "cho") throw new Error("moi lai sau khi bac");
		expect(lan2.map((h) => [h.loai, h.trangThai, h.maLoai])).toEqual([
			["viet-lai", "bi-loai", "da-bac"],
			["hoi", "bi-loai", "da-bac"],
			["can-chinh", "bi-loai", "da-bac"],
		]);

		await db.okrKeyResult.update({
			where: { id: l1 },
			data: { title: "Tăng tỷ lệ đối tác gia hạn hợp tác" },
		});
		const v3 = await moViecDeXuat({ objectiveId: b, nguoiYeuCau: nguoi });
		const moLai = dong({
			loai: "viet-lai",
			objectiveId: b,
			keyResultId: l1,
			truong: "kr.title",
			truoc: "Tăng tỷ lệ đối tác gia hạn hợp tác",
			sau: "Nâng tỷ lệ đối tác gia hạn hợp tác mỗi quý",
		});
		expect(await nop(v3, [moLai])).toMatchObject({
			ketQua: "da-ghi",
			soDong: 1,
		});
		await dongDaNop(v3.taskId);
		const [r3] = await hangCua(v3.taskId);
		expect(r3?.trangThai).toBe("cho");
		expect((await danhSach(b)).dong.map((d) => d.id)).toEqual([r3?.id]);

		await db.okrKeyResult.update({
			where: { id: l1 },
			data: { title: "Tăng tỷ lệ đối tác gắn bó" },
		});
		expect((await danhSach(b)).dong).toEqual([]);
		const hetHan = await db.okrDeXuat.findUniqueOrThrow({
			where: { id: r3?.id ?? "" },
		});
		expect(hetHan.trangThai).toBe("het-han");
	}, 60_000);

	test("muc-tieu-mat: Mục tiêu bỏ hay xoá khi việc đang chạy — không ghi dòng, việc đóng thieu-du-lieu, danh sách rỗng", async () => {
		const c = await mucTieu({ cap: "onehub", tieuDe: "Mục tiêu sẽ bị bỏ" });
		const d = await mucTieu({ cap: "onehub", tieuDe: "Mục tiêu sẽ bị xoá" });
		const kd = await kr({
			objectiveId: d,
			tieuDe: "Có thêm đối tác mới",
			khoi: 1,
			dich: 10,
			hienTai: 1,
			viTri: 0,
		});
		const vc = await moViecDeXuat({ objectiveId: c, nguoiYeuCau: nguoi });
		const vd = await moViecDeXuat({ objectiveId: d, nguoiYeuCau: nguoi });
		await db.okrObjective.update({
			where: { id: c },
			data: { status: "da-bo" },
		});
		await db.okrKeyResult.delete({ where: { id: kd } });
		await db.okrObjective.delete({ where: { id: d } });

		for (const [viec, objectiveId] of [
			[vc, c],
			[vd, d],
		] as const) {
			const ra = await nop(viec, [
				dong({
					loai: "viet-lai",
					objectiveId,
					truong: "title",
					truoc: "Mục tiêu cũ",
					sau: "Mục tiêu mới rõ hơn",
				}),
			]);
			expect(ra).toMatchObject({ ketQua: "thieu-du-lieu", soDong: 0 });
			expect(await hangCua(viec.taskId)).toEqual([]);
			const moc = hookGoc.events[
				"action.result"
			] as unknown as XuLyKetQuaHanhDong;
			await moc(
				{
					type: "action.result",
					data: {
						result: {
							kind: "subagent-result",
							subagentName: "tro_ly_okr",
							callId: "goi-tro-ly",
							isError: false,
							output: {
								trangThai: "khong-lam-duoc",
								maLoi: "thieu-du-lieu",
							} as never,
						},
					},
				},
				nguCanhGoc(viec.taskId, viec.phienGoc) as never,
			);
			const hang = await db.agentTask.findUniqueOrThrow({
				where: { id: viec.taskId },
			});
			expect(hang.outcome).toBe("khong-lam-duoc:thieu-du-lieu");
			const ds = await danhSach(objectiveId);
			expect(ds.dong).toEqual([]);
		}
	}, 60_000);
});
