import { describe, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Logo from "../src/components/logo";
import { LogoLockup } from "../src/components/logo-lockup";
import { LOGO_ONEHUB } from "../src/lib/logo-onehub";
import {
	dat,
	docAnh,
	duongGoc,
	iouMem,
	NGUONG_LOGO,
	rmsKenh,
	tamKhungBao,
	veSvg,
} from "./logo-raster";

const KENH = ["R", "G", "B"] as const;
const BIEN_CHU_X = 600;

async function markTrenLuoiGoc() {
	const goc = await docAnh(duongGoc("logo-mark.png"));
	const { tam } = LOGO_ONEHUB.mark;
	const svg = renderToStaticMarkup(
		createElement(Logo, {
			width: goc.rong,
			height: goc.cao,
			viewBox: `${-tam.x} ${-tam.y} ${goc.rong} ${goc.cao}`,
		}),
	);
	return { goc, ve: await veSvg(svg) };
}

describe("logo OneHub khớp ảnh gốc", () => {
	test("mark-trung-goc", async () => {
		const { goc, ve } = await markTrenLuoiGoc();
		const iou = iouMem(ve, goc, 0, goc.rong);
		console.log(`IoU mark = ${iou.toFixed(5)}`);
		dat(iou >= NGUONG_LOGO.iou, `IoU mark ${iou.toFixed(5)} < ${NGUONG_LOGO.iou}`);
	});

	test("mau-trung-goc", async () => {
		const { goc, ve } = await markTrenLuoiGoc();
		KENH.forEach((ten, kenh) => {
			const rms = rmsKenh(ve, goc, kenh);
			console.log(`RMS kenh ${ten} = ${rms.toFixed(2)}`);
			dat(rms <= NGUONG_LOGO.rmsKenh, `RMS kenh ${ten} ${rms.toFixed(2)} > ${NGUONG_LOGO.rmsKenh}`);
		});
	});

	test("can-tam", async () => {
		const canh = 622;
		const ve = await veSvg(
			renderToStaticMarkup(createElement(Logo, { width: canh, height: canh })),
		);
		const tam = tamKhungBao(ve);
		const lechX = Math.abs(tam.x - canh / 2);
		const lechY = Math.abs(tam.y - canh / 2);
		const tran = canh * NGUONG_LOGO.lechTamTiLe;
		console.log(`lech tam x = ${lechX.toFixed(2)}, y = ${lechY.toFixed(2)}`);
		dat(lechX <= tran, `lech tam x ${lechX.toFixed(2)} > ${tran}`);
		dat(lechY <= tran, `lech tam y ${lechY.toFixed(2)} > ${tran}`);
	});

	test("ban-ngang-trung-goc", async () => {
		const goc = await docAnh(duongGoc("logo-horizontal.png"));
		const ve = await veSvg(
			renderToStaticMarkup(
				createElement(LogoLockup, {
					width: goc.rong,
					height: goc.cao,
					style: { color: "#000" },
				}),
			),
		);
		const iouMark = iouMem(ve, goc, 0, BIEN_CHU_X);
		const iouChu = iouMem(ve, goc, BIEN_CHU_X, goc.rong);
		console.log(`IoU mark ban ngang = ${iouMark.toFixed(5)}, IoU chu = ${iouChu.toFixed(5)}`);
		dat(iouMark >= NGUONG_LOGO.iou, `IoU mark ban ngang ${iouMark.toFixed(5)} < ${NGUONG_LOGO.iou}`);
		dat(iouChu >= NGUONG_LOGO.iou, `IoU chu ${iouChu.toFixed(5)} < ${NGUONG_LOGO.iou}`);
	});
});
