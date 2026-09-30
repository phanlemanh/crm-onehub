import { afterAll, describe, expect, setSystemTime, test } from "bun:test";
import { db } from "@crm/db";
import { QUAN_HE_GIU_CHU_KY } from "@crm/db/okr-chu-ky-hien";
import { ngayVN } from "@crm/db/onboarding-nhac";
import {
	LOAI_CHU_KY,
	PHA_CHU_KY,
	type SuaChuKyInput,
	viecChuKy,
} from "@crm/validation/okr-chu-ky";
import { parseOkrVet } from "@crm/validation/okr-vet";
import { z } from "zod";
import type { ChuKyOutput } from "../src/okr/okr.contracts";
import {
	donSanKhep,
	gieoMucTieuCongBo,
	keoDaiPhien,
	luc,
	sangPha,
} from "./okr-khep-san";
import {
	dangChay,
	doc,
	goi,
	ma,
	ok,
	phien,
	type TraLoi,
	taoNam,
	taoQuy,
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
	expect({
		ca,
		tra: tra(r),
		ky: await Promise.all(ids.map(kyDb)),
		vet: await demVet(ids),
	}).toEqual({ ca, tra: mong, ky: truoc, vet });
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
			expect(thuc).toEqual(mong);
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
				thuc.push({ q, id, co: chiCo(truoc.dem), tra: tra(r), sau });
				mong.push({
					q,
					id,
					co: [q],
					tra: `400 ${CAU.khongTrong}`,
					sau: truoc,
				});
			}
			expect(thuc.length).toBe(tap.length);
			expect(thuc).toEqual(mong);
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
					ca: "hien-K-chong-L-dang-hien",
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
			luc("2026-11-18T03:00:00Z");
			try {
				const y = await taoNam("mac-dinh-Y", 2026);
				const a = await taoQuy("mac-dinh-A", y, "2026-10-01", "2026-12-31");
				await gieoCoMucTieu(a);
				await dangChay(a);
				await an(a);
				const b = await taoQuy("mac-dinh-B", y, "2026-10-15", "2026-12-31");
				await gieoCoMucTieu(b);

				const dau = await doc<Cycles>("okr.cycles");
				expect(
					dau.cycles
						.filter(
							(c) =>
								c.kind === "quy" &&
								c.anLuc === null &&
								c.id !== b &&
								c.startsOn <= "2026-11-18" &&
								"2026-11-18" <= c.endsOn,
						)
						.map((c) => c.id),
					"quy hien khac phu 2026-11-18 lam nhieu phep do",
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
						startsOn: "2026-10-01",
						endsOn: "2026-11-30",
						breakStartsOn: null,
						breakEndsOn: null,
						updateWeekday: 1,
					}),
					"tao quy chong A da an",
				).id;
				ok(await goi("okr.goChuKy", { id: moi }), "go quy vua tao");

				const z = await taoNam("mac-dinh-Z", 2026);
				await gieoCoMucTieu(z);
				await an(z);
				const soKy = await db.okrCycle.count();
				const r = await goi("okr.createCycle", {
					kind: "quy",
					name: ma("mac-dinh-trong-Z"),
					parentId: z,
					startsOn: "2026-10-01",
					endsOn: "2026-12-31",
					breakStartsOn: null,
					breakEndsOn: null,
					updateWeekday: 1,
				});
				expect({
					ca: "quy-trong-nam-da-an",
					tra: tra(r),
					soKy: await db.okrCycle.count(),
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

describe("dong-thoi", () => {
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
			expect(thuc).toEqual(mong);
		},
		CHO_MS,
	);
});
