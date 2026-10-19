import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
	batAgentOkr,
	cauThieuKhoaSoan,
	chayTrongPhienSoan,
	coKhoaMoHinhSoan,
	PHIEN_SOAN,
	trongPhienSoan,
} from "../../soan-okr-cung-tro-ly/rang/phien-soan.mjs";
import {
	napBoMau,
	phienCookie,
	thuMau,
} from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import { GOC, hoiMotCau, PHIEN_HOI, RA_HOI } from "./phien-hoi.mjs";

const LENH =
	'bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/hoi-dap-okr/rang/ghi-luong.mjs"';
const RA = join(GOC, "apps/app/test/fixtures/okr-hoi-luong.json");
const NGUOI = "ngo-van-toan";
const CAU = "Mục tiêu giữ đà tăng trưởng bán lẻ miền Bắc đang thế nào?";

async function trongPhien() {
	const nap = napBoMau();
	if (nap.ma !== 0) {
		console.log(`KHONG DO DUOC: okr:mau thoat ${nap.ma}: ${nap.dong}`);
		return PHIEN_HOI.ma.khongDo;
	}
	const okr = await batAgentOkr({
		cong: Number(process.env[PHIEN_SOAN.bienCong]),
		thuMuc: RA_HOI,
	});
	try {
		const kq = await hoiMotCau({
			app: process.env.APP_URL,
			api: process.env.API_URL,
			cookie: phienCookie(thuMau(NGUOI)),
			cauHoi: CAU,
		});
		if (!kq.traLoi) {
			console.log(`KHONG DAT: luot khong co cau tra loi duoc nhan; tool ${kq.congCu.join(",")}`);
			return PHIEN_HOI.ma.khongDat;
		}
		const suKien = kq.suKien.map(({ tho: _bo, ...s }) => s);
		mkdirSync(dirname(RA), { recursive: true });
		writeFileSync(
			RA,
			`${JSON.stringify({ nguon: "ghi-luong.mjs — phiên okr-hoi thật trên bộ OKR mẫu", nguoiHoi: NGUOI, cauHoi: CAU, suKien }, null, "\t")}\n`,
		);
		console.log(`ghi ${suKien.length} su kien, ket ${suKien.at(-1)?.type}, tool ${kq.congCu.join(",")}`);
		return PHIEN_HOI.ma.dat;
	} finally {
		await okr.dung();
	}
}

async function main() {
	if (!coKhoaMoHinhSoan()) {
		console.log(`KHONG DO DUOC: ${cauThieuKhoaSoan()}`);
		return PHIEN_HOI.ma.khongDo;
	}
	if (!trongPhienSoan()) return chayTrongPhienSoan(LENH);
	return trongPhien();
}

process.exit(await main());
