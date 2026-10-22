import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { blobEnabled } from "../src/blob";
import { BLOB_NGUON, khoNguonVercel, PATHNAME_NGUON } from "../src/blob-nguon";
import { khoNguonGia } from "./blob-nguon-gia";

const KHOA = "KHO_TAI_LIEU_BLOB_TOKEN";
const LOGO = "BLOB_READ_WRITE_TOKEN";
const API_GIA = "VERCEL_BLOB_API_URL";
const GIU = [KHOA, LOGO, API_GIA] as const;
const KHOA_NGUON_GIA = "vercel_blob_rw_nguon_gia";
const KHOA_LOGO_GIA = "vercel_blob_rw_logo_gia";

const dat = (ten: string, gt: string | undefined) => {
	if (gt === undefined) delete process.env[ten];
	else process.env[ten] = gt;
};

const truoc: Record<string, string | undefined> = {};

beforeEach(() => {
	for (const ten of GIU) truoc[ten] = process.env[ten];
});

afterEach(() => {
	for (const ten of GIU) dat(ten, truoc[ten]);
});

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
	it("tên biến của kho nguồn là KHO_TAI_LIEU_BLOB_TOKEN", () => {
		expect(BLOB_NGUON.bienKhoa).toBe(KHOA);
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

	it("kho-nguon-tat: chỉ có khoá logo thì kyPut, kyGet từ chối bằng thông điệp ghim", async () => {
		process.env[KHOA] = "";
		process.env[LOGO] = KHOA_LOGO_GIA;
		process.env[API_GIA] = "http://127.0.0.1:9";
		const kho = khoNguonVercel();
		if (kho.bat())
			throw new Error("kho nguon bat bang khoa logo: kho-nguon-tat");

		await expect(
			kho.kyPut(PATHNAME_NGUON("n1"), { kieu: "docx", toiDa: 1024 }),
		).rejects.toThrow(BLOB_NGUON.thongDiep.tat);
		await expect(kho.kyGet(PATHNAME_NGUON("n1"), 300)).rejects.toThrow(
			"Kho nguồn chưa bật: thiếu KHO_TAI_LIEU_BLOB_TOKEN",
		);
	});
});

const VANG = undefined;
const BANG_HAI_BIEN = [
	{
		o: "co-co",
		kho: KHOA_NGUON_GIA,
		logo: KHOA_LOGO_GIA,
		nguon: true,
		anh: true,
	},
	{ o: "co-vang", kho: KHOA_NGUON_GIA, logo: VANG, nguon: true, anh: false },
	{ o: "vang-co", kho: VANG, logo: KHOA_LOGO_GIA, nguon: false, anh: true },
	{ o: "vang-vang", kho: VANG, logo: VANG, nguon: false, anh: false },
	{ o: "trang-co", kho: "   ", logo: KHOA_LOGO_GIA, nguon: false, anh: true },
	{ o: "co-rong", kho: KHOA_NGUON_GIA, logo: "", nguon: true, anh: false },
] as const;

describe("hai-bien", () => {
	it("hai-bien: 6 ô x 2 kho = 12 kỳ vọng viết trước", () => {
		let so = 0;
		for (const o of BANG_HAI_BIEN) {
			dat(KHOA, o.kho);
			dat(LOGO, o.logo);
			const nguon = khoNguonVercel().bat();
			const anh = blobEnabled();
			if (o.kho === "   " && nguon)
				throw new Error(`khoang trang tinh la co khoa: o ${o.o}`);
			if (!o.nguon && nguon)
				throw new Error(`kho nguon bat bang khoa logo: o ${o.o}`);
			if (o.nguon && !nguon)
				throw new Error(`kho nguon tat du co khoa rieng: o ${o.o}`);
			expect(nguon).toBe(o.nguon);
			expect(anh).toBe(o.anh);
			so += 2;
		}
		expect(so).toBe(BANG_HAI_BIEN.length * 2);
	});
});

type YeuCauKy = {
	pathname?: string;
	operations?: string[];
	validUntil?: number;
	allowedContentTypes?: string[];
	maximumSizeInBytes?: number;
};

describe("token-gui-di", () => {
	it("token-gui-di: mọi yêu cầu của kho nguồn mang khoá riêng, không mang khoá logo", async () => {
		const ghi: string[] = [];
		const b64 = (o: YeuCauKy & { storeId: string }) =>
			Buffer.from(JSON.stringify(o)).toString("base64url");
		const may = Bun.serve({
			port: 0,
			hostname: "127.0.0.1",
			async fetch(req) {
				const u = new URL(req.url);
				ghi.push(
					`${req.method} ${u.pathname} ${req.headers.get("authorization") ?? ""}`,
				);
				if (u.pathname === "/signed-token") {
					const vao = (await req.json()) as YeuCauKy;
					return Response.json({
						clientSigningToken: "khoa-ky-gia",
						delegationToken: `${b64({ storeId: "store_knrgia", ...vao })}.gia`,
					});
				}
				if (u.pathname === "/delete") return Response.json({});
				return new Response("", { status: 400 });
			},
		});
		try {
			process.env[API_GIA] = `http://127.0.0.1:${may.port}`;
			process.env[KHOA] = KHOA_NGUON_GIA;
			process.env[LOGO] = KHOA_LOGO_GIA;
			const kho = khoNguonVercel();
			await kho.kyPut(PATHNAME_NGUON("n1"), { kieu: "docx", toiDa: 1024 });
			await kho.kyGet(PATHNAME_NGUON("n1"), 300);
			await kho.xoa(PATHNAME_NGUON("n1"));
		} finally {
			may.stop(true);
		}
		expect(ghi.length).toBeGreaterThanOrEqual(3);
		for (const dong of ghi) {
			if (dong.includes(KHOA_LOGO_GIA))
				throw new Error(
					`yeu cau mang khoa logo: ${dong.split(" ").slice(0, 2).join(" ")}`,
				);
			expect(dong.endsWith(`Bearer ${KHOA_NGUON_GIA}`)).toBe(true);
		}
		expect(ghi.filter((d) => d.startsWith("POST /signed-token")).length).toBe(
			2,
		);
		expect(ghi.filter((d) => d.startsWith("POST /delete")).length).toBe(1);
	});
});
