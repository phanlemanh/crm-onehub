import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
	bam,
	docConfig,
	GOC,
	ketThuc,
	NEO,
	napHamKit,
	PHAI_SUA,
} from "./chung.mjs";

const bamDau = bam(docConfig());
const chu = docConfig();
const { giai } = napHamKit();

const goc = join(GOC, "_acceptance");
const file = [];
for (const ten of readdirSync(goc)) {
	const d = join(goc, ten);
	let con;
	try {
		con = readdirSync(d);
	} catch {
		continue;
	}
	for (const f of con)
		if (/^evidence-report.*\.md$/.test(f)) file.push(join(d, f));
}

const khoa = new Set();
for (const f of file)
	for (const m of readFileSync(f, "utf8").matchAll(/verifier:\s*config:(\S+)/g))
		khoa.add(m[1]);

console.log(
	`file evidence-report: ${file.length} (neo >= ${NEO.fileBaoCao}) · khoa verifier distinct: ${khoa.size} (neo >= ${NEO.khoaVerifier})`,
);

if (file.length < NEO.fileBaoCao || khoa.size < NEO.khoaVerifier) {
	console.error(
		"MA 2: thap hon neo — mot khuon rut bo sot vai dong van cho 'lon hon 0' va van xanh, nen san dan so phai la so ghim",
	);
	ketThuc(bamDau, 2);
}

const thieuCuaVong = PHAI_SUA.filter((k) => !khoa.has(k));
if (thieuCuaVong.length > 0) {
	console.error(
		"MA 2: co khoa vong nay sua ma KHONG xuat hien trong tap rut duoc:",
	);
	for (const k of thieuCuaVong) console.error(`  ${k}`);
	ketThuc(bamDau, 2);
}

const hong = [...khoa].filter((k) => !giai(chu, k));
console.log(`khoa khong giai duoc: ${hong.length}`);

if (hong.length > 0) {
	console.error("DO: co dong verifier tro toi o cam khong giai duoc:");
	for (const k of hong) {
		const o = file.filter((f) =>
			readFileSync(f, "utf8").includes(`config:${k}`),
		);
		console.error(
			`  ${k} · trong ${o.map((x) => x.split("/").at(-2)).join(", ")}`,
		);
	}
	ketThuc(bamDau, 1);
}

console.log(
	`XANH: ca ${khoa.size} khoa verifier tren ${file.length} bao cao deu giai duoc, va ca ${PHAI_SUA.length} khoa vong nay sua deu co mat.`,
);
ketThuc(bamDau, 0);
