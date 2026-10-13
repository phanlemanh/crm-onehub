#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const ts = createRequire(join(GOC, "apps/app/package.json"))("typescript");
const SHA_GOC = "3a2783409";
const THU_MUC = "apps/app";
const BO_QUA = ["apps/app/test/", "apps/app/node_modules/", "apps/app/.next/"];
const KHUNG = new Set(["Empty", "Alert"]);
const NUT = new Set(["Button", "KaraRetry"]);
const PROP_THU_LAI = /\b(refetch|thuLai|onThuLai|onRetry)\b/;
const DA_DOI = [
	"apps/app/app/(app)/[slug]/onboarding/danh-muc-table.tsx",
	"apps/app/app/(app)/[slug]/okr/toan-canh/toan-canh.tsx",
	"apps/app/app/(app)/[slug]/tai-lieu/loi-tai.tsx",
	"apps/app/app/(app)/[slug]/okr/trang-thai-okr.tsx",
];

function tenThe(n) {
	const the = ts.isJsxElement(n) ? n.openingElement : n;
	return the.tagName.getText();
}

function laPhanTu(n) {
	return ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n);
}

function coNutThuLai(goc) {
	let thay = false;
	const di = (n) => {
		if (thay) return;
		if (laPhanTu(n) && NUT.has(tenThe(n))) {
			const the = ts.isJsxElement(n) ? n.openingElement : n;
			for (const a of the.attributes.properties) {
				if (
					ts.isJsxAttribute(a) &&
					a.name.getText() === "onClick" &&
					a.initializer &&
					PROP_THU_LAI.test(a.initializer.getText())
				) {
					thay = true;
				}
			}
		}
		ts.forEachChild(n, di);
	};
	di(goc);
	return thay;
}

export function demTrongTep(tep, nguon) {
	const sf = ts.createSourceFile(
		tep,
		nguon,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
	const ra = [];
	const di = (n) => {
		if (laPhanTu(n) && KHUNG.has(tenThe(n)) && coNutThuLai(n)) {
			ra.push(`${tep}:${sf.getLineAndCharacterOfPosition(n.getStart()).line + 1}`);
			return;
		}
		ts.forEachChild(n, di);
	};
	di(sf);
	return ra;
}

function tepTrenDia(goc) {
	const ra = [];
	const di = (tuongDoi) => {
		for (const ten of readdirSync(join(goc, tuongDoi))) {
			const con = `${tuongDoi}/${ten}`;
			if (BO_QUA.some((b) => `${con}/`.startsWith(b))) continue;
			if (statSync(join(goc, con)).isDirectory()) di(con);
			else if (ten.endsWith(".tsx")) ra.push(con);
		}
	};
	di(THU_MUC);
	return ra.sort();
}

export function demTren(tep, doc) {
	return tep.flatMap((t) => {
		const nguon = doc(t);
		return nguon === null ? [] : demTrongTep(t, nguon);
	});
}

function docDia(t) {
	return readFileSync(join(GOC, t), "utf8");
}

function docGoc(t) {
	try {
		return execFileSync("git", ["-C", GOC, "show", `${SHA_GOC}:${t}`], {
			encoding: "utf8",
			maxBuffer: 64 * 1024 * 1024,
		});
	} catch {
		return null;
	}
}

function tepGoc() {
	return execFileSync(
		"git",
		["-C", GOC, "ls-tree", "-r", "--name-only", SHA_GOC, THU_MUC],
		{ encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
	)
		.split("\n")
		.filter(
			(t) => t.endsWith(".tsx") && !BO_QUA.some((b) => t.startsWith(b)),
		);
}

function inRa(ds) {
	process.stdout.write(`khung lỗi tự dựng còn: ${ds.length}\n`);
	for (const d of ds) process.stdout.write(`${d}\n`);
}

function tuKiem() {
	const loi = [];
	const goc = demTren(tepGoc(), docGoc);
	const tepHead = tepTrenDia(GOC);
	const head = demTren(tepHead, docDia);
	for (const t of DA_DOI) {
		if (!goc.some((d) => d.startsWith(`${t}:`))) {
			loi.push(`kmc-dem: goc khong dem ${t}`);
		}
		const conLai = head.filter((d) => d.startsWith(`${t}:`));
		if (conLai.length > 0) loi.push(`kmc-dem: HEAD con ${conLai.join(", ")}`);
	}
	const loiTai = "apps/app/app/(app)/[slug]/tai-lieu/loi-tai.tsx";
	const gocLoiTai = docGoc(loiTai);
	const pha = demTren(tepHead, (t) => (t === loiTai ? gocLoiTai : docDia(t)));
	if (
		pha.length !== head.length + 1 ||
		!pha.some((d) => d.startsWith(`${loiTai}:`))
	) {
		loi.push("kmc-dem: loi-tai.tsx khong duoc dem");
	}
	process.stdout.write(
		`tu-kiem: goc ${goc.length} · HEAD ${head.length} · pha-thu ${pha.length}\n`,
	);
	for (const l of loi) process.stdout.write(`${l}\n`);
	return loi.length === 0 ? 0 : 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	if (process.argv.includes("--tu-kiem")) process.exit(tuKiem());
	inRa(demTren(tepTrenDia(GOC), docDia));
}
