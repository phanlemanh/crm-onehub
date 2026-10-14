import { describe, expect, test } from "bun:test";
import { khoaGiua, khoaLienTiep } from "../src/viec-thu-tu";

describe("kv-khoa", () => {
	test("kv-khoa: chèn giữa hai khoá cho khoá nằm giữa", () => {
		const a = khoaGiua(null, null);
		const b = khoaGiua(a, null);
		const g = khoaGiua(a, b);
		if (!(a < g && g < b)) {
			throw new Error(`kv: khoa chen giua sai ${a} ${g} ${b}`);
		}
	});

	test("kv-khoa: hai lần chèn vào cùng một khe cho hai khoá khác nhau, đúng thứ tự chèn", () => {
		const a = khoaGiua(null, null);
		const b = khoaGiua(a, null);
		const x = khoaGiua(a, b);
		const y = khoaGiua(a, x);
		if (x === y) throw new Error("kv: khoa chen giua trung");
		expect([b, x, a, y].sort()).toEqual([a, y, x, b]);
	});

	test("kv-khoa: chèn 200 lần vào đầu và 200 lần vào cùng một khe vẫn tăng chặt", () => {
		let dau = khoaGiua(null, null);
		const ds = [dau];
		for (let i = 0; i < 200; i++) {
			dau = khoaGiua(null, dau);
			ds.unshift(dau);
		}
		let trai = ds[0] ?? "";
		const phai = ds[1] ?? "";
		for (let i = 0; i < 200; i++) {
			const g = khoaGiua(trai, phai);
			if (!(trai < g && g < phai)) {
				throw new Error(`kv: khoa chen giua trung khe ${i}`);
			}
			trai = g;
		}
		for (let i = 1; i < ds.length; i++) {
			if (!((ds[i - 1] ?? "") < (ds[i] ?? ""))) {
				throw new Error(`kv: khoa chen giua trung ${i}`);
			}
		}
	});

	test("kv-khoa: khoaLienTiep(n) đủ n khoá tăng chặt", () => {
		const ds = khoaLienTiep(30);
		expect(ds.length).toBe(30);
		for (let i = 1; i < ds.length; i++) {
			expect((ds[i - 1] ?? "") < (ds[i] ?? "")).toBe(true);
		}
	});

	test("kv-khoa: khoá sai thứ tự bị từ chối", () => {
		expect(() => khoaGiua("b", "a")).toThrow("kv: khoa nguoc");
	});
});
