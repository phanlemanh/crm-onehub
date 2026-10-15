import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { docDuLieu } from "../../apps/app/lib/lo-trinh/doc-du-lieu.js";
import {
	coChoSauGom,
	demNguongSong,
	docPhanHoiKeoVeDayDu,
	dongDemTuKeoVe,
	type KeoVeOutput,
	parseDuongTinHieu,
	TIN_HIEU,
	vietTep,
} from "../../packages/validation/src/tin-hieu.ts";

const MS_GIO = 3_600_000;
export const DUONG_KEO_VE = {
	lich: "/rest/tin-hieu/lich/keo-ve",
	tay: "/rest/tin-hieu/keo-ve",
} as const;
const GOC = path.resolve(import.meta.dir, "..", "..");

export type KetQuaKeoVe = {
	ma: 0 | 1 | 2;
	moi: number;
	daCo: number;
	tongKet: string[];
	loi?: string;
};

function choTuBanVe(root: string): Set<string> {
	const tep = path.join(root, "LO-TRINH.html");
	if (!existsSync(tep)) return new Set();
	const { duLieu } = docDuLieu(readFileSync(tep, "utf8"));
	return coChoSauGom(parseDuongTinHieu(duLieu?.tin_hieu));
}

function dongDau(phanHoi: KeoVeOutput): string {
	const luc = phanHoi.dongDauLuc;
	if (!luc) return "đóng dấu lượt này: 0";
	const vua = phanHoi.tep.filter((t) => t.keoVeLuc === luc);
	const cho = Math.max(
		0,
		...vua.map((t) => Date.parse(luc) - Date.parse(t.tep.luc)),
	);
	return `đóng dấu lượt này: ${vua.length} · chờ lâu nhất: ${Math.floor(cho / MS_GIO)} giờ`;
}

function tongKet(
	phanHoi: KeoVeOutput,
	moi: number,
	daCo: number,
	now: Date,
	coCho: Set<string>,
): string[] {
	const so = demNguongSong(dongDemTuKeoVe(phanHoi.tep), now, coCho);
	return [
		`mới ${moi} · đã có ${daCo}`,
		`trong ${TIN_HIEU.ngayDem} ngày: ${so.trongKy} tín hiệu từ ${so.soPhong} phòng ban`,
		...so.theoPhong.map(([ten, n]) => `  ${ten}: ${n}`),
		`  chưa có phòng ban: ${so.khongPhong}`,
		`gửi quá ${TIN_HIEU.ngayCoCho} ngày: ${so.quaHan} · chưa có chỗ sau gom: ${so.chuaCoCho}`,
		dongDau(phanHoi),
	];
}

export async function chayKeoVe(o: {
	root: string;
	url: string | undefined;
	key: string | undefined;
	khoaLich?: string | undefined;
	now: Date;
}): Promise<KetQuaKeoVe> {
	const rong = { moi: 0, daCo: 0, tongKet: [] };
	if (!o.url) return { ma: 2, ...rong, loi: "thiếu biến CRM_API_URL" };
	const lich = o.khoaLich?.trim() ?? "";
	const tay = o.key?.trim() ?? "";
	const key = lich || tay;
	if (!key)
		return {
			ma: 2,
			...rong,
			loi: "thiếu biến CRM_KHOA_KEO_TIN_HIEU hoặc CRM_API_KEY",
		};
	const duong = lich ? DUONG_KEO_VE.lich : DUONG_KEO_VE.tay;
	let res: Response;
	try {
		res = await fetch(`${o.url.replace(/\/$/, "")}${duong}`, {
			method: "POST",
			headers: { "x-api-key": key, "content-type": "application/json" },
			body: "{}",
		});
	} catch (loi) {
		return {
			ma: 2,
			...rong,
			loi: `không tới được CRM ở ${o.url}: ${loi instanceof Error ? loi.message : "lỗi mạng"}`,
		};
	}
	if (!res.ok)
		return { ma: 2, ...rong, loi: `CRM trả ${res.status} cho lượt kéo về` };
	const phanHoi = docPhanHoiKeoVeDayDu(await res.json());
	const ds = phanHoi.tep;
	const thuMuc = path.join(o.root, TIN_HIEU.thuMucNguon);
	const ghi: { tep: string; chu: string }[] = [];
	let daCo = 0;
	for (const t of ds) {
		const tep = path.join(thuMuc, `${t.id}.json`);
		const chu = vietTep(t.tep);
		if (!existsSync(tep)) ghi.push({ tep, chu });
		else if (readFileSync(tep, "utf8") === chu) daCo += 1;
		else
			return {
				ma: 1,
				...rong,
				loi: `tệp đã có mà khác nội dung, không ghi đè: ${path.relative(o.root, tep)}`,
			};
	}
	mkdirSync(thuMuc, { recursive: true });
	for (const g of ghi) writeFileSync(g.tep, g.chu);
	return {
		ma: 0,
		moi: ghi.length,
		daCo,
		tongKet: tongKet(phanHoi, ghi.length, daCo, o.now, choTuBanVe(o.root)),
	};
}

if (import.meta.main) {
	const kq = await chayKeoVe({
		root: GOC,
		url: process.env.CRM_API_URL,
		key: process.env.CRM_API_KEY,
		khoaLich: process.env.CRM_KHOA_KEO_TIN_HIEU,
		now: new Date(),
	});
	if (kq.loi) console.error(kq.loi);
	for (const dong of kq.tongKet) console.log(dong);
	process.exit(kq.ma);
}
