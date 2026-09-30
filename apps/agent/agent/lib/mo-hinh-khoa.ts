import type { NguonKhoaDb } from "@crm/db/okr-tro-ly-danh-muc";
import { getVercelOidcToken } from "@vercel/oidc";
import { TRO_LY_OKR } from "./okr/config";

export type NguonKhoa = NguonKhoaDb;

type Env = Readonly<Record<string, string | undefined>>;

const co = (env: Env, ten: string) => Boolean(env[ten]?.trim());

async function coVe(layVe: () => Promise<string>): Promise<boolean> {
	try {
		return Boolean((await layVe())?.trim());
	} catch {
		return false;
	}
}

export async function nguonKhoaMoHinh(
	v: { env?: Env; layVe?: () => Promise<string>; rieng?: boolean } = {},
): Promise<NguonKhoa | null> {
	const env = v.env ?? process.env;
	if ((v.rieng ?? true) && co(env, TRO_LY_OKR.khoa.rieng)) return "khoa-rieng";
	if (co(env, TRO_LY_OKR.khoa.chung)) return "khoa-chung";
	return (await coVe(v.layVe ?? (() => getVercelOidcToken())))
		? "oidc"
		: null;
}
