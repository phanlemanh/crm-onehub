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

const QUAN_HE = [
	'import type { HookEvent } from "eve/hooks";',
	`import type { ActionsRequestedData } from "${LIB}";`,
	"",
	"type Bang<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;",
	"",
	"export const neoVaoEve: Bang<",
	"\tActionsRequestedData,",
	'\tHookEvent<"actions.requested">["data"]',
	"> = true;",
	"",
].join("\n");

const PHAN_VI_DU = [
	'import type { HookEvent } from "eve/hooks";',
	"",
	"type TuVietTay = {",
	"\tactions: readonly { callId: string; kind: string; subagentName?: string }[];",
	"\tsequence: number;",
	"\tstepIndex: number;",
	"\tturnId: string;",
	"};",
	"",
	"type Bang<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;",
	"",
	"export const neoVaoEve: Bang<",
	"\tTuVietTay,",
	'\tHookEvent<"actions.requested">["data"]',
	"> = true;",
	"",
].join("\n");

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
	const quanHe = chayTsc("quan-he", QUAN_HE);
	if (quanHe.ma !== 0) {
		console.log(
			"DO: kieu tham so KHONG tuong duong hai chieu voi type cong khai cua eve — no khong suy tu eve.",
		);
		console.log(quanHe.ra.slice(0, 800));
		ket = 1;
	} else {
		console.log(
			"chieu duong: kieu tham so tuong duong HAI CHIEU voi HookEvent<actions.requested>[data].",
		);
	}

	const phanViDu = chayTsc("phan-vi-du", PHAN_VI_DU);
	if (phanViDu.ma === 0) {
		chet(
			"phep do quan he KHONG co rang: mot kieu KHAI TAY du bon truong cung qua duoc phep tuong duong hai chieu, nen chieu duong khong phan biet duoc neo-vao-eve voi khai-tay",
		);
	}
	if (!/stepIndex|assignable|TuVietTay/.test(phanViDu.ra)) {
		chet(
			`phan vi du do nhung thong diep khong noi ve phep tuong duong:\n${phanViDu.ra.slice(0, 800)}`,
		);
	}
	console.log(
		"chieu am (phan vi du): kieu khai tay du bon truong KHONG qua duoc phep tuong duong hai chieu.",
	);

	const duong = chayTsc("du-truong", DU);
	if (duong.ma !== 0) {
		chet(
			`tien de thieu — file thu DU ca bon truong van khong bien dich duoc:\n${duong.ra.slice(0, 800)}`,
		);
	}
	console.log("tien de: du ca bon truong thi goi ham duoc.");

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
	console.log(
		"\nXANH: kieu tham so TUONG DUONG HAI CHIEU voi type cong khai cua eve, va mot kieu khai tay du bon truong thi khong.",
	);
}
process.exit(ket);
