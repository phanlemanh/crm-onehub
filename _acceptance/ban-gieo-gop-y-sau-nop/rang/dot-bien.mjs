import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const THU_MUC = join(GOC, "_acceptance/gop-y-dung-cho/rang");
const THAT = join(THU_MUC, "san-gop-y.mjs");
const TIEN_TO = ".san-gop-y-vet-";
const RA = join(GOC, ".acceptance-runs/ban-gieo-gop-y-sau-nop");

const bam = () => createHash("sha256").update(readFileSync(THAT)).digest("hex");
const cfg = Bun.YAML.parse(
	readFileSync(join(GOC, "_acceptance/config.yaml"), "utf8"),
);
const lenh = (k) => {
	const l = cfg.executors?.script?.[k];
	if (!l) {
		console.log(`KHONG DO DUOC: thieu executors.script.${k}`);
		process.exit(2);
	}
	return l;
};
function chay(cmd, env = {}) {
	const r = spawnSync("bash", ["-c", cmd], {
		cwd: GOC,
		encoding: "utf8",
		maxBuffer: 128 << 20,
		env: { ...process.env, ...env },
	});
	return { ma: r.status, ra: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}
const thay = (a, b) => (s) => {
	const lan = s.split(a).length - 1;
	if (lan !== 1)
		throw new Error(`vet khong cam duoc: «${a}» xuat hien ${lan} lan`);
	return s.replace(a, b);
};
const noi =
	(...f) =>
	(s) =>
		f.reduce((x, g) => g(x), s);

for (const t of readdirSync(THU_MUC))
	if (t.startsWith(TIEN_TO)) rmSync(join(THU_MUC, t), { force: true });

mkdirSync(RA, { recursive: true });
const bamDau = bam();
for (const k of ["k3b_kiem_nop", "k3b_gieo_thu"]) {
	const r = chay(lenh(k));
	if (r.ma !== 0) {
		console.log(`KHONG DO DUOC: ${k} chua xanh tren cay lanh (ma ${r.ma})`);
		process.exit(2);
	}
}
console.log("chieu xanh: k3b_kiem_nop, k3b_gieo_thu xanh tren cay lanh");

const VET = [
	{
		ten: "(a) completeTask bat buoc",
		cam: noi(
			thay(
				"kiemNopXong(kq, viec);",
				'if (!(await completeTask(xep.taskId, "da-nop"))) throw new Error(`viec ${xep.taskId} da dong truoc khi nop xong`);',
			),
			thay(
				'import { noteSession } from "../../../apps/agent/agent/lib/tasks.ts";',
				'import { completeTask, noteSession } from "../../../apps/agent/agent/lib/tasks.ts";',
			),
		),
		do: [["k3b_gieo_thu", "da dong truoc khi nop xong"]],
	},
	{
		ten: "(b) bo kiem ket cuc",
		cam: thay(" ||\n\t\tviec.outcome !== TRO_LY_OKR.ketThuc.daNop", ""),
		do: [["k3b_kiem_nop", "ca loi: khong nem"]],
	},
	{
		ten: "(c) kiem nop luon nem loi la",
		cam: thay(
			"export function kiemNopXong(kq, viec) {",
			'export function kiemNopXong(kq, viec) {\n\tthrow new Error("vet-c");',
		),
		do: [["k3b_gieo_thu", "vet-c"]],
		phanLoai: true,
	},
];

let bat = 0;
const goc = readFileSync(THAT, "utf8");
for (const v of VET) {
	const tep = join(THU_MUC, `${TIEN_TO}${process.pid}.mjs`);
	const ket = [];
	try {
		writeFileSync(tep, v.cam(goc));
		const env = { BAN_GIEO: relative(GOC, tep) };
		for (const [k, thongDiep] of v.do) {
			const r = chay(lenh(k), env);
			writeFileSync(join(RA, `dot-bien-${v.ten.slice(1, 2)}-${k}.txt`), r.ra);
			ket.push(
				`${k} ${r.ma !== 0 ? "do" : "XANH"}${r.ra.includes(thongDiep) ? "" : ` (thieu «${thongDiep}»)`}`,
			);
			if (v.phanLoai) {
				const tam = join(RA, `dot-bien-${v.ten.slice(1, 2)}-ra.txt`);
				writeFileSync(tam, r.ra);
				const p = chay(
					`bun _acceptance/ban-gieo-gop-y-sau-nop/rang/ba-ban-do.mjs --phan-loai ${tam}`,
				);
				ket.push(
					`phan-loai ${p.ra.includes("khong qua buoc gieo") ? "khong qua" : `SAI «${p.ra.trim()}»`}`,
				);
			}
		}
	} finally {
		rmSync(tep, { force: true });
	}
	const duBat = ket.every((x) => !/XANH|thieu|SAI/.test(x));
	if (duBat) bat++;
	console.log(`${duBat ? "bat" : "MU"} ${v.ten}: ${ket.join(" · ")}`);
}
if (bam() !== bamDau) {
	console.log("TEP THAT BI DOI: _acceptance/gop-y-dung-cho/rang/san-gop-y.mjs");
	process.exit(3);
}
console.log(`dot-bien: ${bat}/${VET.length} vet bi bat, tep that nguyen`);
process.exit(bat === VET.length ? 0 : 1);
