import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { type NguoiDuyet, nguoiDuyetMucTieu } from "@crm/db/okr-duyet";
import { docCayOkr } from "@crm/db/okr-hien-thi";
import { LOI_KHUON_HIEN_THI } from "@crm/validation/okr-hien-thi";
import type { CapMucTieu } from "@crm/validation/okr-muc-tieu";
import { type OkrVetSnapshot, parseOkrVet } from "@crm/validation/okr-vet";
import type {
	ObjectiveOutput,
	ViecCuaToiOutput,
} from "../src/okr/okr.contracts";
import { OkrAccessService } from "../src/okr/okr-access.service";
import type { CanhKrOutput } from "../src/okr/okr-canh-kr.contracts";
import { OKR } from "../src/okr/okr-config";
import type { ToanCanhOutput } from "../src/okr/okr-xem.contracts";
import { chienDichMoi, donSanCanhKr } from "./okr-canh-kr-san";
import {
	datDuyetCongBo,
	gieoDuyet,
	mucTieuCoHaiKr,
	type NguoiSan,
	type SanDuyet,
} from "./okr-hien-thi-san";
import { donSanKhep } from "./okr-khep-san";
import {
	doc,
	dungSan,
	goi,
	type Json,
	ma,
	ok,
	phien,
	type TraLoi,
	ungDung,
} from "./okr-san";

dungSan();

const CHO_GIEO_MS = 180_000;
const CHO_MS = 120_000;
const T = OKR.thongDiep;
const LY_DO = "Chưa có KR đo khách hàng mới";
const GIO_MS = 60 * 60 * 1000;

const pb = (id: string) => ({ level: "phong-ban", departmentId: id });

async function trangThai(id: string) {
	return (
		await db.okrObjective.findUniqueOrThrow({
			where: { id },
			select: { status: true },
		})
	).status;
}

async function vetCua(id: string) {
	return db.okrTrail.findMany({
		where: { objectiveId: id },
		orderBy: [{ at: "asc" }, { id: "asc" }],
	});
}

const tra = (r: TraLoi) => (r.status === 200 ? "200" : `${r.status} ${r.loi}`);

async function guiDuyet(id: string, ai: NguoiSan) {
	ok(await goi("okr.guiDuyet", { id }, ai.cookie), `gui duyet ${id}`);
}

async function donSan() {
	setSystemTime();
	ok(await goi("okr.setProgram", { duyetCongBo: false }), "tat duyet");
	await donSanKhep();
	await donSanCanhKr();
}

describe("cong-bo", () => {
	let s: SanDuyet;

	beforeAll(async () => {
		s = await gieoDuyet("dc");
	}, CHO_GIEO_MS);
	afterAll(donSan, CHO_MS);

	test(
		"cong-bo: bật ô, T bị chặn, nhập ra cho-duyet, H tự duyệt, tắt ô thì công bố như cũ; số gộp chỉ đếm cong-bo",
		async () => {
			const truoc = await doc<{ version: number; duyetCongBo: boolean }>(
				"okr.program",
			);
			const bat = ok<{ version: number; duyetCongBo: boolean }>(
				await goi("okr.setProgram", { duyetCongBo: true }),
				"bat duyet",
			);
			const [cauHinh] = await db.okrTrail.findMany({
				where: { action: "cau-hinh", actorUserId: phien.quan.nguoi },
				orderBy: [{ at: "desc" }, { id: "desc" }],
				take: 1,
			});
			const b = parseOkrVet(cauHinh?.before) ?? {};
			const a = parseOkrVet(cauHinh?.after) ?? {};
			const khac = Object.keys(a).filter(
				(k) => k !== "version" && JSON.stringify(a[k]) !== JSON.stringify(b[k]),
			);
			const chiO = (o: OkrVetSnapshot) =>
				Object.fromEntries(khac.map((k) => [k, o[k]]));
			const cam = await goi("okr.setProgram", { duyetCongBo: false }, "thuong");
			const sauCam = await doc<{ version: number; duyetCongBo: boolean }>(
				"okr.program",
			);
			expect({
				version: bat.version - truoc.version,
				duyetCongBo: bat.duyetCongBo,
				vet: [chiO(b), chiO(a)],
				phienBanVet: [b.version, a.version],
				cam: tra(cam),
				sauCam: [sauCam.version, sauCam.duyetCongBo],
			}).toEqual({
				version: 1,
				duyetCongBo: true,
				vet: [{ duyetCongBo: false }, { duyetCongBo: true }],
				phienBanVet: [truoc.version, bat.version],
				cam: `403 ${T.canQuyenQuanTri}`,
				sauCam: [bat.version, true],
			});

			const coCongBo = async (id: string, ai: NguoiSan) =>
				(await doc<ObjectiveOutput>("okr.objective", ai.cookie, { id })).quyen
					.congBo;
			const g1 = await mucTieuCoHaiKr(s, pb(s.p1), s.t, "dc G1");
			const coG1T = await coCongBo(g1.id, s.t);
			const coG1H = await coCongBo(g1.id, s.h);
			const chan = await goi("okr.publishObjective", { id: g1.id }, s.t.cookie);
			const tieuDeNhap = [ma("dc I1"), ma("dc I2")];
			const dongNhap = (tieuDe: string[], email: string) =>
				tieuDe
					.map((td) =>
						[td, `KR ${td}`, "tăng tới", "0", "10", "", email].join("\t"),
					)
					.join("\n");
			const nhapT = ok<{ objectives: number }>(
				await goi(
					"okr.applyImport",
					{
						cycleId: s.ky,
						unit: { loai: "pb", id: s.p1 },
						text: dongNhap(tieuDeNhap, `${s.t.id}@thu.test`),
						congBo: true,
					},
					s.t.cookie,
				),
				"T nhap cong bo",
			);
			const nhapCuaT = await db.okrObjective.findMany({
				where: { cycleId: s.ky, title: { in: tieuDeNhap } },
				orderBy: { title: "asc" },
				select: { id: true, status: true, publishedAt: true },
			});
			const vetNhapT = await db.okrTrail.groupBy({
				by: ["objectiveId", "action"],
				where: { objectiveId: { in: nhapCuaT.map((m) => m.id) } },
				_count: { _all: true },
			});
			ok(
				await goi("okr.publishObjective", { id: g1.id }, s.h.cookie),
				"H cong bo G1",
			);
			const vetG1 = (await vetCua(g1.id)).at(-1);
			const tieuDeH = ma("dc I3");
			ok(
				await goi(
					"okr.applyImport",
					{
						cycleId: s.ky,
						unit: { loai: "pb", id: s.p1 },
						text: dongNhap([tieuDeH], `${s.t.id}@thu.test`),
						congBo: true,
					},
					s.h.cookie,
				),
				"H nhap cong bo",
			);
			const i3 = await db.okrObjective.findFirstOrThrow({
				where: { cycleId: s.ky, title: tieuDeH },
				select: { id: true, status: true },
			});

			const tc = await doc<ToanCanhOutput>("okr.toanCanh", s.t.cookie, {
				cycleId: s.ky,
			});
			const cn = await doc<{ items: { objectiveId: string }[] }>(
				"okr.capNhatTuan",
				s.t.cookie,
			);
			const cuaP1 = new Set([g1.id, i3.id, ...nhapCuaT.map((m) => m.id)]);

			console.log(
				`cong-bo: T cong bo ${tra(chan)}; nhap T ${JSON.stringify(nhapCuaT.map((m) => m.status))}; G1 ${vetG1?.action} ${JSON.stringify(vetG1?.after)}; I3 ${i3.status}`,
			);
			expect({
				chan: tra(chan),
				g1SauChan: "nhap",
				nhapT: nhapT.objectives,
				trangThaiNhapT: nhapCuaT.map((m) => [m.status, m.publishedAt]),
				vetNhapT: vetNhapT
					.map((v) => [v.action, v._count._all])
					.sort()
					.map(String),
				vetG1: [vetG1?.action, parseOkrVet(vetG1?.after)],
				i3: i3.status,
				toanCanh: tc.hang.find((h) => h.key === `pb:${s.p1}`)?.soMucTieu,
				capNhatTuan: [
					...new Set(
						cn.items.map((i) => i.objectiveId).filter((id) => cuaP1.has(id)),
					),
				].sort(),
			}).toEqual({
				chan: `400 ${T.duyet.canDuyet}`,
				g1SauChan: "nhap",
				nhapT: 2,
				trangThaiNhapT: [
					["cho-duyet", null],
					["cho-duyet", null],
				],
				vetNhapT: ["gui-duyet,1", "gui-duyet,1", "tao,1", "tao,1"],
				vetG1: ["cong-bo", { status: "cong-bo", tuDuyet: true }],
				i3: "cong-bo",
				toanCanh: 2,
				capNhatTuan: [g1.id, i3.id].sort(),
			});

			const [con, cho2] = nhapCuaT;
			const hDuyet = await goi(
				"okr.publishObjective",
				{ id: cho2?.id ?? "" },
				s.h.cookie,
			);
			const vetHDuyet = (await vetCua(cho2?.id ?? "")).at(-1);
			expect({
				hDuyet: [tra(hDuyet), await trangThai(cho2?.id ?? "")],
				vet: [
					vetHDuyet?.action,
					parseOkrVet(vetHDuyet?.before),
					parseOkrVet(vetHDuyet?.after),
				],
			}).toEqual({
				hDuyet: ["200", "cong-bo"],
				vet: ["duyet", { status: "cho-duyet" }, { status: "cong-bo" }],
			});

			await datDuyetCongBo(false);
			const g2 = await mucTieuCoHaiKr(s, pb(s.p1), s.t, "dc G2");
			const coG2T = await coCongBo(g2.id, s.t);
			const coChoT = await coCongBo(con?.id ?? "", s.t);
			const tatG2 = await goi(
				"okr.publishObjective",
				{ id: g2.id },
				s.t.cookie,
			);
			const tatCho = await goi(
				"okr.publishObjective",
				{ id: con?.id ?? "" },
				s.t.cookie,
			);
			const vetCho = (await vetCua(con?.id ?? "")).at(-1);
			expect({
				g2: [tra(tatG2), await trangThai(g2.id)],
				cho: [tra(tatCho), await trangThai(con?.id ?? "")],
				vetCho: [
					vetCho?.action,
					parseOkrVet(vetCho?.before),
					parseOkrVet(vetCho?.after),
				],
			}).toEqual({
				g2: ["200", "cong-bo"],
				cho: ["200", "cong-bo"],
				vetCho: [
					"cong-bo",
					{ status: "cho-duyet" },
					{ status: "cong-bo", tuChoDuyet: true },
				],
			});
			expect({
				batKhongDuyet: [coG1T, tra(chan)],
				batNguoiDuyet: coG1H,
				tatNhap: [coG2T, tra(tatG2)],
				tatCho: [coChoT, tra(tatCho)],
			}).toEqual({
				batKhongDuyet: [false, `400 ${T.duyet.canDuyet}`],
				batNguoiDuyet: true,
				tatNhap: [true, "200"],
				tatCho: [true, "200"],
			});
		},
		CHO_MS,
	);
});

describe("vong-duyet", () => {
	let s: SanDuyet;

	beforeAll(async () => {
		s = await gieoDuyet("dv");
		await datDuyetCongBo(true);
	}, CHO_GIEO_MS);
	afterAll(donSan, CHO_MS);

	test(
		"vong-duyet: gửi, trả lại, sửa, gửi lại, duyệt — trạng thái, khoá khởi điểm, vết đúng thứ tự; khung mục tiêu mang cờ và dải",
		async () => {
			const g = await mucTieuCoHaiKr(s, pb(s.p1), s.t, "dv G");
			const khung = (ai: NguoiSan) =>
				doc<ObjectiveOutput>("okr.objective", ai.cookie, { id: g.id });
			const chuoi: string[] = [];
			const truocGui = await khung(s.t);
			await guiDuyet(g.id, s.t);
			chuoi.push(await trangThai(g.id));
			const khiChoT = await khung(s.t);
			const khiChoH = await khung(s.h);
			ok(
				await goi(
					"okr.traLaiMucTieu",
					{ objectiveId: g.id, lyDo: LY_DO },
					s.h.cookie,
				),
				"H tra lai",
			);
			chuoi.push(await trangThai(g.id));
			const sauTraLai = await khung(s.t);
			ok(
				await goi(
					"okr.updateObjective",
					{ id: g.id, title: ma("dv G sua") },
					s.t.cookie,
				),
				"T sua",
			);
			chuoi.push(await trangThai(g.id));
			await guiDuyet(g.id, s.t);
			chuoi.push(await trangThai(g.id));
			ok(await goi("okr.duyetMucTieu", { id: g.id }, s.h.cookie), "H duyet");
			chuoi.push(await trangThai(g.id));
			const sauDuyet = await db.okrObjective.findUniqueOrThrow({
				where: { id: g.id },
				select: {
					publishedAt: true,
					keyResults: { select: { id: true, startLockedAt: true } },
				},
			});
			const vet = await vetCua(g.id);
			const hanhDong = vet
				.map((v) => v.action)
				.filter((a) => a !== "tao" && a !== "tao-kr");
			const quyen = (o: ObjectiveOutput) => o.quyen;
			const choTen = { ten: s.h.id };
			const khongKhoa = sauDuyet.keyResults
				.filter((k) => k.startLockedAt === null)
				.map((k) => k.id);
			console.log(
				`vong-duyet: chuoi ${chuoi.join(" → ")}; vet ${hanhDong.join(", ")}; KR chua khoa ${JSON.stringify(khongKhoa)}`,
			);
			expect({
				chuoi,
				publishedAt: sauDuyet.publishedAt !== null,
				khongKhoa,
				hanhDong,
				ghiChuTraLai: vet.find((v) => v.action === "tra-lai")?.note,
				truocGui: quyen(truocGui),
				khiChoT: [khiChoT.choDuyet?.nguoiDuyet, quyen(khiChoT)],
				khiChoH: quyen(khiChoH),
				khiChoNguoiGui: khiChoT.choDuyet?.nguoiGui?.id,
				sauTraLai: [
					sauTraLai.traLaiGanNhat?.lyDo,
					sauTraLai.traLaiGanNhat?.nguoi?.id,
					sauTraLai.choDuyet,
					sauTraLai.quyen.guiDuyet,
				],
			}).toEqual({
				chuoi: ["cho-duyet", "nhap", "nhap", "cho-duyet", "cong-bo"],
				publishedAt: true,
				khongKhoa: [],
				hanhDong: ["gui-duyet", "tra-lai", "sua", "gui-duyet", "duyet"],
				ghiChuTraLai: LY_DO,
				truocGui: {
					datHienThi: true,
					congBo: false,
					guiDuyet: true,
					duyet: false,
					rutDuyet: false,
					xoa: true,
					dungLai: false,
				},
				khiChoT: [
					choTen,
					{
						datHienThi: false,
						congBo: false,
						guiDuyet: false,
						duyet: false,
						rutDuyet: true,
						xoa: false,
						dungLai: false,
					},
				],
				khiChoH: {
					datHienThi: false,
					congBo: true,
					guiDuyet: false,
					duyet: true,
					rutDuyet: false,
					xoa: false,
					dungLai: false,
				},
				khiChoNguoiGui: s.t.id,
				sauTraLai: [LY_DO, s.h.id, null, true],
			});
		},
		CHO_MS,
	);

	test(
		"vong-duyet: rút lại về nháp với vết rut-duyet; lý do 9 và 501 ký tự bị từ chối, không vết",
		async () => {
			const g2 = await mucTieuCoHaiKr(s, pb(s.p1), s.t, "dv G2");
			await guiDuyet(g2.id, s.t);
			const soVet = (await vetCua(g2.id)).length;
			const ngan = await goi(
				"okr.traLaiMucTieu",
				{ objectiveId: g2.id, lyDo: "x".repeat(9) },
				s.h.cookie,
			);
			const dai = await goi(
				"okr.traLaiMucTieu",
				{ objectiveId: g2.id, lyDo: "x".repeat(501) },
				s.h.cookie,
			);
			const sauLyDo = [(await vetCua(g2.id)).length, await trangThai(g2.id)];
			ok(await goi("okr.rutDuyet", { id: g2.id }, s.t.cookie), "T rut");
			const cuoi = (await vetCua(g2.id)).at(-1);
			expect({
				ngan: tra(ngan),
				dai: tra(dai),
				sauLyDo,
				rut: [await trangThai(g2.id), cuoi?.action],
			}).toEqual({
				ngan: `400 ${LOI_KHUON_HIEN_THI.lyDoTraLai}`,
				dai: `400 ${LOI_KHUON_HIEN_THI.lyDoTraLai}`,
				sauLyDo: [soVet, "cho-duyet"],
				rut: ["nhap", "rut-duyet"],
			});
		},
		CHO_MS,
	);

	test(
		"vong-duyet: duyệt và rút lại cùng lúc — một bên thắng, bên kia 400 câu ghim, không mục tiêu vừa công bố vừa về nháp",
		async () => {
			const ket: string[] = [];
			for (const lan of [1, 2, 3, 4]) {
				const g = await mucTieuCoHaiKr(s, pb(s.p1), s.t, `dv dua ${lan}`);
				await guiDuyet(g.id, s.t);
				const [duyet, rut] = await Promise.all([
					goi("okr.duyetMucTieu", { id: g.id }, s.h.cookie),
					goi("okr.rutDuyet", { id: g.id }, s.t.cookie),
				]);
				const mt = await db.okrObjective.findUniqueOrThrow({
					where: { id: g.id },
					select: {
						status: true,
						publishedAt: true,
						keyResults: { select: { startLockedAt: true } },
					},
				});
				const sauGui = (await vetCua(g.id))
					.map((v) => v.action)
					.filter((a) => a === "duyet" || a === "rut-duyet");
				const thang = duyet.status === 200 ? "duyet" : "rut-duyet";
				const thua = duyet.status === 200 ? rut : duyet;
				const khoaHet = mt.keyResults.every((k) => k.startLockedAt !== null);
				const khoaKhong = mt.keyResults.every((k) => k.startLockedAt === null);
				const hopLe =
					thang === "duyet"
						? mt.status === "cong-bo" && mt.publishedAt !== null && khoaHet
						: mt.status === "nhap" && mt.publishedAt === null && khoaKhong;
				ket.push(
					[
						[duyet.status, rut.status].sort().join("/"),
						tra(thua),
						sauGui.join(",") === thang,
						hopLe,
					].join(" | "),
				);
			}
			console.log(`vong-duyet dua:\n${ket.join("\n")}`);
			expect(ket).toEqual(
				Array.from(
					{ length: 4 },
					() => `200/400 | 400 ${T.duyet.khongConChoDuyet} | true | true`,
				),
			);
		},
		CHO_MS,
	);
});

describe("nguoi-duyet", () => {
	let s: SanDuyet;

	beforeAll(async () => {
		s = await gieoDuyet("dn");
		await datDuyetCongBo(true);
	}, CHO_GIEO_MS);
	afterAll(donSan, CHO_MS);

	test(
		"nguoi-duyet: bảng người duyệt viết trước 7 ca, API và packages/db cùng kết quả",
		async () => {
			const svc = ungDung().get(OkrAccessService);
			const q = await svc.quyen(s.q.id);
			const dv = (
				level: CapMucTieu,
				o: {
					divisionId?: string;
					departmentId?: string;
					personUserId?: string;
				},
			) => ({
				level,
				divisionId: o.divisionId ?? null,
				departmentId: o.departmentId ?? null,
				personUserId: o.personUserId ?? null,
			});
			const CA = {
				"phong ban co bo phan co truong": dv("phong-ban", {
					departmentId: s.p1,
				}),
				"phong ban khong bo phan": dv("phong-ban", { departmentId: s.p2 }),
				"phong ban co bo phan khong truong": dv("phong-ban", {
					departmentId: s.p3,
				}),
				"bo phan": dv("bo-phan", { divisionId: s.b1 }),
				"ca nhan thuong": dv("ca-nhan", { personUserId: s.k.id }),
				"ca nhan la truong phong ban": dv("ca-nhan", { personUserId: s.t.id }),
				"ca nhan khong phong ban chinh": dv("ca-nhan", {
					personUserId: s.m.id,
				}),
			} as const;
			const VIET_TRUOC = {
				"phong ban co bo phan co truong": { loai: "nguoi", userId: s.h.id },
				"phong ban khong bo phan": { loai: "quan-tri" },
				"phong ban co bo phan khong truong": { loai: "quan-tri" },
				"bo phan": { loai: "quan-tri" },
				"ca nhan thuong": { loai: "nguoi", userId: s.t.id },
				"ca nhan la truong phong ban": { loai: "nguoi", userId: s.h.id },
				"ca nhan khong phong ban chinh": { loai: "quan-tri" },
			} satisfies Record<keyof typeof CA, NguoiDuyet>;
			const cay = await docCayOkr(db);
			const api = Object.fromEntries(
				Object.entries(CA).map(([ten, d]) => [ten, svc.nguoiDuyet(q, d)]),
			);
			const tuDb = Object.fromEntries(
				Object.entries(CA).map(([ten, d]) => [ten, nguoiDuyetMucTieu(cay, d)]),
			);
			console.log(`nguoi-duyet bang: ${JSON.stringify(api, null, 1)}`);
			expect(Object.keys(CA)).toHaveLength(7);
			expect(api).toEqual(VIET_TRUOC);
			expect(tuDb).toEqual(VIET_TRUOC);
		},
		CHO_MS,
	);

	test(
		"nguoi-duyet: ma trận 5 người × 4 thao tác, ô 403 không đổi vết; Q duyệt được mục tiêu bộ phận",
		async () => {
			const NGUOI = { T: s.t, H: s.h, Q: s.q, M: s.m, O: s.o } as const;
			const cam = (cau: string) => `403 ${cau}`;
			const VIET_TRUOC = {
				guiDuyet: {
					T: "200",
					H: "200",
					Q: cam(T.khongSuaDuocDonVi),
					M: cam(T.khongSuaDuocDonVi),
					O: cam(T.khongSuaDuocDonVi),
				},
				duyetMucTieu: {
					T: cam(T.duyet.khongDuyetDuoc),
					H: "200",
					Q: cam(T.duyet.khongDuyetDuoc),
					M: cam(T.duyet.khongDuyetDuoc),
					O: cam(T.duyet.khongDuyetDuoc),
				},
				traLaiMucTieu: {
					T: cam(T.duyet.khongDuyetDuoc),
					H: "200",
					Q: cam(T.duyet.khongDuyetDuoc),
					M: cam(T.duyet.khongDuyetDuoc),
					O: cam(T.duyet.khongDuyetDuoc),
				},
				rutDuyet: {
					T: "200",
					H: cam(T.duyet.khongPhaiNguoiGui),
					Q: cam(T.duyet.khongPhaiNguoiGui),
					M: cam(T.duyet.khongPhaiNguoiGui),
					O: cam(T.duyet.khongPhaiNguoiGui),
				},
			} as const;
			const vao = (thuTuc: string, id: string): Json =>
				thuTuc === "traLaiMucTieu" ? { objectiveId: id, lyDo: LY_DO } : { id };
			const bang: Record<string, Record<string, string>> = {};
			const lech: string[] = [];
			for (const [thuTuc, hang] of Object.entries(VIET_TRUOC)) {
				bang[thuTuc] = {};
				for (const [ten, ai] of Object.entries(NGUOI)) {
					const g = await mucTieuCoHaiKr(
						s,
						pb(s.p1),
						s.t,
						`dn ${thuTuc} ${ten}`,
					);
					if (thuTuc !== "guiDuyet") await guiDuyet(g.id, s.t);
					const truoc = (await vetCua(g.id)).length;
					const r = await goi(`okr.${thuTuc}`, vao(thuTuc, g.id), ai.cookie);
					const sau = (await vetCua(g.id)).length;
					const o = tra(r);
					bang[thuTuc][ten] = o;
					if (o !== hang[ten as keyof typeof hang])
						lech.push(`(${ten}, ${thuTuc}): ${o}`);
					if (r.status !== 200 && sau !== truoc)
						lech.push(`(${ten}, ${thuTuc}): 403 ma vet ${truoc} → ${sau}`);
				}
			}
			const bp = await mucTieuCoHaiKr(
				s,
				{ level: "bo-phan", divisionId: s.b1 },
				s.h,
				"dn BP",
			);
			await guiDuyet(bp.id, s.h);
			const qDuyetBp = tra(
				await goi("okr.duyetMucTieu", { id: bp.id }, s.q.cookie),
			);
			console.log(
				`nguoi-duyet ma tran: ${JSON.stringify(bang, null, 1)}\nlech: ${lech.join("; ") || "khong"}`,
			);
			expect(lech).toEqual([]);
			expect(bang).toEqual(VIET_TRUOC);
			expect([qDuyetBp, await trangThai(bp.id)]).toEqual(["200", "cong-bo"]);
		},
		CHO_MS,
	);

	test(
		"nguoi-duyet: khi chờ duyệt, 14 thao tác sửa nội dung mục tiêu và KR của T bị từ chối 400 dangChoDuyet, bảng không đổi; người làm vẫn đánh dấu việc xong",
		async () => {
			const dich = await mucTieuCoHaiKr(
				s,
				{ level: "bo-phan", divisionId: s.b1 },
				s.h,
				"dn dich",
			);
			await guiDuyet(dich.id, s.h);
			ok(
				await goi("okr.duyetMucTieu", { id: dich.id }, s.q.cookie),
				"Q duyet dich",
			);
			const g = await mucTieuCoHaiKr(s, pb(s.p1), s.t, "dn khoa");
			const [kr1, kr2] = g.kr;
			const krMoc = ok<{ id: string }>(
				await goi(
					"okr.createKeyResult",
					{
						objectiveId: g.id,
						title: ma("dn kr moc"),
						kind: "moc",
						ownerUserId: s.t.id,
						startValue: 0,
						targetValue: 1,
						currentValue: 1,
						unit: "",
						dueOn: null,
						weight: 1,
					},
					s.t.cookie,
				),
				"tao KR moc",
			).id;
			const viec = ok<{ id: string }>(
				await goi(
					"okr.themViec",
					{
						keyResultId: kr1 ?? "",
						tieuDe: "Gọi lại khách cũ",
						nguoiLamUserId: s.k.id,
						hanNgay: null,
					},
					s.t.cookie,
				),
				"them viec",
			).id;
			const bangChung = ok<{ id: string }>(
				await goi(
					"okr.themBangChung",
					{
						keyResultId: krMoc,
						url: "https://drive.google.com/thu",
						ghiChu: "",
					},
					s.t.cookie,
				),
				"them bang chung",
			).id;
			const chienDich = await chienDichMoi(ma("dn cd"), s.t);
			await guiDuyet(g.id, s.t);
			const anh = async () => {
				const mt = await db.okrObjective.findUniqueOrThrow({
					where: { id: g.id },
					select: {
						title: true,
						status: true,
						hienThi: true,
						participants: { select: { userId: true } },
						keyResults: {
							orderBy: { position: "asc" },
							select: {
								id: true,
								title: true,
								targetValue: true,
								source: true,
								nguonMay: { select: { loai: true } },
								viecKr: {
									orderBy: { id: "asc" },
									select: { id: true, tieuDe: true, xongLuc: true },
								},
								bangChung: { select: { id: true } },
							},
						},
						alignments: { select: { id: true } },
						nguoiXem: { select: { userId: true } },
					},
				});
				return {
					...mt,
					keyResults: mt.keyResults.map((k) => ({
						...k,
						targetValue: Number(k.targetValue),
					})),
					vet: (await vetCua(g.id)).length,
				};
			};
			const CA: [string, string, Json][] = [
				[
					"updateObjective",
					"okr.updateObjective",
					{ id: g.id, title: ma("dn sua") },
				],
				[
					"createKeyResult",
					"okr.createKeyResult",
					{
						objectiveId: g.id,
						title: ma("dn kr moi"),
						kind: "tang-toi",
						ownerUserId: s.t.id,
						startValue: 0,
						targetValue: 100,
						currentValue: 0,
						unit: "",
						dueOn: null,
						weight: 1,
					},
				],
				[
					"updateKeyResult",
					"okr.updateKeyResult",
					{ id: kr1 ?? "", targetValue: 55 },
				],
				["removeKeyResult", "okr.removeKeyResult", { id: kr2 ?? "" }],
				[
					"addAlignment",
					"okr.addAlignment",
					{
						objectiveId: g.id,
						targetObjectiveId: dich.id,
						targetKeyResultId: null,
					},
				],
				[
					"datHienThi",
					"okr.datHienThi",
					{ objectiveId: g.id, hienThi: "gioi-han", nguoiXem: [s.k.id] },
				],
				[
					"addParticipant",
					"okr.updateObjective",
					{ id: g.id, participantIds: [s.k.id] },
				],
				[
					"datNguonKr",
					"okr.datNguonKr",
					{ keyResultId: kr1 ?? "", loai: "api" },
				],
				[
					"themViec",
					"okr.themViec",
					{
						keyResultId: kr1 ?? "",
						tieuDe: "Việc thêm khi chờ duyệt",
						nguoiLamUserId: s.k.id,
						hanNgay: null,
					},
				],
				["suaViec", "okr.suaViec", { id: viec, tieuDe: "Đổi tên việc" }],
				["goViec", "okr.goViec", { id: viec }],
				[
					"ganSangKien",
					"okr.ganSangKien",
					{ keyResultId: kr1 ?? "", loai: "chien-dich", banGhiId: chienDich },
				],
				[
					"themBangChung",
					"okr.themBangChung",
					{
						keyResultId: krMoc,
						url: "https://drive.google.com/thu-2",
						ghiChu: "",
					},
				],
				["goBangChung", "okr.goBangChung", { id: bangChung }],
			];
			const truoc = await anh();
			const ket: Record<string, string> = {};
			for (const [ten, thuTuc, vao] of CA)
				ket[ten] = tra(await goi(thuTuc, vao, s.t.cookie));
			const sau = await anh();
			const danhDau = tra(
				await goi("okr.danhDauViec", { id: viec, xong: true }, s.k.cookie),
			);
			const canh = await doc<CanhKrOutput>("okr.canhKr", s.t.cookie, {
				keyResultId: kr1 ?? "",
			});
			console.log(
				`nguoi-duyet khoa: ${CA.length} o\n${JSON.stringify(ket, null, 1)}\ndanhDauViec cua nguoi lam: ${danhDau}`,
			);
			expect(CA).toHaveLength(14);
			expect(ket).toEqual(
				Object.fromEntries(CA.map(([ten]) => [ten, `400 ${T.dangChoDuyet}`])),
			);
			expect(sau).toEqual(truoc);
			expect(danhDau).toBe("200");
			expect({ choDuyet: canh.choDuyet, khoa: canh.khoa }).toEqual({
				choDuyet: true,
				khoa: false,
			});
		},
		CHO_MS,
	);
});

describe("nhac-duyet", () => {
	let s: SanDuyet;

	beforeAll(async () => {
		s = await gieoDuyet("dh");
		await datDuyetCongBo(true);
	}, CHO_GIEO_MS);
	afterAll(donSan, CHO_MS);

	test(
		"nhac-duyet: H có đúng G1, G2; T có một okr-tra-lai G3 kèm lý do; M không mục nào; duyệt G1 thì H còn G2; ngoài 24 giờ T hết mục",
		async () => {
			const g1 = await mucTieuCoHaiKr(s, pb(s.p1), s.t, "dh G1");
			const g2 = await mucTieuCoHaiKr(s, pb(s.p1), s.t, "dh G2");
			const g3 = await mucTieuCoHaiKr(s, pb(s.p1), s.t, "dh G3");
			const khac = await mucTieuCoHaiKr(
				s,
				{ level: "ca-nhan", personUserId: s.k.id },
				s.k,
				"dh khac",
			);
			for (const g of [g1, g2, g3]) await guiDuyet(g.id, s.t);
			await guiDuyet(khac.id, s.k);
			ok(
				await goi(
					"okr.traLaiMucTieu",
					{ objectiveId: g3.id, lyDo: LY_DO },
					s.h.cookie,
				),
				"H tra lai G3",
			);
			const viec = async (ai: NguoiSan) =>
				(await doc<ViecCuaToiOutput>("okr.viecCuaToi", ai.cookie)).viec;
			const choCua = async (ai: NguoiSan) =>
				(await viec(ai))
					.flatMap((v) => (v.loai === "okr-cho-duyet" ? [v.objectiveId] : []))
					.sort();
			const traLaiCua = async (ai: NguoiSan) =>
				(await viec(ai)).flatMap((v) =>
					v.loai === "okr-tra-lai"
						? [{ objectiveId: v.objectiveId, lyDo: v.lyDo }]
						: [],
				);
			const duyetCua = async (ai: NguoiSan) =>
				(await viec(ai)).filter(
					(v) => v.loai === "okr-cho-duyet" || v.loai === "okr-tra-lai",
				);
			const dau = {
				h: await choCua(s.h),
				t: await traLaiCua(s.t),
				m: await duyetCua(s.m),
				tCho: await choCua(s.t),
			};
			ok(await goi("okr.duyetMucTieu", { id: g1.id }, s.h.cookie), "duyet G1");
			const sauDuyet = await choCua(s.h);
			setSystemTime(new Date(Date.now() + 25 * GIO_MS));
			const ngoai = { t: await traLaiCua(s.t), h: await choCua(s.h) };
			setSystemTime();
			console.log(
				`nhac-duyet: H ${JSON.stringify(dau.h)}; T ${JSON.stringify(dau.t)}; M ${dau.m.length}; sau duyet G1 H ${JSON.stringify(sauDuyet)}; ngoai cua so ${JSON.stringify(ngoai)}; khac ${khac.id}`,
			);
			expect({ ...dau, sauDuyet, ngoai }).toEqual({
				h: [g1.id, g2.id].sort(),
				t: [{ objectiveId: g3.id, lyDo: LY_DO }],
				m: [],
				tCho: [khac.id],
				sauDuyet: [g2.id],
				ngoai: { t: [], h: [g2.id] },
			});
		},
		CHO_MS,
	);
});
