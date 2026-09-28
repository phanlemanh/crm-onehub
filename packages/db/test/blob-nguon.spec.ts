import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { BLOB_NGUON, khoNguonVercel, PATHNAME_NGUON } from "../src/blob-nguon";
import { khoNguonGia } from "./blob-nguon-gia";

const KHOA = "BLOB_READ_WRITE_TOKEN";

describe("PATHNAME_NGUON", () => {
	it("đặt nguồn dưới kho-tai-lieu/nguon/<id>", () => {
		expect(PATHNAME_NGUON("n1")).toBe("kho-tai-lieu/nguon/n1");
	});

	it("hai nguồn khác id không chung pathname", () => {
		expect(PATHNAME_NGUON("n1")).not.toBe(PATHNAME_NGUON("n2"));
	});
});

describe("khoNguonGia", () => {
	it("kyGet ghi số giây của lần ký cuối", async () => {
		const kho = khoNguonGia();
		expect(kho.kyGetCuoi).toBeNull();

		const ky = await kho.kyGet(PATHNAME_NGUON("n1"), 300);

		expect(kho.kyGetCuoi).toBe(300);
		expect(ky.url).toContain(PATHNAME_NGUON("n1"));
		expect(ky.hetHan).toBeGreaterThan(Date.now());
	});

	it("doc trả đúng byte đã đặt vào daPut", async () => {
		const kho = khoNguonGia();
		const byte = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
		kho.daPut.set(PATHNAME_NGUON("n1"), byte);

		const doc = await kho.doc(PATHNAME_NGUON("n1"));

		expect(doc).toEqual(byte);
	});

	it("doc trả null khi pathname chưa có byte", async () => {
		const kho = khoNguonGia();
		kho.daPut.set(PATHNAME_NGUON("n1"), new Uint8Array([1]));

		expect(await kho.doc(PATHNAME_NGUON("n2"))).toBeNull();
	});

	it("xoa ghi pathname vào daXoa và bỏ byte khỏi daPut", async () => {
		const kho = khoNguonGia();
		kho.daPut.set(PATHNAME_NGUON("n1"), new Uint8Array([1]));

		await kho.xoa(PATHNAME_NGUON("n1"));

		expect(kho.daXoa).toEqual([PATHNAME_NGUON("n1")]);
		expect(await kho.doc(PATHNAME_NGUON("n1"))).toBeNull();
	});

	it("kyPut trả URL cho đúng pathname, không đổi kyGetCuoi", async () => {
		const kho = khoNguonGia();

		const ky = await kho.kyPut(PATHNAME_NGUON("n1"), {
			kieu: "pdf",
			toiDa: 1024,
		});

		expect(ky.url).toContain(PATHNAME_NGUON("n1"));
		expect(kho.kyGetCuoi).toBeNull();
	});
});

describe("khoNguonVercel", () => {
	let truoc: string | undefined;

	beforeEach(() => {
		truoc = process.env[KHOA];
	});

	afterEach(() => {
		if (truoc === undefined) delete process.env[KHOA];
		else process.env[KHOA] = truoc;
	});

	it("bat() false khi token rỗng", () => {
		process.env[KHOA] = "";
		expect(khoNguonVercel().bat()).toBe(false);

		process.env[KHOA] = "   ";
		expect(khoNguonVercel().bat()).toBe(false);

		delete process.env[KHOA];
		expect(khoNguonVercel().bat()).toBe(false);
	});

	it("bat() true khi có token, đọc lúc gọi chứ không lúc tạo", () => {
		process.env[KHOA] = "";
		const kho = khoNguonVercel();
		expect(kho.bat()).toBe(false);

		process.env[KHOA] = "vercel_blob_rw_gia";

		expect(kho.bat()).toBe(true);
	});

	it("thiếu token thì doc trả null và xoa không làm gì", async () => {
		process.env[KHOA] = "";
		const kho = khoNguonVercel();

		expect(await kho.doc(PATHNAME_NGUON("n1"))).toBeNull();
		expect(await kho.xoa(PATHNAME_NGUON("n1"))).toBeUndefined();
	});

	it("thiếu token thì kyPut, kyGet từ chối bằng thông điệp ghim", async () => {
		process.env[KHOA] = "";
		const kho = khoNguonVercel();

		await expect(
			kho.kyPut(PATHNAME_NGUON("n1"), { kieu: "docx", toiDa: 1024 }),
		).rejects.toThrow(BLOB_NGUON.thongDiep.tat);
		await expect(kho.kyGet(PATHNAME_NGUON("n1"), 300)).rejects.toThrow(
			"Kho nguồn chưa bật: thiếu BLOB_READ_WRITE_TOKEN",
		);
	});
});
