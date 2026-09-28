import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
	docTep,
	GOC_KHO,
	khongDo,
	NUT_KHOA,
	TEN_CU,
	THUOC,
	tenKhoa,
} from "./khoa-nguon.mjs";

const TEP = fileURLToPath(import.meta.url);
const MOT_LUOT = "_acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh";
const SAO = ".acceptance-runs/man-chu-theo-khoa-kho-nguon/sao/man-chu.mjs";
const LIB = "../../kho-tai-lieu/rang/man-lib.mjs";
const DAT = /buoc \d: dat/;

function chay(lenh, env) {
	return new Promise((xong) => {
		let ra = "";
		const con = spawn(lenh[0], lenh.slice(1), {
			cwd: GOC_KHO,
			env,
			stdio: ["ignore", "pipe", "pipe"],
		});
		const ghi = (b) => {
			ra += b.toString();
			process.stdout.write(b);
		};
		con.stdout.on("data", ghi);
		con.stderr.on("data", ghi);
		con.on("error", () => xong({ ma: 2, ra }));
		con.on("exit", (m) => xong({ ma: m ?? 2, ra }));
	});
}

async function kiem(tep) {
	const ten = tenKhoa(GOC_KHO);
	const { ma, ra } = await chay(["bash", MOT_LUOT, `bun ${tep}`], {
		...process.env,
		[ten]: "",
	});
	if (!ra.includes(NUT_KHOA)) {
		console.log(`khoa rong lech: khong toi duoc nut (ma ${ma})`);
		return 1;
	}
	const loi = [];
	if (ma !== 2) loi.push(`ma thoat ${ma}, can 2`);
	if (!ra.includes(`${NUT_KHOA} ${ten}`))
		loi.push(`thong diep nut khoa khong goi ten ${ten}`);
	if (DAT.test(ra)) loi.push("co dong dat khi thieu khoa");
	if (loi.length > 0) {
		console.log(`khoa rong lech: ${loi.join(" · ")}`);
		return 1;
	}
	console.log(`khoa rong: dung ghim — ma 2, goi ten ${ten}`);
	return 0;
}

async function chieuDo() {
	const ten = tenKhoa(GOC_KHO);
	const goc = docTep(GOC_KHO, THUOC);
	const sao = goc
		.replace(
			`"${LIB}"`,
			`"${pathToFileURL(join(GOC_KHO, THUOC, "..", LIB)).href}"`,
		)
		.replace(`${NUT_KHOA} ${ten}`, `${NUT_KHOA} ${TEN_CU}`);
	if (sao === goc || sao.includes(`${NUT_KHOA} ${ten}`))
		khongDo(`vet khong cam duoc vao ban sao ${THUOC}`);
	mkdirSync(join(GOC_KHO, dirname(SAO)), { recursive: true });
	writeFileSync(join(GOC_KHO, SAO), sao);
	const { ma, ra } = await chay(
		[process.execPath, TEP, "--tep", SAO],
		process.env,
	);
	const ghim = `khoa rong lech: thong diep nut khoa khong goi ten ${ten}`;
	const trung = ma === 1 && ra.includes(ghim);
	console.log(
		`chieu do: ${trung ? `DO DUNG GHIM: ma 1, in «${ghim}»` : `LOT: ma ${ma}`}`,
	);
	return trung ? 0 : 1;
}

const [, , cheDo, duongDan] = process.argv;
if (cheDo === "--chieu-do") process.exit(await chieuDo());
process.exit(
	await kiem(
		cheDo === "--tep" ? relative(GOC_KHO, join(GOC_KHO, duongDan)) : THUOC,
	),
);
