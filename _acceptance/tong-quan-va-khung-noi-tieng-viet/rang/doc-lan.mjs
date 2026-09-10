import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "../../..");
const PIN = process.env.LAN_GHIM ?? resolve(HERE, "../.lan/noi-tiep.json");
const LOI_SHA = "cay da doi sau khi lan chay";
const LOI_BAN = "cay co sua chua ghi sau khi lan chay";

const LAT_TOI = "tong-quan-va-khung-noi-tieng-viet";
const BANG_CHUNG = /^_acceptance\/[^/]+\/evidence\//;

function duocPhep(duong) {
	return (
		BANG_CHUNG.test(duong) || duong === `_acceptance/${LAT_TOI}/s4-args.json`
	);
}

function chet(ma, ...loi) {
	for (const d of loi) console.log(d);
	process.exit(ma);
}

function git(...args) {
	const r = spawnSync("git", args, { cwd: GOC, encoding: "utf8" });
	if (r.status !== 0) chet(2, `KHONG DO DUOC: git ${args.join(" ")} that bai`);
	return r.stdout;
}

function duongBan() {
	const tho = [
		...git("status", "--porcelain").split("\n"),
		...(process.env.LAN_BAN_GIA ?? "").split("\n"),
	];
	const ra = [];
	for (const d of tho) {
		if (d.trim() === "") continue;
		const duong = d.slice(3);
		const cuoi = duong.includes(" -> ") ? duong.split(" -> ")[1] : duong;
		if (!duocPhep(cuoi)) ra.push(cuoi);
	}
	return [...new Set(ra)].sort();
}

function doc(id) {
	let ghim;
	try {
		ghim = JSON.parse(readFileSync(PIN, "utf8"));
	} catch {
		chet(
			2,
			`KHONG DO DUOC: chua co ghim cua lan noi tiep tai ${PIN.replace(`${GOC}/`, "")}.`,
			`Chay \`node _acceptance/${LAT_TOI}/rang/lan-noi-tiep.mjs\` truoc khi cham vong nay.`,
		);
	}
	const nay = git("rev-parse", "HEAD").trim();
	if (ghim.sha !== nay) {
		chet(
			1,
			`DO: ${LOI_SHA} — ghim neo o ${String(ghim.sha).slice(0, 12)} con HEAD la ${nay.slice(0, 12)}.`,
			"Ket qua cu khong noi gi ve cay hien tai. Chay lai lan noi tiep.",
		);
	}
	const ban = duongBan();
	if (ban.length > 0) {
		chet(
			1,
			`DO: ${LOI_BAN} — ${ban.length} duong khac voi luc ghim, trong khi HEAD van the.`,
			...ban.map((d) => `    ${d}`),
			"Lan noi tiep chi chay tren cay sach, nen ma o cac duong nay chua he duoc chay qua.",
			"Ghi hoac cat cac thay doi do roi chay lai lan noi tiep.",
		);
	}
	const chan = (ghim.chan ?? []).find((c) => c.id === id);
	if (!chan)
		chet(
			2,
			`KHONG DO DUOC: ghim khong co chan ${id} — lan noi tiep chay thieu hoac khai sai id.`,
		);
	console.log(
		`ghim lan noi tiep · run_id ${ghim.run_id} · sha ${nay.slice(0, 12)} · chan ${id} (${chan.khoa})`,
	);
	console.log(`cay: khong duong nao ngoai thu muc bang chung bi sua chua ghi`);
	console.log(`lenh: ${chan.lenh}`);
	console.log(
		`--- ben trong: output CHEP LAI cua ${id} luc no chay o lan noi tiep ---`,
	);
	console.log(
		"--- moi dong duoi day la cua LUOT DO DO, khong phai ket qua cua lenh nay ---",
	);
	for (const d of chan.duoi ?? []) console.log(`  | ${d}`);
	console.log(
		`--- het phan chep lai · ma thoat that cua ${id} luc do: ${chan.exit} ---`,
	);
	if (chan.exit !== 0)
		chet(1, `DO: ${id} trong lan noi tiep tra ma ${chan.exit}.`);
	if (chan.cay_sach !== true)
		chet(1, `DO: ${id} de lai vet chua tra tren cay lam viec.`);
	console.log(`\nXANH: ${id} da chay noi tiep tren dung cay nay va tra ma 0.`);
	console.log(
		`Lenh nay thoat 0. Moi dong "DO:" o tren nam trong phan chep lai, khong phai ket qua cua no.`,
	);
}

function thu(nhan, env, chuoi) {
	const r = spawnSync(
		process.execPath,
		[fileURLToPath(import.meta.url), env.ID ?? "E11"],
		{
			encoding: "utf8",
			env: { ...process.env, ...env },
		},
	);
	const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`;
	console.log(`--- ben trong: ${nhan} ---`);
	for (const d of ra.split("\n")) console.log(`  | ${d}`);
	console.log(`--- het phan cam vao · ma thoat cua phep thu: ${r.status} ---`);
	if (r.status === 0)
		chet(
			1,
			`DO: ${nhan} — chan doc van bao XANH. No khong phan biet duoc trang thai nay.`,
		);
	if (!ra.includes(chuoi))
		chet(
			1,
			`DO: ${nhan} — chan doc bao do nhung khong goi ten ly do (thieu "${chuoi}").`,
		);
	console.log("");
}

if (process.argv.includes("--chieu-do")) {
	const o = mkdtempSync(`${tmpdir()}/doc-lan-do-`);
	const gia = `${o}/noi-tiep.json`;
	writeFileSync(
		gia,
		JSON.stringify({
			run_id: "chieu-do",
			sha: "0".repeat(40),
			chan: [
				{
					id: "E11",
					khoa: "tq_dot_bien",
					lenh: "(gia)",
					exit: 0,
					cay_sach: true,
					duoi: [],
				},
			],
		}),
	);
	console.log(
		"Hai phep thu duoi day CO Y lam chan doc bao DO. Do la ket qua dung y muon.\n",
	);
	thu("ghim neo sai cay (sha toan so khong)", { LAN_GHIM: gia }, LOI_SHA);

	let ghim;
	try {
		ghim = JSON.parse(readFileSync(PIN, "utf8"));
	} catch {
		chet(
			2,
			"KHONG DO DUOC: chua co ghim that de thu chieu cay ban — chay lan noi tiep truoc.",
		);
	}
	const id = ghim.chan?.[0]?.id;
	if (!id) chet(2, "KHONG DO DUOC: ghim that khong co chan nao.");
	thu(
		"ghim dung cay nhung mot file nguon bi sua chua ghi",
		{ ID: id, LAN_BAN_GIA: " M apps/app/lib/messages/tong-quan.ts" },
		LOI_BAN,
	);

	console.log(
		"XANH (chieu do): chan doc bat duoc CA HAI — ghim neo sai cay, va cay co sua chua ghi.",
	);
	console.log(
		'Chan nay thoat 0. Moi dong "DO:" o tren la cua hai phep thu cam vao.',
	);
	process.exit(0);
}

const id = process.argv[2];
if (!/^E\d+$/.test(id ?? ""))
	chet(2, "dung: node doc-lan.mjs <E-id> | --chieu-do");
doc(id);
