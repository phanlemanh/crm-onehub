import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "..", "..", "..");
const TAI_LIEU = join(GOC, "docs", "chat-ui.md");
const BANG = "### What is in the tree today";
const DOAN = "The one sanctioned exception";
const TEP_KARA = ["artifact.tsx", "task.tsx"];
const CHU_MIEN_TRU = [/exemption/i, /\bK2\b/];
const NOI_DUNG = "okr/soan";

function boCuoc(loi) {
	console.log(`KHONG DO DUOC: ${loi}`);
	process.exit(2);
}

function hangBang(chu) {
	const dau = chu.indexOf(BANG);
	if (dau < 0) return null;
	const sau = chu.slice(dau).split("\n").slice(1);
	const hang = [];
	let daVao = false;
	for (const dong of sau) {
		if (dong.startsWith("|")) {
			daVao = true;
			const o = dong.split("|").slice(1, -1).map((x) => x.trim());
			if (o.length >= 2) hang.push({ tep: o[0].replace(/`/g, ""), lyDo: o[1] });
			continue;
		}
		if (daVao) break;
	}
	return hang;
}

function doanNgoaiLe(chu) {
	const dau = chu.indexOf(DOAN);
	if (dau < 0) return null;
	const cuoi = chu.indexOf("\n\n", dau);
	return chu.slice(dau, cuoi < 0 ? undefined : cuoi);
}

function kiem(chu) {
	const loi = [];
	const hang = hangBang(chu);
	if (hang === null) boCuoc(`khong thay bang «${BANG}» trong docs/chat-ui.md`);
	for (const tep of TEP_KARA) {
		const h = hang.find((x) => x.tep === tep);
		if (!h) {
			loi.push(`thieu hang: ${tep}`);
			continue;
		}
		if (CHU_MIEN_TRU.some((r) => r.test(h.lyDo))) loi.push(`con mien tru: ${tep}`);
		if (!h.lyDo.includes(NOI_DUNG))
			loi.push(`khong neu trang soan (${NOI_DUNG}) la noi dung: ${tep}`);
	}
	const doan = doanNgoaiLe(chu);
	if (doan === null) boCuoc(`khong thay doan «${DOAN}…»`);
	for (const tep of TEP_KARA)
		if (doan.includes(tep)) loi.push(`doan ngoai le con neu: ${tep}`);
	return loi;
}

function ketLuan(loi, nhan) {
	for (const l of loi) console.log(`   ${l}`);
	if (loi.length > 0) {
		console.log(`DO (${nhan}): ${loi.length} muc`);
		process.exit(1);
	}
}

const that = readFileSync(TAI_LIEU, "utf8");

if (process.argv.includes("--kiem-do-do")) {
	const hang = hangBang(that)?.find((x) => x.tep === "task.tsx");
	if (!hang) boCuoc("khong thay hang task.tsx de dot bien");
	const dongCu = that
		.split("\n")
		.find((d) => d.startsWith("| `task.tsx`"));
	const tam = mkdtempSync(join(tmpdir(), "k2-tai-lieu-"));
	try {
		const sao = join(tam, "chat-ui.md");
		writeFileSync(
			sao,
			that.replace(dongCu, `${dongCu.slice(0, -1)}Same named exemption until K2. |`),
		);
		const loi = kiem(readFileSync(sao, "utf8"));
		if (!loi.includes("con mien tru: task.tsx")) {
			console.log("CHIEU DO HONG: ban sao giu chu exemption ma khong in 'con mien tru: task.tsx'");
			process.exit(3);
		}
		ketLuan(loi, "chieu do ghim");
	} finally {
		rmSync(tam, { recursive: true, force: true });
	}
}

const loi = kiem(that);
ketLuan(loi, "docs/chat-ui.md");
console.log(
	"XANH: hang artifact.tsx va task.tsx neu trang soan la noi dung, khong con chu mien tru; doan ngoai le khong con neu hai tep",
);
