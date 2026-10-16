import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { NEN_TANG, nenTangCuaTenMien } from "../src/ten-mien-nen-tang";

const dauVao = z
	.object({ tao: z.array(z.string()), tenNenTang: z.array(z.string()) })
	.parse(
		JSON.parse(
			readFileSync(
				join(import.meta.dir, "fixtures", "ten-mien-nen-tang-dau-vao.json"),
				"utf8",
			),
		),
	);

describe("ten mien nen tang", () => {
	test("moi ten mien trong danh sach", () => {
		const tong = NEN_TANG.reduce((n, nt) => n + nt.tenMien.length, 0);
		let daChay = 0;
		for (const nt of NEN_TANG) {
			for (const mien of nt.tenMien) {
				expect(nenTangCuaTenMien(mien)).toEqual({ ten: nt.ten, tenMien: mien });
				daChay += 1;
			}
		}
		expect(daChay).toBe(tong);
		expect(NEN_TANG.length).toBe(14);
	});

	test("ten mien con", () => {
		expect(nenTangCuaTenMien("m.facebook.com")?.ten).toBe("Facebook");
		expect(nenTangCuaTenMien("vn.linkedin.com")?.ten).toBe("LinkedIn");
		expect(nenTangCuaTenMien("oa.zalo.me")?.ten).toBe("Zalo");
		expect(nenTangCuaTenMien("www.tiktok.com")?.ten).toBe("TikTok");
		expect(nenTangCuaTenMien("vt.tiktok.com")?.ten).toBe("TikTok");
	});

	test("duong dan du", () => {
		expect(
			nenTangCuaTenMien("https://www.facebook.com/titanmiennam?ref=x"),
		).toEqual({ ten: "Facebook", tenMien: "facebook.com" });
		expect(nenTangCuaTenMien("zalo.me/123")?.ten).toBe("Zalo");
		expect(nenTangCuaTenMien("FACEBOOK.COM/Titan")?.ten).toBe("Facebook");
		expect(nenTangCuaTenMien("facebook.com:443/x")?.ten).toBe("Facebook");
		expect(nenTangCuaTenMien("http://batdongsan.com.vn/nha-moi-gioi/a")?.ten).toBe(
			"Batdongsan",
		);
	});

	test("ten mien trong giong", () => {
		for (const mien of [
			"box.com",
			"fbx.vn",
			"myzalo.me",
			"notx.com",
			"facebook.com.vn.fake.vn",
		]) {
			expect(nenTangCuaTenMien(mien)).toBeNull();
		}
	});

	test("ten mien thuong", () => {
		for (const mien of [
			"datxanh.vn",
			"titanmiennam.vn",
			"",
			"khong phai ten mien",
			null,
			undefined,
		]) {
			expect(nenTangCuaTenMien(mien)).toBeNull();
		}
	});

	test("khop hau to co dau cham", () => {
		const banBoDauCham = (host: string) =>
			NEN_TANG.find((nt) => nt.tenMien.some((m) => host.endsWith(m)))?.ten ??
			null;
		expect(banBoDauCham("box.com"), "box.com bi nhan nham khi bo dau cham").toBe(
			"X",
		);
		expect(nenTangCuaTenMien("box.com")).toBeNull();
	});

	test("fixture dau vao", () => {
		expect(dauVao.tao.map((chuoi) => nenTangCuaTenMien(chuoi)?.ten)).toEqual(
			dauVao.tenNenTang,
		);
	});
});
