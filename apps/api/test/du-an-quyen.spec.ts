import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { NestExpressApplication } from "@nestjs/platform-express";
import type { DauVao } from "./ma-tran-thu";
import { donDuAn, duAnThu, ngayDb, viecCoLich } from "./support/du-an-gieo";
import { donDep, moXuong } from "./support/ke-hoach-gieo";
import {
	batApp,
	donViec,
	goi,
	type KetGoi,
	nguoi,
	taoThu,
} from "./support/viec-gieo";

const MA_TRAN_MS = 900_000;

const NGUOI = [
	"taoDuAn",
	"giao",
	"thucHien",
	"theoDoi",
	"khac",
	"quanTri",
	"okr",
] as const;
type Nguoi = (typeof NGUOI)[number];

const LENH = [
	"duAn.sua",
	"duAn.dong",
	"duAn.moLai",
	"duAn.xoa",
	"duAn.moc.tao",
	"duAn.phuThuoc.tao",
	"viec.doiLich",
	"viec.doiDuAn",
	"viec.create",
] as const;
type Lenh = (typeof LENH)[number];

type Dap = { ok: true } | { code: string; message: string };

const OK: Dap = { ok: true };
const PHAM_VI: Dap = {
	code: "FORBIDDEN",
	message: "Your role does not include this part of OneHub Center.",
};
const CHI_TAO: Dap = {
	code: "FORBIDDEN",
	message: "Chỉ người tạo dự án và quản trị được đóng, mở lại hay xoá dự án.",
};
const CHI_SUA: Dap = {
	code: "FORBIDDEN",
	message: "Chỉ người giao và người thực hiện được sửa việc.",
};
const CHI_CHO: Dap = {
	code: "FORBIDDEN",
	message: "Chỉ người giao và người thực hiện của «V» được đặt việc phải chờ.",
};
const CO_LICH_SU: Dap = {
	code: "CONFLICT",
	message: "Dự án đã có lịch sử nên không xoá được; hãy đóng dự án.",
};

const DAP_AN = {
	"duAn.sua": {
		taoDuAn: OK,
		giao: OK,
		thucHien: OK,
		theoDoi: OK,
		khac: OK,
		quanTri: OK,
		okr: PHAM_VI,
	},
	"duAn.dong": {
		taoDuAn: OK,
		giao: CHI_TAO,
		thucHien: CHI_TAO,
		theoDoi: CHI_TAO,
		khac: CHI_TAO,
		quanTri: OK,
		okr: PHAM_VI,
	},
	"duAn.moLai": {
		taoDuAn: OK,
		giao: CHI_TAO,
		thucHien: CHI_TAO,
		theoDoi: CHI_TAO,
		khac: CHI_TAO,
		quanTri: OK,
		okr: PHAM_VI,
	},
	"duAn.xoa": {
		taoDuAn: OK,
		giao: CHI_TAO,
		thucHien: CHI_TAO,
		theoDoi: CHI_TAO,
		khac: CHI_TAO,
		quanTri: OK,
		okr: PHAM_VI,
	},
	"duAn.moc.tao": {
		taoDuAn: OK,
		giao: OK,
		thucHien: OK,
		theoDoi: OK,
		khac: OK,
		quanTri: OK,
		okr: PHAM_VI,
	},
	"duAn.phuThuoc.tao": {
		taoDuAn: CHI_CHO,
		giao: OK,
		thucHien: OK,
		theoDoi: CHI_CHO,
		khac: CHI_CHO,
		quanTri: CHI_CHO,
		okr: PHAM_VI,
	},
	"viec.doiLich": {
		taoDuAn: CHI_SUA,
		giao: OK,
		thucHien: OK,
		theoDoi: CHI_SUA,
		khac: CHI_SUA,
		quanTri: CHI_SUA,
		okr: PHAM_VI,
	},
	"viec.doiDuAn": {
		taoDuAn: CHI_SUA,
		giao: OK,
		thucHien: OK,
		theoDoi: CHI_SUA,
		khac: CHI_SUA,
		quanTri: CHI_SUA,
		okr: PHAM_VI,
	},
	"viec.create": {
		taoDuAn: OK,
		giao: OK,
		thucHien: OK,
		theoDoi: OK,
		khac: OK,
		quanTri: OK,
		okr: PHAM_VI,
	},
} satisfies Record<Lenh, Record<Nguoi, Dap>>;

const O_THEM: { nguoi: Nguoi; dap: Dap }[] = [
	{ nguoi: "taoDuAn", dap: CO_LICH_SU },
	{ nguoi: "khac", dap: CHI_TAO },
];

const SO_O = LENH.length * NGUOI.length + O_THEM.length;

let app: NestExpressApplication;

beforeAll(async () => {
	await moXuong();
	app = await batApp();
});

afterAll(async () => {
	await app.close();
	await donDuAn();
	await donViec();
	await donDep();
});

function json<T>(x: T): string {
	return JSON.stringify(x);
}

async function demGhi() {
	const [duAn, duAnVet, duAnMoc, viecPhuThuoc, viec, viecVet] =
		await Promise.all([
			db.duAn.count(),
			db.duAnVet.count(),
			db.duAnMoc.count(),
			db.viecPhuThuoc.count(),
			db.viec.count(),
			db.viecVet.count(),
		]);
	return { duAn, duAnVet, duAnMoc, viecPhuThuoc, viec, viecVet };
}

function khop(kq: KetGoi, dap: Dap): boolean {
	if ("ok" in dap) return kq.status === 200;
	return kq.code === dap.code && kq.message === dap.message;
}

describe("dg-quyen", () => {
	test(
		"dg-quyen: 65 ô người × lệnh khớp đáp án viết sẵn",
		async () => {
			const ai = {
				taoDuAn: await nguoi("dgq-t", "member"),
				giao: await nguoi("dgq-a", "member"),
				thucHien: await nguoi("dgq-b", "member"),
				theoDoi: await nguoi("dgq-w", "member"),
				khac: await nguoi("dgq-x", "member"),
				quanTri: await nguoi("dgq-q", "admin"),
				okr: await nguoi("dgq-o", "okr"),
			} satisfies Record<Nguoi, { id: string }>;

			const duAnMo = async () => {
				const P = await duAnThu(ai.taoDuAn.id);
				const V = await taoThu({
					nguoiId: ai.giao.id,
					nguoiThucHienId: ai.thucHien.id,
					nguoiTheoDoiIds: [ai.theoDoi.id],
					tieuDe: "V",
					gan: [],
					duAnId: P.id,
					hanNgay: ngayDb("2026-10-21"),
					batDauNgay: ngayDb("2026-10-19"),
				});
				return { P: P.id, V: V.id };
			};

			const dung = {
				"duAn.sua": async () => {
					const { P } = await duAnMo();
					return { ten: "duAn.sua", input: { id: P, ten: "Đổi tên" } };
				},
				"duAn.dong": async () => {
					const { P } = await duAnMo();
					return { ten: "duAn.dong", input: { id: P } };
				},
				"duAn.moLai": async () => {
					const { P } = await duAnMo();
					const d = await goi(
						app,
						"duAn.dong",
						"mutation",
						{ id: P },
						ai.taoDuAn.id,
					);
					if (d.status !== 200)
						throw new Error(`dgq: dung dong loi ${json(d)}`);
					return { ten: "duAn.moLai", input: { id: P } };
				},
				"duAn.xoa": async () => {
					const R = await duAnThu(ai.taoDuAn.id, "Rỗng");
					return { ten: "duAn.xoa", input: { id: R.id } };
				},
				"duAn.moc.tao": async () => {
					const { P } = await duAnMo();
					return {
						ten: "duAn.mocTao",
						input: { duAnId: P, ten: "Mốc", ngay: "2026-10-30", cho: [] },
					};
				},
				"duAn.phuThuoc.tao": async () => {
					const { P, V } = await duAnMo();
					const U = await viecCoLich({
						duAnId: P,
						giaoId: ai.giao.id,
						tieuDe: "U",
						batDau: "2026-10-12",
						han: "2026-10-13",
					});
					return {
						ten: "duAn.phuThuocTao",
						input: { truocId: U.id, sauId: V },
					};
				},
				"viec.doiLich": async () => {
					const { V } = await duAnMo();
					return {
						ten: "viec.doiLich",
						input: { id: V, batDauNgay: "2026-10-20", hanNgay: "2026-10-22" },
					};
				},
				"viec.doiDuAn": async () => {
					const { V } = await duAnMo();
					return { ten: "viec.doiDuAn", input: { id: V, duAnId: null } };
				},
				"viec.create": async () => {
					const { P } = await duAnMo();
					return {
						ten: "viec.create",
						input: { tieuDe: "Mới trong dự án", duAnId: P },
					};
				},
			} satisfies Record<Lenh, () => Promise<{ ten: string; input: DauVao }>>;

			let daSo = 0;
			let thanhCong = 0;
			let khaiOk = 0;
			const chay = async (
				n: Nguoi,
				lenh: string,
				ten: string,
				input: DauVao,
				dap: Dap,
			) => {
				if ("ok" in dap) khaiOk += 1;
				const truoc = await demGhi();
				const kq = await goi(app, ten, "mutation", input, ai[n].id);
				daSo += 1;
				if (kq.status === 200) thanhCong += 1;
				if (!khop(kq, dap)) {
					throw new Error(`dgq: o ${n} ${lenh} lech ${json(kq)}`);
				}
				if (!("ok" in dap) && json(await demGhi()) !== json(truoc)) {
					throw new Error(`dgq: o tu choi van ghi ${n} ${lenh}`);
				}
			};

			for (const lenh of LENH) {
				for (const n of NGUOI) {
					const { ten, input } = await dung[lenh]();
					await chay(n, lenh, ten, input, DAP_AN[lenh][n]);
				}
			}
			for (const o of O_THEM) {
				const { P } = await duAnMo();
				await chay(
					o.nguoi,
					"duAn.xoa co lich su",
					"duAn.xoa",
					{ id: P },
					o.dap,
				);
			}

			if (daSo !== SO_O) throw new Error(`dgq: ma tran thieu ${daSo}`);

			const { P } = await duAnMo();
			const ds = await goi(
				app,
				"duAn.list",
				"query",
				{ trangThai: "mo" },
				ai.okr.id,
			);
			const lich = await goi(app, "duAn.lich", "query", { id: P }, ai.okr.id);
			if (ds.code !== "FORBIDDEN" || lich.code !== "FORBIDDEN") {
				throw new Error("dgq: okr doc du an");
			}

			if (thanhCong !== khaiOk) {
				throw new Error(`dgq: so o thanh cong ${thanhCong}`);
			}
			expect(daSo).toBe(65);
		},
		MA_TRAN_MS,
	);
});
