import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { KIEM_CHEO } from "./cau-hinh.mjs";

export function duongLan(goc) {
	const { plugin, tep, giaiBang } = KIEM_CHEO.lan;
	const thuMuc = execFileSync(
		"node",
		[join(goc, giaiBang), "--plugin", plugin, "--require", tep],
		{ encoding: "utf8" },
	).trim();
	return { thuMuc, tep: join(thuMuc, tep) };
}
