export const SO_DIEN_THOAI = {
	maVn: "84",
	quocNoi: { min: 9, max: 10 },
	e164: { min: 8, max: 15 },
	timToiThieu: 4,
	nhomDiDong: [3, 3, 3],
	nhomCoDinh: [2, 4, 4],
} as const;

export type DocSo =
	| { kind: "rong" }
	| { kind: "ok"; so: string }
	| { kind: "sai" };

const NGAN_CACH = /[\s.\-()]/g;
const KY_TU_SO = /^[0-9+\s.\-()]+$/;
const QN = `[0-9]{${SO_DIEN_THOAI.quocNoi.min},${SO_DIEN_THOAI.quocNoi.max}}`;
const VN_KHONG = new RegExp(`^0(${QN})$`);
const VN_MA = new RegExp(`^\\+?${SO_DIEN_THOAI.maVn}(${QN})$`);
const QUOC_TE = new RegExp(
	`^\\+([0-9]{${SO_DIEN_THOAI.e164.min},${SO_DIEN_THOAI.e164.max}})$`,
);
const CHU_SO_VN_MA = new RegExp(`^${SO_DIEN_THOAI.maVn}(${QN})$`);

export function docSoDienThoai(raw: string): DocSo {
	const gon = raw.replace(NGAN_CACH, "");
	if (gon === "") return { kind: "rong" };

	const vn = VN_KHONG.exec(gon) ?? VN_MA.exec(gon);
	if (vn) return { kind: "ok", so: `+${SO_DIEN_THOAI.maVn}${vn[1]}` };
	if (gon.startsWith(`+${SO_DIEN_THOAI.maVn}`)) return { kind: "sai" };

	const quocTe = QUOC_TE.exec(gon);
	if (quocTe) return { kind: "ok", so: `+${quocTe[1]}` };

	return { kind: "sai" };
}

function chuSo(raw: string): string {
	return raw.replace(/[^0-9]/g, "");
}

export function soQuocNoi(so: string): string {
	const so0 = chuSo(so);
	const vn = CHU_SO_VN_MA.exec(so0) ?? VN_KHONG.exec(so0);
	return vn?.[1] ?? so0;
}

function nhom(chuoi: string, kichCo: readonly number[]): string {
	const phan: string[] = [];
	let dau = 0;
	for (const n of kichCo) {
		phan.push(chuoi.slice(dau, dau + n));
		dau += n;
	}
	return phan.join(" ");
}

export function hienThiSoDienThoai(raw: string): string {
	const doc = docSoDienThoai(raw);
	if (doc.kind !== "ok") return raw;
	if (!doc.so.startsWith(`+${SO_DIEN_THOAI.maVn}`)) return doc.so;

	const quocNoi = soQuocNoi(doc.so);
	const kichCo =
		quocNoi.length === SO_DIEN_THOAI.quocNoi.min
			? SO_DIEN_THOAI.nhomDiDong
			: SO_DIEN_THOAI.nhomCoDinh;
	return `0${nhom(quocNoi, kichCo)}`;
}

export function soQuocNoiDeTim(term: string): string | null {
	if (!KY_TU_SO.test(term.trim())) return null;

	const so = chuSo(term);
	if (so.length < SO_DIEN_THOAI.timToiThieu) return null;

	if (
		so.startsWith(SO_DIEN_THOAI.maVn) &&
		so.length - SO_DIEN_THOAI.maVn.length >= SO_DIEN_THOAI.quocNoi.min
	) {
		return so.slice(SO_DIEN_THOAI.maVn.length);
	}
	return so.startsWith("0") ? so.slice(1) : so;
}
