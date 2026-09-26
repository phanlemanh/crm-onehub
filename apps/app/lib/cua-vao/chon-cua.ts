import type { MailboxProviderId } from "@crm/auth/scopes";
import type { CuaVaoMessages } from "@/lib/messages/cua-vao";
import type { RouterOutputs } from "@/lib/trpc/types";

export type SignInOptions = RouterOutputs["sso"]["signInOptions"];
export type NhaCungCapSso = SignInOptions["providers"][number];
export type CuaDangNhap = {
	social: MailboxProviderId[];
	sso: NhaCungCapSso[];
};
export type BuocLanDau = { tieuDe: string; moTa: string };
export type ChuBuoc = {
	duongChoPhep: string;
	duongPhatLienKet: string;
	phut: number;
};

export function chonCua(
	options: SignInOptions | null,
	method: string | string[] | undefined,
): CuaDangNhap {
	const mot = Array.isArray(method) ? method[0] : method;
	const configured: MailboxProviderId[] = [];
	if (options?.google ?? true) configured.push("google");
	if (options?.microsoft ?? false) configured.push("microsoft");
	const providers = options?.providers ?? [];
	const insisted = configured.find((provider) => provider === mot);
	if (insisted !== undefined) return { social: [insisted], sso: [] };
	if (providers.length > 0) return { social: [], sso: providers };
	return { social: configured, sso: [] };
}

export function buocLanDau(
	cua: CuaDangNhap,
	chu: ChuBuoc,
	m: CuaVaoMessages,
	tenHang: (provider: MailboxProviderId) => string,
): BuocLanDau[] {
	const ten = [
		...cua.social.map(tenHang),
		...cua.sso.map((provider) => provider.name),
	];
	const choPhep = {
		tieuDe: m.buoc.choPhep.tieuDe,
		moTa: m.buoc.choPhep.moTa(chu.duongChoPhep),
	};
	const moTaMatKhau = m.buoc.matKhauPhu.moTa(chu.duongPhatLienKet, chu.phut);
	if (ten.length === 0) {
		return [choPhep, { tieuDe: m.buoc.matKhauChinh.tieuDe, moTa: moTaMatKhau }];
	}
	return [
		choPhep,
		{
			tieuDe: m.buoc.nutNgoai.tieuDe(ten.join(", ")),
			moTa: m.buoc.nutNgoai.moTa,
		},
		{ tieuDe: m.buoc.matKhauPhu.tieuDe, moTa: moTaMatKhau },
	];
}
