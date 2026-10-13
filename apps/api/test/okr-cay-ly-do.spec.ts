import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { z } from "zod";
import { idMau } from "../scripts/okr-mau/nap";
import { MUC_TIN_CAN_CHINH } from "../src/okr/can-chinh";
import { mucTieuOutput } from "../src/okr/okr.contracts";
import { cayCanChinhOutput } from "../src/okr/okr-xem.contracts";
import { canhCuaCay, type MucTieuCoCanh } from "../src/okr/okr-xem.service";
import { congTy } from "./okr-mau-san";
import { CHU_KY_Q4 } from "./soan-okr-san";
import {
	batDauMau,
	CHO_DB,
	dungUngDung,
	goi,
	ketThucMau,
	ok,
	phienMau,
} from "./tro-ly-okr-san";

const QUAN_TRI = congTy().nguoi.find((n) => n.vai === "admin")?.ma ?? "";

const caMan = z
	.object({
		nguoiXem: z.string(),
		ca: z
			.array(z.object({ ma: z.string(), mucTin: z.enum(MUC_TIN_CAN_CHINH) }))
			.length(3),
	})
	.parse(
		JSON.parse(
			readFileSync(
				join(
					import.meta.dir,
					"../../../_acceptance/cay-can-chinh-co-ly-do/rang/ca-man.json",
				),
				"utf8",
			),
		),
	);

type Cay = z.infer<typeof cayCanChinhOutput>;
type Nut = Cay["roots"][number];
type NutKhongKyVong = Omit<Nut, "expected" | "children"> & {
	children: NutKhongKyVong[];
};

let app: NestExpressApplication;
const phien = new Map<string, string>();

beforeAll(async () => {
	app = await dungUngDung();
	await batDauMau();
}, CHO_DB);

afterAll(async () => {
	await ketThucMau(app);
}, CHO_DB);

async function cookie(ma: string): Promise<string> {
	const co = phien.get(ma);
	if (co) return co;
	const moi = await phienMau(ma);
	phien.set(ma, moi);
	return moi;
}

async function cay(ma: string): Promise<Cay> {
	const tra = await goi(
		app,
		"okr.cayCanChinh",
		"query",
		{ cycleId: CHU_KY_Q4 },
		await cookie(ma),
	);
	return cayCanChinhOutput.parse(ok(tra, `cay ${ma}`));
}

async function chiTiet(ma: string, id: string) {
	const tra = await goi(
		app,
		"okr.objective",
		"query",
		{ id },
		await cookie(ma),
	);
	return mucTieuOutput.passthrough().parse(ok(tra, `objective ${id}`));
}

function moiNut(c: Cay): Nut[] {
	const ra: Nut[] = [];
	const di = (ds: Nut[]) => {
		for (const n of ds) {
			ra.push(n);
			di(n.children);
		}
	};
	di([...c.roots, ...c.chuaCanChinh]);
	return ra;
}

const idCay = (c: Cay) => new Set(moiNut(c).map((n) => n.id));
const khoa = (tu: string, den: string) => `${tu}->${den}`;

describe("l3-canh", () => {
	test(
		"l3-canh moi cho noi co mat trong cay co dung mot canh, gia tri bang okr.objective",
		async () => {
			const c = await cay(QUAN_TRI);
			const coMat = idCay(c);
			const mucTieu = [
				...new Set(
					moiNut(c)
						.filter((n) => n.loai === "muc-tieu")
						.map((n) => n.objectiveId),
				),
			];
			const mong = new Map<
				string,
				z.infer<typeof mucTieuOutput>["alignments"][number]
			>();
			for (const id of mucTieu) {
				const ct = await chiTiet(QUAN_TRI, id);
				for (const a of ct.alignments) {
					const den = a.targetKeyResultId ?? a.targetObjectiveId;
					if (coMat.has(den)) mong.set(khoa(id, den), a);
				}
			}
			const thuc = new Map(c.canh.map((k) => [khoa(k.tu, k.den), k]));
			for (const k of mong.keys())
				if (!thuc.has(k)) throw new Error(`canh thieu: ${k}`);
			for (const k of thuc.keys())
				if (!mong.has(k)) throw new Error(`canh thua: ${k}`);
			expect(c.canh.length).toBe(mong.size);
			for (const [k, a] of mong) {
				const t = thuc.get(k);
				expect({
					k,
					lyDo: t?.lyDo,
					canCu: t?.canCu,
					kara: t?.lyDoTuKara,
					muc: t?.mucTin,
				}).toEqual({
					k,
					lyDo: a.lyDo,
					canCu: a.canCu,
					kara: a.lyDoTuKara,
					muc: a.mucTin,
				});
			}
			const cu = z
				.object({
					roots: z.array(z.unknown()),
					chuaCanChinh: z.array(z.unknown()),
				})
				.parse(
					ok(
						await goi(
							app,
							"okr.alignmentTree",
							"query",
							{ cycleId: CHU_KY_Q4 },
							await cookie(QUAN_TRI),
						),
						"alignmentTree",
					),
				);
			const boKyVong = (n: Nut): NutKhongKyVong => {
				const { expected: _bo, children, ...con } = n;
				return { ...con, children: children.map(boKyVong) };
			};
			expect({
				roots: c.roots.map(boKyVong),
				chuaCanChinh: c.chuaCanChinh.map(boKyVong),
			}).toEqual({ roots: cu.roots, chuaCanChinh: cu.chuaCanChinh });
			const laKr = new Set(
				moiNut(c)
					.filter((n) => n.loai === "kr")
					.map((n) => n.id),
			);
			const denKr = c.canh.filter((k) => laKr.has(k.den)).length;
			const denMt = c.canh.length - denKr;
			if (denKr < 1 || denMt < 1)
				throw new Error(`thieu loai dich: kr ${denKr}, muc tieu ${denMt}`);
			const coBa = new Set(
				caMan.ca.map(
					(ca) => c.canh.find((x) => x.tu === idMau("mt", ca.ma))?.mucTin,
				),
			);
			expect([...coBa].sort()).toEqual([...MUC_TIN_CAN_CHINH].sort());
		},
		CHO_DB,
	);
});

type NoiGop = z.infer<typeof mucTieuOutput>["alignments"][number];

const noi = (dich: string, laKr = false): NoiGop => ({
	alignmentId: `al-${dich}`,
	targetObjectiveId: laKr ? `cha-${dich}` : dich,
	targetKeyResultId: laKr ? dich : null,
	unitName: "Đơn vị",
	objectiveTitle: "Mục tiêu",
	keyResultTitle: laKr ? "KR" : null,
	lyDo: null,
	canCu: null,
	lyDoTuKara: false,
	mucTin: "chua-co-ly-do",
});

const mtThuan = (
	id: string,
	krs: string[],
	noiGop: NoiGop[],
): MucTieuCoCanh => ({
	id,
	keyResults: krs.map((k) => ({ id: k })),
	alignments: noiGop,
});

describe("l3-quyen", () => {
	test("l3-quyen canhCuaCay bo canh co dau ngoai tap, doi chung co dau thi giu", () => {
		const W = mtThuan("W", ["W1"], []);
		const tap = [
			mtThuan("Y", [], [noi("X")]),
			mtThuan("Z", [], [noi("W1", true)]),
			mtThuan("V", [], [noi("W")]),
			W,
		];
		const ra = canhCuaCay(tap).map((k) => khoa(k.tu, k.den));
		if (ra.includes("Y->X")) throw new Error("canh lo ra ngoai cay: Y->X");
		expect(ra.sort()).toEqual(["V->W", "Z->W1"]);
		const coX = canhCuaCay([...tap, mtThuan("X", [], [])]).map((k) =>
			khoa(k.tu, k.den),
		);
		expect(coX).toContain("Y->X");
	});

	test(
		"l3-quyen tren bo mau moi canh cua moi nguoi dung co hai dau trong cay cua ho",
		async () => {
			const nguoi = congTy().nguoi;
			let soNguoi = 0;
			const loi: string[] = [];
			for (const n of nguoi) {
				const c = await cay(n.ma);
				const ids = idCay(c);
				for (const k of c.canh)
					if (!ids.has(k.tu) || !ids.has(k.den))
						loi.push(`${n.ma}: ${khoa(k.tu, k.den)}`);
				soNguoi += 1;
			}
			if (loi.length > 0)
				throw new Error(`canh lo ra ngoai cay: ${loi.slice(0, 5).join(", ")}`);
			expect(soNguoi).toBe(nguoi.length);
		},
		CHO_DB * 4,
	);
});

describe("l3-man-doc-lai", () => {
	test(
		"l3-man-doc-lai ba ma tren man doc tu csdl dung muc tin da khai",
		async () => {
			const c = await cay(caMan.nguoiXem);
			const laKr = new Set(
				moiNut(c)
					.filter((n) => n.loai === "kr")
					.map((n) => n.id),
			);
			let soCa = 0;
			let denKr = 0;
			let denMt = 0;
			for (const ca of caMan.ca) {
				const theoMa = c.canh.filter((k) => k.tu === idMau("mt", ca.ma));
				if (theoMa.length !== 1)
					throw new Error(
						`man doc lai lech: ${ca.ma} co ${theoMa.length} canh`,
					);
				const [k] = theoMa;
				if (k?.mucTin !== ca.mucTin)
					throw new Error(
						`man doc lai lech: ${ca.ma} ${k?.mucTin} khac ${ca.mucTin}`,
					);
				if (laKr.has(k.den)) denKr += 1;
				else denMt += 1;
				soCa += 1;
			}
			expect(soCa).toBe(3);
			if (denKr < 1 || denMt < 1)
				throw new Error(
					`ba ca thieu loai dich: kr ${denKr}, muc tieu ${denMt}`,
				);
		},
		CHO_DB,
	);
});
