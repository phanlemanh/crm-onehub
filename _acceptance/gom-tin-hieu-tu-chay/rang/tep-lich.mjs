import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const TEP = join(GOC, ".github", "workflows", "tin-hieu-gom.yml");
const QUYEN = { contents: "write", "pull-requests": "write" };
const CAM = ["gh pr merge", "gh pr ready", "--auto"];
const LENH = "bun scripts/tin-hieu/gom-lich.ts";

export function kiem(chu) {
	const y = Bun.YAML.parse(chu);
	const on = y.on ?? y[true] ?? {};
	const jobs = Object.values(y.jobs ?? {});
	const buoc = jobs.flatMap((j) => j.steps ?? []);
	const chay = buoc.map((b) => String(b.run ?? ""));
	return [
		[
			"1 chay khi day len onehub cham thu muc tin hieu",
			JSON.stringify(on.push?.branches) === JSON.stringify(["onehub"]) &&
				(on.push?.paths ?? []).includes("tin-hieu/crm/**"),
			"lich khong chay khi tin hieu len onehub",
		],
		[
			"2 mot lich moi ngay",
			(on.schedule ?? []).length === 1,
			"lich khong chay hang ngay",
		],
		[
			"3 chay tay duoc",
			Object.hasOwn(on, "workflow_dispatch"),
			"lich khong chay tay duoc",
		],
		[
			"4 chi o kho crm-onehub",
			jobs.length > 0 &&
				jobs.every((j) =>
					String(j.if ?? "").includes(
						"github.repository == 'phanlemanh/crm-onehub'",
					),
				),
			"lich chay ngoai kho",
		],
		[
			"5 mot luot mot luc, khong huy luot dang chay",
			Boolean(y.concurrency?.group) &&
				y.concurrency?.["cancel-in-progress"] === false,
			"lich chay chong luot",
		],
		[
			"6 chi xin quyen noi dung va PR",
			JSON.stringify(y.permissions) === JSON.stringify(QUYEN),
			"tep lich xin quyen thua",
		],
		[
			"7 co tran phut",
			jobs.length > 0 &&
				jobs.every((j) => Number.isInteger(j["timeout-minutes"])),
			"lich khong co tran phut",
		],
		[
			"8 khong buoc gop, buoc cuoi chay lenh gom",
			!CAM.some((c) => chay.some((r) => r.includes(c))) &&
				(chay[chay.length - 1] ?? "").trim() === LENH,
			"tep lich co buoc gop",
		],
	];
}

function inRa(dong) {
	for (const [ten, dung, ghim] of dong)
		console.log(`${dung ? "DUNG" : "SAI"} ${ten}${dung ? "" : ` — ${ghim}`}`);
	return dong.every(([, d]) => d);
}

const TIEM = [
	[
		"3",
		(s) => s.replace("  workflow_dispatch:\n", ""),
		"lich khong chay tay duoc",
	],
	[
		"8",
		(s) =>
			s.replace(
				"        run: bun scripts/tin-hieu/gom-lich.ts",
				"        run: |\n          gh pr merge 1 --merge\n          bun scripts/tin-hieu/gom-lich.ts",
			),
		"tep lich co buoc gop",
	],
	[
		"6",
		(s) =>
			s.replace(
				"  pull-requests: write\n",
				"  pull-requests: write\n  actions: write\n",
			),
		"tep lich xin quyen thua",
	],
];

const that = readFileSync(TEP, "utf8");
const dongThat = kiem(that);
const xanh = inRa(dongThat);
let tuKiem = true;
if (process.argv.includes("--tu-kiem")) {
	const tam = mkdtempSync(join(tmpdir(), "gtc-tep-lich-"));
	try {
		for (const [so, tiem, ghim] of TIEM) {
			const ban = tiem(that);
			if (ban === that) {
				console.log(`SAI tu-kiem ${so}: nhat tiem khong doi tep`);
				tuKiem = false;
				continue;
			}
			writeFileSync(join(tam, "lich.yml"), ban);
			const dong = kiem(readFileSync(join(tam, "lich.yml"), "utf8"));
			const sai = dong.filter(([, d]) => !d);
			const dung =
				sai.length === 1 && sai[0][0].startsWith(so) && sai[0][2] === ghim;
			console.log(
				`${dung ? "DUNG" : "SAI"} tu-kiem ban tiem dong ${so} -> "${ghim}"`,
			);
			tuKiem &&= dung;
		}
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
}
console.log(`KET LUAN ${xanh && tuKiem ? 0 : 1}`);
process.exit(xanh && tuKiem ? 0 : 1);
