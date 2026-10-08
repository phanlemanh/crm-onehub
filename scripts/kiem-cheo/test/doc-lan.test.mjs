import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, test } from "node:test";
import { docLan, kiemMau, phienBanDangCai, phienBanMau } from "../doc-lan.mjs";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const MAU = readFileSync(
	join(import.meta.dirname, "..", "fixtures", "lan-that.txt"),
	"utf8",
);

describe("kcs-doc-lan", () => {
	test("(k) mau that: 7 suite deu ma 0", () => {
		const { suite } = docLan(MAU);
		assert.equal(suite.length, 7, "luot that co 7 suite");
		assert.deepEqual(
			suite.map((s) => s.ma),
			[0, 0, 0, 0, 0, 0, 0],
		);
		assert.equal(suite[0].lenh, "bun run test -- --filter=api");
	});

	test("(k) mau that: 29 eval, dung mot eval do — soan-okr-cung-tro-ly E27 ma 1 sau ca lan chay lai", () => {
		const { eval: ev } = docLan(MAU);
		assert.equal(ev.length, 29, "luot that co 29 eval may");
		const do_ = ev.filter((e) => e.ma !== 0);
		assert.deepEqual(do_, [
			{
				slug: "soan-okr-cung-tro-ly",
				id: "E27",
				lenh: "node scripts/luat-kho/do-cay.mjs --du-luat",
				ma: 1,
				chayLai: true,
				daChay: false,
			},
		]);
	});

	test("(k) dong lenh trung «(đã chạy)» cua luot that: lenh null, co daChay", () => {
		const e11 = docLan(MAU).eval.find(
			(e) => e.slug === "soan-okr-cung-tro-ly" && e.id === "E11",
		);
		assert.deepEqual(e11, {
			slug: "soan-okr-cung-tro-ly",
			id: "E11",
			lenh: null,
			ma: 0,
			chayLai: false,
			daChay: true,
		});
	});

	test("(k) dong chay lai xanh thang dong dau do", () => {
		const text =
			`${MAU}\n[lane] nop-ban-nhap-chon-theo-khoa E1 (chạy lại): bun _acceptance/nop-ban-nhap-chon-theo-khoa/rang/dao-thu-tu.mjs xanh → exit 0 (4.4s)\n`.replace(
				"[lane] nop-ban-nhap-chon-theo-khoa E1: bun _acceptance/nop-ban-nhap-chon-theo-khoa/rang/dao-thu-tu.mjs xanh → exit 0",
				"[lane] nop-ban-nhap-chon-theo-khoa E1: bun _acceptance/nop-ban-nhap-chon-theo-khoa/rang/dao-thu-tu.mjs xanh → exit 1",
			);
		const e1 = docLan(text).eval.find(
			(e) => e.slug === "nop-ban-nhap-chon-theo-khoa" && e.id === "E1",
		);
		assert.equal(e1.ma, 0, "lan chay lai xanh thi ket qua cuoi la xanh");
	});

	test("(k) phien ban mau trung phien ban feature-loop dang cai", () => {
		assert.equal(phienBanMau(MAU), "2.24.0");
		assert.equal(kiemMau({ mau: MAU, phienBan: phienBanDangCai(GOC) }), null);
	});

	test("(k) chieu do: phien ban dang cai khac mau -> goi ten ca hai", () => {
		assert.equal(
			kiemMau({ mau: MAU, phienBan: "9.9.9" }),
			"mau dong lan cu: 2.24.0 != 9.9.9",
		);
	});
});
