import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

const AE = {
	thuMuc: "packages/ui/src/components/ai-elements",
	coMat: ["artifact.tsx", "task.tsx"],
	vang: ["tool.tsx", "code-block.tsx"],
	rang: "_acceptance/nen-chat-ai-elements/rang",
	so: "_acceptance/nen-chat-ai-elements/so-lech-chuan.md",
	lyDo: "K1",
	han: "K2",
};

const doiSo = (ten) => {
	const i = process.argv.indexOf(ten);
	return i === -1 ? null : process.argv[i + 1];
};

const thuMuc = doiSo("--thu-muc") ?? join(GOC, AE.thuMuc);
const moCoi = doiSo("--mo-coi") ?? join(GOC, AE.rang, "mo-coi.mjs");

const dong = [];
let sai = 0;

function ghi(ok, chu) {
	dong.push(`${ok ? "OK " : "SAI"} ${chu}`);
	if (!ok) sai += 1;
}

function chay(tep) {
	const ket = spawnSync("node", [tep], { cwd: GOC, encoding: "utf8" });
	if (ket.error) {
		console.log(`KHONG DO DUOC: ${tep}: ${ket.error.message}`);
		process.exit(2);
	}
	return { ma: ket.status ?? 1, ra: `${ket.stdout ?? ""}${ket.stderr ?? ""}` };
}

for (const t of AE.coMat) ghi(existsSync(join(thuMuc, t)), `co mat: ${t}`);
for (const t of AE.vang) ghi(!existsSync(join(thuMuc, t)), `vang mat: ${t}`);

for (const t of AE.coMat) {
	const tep = join(thuMuc, t);
	if (!existsSync(tep)) continue;
	const chu = readFileSync(tep, "utf8");
	const chuThich = chu
		.split("\n")
		.some((d) => /^\s*(\/\/|\/\*|\*)/.test(d) || /\s\/\/\s/.test(d));
	ghi(!chuThich, chuThich ? `co chu thich: ${t}` : `khong chu thich: ${t}`);
	const lucide = chu.includes("lucide-react");
	ghi(!lucide, lucide ? `con icon lucide: ${t}` : `khong lucide: ${t}`);
}

for (const r of ["chu-cung.mjs", "mau-ban-kinh.mjs", "so-lech-chuan.mjs"]) {
	const { ma, ra } = chay(join(GOC, AE.rang, r));
	const cuoi = ra.trim().split("\n").at(-1);
	ghi(ma === 0, `${r} ma ${ma}: ${cuoi}`);
}

const so = readFileSync(join(GOC, AE.so), "utf8");
const muc = so.split(/^### /m).slice(1).map((m) => m.split("\n")[0].trim());
for (const t of AE.coMat)
	ghi(muc.includes(t), muc.includes(t) ? `so lech co muc ${t}` : `so lech thieu muc: ${t}`);

const mc = chay(moCoi);
const khoi = mc.ra.split("\n");
const dauMien = khoi.findIndex((d) => d.startsWith("MIEN TRU ("));
const dauChet = khoi.findIndex((d) => d.startsWith("CHET ("));
const mien = dauMien === -1 ? [] : khoi.slice(dauMien + 1, dauChet === -1 ? undefined : dauChet);
for (const t of AE.coMat) {
	const i = mien.findIndex((d) => d.trim().startsWith(`${t} — miễn trừ:`));
	const lyDo = i === -1 ? "" : mien[i];
	const han = i === -1 ? "" : (mien[i + 1] ?? "");
	ghi(
		i !== -1 && lyDo.includes(AE.lyDo) && han.includes(AE.han),
		i === -1 ? `MO COI: ${t}` : `mien tru ${t}: ly do co ${AE.lyDo}, han co ${AE.han}`,
	);
}
ghi(mc.ma === 0 && khoi.some((d) => d.startsWith("CHET (0)")), `mo-coi ma ${mc.ma}, CHET (0)`);

for (const d of dong) console.log(d);
if (sai > 0) {
	console.log(`DO: ${sai} muc sai`);
	process.exit(1);
}
console.log(`XANH: ${dong.length} muc`);
