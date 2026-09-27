import { soNgayVN } from "@crm/db/onboarding-nhac";

export type ChuKyNgan = {
	id: string;
	kind: string;
	phase: string;
	startsOn: string;
	endsOn: string;
};

const ngayTuyet = (s: string) => Date.parse(`${s}T00:00:00Z`);

export function chonChuKyHienTai<T extends ChuKyNgan>(
	cycles: T[],
	homNay: string,
): T | null {
	const quy = cycles.filter((c) => c.kind === "quy");
	const chuaHomNay = quy.filter(
		(c) => c.startsOn <= homNay && homNay <= c.endsOn,
	);
	const trongNgay =
		chuaHomNay.find((c) => c.phase === "dang-chay") ??
		chuaHomNay.find((c) => c.phase !== "da-dong");
	if (trongNgay) return trongNgay;
	const moc = ngayTuyet(homNay);
	const xa = (c: ChuKyNgan) => Math.abs(ngayTuyet(c.startsOn) - moc);
	const ganNhat = (ds: T[]) => [...ds].sort((a, b) => xa(a) - xa(b))[0];
	return (
		ganNhat(quy.filter((c) => c.phase !== "da-dong")) ??
		chuaHomNay[0] ??
		ganNhat(quy) ??
		cycles[0] ??
		null
	);
}

export function kyVongTheoNgay(
	congBo: Date | null,
	ketThuc: Date,
	homNay: Date,
	nghi: { tu: Date; den: Date } | null,
): number | null {
	if (congBo === null) return null;
	const soNgayNghi = nghi ? soNgayVN(nghi.tu, nghi.den) + 1 : 0;
	const tong = soNgayVN(congBo, ketThuc) - soNgayNghi;
	if (tong <= 0) return 100;
	let da = soNgayVN(congBo, homNay);
	if (nghi && homNay > nghi.den) da -= soNgayNghi;
	return Math.max(0, Math.min(100, Math.round((da / tong) * 100)));
}

export function tienDoMucTieu(
	krs: { progress: number; weight: number }[],
	coTrongSo: boolean,
): number {
	const nang = (k: { weight: number }) => (coTrongSo ? k.weight : 1);
	const tong = krs.reduce((s, k) => s + nang(k), 0);
	if (tong === 0) return 0;
	return Math.round(krs.reduce((s, k) => s + k.progress * nang(k), 0) / tong);
}
