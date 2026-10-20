import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export const NHAN_HOP_LE = ["nen", "nen-lap", "sau"];
export const LOI_DAN_SOAN = "apps/agent-okr/agent/lib/loi-dan-soan.ts";
export const THU_MUC_THUOC = "apps/agent-okr/evals/okr-soan";
export const CHU_CU_KARA = ["căn chỉnh", "hỏi ý"];
export const NGUONG = { dat: 2, chotMa: 1, tieuChi: 0.1 };

export const bam = (chu) => createHash("sha256").update(chu).digest("hex");
export const bamTep = (duong) => bam(readFileSync(duong));

function tepDuoi(goc, thuMuc) {
	return readdirSync(join(goc, thuMuc))
		.flatMap((ten) => {
			const duong = join(thuMuc, ten);
			return statSync(join(goc, duong)).isDirectory() ? tepDuoi(goc, duong) : [duong];
		})
		.sort();
}

export function BAM_THUOC(goc, danhGia, judge) {
	const tep = tepDuoi(goc, THU_MUC_THUOC).map((t) => `${relative(goc, join(goc, t))}\n${readFileSync(join(goc, t), "utf8")}`);
	return bam([...tep, JSON.stringify(danhGia), JSON.stringify(judge)].join("\n\0\n"));
}
