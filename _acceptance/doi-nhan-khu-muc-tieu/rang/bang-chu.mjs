import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chayRang, GOC, KIEM_KE } from "./dai.mjs";
import { napChuKhu } from "./nap-chu.mjs";

const HO_SO = join(GOC, "_acceptance", "doi-nhan-khu-muc-tieu");
const RA = join(GOC, ".acceptance-runs", "doi-nhan-khu-muc-tieu");
const DA_THONG_CONG = /^status: (signed-off|machine-cleared)$/m;
const VAI = { "du-phong-ten-goc": "dự phòng tên gốc", "ten-cap": "tên cấp", "pham-vi": "phạm vi" };
const o = (s) => s.replaceAll("|", "\\|").replaceAll("\n", " ");

chayRang(() => {
	const kk = JSON.parse(readFileSync(join(GOC, KIEM_KE), "utf8"));
	const hien = napChuKhu();
	const thieuVai = kk.filter((m) => m.khai_niem === "goc" && !m.vai);
	if (thieuVai.length) {
		console.log(thieuVai.map((m) => `bang-chu thieu vai ${m.tep}#${m.khoa}`).join("\n"));
		return 1;
	}
	const dong = kk.flatMap((m) =>
		m.doi.map((nn) => {
			const moi = hien.get(`${m.tep}#${m.khoa}#${nn}`) ?? "(không đọc được)";
			const tep = m.tep.split("/").at(-1);
			return `| ${m.khai_niem} | ${m.vai ? VAI[m.vai] : "—"} | ${tep}#${m.khoa} | ${nn} | ${o(m.cu[nn])} | ${o(moi)} |`;
		}),
	);
	const tong = kk.reduce((a, m) => a + m.doi.length, 0);
	if (dong.length !== tong) {
		console.log(`bang-chu: ${dong.length} dong khac ${tong}`);
		return 1;
	}
	const bang = [
		"# Bảng chữ cũ → mới — doi-nhan-khu-muc-tieu",
		"",
		"| Khái niệm | Vai | Khoá | Ngôn ngữ | Chữ cũ | Chữ mới |",
		"|---|---|---|---|---|---|",
		...dong,
		"",
	].join("\n");
	mkdirSync(RA, { recursive: true });
	writeFileSync(join(RA, "bang-chu.md"), bang);
	if (!DA_THONG_CONG.test(readFileSync(join(HO_SO, "contract.md"), "utf8"))) {
		mkdirSync(join(HO_SO, "evidence"), { recursive: true });
		copyFileSync(join(RA, "bang-chu.md"), join(HO_SO, "evidence", "bang-chu.md"));
	}
	console.log(`bang-chu: ${dong.length} dong`);
	return 0;
});
