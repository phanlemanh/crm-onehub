import { readFileSync } from "node:fs";

const THANG = new Set(["sm", "md", "lg", "none"]);
const CANH = new Set([
	"t",
	"r",
	"b",
	"l",
	"tl",
	"tr",
	"br",
	"bl",
	"s",
	"e",
	"ss",
	"se",
	"es",
	"ee",
]);
const LOP = /(?<![\w-])rounded(?:-([\w[\]./%-]+))?(?![\w-])/g;

function ngoaiThang(duoi) {
	if (duoi === undefined) return true;
	const phan = duoi.split("-");
	const co =
		CANH.has(phan[0]) && phan.length > 1 ? phan.slice(1).join("-") : duoi;
	if (CANH.has(co)) return true;
	return !THANG.has(co);
}

const tep = process.argv.slice(2);
if (tep.length === 0) {
	console.log("KHONG DO DUOC: khong co tep nao de quet");
	process.exit(2);
}

const sai = [];
for (const t of tep) {
	const dong = readFileSync(t, "utf8").split("\n");
	dong.forEach((chu, i) => {
		for (const m of chu.matchAll(LOP)) {
			if (ngoaiThang(m[1])) sai.push(`${t}:${i + 1}: ${m[0]}`);
		}
	});
}

if (sai.length > 0) {
	console.log(
		`DO: ${sai.length} lop ban kinh ngoai thang sm/md/lg/none cua docs/design.md`,
	);
	for (const s of sai) console.log(`   ${s}`);
	process.exit(1);
}
console.log(
	`XANH: ${tep.length} tep, moi lop ban kinh nam trong thang sm/md/lg/none`,
);
