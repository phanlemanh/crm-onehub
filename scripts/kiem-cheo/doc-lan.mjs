import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { KIEM_CHEO } from "./cau-hinh.mjs";

const DONG_SUITE = /^\[lane\] suite (\d+)\/(\d+): (.*) → exit (\d+) \(/;
const DONG_EVAL =
	/^\[lane\] (\S+) (E\w+)( \(chạy lại\))?: (.*) → exit (\d+)(?: \(|$)/;
const DA_CHAY = "(đã chạy)";
const DAU_MAU = /^# feature-loop (\S+) /;

export function docLan(text) {
	const suite = [];
	const theoKhoa = new Map();
	for (const dong of text.split("\n")) {
		const s = DONG_SUITE.exec(dong);
		if (s) {
			suite.push({ i: Number(s[1]), lenh: s[3], ma: Number(s[4]) });
			continue;
		}
		const e = DONG_EVAL.exec(dong);
		if (e) {
			theoKhoa.set(`${e[1]} ${e[2]}`, {
				slug: e[1],
				id: e[2],
				lenh: e[4] === DA_CHAY ? null : e[4],
				ma: Number(e[5]),
				chayLai: Boolean(e[3]),
				daChay: e[4] === DA_CHAY,
			});
		}
	}
	return { suite, eval: [...theoKhoa.values()] };
}

export function phienBanMau(text) {
	return DAU_MAU.exec(text)?.[1] ?? null;
}

export function duongLan(goc) {
	const { plugin, tep, giaiBang } = KIEM_CHEO.lan;
	const thuMuc = execFileSync(
		"node",
		[join(goc, giaiBang), "--plugin", plugin, "--require", tep],
		{ encoding: "utf8" },
	).trim();
	return { thuMuc, tep: join(thuMuc, tep) };
}

export function phienBanDangCai(goc) {
	const { thuMuc } = duongLan(goc);
	return JSON.parse(
		readFileSync(join(thuMuc, KIEM_CHEO.lan.moTaPlugin), "utf8"),
	).version;
}

export function kiemMau({ mau, phienBan }) {
	const cu = phienBanMau(mau);
	return cu === phienBan ? null : `mau dong lan cu: ${cu} != ${phienBan}`;
}
