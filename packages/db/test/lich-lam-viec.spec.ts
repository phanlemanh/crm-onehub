import { describe, expect, test } from "bun:test";
import {
	congNgayLam,
	type LichLam,
	laNgayLam,
	ngayLamKe,
	soNgayLam,
} from "../src/lich-lam-viec";

const A: LichLam = {
	ngayNghiTuan: [6, 7],
	ngayLe: ["2026-10-26", "2027-01-01"],
};
const B: LichLam = { ngayNghiTuan: [7], ngayLe: [] };

type Dong =
	| { ham: "laNgayLam"; vao: [string]; lich: LichLam; ra: boolean }
	| { ham: "ngayLamKe"; vao: [string]; lich: LichLam; ra: string }
	| { ham: "congNgayLam"; vao: [string, number]; lich: LichLam; ra: string }
	| { ham: "soNgayLam"; vao: [string, string]; lich: LichLam; ra: number };

const MA_TRAN: Dong[] = [
	{ ham: "laNgayLam", vao: ["2026-10-22"], lich: A, ra: true },
	{ ham: "laNgayLam", vao: ["2026-10-24"], lich: A, ra: false },
	{ ham: "laNgayLam", vao: ["2026-10-25"], lich: A, ra: false },
	{ ham: "laNgayLam", vao: ["2026-10-26"], lich: A, ra: false },
	{ ham: "laNgayLam", vao: ["2026-10-24"], lich: B, ra: true },
	{ ham: "laNgayLam", vao: ["2026-10-25"], lich: B, ra: false },
	{ ham: "ngayLamKe", vao: ["2026-10-21"], lich: A, ra: "2026-10-22" },
	{ ham: "ngayLamKe", vao: ["2026-10-23"], lich: A, ra: "2026-10-27" },
	{ ham: "ngayLamKe", vao: ["2026-10-24"], lich: A, ra: "2026-10-27" },
	{ ham: "ngayLamKe", vao: ["2026-10-30"], lich: A, ra: "2026-11-02" },
	{ ham: "ngayLamKe", vao: ["2026-12-31"], lich: A, ra: "2027-01-04" },
	{ ham: "ngayLamKe", vao: ["2026-10-23"], lich: B, ra: "2026-10-24" },
	{ ham: "congNgayLam", vao: ["2026-10-27", 1], lich: A, ra: "2026-10-28" },
	{ ham: "congNgayLam", vao: ["2026-10-22", 1], lich: A, ra: "2026-10-23" },
	{ ham: "congNgayLam", vao: ["2026-10-23", 1], lich: A, ra: "2026-10-27" },
	{ ham: "congNgayLam", vao: ["2026-10-29", 2], lich: A, ra: "2026-11-02" },
	{ ham: "congNgayLam", vao: ["2026-10-22", 0], lich: A, ra: "2026-10-22" },
	{ ham: "congNgayLam", vao: ["2026-12-30", 2], lich: A, ra: "2027-01-04" },
	{ ham: "soNgayLam", vao: ["2026-10-22", "2026-10-23"], lich: A, ra: 2 },
	{ ham: "soNgayLam", vao: ["2026-10-22", "2026-10-28"], lich: A, ra: 4 },
	{ ham: "soNgayLam", vao: ["2026-10-24", "2026-10-26"], lich: A, ra: 0 },
	{ ham: "soNgayLam", vao: ["2026-10-19", "2026-10-30"], lich: A, ra: 9 },
	{ ham: "soNgayLam", vao: ["2026-12-31", "2027-01-04"], lich: A, ra: 2 },
	{ ham: "soNgayLam", vao: ["2026-10-19", "2026-10-25"], lich: B, ra: 6 },
];

function chay(d: Dong): unknown {
	switch (d.ham) {
		case "laNgayLam":
			return laNgayLam(d.vao[0], d.lich);
		case "ngayLamKe":
			return ngayLamKe(d.vao[0], d.lich);
		case "congNgayLam":
			return congNgayLam(d.vao[0], d.vao[1], d.lich);
		case "soNgayLam":
			return soNgayLam(d.vao[0], d.vao[1], d.lich);
	}
}

describe("llv-ma-tran", () => {
	test("llv-ma-tran: 24 dòng viết trước — ngày thường, cuối tuần, ngày lễ, nghỉ liền, chỉ Chủ nhật, qua tháng, qua năm", () => {
		let daSo = 0;
		for (const d of MA_TRAN) {
			const x = chay(d);
			if (x !== d.ra) {
				throw new Error(
					`llv: ${d.ham} ${d.vao.join(",")} ra ${String(x)} ky vong ${String(d.ra)}`,
				);
			}
			daSo += 1;
		}
		if (daSo !== 24) throw new Error(`llv: ma tran thieu ${daSo}`);
		expect(daSo).toBe(24);
	});
});
