import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DAY = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(DAY, "../../..");
const APP = resolve(GOC, "apps/agent");
const LIB = resolve(APP, "agent/lib");
const HOOK = resolve(APP, "agent/hooks/builder-delegation.ts");
const CHUOI = resolve(APP, "test/tran-uy-thac/chuoi-cuong-che.ts");
const O = resolve(APP, "node_modules/.cache/rang-hook-chet");

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

const HINH_DANG = [
	{
		ten: "bo-than-hook",
		cam: (nguon) =>
			nguon.replaceAll(
				/\t\t\tconst next = \w+\([\s\S]*?\);\n\t\t\tbuilderDelegationState\.update\(\(\) => next\);\n/g,
				"",
			),
	},
	{
		ten: "bo-record-va-update",
		cam: (nguon) =>
			nguon
				.replace(
					/const next = recordBuilderDelegation\([\s\S]*?\);/,
					"const next = builderDelegationState.get();",
				)
				.replace(
					/\t\t\tbuilderDelegationState\.update\(\(\) => next\);\n\t\t\},\n\t\t"step\.started"/,
					'\t\t},\n\t\t"step.started"',
				),
	},
	{
		ten: "bo-update",
		cam: (nguon) =>
			nguon.replaceAll(
				/\t\t\tbuilderDelegationState\.update\(\(\) => next\);\n/g,
				"",
			),
	},
];

if (!HOOK.startsWith(`${GOC}/`)) {
	chet("duong dan hook nam ngoai goc suy tu vi tri rang");
}

let nguon;
try {
	nguon = readFileSync(HOOK, "utf8");
} catch {
	chet(`khong doc duoc ban ma cua hook tai ${HOOK}`);
}

console.log(`doc ban ma: ${HOOK}`);
console.log(`moc cay: ${sha()}`);

function chayBoDo(duongSpec) {
	const tuongDoi = `./${duongSpec.slice(APP.length + 1)}`;
	try {
		const ra = execFileSync("bun", ["test", tuongDoi], {
			cwd: APP,
			encoding: "utf8",
			env: { ...process.env, CRM_TELEMETRY_DISABLED: "1" },
			stdio: ["ignore", "pipe", "pipe"],
		});
		return { ma: 0, ra };
	} catch (loi) {
		const ra = `${loi.stdout ?? ""}${loi.stderr ?? ""}`;
		if (/did not match any test files/.test(ra)) return { ma: 2, ra };
		if (/Cannot find module|Failed to resolve|error: Cannot find/.test(ra)) {
			return { ma: 2, ra };
		}
		if (/\d+ fail/.test(ra)) return { ma: 1, ra };
		return { ma: 2, ra };
	}
}

function vietSpec(ten, duongHook) {
	const duong = `${O}/${ten}.spec.ts`;
	writeFileSync(
		duong,
		[
			'import { expect, it } from "bun:test";',
			"import {",
			"\tCHUOI_SONG,",
			"\tkiemChuoiCuongChe,",
			"\tlayHookTu,",
			`} from "${CHUOI}";`,
			"",
			`it("${ten}: chuoi cuong che con song", async () => {`,
			`\texpect(kiemChuoiCuongChe(await layHookTu("${duongHook}"))).toEqual(`,
			"\t\tCHUOI_SONG,",
			"\t);",
			"});",
			"",
		].join("\n"),
	);
	return duong;
}

const khongBat = [];
let ma = 0;

mkdirSync(O, { recursive: true });
try {
	const nen = chayBoDo(vietSpec("cay-lanh", HOOK));
	if (nen.ma !== 0) {
		chet(
			`tren cay LANH bo do chuoi cuong che da khong xanh (ma ${nen.ma}) — mot chieu xanh gay lam moi chieu do vo nghia`,
		);
	}
	console.log("chieu xanh: bo do chuoi cuong che xanh tren cay lanh.");

	for (const hinhDang of HINH_DANG) {
		const banDotBien = hinhDang.cam(nguon);
		if (banDotBien === nguon) {
			chet(
				`phep bien doi van ban cua hinh dang ${hinhDang.ten} khong cam duoc vao ma — ma da doi`,
			);
		}
		const duongDotBien = `${O}/${hinhDang.ten}.hook.ts`;
		writeFileSync(
			duongDotBien,
			banDotBien.replaceAll('from "../lib/', `from "${LIB}/`),
		);
		const ket = chayBoDo(vietSpec(hinhDang.ten, duongDotBien));
		if (ket.ma === 2) {
			chet(
				`hinh dang ${hinhDang.ten}: ban dot bien khong nap duoc hoac bo do khong chay duoc`,
			);
		}
		if (ket.ma === 0) {
			khongBat.push(hinhDang.ten);
			console.log(`DO: hinh dang ${hinhDang.ten} KHONG bi bo do bat.`);
		} else {
			console.log(`hinh dang ${hinhDang.ten} -> bi bat.`);
		}
	}
} finally {
	rmSync(O, { recursive: true, force: true });
}

if (khongBat.length > 0) {
	console.log(
		`\nDO: ${khongBat.length}/${HINH_DANG.length} hinh dang khong bi bat: ${khongBat.join(" · ")}`,
	);
	ma = 1;
} else {
	console.log(`\nXANH: ca ${HINH_DANG.length} hinh dang deu bi bo do bat.`);
}
process.exit(ma);
