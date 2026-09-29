import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	docTep,
	GOC_KHO,
	khongDo,
	NUT_KHOA,
	TEN_CU,
	TEP_BLOB,
	THUOC,
	tenKhoa,
} from "./khoa-nguon.mjs";

const TEP = fileURLToPath(import.meta.url);
const CONFIG = "_acceptance/config.yaml";
const EVALS = "_acceptance/bo-chu-lap-keo-tha/evals.yaml";
const TEN_DOI = "KHO_NGUON_DOI_TEN";
const TIEN_DE = "KHONG DO DUOC: chay qua phien do";
const NGUYEN_VAN = "[^\\s$`'\"]+";

function lenh(goc, khoa) {
	const dong = docTep(goc, CONFIG)
		.split("\n")
		.find((d) => d.trimStart().startsWith(`${khoa}:`));
	if (!dong) khongDo(`khong thay khoa config ${khoa}`);
	return dong
		.trimStart()
		.slice(khoa.length + 1)
		.trim()
		.replace(/^'(.*)'$/, "$1");
}

function dong(goc, tep, moc) {
	const d = docTep(goc, tep)
		.split("\n")
		.find((x) => x.includes(moc));
	if (!d) khongDo(`khong thay «${moc}» trong ${tep}`);
	return d;
}

function khoi(goc, tep, id) {
	const dongs = docTep(goc, tep).split("\n");
	const dau = dongs.findIndex((d) => d.trim() === `- id: ${id}`);
	if (dau < 0) khongDo(`khong thay eval ${id} trong ${tep}`);
	const sau = dongs.findIndex((d, i) => i > dau && /^\s*- id: /.test(d));
	return dongs.slice(dau, sau < 0 ? undefined : sau).join("\n");
}

function kiem(goc) {
	const ten = tenKhoa(goc);
	const o = [
		["lenh bclkt_man_chu", "lenh", lenh(goc, "bclkt_man_chu")],
		["thong diep tien de", "chu", dong(goc, THUOC, TIEN_DE)],
		["thong diep nut khoa", "chu", dong(goc, THUOC, NUT_KHOA)],
		["khoi E6u", "chu", khoi(goc, EVALS, "E6u")],
	];
	let dat = 0;
	for (const [nhan, kieu, chu] of o) {
		const loi = [];
		if (chu.includes(TEN_CU)) loi.push(`con ten khoa cu ${TEN_CU} o ${nhan}`);
		if (!chu.includes(ten)) loi.push(`khong goi ten khoa ${ten} o ${nhan}`);
		else if (
			kieu === "lenh" &&
			!new RegExp(`^${ten}=${NGUYEN_VAN}\\s`).test(chu)
		)
			loi.push(`gia tri khoa khong phai chu nguyen van o ${nhan}`);
		if (loi.length === 0) dat += 1;
		console.log(loi.length === 0 ? `dat: ${nhan}` : `do: ${loi.join(" · ")}`);
	}
	console.log(`ten khoa ${ten}: ${dat}/${o.length} o dat`);
	return dat === o.length ? 0 : 1;
}

function banSao(sua) {
	const tam = mkdtempSync(join(tmpdir(), "mctkkn-ten-khoa-"));
	for (const t of [TEP_BLOB, CONFIG, THUOC, EVALS]) {
		mkdirSync(dirname(join(tam, t)), { recursive: true });
		cpSync(join(GOC_KHO, t), join(tam, t));
	}
	sua(tam);
	return tam;
}

const suaChu = (goc, t, f) => writeFileSync(join(goc, t), f(docTep(goc, t)));

const CA_DO = [
	[
		`con ten khoa cu ${TEN_CU} o thong diep nut khoa`,
		1,
		(g) =>
			suaChu(g, THUOC, (v) =>
				v.replace(`${NUT_KHOA} ${tenKhoa(GOC_KHO)}`, `${NUT_KHOA} ${TEN_CU}`),
			),
	],
	[
		"gia tri khoa khong phai chu nguyen van o lenh bclkt_man_chu",
		1,
		(g) =>
			suaChu(g, CONFIG, (v) =>
				v.replace(
					new RegExp(`bclkt_man_chu: '${tenKhoa(GOC_KHO)}=\\S+`),
					`bclkt_man_chu: '${tenKhoa(GOC_KHO)}=\${${tenKhoa(GOC_KHO)}:-gia}`,
				),
			),
	],
	[
		`khong goi ten khoa ${TEN_DOI}`,
		4,
		(g) =>
			suaChu(g, TEP_BLOB, (v) =>
				v.replace(`bienKhoa: "${tenKhoa(GOC_KHO)}"`, `bienKhoa: "${TEN_DOI}"`),
			),
	],
];

function chieuDo() {
	let bat = 0;
	for (const [ghim, soDo, sua] of CA_DO) {
		const tam = banSao(sua);
		try {
			const r = spawnSync(process.execPath, [TEP, "--goc", tam], {
				encoding: "utf8",
			});
			const dem = r.stdout.split("\n").filter((d) => d.includes(ghim)).length;
			const trung = r.status === 1 && dem === soDo;
			if (trung) bat += 1;
			console.log(
				`chieu do -> exit ${r.status} · ${trung ? `${ghim} (${dem} o)` : `KHONG BAT «${ghim}» x${soDo}, thay ${dem}`}`,
			);
		} finally {
			rmSync(tam, { recursive: true, force: true });
		}
	}
	return bat;
}

const [, , cheDo, duongDan] = process.argv;

if (cheDo === "--goc") process.exit(kiem(duongDan));

const bat = chieuDo();
if (bat !== CA_DO.length) {
	console.log(`doi chung: SAI — chieu do chi bat ${bat}/${CA_DO.length}`);
	process.exit(3);
}
console.log(`doi chung: do dung ${bat}/${CA_DO.length}`);
process.exit(kiem(GOC_KHO));
