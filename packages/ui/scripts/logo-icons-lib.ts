import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import Logo from "../src/components/logo";
import { LOGO_ONEHUB } from "../src/lib/logo-onehub";
import { ICON_ONEHUB } from "./logo-icons-config";

export type TepIcon = { ten: string; duong: string; noiDung: Uint8Array };
export type AnhIco = { canh: number; png: Uint8Array };

const ICO_DAU = 6;
const ICO_MUC = 16;
const ICO_BIT = 32;

export const GOC_KHO = fileURLToPath(new URL("../../../", import.meta.url));

function svgLogo(canh: number, tiLe: number): string {
	const khung = LOGO_ONEHUB.mark.banKinhNgoai / tiLe;
	const le = -khung / 2;
	return renderToStaticMarkup(
		createElement(Logo, {
			width: canh,
			height: canh,
			viewBox: `${le} ${le} ${khung} ${khung}`,
		}),
	);
}

async function pngTrong(canh: number): Promise<Uint8Array> {
	const svg = svgLogo(canh, ICON_ONEHUB.tiLeMark.sat);
	return new Uint8Array(await sharp(Buffer.from(svg)).png().toBuffer());
}

async function pngNenTrang(canh: number, tiLe: number): Promise<Uint8Array> {
	const svg = svgLogo(canh, tiLe);
	return new Uint8Array(
		await sharp(Buffer.from(svg))
			.flatten({ background: ICON_ONEHUB.nen })
			.ensureAlpha(1)
			.png()
			.toBuffer(),
	);
}

export function ghepIco(anh: AnhIco[]): Uint8Array {
	const dau = ICO_DAU + ICO_MUC * anh.length;
	const tong = dau + anh.reduce((n, a) => n + a.png.length, 0);
	const ra = new Uint8Array(tong);
	const view = new DataView(ra.buffer);
	view.setUint16(2, 1, true);
	view.setUint16(4, anh.length, true);
	let viTri = dau;
	anh.forEach((a, i) => {
		const muc = ICO_DAU + ICO_MUC * i;
		view.setUint8(muc, a.canh % 256);
		view.setUint8(muc + 1, a.canh % 256);
		view.setUint16(muc + 4, 1, true);
		view.setUint16(muc + 6, ICO_BIT, true);
		view.setUint32(muc + 8, a.png.length, true);
		view.setUint32(muc + 12, viTri, true);
		ra.set(a.png, viTri);
		viTri += a.png.length;
	});
	return ra;
}

export function docIco(buf: Uint8Array): AnhIco[] {
	const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
	if (view.getUint16(0, true) !== 0 || view.getUint16(2, true) !== 1) {
		throw new Error("khong phai file ICO");
	}
	const soAnh = view.getUint16(4, true);
	return Array.from({ length: soAnh }, (_, i) => {
		const muc = ICO_DAU + ICO_MUC * i;
		const rong = view.getUint8(muc) || 256;
		const coLon = view.getUint32(muc + 8, true);
		const viTri = view.getUint32(muc + 12, true);
		return { canh: rong, png: buf.slice(viTri, viTri + coLon) };
	});
}

export async function sinhBoIcon(): Promise<TepIcon[]> {
	const { trongKho, tiLeMark, ico } = ICON_ONEHUB;
	const icoNoiDung = ghepIco(
		await Promise.all(
			ico.map(async (canh) => ({ canh, png: await pngTrong(canh) })),
		),
	);
	const svg = new TextEncoder().encode(
		renderToStaticMarkup(
			createElement(Logo, { width: undefined, height: undefined }),
		),
	);
	return [
		{ ten: "favicon.ico (app)", duong: trongKho.icoApp, noiDung: icoNoiDung },
		{
			ten: "favicon.ico (public)",
			duong: trongKho.icoPublic,
			noiDung: icoNoiDung,
		},
		{ ten: "favicon.svg", duong: trongKho.svg, noiDung: svg },
		{
			ten: "favicon-96x96.png",
			duong: trongKho.png96.duong,
			noiDung: await pngTrong(trongKho.png96.canh),
		},
		{
			ten: "apple-touch-icon.png",
			duong: trongKho.apple.duong,
			noiDung: await pngNenTrang(trongKho.apple.canh, tiLeMark.apple),
		},
		{
			ten: "web-app-manifest-192x192.png",
			duong: trongKho.manifest192.duong,
			noiDung: await pngNenTrang(trongKho.manifest192.canh, tiLeMark.maskable),
		},
		{
			ten: "web-app-manifest-512x512.png",
			duong: trongKho.manifest512.duong,
			noiDung: await pngNenTrang(trongKho.manifest512.canh, tiLeMark.maskable),
		},
	];
}

export async function sinhAnhNgoai(): Promise<TepIcon[]> {
	const { ngoaiKho, tiLeMark } = ICON_ONEHUB;
	return [
		{
			ten: ngoaiKho.slack.ten,
			duong: ngoaiKho.slack.ten,
			noiDung: await pngNenTrang(ngoaiKho.slack.canh, tiLeMark.ngoai),
		},
		{
			ten: ngoaiKho.zalo.ten,
			duong: ngoaiKho.zalo.ten,
			noiDung: await pngNenTrang(ngoaiKho.zalo.canh, tiLeMark.tron),
		},
		{
			ten: ngoaiKho.google.ten,
			duong: ngoaiKho.google.ten,
			noiDung: await pngNenTrang(ngoaiKho.google.canh, tiLeMark.ngoai),
		},
	];
}
