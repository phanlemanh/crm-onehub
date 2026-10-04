import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { BO_CHON_CREATED_AT, BO_CHON_KHOA, GOC, SPEC } from "./dao-thu-tu.mjs";

const MAU = /orderBy:\s*\{\s*createdAt\s*:/g;
const DUOI = /\.(ts|tsx|mjs|js)$/;
const SO_CHO_SAU_SUA = 3;

function cay() {
	const goi = join(GOC, "packages");
	const ra = [join(GOC, "apps", "agent-okr", "test")];
	for (const g of readdirSync(goi)) {
		const t = join(goi, g, "test");
		if (existsSync(t)) ra.push(t);
	}
	return ra;
}

function tep(thuMuc) {
	const ra = [];
	for (const muc of readdirSync(thuMuc, { withFileTypes: true })) {
		if (muc.name === "node_modules") continue;
		const p = join(thuMuc, muc.name);
		if (muc.isDirectory()) ra.push(...tep(p));
		else if (DUOI.test(muc.name)) ra.push(p);
	}
	return ra;
}

export function quet(docTep) {
	const cho = [];
	let soTep = 0;
	for (const goc of cay())
		for (const p of tep(goc)) {
			soTep += 1;
			const src = docTep(p);
			for (const m of src.matchAll(MAU)) {
				const dong = src.slice(0, m.index).split("\n").length;
				cho.push(`${relative(GOC, p)}:${dong}`);
			}
		}
	return { cho, soTep };
}

function dung(cho) {
	const tepSpec = relative(GOC, SPEC);
	return (
		cho.length === SO_CHO_SAU_SUA &&
		cho.every((c) => c.startsWith(`${tepSpec}:`))
	);
}

function ket(ma, dong) {
	for (const d of dong) console.log(d);
	process.exit(ma);
}

function chinh() {
	const that = quet((p) => readFileSync(p, "utf8"));
	if (that.soTep === 0) ket(2, ["KHONG DO DUOC: khong quet duoc tep nao"]);
	const goc = readFileSync(SPEC, "utf8");
	if (goc.split(BO_CHON_KHOA).length !== 2)
		ket(2, ["KHONG DO DUOC: khoi bo chon theo khoa khong co dung mot lan trong spec"]);
	const pha = quet((p) =>
		p === SPEC
			? goc.replace(BO_CHON_KHOA, BO_CHON_CREATED_AT)
			: readFileSync(p, "utf8"),
	);
	const dong = [
		`quet ${that.soTep} tep trong apps/agent-okr/test va packages/*/test`,
		`cay that: ${that.cho.length} cho — ${that.cho.join(", ")}`,
		`chieu do (bo chon cu trong bo nho): ${pha.cho.length} cho`,
	];
	if (pha.cho.length !== SO_CHO_SAU_SUA + 1)
		ket(1, [
			...dong,
			`chieu do KHONG an: can ${SO_CHO_SAU_SUA + 1} cho khi tra bo chon cu, dem ${pha.cho.length}`,
		]);
	if (!dung(that.cho))
		ket(1, [
			...dong,
			`cay that lech: can dung ${SO_CHO_SAU_SUA} cho, cung o ${relative(GOC, SPEC)}`,
		]);
	ket(0, dong);
}

if (import.meta.main) chinh();
