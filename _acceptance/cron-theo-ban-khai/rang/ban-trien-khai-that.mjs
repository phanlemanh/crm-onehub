import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { bangNhau, docKhai, GOC } from "./chung.mjs";

const DU_AN = "crm-onehub-api";
const NEN = join(homedir(), "Library", "Application Support", "com.vercel.cli");
const CAP_GOP = "147b47a339b2f5a37cbbd5feae536553d490cf5a";
const HET_HAN = "token Vercel CLI het han — chay vercel login";

const doiSo = (ten) => {
	const i = process.argv.indexOf(ten);
	return i === -1 ? null : process.argv[i + 1];
};
const tepGia = doiSo("--gia");
const gia = tepGia ? JSON.parse(readFileSync(tepGia, "utf8")) : null;

const git = (...d) => spawnSync("git", ["-C", GOC, ...d], { encoding: "utf8" });

if (git("cat-file", "-e", `${CAP_GOP}^{commit}`).status !== 0) {
	console.error(`KHONG DO DUOC: sha cap gop cron ${CAP_GOP} khong co trong kho`);
	process.exit(2);
}

function xacThuc() {
	let auth;
	let cfg;
	try {
		auth = JSON.parse(readFileSync(join(NEN, "auth.json"), "utf8"));
		cfg = JSON.parse(readFileSync(join(NEN, "config.json"), "utf8"));
	} catch (e) {
		console.error(`MA 2: khong doc duoc cau hinh Vercel CLI — ${e.message}`);
		process.exit(2);
	}
	const han = Number(auth.expiresAt);
	const hanMs = han > 0 && han < 1e12 ? han * 1000 : han;
	if (!auth.token || (hanMs > 0 && hanMs < Date.now())) {
		console.error(HET_HAN);
		process.exit(2);
	}
	return { tok: auth.token, doi: cfg.currentTeam };
}

const xt = gia ? null : xacThuc();

async function goi(duong) {
	if (gia) {
		const r = gia[duong];
		if (r === undefined) throw new Error(`du lieu gia thieu ${duong}`);
		return r;
	}
	const sep = duong.includes("?") ? "&" : "?";
	const r = await fetch(`https://api.vercel.com${duong}${sep}teamId=${xt.doi}`, {
		headers: { Authorization: `Bearer ${xt.tok}` },
	});
	if (r.status === 401 || r.status === 403) {
		console.error(HET_HAN);
		process.exit(2);
	}
	if (!r.ok) throw new Error(`HTTP ${r.status}`);
	return r.json();
}

let ds;
try {
	ds = await goi(`/v6/deployments?app=${DU_AN}&target=production&limit=40`);
} catch (e) {
	console.error(`MA 2: khong doc duoc danh sach ban trien khai — ${e.message}`);
	process.exit(2);
}

const ban = (ds.deployments ?? [])
	.filter((d) => d.state === "READY" && (d.target ?? "production") === "production")
	.sort((a, b) => (b.created ?? 0) - (a.created ?? 0))[0];
if (!ban) {
	console.error(`MA 2: chua co ban trien khai production READY nao cua ${DU_AN}`);
	process.exit(2);
}
const sha = ban.meta?.githubCommitSha ?? "";
console.log(
	`ban production moi nhat: ${ban.uid} · sha ${sha.slice(0, 9) || "(khong)"} · cap gop cron ${CAP_GOP.slice(0, 9)}`,
);
if (!sha || git("cat-file", "-e", `${sha}^{commit}`).status !== 0) {
	console.error(
		`KHONG DO DUOC: sha ${sha || "(khong)"} cua ban production khong co trong kho — git fetch roi do lai`,
	);
	process.exit(2);
}
if (git("merge-base", "--is-ancestor", CAP_GOP, sha).status !== 0) {
	console.error(
		`DO: ban production moi nhat (sha ${sha.slice(0, 9)}) khong chua cap gop cron ${CAP_GOP.slice(0, 9)}`,
	);
	process.exit(1);
}

let day;
try {
	day = await goi(`/v13/deployments/${ban.uid}`);
} catch (e) {
	console.error(`MA 2: khong doc duoc ban trien khai ${ban.uid} — ${e.message}`);
	process.exit(2);
}

const nenTang = (day.crons ?? []).map((c) => ({
	path: c.path,
	schedule: c.schedule,
}));
const khai = docKhai().crons.map((c) => ({
	path: c.path,
	schedule: c.schedule,
}));

console.log(`nen tang dang ky: ${nenTang.length} · ban khai: ${khai.length}`);
for (const c of nenTang) console.log(`  ${c.schedule}  ${c.path}`);

if (!bangNhau(khai, nenTang)) {
	console.error("DO: lich NEN TANG dang ky khong bang ban khai:");
	console.error(`  khai:     ${JSON.stringify(khai)}`);
	console.error(`  nen tang: ${JSON.stringify(nenTang)}`);
	process.exit(1);
}

console.log(
	`XANH: ban production that cua ${DU_AN} chua cap gop cron va dang ky dung ${khai.length} viec, tung cap path va nhip khop ban khai.`,
);
