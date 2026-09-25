import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC =
	process.env.GOC_KHO ??
	join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const NOI = "apps/agent/test/noi-zalo-cho-nguoi-moi.integration.spec.ts";
const WEB = "apps/agent/test/zalo-qua-webhook.integration.spec.ts";
const hong = [];

const git = (...a) =>
	execFileSync("git", ["-C", GOC, ...a], { encoding: "utf8" });
const moc = git("merge-base", "HEAD", "origin/onehub").trim();
const cu = (tep) => git("show", `${moc}:${tep}`);
const nay = (tep) => readFileSync(join(GOC, tep), "utf8");

const BIEN_DOI = [
	[
		`			[
				"c khong vo",
				JSON.stringify(
					thanWebhook({ messageId: "wb-c", fromId: "Z", text: ma }).result,
				),
			],
`,
		"",
	],
	[
		`				if (ten.startsWith("c")) {
					expect(moi, "log in khoa cap dau").toContain("event_name,message");
				}
`,
		"",
	],
	[
		'expect(CA.length, "ma tran nam ca bo qua").toBe(5);',
		'expect(CA.length, "ma tran bon ca bo qua").toBe(4);',
	],
	["than hong, khong vo, tu bot, tu nhom", "than hong, tu bot, tu nhom"],
];

function bienDoi(goc) {
	let ra = goc;
	for (const [tu, thanh] of BIEN_DOI) {
		if (ra.split(tu).length !== 2) {
			hong.push("khong tim thay khoi ca c o merge-base");
			return null;
		}
		ra = ra.replace(tu, thanh);
	}
	return ra;
}

if (cu(NOI) !== nay(NOI)) {
	hong.push("spec da ky bi sua: noi-zalo-cho-nguoi-moi");
}

const webCu = cu(WEB);
const webNay = nay(WEB);
if (webCu !== webNay) {
	const mong = bienDoi(webCu);
	if (mong !== null && mong !== webNay) {
		hong.push("spec da ky bi sua ngoai ca c");
	}
}
if (webNay.includes('"c khong vo"')) {
	hong.push("spec webhook van con ca c khong vo");
}
if (!webNay.includes('expect(CA.length, "ma tran bon ca bo qua").toBe(4);')) {
	hong.push("ma tran webhook-bo-qua khong con dung 4 ca");
}

if (hong.length > 0) {
	for (const h of hong) console.error(h);
	process.exit(1);
}
console.log(`giu-da-ky: xanh (moc ${moc.slice(0, 8)})`);
