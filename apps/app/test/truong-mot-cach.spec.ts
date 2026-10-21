import { describe, expect, test } from "bun:test";
import path from "node:path";
import type { Locale } from "@crm/ui/lib/locale";
import {
	type DocNhap,
	docSoNhap,
	hienThiSo,
} from "../components/crm/fields/doc-nhap";

type ODocSo = {
	locale: Locale;
	chuoi: string;
	ket: DocNhap<number>;
};

const MA_TRAN_DOC_SO: ODocSo[] = [
	{ locale: "vi", chuoi: "1.234,5", ket: { kind: "ok", giaTri: 1234.5 } },
	{ locale: "vi", chuoi: "1234,5", ket: { kind: "ok", giaTri: 1234.5 } },
	{ locale: "vi", chuoi: "-2,75", ket: { kind: "ok", giaTri: -2.75 } },
	{ locale: "vi", chuoi: "1.234.567", ket: { kind: "ok", giaTri: 1234567 } },
	{ locale: "vi", chuoi: "0,000123", ket: { kind: "ok", giaTri: 0.000123 } },
	{ locale: "vi", chuoi: "", ket: { kind: "rong" } },
	{ locale: "vi", chuoi: "abc", ket: { kind: "tu-choi", ma: "so" } },
	{
		locale: "vi",
		chuoi: "1234.5",
		ket: { kind: "tu-choi", ma: "locale-khac" },
	},
	{
		locale: "vi",
		chuoi: "1,234.5",
		ket: { kind: "tu-choi", ma: "locale-khac" },
	},
	{ locale: "en", chuoi: "1,234.5", ket: { kind: "ok", giaTri: 1234.5 } },
	{
		locale: "en",
		chuoi: "1.234,5",
		ket: { kind: "tu-choi", ma: "locale-khac" },
	},
	{ locale: "en", chuoi: "-3", ket: { kind: "ok", giaTri: -3 } },
	{ locale: "vi", chuoi: "  1.234,5  ", ket: { kind: "ok", giaTri: 1234.5 } },
];

const MA_TRAN_HIEN_SO: { locale: Locale; so: number; chu: string }[] = [
	{ locale: "vi", so: 1234.5, chu: "1.234,5" },
	{ locale: "en", so: 1234.5, chu: "1,234.5" },
	{ locale: "vi", so: 0.000123, chu: "0,000123" },
	{ locale: "vi", so: 0.0000001, chu: "0,0000001" },
];

describe("tmc-doc-so", () => {
	test("doc so theo locale: ma tran viet truoc", () => {
		let daSo = 0;
		for (const o of MA_TRAN_DOC_SO) {
			const ra = docSoNhap(o.chuoi, o.locale);
			if (JSON.stringify(ra) !== JSON.stringify(o.ket)) {
				throw new Error(
					`tmc doc so: ${o.locale} ${o.chuoi} ra ${JSON.stringify(ra)}`,
				);
			}
			daSo += 1;
		}
		if (daSo !== MA_TRAN_DOC_SO.length) {
			throw new Error(`tmc doc so: thieu o ${daSo}`);
		}
		expect(daSo).toBe(13);
	});

	test("hien so theo locale, khong lam tron", () => {
		let daSo = 0;
		for (const o of MA_TRAN_HIEN_SO) {
			const chu = hienThiSo(o.so, o.locale);
			if (chu !== o.chu) {
				throw new Error(`tmc hien so: ${o.locale} ${o.so} ra ${chu}`);
			}
			daSo += 1;
		}
		expect(daSo).toBe(4);
	});
});

const TU_CAM = /t[uù]y chỉnh|tuỳ chỉnh|tùy chỉnh|trường động/i;

type GiaTri = string | ((...doiSo: string[]) => string);
type Nhanh = { readonly [khoa: string]: GiaTri | Nhanh };
type Vet = { duong: string; chu: string };

function phang(o: Nhanh, tien = ""): [string, GiaTri][] {
	return Object.entries(o).flatMap(([k, v]): [string, GiaTri][] =>
		v instanceof Function
			? [[`${tien}${k}`, v]]
			: v instanceof Map
				? phang(Object.fromEntries(v) as Nhanh, `${tien}${k}.`)
				: v instanceof Object
					? phang(v, `${tien}${k}.`)
					: [[`${tien}${k}`, v]],
	);
}

function chuCua(v: GiaTri): string {
	return v instanceof Function
		? v(...Array.from({ length: v.length }, () => "x"))
		: v;
}

function quetNhanh(nhanh: Nhanh, tep: string): Vet[] {
	return phang(nhanh)
		.map(([duong, v]) => ({ duong: `${tep}.${duong}`, chu: chuCua(v) }))
		.filter((vet) => TU_CAM.test(vet.chu));
}

async function layNhanhViet(tep: string): Promise<Nhanh> {
	const ns: unknown = await import(path.join(THU_MUC_KHO, tep));
	const lay = Object.values(ns as object).find(
		(v): v is (locale: Locale) => Nhanh => v instanceof Function,
	);
	if (!lay) throw new Error(`tmc ten goi: ${tep} khong xuat ham lay`);
	return lay("vi");
}

const THU_MUC_KHO = path.join(import.meta.dir, "..", "lib", "messages");

describe("tmc-ten-goi", () => {
	test("chu tieng Viet cua app khong con tuy chinh, truong dong", async () => {
		const { readdirSync } = await import("node:fs");
		const tep = readdirSync(THU_MUC_KHO).filter((t) => t.endsWith(".ts"));
		let daDuyet = 0;
		const vet: Vet[] = [];
		for (const t of tep) {
			vet.push(...quetNhanh(await layNhanhViet(t), t));
			daDuyet += 1;
		}
		if (daDuyet < tep.length) throw new Error("tmc ten goi: bo sot tep");
		if (vet[0]) throw new Error(`tmc ten goi: ${vet[0].duong} ${vet[0].chu}`);

		const crm = phang(await layNhanhViet("crm.ts"));
		const goiY = crm.find(([k]) => k === "fields.createHint")?.[1];
		const chuGoiY = goiY === undefined ? "" : chuCua(goiY);
		if (!chuGoiY.includes("trường") || chuGoiY.includes("động")) {
			throw new Error("tmc ten goi: dong sua createHint");
		}
		const kara = phang(await layNhanhViet("kara-ban-ghi.ts"));
		const coDong = kara.some(
			([k, v]) =>
				k.endsWith(".set_field_value") && chuCua(v) === "Điền một trường",
		);
		if (!coDong) throw new Error("tmc ten goi: dong sua set_field_value");

		const thu = quetNhanh({ a: "Điền một trường tuỳ chỉnh" }, "thu");
		if (thu.length !== 1) throw new Error("tmc ten goi: thuoc mu");
		expect(daDuyet).toBe(tep.length);
	});
});
