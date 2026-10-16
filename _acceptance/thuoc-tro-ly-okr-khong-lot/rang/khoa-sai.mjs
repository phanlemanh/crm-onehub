import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "../../..");
const RANG = join(GOC, "_acceptance/tro-ly-okr-de-xuat/rang");
const TEP = "_acceptance/tro-ly-okr-de-xuat/rang/do-tre.mjs";
const SHA_TRUOC_VONG = "38300b3c818662207cb640052f9f2f9de746a9f6";
const LAN = 2;
const ENV_KHOA_SAI = {
	AI_GATEWAY_API_KEY: "sk-khoa-sai-de-do",
	OKR_AI_GATEWAY_API_KEY: "",
};
const MONG = {
	sua: {
		ma: 2,
		chu: `KHONG DO DUOC: ${LAN}/${LAN} luot hong`,
		them: "AI Gateway rejected the provided API key",
	},
	"truoc-vong": { ma: 1, chu: "KHONG DAT" },
};

function git(...args) {
	const r = spawnSync("git", args, { cwd: GOC, encoding: "utf8" });
	if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
	return r.stdout;
}

function banTruocVong(thuMuc) {
	const tep = join(thuMuc, "do-tre-truoc-vong.mjs");
	const nguon = git("show", `${SHA_TRUOC_VONG}:${TEP}`)
		.replace('from "./phien-tro-ly.mjs"', `from ${JSON.stringify(join(RANG, "phien-tro-ly.mjs"))}`)
		.replace(
			'from "../../../packages/db/src/okr-tro-ly-danh-muc.ts"',
			`from ${JSON.stringify(join(GOC, "packages/db/src/okr-tro-ly-danh-muc.ts"))}`,
		)
		.replace(
			'lenh: "bun _acceptance/tro-ly-okr-de-xuat/rang/do-tre.mjs"',
			`lenh: ${JSON.stringify(`bun ${tep}`)}`,
		);
	writeFileSync(tep, nguon);
	return tep;
}

function chay(tep) {
	const r = spawnSync("bun", [tep, "--lan", String(LAN)], {
		cwd: GOC,
		encoding: "utf8",
		env: { ...process.env, ...ENV_KHOA_SAI },
	});
	return { ma: r.status, ra: `${r.stdout}\n${r.stderr}` };
}

const SO_DU_AM = "-0.0099";
const LENH_SO_DU = [
	["do-tre", [join(RANG, "do-tre.mjs"), "--lan", String(LAN)]],
	["eval-gop-y", [join(RANG, "eval-gop-y.mjs")]],
];

async function soDuAm() {
	const mau = JSON.parse(readFileSync(join(import.meta.dirname, "mau", "credits-that.json"), "utf8"));
	let soLanHoi = 0;
	const may = Bun.serve({
		port: 0,
		fetch() {
			soLanHoi += 1;
			return Response.json({ ...mau, balance: SO_DU_AM });
		},
	});
	const loiSoDu = [];
	try {
		for (const [ten, lenh] of LENH_SO_DU) {
			const truoc = soLanHoi;
			const con = Bun.spawn(["bun", ...lenh], {
				cwd: GOC,
				env: { ...process.env, TDX_URL_SO_DU: `http://127.0.0.1:${may.port}/v1/credits` },
				stdout: "pipe",
				stderr: "pipe",
			});
			const [ra1, ra2, ma] = await Promise.all([
				new Response(con.stdout).text(),
				new Response(con.stderr).text(),
				con.exited,
			]);
			const r = { status: ma };
			const ra = `${ra1}\n${ra2}`;
			const dungCau = ra.includes(`KHONG DO DUOC: so du AI Gateway ${Number(SO_DU_AM)} USD`);
			const khongDung = !/phien do co tac tu|phien-do: kho|okr:mau --moc|kho tdx-e22/.test(ra);
			console.log(`${ten}: ma ${r.status} (mong 2) · cau so du ${dungCau ? "co" : "KHONG"} · khong dung phien do ${khongDung ? "dung" : "SAI"} · hoi so du ${soLanHoi - truoc} lan`);
			if (r.status !== 2 || !dungCau || !khongDung || soLanHoi === truoc) loiSoDu.push(ten);
		}
	} finally {
		may.stop(true);
	}
	for (const l of loiSoDu) console.log(`SAI so du am ${l}`);
	console.log(loiSoDu.length === 0 ? "DAT" : "KHONG DAT");
	return loiSoDu.length === 0 ? 0 : 1;
}

if (process.argv.includes("--so-du-am")) process.exit(await soDuAm());

const thuMuc = mkdtempSync(join(tmpdir(), "khoa-sai-"));
const loi = [];
try {
	for (const [ban, tep] of [
		["sua", join(GOC, TEP)],
		["truoc-vong", banTruocVong(thuMuc)],
	]) {
		const r = chay(tep);
		const mong = MONG[ban];
		const dung =
			r.ma === mong.ma && r.ra.includes(mong.chu) && (!mong.them || r.ra.includes(mong.them));
		const dong = r.ra.split("\n").find((d) => d.startsWith("KHONG")) ?? "(khong co dong ket luan)";
		console.log(`${ban}: ma ${r.ma} (mong ${mong.ma}) · ${dong}`);
		if (!dung) loi.push(`${ban} ma ${r.ma}`);
	}
} finally {
	rmSync(thuMuc, { recursive: true, force: true });
}
for (const l of loi) console.log(`SAI ${l}`);
console.log(loi.length === 0 ? "DAT" : "KHONG DAT");
process.exit(loi.length === 0 ? 0 : 1);
