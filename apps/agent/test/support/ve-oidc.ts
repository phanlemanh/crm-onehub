import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const NGU_CANH = Symbol.for("@vercel/request-context");
const GIAY = 1000;
const MOT_GIO = 3600;

const base64url = (o: Readonly<Record<string, string | number>>) =>
	Buffer.from(JSON.stringify(o)).toString("base64url");

export function veOidc(v: { hetHan?: boolean } = {}): string {
	const bayGio = Math.floor(Date.now() / GIAY);
	const exp = v.hetHan ? bayGio - MOT_GIO : bayGio + MOT_GIO;
	return [
		base64url({ alg: "RS256", typ: "JWT" }),
		base64url({ sub: "owner:test:project:crm-onehub-agent", exp }),
		"chu-ky",
	].join(".");
}

type Khe = { [NGU_CANH]?: unknown };

export async function trongRequest<T>(
	ve: string | null,
	chay: () => Promise<T>,
): Promise<T> {
	const g = globalThis as Khe;
	const cu = g[NGU_CANH];
	g[NGU_CANH] = {
		get: () => ({ headers: ve ? { "x-vercel-oidc-token": ve } : {} }),
	};
	try {
		return await chay();
	} finally {
		if (cu === undefined) delete g[NGU_CANH];
		else g[NGU_CANH] = cu;
	}
}

export const BIEN_KHOA = [
	"OKR_AI_GATEWAY_API_KEY",
	"AI_GATEWAY_API_KEY",
	"VERCEL_OIDC_TOKEN",
] as const;

export async function voiEnv<T>(
	env: Readonly<Record<string, string>>,
	chay: () => Promise<T>,
): Promise<T> {
	const cu = Object.fromEntries(BIEN_KHOA.map((k) => [k, process.env[k]]));
	for (const k of BIEN_KHOA) {
		if (env[k] === undefined) delete process.env[k];
		else process.env[k] = env[k];
	}
	try {
		return await chay();
	} finally {
		for (const k of BIEN_KHOA) {
			const v = cu[k];
			if (v === undefined) delete process.env[k];
			else process.env[k] = v;
		}
	}
}

export type DemMang = { soLan: number };

export async function mayKhongLienKet<T>(
	chay: () => Promise<T>,
	dem: DemMang = { soLan: 0 },
): Promise<T> {
	const tam = mkdtempSync(join(tmpdir(), "ve-oidc-"));
	const cwd = process.cwd();
	const home = process.env.HOME;
	const xdg = process.env.XDG_DATA_HOME;
	const fetchCu = globalThis.fetch;
	process.env.HOME = tam;
	process.env.XDG_DATA_HOME = tam;
	process.chdir(tam);
	globalThis.fetch = Object.assign(
		async () => {
			dem.soLan += 1;
			throw new Error("goi mang");
		},
		{ preconnect: fetchCu.preconnect },
	) as typeof fetch;
	try {
		return await chay();
	} finally {
		globalThis.fetch = fetchCu;
		process.chdir(cwd);
		if (home === undefined) delete process.env.HOME;
		else process.env.HOME = home;
		if (xdg === undefined) delete process.env.XDG_DATA_HOME;
		else process.env.XDG_DATA_HOME = xdg;
		rmSync(tam, { recursive: true, force: true });
	}
}
