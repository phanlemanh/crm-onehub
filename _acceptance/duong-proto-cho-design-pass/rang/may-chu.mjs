import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const GOC_KHO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
export const GOC_APP = resolve(GOC_KHO, "apps/app");

export function thoat(ma, cau) {
	console.error(`rang: ${cau}`);
	process.exit(ma);
}

async function congRoi() {
	return new Promise((ok, hong) => {
		const s = createServer();
		s.on("error", hong);
		s.listen(0, "127.0.0.1", () => {
			const { port } = s.address();
			s.close(() => ok(port));
		});
	});
}

export async function moMayChu({ co, san = "dev" }) {
	const cong = await congRoi();
	const env = { ...process.env, PORT: String(cong) };

	if (co === undefined) delete env.PROTO_ROUTE;
	else env.PROTO_ROUTE = co;

	const con = spawn(
		"bunx",
		["next", san === "dev" ? "dev" : "start", "-p", String(cong)],
		{ cwd: GOC_APP, env, stdio: ["ignore", "pipe", "pipe"] },
	);

	let nhatKy = "";
	con.stdout.on("data", (b) => {
		nhatKy += b.toString();
	});
	con.stderr.on("data", (b) => {
		nhatKy += b.toString();
	});

	const goc = `http://127.0.0.1:${cong}`;
	const han = Date.now() + 90_000;

	while (Date.now() < han) {
		try {
			await fetch(`${goc}/`, { redirect: "manual" });
			return { goc, dong: () => con.kill("SIGTERM"), nhatKy: () => nhatKy };
		} catch {
			await new Promise((r) => setTimeout(r, 400));
		}
	}

	con.kill("SIGKILL");
	thoat(2, `may chu khong len trong 90s (co=${co ?? "khong-dat"})\n${nhatKy.slice(-1500)}`);
}

export async function ma(goc, duong) {
	const r = await fetch(`${goc}${duong}`, { redirect: "manual" });
	return r.status;
}

export async function than(goc, duong) {
	const r = await fetch(`${goc}${duong}`, { redirect: "manual" });
	return await r.text();
}
