import type { Db } from "../../packages/db/src/client.ts";
import { MINUTE_MS } from "../../packages/db/src/okr-tro-ly-danh-muc.ts";

const NGUONG = { trongNgayMs: 24 * 60 * MINUTE_MS } as const;

export const CO = {
	quaMotNgay: "quá một ngày",
	chuaCoBanChup: "chưa có bản chụp",
} as const;

export type DongDoSanPham = {
	ma: string;
	khaiLuc: string;
	caiLuc: string | null;
	banChupDauLuc: string | null;
	treMs: number | null;
	co: string[];
};

export type KetQuaDo = { dong: DongDoSanPham[]; dat: boolean };

function phut(ms: number): string {
	const p = Math.round(ms / MINUTE_MS);
	return p >= 60
		? `${Math.floor(p / 60)}h${String(p % 60).padStart(2, "0")}m`
		: `${p}m`;
}

export async function doSanPham(
	db: Db,
	loc: { tienTo?: string } = {},
): Promise<KetQuaDo> {
	const ds = await db.sanPhamLoTrinh.findMany({
		where: {
			luuTruLuc: null,
			ma: loc.tienTo ? { startsWith: loc.tienTo } : undefined,
		},
		orderBy: { taoLuc: "asc" },
		select: { ma: true, taoLuc: true, caiLuc: true, layDauLuc: true },
	});
	const dong = ds.map((s): DongDoSanPham => {
		const moc = Math.max(s.taoLuc.getTime(), s.caiLuc?.getTime() ?? 0);
		const treMs = s.layDauLuc ? s.layDauLuc.getTime() - moc : null;
		const co: string[] = [];
		if (treMs === null) co.push(CO.chuaCoBanChup);
		else if (treMs > NGUONG.trongNgayMs) co.push(CO.quaMotNgay);
		return {
			ma: s.ma,
			khaiLuc: s.taoLuc.toISOString(),
			caiLuc: s.caiLuc?.toISOString() ?? null,
			banChupDauLuc: s.layDauLuc?.toISOString() ?? null,
			treMs,
			co,
		};
	});
	return { dong, dat: dong.length > 0 && dong.every((d) => d.co.length === 0) };
}

export function inDong(d: DongDoSanPham): string {
	return [
		d.ma,
		`khai ${d.khaiLuc}`,
		`cai ${d.caiLuc ?? "-"}`,
		`ban-chup-dau ${d.banChupDauLuc ?? "-"}`,
		`do-tre ${d.treMs === null ? "-" : phut(d.treMs)}`,
		...d.co.map((c) => `[${c}]`),
	].join(" · ");
}

if (import.meta.main) {
	const tienTo = process.argv
		.find((a) => a.startsWith("--tien-to="))
		?.split("=")[1];
	try {
		const { db } = await import("../../packages/db/src/client.ts");
		const kq = await doSanPham(db, { tienTo });
		for (const d of kq.dong) console.log(inDong(d));
		console.log(
			`KET LUAN: ${kq.dat ? "dat" : "khong dat"} — kho thu hai hien du trong ngay cai (${kq.dong.length} san pham)`,
		);
		process.exit(0);
	} catch (loi) {
		console.error(
			`lo-trinh:do-san-pham: khong doc duoc danh ba san pham — ${loi instanceof Error ? loi.message.split("\n")[0] : String(loi)}`,
		);
		process.exit(2);
	}
}
