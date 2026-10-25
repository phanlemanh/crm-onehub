import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { PhaChuKy } from "@crm/validation/okr-chu-ky";
import type { KieuKr } from "@crm/validation/okr-kr";
import type {
	CapMucTieu,
	TrangThaiMucTieu,
} from "@crm/validation/okr-muc-tieu";
import type { DonChonOkr } from "@crm/validation/okr-tham-so";
import userEvent from "@testing-library/user-event";
import { act } from "react";
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
	DauTrangOkr,
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
	TheoDonVi,
	urlDoi,
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

const TUAN: Nguoi = {
	id: "tuan",
	name: "Lê Minh Tuấn",
	email: "tuan@onehub.vn",
};

async function veTrangBo(thamSo: string): Promise<void> {
	dat("okr.countByUnit", () => ({}));
	await mo(
		<>
			<DauTrangOkr cauNoi />
			<TheoDonVi />
			<RecordSheetHost cauNoiOkr />
			<DoRecord />
		</>,
		thamSo,
	);
	await nhip(10);
}

const dongSoan = () => q("[data-hop-chon-duong] [data-duong=soan]");
const nutRong = () =>
	q('[data-trang-thai="ST-donvi-rong"] [data-nut=soan-bo-okr]');
const doRecord = () =>
	q("[data-do-record]")?.getAttribute("data-do-record") ?? null;

async function moHop(sai: string): Promise<Element> {
	await cho(
		() => q("[data-nut=them-muc-tieu]:not([disabled])") !== null,
		`${sai}: nut them muc tieu`,
	);
	await bam(q("[data-nut=them-muc-tieu]"));
	await cho(() => dongSoan() !== null, `${sai}: hop chon duong`);
	const d = dongSoan();
	if (!d) throw new Error(`${sai}: dong soan vang`);
	return d;
}

async function taiLai(): Promise<void> {
	const url = urlDoi.at(-1);
	if (url === undefined) throw new Error("vk10-mo: url chua doi");
	await don();
	await veTrangBo(url);
}

describe("vk10-mo-loi-vao", () => {
	test("vk10-mo: hop/mo va hop/tai-lai — Soan ca bo mo dung bo", async () => {
		const bo = boMau({ muc: BO_PB, daBo: DA_BO });
		const kv = kyVong("Phòng Kế toán · Quý 4/2026", bo.khoa, BO_PB, DA_BO);
		await veTrangBo("?donOkr=pb:P1");
		const d = await moHop("vk10-mo: hop/mo");
		expect(
			[
				d.getAttribute("aria-disabled"),
				d.querySelector("[data-slot=item-title]")?.textContent,
				d.querySelector("[data-slot=item-description]")?.textContent,
				d.querySelector("[data-slot=kara-mark]") !== null,
			],
			"vk10-mo: hop/mo dong lech",
		).toEqual([null, CHU.loiVao.soanCaBo, CHU.loiVao.soanCaBoMoTa, false]);
		await bam(d);
		expect(
			q("[data-hop-chon-duong]") === null,
			"vk10-mo: hop/mo hop lech",
		).toBe(true);
		await kiemMo("hop/mo", kv);
		expect(goiCua("okr.soanMo").length, "vk10-mo: hop/mo cuoc soan lech").toBe(
			0,
		);
		await taiLai();
		await kiemMo("hop/tai-lai", kv);
	});

	test("vk10-mo: rong/mo va rong/tai-lai — Soan bo OKR o cau rong mo dung bo", async () => {
		const bo = boMau({ muc: [], daBo: DA_BO });
		const kv = kyVong("Phòng Kế toán · Quý 4/2026", bo.khoa, [], DA_BO);
		await veTrangBo("?donOkr=pb:P1");
		await cho(() => nutRong() !== null, "vk10-mo: rong/mo nut lech");
		expect(nutRong()?.textContent, "vk10-mo: rong/mo nut lech").toBe(
			CHU.loiVao.nutRong,
		);
		await bam(nutRong());
		await kiemMo("rong/mo", kv);
		await taiLai();
		await kiemMo("rong/tai-lai", kv);
	});

	test("vk10-mo: hop-goc/mo — bo OneHub ghi goc tuong minh trong khoa", async () => {
		boMau({ don: { loai: "goc" }, muc: [] });
		await veTrangBo("?donOkr=goc");
		await bam(await moHop("vk10-mo: hop-goc/mo"));
		await choKhung();
		expect(doRecord(), "vk10-mo: hop-goc/mo record lech").toBe(
			`soan-bo:${KY}~goc`,
		);
	});
});

describe("vk10-quyen-loi-vao", () => {
	test("vk10-quyen: o1 khong sua duoc bo hay ky da dong thi khong co loi vao", async () => {
		const sai = "vk10-quyen: o1 lech";
		const kiemKhoa = async (d: Element) => {
			expect(
				[
					d.getAttribute("aria-disabled"),
					d.querySelector("[data-slot=item-description]")?.textContent,
				],
				sai,
			).toEqual(["true", CHU.loiVao.khoa]);
			await bam(d);
			expect(doRecord(), sai).toBe("");
			expect(q("[data-slot=sheet-content]") === null, sai).toBe(true);
			expect(nutRong() === null, sai).toBe(true);
		};

		const bo = boMau({ nguoiSoan: TUAN, canEdit: false, muc: [] });
		dat("okr.danhSach", () => ({ ...bo.danhSach, canCreate: true }));
		await veTrangBo("?donOkr=pb:P1");
		await cho(
			() => q('[data-trang-thai="ST-donvi-rong"]') !== null,
			`${sai} cau rong`,
		);
		await kiemKhoa(await moHop(sai));
		await don();

		boMau({ nguoiSoan: TUAN, canEdit: false, muc: [] });
		await veTrangBo("?donOkr=pb:P1");
		await cho(
			() => q('[data-trang-thai="ST-donvi-rong"]') !== null,
			`${sai} cau rong`,
		);
		expect(q("[data-nut=them-muc-tieu]")?.hasAttribute("disabled"), sai).toBe(
			true,
		);
		expect(dongSoan() === null, sai).toBe(true);
		expect(nutRong() === null, sai).toBe(true);
		await don();

		boMau({ pha: "da-dong", muc: [] });
		await veTrangBo("?donOkr=pb:P1");
		await cho(
			() => q('[data-trang-thai="ST-donvi-rong"]') !== null,
			`${sai} cau rong`,
		);
		await kiemKhoa(await moHop(sai));
		expect(goiGhi().length, sai).toBe(0);
	});
});

const { kiemDongKr } = await import(
	"@/app/(app)/[slug]/okr/soan-bo/du-lieu-bo"
);

const MT_MOI = "mt-moi";

function datGhiMoi(): void {
	let soKr = 0;
	dat("okr.createObjective", () => ({ id: MT_MOI, canhBao: null }));
	dat("okr.updateObjective", (vao) => ({
		id: idCua(vao) ?? "",
		canhBao: null,
	}));
	dat("okr.createKeyResult", () => {
		soKr += 1;
		return { id: `kr-moi-${soKr}`, canhBao: null };
	});
	dat("okr.updateKeyResult", (vao) => ({
		id: idCua(vao) ?? "",
		canhBao: null,
	}));
}

async function phim(chuoi: string): Promise<void> {
	await act(async () => {
		await userEvent
			.setup({ document, pointerEventsCheck: 0, delay: null })
			.keyboard(chuoi);
	});
	await nhip(4);
}

const oTenMtDau = () =>
	q("[data-tai-lieu-bo] [data-dong-moi] [data-o-nhap=ten]");

async function choLuuXong(sai: string): Promise<void> {
	await cho(() => qa("[data-luu=dang-luu]").length === 0, sai);
	await nhip(5);
}

async function moBoTrong(
	tuyChon: TuyChonBo,
	phuThuoc: Partial<PhuThuocSoan> = {},
): Promise<void> {
	const bo = boMau({ muc: [], ...tuyChon });
	datGhiMoi();
	await veSoan(bo.khoa, { phuThuoc });
	await choKhung();
	await cho(() => oTenMtDau() !== null, "vk10-viet: dong muc tieu dau");
	await nhip(3);
}

const TEN_MT = "Tăng doanh thu khối doanh nghiệp";

const KR_VIET = [
	{
		phim: "Doanh thu ký mới{Tab}2{Tab}3,5{Tab}tỷ ₫{Enter}",
		title: "Doanh thu ký mới",
		kind: "tang-toi",
		startValue: 2,
		targetValue: 3.5,
		unit: "tỷ ₫",
	},
	{
		phim: "Thời gian duyệt hồ sơ{Tab}10{Tab}4{Tab}ngày{Enter}",
		title: "Thời gian duyệt hồ sơ",
		kind: "giam-xuong",
		startValue: 10,
		targetValue: 4,
		unit: "ngày",
	},
	{
		phim: "Ra mắt cổng tự phục vụ{Tab}{Tab}{Tab}{Enter}",
		title: "Ra mắt cổng tự phục vụ",
		kind: "moc",
		startValue: 0,
		targetValue: 1,
		unit: "",
	},
] as const;

const TRUONG_KR = [
	"title",
	"kind",
	"startValue",
	"targetValue",
	"unit",
] as const;

async function vietBangPhim(): Promise<void> {
	expect(
		document.activeElement !== null && document.activeElement === oTenMtDau(),
		"vk10-viet: mo focus lech",
	).toBe(true);
	await phim(`${TEN_MT}{Enter}`);
	for (const kr of KR_VIET) await phim(kr.phim);
	await phim("Số khách hàng mới{Tab}5{Tab}{Tab}khách{Enter}");
	await choLuuXong("vk10-viet: luu xong");
}

function kiemMucTieuMoi(o: string, nguoi: string): void {
	const mt = goiCua("okr.createObjective");
	expect(mt.length, `vk10-viet: ${o} so-lan lech`).toBe(1);
	expect(mt[0]?.dauVao?.ownerUserId, `vk10-viet: ${o} ownerUserId lech`).toBe(
		nguoi,
	);
}

async function kiemVietBo(): Promise<void> {
	await vietBangPhim();
	kiemMucTieuMoi("mt", "lan");
	const vaoMt = goiCua("okr.createObjective")[0]?.dauVao;
	expect(JSON.stringify(vaoMt?.unit), "vk10-viet: mt unit lech").toBe(
		JSON.stringify({ level: "phong-ban", departmentId: "P1" }),
	);
	expect(vaoMt?.cycleId, "vk10-viet: mt cycleId lech").toBe(KY);
	expect(vaoMt?.kind, "vk10-viet: mt kind lech").toBe("cam-ket");
	expect(vaoMt?.title, "vk10-viet: mt title lech").toBe(TEN_MT);
	const kr = goiCua("okr.createKeyResult");
	KR_VIET.forEach((kv, i) => {
		const vao = kr[i]?.dauVao;
		for (const truong of TRUONG_KR)
			expect(vao?.[truong], `vk10-viet: kr-${i + 1} ${truong} lech`).toBe(
				kv[truong],
			);
		expect(vao?.ownerUserId, `vk10-viet: kr-${i + 1} ownerUserId lech`).toBe(
			"lan",
		);
		expect(vao?.objectiveId, `vk10-viet: kr-${i + 1} objectiveId lech`).toBe(
			MT_MOI,
		);
	});
	expect(kr.length, "vk10-viet: kr-4 goi khi thieu dich").toBe(3);
	const dong4 = qa("[data-tai-lieu-bo] [data-dong-kr-moi]")[3];
	expect(
		dong4?.textContent?.includes(CHU.taiLieu.chuaLuu["thieu-dich"]) ?? false,
		"vk10-viet: kr-4 chua-luu lech",
	).toBe(true);
}

const O_NGUOI = [
	{ o: "truong-tu-soan", tuyChon: { nguoiSoan: LAN }, kv: "lan" },
	{
		o: "quan-tri-soan-pb",
		tuyChon: { nguoiSoan: HUNG, quanTri: true },
		kv: "lan",
	},
	{
		o: "bo-khong-truong",
		tuyChon: {
			don: { loai: "pb", id: "P2" },
			nguoiSoan: HUNG,
			quanTri: true,
		},
		kv: "hung",
	},
] satisfies { o: string; tuyChon: TuyChonBo; kv: string }[];

describe("vk10-viet", () => {
	test("vk10-viet: bo trong, chi ban phim — mot muc tieu, ba KR, KR thieu dich khong goi", async () => {
		await moBoTrong({});
		await kiemVietBo();
	});

	for (const o of O_NGUOI)
		test(`vk10-viet: nguoi phu trach mac dinh — ${o.o}`, async () => {
			await moBoTrong(o.tuyChon);
			await phim(`${TEN_MT}{Enter}`);
			await choLuuXong(`vk10-viet: ${o.o} luu xong`);
			kiemMucTieuMoi(o.o, o.kv);
		});

	test("vk10-viet: mo tu nut Soan bo OKR o cau rong thi focus o dong muc tieu dau", async () => {
		boMau({ muc: [] });
		datGhiMoi();
		await veTrangBo("?donOkr=pb:P1");
		await cho(() => nutRong() !== null, "vk10-viet: nut cau rong");
		await bam(nutRong());
		await choKhung();
		await cho(() => oTenMtDau() !== null, "vk10-viet: dong muc tieu dau");
		await nhip(5);
		expect(
			document.activeElement !== null && document.activeElement === oTenMtDau(),
			"vk10-viet: mo focus lech",
		).toBe(true);
		await phim(`${TEN_MT}{Enter}`);
		await choLuuXong("vk10-viet: cau rong luu xong");
		kiemMucTieuMoi("cau-rong", "lan");
	});

	test("vk10-viet: createKeyResult treo, roi o ba lan — mot lan goi, roi mot updateKeyResult chu moi nhat", async () => {
		await moBoTrong({});
		let traVe: (kq: { id: string; canhBao: null }) => void = () => {};
		dat(
			"okr.createKeyResult",
			() =>
				new Promise((r) => {
					traVe = r;
				}),
		);
		await phim(`${TEN_MT}{Enter}`);
		await phim("Doanh thu ký mới{Tab}2{Tab}3,5{Tab}tỷ ₫");
		const tenMt = oTenMtDau();
		const tenKr = q("[data-tai-lieu-bo] [data-dong-kr-moi] [data-o-nhap=ten]");
		const roiO = async (chu: string | null) => {
			if (chu !== null) {
				await act(async () => {
					(tenKr as HTMLElement | null)?.focus();
				});
				await go(tenKr, chu);
			}
			await act(async () => {
				(tenMt as HTMLElement | null)?.focus();
			});
			await nhip(3);
		};
		await roiO(null);
		await roiO("Doanh thu ký mới lần hai");
		await roiO("Doanh thu ký mới lần ba");
		expect(
			goiCua("okr.createKeyResult").length,
			"vk10-viet: treo so-lan lech",
		).toBe(1);
		expect(
			goiCua("okr.updateKeyResult").length,
			"vk10-viet: treo so-lan lech",
		).toBe(0);
		await act(async () => {
			traVe({ id: "kr-treo", canhBao: null });
		});
		await choLuuXong("vk10-viet: treo luu xong");
		const sua = goiCua("okr.updateKeyResult");
		expect(sua.length, "vk10-viet: treo cap-nhat lech").toBe(1);
		expect(sua[0]?.dauVao?.id, "vk10-viet: treo cap-nhat lech").toBe("kr-treo");
		expect(sua[0]?.dauVao?.title, "vk10-viet: treo cap-nhat lech").toBe(
			"Doanh thu ký mới lần ba",
		);
		expect(
			goiCua("okr.createKeyResult").length,
			"vk10-viet: treo so-lan lech",
		).toBe(1);
	});
});

describe("vk10-viet-do", () => {
	test("vk10-viet-do: suy kieu thay bang hang tang-toi thi kr-2 kind do", async () => {
		await moBoTrong({}, { suyKieu: () => "tang-toi" });
		await expect(kiemVietBo()).rejects.toThrow("vk10-viet: kr-2 kind lech");
	});

	test("vk10-viet-do: bo chan thieu dich thi kr-4 bi goi", async () => {
		await moBoTrong(
			{},
			{
				kiemDong: (d) => {
					const kq = kiemDongKr(d);
					return kq.loai === "chua-luu" && kq.ly === "thieu-dich"
						? { loai: "du", kieu: "tang-toi", khoi: 5, dich: 6 }
						: kq;
				},
			},
		);
		await expect(kiemVietBo()).rejects.toThrow(
			"vk10-viet: kr-4 goi khi thieu dich",
		);
	});
});

const { crmMessages } = await import("@/lib/messages/crm");
const { nut } = await import("./khung-soan-okr");

const CAU_SO = crmMessages("vi").truongKieu.tuChoi.so;

const BO_SUA: MucMau[] = [
	{
		id: "mt-nhap",
		status: "nhap",
		kr: [
			{
				id: "k-n1",
				title: "Doanh thu ký mới",
				startValue: 2,
				targetValue: 5,
				unit: "tỷ ₫",
			},
			{
				id: "k-n2",
				title: "Khách hàng mới",
				startValue: 10,
				targetValue: 20,
				unit: "khách",
			},
		],
		quyen: { xoa: true },
	},
	{
		id: "mt-cong-bo",
		status: "cong-bo",
		kr: [
			{ id: "k-c1", startValue: 1, targetValue: 4, unit: "lần" },
			{
				id: "k-c2",
				title: "Ra mắt cổng tự phục vụ",
				kind: "moc",
				startValue: 0,
				targetValue: 1,
				unit: "",
			},
		],
	},
	{ id: "mt-cho", status: "cho-duyet", kr: [{ id: "k-d1" }] },
];

const DA_BO_SUA: MucMau[] = [{ id: "mt-bo", kr: [{ id: "k-bo" }] }];

const loiMayChu = (message: string) =>
	Object.assign(new Error(message), { data: { code: "BAD_REQUEST" } });

async function focusVao(o: Element | null): Promise<void> {
	await act(async () => {
		(o as HTMLElement | null)?.focus();
	});
	await nhip(3);
}

async function sua(o: Element | null, chu: string): Promise<void> {
	await focusVao(o);
	await go(o, chu);
}

const oTenMt = (id: string) =>
	q(`[data-dong-mt="${id}"] textarea[data-o-nhap=ten]`);
const oKr = (id: string, o: string) =>
	q(`[data-dong-kr="${id}"] [data-o-nhap=${o}]`);
const oNhapCua = (chon: string) =>
	qa(`${chon} textarea, ${chon} input`).filter(
		(e): e is HTMLTextAreaElement | HTMLInputElement =>
			e instanceof HTMLTextAreaElement || e instanceof HTMLInputElement,
	);
const giaTri = (o: Element | null) =>
	o instanceof HTMLTextAreaElement || o instanceof HTMLInputElement
		? o.value
		: null;

async function moBoSua(
	phuThuoc: Partial<PhuThuocSoan> = {},
	muc: MucMau[] = BO_SUA,
): Promise<void> {
	const bo = boMau({ muc, daBo: DA_BO_SUA });
	datGhiMoi();
	await veSoan(bo.khoa, { phuThuoc });
	await choKhung();
	await cho(() => oTenMt("mt-nhap") !== null, "vk10-sua: dong mt-nhap");
}

async function kiemSuaO1(): Promise<void> {
	const sai = "vk10-sua: o1 lech";
	const ten = oTenMt("mt-nhap");
	await sua(ten, "Tăng doanh thu sửa lần một");
	await go(ten, "Tăng doanh thu sửa lần hai");
	await focusVao(oTenMt("mt-cong-bo"));
	await choLuuXong(sai);
	const lan = goiCua("okr.updateObjective");
	expect(lan.length, sai).toBe(1);
	expect(lan[0]?.dauVao?.id, sai).toBe("mt-nhap");
	expect(lan[0]?.dauVao?.title, sai).toBe("Tăng doanh thu sửa lần hai");
}

async function kiemSuaO2(): Promise<void> {
	const sai = "vk10-sua: o2 lech";
	await sua(oKr("k-n1", "ten"), "Doanh thu ký mới khối doanh nghiệp");
	await focusVao(oTenMt("mt-cong-bo"));
	await choLuuXong(sai);
	const lan = goiCua("okr.updateKeyResult");
	expect(lan.length, sai).toBe(1);
	expect(lan[0]?.dauVao?.id, sai).toBe("k-n1");
	expect(lan[0]?.dauVao?.title, sai).toBe("Doanh thu ký mới khối doanh nghiệp");
	expect(
		Object.keys(lan[0]?.dauVao ?? {})
			.sort()
			.join(","),
		sai,
	).toBe("id,title");
}

function kiemSuaO5(): void {
	const sai = "vk10-sua: o5 lech";
	const ten = oTenMt("mt-cong-bo");
	expect(ten instanceof HTMLTextAreaElement && !ten.disabled, sai).toBe(true);
	const so = oNhapCua('[data-dong-mt="mt-cong-bo"] [data-o-so]');
	expect(so.length, sai).toBeGreaterThan(0);
	expect(
		so.every((o) => o.disabled),
		sai,
	).toBe(true);
	expect(
		q('[data-dong-mt="mt-cong-bo"] [data-cau-khoa="so"]')?.textContent ?? null,
		sai,
	).toBe(CHU.taiLieu.khoaSo);
}

async function moMenuMt(id: string, sai: string): Promise<void> {
	const nutMenu = q(`[data-dong-mt="${id}"] [data-nut=menu-muc-tieu]`);
	if (!(nutMenu instanceof HTMLElement)) throw new Error(sai);
	await act(async () => {
		nutMenu.dispatchEvent(
			new PointerEvent("pointerdown", {
				bubbles: true,
				button: 0,
				pointerType: "mouse",
			}),
		);
	});
	await cho(() => q("[data-nut=xoa-muc-tieu]") !== null, sai);
}

describe("vk10-sua", () => {
	test("vk10-sua: o1 sua ten muc tieu nhap roi o — updateObjective dung mot lan", async () => {
		await moBoSua();
		await kiemSuaO1();
	});

	test("vk10-sua: o2 sua ten KR nhap — updateKeyResult dung mot lan, chi truong doi", async () => {
		await moBoSua();
		await kiemSuaO2();
	});

	test("vk10-sua: o3 Backspace o dau dong KR trong — removeKeyResult, focus dong tren", async () => {
		const sai = "vk10-sua: o3 lech";
		await moBoSua();
		for (const o of ["ten", "khoi", "dich", "don-vi"])
			await sua(oKr("k-n2", o), "");
		await focusVao(oKr("k-n2", "ten"));
		await phim("{Backspace}");
		await choLuuXong(sai);
		const lan = goiCua("okr.removeKeyResult");
		expect(lan.length, sai).toBe(1);
		expect(lan[0]?.dauVao?.id, sai).toBe("k-n2");
		expect(q('[data-dong-kr="k-n2"]'), sai).toBeNull();
		expect(
			document.activeElement !== null &&
				document.activeElement === oKr("k-n1", "ten"),
			sai,
		).toBe(true);
		expect(goiGhi().length, sai).toBe(1);
	});

	test("vk10-sua: o4 Xoa muc tieu nhap — ConfirmDialog roi xoaMucTieu", async () => {
		const sai = "vk10-sua: o4 lech";
		await moBoSua();
		await moMenuMt("mt-nhap", sai);
		await bam(q("[data-nut=xoa-muc-tieu]"));
		await cho(() => q("[role=alertdialog]") !== null, sai);
		const hop = q("[role=alertdialog]");
		expect(hop?.textContent ?? "", sai).toContain(
			CHU.taiLieu.hoiXoa.tieuDe("Mục tiêu mt-nhap"),
		);
		expect(goiCua("okr.xoaMucTieu").length, sai).toBe(0);
		await bam(nut(CHU.taiLieu.hoiXoa.nut, hop ?? document.body));
		await choLuuXong(sai);
		const lan = goiCua("okr.xoaMucTieu");
		expect(lan.length, sai).toBe(1);
		expect(lan[0]?.dauVao?.id, sai).toBe("mt-nhap");
		expect(q('[data-dong-mt="mt-nhap"]'), sai).toBeNull();
		expect(q('[data-dong-mt="mt-cong-bo"]') !== null, sai).toBe(true);
	});

	test("vk10-sua: o5-o7 cong bo khoa so, cho duyet khoa ca dong, da bo vang", async () => {
		await moBoSua();
		kiemSuaO5();
		const sai6 = "vk10-sua: o6 lech";
		const cho = oNhapCua('[data-dong-mt="mt-cho"]');
		expect(cho.length, sai6).toBeGreaterThan(1);
		expect(
			cho.every((o) => o.disabled),
			sai6,
		).toBe(true);
		expect(
			q('[data-dong-mt="mt-cho"] [data-cau-khoa="cho-duyet"]')?.textContent ??
				null,
			sai6,
		).toBe(CHU.taiLieu.khoaChoDuyet);
		expect(
			q('[data-dong-mt="mt-cho"] [data-nut=menu-muc-tieu]'),
			sai6,
		).toBeNull();
		expect(q('[data-dong-mt="mt-bo"]'), "vk10-sua: o7 lech").toBeNull();
	});

	test("vk10-sua: rf2 luu loi vi cho duyet — doc lai, khoa ca dong, giu chu, mot lan goi", async () => {
		const sai = "vk10-sua: rf2 lech";
		const sau = boMau({
			muc: BO_SUA.map((m) =>
				m.id === "mt-nhap" ? { ...m, status: "cho-duyet" as const } : m,
			),
			daBo: DA_BO_SUA,
		}).danhSach;
		const bo = boMau({ muc: BO_SUA, daBo: DA_BO_SUA });
		datGhiMoi();
		dat("okr.updateObjective", () => {
			dat("okr.danhSach", () => sau);
			throw loiMayChu("Mục tiêu đang chờ duyệt nên không sửa được.");
		});
		await veSoan(bo.khoa);
		await choKhung();
		const docTruoc = goiCua("okr.danhSach").length;
		await sua(oTenMt("mt-nhap"), "Tăng doanh thu khi đang chờ");
		await focusVao(oTenMt("mt-cong-bo"));
		await choLuuXong(sai);
		await cho(
			() => oNhapCua('[data-dong-mt="mt-nhap"]').every((o) => o.disabled),
			sai,
		);
		expect(goiCua("okr.danhSach").length - docTruoc, sai).toBe(1);
		expect(giaTri(oTenMt("mt-nhap")), sai).toBe("Tăng doanh thu khi đang chờ");
		await focusVao(oTenMt("mt-nhap"));
		await focusVao(oTenMt("mt-cong-bo"));
		await choLuuXong(sai);
		expect(goiCua("okr.updateObjective").length, sai).toBe(1);
	});

	test("vk10-sua: rf4 Backspace o KR trong cua muc tieu cong bo — khong removeKeyResult", async () => {
		const sai = "vk10-sua: rf4 lech";
		await moBoSua();
		await sua(oKr("k-c2", "ten"), "");
		await focusVao(oKr("k-c2", "ten"));
		await phim("{Backspace}");
		await nhip(5);
		expect(goiCua("okr.removeKeyResult").length, sai).toBe(0);
		expect(q('[data-dong-kr="k-c2"]') !== null, sai).toBe(true);
	});
});

describe("vk10-sua-do", () => {
	test("vk10-sua-do: bo khoa so cong bo thi o5 do", async () => {
		await moBoSua({ khoaSoCongBo: false });
		expect(() => kiemSuaO5()).toThrow("vk10-sua: o5 lech");
	});

	test("vk10-sua-do: luu theo phim thi o1 do", async () => {
		await moBoSua({ luuKhi: "moi-phim" });
		await expect(kiemSuaO1()).rejects.toThrow("vk10-sua: o1 lech");
	});
});

async function kiemLuuLoiO3(): Promise<void> {
	const sai = "vk10-tai: o3 lech";
	dat("okr.createKeyResult", () => {
		throw loiMayChu(
			"targetValue: Too big: expected number to be <=1000000000000",
		);
	});
	await phim(`${TEN_MT}{Enter}`);
	await phim("Doanh thu ký mới{Tab}2{Tab}3,5{Tab}tỷ ₫{Enter}");
	await choLuuXong(sai);
	expect(goiCua("okr.createKeyResult").length, sai).toBe(1);
	const dong = qa("[data-tai-lieu-bo] [data-dong-kr-moi]")[0] ?? null;
	const o = (ten: string) =>
		dong?.querySelector(`[data-o-nhap=${ten}]`) ?? null;
	expect(
		["ten", "khoi", "dich", "don-vi"].map((ten) => giaTri(o(ten))).join("|"),
		sai,
	).toBe("Doanh thu ký mới|2|3,5|tỷ ₫");
	expect(dong?.textContent?.includes(CAU_SO) ?? false, sai).toBe(true);
	await focusVao(o("ten"));
	await focusVao(oTenMtDau());
	await choLuuXong(sai);
	expect(goiCua("okr.createKeyResult").length, sai).toBe(2);
}

describe("vk10-tai-luu", () => {
	test("vk10-tai: o3 luu loi sai kieu so — giu chu, cau theo kieu o, roi o lai goi lai mot lan", async () => {
		await moBoTrong({});
		await kiemLuuLoiO3();
	});
});

describe("vk10-tai-luu-do", () => {
	test("vk10-tai-do: loi luu xoa chu dong thi o3 do", async () => {
		await moBoTrong({}, { giuChuKhiLoiLuu: false });
		await expect(kiemLuuLoiO3()).rejects.toThrow("vk10-tai: o3 lech");
	});
});

async function bamLopPhu(): Promise<void> {
	const lop = q("[data-slot='sheet-overlay'],[data-slot='drawer-overlay']");
	if (!(lop instanceof HTMLElement)) throw new Error("khong thay lop phu");
	await act(async () => {
		lop.dispatchEvent(
			new PointerEvent("pointerdown", {
				bubbles: true,
				button: 0,
				pointerType: "mouse",
			}),
		);
		lop.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
		lop.click();
	});
	await nhip(5);
}

async function esc(): Promise<void> {
	await act(async () => {
		(document.activeElement ?? document.body).dispatchEvent(
			new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
		);
	});
	await nhip(5);
}

const khungMo = () => q("[data-khung-soan-bo]") !== null;
const hopHoiDong = () =>
	qa("[role=alertdialog]").find((h) =>
		h.textContent?.includes(CHU.hoiDong.tieuDe),
	) ?? null;

async function vietDongThieuDich(): Promise<void> {
	await phim(`${TEN_MT}{Enter}`);
	await phim("Doanh thu ký mới{Tab}2");
	await choLuuXong("vk10-quyen: dong luu xong");
}

const oDongMoi = (ten: string) =>
	q(`[data-tai-lieu-bo] [data-dong-kr-moi] [data-o-nhap=${ten}]`);

async function kiemHoiKhiDong(): Promise<void> {
	const sai = "vk10-quyen: dong khong hoi";
	await focusVao(oTenMtDau());
	await choLuuXong(sai);
	expect(
		q("[data-tai-lieu-bo] [data-dong-kr-moi]")?.getAttribute("data-luu"),
		"vk10-quyen: dong chua-luu lech",
	).toBe("chua-luu");
	await bamLopPhu();
	expect(khungMo(), sai).toBe(true);
	await esc();
	expect(hopHoiDong() !== null, sai).toBe(true);
	expect(khungMo(), sai).toBe(true);
	await bam(nut(CHU.hoiDong.oLai, hopHoiDong() ?? document.body));
	expect(hopHoiDong(), "vk10-quyen: huy lech").toBeNull();
	expect(khungMo(), "vk10-quyen: huy lech").toBe(true);
	expect(
		[giaTri(oDongMoi("ten")), giaTri(oDongMoi("khoi"))].join("|"),
		"vk10-quyen: huy lech",
	).toBe("Doanh thu ký mới|2");
}

describe("vk10-quyen-dong", () => {
	test("vk10-quyen: dong chua luu — lop phu khong dong, Esc hoi Bo dong chua luu, Huy giu chu", async () => {
		await moBoTrong({});
		await vietDongThieuDich();
		await kiemHoiKhiDong();
	});

	test("vk10-quyen: rf1 focus trong o dich trong, Esc van hoi", async () => {
		const sai = "vk10-quyen: rf1 lech";
		await moBoTrong({});
		await phim(`${TEN_MT}{Enter}`);
		await phim("Doanh thu ký mới{Tab}2{Tab}");
		expect(
			document.activeElement !== null &&
				document.activeElement === oDongMoi("dich"),
			sai,
		).toBe(true);
		await esc();
		expect(hopHoiDong() !== null, sai).toBe(true);
		expect(khungMo(), sai).toBe(true);
	});
});

describe("vk10-quyen-dong-do", () => {
	test("vk10-quyen-do: dong thang khi con dong chua luu", async () => {
		await moBoTrong({}, { hoiKhiDongChuaLuu: false });
		await vietDongThieuDich();
		await expect(kiemHoiKhiDong()).rejects.toThrow(
			"vk10-quyen: dong khong hoi",
		);
	});
});

const { chamBo } = await import("@crm/validation/okr-cham-bo");

const KR_Q1 = {
	id: "k-q1",
	title: "Doanh thu khối doanh nghiệp",
	kind: "tang-toi",
	startValue: 2,
	targetValue: 3.5,
	unit: "tỷ ₫",
} satisfies KrMau;

const KR_Q2 = {
	id: "k-q2",
	title: "Gọi 300 cuộc cho khách tiềm năng",
	kind: "tang-toi",
	startValue: 0,
	targetValue: 300,
	unit: "cuộc",
} satisfies KrMau;

const KR_Q3 = {
	id: "k-q3",
	title: "Tỷ lệ khách hài lòng",
	kind: "giu-tren",
	startValue: 85,
	targetValue: 90,
	unit: "%",
} satisfies KrMau;

const KR_CHAT_LUONG = [KR_Q1, KR_Q2, KR_Q3];

const TEN_MT_CHAT_LUONG = "Tăng doanh thu khối doanh nghiệp";
const TEN_KR_SUA = "Tỷ lệ chuyển đổi khách tiềm năng";

const BO_CHAT_LUONG: MucMau[] = [
	{
		id: "mt-chat-luong",
		title: TEN_MT_CHAT_LUONG,
		status: "nhap",
		kr: KR_CHAT_LUONG,
		quyen: { congBo: true },
	},
];

function chamNoiDung(tenKr2: string) {
	return chamBo([
		{
			title: TEN_MT_CHAT_LUONG,
			whyNow: "",
			keyResults: KR_CHAT_LUONG.map((k) => ({
				title: k.id === "k-q2" ? tenKr2 : k.title,
				kind: k.kind,
				startValue: k.startValue,
				targetValue: k.targetValue,
				ownerUserId: LAN.id,
			})),
		},
	]);
}

const khoiChatLuong = () => q("[data-o=cot-ben] [data-khoi=chat-luong]");
const chuDiem = () =>
	khoiChatLuong()?.querySelector("[data-diem]")?.textContent ?? null;
const diemCon = () => [
	...(khoiChatLuong()?.querySelectorAll("[data-diem-con]") ?? []),
];

async function moBoChatLuong(
	phuThuoc: Partial<PhuThuocSoan> = {},
): Promise<void> {
	const bo = boMau({ muc: BO_CHAT_LUONG });
	datGhiMoi();
	await veSoan(bo.khoa, { phuThuoc });
	await choKhung();
	await cho(
		() => khoiChatLuong()?.querySelector("[data-diem]") != null,
		"vk10-chat-luong: khoi lech",
	);
}

async function goNgay(o: Element | null, chuMoi: string): Promise<void> {
	if (!(o instanceof HTMLTextAreaElement))
		throw new Error("vk10-chat-luong: o ten lech");
	const datGia = Object.getOwnPropertyDescriptor(
		HTMLTextAreaElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		datGia?.call(o, chuMoi);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

function kiemDiemCon(
	kq: ReturnType<typeof chamBo>,
	buoc: string,
	tenKr2: string,
): void {
	const sai = `vk10-chat-luong: ${buoc} diem-con lech`;
	const dong = diemCon();
	expect(dong.length, sai).toBe(kq.loi.length);
	kq.loi.forEach((loi, i) => {
		const chuDong = dong[i]?.textContent ?? "";
		const kr = loi.kr === null ? null : KR_CHAT_LUONG[loi.kr];
		const tenDong = kr?.id === "k-q2" ? tenKr2 : kr?.title;
		expect(chuDong.includes(CHU.chatLuong.luat[loi.ma]), sai).toBe(true);
		expect(chuDong.includes(tenDong ?? TEN_MT_CHAT_LUONG), sai).toBe(true);
	});
}

async function kiemChatLuong(): Promise<void> {
	const truoc = chamNoiDung(KR_Q2.title);
	expect(truoc.dat < truoc.xet, "vk10-chat-luong: fixture lech").toBe(true);
	expect(chuDiem(), "vk10-chat-luong: diem lech").toBe(
		CHU.chatLuong.dat(String(truoc.dat), String(truoc.xet)),
	);
	expect(
		khoiChatLuong()?.querySelector("[data-slot=kara-mark]") ?? null,
		"vk10-chat-luong: dau kara lech",
	).toBeNull();
	kiemDiemCon(truoc, "truoc", KR_Q2.title);

	const viTriViec = truoc.loi.findIndex(
		(l) => l.ma === "kr-la-viec" && l.kr === 1,
	);
	const nutDen = diemCon()[viTriViec]?.querySelector("[data-nut=den-dong]");
	expect(nutDen?.textContent, "vk10-chat-luong: nut den dong lech").toBe(
		CHU.chatLuong.denDong,
	);
	await bam(nutDen ?? null);
	expect(
		document.activeElement !== null &&
			document.activeElement === oKr("k-q2", "ten"),
		"vk10-chat-luong: den dong sai o",
	).toBe(true);

	const soGoi = goi.length;
	await goNgay(oKr("k-q2", "ten"), TEN_KR_SUA);
	const sau = chamNoiDung(TEN_KR_SUA);
	expect(sau.dat, "vk10-chat-luong: fixture sau lech").toBe(truoc.dat + 1);
	expect(chuDiem(), "vk10-chat-luong: khong cap nhat").toBe(
		CHU.chatLuong.dat(String(sau.dat), String(sau.xet)),
	);
	expect(goi.length, "vk10-chat-luong: goi may chu lech").toBe(soGoi);
	kiemDiemCon(sau, "sau", TEN_KR_SUA);
}

describe("vk10-chat-luong", () => {
	test("vk10-chat-luong: N tren M bang ham cham tren noi dung dang hien, doi ngay khi go, den dong dung o", async () => {
		await moBoChatLuong();
		await kiemChatLuong();
	});

	test("vk10-chat-luong: 12 tren 12 khi hai KR tang toi va mot KR giu tren khong loi", () => {
		const kq = chamBo([
			{
				title: TEN_MT_CHAT_LUONG,
				whyNow: "",
				keyResults: [
					{ ...KR_Q1, ownerUserId: LAN.id },
					{
						...KR_Q1,
						title: "Khách hàng doanh nghiệp mới",
						ownerUserId: LAN.id,
					},
					{ ...KR_Q3, ownerUserId: LAN.id },
				],
			},
		]);
		expect(
			CHU.chatLuong.dat(String(kq.dat), String(kq.xet)),
			"vk10-chat-luong: vi du hop dong lech",
		).toBe("12 trên 12 điểm đạt");
	});

	test("vk10-chat-luong: bo trong thi cau go muc tieu dau tien", async () => {
		await moBoTrong({});
		expect(
			khoiChatLuong()?.querySelector("[data-cham-trong]")?.textContent ?? null,
			"vk10-chat-luong: bo trong lech",
		).toBe(CHU.chatLuong.chuaCo);
	});
});

async function bamThe(ten: string): Promise<void> {
	const the = qa("[role=tab]").find((t) => t.textContent === ten);
	if (!(the instanceof HTMLElement)) throw new Error(`khong thay the ${ten}`);
	await act(async () => {
		the.dispatchEvent(
			new MouseEvent("mousedown", { bubbles: true, button: 0 }),
		);
	});
	await nhip(3);
}

async function voiKhoHep(viec: () => Promise<void>): Promise<void> {
	const goc = window.matchMedia;
	const hep = (query: string) => ({ ...goc(query), matches: true });
	Object.defineProperty(window, "matchMedia", {
		value: hep,
		writable: true,
		configurable: true,
	});
	try {
		await viec();
	} finally {
		Object.defineProperty(window, "matchMedia", {
			value: goc,
			writable: true,
			configurable: true,
		});
	}
}

describe("vk10-chat-luong-hep", () => {
	test("vk10-chat-luong: kho hep — Den dong o the cot ben chuyen ve the Bo OKR va focus dung o", async () => {
		await voiKhoHep(async () => {
			const sai = "vk10-chat-luong: hep den dong lech";
			const bo = boMau({ muc: BO_CHAT_LUONG });
			datGhiMoi();
			await veSoan(bo.khoa);
			await choKhung();
			await cho(() => q("[data-khung=hep]") !== null, sai);
			await bamThe(CHU.theSoan.cotBen);
			const nutDen = q(
				"[data-khoi=chat-luong] [data-diem-con^='kr-la-viec:0:1'] [data-nut=den-dong]",
			);
			await bam(nutDen);
			expect(
				document.activeElement !== null &&
					document.activeElement === oKr("k-q2", "ten"),
				sai,
			).toBe(true);
		});
	});
});

describe("vk10-chat-luong-do", () => {
	test("vk10-chat-luong-do: diem doc tu hang thay vi ham cham thi khong cap nhat", async () => {
		const hang = chamNoiDung(KR_Q2.title);
		await moBoChatLuong({ chamBo: () => hang });
		await expect(kiemChatLuong()).rejects.toThrow(
			"vk10-chat-luong: khong cap nhat",
		);
	});

	test("vk10-chat-luong-do: den dong tro o dau tien thi sai o", async () => {
		await moBoChatLuong({
			oDenDong: (goc) => {
				const o = goc.querySelector("[data-o-nhap]");
				return o instanceof HTMLElement ? o : null;
			},
		});
		await expect(kiemChatLuong()).rejects.toThrow(
			"vk10-chat-luong: den dong sai o",
		);
	});
});

const {
	dongHien,
	troLyDanhSachOutput,
	troLyDeXuatOutput,
	troLyQuyetOutput,
	troLySanSangOutput,
} = await import("../../api/src/okr/okr.contracts");
const { okrGopYMessages } = await import("@/lib/messages/okr-gop-y");

const CHU_GOP_Y = okrGopYMessages("vi");

type SanSangGia = z.input<typeof troLySanSangOutput>;
type LyDoGia = z.input<typeof troLyDanhSachOutput>["lyDo"];

const KARA_TAT: SanSangGia = { bat: false, lyDo: "don-vi-chua-bat" };

beforeEach(() => {
	dat("okr.troLySanSang", () => troLySanSangOutput.parse(KARA_TAT));
	dat("okr.troLyDanhSach", () =>
		troLyDanhSachOutput.parse({
			dong: [],
			dangSoan: false,
			maKetThuc: null,
			docLuc: null,
			lyDo: KARA_TAT.bat ? null : KARA_TAT.lyDo,
		}),
	);
});

const KR_DOI = {
	truoc: "Gọi 300 cuộc cho khách tiềm năng",
	sau: "Khách tiềm năng đồng ý gặp lần hai",
};

const BO_GOP_Y: MucMau[] = [
	{
		id: "mt-g1",
		title: "Mở rộng tệp khách doanh nghiệp ở miền Bắc",
		kr: [
			{ id: "k-g1", title: KR_DOI.truoc, startValue: 0, targetValue: 300 },
			{
				id: "k-g2",
				title: "Doanh thu khách mới",
				startValue: 2,
				targetValue: 5,
			},
		],
	},
	{
		id: "mt-g2",
		title: "Giữ chân khách hàng hiện có",
		kr: [
			{
				id: "k-g3",
				title: "Làm 20 buổi thăm khách",
				startValue: 0,
				targetValue: 20,
			},
			{
				id: "k-g4",
				title: "Tỷ lệ gia hạn hợp đồng",
				startValue: 70,
				targetValue: 90,
			},
		],
	},
];

const DE_XUAT_BO = [
	dongHien.parse({
		id: "dx-1",
		loai: "viet-lai",
		objectiveId: "mt-g1",
		keyResultId: "k-g1",
		truong: "kr.title",
		truoc: KR_DOI.truoc,
		sau: KR_DOI.sau,
		maVanDe: "kr-la-viec",
		targetObjectiveId: null,
		targetKeyResultId: null,
		lyDo: "Số cuộc gọi là việc; số khách gặp lần hai đo được kết quả.",
		canCu: null,
		tenDich: null,
	}),
	dongHien.parse({
		id: "dx-2",
		loai: "viet-lai",
		objectiveId: "mt-g2",
		keyResultId: "k-g3",
		truong: "kr.title",
		truoc: "Làm 20 buổi thăm khách",
		sau: "Khách được thăm gia hạn trước hạn",
		maVanDe: "kr-la-viec",
		targetObjectiveId: null,
		targetKeyResultId: null,
		lyDo: "Buổi thăm là việc; gia hạn là kết quả.",
		canCu: null,
		tenDich: null,
	}),
];

const vaoMucTieu = z.object({ objectiveId: z.string() });
const mucTieuCua = (vao: DauVao): string | null => {
	const kq = vaoMucTieu.safeParse(vao);
	return kq.success ? kq.data.objectiveId : null;
};

type KaraGia = {
	daDoc: boolean;
	tha: (() => void)[];
	mocDanhSach: number | null;
};

function datKara({
	sanSang = { bat: true, conLaiUsd: 5 },
	lyDo = null,
	maKetThuc = null,
}: {
	sanSang?: SanSangGia;
	lyDo?: LyDoGia;
	maKetThuc?: string | null;
} = {}): KaraGia {
	const kara: KaraGia = { daDoc: false, tha: [], mocDanhSach: null };
	dat("okr.troLySanSang", () => troLySanSangOutput.parse(sanSang));
	dat("okr.troLyDanhSach", (vao) =>
		troLyDanhSachOutput.parse({
			dong: kara.daDoc
				? DE_XUAT_BO.filter((d) => d.objectiveId === mucTieuCua(vao))
				: [],
			dangSoan: false,
			maKetThuc: kara.daDoc ? "da-nop" : maKetThuc,
			docLuc: kara.daDoc ? "2026-10-25T02:12:00.000Z" : null,
			lyDo,
		}),
	);
	dat(
		"okr.troLyDeXuat",
		() =>
			new Promise((xong) => {
				kara.tha.push(() =>
					xong(
						troLyDeXuatOutput.parse({
							bat: true,
							taskId: "viec-1",
							dungLai: false,
						}),
					),
				);
			}),
	);
	dat("okr.troLyQuyet", () => troLyQuyetOutput.parse({ ok: true }));
	dat("okr.updateKeyResult", (vao) => ({ id: idCua(vao) }));
	return kara;
}

const cotBen = () => q("[data-o=cot-ben]");
const khoiGopY = () => q("[data-o=cot-ben] [data-khoi=gop-y-kara]");
const nutDocBo = () => q("[data-o=cot-ben] [data-nut=nho-kara-doc]");
const chuDiemCot = () =>
	cotBen()?.querySelector("[data-khoi=chat-luong] [data-diem]")?.textContent ??
	null;

async function choGio(xong: () => boolean, sai: string, ms = 4000) {
	const het = Date.now() + ms;
	while (Date.now() < het) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 50));
		});
	}
	if (!xong()) throw new Error(sai);
}

async function moBoGopY(
	phuThuoc: Partial<PhuThuocSoan>,
	kara: () => KaraGia,
): Promise<KaraGia> {
	const bo = boMau({ muc: BO_GOP_Y });
	const k = kara();
	await veSoan(bo.khoa, { phuThuoc });
	await choKhung();
	return k;
}

async function buocGopY(kara: KaraGia): Promise<void> {
	await cho(() => nutDocBo() !== null, "vk10-gop-y: nut doc bo lech");
	expect(nutDocBo()?.textContent, "vk10-gop-y: nut doc bo lech").toBe(
		CHU.gopY.nhoDoc,
	);
	await bam(nutDocBo());
	await cho(
		() => goiCua("okr.troLyDeXuat").length >= 2,
		"vk10-gop-y: de-xuat lech",
	);
	const daNho = goiCua("okr.troLyDeXuat").map((g) => mucTieuCua(g.dauVao));
	expect(daNho.length, "vk10-gop-y: de-xuat lech").toBe(2);
	expect(new Set(daNho), "vk10-gop-y: de-xuat lech").toEqual(
		new Set(["mt-g1", "mt-g2"]),
	);
	await choGio(
		() => (khoiGopY()?.textContent ?? "").includes(CHU.gopY.dangDoc),
		"vk10-gop-y: dang doc lech",
	);

	kara.daDoc = true;
	kara.mocDanhSach = goiCua("okr.troLyDanhSach").length;
	await act(async () => {
		for (const tha of kara.tha.splice(0)) tha();
	});
	await cho(
		() => qa("[data-o=cot-ben] [data-gop-y]").length === 2,
		"vk10-gop-y: the lech",
	);
	const nhom = qa("[data-o=cot-ben] [data-slot=kara-proposal-group]");
	expect(nhom.length, "vk10-gop-y: nhom lech").toBe(1);
	expect(nhom[0]?.closest("[hidden]") ?? null, "vk10-gop-y: nhom lech").toBe(
		null,
	);
	expect(
		nhom[0]?.querySelectorAll("[data-gop-y]").length,
		"vk10-gop-y: the lech",
	).toBe(2);
	expect(
		khoiGopY()?.querySelectorAll("[data-slot=kara-label]").length,
		"vk10-gop-y: nhan lech",
	).toBe(1);
	expect(
		khoiGopY()?.querySelectorAll("[data-slot=kara-mark]").length,
		"vk10-gop-y: nhan lech",
	).toBe(1);

	const nutNhan = q('[data-gop-y="dx-1"] [data-hanh-dong=nhan]');
	expect(nutNhan?.textContent, "vk10-gop-y: nut nhan lech").toBe(
		CHU_GOP_Y.de.doiTenKr,
	);
	await bam(nutNhan);
	await cho(
		() => goiCua("okr.troLyQuyet").length === 1,
		"vk10-gop-y: quyet lech",
	);
	expect(
		goiCua("okr.troLyQuyet")[0]?.dauVao,
		"vk10-gop-y: quyet lech",
	).toMatchObject({ deXuatId: "dx-1", cach: "nhan" });
	await cho(
		() => q('[data-gop-y="dx-1"] [data-slot=proposed-change-receipt]') !== null,
		"vk10-gop-y: bien nhan lech",
	);
	await nhip(5);
	expect(giaTri(oKr("k-g1", "ten")), "vk10-gop-y: dong khong doi").toBe(
		KR_DOI.sau,
	);
	expect(
		q('[data-dong-kr="k-g1"] [data-slot=kara-trace]') !== null,
		"vk10-gop-y: dau lech",
	).toBe(true);
	expect(
		q('[data-dong-kr="k-g1"] [data-slot=kara-trace]')?.textContent ?? "",
		"vk10-gop-y: dau lech",
	).toContain(CHU.taiLieu.theoKara);

	const nutHoan = q(
		'[data-gop-y="dx-1"] [data-slot=proposed-change-receipt] button',
	);
	expect(nutHoan !== null, "vk10-gop-y: hoan tac lech").toBe(true);
	await bam(nutHoan);
	await cho(
		() => goiCua("okr.updateKeyResult").length === 1,
		"vk10-gop-y: hoan tac lech",
	);
	expect(
		goiCua("okr.updateKeyResult")[0]?.dauVao,
		"vk10-gop-y: hoan tac lech",
	).toEqual({ id: "k-g1", title: KR_DOI.truoc });
	await cho(
		() => giaTri(oKr("k-g1", "ten")) === KR_DOI.truoc,
		"vk10-gop-y: dong ve cu lech",
	);
	expect(
		q('[data-dong-kr="k-g1"] [data-slot=kara-trace]'),
		"vk10-gop-y: dau sau hoan tac lech",
	).toBeNull();
}

async function choHetHoi(kara: KaraGia): Promise<void> {
	const moc = kara.mocDanhSach;
	if (moc === null) return;
	await choGio(
		() => goiCua("okr.troLyDanhSach").length >= moc + 4,
		"vk10-gop-y: hoi lai lech",
	).catch(() => undefined);
}

async function kiemGopY(phuThuoc: Partial<PhuThuocSoan> = {}): Promise<void> {
	const kara = await moBoGopY(phuThuoc, () => datKara());
	try {
		await buocGopY(kara);
	} finally {
		await choHetHoi(kara);
	}
}

const O_KARA = [
	{
		o: "tat",
		sanSang: { bat: false, lyDo: "don-vi-chua-bat" },
		lyDo: "don-vi-chua-bat",
		maKetThuc: null,
		kind: "unconfigured",
	},
	{
		o: "het-luot",
		sanSang: { bat: false, lyDo: "het-tran-ngay" },
		lyDo: "het-tran-ngay",
		maKetThuc: null,
		kind: "off",
	},
	{
		o: "loi",
		sanSang: { bat: true, conLaiUsd: 5 },
		lyDo: null,
		maKetThuc: "loi",
		kind: "error",
	},
] as const satisfies readonly {
	o: string;
	sanSang: SanSangGia;
	lyDo: LyDoGia;
	maKetThuc: string | null;
	kind: string;
}[];

async function kiemOKara(
	o: (typeof O_KARA)[number],
	phuThuoc: Partial<PhuThuocSoan> = {},
): Promise<void> {
	await moBoGopY(phuThuoc, () =>
		datKara({ sanSang: o.sanSang, lyDo: o.lyDo, maKetThuc: o.maKetThuc }),
	);
	await cho(
		() => khoiGopY()?.querySelector(`[data-kara-state=${o.kind}]`) != null,
		`vk10-gop-y: ${o.o} trang thai lech`,
	);
	expect(
		khoiGopY()?.querySelectorAll("[data-kara-state]").length,
		`vk10-gop-y: ${o.o} trang thai lech`,
	).toBe(1);
	expect(
		goiCua("okr.troLyDeXuat").length,
		`vk10-gop-y: ${o.o} de-xuat lech`,
	).toBe(0);
	expect(chuDiemCot() ?? "", `vk10-gop-y: ${o.o} an chat luong`).toMatch(
		/^\d+ trên \d+ điểm đạt$/,
	);
}

describe("vk10-gop-y", () => {
	test("vk10-gop-y: nho Kara doc bo — moi muc tieu mot lan, mot nhom, nhan doi dong ngay, hoan tac ve chu cu", async () => {
		await kiemGopY();
	});

	for (const o of O_KARA)
		test(`vk10-gop-y: ma tran Kara ${o.o} — KaraState ${o.kind}, khoi Chat luong van cham`, async () => {
			await kiemOKara(o);
		});
});

describe("vk10-gop-y-do", () => {
	test("vk10-gop-y-do: tai lieu khong doc lai de xuat da nhan thi dong khong doi", async () => {
		await expect(kiemGopY({ docLaiSauNhan: false })).rejects.toThrow(
			"vk10-gop-y: dong khong doi",
		);
	});

	test("vk10-gop-y-do: Kara tat ma khoi Chat luong bi an", async () => {
		const tat = O_KARA[0];
		expect(tat.o, "vk10-gop-y: tat lech").toBe("tat");
		await expect(kiemOKara(tat, { chatLuongKhiKaraTat: "an" })).rejects.toThrow(
			"vk10-gop-y: tat an chat luong",
		);
	});
});

const nutCongBo = () => q("[data-o=tai-lieu] [data-nut=cong-bo-bo]");

describe("vk10-chat-luong-cong-bo", () => {
	test("vk10-chat-luong: nut Cong bo 1 muc tieu bat du diem N < M", async () => {
		const sai = "vk10-chat-luong: cong bo lech";
		await moBoChatLuong();
		const kq = chamNoiDung(KR_Q2.title);
		expect(kq.dat < kq.xet, "vk10-chat-luong: fixture lech").toBe(true);
		await cho(() => nutCongBo() !== null, sai);
		expect(nutCongBo()?.textContent, sai).toBe(CHU.congBo.nut("1"));
		expect(nutCongBo()?.hasAttribute("disabled"), sai).toBe(false);
	});
});

const { okrMessages } = await import("@/lib/messages/okr");

const CAU_KHOA_KHOI_DIEM = okrMessages("vi").sheet.hoiCongBo.body;

type QuyenGia = Partial<ObjectiveOutput["quyen"]>;

const QUYEN_CONG_BO: QuyenGia = { congBo: true };
const QUYEN_GUI_DUYET: QuyenGia = { guiDuyet: true };

const TEN_MT_GO = "Mở rộng khách doanh nghiệp miền Nam";
const TEN_KR_GO = "Khách doanh nghiệp mới ký hợp đồng";
const TEN_MT_CO_SAN = "Giữ chân khách hàng hiện có";
const TEN_MT_CHUA_KR = "Chuẩn hoá quy trình bàn giao";

function boCongBo(quyen: QuyenGia): MucMau[] {
	return [
		{
			id: "mt-cb",
			title: "Tăng doanh thu khối doanh nghiệp",
			status: "cong-bo",
			kr: [{ id: "k-cb" }],
		},
		{
			id: "mt-c1",
			title: TEN_MT_CO_SAN,
			status: "nhap",
			kr: [{ id: "k-c1", title: "Tỷ lệ gia hạn hợp đồng", owner: LAN }],
			quyen,
		},
		{
			id: "mt-c0",
			title: TEN_MT_CHUA_KR,
			status: "nhap",
			kr: [],
			quyen,
		},
	];
}

function datObjectiveMoi(bo: ReturnType<typeof boMau>, quyen: QuyenGia): void {
	const moi = chiTiet(
		mucMau(
			{ id: MT_MOI, title: TEN_MT_GO, kr: [{ id: "kr-moi-1" }] },
			{ loai: "pb", id: "P1" },
			true,
		),
		quyen,
	);
	dat("okr.objective", (vao) => {
		const id = idCua(vao);
		if (id === MT_MOI) return moi;
		return id ? (bo.chiTiet.get(id) ?? null) : null;
	});
}

async function moBoCongBo(
	quyen: QuyenGia,
	phuThuoc: Partial<PhuThuocSoan> = {},
): Promise<void> {
	const bo = boMau({
		muc: boCongBo(quyen),
		nguoiSoan: HUNG,
		quanTri: true,
	});
	datGhiMoi();
	datObjectiveMoi(bo, quyen);
	dat("okr.publishObjective", (vao) => ({ id: idCua(vao), canhBao: null }));
	dat("okr.guiDuyet", (vao) => ({ id: idCua(vao) }));
	await veSoan(bo.khoa, { phuThuoc });
	await choKhung();
	await bam(q("[data-nut=them-muc-tieu-bo]"));
	await cho(
		() =>
			document.activeElement !== null && document.activeElement === oTenMtDau(),
		"vk10-cong-bo: dong moi lech",
	);
	await phim(`${TEN_MT_GO}{Enter}`);
	await phim(`${TEN_KR_GO}{Tab}0{Tab}40{Tab}khách{Enter}`);
	await choLuuXong("vk10-cong-bo: luu lech");
	expect(
		goiCua("okr.createKeyResult").length,
		"vk10-cong-bo: fixture lech",
	).toBe(1);
}

const hopCongBo = () => q("[role=alertdialog]");
const mucTrongHop = () => qa("[role=alertdialog] [data-muc-cong-bo]");
const oTichCua = (id: string) =>
	q(`[role=alertdialog] [data-muc-cong-bo="${id}"] [data-slot=checkbox]`);
const nutXacNhan = () =>
	q("[role=alertdialog] [data-slot=alert-dialog-action]");
const idGoi = (duong: string) =>
	goiCua(duong)
		.map((g) => idCua(g.dauVao) ?? "")
		.sort()
		.join(",");

async function moHopCongBo(o: string, nhan: string): Promise<void> {
	const sai = `vk10-cong-bo: ${o} lech`;
	await cho(() => nutCongBo()?.textContent === nhan, sai);
	expect(nutCongBo()?.hasAttribute("disabled"), sai).toBe(false);
	await bam(nutCongBo());
	await cho(() => hopCongBo() !== null, sai);
}

async function xacNhan(o: string): Promise<void> {
	const nut = nutXacNhan();
	if (nut === null) throw new Error(`vk10-cong-bo: ${o} lech`);
	await bam(nut);
	await cho(() => hopCongBo() === null, `vk10-cong-bo: ${o} lech`);
}

async function kiemO1(): Promise<void> {
	const sai = "vk10-cong-bo: o1 lech";
	await moHopCongBo("o1", CHU.congBo.nut("2"));
	const ten = mucTrongHop()
		.map((e) => e.textContent ?? "")
		.sort()
		.join("|");
	expect(ten, sai).toBe([TEN_MT_CO_SAN, TEN_MT_GO].sort().join("|"));
	for (const id of ["mt-c1", MT_MOI])
		expect(oTichCua(id)?.getAttribute("data-state"), sai).toBe("checked");
	expect(hopCongBo()?.textContent ?? "", sai).toContain(CAU_KHOA_KHOI_DIEM);
	const oLai = q("[role=alertdialog] [data-o-lai-nhap]")?.textContent ?? "";
	expect(oLai, sai).toContain(CHU.congBo.hoi.oLaiNhap);
	expect(oLai, sai).toContain(TEN_MT_CHUA_KR);
	expect(nutXacNhan()?.textContent, sai).toBe(CHU.congBo.nut("2"));
	await xacNhan("o1");
	await cho(() => goiCua("okr.publishObjective").length === 2, sai);
	await nhip(5);
	expect(idGoi("okr.publishObjective"), sai).toBe(
		["mt-c1", MT_MOI].sort().join(","),
	);
	expect(goiCua("okr.guiDuyet").length, sai).toBe(0);
}

async function kiemO4(): Promise<void> {
	const sai = "vk10-cong-bo: o4 lech";
	await cho(() => q("[data-bien-nhan-cong-bo]") !== null, sai);
	const bienNhan = q("[data-bien-nhan-cong-bo]");
	expect(bienNhan?.textContent ?? "", sai).toContain(CHU.congBo.daCongBo("2"));
	expect(nutCongBo(), sai).toBeNull();
	const ve = q("[data-bien-nhan-cong-bo] [data-nut=ve-theo-doi]");
	expect(ve?.textContent, sai).toBe(CHU.congBo.veTheoDoi);
	await bam(ve);
	await cho(() => doRecord() === "", sai);
}

async function kiemO1b(): Promise<void> {
	const sai = "vk10-cong-bo: o1b lech";
	await moHopCongBo("o1b", CHU.congBo.nut("2"));
	await bam(oTichCua("mt-c1"));
	expect(oTichCua("mt-c1")?.getAttribute("data-state"), sai).toBe("unchecked");
	expect(nutXacNhan()?.textContent, sai).toBe(CHU.congBo.nut("1"));
	await xacNhan("o1b");
	await cho(() => goiCua("okr.publishObjective").length >= 1, sai);
	await nhip(5);
	expect(idGoi("okr.publishObjective"), sai).toBe(MT_MOI);
	await cho(
		() =>
			(q("[data-bien-nhan-cong-bo]")?.textContent ?? "").includes(
				CHU.congBo.daCongBo("1"),
			),
		sai,
	);
}

async function kiemO2(): Promise<void> {
	const sai = "vk10-cong-bo: o2 lech";
	await moHopCongBo("o2", CHU.congBo.nutGuiDuyet("2"));
	expect(nutXacNhan()?.textContent, sai).toBe(CHU.congBo.nutGuiDuyet("2"));
	await xacNhan("o2");
	await cho(() => goiCua("okr.guiDuyet").length === 2, sai);
	await nhip(5);
	expect(idGoi("okr.guiDuyet"), sai).toBe(["mt-c1", MT_MOI].sort().join(","));
	expect(goiCua("okr.publishObjective").length, sai).toBe(0);
	await cho(
		() =>
			(q("[data-bien-nhan-cong-bo]")?.textContent ?? "").includes(
				CHU.congBo.daGuiDuyet("2"),
			),
		sai,
	);
}

function datLoiLanHai(): void {
	let lan = 0;
	dat("okr.publishObjective", (vao) => {
		lan += 1;
		if (lan === 2) throw new Error("Máy chủ không trả lời");
		return { id: idCua(vao), canhBao: null };
	});
}

const ketQua = (id: string) =>
	q(`[data-ket-qua-cong-bo] [data-ket-qua="${id}"]`);

async function kiemO3(): Promise<void> {
	const sai = "vk10-cong-bo: o3 lech";
	datLoiLanHai();
	await moHopCongBo("o3", CHU.congBo.nut("2"));
	await xacNhan("o3");
	await cho(() => goiCua("okr.publishObjective").length === 2, sai);
	await cho(() => q("[data-ket-qua-cong-bo]") !== null, sai);
	const thuNhat = goiCua("okr.publishObjective")[0];
	const thuHai = goiCua("okr.publishObjective")[1];
	const idMot = thuNhat ? idCua(thuNhat.dauVao) : null;
	const idHai = thuHai ? idCua(thuHai.dauVao) : null;
	if (idMot === null || idHai === null) throw new Error(sai);
	expect(ketQua(idMot)?.getAttribute("data-trang"), sai).toBe("xong");
	expect(ketQua(idHai)?.getAttribute("data-trang"), sai).toBe("loi");
	const tenHai = idHai === MT_MOI ? TEN_MT_GO : TEN_MT_CO_SAN;
	expect(ketQua(idHai)?.textContent ?? "", sai).toContain(tenHai);
	const thuLai = ketQua(idHai)?.querySelector("[data-nut=thu-lai-cong-bo]");
	expect(thuLai?.textContent, sai).toBe(CHU.congBo.thuLai);
	expect(q("[data-bien-nhan-cong-bo]"), sai).toBeNull();
	await bam(thuLai ?? null);
	await cho(() => goiCua("okr.publishObjective").length === 3, sai);
	await nhip(5);
	const lanBa = goiCua("okr.publishObjective")[2];
	expect(lanBa ? idCua(lanBa.dauVao) : null, sai).toBe(idHai);
	await cho(
		() =>
			(q("[data-bien-nhan-cong-bo]")?.textContent ?? "").includes(
				CHU.congBo.daCongBo("2"),
			),
		sai,
	);
}

describe("vk10-cong-bo", () => {
	test("vk10-cong-bo: o1 va o4 — dem hai muc nhap du KR, hop liet ten va o tich, cong bo dung hai id, bien nhan ve man theo doi", async () => {
		await moBoCongBo(QUYEN_CONG_BO);
		await kiemO1();
		await kiemO4();
	});

	test("vk10-cong-bo: o1b — bo tich muc co san, chi cong bo muc vua go", async () => {
		await moBoCongBo(QUYEN_CONG_BO);
		await kiemO1b();
	});

	test("vk10-cong-bo: o2 — cong bo can duyet, nguoi bam khong duyet duoc thi gui duyet", async () => {
		await moBoCongBo(QUYEN_GUI_DUYET);
		await kiemO2();
	});

	test("vk10-cong-bo: o3 — lan hai loi, lan mot van cong bo, Thu lai chi goi lai id loi", async () => {
		await moBoCongBo(QUYEN_CONG_BO);
		await kiemO3();
	});
});

describe("vk10-cong-bo-do", () => {
	test("vk10-cong-bo-do: dem gom ca muc chua co KR thi o1 do", async () => {
		await moBoCongBo(QUYEN_CONG_BO, {
			demCongBo: (ds) => ds.filter((d) => d.status === "nhap").length,
		});
		await expect(kiemO1()).rejects.toThrow("vk10-cong-bo: o1 lech");
	});

	test("vk10-cong-bo-do: cong bo tat ca bo qua o tich thi o1b do", async () => {
		await moBoCongBo(QUYEN_CONG_BO, { goiTheoOTich: false });
		await expect(kiemO1b()).rejects.toThrow("vk10-cong-bo: o1b lech");
	});

	test("vk10-cong-bo-do: loi lan hai hoan tac lan mot tren man thi o3 do", async () => {
		await moBoCongBo(QUYEN_CONG_BO, { giuKetQuaKhiLoi: false });
		await expect(kiemO3()).rejects.toThrow("vk10-cong-bo: o3 lech");
	});
});
