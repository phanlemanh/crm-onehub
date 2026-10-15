export type NguonLoTrinh = { kieu: "ban-chup" | "ban-dung"; layLuc: string };

export type BanDung = {
	sha: string | null;
	dungLuc: string;
	moiTruong: string | null;
};

const KHONG_RO_GIO_DUNG = new Date(0).toISOString();

export function banDungHienTai(): BanDung {
	return {
		sha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
		dungLuc: process.env.LO_TRINH_DUNG_LUC ?? KHONG_RO_GIO_DUNG,
		moiTruong: process.env.VERCEL_ENV ?? null,
	};
}

export function chonNguon(
	banChup: { sha: string; commitLuc: string; layLuc: string } | null,
	banDung: BanDung,
): NguonLoTrinh {
	if (banChup === null || banDung.moiTruong === "preview")
		return { kieu: "ban-dung", layLuc: banDung.dungLuc };
	const cungSha = banDung.sha !== null && banChup.sha === banDung.sha;
	const sauDung = Date.parse(banChup.commitLuc) > Date.parse(banDung.dungLuc);
	return cungSha || sauDung
		? { kieu: "ban-chup", layLuc: banChup.layLuc }
		: { kieu: "ban-dung", layLuc: banDung.dungLuc };
}
