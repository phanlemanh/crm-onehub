import { spawnSync } from "node:child_process";
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
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const ts = createRequire(join(GOC, "package.json"))("typescript");

const loi = [];
const bao = (ca, chu) => {
	loi.push(`mot-khuon: ${ca} — ${chu}`);
};

const { viecCuaToiOutput } = await import(
	join(GOC, "apps/api/src/okr/okr.contracts.ts")
);
const db = await import(join(GOC, "packages/db/src/okr-nhac.ts"));
const val = await import(join(GOC, "packages/validation/src/nhac-ke-hoach.ts"));

const phanTu = viecCuaToiOutput.shape.viec.element;
if (phanTu !== db.viecOkr)
	bao("a", "đầu ra API không dùng viecOkr của bộ sinh");
if (val.viecOkr !== db.viecOkr)
	bao("a", "@crm/validation/nhac-ke-hoach tái xuất một khuôn khác");
console.log(
	`a: dau ra API === viecOkr bo sinh: ${phanTu === db.viecOkr}; tai xuat === : ${val.viecOkr === db.viecOkr}`,
);

const nhanhOkr = val.mucNhac.options.filter((o) => {
	const loai = o.shape?.loai;
	return loai?.value !== undefined && db.LOAI_NHAC_OKR.includes(loai.value);
});
if (nhanhOkr.length !== db.LOAI_NHAC_OKR.length)
	bao("b", `số nhánh OKR ${nhanhOkr.length} ≠ ${db.LOAI_NHAC_OKR.length}`);
for (const o of nhanhOkr) {
	const loai = o.shape.loai.value;
	const co = Object.keys(o.shape).sort().join(",");
	const mong = Object.keys(db.KHOA_MUC_OKR[loai]).sort().join(",");
	console.log(`b: ${loai} khoa [${co}] mong [${mong}]`);
	if (co !== mong) bao("b", `${loai} có khoá [${co}], bảng khai [${mong}]`);
}

const tepHopDong = join(GOC, "apps/api/src/okr/okr.contracts.ts");
const nguon = ts.createSourceFile(
	tepHopDong,
	readFileSync(tepHopDong, "utf8"),
	ts.ScriptTarget.Latest,
	true,
);
const literalOkr = [];
const duyet = (nut) => {
	if (
		ts.isCallExpression(nut) &&
		ts.isPropertyAccessExpression(nut.expression) &&
		nut.expression.name.text === "literal" &&
		nut.arguments[0] &&
		ts.isStringLiteral(nut.arguments[0]) &&
		nut.arguments[0].text.startsWith("okr-")
	) {
		literalOkr.push(nut.arguments[0].text);
	}
	ts.forEachChild(nut, duyet);
};
duyet(nguon);
console.log(
	`c: z.literal('okr-…') trong okr.contracts.ts: ${literalOkr.length}`,
);
if (literalOkr.length > 0) bao("c", `còn ${literalOkr.join(", ")}`);

const tsc = join(GOC, "node_modules/.bin/tsc");

function banGuong() {
	const tam = mkdtempSync(join(tmpdir(), "mot-khuon-"));
	mkdirSync(join(tam, "packages/db"), { recursive: true });
	cpSync(join(GOC, "packages/db/src"), join(tam, "packages/db/src"), {
		recursive: true,
	});
	for (const tep of ["tsconfig.json", "package.json"]) {
		cpSync(join(GOC, "packages/db", tep), join(tam, "packages/db", tep));
	}
	symlinkSync(
		join(GOC, "packages/db/node_modules"),
		join(tam, "packages/db/node_modules"),
	);
	symlinkSync(
		join(GOC, "packages/typescript-config"),
		join(tam, "packages/typescript-config"),
	);
	symlinkSync(join(GOC, "node_modules"), join(tam, "node_modules"));
	const cauHinh = JSON.parse(
		readFileSync(join(tam, "packages/db/tsconfig.json"), "utf8"),
	);
	cauHinh.include = ["src/**/*.ts"];
	writeFileSync(
		join(tam, "packages/db/tsconfig.json"),
		JSON.stringify(cauHinh),
	);
	return tam;
}

function kiemKieu(tam) {
	const r = spawnSync(tsc, ["--noEmit", "-p", join(tam, "packages/db")], {
		encoding: "utf8",
	});
	return { ma: r.status, ra: `${r.stdout}${r.stderr}` };
}

function boKhoiThuTu(tam, loai) {
	const tep = join(tam, "packages/db/src/onboarding-nhac.ts");
	const chu = readFileSync(tep, "utf8");
	const dau = chu.indexOf("export const THU_TU_NHAC = [");
	const cuoi = chu.indexOf("] as const", dau);
	const khoi = chu.slice(dau, cuoi);
	const dong = `\t"${loai}",\n`;
	if (!khoi.includes(dong)) return false;
	writeFileSync(
		tep,
		chu.slice(0, dau) + khoi.replace(dong, "") + chu.slice(cuoi),
	);
	return true;
}

const doiChung = banGuong();
try {
	const r = kiemKieu(doiChung);
	console.log(`d: ban guong khong dot bien -> tsc ma ${r.ma}`);
	if (r.ma !== 0) bao("d", `bản gương không đột biến vẫn đỏ:\n${r.ra}`);
} finally {
	rmSync(doiChung, { recursive: true, force: true });
}

const thuTuThat = readFileSync(
	join(GOC, "packages/db/src/onboarding-nhac.ts"),
	"utf8",
);
const dotBien = ["okr-theo-doi"];
if (thuTuThat.includes('\t"ai-tran",\n')) dotBien.push("ai-tran");
for (const loai of dotBien) {
	const tam = banGuong();
	try {
		if (!boKhoiThuTu(tam, loai)) {
			bao("d", `không tìm thấy ${loai} trong THU_TU_NHAC để đột biến`);
			continue;
		}
		const r = kiemKieu(tam);
		const bat = r.ma !== 0 && r.ra.includes(loai);
		console.log(
			`d: bo ${loai} khoi THU_TU_NHAC -> tsc ma ${r.ma}, neu ten: ${r.ra.includes(loai)}`,
		);
		if (!bat)
			bao("d", `bỏ ${loai} khỏi thứ tự mà check-types không đỏ nêu tên`);
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
}

if (!existsSync(tsc)) bao("d", `không có ${tsc}`);

if (loi.length > 0) {
	for (const l of loi) console.error(l);
	process.exit(1);
}
console.log("mot-khuon: xanh");
