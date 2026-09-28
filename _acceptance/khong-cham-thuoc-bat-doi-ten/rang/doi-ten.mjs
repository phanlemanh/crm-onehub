import { execFileSync, spawnSync } from "node:child_process";
import {
	appendFileSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const THUOC = "_acceptance/bo-chu-lap-keo-tha/rang/khong-cham-thuoc.mjs";
const CO_DOI_TEN = '"--no-renames", ';
const SO_CHO_DOI_TEN = 2;
const DANH_TINH = [
	"-c",
	"user.name=do-doi-ten",
	"-c",
	"user.email=do-doi-ten@thu.test",
];
const KHOANG_COMMIT = ["--tu", "HEAD~1", "--den", "HEAD"];

const CA = {
	C1: {
		doi: [
			"packages/ui/test/nguon-keo-tha.dom.tsx",
			"packages/ui/test/da-doi-ten.dom.tsx",
		],
		commit: true,
		thamSo: KHOANG_COMMIT,
		ma: 1,
		duong: "packages/ui/test/nguon-keo-tha.dom.tsx",
		dauLo: "1 tep doi, 0 tep bi cam",
	},
	C2: {
		doi: [
			"_acceptance/nguon-keo-tha-reui/gap-probe.md",
			"docs/gap-probe-cu.md",
		],
		commit: true,
		thamSo: KHOANG_COMMIT,
		ma: 1,
		duong: "_acceptance/nguon-keo-tha-reui/gap-probe.md",
		dauLo: "1 tep doi, 0 tep bi cam",
	},
	C3: {
		doi: [
			"apps/app/test/tai-lieu-nguon.dom.tsx",
			"apps/app/test/da-doi-ten.dom.tsx",
		],
		commit: false,
		thamSo: [],
		ma: 1,
		duong: "apps/app/test/tai-lieu-nguon.dom.tsx",
		dauLo: "0 tep bi cam",
	},
	C4: { thamSo: [], ma: 0, chua: "0 tep bi cam" },
	C5: {
		sua: "packages/ui/test/nguon-canh-nhau.dom.tsx",
		thamSo: [],
		ma: 1,
		duong: "packages/ui/test/nguon-canh-nhau.dom.tsx",
	},
	C6: {
		thamSo: ["--tu", "khong-co-ref", "--den", "HEAD"],
		ma: 2,
		chua: "KHONG DO DUOC",
	},
};
const CA_DOI_TEN = ["C1", "C2", "C3"];

class KhongDo extends Error {}

function git(noi, ...thamSo) {
	return execFileSync("git", thamSo, {
		cwd: noi,
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});
}

function doiSo(ten) {
	const i = process.argv.indexOf(ten);
	return i < 0 ? null : (process.argv[i + 1] ?? null);
}

function goCoDoiTen(wt) {
	const tep = join(wt, THUOC);
	const truoc = readFileSync(tep, "utf8");
	const soCho = truoc.split(CO_DOI_TEN).length - 1;
	if (soCho !== SO_CHO_DOI_TEN)
		throw new KhongDo(
			`${THUOC} co ${soCho} cho --no-renames, mong ${SO_CHO_DOI_TEN}`,
		);
	const sau = truoc.replaceAll(CO_DOI_TEN, "");
	writeFileSync(tep, sau);
}

function chuanBi(wt, ca) {
	if (ca.doi) git(wt, "mv", ...ca.doi);
	if (ca.commit) git(wt, ...DANH_TINH, "commit", "-q", "-m", "do doi ten");
	if (ca.sua) appendFileSync(join(wt, ca.sua), "\n");
}

function tepBiCham(ra) {
	return ra.match(/^cham thuoc da ky: (.*)$/m)?.[1]?.split(", ") ?? [];
}

function chayCa(wt, goc, ten, chieuDo) {
	const ca = CA[ten];
	git(wt, "reset", "-q", "--hard", goc);
	git(wt, "clean", "-fdq");
	if (chieuDo) goCoDoiTen(wt);
	chuanBi(wt, ca);
	const r = spawnSync("node", [join(wt, THUOC), ...ca.thamSo], {
		cwd: wt,
		encoding: "utf8",
	});
	const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim();
	if (chieuDo) return soDauLo(ten, ca, r.status, ra);
	const bi = tepBiCham(ra);
	const khop = ca.duong
		? bi.length === 1 && bi[0] === ca.duong
		: ra.includes(ca.chua);
	const dat = r.status === ca.ma && khop;
	if (dat) console.log(`${ten}: dat`);
	else
		console.log(
			`${ten}: lech — mong ma ${ca.ma} ${ca.duong ?? ca.chua}, duoc ma ${r.status}: ${ra.slice(0, 300)}`,
		);
	return dat;
}

function soDauLo(ten, ca, ma, ra) {
	if (ma === 0 && ra.includes(ca.dauLo)) {
		console.log(`thuoc bo sot doi ten: ${ten}`);
		return false;
	}
	console.log(`chieu do: HONG DOT BIEN ${ten} ma ${ma}: ${ra.slice(0, 300)}`);
	return true;
}

function chon(chieuDo) {
	const mac = chieuDo ? CA_DOI_TEN : Object.keys(CA);
	const ds = (doiSo("--ca")?.split(",") ?? mac)
		.map((c) => c.trim())
		.filter(Boolean);
	for (const c of ds) if (!CA[c]) throw new KhongDo(`khong co ca ${c}`);
	if (chieuDo && ds.some((c) => !CA_DOI_TEN.includes(c)))
		throw new KhongDo("--chieu-do chi nhan ca doi ten C1, C2, C3");
	return ds;
}

function chay() {
	const chieuDo = process.argv.includes("--chieu-do");
	const ds = chon(chieuDo);
	const goc = git(GOC, "rev-parse", "HEAD").trim();
	const tam = mkdtempSync(join(tmpdir(), "kct-doi-ten-"));
	const wt = join(tam, "crm");
	try {
		git(GOC, "worktree", "add", "--detach", "--quiet", wt, goc);
		const ket = ds.map((c) => [c, chayCa(wt, goc, c, chieuDo)]);
		if (!chieuDo) return ket.every(([, d]) => d) ? 0 : 1;
		const van = ket.filter(([, d]) => d).map(([c]) => c);
		if (van.length === 0) {
			console.log(
				`chieu do: DO DUNG GHIM: ${ds.length} ca in «thuoc bo sot doi ten»`,
			);
			return 0;
		}
		console.log(`chieu do: LOT: ${van.join(", ")} khong ra dau lo doi ten`);
		return 1;
	} finally {
		try {
			git(GOC, "worktree", "remove", "--force", wt);
		} catch {}
		rmSync(tam, { recursive: true, force: true });
		try {
			git(GOC, "worktree", "prune");
		} catch {}
	}
}

let ma = 2;
try {
	ma = chay();
} catch (e) {
	console.log(
		`KHONG DO DUOC: ${e instanceof KhongDo ? e.message : String(e?.stack ?? e).slice(0, 400)}`,
	);
	ma = 2;
}
process.exit(ma);
