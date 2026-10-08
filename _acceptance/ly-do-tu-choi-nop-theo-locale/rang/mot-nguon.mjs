import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { doiCo, ketLuan, ROOT } from "./chung.mjs";

const GOC = ["apps/agent-okr/agent", "apps/app/app/(app)/[slug]/okr/soan", "packages/validation/src"];
const NOI_KHAI = "packages/validation/src/okr-cuoc-soan.ts";
const TRUNG_CHU = [
	{
		tep: "apps/app/app/(app)/[slug]/okr/soan/nut-soan.tsx",
		literal: '"don-vi-chua-bat"',
		viSao: "ma ly do soanSanSang cua API (okr.contracts.ts), cung chu khac tap",
	},
];
const co = doiCo(process.argv.slice(2));

function tepTs(thuMuc) {
	if (!fs.existsSync(thuMuc)) return [];
	return fs
		.readdirSync(thuMuc, { recursive: true, withFileTypes: true })
		.filter((d) => d.isFile() && /\.tsx?$/.test(d.name))
		.map((d) => path.join(d.parentPath ?? d.path, d.name));
}

function banSao(goc) {
	const tam = fs.mkdtempSync(path.join(os.tmpdir(), "k2c-mot-nguon-"));
	for (const g of GOC) fs.cpSync(path.join(ROOT, g), path.join(tam, g), { recursive: true });
	fs.writeFileSync(path.join(tam, GOC[1], "them.ts"), 'export const LAP = "chu ky khong o pha lap ke hoach";\n');
	return { goc: tam, don: () => fs.rmSync(tam, { recursive: true, force: true }) };
}

function gocRong(ten) {
	const tam = fs.mkdtempSync(path.join(os.tmpdir(), "k2c-goc-rong-"));
	return { thay: ten, thuMuc: tam, don: () => fs.rmSync(tam, { recursive: true, force: true }) };
}

const { TRO_LY_OKR_SOAN } = await import(path.join(ROOT, "apps/agent-okr/agent/lib/config.ts"));
const { LY_DO_TU_CHOI_NOP } = await import(path.join(ROOT, NOI_KHAI));

let sai = 0;
const loi = (cau) => {
	sai += 1;
	console.log(cau);
};

if (TRO_LY_OKR_SOAN.tuChoi !== LY_DO_TU_CHOI_NOP) loi("khong cung doi tuong: TRO_LY_OKR_SOAN.tuChoi khac LY_DO_TU_CHOI_NOP");

const sao = co["ban-sao"] === "them-tap" ? banSao() : null;
const rong = typeof co["goc-rong"] === "string" ? gocRong(co["goc-rong"]) : null;
const nen = sao?.goc ?? ROOT;
const literal = Object.values(LY_DO_TU_CHOI_NOP).map((v) => `"${v}"`);
try {
	const dem = [];
	const coKhai = [];
	for (const g of GOC) {
		const thuMuc = rong?.thay === g ? rong.thuMuc : path.join(nen, g);
		const tep = tepTs(thuMuc);
		dem.push(tep.length);
		if (tep.length === 0) loi(`goc quet rong: ${g}`);
		for (const t of tep) {
			const noi = fs.readFileSync(t, "utf8");
			const tuongDoi = path.relative(nen, t);
			const boQua = TRUNG_CHU.filter((x) => x.tep === tuongDoi).map((x) => x.literal);
			if (literal.some((l) => !boQua.includes(l) && noi.includes(l))) coKhai.push(tuongDoi);
		}
	}
	if (coKhai.length !== 1 || coKhai[0] !== NOI_KHAI) loi(`tap ma khai ${coKhai.length} cho: ${coKhai.join(", ")}`);
	for (const x of TRUNG_CHU) console.log(`   bo qua ${x.literal} o ${x.tep}: ${x.viSao}`);
	if (!sai)
		console.log(`mot-nguon: LY_DO_TU_CHOI_NOP 1 cho, agent tro vao, 3 goc quet (${dem.join("/")} tep)`);
} finally {
	sao?.don();
	rong?.don();
}
ketLuan(sai);
