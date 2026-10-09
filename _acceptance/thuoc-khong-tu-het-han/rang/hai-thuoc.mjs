import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ey, GOC, git, LoiNeo, MOC_GOC } from "./neo.mjs";

const THUOC = {
	e7: {
		hoSo: "ha-tran-thang-hoi-zalo",
		id: "E7",
		criterion: "AC-6",
		tep: "_acceptance/ha-tran-thang-hoi-zalo/rang/khong-cham-da-ky.mjs",
		neo: "9dc1a037c6a1e1c4cc9d0eb03eaef5bbe5c2f6cc",
		cuDo: "hong: cham ho so da ky _acceptance/hoi-crm-qua-zalo/contract.md",
		moiXanh: "ok: khong cham ho so da ky",
		chieuDo: [["--gia-tep", "_acceptance/hoi-crm-qua-zalo/contract.md"], "hong: cham ho so da ky _acceptance/hoi-crm-qua-zalo/contract.md"],
	},
	e10: {
		hoSo: "slack-thieu-quyen-email",
		id: "E10",
		criterion: "AC-10",
		tep: "_acceptance/slack-thieu-quyen-email/rang/khong-sua-tep-hang.mjs",
		neo: "52e00cad2593373c1f1c05ffa00005d1cbab980c",
		cuDo: "COMMIT KHONG TEN",
		moiXanh: "khong-sua-tep-hang: khong tep nao cua hang bi sua",
		chieuDo: [["--gia-tep", "apps/agent/agent/lib/run-runtime.ts"], "TEP HANG: apps/agent/agent/lib/run-runtime.ts"],
		chieuDo2: [["--gia-commit-khong-ten"], "COMMIT KHONG TEN"],
		tapCommit: [
			"fe8fef508c694ef7b95e248549a13ba336d85a3d", "df6047ba8b341f101e875b075cbb555fa357c405",
			"feb1fa5c6e66877203e0f45f79b58c58ba512901", "7e8e75f3f7329877203910f4913ff5204013f467",
			"0be0b0fbff823ec79715e267c4c4a6e9d5b9d03b", "9399756cd9c97bfbc792102c4f4ce2678bd863f2",
			"a095649bc85a7c36196c51c6a11b6cacaeb1eaa6", "d040fdf509d4d0068baa81b69aaba55486c3b989",
			"05d282231aaaa1c3467c5ed75c96fed30d34a807", "2fdd1ef0d01f2665a3af63f80a202c20474b1a36",
			"ad1edeedb2a701dfb27034b8c30ef14ff1cf7590", "dfb9f7ba285f93e1a224204936e06a22f2ecd9a9",
			"07a39742239ea1c7f51242212196ca1db5c5be98", "3e90ff6c3fb73906e7c2c69acb38ea4d4886d3e1",
			"187808af4cf0c5ee181953b4ef3775967f1900c4", "c5254b342704aea58374ccbd2a01df711dbd2325",
		],
	},
};

const chay = (cwd, tep, thamSo = []) => {
	const r = spawnSync("node", [tep, ...thamSo], { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
	return { ma: r.status, ra: `${r.stdout ?? ""}${r.stderr ?? ""}` };
};
const gitTam = (cay, ...a) => execFileSync("git", ["-C", cay, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

function dungCayTam() {
	const cay = mkdtempSync(join(tmpdir(), "hai-thuoc-"));
	gitTam(cay, "clone", "--quiet", "--shared", "--no-checkout", GOC, ".");
	gitTam(cay, "checkout", "--quiet", "--detach", MOC_GOC);
	gitTam(cay, "update-ref", "refs/remotes/origin/onehub", git("rev-parse", MOC_GOC).trim());
	gitTam(cay, "update-ref", "refs/remotes/origin/release", git("rev-parse", "origin/release").trim());
	const tep = join(cay, "_acceptance/hoi-crm-qua-zalo/contract.md");
	writeFileSync(tep, `${readFileSync(tep, "utf8")}\n`);
	gitTam(cay, "-c", "user.name=gia", "-c", "user.email=gia@local", "commit", "--quiet", "-am", "fix: gia");
	return cay;
}

function kiemMot(ten, t, cay) {
	const loi = [];
	const cu = chay(cay, join(cay, t.tep));
	if (cu.ma !== 1 || !cu.ra.includes(t.cuDo)) loi.push(`${ten} ban cu tren cay tam: ma ${cu.ma}, mong 1 «${t.cuDo}»`);
	const banNeo = join(cay, t.tep.replace(/\.mjs$/, ".neo.mjs"));
	copyFileSync(join(GOC, t.tep), banNeo);
	const moiTam = chay(cay, banNeo);
	if (moiTam.ma !== 0 || !moiTam.ra.includes(t.moiXanh)) loi.push(`${ten} ban neo tren cay tam: ma ${moiTam.ma} — ${moiTam.ra.trim().split("\n").at(-1)}`);
	const moiThat = chay(GOC, join(GOC, t.tep));
	if (moiThat.ra !== moiTam.ra) loi.push(`${ten} ban neo cho dau ra khac nhau o hai ref`);
	if (!moiThat.ra.includes(t.neo.slice(0, 9))) loi.push(`${ten} ban neo khong in moc ${t.neo.slice(0, 9)}`);
	for (const cd of [t.chieuDo, t.chieuDo2].filter(Boolean)) {
		const r = chay(GOC, join(GOC, t.tep), cd[0]);
		if (r.ma !== 1 || !r.ra.includes(cd[1])) loi.push(`${ten} chieu do ${cd[0].join(" ")}: ma ${r.ma}, mong 1 «${cd[1]}»`);
	}
	if (t.tapCommit) {
		const tap = git("log", "--no-merges", "--format=%H", `--grep=${t.hoSo}`, `a62adb16..${t.neo}^2`).trim().split("\n");
		if (JSON.stringify(tap) !== JSON.stringify(t.tapCommit)) loi.push(`${ten} tap commit khac danh sach ghim (${tap.length} vs ${t.tapCommit.length})`);
		if (!moiThat.ra.includes(`${t.tapCommit.length} commit mang ten`)) loi.push(`${ten} ban neo khong in ${t.tapCommit.length} commit mang ten`);
		const lk = chay(GOC, join(GOC, t.tep), ["--liet-ke"]);
		const inRa = [...lk.ra.matchAll(/^commit: ([0-9a-f]{40})$/gm)].map((m) => m[1]);
		if (JSON.stringify(inRa) !== JSON.stringify(t.tapCommit)) loi.push(`${ten} tap sha thuoc in ra (${inRa.length}) khac danh sach ghim (${t.tapCommit.length})`);
	}
	const gopDau = git("log", "--first-parent", "--format=%H", "origin/onehub", "--", `_acceptance/${t.hoSo}/contract.md`).trim().split("\n").at(-1);
	if (gopDau !== t.neo) loi.push(`${ten} commit gop dau tien dua ${t.hoSo} len onehub la ${gopDau.slice(0, 9)}, khong phai ${t.neo.slice(0, 9)}`);
	const ev = ey.parseEvals(readFileSync(join(GOC, `_acceptance/${t.hoSo}/evals.yaml`), "utf8"), ["criterion", "expected"]).find((e) => e.id === t.id);
	const khoi = readFileSync(join(GOC, `_acceptance/${t.hoSo}/evals.yaml`), "utf8").split(/\n  - id: /).find((b) => b.startsWith(`${t.id}\n`)) ?? "";
	if (String(ev?.criterion ?? "").trim() !== t.criterion) loi.push(`${ten} criterion «${ev?.criterion}», mong ${t.criterion}`);
	if (!khoi.includes(t.neo.slice(0, 9))) loi.push(`${ten} expected khong nhac ${t.neo.slice(0, 9)}`);
	if (khoi.includes("origin/onehub")) loi.push(`${ten} expected con nhac origin/onehub`);
	console.log(`${ten}: ban cu ma ${cu.ma}, ban neo ma ${moiTam.ma}/${moiThat.ma}, ${loi.length ? "LECH" : "dung"}`);
	return loi;
}

const chon = process.argv.slice(2).map((a) => a.replace(/^--/, "")).filter((a) => a in THUOC);
const loi = [];
let cay;
try {
	cay = dungCayTam();
	for (const ten of chon.length ? chon : Object.keys(THUOC)) loi.push(...kiemMot(ten, THUOC[ten], cay));
} catch (e) {
	if (!(e instanceof LoiNeo) && !String(e.message).startsWith("Command failed")) throw e;
	loi.push(`khong do duoc: ${String(e.stderr ?? e.message).trim().split("\n")[0]}`);
} finally {
	if (cay) rmSync(cay, { recursive: true, force: true });
}
if (loi.length) {
	console.error(`hai-thuoc: DO\n${loi.map((l) => `  - ${l}`).join("\n")}`);
	process.exitCode = 1;
} else console.log("hai-thuoc: XANH");
