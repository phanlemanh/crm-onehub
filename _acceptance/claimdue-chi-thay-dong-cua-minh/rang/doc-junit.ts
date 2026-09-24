import { existsSync, readFileSync } from "node:fs";

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i += 2) {
	args.set(process.argv[i] ?? "", process.argv[i + 1] ?? "");
}

const junit = args.get("--junit");
if (!junit || !existsSync(junit)) {
	console.log(`JUNIT-VANG ${junit ?? ""}`);
	process.exit(2);
}

const file = args.get("--file");
const khoi = new Set((args.get("--khoi") ?? "").split(",").filter(Boolean));
const hangXom = args.get("--hang-xom");

function attr(text: string, name: string) {
	const m = text.match(new RegExp(`\\b${name}="([^"]*)"`));
	return (m?.[1] ?? "")
		.replace(/&apos;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&amp;/g, "&");
}

const xml = readFileSync(junit, "utf8");
const cases = [
	...xml.matchAll(/<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/g),
]
	.map((m) => {
		const head = m[1] ?? "";
		const body = m[2] ?? "";
		return {
			name: attr(head, "name"),
			classname: attr(head, "classname"),
			file: attr(head, "file"),
			failed: /<failure\b|<error\b/.test(body),
			skipped: /<skipped\b/.test(body),
		};
	})
	.filter((c) => !file || c.file.endsWith(file));

const ran = cases.filter((c) => !c.skipped);
console.log(
	`tests=${cases.length} failures=${ran.filter((c) => c.failed).length} skipped=${cases.length - ran.length}`,
);
for (const c of ran.filter((c) => c.failed)) {
	console.log(`FAIL ${c.classname} > ${c.name}`);
}

if (hangXom) {
	const lines = existsSync(hangXom)
		? readFileSync(hangXom, "utf8").split("\n").filter(Boolean)
		: [];
	const rows = lines.map(
		(l) =>
			JSON.parse(l) as { thu: number; truoc: number; doi: number; mat: number },
	);
	console.log(`hang-xom-dong=${rows.length} chay=${ran.length}`);
	for (const row of rows) {
		if (row.truoc !== 25)
			console.log(`HANG-XOM-GIEO-THIEU thu=${row.thu} truoc=${row.truoc}`);
		const c = ran[row.thu];
		if (!c || !khoi.has(c.classname)) continue;
		if (row.doi > 0)
			console.log(
				`HANG-XOM-BI-DUNG ${c.classname} > ${c.name} (${row.doi} dong)`,
			);
		if (row.mat > 0)
			console.log(`HANG-XOM-MAT ${c.classname} > ${c.name} (${row.mat} dong)`);
	}
}
