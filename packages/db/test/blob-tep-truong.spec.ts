import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { khoNguonVercel } from "../src/blob-nguon";
import {
	BLOB_TEP_TRUONG,
	khoTepTruongVercel,
	PATHNAME_TEP,
} from "../src/blob-tep-truong";

const KHOA_TEP = "TEP_BAN_GHI_BLOB_TOKEN";
const KHOA_KHO = "KHO_TAI_LIEU_BLOB_TOKEN";
const KHOA_LOGO = "BLOB_READ_WRITE_TOKEN";
const API_GIA = "VERCEL_BLOB_API_URL";
const GIU = [KHOA_TEP, KHOA_KHO, KHOA_LOGO, API_GIA] as const;
const GIA = {
	tep: "vercel_blob_rw_tep_gia",
	kho: "vercel_blob_rw_kho_gia",
	logo: "vercel_blob_rw_logo_gia",
} as const;

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

type YeuCauKy = { pathname?: string; operations?: string[] };

const BANG = [
	{ o: "tep-co kho-co", tep: GIA.tep, kho: GIA.kho, bat: true },
	{ o: "tep-co kho-vang", tep: GIA.tep, kho: undefined, bat: true },
	{ o: "tep-vang kho-co", tep: undefined, kho: GIA.kho, bat: false },
	{ o: "tep-vang kho-vang", tep: undefined, kho: undefined, bat: false },
	{ o: "tep-trang kho-co", tep: "   ", kho: GIA.kho, bat: false },
] as const;

describe("ttp-khoa", () => {
	it("ttp-khoa: pathname nằm dưới truong-tep, không mang id bản ghi", () => {
		expect(PATHNAME_TEP("abc")).toBe("truong-tep/abc");
	});

	it("ttp-khoa: bat() chỉ theo khoá tệp, khoảng trắng là vắng", () => {
		let so = 0;
		for (const o of BANG) {
			dat(KHOA_TEP, o.tep);
			dat(KHOA_KHO, o.kho);
			dat(KHOA_LOGO, GIA.logo);
			const bat = khoTepTruongVercel().bat();
			if (bat !== o.bat) throw new Error(`ttp khoa: bat ${o.o}`);
			so += 1;
		}
		if (so !== BANG.length) throw new Error(`ttp khoa: thieu o ${so}`);
		dat(KHOA_TEP, undefined);
		dat(KHOA_KHO, GIA.kho);
		if (!khoNguonVercel().bat()) {
			throw new Error("ttp khoa: doi chung kho tai lieu tat");
		}
	});

	it("ttp-khoa: thiếu khoá tệp thì kyPut, kyGet, xoa từ chối bằng thông điệp ghim", async () => {
		dat(KHOA_TEP, "");
		dat(KHOA_KHO, GIA.kho);
		dat(API_GIA, "http://127.0.0.1:9");
		const kho = khoTepTruongVercel();
		expect(await kho.doc(PATHNAME_TEP("a"))).toBeNull();
		await expect(
			kho.kyPut(PATHNAME_TEP("a"), { mime: "application/pdf", toiDa: 10 }),
		).rejects.toThrow(BLOB_TEP_TRUONG.thongDiep.tat);
		await expect(kho.kyGet(PATHNAME_TEP("a"), 300)).rejects.toThrow(
			BLOB_TEP_TRUONG.thongDiep.tat,
		);
		await expect(kho.xoa(PATHNAME_TEP("a"))).rejects.toThrow(
			BLOB_TEP_TRUONG.thongDiep.tat,
		);
	});

	it("ttp-khoa: mọi yêu cầu tới Blob mang khoá tệp, không mang khoá Kho tài liệu hay khoá logo", async () => {
		const ghi: string[] = [];
		const b64 = (o: YeuCauKy & { storeId: string }) =>
			Buffer.from(JSON.stringify(o)).toString("base64url");
		const may = Bun.serve({
			port: 0,
			async fetch(req) {
				const u = new URL(req.url);
				ghi.push(
					`${req.method} ${u.pathname} ${req.headers.get("authorization") ?? ""}`,
				);
				if (u.pathname === "/signed-token") {
					const vao = (await req.json()) as YeuCauKy;
					return Response.json({
						clientSigningToken: "khoa-ky-gia",
						delegationToken: `${b64({ storeId: "store_ttpgia", ...vao })}.gia`,
					});
				}
				if (u.pathname === "/delete") return Response.json({});
				return new Response("", { status: 400 });
			},
		});
		try {
			dat(API_GIA, `http://localhost:${may.port}`);
			dat(KHOA_TEP, GIA.tep);
			dat(KHOA_KHO, GIA.kho);
			dat(KHOA_LOGO, GIA.logo);
			const kho = khoTepTruongVercel();
			await kho.kyPut(PATHNAME_TEP("a"), {
				mime: "application/pdf",
				toiDa: 1024,
			});
			await kho.kyGet(PATHNAME_TEP("a"), 300);
			await kho.xoa(PATHNAME_TEP("a"));
		} finally {
			may.stop(true);
		}
		if (ghi.length === 0) throw new Error("ttp khoa: khong goi");
		for (const dong of ghi) {
			if (dong.includes(GIA.kho)) {
				throw new Error(`ttp khoa: muon khoa ${KHOA_KHO}`);
			}
			if (dong.includes(GIA.logo)) {
				throw new Error(`ttp khoa: muon khoa ${KHOA_LOGO}`);
			}
			if (!dong.endsWith(`Bearer ${GIA.tep}`)) {
				throw new Error(`ttp khoa: khong mang khoa tep ${dong.split(" ")[1]}`);
			}
		}
		expect(ghi.filter((d) => d.startsWith("POST /signed-token")).length).toBe(
			2,
		);
		expect(ghi.filter((d) => d.startsWith("POST /delete")).length).toBe(1);
	});
});
