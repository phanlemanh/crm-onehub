import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { chayThuoc, ketThuc } from "./chung.mjs";

const mau = (id) => JSON.parse(readFileSync(join(import.meta.dirname, "mau", `luot-${id}.json`), "utf8"));
const DA_GOP = mau(37895940297);
const BI_DE = mau(37877228894);

const GH_GIA = `#!/usr/bin/env node
const fs = require("node:fs");
const o = JSON.parse(fs.readFileSync(process.env.GH_GIA_O, "utf8"));
const duong = process.argv.find((a) => a.startsWith("repos/")) || "";
const ra = (ds) => process.stdout.write(ds.map((x) => JSON.stringify(x)).join("\\n") + "\\n");
for (const [mau, hanh] of o.hong || []) {
  if (duong.includes(mau)) {
    if (hanh.ma) { process.stderr.write(hanh.loi + "\\n"); process.exit(hanh.ma); }
    process.stdout.write(hanh.chu + "\\n"); process.exit(0);
  }
}
if (duong.includes("/actions/runs?")) ra([o.luot.run]);
else if (duong.includes("/pulls")) ra(o.luot.pulls);
else if (duong.includes("/jobs")) ra(o.luot.jobs);
else if (duong.includes("/annotations")) {
  const id = duong.split("/")[4];
  ra(o.annotations?.[id] ?? o.luot.annotations[id] ?? []);
} else { process.stderr.write("gh gia: khong biet " + duong + "\\n"); process.exit(9); }
`;

const THAM_SO = ["--nhanh", "onehub", "--tu", "2026-10-01T00:00:00Z", "--den", "2026-10-02T00:00:00Z"];
const jobDungDe = BI_DE.jobs.find((j) => j.conclusion === "cancelled");

const O = [
	{
		ten: "(a) du lieu lanh -> ma 3, co dong so (doi chung duong)",
		cau: { luot: DA_GOP },
		kiem: (r) => [
			r.ma === 3 || `ma ${r.ma}, mong 3`,
			r.dong.get("luot ci.yml") === "1" || `luot ci.yml «${r.dong.get("luot ci.yml")}»`,
			r.dong.get("luot xanh") === "1" || `luot xanh «${r.dong.get("luot xanh")}»`,
			r.dong.has("ket luan") || "thieu dong ket luan",
		],
	},
	{
		ten: "(b) gh thoat 1 o lenh doc jobs -> ma 2, goi ten lenh",
		cau: { luot: DA_GOP, hong: [["/jobs", { ma: 1, loi: "HTTP 502: Bad Gateway" }]] },
		kiem: (r) => [
			r.ma === 2 || `ma ${r.ma}, mong 2`,
			(r.stderr.includes("gh api") && r.stderr.includes("/jobs")) || `stderr khong goi ten lenh: «${r.stderr.trim()}»`,
			!r.dong.has("ket luan") || "van in ket luan",
		],
	},
	{
		ten: "(c) gh tra JSON hong -> ma 2",
		cau: { luot: DA_GOP, hong: [["/actions/runs?", { chu: "{hong" }]] },
		kiem: (r) => [
			r.ma === 2 || `ma ${r.ma}, mong 2`,
			r.stderr.includes("JSON hong") || `stderr «${r.stderr.trim()}»`,
			!r.dong.has("ket luan") || "van in ket luan",
		],
	},
	{
		ten: "(d) job da chay chi co «The operation was canceled.» -> ma 2, goi ten luot, job, cau",
		cau: { luot: BI_DE, annotations: { [String(jobDungDe.id)]: [{ message: "The operation was canceled." }] } },
		kiem: (r) => [
			r.ma === 2 || `ma ${r.ma}, mong 2`,
			r.stderr.includes(String(BI_DE.run.id)) || "stderr thieu id luot",
			r.stderr.includes(jobDungDe.name) || "stderr thieu ten job",
			r.stderr.includes("The operation was canceled.") || "stderr thieu nguyen cau",
			!r.dong.has("ket luan") || "van in ket luan",
		],
	},
];

const thuMuc = mkdtempSync(join(tmpdir(), "gh-gia-"));
const loi = [];
try {
	writeFileSync(join(thuMuc, "gh"), GH_GIA);
	chmodSync(join(thuMuc, "gh"), 0o755);
	for (const o of O) {
		const tepO = join(thuMuc, "o.json");
		writeFileSync(tepO, JSON.stringify(o.cau));
		const r = chayThuoc("node", THAM_SO, {
			env: { ...process.env, PATH: `${thuMuc}${delimiter}${process.env.PATH}`, GH_GIA_O: tepO },
		});
		const hong = o.kiem(r).filter((x) => x !== true);
		console.log(`${o.ten}: ${hong.length ? "LECH" : "dung"} (ma ${r.ma})`);
		for (const h of hong) loi.push(`${o.ten} — ${h}`);
	}
} finally {
	rmSync(thuMuc, { recursive: true, force: true });
}
ketThuc("gh-gia", loi);
