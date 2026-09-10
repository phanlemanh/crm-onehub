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
		ten: "than-hook-rong",
		cam: () =>
			[
				'import { defineHook } from "eve/hooks";',
				"",
				"export default defineHook({",
				"\tevents: {",
				'\t\t"actions.requested"() {',
				"\t\t\treturn;",
				"\t\t},",
				"\t},",
				"});",
				"",
			].join("\n"),
	},
	{
		ten: "bo-record-va-update",
		cam: (nguon) =>
			nguon
				.replace(
					/\t\t\tconst next = recordBuilderDelegation\([\s\S]*?\);\n/,
					"\t\t\tbuilderDelegationState.get();\n",
				)
				.replace(/\t\t\tbuilderDelegationState\.update\(\(\) => next\);\n/, ""),
	},
	{
		ten: "bo-update",
		cam: (nguon) =>
			nguon.replace(/\t\t\tbuilderDelegationState\.update\(\(\) => next\);\n/, ""),
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
			`import {`,
			`\tdatSlot,`,
			`\tduLieu,`,
			`\tgoiBuilder,`,
			`\tgoiKhac,`,
			`\tphien,`,
			`\tsuKien,`,
			`} from "${CHUOI}";`,
			"",
			`const hook = (await import("${duongHook}")).default;`,
			'const handler = hook.events["actions.requested"];',
			"",
			`it("${ten}: chuoi cuong che con song", () => {`,
			"\tconst slot = datSlot();",
			'\thandler(suKien(duLieu("turn-1", 2, 0, goiBuilder("call-a"))), phien());',
			"\texpect(slot.nhatKy.length > 0).toBe(true);",
			'\texpect(slot.doc()).toEqual({ turnId: "turn-1", stepIndex: 2, sequence: 0 });',
			'\thandler(suKien(duLieu("turn-1", 3, 0, goiKhac("call-x"))), phien());',
			'\texpect(slot.doc()).toEqual({ turnId: "turn-1", stepIndex: 2, sequence: 0 });',
			"\texpect(() =>",
			'\t\thandler(suKien(duLieu("turn-1", 4, 0, goiBuilder("call-b"))), phien()),',
			'\t).toThrow("only once");',
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
