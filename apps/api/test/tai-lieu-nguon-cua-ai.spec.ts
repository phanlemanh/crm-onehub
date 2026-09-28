import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { db } from "@crm/db";
import { PATHNAME_NGUON } from "@crm/db/blob-nguon";
import { khoNguonGia } from "@crm/db/test/blob-nguon-gia";
import { bam, docxNho, pngNho } from "./tai-lieu-nguon-mau";
import {
	type Ai,
	dungSan,
	goi,
	type Json,
	ma,
	ok,
	phien,
	type TraLoi,
} from "./tai-lieu-san";

const gia = khoNguonGia();
dungSan(gia);

const GHIM = "xoa tep nguon cua nguoi khac";
const GHIM_SONG_SONG = "xoa tep nguon vua ghi khi gui song song";
const PHIEU_GIA = `${Date.now() + 60_000}.phieu-tu-che`;

type Cho = { pathname: string; phieu?: string };

async function xinCho(ai: Ai, tenTep: string, byte: Uint8Array): Promise<Cho> {
	const cho = ok<Cho>(
		await goi(
			"taiLieuNguon.xinCho",
			{ tenTep, kieu: "docx", kichThuoc: byte.length },
			ai,
		),
		`xin cho ${tenTep}`,
	);
	gia.daPut.set(cho.pathname, byte);
	return cho;
}

const nhan = (ai: Ai, cho: Cho, dich: Json): Promise<TraLoi> =>
	goi(
		"taiLieuNguon.nhan",
		{
			pathname: cho.pathname,
			tenTep: "hoa-hong.docx",
			dich,
			phieu: cho.phieu ?? PHIEU_GIA,
		},
		ai,
	);

const dichMoi = (): Json => ({
	loai: "moi",
	ten: ma("Trang moi"),
	loaiTrang: "quy-dinh",
	chuTrangId: phien.chu.nguoi,
});
const DICH_SAI: Json = { loai: "cap-nhat", slug: "khong-co-trang-nay" };

const moi = (nhan: string) => docxNho(`${nhan} ${randomUUID()} tầng hai 1,5%.`);

async function dem() {
	const [nguon, viec] = await Promise.all([
		db.taiLieuNguon.count(),
		db.agentTask.count({ where: { kind: "soan-tu-nguon" } }),
	]);
	return { nguon, viec };
}

type KetCa = { tra: TraLoi; duocXoa: string | null; mongNhan?: boolean };
type Ca = { ca: string; chay: () => Promise<KetCa> };

describe("nguon-cua-ai", () => {
	test("nguon-cua-ai: chi duong luu vua cap cho chinh nguoi goi moi duoc nhan hay xoa", async () => {
		const byteN1 = moi("N1");
		const choN1 = await xinCho("tao", "n1.docx", byteN1);
		const n1 = ok<{ nguonId: string; trung: boolean }>(
			await nhan("tao", choN1, dichMoi()),
			"nhan n1",
		);
		expect(n1.trung).toBe(false);
		const hangN1 = await db.taiLieuNguon.findUniqueOrThrow({
			where: { id: n1.nguonId },
			select: { blobPathname: true, sha256: true },
		});
		const p1: Cho = { pathname: hangN1.blobPathname };

		const tuXin = async (
			ai: Ai,
			byte: Uint8Array,
			dich: Json,
			mongNhan = false,
		): Promise<KetCa> => {
			const cho = await xinCho(ai, "tu-xin.docx", byte);
			return {
				tra: await nhan(ai, cho, dich),
				duocXoa: cho.pathname,
				mongNhan,
			};
		};
		const khongXoa = async (tra: Promise<TraLoi>): Promise<KetCa> => ({
			tra: await tra,
			duocXoa: null,
		});

		const CA: Ca[] = [
			{
				ca: "khac-p1-dich-sai",
				chay: () => khongXoa(nhan("khac", p1, DICH_SAI)),
			},
			{
				ca: "khac-p1-trung-byte",
				chay: () => khongXoa(nhan("khac", p1, dichMoi())),
			},
			{ ca: "okr-p1", chay: () => khongXoa(nhan("okr", p1, dichMoi())) },
			{
				ca: "khac-chua-cap",
				chay: () => {
					const la = { pathname: PATHNAME_NGUON(randomUUID()) };
					gia.daPut.set(la.pathname, moi("La"));
					return khongXoa(nhan("khac", la, DICH_SAI));
				},
			},
			{
				ca: "khac-phieu-cua-tao",
				chay: async () => {
					const choTao = await xinCho("tao", "cua-tao.docx", moi("Cua tao"));
					return khongXoa(nhan("khac", choTao, DICH_SAI));
				},
			},
			{
				ca: "tao-phieu-cu-dich-sai",
				chay: () => khongXoa(nhan("tao", choN1, DICH_SAI)),
			},
			{
				ca: "tao-phieu-cu-trung-byte",
				chay: () => khongXoa(nhan("tao", choN1, dichMoi())),
			},
			{
				ca: "tu-xin-dich-sai",
				chay: () => tuXin("khac", moi("Dich sai"), DICH_SAI),
			},
			{ ca: "tu-xin-sai-loai", chay: () => tuXin("khac", pngNho(), dichMoi()) },
			{
				ca: "tu-xin-trung-byte",
				chay: () => tuXin("khac", byteN1, dichMoi(), true),
			},
		];

		const loi: string[] = [];
		for (const c of CA) {
			const truoc = await dem();
			const xoaTruoc = gia.daXoa.length;
			const { tra, duocXoa, mongNhan } = await c.chay();
			const sau = await dem();
			const daXoa = gia.daXoa.slice(xoaTruoc);
			if (!mongNhan && tra.status < 400)
				loi.push(`${c.ca}: duoc nhan (${tra.status})`);
			if (mongNhan && tra.status >= 400)
				loi.push(`${c.ca}: bi tu choi (${tra.status})`);
			if (daXoa.includes(p1.pathname)) loi.push(`${GHIM}: ${c.ca}`);
			const khac = daXoa.filter((x) => x !== duocXoa);
			if (khac.length > 0) loi.push(`${c.ca}: xoa la ${khac.join(", ")}`);
			if (duocXoa && !daXoa.includes(duocXoa))
				loi.push(`${c.ca}: khong xoa tep vua tai cua chinh minh`);
			if (sau.nguon !== truoc.nguon || sau.viec !== truoc.viec)
				loi.push(`${c.ca}: ghi hang moi`);
		}
		expect(loi).toEqual([]);

		const ve = ok<{ url: string }>(
			await goi("taiLieuNguon.taiVe", { id: n1.nguonId }, "tao"),
			"tai ve n1",
		);
		expect(
			ve.url.endsWith(`/get/${hangN1.blobPathname}`),
			"tai ve ky nham tep",
		).toBe(true);
		const conLai = await gia.doc(hangN1.blobPathname);
		expect(conLai, "tep cua n1 da mat").not.toBeNull();
		expect(bam(conLai ?? new Uint8Array())).toBe(hangN1.sha256);
	});

	test("nguon-cua-ai: hai luot nhan song song cung phieu thi mot luot ghi, tep cua no con nguyen", async () => {
		const cho = await xinCho("tao", "song-song.docx", moi("Song song"));
		const xoaTruoc = gia.daXoa.length;
		const ket = await Promise.all([
			nhan("tao", cho, dichMoi()),
			nhan("tao", cho, dichMoi()),
			nhan("tao", cho, dichMoi()),
		]);
		expect(ket.filter((k) => k.status < 400).length, GHIM_SONG_SONG).toBe(1);
		const hang = await db.taiLieuNguon.findUnique({
			where: { blobPathname: cho.pathname },
			select: { id: true },
		});
		expect(hang, "khong co hang nao cho duong luu").not.toBeNull();
		expect(
			gia.daXoa.slice(xoaTruoc).includes(cho.pathname),
			GHIM_SONG_SONG,
		).toBe(false);
		expect(await gia.doc(cho.pathname), GHIM_SONG_SONG).not.toBeNull();
	});
});
