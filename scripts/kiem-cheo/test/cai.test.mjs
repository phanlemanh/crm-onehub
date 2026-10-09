import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
	accessSync,
	constants,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import os from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import { after, describe, test } from "node:test";
import { timDuong } from "../cai.mjs";
import { KIEM_CHEO } from "../cau-hinh.mjs";

const CAI = resolve(import.meta.dirname, "..", "cai.mjs");
const tam = mkdtempSync(join(os.tmpdir(), "kcs-cai-"));
after(() => rmSync(tam, { recursive: true, force: true }));

function moi(ten) {
	const home = join(tam, ten, "home");
	const goc = join(tam, ten, "kho");
	mkdirSync(home, { recursive: true });
	mkdirSync(goc, { recursive: true });
	writeFileSync(
		join(goc, "package.json"),
		JSON.stringify({
			scripts: {
				"kiem-cheo:chay":
					'node -e "process.exit(process.versions.bun ? 3 : 0)"',
			},
		}),
	);
	const nhat = join(tam, ten, "launchctl.log");
	const launchctl = join(tam, ten, "launchctl");
	writeFileSync(launchctl, `#!/bin/sh\necho "$@" >> '${nhat}'\n`);
	execFileSync("chmod", ["+x", launchctl]);
	return { home, goc, nhat, launchctl };
}

function cai(m, lenh) {
	return spawnSync("node", [CAI, lenh, "--goc", m.goc], {
		encoding: "utf8",
		env: { ...process.env, HOME: m.home, KIEM_CHEO_LAUNCHCTL: m.launchctl },
	});
}

const tepPlist = (m) =>
	join(m.home, KIEM_CHEO.launchd.thuMuc, `${KIEM_CHEO.launchd.nhan}.plist`);

function docPlist(p) {
	return JSON.parse(
		execFileSync("plutil", ["-convert", "json", "-o", "-", p], {
			encoding: "utf8",
		}),
	);
}

function chayNhuLaunchd(plist, { boPath = false } = {}) {
	const env = ["-i", `HOME=${tam}`];
	const path = boPath
		? KIEM_CHEO.launchd.pathHeThong
		: plist.EnvironmentVariables.PATH;
	env.push(`PATH=${path}`);
	return spawnSync("env", [...env, ...plist.ProgramArguments], {
		cwd: plist.WorkingDirectory,
		encoding: "utf8",
	});
}

describe("kcs-cai", () => {
	test("(i) plist: 01:00, WorkingDirectory goc, bun tuyet doi, PATH du, log", () => {
		const m = moi("plist");
		const r = cai(m, "cai");
		assert.equal(r.status, 0, r.stderr);
		const p = docPlist(tepPlist(m));
		assert.deepEqual(p.StartCalendarInterval, { Hour: 1, Minute: 0 });
		assert.equal(p.WorkingDirectory, m.goc);
		assert.equal(p.RunAtLoad, false);
		const [bun, ...conLai] = p.ProgramArguments;
		assert.ok(isAbsolute(bun), `ProgramArguments[0] phai tuyet doi: ${bun}`);
		accessSync(bun, constants.X_OK);
		assert.deepEqual(conLai, ["run", "kiem-cheo:chay"]);
		for (const ct of ["bun", "node", "git"]) {
			assert.doesNotThrow(
				() => timDuong(ct, p.EnvironmentVariables.PATH),
				`duoi PATH cua plist khong tim thay ${ct}`,
			);
		}
		const log = join(m.goc, KIEM_CHEO.thuMuc, KIEM_CHEO.tep.log);
		assert.equal(p.StandardOutPath, log);
		assert.equal(p.StandardErrorPath, log);
	});

	test("(i) chay lenh cua plist duoi env -i -> thoat 0; doi chung bo PATH -> khac 0", () => {
		const m = moi("env-i");
		cai(m, "cai");
		const p = docPlist(tepPlist(m));
		const r = chayNhuLaunchd(p);
		assert.equal(r.status, 0, `${r.stdout}${r.stderr}`);
		const doiChung = chayNhuLaunchd(p, { boPath: true });
		assert.equal(
			doiChung.status,
			3,
			"thieu PATH cua plist thi bun run chen node gia (bun) — dem.mjs se khong chay bang node that",
		);
	});

	test("(i) cai hai lan -> mot tep; bootout ban cu roi bootstrap moi lan", () => {
		const m = moi("hai-lan");
		cai(m, "cai");
		cai(m, "cai");
		assert.ok(existsSync(tepPlist(m)));
		const nhat = readFileSync(m.nhat, "utf8").split("\n").filter(Boolean);
		assert.equal(nhat.filter((d) => d.startsWith("bootstrap")).length, 2);
		assert.equal(
			nhat.filter((d) => d.startsWith("bootout")).length,
			1,
			"lan cai thu hai bootout ban cu",
		);
		assert.ok(nhat.at(-1).startsWith("bootstrap"));
	});

	test("(i) go -> tep khong con, bootout duoc goi", () => {
		const m = moi("go");
		cai(m, "cai");
		const r = cai(m, "go");
		assert.equal(r.status, 0, r.stderr);
		assert.ok(!existsSync(tepPlist(m)));
		assert.ok(readFileSync(m.nhat, "utf8").includes("bootout"));
	});
});
