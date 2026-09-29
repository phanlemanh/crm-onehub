import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { parseOkrVet } from "@crm/validation/okr-vet";
import type { MucMoCoi } from "../src/okr/okr.contracts";
import { donViCua, OkrAccessService } from "../src/okr/okr-access.service";
import { OKR } from "../src/okr/okr-config";
import type { TreeOutput } from "../src/to-chuc/to-chuc.contracts";
import { TO_CHUC } from "../src/to-chuc/to-chuc-config";
import { donSanCanhKr, roiKhoi, vaoLai } from "./okr-canh-kr-san";
import { KY_HIEN_THI } from "./okr-hien-thi-san";
import {
	donSanKhep,
	gieoKyQuy,
	gieoMucTieuCongBo,
	guiSo,
	sangPha,
} from "./okr-khep-san";
import {
	bpMoi,
	CHUONG_TRINH_RONG,
	datViTri,
	dungSan,
	goi,
	goiQuery,
	type Json,
	ma,
	nguoiMoi,
	ok,
	pbMoi,
	phien,
	phienCua,
	type TraLoi,
	truongMoi,
	ungDung,
} from "./okr-san";

dungSan();

const CHO_GIEO_MS = 300_000;
const CHO_MS = 120_000;
const T = OKR.thongDiep;
const TC = TO_CHUC.thongDiep;
const THU_MUC_TO_CHUC = join(import.meta.dir, "..", "src", "to-chuc");

type Truong = { nguoi: string; cookie: string };

const tra = (r: TraLoi) => (r.status === 200 ? "200" : `${r.status} ${r.loi}`);
const pbDv = (id: string) => ({ level: "phong-ban", departmentId: id });
const bpDv = (id: string) => ({ level: "bo-phan", divisionId: id });

async function donSan() {
	setSystemTime();
	ok(await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }), "tra cau hinh");
	await donSanKhep();
	await donSanCanhKr();
}

async function mucTieu(
	ky: string,
	unit: Json,
	ai: Truong,
	krs: { ownerUserId?: string }[] = [{}],
) {
	return (
		await gieoMucTieuCongBo(ky, krs, {
			unit,
			ownerUserId: ai.nguoi,
			ai: ai.cookie,
		})
	).objectiveId;
}

async function truongRa(t: Truong, pbLe: string) {
	ok(await datViTri(t.nguoi, pbLe), `dua ${t.nguoi} ra khoi phong ban`);
}

async function cayToChuc(): Promise<TreeOutput> {
	return ok<TreeOutput>(await goiQuery("org.tree"), "org.tree");
}

function moiPhongBan(c: TreeOutput) {
	return [...c.divisions.flatMap((b) => b.departments), ...c.chuaXep];
}

async function donViCuaMucTieu(ids: string[]) {
	const hang = await db.okrObjective.findMany({
		where: { id: { in: ids } },
		select: { id: true, departmentId: true, divisionId: true },
	});
	return Object.fromEntries(
		ids.map((id) => {
			const h = hang.find((x) => x.id === id);
			return [id, h ? (h.departmentId ?? h.divisionId) : null];
		}),
	);
}

async function suaDuoc(userId: string, objectiveId: string) {
	const svc = ungDung().get(OkrAccessService);
	const q = await svc.quyen(userId);
	const row = await db.okrObjective.findUniqueOrThrow({
		where: { id: objectiveId },
		select: {
			level: true,
			divisionId: true,
			departmentId: true,
			personUserId: true,
		},
	});
	return svc.suaDuocDonVi(q, userId, donViCua(row));
}

function nhapTuOkr(chu: string): string[] {
	return [...chu.matchAll(/from\s+["']([^"']+)["']/g)]
		.map((m) => m[1] ?? "")
		.filter((duong) => /(^|\/)okr(\/|$)/.test(duong));
}

function tepToChuc(thuMuc: string): string[] {
	return readdirSync(thuMuc, { withFileTypes: true }).flatMap((d) =>
		d.isDirectory()
			? tepToChuc(join(thuMuc, d.name))
			: d.name.endsWith(".ts")
				? [join(thuMuc, d.name)]
				: [],
	);
}

describe("luu-tru-chan", () => {
	const s = {
		kyChay: "",
		kyCham: "",
		kyDong: "",
		pbLe: "",
		P: "",
		R: "",
		S: "",
		B: "",
		B2: "",
		tP: { nguoi: "", cookie: "" },
		tR: { nguoi: "", cookie: "" },
		tS: { nguoi: "", cookie: "" },
	};

	beforeAll(async () => {
		ok(await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }), "cau hinh");
		s.kyChay = await gieoKyQuy(KY_HIEN_THI);
		s.kyCham = await gieoKyQuy(KY_HIEN_THI);
		s.kyDong = await gieoKyQuy(KY_HIEN_THI);
		s.pbLe = await pbMoi("lc-le");
		s.P = await pbMoi("lc-P");
		s.R = await pbMoi("lc-R");
		s.S = await pbMoi("lc-S");
		s.B = await bpMoi("lc-B");
		s.B2 = await bpMoi("lc-B2");
		s.tP = await truongMoi("department", s.P, "lc-tP");
		s.tR = await truongMoi("department", s.R, "lc-tR");
		s.tS = await truongMoi("department", s.S, "lc-tS");
		const tB = await truongMoi("division", s.B, "lc-tB");
		const tB2 = await truongMoi("division", s.B2, "lc-tB2");

		await mucTieu(s.kyChay, pbDv(s.P), s.tP);
		const sBo = await mucTieu(s.kyChay, pbDv(s.S), s.tS);
		ok(await goi("okr.dropObjective", { id: sBo }, s.tS.cookie), "bo muc S");
		await mucTieu(s.kyCham, bpDv(s.B), tB);
		await mucTieu(s.kyDong, pbDv(s.R), s.tR);
		await mucTieu(s.kyDong, pbDv(s.S), s.tS);
		await mucTieu(s.kyDong, bpDv(s.B2), tB2);
		ok(await sangPha(s.kyCham, "cham-diem"), "ky cham diem");
		ok(await sangPha(s.kyDong, "cham-diem"), "ky dong cham diem");
		ok(await sangPha(s.kyDong, "da-dong"), "ky da dong");
		for (const t of [s.tP, s.tR, s.tS]) await truongRa(t, s.pbLe);
		ok(await goi("org.archiveDepartment", { id: s.R }), "luu tru R");
		ok(await goi("org.archiveDivision", { id: s.B2 }), "luu tru B2");
	}, CHO_GIEO_MS);
	afterAll(donSan, CHO_MS);

	test(
		"luu-tru-chan: P và B còn OKR mở không lưu trữ được; R, B2 có lịch sử OKR không xoá hẳn được (400, không 500); org.tree trả okrMo và purgeable; S chỉ còn mục tiêu bỏ và đã đóng thì lưu trữ được",
		async () => {
			const moiTraLoi: string[] = [];
			const g = async (thuTuc: string, vao: Json) => {
				const r = await goi(thuTuc, vao);
				moiTraLoi.push(`${thuTuc} ${r.status}`);
				return r;
			};
			const luuP = await g("org.archiveDepartment", { id: s.P });
			const luuB = await g("org.archiveDivision", { id: s.B });
			const xoaR = await g("org.purgeDepartment", { id: s.R });
			const xoaB2 = await g("org.purgeDivision", { id: s.B2 });
			const donVi = await db.department.findUniqueOrThrow({
				where: { id: s.P },
				select: { archivedAt: true },
			});
			const boPhan = await db.division.findUniqueOrThrow({
				where: { id: s.B },
				select: { archivedAt: true },
			});
			const cayTruoc = await cayToChuc();
			const pb = (id: string) => moiPhongBan(cayTruoc).find((d) => d.id === id);
			const luuS = await g("org.archiveDepartment", { id: s.S });
			const cauP = luuP.loi;
			expect({
				luuP: tra(luuP),
				luuB: tra(luuB),
				pChua1MucTieu: cauP.includes("1 mục tiêu"),
				pChuaLoiRa: cauP.includes("chuyển OKR"),
				bChuaLoiRa:
					luuB.loi.includes("1 mục tiêu") && luuB.loi.includes("chuyển OKR"),
				pVanSong: donVi.archivedAt,
				bVanSong: boPhan.archivedAt,
				xoaR: tra(xoaR),
				xoaB2: tra(xoaB2),
				okrMo: {
					P: pb(s.P)?.okrMo,
					S: pb(s.S)?.okrMo,
					B: cayTruoc.divisions.find((b) => b.id === s.B)?.okrMo,
				},
				purgeable: {
					R: cayTruoc.archived.departments.find((d) => d.id === s.R)?.purgeable,
					B2: cayTruoc.archived.divisions.find((d) => d.id === s.B2)?.purgeable,
				},
				luuS: tra(luuS),
			}).toEqual({
				luuP: `400 ${TC.phongBanConOkrMo(1)}`,
				luuB: `400 ${TC.boPhanConOkrMo(1)}`,
				pChua1MucTieu: true,
				pChuaLoiRa: true,
				bChuaLoiRa: true,
				pVanSong: null,
				bVanSong: null,
				xoaR: `400 ${TC.phongBanConOkrXoa(1)}`,
				xoaB2: `400 ${TC.boPhanConOkrXoa(1)}`,
				okrMo: { P: 1, S: 0, B: 1 },
				purgeable: { R: false, B2: false },
				luuS: "200",
			});
			const cauSau = await cayToChuc();
			expect({
				sLuuTru: cauSau.archived.departments.some((d) => d.id === s.S),
				sPurgeable: cauSau.archived.departments.find((d) => d.id === s.S)
					?.purgeable,
			}).toEqual({ sLuuTru: true, sPurgeable: false });
			expect(moiTraLoi.filter((d) => d.endsWith(" 500"))).toEqual([]);

			const tep = tepToChuc(THU_MUC_TO_CHUC);
			const nhap = tep.flatMap((d) =>
				nhapTuOkr(readFileSync(d, "utf8")).map((n) => `${d} «${n}»`),
			);
			console.log(
				`luu-tru-chan: soi ${tep.length} tep apps/api/src/to-chuc, nhap tu okr: ${nhap.length}`,
			);
			expect(tep.length).toBeGreaterThan(0);
			expect(nhap).toEqual([]);
		},
		CHO_MS,
	);
});

describe("chuyen-don-vi", () => {
	const s = {
		ky: "",
		kyDong: "",
		pbLe: "",
		P: "",
		Q: "",
		QL: "",
		BX: "",
		BY: "",
		tP: { nguoi: "", cookie: "" },
		tQ: { nguoi: "", cookie: "" },
		G: [] as string[],
		GB: "",
		GBo: "",
		GD: "",
	};

	beforeAll(async () => {
		ok(await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }), "cau hinh");
		s.ky = await gieoKyQuy(KY_HIEN_THI);
		s.kyDong = await gieoKyQuy(KY_HIEN_THI);
		s.pbLe = await pbMoi("cd-le");
		s.P = await pbMoi("cd-P");
		s.Q = await pbMoi("cd-Q");
		s.QL = await pbMoi("cd-QL");
		s.BX = await bpMoi("cd-BX");
		s.tP = await truongMoi("department", s.P, "cd-tP");
		s.tQ = await truongMoi("department", s.Q, "cd-tQ");
		s.BY = await bpMoi("cd-BY");
		const tBX = await truongMoi("division", s.BX, "cd-tBX");
		ok(await goi("org.archiveDepartment", { id: s.QL }), "luu tru QL");
		const x = await nguoiMoi("cd-X");

		const g1 = await gieoMucTieuCongBo(s.ky, [{}, {}], {
			unit: pbDv(s.P),
			ownerUserId: s.tP.nguoi,
			ai: s.tP.cookie,
		});
		s.G = [g1.objectiveId];
		for (let i = 2; i <= 4; i += 1)
			s.G.push(await mucTieu(s.ky, pbDv(s.P), s.tP));
		const [kr1, kr2] = g1.krIds;
		if (!kr1 || !kr2) throw new Error("G1 thieu KR");
		await guiSo(
			[
				{ keyResultId: kr1, value: 10 },
				{ keyResultId: kr2, value: 20 },
			],
			s.tP.cookie,
		);
		await guiSo([{ keyResultId: kr1, value: 30 }], s.tP.cookie);
		const dich = await mucTieu(
			s.ky,
			{ level: "onehub" },
			{
				nguoi: phien.quan.nguoi,
				cookie: phien.quan.cookie,
			},
		);
		ok(
			await goi(
				"okr.addAlignment",
				{
					objectiveId: g1.objectiveId,
					targetObjectiveId: dich,
					targetKeyResultId: null,
				},
				s.tP.cookie,
			),
			"can chinh G1",
		);
		ok(
			await goi(
				"okr.datHienThi",
				{ objectiveId: g1.objectiveId, hienThi: "cong-khai", nguoiXem: [x] },
				s.tP.cookie,
			),
			"nguoi xem G1",
		);
		ok(
			await goi(
				"okr.themViec",
				{
					keyResultId: kr1,
					tieuDe: "Việc trước khi chuyển",
					nguoiLamUserId: s.tP.nguoi,
					hanNgay: null,
				},
				s.tP.cookie,
			),
			"viec G1",
		);
		s.GB = await mucTieu(s.ky, bpDv(s.BX), tBX);
		s.GBo = await mucTieu(s.ky, pbDv(s.P), s.tP);
		ok(await goi("okr.dropObjective", { id: s.GBo }, s.tP.cookie), "bo GBo");
		s.GD = await mucTieu(s.kyDong, pbDv(s.P), s.tP);
		ok(await sangPha(s.kyDong, "cham-diem"), "ky dong cham diem");
		ok(await sangPha(s.kyDong, "da-dong"), "ky da dong");
	}, CHO_GIEO_MS);
	afterAll(donSan, CHO_MS);

	async function anhCon(id: string) {
		const kr = { keyResult: { objectiveId: id } };
		const [krs, checkIn, canChinh, nguoiXem, viec, vet] = await Promise.all([
			db.okrKeyResult.count({ where: { objectiveId: id } }),
			db.okrCheckIn.count({ where: kr }),
			db.okrAlignment.count({ where: { objectiveId: id } }),
			db.okrNguoiXem.count({ where: { objectiveId: id } }),
			db.okrViecKr.count({ where: kr }),
			db.okrTrail.count({ where: { objectiveId: id } }),
		]);
		return { krs, checkIn, canChinh, nguoiXem, viec, vet };
	}

	test(
		"chuyen-don-vi: lô hỏng viết trước không đổi mục tiêu nào; chuyển ba mục tiêu giữ nguyên KR, cập nhật tuần, căn chỉnh, người xem, việc, vết cũ; một vết chuyen-don-vi mỗi mục tiêu; vượt trần vẫn chuyển kèm cảnh báo; chuyển hết thì lưu trữ P được",
		async () => {
			const [g1, g2, g3, g4] = s.G;
			if (!g1 || !g2 || !g3 || !g4) throw new Error("thieu muc tieu");
			const tatCa = [...s.G, s.GD, s.GBo];
			const donViDau = await donViCuaMucTieu(tatCa);
			const khongCo = `khong-co-${ma("g")}`;
			const tieuDe = async (id: string) =>
				(
					await db.okrObjective.findUniqueOrThrow({
						where: { id },
						select: { title: true },
					})
				).title;
			const tieuDeGB = await tieuDe(s.GB);
			const tieuDeGD = await tieuDe(s.GD);
			const tieuDeGBo = await tieuDe(s.GBo);
			const khongCoDv = `khong-co-${ma("dv")}`;
			const LO_HONG = [
				{
					ten: "ma khong ton tai trong lo",
					vao: { objectiveIds: [g1, khongCo], den: pbDv(s.Q) },
					ai: phien.quan.cookie,
					mong: `400 ${T.khongCoMucTieu(khongCo)}`,
				},
				{
					ten: "muc tieu bo phan sang phong ban",
					vao: { objectiveIds: [g1, s.GB], den: pbDv(s.Q) },
					ai: phien.quan.cookie,
					mong: `400 ${T.taiCoCau.khacCap(tieuDeGB)}`,
				},
				{
					ten: "don vi nhan da luu tru",
					vao: { objectiveIds: [g1, g2], den: pbDv(s.QL) },
					ai: phien.quan.cookie,
					mong: `400 ${T.taiCoCau.donViNhanLuuTru}`,
				},
				{
					ten: "chu ky da dong",
					vao: { objectiveIds: [g1, s.GD], den: pbDv(s.Q) },
					ai: phien.quan.cookie,
					mong: `400 ${T.taiCoCau.kyDaDong(tieuDeGD)}`,
				},
				{
					ten: "lo co muc tieu da bo",
					vao: { objectiveIds: [g1, s.GBo], den: pbDv(s.Q) },
					ai: phien.quan.cookie,
					mong: `400 ${T.taiCoCau.daBo(tieuDeGBo)}`,
				},
				{
					ten: "don vi nhan khong ton tai",
					vao: { objectiveIds: [g1], den: pbDv(khongCoDv) },
					ai: phien.quan.cookie,
					mong: `400 ${T.khongCoDonVi(khongCoDv)}`,
				},
				{
					ten: "nguoi goi la truong P",
					vao: { objectiveIds: [g1], den: pbDv(s.Q) },
					ai: s.tP.cookie,
					mong: `403 ${T.taiCoCau.canQuanTri}`,
				},
			] as const;
			const ketLo = [];
			for (const ca of LO_HONG) {
				const r = await goi(
					"okr.chuyenDonVi",
					{
						objectiveIds: [...ca.vao.objectiveIds],
						denDonVi: { level: "phong-ban", id: ca.vao.den.departmentId },
					},
					ca.ai,
				);
				ketLo.push({
					ca: ca.ten,
					tra: tra(r),
					donVi: await donViCuaMucTieu(tatCa),
				});
			}
			expect(ketLo).toEqual(
				LO_HONG.map((ca) => ({
					ca: ca.ten,
					tra: ca.mong,
					donVi: donViDau,
				})),
			);

			const truoc = await Promise.all([g1, g2, g3].map(anhCon));
			ok(
				await goi("okr.setProgram", { objectiveCap: 1, capMode: "chan" }),
				"tran 1 che do chan",
			);
			const chuyen = ok<{ daChuyen: number; canhBao: string | null }>(
				await goi("okr.chuyenDonVi", {
					objectiveIds: [g1, g2, g3],
					denDonVi: { level: "phong-ban", id: s.Q },
				}),
				"chuyen ba muc tieu",
			);
			const sau = await Promise.all([g1, g2, g3].map(anhCon));
			const vetChuyen = await db.okrTrail.findMany({
				where: { objectiveId: { in: [g1, g2, g3] }, action: "chuyen-don-vi" },
				orderBy: [{ objectiveId: "asc" }],
				select: { objectiveId: true, before: true, after: true },
			});
			expect({
				chuyen,
				donVi: await donViCuaMucTieu([g1, g2, g3, g4]),
				con: sau,
				vet: vetChuyen.map((v) => ({
					objectiveId: v.objectiveId,
					before: parseOkrVet(v.before),
					after: parseOkrVet(v.after),
				})),
				suaDuoc: {
					tQ: await suaDuoc(s.tQ.nguoi, g1),
					tP: await suaDuoc(s.tP.nguoi, g1),
				},
			}).toEqual({
				chuyen: { daChuyen: 3, canhBao: T.taiCoCau.vuotTran(3, 1) },
				donVi: { [g1]: s.Q, [g2]: s.Q, [g3]: s.Q, [g4]: s.P },
				con: truoc.map((a) => ({ ...a, vet: a.vet + 1 })),
				vet: [g1, g2, g3].sort().map((id) => ({
					objectiveId: id,
					before: { departmentId: s.P },
					after: { departmentId: s.Q },
				})),
				suaDuoc: { tQ: true, tP: false },
			});
			expect(truoc[0]).toEqual({
				krs: 2,
				checkIn: 3,
				canChinh: 1,
				nguoiXem: 1,
				viec: 1,
				vet: truoc[0]?.vet ?? 0,
			});

			ok(
				await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }),
				"tra tran chuong trinh",
			);
			const conChan = await goi("org.archiveDepartment", { id: s.P });
			const cuoi = ok<{ daChuyen: number; canhBao: string | null }>(
				await goi("okr.chuyenDonVi", {
					objectiveIds: [g4],
					denDonVi: { level: "phong-ban", id: s.Q },
				}),
				"chuyen G4",
			);
			await truongRa(s.tP, s.pbLe);
			const luuP = await goi("org.archiveDepartment", { id: s.P });
			expect({
				conChan: tra(conChan),
				cuoi,
				luuP: tra(luuP),
			}).toEqual({
				conChan: `400 ${TC.phongBanConNguoi(1)}`,
				cuoi: { daChuyen: 1, canhBao: null },
				luuP: "200",
			});
		},
		CHO_GIEO_MS,
	);

	test(
		"chuyen-don-vi trùng tiêu đề: đơn vị nhận đã có mục tiêu cùng tiêu đề trong cùng chu kỳ — vẫn chuyển, không đổi tiêu đề",
		async () => {
			const tieuDe = ma("Tăng doanh thu kênh đại lý");
			const taoCung = async (dv: string, ai: Truong) =>
				ok<{ id: string }>(
					await goi(
						"okr.createObjective",
						{
							cycleId: s.ky,
							unit: pbDv(dv),
							title: tieuDe,
							kind: "cam-ket",
							ownerUserId: ai.nguoi,
							participantIds: [],
							whyNow: "",
						},
						ai.cookie,
					),
					`tao cung tieu de ${dv}`,
				).id;
			const P2 = await pbMoi("cd-P2");
			const tP2 = await truongMoi("department", P2, "cd-tP2");
			const coSan = await taoCung(s.Q, s.tQ);
			const moi = await taoCung(P2, tP2);
			const chuyen = await goi("okr.chuyenDonVi", {
				objectiveIds: [moi],
				denDonVi: { level: "phong-ban", id: s.Q },
			});
			const hang = await db.okrObjective.findMany({
				where: { id: { in: [coSan, moi] } },
				orderBy: { id: "asc" },
				select: { id: true, title: true, departmentId: true },
			});
			expect({ chuyen: tra(chuyen), hang }).toEqual({
				chuyen: "200",
				hang: [coSan, moi].sort().map((id) => ({
					id,
					title: tieuDe,
					departmentId: s.Q,
				})),
			});
		},
		CHO_MS,
	);
	test(
		"chuyen-don-vi bộ phận sang bộ phận: đổi divisionId, một vết chuyen-don-vi, trưởng bộ phận nhận sửa được",
		async () => {
			const tBY = await truongMoi("division", s.BY, "cd-tBY");
			const chuyen = ok<{ daChuyen: number; canhBao: string | null }>(
				await goi("okr.chuyenDonVi", {
					objectiveIds: [s.GB],
					denDonVi: { level: "bo-phan", id: s.BY },
				}),
				"chuyen GB sang BY",
			);
			const vet = await db.okrTrail.findMany({
				where: { objectiveId: s.GB, action: "chuyen-don-vi" },
				select: { before: true, after: true },
			});
			expect({
				chuyen,
				donVi: await donViCuaMucTieu([s.GB]),
				vet: vet.map((v) => [parseOkrVet(v.before), parseOkrVet(v.after)]),
				suaDuoc: await suaDuoc(tBY.nguoi, s.GB),
			}).toEqual({
				chuyen: { daChuyen: 1, canhBao: null },
				donVi: { [s.GB]: s.BY },
				vet: [[{ divisionId: s.BX }, { divisionId: s.BY }]],
				suaDuoc: true,
			});
		},
		CHO_MS,
	);
});

describe("mo-coi", () => {
	const s = {
		ky: "",
		B1: "",
		B2: "",
		B3: "",
		P2: "",
		P3: "",
		P4: "",
		P5: "",
		hP2: { nguoi: "", cookie: "" },
		hB1: { nguoi: "", cookie: "" },
		hB2: { nguoi: "", cookie: "" },
		hB3: { nguoi: "", cookie: "" },
		h5: { nguoi: "", cookie: "" },
		k5: "",
		u6: "",
		p7: "",
		B4: "",
		hB4: { nguoi: "", cookie: "" },
		O2: "",
		O3: "",
		O5: "",
		O6: "",
		O7: "",
		O8: "",
		O9: "",
	};

	beforeAll(async () => {
		ok(await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }), "cau hinh");
		s.ky = await gieoKyQuy(KY_HIEN_THI);
		s.B1 = await bpMoi("mc-B1");
		s.B2 = await bpMoi("mc-B2");
		s.B3 = await bpMoi("mc-B3");
		s.P2 = await pbMoi("mc-P2", s.B1);
		s.P3 = await pbMoi("mc-P3");
		s.P4 = await pbMoi("mc-P4", s.B3);
		s.P5 = await pbMoi("mc-P5");
		s.hB1 = await truongMoi("division", s.B1, "mc-hB1");
		s.hB2 = await truongMoi("division", s.B2, "mc-hB2");
		s.hB3 = await truongMoi("division", s.B3, "mc-hB3");
		s.hP2 = await truongMoi("department", s.P2, "mc-hP2");
		const h3 = await truongMoi("department", s.P3, "mc-h3");
		await truongMoi("department", s.P4, "mc-h4");
		s.h5 = await truongMoi("department", s.P5, "mc-h5");
		s.k5 = await nguoiMoi("mc-K5");
		s.O2 = await mucTieu(s.ky, pbDv(s.P2), s.hP2);
		s.O3 = await mucTieu(s.ky, pbDv(s.P3), h3);
		s.O5 = await mucTieu(s.ky, pbDv(s.P5), s.h5, [{}, { ownerUserId: s.k5 }]);
		s.u6 = await nguoiMoi("mc-U6");
		s.p7 = await nguoiMoi("mc-P7");
		ok(await datViTri(s.p7, s.P5), "xep P7 vao P5");
		s.B4 = await bpMoi("mc-B4");
		s.hB4 = await truongMoi("division", s.B4, "mc-hB4");
		s.O6 = (
			await gieoMucTieuCongBo(s.ky, [{ ownerUserId: s.h5.nguoi }], {
				unit: pbDv(s.P5),
				ownerUserId: s.u6,
				ai: s.h5.cookie,
			})
		).objectiveId;
		s.O7 = (
			await gieoMucTieuCongBo(s.ky, [{ ownerUserId: s.h5.nguoi }], {
				unit: { level: "ca-nhan", personUserId: s.p7 },
				ownerUserId: s.h5.nguoi,
				ai: s.h5.cookie,
			})
		).objectiveId;
		s.O8 = await mucTieu(s.ky, bpDv(s.B4), s.hB4);
		s.O9 = await mucTieu(s.ky, pbDv(s.P5), s.h5);
	}, CHO_GIEO_MS);
	afterAll(donSan, CHO_MS);

	const moCoi = async (ai = phien.quan.cookie) =>
		goiQuery("okr.moCoi", ai, { cycleId: s.ky });
	const gon = (ds: MucMoCoi[]): { objectiveId: string; lyDo: string[] }[] =>
		ds
			.map((m) => ({ objectiveId: m.objectiveId, lyDo: [...m.lyDo] }))
			.sort((a, b) => a.objectiveId.localeCompare(b.objectiveId));
	const docMoCoi = async () => gon(ok<MucMoCoi[]>(await moCoi(), "okr.moCoi"));
	const mong = (ds: { objectiveId: string; lyDo: string[] }[]) =>
		[...ds].sort((a, b) => a.objectiveId.localeCompare(b.objectiveId));

	test(
		"mo-coi: ba lớp viết trước (không ai sửa, người phụ trách KR rời, đơn vị lưu trữ ghi thẳng) rồi ba bước sửa về rỗng; dời phòng ban không sinh mồ côi và quyền sửa theo trưởng bộ phận mới; thành viên bị từ chối",
		async () => {
			const dau = await docMoCoi();

			ok(
				await goi("org.setHead", {
					kind: "department",
					id: s.P2,
					userId: null,
				}),
				"bo truong P2",
			);
			ok(
				await goi("org.setHead", { kind: "division", id: s.B1, userId: null }),
				"bo truong B1",
			);
			const buoc1 = await docMoCoi();

			await roiKhoi(s.k5);
			const buoc2 = await docMoCoi();

			await db.department.update({
				where: { id: s.P3 },
				data: { archivedAt: new Date() },
			});
			const buoc3Tho = ok<MucMoCoi[]>(await moCoi(), "okr.moCoi buoc 3");
			const buoc3 = gon(buoc3Tho);

			expect({ dau, buoc1, buoc2, buoc3 }).toEqual({
				dau: [],
				buoc1: [{ objectiveId: s.O2, lyDo: ["khong-ai-sua"] }],
				buoc2: mong([
					{ objectiveId: s.O2, lyDo: ["khong-ai-sua"] },
					{ objectiveId: s.O5, lyDo: ["kr-phu-trach-roi"] },
				]),
				buoc3: mong([
					{ objectiveId: s.O2, lyDo: ["khong-ai-sua"] },
					{ objectiveId: s.O5, lyDo: ["kr-phu-trach-roi"] },
					{ objectiveId: s.O3, lyDo: ["don-vi-luu-tru"] },
				]),
			});
			expect(
				buoc3Tho
					.map((m) => ({ id: m.objectiveId, donVi: m.donVi.id }))
					.sort((a, b) => a.id.localeCompare(b.id)),
			).toEqual(
				[
					{ id: s.O2, donVi: s.P2 },
					{ id: s.O3, donVi: s.P3 },
					{ id: s.O5, donVi: s.P5 },
				].sort((a, b) => a.id.localeCompare(b.id)),
			);

			ok(
				await goi("org.setHead", {
					kind: "department",
					id: s.P2,
					userId: s.hP2.nguoi,
				}),
				"dat lai truong P2",
			);
			const sua1 = await docMoCoi();
			ok(
				await goi("okr.transferWork", {
					fromUserId: s.k5,
					toUserId: s.h5.nguoi,
				}),
				"chuyen viec nguoi roi",
			);
			const sua2 = await docMoCoi();
			ok(
				await goi("okr.chuyenDonVi", {
					objectiveIds: [s.O3],
					denDonVi: { level: "phong-ban", id: s.P4 },
				}),
				"chuyen O3 sang P4",
			);
			const sua3 = await docMoCoi();
			const truocDoi = {
				hB2: await suaDuoc(s.hB2.nguoi, s.O3),
				hB3: await suaDuoc(s.hB3.nguoi, s.O3),
			};
			ok(
				await goi("org.moveDepartment", {
					id: s.P4,
					divisionId: s.B2,
					index: 0,
				}),
				"doi P4 sang B2",
			);
			const sauDoi = await docMoCoi();
			const thanhVien = await moCoi(phien.thuong.cookie);
			const chiOkr = await moCoi(phien.okr.cookie);
			expect({
				sua1,
				sua2,
				sua3,
				truocDoi,
				sauDoi,
				quyenSau: {
					hB2: await suaDuoc(s.hB2.nguoi, s.O3),
					hB3: await suaDuoc(s.hB3.nguoi, s.O3),
				},
				thanhVien: tra(thanhVien),
				chiOkr: tra(chiOkr),
			}).toEqual({
				sua1: mong([
					{ objectiveId: s.O5, lyDo: ["kr-phu-trach-roi"] },
					{ objectiveId: s.O3, lyDo: ["don-vi-luu-tru"] },
				]),
				sua2: [{ objectiveId: s.O3, lyDo: ["don-vi-luu-tru"] }],
				sua3: [],
				truocDoi: { hB2: false, hB3: true },
				sauDoi: [],
				quyenSau: { hB2: true, hB3: false },
				thanhVien: `403 ${T.taiCoCau.canQuanTri}`,
				chiOkr: `403 ${T.taiCoCau.canQuanTri}`,
			});
			const truongBoPhan = await phienCua(s.hB1.nguoi);
			expect(tra(await moCoi(truongBoPhan))).toBe(
				`403 ${T.taiCoCau.canQuanTri}`,
			);
		},
		CHO_GIEO_MS,
	);
	test(
		"mo-coi bốn ca thêm: người phụ trách mục tiêu rời, người của mục tiêu cá nhân rời, bộ phận không trưởng, mục tiêu phòng ban mất cột đơn vị — rồi sửa về rỗng",
		async () => {
			const dau = await docMoCoi();
			await roiKhoi(s.u6);
			await roiKhoi(s.p7);
			ok(
				await goi("org.setHead", { kind: "division", id: s.B4, userId: null }),
				"bo truong B4",
			);
			await db.okrObjective.update({
				where: { id: s.O9 },
				data: { departmentId: null },
			});
			const hongTho = ok<MucMoCoi[]>(await moCoi(), "okr.moCoi bon ca");
			const hong = gon(hongTho);
			const o9 = hongTho.find((m) => m.objectiveId === s.O9)?.donVi;
			ok(
				await goi("okr.transferWork", {
					fromUserId: s.u6,
					toUserId: s.h5.nguoi,
				}),
				"chuyen viec U6",
			);
			await vaoLai(s.p7);
			ok(
				await goi("org.setHead", {
					kind: "division",
					id: s.B4,
					userId: s.hB4.nguoi,
				}),
				"dat lai truong B4",
			);
			ok(
				await goi("okr.chuyenDonVi", {
					objectiveIds: [s.O9],
					denDonVi: { level: "phong-ban", id: s.P4 },
				}),
				"chuyen O9 sang P4",
			);
			expect({ dau, hong, o9, sau: await docMoCoi() }).toEqual({
				dau: [],
				hong: mong([
					{ objectiveId: s.O6, lyDo: ["phu-trach-roi"] },
					{ objectiveId: s.O7, lyDo: ["khong-ai-sua"] },
					{ objectiveId: s.O8, lyDo: ["khong-ai-sua"] },
					{ objectiveId: s.O9, lyDo: ["khong-ai-sua"] },
				]),
				o9: {
					level: "phong-ban",
					id: null,
					ten: T.taiCoCau.khongDonVi,
				},
				sau: [],
			});
		},
		CHO_GIEO_MS,
	);
});
