import { boDau, type MaLuatOkr } from "./okr-kiem";
import { docSoOkr } from "./okr-kr";
import {
	type DongDeXuat,
	type MaLoaiDeXuat,
	TRO_LY_OKR_TRAN,
} from "./okr-tro-ly";

export type GoiKiem = {
	mucTieu: { id: string; title: string; whyNow: string };
	krs: {
		id: string;
		title: string;
		startValue: number;
		targetValue: number;
		currentValue: number;
		unit?: string;
	}[];
	dichCanChinh: { id: string; loai: "muc-tieu" | "kr"; title: string }[];
	luatDaHoi: { ma: MaLuatOkr; keyResultId: string | null }[];
	khoaDaBac: string[];
	khoaDangCho: { khoa: string; sau: string }[];
	tenThanhVien: string[];
	tuCam: readonly string[];
};

export type KetQuaKiemDong =
	| { qua: true }
	| { qua: false; maLoai: MaLoaiDeXuat };

const SO_DON = new Map([
	["một", 1],
	["hai", 2],
	["ba", 3],
	["bốn", 4],
	["năm", 5],
	["sáu", 6],
	["bảy", 7],
	["tám", 8],
	["chín", 9],
]);

const SO_SAU_CHUC = new Map([...SO_DON, ["mốt", 1], ["tư", 4], ["lăm", 5]]);

const HE_SO = new Map([
	["tỷ", 1e9],
	["tỉ", 1e9],
	["triệu", 1e6],
	["nghìn", 1e3],
	["ngàn", 1e3],
	["%", 1],
]);

const CHU_SO_CHINH_XAC = 15;

type SoDoc = { giaTri: number; goc: number; heSo: number };
type Doc = { giaTri: number; het: number };

function tachSo(chu: string): string[] {
	return (
		chu
			.normalize("NFC")
			.toLowerCase()
			.match(/\d+(?:[.,]\d+)*|%|\p{L}+/gu) ?? []
	);
}

function theoSauChuc(t: string[], j: number, coSo: number): Doc {
	const donVi = SO_SAU_CHUC.get(t[j] ?? "");
	return donVi === undefined
		? { giaTri: coSo, het: j }
		: { giaTri: coSo + donVi, het: j + 1 };
}

function docChuViet(t: string[], i: number): Doc | null {
	const tu = t[i] ?? "";
	if (tu === "mười") return theoSauChuc(t, i + 1, 10);
	const don = SO_DON.get(tu);
	if (don === undefined) return null;
	if (t[i + 1] === "mươi") return theoSauChuc(t, i + 2, don * 10);
	return { giaTri: don, het: i + 1 };
}

function theoSauTram(t: string[], so: Doc): Doc {
	if (t[so.het] !== "trăm") return so;
	const tram = so.giaTri * 100;
	const j = so.het + 1;
	const le = SO_DON.get(t[j + 1] ?? "");
	if ((t[j] === "linh" || t[j] === "lẻ") && le !== undefined)
		return { giaTri: tram + le, het: j + 2 };
	const phan = docChuViet(t, j);
	return phan && phan.giaTri < 100
		? { giaTri: tram + phan.giaTri, het: phan.het }
		: { giaTri: tram, het: j };
}

function docChuSo(t: string[], i: number): Doc | null {
	const so = docSoOkr(t[i] ?? "");
	return so === null ? null : { giaTri: so, het: i + 1 };
}

function docMotSo(t: string[], i: number): Doc | null {
	const so = /^\d/.test(t[i] ?? "") ? docChuSo(t, i) : docChuViet(t, i);
	return so ? theoSauTram(t, so) : null;
}

function docHeSo(t: string[], j: number) {
	if (t[j] === "phần" && t[j + 1] === "trăm") return { heSo: 1, het: j + 2 };
	const heSo = HE_SO.get(t[j] ?? "");
	return heSo === undefined ? { heSo: 1, het: j } : { heSo, het: j + 1 };
}

function docSo(chu: string): SoDoc[] {
	const t = tachSo(chu);
	const ra: SoDoc[] = [];
	let i = 0;
	while (i < t.length) {
		const so = docMotSo(t, i);
		if (!so) {
			i += 1;
			continue;
		}
		const { heSo, het } = docHeSo(t, so.het);
		ra.push({
			giaTri: Number((so.giaTri * heSo).toPrecision(CHU_SO_CHINH_XAC)),
			goc: so.giaTri,
			heSo,
		});
		i = het;
	}
	return ra;
}

export function trichSo(chu: string): number[] {
	return docSo(chu).map((s) => s.giaTri);
}

function chuanHoa(s: string): string {
	return s
		.normalize("NFC")
		.toLowerCase()
		.split(/[^\p{L}\p{N}]+/u)
		.filter(Boolean)
		.join(" ");
}

function khongDau(s: string): string {
	return chuanHoa(boDau(s));
}

function coCum(van: string, cum: string): boolean {
	return cum !== "" && ` ${van} `.includes(` ${cum} `);
}

function chuCuaDong(dong: DongDeXuat): string[] {
	return [dong.sau ?? "", dong.lyDo];
}

export function khoaDong(dong: DongDeXuat): string {
	const kr = dong.keyResultId ?? "-";
	switch (dong.loai) {
		case "viet-lai":
			return `vl:${dong.objectiveId}:${kr}:${dong.truong ?? "-"}`;
		case "hoi":
			return `hoi:${dong.objectiveId}:${kr}:${dong.maVanDe ?? "-"}`;
		case "can-chinh":
			return `cc:${dong.objectiveId}:${dong.targetObjectiveId ?? dong.targetKeyResultId ?? "-"}`;
	}
}

function idNgoaiGoi(dong: DongDeXuat, goi: GoiKiem): boolean {
	if (dong.objectiveId !== goi.mucTieu.id) return true;
	if (
		dong.keyResultId !== null &&
		!goi.krs.some((k) => k.id === dong.keyResultId)
	)
		return true;
	const dich = dong.targetObjectiveId ?? dong.targetKeyResultId;
	if (dich === null) return false;
	const trongGoi = [
		goi.mucTieu.id,
		...goi.krs.map((k) => k.id),
		...goi.dichCanChinh.map((d) => d.id),
	];
	return !trongGoi.includes(dich);
}

function khongDoi(dong: DongDeXuat): boolean {
	return (
		dong.loai === "viet-lai" &&
		chuanHoa(dong.sau ?? "") === chuanHoa(dong.truoc ?? "")
	);
}

function heSoCuaKr(kr: GoiKiem["krs"][number]): number[] {
	return tachSo(`${kr.unit ?? ""} ${kr.title}`)
		.map((tu) => HE_SO.get(tu))
		.filter((h): h is number => h !== undefined && h !== 1);
}

function soMoi(dong: DongDeXuat, goi: GoiKiem): boolean {
	if (dong.loai !== "viet-lai") return false;
	const kr = goi.krs.find((k) => k.id === dong.keyResultId);
	const oKr = kr ? [kr.startValue, kr.targetValue, kr.currentValue] : [];
	const coKr = kr ? heSoCuaKr(kr) : [];
	const phep = [...docSo(dong.truoc ?? "").map((s) => s.giaTri), ...oKr];
	return docSo(dong.sau ?? "").some(
		(s) =>
			!phep.includes(s.giaTri) &&
			!(coKr.includes(s.heSo) && oKr.includes(s.goc)),
	);
}

function tuCam(dong: DongDeXuat, goi: GoiKiem): boolean {
	const chu = chuCuaDong(dong).map(chuanHoa);
	const dauVao = [
		dong.truoc ?? "",
		goi.mucTieu.title,
		goi.mucTieu.whyNow,
		...goi.krs.map((k) => k.title),
	].map(chuanHoa);
	return goi.tuCam.some((tu) => {
		const cum = chuanHoa(tu);
		return chu.some((c) => coCum(c, cum)) && !dauVao.some((v) => coCum(v, cum));
	});
}

function noiVeNguoi(dong: DongDeXuat, goi: GoiKiem): boolean {
	const chu = chuCuaDong(dong).map(khongDau);
	return goi.tenThanhVien
		.map(khongDau)
		.filter(
			(ten) => ten.split(" ").length >= TRO_LY_OKR_TRAN.soChuHoTenToiThieu,
		)
		.some((ten) => chu.some((c) => coCum(c, ten)));
}

function chepCapTren(dong: DongDeXuat, goi: GoiKiem): boolean {
	if (dong.loai !== "viet-lai" || dong.truong !== "title") return false;
	const sau = chuanHoa(dong.sau ?? "");
	return goi.dichCanChinh.some(
		(d) => d.loai === "kr" && chuanHoa(d.title) === sau,
	);
}

function trungLuat(dong: DongDeXuat, goi: GoiKiem): boolean {
	return (
		dong.loai === "hoi" &&
		goi.luatDaHoi.some(
			(l) => l.ma === dong.maVanDe && l.keyResultId === dong.keyResultId,
		)
	);
}

function dichNgoaiTap(dong: DongDeXuat, goi: GoiKiem): boolean {
	if (dong.loai !== "can-chinh") return false;
	const [id, loai] =
		dong.targetObjectiveId !== null
			? [dong.targetObjectiveId, "muc-tieu"]
			: [dong.targetKeyResultId, "kr"];
	return !goi.dichCanChinh.some((d) => d.id === id && d.loai === loai);
}

function daBac(dong: DongDeXuat, goi: GoiKiem): boolean {
	return goi.khoaDaBac.includes(khoaDong(dong));
}

function dangCho(dong: DongDeXuat, goi: GoiKiem): boolean {
	const khoa = khoaDong(dong);
	const sau = chuanHoa(dong.sau ?? "");
	return goi.khoaDangCho.some(
		(k) => k.khoa === khoa && chuanHoa(k.sau) === sau,
	);
}

const LUAT_KIEM: readonly (readonly [
	MaLoaiDeXuat,
	(dong: DongDeXuat, goi: GoiKiem) => boolean,
])[] = [
	["id-ngoai-goi", idNgoaiGoi],
	["khong-doi", khongDoi],
	["so-moi", soMoi],
	["tu-cam", tuCam],
	["noi-ve-nguoi", noiVeNguoi],
	["chep-cap-tren", chepCapTren],
	["trung-luat", trungLuat],
	["dich-ngoai-tap", dichNgoaiTap],
	["da-bac", daBac],
	["dang-cho", dangCho],
];

export function kiemDongDeXuat(dong: DongDeXuat, goi: GoiKiem): KetQuaKiemDong {
	const loai = LUAT_KIEM.find(([, vi]) => vi(dong, goi));
	return loai ? { qua: false, maLoai: loai[0] } : { qua: true };
}
