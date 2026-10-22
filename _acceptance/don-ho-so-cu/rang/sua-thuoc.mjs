import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DA_KY, docJson, git, GOC, HO_SO } from "./chung.mjs";
import { docSoXuLy } from "./khuon-xu-ly.mjs";

const NGUOI_DUYET = "Phan Le Manh";
const NHANH_VONG = [/^feat\/don-ho-so-cu$/, /^chore\/don-ho-so-cu-lo-\d+$/];

function tepThuocHopLe(slug, tep) {
	return tep.startsWith(`_acceptance/${slug}/rang/`) || tep === `_acceptance/${slug}/evals.yaml` || tep === "_acceptance/config.yaml";
}

function khoaLenhCua(root, slug, sha) {
	const r = spawnSync("git", ["-C", root, "show", `${sha}:_acceptance/${slug}/evals.yaml`], { encoding: "utf8" });
	const text = r.status === 0 ? r.stdout : "";
	return new Set([...text.matchAll(/cmd:\s*config:executors\.\w+\.(\w+)/g)].map((m) => m[1]));
}

export function dongAc(text) {
	const ra = [];
	let cur = null;
	for (const d of text.split("\n")) {
		if (/^- AC-\d+:/.test(d)) {
			cur = [d];
			ra.push(cur);
		} else if (cur && /^\s+\S/.test(d)) cur.push(d);
		else cur = null;
	}
	return ra.map((k) => k.join("\n")).join("\n");
}

export function kiemSuaThuoc(d, base, { root = GOC, docTep = (p) => readFileSync(join(root, p), "utf8") } = {}) {
	const loi = [];
	let tepDoi = [];
	try {
		tepDoi = git(root, "show", "--name-only", "--format=", d.commit_sua).split("\n").filter(Boolean);
	} catch {
		return [`${d.slug}: commit_sua ${d.commit_sua} khong ton tai`];
	}
	for (const t of tepDoi) if (!tepThuocHopLe(d.slug, t)) loi.push(`${d.slug}: commit cham ngoai thuoc: ${t}`);
	if (tepDoi.includes("_acceptance/config.yaml")) {
		const khoa = khoaLenhCua(root, d.slug, d.commit_sua);
		const diff = git(root, "show", "-U0", "--format=", d.commit_sua, "--", "_acceptance/config.yaml");
		for (const dong of diff.split("\n")) {
			if (!/^[+-]\s/.test(dong)) continue;
			const k = dong.match(/^[+-]\s+(\w+):/);
			if (!k || !khoa.has(k[1])) loi.push(`${d.slug}: dong config khong phai khoa lenh cua ho so: ${dong.slice(0, 80)}`);
		}
	}
	const lt = (p) => (existsSync(join(root, p)) ? docTep(p) : null);
	if (lt(d.duong_tinh.log) === null) loi.push(`${d.slug}: thieu nhat ky duong tinh ${d.duong_tinh.log}`);
	const tiem = lt(d.tiem_do.log);
	if (tiem === null) loi.push(`${d.slug}: thieu nhat ky tiem do ${d.tiem_do.log}`);
	else if (!tiem.includes(d.tiem_do.thong_diep)) loi.push(`${d.slug}: sai-thong-diep — nhat ky tiem do khong chua «${d.tiem_do.thong_diep}»`);
	const so = lt(`_acceptance/${d.slug}/decisions.jsonl`) ?? "";
	const coFix = so.split("\n").some((l) => {
		try {
			const j = JSON.parse(l);
			return j.type === "fix" && String(j.decided_by ?? "").includes(NGUOI_DUYET);
		} catch {
			return false;
		}
	});
	if (!coFix) loi.push(`${d.slug}: decisions.jsonl thieu dong fix decided_by ${NGUOI_DUYET}`);
	const pC = `_acceptance/${d.slug}/contract.md`;
	const truoc = spawnSync("git", ["-C", root, "show", `${base}:${pC}`], { encoding: "utf8" });
	if (truoc.status !== 0 || dongAc(truoc.stdout) !== dongAc(lt(pC) ?? "")) loi.push(`${d.slug}: doi-loi-ac — loi AC trong contract.md khac goc vong`);
	return loi;
}

export function kiemLanChu(d) {
	if (d.cach === "cho-lan-chu") return d.pr.length ? [] : [`${d.slug}: cho-khong-pr — dong cho-lan-chu khong nem PR`];
	if (d.cach !== "sua-thuoc") return [];
	if (d.vong_ky_cho_gop.length && !d.hoi_375) {
		return [`sua-thuoc khi co vong da ky cho gop ma chua hoi lan chu: ${d.slug} PR #${d.vong_ky_cho_gop.map((p) => p.number).join(", #")}`];
	}
	return [];
}

export function chupVongKy(prs, docTepTaiDau) {
	return prs
		.filter((p) => !NHANH_VONG.some((re) => re.test(p.headRefName)))
		.filter((p) =>
			(p.files ?? []).some((f) => {
				if (!/^_acceptance\/[^/]+\/contract\.md$/.test(f.path)) return false;
				const text = docTepTaiDau(p, f.path) ?? "";
				const m = text.match(/^status:[ \t]*([^\s#]+)/m);
				return m && DA_KY.includes(m[1]);
			}),
		)
		.map((p) => ({ number: p.number, headRefName: p.headRefName }));
}

function docTepGh(p, path) {
	spawnSync("git", ["-C", GOC, "fetch", "-q", "origin", `refs/pull/${p.number}/head`]);
	const r = spawnSync("git", ["-C", GOC, "show", `${p.headRefOid}:${path}`], { encoding: "utf8" });
	return r.status === 0 ? r.stdout : null;
}

function ghi() {
	const r = spawnSync("gh", ["pr", "list", "--state", "open", "--limit", "100", "--json", "number,headRefName,headRefOid,files"], { cwd: GOC, encoding: "utf8" });
	if (r.status !== 0) {
		console.error(`sua-thuoc --ghi: gh pr list hong: ${(r.stderr || "").trim()}`);
		process.exit(2);
	}
	console.log(JSON.stringify(chupVongKy(JSON.parse(r.stdout), docTepGh)));
}

function chay(lanChu) {
	const so = docSoXuLy(docJson(join(HO_SO, "xu-ly.json")));
	const dongSua = so.dong.filter((d) => d.cach === "sua-thuoc");
	const loi = lanChu ? so.dong.flatMap(kiemLanChu) : dongSua.flatMap((d) => kiemSuaThuoc(d, so.base));
	console.log(`sua-thuoc${lanChu ? " --lan-chu" : ""}: ${dongSua.length} dong sua-thuoc, ${so.dong.length} dong so`);
	if (loi.length) {
		console.log(loi.join("\n"));
		console.log("KET LUAN: do");
		process.exit(1);
	}
	const hong = lanChu ? caDoLanChu() : caDoSuaThuoc(so.base);
	if (hong) {
		console.log("KET LUAN: do — thuoc hong");
		process.exit(1);
	}
	console.log("KET LUAN: xanh");
}

function bao(ten, loi, dau) {
	if (loi.some((x) => x.includes(dau))) {
		console.log(`BAT ${ten}`);
		return false;
	}
	console.log(`thuoc hong: ${ten}`);
	return true;
}

function caDoSuaThuoc(base) {
	const commitApps = git(GOC, "log", "-1", "--format=%H", base, "--", "apps/");
	const slug = "khong-do-them-chay-gh";
	const goc = {
		slug,
		evals: ["E1"],
		cach: "sua-thuoc",
		run_id: "repin-20000101T000000Z-1",
		ly_do: "mau",
		commit_sua: commitApps,
		tep_thuoc: [`_acceptance/${slug}/rang/x.mjs`],
		duong_tinh: { log: `_acceptance/${slug}/contract.md`, ma: 0 },
		tiem_do: { log: `_acceptance/${slug}/contract.md`, ma: 1, thong_diep: "Acceptance Contract" },
		vong_ky_cho_gop: [],
	};
	let hong = false;
	hong = bao("ngoai-thuoc", kiemSuaThuoc(goc, base), "commit cham ngoai thuoc") || hong;
	hong = bao("sai-thong-diep", kiemSuaThuoc({ ...goc, tiem_do: { ...goc.tiem_do, thong_diep: "chuoi-khong-co-trong-nhat-ky" } }, base), "sai-thong-diep") || hong;
	const docGia = (p) => {
		const t = readFileSync(join(GOC, p), "utf8");
		return p.endsWith("contract.md") ? t.replace(/^- AC-1: /m, "- AC-1: (doi) ") : t;
	};
	hong = bao("doi-loi-ac", kiemSuaThuoc(goc, base, { docTep: docGia }), "doi-loi-ac") || hong;
	const docGiaDong2 = (p) => {
		const t = readFileSync(join(GOC, p), "utf8");
		return p.endsWith("contract.md") ? t.replace(/^(- AC-1:.*\n\s+)(\S)/m, "$1(doi) $2") : t;
	};
	hong = bao("doi-loi-ac-dong-sau", kiemSuaThuoc(goc, base, { docTep: docGiaDong2 }), "doi-loi-ac") || hong;
	return hong;
}

function caDoLanChu() {
	const mau = { slug: "x", evals: ["E1"], cach: "sua-thuoc", vong_ky_cho_gop: [{ number: 1 }] };
	let hong = false;
	hong = bao("chua-hoi-lan-chu", kiemLanChu(mau), "chua hoi lan chu") || hong;
	hong = bao("cho-khong-pr", kiemLanChu({ slug: "x", cach: "cho-lan-chu", pr: [] }), "cho-khong-pr") || hong;
	const prGia = [{ number: 9, headRefName: "feat/khac", headRefOid: "0", files: [{ path: "_acceptance/ho-so-khac/contract.md" }] }];
	const chup = chupVongKy(prGia, () => "---\nstatus: signed-off\n---\n");
	hong = bao("lan-chu-khac-slug", chup.length ? ["lan-chu-khac-slug"] : [], "lan-chu-khac-slug") || hong;
	return hong;
}

const argv = process.argv.slice(2);
if (argv[0] === "--ghi") ghi();
else chay(argv[0] === "--lan-chu");
