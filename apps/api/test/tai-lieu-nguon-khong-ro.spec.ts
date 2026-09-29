import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { taoDeXuatTaiLieu } from "@crm/db/tai-lieu-de-xuat";
import { khoNguonGia } from "@crm/db/test/blob-nguon-gia";
import { bam, docxNho } from "./tai-lieu-nguon-mau";
import {
	AI,
	type Ai,
	dungSan,
	goi,
	hashCua,
	hoi,
	ma,
	ok,
	phien,
	type TraLoi,
	traLai,
} from "./tai-lieu-san";

const gia = khoNguonGia();
dungSan(gia);

const TRANG_THAI = ["N1", "N2", "N3"] as const;
type TrangThai = (typeof TRANG_THAI)[number];
const THU_TUC = ["list", "get", "taiVe", "proposal"] as const;
type ThuTuc = (typeof THU_TUC)[number];

const THAY_NGUON_KHAI = {
	N1: ["tao", "chu", "owner", "admin"],
	N2: ["tao", "chu", "owner", "admin", "khac", "okr"],
	N3: ["tao", "chu", "owner", "admin"],
} satisfies Record<TrangThai, readonly Ai[]>;
const THAY_NGUON = new Map<string, readonly string[]>(
	Object.entries(THAY_NGUON_KHAI),
);
const THAY_DE_XUAT: readonly Ai[] = ["tao", "chu", "owner", "admin"];

function thay(t: TrangThai, thuTuc: ThuTuc, ai: Ai): boolean {
	if (thuTuc === "proposal") return THAY_DE_XUAT.includes(ai);
	return THAY_NGUON.get(t)?.includes(ai) ?? false;
}

type Mau = { nguonId: string; deXuatId: string; sha256: string };

async function nguonThat(): Promise<Mau> {
	const byte = docxNho(ma("chu"));
	const cho = ok<{ pathname: string; phieu: string }>(
		await goi(
			"taiLieuNguon.xinCho",
			{ tenTep: "q.docx", kieu: "docx", kichThuoc: byte.length },
			"tao",
		),
		"xin cho",
	);
	gia.daPut.set(cho.pathname, byte);
	const nhan = await goi(
		"taiLieuNguon.nhan",
		{
			pathname: cho.pathname,
			phieu: cho.phieu,
			tenTep: "q.docx",
			dich: {
				loai: "moi",
				ten: ma("Dich"),
				loaiTrang: "quy-dinh",
				chuTrangId: phien.chu.nguoi,
			},
		},
		"tao",
	);
	const { nguonId } = ok<{ nguonId: string }>(nhan, "nhan");
	const nguon = await db.taiLieuNguon.findUniqueOrThrow({
		where: { id: nguonId },
		select: { trangId: true, sha256: true },
	});
	const { deXuatId } = await db.$transaction((tx) =>
		taoDeXuatTaiLieu(tx, {
			trangId: nguon.trangId,
			banGocId: null,
			ten: "Quy định",
			noiDung: "## Quy định\n\nÁp dụng cho mọi phòng ban.",
			taoBoiId: phien.tao.nguoi,
			suKien: "DE_XUAT",
			nguonId,
			trichDoan: [],
		}),
	);
	return { nguonId, deXuatId, sha256: nguon.sha256 };
}

async function dungTrangThai(t: TrangThai): Promise<Mau> {
	const m = await nguonThat();
	if (t === "N2") {
		ok(
			await goi(
				"taiLieu.approve",
				{ id: m.deXuatId, diffHash: await hashCua(m.deXuatId, "chu") },
				"chu",
			),
			"duyet N2",
		);
	}
	if (t === "N3") await traLai(m.deXuatId, "chu");
	return m;
}

const KHONG_CO = "khong-co-nguon-nao";

async function goiThuTuc(thuTuc: ThuTuc, id: string, ai: Ai): Promise<TraLoi> {
	if (thuTuc === "list") return hoi("taiLieuNguon.list", undefined, ai);
	if (thuTuc === "get") return hoi("taiLieuNguon.get", { id }, ai);
	if (thuTuc === "taiVe") return goi("taiLieuNguon.taiVe", { id }, ai);
	return hoi("taiLieu.proposal", { id }, ai);
}

function coDong(tra: TraLoi, nguonId: string): boolean {
	const data = tra.data as { rows?: { id: string }[] } | null;
	return (data?.rows ?? []).some((r) => r.id === nguonId);
}

async function taiBangUrl(tra: TraLoi): Promise<string> {
	const { url } = tra.data as { url: string };
	const pathname = url.split("/get/")[1] ?? "";
	return bam(gia.daPut.get(pathname) ?? new Uint8Array());
}

describe("nguon-khong-ro", () => {
	test("nguon-khong-ro: ma tran 6 nguoi x 3 trang thai x 4 thu tuc", async () => {
		const dong: string[] = [];
		for (const t of TRANG_THAI) {
			const m = await dungTrangThai(t);
			for (const thuTuc of THU_TUC) {
				const idCua = thuTuc === "proposal" ? m.deXuatId : m.nguonId;
				for (const ai of AI) {
					const mong = thay(t, thuTuc, ai);
					const tra = await goiThuTuc(thuTuc, idCua, ai);
					let that: boolean;
					if (thuTuc === "list") {
						ok(tra, `list ${ai}`);
						that = coDong(tra, m.nguonId);
					} else if (tra.status === 200) {
						that = true;
					} else {
						const vang = await goiThuTuc(thuTuc, KHONG_CO, ai);
						expect(`${tra.status} ${tra.loi}`).toBe(
							`${vang.status} ${vang.loi}`,
						);
						expect(tra.status).toBe(404);
						that = false;
					}
					if (that && thuTuc === "taiVe") {
						expect(gia.kyGetCuoi).toBeLessThanOrEqual(300);
						expect(await taiBangUrl(tra)).toBe(m.sha256);
					}
					dong.push(`${ai} x ${t} x ${thuTuc}: ${that ? "thay" : "khong"}`);
					expect(`${ai} x ${t} x ${thuTuc}: ${that}`).toBe(
						`${ai} x ${t} x ${thuTuc}: ${mong}`,
					);
				}
			}
		}
		for (const d of dong) console.log(d);
		expect(dong.length).toBe(AI.length * TRANG_THAI.length * THU_TUC.length);
		expect(dong.length).toBe(72);
	});
});
