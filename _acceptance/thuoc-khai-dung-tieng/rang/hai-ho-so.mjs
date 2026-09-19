import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { bang, chay, GOC, ghim } from "./chung.mjs";

const HANG_GHIM = {
	"nen-chat-ai-elements": 6,
	"ho-so-khai-dung-tieng": 7,
};

const hinh = JSON.parse(
	readFileSync(join(GOC, ".githooks/gate-shape.json"), "utf8"),
);
const cong = hinh.checkers.find((c) => c.id === "test");
const cacKhoi = Array.isArray(cong.rang) ? cong.rang : [cong.rang];

console.log(
	"-- HANG GHIM chep tay tu cay, so TRUOC khi dem vi pham:\n" +
		Object.entries(HANG_GHIM)
			.map(([k, v]) => `     ${k}: ${v} tep .mjs`)
			.join("\n") +
		"\n   Hai con so cung suy tu mot luot quet la 0 bang 0 khi glob neo sai goc.",
);

let hong = 0;
const hang = [];

const khaiRoi = new Set(cacKhoi.map((k) => k.ho_so));
for (const ten of Object.keys(HANG_GHIM)) {
	if (!khaiRoi.has(ten)) {
		hang.push(`HO SO KHONG CO KHOI [ho-so-vang-khoi:${ten}]`);
		hong += 1;
	}
}

for (const k of cacKhoi) {
	const tep = readdirSync(join(GOC, k.dir))
		.filter((t) => t.endsWith(".mjs"))
		.sort();
	const mong = HANG_GHIM[k.ho_so];
	if (mong === undefined) {
		hang.push(`KHOI LA MAT [khoi-khong-co-hang-ghim:${k.ho_so}]`);
		hong += 1;
		continue;
	}
	ghim(`so .mjs cua ${k.ho_so}`, tep.length, mong);

	const daKhai = new Set(
		[...k.checks, ...k.notInGate].map((x) => `${x.id}.mjs`),
	);
	for (const t of tep) {
		if (daKhai.has(t)) {
			hang.push(`co dinh doat    ${k.ho_so}/${t}`);
		} else {
			hang.push(`THIEU DINH DOAT [chua-dinh-doat:${k.ho_so}/${t}]`);
			hong += 1;
		}
	}
}

bang(`-- ${cacKhoi.length} khoi trong ban khai cong:`, hang);

console.log(
	"\n-- VE (a): ba thuoc cua nen-chat-ai-elements phai VAN CHAY va VAN XANH.\n" +
		"   Mo rong mot co che dang phuc vu ho so khac ma lam vo no la doi mot lo lay mot lo.",
);
const nenChat = cacKhoi.find((k) => k.ho_so === "nen-chat-ai-elements");
const hangCu = [];
for (const k of nenChat.checks) {
	const r = chay("node", [join(GOC, k.script)]);
	if (r.ma !== 0) {
		hangCu.push(`DO   [thuoc-cu-do:${k.id}] ma thoat ${r.ma}`);
		hong += 1;
	} else {
		hangCu.push(`xanh ${k.id}`);
	}
}
bang(
	`-- ${nenChat.checks.length} thuoc cu, chay that, goi ten tung cai:`,
	hangCu,
);

console.log(`ket qua: ${hong} cho hong`);
process.exit(hong > 0 ? 1 : 0);
