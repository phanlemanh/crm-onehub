import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { type DongKetQua, sha, ZCH } from "./khuon";

export type BangChung = {
	ketQua: readonly DongKetQua[];
	eveLog: string;
	chiPhiUsd: number;
	ghiChu?: readonly string[];
};

const TEP_BAM = [ZCH.tep.eveLog, ZCH.tep.ketQua] as const;

export function ghiBam(thuMuc: string): void {
	const dong = TEP_BAM.map(
		(t) => `${sha(readFileSync(join(thuMuc, t), "utf8"))}  ${t}`,
	);
	writeFileSync(join(thuMuc, ZCH.tep.bam), `${dong.join("\n")}\n`);
}

function bangMd(ketQua: readonly DongKetQua[]): string[] {
	return [
		"| người | câu | mã | phiên gốc | ZaloHoi | TaiLieuHoi | gửi Zalo | lỗi |",
		"| --- | --- | --- | --- | --- | --- | --- | --- |",
		...ketQua.map(
			(k) =>
				`| ${k.nguoi} | ${k.thuTu} | ${k.maCau} | ${k.sessionId ?? "—"} | ${k.ketQua ?? "—"} | ${k.tlhTrangThai ?? "—"}${k.tlhLyDo ? ` ${k.tlhLyDo}` : ""} | ${k.daGuiZalo ? "có" : "không"} | ${k.loi ?? ""} |`,
		),
	];
}

export function ghiBangChung(thuMuc: string, v: BangChung): void {
	mkdirSync(thuMuc, { recursive: true });
	writeFileSync(
		join(thuMuc, ZCH.tep.ketQua),
		v.ketQua.map((k) => `${JSON.stringify(k)}\n`).join(""),
	);
	writeFileSync(join(thuMuc, ZCH.tep.eveLog), v.eveLog);
	ghiBam(thuMuc);
	writeFileSync(
		join(thuMuc, ZCH.tep.bao),
		[
			"# Đo câu Zalo thứ hai trên eve thật",
			"",
			...(v.ghiChu ?? []),
			"",
			`${ZCH.dongChiPhi} ${v.chiPhiUsd.toFixed(4)}`,
			"",
			...bangMd(v.ketQua),
			"",
		].join("\n"),
	);
}
