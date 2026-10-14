import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const MOC_MAC_DINH = "966eeb78e";
const VUNG = [
	"apps/agent/test/cau-hoi-het-han-muc.integration.spec.ts",
	"apps/agent/test/builder-runtime.integration.spec.ts",
	"apps/agent/test/stale-tasks.integration.spec.ts",
	"apps/agent/test/eve-tran/evals/chay-tiep",
	"apps/agent/test/eve-tran/evals/chan-khuon",
	"apps/app/test/agent-builder.spec.ts",
	"apps/app/test/agent-results.spec.ts",
	"apps/app/test/agent-transcript.spec.ts",
	"apps/app/test/het-han-muc.dom.tsx",
];
const BO_QUA = /\.(skip|todo|only)\(/g;

function git(...doiSo) {
	return execFileSync("git", ["-C", GOC, ...doiSo], { encoding: "utf8" });
}

function tepO(moc, duong) {
	return git("ls-tree", "-r", "--name-only", moc, "--", duong)
		.split("\n")
		.filter(Boolean);
}

export function lech(truoc, sau) {
	const con = new Set(sau.split("\n").map((d) => d.trim()));
	const mat = truoc
		.split("\n")
		.map((d) => d.trim())
		.filter((d) => d.includes("expect(") && !con.has(d));
	const boQuaTruoc = (truoc.match(BO_QUA) ?? []).length;
	const boQuaSau = (sau.match(BO_QUA) ?? []).length;
	return { mat, themBoQua: Math.max(0, boQuaSau - boQuaTruoc) };
}

function soMoc(moc) {
	const loi = [];
	let soTep = 0;
	for (const vung of VUNG) {
		const tep = tepO(moc, vung);
		if (tep.length === 0) loi.push(`${vung}: khong co o moc ${moc}`);
		for (const duong of tep) {
			soTep += 1;
			const truoc = git("show", `${moc}:${duong}`);
			const dich = join(GOC, duong);
			if (!existsSync(dich)) {
				loi.push(`${duong}: tep bi xoa`);
				continue;
			}
			const { mat, themBoQua } = lech(truoc, readFileSync(dich, "utf8"));
			for (const d of mat) loi.push(`${duong}: mat «${d}»`);
			if (themBoQua > 0)
				loi.push(`${duong}: them ${themBoQua} .skip/.todo/.only`);
		}
	}
	return { loi, soTep };
}

function tuThu() {
	const mau =
		"it('a', () => {\n\texpect(1).toBe(1);\n\texpect(2).toBe(2);\n});\n";
	const xoa = lech(mau, mau.replace("\texpect(2).toBe(2);\n", ""));
	const boQua = lech(mau, mau.replace("it('a'", "it.skip('a'"));
	return xoa.mat.length === 1 && boQua.themBoQua === 1;
}

const doiSo = process.argv.slice(2);
if (doiSo.includes("--tu-thu")) {
	const dat = tuThu();
	console.log(
		dat ? "tu-thu: thuoc bat duoc xoa expect va them skip" : "tu-thu: THUOC MU",
	);
	process.exit(dat ? 0 : 1);
}
const i = doiSo.indexOf("--moc");
const moc = i >= 0 ? doiSo[i + 1] : MOC_MAC_DINH;
const { loi, soTep } = soMoc(moc);
for (const d of loi) console.log(`SAI ${d}`);
console.log(`khong-xoa-expect: ${soTep} tep so voi ${moc}, ${loi.length} loi`);
process.exit(loi.length > 0 || soTep === 0 ? 1 : 0);
