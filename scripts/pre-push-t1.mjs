import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { docGlobT1, quyetDinh, tepT1 } from "../.github/scripts/phan-loai.mjs";

const KHO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SHA_RONG = /^0+$/;
const NHU_PR_SAN_SANG = { suKien: "pull_request", nhap: "false" };
const NHANH_CHINH = "onehub";
const DUOI = "CI phân loại PR theo cùng luật.";

function git(goc, ...args) {
	const r = spawnSync("git", args, { cwd: goc, encoding: "utf8" });
	return { ok: r.status === 0, ra: (r.stdout || "").trim(), loi: (r.stderr || "").trim().split("\n")[0] };
}

function gitPhai(goc, ...args) {
	const r = git(goc, ...args);
	if (!r.ok) throw new Error(`git ${args[0]} hỏng: ${r.loi}`);
	return r.ra;
}

export function docDong(chu) {
	return chu
		.split("\n")
		.map((d) => d.trim())
		.filter(Boolean)
		.map((d) => {
			const [localRef, localSha, remoteRef, remoteSha] = d.split(/\s+/);
			return { localRef, localSha, remoteRef, remoteSha };
		});
}

function gocSo(goc, dong, remote) {
	if (dong.remoteSha && !SHA_RONG.test(dong.remoteSha) && git(goc, "cat-file", "-e", `${dong.remoteSha}^{commit}`).ok) {
		return dong.remoteSha;
	}
	const ref = `refs/remotes/${remote}/${NHANH_CHINH}`;
	if (!git(goc, "rev-parse", "--verify", "-q", ref).ok) throw new Error(`thiếu ${remote}/${NHANH_CHINH}`);
	return gitPhai(goc, "merge-base", ref, dong.localSha);
}

export function tepDay(goc, dongs, remote) {
	const tep = new Set();
	for (const dong of dongs) {
		if (!dong.localSha || SHA_RONG.test(dong.localSha)) continue;
		const goc0 = gocSo(goc, dong, remote);
		for (const t of gitPhai(goc, "diff", "--name-only", "--no-renames", goc0, dong.localSha).split("\n")) {
			if (t) tep.add(t);
		}
	}
	return [...tep].sort();
}

export function docBoQua(goc) {
	const hinh = JSON.parse(readFileSync(join(goc, ".githooks", "gate-shape.json"), "utf8"));
	const skip = hinh.t1Only?.skip;
	if (!Array.isArray(skip) || skip.length === 0) throw new Error("gate-shape.json không khai khối t1Only");
	return skip;
}

export function phanLoaiDay(goc, dongs, remote) {
	const boQua = docBoQua(goc);
	const tep = tepDay(goc, dongs, remote);
	const t1 = tep.length ? tepT1(docGlobT1(goc), tep) : new Set();
	const kq = quyetDinh({ ...NHU_PR_SAN_SANG, tep, laT1: (t) => t1.has(t) });
	return { boQua: kq.nang ? [] : boQua, tep, lyDo: kq.lyDo };
}

function chay() {
	const i = process.argv.indexOf("--remote");
	const remote = i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : "origin";
	let chu = "";
	try {
		chu = readFileSync(0, "utf8");
	} catch {
		chu = "";
	}
	try {
		const kq = phanLoaiDay(KHO, docDong(chu), remote);
		if (kq.boQua.length) {
			process.stderr.write(`pre-push: chỉ tệp T1 (${kq.tep.length} tệp) — bỏ ${kq.boQua.join(", ")}; ${DUOI}\n`);
			process.stdout.write(`${kq.boQua.join(" ")}\n`);
		}
	} catch (e) {
		process.stderr.write(`pre-push: không phân loại được lần đẩy (${String(e.message).replace(/\s+/g, " ").trim()}) — chạy đủ năm bước.\n`);
	}
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) chay();
