import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

export const GOC = resolve(import.meta.dirname, "..", "..", "..");
export const TEP_WF = join(GOC, ".github", "workflows", "acceptance.yml");
export const THU_MUC_CHAY = join(GOC, ".acceptance-runs", "giam-phut-acceptance");

export class BieuThucLa extends Error {}

const BO_BOC = /^\$\{\{\s*([\s\S]*?)\s*\}\}$/;

function giaTriNguyenTu(tu, nc) {
	const t = tu.trim();
	if (t === "github.event_name") return nc.event;
	if (t === "github.event.pull_request.number") return nc.pr ?? null;
	if (t === "github.sha") return nc.sha;
	if (t === "github.ref") return `refs/heads/${nc.nhanh}`;
	if (t === "!cancelled()") return !nc.huy;
	if (t === "cancelled()") return Boolean(nc.huy);
	if (t === "success()") return !nc.huy && !nc.do;
	if (t === "always()") return true;
	const chuoi = t.match(/^'([^']*)'$/);
	if (chuoi) return chuoi[1];
	if (t === "true") return true;
	if (t === "false") return false;
	throw new BieuThucLa(`bieu thuc la: «${t}»`);
}

function thanhThat(v) {
	return v !== null && v !== undefined && v !== false && v !== "" && v !== 0;
}

function bang(a, b) {
	return String(a).toLowerCase() === String(b).toLowerCase();
}

export function danhGia(bieuThuc, nc) {
	let s = String(bieuThuc).trim();
	const boc = s.match(BO_BOC);
	if (boc) s = boc[1];
	if (/[()]/.test(s.replace(/!?(cancelled|success|always)\(\)/g, ""))) throw new BieuThucLa(`bieu thuc la: «${s}»`);
	if (/&&/.test(s)) throw new BieuThucLa(`bieu thuc la: «${s}»`);
	const ves = s.split("||");
	let v = null;
	for (const ve of ves) {
		const ss = ve.split("==");
		if (ss.length === 1) v = giaTriNguyenTu(ss[0], nc);
		else if (ss.length === 2) v = bang(giaTriNguyenTu(ss[0], nc), giaTriNguyenTu(ss[1], nc));
		else throw new BieuThucLa(`bieu thuc la: «${s}»`);
		if (thanhThat(v)) return v;
	}
	return v;
}

function khopNhanh(mau, nhanh) {
	if (mau === undefined) return true;
	const ds = Array.isArray(mau) ? mau : [mau];
	return ds.some((m) => new RegExp(`^${String(m).replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`).test(nhanh));
}

export function kichHoat(wf, nc) {
	const on = wf?.on ?? {};
	const muc = on[nc.event];
	if (muc === undefined) return false;
	return khopNhanh(muc?.branches, nc.nhanh);
}

export function jobChay(job, nc) {
	if (job?.if === undefined) return true;
	return thanhThat(danhGia(job.if, nc));
}

export function buocChay(buoc, nc) {
	if (buoc?.if === undefined) return !nc.huy && !nc.do;
	return thanhThat(danhGia(buoc.if, nc));
}

export function lenhChay(wf, nc) {
	if (!kichHoat(wf, nc)) return [];
	const ra = [];
	for (const [ten, job] of Object.entries(wf?.jobs ?? {})) {
		if (!jobChay(job, nc)) continue;
		for (const buoc of job?.steps ?? []) {
			if (buoc?.run === undefined) continue;
			if (!buocChay(buoc, nc)) continue;
			ra.push({ job: ten, run: String(buoc.run).trim() });
		}
	}
	return ra;
}

export function git(...doiSo) {
	return execFileSync("git", ["-C", GOC, ...doiSo], { encoding: "utf8" }).trim();
}

export function docBanGoc() {
	const goc = git("merge-base", "HEAD", "origin/onehub");
	return { sha: goc, wf: Bun.YAML.parse(git("show", `${goc}:.github/workflows/acceptance.yml`)) };
}

export function docHead(tep = TEP_WF) {
	return Bun.YAML.parse(readFileSync(tep, "utf8"));
}

export function ghiBanSao(ten, wf) {
	mkdirSync(THU_MUC_CHAY, { recursive: true });
	const duong = join(THU_MUC_CHAY, ten);
	writeFileSync(duong, Bun.YAML.stringify(wf));
	return duong;
}

export const NGU_CANH = {
	pr: { event: "pull_request", nhanh: "onehub", pr: 7, sha: "a".repeat(40) },
	pushOnehub: { event: "push", nhanh: "onehub", pr: null, sha: "b".repeat(40) },
	pushRelease: { event: "push", nhanh: "release", pr: null, sha: "c".repeat(40) },
};

export function noiSuy(chuoi, nc) {
	const s = String(chuoi);
	if (BO_BOC.test(s.trim())) return danhGia(s, nc);
	return s.replace(/\$\{\{\s*([\s\S]*?)\s*\}\}/g, (_, bt) => String(danhGia(bt, nc)));
}
