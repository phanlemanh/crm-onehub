import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const goc = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const evalsK2 = join(goc, "_acceptance/soan-okr-trang-rieng/evals.yaml");
const cauHinh = join(goc, "_acceptance/config.yaml");
const TAP_VIET_TRUOC = [
	"E4",
	"E5",
	"E5b",
	"E6",
	"E6b",
	"E7",
	"E8",
	"E8b",
	"E9",
	"E10",
	"E10b",
	"E11",
	"E12",
	"E13",
	"E13b",
	"E13c",
	"E16",
];
const tuThu = process.argv.includes("--tu-thu");

function docYaml(duong) {
	return Bun.YAML.parse(readFileSync(duong, "utf8"));
}

function giaiLenh(ref, cfg) {
	if (!ref.startsWith("config:")) return ref;
	let nut = cfg;
	for (const phan of ref.slice("config:".length).split(".")) nut = nut?.[phan];
	const lenh = String(nut ?? "");
	if (lenh === "" || lenh.startsWith("[object")) {
		throw new Error(`khong giai duoc ${ref}`);
	}
	return lenh;
}

function chay(id, lenh) {
	const kq = spawnSync("bash", ["-c", lenh], {
		cwd: goc,
		stdio: ["ignore", "pipe", "pipe"],
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	});
	const ma = kq.status ?? 1;
	console.log(`${id}: exit ${ma}`);
	if (ma !== 0) {
		const duoi = `${kq.stdout ?? ""}\n${kq.stderr ?? ""}`.trim().split("\n");
		for (const dong of duoi.slice(-15)) console.log(`   ${dong}`);
	}
	return ma;
}

const k2 = docYaml(evalsK2);
const cfg = docYaml(cauHinh);
const song = k2.evals.filter(
	(e) =>
		(e.executor === "test" || e.executor === "script") &&
		e.status !== "not-run",
);
const ids = song.map((e) => e.id);
console.log(`k2 song: ${ids.join(", ")}`);
const lech =
	ids.length !== TAP_VIET_TRUOC.length ||
	ids.some((id, i) => id !== TAP_VIET_TRUOC[i]);
if (lech) {
	console.log(`tap k2 song doi: viet truoc ${TAP_VIET_TRUOC.join(", ")}`);
	process.exit(1);
}

if (tuThu) {
	const tep = join(goc, "apps/app/app/(app)/[slug]/okr/soan/the-nhap.tsx");
	const sach = spawnSync("git", ["diff", "--quiet", "--", tep], { cwd: goc });
	if (sach.status !== 0) {
		console.log("tu-thu tu choi: the-nhap.tsx dang co thay doi chua commit");
		process.exit(2);
	}
	const goc_ = readFileSync(tep, "utf8");
	const pha = goc_.replace(/<KaraProposalGroup\b/g, "<KaraProposalGroupPha");
	if (pha === goc_) {
		console.log("tu-thu khong pha duoc: khong thay KaraProposalGroup");
		process.exit(2);
	}
	const e4 = song.find((e) => e.id === "E4");
	let ma = 1;
	try {
		writeFileSync(
			tep,
			`${pha}\nfunction KaraProposalGroupPha() {\n\treturn null;\n}\n`,
		);
		ma = chay("E4", giaiLenh(e4.cmd, cfg));
	} finally {
		writeFileSync(tep, goc_);
	}
	process.exit(ma === 0 ? 0 : 1);
}

let sai = 0;
for (const e of song) if (chay(e.id, giaiLenh(e.cmd, cfg)) !== 0) sai += 1;
console.log(`k2 song: ${song.length - sai}/${song.length} xanh`);
process.exit(sai === 0 ? 0 : 1);
