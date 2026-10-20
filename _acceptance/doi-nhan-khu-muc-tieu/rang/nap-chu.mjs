import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { GOC, KhongDo } from "./dai.mjs";

export function napChuKhu() {
	const app = join(GOC, "apps", "app");
	const r = spawnSync(
		"bun",
		[
			"-e",
			`const m = await import(${JSON.stringify(join(app, "test", "doi-nhan-khu-muc-tieu-luat.ts"))}); process.stdout.write(JSON.stringify(m.mucKhoKhu()));`,
		],
		{ cwd: app, encoding: "utf8", maxBuffer: 1 << 27 },
	);
	if (r.status !== 0) throw new KhongDo(`khong nap duoc kho chu\n${r.stderr.slice(-2000)}`);
	return new Map(JSON.parse(r.stdout).map((m) => [`${m.tep}#${m.khoa}#${m.nn}`, m.giaTri]));
}
