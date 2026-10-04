import type { KieuKr } from "./okr-kr";

export const MA_LUAT_OKR = [
	"kr-la-viec",
	"thieu-khoi-diem",
	"dich-bang-khoi-diem",
	"thieu-doi-trong",
] as const;
export type MaLuatOkr = (typeof MA_LUAT_OKR)[number];
export type TruongKiem = "title" | "startValue" | "targetValue" | "keyResults";
export type KetQuaKiem = {
	ma: MaLuatOkr;
	truong: TruongKiem;
	krIndex: number | null;
};
export type KrKiem = {
	title: string;
	kind: KieuKr;
	startValue: number;
	targetValue: number;
};
export type MucTieuKiem = {
	title: string;
	whyNow: string;
	keyResults: KrKiem[];
};

export const OKR_KIEM = {
	dongTuViec: [
		"gọi",
		"gửi",
		"tổ chức",
		"triển khai",
		"hoàn thành",
		"hoàn thiện",
		"xây dựng",
		"thực hiện",
		"làm",
		"viết",
		"họp",
		"tham gia",
		"đào tạo",
		"chạy",
		"ra mắt",
		"launch",
		"build",
		"call",
		"send",
		"hold",
		"run",
		"write",
		"complete",
		"implement",
		"organize",
		"create",
	],
	kieuKhongHoiViec: ["moc"],
	kieuKhongHoiKhoiDiem: ["moc"],
	kieuHoiDichBangKhoi: ["giu-tren", "giu-duoi", "phan-tram"],
	kieuDayMotChieu: "tang-toi",
	kieuDoiTrong: ["giu-tren", "giu-duoi"],
	doiTrongToiThieuKr: 2,
} as const;

export function boDau(s: string): string {
	return s
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "d")
		.toLowerCase()
		.trim();
}

export function chuanHoa(s: string): string {
	return s
		.normalize("NFC")
		.toLowerCase()
		.split(/[^\p{L}\p{N}]+/u)
		.filter(Boolean)
		.join(" ");
}

export function khongDau(s: string): string {
	return chuanHoa(boDau(s));
}

export function coCum(van: string, cum: string): boolean {
	return cum !== "" && ` ${van} `.includes(` ${cum} `);
}

const chuThuong = (s: string) =>
	s.normalize("NFC").toLocaleLowerCase("vi").trim();

const coDau = (s: string) => boDau(s) !== chuThuong(s).replace(/đ/g, "d");

const batDau = (t: string, v: string) => t === v || t.startsWith(`${v} `);

function laViec(title: string): boolean {
	if (coDau(title)) {
		const t = chuThuong(title);
		return OKR_KIEM.dongTuViec.some((v) => batDau(t, v));
	}
	const t = boDau(title);
	return OKR_KIEM.dongTuViec.some((v) => batDau(t, boDau(v)));
}

const co = <T extends string>(ds: readonly T[], x: string): boolean =>
	(ds as readonly string[]).includes(x);

function kiemKr(kr: KrKiem, i: number): KetQuaKiem[] {
	const ra: KetQuaKiem[] = [];
	if (!co(OKR_KIEM.kieuKhongHoiViec, kr.kind) && laViec(kr.title))
		ra.push({ ma: "kr-la-viec", truong: "title", krIndex: i });
	if (!co(OKR_KIEM.kieuKhongHoiKhoiDiem, kr.kind) && kr.startValue === 0)
		ra.push({ ma: "thieu-khoi-diem", truong: "startValue", krIndex: i });
	if (
		co(OKR_KIEM.kieuHoiDichBangKhoi, kr.kind) &&
		kr.targetValue === kr.startValue
	)
		ra.push({ ma: "dich-bang-khoi-diem", truong: "targetValue", krIndex: i });
	return ra;
}

export function kiemOkr(mt: MucTieuKiem): KetQuaKiem[] {
	const ds = mt.keyResults;
	const motChieu =
		ds.length >= OKR_KIEM.doiTrongToiThieuKr &&
		ds.every((k) => k.kind === OKR_KIEM.kieuDayMotChieu) &&
		!ds.some((k) => co(OKR_KIEM.kieuDoiTrong, k.kind));
	return [
		...ds.flatMap(kiemKr),
		...(motChieu
			? [
					{
						ma: "thieu-doi-trong",
						truong: "keyResults",
						krIndex: null,
					} satisfies KetQuaKiem,
				]
			: []),
	];
}
