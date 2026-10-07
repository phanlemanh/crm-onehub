import { z } from "zod";
import type { DongSoan } from "./kieu";

export const KHOI_MO = "⟦ngữ cảnh từ trang soạn⟧";
export const KHOI_DONG = "⟦hết ngữ cảnh⟧";

const loaiDong = z.enum(["muc-tieu", "kr", "can-chinh"]);

const quyetBang = z.object({
	cach: z.enum(["nhan", "sua", "bac", "hoan"]),
	loai: loaiDong,
	chu: z.string(),
	khoaDong: z.string(),
});

const khoiNguCanh = z.object({
	dong: z.object({ loai: loaiDong, chu: z.string() }).nullable(),
	quyet: z.array(quyetBang),
});

const khoiNguCanhJson = z
	.string()
	.transform((chu) => {
		try {
			return JSON.parse(chu);
		} catch {
			return null;
		}
	})
	.pipe(khoiNguCanh);

export type LoaiDongKhoi = z.infer<typeof loaiDong>;
export type QuyetBang = z.infer<typeof quyetBang>;
export type KhoiNguCanh = z.infer<typeof khoiNguCanh>;
export type TinDaTach = { khoi: KhoiNguCanh | null; nguoi: string };

const DAU = `${KHOI_MO}\n`;
const CUOI = `\n${KHOI_DONG}\n`;

const rong = (k: KhoiNguCanh): boolean =>
	k.dong === null && k.quyet.length === 0;

export function vietKhoi(khoi: KhoiNguCanh, nguoi: string): string {
	if (rong(khoi) && !nguoi.startsWith(KHOI_MO)) return nguoi;
	return `${DAU}${JSON.stringify(khoi)}${CUOI}${nguoi}`;
}

export function docKhoi(tin: string): TinDaTach {
	const nguyen: TinDaTach = { khoi: null, nguoi: tin };
	if (!tin.startsWith(DAU)) return nguyen;
	const het = tin.indexOf(CUOI, DAU.length);
	if (het < 0) return nguyen;
	const r = khoiNguCanhJson.safeParse(tin.slice(DAU.length, het));
	if (!r.success) return nguyen;
	return {
		khoi: rong(r.data) ? null : r.data,
		nguoi: tin.slice(het + CUOI.length),
	};
}

export function rutGonQuyet(ds: readonly QuyetBang[]): QuyetBang[] {
	return ds.reduce<QuyetBang[]>((ra, q) => {
		if (q.cach !== "hoan") return [...ra, q];
		const i = ra.findLastIndex(
			(x) => x.khoaDong === q.khoaDong && x.cach !== "hoan",
		);
		return i < 0 ? [...ra, q] : ra.filter((_, j) => j !== i);
	}, []);
}

export type DongKhoi = { loai: LoaiDongKhoi; chu: string };

export function dongKhoi(d: DongSoan) {
	if (d.loai === "muc-tieu-moi")
		return { loai: "muc-tieu", chu: d.giaTriCuoi ?? d.ten } satisfies DongKhoi;
	if (d.loai === "kr-moi")
		return { loai: "kr", chu: d.giaTriCuoi ?? d.ten } satisfies DongKhoi;
	return { loai: "can-chinh", chu: d.tenDich } satisfies DongKhoi;
}
