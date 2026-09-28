import { spawnSync } from "node:child_process";
import {
	appendFileSync,
	cpSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const TEP = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP), "..", "..", "..");
const THU_MUC_AGENT = join(GOC, "apps", "agent", "agent");
const THONG_DIEP = "may soan ghi ban dang dung";
const GHI = new Set([
	"create",
	"createMany",
	"createManyAndReturn",
	"update",
	"updateMany",
	"updateManyAndReturn",
	"upsert",
	"delete",
	"deleteMany",
]);
const DOC = new Set([
	"findUnique",
	"findUniqueOrThrow",
	"findFirst",
	"findFirstOrThrow",
	"findMany",
	"count",
	"aggregate",
	"groupBy",
]);
const SQL_GHI_PHIEN_BAN =
	/\b(INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+"taiLieuPhienBan"/i;
const SQL_GHI_BAN_DANG_DUNG = /\bSET\b[^;]*?(?<![."\w])"banDangDungId"\s*=/is;
const DUYET = /taiLieu\.approve|\bduyetDeXuat\w*\s*\(|\bapproveTaiLieu\w*\s*\(/;

function tepTs(thuMuc) {
	const ra = [];
	for (const ten of readdirSync(thuMuc)) {
		const d = join(thuMuc, ten);
		if (statSync(d).isDirectory()) ra.push(...tepTs(d));
		else if (/\.(ts|tsx|mts)$/.test(ten)) ra.push(d);
	}
	return ra;
}

function dong(nguon, nut) {
	return nguon.getLineAndCharacterOfPosition(nut.getStart(nguon)).line + 1;
}

function trongData(nut) {
	let p = nut.parent;
	while (p) {
		if (
			ts.isPropertyAssignment(p) &&
			ts.isIdentifier(p.name) &&
			p.name.text === "data"
		) {
			return true;
		}
		p = p.parent;
	}
	return false;
}

function quetTep(duong, goc) {
	const chu = readFileSync(duong, "utf8");
	const nguon = ts.createSourceFile(duong, chu, ts.ScriptTarget.Latest, true);
	const ten = relative(goc, duong);
	const loi = [];
	let prisma = 0;
	const tham = (nut) => {
		if (
			ts.isCallExpression(nut) &&
			ts.isPropertyAccessExpression(nut.expression) &&
			ts.isPropertyAccessExpression(nut.expression.expression)
		) {
			const phuongThuc = nut.expression.name.text;
			const bang = nut.expression.expression.name.text;
			if (GHI.has(phuongThuc) || DOC.has(phuongThuc)) prisma += 1;
			if (bang === "taiLieuPhienBan" && GHI.has(phuongThuc)) {
				loi.push(`${THONG_DIEP}: ${ten}:${dong(nguon, nut)}`);
			}
		}
		if (
			(ts.isPropertyAssignment(nut) || ts.isShorthandPropertyAssignment(nut)) &&
			nut.name &&
			ts.isIdentifier(nut.name) &&
			nut.name.text === "banDangDungId" &&
			trongData(nut)
		) {
			loi.push(`${THONG_DIEP}: ${ten}:${dong(nguon, nut)}`);
		}
		if (
			ts.isNoSubstitutionTemplateLiteral(nut) ||
			ts.isTemplateExpression(nut) ||
			ts.isStringLiteral(nut)
		) {
			const t = nut.getText(nguon);
			if (SQL_GHI_PHIEN_BAN.test(t) || SQL_GHI_BAN_DANG_DUNG.test(t)) {
				loi.push(`${THONG_DIEP}: ${ten}:${dong(nguon, nut)}`);
			}
		}
		ts.forEachChild(nut, tham);
	};
	tham(nguon);
	if (DUYET.test(chu)) loi.push(`${THONG_DIEP}: ${ten}: goi duyet`);
	return { loi, prisma };
}

function quet(thuMuc) {
	const tep = tepTs(thuMuc);
	let prisma = 0;
	const loi = [];
	for (const t of tep) {
		const r = quetTep(t, thuMuc);
		prisma += r.prisma;
		loi.push(...r.loi);
	}
	console.log(
		`so tep da quet: ${tep.length} · so loi goi Prisma da xet: ${prisma}`,
	);
	if (tep.length === 0 || prisma === 0) {
		console.log("KHONG DO DUOC: khong quet duoc tep hay loi goi nao");
		return 2;
	}
	for (const l of loi) console.log(l);
	return loi.length === 0 ? 0 : 1;
}

function chieuDo() {
	const tam = mkdtempSync(join(tmpdir(), "msd-duong-ghi-"));
	try {
		const banSao = join(tam, "agent");
		cpSync(THU_MUC_AGENT, banSao, { recursive: true });
		const tepPha = join(
			banSao,
			"subagents",
			"may_soan",
			"tools",
			"nop_ban_de_xuat.ts",
		);
		appendFileSync(
			tepPha,
			"\nvoid db.taiLieuPhienBan.create({ data: {} as never });\n",
		);
		const r = spawnSync(process.execPath, [TEP, "--thu-muc", banSao], {
			encoding: "utf8",
		});
		const ghim = `${THONG_DIEP}: subagents/may_soan/tools/nop_ban_de_xuat.ts:`;
		const bat = r.status === 1 && r.stdout.includes(ghim);
		console.log(
			`chieu do · chen db.taiLieuPhienBan.create( vao tools/ -> exit ${r.status} · ${bat ? ghim : `KHONG BAT (${r.stdout.trim()})`}`,
		);
		return bat;
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
}

const [, , cheDo, duongDan] = process.argv;

if (cheDo === "--thu-muc") process.exit(quet(duongDan));

if (!chieuDo()) {
	console.log("doi chung: SAI — chieu do khong bat");
	process.exit(3);
}
console.log("doi chung: do dung");
process.exit(quet(THU_MUC_AGENT));
