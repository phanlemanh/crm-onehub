import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import {
	cuocDang,
	demCuocTrongKy,
	moCuoc,
	tangLuot,
} from "@crm/db/okr-cuoc-soan";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { idMau } from "../scripts/okr-mau/nap";
import { OKR } from "../src/okr/okr-config";
import {
	CHU_KY_Q4,
	DON_VI,
	type Duong,
	datPhaQuy4,
	donSoan,
	gieoCuoc,
	gieoDongNhap,
	goiSoan,
	NAC_SOAN,
	PB,
	phienMoi,
	type REST_SOAN,
	trangThaiDongNhap,
	vaoDonVi,
	xoaCuoc,
} from "./soan-okr-san";
import {
	batDauMau,
	CHO_DB,
	CHO_MA_TRAN,
	dungUngDung,
	ghiCauHinh,
	ketThucMau,
	mt,
	phienMau,
	type TraLoi,
} from "./tro-ly-okr-san";

const TEP_MA_TRAN = join(
	import.meta.dir,
	"../../../_acceptance/soan-okr-cung-tro-ly/rang/ma-tran-quyen.md",
);

const NGUOI = {
	"quan-tri": "le-hai-dang",
	"truong-bo-phan": "tran-quoc-bao",
	"truong-phong-ban": "nguyen-thi-lan",
	"phu-trach-kr": "do-minh-khoa",
	"thanh-vien": "bui-quang-huy",
	"truong-phong-ban-vai-okr": "thai-minh-chau",
	"truong-bo-phan-vai-okr": "doan-thi-thu",
} as const;
type Nguoi = keyof typeof NGUOI;

const CAP = ["onehub", "bo-phan", "phong-ban"] as const;
type Cap = (typeof CAP)[number];
const NAC = ["tat", "an", "bat"] as const;
type Nac = (typeof NAC)[number];
const THU_TUC = [
	"soanSanSang",
	"soanMo",
	"soanDanhSachCuoc",
	"soanDanhSach",
	"soanQuyet",
	"soanDuaVao",
] as const satisfies readonly (keyof typeof REST_SOAN)[];
type ThuTuc = (typeof THU_TUC)[number];
const DUONG = ["trpc", "rest"] as const satisfies readonly Duong[];

const DON_VI_CUA = {
	"quan-tri": { "bo-phan": DON_VI.kinhDoanh, "phong-ban": DON_VI.kdBac },
	"truong-bo-phan": { "bo-phan": DON_VI.kinhDoanh, "phong-ban": DON_VI.kdBac },
	"truong-phong-ban": {
		"bo-phan": DON_VI.kinhDoanh,
		"phong-ban": DON_VI.kdBac,
	},
	"phu-trach-kr": { "bo-phan": DON_VI.kinhDoanh, "phong-ban": DON_VI.kdBac },
	"thanh-vien": { "bo-phan": DON_VI.kinhDoanh, "phong-ban": DON_VI.kdBac },
	"truong-phong-ban-vai-okr": {
		"bo-phan": DON_VI.hoTro,
		"phong-ban": DON_VI.taiChinh,
	},
	"truong-bo-phan-vai-okr": {
		"bo-phan": DON_VI.hoTro,
		"phong-ban": DON_VI.taiChinh,
	},
} as const;

const donViO = (nguoi: Nguoi, cap: Cap) =>
	cap === "onehub" ? DON_VI.onehub : DON_VI_CUA[nguoi][cap];

const O_MOI_THU_TUC = 63;
const SO_O_MA_TRAN = 378;

function docLoc(): readonly ThuTuc[] {
	const bien = process.env.SOAN_MA_TRAN_THU_TUC;
	if (bien === undefined) return THU_TUC;
	const ten = bien
		.split(",")
		.map((t) => t.trim())
		.filter(Boolean);
	const la = ten.filter((t) => !(THU_TUC as readonly string[]).includes(t));
	if (la.length > 0 || ten.length === 0)
		throw new Error(
			`SOAN_MA_TRAN_THU_TUC co ten la: «${la.join(",")}» (chon trong ${THU_TUC.join(",")})`,
		);
	return THU_TUC.filter((t) => ten.includes(t));
}

const CHON = docLoc();
const chay = (t: ThuTuc) => CHON.includes(t);
const BO = THU_TUC.filter((t) => !chay(t));

type O = { nguoi: Nguoi; cap: Cap; nac: Nac; thuTuc: ThuTuc; giaTri: string };

function docMaTran(): O[] {
	const chu = readFileSync(TEP_MA_TRAN, "utf8");
	const dong = chu
		.split("\n")
		.filter((d) => /^\|\s*[a-z][a-z-]*\s*\|/.test(d) && !d.includes("Người"));
	const o = dong.map((d) => {
		const cot = d.split("|").map((c) => c.trim());
		const [nguoi, cap, nac, thuTuc, giaTri] = cot.slice(1, 6);
		if (!nguoi || !cap || !nac || !thuTuc || !giaTri)
			throw new Error(`o trong: ${d}`);
		if (/hoặc|\/|,/.test(giaTri)) throw new Error(`o hai gia tri: ${d}`);
		if (!(nguoi in NGUOI)) throw new Error(`nguoi la: ${nguoi}`);
		if (!(CAP as readonly string[]).includes(cap))
			throw new Error(`cap la: ${cap}`);
		if (!(NAC as readonly string[]).includes(nac))
			throw new Error(`nac la: ${nac}`);
		if (!(THU_TUC as readonly string[]).includes(thuTuc))
			throw new Error(`thu tuc la: ${thuTuc}`);
		return { nguoi, cap, nac, thuTuc, giaTri } as O;
	});
	const khoa = (x: Omit<O, "giaTri">) =>
		`${x.nguoi}|${x.cap}|${x.nac}|${x.thuTuc}`;
	const co = new Set(o.map(khoa));
	if (co.size !== o.length)
		throw new Error(`ma tran co ${o.length - co.size} o trung`);
	const thieu = (Object.keys(NGUOI) as Nguoi[]).flatMap((nguoi) =>
		CAP.flatMap((cap) =>
			NAC.flatMap((nac) =>
				THU_TUC.map((thuTuc) => khoa({ nguoi, cap, nac, thuTuc })).filter(
					(k) => !co.has(k),
				),
			),
		),
	);
	if (thieu.length > 0) throw new Error(`ma tran thieu o: ${thieu.join(" ")}`);
	if (o.length !== SO_O_MA_TRAN)
		throw new Error(`ma tran co ${o.length} o, can ${SO_O_MA_TRAN}`);
	return o;
}

const MA_TRAN = docMaTran();
let tongKhangDinh = 0;

let app: NestExpressApplication;
const cookie = {} as Record<Nguoi, string>;
let cQuanTri = "";

type DuLieu = {
	bat?: boolean;
	ok?: boolean;
	lyDo?: string | null;
	cuoc?: { id: string; sessionId: string };
	mucTieuIds?: string[];
};

function doc(thuTuc: ThuTuc, tra: TraLoi, cauKhongCo?: string): string {
	if (tra.status === 403) return "403";
	if (tra.status === 404 && tra.loi === cauKhongCo) return "404";
	if (tra.status !== 200) return `http ${tra.status} ${tra.loi}`;
	const d = tra.data as DuLieu;
	if (thuTuc === "soanDanhSachCuoc") return "mo";
	if (thuTuc === "soanSanSang") return d.bat === true ? "mo" : String(d.lyDo);
	if (thuTuc === "soanDanhSach") return d.lyDo === null ? "mo" : String(d.lyDo);
	return d.ok === true ? "mo" : String(d.lyDo);
}

async function goiO(
	o: O,
	duong: Duong,
): Promise<{ tra: TraLoi; dongGiu: string | null; cauKhongCo?: string }> {
	const dv = donViO(o.nguoi, o.cap);
	const c = cookie[o.nguoi];
	if (o.thuTuc === "soanSanSang" || o.thuTuc === "soanDanhSachCuoc")
		return {
			tra: await goiSoan(app, o.thuTuc, duong, vaoDonVi(dv, duong), c),
			dongGiu: null,
		};
	if (o.thuTuc === "soanMo") {
		const tra = await goiSoan(app, "soanMo", duong, vaoDonVi(dv, duong), c);
		const d = tra.data as DuLieu | undefined;
		if (d?.ok && d.cuoc) await xoaCuoc(d.cuoc.id);
		return { tra, dongGiu: null };
	}
	const cuoc = await gieoCuoc({
		donVi: dv,
		nguoiMo: NGUOI["quan-tri"],
		nac: o.nac === "an" ? "an" : "bat",
	});
	const nhan = o.thuTuc === "soanDuaVao" ? "nhan" : "cho";
	const [mtId] = await gieoDongNhap(
		cuoc,
		[{ loai: "muc-tieu-moi", khoa: "m1", ten: `Mục tiêu ma trận ${duong}` }],
		nhan,
	);
	const [krId] = await gieoDongNhap(
		cuoc,
		[
			{
				loai: "kr-moi",
				khoa: "k1",
				chaKhoa: "m1",
				ten: "Ký thêm hợp đồng mới",
			},
		],
		nhan,
	);
	let tra: TraLoi;
	if (o.thuTuc === "soanDanhSach")
		tra = await goiSoan(app, "soanDanhSach", duong, { cuocSoanId: cuoc.id }, c);
	else if (o.thuTuc === "soanQuyet")
		tra = await goiSoan(
			app,
			"soanQuyet",
			duong,
			{ deXuatId: mtId ?? "", quyet: "nhan" },
			c,
		);
	else {
		tra = await goiSoan(
			app,
			"soanDuaVao",
			duong,
			{
				cuocSoanId: cuoc.id,
				kr: [{ deXuatId: krId ?? "", khoiDiem: 0, dich: 10 }],
			} as never,
			c,
		);
		const d = tra.data as DuLieu | undefined;
		if (d?.ok)
			await db.okrObjective.deleteMany({
				where: { id: { in: d.mucTieuIds ?? [] } },
			});
	}
	const dongGiu =
		o.thuTuc === "soanQuyet" && o.giaTri !== "mo"
			? await trangThaiDongNhap(mtId ?? "")
			: null;
	await xoaCuoc(cuoc.id);
	return {
		tra,
		dongGiu,
		cauKhongCo:
			o.thuTuc === "soanQuyet"
				? OKR.thongDiep.soan.khongCoDong(mtId ?? "")
				: OKR.thongDiep.soan.khongCoCuoc,
	};
}

beforeAll(async () => {
	await batDauMau();
	await donSoan();
	await datPhaQuy4("lap-ke-hoach");
	app = await dungUngDung();
	for (const [khoa, ma] of Object.entries(NGUOI) as [Nguoi, string][])
		cookie[khoa] = await phienMau(ma);
	cQuanTri = cookie["quan-tri"];
}, CHO_DB);

afterAll(async () => {
	await donSoan();
	await ketThucMau(app);
}, CHO_DB);

describe("ma-tran-quyen-soan", () => {
	test("ma-tran-day-du: bảng đủ 7 × 3 × 3 × 6 = 378 ô, không trùng; in thủ tục bị bỏ", () => {
		expect(
			new Set(MA_TRAN.map((x) => `${x.nguoi}|${x.cap}|${x.nac}|${x.thuTuc}`))
				.size,
		).toBe(SO_O_MA_TRAN);
		for (const t of THU_TUC)
			expect(MA_TRAN.filter((x) => x.thuTuc === t).length, t).toBe(
				O_MOI_THU_TUC,
			);
		console.log(
			`ma-tran-quyen-soan: chon ${CHON.join(",")}; bo ${BO.length === 0 ? "khong" : BO.map((t) => `${t} (${O_MOI_THU_TUC} o)`).join(", ")}`,
		);
	});

	for (const thuTuc of THU_TUC)
		test.skipIf(!chay(thuTuc))(
			`${thuTuc}: 7 người × 3 đơn vị × 3 nấc × 2 đường, mỗi ô đúng bảng viết trước`,
			async () => {
				const o = MA_TRAN.filter((x) => x.thuTuc === thuTuc);
				const lech: string[] = [];
				const bacKhongQuyen: string[] = [];
				let soKhangDinh = 0;
				for (const nac of NAC) {
					await ghiCauHinh(app, cQuanTri, NAC_SOAN[nac]);
					for (const x of o.filter((y) => y.nac === nac))
						for (const duong of DUONG) {
							const { tra, dongGiu, cauKhongCo } = await goiO(x, duong);
							const thay = doc(x.thuTuc, tra, cauKhongCo);
							soKhangDinh += 1;
							if (thay !== x.giaTri)
								lech.push(
									`o lech: ${x.nguoi} x ${x.cap} x ${x.nac} x ${x.thuTuc} x ${duong} — can ${x.giaTri}, thay ${thay}`,
								);
							if (dongGiu !== null && dongGiu !== "cho")
								bacKhongQuyen.push(
									`quyet khong quyen: ${x.nguoi} x ${x.cap} x ${x.nac} x ${duong}`,
								);
						}
				}
				tongKhangDinh += soKhangDinh;
				console.log(
					`ma-tran-quyen-soan ${thuTuc}: da khang dinh ${soKhangDinh}`,
				);
				expect(bacKhongQuyen).toEqual([]);
				expect(lech).toEqual([]);
				expect(soKhangDinh, `so khang dinh ${thuTuc}`).toBe(O_MOI_THU_TUC * 2);
			},
			CHO_MA_TRAN,
		);

	test("tong-khang-dinh: số thủ tục chọn × 63 ô × 2 đường", () => {
		const can = CHON.length * O_MOI_THU_TUC * 2;
		console.log(
			`ma-tran-quyen-soan: ${CHON.length * O_MOI_THU_TUC} o × 2 duong = ${can}; da khang dinh ${tongKhangDinh}`,
		);
		expect(tongKhangDinh).toBe(can);
		if (BO.length === 0) expect(tongKhangDinh).toBe(756);
	});

	test(
		"doi-chung-duong: trưởng phòng ban vai okr × phòng ban × bat × soanMo = mo qua hai đường, và cuộc mở đúng đơn vị",
		async () => {
			await ghiCauHinh(app, cQuanTri, NAC_SOAN.bat);
			const c = cookie["truong-phong-ban-vai-okr"];
			for (const duong of DUONG) {
				const tra = await goiSoan(
					app,
					"soanMo",
					duong,
					vaoDonVi(DON_VI.taiChinh, duong),
					c,
				);
				expect(doc("soanMo", tra)).toBe("mo");
				const cuoc = (tra.data as DuLieu).cuoc;
				if (!cuoc) throw new Error(`soanMo ${duong} khong tra cuoc`);
				const hang = await db.okrCuocSoan.findUniqueOrThrow({
					where: { id: cuoc.id },
				});
				expect(hang).toMatchObject({
					cycleId: CHU_KY_Q4,
					level: "phong-ban",
					divisionId: null,
					departmentId: DON_VI.taiChinh.departmentId,
					nguoiMoUserId: idMau("nguoi", NGUOI["truong-phong-ban-vai-okr"]),
					trangThai: "dang",
					nac: "bat",
					cacPhien: [cuoc.sessionId],
				});
				await xoaCuoc(cuoc.id);
			}
		},
		CHO_DB,
	);

	test(
		"don-vi-cuoc: cuộc bộ phận mang departmentId trùng không lọt vào cuộc đang và trần cuộc của phòng ban đó",
		async () => {
			const kdBac = { cycleId: CHU_KY_Q4, ...DON_VI.kdBac };
			const cuoc = await moCuoc(db, {
				...DON_VI.kinhDoanh,
				cycleId: CHU_KY_Q4,
				departmentId: PB("kd-bac"),
				nguoiMoUserId: idMau("nguoi", NGUOI["truong-bo-phan"]),
				sessionId: phienMoi("don-vi-cuoc"),
				nac: "bat",
			});
			await tangLuot(db, cuoc.id);
			expect(await cuocDang(db, kdBac)).toBeNull();
			expect(
				await demCuocTrongKy(db, kdBac),
				"lo cuoc bo phan vao tran phong ban",
			).toBe(0);
			expect(
				await demCuocTrongKy(db, { cycleId: CHU_KY_Q4, ...DON_VI.kinhDoanh }),
				"cuoc bo phan co luot khong duoc dem",
			).toBe(1);
			expect(
				(
					await cuocDang(db, {
						cycleId: CHU_KY_Q4,
						...DON_VI.kinhDoanh,
					})
				)?.id,
			).toBe(cuoc.id);
			await xoaCuoc(cuoc.id);
		},
		CHO_DB,
	);

	test.skipIf(!chay("soanDanhSach") || !chay("soanQuyet"))(
		"nac-an: trưởng phòng gọi soanDanhSach, soanQuyet trên cuộc quản trị mở ở nấc ẩn → 404 cùng câu với mã không có, dòng vẫn cho",
		async () => {
			await ghiCauHinh(app, cQuanTri, NAC_SOAN.an);
			const cuoc = await gieoCuoc({
				donVi: DON_VI.kdBac,
				nguoiMo: NGUOI["quan-tri"],
				nac: "an",
			});
			const [id] = await gieoDongNhap(cuoc, [
				{ loai: "muc-tieu-moi", khoa: "m1", ten: "Mục tiêu ẩn" },
			]);
			const cTruong = cookie["truong-phong-ban"];
			const cau = (tra: TraLoi) => [tra.status, tra.loi];
			for (const duong of DUONG) {
				const danhSach = (cuocSoanId: string) =>
					goiSoan(app, "soanDanhSach", duong, { cuocSoanId }, cTruong);
				const quyet = (deXuatId: string) =>
					goiSoan(app, "soanQuyet", duong, { deXuatId, quyet: "bac" }, cTruong);
				expect(cau(await danhSach(cuoc.id))).toEqual(
					cau(await danhSach("khong-co")),
				);
				expect(cau(await danhSach(cuoc.id))).toEqual([
					404,
					OKR.thongDiep.soan.khongCoCuoc,
				]);
				expect(cau(await quyet(id ?? ""))).toEqual([
					404,
					OKR.thongDiep.soan.khongCoDong(id ?? ""),
				]);
				expect(
					doc(
						"soanDanhSach",
						await goiSoan(
							app,
							"soanDanhSach",
							duong,
							{ cuocSoanId: cuoc.id },
							cQuanTri,
						),
					),
				).toBe("mo");
			}
			expect(await trangThaiDongNhap(id ?? "")).toBe("cho");
			await xoaCuoc(cuoc.id);
			expect(mt("q4-kd-bac-1")).toContain("mau-okr-");
		},
		CHO_DB,
	);
});
