import { execFileSync } from "node:child_process";

const TEP = [
	"apps/app/components/crm/record-sheet/deal-sheet.tsx",
	"apps/app/components/crm/record-sheet/company-sheet.tsx",
];

const DIFF_GIA = `diff --git a/${TEP[0]} b/${TEP[0]}
+++ b/${TEP[0]}
+							{contact.phone?.replace("+84", "0")}
diff --git a/${TEP[1]} b/${TEP[1]}
+++ b/${TEP[1]}
+								<SoDienThoai so={contact.phone} />
`;

const DUNG_JSX = /<SoDienThoai\b/;
const TU_DINH_DANG =
	/phone\)?\??\.(replace|slice)\(|phone\)?\??\.match\(|\/[^/\n]*\\d[^/\n]*\/[gimsuy]*\.test\(\s*\w*\.?phone/;

function diffThem(diff) {
	const theoTep = new Map(TEP.map((t) => [t, []]));
	let tep = null;
	for (const dong of diff.split("\n")) {
		if (dong.startsWith("+++ ")) {
			const ten = dong.replace(/^\+\+\+ (b\/)?/, "");
			tep = theoTep.has(ten) ? ten : null;
			continue;
		}
		if (tep && dong.startsWith("+") && !dong.startsWith("+++")) {
			theoTep.get(tep).push(dong.slice(1));
		}
	}
	return theoTep;
}

function layDiff() {
	const goc = execFileSync("git", ["merge-base", "HEAD", "origin/onehub"], {
		encoding: "utf8",
	}).trim();
	if (!goc) throw new Error("dung-so-chung: khong tinh duoc merge-base");
	return execFileSync("git", ["diff", "-U0", goc, "--", ...TEP], {
		encoding: "utf8",
	});
}

function cham(diff) {
	const loi = [];
	for (const [tep, them] of diffThem(diff)) {
		const jsx = them.filter((d) => DUNG_JSX.test(d) && !/^\s*import\b/.test(d));
		const tuDinhDang = them.filter((d) => TU_DINH_DANG.test(d));
		console.log(
			`${tep}: ${jsx.length} dong <SoDienThoai, ${tuDinhDang.length} dong tu dinh dang`,
		);
		if (jsx.length === 0)
			loi.push(`dung-so-chung: ${tep} khong dung <SoDienThoai`);
		if (tuDinhDang.length > 0)
			loi.push(
				`dung-so-chung: tu dinh dang so — ${tep}: ${tuDinhDang[0].trim()}`,
			);
	}
	return loi;
}

const tuThu = process.argv.includes("--tu-thu");
const loi = cham(tuThu ? DIFF_GIA : layDiff());
if (loi.length > 0) {
	for (const l of loi) console.log(l);
	process.exit(1);
}
console.log("dung-so-chung: DUNG — hai bang dung thanh phan hien so chung");
