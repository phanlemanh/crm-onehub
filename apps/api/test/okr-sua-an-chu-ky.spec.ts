import { afterAll, describe, expect, setSystemTime, test } from "bun:test";
import { db, Prisma } from "@crm/db";
import { QUAN_HE_GIU_CHU_KY } from "@crm/db/okr-chu-ky-hien";
import { moCuoc } from "@crm/db/okr-cuoc-soan";
import { chonChuKyHienTai } from "@crm/db/okr-tien-do";
import { ngayVN } from "@crm/db/onboarding-nhac";
import {
	LOAI_CHU_KY,
	PHA_CHU_KY,
	type SuaChuKyInput,
	viecChuKy,
} from "@crm/validation/okr-chu-ky";
import { THANG_CHAM } from "@crm/validation/okr-chuong-trinh";
import { KET_LUAN_CHON, NOI_MOI, OKR_HOI_Y } from "@crm/validation/okr-hoi-y";
import { diemTheoThang } from "@crm/validation/okr-khep";
import { dongSoan, hangTuDongSoan } from "@crm/validation/okr-tro-ly";
import { parseOkrVet } from "@crm/validation/okr-vet";
import { z } from "zod";
import type {
	AlignmentTreeOutput,
	CapNhatTuanOutput,
	ChuKyOutput,
	NutCanChinh,
} from "../src/okr/okr.contracts";
import { soThuTuc } from "./ma-tran-thu";
import { donSanCanhKr, mauMoi } from "./okr-canh-kr-san";
import {
	BAN_TRUOC_MAC_DINH,
	CAU_HOI_MAC_DINH,
	LOI_MO_MAC_DINH,
	SO_LIEU_MAC_DINH,
	sauGio,
} from "./okr-hoi-y-san";
import {
	donSanKhep,
	gieoMucTieuCongBo,
	keoDaiPhien,
	luc,
	sangPha,
} from "./okr-khep-san";
import {
	CHUONG_TRINH_RONG,
	dangChay,
	doc,
	goi,
	ma,
	nguoiMoi,
	ok,
	pbMoi,
	phien,
	phienCua,
	TIEN_TO,
	type TraLoi,
	taoNam,
	taoQuy,
	truongMoi,
	ungDung,
} from "./okr-san";
import {
	an,
	chan,
	choBenKiaDoiKhoa,
	datPha,
	demQuanHe,
	dungSanSuaAn,
	gieoCoMucTieu,
	gieoTheoQuanHe,
	gieoTrong,
	giuHangChuKy,
	LY_DO_AN,
	namMoi,
	type QuanHeGiu,
	tha,
} from "./okr-sua-an-san";

dungSanSuaAn();

const CHO_MS = 240_000;

const CAU = {
	quanTri: "Cần quyền quản trị để mở chu kỳ hay đổi cấu hình chương trình.",
	chiSuaTen:
		"Chu kỳ này đã có dữ liệu hoặc đã rời «Lập kế hoạch» — chỉ sửa được tên.",
	daDongKhongSua: "Chu kỳ đã đóng — không sửa được nữa.",
	daAnKhongSua: "Chu kỳ đang ẩn — hiện lại rồi mới sửa được.",
	khongTrong:
		"Chu kỳ đã có dữ liệu — không gỡ được. Ẩn chu kỳ nếu nó tạo nhầm.",
	trongThiGo: "Chu kỳ chưa có dữ liệu — gỡ nó thay vì ẩn.",
	daAn: "Chu kỳ này đã ẩn rồi.",
	chuaAn: "Chu kỳ này đang hiện — không có gì để hiện lại.",
	conQuyHien: (n: number) =>
		`Năm này còn ${n} quý đang hiện — ẩn hoặc gỡ các quý đó trước.`,
	namChaDaAn: "Năm cha đang ẩn — hiện lại năm trước.",
	hienLaiChong: (ten: string) =>
		`Chồng ngày với quý «${ten}» đang hiện — ẩn hoặc sửa quý đó trước.`,
	kyDaAn: "Chu kỳ này đã ẩn — không ghi được nữa. Hiện lại để ghi tiếp.",
	quyNgoaiNam: "Quý phải nằm trọn trong năm cha.",
	quyChong: (ten: string) => `Chồng ngày với chu kỳ «${ten}».`,
	batDauTruocKetThuc: "startsOn < endsOn",
	nghiTrongKy: "khoang nghi trong chu ky",
	khongCoChuKy: (id: string) => `Không có chu kỳ nào mang mã ${id}.`,
	lyDoThieu: "lyDo: Invalid input: expected string, received undefined",
	lyDoNgan: "lyDo: Too small: expected string to have >=10 characters",
} as const;

type SuaVao = SuaChuKyInput;
type Cycles = { cycles: ChuKyOutput[]; currentId: string | null };

const loaiChuKy = z.enum(LOAI_CHU_KY);
const phaChuKy = z.enum(PHA_CHU_KY);

const tra = (r: TraLoi) => (r.status === 200 ? "200" : `${r.status} ${r.loi}`);
const kyDb = (id: string) => db.okrCycle.findUnique({ where: { id } });
const demVet = (ids: string[]) =>
	db.okrTrail.count({ where: { cycleId: { in: ids } } });
const ngayCua = (d: Date | null) => (d === null ? null : ngayVN(d));

async function vaoSua(id: string, doi: Partial<SuaVao> = {}): Promise<SuaVao> {
	const c = await db.okrCycle.findUniqueOrThrow({ where: { id } });
	return {
		id,
		name: c.name,
		startsOn: ngayVN(c.startsOn),
		endsOn: ngayVN(c.endsOn),
		breakStartsOn: ngayCua(c.breakStartsOn),
		breakEndsOn: ngayCua(c.breakEndsOn),
		updateWeekday: c.updateWeekday,
		...doi,
	};
}

async function oDb(id: string) {
	const c = await db.okrCycle.findUniqueOrThrow({ where: { id } });
	return {
		name: c.name,
		startsOn: ngayVN(c.startsOn),
		endsOn: ngayVN(c.endsOn),
		breakStartsOn: ngayCua(c.breakStartsOn),
		breakEndsOn: ngayCua(c.breakEndsOn),
		updateWeekday: c.updateWeekday,
	};
}

async function tuChoi(
	ca: string,
	ids: string[],
	lam: () => Promise<TraLoi>,
	mong: string,
): Promise<void> {
	const truoc = await Promise.all(ids.map(kyDb));
	const vet = await demVet(ids);
	const r = await lam();
	expect(
		{
			ca,
			tra: tra(r),
			ky: await Promise.all(ids.map(kyDb)),
			vet: await demVet(ids),
		},
		ca,
	).toEqual({ ca, tra: mong, ky: truoc, vet });
}

function lechCa<T extends { ca: string }>(thuc: T[], mong: T[]) {
	return thuc.flatMap((t, i) =>
		Bun.deepEquals(t, mong[i]) ? [] : [{ ca: t.ca, thuc: t, mong: mong[i] }],
	);
}

async function viecTuDb(id: string) {
	const c = await db.okrCycle.findUniqueOrThrow({ where: { id } });
	const dem = await demQuanHe(id);
	const quyConHien = await db.okrCycle.count({
		where: { parentId: id, anLuc: null },
	});
	return {
		viec: viecChuKy({
			phase: phaChuKy.parse(c.phase),
			kind: loaiChuKy.parse(c.kind),
			trong: Object.values(dem).every((n) => n === 0),
			daAn: c.anLuc !== null,
			quyConHien,
		}),
		anLuc: c.anLuc ? c.anLuc.toISOString() : null,
		quyConHien,
	};
}

const chiCo = (dem: { [K in QuanHeGiu]: number }) =>
	Object.entries(dem)
		.filter(([, n]) => n > 0)
		.map(([q]) => q);

const laQuanHe = (q: string): q is QuanHeGiu => q in gieoTheoQuanHe;

const truongMoHinh = z.object({
	name: z.string(),
	kind: z.string(),
	type: z.string(),
	relationName: z.string().optional(),
	relationFromFields: z.array(z.string()).optional(),
});
const moHinhDuLieu = z.object({
	models: z.record(z.string(), z.object({ fields: z.array(truongMoHinh) })),
});
type TruongMoHinh = z.infer<typeof truongMoHinh>;

function phiaGiuKhoa(
	model: string,
	truong: TruongMoHinh[],
	f: TruongMoHinh,
): boolean {
	if (f.relationFromFields) return f.relationFromFields.length > 0;
	return (
		model !== "OkrCycle" ||
		truong.some((s) => s.kind === "scalar" && s.name === `${f.name}Id`)
	);
}

function quanHeTroToiChuKy(): string[] {
	const { models } = moHinhDuLieu.parse(Reflect.get(db, "_runtimeDataModel"));
	const cuaChuKy = models.OkrCycle?.fields ?? [];
	return Object.entries(models)
		.filter(([ten]) => ten !== "OkrTrail")
		.flatMap(([ten, m]) =>
			m.fields.filter(
				(f) =>
					f.kind === "object" &&
					f.type === "OkrCycle" &&
					phiaGiuKhoa(ten, m.fields, f),
			),
		)
		.map(
			(f) =>
				cuaChuKy.find(
					(g) => g.relationName === f.relationName && g.name !== f.name,
				)?.name ?? `khong-thay-phia-nguoc:${f.name}`,
		)
		.sort();
}

describe("cycles-viec", () => {
	afterAll(donSanKhep, CHO_MS);

	test(
		"cycles-viec: viec cua moi chu ky bang viecChuKy cua tinh trang dem thang tu DB; anLuc, anLyDo, quyConHien",
		async () => {
			const c1 = await gieoTrong("quy", "lap-ke-hoach");
			const c2 = await gieoTrong("quy", "lap-ke-hoach");
			await gieoCoMucTieu(c2);
			await datPha(c2, "dang-chay");
			const c3 = await gieoTrong("quy", "dang-chay");
			await gieoMucTieuCongBo(c3, [{}]);
			ok(await sangPha(c3, "cham-diem"), "c3 cham diem");
			ok(await sangPha(c3, "da-dong"), "c3 dong");
			const c4 = await gieoTrong("quy", "dang-chay");
			await gieoCoMucTieu(c4);
			await an(c4);
			const n1 = await gieoTrong("nam", "lap-ke-hoach");
			const n1q = await gieoTrong("quy", "lap-ke-hoach", n1);
			await gieoCoMucTieu(n1q);
			const theoQuanHe: [string, string][] = [];
			for (const q of QUAN_HE_GIU_CHU_KY) {
				const id = await gieoTrong("nam", "lap-ke-hoach");
				await gieoTheoQuanHe[q](id);
				theoQuanHe.push([`C-${q}`, id]);
			}
			const ca: [string, string][] = [
				["C1-trong-lap-ke-hoach", c1],
				["C2-co-muc-tieu-dang-chay", c2],
				["C3-da-dong", c3],
				["C4-da-an", c4],
				["N1-nam-con-mot-quy", n1],
				["N1-quy-con", n1q],
				...theoQuanHe,
			];
			const { cycles } = await doc<Cycles>("okr.cycles");
			const theoId = new Map(cycles.map((c) => [c.id, c]));
			const thuc = [];
			const mong = [];
			for (const [ten, id] of ca) {
				const k = theoId.get(id);
				thuc.push({
					ca: ten,
					id,
					viec: k?.viec,
					anLuc: k?.anLuc,
					quyConHien: k?.quyConHien,
				});
				mong.push({ ca: ten, id, ...(await viecTuDb(id)) });
			}
			expect(thuc.length).toBe(mong.length);
			expect(lechCa(thuc, mong), "ca lech viecChuKy doc tu DB").toEqual([]);
			const chiMotQuanHe = [];
			for (const [ten, id] of theoQuanHe)
				chiMotQuanHe.push({ ca: ten, co: chiCo(await demQuanHe(id)) });
			expect(chiMotQuanHe).toEqual(
				theoQuanHe.map(([ten]) => ({ ca: ten, co: [ten.slice(2)] })),
			);
			expect({
				c1: theoId.get(c1)?.viec,
				c2: theoId.get(c2)?.viec,
				c3: theoId.get(c3)?.viec,
				c4: theoId.get(c4)?.viec,
				n1An: theoId.get(n1)?.viec.an,
				n1: theoId.get(n1)?.quyConHien,
				n1q: theoId.get(n1q)?.quyConHien,
				c4AnLyDo: theoId.get(c4)?.anLyDo,
				c1AnLyDo: theoId.get(c1)?.anLyDo,
				c4AnLuc: theoId.get(c4)?.anLuc === null,
			}).toEqual({
				c1: {
					suaMoiO: true,
					suaTen: true,
					go: true,
					an: false,
					hienLai: false,
				},
				c2: {
					suaMoiO: false,
					suaTen: true,
					go: false,
					an: true,
					hienLai: false,
				},
				c3: {
					suaMoiO: false,
					suaTen: false,
					go: false,
					an: true,
					hienLai: false,
				},
				c4: {
					suaMoiO: false,
					suaTen: false,
					go: false,
					an: false,
					hienLai: true,
				},
				n1An: false,
				n1: 1,
				n1q: 0,
				c4AnLyDo: LY_DO_AN,
				c1AnLyDo: null,
				c4AnLuc: false,
			});
		},
		CHO_MS,
	);
});

describe("sua-moi-o", () => {
	test(
		"sua-moi-o: nam trong sua moi o co mot dong vet chi khoa doi; quy bi tu choi 4 ca viet truoc; chong quy da an thi ghi duoc",
		async () => {
			const n = await taoNam("sua-N", 2027);
			const nam28 = await taoNam("sua-2028", 2028);
			const q = await taoQuy("sua-Q", nam28, "2028-01-01", "2028-03-31");
			const r = await taoQuy("sua-R", nam28, "2028-04-01", "2028-06-30");
			const s = await taoQuy("sua-S", nam28, "2028-07-01", "2028-09-30");
			await gieoCoMucTieu(s);
			await an(s);
			const tenR = (await oDb(r)).name;
			const tenCuN = (await oDb(n)).name;
			const tenMoiN = ma("nam N sua");
			const moiN = {
				name: tenMoiN,
				startsOn: "2027-01-01",
				endsOn: "2027-12-30",
				breakStartsOn: "2027-02-05",
				breakEndsOn: "2027-02-12",
				updateWeekday: 3,
			};
			ok(await goi("okr.suaChuKy", { id: n, ...moiN }), "sua N");
			const vetN = await db.okrTrail.findMany({
				where: { cycleId: n, action: "sua-chu-ky" },
			});
			expect({
				o: await oDb(n),
				vet: vetN.map((v) => ({
					before: parseOkrVet(v.before),
					after: parseOkrVet(v.after),
				})),
			}).toEqual({
				o: moiN,
				vet: [
					{
						before: {
							name: tenCuN,
							endsOn: "2027-12-31",
							breakStartsOn: null,
							breakEndsOn: null,
							updateWeekday: 1,
						},
						after: {
							name: tenMoiN,
							endsOn: "2027-12-30",
							breakStartsOn: "2027-02-05",
							breakEndsOn: "2027-02-12",
							updateWeekday: 3,
						},
					},
				],
			});

			ok(
				await goi("okr.suaChuKy", await vaoSua(n, { name: tenR })),
				"ten-trung",
			);
			expect({ ca: "ten-trung", ten: (await oDb(n)).name }).toEqual({
				ca: "ten-trung",
				ten: tenR,
			});

			const TU_CHOI: { ca: string; doi: Partial<SuaVao>; cau: string }[] = [
				{
					ca: "ra-ngoai-nam-2028",
					doi: { startsOn: "2027-12-01", endsOn: "2028-02-28" },
					cau: CAU.quyNgoaiNam,
				},
				{
					ca: "chong-quy-R",
					doi: { startsOn: "2028-03-01", endsOn: "2028-04-15" },
					cau: CAU.quyChong(tenR),
				},
				{
					ca: "ngay-dau-bang-ngay-cuoi",
					doi: { startsOn: "2028-02-01", endsOn: "2028-02-01" },
					cau: CAU.batDauTruocKetThuc,
				},
				{
					ca: "nghi-ngoai-chu-ky",
					doi: { breakStartsOn: "2028-04-02", breakEndsOn: "2028-04-05" },
					cau: CAU.nghiTrongKy,
				},
			];
			let soCa = 0;
			for (const { ca, doi, cau } of TU_CHOI) {
				const vao = await vaoSua(q, doi);
				await tuChoi(ca, [q], () => goi("okr.suaChuKy", vao), `400 ${cau}`);
				soCa += 1;
			}
			expect(soCa).toBe(4);

			const r2 = await goi(
				"okr.suaChuKy",
				await vaoSua(q, { startsOn: "2028-07-15", endsOn: "2028-08-31" }),
			);
			expect({
				ca: "chong-quy-S-da-an",
				tra: tra(r2),
				ngay: [(await oDb(q)).startsOn, (await oDb(q)).endsOn],
			}).toEqual({
				ca: "chong-quy-S-da-an",
				tra: "200",
				ngay: ["2028-07-15", "2028-08-31"],
			});
		},
		CHO_MS,
	);
});

describe("sua-ten", () => {
	test(
		"sua-ten: ba chu ky chi sua duoc ten x 4 ca = 12; kem o khac bi tu choi khong ghi nua chung; da dong, da an bi tu choi",
		async () => {
			const d = await gieoTrong("quy", "lap-ke-hoach");
			await gieoCoMucTieu(d);
			await datPha(d, "dang-chay");
			const e = await gieoTrong("quy", "dang-chay");
			const f = await gieoTrong("quy", "cham-diem");
			const ba: [string, string][] = [
				["D-co-muc-tieu-dang-chay", d],
				["E-trong-dang-chay", e],
				["F-trong-cham-diem", f],
			];
			const co = [];
			for (const [ten, id] of ba) {
				const { viec } = await viecTuDb(id);
				co.push({ ten, suaMoiO: viec.suaMoiO, suaTen: viec.suaTen });
			}
			expect(co).toEqual(
				ba.map(([ten]) => ({ ten, suaMoiO: false, suaTen: true })),
			);

			let soCa = 0;
			for (const [ten, id] of ba) {
				const cu = await oDb(id);
				const y = cu.startsOn.slice(0, 4);
				const KEM: { ca: string; doi: Partial<SuaVao> }[] = [
					{ ca: "kem-endsOn", doi: { endsOn: `${y}-03-30` } },
					{
						ca: "kem-khoang-nghi",
						doi: { breakStartsOn: `${y}-02-01`, breakEndsOn: `${y}-02-07` },
					},
					{ ca: "kem-thu-cap-nhat", doi: { updateWeekday: 5 } },
				];
				for (const { ca, doi } of KEM) {
					const vao = await vaoSua(id, { name: ma("ten kem"), ...doi });
					await tuChoi(
						`${ten}/${ca}`,
						[id],
						() => goi("okr.suaChuKy", vao),
						`400 ${CAU.chiSuaTen}`,
					);
					soCa += 1;
				}
				const tenMoi = ma("chi ten");
				const vetTruoc = await db.okrTrail.count({
					where: { cycleId: id, action: "sua-chu-ky" },
				});
				const r = await goi("okr.suaChuKy", await vaoSua(id, { name: tenMoi }));
				expect({
					ca: `${ten}/chi-ten`,
					tra: tra(r),
					o: await oDb(id),
					vet:
						(await db.okrTrail.count({
							where: { cycleId: id, action: "sua-chu-ky" },
						})) - vetTruoc,
				}).toEqual({
					ca: `${ten}/chi-ten`,
					tra: "200",
					o: { ...cu, name: tenMoi },
					vet: 1,
				});
				soCa += 1;
			}
			expect(soCa).toBe(12);

			const g = await gieoTrong("quy", "da-dong");
			const h = await gieoTrong("quy", "dang-chay");
			await gieoCoMucTieu(h);
			await an(h);
			for (const [ca, id, cau] of [
				["da-dong", g, CAU.daDongKhongSua],
				["da-an", h, CAU.daAnKhongSua],
			] as const) {
				const vao = await vaoSua(id, { name: ma("ten moi") });
				await tuChoi(ca, [id], () => goi("okr.suaChuKy", vao), `400 ${cau}`);
			}
		},
		CHO_MS,
	);
});

describe("go-chu-ky", () => {
	afterAll(donSanKhep, CHO_MS);

	test("go-chu-ky: tap quan he tro toi chu ky doc tu mo hinh du lieu bang QUAN_HE_GIU_CHU_KY, moi quan he co ham gieo", () => {
		const tap = quanHeTroToiChuKy();
		expect(tap, "tap quan he lech QUAN_HE_GIU_CHU_KY").toEqual(
			[...QUAN_HE_GIU_CHU_KY].sort(),
		);
		expect(
			tap.filter((q) => !laQuanHe(q)),
			"quan he chua co ham gieo",
		).toEqual([]);
	});

	test(
		"go-chu-ky: chu ky chi co du lieu o mot quan he → 400 cau ghim, ban ghi va bang con khong doi",
		async () => {
			const tap = quanHeTroToiChuKy();
			const thuc = [];
			const mong = [];
			for (const q of tap) {
				if (!laQuanHe(q)) throw new Error(`quan he ${q} chua co ham gieo`);
				const id = await gieoTrong("nam", "lap-ke-hoach");
				await gieoTheoQuanHe[q](id);
				const truoc = { ky: await kyDb(id), dem: await demQuanHe(id) };
				const r = await goi("okr.goChuKy", { id });
				const sau = { ky: await kyDb(id), dem: await demQuanHe(id) };
				thuc.push({ ca: q, id, co: chiCo(truoc.dem), tra: tra(r), sau });
				mong.push({
					ca: q,
					id,
					co: [q],
					tra: `400 ${CAU.khongTrong}`,
					sau: truoc,
				});
			}
			expect(thuc.length).toBe(tap.length);
			expect(lechCa(thuc, mong), "quan he khong giu duoc chu ky").toEqual([]);
		},
		CHO_MS,
	);

	test(
		"go-chu-ky: G0 trong dang chay go duoc, vet go-chu-ky mang ban chup, vet tao-chu-ky van doc duoc",
		async () => {
			const g0 = await gieoTrong("quy", "dang-chay");
			const c = await db.okrCycle.findUniqueOrThrow({ where: { id: g0 } });
			ok(await goi("okr.goChuKy", { id: g0 }), "go G0");
			const vet = await db.okrTrail.findMany({
				where: { cycleId: g0 },
				orderBy: [{ at: "asc" }, { id: "asc" }],
			});
			expect({
				ky: await kyDb(g0),
				tao: vet.filter((v) => v.action === "tao-chu-ky").length,
				go: vet
					.filter((v) => v.action === "go-chu-ky")
					.map((v) => parseOkrVet(v.before)),
			}).toEqual({
				ky: null,
				tao: 1,
				go: [
					{
						name: c.name,
						kind: "quy",
						startsOn: ngayVN(c.startsOn),
						endsOn: ngayVN(c.endsOn),
						phase: "dang-chay",
					},
				],
			});
		},
		CHO_MS,
	);

	test(
		"go-chu-ky: go-sau-khi-co-du-lieu — man con thay go true, co nguoi them muc tieu truoc khi bam thi 400",
		async () => {
			const g = await gieoTrong("quy", "lap-ke-hoach");
			const truoc = (await doc<Cycles>("okr.cycles")).cycles.find(
				(k) => k.id === g,
			);
			expect(truoc?.viec.go).toBe(true);
			await gieoCoMucTieu(g);
			await tuChoi(
				"go-sau-khi-co-du-lieu",
				[g],
				() => goi("okr.goChuKy", { id: g }),
				`400 ${CAU.khongTrong}`,
			);
		},
		CHO_MS,
	);

	test(
		"go-chu-ky: go-ky-mac-dinh — go chu ky dang la currentId thi currentId doi",
		async () => {
			const y = namMoi();
			const nam = await taoNam("go-mac-dinh", y);
			const g = await taoQuy("go-mac-dinh", nam, `${y}-04-01`, `${y}-06-30`);
			await dangChay(g);
			await keoDaiPhien();
			luc(`${y}-05-15T03:00:00Z`);
			try {
				const truoc = (await doc<Cycles>("okr.cycles")).currentId;
				ok(await goi("okr.goChuKy", { id: g }), "go ky mac dinh");
				const sau = (await doc<Cycles>("okr.cycles")).currentId;
				expect({ truoc, sauLaG: sau === g }).toEqual({
					truoc: g,
					sauLaG: false,
				});
			} finally {
				setSystemTime();
			}
		},
		CHO_MS,
	);
});

describe("an-hien", () => {
	test(
		"an-hien: an can ly do 10 ky tu, pha giu nguyen, vet note = ly do; hien lai; ma tran bien 5 ca; an L roi hien K duoc",
		async () => {
			const h = await gieoTrong("quy", "lap-ke-hoach");
			await gieoCoMucTieu(h);
			await datPha(h, "dang-chay");
			await tuChoi(
				"khong-ly-do",
				[h],
				() => goi("okr.anChuKy", { id: h }),
				`400 ${CAU.lyDoThieu}`,
			);
			await tuChoi(
				"ly-do-9-ky-tu",
				[h],
				() => goi("okr.anChuKy", { id: h, lyDo: "123456789" }),
				`400 ${CAU.lyDoNgan}`,
			);
			const lyDo = "1234567890";
			ok(await goi("okr.anChuKy", { id: h, lyDo }), "an H");
			const sauAn = await db.okrCycle.findUniqueOrThrow({ where: { id: h } });
			const vetAn = await db.okrTrail.findMany({
				where: { cycleId: h, action: "an-chu-ky" },
			});
			ok(await goi("okr.hienChuKy", { id: h }), "hien H");
			const sauHien = await db.okrCycle.findUniqueOrThrow({
				where: { id: h },
			});
			expect({
				anLuc: sauAn.anLuc !== null,
				phaSauAn: sauAn.phase,
				vetAn: vetAn.map((v) => v.note),
				anLucSauHien: sauHien.anLuc,
				phaSauHien: sauHien.phase,
				vetHien: await db.okrTrail.count({
					where: { cycleId: h, action: "hien-chu-ky" },
				}),
			}).toEqual({
				anLuc: true,
				phaSauAn: "dang-chay",
				vetAn: [lyDo],
				anLucSauHien: null,
				phaSauHien: "dang-chay",
				vetHien: 1,
			});

			const trong = await gieoTrong("quy", "dang-chay");
			const daAn = await gieoTrong("quy", "dang-chay");
			await gieoCoMucTieu(daAn);
			await an(daAn);
			const namConQuy = await gieoTrong("nam", "lap-ke-hoach");
			const quyHien = await gieoTrong("quy", "lap-ke-hoach", namConQuy);
			await gieoCoMucTieu(quyHien);
			const z = await gieoTrong("nam", "lap-ke-hoach");
			const p = await gieoTrong("quy", "lap-ke-hoach", z);
			await gieoCoMucTieu(p);
			await an(p);
			await an(z);
			const w = await gieoTrong("nam", "lap-ke-hoach");
			const yW = (await oDb(w)).startsOn.slice(0, 4);
			const k = await taoQuy("an-K", w, `${yW}-01-01`, `${yW}-03-31`);
			await gieoCoMucTieu(k);
			await an(k);
			const l = await taoQuy("an-L", w, `${yW}-02-01`, `${yW}-04-30`);
			await gieoCoMucTieu(l);
			const tenL = (await oDb(l)).name;

			const BIEN: {
				ca: string;
				ids: string[];
				thuTuc: string;
				id: string;
				cau: string;
			}[] = [
				{
					ca: "an-chu-ky-trong",
					ids: [trong],
					thuTuc: "okr.anChuKy",
					id: trong,
					cau: CAU.trongThiGo,
				},
				{
					ca: "an-chu-ky-da-an",
					ids: [daAn],
					thuTuc: "okr.anChuKy",
					id: daAn,
					cau: CAU.daAn,
				},
				{
					ca: "an-nam-con-1-quy-hien",
					ids: [namConQuy, quyHien],
					thuTuc: "okr.anChuKy",
					id: namConQuy,
					cau: CAU.conQuyHien(1),
				},
				{
					ca: "hien-quy-khi-nam-cha-da-an",
					ids: [z, p],
					thuTuc: "okr.hienChuKy",
					id: p,
					cau: CAU.namChaDaAn,
				},
				{
					ca: `hien-K-chong-L-dang-hien K ${yW}-01-01→${yW}-03-31 L ${yW}-02-01→${yW}-04-30`,
					ids: [k, l],
					thuTuc: "okr.hienChuKy",
					id: k,
					cau: CAU.hienLaiChong(tenL),
				},
			];
			let soCa = 0;
			for (const b of BIEN) {
				await tuChoi(
					b.ca,
					b.ids,
					() =>
						goi(
							b.thuTuc,
							b.thuTuc === "okr.anChuKy"
								? { id: b.id, lyDo: LY_DO_AN }
								: { id: b.id },
						),
					`400 ${b.cau}`,
				);
				soCa += 1;
			}
			expect(soCa).toBe(5);

			await an(l);
			const rK = await goi("okr.hienChuKy", { id: k });
			const kSau = await db.okrCycle.findUniqueOrThrow({ where: { id: k } });
			expect({
				ca: "an-L-roi-hien-K",
				tra: tra(rK),
				anLuc: kSau.anLuc,
			}).toEqual({ ca: "an-L-roi-hien-K", tra: "200", anLuc: null });
		},
		CHO_MS,
	);

	test(
		"an-hien: hien-nam-khong-day-chuyen — hien lai nam khong hien lai quy con",
		async () => {
			const z = await gieoTrong("nam", "lap-ke-hoach");
			const p = await gieoTrong("quy", "lap-ke-hoach", z);
			await gieoCoMucTieu(p);
			await an(p);
			await an(z);
			ok(await goi("okr.hienChuKy", { id: z }), "hien nam");
			expect({
				nam: (await kyDb(z))?.anLuc ?? null,
				quyVanAn: ((await kyDb(p))?.anLuc ?? null) !== null,
			}).toEqual({ nam: null, quyVanAn: true });
		},
		CHO_MS,
	);
});

describe("quyen", () => {
	test(
		"quyen: thanh vien va vai okr goi bon thu tuc → 403, ban ghi va vet khong doi; quan tri cung dau vao → duoc",
		async () => {
			const sua = await gieoTrong("quy", "lap-ke-hoach");
			const go = await gieoTrong("quy", "lap-ke-hoach");
			const anId = await gieoTrong("quy", "lap-ke-hoach");
			await gieoCoMucTieu(anId);
			const hien = await gieoTrong("quy", "lap-ke-hoach");
			await gieoCoMucTieu(hien);
			await an(hien);
			const ids = [sua, go, anId, hien];
			const vao: [string, { [k: string]: string | number | null }][] = [
				["okr.suaChuKy", await vaoSua(sua, { name: ma("sua quyen") })],
				["okr.goChuKy", { id: go }],
				["okr.anChuKy", { id: anId, lyDo: LY_DO_AN }],
				["okr.hienChuKy", { id: hien }],
			];
			for (const ai of ["thuong", "okr"] as const)
				for (const [thuTuc, v] of vao)
					await tuChoi(
						`${ai} ${thuTuc}`,
						ids,
						() => goi(thuTuc, v, ai),
						`403 ${CAU.quanTri}`,
					);
			const quanTri = [];
			for (const [thuTuc, v] of vao)
				quanTri.push({ thuTuc, tra: tra(await goi(thuTuc, v)) });
			expect(quanTri).toEqual(vao.map(([thuTuc]) => ({ thuTuc, tra: "200" })));
		},
		CHO_MS,
	);
});

describe("ky-mac-dinh", () => {
	test(
		"ky-mac-dinh: currentId bo chu ky an; an B thi khong con A, B; quy chong A da an tao duoc; nam an thi khong tao quy; hien A thi currentId la A",
		async () => {
			await keoDaiPhien();
			const n = namMoi();
			luc(`${n}-11-18T03:00:00Z`);
			try {
				const y = await taoNam("mac-dinh-Y", n);
				const a = await taoQuy("mac-dinh-A", y, `${n}-10-01`, `${n}-12-31`);
				await gieoCoMucTieu(a);
				await dangChay(a);
				await an(a);
				const b = await taoQuy("mac-dinh-B", y, `${n}-10-15`, `${n}-12-31`);
				await gieoCoMucTieu(b);

				const dau = await doc<Cycles>("okr.cycles");
				expect(
					dau.cycles
						.filter(
							(c) =>
								c.kind === "quy" &&
								c.anLuc === null &&
								c.id !== b &&
								c.startsOn <= `${n}-11-18` &&
								`${n}-11-18` <= c.endsOn,
						)
						.map((c) => c.id),
					`quy hien khac phu ${n}-11-18 lam nhieu phep do`,
				).toEqual([]);
				expect({ ca: "B-la-mac-dinh", currentId: dau.currentId }).toEqual({
					ca: "B-la-mac-dinh",
					currentId: b,
				});

				await an(b);
				const sauAnB = await doc<Cycles>("okr.cycles");
				const conHien = sauAnB.cycles
					.filter((c) => c.anLuc === null)
					.map((c) => c.id);
				expect({
					thuocAB: [a, b].includes(sauAnB.currentId ?? ""),
					laKyConHienHoacNull:
						sauAnB.currentId === null
							? conHien.length === 0
							: conHien.includes(sauAnB.currentId),
				}).toEqual({ thuocAB: false, laKyConHienHoacNull: true });

				const moi = ok<{ id: string }>(
					await goi("okr.createCycle", {
						kind: "quy",
						name: ma("mac-dinh-chong-A"),
						parentId: y,
						startsOn: `${n}-10-01`,
						endsOn: `${n}-11-30`,
						breakStartsOn: null,
						breakEndsOn: null,
						updateWeekday: 1,
					}),
					"tao quy chong A da an",
				).id;
				ok(await goi("okr.goChuKy", { id: moi }), "go quy vua tao");

				const z = await taoNam("mac-dinh-Z", n);
				await gieoCoMucTieu(z);
				await an(z);
				const soKy = await db.okrCycle.count({ where: { parentId: z } });
				const r = await goi("okr.createCycle", {
					kind: "quy",
					name: ma("mac-dinh-trong-Z"),
					parentId: z,
					startsOn: `${n}-10-01`,
					endsOn: `${n}-12-31`,
					breakStartsOn: null,
					breakEndsOn: null,
					updateWeekday: 1,
				});
				expect({
					ca: "quy-trong-nam-da-an",
					tra: tra(r),
					soKy: await db.okrCycle.count({ where: { parentId: z } }),
				}).toEqual({
					ca: "quy-trong-nam-da-an",
					tra: `400 ${CAU.namChaDaAn}`,
					soKy,
				});

				ok(await goi("okr.hienChuKy", { id: a }), "hien A");
				expect({
					ca: "hien-A",
					currentId: (await doc<Cycles>("okr.cycles")).currentId,
				}).toEqual({ ca: "hien-A", currentId: a });
			} finally {
				setSystemTime();
			}
		},
		CHO_MS,
	);

	test(
		"ky-mac-dinh: currentId la ky chon tren dung cac chu ky chua an; khong con ky hien thi null; chi con V chua an thi V",
		async () => {
			const n = namMoi();
			const homNay = `${n}-06-15`;
			luc(`${homNay}T03:00:00Z`);
			try {
				const v = await taoNam("mac-dinh-con-V", n);
				await gieoCoMucTieu(v);
				const w = await taoQuy("mac-dinh-con-W", v, `${n}-04-01`, `${n}-06-30`);
				await gieoCoMucTieu(w);
				await an(w);
				const r = await doc<Cycles>("okr.cycles");
				const hien = r.cycles.filter((c) => c.anLuc === null);
				const daAn = r.cycles.flatMap((c) => (c.anLuc === null ? [] : [c.id]));
				expect({
					khopChonKy:
						r.currentId === (chonChuKyHienTai(hien, homNay)?.id ?? null),
					khongPhaiKyAn: !daAn.includes(r.currentId ?? ""),
					wDaAn: daAn.includes(w),
					khongConKyHien: chonChuKyHienTai([], homNay),
					chiConV: chonChuKyHienTai(
						hien.filter((c) => c.id === v),
						homNay,
					)?.id,
				}).toEqual({
					khopChonKy: true,
					khongPhaiKyAn: true,
					wDaAn: true,
					khongConKyHien: null,
					chiConV: v,
				});
			} finally {
				setSystemTime();
			}
		},
		CHO_MS,
	);
});

type Ben = {
	buoc: "khoa" | "ghi";
	id: string;
	lam: () => Promise<TraLoi>;
};
type CapGieo = {
	x: Ben;
	y: Ben;
	mong: { "x-truoc": [string, string]; "y-truoc": [string, string] };
	batBien: () => Promise<string[]>;
};
type ThuTuTha = "x-truoc" | "y-truoc";

const taoMucTieuVao = (cycleId: string) => () =>
	goi("okr.createObjective", {
		cycleId,
		unit: { level: "onehub" },
		title: ma("muc tieu dong thoi"),
		kind: "cam-ket",
		ownerUserId: phien.quan.nguoi,
		participantIds: [],
		whyNow: "",
	});

const CAP_DONG_THOI: { ten: string; gieo: () => Promise<CapGieo> }[] = [
	{
		ten: "an-nam-N-va-hien-quy-Q",
		gieo: async () => {
			const n = await gieoTrong("nam", "lap-ke-hoach");
			await gieoCoMucTieu(n);
			const q = await gieoTrong("quy", "lap-ke-hoach", n);
			await gieoCoMucTieu(q);
			await an(q);
			return {
				x: {
					buoc: "khoa",
					id: n,
					lam: () => goi("okr.anChuKy", { id: n, lyDo: LY_DO_AN }),
				},
				y: { buoc: "khoa", id: q, lam: () => goi("okr.hienChuKy", { id: q }) },
				mong: {
					"x-truoc": ["200", `400 ${CAU.namChaDaAn}`],
					"y-truoc": [`400 ${CAU.conQuyHien(1)}`, "200"],
				},
				batBien: async () => {
					const nam = await kyDb(n);
					const conHien = await db.okrCycle.count({
						where: { parentId: n, anLuc: null },
					});
					return nam?.anLuc && conHien > 0
						? [`nam ${n} da an ma con ${conHien} quy hien`]
						: [];
				},
			};
		},
	},
	{
		ten: "hien-K-va-hien-L-chong-ngay",
		gieo: async () => {
			const w = await gieoTrong("nam", "lap-ke-hoach");
			const yW = (await oDb(w)).startsOn.slice(0, 4);
			const k = await taoQuy("dt-K", w, `${yW}-01-01`, `${yW}-03-31`);
			await gieoCoMucTieu(k);
			await an(k);
			const l = await taoQuy("dt-L", w, `${yW}-02-01`, `${yW}-04-30`);
			await gieoCoMucTieu(l);
			await an(l);
			const [tenK, tenL] = [(await oDb(k)).name, (await oDb(l)).name];
			return {
				x: { buoc: "khoa", id: k, lam: () => goi("okr.hienChuKy", { id: k }) },
				y: { buoc: "khoa", id: l, lam: () => goi("okr.hienChuKy", { id: l }) },
				mong: {
					"x-truoc": ["200", `400 ${CAU.hienLaiChong(tenK)}`],
					"y-truoc": [`400 ${CAU.hienLaiChong(tenL)}`, "200"],
				},
				batBien: async () => {
					const hien = await db.okrCycle.findMany({
						where: { parentId: w, anLuc: null },
						orderBy: { id: "asc" },
					});
					return hien.flatMap((a, i) =>
						hien
							.slice(i + 1)
							.filter((b) => a.startsOn <= b.endsOn && b.startsOn <= a.endsOn)
							.map(
								(b) =>
									`hai quy hien chong ngay: ${ngayVN(a.startsOn)}→${ngayVN(a.endsOn)} va ${ngayVN(b.startsOn)}→${ngayVN(b.endsOn)}`,
							),
					);
				},
			};
		},
	},
	{
		ten: "an-C-va-tao-muc-tieu-vao-C",
		gieo: async () => {
			const c = await gieoTrong("quy", "lap-ke-hoach");
			await gieoCoMucTieu(c);
			await datPha(c, "dang-chay");
			return {
				x: {
					buoc: "khoa",
					id: c,
					lam: () => goi("okr.anChuKy", { id: c, lyDo: LY_DO_AN }),
				},
				y: { buoc: "ghi", id: c, lam: taoMucTieuVao(c) },
				mong: {
					"x-truoc": ["200", `400 ${CAU.kyDaAn}`],
					"y-truoc": ["200", "200"],
				},
				batBien: async () => {
					const ky = await kyDb(c);
					if (!ky?.anLuc) return [`chu ky ${c} khong an`];
					const sauAn = await db.okrObjective.findMany({
						where: { cycleId: c, createdAt: { gt: ky.anLuc } },
						select: { id: true },
					});
					return sauAn.map((m) => `muc tieu ${m.id} tao sau luc an ${c}`);
				},
			};
		},
	},
	{
		ten: "go-C0-va-tao-muc-tieu-vao-C0",
		gieo: async () => {
			const c0 = await gieoTrong("quy", "dang-chay");
			return {
				x: { buoc: "khoa", id: c0, lam: () => goi("okr.goChuKy", { id: c0 }) },
				y: { buoc: "ghi", id: c0, lam: taoMucTieuVao(c0) },
				mong: {
					"x-truoc": ["200", `404 ${CAU.khongCoChuKy(c0)}`],
					"y-truoc": [`400 ${CAU.khongTrong}`, "200"],
				},
				batBien: async () => {
					if (await kyDb(c0)) return [];
					const mo = await db.okrObjective.count({ where: { cycleId: c0 } });
					return mo > 0 ? [`${mo} muc tieu tro toi chu ky da go ${c0}`] : [];
				},
			};
		},
	},
];

async function chayCap(
	ten: string,
	cap: CapGieo,
	thuTu: ThuTuTha,
): Promise<{
	cap: string;
	thuTu: ThuTuTha;
	benSauDoiKhoa: boolean;
	ra: string[];
	batBien: string[];
}> {
	const [dau, sau] = thuTu === "x-truoc" ? [cap.x, cap.y] : [cap.y, cap.x];
	const daToi = chan(dau.buoc, dau.id);
	const pDau = dau.lam();
	let pSau: Promise<TraLoi> | null = null;
	let benSauDoiKhoa = false;
	try {
		await Promise.race([
			daToi,
			pDau.then((r) => {
				throw new Error(`${ten}: ben dau tra ${tra(r)} truoc khi toi moc`);
			}),
		]);
		pSau = sau.lam();
		benSauDoiKhoa = await choBenKiaDoiKhoa(pSau);
	} finally {
		tha();
	}
	const [rDau, rSau] = await Promise.all([pDau, pSau]);
	const [rx, ry] = thuTu === "x-truoc" ? [rDau, rSau] : [rSau, rDau];
	return {
		cap: ten,
		thuTu,
		benSauDoiKhoa,
		ra: [tra(rx), tra(ry)],
		batBien: await cap.batBien(),
	};
}

type ThuTuChuyen = "chuyen-xep-truoc" | "sua-xep-truoc";

async function gieoChuyenAnhEm() {
	const pbDi = await pbMoi("dt-pb-di");
	const pbDen = await pbMoi("dt-pb-den");
	const truong = await truongMoi("department", pbDi, "dt-truong");
	const nam = await gieoTrong("nam", "lap-ke-hoach");
	await gieoTrong("quy", "lap-ke-hoach", nam);
	await gieoTrong("quy", "lap-ke-hoach", nam);
	const [lo, hi] = (
		await db.okrCycle.findMany({
			where: { parentId: nam },
			orderBy: { id: "asc" },
			select: { id: true },
		})
	).map((q) => q.id);
	if (lo === undefined || hi === undefined)
		throw new Error("thieu hai quy anh em");
	const mucTieu = async (cycleId: string) =>
		ok<{ id: string }>(
			await goi(
				"okr.createObjective",
				{
					cycleId,
					unit: { level: "phong-ban", departmentId: pbDi },
					title: ma("muc tieu chuyen"),
					kind: "cam-ket",
					ownerUserId: truong.nguoi,
					participantIds: [],
					whyNow: "",
				},
				truong.cookie,
			),
			`muc tieu phong ban trong ${cycleId}`,
		).id;
	return { pbDen, lo, hi, mLo: await mucTieu(lo), mHi: await mucTieu(hi) };
}

async function chayChuyenAnhEm(thuTu: ThuTuChuyen) {
	const g = await gieoChuyenAnhEm();
	const tenMoi = ma("dt ten hi");
	const vaoSuaHi = await vaoSua(g.hi, { name: tenMoi });
	const sua = () => goi("okr.suaChuKy", vaoSuaHi);
	const chuyen = () =>
		goi("okr.chuyenDonVi", {
			objectiveIds: [g.mLo, g.mHi],
			denDonVi: { level: "phong-ban", id: g.pbDen },
		});
	const doiKhoa: boolean[] = [];
	const [dau, sau] =
		thuTu === "chuyen-xep-truoc" ? [chuyen, sua] : [sua, chuyen];
	const giu = giuHangChuKy(g.lo);
	await giu.daGiu;
	const pDau = dau();
	let pSau: Promise<TraLoi> = Promise.resolve({
		status: 0,
		data: null,
		loi: "chua goi",
	});
	try {
		doiKhoa.push(await choBenKiaDoiKhoa(pDau, "okrCycle", 1));
		pSau = sau();
		doiKhoa.push(await choBenKiaDoiKhoa(pSau, "okrCycle", 2));
	} finally {
		giu.tha();
		await giu.xong;
	}
	const [rDau, rSau] = await Promise.all([pDau, pSau]);
	const [rChuyen, rSua] =
		thuTu === "chuyen-xep-truoc" ? [rDau, rSau] : [rSau, rDau];
	const donVi = await db.okrObjective.findMany({
		where: { id: { in: [g.mLo, g.mHi] } },
		select: { departmentId: true },
	});
	return {
		thuc: {
			ca: thuTu,
			sua: tra(rSua),
			chuyen: tra(rChuyen),
			doiKhoa,
			donVi: donVi.map((d) => d.departmentId),
			tenHi: (await oDb(g.hi)).name,
		},
		mong: {
			ca: thuTu,
			sua: "200",
			chuyen: "200",
			doiKhoa: [true, true],
			donVi: [g.pbDen, g.pbDen],
			tenHi: tenMoi,
		},
	};
}

describe("dong-thoi", () => {
	test(
		"dong-thoi: chuyen-don-vi-anh-em — mot giao dich giu quy lo, chuyenDonVi va suaChuKy(hi) cung xep hang cho lo, tha: ca hai xong, khong 500, khong 40P01",
		async () => {
			const luot = [];
			for (const thuTu of ["chuyen-xep-truoc", "sua-xep-truoc"] as const)
				luot.push(await chayChuyenAnhEm(thuTu));
			expect(luot.length).toBe(2);
			expect(
				lechCa(
					luot.map((l) => l.thuc),
					luot.map((l) => l.mong),
				),
				"chuyen don vi anh em ket khoa hoac lech ket qua",
			).toEqual([]);
		},
		CHO_MS,
	);

	test(
		"dong-thoi: bon cap x hai thu tu tha = 8 luot; dung mot ben ok hoac ca hai theo thiet ke, ben kia 400/404 cau ghim; bat bien doc lai giu",
		async () => {
			const thuc = [];
			const mong = [];
			for (const { ten, gieo } of CAP_DONG_THOI)
				for (const thuTu of ["x-truoc", "y-truoc"] as const) {
					const cap = await gieo();
					thuc.push(await chayCap(ten, cap, thuTu));
					mong.push({
						cap: ten,
						thuTu,
						benSauDoiKhoa: true,
						ra: cap.mong[thuTu],
						batBien: [],
					});
				}
			expect(thuc.length).toBe(8);
			expect(
				thuc
					.flatMap((l) => l.ra)
					.filter((t) => t.startsWith("500") || t.includes("P2003")),
			).toEqual([]);
			expect(
				lechCa(
					thuc.map((l) => ({ ...l, ca: `${l.cap}/${l.thuTu}` })),
					mong.map((l) => ({ ...l, ca: `${l.cap}/${l.thuTu}` })),
				),
				"luot dong thoi lech ket qua viet truoc hoac vo bat bien",
			).toEqual([]);
		},
		CHO_MS,
	);
});

const CHO_MA_TRAN_MS = 600_000;
const LY_DO_TRA_LAI = "Chưa có KR đo khách hàng mới, sửa rồi gửi lại";
const Y_MOT = "Mở tuyến giao lạnh cho khách dược";
const Y_HAI = "Giảm thời gian giao chặng cuối";
const thangCham = z.enum(THANG_CHAM);

type LenhGhi = { goi: () => Promise<TraLoi>; doc: () => Promise<unknown> };
type Chung = {
	pb: string;
	pb2: string;
	truong: { nguoi: string; cookie: string };
	chienDich: string;
	mau: string;
};
type BenAn = {
	chung: Chung;
	canAn: string[];
	kyChay: () => Promise<string>;
	kyLap: () => Promise<string>;
	kyMoi: () => Promise<string>;
	kyCham: () => Promise<{
		cycleId: string;
		objectiveId: string;
		krIds: string[];
	}>;
	hoiYMo: () => Promise<{ hoiYId: string; y1: string; y2: string }>;
	hoiYGom: () => Promise<{
		hoiYId: string;
		y1: string;
		cSua: string;
		cGo: string;
		cKetLuan: string;
	}>;
};
type CaGhi = { gieo: (b: BenAn) => Promise<LenhGhi>; cau?: string };

function nho<T>(tao: () => Promise<T>): () => Promise<T> {
	let co: Promise<T> | null = null;
	return () => {
		co ??= tao();
		return co;
	};
}

let namCuKe = 1900;
const namCu = () => {
	namCuKe += 1;
	return namCuKe;
};

const idTra = (r: TraLoi, nhan: string) => ok<{ id: string }>(r, nhan).id;

async function namCuaKy(id: string): Promise<number> {
	const c = await db.okrCycle.findUniqueOrThrow({ where: { id } });
	return Number(ngayVN(c.startsOn).slice(0, 4));
}

function vaoKr(objectiveId: string, chu: string = phien.quan.nguoi) {
	return {
		objectiveId,
		title: ma("kr an vang"),
		kind: "tang-toi",
		ownerUserId: chu,
		startValue: 0,
		targetValue: 100,
		currentValue: 0,
		unit: "",
		dueOn: null,
		weight: 1,
	};
}

const MOC_XONG = {
	kind: "moc",
	startValue: 0,
	targetValue: 1,
	currentValue: 1,
} as const;

async function nhapCoKr(cycleId: string, kieu: Partial<typeof MOC_XONG> = {}) {
	const objectiveId = await gieoCoMucTieu(cycleId);
	const krId = idTra(
		await goi("okr.createKeyResult", { ...vaoKr(objectiveId), ...kieu }),
		"kr nhap",
	);
	return { objectiveId, krId };
}

async function nhapPhong(cycleId: string, c: Chung, coKr: boolean) {
	const objectiveId = idTra(
		await goi(
			"okr.createObjective",
			{
				cycleId,
				unit: { level: "phong-ban", departmentId: c.pb },
				title: ma("muc tieu phong an vang"),
				kind: "cam-ket",
				ownerUserId: c.truong.nguoi,
				participantIds: [],
				whyNow: "",
			},
			c.truong.cookie,
		),
		"muc tieu phong",
	);
	if (coKr)
		idTra(
			await goi(
				"okr.createKeyResult",
				vaoKr(objectiveId, c.truong.nguoi),
				c.truong.cookie,
			),
			"kr phong",
		);
	return objectiveId;
}

async function choDuyet(cycleId: string, c: Chung) {
	const id = await nhapPhong(cycleId, c, true);
	ok(await goi("okr.guiDuyet", { id }, c.truong.cookie), "gui duyet");
	return id;
}

const vaoMoHoiY = (cycleId: string) => ({
	cycleId,
	cauHoi: CAU_HOI_MAC_DINH,
	loiMo: LOI_MO_MAC_DINH,
	soLieu: SO_LIEU_MAC_DINH,
	hanLuc: sauGio(new Date(), OKR_HOI_Y.hanGio.min * 2).toISOString(),
	nguoiChonUserId: phien.chu.nguoi,
});

const moHoiYChoChu = async (cycleId: string) =>
	idTra(await goi("okr.moHoiY", vaoMoHoiY(cycleId)), "mo hoi y");

const gopYThuong = async (hoiYId: string, noiDung: string) =>
	idTra(
		await goi(
			"okr.gopY",
			{ hoiYId, noiDung, viSao: "", doBangGi: "" },
			"thuong",
		),
		"gop y",
	);

async function dongVaNiemPhong(hoiYId: string) {
	ok(await goi("okr.suaHoiY", { hoiYId, dongNgay: true }), "dong hoi y");
	ok(
		await goi("okr.niemPhong", { hoiYId, cau: BAN_TRUOC_MAC_DINH }, "chu"),
		"niem phong",
	);
}

const ketLuanChon = (chuDeId: string) =>
	goi(
		"okr.ketLuanChuDe",
		{
			chuDeId,
			ketLuan: KET_LUAN_CHON,
			lyDo: "Đúng hướng năm tới của công ty, có người làm ngay.",
			cauMucTieu: "Đưa giao lạnh thành dịch vụ có lãi",
			noiBanTruoc: NOI_MOI,
		},
		"chu",
	);

async function hoiYSanCongBo(cycleId: string): Promise<string> {
	const hoiYId = await moHoiYChoChu(cycleId);
	const y = await gopYThuong(hoiYId, Y_MOT);
	await dongVaNiemPhong(hoiYId);
	const chuDeId = idTra(
		await goi("okr.ganY", { yIds: [y], yLa: true }, "chu"),
		"gan y la",
	);
	ok(await ketLuanChon(chuDeId), "ket luan chon");
	return hoiYId;
}

const loNhap = (cycleId: string) => ({
	cycleId,
	unit: { loai: "goc" },
	text: [
		ma("nhap an vang"),
		"KR nhập",
		"mốc",
		"",
		"",
		"",
		`${phien.quan.nguoi}@thu.test`,
	].join("\t"),
});

async function dungChung(): Promise<Chung> {
	const pb = await pbMoi("an-vang");
	const pb2 = await pbMoi("an-vang-2");
	const truong = await truongMoi("department", pb, "an-vang-T");
	const view = await db.savedView.create({
		data: {
			entity: "CONTACT",
			name: ma("goc nhin"),
			shared: true,
			filters: { q: "", sort: "", dir: "asc", archived: false, filters: {} },
			ownerId: phien.quan.nguoi,
		},
	});
	const chienDich = (
		await db.campaign.create({
			data: {
				name: ma("chien dich"),
				savedViewId: view.id,
				createdById: phien.quan.nguoi,
			},
			select: { id: true },
		})
	).id;
	const mau = await mauMoi({
		ten: "mau an vang",
		cap: "phong-ban",
		donViIds: [],
		noiDung: {
			cauMucTieu: "Tăng doanh thu phòng",
			loai: "cam-ket",
			krs: [
				{
					title: "Doanh thu mới",
					kind: "tang-toi",
					unit: "triệu",
					startValue: null,
					targetValue: null,
				},
			],
		},
	});
	return { pb, pb2, truong, chienDich, mau };
}

function benMoi(chung: Chung, laX: boolean): BenAn {
	const canAn: string[] = [];
	const dangKy = (id: string) => {
		if (laX) canAn.push(id);
		return id;
	};
	const kyMoi = async () => {
		const id = dangKy(await taoNam("an-vang", namCu()));
		await gieoCoMucTieu(id);
		return id;
	};
	return {
		chung,
		canAn,
		kyMoi,
		kyChay: nho(async () => {
			const id = dangKy(await taoNam("an-vang-chay", 2026));
			await dangChay(id);
			await gieoCoMucTieu(id);
			return id;
		}),
		kyLap: nho(kyMoi),
		kyCham: nho(async () => {
			const cycleId = await kyMoi();
			await dangChay(cycleId);
			const mt = await gieoMucTieuCongBo(cycleId, [{}]);
			ok(await sangPha(cycleId, "cham-diem"), "sang cham diem");
			return { cycleId, ...mt };
		}),
		hoiYMo: nho(async () => {
			const hoiYId = await moHoiYChoChu(await kyMoi());
			return {
				hoiYId,
				y1: await gopYThuong(hoiYId, Y_MOT),
				y2: await gopYThuong(hoiYId, Y_HAI),
			};
		}),
		hoiYGom: nho(async () => {
			const hoiYId = await moHoiYChoChu(await kyMoi());
			const y1 = await gopYThuong(hoiYId, Y_MOT);
			await gopYThuong(hoiYId, Y_HAI);
			await dongVaNiemPhong(hoiYId);
			const chuDe = async (ten: string) =>
				idTra(await goi("okr.taoChuDe", { hoiYId, ten }), `chu de ${ten}`);
			return {
				hoiYId,
				y1,
				cSua: await chuDe("Giao lạnh"),
				cGo: await chuDe("Chủ đề rỗng"),
				cKetLuan: await chuDe("Chặng cuối"),
			};
		}),
	};
}

const lenh = (
	goiNay: () => Promise<TraLoi>,
	doc: () => Promise<unknown>,
): LenhGhi => ({ goi: goiNay, doc });
const mucTieuDb = (id: string) => db.okrObjective.findUnique({ where: { id } });
const krDb = (id: string) => db.okrKeyResult.findUnique({ where: { id } });
const viecCuaKr = (keyResultId: string) =>
	db.okrViecKr.findMany({ where: { keyResultId }, orderBy: { id: "asc" } });
const viecMoi = async (keyResultId: string) =>
	idTra(
		await goi("okr.themViec", {
			keyResultId,
			tieuDe: "Gọi khách",
			nguoiLamUserId: phien.quan.nguoi,
			hanNgay: null,
		}),
		"them viec",
	);
const vaoBangChung = (keyResultId: string) => ({
	keyResultId,
	url: "https://vi.du/bang-chung",
	ghiChu: "",
});
const ghiNhanMoi = (objectiveId: string) =>
	goi("okr.guiGhiNhan", {
		objectiveId,
		keyResultId: null,
		nguoiNhan: [phien.thuong.nguoi],
		loiNhan: "Cảm ơn cả nhóm",
	});
const ganCanChinh = (objectiveId: string, dich: string, c: Chung) =>
	goi(
		"okr.addAlignment",
		{ objectiveId, targetObjectiveId: dich, targetKeyResultId: null },
		c.truong.cookie,
	);
const moiTheoKy = (cycleId: string) =>
	db.okrObjective.findMany({ where: { cycleId }, orderBy: { id: "asc" } });

const DON_VI_SOAN = {
	level: "onehub",
	divisionId: null,
	departmentId: null,
} as const;
const cuocSoanMoi = (cycleId: string) =>
	moCuoc(db, {
		cycleId,
		...DON_VI_SOAN,
		nguoiMoUserId: phien.quan.nguoi,
		sessionId: ma("phien-soan"),
		nac: "bat",
	});
const cuocSoanDb = (id: string) => db.okrCuocSoan.findUnique({ where: { id } });
async function dongSoanMoi(cuoc: {
	id: string;
	sessionId: string;
	nguoiMoUserId: string;
	nac: "bat" | "an";
}): Promise<string> {
	const dong = dongSoan.parse({
		loai: "muc-tieu-moi",
		khoa: "a",
		cuocSoanId: cuoc.id,
		dich: null,
		ten: "Khách cũ quay lại đặt hàng",
		viSao: "Kỳ trước khách cũ rơi nhiều.",
		viSaoLucNay: "Kỳ trước còn trượt phần này.",
		loaiMucTieu: "cam-ket",
		canChinhId: null,
	});
	const h = await db.okrDeXuat.create({
		data: {
			...hangTuDongSoan(dong, cuoc.sessionId),
			dich: Prisma.DbNull,
			inputHash: ma("bam-soan"),
			nguoiYeuCau: cuoc.nguoiMoUserId,
			nac: cuoc.nac,
			trangThai: "cho",
			hienLuc: null,
		},
		select: { id: true },
	});
	return h.id;
}

const GHI_VAO_KY_AN = {
	createCycle: {
		cau: CAU.namChaDaAn,
		gieo: async (b) => {
			const nam = await b.kyLap();
			const y = await namCuaKy(nam);
			return lenh(
				() =>
					goi("okr.createCycle", {
						kind: "quy",
						name: ma("quy an vang"),
						parentId: nam,
						startsOn: `${y}-01-01`,
						endsOn: `${y}-03-31`,
						breakStartsOn: null,
						breakEndsOn: null,
						updateWeekday: 1,
					}),
				() =>
					db.okrCycle.findMany({
						where: { parentId: nam },
						orderBy: { id: "asc" },
					}),
			);
		},
	},
	setCyclePhase: {
		gieo: async (b) => {
			const id = await b.kyMoi();
			return lenh(
				() => goi("okr.setCyclePhase", { id, phase: "dang-chay" }),
				() => kyDb(id),
			);
		},
	},
	troLyDeXuat: {
		gieo: async (b) => {
			const objectiveId = await gieoCoMucTieu(await b.kyChay());
			return lenh(
				() => goi("okr.troLyDeXuat", { objectiveId }),
				async () => ({
					mt: await mucTieuDb(objectiveId),
					deXuat: await db.okrDeXuat.count({ where: { objectiveId } }),
				}),
			);
		},
	},
	troLyQuyet: {
		gieo: async (b) => {
			const { objectiveId, krIds } = await gieoMucTieuCongBo(await b.kyChay(), [
				{},
			]);
			const { id } = await db.okrDeXuat.create({
				data: {
					taskId: ma("task"),
					objectiveId,
					keyResultId: krIds[0] ?? null,
					loai: "hoi",
					maVanDe: "kr-la-viec",
					lyDo: "KR này đang là một việc cần làm",
					inputHash: ma("bam"),
					nguoiYeuCau: phien.quan.nguoi,
				},
			});
			return lenh(
				() => goi("okr.troLyQuyet", { deXuatId: id, cach: "bac" }),
				() => db.okrDeXuat.findUnique({ where: { id } }),
			);
		},
	},
	moRa: {
		gieo: async (b) => {
			const cycleId = await b.kyChay();
			return lenh(
				() =>
					goi("okr.moRa", {
						cycleId,
						tuNgay: "2026-02-01",
						denNgay: "2026-02-07",
					}),
				() =>
					db.okrCuaSoRa.findMany({
						where: { cycleId },
						orderBy: { id: "asc" },
					}),
			);
		},
	},
	dongRa: {
		gieo: async (b) => {
			const id = idTra(
				await goi("okr.moRa", {
					cycleId: await b.kyChay(),
					tuNgay: "2026-03-01",
					denNgay: "2026-03-07",
				}),
				"mo ra",
			);
			return lenh(
				() => goi("okr.dongRa", { id }),
				() => db.okrCuaSoRa.findUnique({ where: { id } }),
			);
		},
	},
	moHoiY: {
		gieo: async (b) => {
			const cycleId = await b.kyLap();
			return lenh(
				() => goi("okr.moHoiY", vaoMoHoiY(cycleId)),
				() => db.okrHoiY.findMany({ where: { cycleId } }),
			);
		},
	},
	suaHoiY: {
		gieo: async (b) => {
			const { hoiYId } = await b.hoiYMo();
			return lenh(
				() =>
					goi("okr.suaHoiY", {
						hoiYId,
						loiMo: `${LOI_MO_MAC_DINH} Sửa lời mở.`,
					}),
				() => db.okrHoiY.findUnique({ where: { id: hoiYId } }),
			);
		},
	},
	gopY: {
		gieo: async (b) => {
			const { hoiYId } = await b.hoiYMo();
			return lenh(
				() =>
					goi(
						"okr.gopY",
						{
							hoiYId,
							noiDung: "Chuẩn hoá hợp đồng khách lớn",
							viSao: "",
							doBangGi: "",
						},
						"thuong",
					),
				() => db.okrY.findMany({ where: { hoiYId }, orderBy: { id: "asc" } }),
			);
		},
	},
	suaY: {
		gieo: async (b) => {
			const { y1 } = await b.hoiYMo();
			return lenh(
				() =>
					goi(
						"okr.suaY",
						{
							yId: y1,
							noiDung: `${Y_MOT} và y tế`,
							viSao: "",
							doBangGi: "",
						},
						"thuong",
					),
				() => db.okrY.findUnique({ where: { id: y1 } }),
			);
		},
	},
	goY: {
		gieo: async (b) => {
			const { y2 } = await b.hoiYMo();
			return lenh(
				() => goi("okr.goY", { yId: y2 }, "thuong"),
				() => db.okrY.findUnique({ where: { id: y2 } }),
			);
		},
	},
	dongY: {
		gieo: async (b) => {
			const { y1 } = await b.hoiYMo();
			return lenh(
				() => goi("okr.dongY", { yId: y1, bat: true }),
				() => db.okrYDongY.findMany({ where: { yId: y1 } }),
			);
		},
	},
	niemPhong: {
		gieo: async (b) => {
			const { hoiYId } = await b.hoiYMo();
			return lenh(
				() => goi("okr.niemPhong", { hoiYId, cau: BAN_TRUOC_MAC_DINH }, "chu"),
				() => db.okrHoiYBanTruoc.findUnique({ where: { hoiYId } }),
			);
		},
	},
	taoChuDe: {
		gieo: async (b) => {
			const { hoiYId } = await b.hoiYGom();
			return lenh(
				() => goi("okr.taoChuDe", { hoiYId, ten: "Chủ đề mới" }),
				() =>
					db.okrChuDe.findMany({ where: { hoiYId }, orderBy: { id: "asc" } }),
			);
		},
	},
	suaChuDe: {
		gieo: async (b) => {
			const { cSua } = await b.hoiYGom();
			return lenh(
				() => goi("okr.suaChuDe", { chuDeId: cSua, ten: "Giao lạnh có lãi" }),
				() => db.okrChuDe.findUnique({ where: { id: cSua } }),
			);
		},
	},
	goChuDe: {
		gieo: async (b) => {
			const { cGo } = await b.hoiYGom();
			return lenh(
				() => goi("okr.goChuDe", { chuDeId: cGo }),
				() => db.okrChuDe.findUnique({ where: { id: cGo } }),
			);
		},
	},
	ganY: {
		gieo: async (b) => {
			const { y1, cSua } = await b.hoiYGom();
			return lenh(
				() => goi("okr.ganY", { yIds: [y1], chuDeId: cSua }),
				() => db.okrY.findUnique({ where: { id: y1 } }),
			);
		},
	},
	ketLuanChuDe: {
		gieo: async (b) => {
			const { cKetLuan } = await b.hoiYGom();
			return lenh(
				() => ketLuanChon(cKetLuan),
				() => db.okrChuDe.findUnique({ where: { id: cKetLuan } }),
			);
		},
	},
	congBo: {
		gieo: async (b) => {
			const hoiYId = await hoiYSanCongBo(await b.kyMoi());
			return lenh(
				() => goi("okr.congBo", { hoiYId }, "chu"),
				() => db.okrHoiY.findUnique({ where: { id: hoiYId } }),
			);
		},
	},
	hieuViSao: {
		gieo: async (b) => {
			const hoiYId = await hoiYSanCongBo(await b.kyMoi());
			ok(await goi("okr.congBo", { hoiYId }, "chu"), "cong bo");
			return lenh(
				() => goi("okr.hieuViSao", { hoiYId }, "thuong"),
				() => db.okrHoiYHieu.findMany({ where: { hoiYId } }),
			);
		},
	},
	chamKr: {
		gieo: async (b) => {
			const keyResultId = (await b.kyCham()).krIds[0] ?? "";
			const d = await db.okrDiemKr.findUniqueOrThrow({
				where: { keyResultId },
			});
			const diem = diemTheoThang(Number(d.diemGoiY), thangCham.parse(d.thang));
			return lenh(
				() => goi("okr.chamKr", { keyResultId, diem }),
				() => db.okrDiemKr.findUnique({ where: { keyResultId } }),
			);
		},
	},
	ghiDieuHocDuoc: {
		gieo: async (b) => {
			const { objectiveId } = await b.kyCham();
			return lenh(
				() =>
					goi("okr.ghiDieuHocDuoc", {
						objectiveId,
						noiDung: "Khách lớn cần người phụ trách riêng từ tuần đầu.",
					}),
				() => db.okrNhinLai.findUnique({ where: { objectiveId } }),
			);
		},
	},
	moLaiKy: {
		gieo: async (b) => {
			const id = await b.kyMoi();
			await dangChay(id);
			await gieoMucTieuCongBo(id, [{}]);
			ok(await sangPha(id, "cham-diem"), "sang cham diem");
			ok(await sangPha(id, "da-dong"), "dong");
			return lenh(
				() => goi("okr.moLaiKy", { id, lyDo: LY_DO_AN }),
				() => kyDb(id),
			);
		},
	},
	mangSang: {
		gieo: async (b) => {
			const { objectiveId } = await b.kyCham();
			await taoNam("an-vang-dich", namCu());
			return lenh(
				() => goi("okr.mangSang", { objectiveId }),
				() =>
					db.okrMangSang.findMany({ where: { tuObjectiveId: objectiveId } }),
			);
		},
	},
	datHienThi: {
		gieo: async (b) => {
			const objectiveId = await gieoCoMucTieu(await b.kyChay());
			return lenh(
				() =>
					goi("okr.datHienThi", {
						objectiveId,
						hienThi: "gioi-han",
						nguoiXem: [],
					}),
				() => mucTieuDb(objectiveId),
			);
		},
	},
	createObjective: {
		gieo: async (b) => {
			const cycleId = await b.kyChay();
			return lenh(
				() =>
					goi("okr.createObjective", {
						cycleId,
						unit: { level: "onehub" },
						title: ma("muc tieu moi"),
						kind: "cam-ket",
						ownerUserId: phien.quan.nguoi,
						participantIds: [],
						whyNow: "",
					}),
				() => moiTheoKy(cycleId),
			);
		},
	},
	updateObjective: {
		gieo: async (b) => {
			const id = await gieoCoMucTieu(await b.kyChay());
			return lenh(
				() => goi("okr.updateObjective", { id, title: ma("ten sua") }),
				() => mucTieuDb(id),
			);
		},
	},
	publishObjective: {
		gieo: async (b) => {
			const { objectiveId: id } = await nhapCoKr(await b.kyChay());
			return lenh(
				() => goi("okr.publishObjective", { id }),
				() => mucTieuDb(id),
			);
		},
	},
	guiDuyet: {
		gieo: async (b) => {
			const id = await nhapPhong(await b.kyChay(), b.chung, true);
			return lenh(
				() => goi("okr.guiDuyet", { id }, b.chung.truong.cookie),
				() => mucTieuDb(id),
			);
		},
	},
	duyetMucTieu: {
		gieo: async (b) => {
			const id = await choDuyet(await b.kyChay(), b.chung);
			return lenh(
				() => goi("okr.duyetMucTieu", { id }),
				() => mucTieuDb(id),
			);
		},
	},
	traLaiMucTieu: {
		gieo: async (b) => {
			const objectiveId = await choDuyet(await b.kyChay(), b.chung);
			return lenh(
				() => goi("okr.traLaiMucTieu", { objectiveId, lyDo: LY_DO_TRA_LAI }),
				() => mucTieuDb(objectiveId),
			);
		},
	},
	rutDuyet: {
		gieo: async (b) => {
			const id = await choDuyet(await b.kyChay(), b.chung);
			return lenh(
				() => goi("okr.rutDuyet", { id }, b.chung.truong.cookie),
				() => mucTieuDb(id),
			);
		},
	},
	chuyenDonVi: {
		gieo: async (b) => {
			const id = await nhapPhong(await b.kyChay(), b.chung, false);
			return lenh(
				() =>
					goi("okr.chuyenDonVi", {
						objectiveIds: [id],
						denDonVi: { level: "phong-ban", id: b.chung.pb2 },
					}),
				() => mucTieuDb(id),
			);
		},
	},
	dropObjective: {
		gieo: async (b) => {
			const id = await gieoCoMucTieu(await b.kyChay());
			return lenh(
				() => goi("okr.dropObjective", { id }),
				() => mucTieuDb(id),
			);
		},
	},
	xoaMucTieu: {
		gieo: async (b) => {
			const id = await gieoCoMucTieu(await b.kyChay());
			return lenh(
				() => goi("okr.xoaMucTieu", { id }),
				() => mucTieuDb(id),
			);
		},
	},
	dungLaiMucTieu: {
		gieo: async (b) => {
			const id = await gieoCoMucTieu(await b.kyChay());
			ok(await goi("okr.dropObjective", { id }), "bo truoc khi dung lai");
			return lenh(
				() => goi("okr.dungLaiMucTieu", { id }),
				() => mucTieuDb(id),
			);
		},
	},
	createKeyResult: {
		gieo: async (b) => {
			const objectiveId = await gieoCoMucTieu(await b.kyChay());
			return lenh(
				() => goi("okr.createKeyResult", vaoKr(objectiveId)),
				() =>
					db.okrKeyResult.findMany({
						where: { objectiveId },
						orderBy: { id: "asc" },
					}),
			);
		},
	},
	updateKeyResult: {
		gieo: async (b) => {
			const { krId } = await nhapCoKr(await b.kyChay());
			return lenh(
				() => goi("okr.updateKeyResult", { id: krId, title: ma("kr sua") }),
				() => krDb(krId),
			);
		},
	},
	removeKeyResult: {
		gieo: async (b) => {
			const { krId } = await nhapCoKr(await b.kyChay());
			return lenh(
				() => goi("okr.removeKeyResult", { id: krId }),
				() => krDb(krId),
			);
		},
	},
	addAlignment: {
		gieo: async (b) => {
			const cycleId = await b.kyChay();
			const dich = await gieoMucTieuCongBo(cycleId, [{}]);
			const nguon = await nhapPhong(cycleId, b.chung, false);
			return lenh(
				() => ganCanChinh(nguon, dich.objectiveId, b.chung),
				() => db.okrAlignment.findMany({ where: { objectiveId: nguon } }),
			);
		},
	},
	removeAlignment: {
		gieo: async (b) => {
			const cycleId = await b.kyChay();
			const dich = await gieoMucTieuCongBo(cycleId, [{}]);
			const nguon = await nhapPhong(cycleId, b.chung, false);
			const id = idTra(
				await ganCanChinh(nguon, dich.objectiveId, b.chung),
				"gan can chinh",
			);
			return lenh(
				() => goi("okr.removeAlignment", { id }, b.chung.truong.cookie),
				() => db.okrAlignment.findUnique({ where: { id } }),
			);
		},
	},
	previewImport: {
		gieo: async (b) => {
			const cycleId = await b.kyChay();
			return lenh(
				() => goi("okr.previewImport", loNhap(cycleId)),
				() => moiTheoKy(cycleId),
			);
		},
	},
	applyImport: {
		gieo: async (b) => {
			const cycleId = await b.kyChay();
			return lenh(
				() => goi("okr.applyImport", { ...loNhap(cycleId), congBo: false }),
				() => moiTheoKy(cycleId),
			);
		},
	},
	moHopTuan: {
		gieo: async (b) => {
			const cycleId = await b.kyChay();
			return lenh(
				() =>
					goi(
						"okr.moHopTuan",
						{ cycleId, unit: { loai: "pb", id: b.chung.pb } },
						b.chung.truong.cookie,
					),
				() =>
					db.okrTrail.findMany({
						where: { cycleId, action: "mo-hop-tuan" },
					}),
			);
		},
	},
	guiCapNhat: {
		gieo: async (b) => {
			const { krIds } = await gieoMucTieuCongBo(await b.kyChay(), [{}]);
			const keyResultId = krIds[0] ?? "";
			return lenh(
				async () => {
					const { sessionId } = ok<{ sessionId: string }>(
						await goi("okr.moCapNhat", { entry: "tab" }),
						"mo phien",
					);
					return goi("okr.guiCapNhat", {
						sessionId,
						items: [{ keyResultId, value: 10, confidence: "vua", note: "" }],
					});
				},
				async () => ({
					kr: await krDb(keyResultId),
					lan: await db.okrCheckIn.findMany({ where: { keyResultId } }),
				}),
			);
		},
	},
	addComment: {
		gieo: async (b) => {
			const objectiveId = await gieoCoMucTieu(await b.kyChay());
			return lenh(
				() =>
					goi("okr.addComment", {
						objectiveId,
						body: "Tuần này cần gọi lại khách lớn",
						mentionUserIds: [],
					}),
				() => db.okrComment.findMany({ where: { objectiveId } }),
			);
		},
	},
	themViec: {
		gieo: async (b) => {
			const { krId } = await nhapCoKr(await b.kyChay());
			return lenh(
				() =>
					goi("okr.themViec", {
						keyResultId: krId,
						tieuDe: "Gọi khách",
						nguoiLamUserId: phien.quan.nguoi,
						hanNgay: null,
					}),
				() => viecCuaKr(krId),
			);
		},
	},
	suaViec: {
		gieo: async (b) => {
			const { krId } = await nhapCoKr(await b.kyChay());
			const id = await viecMoi(krId);
			return lenh(
				() => goi("okr.suaViec", { id, tieuDe: "Gọi lại khách" }),
				() => viecCuaKr(krId),
			);
		},
	},
	danhDauViec: {
		gieo: async (b) => {
			const { krId } = await nhapCoKr(await b.kyChay());
			const id = await viecMoi(krId);
			return lenh(
				() => goi("okr.danhDauViec", { id, xong: true }),
				() => viecCuaKr(krId),
			);
		},
	},
	goViec: {
		gieo: async (b) => {
			const { krId } = await nhapCoKr(await b.kyChay());
			const id = await viecMoi(krId);
			return lenh(
				() => goi("okr.goViec", { id }),
				() => viecCuaKr(krId),
			);
		},
	},
	ganSangKien: {
		gieo: async (b) => {
			const { krId } = await nhapCoKr(await b.kyChay());
			return lenh(
				() =>
					goi("okr.ganSangKien", {
						keyResultId: krId,
						loai: "chien-dich",
						banGhiId: b.chung.chienDich,
					}),
				() => viecCuaKr(krId),
			);
		},
	},
	themBangChung: {
		gieo: async (b) => {
			const { krId } = await nhapCoKr(await b.kyChay(), MOC_XONG);
			return lenh(
				() => goi("okr.themBangChung", vaoBangChung(krId)),
				() => db.okrBangChung.findMany({ where: { keyResultId: krId } }),
			);
		},
	},
	goBangChung: {
		gieo: async (b) => {
			const { krId } = await nhapCoKr(await b.kyChay(), MOC_XONG);
			const id = idTra(
				await goi("okr.themBangChung", vaoBangChung(krId)),
				"them bang chung",
			);
			return lenh(
				() => goi("okr.goBangChung", { id }),
				() => db.okrBangChung.findUnique({ where: { id } }),
			);
		},
	},
	guiGhiNhan: {
		gieo: async (b) => {
			const { objectiveId } = await gieoMucTieuCongBo(await b.kyChay(), [{}]);
			return lenh(
				() => ghiNhanMoi(objectiveId),
				() => db.okrGhiNhan.findMany({ where: { objectiveId } }),
			);
		},
	},
	goGhiNhan: {
		gieo: async (b) => {
			const { objectiveId } = await gieoMucTieuCongBo(await b.kyChay(), [{}]);
			const id = idTra(await ghiNhanMoi(objectiveId), "ghi nhan");
			return lenh(
				() => goi("okr.goGhiNhan", { id }),
				() => db.okrGhiNhan.findUnique({ where: { id } }),
			);
		},
	},
	taoTuMau: {
		gieo: async (b) => {
			const cycleId = await b.kyChay();
			const { truong } = b.chung;
			return lenh(
				() =>
					goi(
						"okr.taoTuMau",
						{
							mauId: b.chung.mau,
							cycleId,
							unit: { level: "phong-ban", departmentId: b.chung.pb },
							ownerUserId: truong.nguoi,
							krs: [
								{ startValue: 0, targetValue: 10, ownerUserId: truong.nguoi },
							],
						},
						truong.cookie,
					),
				() => moiTheoKy(cycleId),
			);
		},
	},
	follow: {
		gieo: async (b) => {
			const objectiveId = await gieoCoMucTieu(await b.kyChay());
			return lenh(
				() => goi("okr.follow", { objectiveId, on: true }),
				() => db.okrFollow.findMany({ where: { objectiveId } }),
			);
		},
	},
	datNguonKr: {
		gieo: async (b) => {
			const { krId } = await nhapCoKr(await b.kyChay());
			return lenh(
				() => goi("okr.datNguonKr", { keyResultId: krId, loai: "api" }),
				async () => ({
					kr: await krDb(krId),
					nguon: await db.okrNguonKr.findUnique({
						where: { keyResultId: krId },
					}),
				}),
			);
		},
	},
	soanMo: {
		gieo: async (b) => {
			const cycleId = await b.kyLap();
			return lenh(
				() => goi("okr.soanMo", { cycleId, ...DON_VI_SOAN }),
				() =>
					db.okrCuocSoan.findMany({
						where: { cycleId },
						orderBy: { id: "asc" },
					}),
			);
		},
	},
	soanTangLuot: {
		gieo: async (b) => {
			const cuoc = await cuocSoanMoi(await b.kyLap());
			return lenh(
				() => goi("okr.soanTangLuot", { cuocSoanId: cuoc.id }),
				() => cuocSoanDb(cuoc.id),
			);
		},
	},
	soanQuyet: {
		gieo: async (b) => {
			const cuoc = await cuocSoanMoi(await b.kyLap());
			const deXuatId = await dongSoanMoi(cuoc);
			return lenh(
				() => goi("okr.soanQuyet", { deXuatId, quyet: "nhan" }),
				() => db.okrDeXuat.findUnique({ where: { id: deXuatId } }),
			);
		},
	},
	soanDuaVao: {
		gieo: async (b) => {
			const cycleId = await b.kyLap();
			const cuoc = await cuocSoanMoi(cycleId);
			await dongSoanMoi(cuoc);
			return lenh(
				() => goi("okr.soanDuaVao", { cuocSoanId: cuoc.id, kr: [] }),
				async () => ({
					cuoc: await cuocSoanDb(cuoc.id),
					mucTieu: await moiTheoKy(cycleId),
				}),
			);
		},
	},
	ghiSoKr: {
		gieo: async (b) => {
			const { krId } = await nhapCoKr(await b.kyChay());
			ok(
				await goi("okr.datNguonKr", { keyResultId: krId, loai: "api" }),
				"nguon api",
			);
			return lenh(
				() => goi("okr.ghiSoKr", { id: krId, giaTri: 5 }),
				async () => ({
					kr: await krDb(krId),
					chup: await db.okrSoChup.findMany({ where: { keyResultId: krId } }),
				}),
			);
		},
	},
} satisfies { [ten: string]: CaGhi };

const MIEN_GHI = {
	setProgram:
		"cấu hình chương trình OKR — không nhận id chu kỳ, mục tiêu hay KR",
	luuMau: "mẫu OKR không thuộc chu kỳ nào",
	luuTruMau: "mẫu OKR không thuộc chu kỳ nào",
	khoiPhucMau: "mẫu OKR không thuộc chu kỳ nào",
	moCapNhat:
		"chỉ mở phiên cập nhật của người gọi — phiên không trỏ tới chu kỳ hay KR; KR được ghi ở guiCapNhat, có dòng riêng",
	troLyTomTatPhanHoi:
		"chỉ nhận tomTatId và ghi một hàng OkrTomTatPhanHoi của chính người gọi — không phải bản ghi OKR (ngoài luật vết), không đổi Mục tiêu, KR hay Cập nhật của chu kỳ nào; docTomTatChoNguoiXem không xét chu kỳ ẩn, nên bản của chu kỳ ẩn vẫn nhận phản hồi",
	transferWork:
		"không nhận id chu kỳ, mục tiêu hay KR; chỉ đổi người trên các bản ghi dieuKienChuyen tự tìm, đã lọc KY_CON_HIEN — ca chuyen-viec giữ KR của X",
	suaChuKy: "thủ tục của chính chu kỳ, luật chu kỳ ẩn ở bài sua-moi-o, sua-ten",
	goChuKy: "thủ tục của chính chu kỳ, luật chu kỳ ẩn ở bài go-chu-ky",
	anChuKy: "thủ tục của chính chu kỳ, luật chu kỳ ẩn ở bài an-hien",
	hienChuKy: "thủ tục của chính chu kỳ, luật chu kỳ ẩn ở bài an-hien",
} satisfies { [ten: string]: string };

async function datDuyetCongBo(bat: boolean): Promise<void> {
	ok(
		await goi("okr.setProgram", { ...CHUONG_TRINH_RONG, duyetCongBo: bat }),
		`duyet cong bo ${bat}`,
	);
}

async function donAnVang(): Promise<void> {
	await db.okrDeXuat.deleteMany({
		where: { nguoiYeuCau: { startsWith: TIEN_TO } },
	});
	await db.okrCuocSoan.deleteMany({
		where: { nguoiMoUserId: { startsWith: TIEN_TO } },
	});
	await donSanCanhKr();
	await donSanKhep();
}

describe("an-vang", () => {
	afterAll(donAnVang, CHO_MS);

	test(
		"an-vang: ma tran ghi — moi mutation cua okr co dung mot dong GHI_VAO_KY_AN hoac MIEN_GHI; goi vao X da an 400 cau ghim va ban ghi dich doc lai giu nguyen; cung lenh vao V duoc",
		async () => {
			const thuTuc = soThuTuc(ungDung())
				.filter((t) => t.loai === "mutation" && t.ten.startsWith("okr."))
				.map((t) => t.ten.slice("okr.".length))
				.sort();
			const ghi = Object.keys(GHI_VAO_KY_AN);
			const mien = Object.keys(MIEN_GHI);
			const khai = new Set([...ghi, ...mien]);
			expect(
				{
					thieuDong: thuTuc.filter((t) => !khai.has(t)),
					dongThua: [...khai].filter((t) => !thuTuc.includes(t)).sort(),
					haiDong: ghi.filter((t) => mien.includes(t)),
				},
				"thu tuc mutation okr thieu dong, thua dong hoac nam o ca hai bang",
			).toEqual({ thieuDong: [], dongThua: [], haiDong: [] });

			const chung = await dungChung();
			await datDuyetCongBo(true);
			try {
				const x = benMoi(chung, true);
				const v = benMoi(chung, false);
				const lenhCa = [];
				for (const [ten, ca] of Object.entries<CaGhi>(GHI_VAO_KY_AN))
					lenhCa.push({
						ten,
						cau: ca.cau ?? CAU.kyDaAn,
						x: await ca.gieo(x),
						v: await ca.gieo(v),
					});
				for (const id of x.canAn) await an(id);
				const thuc = [];
				const mong = [];
				for (const l of lenhCa) {
					const truoc = JSON.stringify(await l.x.doc());
					const rx = await l.x.goi();
					const sau = JSON.stringify(await l.x.doc());
					const rv = await l.v.goi();
					thuc.push({
						ca: l.ten,
						x: tra(rx),
						giu: truoc === sau ? "giu" : `${truoc} -> ${sau}`,
						v: tra(rv),
					});
					mong.push({ ca: l.ten, x: `400 ${l.cau}`, giu: "giu", v: "200" });
				}
				expect(thuc.length).toBe(ghi.length);
				expect(
					lechCa(thuc, mong),
					"ghi vao chu ky an khong bi chan, doi ban ghi, hoac doi chung V hong",
				).toEqual([]);
			} finally {
				await datDuyetCongBo(false);
			}
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"an-vang: mang sang tu quy truoc khi ky ke som nhat X da an — ban nhap nam o V",
		async () => {
			const y = namCu();
			const nam = await taoNam("an-vang-ms", y);
			const q1 = await taoQuy("ms-q1", nam, `${y}-01-01`, `${y}-03-31`);
			const X = await taoQuy("ms-x", nam, `${y}-04-01`, `${y}-06-30`);
			const V = await taoQuy("ms-v", nam, `${y}-07-01`, `${y}-09-30`);
			await gieoCoMucTieu(X);
			await dangChay(q1);
			const { objectiveId } = await gieoMucTieuCongBo(q1, [{}]);
			ok(await sangPha(q1, "cham-diem"), "q1 cham diem");
			await an(X);
			ok(await goi("okr.mangSang", { objectiveId }), "mang sang");
			const dong = await db.okrMangSang.findFirstOrThrow({
				where: { tuObjectiveId: objectiveId },
			});
			const banNhap = await db.okrObjective.findUniqueOrThrow({
				where: { id: dong.sangObjectiveId },
			});
			expect({
				sangCycleId: dong.sangCycleId,
				banNhap: banNhap.cycleId,
			}).toEqual({ sangCycleId: V, banNhap: V });
		},
		CHO_MS,
	);

	test(
		"an-vang: cap nhat tuan cua U chi co KR cua V; chuyen viec khi R roi chi doi KR cua V; hien lai X thi KR cua U o X quay lai",
		async () => {
			const U = await nguoiMoi("an-vang-U");
			const R = await nguoiMoi("an-vang-R");
			const N = await nguoiMoi("an-vang-N");
			const gieoKy = async (ten: string) => {
				const id = await taoNam(ten, namCu());
				await dangChay(id);
				const { krIds } = await gieoMucTieuCongBo(id, [
					{ ownerUserId: U },
					{ ownerUserId: R },
				]);
				const [u = "", r = ""] = krIds;
				return { id, u, r };
			};
			const X = await gieoKy("an-vang-X");
			const V = await gieoKy("an-vang-V");
			await an(X.id);
			const cookieU = await phienCua(U);
			const tuanCua = async () =>
				(await doc<CapNhatTuanOutput>("okr.capNhatTuan", cookieU)).items
					.map((i) => i.keyResultId)
					.sort();
			expect(await tuanCua(), "cap nhat tuan cua U").toEqual([V.u]);
			ok(
				await goi("okr.transferWork", { fromUserId: R, toUserId: N }),
				"chuyen viec",
			);
			const chu = async (id: string) =>
				(await db.okrKeyResult.findUniqueOrThrow({ where: { id } }))
					.ownerUserId;
			expect({ x: await chu(X.r), v: await chu(V.r) }).toEqual({
				x: R,
				v: N,
			});
			ok(await goi("okr.hienChuKy", { id: X.id }), "hien lai X");
			expect(await tuanCua(), "hien lai X").toEqual([X.u, V.u].sort());
		},
		CHO_MS,
	);

	test(
		"an-vang: co ghi cua ngan muc tieu va khung KR tat o X da an, bat o V",
		async () => {
			const gieoKy = async (ten: string) => {
				const id = await taoNam(ten, namCu());
				await dangChay(id);
				return gieoMucTieuCongBo(id, [{}]);
			};
			const X = await gieoKy("an-vang-co-X");
			const V = await gieoKy("an-vang-co-V");
			const kyCua = await db.okrObjective.findUniqueOrThrow({
				where: { id: X.objectiveId },
				select: { cycleId: true },
			});
			await an(kyCua.cycleId);
			const coCua = async (mt: { objectiveId: string; krIds: string[] }) => {
				const o = await doc<{
					kyGhiDuoc: boolean;
					quyen: { datHienThi: boolean };
				}>("okr.objective", "quan", { id: mt.objectiveId });
				const k = await doc<{ khoa: boolean }>("okr.canhKr", "quan", {
					keyResultId: mt.krIds[0] ?? "",
				});
				return {
					kyGhiDuoc: o.kyGhiDuoc,
					datHienThi: o.quyen.datHienThi,
					khoaKr: k.khoa,
				};
			};
			expect({ x: await coCua(X), v: await coCua(V) }).toEqual({
				x: { kyGhiDuoc: false, datHienThi: false, khoaKr: true },
				v: { kyGhiDuoc: true, datHienThi: true, khoaKr: false },
			});
		},
		CHO_MS,
	);

	test(
		"an-vang: dich can chinh cua muc tieu o X da an khong con muc tieu nao cua X; o V co dung muc tieu cong bo cua V",
		async () => {
			const c = await dungChung();
			const gieoKy = async (ten: string) => {
				const id = await taoNam(ten, namCu());
				await dangChay(id);
				const dich = (await gieoMucTieuCongBo(id, [{}])).objectiveId;
				const nguon = await nhapPhong(id, c, false);
				return { id, dich, nguon };
			};
			const X = await gieoKy("an-vang-dich-X");
			const V = await gieoKy("an-vang-dich-V");
			await an(X.id);
			const dichCua = async (objectiveId: string) => [
				...new Set(
					(
						await doc<{ targets: { objectiveId: string }[] }>(
							"okr.alignmentTargets",
							c.truong.cookie,
							{ objectiveId },
						)
					).targets.map((t) => t.objectiveId),
				),
			];
			expect({
				x: await dichCua(X.nguon),
				v: await dichCua(V.nguon),
			}).toEqual({ x: [], v: [V.dich] });
		},
		CHO_MS,
	);

	test(
		"an-vang: cay can chinh cua nam bo muc tieu cua quy X da an can chinh len nam, giu muc tieu cua quy V",
		async () => {
			const c = await dungChung();
			const y = namCu();
			const nam = await taoNam("an-vang-cay", y);
			const X = await taoQuy("cay-X", nam, `${y}-01-01`, `${y}-03-31`);
			const V = await taoQuy("cay-V", nam, `${y}-04-01`, `${y}-06-30`);
			await dangChay(nam);
			const goc = (await gieoMucTieuCongBo(nam, [{}])).objectiveId;
			const conCua = async (cycleId: string) => {
				const id = await nhapPhong(cycleId, c, false);
				ok(await ganCanChinh(id, goc, c), `can chinh ${cycleId}`);
				return id;
			};
			const oX = await conCua(X);
			const oV = await conCua(V);
			await an(X);
			const cay = await doc<AlignmentTreeOutput>("okr.alignmentTree", "quan", {
				cycleId: nam,
			});
			const ids = new Set<string>();
			const di = (nut: NutCanChinh) => {
				ids.add(nut.objectiveId);
				for (const con of nut.children) di(con);
			};
			for (const nut of [...cay.roots, ...cay.chuaCanChinh]) di(nut);
			expect({ goc: ids.has(goc), x: ids.has(oX), v: ids.has(oV) }).toEqual({
				goc: true,
				x: false,
				v: true,
			});
		},
		CHO_MS,
	);

	test(
		"an-vang: OKR mo cua phong ban bo muc tieu o X da an — xem truoc luu tru phong chi co OKR o X khong chan vi OKR, phong co OKR o V chan",
		async () => {
			const c = await dungChung();
			const c2: Chung = {
				...c,
				pb: c.pb2,
				truong: await truongMoi("department", c.pb2, "an-vang-T2"),
			};
			const X = await taoNam("an-vang-luu-X", namCu());
			const V = await taoNam("an-vang-luu-V", namCu());
			await nhapPhong(X, c, true);
			await nhapPhong(V, c2, true);
			await an(X);
			const lyDoOkr = async (id: string) =>
				(
					await doc<{ lyDo: { loai: string; cau: string }[] }>(
						"org.luuTruXemTruoc",
						"quan",
						{ id },
					)
				).lyDo.filter((l) => l.loai === "okr").length;
			expect({ x: await lyDoOkr(c.pb), v: await lyDoOkr(c2.pb) }).toEqual({
				x: 0,
				v: 1,
			});
		},
		CHO_MS,
	);
});
