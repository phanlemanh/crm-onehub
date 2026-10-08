import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const THE = "DropdownMenuSubContent";

const MAU_THU = [
	{
		ten: "cung-dong",
		tep: "apps/app/components/crm/bulk-actions.tsx",
		nguon: [
			"export function A() {",
			"	return (",
			'		<DropdownMenuSubContent className="max-h-72 -translate-x-40">',
			"			<span />",
			"		</DropdownMenuSubContent>",
			"	);",
			"}",
		].join("\n"),
		dongThem: [3],
	},
	{
		ten: "dong-sau-trong-the",
		tep: "apps/app/app/(app)/[slug]/contacts/contacts-bulk-actions.tsx",
		nguon: [
			"export function B() {",
			"	return (",
			"		<DropdownMenuSubContent",
			'			className="w-64 p-0 -translate-x-40"',
			"		>",
			"			<span />",
			"		</DropdownMenuSubContent>",
			"	);",
			"}",
		].join("\n"),
		dongThem: [4],
	},
	{
		ten: "doi-chung-ngoai-the",
		tep: "apps/app/components/crm/bulk-actions.tsx",
		nguon: [
			"export function C() {",
			'	const lop = "-translate-x-40";',
			"	return <DropdownMenuSubContent>{lop}</DropdownMenuSubContent>;",
			"}",
		].join("\n"),
		dongThem: [2],
	},
];

function git(...a) {
	return execFileSync("git", ["-C", GOC, ...a], { encoding: "utf8" });
}

export function vungThe(tep, nguon) {
	const sf = ts.createSourceFile(
		tep,
		nguon,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
	const vung = [];
	const duyet = (n) => {
		if (
			(ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) &&
			n.tagName.getText(sf) === THE
		) {
			const dau = sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
			const cuoi = sf.getLineAndCharacterOfPosition(n.getEnd()).line + 1;
			vung.push([dau, cuoi]);
		}
		ts.forEachChild(n, duyet);
	};
	duyet(sf);
	return vung;
}

export function dongCham(tep, nguon, dongThem) {
	const vung = vungThe(tep, nguon);
	const cacDong = nguon.split("\n");
	return dongThem
		.filter((so) => vung.some(([a, b]) => so >= a && so <= b))
		.map((so) => `${tep}:${so}: ${(cacDong[so - 1] ?? "").trim()}`);
}

function dongThemTheoTep(moc) {
	const diff = git("diff", "-U0", moc, "HEAD", "--", "apps");
	const ra = new Map();
	let tep = null;
	for (const dong of diff.split("\n")) {
		if (dong.startsWith("+++ ")) {
			tep =
				dong.slice(4) === "/dev/null"
					? null
					: dong.slice(4).replace(/^b\//, "");
			continue;
		}
		const khoi = dong.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
		if (tep && khoi) {
			const dau = Number(khoi[1]);
			const so = khoi[2] === undefined ? 1 : Number(khoi[2]);
			const ds = ra.get(tep) ?? [];
			for (let i = 0; i < so; i += 1) ds.push(dau + i);
			ra.set(tep, ds);
		}
	}
	return ra;
}

const dong = [];
const ghi = (dat, chu) => dong.push({ dat, chu });

const moc = git("merge-base", "HEAD", "origin/onehub").trim();
const that = [];
for (const [tep, so] of dongThemTheoTep(moc)) {
	if (!/\.(tsx|jsx)$/.test(tep)) continue;
	that.push(...dongCham(tep, git("show", `HEAD:${tep}`), so));
}
ghi(
	that.length === 0,
	that.length === 0
		? "0 dong them o noi goi"
		: `${that.length} dong them o noi goi: ${that.join(" | ")}`,
);

if (process.argv.includes("--tu-thu")) {
	for (const m of MAU_THU) {
		const bat = dongCham(m.tep, m.nguon, m.dongThem);
		const mong = m.ten === "doi-chung-ngoai-the" ? 0 : 1;
		ghi(
			bat.length === mong,
			`tu-thu ${m.ten}: ${bat.length === 0 ? "khong bat" : `do — ${bat.join(" | ")}`} (mong ${mong === 1 ? "do" : "khong bat"})`,
		);
	}
}

for (const d of dong) console.log(`${d.dat ? "DUNG" : "SAI"} ${d.chu}`);
const sai = dong.filter((d) => !d.dat).length;
console.log(
	`KET LUAN ${dong.length - sai} DUNG, ${sai} SAI — ma thoat ${sai ? 1 : 0}`,
);
process.exit(sai ? 1 : 0);
