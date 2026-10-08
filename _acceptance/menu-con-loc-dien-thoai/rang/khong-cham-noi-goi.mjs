import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const DAU = "DropdownMenuSubContent";

const DIFF_GIA = [
	"diff --git a/apps/app/components/crm/bulk-actions.tsx b/apps/app/components/crm/bulk-actions.tsx",
	"--- a/apps/app/components/crm/bulk-actions.tsx",
	"+++ b/apps/app/components/crm/bulk-actions.tsx",
	"@@ -106 +106 @@",
	'-			<DropdownMenuSubContent className="max-h-72 overflow-y-auto">',
	'+			<DropdownMenuSubContent className="max-h-72 overflow-y-auto -translate-x-40">',
].join("\n");

function git(...a) {
	return execFileSync("git", ["-C", GOC, ...a], { encoding: "utf8" });
}

export function dongThemCham(diff) {
	const ra = [];
	let tep = null;
	for (const dong of diff.split("\n")) {
		if (dong.startsWith("+++ ")) {
			tep = dong.slice(4).replace(/^b\//, "");
			continue;
		}
		if (!tep || !tep.startsWith("apps/")) continue;
		if (dong.startsWith("+") && dong.includes(DAU))
			ra.push(`${tep}: ${dong.slice(1).trim()}`);
	}
	return ra;
}

const dong = [];
const ghi = (dat, chu) => dong.push({ dat, chu });

const moc = git("merge-base", "HEAD", "origin/onehub").trim();
const that = dongThemCham(git("diff", "-U0", moc, "HEAD", "--", "apps"));
ghi(
	that.length === 0,
	that.length === 0
		? "0 dong them o noi goi"
		: `${that.length} dong them o noi goi: ${that.join(" | ")}`,
);

if (process.argv.includes("--tu-thu")) {
	const gia = dongThemCham(DIFF_GIA);
	const bat = gia.some((d) =>
		d.startsWith("apps/app/components/crm/bulk-actions.tsx:"),
	);
	ghi(bat, `tu-thu diff gia: ${bat ? `do — ${gia.join(" | ")}` : "KHONG bat"}`);
}

for (const d of dong) console.log(`${d.dat ? "DUNG" : "SAI"} ${d.chu}`);
const sai = dong.filter((d) => !d.dat).length;
console.log(
	`KET LUAN ${dong.length - sai} DUNG, ${sai} SAI — ma thoat ${sai ? 1 : 0}`,
);
process.exit(sai ? 1 : 0);
