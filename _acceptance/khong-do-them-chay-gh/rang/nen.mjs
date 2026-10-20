import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
	cloneDocLap,
	datNenBan,
	GOC,
	git,
	Ket,
	khongDoDuoc,
	moiTruongSach,
} from "../../chuyen-goi-dieu-phoi/rang/chung.mjs";

export { GOC, git, Ket, khongDoDuoc, moiTruongSach };

export const SLUG = "khong-do-them-chay-gh";
export const RA = join(GOC, ".acceptance-runs", SLUG);

export function thuMucRa(ten) {
	const d = join(RA, ten);
	rmSync(d, { recursive: true, force: true });
	mkdirSync(d, { recursive: true });
	return d;
}

export const shaHead = () => git(GOC, "rev-parse", "HEAD").trim();
export const shaMergeBase = () =>
	git(GOC, "merge-base", "HEAD", "origin/onehub").trim();

function thu(fn) {
	try {
		return fn();
	} catch {
		return "khong co";
	}
}

export function ghRepo(cwd) {
	const r = spawnSync(
		"gh",
		["repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner"],
		{
			cwd,
			encoding: "utf8",
			env: moiTruongSach(),
		},
	);
	if (r.status === 0) return r.stdout.trim();
	return `loi: ${
		String(r.stderr ?? "")
			.trim()
			.split("\n")[0]
	}`;
}

export function moTaNguon(nguon) {
	return {
		url: git(nguon, "remote", "get-url", "origin").trim(),
		repo: ghRepo(nguon),
		nhanh: git(nguon, "rev-parse", "--abbrev-ref", "HEAD").trim(),
	};
}

export function docBan(goc) {
	return {
		url: thu(() => git(goc, "remote", "get-url", "origin").trim()),
		repo: ghRepo(goc),
		nhanh: thu(() => git(goc, "rev-parse", "--abbrev-ref", "HEAD").trim()),
		head: thu(() => git(goc, "rev-parse", "HEAD").trim()),
		onehub: thu(() =>
			git(goc, "rev-parse", "--verify", "-q", "refs/heads/onehub").trim(),
		),
		originOnehub: thu(() =>
			git(
				goc,
				"rev-parse",
				"--verify",
				"-q",
				"refs/remotes/origin/onehub",
			).trim(),
		),
	};
}

export function kiemBan(ban, ky) {
	const sai = [];
	if (ban.url !== ky.url) sai.push("url");
	if (ban.repo !== ky.repo) sai.push("repo");
	if (ban.nhanh !== ky.nhanh) sai.push("nhanh");
	for (const k of ["head", "onehub", "originOnehub"])
		if (ban[k] !== ky.sha) sai.push(k);
	return sai;
}

export const ngan = (s) => (/^[0-9a-f]{40}$/.test(s) ? s.slice(0, 12) : s);

export function inBan(nhan, b) {
	console.log(
		`ban ${nhan}: origin=${b.url} repo=${b.repo} nhanh=${b.nhanh} head=${ngan(b.head)} onehub=${ngan(b.onehub)} origin/onehub=${ngan(b.originOnehub)}`,
	);
}

export function dungBan(sha, ten, nguon, { nen }) {
	const b = cloneDocLap(sha, ten);
	if (nen) datNenBan(b.goc, sha, nguon);
	return b;
}

export function bat(ket, ca, daBat, chiTiet) {
	if (daBat) console.log(`BAT ${ca}`);
	else ket.kiem(false, `thuoc hong: ${ca}`, chiTiet);
}

export function lenhCauHinh(khoa) {
	for (const dong of readFileSync(
		join(GOC, "_acceptance", "config.yaml"),
		"utf8",
	).split("\n")) {
		const m = new RegExp(`^ {4}${khoa}:\\s*(.+)$`).exec(dong);
		if (m) return m[1].trim();
	}
	khongDoDuoc(`config.yaml khong co executors.script.${khoa}`);
}

export const BAN_DO = join(
	GOC,
	"_acceptance",
	"chuyen-goi-dieu-phoi",
	"rang",
	"khong-do-them.mjs",
);

export function chepBanDo(dich, cu, moi) {
	const thuMuc = join(GOC, "_acceptance", "chuyen-goi-dieu-phoi", "rang");
	const chu = readFileSync(BAN_DO, "utf8");
	if (!chu.includes(cu))
		khongDoDuoc(
			`ban chep: khong tim thay «${cu.trim().split("\n")[0]}» trong khong-do-them.mjs`,
		);
	const pha = chu
		.replace(cu, moi)
		.replace(
			/from "\.\/([\w-]+\.mjs)"/g,
			(_, t) => `from "${join(thuMuc, t)}"`,
		);
	mkdirSync(dirname(dich), { recursive: true });
	writeFileSync(dich, pha);
	return dich;
}
