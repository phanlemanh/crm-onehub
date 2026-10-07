import { describe, expect, test } from "bun:test";
import { ZALO } from "../../agent/agent/lib/zalo-config";
import { khungUngDungMessages } from "../lib/messages/khung-ung-dung";
import { nhacQuaZaloMessages } from "../lib/messages/nhac-qua-zalo";

function nhanDieuHuongKhac(): string[] {
	const k = khungUngDungMessages("vi");
	return [...Object.values(k.rail), k.header.homepage, k.header.accountMenu];
}

describe("cau-chao", () => {
	test("cau-chao: cau huong dan chi toi Nhắc buổi sáng va nut Nối Zalo", () => {
		const cau = ZALO.loi.huongDan;
		const nhan = khungUngDungMessages("vi").header.nhacBuoiSang;
		const nut = nhacQuaZaloMessages("vi").khoiZalo.noi;
		expect(cau.includes(nhan), "cau-chao: thieu nhan Nhắc buổi sáng").toBe(
			true,
		);
		expect(cau.includes(nut), "cau-chao: thieu nhan nut Nối Zalo").toBe(true);
		const viTri = cau.indexOf(nhan);
		for (const khac of nhanDieuHuongKhac()) {
			const o = cau.indexOf(khac);
			expect(
				o < 0 || o > viTri,
				`cau-chao: nhan ${khac} dung truoc Nhắc buổi sáng`,
			).toBe(true);
		}
	});

	test("cau-chao: doi chung, nhan Cài đặt chen truoc thi bi bat", () => {
		const nhan = khungUngDungMessages("vi").header.nhacBuoiSang;
		const sai = `mở Cài đặt › ${nhan}`;
		const viTri = sai.indexOf(nhan);
		const bat = nhanDieuHuongKhac().some((k) => {
			const o = sai.indexOf(k);
			return o >= 0 && o < viTri;
		});
		expect(bat).toBe(true);
	});
});
