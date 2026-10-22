import { afterAll, describe, it } from "bun:test";
import { createHash } from "node:crypto";
import { db } from "@crm/db";
import { BLOB_TEP_TRUONG, khoTepTruongVercel } from "@crm/db/blob-tep-truong";
import {
	canData,
	donBanGhi,
	dungSan,
	noi,
	type OTep,
	TIEN_TO,
	type TraLoi,
} from "./truong-tep-san";

const BAT = process.env.TTB_BLOB_THAT === "1";
const GIAY_MS = 1_000;
const CHO = { lanThu: 30, nghiMs: GIAY_MS } as const;
const KHO_KHAC = ["KHO_TAI_LIEU_BLOB_TOKEN", "BLOB_READ_WRITE_TOKEN"] as const;
const tienTo = `${TIEN_TO}blob`;
const daTao = {
	deal: [] as string[],
	company: [] as string[],
	contact: [] as string[],
	field: [] as string[],
};
const daPut = new Set<string>();
const SO_BAI = 3;
let daChay = 0;

function khoaTep(): string {
	const khoa = process.env[BLOB_TEP_TRUONG.bienKhoa]?.trim();
	if (!khoa) throw new Error("ttp blob that: thieu khoa");
	for (const bien of KHO_KHAC) {
		if (process.env[bien]?.trim() === khoa) {
			throw new Error("ttp blob that: muon khoa kho khac");
		}
	}
	return khoa;
}

async function blob() {
	return import("@vercel/blob");
}

async function conLai(token: string): Promise<string[]> {
	const { list } = await blob();
	const con: string[] = [];
	let cursor: string | undefined;
	do {
		const trang = await list({
			token,
			prefix: `${BLOB_TEP_TRUONG.thuMuc}/`,
			cursor,
		});
		for (const b of trang.blobs)
			if (daPut.has(b.pathname)) con.push(b.pathname);
		cursor = trang.hasMore ? trang.cursor : undefined;
	} while (cursor);
	return con;
}

async function donBlob(): Promise<void> {
	const token = process.env[BLOB_TEP_TRUONG.bienKhoa]?.trim();
	if (!token || daPut.size === 0) return;
	const { del } = await blob();
	await del([...daPut], { token }).catch(() => {});
}

async function choDen(dieu: () => Promise<boolean>): Promise<boolean> {
	for (let i = 0; i < CHO.lanThu; i += 1) {
		if (await dieu()) return true;
		await Bun.sleep(CHO.nghiMs);
	}
	return false;
}

const sha = (byte: Uint8Array) =>
	createHash("sha256").update(byte).digest("hex");

function pdfTam(nhan: string, co: number): Uint8Array {
	const dau = new TextEncoder().encode(`%PDF-1.4\n% ${nhan}\n`);
	const duoi = new TextEncoder().encode("\n%%EOF\n");
	const giua = new Uint8Array(co - dau.length - duoi.length);
	crypto.getRandomValues(giua);
	return noi(dau, giua, duoi);
}

const san = BAT
	? dungSan({
			kho: khoTepTruongVercel(),
			ten: "blob",
			don: async () => {
				await donBlob();
				await donBanGhi(daTao);
			},
		})
	: null;

function canSan() {
	if (!san) throw new Error("ttp blob that: tat");
	return san;
}

async function goi(
	thuTuc: string,
	vao: Record<string, unknown>,
): Promise<TraLoi> {
	return canSan().goi("quanTri", thuTuc, vao as never);
}

async function taiLen(
	o: OTep,
	tenTep: string,
	byte: Uint8Array,
): Promise<{ pathname: string; tepId: string }> {
	const xin = canData<{ pathname: string; url: string; phieu: string }>(
		await goi("fieldFiles.requestUpload", {
			...o,
			tenTep,
			kieu: "pdf",
			kichThuoc: byte.length,
		}),
		"blob that xin cho",
	);
	daPut.add(xin.pathname);
	const put = await fetch(xin.url, {
		method: "PUT",
		body: byte,
		headers: { "content-type": "application/pdf" },
	});
	if (!put.ok) throw new Error(`ttp blob that: put ${put.status}`);
	const tepId = canData<{ tepId: string }>(
		await goi("fieldFiles.complete", {
			...o,
			tenTep,
			pathname: xin.pathname,
			phieu: xin.phieu,
		}),
		"blob that nhan",
	).tepId;
	return { pathname: xin.pathname, tepId };
}

describe.skipIf(!BAT)("ttp-blob-that", () => {
	afterAll(() => {
		console.log(`ttp-blob-that: ${daChay} chay, ${SO_BAI - daChay} skip`);
	});
	const ctx: {
		token: string;
		deal: string;
		o: OTep;
		pathname: string;
		tepId: string;
		url: string;
		byte: Uint8Array;
	} = {
		token: "",
		deal: "",
		o: { entity: "DEAL", recordId: "", fieldKey: "" },
		pathname: "",
		tepId: "",
		url: "",
		byte: new Uint8Array(),
	};

	it("ttp-blob-that: tải lên kho riêng tư thật, mở bằng link ký, đường trần bị chặn", async () => {
		daChay += 1;
		ctx.token = khoaTep();
		const status = await canSan().hoi("quanTri", "fieldFiles.status");
		if (status.status === 404) throw new Error("ttp blob that: thieu thu tuc");
		const congTy = canData<{ id: string }>(
			await goi("companies.create", { name: `${tienTo} cong ty` }),
			"blob that cong ty",
		).id;
		daTao.company.push(congTy);
		ctx.deal = canData<{ id: string }>(
			await goi("deals.create", {
				name: `${tienTo} thoa thuan`,
				companyId: congTy,
				ownerId: canSan().phien.quanTri.nguoi,
			}),
			"blob that thoa thuan",
		).id;
		daTao.deal.push(ctx.deal);
		const truong = canData<{ id: string; key: string }>(
			await goi("fields.create", {
				entity: "DEAL",
				label: `${tienTo} hop dong`,
				type: "FILE",
				options: [],
				agentFilled: false,
				agentBrief: null,
				required: false,
				showOnSheet: true,
				showOnTable: true,
				showOnFilter: true,
			}),
			"blob that truong",
		);
		daTao.field.push(truong.id);
		const o: OTep = {
			entity: "DEAL",
			recordId: ctx.deal,
			fieldKey: truong.key,
		};
		ctx.o = o;
		ctx.byte = pdfTam(tienTo, 8 * 1024);
		const tai = await taiLen(o, "Hop dong that.pdf", ctx.byte);
		ctx.pathname = tai.pathname;
		ctx.tepId = tai.tepId;

		ctx.url = canData<{ url: string }>(
			await goi("fieldFiles.downloadUrl", { tepId: ctx.tepId }),
			"blob that link",
		).url;
		const doiChung = await fetch(ctx.url);
		if (doiChung.status !== 200) throw new Error("ttp blob that: doi chung");
		const shaVe = sha(new Uint8Array(await doiChung.arrayBuffer()));
		if (shaVe !== sha(ctx.byte)) {
			throw new Error(`ttp blob that: tai ve ${doiChung.status} ${shaVe}`);
		}
	});

	it("ttp-blob-that: đường trần của Blob không mở được", async () => {
		daChay += 1;
		const { head } = await blob();
		const dau = await head(ctx.pathname, { token: ctx.token });
		const tran = new URL(dau.url);
		tran.search = "";
		const ma = (await fetch(tran)).status;
		if (ma === 200) throw new Error("ttp blob that: khong rieng tu");
	});

	it("ttp-blob-that: xoá tệp xoá Blob, xoá vĩnh viễn thoả thuận không để lại gì", async () => {
		daChay += 1;
		canData(
			await goi("fieldFiles.remove", { tepId: ctx.tepId }),
			"blob that xoa",
		);
		let ma = 0;
		const het = await choDen(async () => {
			ma = (await fetch(ctx.url)).status;
			return ma !== 200;
		});
		if (!het) throw new Error(`ttp blob that: xoa con ${ma}`);
		if (await db.blobChoXoa.findUnique({ where: { pathname: ctx.pathname } })) {
			throw new Error("ttp blob that: hang cho xoa con");
		}
		await taiLen(ctx.o, "Phu luc that.pdf", pdfTam(`${tienTo}b`, 8 * 1024));
		canData(await goi("deals.archive", { id: ctx.deal }), "blob that luu tru");
		canData(await goi("deals.purge", { id: ctx.deal }), "blob that xoa han");
		let con: string[] = [];
		await choDen(async () => {
			con = await conLai(ctx.token);
			return con.length === 0;
		});
		if (con.length !== 0)
			throw new Error(`ttp blob that: don de lai ${con.length}`);
	});
});
