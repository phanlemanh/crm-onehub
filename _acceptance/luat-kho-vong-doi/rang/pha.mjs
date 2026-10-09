import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	cpSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const THUOC = join(GOC, "scripts", "luat-kho", "do-cay.mjs");
const SCHEMA = "packages/db/prisma/schema.prisma";
const DV_AGENT = "apps/api/src/agent/agent-definitions.service.ts";
const DONG_AGENT = "const rows = await this.db.agentDefinition.findMany({";
const THU = "apps/api/src/__lkv__/thu.service.ts";

function bamCay() {
	return createHash("sha256")
		.update(
			execFileSync(
				"git",
				["-C", GOC, "status", "--porcelain", "--untracked-files=all"],
				{ encoding: "utf8" },
			),
		)
		.digest("hex");
}

function dungBanSao() {
	const tam = mkdtempSync(join(tmpdir(), "lkv-pha-"));
	execFileSync(
		"bash",
		[
			"-c",
			'set -o pipefail; git -C "$1" archive HEAD -- apps packages .oxlintrc.json | tar -x -C "$2"',
			"lkv",
			GOC,
			tam,
		],
		{ stdio: ["ignore", "ignore", "pipe"] },
	);
	return tam;
}

function chay(goc, { duLuat = false, thuoc = THUOC } = {}) {
	const r = spawnSync(
		process.execPath,
		[thuoc, "--chi-do", goc, ...(duLuat ? ["--du-luat"] : [])],
		{ encoding: "utf8" },
	);
	return { ma: r.status, dong: (r.stdout ?? "").split("\n") };
}

function voiTep(goc, tep, chu, viec) {
	const duong = join(goc, tep);
	const cu = existsSync(duong) ? readFileSync(duong, "utf8") : null;
	mkdirSync(dirname(duong), { recursive: true });
	if (chu === null) rmSync(duong, { recursive: true, force: true });
	else writeFileSync(duong, chu);
	try {
		return viec();
	} finally {
		if (cu === null) rmSync(duong, { recursive: true, force: true });
		else writeFileSync(duong, cu);
	}
}

const lop = (than) =>
	`export class Thu {\n\tconstructor(private readonly db: never) {}\n${than}}\n`;

const DO = (tep) => (d) => d.startsWith(`DO vong-doi: ${tep}`);
const loi = [];
let soO = 0;

function o(ten, fn) {
	soO += 1;
	try {
		fn();
		console.log(`o ${ten}: dat`);
	} catch (e) {
		loi.push(`o ${ten}: ${e.message}`);
		console.log(`o ${ten}: HONG — ${e.message}`);
	}
}

function canDong(kq, mau, ghim) {
	const d = kq.dong.find((x) => x.includes(mau));
	if (!d) throw new Error(`thieu dong «${mau}» (${ghim}); ma ${kq.ma}`);
	return d;
}

function khongDo(kq, tep, ghim) {
	const d = kq.dong.find(DO(tep));
	if (d) throw new Error(`do gia «${d}» (${ghim})`);
}

const bat = mkdtempSync(join(tmpdir(), "lkv-bat-"));
const truoc = bamCay();
const sao = dungBanSao();
try {
	const schemaGoc = readFileSync(join(sao, SCHEMA), "utf8");
	const themModel = (ten, cot) =>
		`${schemaGoc}\nmodel ${ten} {\n  id String @id\n${cot.map((c) => `  ${c} DateTime?\n`).join("")}}\n`;
	const dongModel = schemaGoc.split("\n").length + 1;

	o("(c1) hai cot cat do, mot cot xanh", () => {
		voiTep(
			sao,
			SCHEMA,
			themModel("LkvHaiCot", ["archivedAt", "deletedAt"]),
			() => {
				const kq = chay(sao);
				canDong(
					kq,
					`DO vong-doi: ${SCHEMA}:${dongModel} mo hinh LkvHaiCot co hai cach cat`,
					"c1 do",
				);
			},
		);
		voiTep(sao, SCHEMA, themModel("LkvMotCot", ["archivedAt"]), () =>
			khongDo(chay(sao), SCHEMA, "c1 doi chung"),
		);
	});

	const listKhongLoc = lop(
		"\tasync listX() {\n\t\treturn this.db.company.findMany({ where: {} });\n\t}\n",
	);
	o("(b1) list khong loc do, archivedFilter xanh", () => {
		voiTep(sao, THU, listKhongLoc, () =>
			canDong(
				chay(sao),
				`DO vong-doi: ${THU}:4 list lan ban da cat: company`,
				"b1 do",
			),
		);
		voiTep(
			sao,
			THU,
			lop(
				"\tasync listX() {\n\t\treturn this.db.company.findMany({ where: archivedFilter(false) });\n\t}\n",
			),
			() => khongDo(chay(sao), THU, "b1 doi chung"),
		);
	});

	o("(b2) loc qua ham phu xanh, ham phu khong loc do", () => {
		voiTep(
			sao,
			THU,
			lop(
				"\tasync listX() {\n\t\treturn this.db.company.findMany({ where: this.buildWhereX() });\n\t}\n\tbuildWhereX() {\n\t\treturn archivedFilter(false);\n\t}\n",
			),
			() => khongDo(chay(sao), THU, "b2 xanh"),
		);
		voiTep(
			sao,
			THU,
			lop(
				"\tasync listX() {\n\t\treturn this.db.company.findMany({ where: this.buildWhereX() });\n\t}\n\tbuildWhereX() {\n\t\treturn {};\n\t}\n",
			),
			() =>
				canDong(
					chay(sao),
					`DO vong-doi: ${THU}:4 list lan ban da cat: company`,
					"b2 doi chung",
				),
		);
	});

	o("(b3) khong ten list, tep test, mo hinh khong cat deu xanh", () => {
		voiTep(
			sao,
			THU,
			lop(
				"\tasync layTheoId() {\n\t\treturn this.db.company.findMany({ where: {} });\n\t}\n",
			),
			() => khongDo(chay(sao), THU, "b3 khong ten list"),
		);
		voiTep(sao, "apps/api/test/lkv-thu.ts", listKhongLoc, () =>
			khongDo(chay(sao), "apps/api/test/lkv-thu.ts", "b3 tep test"),
		);
		voiTep(
			sao,
			THU,
			lop(
				"\tasync listX() {\n\t\treturn this.db.campaign.findMany({ where: {} });\n\t}\n",
			),
			() => khongDo(chay(sao), THU, "b3 mo hinh khong cat"),
		);
		voiTep(sao, THU, listKhongLoc, () =>
			canDong(chay(sao), `DO vong-doi: ${THU}:4`, "b3 doi chung"),
		);
	});

	o("(b4) ngoai app Nest va tep spec xanh", () => {
		voiTep(sao, "apps/agent/agent/lkv-thu.ts", listKhongLoc, () =>
			khongDo(chay(sao), "apps/agent/agent/lkv-thu.ts", "b4 app agent"),
		);
		voiTep(sao, "apps/api/src/lkv-thu.spec.ts", listKhongLoc, () =>
			khongDo(chay(sao), "apps/api/src/lkv-thu.spec.ts", "b4 spec"),
		);
		voiTep(sao, THU, listKhongLoc, () =>
			canDong(chay(sao), `DO vong-doi: ${THU}:4`, "b4 doi chung"),
		);
	});

	const xoa = (ham, them = "") =>
		lop(
			`\tasync purgeX(id: string) {\n\t\treturn this.db.division.${ham}({ where: { id${them} } });\n\t}\n`,
		);
	o("(a1) xoa khong kiem do, kiem truc tiep xanh", () => {
		voiTep(sao, THU, xoa("delete"), () =>
			canDong(
				chay(sao),
				`DO vong-doi: ${THU}:4 xoa vinh vien khong kiem da luu tru: division`,
				"a1 do",
			),
		);
		voiTep(sao, THU, xoa("delete", ", archivedAt: { not: null }"), () =>
			khongDo(chay(sao), THU, "a1 doi chung"),
		);
	});

	o("(a2) kiem qua ham phu xanh, ham phu khong kiem do", () => {
		const voiHamPhu = (thanPhu) =>
			lop(
				`\tasync purgeX(id: string) {\n\t\tawait this.lyDo(id);\n\t\treturn this.db.division.delete({ where: { id } });\n\t}\n\tasync lyDo(id: string) {\n${thanPhu}\t}\n`,
			);
		voiTep(
			sao,
			THU,
			voiHamPhu(
				'\t\tconst d = await this.db.division.findUnique({ where: { id } });\n\t\tif (d.archivedAt === null) throw new Error("x");\n',
			),
			() => khongDo(chay(sao), THU, "a2 xanh"),
		);
		voiTep(
			sao,
			THU,
			voiHamPhu("\t\treturn this.db.division.findUnique({ where: { id } });\n"),
			() =>
				canDong(
					chay(sao),
					`DO vong-doi: ${THU}:5 xoa vinh vien khong kiem da luu tru: division`,
					"a2 doi chung",
				),
		);
	});

	o("(a3) deleteMany co where archivedAt xanh", () => {
		voiTep(
			sao,
			THU,
			xoa("deleteMany", ", archivedAt: { lt: new Date() }"),
			() => khongDo(chay(sao), THU, "a3"),
		);
	});

	o("(a4) deleteMany khong kiem do", () => {
		voiTep(sao, THU, xoa("deleteMany"), () =>
			canDong(
				chay(sao),
				`DO vong-doi: ${THU}:4 xoa vinh vien khong kiem da luu tru: division`,
				"a4",
			),
		);
	});

	o("(n1) bo deletedAt cua AgentDefinition -> NEN THUA schema", () => {
		const moi = schemaGoc.replace(
			/(model AgentDefinition \{[\s\S]*?)\n\s+deletedAt\s[^\n]*/,
			"$1",
		);
		if (moi === schemaGoc)
			throw new Error("khong tim thay deletedAt cua AgentDefinition");
		voiTep(sao, SCHEMA, moi, () =>
			canDong(
				chay(sao),
				`NEN THUA vong-doi: ${SCHEMA} «model AgentDefinition {»`,
				"n1",
			),
		);
	});

	o("(n2) list cua AgentDefinition loc -> NEN THUA service", () => {
		const cu = readFileSync(join(sao, DV_AGENT), "utf8");
		const moi = cu.replace(
			"where: { status: { in: [...TEAM_AGENT_STATUSES] } },",
			"where: { status: { in: [...TEAM_AGENT_STATUSES] }, archivedAt: null },",
		);
		if (moi === cu)
			throw new Error("khong tim thay where cua list AgentDefinition");
		voiTep(sao, DV_AGENT, moi, () =>
			canDong(
				chay(sao),
				`NEN THUA vong-doi: ${DV_AGENT} «${DONG_AGENT}»`,
				"n2",
			),
		);
	});

	o("(k1) thieu schema: --du-luat ma 2, khong co thi khong ap dung", () => {
		voiTep(sao, SCHEMA, null, () => {
			const du = chay(sao, { duLuat: true });
			canDong(du, "KHONG DO DUOC: thieu luat: vong-doi", "k1 du-luat");
			if (du.ma !== 2) throw new Error(`k1 du-luat ma ${du.ma} != 2`);
			const tho = chay(sao);
			canDong(tho, "KHONG AP DUNG: vong-doi", "k1 khong co");
			canDong(tho, "XANH khong-chu-thich", "k1 sau luat kia van chay");
		});
	});

	o("(k2) thieu app Nest: --du-luat ma 2", () => {
		const nest = join(sao, "apps/api/package.json");
		const cu = readFileSync(nest, "utf8");
		const goi = JSON.parse(cu);
		delete goi.dependencies["@nestjs/core"];
		voiTep(sao, "apps/api/package.json", JSON.stringify(goi), () => {
			const du = chay(sao, { duLuat: true });
			canDong(du, "KHONG DO DUOC: thieu luat: vong-doi", "k2");
			if (du.ma !== 2) throw new Error(`k2 ma ${du.ma} != 2`);
		});
	});

	const thuocHong = (ten, sua) => {
		const thu = join(bat, ten, "scripts", "luat-kho");
		mkdirSync(thu, { recursive: true });
		cpSync(join(GOC, "scripts", "luat-kho"), thu, { recursive: true });
		symlinkSync(join(GOC, "node_modules"), join(bat, ten, "node_modules"));
		const tep = join(thu, "do-cay.mjs");
		const cu = readFileSync(tep, "utf8");
		const moi = sua(cu);
		if (moi === cu) throw new Error(`${ten}: khong sua duoc ban sao thuoc`);
		writeFileSync(tep, moi);
		const r = spawnSync(process.execPath, [tep, "--goc", GOC, "--du-luat"], {
			encoding: "utf8",
		});
		return { ma: r.status, dong: (r.stdout ?? "").split("\n") };
	};

	o("(h1) ham luat vong-doi tra rong -> ma 2 thuoc hong", () => {
		const kq = thuocHong("h1", (c) =>
			c.replace(
				"if (!nc.nest.some((a) => trong(t, a.thuMuc)) || laKiem(t)) return [];",
				"return [];",
			),
		);
		canDong(kq, "thuoc hong, khong tin duoc", "h1");
		if (kq.ma !== 2) throw new Error(`h1 ma ${kq.ma} != 2`);
	});

	o("(h2) ham phu luon co archivedAt -> ma 2 thuoc hong", () => {
		const kq = thuocHong("h2", (c) =>
			c.replace(
				/const kiem = \(m\) =>\s*m\.coKiem \|\|/,
				"const kiem = (m) => true ||",
			),
		);
		canDong(kq, "thuoc hong, khong tin duoc", "h2");
		if (kq.ma !== 2) throw new Error(`h2 ma ${kq.ma} != 2`);
	});
} finally {
	rmSync(sao, { recursive: true, force: true });
	rmSync(bat, { recursive: true, force: true });
}

if (bamCay() !== truoc) loi.push("cay noi goi lenh da doi");
if (loi.length > 0) {
	console.error(loi.join("\n"));
	process.exit(1);
}
console.log(`pha: ${soO}/${soO} o dat, cay noi goi lenh khong doi`);
