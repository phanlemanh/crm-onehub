import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { PhaChuKy } from "@crm/validation/okr-chu-ky";
import type { KieuKr } from "@crm/validation/okr-kr";
import type {
	CapMucTieu,
	TrangThaiMucTieu,
} from "@crm/validation/okr-muc-tieu";
import type { DonChonOkr } from "@crm/validation/okr-tham-so";
import { z } from "zod";
import {
	cyclesOutput,
	type KrOutput,
	krCanhOutput,
	krOutput,
	type MucTieuOutput,
	mucTieuOutput,
	type ObjectiveOutput,
	objectiveOutput,
	okrAccessOutput,
} from "../../api/src/okr/okr.contracts";
import { danhSachOutput } from "../../api/src/okr/okr-xem.contracts";
import { orgTreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";
import {
	bam,
	cho,
	type DauVao,
	dat,
	datLai,
	don,
	go,
	goi,
	goiCua,
	mo,
	nhip,
	q,
	qa,
} from "./khung-soan-okr";

const { RecordSheetHost } = await import(
	"@/components/crm/record-sheet/record-sheet-host"
);
const { docKhoaBo, taoKhoaBo } = await import(
	"@/app/(app)/[slug]/okr/soan-bo/khoa-bo"
);
const { recordKey, useRecordStack } = await import(
	"@/components/crm/record-sheet/record-stack"
);
const { PHU_THUOC_MAC_DINH, PhuThuocSoanContext } = await import(
	"@/app/(app)/[slug]/okr/soan-bo/phu-thuoc"
);
const { chonMucTieuBo } = await import(
	"@/app/(app)/[slug]/okr/soan-bo/du-lieu-bo"
);
const { okrSoanBoMessages } = await import("@/lib/messages/okr-soan-bo");

type PhuThuocSoan = typeof PHU_THUOC_MAC_DINH;

const CHU = okrSoanBoMessages("vi");

type Nguoi = { id: string; name: string; email: string };

const LAN: Nguoi = {
	id: "lan",
	name: "Nguyễn Thị Lan",
	email: "lan@onehub.vn",
};
const HUNG: Nguoi = {
	id: "hung",
	name: "Trần Văn Hùng",
	email: "hung@onehub.vn",
};

const KY = "q4";

const THU_TUC_GHI = new Set([
	"okr.createObjective",
	"okr.updateObjective",
	"okr.createKeyResult",
	"okr.updateKeyResult",
	"okr.removeKeyResult",
	"okr.xoaMucTieu",
	"okr.publishObjective",
	"okr.guiDuyet",
	"okr.troLyDeXuat",
	"okr.troLyQuyet",
	"okr.soanMo",
]);

type KrMau = {
	id: string;
	title?: string;
	kind?: KieuKr;
	startValue?: number;
	targetValue?: number;
	unit?: string;
	owner?: Nguoi;
};

type MucMau = {
	id: string;
	title?: string;
	status?: TrangThaiMucTieu;
	level?: CapMucTieu;
	unitId?: string | null;
	kr?: KrMau[];
	quyen?: Partial<ObjectiveOutput["quyen"]>;
};

type TuyChonBo = {
	don?: DonChonOkr;
	pha?: PhaChuKy;
	nguoiSoan?: Nguoi;
	quanTri?: boolean;
	canEdit?: boolean;
	muc?: MucMau[];
	daBo?: MucMau[];
};

function cayMau() {
	const pb = (id: string, name: string, head: Nguoi | null) => ({
		id,
		name,
		moTa: "",
		position: 0,
		divisionId: "B1",
		head,
		stepCount: 0,
		okrMo: 0,
		people: head ? [{ ...head, primary: true }] : [],
	});
	return orgTreeOutput.parse({
		divisions: [
			{
				id: "B1",
				name: "Khối Vận hành",
				moTa: "",
				position: 0,
				head: HUNG,
				okrMo: 0,
				departments: [
					pb("P1", "Phòng Kế toán", LAN),
					pb("P2", "Phòng Pháp chế", null),
				],
			},
		],
		chuaXep: [],
		chuaCoPhongBan: [],
		people: [],
		archived: { divisions: [], departments: [] },
		coverage: { members: 2, withPrimary: 2, departmentsWithoutHead: 1 },
	});
}

type CapBo = Pick<MucTieuOutput, "level" | "unitId">;

function capCua(don: DonChonOkr): CapBo {
	if (don.loai === "bp") return { level: "bo-phan", unitId: don.id };
	if (don.loai === "pb") return { level: "phong-ban", unitId: don.id };
	if (don.loai === "nguoi") return { level: "ca-nhan", unitId: don.id };
	return { level: "onehub", unitId: null };
}

function krMau(k: KrMau, objectiveId: string): KrOutput {
	return krOutput.parse({
		id: k.id,
		objectiveId,
		title: k.title ?? `KR ${k.id}`,
		kind: k.kind ?? "tang-toi",
		owner: k.owner ?? LAN,
		startValue: k.startValue ?? 0,
		targetValue: k.targetValue ?? 10,
		currentValue: k.startValue ?? 0,
		unit: k.unit ?? "",
		dueOn: null,
		weight: 1,
		source: "tay",
		doCanh: false,
		soMay: null,
		nguonMay: null,
		startLocked: false,
		progress: 0,
		laCuaToi: false,
		hienTaiQuaCapNhat: false,
	});
}

function mucMau(m: MucMau, don: DonChonOkr, canEdit: boolean): MucTieuOutput {
	const cap = capCua(don);
	const status = m.status ?? "nhap";
	return mucTieuOutput.parse({
		id: m.id,
		cycleId: KY,
		level: m.level ?? cap.level,
		unitId: m.unitId === undefined ? cap.unitId : m.unitId,
		unitName: "Phòng Kế toán",
		title: m.title ?? `Mục tiêu ${m.id}`,
		kind: "cam-ket",
		status,
		owner: LAN,
		participants: [],
		whyNow: "",
		publishedAt: status === "cong-bo" ? "2026-10-02T00:00:00.000Z" : null,
		droppedAt: status === "da-bo" ? "2026-10-03T00:00:00.000Z" : null,
		progress: 0,
		expected: null,
		keyResults: (m.kr ?? []).map((k) => krMau(k, m.id)),
		alignments: [],
		canEdit,
		following: false,
		followerCount: 0,
		theoDoi: false,
		hienThi: "cong-khai",
		soNguoiXem: 0,
		soGopYCho: 0,
	});
}

function chiTiet(
	mt: MucTieuOutput,
	quyen: Partial<ObjectiveOutput["quyen"]> = {},
): ObjectiveOutput {
	return objectiveOutput.parse({
		...mt,
		keyResults: mt.keyResults.map((k) =>
			krCanhOutput.parse({
				...k,
				soViec: { xong: 0, tong: 0 },
				soSangKien: 0,
				coBangChung: false,
			}),
		),
		cycleName: "Quý 4/2026",
		kyGhiDuoc: true,
		mangSangToi: null,
		mangSangTu: null,
		trail: [],
		canEditKr: mt.canEdit ? mt.keyResults.map((k) => k.id) : [],
		nguoiXem: [],
		nguoiDuyetDuKien: null,
		choDuyet: null,
		traLaiGanNhat: null,
		quyen: {
			datHienThi: false,
			congBo: false,
			guiDuyet: false,
			duyet: false,
			rutDuyet: false,
			xoa: false,
			dungLai: false,
			...quyen,
		},
		themKrLe: false,
	});
}

const vaoCoId = z.object({ id: z.string() });

function idCua(vao: DauVao): string | null {
	const kq = vaoCoId.safeParse(vao);
	return kq.success ? kq.data.id : null;
}

export function boMau({
	don = { loai: "pb", id: "P1" },
	pha = "lap-ke-hoach",
	nguoiSoan = LAN,
	quanTri = false,
	canEdit = true,
	muc = [],
	daBo = [],
}: TuyChonBo = {}) {
	const rows = muc.map((m) => mucMau(m, don, canEdit));
	const boDi = daBo.map((m) => mucMau({ ...m, status: "da-bo" }, don, canEdit));
	const danhSach = danhSachOutput.parse({
		rows: rows.map((mt) => ({ ...mt, krKhop: [] })),
		daBo: boDi.map((mt) => ({ ...mt, krKhop: [] })),
		total: rows.length,
		facetCounts: { phuTrach: [], loai: [], trangThai: [], tuTin: [], gopY: [] },
		canEdit,
		canCreate: canEdit,
	});
	const chiTietTheoId = new Map(
		[...muc, ...daBo].map((m, i) => {
			const mt = [...rows, ...boDi][i];
			if (!mt) throw new Error(`boMau: thieu muc tieu ${m.id}`);
			return [m.id, chiTiet(mt, m.quyen)] as const;
		}),
	);
	const cay = cayMau();
	const ky = cyclesOutput.parse({
		cycles: [
			{
				id: KY,
				kind: "quy",
				name: "Quý 4/2026",
				parentId: null,
				startsOn: "2026-10-01",
				endsOn: "2026-12-31",
				phase: pha,
				breakStartsOn: null,
				breakEndsOn: null,
				updateWeekday: 1,
				cuaSoRa: null,
				anLuc: null,
				anLyDo: null,
				quyConHien: 0,
				viec: {
					suaMoiO: false,
					suaTen: false,
					go: false,
					an: false,
					hienLai: false,
				},
			},
		],
		currentId: KY,
	});
	const quyen = okrAccessOutput.parse({
		canManageProgram: quanTri,
		headOf: {
			divisions: cay.divisions
				.filter((b) => b.head?.id === nguoiSoan.id)
				.map((b) => b.id),
			departments: cay.divisions
				.flatMap((b) => b.departments)
				.filter((p) => p.head?.id === nguoiSoan.id)
				.map((p) => p.id),
		},
	});
	dat("users.me", () => ({ ...nguoiSoan, image: null }));
	dat("org.tree", () => cay);
	dat("okr.cycles", () => ky);
	dat("okr.access", () => quyen);
	dat("okr.danhSach", () => danhSach);
	dat("okr.objective", (vao) => {
		const id = idCua(vao);
		return id ? (chiTietTheoId.get(id) ?? null) : null;
	});
	return {
		khoa: taoKhoaBo(KY, don),
		danhSach,
		chiTiet: chiTietTheoId,
		cay,
		ky,
		quyen,
	};
}

function DoRecord() {
	const { top } = useRecordStack();
	return <output data-do-record={top ? recordKey(top) : ""} />;
}

export async function veSoan(
	khoaBo: string,
	{ phuThuoc }: { phuThuoc?: Partial<PhuThuocSoan> } = {},
): Promise<void> {
	await mo(
		<PhuThuocSoanContext.Provider
			value={{ ...PHU_THUOC_MAC_DINH, ...phuThuoc }}
		>
			<RecordSheetHost cauNoiOkr />
			<DoRecord />
		</PhuThuocSoanContext.Provider>,
		`?record=${encodeURIComponent(`soan-bo:${khoaBo}`)}`,
	);
	await nhip(10);
}

async function choKhung(): Promise<void> {
	await cho(
		() =>
			(q("[data-khung-soan-bo]")?.getAttribute("data-khung-soan-bo") ??
				"dang-tai") !== "dang-tai",
		"khung soan bo doc xong",
	);
}

const khungChu = () => q("[data-slot=sheet-content]")?.textContent ?? "";

export function goiGhi() {
	return goi.filter((g) => THU_TUC_GHI.has(g.duong));
}

beforeEach(() => {
	datLai();
});

afterEach(async () => {
	await don();
});

describe("vk10-khoa", () => {
	test("vk10-khoa: khoa bo di ve dung chu ky va don vi", () => {
		expect(
			docKhoaBo(taoKhoaBo("ky1", { loai: "pb", id: "P1" })),
			"vk10-khoa: pb lech",
		).toEqual({ cycleId: "ky1", don: { loai: "pb", id: "P1" } });
		expect(
			docKhoaBo(taoKhoaBo("ky1", { loai: "bp", id: "B1" })),
			"vk10-khoa: bp lech",
		).toEqual({ cycleId: "ky1", don: { loai: "bp", id: "B1" } });
		expect(
			docKhoaBo(taoKhoaBo("ky1", { loai: "goc" })),
			"vk10-khoa: goc lech",
		).toEqual({ cycleId: "ky1", don: { loai: "goc" } });
		expect(taoKhoaBo("ky1", { loai: "goc" }), "vk10-khoa: goc ten").toBe(
			"ky1~goc",
		);
	});

	test("vk10-khoa: khoa hong tra null", () => {
		for (const hong of [
			"ky1",
			"ky1~xx:1",
			"~pb:P1",
			"ky1~pb:",
			"ky1~pb:P1:x",
			"ky1~goc:x",
			"ky1~pb:P1~x",
		])
			expect(docKhoaBo(hong), `vk10-khoa: ${hong} lech`).toBeNull();
	});
});

const KR_HAI = [{ id: "k-n1" }, { id: "k-n2" }];

const BO_PB: MucMau[] = [
	{ id: "mt-nhap", status: "nhap", kr: KR_HAI },
	{
		id: "mt-cong-bo",
		status: "cong-bo",
		kr: [{ id: "k-c1" }, { id: "k-c2" }, { id: "k-c3" }],
	},
	{ id: "mt-cho", status: "cho-duyet", kr: [{ id: "k-d1" }] },
];

const BO_BP: MucMau[] = [
	{ id: "mt-bp", status: "nhap", kr: [{ id: "k-b1" }] },
	{
		id: "mt-pb-con",
		status: "nhap",
		level: "phong-ban",
		unitId: "P1",
		kr: [{ id: "k-p1" }],
	},
	{ id: "mt-bp-2", status: "cong-bo", kr: [{ id: "k-b2" }, { id: "k-b3" }] },
];

const DA_BO: MucMau[] = [{ id: "mt-bo", kr: [{ id: "k-bo" }] }];

type KyVongMo = {
	ten: string;
	khoa: string;
	mucTieu: { id: string; kr: string[] }[];
	boDi: string[];
};

function kyVong(
	ten: string,
	khoa: string,
	muc: MucMau[],
	boDi: MucMau[],
): KyVongMo {
	return {
		ten,
		khoa,
		mucTieu: muc.map((mt) => ({
			id: mt.id,
			kr: (mt.kr ?? []).map((k) => k.id),
		})),
		boDi: boDi.map((mt) => mt.id),
	};
}

async function kiemMo(nhan: string, kv: KyVongMo): Promise<void> {
	await choKhung();
	expect(khungChu(), `vk10-mo: ${nhan} tieu de lech`).toContain(
		CHU.dauKhung.tieuDe,
	);
	expect(khungChu(), `vk10-mo: ${nhan} ten bo lech`).toContain(kv.ten);
	expect(
		q("[data-do-record]")?.getAttribute("data-do-record"),
		`vk10-mo: ${nhan} record lech`,
	).toBe(`soan-bo:${kv.khoa}`);
	for (const id of kv.boDi)
		expect(q(`[data-dong-mt="${id}"]`), "vk10-mo: da-bo hien").toBeNull();
	expect(
		qa("[data-tai-lieu-bo] [data-dong-mt]").map((e) =>
			e.getAttribute("data-dong-mt"),
		),
		"vk10-mo: tap muc tieu lech",
	).toEqual(kv.mucTieu.map((mt) => mt.id));
	for (const mt of kv.mucTieu)
		expect(
			qa(`[data-dong-mt="${mt.id}"] [data-dong-kr]`).map((e) =>
				e.getAttribute("data-dong-kr"),
			),
			`vk10-mo: ${nhan} kr ${mt.id} lech`,
		).toEqual(mt.kr);
	expect(
		q("[data-o=cot-ben] [data-khoi=chat-luong]"),
		`vk10-mo: ${nhan} chat luong lech`,
	).not.toBeNull();
	expect(
		q("[data-o=cot-ben] [data-khoi=gop-y-kara]"),
		`vk10-mo: ${nhan} gop y lech`,
	).not.toBeNull();
}

describe("vk10-mo", () => {
	test("vk10-mo: url/tai-lai mo dung bo phong ban", async () => {
		const bo = boMau({ muc: BO_PB, daBo: DA_BO });
		await veSoan(bo.khoa);
		await kiemMo(
			"url/tai-lai",
			kyVong("Phòng Kế toán · Quý 4/2026", bo.khoa, BO_PB, DA_BO),
		);
	});

	test("vk10-mo: url/tai-lai bo khoi khong gom muc tieu phong ban con", async () => {
		const bo = boMau({
			don: { loai: "bp", id: "B1" },
			nguoiSoan: HUNG,
			muc: BO_BP,
			daBo: DA_BO,
		});
		await veSoan(bo.khoa);
		await kiemMo(
			"url/tai-lai-bp",
			kyVong(
				"Khối Vận hành · Quý 4/2026",
				bo.khoa,
				BO_BP.filter((mt) => mt.id !== "mt-pb-con"),
				DA_BO,
			),
		);
	});
});

describe("vk10-mo-do", () => {
	test("vk10-mo-do: khoa bo cua don vi khac thi tap muc tieu do", async () => {
		const bo = boMau({ muc: BO_PB, daBo: DA_BO });
		const khac = taoKhoaBo(KY, { loai: "pb", id: "P2" });
		await veSoan(khac);
		await expect(
			kiemMo(
				"url/tai-lai",
				kyVong("Phòng Pháp chế · Quý 4/2026", khac, BO_PB, DA_BO),
			),
		).rejects.toThrow("vk10-mo: tap muc tieu lech");
		expect(khac, "vk10-mo: khoa khac trung khoa bo").not.toBe(bo.khoa);
	});

	test("vk10-mo-do: bo loc da bo tat thi da-bo hien", async () => {
		const bo = boMau({ muc: BO_PB, daBo: DA_BO });
		await veSoan(bo.khoa, {
			phuThuoc: {
				chonMucTieu: (ds, d) => [...chonMucTieuBo(ds, d), ...ds.daBo],
			},
		});
		await expect(
			kiemMo(
				"url/tai-lai",
				kyVong("Phòng Kế toán · Quý 4/2026", bo.khoa, BO_PB, DA_BO),
			),
		).rejects.toThrow("vk10-mo: da-bo hien");
	});
});

const treo = () => new Promise<never>(() => {});

function kiemTaiO1(ten: string): void {
	expect(q("[data-cho-tai]"), "vk10-tai: o1 lech").not.toBeNull();
	expect(khungChu(), "vk10-tai: o1 lech").toContain(CHU.dauKhung.tieuDe);
	expect(khungChu(), "vk10-tai: o1 lech").toContain(ten);
}

async function kiemTaiO2(): Promise<void> {
	await cho(() => q("[data-vung-tai-loi]") !== null, "vung tai loi");
	const vung = q("[data-vung-tai-loi]");
	expect(vung?.textContent ?? "", "vk10-tai: o2 lech").toContain(
		CHU.taiLoi.tieuDe,
	);
	expect(vung?.textContent ?? "", "vk10-tai: o2 lech").toContain(
		CHU.taiLoi.moTa,
	);
	const nutThu = vung?.querySelectorAll("button") ?? [];
	expect(nutThu.length, "vk10-tai: o2 lech").toBe(1);
	const truoc = goiCua("okr.danhSach").length;
	await bam(nutThu[0] ?? null);
	await nhip(5);
	expect(goiCua("okr.danhSach").length - truoc, "vk10-tai: o2 lech").toBe(1);
}

describe("vk10-tai", () => {
	test("vk10-tai: o1 dang tai giu tieu de va ten bo", async () => {
		const bo = boMau({ muc: BO_PB });
		dat("okr.danhSach", treo);
		await veSoan(bo.khoa);
		kiemTaiO1("Phòng Kế toán · Quý 4/2026");
	});

	test("vk10-tai: o2 loi tai co thu lai goi lai dung mot lan", async () => {
		const bo = boMau({ muc: BO_PB });
		dat("okr.danhSach", () => {
			throw new Error("may chu khong tra loi");
		});
		await veSoan(bo.khoa);
		await kiemTaiO2();
	});
});

describe("vk10-tai-do", () => {
	test("vk10-tai-do: luc tai giau tieu de", async () => {
		const bo = boMau({ muc: BO_PB });
		dat("okr.danhSach", treo);
		await veSoan(bo.khoa, { phuThuoc: { tieuDeKhiTai: false } });
		expect(() => kiemTaiO1("Phòng Kế toán · Quý 4/2026")).toThrow(
			"vk10-tai: o1 lech",
		);
	});
});

type LyDoChiXem = keyof typeof CHU.chiXem;

async function kiemChiXem(o: number, lyDo: LyDoChiXem): Promise<void> {
	await choKhung();
	const sai = `vk10-quyen: o${o} lech`;
	const o_nhap = qa(
		"[data-tai-lieu-bo] textarea, [data-tai-lieu-bo] input",
	).filter(
		(e): e is HTMLTextAreaElement | HTMLInputElement =>
			e instanceof HTMLTextAreaElement || e instanceof HTMLInputElement,
	);
	expect(o_nhap.length, sai).toBeGreaterThan(0);
	expect(
		o_nhap.every((e) => e.disabled),
		sai,
	).toBe(true);
	expect(q("[data-nut=cong-bo-bo]"), sai).toBeNull();
	expect(q("[data-o=cot-ben]"), sai).toBeNull();
	expect(q(`[data-ly-do-chi-xem="${lyDo}"]`)?.textContent ?? null, sai).toBe(
		CHU.chiXem[lyDo],
	);
	for (const e of o_nhap) {
		await bam(e);
		await go(e, "Chữ người xem gõ thử");
	}
	await nhip(5);
	expect(goiGhi().length, sai).toBe(0);
}

const BO_XEM: MucMau[] = [
	{ id: "mt-nhap", status: "nhap", kr: KR_HAI },
	{ id: "mt-cong-bo", status: "cong-bo", kr: [{ id: "k-c1" }] },
];

describe("vk10-quyen", () => {
	test("vk10-quyen: o2 thanh vien mo thang URL chi xem", async () => {
		const bo = boMau({ nguoiSoan: HUNG, canEdit: false, muc: BO_XEM });
		await veSoan(bo.khoa);
		await kiemChiXem(2, "khong-sua");
	});

	test("vk10-quyen: o3 nguoi soan o chu ky da dong chi xem", async () => {
		const bo = boMau({ pha: "da-dong", muc: BO_XEM });
		await veSoan(bo.khoa);
		await kiemChiXem(3, "ky-dong");
	});
});

describe("vk10-quyen-do", () => {
	test("vk10-quyen-do: bo co chi xem cho URL thang", async () => {
		const bo = boMau({ nguoiSoan: HUNG, canEdit: false, muc: BO_XEM });
		await veSoan(bo.khoa, { phuThuoc: { chiXemTheoQuyen: false } });
		await expect(kiemChiXem(2, "khong-sua")).rejects.toThrow(
			"vk10-quyen: o2 lech",
		);
	});
});
