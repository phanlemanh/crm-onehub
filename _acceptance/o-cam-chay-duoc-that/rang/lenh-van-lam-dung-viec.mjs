import { execFileSync, spawnSync } from "node:child_process";
import {
	bam,
	docConfig,
	GOC,
	ketThuc,
	NEO,
	napHamKit,
	PHAI_SUA,
	SHA_GHIM,
} from "./chung.mjs";

const bamDau = bam(docConfig());
const chu = docConfig();
const { giai } = napHamKit();

if (PHAI_SUA.length !== NEO.phaiSua) {
	console.error(
		`MA 2: danh sach ghim co ${PHAI_SUA.length} o cam, neo la ${NEO.phaiSua}`,
	);
	ketThuc(bamDau, 2);
}

const cu = execFileSync(
	"git",
	["show", `${SHA_GHIM}:_acceptance/config.yaml`],
	{
		cwd: GOC,
		encoding: "utf8",
		maxBuffer: 32 * 1024 * 1024,
	},
);

function yDinhTacGia(ten) {
	const khuon = new RegExp(`^ {4}${ten}:\\s(.*)$`, "m");
	const m = cu.match(khuon);
	return m ? m[1].trim() : undefined;
}

const veDuongChay = (lenh) =>
	lenh.replaceAll(
		"_acceptance/tiep-thi-tuyen-doi-tac/evidence/",
		".acceptance-runs/tiep-thi-tuyen-doi-tac/",
	);

const chay = (lenh) =>
	spawnSync("bash", ["-c", lenh], {
		cwd: GOC,
		encoding: "utf8",
		timeout: 900000,
	}).status;

const lech = [];
for (const k of PHAI_SUA) {
	const ten = k.split(".").at(-1);
	const yDinh = yDinhTacGia(ten);
	if (yDinh === undefined) {
		console.error(
			`MA 2: khong doc duoc y dinh tac gia cua ${ten} tai sha ghim`,
		);
		ketThuc(bamDau, 2);
	}
	const nay = giai(chu, k);
	if (!nay) {
		console.error(`MA 2: khong giai duoc ${k} o HEAD`);
		ketThuc(bamDau, 2);
	}
	const maCu = chay(veDuongChay(yDinh));
	const maMoi = chay(nay);
	console.log(
		`  ${maCu === maMoi ? "ok " : "DO "} ${k.replace("executors.", "")} · y dinh ma ${maCu} · nay ma ${maMoi}`,
	);
	if (maCu !== maMoi) lech.push({ k, maCu, maMoi, yDinh, nay });
}

if (lech.length > 0) {
	console.error(
		`DO: ${lech.length} o cam doi HANH VI, khong chi doi cach viet:`,
	);
	for (const l of lech) {
		console.error(
			`  ${l.k} · y dinh tac gia ma ${l.maCu} · sau vong ma ${l.maMoi}`,
		);
		console.error(`     y dinh: ${l.yDinh.slice(0, 120)}`);
		console.error(`     nay   : ${l.nay.slice(0, 120)}`);
	}
	ketThuc(bamDau, 1);
}

console.log(
	`XANH: ca ${PHAI_SUA.length} o cam cho CUNG mot ma thoat voi y dinh tac gia tai sha ghim — sua cach viet, khong doi viec lenh lam.`,
);
ketThuc(bamDau, 0);
