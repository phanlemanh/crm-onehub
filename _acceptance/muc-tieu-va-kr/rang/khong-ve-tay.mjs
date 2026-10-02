import { readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const DAY = dirname(fileURLToPath(import.meta.url));
const GOC_THAT = join(DAY, "..", "..", "..");
const co = process.argv.indexOf("--goc");
const GOC = co > -1 ? process.argv[co + 1] : GOC_THAT;
const ts = createRequire(import.meta.url)("typescript");

const VUNG = {
	thuMuc: "apps/app/app/(app)/[slug]/okr",
	tep: ["apps/app/components/crm/record-sheet/objective-sheet.tsx"],
	the: "SimpleTableRow",
	lopCam: /^-?(bg-|border(-|$)|rounded)/,
};

const MA_TRAN = [
	{ dang: "chuoi tran", ma: `<SimpleTableRow className="bg-muted/30" />`, do: true },
	{ dang: "chuoi trong ngoac", ma: `<SimpleTableRow className={"border-b-0"} />`, do: true },
	{ dang: "template", ma: "<SimpleTableRow className={`rounded-md ${x}`} />", do: true },
	{ dang: "cn(...)", ma: `<SimpleTableRow className={cn("p-2", x && "hover:bg-muted")} />`, do: true },
	{ dang: "dieu kien", ma: `<SimpleTableRow className={x ? "w-12" : "border-t"} />`, do: true },
	{ dang: "bien the ngoac vuong", ma: `<SimpleTableRow className="[&>td]:bg-muted" />`, do: true },
	{ dang: "bien the data-[]", ma: `<SimpleTableRow className="data-[state=open]:border-t" />`, do: true },
	{ dang: "vien tran", ma: `<SimpleTableRow className={cn("p-2", "border")} />`, do: true },
	{ dang: "vien tran quan trong", ma: `<SimpleTableRow className="!border" />`, do: true },
	{ dang: "lop sach", ma: `<SimpleTableRow className={cn("w-12", "text-sm")} />`, do: false },
	{ dang: "lop sach ngoac vuong", ma: `<SimpleTableRow className="[&_svg]:size-4 w-[calc(100%-1rem)]" />`, do: false },
];

function tepTsx(thuMuc) {
	const ra = [];
	for (const ten of readdirSync(thuMuc)) {
		const duong = join(thuMuc, ten);
		if (statSync(duong).isDirectory()) ra.push(...tepTsx(duong));
		else if (ten.endsWith(".tsx")) ra.push(duong);
	}
	return ra;
}

function chuHang(n) {
	if (ts.isStringLiteralLike(n)) return [n.text];
	if (ts.isTemplateExpression(n))
		return [n.head.text, ...n.templateSpans.map((s) => s.literal.text)].concat(
			n.templateSpans.flatMap((s) => chuHang(s.expression)),
		);
	const ra = [];
	ts.forEachChild(n, (con) => {
		ra.push(...chuHang(con));
	});
	return ra;
}

function goc(lop) {
	let sau = 0;
	let tang = 0;
	for (let i = 0; i < lop.length; i += 1) {
		if (lop[i] === "[") tang += 1;
		else if (lop[i] === "]") tang -= 1;
		else if (lop[i] === ":" && tang === 0) sau = i + 1;
	}
	return lop.slice(sau).replace(/^!/, "");
}

function lopViPham(gt) {
	if (!gt) return [];
	return chuHang(gt)
		.flatMap((chu) => chu.split(/\s+/))
		.filter((lop) => VUNG.lopCam.test(goc(lop)));
}

function quet(ten, ma) {
	const sf = ts.createSourceFile(ten, ma, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	let soThe = 0;
	const viPham = [];
	const di = (n) => {
		if (
			(ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) &&
			n.tagName.getText() === VUNG.the
		) {
			soThe += 1;
			const thuocTinh = n.attributes.properties.find(
				(p) => ts.isJsxAttribute(p) && p.name.getText() === "className",
			);
			const lop = thuocTinh ? lopViPham(thuocTinh.initializer) : [];
			if (lop.length > 0) {
				const dong = sf.getLineAndCharacterOfPosition(n.getStart()).line + 1;
				viPham.push(`${dong} ${lop.join(" ")}`);
			}
		}
		ts.forEachChild(n, di);
	};
	di(sf);
	return { soThe, viPham };
}

let muc = 0;
for (const ca of MA_TRAN) {
	const { soThe, viPham } = quet("ma-tran.tsx", `const a = ${ca.ma};`);
	const bat = viPham.length > 0;
	const dung = soThe === 1 && bat === ca.do;
	console.log(`ma tran ${ca.dang}: ${bat ? "bat" : "khong bat"} — ${dung ? "dung" : "SAI"}`);
	if (!dung) muc += 1;
}
if (muc > 0) {
	console.log(`thuoc mu: ${muc}/${MA_TRAN.length} dang trong ma tran sai`);
	process.exit(3);
}

const tep = [...tepTsx(join(GOC, VUNG.thuMuc)), ...VUNG.tep.map((t) => join(GOC, t))];
let soThe = 0;
const viPham = [];
for (const duong of tep) {
	const kq = quet(duong, readFileSync(duong, "utf8"));
	soThe += kq.soThe;
	for (const v of kq.viPham) viPham.push(`${relative(GOC, duong)}:${v}`);
}

console.log(`tep da quet: ${tep.length}, ${VUNG.the} da quet: ${soThe}`);
if (soThe === 0) {
	console.log(`khong thay ${VUNG.the} nao — thuoc khong do duoc`);
	process.exit(2);
}
for (const v of viPham) console.log(`ve tay: ${v}`);
process.exit(viPham.length > 0 ? 1 : 0);
