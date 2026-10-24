import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "../../..");
const TEP = process.env.TEP ?? "apps/app/test/onboarding-gate.spec.ts";
const NEO = process.env.NEO ?? "c895e5bff88f9b1f6a13ffc5885c37fe0b6d7ec8";
const MO_KHOI = /^(\s*)(it|test)(\.\w+)?\(/;

function ket(ma, dong) {
	for (const d of dong) console.log(d);
	console.log(`KET LUAN: ${dong.filter((d) => d.startsWith("DUNG")).length} DUNG, ${dong.filter((d) => d.startsWith("SAI")).length} SAI — ma thoat ${ma}`);
	process.exit(ma);
}

function catKhoi(noiDung) {
	const dong = noiDung.split("\n");
	const khoi = [];
	for (let i = 0; i < dong.length; i += 1) {
		const mo = MO_KHOI.exec(dong[i]);
		if (!mo) continue;
		const dong_dong = `${mo[1]}});`;
		let j = i;
		while (j < dong.length && dong[j] !== dong_dong) j += 1;
		if (j === dong.length) return { loi: `khoi mo o dong ${i + 1} khong dong` };
		khoi.push(dong.slice(i, j + 1).join("\n"));
		i = j;
	}
	return { khoi };
}

try {
	execFileSync("git", ["cat-file", "-e", `${NEO}^{commit}`], { cwd: GOC, stdio: "ignore" });
} catch {
	ket(2, [`KHONG DO DUOC: sha neo ${NEO} khong co trong kho`]);
}

let cu;
try {
	cu = execFileSync("git", ["show", `${NEO}:${TEP}`], {
		cwd: GOC,
		encoding: "utf8",
	});
} catch (loi) {
	ket(2, [`KHONG DO DUOC: git show ${NEO}:${TEP} loi — ${String(loi?.message ?? loi).split("\n")[0]}`]);
}
const moi = readFileSync(join(GOC, TEP), "utf8");

const tachCu = catKhoi(cu);
if (tachCu.loi) ket(2, [`KHONG DO DUOC: tep goc — ${tachCu.loi}`]);
const soMoCu = cu.split("\n").filter((d) => MO_KHOI.test(d)).length;
if (tachCu.khoi.length !== soMoCu || soMoCu === 0)
	ket(2, [`KHONG DO DUOC: cat duoc ${tachCu.khoi.length} khoi nhung tep goc co ${soMoCu} dong mo khoi`]);

const dong = [];
for (const khoi of tachCu.khoi) {
	const ten = khoi.split("\n")[0].trim().slice(0, 90);
	dong.push(`${moi.includes(khoi) ? "DUNG" : "SAI"} khoi cu con nguyen: ${ten}`);
}
const sai = dong.filter((d) => d.startsWith("SAI")).length;
dong.push(`${sai === 0 ? "DUNG" : "SAI"} so khoi cu ${tachCu.khoi.length}, con nguyen ${tachCu.khoi.length - sai}`);
ket(sai === 0 ? 0 : 1, dong);
