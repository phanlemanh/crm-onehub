import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { CA, GOC, SPEC } from "./dao-thu-tu.mjs";

const DUOI = /\.(ts|tsx|mjs|js)$/;
const GOI_DOC = /\.(findFirst|findFirstOrThrow|findMany)\(/g;
const CREATED_AT_DON = /orderBy:\s*\{\s*createdAt\s*:/;
const CO_ORDER_BY = /\borderBy\s*:/;

export const DA_RA = [
	'apps/agent-okr/test/nop-ban-nhap.integration.spec.ts :: findMany({ where: { cuocSoanId: canh.cuocSoanId }, orderBy: { createdAt: "asc" }, })',
	'apps/agent-okr/test/nop-ban-nhap.integration.spec.ts :: findFirstOrThrow({ where: { cuocSoanId: canh.cuocSoanId, loai: "kr-moi", sau: ten, trangThai: "cho", }, orderBy: { createdAt: "desc" }, })',
	'apps/agent-okr/test/nop-ban-nhap.integration.spec.ts :: findMany({ where: { cuocSoanId: cuoc.id, trangThai: { not: "bi-loai" }, }, orderBy: { createdAt: "asc" }, })',
	"packages/auth/test/chia-mat-khau.integration.spec.ts :: findFirst({ where: { identifier: `${PASSWORD.verificationPrefix}${ket.token}` }, })",
	'packages/auth/test/chia-mat-khau.integration.spec.ts :: findFirst({ where: { userId: ket.userId, providerId: "credential" }, select: { password: true }, })',
	"packages/auth/test/chia-mat-khau.integration.spec.ts :: findFirst({ where: { identifier: `${PASSWORD.verificationPrefix}${ket.token}` }, })",
	"packages/auth/test/chia-mat-khau.integration.spec.ts :: findFirst({ where: { identifier: `${PASSWORD.verificationPrefix}${ket.token}` }, })",
	"packages/auth/test/chia-mat-khau.integration.spec.ts :: findFirst({ where: { userId: ket.userId, providerId: GOOGLE_PROVIDER_ID }, select: { id: true }, })",
	"packages/auth/test/cong-vao.integration.spec.ts :: findFirst({ where: { organizationId: WORKSPACE_ID, email: dia }, select: { status: true }, })",
	"packages/auth/test/quen-mat-khau.integration.spec.ts :: findFirst({ where: { identifier: `${PASSWORD.verificationPrefix}${chiaTuThu(daGui[0])}`, }, })",
	"packages/auth/test/quen-mat-khau.integration.spec.ts :: findFirst({ where: { identifier: `${PASSWORD.verificationPrefix}${c1}` }, })",
];

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

function thamSo(src, mo) {
	let sau = 0;
	for (let i = mo; i < src.length; i++) {
		if (src[i] === "(") sau += 1;
		else if (src[i] === ")") {
			sau -= 1;
			if (sau === 0) return src.slice(mo + 1, i);
		}
	}
	return null;
}

export function choTrongTep(ten, src) {
	const ra = [];
	for (const m of src.matchAll(GOI_DOC)) {
		const ts = thamSo(src, m.index + m[0].length - 1);
		if (ts === null) continue;
		const laTim = m[1] !== "findMany";
		if (!CREATED_AT_DON.test(ts) && !(laTim && !CO_ORDER_BY.test(ts))) continue;
		ra.push(`${ten} :: ${m[1]}(${ts.replace(/\s+/g, " ").trim()})`);
	}
	return ra;
}

export function quet(docTep) {
	const cho = [];
	let soTep = 0;
	for (const goc of cay())
		for (const p of tep(goc)) {
			soTep += 1;
			cho.push(...choTrongTep(relative(GOC, p), docTep(p)));
		}
	return { cho, soTep };
}

export function lech(cho) {
	const con = [...DA_RA];
	const moi = [];
	for (const c of cho) {
		const i = con.indexOf(c);
		if (i >= 0) con.splice(i, 1);
		else moi.push(c);
	}
	return { moi, vang: con };
}

function ket(ma, dong) {
	for (const d of dong) console.log(d);
	process.exit(ma);
}

function chinh() {
	const that = quet((p) => readFileSync(p, "utf8"));
	if (that.soTep === 0) ket(2, ["KHONG DO DUOC: khong quet duoc tep nao"]);
	const goc = readFileSync(SPEC, "utf8");
	let pha = goc;
	for (const ten of ["nhan", "bac"]) {
		if (pha.split(CA[ten].moi).length !== 2)
			ket(2, [`KHONG DO DUOC: bo chon moi cua ca ${ten} khong co dung mot lan trong spec`]);
		pha = pha.replace(CA[ten].moi, CA[ten].cu);
	}
	const lechThat = lech(that.cho);
	const lechPha = lech(quet((p) => (p === SPEC ? pha : readFileSync(p, "utf8"))).cho);
	const dong = [
		`quet ${that.soTep} tep trong apps/agent-okr/test va packages/*/test`,
		`cay that: ${that.cho.length} cho, danh sach da ra: ${DA_RA.length} cho`,
		`chieu do (tra bo chon cu cua nhan va bac trong bo nho): ${lechPha.moi.length} cho chua ra`,
	];
	if (lechPha.moi.length !== 2 || lechPha.vang.length !== 0)
		ket(1, [
			...dong,
			`chieu do KHONG an: can dung 2 cho chua ra, thay ${lechPha.moi.length} (vang ${lechPha.vang.length})`,
			...lechPha.moi.map((c) => `  chua ra: ${c}`),
		]);
	if (lechThat.moi.length > 0 || lechThat.vang.length > 0)
		ket(1, [
			...dong,
			"cay that lech danh sach da ra:",
			...lechThat.moi.map((c) => `  chua ra: ${c}`),
			...lechThat.vang.map((c) => `  vang: ${c}`),
		]);
	ket(0, [...dong, "cay that khop tung cho voi danh sach da ra"]);
}

if (import.meta.main) chinh();
