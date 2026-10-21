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

type Vet = { duong: string; chu: string };

function quetChu(giaTri: unknown, duong: string, ra: Vet[], da: Set<unknown>): void {
	if (typeof giaTri === "string") {
		if (TU_CAM.test(giaTri)) ra.push({ duong, chu: giaTri });
		return;
	}
	if (typeof giaTri === "function") {
		const doiSo = Array.from({ length: giaTri.length }, () => "x");
		try {
			quetChu(giaTri(...doiSo), `${duong}()`, ra, da);
		} catch {}
		return;
	}
	if (giaTri && typeof giaTri === "object") {
		if (da.has(giaTri)) return;
		da.add(giaTri);
		for (const [khoa, con] of Object.entries(giaTri)) {
			quetChu(con, `${duong}.${khoa}`, ra, da);
		}
	}
}

function nhanhViet(mod: Record<string, unknown>): unknown[] {
	const ra: unknown[] = [];
	for (const giaTri of Object.values(mod)) {
		if (typeof giaTri === "function" && giaTri.length === 1) {
			try {
				ra.push(giaTri("vi"));
			} catch {}
		} else if (giaTri && typeof giaTri === "object" && "vi" in giaTri) {
			ra.push((giaTri as { vi: unknown }).vi);
		}
	}
	return ra;
}

describe("tmc-ten-goi", () => {
	test("chu tieng Viet cua app khong con tuy chinh, truong dong", async () => {
		const { readdirSync } = await import("node:fs");
		const thuMuc = path.join(import.meta.dir, "..", "lib", "messages");
		const tep = readdirSync(thuMuc).filter((t) => t.endsWith(".ts"));
		let daDuyet = 0;
		const vet: Vet[] = [];
		for (const t of tep) {
			const mod = (await import(path.join(thuMuc, t))) as Record<
				string,
				unknown
			>;
			for (const nhanh of nhanhViet(mod)) {
				quetChu(nhanh, t, vet, new Set());
			}
			daDuyet += 1;
		}
		if (daDuyet < tep.length) throw new Error("tmc ten goi: bo sot tep");
		if (vet[0]) {
			throw new Error(`tmc ten goi: ${vet[0].duong} ${vet[0].chu}`);
		}

		const { crmMessages } = await import("../lib/messages/crm");
		const goiY = crmMessages("vi").fields.createHint;
		if (!goiY.includes("trường") || goiY.includes("động")) {
			throw new Error("tmc ten goi: dong sua createHint");
		}
		const karaMod = (await import("../lib/messages/kara-ban-ghi")) as Record<
			string,
			unknown
		>;
		const coDong = JSON.stringify(nhanhViet(karaMod)).includes(
			'"set_field_value":"Điền một trường"',
		);
		if (!coDong) throw new Error("tmc ten goi: dong sua set_field_value");

		const thu: Vet[] = [];
		quetChu({ a: "Điền một trường tuỳ chỉnh" }, "thu", thu, new Set());
		if (thu.length !== 1) throw new Error("tmc ten goi: thuoc mu");
		expect(daDuyet).toBe(tep.length);
	});
});
