import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { OKR } from "../src/okr/okr-config";
import {
	batDauMau,
	CHO_DB,
	CHO_MA_TRAN,
	doiDauVao,
	dongMau,
	dungUngDung,
	ghiCauHinh,
	gieoDong,
	goi,
	goiRest,
	ketThucMau,
	kr,
	mt,
	NAC_CAU_HINH,
	ok,
	phienMau,
	type TraLoi,
	trangThaiDong,
	type Vao,
} from "./tro-ly-okr-san";

const NGUOI = {
	"quan-tri": "le-hai-dang",
	"truong-phong-ban": "nguyen-thi-lan",
	"phu-trach-kr": "do-minh-khoa",
	"thanh-vien": "bui-quang-huy",
	"vai-okr": "giang-hai-yen",
} as const;
type Nguoi = keyof typeof NGUOI;

const DICH = {
	"muc-tieu-onehub": { objectiveId: mt("n1") },
	"muc-tieu-phong-ban": { objectiveId: mt("q4-kd-bac-1") },
	"kr-phong-ban": {
		objectiveId: mt("q4-kd-bac-1"),
		keyResultId: kr("q4-kd-bac-1-k2"),
	},
} as const;
type Dich = keyof typeof DICH;

const NAC = ["tat", "an", "bat"] as const;
type Nac = (typeof NAC)[number];

const CACH = ["nhan", "sua", "bac", "bo-qua"] as const;
type Cach = (typeof CACH)[number];
const THU_TUC = [
	"troLySanSang",
	"troLyDeXuat",
	"troLyDanhSach",
	...CACH.map((c) => `troLyQuyet:${c}` as const),
] as const;
type ThuTuc = (typeof THU_TUC)[number];
const DUONG = ["trpc", "rest"] as const;
type Duong = (typeof DUONG)[number];

const SUA_DUOC = {
	"muc-tieu-onehub": ["quan-tri"],
	"muc-tieu-phong-ban": ["truong-phong-ban"],
	"kr-phong-ban": ["truong-phong-ban"],
} satisfies Record<Dich, readonly Nguoi[]>;
const DOC_DANH_SACH = {
	"muc-tieu-onehub": ["quan-tri"],
	"muc-tieu-phong-ban": ["truong-phong-ban", "phu-trach-kr"],
	"kr-phong-ban": ["truong-phong-ban"],
} satisfies Record<Dich, readonly Nguoi[]>;
const NHO_DUOC = {
	"muc-tieu-onehub": ["quan-tri"],
	"muc-tieu-phong-ban": ["truong-phong-ban", "phu-trach-kr"],
	"kr-phong-ban": ["truong-phong-ban"],
} satisfies Record<Dich, readonly Nguoi[]>;
const LY_DO_NAC = { tat: "tat", an: "don-vi-chua-bat" } as const;

type KyVong = "bat" | "403" | { lyDo: string };

function kyVong(nguoi: Nguoi, dich: Dich, nac: Nac, thuTuc: ThuTuc): KyVong {
	const duoc: readonly Nguoi[] =
		thuTuc === "troLyDanhSach"
			? DOC_DANH_SACH[dich]
			: thuTuc === "troLySanSang" || thuTuc === "troLyDeXuat"
				? NHO_DUOC[dich]
				: SUA_DUOC[dich];
	if (!duoc.includes(nguoi)) return "403";
	return nac === "bat" ? "bat" : { lyDo: LY_DO_NAC[nac] };
}

const REST = {
	troLySanSang: ["GET", "/okr/objectives/{objectiveId}/assistant"],
	troLyDeXuat: ["POST", "/okr/objectives/{objectiveId}/assistant/run"],
	troLyDanhSach: ["GET", "/okr/objectives/{objectiveId}/assistant/suggestions"],
	troLyQuyet: ["POST", "/okr/assistant/suggestions/{deXuatId}/decision"],
} as const;

const HAU_TO = [
	"rõ từng tuần",
	"đo được ở mọi tuyến",
	"gọn cho người đọc",
	"nói đúng kết quả",
	"dễ theo dõi hơn",
];
const MA_HOI = [
	"khong-do-duoc",
	"trung-y",
	"muc-tieu-la-so",
	"thieu-doi-trong",
	"kr-la-viec",
] as const;

const KR_DOI = {
	"muc-tieu-onehub": kr("n1-k3"),
	"muc-tieu-phong-ban": kr("q4-kd-bac-1-k3"),
	"kr-phong-ban": kr("q4-kd-bac-1-k3"),
} satisfies Record<Dich, string>;

type KhoDong = {
	vietLaiDuTru: string;
	hoiDuTru: string;
	moi: Record<Cach, Record<Duong, string>>;
	truong: "title" | "kr.title";
	truoc: string;
};

let app: NestExpressApplication;
const cookie = {} as Record<Nguoi, string>;
let cookieQuanTri = "";
const kho = {} as Record<Dich, KhoDong>;
let dongKr1: string[] = [];

async function gieoKho(dich: Dich): Promise<KhoDong> {
	const d = DICH[dich];
	const krId = "keyResultId" in d ? d.keyResultId : null;
	const truoc = krId
		? (
				await db.okrKeyResult.findUniqueOrThrow({
					where: { id: krId },
					select: { title: true },
				})
			).title
		: (
				await db.okrObjective.findUniqueOrThrow({
					where: { id: d.objectiveId },
					select: { title: true },
				})
			).title;
	const truong = krId ? "kr.title" : "title";
	const vietLai = HAU_TO.map((h) =>
		dongMau({
			loai: "viet-lai",
			objectiveId: d.objectiveId,
			keyResultId: krId,
			truong,
			truoc,
			sau: `${truoc}, ${h}`,
		}),
	);
	const hoi = MA_HOI.map((maVanDe) =>
		dongMau({
			loai: "hoi",
			objectiveId: d.objectiveId,
			keyResultId: krId,
			maVanDe,
			lyDo: "Câu hỏi giúp làm rõ cách đo.",
		}),
	);
	const idVietLai = await gieoDong(d.objectiveId, krId, vietLai);
	await doiDauVao(app, cookie[SUA_DUOC[dich][0] ?? "quan-tri"], KR_DOI[dich]);
	const idHoi = await gieoDong(d.objectiveId, krId, hoi);
	const [v0, v1, v2, v3, v4] = idVietLai as [
		string,
		string,
		string,
		string,
		string,
	];
	const [h0, h1, h2, h3, h4] = idHoi as [
		string,
		string,
		string,
		string,
		string,
	];
	return {
		vietLaiDuTru: v4,
		hoiDuTru: h4,
		truong,
		truoc,
		moi: {
			nhan: { trpc: v0, rest: v1 },
			sua: { trpc: v2, rest: v3 },
			bac: { trpc: h0, rest: h1 },
			"bo-qua": { trpc: h2, rest: h3 },
		},
	};
}

async function hoanLai(dich: Dich) {
	const d = DICH[dich];
	const k = kho[dich];
	const chu = cookie[SUA_DUOC[dich][0] ?? "quan-tri"];
	const tra =
		"keyResultId" in d
			? await goi(
					app,
					"okr.updateKeyResult",
					"mutation",
					{ id: d.keyResultId, title: k.truoc },
					chu,
				)
			: await goi(
					app,
					"okr.updateObjective",
					"mutation",
					{ id: d.objectiveId, title: k.truoc },
					chu,
				);
	ok(tra, `hoan lai ${dich}`);
}

function doc(thuTuc: ThuTuc, tra: TraLoi): KyVong | string {
	if (tra.status === 403) return "403";
	if (tra.status !== 200) return `http ${tra.status} ${tra.loi}`;
	const data = tra.data as {
		bat?: boolean;
		ok?: boolean;
		lyDo?: string | null;
	};
	if (thuTuc === "troLySanSang" || thuTuc === "troLyDeXuat")
		return data.bat === true ? "bat" : { lyDo: String(data.lyDo) };
	if (thuTuc === "troLyDanhSach")
		return data.lyDo === null ? "bat" : { lyDo: String(data.lyDo) };
	return data.ok === true ? "bat" : { lyDo: String(data.lyDo) };
}

async function goiO(
	nguoi: Nguoi,
	dich: Dich,
	nac: Nac,
	thuTuc: ThuTuc,
	duong: Duong,
): Promise<TraLoi> {
	const d = DICH[dich];
	const c = cookie[nguoi];
	if (!thuTuc.startsWith("troLyQuyet")) {
		const ten = thuTuc as Exclude<ThuTuc, `troLyQuyet:${string}`>;
		const loai = ten === "troLyDeXuat" ? "mutation" : "query";
		if (duong === "trpc") return goi(app, `okr.${ten}`, loai, d, c);
		const [method, path] = REST[ten];
		return goiRest(app, method, path, d, c);
	}
	const cach = thuTuc.split(":")[1] as Cach;
	const k = kho[dich];
	const duocQuyet = kyVong(nguoi, dich, nac, thuTuc) === "bat";
	const deXuatId = duocQuyet
		? k.moi[cach][duong]
		: cach === "bo-qua"
			? k.hoiDuTru
			: k.vietLaiDuTru;
	const vao: Vao = {
		deXuatId,
		cach,
		giaTri: cach === "sua" ? `${k.truoc}, bản người gõ ${duong}` : undefined,
	};
	const tra =
		duong === "trpc"
			? await goi(app, "okr.troLyQuyet", "mutation", vao, c)
			: await goiRest(app, REST.troLyQuyet[0], REST.troLyQuyet[1], vao, c);
	if (duocQuyet && (cach === "nhan" || cach === "sua")) await hoanLai(dich);
	return tra;
}

beforeAll(async () => {
	await batDauMau();
	app = await dungUngDung();
	for (const [khoa, ma] of Object.entries(NGUOI) as [Nguoi, string][])
		cookie[khoa] = await phienMau(ma);
	cookieQuanTri = cookie["quan-tri"];
	await ghiCauHinh(app, cookieQuanTri, NAC_CAU_HINH.bat);
	for (const dich of Object.keys(DICH) as Dich[])
		kho[dich] = await gieoKho(dich);
	const k1 = kr("q4-kd-bac-1-k1");
	const tenK1 = (
		await db.okrKeyResult.findUniqueOrThrow({
			where: { id: k1 },
			select: { title: true },
		})
	).title;
	dongKr1 = await gieoDong(mt("q4-kd-bac-1"), k1, [
		dongMau({
			loai: "viet-lai",
			objectiveId: mt("q4-kd-bac-1"),
			keyResultId: k1,
			truong: "kr.title",
			truoc: tenK1,
			sau: `${tenK1}, rõ từng tuần`,
		}),
		dongMau({
			loai: "hoi",
			objectiveId: mt("q4-kd-bac-1"),
			keyResultId: k1,
			maVanDe: "trung-y",
			lyDo: "Câu hỏi giúp làm rõ cách đo.",
		}),
	]);
}, CHO_DB);

afterAll(async () => {
	await ketThucMau(app);
}, CHO_DB);

describe("ma-tran-quyen", () => {
	test(
		"5 người × 3 đích × 3 nấc × 7 thủ tục × 2 đường: mỗi ô đúng kỳ vọng viết trước",
		async () => {
			const lech: string[] = [];
			const bacKhongQuyen: string[] = [];
			let soKhangDinh = 0;
			for (const nac of NAC) {
				await ghiCauHinh(app, cookieQuanTri, NAC_CAU_HINH[nac]);
				for (const nguoi of Object.keys(NGUOI) as Nguoi[])
					for (const dich of Object.keys(DICH) as Dich[])
						for (const thuTuc of THU_TUC)
							for (const duong of DUONG) {
								const tra = await goiO(nguoi, dich, nac, thuTuc, duong);
								const ky = kyVong(nguoi, dich, nac, thuTuc);
								const thay = doc(thuTuc, tra);
								soKhangDinh += 1;
								if (JSON.stringify(thay) !== JSON.stringify(ky))
									lech.push(
										`o lech: ${nguoi} x ${dich} x ${nac} x ${thuTuc} x ${duong} — can ${JSON.stringify(ky)}, thay ${JSON.stringify(thay)}`,
									);
								const cach = thuTuc.split(":")[1];
								if (ky === "403" && (cach === "bac" || cach === "bo-qua")) {
									const id =
										cach === "bo-qua"
											? kho[dich].hoiDuTru
											: kho[dich].vietLaiDuTru;
									if ((await trangThaiDong(id)) !== "cho")
										bacKhongQuyen.push(
											`bac khong quyen: ${nguoi} (${cach} ${dich})`,
										);
								}
							}
			}
			const soO =
				Object.keys(NGUOI).length * Object.keys(DICH).length * NAC.length;
			const tong = soO * THU_TUC.length * DUONG.length;
			console.log(
				`ma-tran-quyen: ${soO} o × ${THU_TUC.length} thu tuc (quyet dem bon cach) × ${DUONG.length} duong = ${tong}; da khang dinh ${soKhangDinh}`,
			);
			expect(bacKhongQuyen).toEqual([]);
			expect(lech).toEqual([]);
			expect(soKhangDinh, "so khang dinh lech so o").toBe(tong);
		},
		CHO_MA_TRAN,
	);

	test(
		"doi-chung-duong: người phụ trách KR nhận đúng tập id dòng của KR đó qua hai đường",
		async () => {
			await ghiCauHinh(app, cookieQuanTri, NAC_CAU_HINH.bat);
			const vao = { objectiveId: mt("q4-kd-bac-1") };
			const c = cookie["phu-trach-kr"];
			const qua = [
				await goi(app, "okr.troLyDanhSach", "query", vao, c),
				await goiRest(app, "GET", REST.troLyDanhSach[1], vao, c),
			];
			for (const tra of qua) {
				const ds = ok<{ dong: { id: string }[] }>(tra, "danh sach phu trach");
				expect(new Set(ds.dong.map((d) => d.id))).toEqual(new Set(dongKr1));
			}
			const sanSang = ok<{ bat: boolean }>(
				await goi(
					app,
					"okr.troLySanSang",
					"query",
					{ ...vao, keyResultId: kr("q4-kd-bac-1-k1") },
					c,
				),
				"san sang KR cua minh",
			);
			expect(sanSang.bat).toBe(true);
		},
		CHO_DB,
	);

	test(
		"kiem-lai: số trong câu mới không còn trong ô số KR → troLyDanhSach không trả dòng, dòng vẫn 'cho'",
		async () => {
			await ghiCauHinh(app, cookieQuanTri, NAC_CAU_HINH.bat);
			const objectiveId = mt("q4-kd-bac-1");
			const k3 = kr("q4-kd-bac-1-k3");
			const kr3 = await db.okrKeyResult.findUniqueOrThrow({
				where: { id: k3 },
				select: { title: true, targetValue: true },
			});
			const dich = kr3.targetValue.toNumber();
			const [coSo, doiChung] = (await gieoDong(objectiveId, k3, [
				dongMau({
					loai: "viet-lai",
					objectiveId,
					keyResultId: k3,
					truong: "kr.title",
					truoc: kr3.title,
					sau: `${kr3.title} đạt ${dich}%`,
				}),
				dongMau({
					loai: "hoi",
					objectiveId,
					keyResultId: k3,
					maVanDe: "trung-y",
					lyDo: "Câu hỏi giúp làm rõ cách đo.",
				}),
			])) as [string, string];
			const c = cookie["truong-phong-ban"];
			const vao = { objectiveId, keyResultId: k3 };
			const truoc = ok<{ dong: { id: string }[] }>(
				await goi(app, "okr.troLyDanhSach", "query", vao, c),
				"danh sach truoc",
			);
			expect(new Set(truoc.dong.map((d) => d.id))).toEqual(
				new Set([coSo, doiChung]),
			);
			ok(
				await goi(
					app,
					"okr.updateKeyResult",
					"mutation",
					{
						id: k3,
						targetValue: dich + 5,
						lyDoDoiDich: "Điều chỉnh đích theo số thật của quý",
					},
					c,
				),
				"doi dich k3",
			);
			const sau = await db.okrKeyResult.findUniqueOrThrow({
				where: { id: k3 },
				select: { startValue: true, targetValue: true, currentValue: true },
			});
			expect(
				[sau.startValue, sau.targetValue, sau.currentValue].map((x) =>
					x.toNumber(),
				),
			).not.toContain(dich);
			for (const tra of [
				await goi(app, "okr.troLyDanhSach", "query", vao, c),
				await goiRest(app, "GET", REST.troLyDanhSach[1], vao, c),
			]) {
				const ds = ok<{ dong: { id: string }[] }>(tra, "danh sach sau");
				const ids = ds.dong.map((d) => d.id);
				expect(ids.includes(coSo), "doc lai khong kiem lai (api)").toBe(false);
				expect(ids).toContain(doiChung);
			}
			expect(await trangThaiDong(coSo)).toBe("cho");
		},
		CHO_DB,
	);

	test(
		"mat-muc-tieu: Mục tiêu đã bỏ hay đã xoá → troLyDanhSach trả rỗng, không ném; người không sửa được vẫn 403 trước",
		async () => {
			await ghiCauHinh(app, cookieQuanTri, NAC_CAU_HINH.bat);
			const goc = await db.okrObjective.findUniqueOrThrow({
				where: { id: mt("q4-kd-bac-1") },
				select: {
					cycleId: true,
					level: true,
					divisionId: true,
					departmentId: true,
					personUserId: true,
					ownerUserId: true,
					kind: true,
				},
			});
			const taoCoDong = async (ma: string) => {
				const moi = await db.okrObjective.create({
					data: {
						...goc,
						id: mt(ma),
						status: "cong-bo",
						title: `Mục tiêu thử ${ma}`,
					},
				});
				const ids = await gieoDong(moi.id, null, [
					dongMau({
						loai: "viet-lai",
						objectiveId: moi.id,
						truong: "title",
						truoc: moi.title,
						sau: `${moi.title}, rõ từng tuần`,
					}),
				]);
				return { objectiveId: moi.id, ids };
			};
			const truong = cookie["truong-phong-ban"];
			const rong = {
				dong: [],
				dangSoan: false,
				maKetThuc: null,
				docLuc: null,
				lyDo: null,
			};

			const bo = await taoCoDong("mat-da-bo");
			ok(
				await goi(
					app,
					"okr.dropObjective",
					"mutation",
					{ id: bo.objectiveId },
					truong,
				),
				"bo muc tieu",
			);
			const xoa = await taoCoDong("mat-da-xoa");
			await db.okrObjective.delete({ where: { id: xoa.objectiveId } });

			for (const m of [bo, xoa]) {
				const vao = { objectiveId: m.objectiveId };
				for (const tra of [
					await goi(app, "okr.troLyDanhSach", "query", vao, truong),
					await goiRest(app, "GET", REST.troLyDanhSach[1], vao, truong),
				]) {
					expect(`${tra.status} ${tra.loi}`, "muc tieu mat ma nem").toBe(
						"200 ",
					);
					expect(tra.data).toEqual(rong);
				}
				for (const id of m.ids) expect(await trangThaiDong(id)).toBe("cho");
			}

			const khongSua = cookie["thanh-vien"];
			const boKhongSua = await goi(
				app,
				"okr.troLyDanhSach",
				"query",
				{ objectiveId: bo.objectiveId },
				khongSua,
			);
			expect(boKhongSua.status, "da-bo: 403 dung truoc rong").toBe(403);
			const xoaKhongSua = await goi(
				app,
				"okr.troLyDanhSach",
				"query",
				{ objectiveId: xoa.objectiveId },
				khongSua,
			);
			expect(xoaKhongSua.status).toBe(200);
			expect(xoaKhongSua.data).toEqual(rong);
		},
		CHO_DB,
	);

	test(
		"du-tru: mọi dòng dự trữ vẫn 'cho' sau ma trận",
		async () => {
			for (const dich of Object.keys(DICH) as Dich[]) {
				expect(await trangThaiDong(kho[dich].vietLaiDuTru)).toBe("cho");
				expect(await trangThaiDong(kho[dich].hoiDuTru)).toBe("cho");
			}
		},
		CHO_DB,
	);
});

describe("gioi-han", () => {
	test(
		"gioi-han: Mục tiêu đổi sang giới hạn sau khi có đề xuất — người không xem được nhận danh sách rỗng như mã không có, sẵn sàng và xếp việc 404 cùng câu với mã không có, quyết 404 như mã đề xuất không có; người xem được vẫn thấy dòng",
		async () => {
			const goc = await db.okrObjective.findUniqueOrThrow({
				where: { id: mt("q4-kd-bac-1") },
				select: {
					cycleId: true,
					level: true,
					divisionId: true,
					departmentId: true,
					personUserId: true,
					ownerUserId: true,
					kind: true,
				},
			});
			const id = mt("gioi-han-de-xuat");
			const tieuDe = "Mục tiêu giới hạn thử";
			await db.okrObjective.create({
				data: { ...goc, id, status: "cong-bo", title: tieuDe },
			});
			try {
				const [dongId = ""] = await gieoDong(id, null, [
					dongMau({
						loai: "viet-lai",
						objectiveId: id,
						truong: "title",
						truoc: tieuDe,
						sau: `${tieuDe}, rõ từng tuần`,
					}),
				]);
				await db.okrObjective.update({
					where: { id },
					data: { hienThi: "gioi-han" },
				});
				const vao = { objectiveId: id };
				const thay = await goi(
					app,
					"okr.troLyDanhSach",
					"query",
					vao,
					cookie["truong-phong-ban"],
				);
				expect(`${thay.status} ${thay.loi}`).toBe("200 ");
				expect(
					(thay.data as { dong: { id: string }[] }).dong.map((d) => d.id),
				).toEqual([dongId]);
				const rong = {
					dong: [],
					dangSoan: false,
					maKetThuc: null,
					docLuc: null,
					lyDo: null,
				};
				const khongThay = `404 ${OKR.thongDiep.khongThayMucTieu}`;
				const ra: Record<string, string> = {};
				for (const ai of ["thanh-vien", "vai-okr"] as const) {
					const c = cookie[ai];
					for (const tra of [
						await goi(app, "okr.troLyDanhSach", "query", vao, c),
						await goiRest(app, "GET", REST.troLyDanhSach[1], vao, c),
					]) {
						expect(`${tra.status} ${tra.loi}`).toBe("200 ");
						expect(tra.data).toEqual(rong);
					}
					for (const [ten, loai] of [
						["okr.troLySanSang", "query"],
						["okr.troLyDeXuat", "mutation"],
					] as const) {
						ra[`${ai} ${ten}`] = [
							await goi(app, ten, loai, vao, c),
							await goi(app, ten, loai, { objectiveId: mt("khong-co") }, c),
						]
							.map((t) => `${t.status} ${t.loi}`)
							.join(" | ");
					}
					const quyet = await goi(
						app,
						"okr.troLyQuyet",
						"mutation",
						{ deXuatId: dongId, cach: "bac" },
						c,
					);
					ra[`${ai} okr.troLyQuyet`] = `${quyet.status} ${quyet.loi}`;
				}
				const hai = `${khongThay} | ${khongThay}`;
				const quyetKhong = `404 ${OKR.thongDiep.troLy.khongCoDeXuat(dongId)}`;
				expect(ra).toEqual({
					"thanh-vien okr.troLySanSang": hai,
					"thanh-vien okr.troLyDeXuat": hai,
					"thanh-vien okr.troLyQuyet": quyetKhong,
					"vai-okr okr.troLySanSang": hai,
					"vai-okr okr.troLyDeXuat": hai,
					"vai-okr okr.troLyQuyet": quyetKhong,
				});
				expect(await trangThaiDong(dongId)).toBe("cho");
			} finally {
				await db.okrDeXuat.deleteMany({ where: { objectiveId: id } });
				await db.okrObjective.delete({ where: { id } });
			}
		},
		CHO_DB,
	);
});
