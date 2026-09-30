import { type ChildProcess, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { type AddressInfo, createServer } from "node:net";
import { join } from "node:path";

export const APP = join(import.meta.dir, "..", "..");
export const KHOI_DONG = {
	choMs: 120_000,
	nhipMs: 300,
	dungMs: 5_000,
} as const;
const EVE = [
	join(APP, "node_modules", ".bin", "eve"),
	join(APP, "..", "..", "node_modules", ".bin", "eve"),
].find((d) => existsSync(d));

export function congTuDo(): Promise<number> {
	return new Promise((ok, loi) => {
		const s = createServer();
		s.once("error", loi);
		s.listen(0, "127.0.0.1", () => {
			const { port } = s.address() as AddressInfo;
			s.close(() => ok(port));
		});
	});
}

export type MayEve = {
	url: string;
	cong: number;
	tien: ChildProcess;
	log: string[];
	dung: () => Promise<void>;
};

export async function khoiDongEve(
	v: { goc?: string; env?: Record<string, string> } = {},
): Promise<MayEve> {
	if (!EVE) throw new Error("khong thay eve trong node_modules/.bin");
	const goc = v.goc ?? APP;
	const cong = await congTuDo();
	const log: string[] = [];
	const tien = spawn(EVE, ["dev", "--no-ui", "--port", String(cong)], {
		cwd: goc,
		stdio: ["ignore", "pipe", "pipe"],
		env: {
			...process.env,
			...v.env,
			PORT: String(cong),
			CRM_TELEMETRY_DISABLED: "1",
		},
	});
	tien.stdout?.on("data", (d) => log.push(String(d)));
	tien.stderr?.on("data", (d) => log.push(String(d)));
	const url = `http://127.0.0.1:${cong}`;
	const dung = () =>
		new Promise<void>((ok) => {
			if (tien.exitCode !== null) return ok();
			tien.once("exit", () => ok());
			tien.kill("SIGTERM");
			setTimeout(() => tien.kill("SIGKILL"), KHOI_DONG.dungMs).unref();
		});
	const het = Date.now() + KHOI_DONG.choMs;
	while (Date.now() < het) {
		if (tien.exitCode !== null)
			throw new Error(`eve thoat som (${tien.exitCode}):\n${log.join("")}`);
		try {
			const r = await fetch(`${url}/eve/v1/health`);
			if (r.ok) return { url, cong, tien, log, dung };
		} catch {}
		await Bun.sleep(KHOI_DONG.nhipMs);
	}
	await dung();
	throw new Error(
		`eve khong san sang sau ${KHOI_DONG.choMs} ms:\n${log.join("")}`,
	);
}
