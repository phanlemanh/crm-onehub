import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "../../..");
const PIN = process.env.LAN_GHIM ?? resolve(HERE, "../.lan/noi-tiep.json");
const LOI_SHA = "cay da doi sau khi lan chay";

function chet(ma, ...loi) {
	for (const d of loi) console.log(d);
	process.exit(ma);
}

function doc(id) {
	let ghim;
	try {
		ghim = JSON.parse(readFileSync(PIN, "utf8"));
	} catch {
		chet(
			2,
			`KHONG DO DUOC: chua co ghim cua lan noi tiep tai ${PIN.replace(`${GOC}/`, "")}.`,
			"Chay `node _acceptance/tong-quan-va-khung-noi-tieng-viet/rang/lan-noi-tiep.mjs` truoc khi cham vong nay.",
		);
	}
	const dau = spawnSync("git", ["rev-parse", "HEAD"], { cwd: GOC, encoding: "utf8" });
	if (dau.status !== 0) chet(2, "KHONG DO DUOC: khong doc duoc HEAD cua kho");
	const nay = dau.stdout.trim();
	if (ghim.sha !== nay) {
		chet(
			1,
			`DO: ${LOI_SHA} — ghim neo o ${String(ghim.sha).slice(0, 12)} con HEAD la ${nay.slice(0, 12)}.`,
			"Ket qua cu khong noi gi ve cay hien tai. Chay lai lan noi tiep.",
		);
	}
	const chan = (ghim.chan ?? []).find((c) => c.id === id);
	if (!chan) chet(2, `KHONG DO DUOC: ghim khong co chan ${id} — lan noi tiep chay thieu hoac khai sai id.`);
	console.log(`ghim lan noi tiep · run_id ${ghim.run_id} · sha ${nay.slice(0, 12)} · chan ${id} (${chan.khoa})`);
	console.log(`lenh: ${chan.lenh}`);
	for (const d of chan.duoi ?? []) console.log(`  ${d}`);
	if (chan.exit !== 0) chet(1, `DO: ${id} trong lan noi tiep tra ma ${chan.exit}.`);
	if (chan.cay_sach !== true) chet(1, `DO: ${id} de lai vet chua tra tren cay lam viec.`);
	console.log(`XANH: ${id} da chay noi tiep tren dung cay nay va tra ma 0.`);
}

if (process.argv.includes("--chieu-do")) {
	const o = mkdtempSync(`${tmpdir()}/doc-lan-do-`);
	const gia = `${o}/lan-noi-tiep.json`;
	writeFileSync(
		gia,
		JSON.stringify({
			run_id: "chieu-do",
			sha: "0".repeat(40),
			chan: [{ id: "E11", khoa: "tq_dot_bien", lenh: "(gia)", exit: 0, cay_sach: true, duoi: [] }],
		}),
	);
	const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), "E11"], {
		encoding: "utf8",
		env: { ...process.env, LAN_GHIM: gia },
	});
	const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`;
	console.log("--- ben trong: chan doc chay tren mot GHIM GIA neo sai cay ---");
	console.log("--- moi dong duoi day la cua phep thu cam vao; DO o day la DUNG y muon ---");
	for (const d of ra.split("\n")) console.log(`  | ${d}`);
	console.log(`--- het phan cam vao · ma thoat cua phep thu: ${r.status} ---`);
	if (r.status === 0) {
		chet(1, "DO: cam mot ghim neo sai cay ma chan doc van bao XANH — chan nay khong do dung chieu no sinh ra de bat.");
	}
	if (!ra.includes(LOI_SHA)) {
		chet(1, `DO: chan doc co bao do nhung khong goi ten ly do — thieu chuoi ghim "${LOI_SHA}".`);
	}
	console.log(
		`\nXANH (chieu do): chan doc bat duoc ghim neo sai cay va goi dung ten ly do.`,
	);
	console.log("Chan E23 nay thoat 0. Cac dong \"DO:\" o tren la cua phep thu cam vao, khong phai ket qua cua E23.");
	process.exit(0);
}

const id = process.argv[2];
if (!/^E\d+$/.test(id ?? "")) chet(2, "dung: node doc-lan.mjs <E-id> | --chieu-do");
doc(id);
