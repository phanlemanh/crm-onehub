import { createHash } from "node:crypto";
import {
	type BanGom,
	type ChuaGomRa,
	cacNhomMay,
	duongTep,
	gioDeXuat,
	type HangLoTrinh,
	type NhomMay,
} from "../../packages/validation/src/tin-hieu-gom.ts";
import { GOM } from "./gom-cau-hinh.ts";

const KHOI = {
	dau: "gom-dau",
	nhom: "gom-nhom",
	gio: "gom-gio",
	tep: "gom-tep",
} as const;

export function dauTap(ids: string[]): string {
	return createHash("sha256")
		.update([...ids].sort().join("\n"))
		.digest("hex")
		.slice(0, 16);
}

const ma64 = (x: unknown): string =>
	Buffer.from(JSON.stringify(x), "utf8").toString("base64");

const doc64 = (s: string): unknown =>
	JSON.parse(Buffer.from(s, "base64").toString("utf8"));

const dongKhoi = (ten: string, gia: string): string =>
	`<!-- ${ten}: ${gia} -->`;

export function dungThan(o: {
	banGom: BanGom;
	tepBanGom: string;
	hang: HangLoTrinh[];
	tinHieu: ChuaGomRa["tin_hieu"];
	daGiao: ChuaGomRa["da_giao"];
	dau: string;
	gioDeXuat: Record<string, string>;
}): string {
	const tieuDe = new Map(o.tinHieu.map((t) => [t.id, t.tieu_de]));
	const cauViec = new Map(o.daGiao.map((d) => [d.slug, d.cau_giao]));
	const hangCua = (ma: string): string[] =>
		o.hang
			.filter((h) => h.dot === o.banGom.dot && (h.phu ?? []).includes(ma))
			.map((h) => h.cau_giao ?? "")
			.filter(Boolean);
	const dong: string[] = [GOM.than.mo, "", `## ${GOM.than.nhom}`];
	for (const n of o.banGom.nhom) {
		const hang = hangCua(n.ma);
		dong.push(
			`- **${n.ten}** — ${n.tinHieu.length} tín hiệu · ${hang.length ? hang.join("; ") : GOM.than.hangChua}`,
		);
	}
	if (o.banGom.le.length) {
		dong.push("", `## ${GOM.than.le}`);
		for (const l of o.banGom.le)
			dong.push(`- ${tieuDe.get(l.id) ?? ""} — ${l.lyDo}`);
	}
	if (o.banGom.daPhu.length) {
		dong.push("", `## ${GOM.than.daPhu}`);
		for (const p of o.banGom.daPhu)
			dong.push(
				`- ${tieuDe.get(p.id) ?? ""} — ${cauViec.get(p.hoSo) || p.hoSo}`,
			);
	}
	dong.push(
		"",
		GOM.than.sua,
		GOM.than.phuQuyet,
		GOM.than.gop,
		"",
		dongKhoi(KHOI.dau, o.dau),
		dongKhoi(
			KHOI.nhom,
			ma64(
				o.banGom.nhom.map((n) => ({
					ma: n.ma,
					ten: n.ten,
					tinHieu: n.tinHieu,
				})),
			),
		),
		dongKhoi(KHOI.gio, ma64(o.gioDeXuat)),
		dongKhoi(KHOI.tep, ma64(o.tepBanGom)),
	);
	return `${dong.join("\n")}\n`;
}

function khoi(than: string, ten: string): string | null {
	const m = than.match(new RegExp(`<!-- ${ten}: ([A-Za-z0-9+/=]+) -->`));
	return m?.[1] ?? null;
}

export function docKhoiMay(than: string): {
	dau: string | null;
	nhom: NhomMay[];
	gio: Record<string, string>;
	tep: string | null;
} {
	const thu = <T>(
		s: string | null,
		kieu: {
			safeParse: (
				x: unknown,
			) => { success: true; data: T } | { success: false };
		},
		rong: T,
	): T => {
		if (!s) return rong;
		try {
			const r = kieu.safeParse(doc64(s));
			return r.success ? r.data : rong;
		} catch {
			return rong;
		}
	};
	return {
		dau: khoi(than, KHOI.dau),
		nhom: thu(khoi(than, KHOI.nhom), cacNhomMay, []),
		gio: thu(khoi(than, KHOI.gio), gioDeXuat, {}),
		tep: thu<string | null>(khoi(than, KHOI.tep), duongTep, null),
	};
}
