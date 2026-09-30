import { describe, expect, test } from "bun:test";
import {
	docBoCaGopY,
	THU_MUC_CA_MAU,
} from "../../../apps/agent/evals/okr/ca-gop-y";
import type { CaGopY } from "../src/okr-ca-gop-y";
import { kiemOkr } from "../src/okr-kiem";
import {
	type GoiKiem,
	khoaDong,
	kiemDongDeXuat,
	trichSo,
} from "../src/okr-kiem-de-xuat";
import {
	type DongGopY,
	dongGopY,
	MA_LOAI_DE_XUAT,
	MA_VAN_DE,
	type MaLoaiDeXuat,
	TRO_LY_OKR_TRAN,
} from "../src/okr-tro-ly";

const BO_CA = docBoCaGopY(THU_MUC_CA_MAU);

const TEN_THANH_VIEN = ["Nguyễn Thị Hồng Nhung", "Trần Văn Bình"];

const LY_DO = "Câu cũ chưa nói điều đối tác nhận được";

function goiTuCa(ca: CaGopY): GoiKiem {
	const krs = ca.krs.map((k, i) => ({
		id: `${ca.id}-kr-${i}`,
		title: k.title,
		startValue: k.startValue,
		targetValue: k.targetValue,
		currentValue: k.startValue,
		unit: k.unit,
	}));
	const tren = ca.capTren;
	const dichCanChinh: GoiKiem["dichCanChinh"] = tren
		? [
				{ id: `${ca.id}-tren`, loai: "muc-tieu", title: tren.mucTieu.title },
				...tren.krs.map((k, i) => ({
					id: `${ca.id}-tren-kr-${i}`,
					loai: "kr" as const,
					title: k.title,
				})),
			]
		: [];
	const luatDaHoi = kiemOkr({
		title: ca.mucTieu.title,
		whyNow: ca.mucTieu.whyNow,
		keyResults: ca.krs,
	}).map((l) => ({
		ma: l.ma,
		keyResultId: l.krIndex === null ? null : (krs[l.krIndex]?.id ?? null),
	}));
	return {
		mucTieu: {
			id: `${ca.id}-mt`,
			title: ca.mucTieu.title,
			whyNow: ca.mucTieu.whyNow,
		},
		krs,
		dichCanChinh,
		luatDaHoi,
		khoaDaBac: [],
		khoaDangCho: [],
		tenThanhVien: TEN_THANH_VIEN,
		tuCam: TRO_LY_OKR_TRAN.tuCam,
	};
}

function caDau(tim: (ca: CaGopY) => boolean, ten: string): CaGopY {
	const ca = BO_CA.find(tim);
	if (!ca) throw new Error(`ca mau khong co: ${ten}`);
	return ca;
}

const coSo = (chu: string) => trichSo(chu).length > 0;

const CA_VIET_LAI = caDau((c) => c.bo === "viet-lai", "ca dau bo viet-lai");
const CA_NG = caDau((c) => c.bo === "ng", "ca dau bo ng");
const CA_CHEP = caDau(
	(c) => c.bo === "ng" && (c.capTren?.krs.some((k) => !coSo(k.title)) ?? false),
	"ca ng co kr cap tren khong so",
);
const CA_LUAT = caDau(
	(c) =>
		goiTuCa(c).luatDaHoi.some((l) =>
			(MA_VAN_DE as readonly string[]).includes(l.ma),
		),
	"ca co luat luot 7 trung ma van de",
);

type DauVaoDong = Partial<DongGopY> & Pick<DongGopY, "loai" | "objectiveId">;

function dong(d: DauVaoDong): DongGopY {
	return dongGopY.parse({
		keyResultId: null,
		truong: null,
		truoc: null,
		sau: null,
		maVanDe: null,
		targetObjectiveId: null,
		targetKeyResultId: null,
		lyDo: LY_DO,
		...d,
	});
}

function vietLaiTen(goi: GoiKiem, sau: string, them: Partial<DongGopY> = {}) {
	return dong({
		loai: "viet-lai",
		objectiveId: goi.mucTieu.id,
		truong: "title",
		truoc: goi.mucTieu.title,
		sau,
		...them,
	});
}

function vietLaiKr(goi: GoiKiem, sau: string, thu = 0) {
	const kr = goi.krs[thu];
	if (!kr) throw new Error("goi khong co kr");
	return dong({
		loai: "viet-lai",
		objectiveId: goi.mucTieu.id,
		keyResultId: kr.id,
		truong: "kr.title",
		truoc: kr.title,
		sau,
	});
}

function canChinh(
	goi: GoiKiem,
	targetObjectiveId: string | null,
	targetKeyResultId: string | null = null,
) {
	return dong({
		loai: "can-chinh",
		objectiveId: goi.mucTieu.id,
		targetObjectiveId,
		targetKeyResultId,
	});
}

function dichCua(goi: GoiKiem, loai: "muc-tieu" | "kr", thu = 0): string {
	const d = goi.dichCanChinh.filter((x) => x.loai === loai)[thu];
	if (!d) throw new Error(`goi khong co dich ${loai} thu ${thu}`);
	return d.id;
}

function doiKr(goi: GoiKiem, sua: Partial<GoiKiem["krs"][number]>): GoiKiem {
	return { ...goi, krs: goi.krs.map((k) => ({ ...k, ...sua })) };
}

type Cap = { ma: MaLoaiDeXuat; goi: GoiKiem; do: DongGopY; lanh: DongGopY };

const G = goiTuCa(CA_NG);
const SAU_LANH = "Đối tác ký mới mang về 14 tỷ đồng doanh thu";

function capLuat(): Cap {
	const goi = goiTuCa(CA_LUAT);
	const luat = goi.luatDaHoi.find((l) =>
		(MA_VAN_DE as readonly string[]).includes(l.ma),
	);
	const maKhac = MA_VAN_DE.find(
		(m) =>
			!goi.luatDaHoi.some(
				(l) => l.ma === m && l.keyResultId === luat?.keyResultId,
			),
	);
	if (!luat || !maKhac) throw new Error("ca luat khong dung duoc");
	const hoi = (maVanDe: (typeof MA_VAN_DE)[number]) =>
		dong({
			loai: "hoi",
			objectiveId: goi.mucTieu.id,
			keyResultId: luat.keyResultId,
			maVanDe,
		});
	return {
		ma: "trung-luat",
		goi,
		do: hoi(luat.ma as (typeof MA_VAN_DE)[number]),
		lanh: hoi(maKhac),
	};
}

function capChep(): Cap {
	const goi = goiTuCa(CA_CHEP);
	const krTren = goi.dichCanChinh.find(
		(d) => d.loai === "kr" && !coSo(d.title),
	);
	if (!krTren) throw new Error("ca chep khong co kr cap tren khong so");
	return {
		ma: "chep-cap-tren",
		goi,
		do: vietLaiTen(goi, krTren.title),
		lanh: vietLaiTen(goi, "Đối tác nhận hàng đúng hẹn ở mọi tuyến"),
	};
}

function capDaBac(): Cap {
	const bac = canChinh(G, dichCua(G, "muc-tieu"));
	return {
		ma: "da-bac",
		goi: { ...G, khoaDaBac: [khoaDong(bac)] },
		do: bac,
		lanh: canChinh(G, null, dichCua(G, "kr", 1)),
	};
}

function capDangCho(): Cap {
	const cho = vietLaiTen(G, SAU_LANH);
	return {
		ma: "dang-cho",
		goi: { ...G, khoaDangCho: [{ khoa: khoaDong(cho), sau: cho.sau ?? "" }] },
		do: vietLaiTen(G, SAU_LANH),
		lanh: vietLaiTen(G, "Đối tác ký mới đem lại 14 tỷ đồng doanh thu"),
	};
}

function maTran(): Cap[] {
	return [
		{
			ma: "id-ngoai-goi",
			goi: G,
			do: vietLaiTen(G, SAU_LANH, { objectiveId: "muc-tieu-khong-co" }),
			lanh: vietLaiTen(G, SAU_LANH),
		},
		{
			ma: "khong-doi",
			goi: G,
			do: vietLaiTen(G, `${G.mucTieu.title.toLowerCase()}.`),
			lanh: vietLaiTen(G, SAU_LANH),
		},
		{
			ma: "so-moi",
			goi: G,
			do: vietLaiTen(G, "Đối tác ký mới mang về 20 tỷ đồng doanh thu"),
			lanh: vietLaiTen(G, SAU_LANH),
		},
		{
			ma: "tu-cam",
			goi: G,
			do: vietLaiTen(
				G,
				"Đối tác ký mới mang về 14 tỷ đồng, xếp hạng theo doanh thu",
			),
			lanh: vietLaiTen(
				G,
				"Đối tác ký mới mang về 14 tỷ đồng theo chỉ tiêu khối",
			),
		},
		{
			ma: "noi-ve-nguoi",
			goi: G,
			do: vietLaiTen(G, SAU_LANH, {
				lyDo: "Nguyen Thi Hong Nhung da neu con so nay",
			}),
			lanh: vietLaiTen(G, SAU_LANH, { lyDo: "Chị Nhung đã nêu con số này" }),
		},
		capChep(),
		capLuat(),
		{
			ma: "dich-ngoai-tap",
			goi: G,
			do: canChinh(G, G.mucTieu.id),
			lanh: canChinh(G, dichCua(G, "muc-tieu")),
		},
		capDaBac(),
		capDangCho(),
	];
}

describe("ma-tran-bo-kiem", () => {
	test("ca mẫu đủ cho mọi cặp", () => {
		expect([CA_VIET_LAI.bo, CA_NG.bo, CA_CHEP.bo]).toEqual([
			"viet-lai",
			"ng",
			"ng",
		]);
		expect(CA_LUAT.id.length).toBeGreaterThan(0);
	});

	test("mỗi mã loại một cặp đỏ và lành trên cùng gói", () => {
		const cap = maTran();
		for (const ma of MA_LOAI_DE_XUAT) {
			if (!cap.some((c) => c.ma === ma))
				throw new Error(`ma loai chua co cap: ${ma}`);
		}
		expect(cap.length).toBe(MA_LOAI_DE_XUAT.length);
		const sai = cap.flatMap((c) => {
			const ra: string[] = [];
			const d = kiemDongDeXuat(c.do, c.goi);
			if (d.qua || d.maLoai !== c.ma)
				ra.push(`${c.ma}: dong do ra ${JSON.stringify(d)}`);
			const l = kiemDongDeXuat(c.lanh, c.goi);
			if (!l.qua) ra.push(`${c.ma}: dong lanh ra ${JSON.stringify(l)}`);
			return ra;
		});
		expect(sai).toEqual([]);
		console.log(`so cap: ${cap.length}/${MA_LOAI_DE_XUAT.length}`);
	});

	test("id đích không có trong gói là id-ngoai-goi, không phải dich-ngoai-tap", () => {
		expect(kiemDongDeXuat(canChinh(G, "dich-khong-co"), G)).toEqual({
			qua: false,
			maLoai: "id-ngoai-goi",
		});
		expect(
			kiemDongDeXuat(canChinh(G, null, dichCua(G, "muc-tieu")), G),
		).toEqual({ qua: false, maLoai: "dich-ngoai-tap" });
	});

	test("KR không có trong gói là id-ngoai-goi", () => {
		const hoi = dong({
			loai: "hoi",
			objectiveId: G.mucTieu.id,
			keyResultId: "kr-khong-co",
			maVanDe: "khong-do-duoc",
		});
		expect(kiemDongDeXuat(hoi, G)).toEqual({
			qua: false,
			maLoai: "id-ngoai-goi",
		});
	});
});

describe("so-viet-kieu-viet", () => {
	const V = goiTuCa(CA_VIET_LAI);
	const G50 = doiKr(V, { targetValue: 50 });
	const G15 = doiKr(G, { targetValue: 1.5 });
	const G5TY = doiKr(G, { targetValue: 5_000_000_000 });

	const dang: {
		ten: string;
		goi: GoiKiem;
		do: DongGopY;
		lanh: DongGopY;
	}[] = [
		{
			ten: "5 tỷ",
			goi: G,
			do: vietLaiTen(G, "Doanh thu hợp đồng mới lên 5 tỷ đồng"),
			lanh: vietLaiTen(G, "Doanh thu hợp đồng mới lên 14 tỷ đồng"),
		},
		{
			ten: "năm tỷ",
			goi: G,
			do: vietLaiTen(G, "Doanh thu hợp đồng mới lên năm tỷ đồng"),
			lanh: vietLaiTen(G, "Doanh thu hợp đồng mới lên mười bốn tỷ đồng"),
		},
		{
			ten: "50%",
			goi: G50,
			do: vietLaiTen(G50, "Triển khai CRM cho 50% đội kinh doanh"),
			lanh: vietLaiKr(G50, "Tỷ lệ thoả thuận đang chạy có trong CRM đạt 50%"),
		},
		{
			ten: "1,5",
			goi: G15,
			do: vietLaiKr(G15, "Doanh thu hợp đồng mới tăng 2,5 lần"),
			lanh: vietLaiKr(G15, "Doanh thu hợp đồng mới tăng 1,5 lần"),
		},
		{
			ten: "5 tỷ khi KR ghi 5000000000",
			goi: G5TY,
			do: vietLaiTen(G5TY, "Doanh thu hợp đồng mới đạt 5 tỷ đồng"),
			lanh: vietLaiKr(G5TY, "Doanh thu hợp đồng mới đạt 5 tỷ đồng"),
		},
	];

	test("mỗi dạng số một cặp đỏ và lành trên cùng gói", () => {
		const lot: string[] = [];
		const sai: string[] = [];
		for (const d of dang) {
			const r = kiemDongDeXuat(d.do, d.goi);
			if (r.qua) lot.push(d.ten);
			else if (r.maLoai !== "so-moi") sai.push(`${d.ten}: do ra ${r.maLoai}`);
			const l = kiemDongDeXuat(d.lanh, d.goi);
			if (!l.qua) sai.push(`${d.ten}: lanh ra ${l.maLoai}`);
		}
		if (lot.length > 0)
			throw new Error(`lot so moi: ${lot.length} (${lot.join(" · ")})`);
		expect(sai).toEqual([]);
	});

	test("bộ đọc số trả mọi số tìm thấy", () => {
		expect(
			[
				"lên 5 tỷ",
				"đạt 50%",
				"tăng 1,5 lần",
				"lên năm tỷ",
				"hai mươi đối tác",
				"5.000.000 đồng",
				"1,2 triệu và 3 nghìn",
				"miền Nam và miền Bắc",
				"từ 40 xuống 25 ngày",
				"năm trăm triệu",
				"hai trăm năm mươi đối tác",
				"tăng 3 tỷ lệ chuyển đổi",
			].map(trichSo),
		).toEqual([
			[5e9],
			[50],
			[1.5],
			[5e9],
			[20],
			[5_000_000],
			[1_200_000, 3000],
			[],
			[40, 25],
			[5e8],
			[250],
			[3],
		]);
	});
});

describe("so-doi-co", () => {
	const CA_KR_DON_VI = caDau(
		(c) => c.krs.some((k) => /tỷ/.test(k.unit) && !coSo(k.title)),
		"ca co kr don vi ty, ten khong so",
	);
	const K = goiTuCa(CA_KR_DON_VI);
	const thuKrTy = CA_KR_DON_VI.krs.findIndex(
		(k) => /tỷ/.test(k.unit) && !coSo(k.title),
	);
	const krTy = K.krs[thuKrTy];
	const L = goiTuCa(CA_LUAT);
	const G500TR = doiKr(G, { targetValue: 500_000_000 });
	const laTyLe = (k: CaGopY["krs"][number]) =>
		k.kind === "phan-tram" &&
		k.title.toLowerCase().startsWith("tỷ lệ") &&
		!coSo(k.title);
	const CA_TY_LE = caDau(
		(c) => c.krs.some(laTyLe),
		"ca co kr phan tram ten ty le",
	);
	const thuTyLe = CA_TY_LE.krs.findIndex(laTyLe);
	const T = goiTuCa(CA_TY_LE);
	const krTyLe = T.krs[thuTyLe];
	const TKhongDonVi: GoiKiem = {
		...T,
		krs: T.krs.map((k) => ({ ...k, unit: "" })),
	};
	const capTyLe = (goi: GoiKiem, ten: string) => ({
		ten,
		goi,
		do: vietLaiKr(
			goi,
			`${krTyLe?.title} đạt ${krTyLe?.targetValue} tỷ đồng`,
			thuTyLe,
		),
		lanh: vietLaiKr(
			goi,
			`${krTyLe?.title} đạt ${krTyLe?.targetValue}%`,
			thuTyLe,
		),
	});

	const cap: { ten: string; goi: GoiKiem; do: DongGopY; lanh: DongGopY }[] = [
		{
			ten: "14 tỷ thành 14 triệu",
			goi: G,
			do: vietLaiTen(G, "Doanh thu hợp đồng mới đạt 14 triệu đồng"),
			lanh: vietLaiTen(G, SAU_LANH),
		},
		{
			ten: "14 tỷ thành 14%",
			goi: G,
			do: vietLaiTen(G, "Doanh thu hợp đồng mới tăng 14%"),
			lanh: vietLaiTen(G, SAU_LANH),
		},
		{
			ten: "ô số KR đếm cuộc không cho số tỷ",
			goi: L,
			do: vietLaiKr(L, "Mang về 50 tỷ đồng từ đối tác mới"),
			lanh: vietLaiKr(L, "Đối tác mới nhận 50 cuộc gọi mỗi tuần"),
		},
		{
			ten: `${krTy?.targetValue} tỷ khi KR ghi ${krTy?.targetValue}, đơn vị tỷ`,
			goi: K,
			do: vietLaiKr(
				K,
				`${krTy?.title} đạt ${krTy?.targetValue} triệu đồng`,
				thuKrTy,
			),
			lanh: vietLaiKr(
				K,
				`${krTy?.title} đạt ${krTy?.targetValue} tỷ đồng`,
				thuKrTy,
			),
		},
		{
			ten: "năm trăm triệu",
			goi: G500TR,
			do: vietLaiKr(G500TR, "Doanh thu hợp đồng mới đạt năm trăm tỷ đồng"),
			lanh: vietLaiKr(G500TR, "Doanh thu hợp đồng mới đạt năm trăm triệu đồng"),
		},
		capTyLe(T, "KR phần trăm tên «Tỷ lệ» không cho số tỷ"),
		capTyLe(TKhongDonVi, "KR tên «Tỷ lệ» không đơn vị không cho số tỷ"),
	];

	test("số đổi cỡ là số mới; số gốc chỉ khớp ô KR có đơn vị cùng cỡ", () => {
		expect(krTy).toBeDefined();
		expect(krTyLe).toBeDefined();
		expect(cap.length).toBe(7);
		const lot: string[] = [];
		const sai: string[] = [];
		for (const c of cap) {
			const r = kiemDongDeXuat(c.do, c.goi);
			if (r.qua) lot.push(c.ten);
			else if (r.maLoai !== "so-moi") sai.push(`${c.ten}: do ra ${r.maLoai}`);
			const l = kiemDongDeXuat(c.lanh, c.goi);
			if (!l.qua) sai.push(`${c.ten}: lanh ra ${l.maLoai}`);
		}
		if (lot.length > 0)
			throw new Error(`lot so doi co: ${lot.length} (${lot.join(" · ")})`);
		expect(sai).toEqual([]);
	});
});

describe("so-bang-chu-theo-ngu-canh", () => {
	test("«năm» chỉ thời gian và «một» không theo hậu tố cỡ không phải số", () => {
		expect(
			[
				"Bứt phá doanh thu để hoàn thành chỉ tiêu năm",
				"Giữ biên lợi nhuận cuối năm",
				"Doanh thu năm nay vượt kế hoạch",
				"Đối tác ở lại trong năm 2026",
				"Tăng trưởng một cách bền vững",
				"Doanh thu tăng trong năm. Đối tác ở lại",
			].map(trichSo),
		).toEqual([[], [], [], [2026], [], []]);
	});

	test("«năm», «một» trước hậu tố cỡ hay đứng đếm vẫn là số", () => {
		expect(
			[
				"lên năm tỷ",
				"năm đối tác mới",
				"một tỷ đồng",
				"một phần trăm",
				"năm trăm triệu",
			].map(trichSo),
		).toEqual([[5e9], [5], [1e9], [1], [5e8]]);
	});

	test("so-moi theo ngữ cảnh chữ số", () => {
		const co5 = doiKr(G, { targetValue: 5 });
		const khong5 = doiKr(G, {
			startValue: 1,
			targetValue: 3,
			currentValue: 1,
		});
		expect([
			kiemDongDeXuat(
				vietLaiTen(G, "Bứt phá doanh thu để hoàn thành chỉ tiêu năm"),
				G,
			),
			kiemDongDeXuat(vietLaiTen(G, "Tăng trưởng một cách bền vững"), G),
			kiemDongDeXuat(vietLaiKr(co5, "Có năm đối tác mới ký hợp tác"), co5),
			kiemDongDeXuat(
				vietLaiKr(khong5, "Có năm đối tác mới ký hợp tác"),
				khong5,
			),
		]).toEqual([
			{ qua: true },
			{ qua: true },
			{ qua: true },
			{ qua: false, maLoai: "so-moi" },
		]);
	});

	test("danh sách ngữ cảnh chữ số ở một nguồn", () => {
		expect(TRO_LY_OKR_TRAN.soBangChu.namSauCum).toContain("chỉ tiêu");
		expect(TRO_LY_OKR_TRAN.soBangChu.hauToCo).toContain("tỷ");
	});
});

describe("tu-cam-va-nguoi", () => {
	test("từ cấm lấy từ cấu hình, gồm danh sách NG", () => {
		for (const tu of [
			"lương",
			"thưởng",
			"xếp loại",
			"xếp hạng",
			"đánh giá nhân viên",
		])
			expect(TRO_LY_OKR_TRAN.tuCam as readonly string[]).toContain(tu);
		const goi = { ...G, tuCam: ["bảo hành"] };
		expect(
			kiemDongDeXuat(
				vietLaiTen(goi, "Đối tác được bảo hành mang về 14 tỷ đồng"),
				goi,
			),
		).toEqual({ qua: false, maLoai: "tu-cam" });
	});

	test("từ cấm so theo cả chữ, không ăn vào giữa chữ khác", () => {
		const goi = { ...G, tuCam: ["run", "đợt"] };
		expect(
			kiemDongDeXuat(
				vietLaiTen(goi, "Đối tác trung thành mang về 14 tỷ đồng, đột phá"),
				goi,
			),
		).toEqual({ qua: true });
	});

	test("chữ thường của câu OKR không còn là từ cấm", () => {
		for (const tu of ["thành công", "kết nối", "khối", "chỉ tiêu"])
			expect(TRO_LY_OKR_TRAN.tuCam as readonly string[]).not.toContain(tu);
		expect(
			kiemDongDeXuat(
				vietLaiTen(G, "Tăng số cuộc kết nối thành công mỗi ngày"),
				G,
			),
		).toEqual({ qua: true });
	});

	test("một tên riêng không phải họ tên đầy đủ", () => {
		const goi = { ...G, tenThanhVien: ["Bình"] };
		expect(
			kiemDongDeXuat(
				vietLaiTen(goi, SAU_LANH, { lyDo: "Bình ổn doanh thu cho đối tác" }),
				goi,
			),
		).toEqual({ qua: true });
	});
});

describe("khoa-dong", () => {
	test("khoá theo loại dòng, không theo câu", () => {
		const kr = G.krs[0]?.id ?? "";
		expect([
			khoaDong(vietLaiTen(G, SAU_LANH)),
			khoaDong(vietLaiTen(G, "Một câu khác hẳn về 14 tỷ đồng")),
			khoaDong(vietLaiKr(G, SAU_LANH)),
			khoaDong(
				dong({
					loai: "hoi",
					objectiveId: G.mucTieu.id,
					keyResultId: kr,
					maVanDe: "kr-la-viec",
				}),
			),
			khoaDong(canChinh(G, null, dichCua(G, "kr"))),
		]).toEqual([
			`vl:${G.mucTieu.id}:-:title`,
			`vl:${G.mucTieu.id}:-:title`,
			`vl:${G.mucTieu.id}:${kr}:kr.title`,
			`hoi:${G.mucTieu.id}:${kr}:kr-la-viec`,
			`cc:${G.mucTieu.id}:${dichCua(G, "kr")}`,
		]);
	});
});
