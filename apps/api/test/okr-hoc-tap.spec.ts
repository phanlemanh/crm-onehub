import { afterAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { TRANG_THAI_MUC_TIEU } from "@crm/validation/okr-muc-tieu";
import { OKR } from "../src/okr/okr-config";
import {
	chamHetBangGoiY,
	donSanKhep,
	gieoKyQuy,
	gieoMucTieuCongBo,
	sangPha,
} from "./okr-khep-san";
import {
	bpMoi,
	CHUONG_TRINH_RONG,
	doc,
	dungSan,
	goi,
	ma,
	ok,
	pbMoi,
	phien,
	truongMoi,
} from "./okr-san";

dungSan();

const T = OKR.thongDiep.khep;

type DongCham = { id: string; kind: string; cachDoc: string | null };
type BangCham = {
	conLai: number;
	hocTapChuaGhi: { id: string; ten: string }[];
	mucTieu: DongCham[];
};

const bang = (cycleId: string) =>
	doc<BangCham>("okr.bangCham", "quan", { cycleId });
const ghiHoc = async (objectiveId: string, noiDung: string) =>
	ok(
		await goi("okr.ghiDieuHocDuoc", { objectiveId, noiDung }),
		"ghi dieu hoc duoc",
	);

function ghim(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

async function caiChuongTrinh(duyetCongBo = false): Promise<void> {
	ok(
		await goi("okr.setProgram", { ...CHUONG_TRINH_RONG, duyetCongBo }),
		"cau hinh",
	);
}

async function tenMucTieu(id: string, ten: string): Promise<void> {
	ok(await goi("okr.updateObjective", { id, title: ten }), `doi ten ${ten}`);
}

describe("tao-hoc-tap", () => {
	afterAll(async () => {
		await donSanKhep();
	});
	test("tao-hoc-tap: createObjective kind hoc-tap luu va doc lai duoc, ma sai bi tu choi", async () => {
		await caiChuongTrinh();
		const ky = await gieoKyQuy({ tu: "2027-01-01", den: "2027-03-31" });
		const tao = await goi("okr.createObjective", {
			cycleId: ky,
			unit: { level: "onehub" },
			title: ma("hoc tap"),
			kind: "hoc-tap",
			ownerUserId: phien.quan.nguoi,
			participantIds: [],
			whyNow: "",
		});
		ghim(
			tao.status === 200,
			`tao hoc-tap bi tu choi: ${tao.status} ${tao.loi}`,
		);
		const id = (tao.data as { id: string }).id;
		const dong = await db.okrObjective.findUniqueOrThrow({
			where: { id },
			select: { kind: true },
		});
		const mt = await doc<{ kind: string }>("okr.objective", "quan", { id });
		const ds = await doc<{
			facetCounts: { loai: { value: string; count: number }[] };
		}>("okr.danhSach", "quan", {
			cycleId: ky,
			unit: { loai: "goc" },
			loc: { phuTrach: [], loai: [], trangThai: [], tuTin: [] },
		});
		const truocSai = await db.okrObjective.count({ where: { cycleId: ky } });
		const sai = await goi("okr.createObjective", {
			cycleId: ky,
			unit: { level: "onehub" },
			title: ma("hoc tap sai"),
			kind: "hoc tap",
			ownerUserId: id,
			participantIds: [],
			whyNow: "",
		});
		expect({
			db: dong.kind,
			api: mt.kind,
			dem: ds.facetCounts.loai.find((d) => d.value === "hoc-tap")?.count,
			sai: sai.status,
			soSauSai: await db.okrObjective.count({ where: { cycleId: ky } }),
		}).toEqual({
			db: "hoc-tap",
			api: "hoc-tap",
			dem: 1,
			sai: 400,
			soSauSai: truocSai,
		});
	});
});

describe("bang-cham", () => {
	afterAll(async () => {
		await donSanKhep();
	});
	test("bang-cham: hoc-tap doc chua-tra-loi khi chua cham, khoang trang van chua, co chu thi da-tra-loi; cam-ket chua cham khong co cach doc", async () => {
		await caiChuongTrinh();
		const ky = await gieoKyQuy({ tu: "2023-01-01", den: "2023-03-31" });
		const h = await gieoMucTieuCongBo(ky, [{}], { kind: "hoc-tap" });
		const c = await gieoMucTieuCongBo(ky, [{}], { kind: "cam-ket" });
		ok(await sangPha(ky, "cham-diem"), "sang cham diem");
		const doc1 = (b: BangCham, id: string) =>
			b.mucTieu.find((m) => m.id === id)?.cachDoc ?? null;
		const truoc = await bang(ky);
		ghim(
			doc1(truoc, h.objectiveId) !== null,
			"hoc-tap chua cham khong co cach doc",
		);
		await ghiHoc(h.objectiveId, "   ");
		const khoangTrang = await bang(ky);
		await ghiHoc(h.objectiveId, "Khách cần bản dùng thử");
		const sau = await bang(ky);
		expect({
			truoc: doc1(truoc, h.objectiveId),
			truocChuaGhi: truoc.hocTapChuaGhi.map((m) => m.id),
			khoangTrang: doc1(khoangTrang, h.objectiveId),
			sau: doc1(sau, h.objectiveId),
			sauChuaGhi: sau.hocTapChuaGhi.map((m) => m.id),
			camKet: doc1(sau, c.objectiveId),
		}).toEqual({
			truoc: "chua-tra-loi",
			truocChuaGhi: [h.objectiveId],
			khoangTrang: "chua-tra-loi",
			sau: "da-tra-loi",
			sauChuaGhi: [],
			camKet: null,
		});
	});
});

describe("khep-chan", () => {
	afterAll(async () => {
		await donSanKhep();
	});
	test("khep-chan: con hoc-tap chua ghi thi 400 giu pha, ghi roi thi dong", async () => {
		await caiChuongTrinh();
		const ky = await gieoKyQuy({ tu: "2022-01-01", den: "2022-03-31" });
		const h = await gieoMucTieuCongBo(ky, [{}], { kind: "hoc-tap" });
		await tenMucTieu(h.objectiveId, "Kiểm gói dùng thử");
		ok(await sangPha(ky, "cham-diem"), "sang cham diem");
		await chamHetBangGoiY(ky);
		const vetTruoc = await db.okrTrail.count({
			where: { cycleId: ky, action: "doi-pha" },
		});
		const tuChoi = await sangPha(ky, "da-dong");
		ghim(tuChoi.status !== 200, "khep duoc khi con hoc-tap chua ghi");
		const chuaGhi = (await bang(ky)).hocTapChuaGhi;
		const phaGiua = (await db.okrCycle.findUniqueOrThrow({ where: { id: ky } }))
			.phase;
		const vetGiua = await db.okrTrail.count({
			where: { cycleId: ky, action: "doi-pha" },
		});
		await ghiHoc(h.objectiveId, "Khách cần bản dùng thử");
		const chuaGhiSau = (await bang(ky)).hocTapChuaGhi;
		const dong = await sangPha(ky, "da-dong");
		expect({
			tuChoi: [tuChoi.status, tuChoi.loi],
			chuaGhi,
			phaGiua,
			vetThem: vetGiua - vetTruoc,
			chuaGhiSau,
			dong: dong.status,
			phaCuoi: (await db.okrCycle.findUniqueOrThrow({ where: { id: ky } }))
				.phase,
		}).toEqual({
			tuChoi: [400, T.conHocTapChuaGhi(1, ["Kiểm gói dùng thử"])],
			chuaGhi: [{ id: h.objectiveId, ten: "Kiểm gói dùng thử" }],
			phaGiua: "cham-diem",
			vetThem: 0,
			chuaGhiSau: [],
			dong: 200,
			phaCuoi: "da-dong",
		});
	});

	test("khep-chan: hai muc tieu hoc-tap, thong diep va danh sach theo position", async () => {
		await caiChuongTrinh();
		const ky = await gieoKyQuy({ tu: "2021-01-01", den: "2021-03-31" });
		const a = await gieoMucTieuCongBo(ky, [{}], { kind: "hoc-tap" });
		const b = await gieoMucTieuCongBo(ky, [{}], { kind: "hoc-tap" });
		await tenMucTieu(a.objectiveId, "Kiểm gói dùng thử");
		await tenMucTieu(b.objectiveId, "Đo giá chấp nhận được");
		await db.okrObjective.update({
			where: { id: a.objectiveId },
			data: { position: 2 },
		});
		await db.okrObjective.update({
			where: { id: b.objectiveId },
			data: { position: 1 },
		});
		ok(await sangPha(ky, "cham-diem"), "sang cham diem");
		await chamHetBangGoiY(ky);
		const tuChoi = await sangPha(ky, "da-dong");
		ghim(tuChoi.loi.includes("Kiểm gói dùng thử"), "thieu ten hoc-tap thu hai");
		expect({
			loi: tuChoi.loi,
			ds: (await bang(ky)).hocTapChuaGhi,
		}).toEqual({
			loi: "Còn 2 mục tiêu học tập chưa ghi điều học được: Đo giá chấp nhận được, Kiểm gói dùng thử.",
			ds: [
				{ id: b.objectiveId, ten: "Đo giá chấp nhận được" },
				{ id: a.objectiveId, ten: "Kiểm gói dùng thử" },
			],
		});
	});
});

describe("khep-bien", () => {
	afterAll(async () => {
		await donSanKhep();
	});
	const NAM: Record<(typeof TRANG_THAI_MUC_TIEU)[number], number> = {
		nhap: 2017,
		"cho-duyet": 2018,
		"cong-bo": 2019,
		"da-bo": 2020,
	};
	const KY_VONG: Record<(typeof TRANG_THAI_MUC_TIEU)[number], number> = {
		nhap: 200,
		"cho-duyet": 200,
		"cong-bo": 400,
		"da-bo": 200,
	};
	const SO_DONG = 4;

	async function mucTieuHocTapTheo(
		ky: string,
		trangThai: (typeof TRANG_THAI_MUC_TIEU)[number],
	): Promise<string> {
		if (trangThai === "cong-bo")
			return (await gieoMucTieuCongBo(ky, [{}], { kind: "hoc-tap" }))
				.objectiveId;
		if (trangThai === "da-bo") {
			const { objectiveId } = await gieoMucTieuCongBo(ky, [{}], {
				kind: "hoc-tap",
			});
			ok(await goi("okr.dropObjective", { id: objectiveId }), "bo");
			return objectiveId;
		}
		if (trangThai === "nhap")
			return ok<{ id: string }>(
				await goi("okr.createObjective", {
					cycleId: ky,
					unit: { level: "onehub" },
					title: ma("hoc tap nhap"),
					kind: "hoc-tap",
					ownerUserId: phien.quan.nguoi,
					participantIds: [],
					whyNow: "",
				}),
				"tao nhap",
			).id;
		const b = await bpMoi("ht-bp");
		const p = await pbMoi("ht-pb", b);
		await truongMoi("division", b, "ht-h");
		const t = await truongMoi("department", p, "ht-t");
		await caiChuongTrinh(true);
		try {
			const { objectiveId } = await gieoMucTieuChoDuyet(ky, p, t);
			return objectiveId;
		} finally {
			await caiChuongTrinh(false);
		}
	}

	async function gieoMucTieuChoDuyet(
		ky: string,
		phongBan: string,
		t: { nguoi: string; cookie: string },
	): Promise<{ objectiveId: string }> {
		const objectiveId = ok<{ id: string }>(
			await goi(
				"okr.createObjective",
				{
					cycleId: ky,
					unit: { level: "phong-ban", departmentId: phongBan },
					title: ma("hoc tap cho duyet"),
					kind: "hoc-tap",
					ownerUserId: t.nguoi,
					participantIds: [],
					whyNow: "",
				},
				t.cookie,
			),
			"tao cho duyet",
		).id;
		ok(
			await goi(
				"okr.createKeyResult",
				{
					objectiveId,
					title: ma("kr cho duyet"),
					kind: "tang-toi",
					ownerUserId: t.nguoi,
					startValue: 0,
					targetValue: 100,
					currentValue: 0,
					unit: "",
					dueOn: null,
					weight: 1,
				},
				t.cookie,
			),
			"tao kr cho duyet",
		);
		ok(await goi("okr.guiDuyet", { id: objectiveId }, t.cookie), "gui duyet");
		return { objectiveId };
	}

	test("khep-bien: bang 4 trang thai, chi cong-bo chan khep", async () => {
		await caiChuongTrinh();
		const da: string[] = [];
		const ket: Record<string, number> = {};
		for (const trangThai of TRANG_THAI_MUC_TIEU) {
			const nam = NAM[trangThai];
			const ky = await gieoKyQuy({ tu: `${nam}-01-01`, den: `${nam}-03-31` });
			const id = await mucTieuHocTapTheo(ky, trangThai);
			await gieoMucTieuCongBo(ky, [{}], { kind: "cam-ket" });
			const thuc = (
				await db.okrObjective.findUniqueOrThrow({
					where: { id },
					select: { status: true },
				})
			).status;
			da.push(thuc);
			ok(await sangPha(ky, "cham-diem"), `sang cham diem ${trangThai}`);
			const r = await sangPha(ky, "da-dong");
			ket[trangThai] = r.status;
			if (trangThai === "da-bo")
				ghim(r.status === 200, "hoc-tap da bo van chan khep");
			if (trangThai === "cho-duyet")
				ghim(r.status === 200, "hoc-tap cho duyet van chan khep");
		}
		expect({
			soDong: da.length,
			tap: new Set(da),
			ket,
		}).toEqual({
			soDong: SO_DONG,
			tap: new Set(TRANG_THAI_MUC_TIEU),
			ket: KY_VONG,
		});
	});
});
