import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "../../..");
const HO_SO = resolve(HERE, "..");
const PIN = `${HO_SO}/.lan/noi-tiep.json`;

const CHAN = [
	{ id: "E10", khoa: "tq_dan_so_tu_dia" },
	{ id: "E13", khoa: "tq_be_rong_do" },
	{ id: "E11", khoa: "tq_dot_bien" },
	{ id: "E2", khoa: "tq_sau_bam" },
	{ id: "E8", khoa: "tq_du_lieu_nguoi_nhap" },
	{ id: "E12", khoa: "tq_be_rong" },
];

function chet(ma, ...loi) {
	for (const d of loi) console.log(d);
	process.exit(ma);
}

function git(...args) {
	const r = spawnSync("git", args, { cwd: GOC, encoding: "utf8" });
	if (r.status !== 0) chet(2, `KHONG DO DUOC: git ${args.join(" ")} that bai`, r.stderr?.trim() ?? "");
	return r.stdout.trim();
}

function banCay() {
	return git("status", "--porcelain").split("\n").filter(Boolean).sort().join("\n");
}

function docLenh() {
	const yaml = readFileSync(`${GOC}/_acceptance/config.yaml`, "utf8");
	const khoi = yaml.split(/\n {2}script:\n/)[1];
	if (!khoi) chet(2, "KHONG DO DUOC: config.yaml khong co khoi executors.script");
	const bang = new Map();
	for (const dong of khoi.split("\n")) {
		if (!/^ {4}\S/.test(dong)) break;
		const cat = dong.indexOf(":");
		if (cat > 0) bang.set(dong.slice(4, cat).trim(), dong.slice(cat + 1).trim());
	}
	return bang;
}

const bang = docLenh();
for (const c of CHAN) {
	c.lenh = bang.get(c.khoa);
	if (!c.lenh) chet(2, `KHONG DO DUOC: config.yaml thieu executors.script.${c.khoa}`);
}

const truoc = banCay();
if (truoc !== "") {
	chet(
		2,
		"KHONG DO DUOC: cay lam viec khong sach truoc khi mo lan — cac chan trong lan so trang thai cay truoc va sau,",
		"nen mot thay doi chua ghi se bi doc nham thanh vet chua tra. Ghi hoac cat cho no roi chay lai.",
		truoc,
	);
}

const sha = git("rev-parse", "HEAD");
const run_id = randomUUID();
const batDau = new Date().toISOString();
console.log(`lan noi tiep — sha ${sha.slice(0, 12)} · run_id ${run_id}`);

const ket = [];
let hong = 0;
for (const c of CHAN) {
	process.stdout.write(`\n=== ${c.id} · ${c.khoa} ===\n`);
	const r = spawnSync("bash", ["-c", c.lenh], { cwd: GOC, encoding: "utf8", env: process.env });
	const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`;
	const duoi = ra.split("\n").filter(Boolean).slice(-12);
	for (const d of duoi) console.log(`  ${d}`);
	const ma = r.status ?? 2;
	const sau = banCay();
	const con_vet = sau !== truoc;
	if (con_vet) {
		console.log(`  KHONG DO DUOC: ${c.id} de lai thay doi tren cay — vet chua duoc tra nguyen trang:`);
		for (const d of sau.split("\n").filter(Boolean)) console.log(`    ${d}`);
	}
	console.log(`  ${c.id}: ma ${ma}${con_vet ? " · cay ban" : " · cay sach"}`);
	if (ma !== 0 || con_vet) hong += 1;
	ket.push({ id: c.id, khoa: c.khoa, lenh: c.lenh, exit: ma, cay_sach: !con_vet, duoi });
}

mkdirSync(`${HO_SO}/.lan`, { recursive: true });
writeFileSync(
	PIN,
	`${JSON.stringify({ run_id, sha, bat_dau: batDau, xong: new Date().toISOString(), chan: ket }, null, "\t")}\n`,
);

console.log(`\nghim: ${PIN.slice(GOC.length + 1)}`);
if (hong > 0) chet(1, `DO: ${hong}/${CHAN.length} chan trong lan noi tiep khong xanh.`);
console.log(`XANH: ${CHAN.length}/${CHAN.length} chan chay noi tiep tren cay sach, deu tra nguyen trang.`);
