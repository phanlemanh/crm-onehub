import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { GOC } from "./lat.mjs";

const O = `${tmpdir()}/khoa-cay-${createHash("sha1").update(GOC).digest("hex").slice(0, 10)}`;
const CHO_TOI_DA_MS = Number(process.env.KHOA_CAY_CHO_MS ?? 15 * 60_000);
const NHIP_MS = 2000;

const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

function song(pid) {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

function docPid(f) {
	return Number(readFileSync(`${O}/${f}`, "utf8"));
}

function donRac() {
	mkdirSync(O, { recursive: true });
	for (const f of readdirSync(O)) {
		const pid = docPid(f);
		if (!Number.isInteger(pid) || !song(pid)) rmSync(`${O}/${f}`, { force: true });
	}
}

function nguoiViet(tru) {
	donRac();
	return readdirSync(O)
		.filter((f) => f.startsWith("viet-") && f !== `viet-${tru}`)
		.map(docPid);
}

function soNguoiDoc() {
	donRac();
	return readdirSync(O).filter((f) => f.startsWith("doc-")).length;
}

function hetHan(han, viSao) {
	if (Date.now() <= han) return;
	console.log(
		`KHONG DO DUOC: tien de thieu — ${viSao} qua ${Math.round(CHO_TOI_DA_MS / 60_000)} phut. Cay dang bi giu, khong do tren cay dang doi.`,
	);
	process.exit(2);
}

export async function giuDoc() {
	if (process.env.KHOA_CAY_CHU) return;
	const toi = `${O}/doc-${process.pid}`;
	const han = Date.now() + CHO_TOI_DA_MS;
	let daBao = false;
	for (;;) {
		donRac();
		writeFileSync(toi, String(process.pid));
		if (nguoiViet(null).length === 0) break;
		rmSync(toi, { force: true });
		hetHan(han, "mot chan dot bien giu cay");
		if (!daBao) {
			console.log("cho: mot chan dot bien dang sua cay tai cho — doi no tra nguyen trang roi moi do.");
			daBao = true;
		}
		await ngu(NHIP_MS);
	}
	process.on("exit", () => rmSync(toi, { force: true }));
}

export async function giuViet(pid = process.pid) {
	if (process.env.KHOA_CAY_CHU && pid === process.pid) return;
	const toi = `${O}/viet-${pid}`;
	const han = Date.now() + CHO_TOI_DA_MS;
	let daBao = false;
	for (;;) {
		donRac();
		writeFileSync(toi, String(pid));
		const khac = nguoiViet(pid);
		if (khac.length === 0 || Math.min(...khac) > pid) break;
		rmSync(toi, { force: true });
		hetHan(han, "mot chan dot bien khac giu cay");
		if (!daBao) {
			console.log("cho: mot chan dot bien khac dang sua cay — xep hang sau no.");
			daBao = true;
		}
		await ngu(NHIP_MS);
	}
	while (soNguoiDoc() > 0) {
		if (Date.now() > han) rmSync(toi, { force: true });
		hetHan(han, "cac chan quan sat con doc cay");
		await ngu(NHIP_MS);
	}
	if (pid === process.pid) {
		process.env.KHOA_CAY_CHU = String(pid);
		process.on("exit", () => rmSync(toi, { force: true }));
	}
}

export function thaViet(pid) {
	rmSync(`${O}/viet-${pid}`, { force: true });
}

if (process.argv[1]?.endsWith("khoa-cay.mjs")) {
	const [lenh, pidChu] = process.argv.slice(2);
	const pid = Number(pidChu);
	if (lenh === "viet" && Number.isInteger(pid)) await giuViet(pid);
	else if (lenh === "tha" && Number.isInteger(pid)) thaViet(pid);
	else {
		console.log("dung: node khoa-cay.mjs viet <pid> | tha <pid>");
		process.exit(2);
	}
}
