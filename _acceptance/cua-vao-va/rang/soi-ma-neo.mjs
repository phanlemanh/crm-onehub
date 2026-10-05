import { spawnSync } from "node:child_process";
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
const RANG_CU = "_acceptance/cua-vao-dang-nhap/rang";
const MERGE = "d864d529";
const NHA = join(GOC, ".acceptance-runs", "cua-vao-va", "soi-ma-neo");
const NOI_ONEHUB = join(NHA, "onehub");
const NOI_NONG = join(NHA, "nong");

const dong = [];
const ghi = (dat, chu) => dong.push({ dat, chu });

function chay(lenh, doi, cwd, env = {}) {
	const r = spawnSync(lenh, doi, {
		cwd,
		encoding: "utf8",
		env: { ...process.env, ...env },
	});
	return { ma: r.status, ra: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

function soDanhSach(ra) {
	const m = ra.match(/danh-sach: (\d+) tep/);
	return m ? Number(m[1]) : -1;
}

function chepRang(dich) {
	mkdirSync(join(dich, RANG_CU), { recursive: true });
	for (const t of ["soi-ma.mjs", "tep-vong.txt"]) {
		copyFileSync(join(GOC, RANG_CU, t), join(dich, RANG_CU, t));
	}
}

function soiTai(goc, env = {}) {
	return chay("bun", [join(goc, RANG_CU, "soi-ma.mjs")], goc, env);
}

function tapMerge() {
	const r = chay(
		"git",
		["-C", GOC, "diff", "--name-only", `${MERGE}^1`, MERGE, "--", "apps/app"],
		GOC,
	);
	return r.ra
		.split("\n")
		.filter((t) => /\.(ts|tsx)$/.test(t) && !t.startsWith("apps/app/test/"));
}

function soTap(tepVong) {
	const dongBang = readFileSync(tepVong, "utf8")
		.split("\n")
		.map((t) => t.trim())
		.filter((t) => t !== "");
	const that = tapMerge();
	return {
		thieu: that.filter((t) => !dongBang.includes(t)),
		thua: dongBang.filter((t) => !that.includes(t)),
	};
}

function don() {
	if (existsSync(NOI_ONEHUB)) {
		chay("git", ["-C", GOC, "worktree", "remove", "--force", NOI_ONEHUB], GOC);
	}
	rmSync(NHA, { recursive: true, force: true });
}

try {
	don();
	mkdirSync(NHA, { recursive: true });

	const tai = soiTai(GOC);
	const n = soDanhSach(tai.ra);
	ghi(
		tai.ma === 0 && n > 0,
		`cay hien tai: soi-ma ma ${tai.ma}, danh sach ${n} tep tu cap ${MERGE}`,
	);

	chay(
		"git",
		["-C", GOC, "worktree", "add", "--detach", NOI_ONEHUB, "origin/onehub"],
		GOC,
	);
	chepRang(NOI_ONEHUB);
	const oh = soiTai(NOI_ONEHUB);
	ghi(
		oh.ma === 0 && soDanhSach(oh.ra) === n,
		`origin/onehub: soi-ma ma ${oh.ma}, danh sach ${soDanhSach(oh.ra)} tep`,
	);

	chay(
		"git",
		["clone", "--quiet", "--depth", "1", `file://${GOC}`, NOI_NONG],
		GOC,
	);
	const coRef =
		chay(
			"git",
			["-C", NOI_NONG, "cat-file", "-e", `${MERGE}^{commit}`],
			NOI_NONG,
		).ma === 0;
	chepRang(NOI_NONG);
	const nong = soiTai(NOI_NONG);
	ghi(
		nong.ma === 0 && soDanhSach(nong.ra) === n && !coRef,
		`clone nong (co ${MERGE}: ${coRef}): soi-ma ma ${nong.ma}, danh sach ${soDanhSach(nong.ra)} tep`,
	);

	const dsTep = readFileSync(join(GOC, RANG_CU, "tep-vong.txt"), "utf8")
		.split("\n")
		.filter((t) => t.trim() !== "");
	const tepPha = dsTep.find((t) => t.endsWith(".tsx"));
	if (tepPha) {
		const duong = join(NOI_NONG, tepPha);
		const goc = readFileSync(duong, "utf8").replace(/^"use client";\n/, "");
		writeFileSync(
			duong,
			`"use client";\nimport { auth } from "@crm/auth";\n${goc}`,
		);
		const pha = soiTai(NOI_NONG);
		ghi(
			pha.ma === 1 && pha.ra.includes("(a) tep client nhap @crm/auth"),
			`pha-thu: ${tepPha} thanh tep client nhap @crm/auth -> vach (a) do (ma ${pha.ma})`,
		);
	} else {
		ghi(false, "pha-thu: danh sach khong co tep .tsx nao");
	}

	const tap = soTap(join(GOC, RANG_CU, "tep-vong.txt"));
	ghi(
		tap.thieu.length === 0 && tap.thua.length === 0,
		`so tap: thieu [${tap.thieu.join(", ")}] thua [${tap.thua.join(", ")}]`,
	);

	const banSao = join(NHA, "tep-vong-thieu.txt");
	writeFileSync(banSao, dsTep.slice(1).join("\n"));
	const tapPha = soTap(banSao);
	ghi(
		tapPha.thieu.length === 1 && tapPha.thieu[0] === dsTep[0],
		`pha-thu so tap: xoa dong ${dsTep[0]} -> thieu [${tapPha.thieu.join(", ")}]`,
	);
} finally {
	don();
}

for (const d of dong) console.log(`${d.dat ? "DUNG" : "SAI"} ${d.chu}`);
const sai = dong.filter((d) => !d.dat).length;
console.log(
	`KET LUAN ${dong.length - sai} DUNG, ${sai} SAI — ma thoat ${sai ? 1 : 0}`,
);
process.exit(sai ? 1 : 0);
