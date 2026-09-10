import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DAY = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(DAY, "../../..");
const APP = resolve(GOC, "apps/agent");
const LIB = resolve(APP, "agent/lib/builder-delegation.ts");
const TSC = resolve(APP, "node_modules/.bin/tsc");
const O = resolve(APP, "node_modules/.cache/rang-kieu-theo-eve");

function chet(viSao) {
	console.log(`KHONG DO DUOC: ${viSao}`);
	process.exit(2);
}

function sha() {
	try {
		return execFileSync("git", ["rev-parse", "HEAD"], {
			cwd: GOC,
			encoding: "utf8",
		}).trim();
	} catch {
		return "khong-doc-duoc";
	}
}

if (!LIB.startsWith(`${GOC}/`)) {
	chet("duong dan ma san pham nam ngoai goc suy tu vi tri rang");
}

let nguon;
try {
	nguon = readFileSync(LIB, "utf8");
} catch {
	chet(`khong doc duoc ${LIB}`);
}

console.log(`doc ban ma: ${LIB}`);
console.log(`moc cay: ${sha()}`);

if (/BuilderDelegationAction/.test(nguon)) {
	console.log("DO: ma san pham con khai tay BuilderDelegationAction.");
	process.exit(1);
}

const DU = [
	`import {`,
	`\tEMPTY_BUILDER_DELEGATION,`,
	`\trecordBuilderDelegation,`,
	`} from "${LIB}";`,
	"",
	"export const ra = recordBuilderDelegation(EMPTY_BUILDER_DELEGATION, {",
	"\tactions: [],",
	"\tsequence: 0,",
	"\tstepIndex: 2,",
	'\tturnId: "turn-1",',
	"});",
	"",
].join("\n");

const THIEU = DU.replace("\tstepIndex: 2,\n", "");

function chayTsc(ten, ma) {
	const duong = `${O}/${ten}.ts`;
	writeFileSync(duong, ma);
	try {
		execFileSync(
			TSC,
			[
				"--noEmit",
				"--strict",
				"--skipLibCheck",
				"--module",
				"preserve",
				"--moduleResolution",
				"bundler",
				"--allowImportingTsExtensions",
				"--target",
				"ES2022",
				"--types",
				"node",
				duong,
			],
			{ cwd: APP, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
		);
		return { ma: 0, ra: "" };
	} catch (loi) {
		return { ma: 1, ra: `${loi.stdout ?? ""}${loi.stderr ?? ""}` };
	}
}

let ket = 0;
mkdirSync(O, { recursive: true });
try {
	const duong = chayTsc("du-truong", DU);
	if (duong.ma !== 0) {
		chet(
			`chieu duong da do — file thu DU ca bon truong van khong bien dich duoc:\n${duong.ra.slice(0, 800)}`,
		);
	}
	console.log("chieu duong: du ca bon truong thi bien dich duoc.");

	const thieu = chayTsc("thieu-stepindex", THIEU);
	if (thieu.ma === 0) {
		console.log("DO: thieu stepIndex ma tsc khong do — kieu chua siet theo eve.");
		ket = 1;
	} else if (!/stepIndex/.test(thieu.ra)) {
		chet(
			`tsc do nhung thong diep khong goi ten stepIndex:\n${thieu.ra.slice(0, 800)}`,
		);
	} else {
		console.log("chieu am: thieu stepIndex thi tsc do va goi dung ten truong.");
	}
} finally {
	rmSync(O, { recursive: true, force: true });
}

if (ket === 0) {
	console.log("\nXANH: kieu tham so suy tu type cong khai cua eve.");
}
process.exit(ket);
