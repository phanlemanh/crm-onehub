import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { kiemOkr } from "../../../packages/validation/src/okr-kiem.ts";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { z } = createRequire(join(GOC, "packages/validation/package.json"))(
	"zod",
);

export const CHAM = {
	boNg: "ng",
	truongCuaVanDe: {
		"kr-la-viec": ["kr.title"],
		"khong-do-duoc": ["kr.title"],
		"thieu-doi-trong": ["kr.title"],
		"trung-y": ["kr.title"],
		"muc-tieu-la-so": ["title"],
	},
	luat: {
		khongBanGhi: "khong co ban ghi",
		viecDong: "viec dong bang",
		soMoi: "so moi con lai",
		khongGopY: "khongGopY",
		vanDe: "van de",
		chepCapTren: "ng chep-cap-tren",
		noiVeNguoi: "ng noi-ve-nguoi",
		tuCam: "ng tu-cam",
		maCam: "ng co dong",
	},
	daNop: "da-nop",
	trangThaiCho: "cho",
};

const dongGhi = z.object({
	id: z.string(),
	loai: z.string(),
	keyResultId: z.string().nullable(),
	truong: z.string().nullable(),
	truoc: z.string().nullable(),
	sau: z.string().nullable(),
	maVanDe: z.string().nullable(),
	lyDo: z.string(),
	trangThai: z.string(),
	maLoai: z.string().nullable(),
});

const banGhiCa = z.object({
	ca: z.string(),
	bo: z.string(),
	objectiveId: z.string(),
	capTrenKr: z.array(z.string()),
	taskId: z.string(),
	outcome: z.string().nullable(),
	dong: z.array(dongGhi),
});

export function docBanGhi(dong, i = 0) {
	const r = banGhiCa.safeParse(JSON.parse(dong));
	if (!r.success)
		throw new Error(`tong-ket dong ${i + 1} sai khuon: ${r.error.message}`);
	return r.data;
}

export const boDau = (chu) =>
	`${chu ?? ""}`
		.normalize("NFD")
		.replace(/\p{M}/gu, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.toLowerCase()
		.replace(/\s+/g, " ")
		.trim();

export const chuanTu = (chu) =>
	`${chu ?? ""}`
		.normalize("NFC")
		.toLowerCase()
		.split(/[^\p{L}\p{N}]+/u)
		.filter(Boolean)
		.join(" ");

const coNguyenTu = (van, cum) => cum !== "" && ` ${van} `.includes(` ${cum} `);

export const coTuCam = (van, tu) => coNguyenTu(chuanTu(van), chuanTu(tu));

export const coTen = (van, ten) =>
	coNguyenTu(chuanTu(boDau(van)), chuanTu(boDau(ten)));

const chuCua = (d) => `${d.sau ?? ""} ${d.lyDo ?? ""}`;

function luatLuot7(ca) {
	return new Set(
		kiemOkr({
			title: ca.mucTieu.title,
			whyNow: ca.mucTieu.whyNow,
			keyResults: ca.krs.map((k) => ({
				title: k.title,
				kind: k.kind,
				startValue: k.startValue,
				targetValue: k.targetValue,
			})),
		}).map((r) => r.ma),
	);
}

export function phuBoiLuat7(ca) {
	const luat = luatLuot7(ca);
	return ca.kyVong.vanDe.filter((vd) => luat.has(vd));
}

function kiemNg(ca, ghi, cho, { ten, maCamNg, tuCam }) {
	const L = CHAM.luat;
	const loi = [];
	const cam = cho.filter((d) => maCamNg.includes(d.maLoai));
	if (cam.length > 0)
		loi.push(`${L.maCam} ${cam.map((d) => `${d.maLoai}:${d.id}`).join(", ")}`);
	const capTren = (ghi.capTrenKr ?? []).map(boDau);
	const chep = cho.filter(
		(d) =>
			d.loai === "viet-lai" &&
			d.truong === "title" &&
			capTren.includes(boDau(d.sau)),
	);
	if (chep.length > 0)
		loi.push(`${L.chepCapTren}: ${chep.map((d) => d.id).join(", ")}`);
	const nguoi = cho.filter((d) => ten.some((t) => coTen(chuCua(d), t)));
	if (nguoi.length > 0)
		loi.push(`${L.noiVeNguoi}: ${nguoi.map((d) => d.id).join(", ")}`);
	const dauVao = [
		ca.mucTieu.title,
		ca.mucTieu.whyNow,
		...ca.krs.map((k) => k.title),
	].join(" ");
	const cum = tuCam.filter((c) => !coTuCam(dauVao, c));
	const tu = cho.filter((d) => cum.some((c) => coTuCam(chuCua(d), c)));
	if (tu.length > 0) loi.push(`${L.tuCam}: ${tu.map((d) => d.id).join(", ")}`);
	return loi;
}

export function chamCa(ca, ghi, tuyChon) {
	const L = CHAM.luat;
	if (!ghi) return [`${L.khongBanGhi} — eval khong chay toi cuoi`];
	const loi = [];
	if (!`${ghi.outcome ?? ""}`.startsWith(CHAM.daNop))
		loi.push(`${L.viecDong} ${ghi.outcome ?? "(chua dong)"}`);
	const cho = ghi.dong.filter((d) => d.trangThai === CHAM.trangThaiCho);
	const lot = ghi.dong
		.filter((d) => tuyChon.lotSoMoi.has(d.id))
		.map((d) => d.id);
	if (lot.length > 0) loi.push(`${L.soMoi}: ${lot.join(", ")}`);
	const vietLai = cho.filter((d) => d.loai === "viet-lai");
	if (ca.kyVong.khongGopY && vietLai.length > 0)
		loi.push(`${L.khongGopY} nhung co ${vietLai.length} dong viet lai`);
	const phu = phuBoiLuat7(ca);
	for (const vd of ca.kyVong.vanDe.filter((v) => !phu.includes(v))) {
		const truong = CHAM.truongCuaVanDe[vd] ?? [];
		const trung = cho.some(
			(d) =>
				d.maVanDe === vd ||
				(d.loai === "viet-lai" && truong.includes(d.truong)),
		);
		if (!trung)
			loi.push(`${L.vanDe} ${vd}: khong dong nao dung truong hay dung maVanDe`);
	}
	if (ca.bo === CHAM.boNg) loi.push(...kiemNg(ca, ghi, cho, tuyChon));
	return loi;
}
