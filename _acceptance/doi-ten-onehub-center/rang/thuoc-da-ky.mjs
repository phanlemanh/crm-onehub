import { execFileSync, spawnSync } from "node:child_process";
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA = join(
	GOC,
	".acceptance-runs",
	"doi-ten-onehub-center",
	"thuoc-da-ky",
);
const LAN_MAY = new Set(["test", "script"]);
const LA_THUOC = /(^_acceptance\/|\/test\/|\.spec\.|\.test\.|\.dom\.tsx$)/;
const DA_KY = new Set(["signed-off", "machine-cleared"]);
const THAY_THE = [
	{
		tep: "apps/app/test/cua-vao-shell.dom.tsx",
		ma: ["coHieuUngNen(trai)", 'toContain("CRM")', "some(coHieuUngNen)"],
		so: "cua-vao-dang-nhap/E2",
	},
	{
		tep: "_acceptance/cua-vao-dang-nhap/rang/do-cua-vao.mjs",
		ma: ["khong-shader"],
		so: "cua-vao-dang-nhap/E11",
	},
];
const SO_THAY_THE_KHAC = ["cua-vao-dang-nhap/E14"];
const NEO_LAI = [
	{
		tep: "_acceptance/man-xin-quyen-co-rang/rang/chieu-do.mjs",
		cu: "CRM",
		moi: "OneHub Center đọc",
		ly: "sau khi the ten, cau tieng Anh cung bat dau bang ten nen regex phai neo vao cau tieng Viet de giu dung dot bien cu",
	},
];
const TEN =
	/\b(?:the |your |this |The |This |Your )?(?:OneHub )?CRM(?: OneHub)?\b|\bOneHub Center\b/g;
const DAU = "\u0000TEN\u0000";

const dong = [];
function ghi(dat, chu) {
	dong.push(dat);
	console.log(`${dat ? "DUNG" : "SAI"} ${chu}`);
}

function git(...doi) {
	return execFileSync("git", ["-C", GOC, ...doi], {
		encoding: "utf8",
		maxBuffer: 256 * 1024 * 1024,
	}).trim();
}

function gitThu(...doi) {
	try {
		return git(...doi);
	} catch {
		return "";
	}
}

export function chuan(s) {
	return s.replace(TEN, DAU);
}

function giaiRef(cauHinh, ref) {
	if (!ref?.startsWith("config:")) return ref;
	let nut = cauHinh;
	for (const k of ref.slice("config:".length).split(".")) nut = nut?.[k];
	if (nut === undefined || nut === null || nut instanceof Object) {
		throw new Error(`khong giai duoc ${ref}`);
	}
	return String(nut);
}

function hoSoDaKy(goc = GOC) {
	return git("ls-files", "_acceptance/*/contract.md")
		.split("\n")
		.filter(Boolean)
		.map((t) => t.split("/")[1])
		.filter((slug) => {
			const c = readFileSync(
				join(goc, "_acceptance", slug, "contract.md"),
				"utf8",
			);
			return DA_KY.has(c.match(/^status:\s*(\S+)/m)?.[1] ?? "");
		});
}

export function tepTrongLenh(lenh) {
	const cwds = [
		".",
		...[...lenh.matchAll(/\bcd\s+([^\s&;"']+)\s*&&/g)].map((m) => m[1]),
	];
	return [
		...lenh.matchAll(
			/(?:\.\/|\.\.\/)?[\w@.\/()\[\]-]+\.(?:tsx?|mjs|cjs|sh|json)\b/g,
		),
	]
		.map((a) => a[0])
		.flatMap((f) => [...cwds.map((c) => join(c, f)), f])
		.map((f) => f.replace(/^\.\//, ""))
		.filter((f) => existsSync(join(GOC, f)))
		.filter((f) => LA_THUOC.test(f));
}

export function rutDanhSach(doi) {
	const cauHinh = Bun.YAML.parse(
		readFileSync(join(GOC, "_acceptance/config.yaml"), "utf8"),
	);
	const may = [];
	const tepThuoc = new Set();
	for (const slug of hoSoDaKy()) {
		const tepEvals = join(GOC, "_acceptance", slug, "evals.yaml");
		if (!existsSync(tepEvals)) continue;
		for (const ev of Bun.YAML.parse(readFileSync(tepEvals, "utf8")).evals ??
			[]) {
			if (!LAN_MAY.has(ev.executor) || ev.status === "not-run") continue;
			const lenh = giaiRef(cauHinh, ev.cmd);
			for (const t of tepTrongLenh(lenh)) tepThuoc.add(t);
			const cham = (ev.paths ?? []).some((p) =>
				doi.some((d) => new Bun.Glob(p).match(d)),
			);
			if (cham) may.push({ ten: `${slug}/${ev.id}`, lenh });
		}
	}
	const cuaHoSo = (t) =>
		hoSoDaKy().some((s) => t.startsWith(`_acceptance/${s}/`));
	const thuocBiCham = doi.filter((t) => cuaHoSo(t) || tepThuoc.has(t));
	return { may, thuocBiCham };
}

function hunk(tep, base) {
	const ra = [];
	let cur = null;
	for (const l of gitThu("diff", "-U0", base, "HEAD", "--", tep).split("\n")) {
		if (l.startsWith("@@")) {
			cur = { bo: [], them: [] };
			ra.push(cur);
		} else if (cur && l.startsWith("-") && !l.startsWith("---"))
			cur.bo.push(l.slice(1));
		else if (cur && l.startsWith("+") && !l.startsWith("+++"))
			cur.them.push(l.slice(1));
	}
	return ra;
}

export function catCap(cu, moi) {
	let dau = 0;
	while (dau < cu.length && dau < moi.length && cu[dau] === moi[dau]) dau++;
	let cuoi = 0;
	while (
		cuoi < cu.length - dau &&
		cuoi < moi.length - dau &&
		cu[cu.length - 1 - cuoi] === moi[moi.length - 1 - cuoi]
	)
		cuoi++;
	const chu = /[\p{L}\p{N}_]/u;
	while (dau > 0 && chu.test(cu[dau - 1])) dau--;
	while (cuoi > 0 && chu.test(cu[cu.length - cuoi])) cuoi--;
	return {
		cu: cu.slice(dau, cu.length - cuoi),
		moi: moi.slice(dau, moi.length - cuoi),
	};
}

function trongSanPham(chuoi, ref) {
	if (!chuoi) return false;
	return (
		gitThu(
			"grep",
			"-l",
			"-F",
			"-e",
			chuoi,
			ref,
			"--",
			".",
			":(exclude)*/test/*",
			":(exclude)*.spec.*",
			":(exclude)*.dom.tsx",
			":(exclude)_acceptance",
		) !== ""
	);
}

export function capHopLe(cap, base) {
	if (!/\bCRM\b/.test(cap.cu)) return false;
	if (
		NEO_LAI.some(
			(n) => n.tep === cap.tep && n.cu === cap.cu && n.moi === cap.moi,
		)
	)
		return true;
	if (chuan(cap.cu) === chuan(cap.moi)) return true;
	if (cap.dongCu !== undefined && chuan(cap.dongCu) === chuan(cap.dongMoi))
		return true;
	if (chuan(cap.cu) === DAU) return false;
	return trongSanPham(cap.cu, base) && trongSanPham(cap.moi, "HEAD");
}

function soThuoc(thuocBiCham, base) {
	const bang = [];
	const soDaKy = readFileSync(
		join(GOC, "_acceptance/doi-ten-onehub-center/decisions.jsonl"),
		"utf8",
	)
		.split("\n")
		.filter(Boolean)
		.map((l) => JSON.parse(l).supersedes)
		.filter(Boolean);
	for (const tep of thuocBiCham) {
		if (!existsSync(join(GOC, tep))) {
			ghi(false, `the: ${tep} bi xoa`);
			continue;
		}
		if (!gitThu("ls-tree", base, "--", tep)) continue;
		const thayThe = THAY_THE.find((x) => x.tep === tep);
		let lech = 0;
		for (const h of hunk(tep, base)) {
			const la = [...h.bo, ...h.them].join("\n");
			if (thayThe?.ma.some((m) => la.includes(m))) continue;
			if (h.bo.length !== h.them.length) {
				lech++;
				continue;
			}
			h.bo.forEach((cu, i) =>
				bang.push({
					tep,
					dongCu: cu,
					dongMoi: h.them[i],
					...catCap(cu, h.them[i]),
				}),
			);
		}
		ghi(
			lech === 0,
			lech === 0
				? `the ${tep}`
				: `the: ${tep} (${lech} hunk khong phai phep the ten)`,
		);
	}
	for (const cap of bang) {
		const hop = capHopLe(cap, base);
		ghi(
			hop,
			hop
				? `cap «${cap.cu}» -> «${cap.moi}»`
				: `bang the: «${cap.cu}» -> «${cap.moi}» (${cap.tep})`,
		);
	}
	for (const so of [...THAY_THE.map((x) => x.so), ...SO_THAY_THE_KHAC]) {
		ghi(
			soDaKy.includes(so),
			soDaKy.includes(so)
				? `thay the ${so} co dong supersedes`
				: `thay the khong co so: ${so}`,
		);
	}
	writeFileSync(
		join(HERE, "bang-the.json"),
		`${JSON.stringify(
			bang.map(({ cu, moi }) => ({ cu, moi })),
			null,
			"\t",
		)}\n`,
	);
}

function doiChung() {
	const lenhLong =
		'bun run test -- "cd apps/agent && bun test test/noi-zalo-cho-nguoi-moi.integration.spec.ts"';
	const bat = tepTrongLenh(lenhLong).includes(
		"apps/agent/test/noi-zalo-cho-nguoi-moi.integration.spec.ts",
	);
	ghi(
		bat,
		`doi chung lenh cd long trong chuoi: ${bat ? "bat duoc" : "BO SOT"} tep thuoc`,
	);
	const tot = catCap(
		'expect(x).toBe("Đăng nhập vào CRM");',
		'expect(x).toBe("Đăng nhập vào OneHub Center");',
	);
	ghi(
		chuan(tot.cu) === chuan(tot.moi),
		`doi chung the ten: «${tot.cu}» -> «${tot.moi}»`,
	);
	const xau = catCap("expect(n).toBe(2);", "expect(n).toBe(3);");
	ghi(
		!capHopLe({ tep: "x", ...xau }, "HEAD"),
		`doi chung nhat nho so: «${xau.cu}» -> «${xau.moi}» bi loai`,
	);
	ghi(
		!capHopLe({ tep: "x", cu: "CRM", moi: "OneHub Center đọc" }, "HEAD"),
		"doi chung ten tran them chu ngoai bang neo lai: bi loai",
	);
}

function chayTrenCay(cay, nhan, danhSach) {
	const thu = join(RA, nhan);
	rmSync(thu, { recursive: true, force: true });
	mkdirSync(thu, { recursive: true });
	const maFile = join(thu, "ma.txt");
	const lenh = danhSach.map((e, i) => {
		const tep = join(thu, `lenh-${i}.sh`);
		writeFileSync(tep, `cd "${cay}" && ${e.lenh}\n`);
		return `bash "${tep}" > "${join(thu, `log-${i}.txt`)}" 2>&1; echo "${i} $?" >> "${maFile}"`;
	});
	const runner = join(thu, "chay.sh");
	writeFileSync(runner, `${lenh.join("\n")}\n`);
	spawnSync("bun", ["run", "do:man", "--chay", `bash ${runner}`], {
		cwd: cay,
		stdio: ["ignore", "inherit", "inherit"],
		env: { ...process.env, PHIEN_DO_TEN_CAY: `dtoc-thuoc-${nhan}` },
	});
	if (!existsSync(maFile))
		throw new Error(`${nhan}: phien do khong chay lenh nao`);
	const ma = new Map(
		readFileSync(maFile, "utf8")
			.trim()
			.split("\n")
			.map((l) => l.split(" ").map(Number)),
	);
	return danhSach.map((_, i) => ma.get(i) ?? -1);
}

function dungCayBase(base) {
	const wt = join(RA, "cay-base");
	gitThu("worktree", "remove", "--force", wt);
	git("worktree", "add", "--detach", wt, base);
	if (
		spawnSync("bun", ["install", "--frozen-lockfile"], { cwd: wt }).status !== 0
	) {
		throw new Error("cay base: bun install that bai");
	}
	if (existsSync(join(GOC, ".env")))
		copyFileSync(join(GOC, ".env"), join(wt, ".env"));
	if (
		spawnSync("bun", ["run", "db:generate"], {
			cwd: join(wt, "packages", "db"),
		}).status !== 0
	) {
		throw new Error("cay base: db:generate that bai");
	}
	return wt;
}

function soEval(may, base) {
	const wt = dungCayBase(base);
	try {
		const maBase = chayTrenCay(wt, "base", may);
		const maHead = chayTrenCay(GOC, "head", may);
		const doLai = may.filter((_, i) => maBase[i] === 0 && maHead[i] !== 0);
		const maLai = doLai.length ? chayTrenCay(GOC, "head-lai", doLai) : [];
		may.forEach((e, i) => {
			if (maBase[i] !== 0) {
				console.log(
					`GHI CHU ${e.ten}: base ${maBase[i]} -> head ${maHead[i]} (base khong dat, khong tinh)`,
				);
				return;
			}
			const lai = doLai.indexOf(e);
			const cuoi = lai >= 0 ? maLai[lai] : maHead[i];
			ghi(
				cuoi === 0,
				cuoi === 0
					? `${e.ten}: base 0 -> head 0`
					: `${e.ten}: base 0 -> head ${cuoi}`,
			);
		});
	} finally {
		gitThu("worktree", "remove", "--force", wt);
	}
}

function main() {
	const base = git("merge-base", "HEAD", "origin/onehub");
	const doi = git("diff", "--name-only", base, "HEAD")
		.split("\n")
		.filter(Boolean);
	const { may, thuocBiCham } = rutDanhSach(doi);
	console.log(
		`MA TRAN ${may.length} eval may da ky giao diff; ${thuocBiCham.length} tep thuoc bi cham`,
	);
	doiChung();
	soThuoc(thuocBiCham, base);
	if (!process.argv.includes("--chi-tinh")) soEval(may, base);
	const sai = dong.filter((d) => !d).length;
	console.log(`KET LUAN ${dong.length - sai} DUNG, ${sai} SAI`);
	console.log(`EXIT ${sai ? 1 : 0}`);
	process.exit(sai ? 1 : 0);
}

if (import.meta.main) {
	try {
		main();
	} catch (loi) {
		console.log(`KHONG DO DUOC: ${loi.message}`);
		console.log("EXIT 2");
		process.exit(2);
	}
}
