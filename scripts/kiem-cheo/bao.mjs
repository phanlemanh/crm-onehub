import { execFileSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readdirSync,
	renameSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { KIEM_CHEO } from "./cau-hinh.mjs";

const { phien, slug } = KIEM_CHEO.khoa;

export function ngayLuot(ms) {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: KIEM_CHEO.muiGio,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date(ms));
}

function ghiNguyenTu(dich, noiDung) {
	const tam = `${dich}.tam-${process.pid}-${Date.now()}`;
	writeFileSync(tam, noiDung);
	renameSync(tam, dich);
}

function thoatAs(s) {
	return `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export function thongBaoMac(tieuDe, noiDung) {
	execFileSync("osascript", [
		"-e",
		`display notification ${thoatAs(noiDung)} with title ${thoatAs(tieuDe)}`,
	]);
}

export function tomTat(ketQua) {
	const dong = [
		`kiem cheo ${ketQua.ket_qua} (${ketQua.tu?.slice(0, 9)}..${ketQua.den?.slice(0, 9)})`,
	];
	for (const d of ketQua.do ?? []) {
		dong.push(
			`${d.ho_so} ${d.eval} ${d.loai}${d.lan_gop ? ` lan gop ${d.lan_gop.slice(0, 9)}` : ""} — ${d.lenh}`,
		);
	}
	if (ketQua.ly_do) dong.push(ketQua.ly_do);
	return dong.join("\n");
}

function soDonKe(thuMuc) {
	const so = readdirSync(thuMuc)
		.map((t) => /^kiem-cheo-(\d+)\.json$/.exec(t)?.[1])
		.filter(Boolean)
		.map(Number);
	return so.length === 0 ? 1 : Math.max(...so) + 1;
}

export function bao({
	goc,
	ketQua,
	dot,
	thongBao = thongBaoMac,
	now = Date.now,
}) {
	const thuMuc = join(goc, KIEM_CHEO.thuMuc);
	mkdirSync(thuMuc, { recursive: true });
	const tep = join(thuMuc, `${ngayLuot(now())}.json`);
	ghiNguyenTu(tep, `${JSON.stringify(ketQua, null, 2)}\n`);
	if (!KIEM_CHEO.baoNguoi.includes(ketQua.ket_qua)) return { tep };
	const noiDung = tomTat(ketQua);
	if (dot && existsSync(join(dot, "yeu-cau"))) {
		const yc = join(
			dot,
			"yeu-cau",
			`kiem-cheo-${soDonKe(join(dot, "yeu-cau"))}.json`,
		);
		ghiNguyenTu(
			yc,
			JSON.stringify({
				phien,
				loai: "can-nguoi",
				hang: slug,
				luc: new Date(now()).toISOString(),
				noi_dung: noiDung,
			}),
		);
		return { tep, yeuCau: yc };
	}
	thongBao(`Kiểm chéo sau gộp: ${ketQua.ket_qua}`, noiDung);
	return { tep };
}
