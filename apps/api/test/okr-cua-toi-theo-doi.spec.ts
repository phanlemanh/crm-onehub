import { beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import {
	CHUONG_TRINH_RONG,
	doc,
	dungSan,
	goi,
	type Json,
	kyDangChay,
	ma,
	nguoiMoi,
	ok,
	phienCua,
	tao,
} from "./okr-san";

dungSan();

type Mang = "objectives" | "daBo" | "dangTheoDoi";
type Mine = Record<Mang, { id: string }[]>;
const MANG: readonly Mang[] = ["objectives", "daBo", "dangTheoDoi"];

const mt = (
	cycleId: string,
	unit: Json,
	ownerUserId: string,
	participantIds: string[] = [],
) =>
	tao(
		"okr.createObjective",
		{
			cycleId,
			unit,
			title: ma("ctt"),
			kind: "cam-ket",
			ownerUserId,
			participantIds,
			whyNow: "",
		},
		"tao muc tieu",
	);

const kr = (objectiveId: string, ownerUserId: string) =>
	tao(
		"okr.createKeyResult",
		{
			objectiveId,
			title: ma("kr"),
			kind: "tang-toi",
			ownerUserId,
			startValue: 0,
			targetValue: 10,
			currentValue: 0,
			unit: "khách",
			dueOn: null,
			weight: 1,
		},
		"tao kr",
	);

async function congBo(
	id: string,
	chu: string,
	ai: string = "quan",
): Promise<void> {
	await kr(id, chu);
	ok(await goi("okr.publishObjective", { id }, ai), `cong bo ${id}`);
}
const bo = async (id: string, ai: string = "quan") =>
	ok(await goi("okr.dropObjective", { id }, ai), `bo ${id}`);
const theoDoi = async (id: string, on: boolean, cookie: string) =>
	ok(await goi("okr.follow", { objectiveId: id, on }, cookie), `follow ${on}`);
const mineCua = (cookie: string, cycleId: string) =>
	doc<Mine>("okr.mine", cookie, { cycleId });
const noi = (r: Mine, id: string): Mang[] =>
	MANG.filter((k) => r[k].some((m) => m.id === id));

function ghim(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

const ONEHUB = { level: "onehub" } as const;

type San = { cycleId: string; u: string; v: string; cu: string; cv: string };

async function sanMoi(ten: string): Promise<San> {
	ok(await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }), "cau hinh");
	const cycleId = await kyDangChay(`ctt-${ten}`);
	const u = await nguoiMoi(`ctt-${ten}-u`);
	const v = await nguoiMoi(`ctt-${ten}-v`);
	return { cycleId, u, v, cu: await phienCua(u), cv: await phienCua(v) };
}

async function bonVai(s: San): Promise<[string, string, string, string]> {
	const phuTrach = await mt(s.cycleId, ONEHUB, s.u);
	const caNhan = await mt(
		s.cycleId,
		{ level: "ca-nhan", personUserId: s.u },
		s.v,
	);
	const thamGia = await mt(s.cycleId, ONEHUB, s.v, [s.u]);
	const giuKr = await mt(s.cycleId, ONEHUB, s.v);
	await kr(giuKr, s.u);
	return [phuTrach, caNhan, thamGia, giuKr];
}

describe("mine-vai", () => {
	let s: San;
	let m: string[];
	beforeAll(async () => {
		s = await sanMoi("vai");
		const [m1, m2, m3, m4] = await bonVai(s);
		const m5 = await mt(s.cycleId, ONEHUB, s.v);
		const m6 = await mt(s.cycleId, ONEHUB, s.v);
		await congBo(m2, s.v, s.cu);
		for (const id of [m3, m4, m5, m6]) await congBo(id, s.v);
		await theoDoi(m5, true, s.cu);
		m = [m1, m2, m3, m4, m5, m6];
	});

	test("mine-vai: bon vai o objectives, chi theo doi o dangTheoDoi, khong quan he khong o dau", async () => {
		const [m1, m2, m3, m4, m5, m6] = m;
		const nhap = await db.okrObjective.findUniqueOrThrow({
			where: { id: m1 },
			select: { status: true },
		});
		expect(nhap.status).toBe("nhap");
		const r = await mineCua(s.cu, s.cycleId);
		ghim(!noi(r, m5).includes("objectives"), "M5 o objectives");
		expect({
			m1: noi(r, m1),
			m2: noi(r, m2),
			m3: noi(r, m3),
			m4: noi(r, m4),
			m5: noi(r, m5),
			m6: noi(r, m6),
		}).toEqual({
			m1: ["objectives"],
			m2: ["objectives"],
			m3: ["objectives"],
			m4: ["objectives"],
			m5: ["dangTheoDoi"],
			m6: [],
		});
	});

	test("mine-vai: doi chung — M5 la cua V nen o objectives cua V", async () => {
		const r = await mineCua(s.cv, s.cycleId);
		expect(noi(r, m[4])).toEqual(["objectives"]);
	});
});

describe("trung-vai", () => {
	test("trung-vai: bon vai cua toi va cung theo doi chi o objectives", async () => {
		const s = await sanMoi("trung");
		const t = await bonVai(s);
		await congBo(t[1], s.v, s.cu);
		for (const id of t.slice(2)) await congBo(id, s.v);
		for (const id of t) await theoDoi(id, true, s.cu);
		const r = await mineCua(s.cu, s.cycleId);
		const ten = ["T1", "T2", "T3", "T4"];
		for (const [i, id] of t.entries())
			ghim(
				!noi(r, id).includes("dangTheoDoi"),
				`${ten[i]} o dangTheoDoi`,
			);
		expect(t.map((id) => noi(r, id))).toEqual([
			["objectives"],
			["objectives"],
			["objectives"],
			["objectives"],
		]);
	});
});

describe("da-bo", () => {
	test("da-bo: bon vai da bo o daBo, chi theo doi da bo khong o dau", async () => {
		const s = await sanMoi("dabo");
		const d = await bonVai(s);
		const d5 = await mt(s.cycleId, ONEHUB, s.v);
		const d6 = await mt(s.cycleId, ONEHUB, s.v);
		await congBo(d[0], s.u);
		await congBo(d[1], s.v, s.cu);
		for (const id of [...d.slice(2), d5, d6]) await congBo(id, s.v);
		await theoDoi(d5, true, s.cu);
		await theoDoi(d6, true, s.cu);
		await bo(d[1], s.cu);
		for (const id of [d[0], ...d.slice(2), d5]) await bo(id);
		const r = await mineCua(s.cu, s.cycleId);
		ghim(!noi(r, d5).includes("dangTheoDoi"), "D5 o dangTheoDoi");
		expect({
			bonVai: d.map((id) => noi(r, id)),
			d5: noi(r, d5),
			d6: noi(r, d6),
		}).toEqual({
			bonVai: [["daBo"], ["daBo"], ["daBo"], ["daBo"]],
			d5: [],
			d6: ["dangTheoDoi"],
		});
	});
});

describe("hien-thi", () => {
	test("hien-thi: bi gioi han khong gom U thi roi khoi dangTheoDoi, cong khai lai thi tro ve", async () => {
		const s = await sanMoi("hthi");
		const h = await mt(s.cycleId, ONEHUB, s.v);
		await congBo(h, s.v);
		await theoDoi(h, true, s.cu);
		const truoc = noi(await mineCua(s.cu, s.cycleId), h);
		ok(
			await goi("okr.datHienThi", {
				objectiveId: h,
				hienThi: "gioi-han",
				nguoiXem: [s.v],
			}),
			"gioi han",
		);
		const gioiHan = noi(await mineCua(s.cu, s.cycleId), h);
		ghim(gioiHan.length === 0, "H lo du bi gioi han");
		ok(
			await goi("okr.datHienThi", {
				objectiveId: h,
				hienThi: "cong-khai",
				nguoiXem: [],
			}),
			"cong khai",
		);
		const sau = noi(await mineCua(s.cu, s.cycleId), h);
		expect({ truoc, gioiHan, sau }).toEqual({
			truoc: ["dangTheoDoi"],
			gioiHan: [],
			sau: ["dangTheoDoi"],
		});
	});
});

describe("bo-theo-doi", () => {
	test("bo-theo-doi: bat, tat, bat lai doc qua okr.mine", async () => {
		const s = await sanMoi("bo");
		const f = await mt(s.cycleId, ONEHUB, s.v);
		await congBo(f, s.v);
		await theoDoi(f, true, s.cu);
		const bat = noi(await mineCua(s.cu, s.cycleId), f);
		await theoDoi(f, false, s.cu);
		const tat = noi(await mineCua(s.cu, s.cycleId), f);
		ghim(tat.length === 0, "F con o dangTheoDoi sau khi tat");
		await theoDoi(f, true, s.cu);
		const batLai = noi(await mineCua(s.cu, s.cycleId), f);
		expect({ bat, tat, batLai }).toEqual({
			bat: ["dangTheoDoi"],
			tat: [],
			batLai: ["dangTheoDoi"],
		});
	});
});
