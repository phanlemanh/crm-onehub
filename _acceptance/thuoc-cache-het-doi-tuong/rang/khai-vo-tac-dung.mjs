import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { GOC, docTask } from "./cau-hinh-turbo.mjs";

function soi() {
	const d = docTask();
	if (d === null) return null;
	const coInputs = d.task.filter((t) => t.inputs_o_goi);
	return { d, coInputs, chet: coInputs.filter((t) => !t.dem) };
}

const s = soi();
if (s === null) {
	console.error("KHONG DO DUOC: khong doc duoc cau hinh turbo.");
	process.exit(2);
}
console.log(
	`cap (goi, task) giai duoc: ${s.d.task.length} · co khai inputs o goi: ${s.coInputs.length}`,
);
for (const t of s.coInputs)
	console.log(`  ${t.goi}#${t.task} · dem=${t.dem} · ${t.inputs.length} muc`);

if (s.chet.length > 0) {
	for (const t of s.chet)
		console.error(
			`DO: ${t.goi}/turbo.json khai inputs cho task ${t.task}, ma task ay KHONG dem — ban khai vo tac dung: trong nhu bao dam, doc nhu bao dam, khong bao dam gi.`,
		);
	process.exit(1);
}
console.log(`chieu xanh: khong khai inputs nao nam tren mot task khong dem.`);

const p = join(GOC, "packages", "ui", "turbo.json");
let ma = 0;
try {
	writeFileSync(
		p,
		`${JSON.stringify(
			{
				$schema: "https://turborepo.dev/schema.json",
				extends: ["//"],
				tasks: { test: { inputs: ["$TURBO_DEFAULT$", "$TURBO_ROOT$/_acceptance/**"] } },
			},
			null,
			"\t",
		)}\n`,
	);
	const cay = soi();
	if (cay.chet.length === 0) {
		console.error(
			"DO: cay lai dung ban khai vo tac dung da go (inputs cho packages/ui#test, task khong dem) ma chan VAN XANH — thuoc nay khong bao gio do duoc.",
		);
		ma = 1;
	} else {
		console.log(
			`chieu do: cay lai ban khai da go -> chan bat dung ${cay.chet[0].goi}#${cay.chet[0].task}`,
		);
	}
} finally {
	try {
		writeFileSync(p, "");
		const fs = await import("node:fs");
		fs.rmSync(p);
	} catch {}
}
if (ma !== 0) process.exit(ma);
console.log("XANH: cap hai chieu tren cung mot vat — khong ban khai vo tac dung nao.");
