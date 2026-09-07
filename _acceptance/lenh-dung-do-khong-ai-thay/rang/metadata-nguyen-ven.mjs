import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SHA = "3c97e759a6c87bc8b6f0621d3854cb486728b442";
const NEO = 22;

const git = (doi) =>
	execFileSync("git", doi, { cwd: GOC, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

const taiSha = git([
	"grep",
	"-l",
	"generateMetadata",
	SHA,
	"--",
	"apps/app/app",
])
	.split("\n")
	.filter(Boolean)
	.map((d) => d.slice(SHA.length + 1));

if (taiSha.length !== NEO) {
	console.error(
		`MA 2: tai sha ghim co ${taiSha.length} file mang generateMetadata, neo la ${NEO}`,
	);
	process.exit(2);
}

function thanMetadata(chu, ten) {
	const nguon = ts.createSourceFile(ten, chu, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	let than;
	const di = (nut) => {
		if (ts.isFunctionDeclaration(nut) && nut.name?.text === "generateMetadata")
			than = nut.body ? nut.body.getText(nguon) : "";
		ts.forEachChild(nut, di);
	};
	di(nguon);
	return than;
}

const chuanHoa = (s) => s.replace(/\s+/g, " ").trim();

const lech = [];
let conNguyen = 0;
for (const duong of taiSha) {
	const cu = thanMetadata(git(["show", `${SHA}:${duong}`]), duong);
	let moi;
	try {
		moi = thanMetadata(readFileSync(resolve(GOC, duong), "utf8"), duong);
	} catch {
		lech.push(`${duong} — file khong con tren dia`);
		continue;
	}
	if (cu === undefined || moi === undefined) {
		lech.push(`${duong} — mot ben khong con ham generateMetadata`);
		continue;
	}
	if (chuanHoa(cu) === chuanHoa(moi)) conNguyen += 1;
	else lech.push(`${duong} — than generateMetadata da doi`);
}

console.log(`generateMetadata nguyen ven: ${conNguyen}/${NEO}`);

if (lech.length > 0) {
	console.error("DO: than generateMetadata bi dung:");
	for (const d of lech) console.error(`  ${d}`);
	process.exit(1);
}

console.log("XANH: khong than generateMetadata nao doi mot ky tu so voi sha ghim.");
