import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const GOC =
	process.env.GOC_KHO ??
	join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
export const AGENT = join(GOC, "apps/agent");
export const MAU = join(AGENT, "test/fixtures/eve-mau");
export const RA = join(GOC, ".acceptance-runs/tro-ly-okr-nen");
const EVE = join(AGENT, "node_modules/.bin/eve");
const NODE_24 = join(
	homedir(),
	".local/share/fnm/node-versions/v24.15.0/installation/bin",
);

export function duongPath() {
	return existsSync(NODE_24)
		? `${NODE_24}:${process.env.PATH ?? ""}`
		: (process.env.PATH ?? "");
}

const DUONG_VAN_TAY = [
	"apps/agent",
	"packages/db",
	"packages/validation",
	"_acceptance/tro-ly-okr-nen/rang",
];

export function vanTayMa() {
	const git = (...d) =>
		spawnSync("git", ["-C", GOC, ...d], { encoding: "utf8" }).stdout ?? "";
	const sha = git("rev-parse", "HEAD").trim();
	const khac = git("diff", "HEAD", "--", ...DUONG_VAN_TAY);
	return khac
		? `${sha}+${createHash("sha256").update(khac).digest("hex").slice(0, 16)}`
		: sha;
}

export function taoKho(ten) {
	const r = spawnSync("bun", ["run", "db:do", "--tao", "--ten", ten], {
		cwd: GOC,
		encoding: "utf8",
	});
	const url = `${r.stdout}`
		.trim()
		.split("\n")
		.map((d) => d.replace(/^.*?(postgres(?:ql)?:\/\/)/, "$1"))
		.findLast((d) => /^postgres(ql)?:\/\//.test(d));
	if (r.status !== 0 || !url) {
		throw new Error(`khong tao duoc kho do ${ten}: ${r.stderr}`);
	}
	return url;
}

export function xoaKho(ten) {
	spawnSync("bun", ["run", "db:do", "--xoa", "--ten", ten], {
		cwd: GOC,
		encoding: "utf8",
	});
}

function lienKetMau() {
	const dich = join(MAU, "node_modules/@mau/agent");
	if (existsSync(dich)) return;
	mkdirSync(dirname(dich), { recursive: true });
	symlinkSync(AGENT, dich);
}

const docJsonl = (tep) =>
	existsSync(tep)
		? readFileSync(tep, "utf8")
				.split("\n")
				.filter(Boolean)
				.map((d) => JSON.parse(d))
		: [];

export function chayMau({ ten, kichBan, url, env = {} }) {
	lienKetMau();
	const thuMuc = join(RA, "mau", ten);
	rmSync(thuMuc, { recursive: true, force: true });
	mkdirSync(thuMuc, { recursive: true });
	const tep = {
		dem: join(thuMuc, "dem.txt"),
		ghi: join(thuMuc, "ghi.jsonl"),
		suKien: join(thuMuc, "su-kien.jsonl"),
	};
	writeFileSync(tep.dem, "");
	const r = spawnSync(EVE, ["eval", kichBan], {
		cwd: MAU,
		encoding: "utf8",
		env: {
			...process.env,
			PATH: duongPath(),
			DATABASE_URL: url,
			CRM_TELEMETRY_DISABLED: "1",
			MAU_DEM: tep.dem,
			MAU_GHI: tep.ghi,
			MAU_SU_KIEN: tep.suKien,
			...env,
		},
		timeout: 600_000,
	});
	writeFileSync(join(thuMuc, "eve.log"), `${r.stdout}\n${r.stderr}`);
	const suKien = docJsonl(tep.suKien);
	return {
		exit: r.status,
		dem: readFileSync(tep.dem, "utf8").split("\n").filter(Boolean).length,
		ghi: docJsonl(tep.ghi),
		suKien,
		loaiSuKien: suKien.flatMap((s) => s.events.map((e) => e.type)),
		sessionId: suKien[0]?.sessionId ?? null,
		thuMuc,
	};
}
