export const NEN_TANG = [
	{
		ten: "Facebook",
		tenMien: ["facebook.com", "fb.com", "fb.me", "m.me", "messenger.com"],
	},
	{ ten: "Instagram", tenMien: ["instagram.com"] },
	{ ten: "Threads", tenMien: ["threads.net"] },
	{ ten: "Zalo", tenMien: ["zalo.me"] },
	{ ten: "LinkedIn", tenMien: ["linkedin.com", "lnkd.in"] },
	{ ten: "TikTok", tenMien: ["tiktok.com"] },
	{ ten: "YouTube", tenMien: ["youtube.com", "youtu.be"] },
	{ ten: "X", tenMien: ["x.com", "twitter.com"] },
	{ ten: "Telegram", tenMien: ["t.me", "telegram.me"] },
	{ ten: "Linktree", tenMien: ["linktr.ee"] },
	{ ten: "Batdongsan", tenMien: ["batdongsan.com.vn"] },
	{ ten: "Chợ Tốt", tenMien: ["chotot.com", "nhatot.com"] },
	{ ten: "Alonhadat", tenMien: ["alonhadat.com.vn"] },
	{ ten: "Muaban", tenMien: ["muaban.net"] },
] as const satisfies readonly { ten: string; tenMien: readonly string[] }[];

export type NenTang = { ten: string; tenMien: string };

function rutHost(dauVao: string): string | null {
	const gon = dauVao.trim().toLowerCase();
	if (!gon) return null;

	const coScheme = /^[a-z][a-z0-9+.-]*:\/\//.test(gon) ? gon : `https://${gon}`;

	try {
		return new URL(coScheme).hostname.replace(/^www\./, "");
	} catch {
		return null;
	}
}

export function nenTangCuaTenMien(
	dauVao: string | null | undefined,
): NenTang | null {
	if (!dauVao) return null;

	const host = rutHost(dauVao);
	if (!host) return null;

	for (const nenTang of NEN_TANG) {
		const tenMien = nenTang.tenMien.find(
			(mien) => host === mien || host.endsWith(`.${mien}`),
		);
		if (tenMien) return { ten: nenTang.ten, tenMien: host };
	}

	return null;
}
