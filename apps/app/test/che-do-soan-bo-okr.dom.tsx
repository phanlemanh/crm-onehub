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
import { type DauVao, dat, datLai, don, goi, mo, nhip } from "./khung-soan-okr";

const { RecordSheetHost } = await import(
	"@/components/crm/record-sheet/record-sheet-host"
);
const { docKhoaBo, taoKhoaBo } = await import(
	"@/app/(app)/[slug]/okr/soan-bo/khoa-bo"
);

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

export async function veSoan(khoaBo: string): Promise<void> {
	await mo(
		<RecordSheetHost cauNoiOkr />,
		`?record=${encodeURIComponent(`soan-bo:${khoaBo}`)}`,
	);
	await nhip(10);
}

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
