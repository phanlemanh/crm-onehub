import ts from "typescript";
import { docConfig, docKhai, dungLai } from "./chung.mjs";
import { bangRoute } from "./duong-co-that.mjs";

const BI_DANH = "/internal/sync/google";
const THAY = "/internal/sync/mailboxes";
const NHIP = "*/5 * * * *";

const d = dungLai();
if (d.ma !== 0) {
	console.error(`MA 2: luot dung tra ma ${d.ma}`);
	console.error(d.chu.slice(-600));
	process.exit(2);
}
const cfg = docConfig();
if (cfg === undefined) {
	console.error("MA 2: khong co config.json sau luot dung");
	process.exit(2);
}
const crons = cfg.crons ?? [];
const hong = [];

if (crons.some((c) => c.path === BI_DANH))
	hong.push(`con dang ky bi danh ${BI_DANH}`);

const thay = crons.find((c) => c.path === THAY);
if (thay === undefined)
	hong.push(
		`${THAY} khong duoc dang ky — viec dong bo hop thu da MAT chu khong phai da doi ten`,
	);
else if (thay.schedule !== NHIP)
	hong.push(`${THAY} nhip ${thay.schedule}, ban khai doi ${NHIP}`);

const bang = bangRoute();
function goiGi(nut) {
	const ra = new Set();
	const di = (n) => {
		if (
			ts.isCallExpression(n) &&
			ts.isPropertyAccessExpression(n.expression) &&
			n.expression.expression.kind === ts.SyntaxKind.ThisKeyword
		)
			ra.add(n.expression.name.text);
		ts.forEachChild(n, di);
	};
	di(nut);
	return [...ra].sort().join(",");
}

const hamBiDanh = bang.get(BI_DANH) ?? [];
const hamThay = bang.get(THAY) ?? [];
if (hamBiDanh.length === 0 || hamThay.length === 0) {
	console.error(
		`MA 2: khong thay ham xu ly cho ${BI_DANH} (${hamBiDanh.length}) hoac ${THAY} (${hamThay.length})`,
	);
	process.exit(2);
}

const uyBiDanh = [...new Set(hamBiDanh.map((h) => goiGi(h.nut)))]
	.sort()
	.join(" | ");
const uyThay = [...new Set(hamThay.map((h) => goiGi(h.nut)))]
	.sort()
	.join(" | ");
console.log(
	`${BI_DANH}: ${hamBiDanh.map((h) => h.ham).join(", ")} -> goi { ${uyBiDanh} }`,
);
console.log(
	`${THAY}:      ${hamThay.map((h) => h.ham).join(", ")} -> goi { ${uyThay} }`,
);

if (uyBiDanh !== uyThay || uyThay === "")
	hong.push(
		`hai duong KHONG uy cho cung mot cho: bi danh goi { ${uyBiDanh} }, cai thay goi { ${uyThay} } — go bi danh la dung lang le viec nen duy nhat dang chay`,
	);

console.log(
	`cron duoc dang ky: ${crons.length} · ban khai: ${docKhai().crons.length}`,
);

if (hong.length > 0) {
	console.error("DO:");
	for (const h of hong) console.error(`  ${h}`);
	process.exit(1);
}
console.log(
	`XANH: bi danh khong con duoc dang ky, ${THAY} co mat dung nhip, va hai duong uy cho CUNG mot cho.`,
);
