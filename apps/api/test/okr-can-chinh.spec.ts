import { describe, expect, test } from "bun:test";
import { dungCayCanChinh } from "../src/okr/can-chinh";
import type {
	KrOutput,
	MucTieuOutput,
	NutCanChinh,
} from "../src/okr/okr.contracts";

const nguoi = { id: "u1", name: "Người một", email: "u1@thu.test" };

function kr(id: string, objectiveId: string, progress: number): KrOutput {
	return {
		id,
		objectiveId,
		title: `KR ${id}`,
		kind: "tang-toi",
		owner: nguoi,
		startValue: 0,
		targetValue: 100,
		currentValue: progress,
		unit: "",
		dueOn: null,
		weight: 1,
		source: "tay",
		doCanh: false,
		soMay: null,
		nguonMay: null,
		startLocked: true,
		progress,
		laCuaToi: false,
		hienTaiQuaCapNhat: false,
	};
}

type Gop = { objectiveId: string; keyResultId: string | null };

function mt(
	id: string,
	level: MucTieuOutput["level"],
	unitName: string,
	them: {
		progress?: number;
		status?: MucTieuOutput["status"];
		keyResults?: KrOutput[];
		gop?: Gop[];
	} = {},
): MucTieuOutput {
	return {
		id,
		cycleId: "q4",
		level,
		unitId: level === "onehub" ? null : `dv-${id}`,
		unitName,
		title: `Mục tiêu ${id}`,
		kind: "cam-ket",
		status: them.status ?? "cong-bo",
		owner: nguoi,
		participants: [],
		whyNow: "",
		publishedAt: "2026-10-01T00:00:00.000Z",
		droppedAt: null,
		progress: them.progress ?? 0,
		expected: null,
		keyResults: them.keyResults ?? [],
		alignments: (them.gop ?? []).map((g, i) => ({
			alignmentId: `g-${id}-${i}`,
			targetObjectiveId: g.objectiveId,
			targetKeyResultId: g.keyResultId,
			unitName: "",
			objectiveTitle: "",
			keyResultTitle: null,
			lyDo: null,
			canCu: null,
			lyDoTuKara: false,
			mucTin: "chua-co-ly-do" as const,
		})),
		canEdit: false,
		following: false,
		followerCount: 0,
		theoDoi: false,
		hienThi: "cong-khai",
		soNguoiXem: 0,
		soGopYCho: 0,
	};
}

function nut(
	m: MucTieuOutput,
	lapLai: boolean,
	children: NutCanChinh[],
): NutCanChinh {
	return {
		id: m.id,
		loai: "muc-tieu",
		objectiveId: m.id,
		unitName: m.unitName,
		title: m.title,
		progress: m.progress,
		status: m.status,
		kind: m.kind,
		gop: m.alignments.length,
		lapLai,
		hienThi: m.hienThi,
		soNguoiXem: m.soNguoiXem,
		children,
	};
}

function nutKr(
	m: MucTieuOutput,
	k: KrOutput,
	children: NutCanChinh[],
): NutCanChinh {
	return {
		id: k.id,
		loai: "kr",
		objectiveId: m.id,
		unitName: m.unitName,
		title: k.title,
		progress: k.progress,
		status: m.status,
		kind: m.kind,
		gop: 0,
		lapLai: false,
		hienThi: m.hienThi,
		soNguoiXem: m.soNguoiXem,
		children,
	};
}

function nam(trangThaiB: MucTieuOutput["status"]) {
	const kr1 = kr("kr1", "O", 40);
	const kr2 = kr("kr2", "O", 80);
	const O = mt("O", "onehub", "OneHub", {
		progress: 60,
		keyResults: [kr1, kr2],
	});
	const B = mt("B", "bo-phan", "Khối Kinh doanh", {
		progress: 30,
		status: trangThaiB,
		gop: [{ objectiveId: "O", keyResultId: null }],
	});
	const P = mt("P", "phong-ban", "Phòng Bán lẻ", {
		progress: 10,
		gop: [
			{ objectiveId: "O", keyResultId: "kr1" },
			{ objectiveId: "B", keyResultId: null },
		],
	});
	const P2 = mt("P2", "phong-ban", "Phòng Đối tác", { status: "nhap" });
	const K = mt("K", "ca-nhan", "Người một");
	return { O, B, P, P2, K, kr1, kr2 };
}

describe("can-chinh", () => {
	test("can-chinh: cay viet truoc, P gop hai cho hien hai lan, lan hai lapLai", () => {
		const { O, B, P, P2, K, kr1, kr2 } = nam("cong-bo");
		const cay = dungCayCanChinh([O, B, P, P2, K]);
		expect(cay).toEqual({
			roots: [
				nut(O, false, [
					nutKr(O, kr1, [nut(P, false, [])]),
					nutKr(O, kr2, []),
					nut(B, false, [nut(P, true, [])]),
				]),
			],
			chuaCanChinh: [nut(P2, false, []), nut(K, false, [])],
		});
		const cacP = JSON.stringify(cay).match(/"id":"P"/g) ?? [];
		expect(cacP.length).toBe(2);
	});

	test("can-chinh: dich-da-bo van hien, status truyen ra, khong nem", () => {
		const { O, B, P, P2, K, kr1, kr2 } = nam("da-bo");
		const cay = dungCayCanChinh([O, B, P, P2, K]);
		expect(cay.roots).toEqual([
			nut(O, false, [
				nutKr(O, kr1, [nut(P, false, [])]),
				nutKr(O, kr2, []),
				nut(B, false, [nut(P, true, [])]),
			]),
		]);
		expect(cay.roots[0]?.children[2]?.status).toBe("da-bo");
	});

	test("can-chinh: dich khong co trong tap thi muc tieu vao chuaCanChinh, khong mat", () => {
		const O = mt("O", "onehub", "OneHub");
		const Q = mt("Q", "phong-ban", "Phòng Quý", {
			gop: [{ objectiveId: "nam-B", keyResultId: null }],
		});
		expect(dungCayCanChinh([O, Q])).toEqual({
			roots: [nut(O, false, [])],
			chuaCanChinh: [nut(Q, false, [])],
		});
	});
});
