import { afterEach, describe, expect, it } from "bun:test";
import { chayNen } from "../src/chay-nen";

const KHOA = Symbol.for("@vercel/request-context");
const toanCuc = globalThis as unknown as Record<symbol, unknown>;

function gaiContext(daGiao: Promise<unknown>[]) {
	toanCuc[KHOA] = {
		get: () => ({
			waitUntil: (p: Promise<unknown>) => {
				daGiao.push(p);
			},
		}),
	};
}

afterEach(() => {
	delete toanCuc[KHOA];
});

describe("chay-nen", () => {
	it("giao dung mot promise cho waitUntil khi co context Vercel", async () => {
		const daGiao: Promise<unknown>[] = [];
		gaiContext(daGiao);
		let xong = false;
		chayNen(
			Promise.resolve().then(() => {
				xong = true;
			}),
		);
		expect(daGiao.length).toBe(1);
		await daGiao[0];
		expect(xong).toBe(true);
	});

	it("khong co context thi khong nem va viec van chay xong", async () => {
		let xong = false;
		const viec = new Promise<void>((xongViec) =>
			setTimeout(() => {
				xong = true;
				xongViec();
			}, 5),
		);
		expect(() => chayNen(viec)).not.toThrow();
		await viec;
		expect(xong).toBe(true);
	});

	it("viec bi tu choi khong thanh unhandled rejection", async () => {
		const daGiao: Promise<unknown>[] = [];
		gaiContext(daGiao);
		chayNen(Promise.reject(new Error("resend chet")));
		await expect(daGiao[0]).resolves.toBeUndefined();
	});
});
