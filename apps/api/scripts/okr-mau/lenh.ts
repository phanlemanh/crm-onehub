import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { LoiBoMau, OKR_MAU } from "./cau-hinh";
import { docBoOkrMau } from "./khuon";
import { type DemBoMau, napBoOkrMau, xoaBoOkrMau } from "./nap";

export const TEP_CONG_TY = join(import.meta.dir, "cong-ty.json");

const NGAY = /^\d{4}-\d{2}-\d{2}$/;

export type ThamSo = { xoa: boolean; moc: Date; tep: string };

function giaTriCo(args: string[], co: string): string | undefined {
	const i = args.indexOf(co);
	return i === -1 ? undefined : args[i + 1];
}

export function docThamSo(args: string[], bayGio = new Date()): ThamSo {
	const la = args.filter(
		(a, i) =>
			a.startsWith("--") &&
			!Object.values(OKR_MAU.co).some((c) => c === a) &&
			args[i - 1] !== OKR_MAU.co.moc,
	);
	if (la.length)
		throw new LoiBoMau(
			OKR_MAU.ma.sai,
			`Cờ không nhận ra: ${la.join(", ")}. Cờ hợp lệ: ${Object.values(OKR_MAU.co).join(", ")}.`,
		);
	const mocTho = giaTriCo(args, OKR_MAU.co.moc);
	let moc = bayGio;
	if (args.includes(OKR_MAU.co.moc)) {
		const d =
			mocTho === undefined
				? Number.NaN
				: NGAY.test(mocTho)
					? Date.parse(`${mocTho}T12:00:00+07:00`)
					: Date.parse(mocTho);
		const hopLe =
			mocTho !== undefined &&
			Number.isFinite(d) &&
			(!NGAY.test(mocTho) || new Date(d).toISOString().slice(0, 10) === mocTho);
		if (!hopLe)
			throw new LoiBoMau(
				OKR_MAU.ma.sai,
				`${OKR_MAU.co.moc} cần một ngày dạng YYYY-MM-DD hoặc thời điểm ISO, nhận «${mocTho ?? ""}».`,
			);
		moc = new Date(d);
	}
	return {
		xoa: args.includes(OKR_MAU.co.xoa),
		moc,
		tep: giaTriCo(args, OKR_MAU.co.tep) ?? TEP_CONG_TY,
	};
}

function docTep(tep: string) {
	let chu: string;
	try {
		chu = readFileSync(tep, "utf8");
	} catch (loi) {
		throw new LoiBoMau(
			OKR_MAU.ma.sai,
			`Không đọc được tệp bộ mẫu ${tep}: ${loi instanceof Error ? loi.message : String(loi)}`,
		);
	}
	try {
		return docBoOkrMau(chu);
	} catch (loi) {
		throw new LoiBoMau(
			OKR_MAU.ma.sai,
			`Tệp bộ mẫu ${tep} sai:\n${loi instanceof Error ? loi.message : String(loi)}`,
		);
	}
}

const tomTat = (d: DemBoMau) =>
	`${d.nguoi} người, ${d.boPhan} bộ phận, ${d.phongBan} phòng ban, ${d.chuKy} chu kỳ, ${d.mucTieu} mục tiêu, ${d.kr} KR, ${d.capNhat} lần cập nhật trong ${d.phien} phiên, ${d.soChup} bản chụp số, ${d.diem} điểm quý 3, ${d.viec} việc, ${d.bangChung} bằng chứng, ${d.ghiNhan} ghi nhận, ${d.mau} mẫu OKR, ${d.tuMau} mục tiêu sinh từ mẫu, ${d.nguoiXem} người xem có tên, ${d.vet} dòng vết, ${d.hoiY} lần hỏi ý mục tiêu với ${d.y} ý, ${d.dongY} lượt đồng ý, ${d.chuDe} chủ đề + ${d.yLa} ý lạ, ${d.taiLieu} trang tài liệu`;

export async function chayLenh(args: string[]): Promise<number> {
	try {
		const ts = docThamSo(args);
		if (ts.xoa) {
			const dem = await xoaBoOkrMau(db);
			console.log(
				dem
					? `Đã xoá bộ OKR mẫu: ${tomTat(dem)}.`
					: "Kho không có bộ mẫu nào — không có gì để xoá.",
			);
			return 0;
		}
		const bo = docTep(ts.tep);
		const dem = await napBoOkrMau(db, bo, { moc: ts.moc });
		console.log(
			`Đã nạp bộ OKR mẫu «${bo.congTy}» (tuần 6 chứa ${ts.moc.toISOString()}): ${tomTat(dem)}.`,
		);
		return 0;
	} catch (loi) {
		if (loi instanceof LoiBoMau) {
			console.error(loi.message);
			return loi.ma;
		}
		throw loi;
	} finally {
		await db.$disconnect();
	}
}
