import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "../../..");
const COMMIT_GOC = "ad7c8ed0";
const DAU_MUC = "#### Zalo: webhook";
const CAU_MOI = "300 câu mỗi tháng";
const SO_CU = /1[.,]?500(?![.,]?\d)/;
const DONG_4B = "| 4b | `ha-tran-thang-hoi-zalo`";
const DONG_4B_CAN = ["300", "1.500", "27/09", "N0"];

function mucZalo(vanBan) {
	const dau = vanBan.indexOf(DAU_MUC);
	if (dau === -1) return "";
	const sau = vanBan.slice(dau + DAU_MUC.length);
	const cuoi = sau.search(/^### /m);
	return DAU_MUC + (cuoi === -1 ? sau : sau.slice(0, cuoi));
}

function kiemAgent(vanBan) {
	const muc = mucZalo(vanBan);
	if (!muc) return "hong: khong thay muc Zalo trong agent.md";
	if (SO_CU.test(muc)) return "hong: muc Zalo con so 1.500";
	if (!muc.replace(/\s+/g, " ").includes(CAU_MOI))
		return `hong: muc Zalo thieu "${CAU_MOI}"`;
	return null;
}

function kiemLoTrinh(vanBan) {
	const dong = vanBan.split("\n").find((d) => d.startsWith(DONG_4B));
	if (!dong) return "hong: lo-trinh-zalo thieu dong 4b";
	const thieu = DONG_4B_CAN.filter((t) => !dong.includes(t));
	return thieu.length ? `hong: dong 4b thieu ${thieu.join(", ")}` : null;
}

const ket = [];
const agent = kiemAgent(readFileSync(resolve(GOC, "docs/agent.md"), "utf8"));
ket.push(["agent.md muc Zalo ghi 300, khong con 1.500", agent]);
ket.push([
	"lo-trinh-zalo dong 4b",
	kiemLoTrinh(readFileSync(resolve(GOC, "docs/plan/lo-trinh-zalo.md"), "utf8")),
]);
const goc = execFileSync(
	"git",
	["-C", GOC, "show", `${COMMIT_GOC}:docs/agent.md`],
	{
		encoding: "utf8",
	},
);
ket.push([
	"doi chung ban goc do",
	kiemAgent(goc) ? null : "hong: doi chung ban goc khong do",
]);

for (const [ten, loi] of ket) {
	if (loi) {
		console.log(loi);
		process.exit(1);
	}
	console.log(`ok: ${ten}`);
}
