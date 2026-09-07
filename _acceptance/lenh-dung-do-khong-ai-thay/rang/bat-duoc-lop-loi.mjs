import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const VAT_CAY = "apps/app/app/layout.tsx";
const CHAN_DOAN = "uncached or runtime data during prerendering";

const duong = join(GOC, VAT_CAY);
const banGoc = readFileSync(duong, "utf8");

const dungLai = () => {
	const r = spawnSync("bunx", ["turbo", "run", "build", "--force"], {
		cwd: GOC,
		encoding: "utf8",
		env: { ...process.env, TURBO_TELEMETRY_DISABLED: "1" },
	});
	return { ma: r.status, chu: `${r.stdout}${r.stderr}` };
};

const cuPhapConLanh = (chu) => {
	const nguon = ts.createSourceFile(
		VAT_CAY,
		chu,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
	return nguon.parseDiagnostics.length === 0;
};

try {
	const truoc = dungLai();
	if (truoc.ma !== 0) {
		console.error(
			`MA 2: doi chung duong hong — cay CHUA cay ma lenh dung da tra ma ${truoc.ma}. Mot cay von hong khong chung duoc gi.`,
		);
		console.error(truoc.chu.slice(-800));
		process.exit(2);
	}
	console.log("doi chung duong: cay chua cay -> lenh dung ma 0");

	const daCay = banGoc.replace(
		"export default function RootLayout({",
		"export default async function RootLayout({",
	).replace(
		"}>) {\n\treturn (\n\t\t<html",
		"}>) {\n\tconst _c = await cookies();\n\treturn (\n\t\t<html",
	);
	if (daCay === banGoc) {
		console.error(
			"MA 2: doan cay KHONG ap duoc vao layout — moc cay da lech, phep do khong con nghia.",
		);
		process.exit(2);
	}
	if (!cuPhapConLanh(daCay)) {
		console.error(
			"MA 2: doan cay lam hong CU PHAP — lenh dung se do vi ly do khac, khong chung duoc lop loi vo tinh.",
		);
		process.exit(2);
	}
	writeFileSync(duong, daCay);

	const sau = dungLai();
	console.log(`cay loi cu vao ${VAT_CAY} -> lenh dung ma ${sau.ma}`);

	if (sau.ma === 0) {
		console.error(
			"DO: cay dung hinh dang loi cu ma lenh dung van ma 0 — lenh chung moi KHONG bat duoc lop loi nay.",
		);
		process.exit(1);
	}
	if (!sau.chu.includes(CHAN_DOAN)) {
		console.error(
			`DO: lenh dung do nhung KHONG phai vi vo tinh — thieu chan doan \`${CHAN_DOAN}\`. Bang chung thu duoc chi la "lenh dung bat duoc mot loi nao do".`,
		);
		console.error(sau.chu.slice(-1200));
		process.exit(1);
	}
	console.log(`thong diep khop chan doan vo tinh cua Next: ${CHAN_DOAN}`);
} finally {
	writeFileSync(duong, banGoc);
}

const lai = dungLai();
console.log(`khoi phuc roi dung lai -> ma ${lai.ma}`);
if (lai.ma !== 0) {
	console.error("DO: khoi phuc xong ma lenh dung van do — chan da de lai rac.");
	process.exit(1);
}

console.log(
	"XANH: lenh dung xanh khi lanh, do dung chan doan vo tinh khi cay lai loi cu, va sach sau khi khoi phuc.",
);
