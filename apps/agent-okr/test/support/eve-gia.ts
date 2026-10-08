import { type ChildProcess, spawn } from "node:child_process";
import {
	chmodSync,
	mkdirSync,
	mkdtempSync,
	realpathSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export type GocGia = { goc: string; don: () => void };

export function dungGocGia(): GocGia {
	const goc = realpathSync(mkdtempSync(join(tmpdir(), "eve-gia-")));
	const bin = join(goc, "node_modules", ".bin");
	mkdirSync(bin, { recursive: true });
	const eve = join(bin, "eve");
	writeFileSync(eve, "#!/usr/bin/env node\nsetInterval(() => {}, 1e6);\n");
	chmodSync(eve, 0o755);
	return { goc, don: () => rmSync(goc, { recursive: true, force: true }) };
}

export function sinhEveGia(goc: string): ChildProcess {
	return spawn(
		join(goc, "node_modules", ".bin", "eve"),
		["dev", "--no-ui", "--port", "1"],
		{ cwd: goc, stdio: "ignore" },
	);
}

export function songCon(pid: number): boolean {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}
