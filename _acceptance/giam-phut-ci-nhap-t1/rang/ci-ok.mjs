import { spawnSync } from "node:child_process";
import { bang, Ket, WF_CI, yamlHead } from "./chung.mjs";

const KET_CUC = ["success", "failure", "cancelled", "skipped"];
const NANG = ["true", "false", ""];
const O_XANH = new Set([
	"success|true|success|success",
	"success|false|success|success",
	"success||success|success",
	"skipped|true|success|success",
	"skipped|false|success|success",
	"skipped||success|success",
	"success|false|skipped|skipped",
]);

function chayO(lenh, pl, nang, check, kiem) {
	const s = lenh
		.replaceAll("${{ needs.phan-loai.result }}", pl)
		.replaceAll("${{ needs.phan-loai.outputs.nang }}", nang)
		.replaceAll("${{ needs.check.result }}", check)
		.replaceAll("${{ needs.test.result }}", kiem);
	if (s.includes("${{")) throw new Error(`con bieu thuc chua thay: ${s.match(/\$\{\{[^}]*\}\}/)?.[0]}`);
	return spawnSync("bash", ["-c", s], { encoding: "utf8" }).status;
}

function kiemCiOk(job) {
	const sai = [];
	if (!bang(job?.needs, ["phan-loai", "check", "test"])) sai.push(`needs ${JSON.stringify(job?.needs)}`);
	if (job?.if !== "always()") sai.push("ci-ok-bi-bo-qua");
	const lenh = job?.steps?.length === 1 ? job.steps[0].run : null;
	if (!lenh) return { sai: [...sai, "khong co dung mot buoc run"], soO: 0, soXanh: 0 };
	let soO = 0;
	let soXanh = 0;
	for (const pl of KET_CUC)
		for (const nang of NANG)
			for (const check of KET_CUC)
				for (const kiem of KET_CUC) {
					soO++;
					const ten = `${pl}|${nang}|${check}|${kiem}`;
					const xanh = chayO(lenh, pl, nang, check, kiem) === 0;
					if (xanh) soXanh++;
					if (xanh !== O_XANH.has(ten)) sai.push(`o (${ten.replaceAll("|", ", ") || "rong"}) ${xanh ? "xanh" : "do"}`);
				}
	return { sai, soO, soXanh };
}

const k = new Ket();
const ci = await yamlHead(WF_CI);
const kq = kiemCiOk(ci.jobs["ci-ok"]);
k.kiem(kq.soO === 192, `so-o ${kq.soO}/192`, "so ca lech");
k.kiem(kq.soXanh === O_XANH.size, `o-xanh ${kq.soXanh}/${O_XANH.size}`, "so o xanh lech");
k.kiem(kq.sai.length === 0, "ci-ok dung bang chan ly", kq.sai.slice(0, 8).join("; "));

const sua = (f) => {
	const j = structuredClone(ci.jobs["ci-ok"]);
	f(j);
	return kiemCiOk(j).sai;
};
const DOT_BIEN = [
	["pl-hong", (j) => (j.steps[0].run = j.steps[0].run.replace('case "$pl" in success|skipped) ;; *) exit 1 ;; esac', "")), "o (failure, , success, success) xanh"],
	["bo-qua-khong-loi", (j) => (j.steps[0].run = j.steps[0].run.replace(' && [ "$nang" = false ]', "")), "o (success, true, skipped, skipped) xanh"],
	["ci-ok-bi-bo-qua", (j) => delete j.if, "ci-ok-bi-bo-qua"],
	["hang-dung", (j) => (j.steps[0].run = "true"), "o (failure, true, success, success) xanh"],
];
for (const [ca, f, mong] of DOT_BIEN) {
	const sai = sua(f);
	k.bat(ca, sai.includes(mong), `${sai.length} o sai`);
}
k.xong();
