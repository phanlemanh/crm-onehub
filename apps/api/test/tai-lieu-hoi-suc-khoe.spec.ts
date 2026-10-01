import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { demBaoSai } from "@crm/db/tai-lieu-hoi";
import type { TraLoiDaKiem } from "@crm/validation/tai-lieu-hoi";
import {
	type Ai,
	deXuat,
	dungSan,
	duyet,
	goi,
	hoi,
	ma,
	ok,
	phien,
	taoTrang,
} from "./tai-lieu-san";

dungSan();

type SucKhoe = {
	chuaTraLoi: { rows: { hoiId: string; cauHoi: string }[]; total: number };
	baoSai: {
		rows: { id: string; slug: string; cauHoi: string }[];
		total: number;
	};
};

async function sucKhoe(ai: Ai): Promise<SucKhoe> {
	return ok<SucKhoe>(
		await hoi("taiLieu.sucKhoe", undefined, ai),
		`suc khoe ${ai}`,
	);
}

async function trangDaDuyet(ten: string, chu: Ai) {
	const t = await taoTrang(
		ma(ten),
		`## ${ten}\n\nNội dung ${ten}.`,
		"tao",
		chu,
	);
	await duyet(t.deXuatId, chu);
	const hang = await db.taiLieuTrang.findUniqueOrThrow({
		where: { id: t.trangId },
		select: { ten: true },
	});
	return { ...t, ten: hang.ten };
}

function traLoiTrich(
	trang: { slug: string; ten: string; phienBan?: number }[],
): TraLoiDaKiem {
	return {
		cau: [
			{
				chu: "Theo trang.",
				trich: trang.map((t) => ({
					slug: t.slug,
					ten: t.ten,
					phienBan: t.phienBan ?? 1,
					duyetLuc: new Date().toISOString(),
					doan: `Nội dung ${t.ten}.`,
				})),
			},
		],
		quaHan: [],
	};
}

describe("tlk-chua-tra-loi", () => {
	test("tlk-chua-tra-loi: ma tran 5 nguoi, khong lo nguoi hoi, da xu ly", async () => {
		const a = await trangDaDuyet("Chua tra loi A", "chu");
		const b = await trangDaDuyet("Chua tra loi B", "tao");
		const gan = (ds: { slug: string; ten: string }[]) =>
			ds.map((t) => ({ slug: t.slug, ten: t.ten }));
		const tao = async (
			cauHoi: string,
			ganNhat: { slug: string; ten: string }[],
		) =>
			(
				await db.taiLieuHoi.create({
					data: {
						nguoiHoiId: phien.khac.nguoi,
						kenh: "CRM",
						cauHoi,
						trangThai: "TU_CHOI",
						lyDo: "khong-co-trang",
						ganNhat,
						xongLuc: new Date(),
					},
				})
			).id;
		const q1 = await tao("Câu Q1?", gan([a]));
		const q2 = await tao("Câu Q2?", gan([b]));
		const q3 = await tao("Câu Q3?", gan([a, b]));
		const q4 = await tao("Câu Q4?", []);
		const cuaToi = new Set([q1, q2, q3, q4]);
		const mong = {
			owner: [q1, q2, q3, q4],
			admin: [q1, q2, q3, q4],
			chu: [q1, q3],
			tao: [q2, q3],
			khac: [],
		} satisfies Record<string, string[]>;
		const nguoiHoi = await db.user.findUniqueOrThrow({
			where: { id: phien.khac.nguoi },
			select: { name: true },
		});
		for (const [ai, ky] of Object.entries(mong)) {
			const sk = await sucKhoe(ai as Ai);
			const thay = sk.chuaTraLoi.rows
				.map((r) => r.hoiId)
				.filter((id) => cuaToi.has(id));
			expect(`tlk-chua-tra-loi: ${ai} ${[...thay].sort().join(",")}`).toBe(
				`tlk-chua-tra-loi: ${ai} ${[...ky].sort().join(",")}`,
			);
			const json = JSON.stringify(sk.chuaTraLoi);
			expect(json.includes(phien.khac.nguoi)).toBe(false);
			expect(json.includes(nguoiHoi.name)).toBe(false);
		}

		ok(
			await goi("taiLieu.xuLyChuaTraLoi", { hoiId: q1 }, "chu"),
			"chu A xu ly Q1",
		);
		const hang = await db.taiLieuHoi.findUniqueOrThrow({ where: { id: q1 } });
		expect(hang.xuLyBoiId).toBe(phien.chu.nguoi);
		expect(hang.xuLyLuc).not.toBeNull();
		for (const ai of ["owner", "chu"] as const) {
			const sk = await sucKhoe(ai);
			expect(sk.chuaTraLoi.rows.map((r) => r.hoiId)).not.toContain(q1);
		}
		expect(
			(await goi("taiLieu.xuLyChuaTraLoi", { hoiId: q2 }, "chu")).status,
		).toBe(403);
		expect(
			(await goi("taiLieu.xuLyChuaTraLoi", { hoiId: q2 }, "khac")).status,
		).toBe(404);
	});
});

describe("tlk-bao-sai", () => {
	test("tlk-bao-sai: hai viec cho hai chu trang, mot lan, chi nguoi hoi, ket luan va dem", async () => {
		const tu = new Date(Date.now() - 1000);
		const x = await trangDaDuyet("Bao sai X", "chu");
		const y = await trangDaDuyet("Bao sai Y", "tao");
		const daTrich = { x: 1, y: 1 };
		await duyet(
			await deXuat(x.slug, "## Bao sai X\n\nBản mới hơn bản đã trích.", "chu"),
			"chu",
		);
		const banX = await db.taiLieuTrang.findUniqueOrThrow({
			where: { id: x.trangId },
			select: { banDangDung: { select: { so: true } } },
		});
		expect(banX.banDangDung?.so).toBeGreaterThan(daTrich.x);
		const q = await db.taiLieuHoi.create({
			data: {
				nguoiHoiId: phien.khac.nguoi,
				kenh: "CRM",
				trangThai: "TRA_LOI",
				traLoi: traLoiTrich([
					{ ...x, phienBan: daTrich.x },
					{ ...y, phienBan: daTrich.y },
				]),
				xongLuc: new Date(),
			},
		});
		const vao = { hoiId: q.id, cauHoi: "Hoa hồng tầng 2?", ghiChu: "Sai số." };
		expect(
			ok<{ soViec: number }>(await goi("hoiKho.baoSai", vao, "khac"), "bao 1")
				.soViec,
		).toBe(2);
		const viec = await db.taiLieuBaoSai.findMany({ where: { hoiId: q.id } });
		expect(viec.map((v) => v.trangId).sort()).toEqual(
			[x.trangId, y.trangId].sort(),
		);
		for (const v of viec) {
			expect(v.cauHoi).toBe("Hoa hồng tầng 2?");
			expect(v.ghiChu).toBe("Sai số.");
		}
		const banCua = Object.fromEntries(viec.map((v) => [v.trangId, v.phienBan]));
		expect(
			banCua[x.trangId],
			"tlk-bao-sai: phien ban bao sai khong phai ban da trich",
		).toBe(daTrich.x);
		expect(banCua[y.trangId]).toBe(daTrich.y);
		expect(
			ok<{ soViec: number }>(await goi("hoiKho.baoSai", vao, "khac"), "bao 2")
				.soViec,
		).toBe(2);
		expect(await db.taiLieuBaoSai.count({ where: { hoiId: q.id } })).toBe(2);
		expect((await goi("hoiKho.baoSai", vao, "tao")).status).toBe(404);
		const tuChoi = await db.taiLieuHoi.create({
			data: {
				nguoiHoiId: phien.khac.nguoi,
				kenh: "CRM",
				trangThai: "TU_CHOI",
				ganNhat: [],
				cauHoi: "Không có trang?",
			},
		});
		expect(
			(
				await goi(
					"hoiKho.baoSai",
					{ hoiId: tuChoi.id, cauHoi: "Không có trang?" },
					"khac",
				)
			).status,
		).toBe(400);

		const idX = viec.find((v) => v.trangId === x.trangId)?.id ?? "";
		const idY = viec.find((v) => v.trangId === y.trangId)?.id ?? "";
		const cuaToi = new Set([idX, idY]);
		const mong = {
			chu: [idX],
			tao: [idY],
			owner: [idX, idY],
			admin: [idX, idY],
			khac: [],
		} satisfies Record<string, string[]>;
		for (const [ai, ky] of Object.entries(mong)) {
			const sk = await sucKhoe(ai as Ai);
			const thay = sk.baoSai.rows
				.map((r) => r.id)
				.filter((id) => cuaToi.has(id));
			expect(`tlk-bao-sai: ${ai} ${thay.sort().join(",")}`).toBe(
				`tlk-bao-sai: ${ai} ${[...ky].sort().join(",")}`,
			);
		}

		expect((await goi("taiLieu.xuLyBaoSai", { id: idX }, "chu")).status).toBe(
			400,
		);
		expect(
			(await goi("taiLieu.xuLyBaoSai", { id: idX, ketLuan: "SAI" }, "tao"))
				.status,
		).toBe(403);
		ok(
			await goi("taiLieu.xuLyBaoSai", { id: idX, ketLuan: "SAI" }, "chu"),
			"chu dong X",
		);
		const dongX = await db.taiLieuBaoSai.findUniqueOrThrow({
			where: { id: idX },
		});
		expect(dongX.trangThai).toBe("DA_XU_LY");
		expect(dongX.ketLuan).toBe("SAI");
		expect(dongX.xuLyBoiId).toBe(phien.chu.nguoi);
		ok(
			await goi("taiLieu.xuLyBaoSai", { id: idY, ketLuan: "DUNG" }, "tao"),
			"tao dong Y",
		);

		const q2 = await db.taiLieuHoi.create({
			data: {
				nguoiHoiId: phien.khac.nguoi,
				kenh: "CRM",
				trangThai: "TRA_LOI",
				traLoi: traLoiTrich([x]),
				xongLuc: new Date(),
			},
		});
		ok(
			await goi(
				"hoiKho.baoSai",
				{ hoiId: q2.id, cauHoi: "Câu thứ hai?" },
				"khac",
			),
			"bao thu ba",
		);
		expect(await demBaoSai(db, tu, new Date(Date.now() + 1000))).toEqual({
			tong: 3,
			daXuLy: 2,
			xacNhanSai: 1,
		});
	});
});
