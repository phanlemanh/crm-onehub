import assert from "node:assert/strict";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
} from "node:fs";
import os from "node:os";
import { join } from "node:path";
import { after, describe, test } from "node:test";
import { bao, ngayLuot } from "../bao.mjs";
import { KIEM_CHEO } from "../cau-hinh.mjs";

const tam = mkdtempSync(join(os.tmpdir(), "kcs-bao-"));
after(() => rmSync(tam, { recursive: true, force: true }));
const NOW = Date.parse("2026-10-08T19:30:00Z");

function moi(ten) {
	const goc = join(tam, ten);
	const dot = join(goc, "dot");
	mkdirSync(join(dot, "yeu-cau"), { recursive: true });
	return { goc, dot };
}

const DO = {
	ket_qua: "do",
	tu: "aaa",
	den: "bbb",
	lan_gop: ["m1", "m2"],
	ho_so: ["ky-cham"],
	do: [
		{
			ho_so: "ky-cham",
			eval: "E1",
			loai: "do-moi",
			lan_gop: "m2",
			lenh: "node kiem.mjs",
		},
		{ ho_so: "ky-cham", eval: "E2", loai: "do-san", lenh: "node kiem2.mjs" },
	],
};

const tepNgay = (goc) => join(goc, KIEM_CHEO.thuMuc, `${ngayLuot(NOW)}.json`);

describe("kcs-bao", () => {
	test("ngay luot theo gio Viet Nam", () => {
		assert.equal(ngayLuot(NOW), "2026-10-09");
	});

	test("(h) do, co dot -> dung mot yeu-cau can-nguoi, 0 thong bao, tep ngay du khoa", () => {
		const { goc, dot } = moi("do-co-dot");
		const thongBao = [];
		bao({
			goc,
			ketQua: DO,
			dot,
			thongBao: (...a) => thongBao.push(a),
			now: () => NOW,
		});
		const yc = readdirSync(join(dot, "yeu-cau")).filter((t) =>
			t.endsWith(".json"),
		);
		assert.deepEqual(
			yc,
			["kiem-cheo-1.json"],
			"dung mot don, khong de lai tep tam",
		);
		const don = JSON.parse(readFileSync(join(dot, "yeu-cau", yc[0]), "utf8"));
		assert.equal(don.phien, "kiem-cheo");
		assert.equal(don.loai, "can-nguoi");
		assert.match(don.noi_dung, /ky-cham E1 do-moi .*m2/);
		assert.equal(thongBao.length, 0);
		const ngay = JSON.parse(readFileSync(tepNgay(goc), "utf8"));
		for (const k of ["ket_qua", "tu", "den", "lan_gop", "ho_so", "do"]) {
			assert.ok(k in ngay, `tep ngay thieu ${k}`);
		}
		for (const d of ngay.do.filter((x) => x.loai === "do-moi")) {
			assert.ok(d.lan_gop, "muc do-moi phai co lan_gop");
		}
	});

	test("(h) do lan hai cung dot -> kiem-cheo-2.json", () => {
		const { goc, dot } = moi("do-hai-lan");
		bao({ goc, ketQua: DO, dot, thongBao: () => {}, now: () => NOW });
		bao({ goc, ketQua: DO, dot, thongBao: () => {}, now: () => NOW });
		assert.deepEqual(readdirSync(join(dot, "yeu-cau")).sort(), [
			"kiem-cheo-1.json",
			"kiem-cheo-2.json",
		]);
	});

	for (const ketQua of ["do", "khong-chay-duoc", "loi"]) {
		test(`(h) ${ketQua}, khong dot -> thong bao dung mot lan`, () => {
			const { goc } = moi(`kd-${ketQua}`);
			const thongBao = [];
			bao({
				goc,
				ketQua: { ...DO, ket_qua: ketQua, ly_do: "x" },
				dot: null,
				thongBao: (...a) => thongBao.push(a),
				now: () => NOW,
			});
			assert.equal(
				thongBao.length,
				1,
				`${ketQua} khong dot phai thong bao mot lan`,
			);
		});
	}

	for (const ketQua of ["xanh", "khong-gop-moi", "bo-luot-khoa-ban"]) {
		test(`(h) ${ketQua} -> 0 yeu-cau, 0 thong bao, van co tep ngay`, () => {
			const { goc, dot } = moi(`im-${ketQua}`);
			const thongBao = [];
			bao({
				goc,
				ketQua: { ...DO, ket_qua: ketQua, do: [] },
				dot,
				thongBao: (...a) => thongBao.push(a),
				now: () => NOW,
			});
			assert.deepEqual(readdirSync(join(dot, "yeu-cau")), []);
			assert.equal(thongBao.length, 0);
			assert.ok(existsSync(tepNgay(goc)));
		});
	}
});
