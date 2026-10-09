import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chayThuoc, GOC, ketThuc, THUOC } from "./chung.mjs";

const RONG = ["--nhanh", "onehub", "--tu", "2026-10-04T00:00:00Z", "--den", "2026-10-09T00:00:00Z"];
const MOT_TRANG = ["--nhanh", "onehub", "--tu", "2026-10-08T16:00:00Z", "--den", "2026-10-09T04:00:00Z"];
const MONG_RONG = "141";
const MONG_MOT_TRANG = "20";

const loi = [];
const rong = chayThuoc("node", RONG);
console.log(`cua so rong 04/10 -> 09/10: luot ci.yml=${rong.dong.get("luot ci.yml")} (ma ${rong.ma})`);
if (rong.dong.get("luot ci.yml") !== MONG_RONG) loi.push(`cua so rong in «${rong.dong.get("luot ci.yml")}», mong ${MONG_RONG} — ${rong.stderr.trim()}`);

const mot = chayThuoc("node", MOT_TRANG);
console.log(`bien mot trang 08/10 16:00Z -> 09/10 04:00Z: luot ci.yml=${mot.dong.get("luot ci.yml")} (ma ${mot.ma})`);
if (mot.dong.get("luot ci.yml") !== MONG_MOT_TRANG) loi.push(`bien mot trang in «${mot.dong.get("luot ci.yml")}», mong ${MONG_MOT_TRANG}`);

const thuMuc = mkdtempSync(join(tmpdir(), "phan-trang-"));
try {
	const goc = readFileSync(THUOC, "utf8");
	const banSao = goc
		.replace('"../../../scripts/kiem-cheo/tep-chinh.mjs"', JSON.stringify(resolve(GOC, "scripts/kiem-cheo/tep-chinh.mjs")))
		.replace('["api", "--paginate", ', '["api", ');
	if (banSao === goc || banSao.includes('"--paginate"')) {
		loi.push("khong dung duoc ban sao bo --paginate — thuoc da doi cach goi gh, sua phan-trang.mjs");
	} else {
		const tep = join(thuMuc, "do-7-ngay.mjs");
		writeFileSync(tep, banSao);
		const pha = chayThuoc("node", RONG, { tep });
		console.log(`ban sao bo --paginate: luot ci.yml=${pha.dong.get("luot ci.yml")} (ma ${pha.ma})`);
		if (pha.dong.get("luot ci.yml") === MONG_RONG) loi.push("ban sao bo --paginate van in 141 — phep do khong bat thieu trang");
		else console.log("chieu do: ban sao bo --paginate -> DUNG «thieu trang»");
	}
} finally {
	rmSync(thuMuc, { recursive: true, force: true });
}
ketThuc("phan-trang", loi);
