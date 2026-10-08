import { execFileSync, spawnSync } from "node:child_process";
import {
	accessSync,
	constants,
	existsSync,
	mkdirSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import os from "node:os";
import { dirname, join, resolve } from "node:path";
import { KIEM_CHEO } from "./cau-hinh.mjs";
import { laTepChinh } from "./tep-chinh.mjs";

const CHUONG_TRINH = ["bun", "node", "git"];

export function timDuong(ten, path = process.env.PATH ?? "") {
	for (const thuMuc of path.split(":").filter(Boolean)) {
		const p = join(thuMuc, ten);
		try {
			accessSync(p, constants.X_OK);
			return p;
		} catch {}
	}
	throw new Error(`khong tim thay ${ten} trong PATH`);
}

const xml = (s) =>
	String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function plistCho({ goc, bun, path, nhan, log }) {
	const chuoi = (s) => `<string>${xml(s)}</string>`;
	return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>Label</key>${chuoi(nhan)}
	<key>ProgramArguments</key>
	<array>${chuoi(bun)}${chuoi("run")}${chuoi("kiem-cheo:chay")}</array>
	<key>WorkingDirectory</key>${chuoi(goc)}
	<key>EnvironmentVariables</key>
	<dict><key>PATH</key>${chuoi(path)}</dict>
	<key>StartCalendarInterval</key>
	<dict><key>Hour</key><integer>${KIEM_CHEO.lich.gio}</integer><key>Minute</key><integer>${KIEM_CHEO.lich.phut}</integer></dict>
	<key>RunAtLoad</key><false/>
	<key>StandardOutPath</key>${chuoi(log)}
	<key>StandardErrorPath</key>${chuoi(log)}
</dict>
</plist>
`;
}

export function caiDat({
	lenh,
	goc,
	home = os.homedir(),
	launchctl = "launchctl",
}) {
	const { nhan, thuMuc, pathHeThong } = KIEM_CHEO.launchd;
	const tep = join(home, thuMuc, `${nhan}.plist`);
	const mien = `gui/${process.getuid()}`;
	const lc = (...a) => spawnSync(launchctl, a, { encoding: "utf8" });
	if (lenh === "go") {
		lc("bootout", mien, tep);
		rmSync(tep, { force: true });
		return tep;
	}
	const thuMucCt = CHUONG_TRINH.map((t) => dirname(timDuong(t)));
	const path = [...new Set([...thuMucCt, ...pathHeThong.split(":")])].join(":");
	const log = join(goc, KIEM_CHEO.thuMuc, KIEM_CHEO.tep.log);
	mkdirSync(dirname(log), { recursive: true });
	mkdirSync(dirname(tep), { recursive: true });
	if (existsSync(tep)) lc("bootout", mien, tep);
	writeFileSync(tep, plistCho({ goc, bun: timDuong("bun"), path, nhan, log }));
	const r = lc("bootstrap", mien, tep);
	if (r.status !== 0) throw new Error(`launchctl bootstrap loi: ${r.stderr}`);
	return tep;
}

if (laTepChinh(import.meta.url)) {
	const [lenh, ...conLai] = process.argv.slice(2);
	if (lenh !== "cai" && lenh !== "go") {
		process.stderr.write("dung: cai.mjs cai|go [--goc <thu muc>]\n");
		process.exit(2);
	}
	const i = conLai.indexOf("--goc");
	const goc = resolve(
		i >= 0
			? conLai[i + 1]
			: execFileSync("git", ["rev-parse", "--show-toplevel"], {
					encoding: "utf8",
				}).trim(),
	);
	const tep = caiDat({
		lenh,
		goc,
		home: process.env.HOME,
		launchctl: process.env.KIEM_CHEO_LAUNCHCTL ?? "launchctl",
	});
	process.stdout.write(`${lenh === "cai" ? "da cai" : "da go"}: ${tep}\n`);
}
