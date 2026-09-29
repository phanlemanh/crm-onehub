import {
	afterEach,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { taoDeXuatTaiLieu } from "@crm/db/tai-lieu-de-xuat";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { parseNhacPayload } from "@crm/validation/nhac-ke-hoach";
import {
	chayNhac,
	chuDeNhac,
	LOAI_VIEC_NHAC,
	lenLichNhac,
} from "../agent/lib/nhac-ke-hoach";
import { TIEU_DE } from "../agent/lib/tin-nhac";
import { ZALO } from "../agent/lib/zalo-config";
import { gieoNguoi, moXuong } from "./support/nhac-gieo";
import { lucVN } from "./support/nhac-gui-gieo";
import { batBot, noiZalo, voiToken } from "./support/okr-gieo";
import { nhan } from "./support/tra-loi-gieo";
import { zaloGia } from "./support/zalo-gia";

const APP_URL = "https://crm.test";
const NGAY = "2031-11-03";
const NGAY_SAU = "2031-11-04";

const nguoi = { X: "", A: "", M: "", Y: "" };
const ZALO_CUA = { X: "ZTX", A: "ZTA", M: "ZTM", Y: "ZTY" } as const;
const MONG_N = { X: 2, A: 3, M: 0, Y: 1 } as const;

let slugXuong = "";
let demTrang = 0;

afterEach(() => {
	setSystemTime();
});

async function donTaiLieuHet(): Promise<void> {
	await db.taiLieuLienKet.deleteMany({});
	await db.taiLieuSuKien.deleteMany({});
	await db.taiLieuTrang.updateMany({ data: { banDangDungId: null } });
	await db.taiLieuDeXuat.updateMany({ data: { banGocId: null } });
	await db.taiLieuPhienBan.deleteMany({});
	await db.taiLieuDeXuat.deleteMany({});
	await db.taiLieuNguon.deleteMany({});
	await db.taiLieuTrang.deleteMany({});
}

async function trangCua(chu: string): Promise<string> {
	demTrang += 1;
	const t = await db.taiLieuTrang.create({
		data: {
			slug: `tln-${Date.now().toString(36)}-${demTrang}`,
			ten: `Trang nhắc ${demTrang}`,
			loai: "quy-dinh",
			chuTrangId: chu,
			taoBoiId: chu,
		},
	});
	return t.id;
}

async function banDeXuat(
	trangId: string,
	tao: string,
	trangThai: "CHO_DUYET" | "TRA_LAI" | "CU",
): Promise<void> {
	const { deXuatId } = await db.$transaction((tx) =>
		taoDeXuatTaiLieu(tx, {
			trangId,
			banGocId: null,
			ten: "Bản đề xuất",
			noiDung: `Nội dung ${trangThai} ${demTrang}.\n`,
			taoBoiId: tao,
			suKien: "DE_XUAT",
		}),
	);
	if (trangThai !== "CHO_DUYET") {
		await db.taiLieuDeXuat.update({
			where: { id: deXuatId },
			data: { trangThai },
		});
	}
}

async function chayNgay(ngay: string) {
	const luc = lucVN(ngay, 1);
	setSystemTime(luc);
	await lenLichNhac(luc);
	const z = zaloGia();
	const ket = new Map<string, { tin: string[]; daGui: unknown[] | null }>();
	for (const [k, userId] of Object.entries(nguoi)) {
		const hang = await db.agentTask.findFirst({
			where: { kind: LOAI_VIEC_NHAC, subject: chuDeNhac(userId, luc) },
		});
		if (hang) {
			await voiToken(() =>
				chayNhac(hang, { zaloFetcher: z.fetcher, appUrl: APP_URL }),
			);
		}
		const sau = hang
			? await db.agentTask.findUniqueOrThrow({ where: { id: hang.id } })
			: null;
		ket.set(k, {
			tin: z
				.guiToi(ZALO_CUA[k as keyof typeof ZALO_CUA])
				.map((g) => String(g.body.text ?? "")),
			daGui: sau ? (parseNhacPayload(sau.payload).daGui ?? []) : null,
		});
	}
	return { luc, ket };
}

beforeAll(async () => {
	await donTaiLieuHet();
	await moXuong();
	await batBot();
	for (const k of Object.keys(nguoi) as (keyof typeof nguoi)[]) {
		nguoi[k] = (await gieoNguoi(`Tài liệu ${k}`)).id;
		await noiZalo(nguoi[k], ZALO_CUA[k]);
	}
	await db.member.updateMany({
		where: { userId: nguoi.A },
		data: { role: "admin" },
	});
	const x1 = await trangCua(nguoi.X);
	const x2 = await trangCua(nguoi.X);
	await banDeXuat(x1, nguoi.M, "CHO_DUYET");
	await banDeXuat(x2, nguoi.M, "CHO_DUYET");
	await banDeXuat(x1, nguoi.M, "CU");
	await banDeXuat(x2, nguoi.M, "TRA_LAI");
	await banDeXuat(await trangCua(nguoi.Y), nguoi.M, "CHO_DUYET");
	const xuong = await db.organization.findUniqueOrThrow({
		where: { id: WORKSPACE_ID },
		select: { slug: true },
	});
	slugXuong = xuong.slug ?? "";
});

describe("nhac-sang", () => {
	test("nhac-sang: moi nguoi co dong N ban cho duyet dung so tab, khong ban thi khong tin", async () => {
		const { ket } = await chayNgay(NGAY);
		const duong = `${APP_URL}/${slugXuong}/tai-lieu?tabTaiLieu=cho-duyet`;
		for (const [k, n] of Object.entries(MONG_N)) {
			const { tin, daGui } = ket.get(k) ?? { tin: [], daGui: null };
			if (n === 0) {
				expect(daGui, `nhac-sang: ${k} khong co hang nhac`).toBeNull();
				expect(tin).toEqual([]);
				continue;
			}
			const cau = `bản đề xuất chờ bạn duyệt`;
			const dong = (tin[0] ?? "").split("\n").find((d) => d.includes(cau));
			const so = Number(/(\d+) bản đề xuất/.exec(dong ?? "")?.[1] ?? 0);
			if (so !== n) {
				throw new Error(`nhac-sang: ${k} nhan ${so} thay vi ${n}`);
			}
			expect(dong?.includes(duong), `nhac-sang: ${k} co duong mo`).toBe(true);
			expect(daGui).toContainEqual({ loai: "tai-lieu-cho-duyet", so: n });
			expect(JSON.stringify(daGui).includes("Trang nhắc")).toBe(false);
		}
	});

	test("nhac-sang: tra loi xong vao dong Kho tai lieu bi tu choi, khong doi gi", async () => {
		const luc = lucVN(NGAY, 5);
		const truoc = await db.taiLieuDeXuat.groupBy({
			by: ["trangThai"],
			_count: { _all: true },
		});
		const { tra } = await nhan(ZALO_CUA.Y, "xong 1", luc);
		expect(tra[0]).toBe(
			`${ZALO.loi.khongPhaiBuoc(1, TIEU_DE["tai-lieu-cho-duyet"], null)} ${ZALO.loi.chuaDanhDau}`,
		);
		const sau = await db.taiLieuDeXuat.groupBy({
			by: ["trangThai"],
			_count: { _all: true },
		});
		expect(sau).toEqual(truoc);
	});

	test("nhac-sang: quan tri doi thanh thanh vien thi sang sau khong con dong", async () => {
		await db.member.updateMany({
			where: { userId: nguoi.A },
			data: { role: "member" },
		});
		const { ket } = await chayNgay(NGAY_SAU);
		expect(ket.get("A")?.daGui ?? null).toBeNull();
		expect(ket.get("X")?.daGui).toContainEqual({
			loai: "tai-lieu-cho-duyet",
			so: 2,
		});
	});
});
