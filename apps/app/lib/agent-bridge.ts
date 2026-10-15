import {
	OKR_PHIEN_HOI,
	parseThuocTinhPhienHoi,
	type ThuocTinhPhienHoi,
} from "@crm/validation/okr-phien-hoi";
import {
	OKR_PHIEN_SOAN,
	parseThuocTinhPhienSoan,
	type ThuocTinhPhienSoan,
} from "@crm/validation/okr-phien-soan";
import type { WorkspaceRole } from "@crm/validation/vai-workspace";

const ISSUER = "crm-app";
const AUDIENCE = "crm-agent";

const TTL_SECONDS = 120;

export const AGENT_URL = process.env.AGENT_URL ?? "http://127.0.0.1:2000";

export const OKR_AGENT_URL =
	process.env.OKR_AGENT_URL ?? "http://127.0.0.1:2100";

export function bridgeConfigured(): boolean {
	return Boolean(process.env.AGENT_BRIDGE_SECRET);
}

function okrSecret(): string {
	return process.env.OKR_AGENT_BRIDGE_SECRET?.trim() ?? "";
}

export function okrBridgeConfigured(): boolean {
	return Boolean(okrSecret());
}

type BridgeClaims = {
	iss: string;
	aud: string;
	sub: string;
	email: string;
	name: string;
	contactId?: string;
	companyId?: string;
	dealId?: string;
	iat: number;
	nbf: number;
	exp: number;
};

type OkrBridgeClaims = (ThuocTinhPhienSoan | ThuocTinhPhienHoi) & {
	iss: string;
	aud: string;
	sub: string;
	iat: number;
	nbf: number;
	exp: number;
};

export async function mintBridgeToken(
	user: {
		id: string;
		email: string;
		name: string;
	},
	record: { contactId?: string; companyId?: string; dealId?: string } = {},
): Promise<string> {
	const secret = process.env.AGENT_BRIDGE_SECRET;
	if (!secret) throw new Error("AGENT_BRIDGE_SECRET is not set.");

	const now = Math.floor(Date.now() / 1000);

	const payload: BridgeClaims = {
		iss: ISSUER,
		aud: AUDIENCE,
		sub: user.id,
		email: user.email,
		name: user.name,
		iat: now,
		nbf: now - 5,
		exp: now + TTL_SECONDS,
	};

	if (record.contactId) payload.contactId = record.contactId;
	if (record.companyId) payload.companyId = record.companyId;
	if (record.dealId) payload.dealId = record.dealId;

	return kyHs256(payload, secret);
}

export async function mintOkrBridgeToken(
	user: { id: string; email: string; name: string },
	cuoc:
		| { cuocSoanId: string; vai: WorkspaceRole }
		| { cuocHoiId: string; vai: WorkspaceRole },
): Promise<string> {
	const secret = okrSecret();
	if (!secret) throw new Error("OKR_AGENT_BRIDGE_SECRET is not set.");

	const now = Math.floor(Date.now() / 1000);
	const nguoi = { email: user.email, name: user.name, vai: cuoc.vai };
	const thuoc =
		"cuocHoiId" in cuoc
			? parseThuocTinhPhienHoi({
					purpose: OKR_PHIEN_HOI.purpose,
					cuocHoiId: cuoc.cuocHoiId,
					...nguoi,
				})
			: parseThuocTinhPhienSoan({
					purpose: OKR_PHIEN_SOAN.purpose,
					cuocSoanId: cuoc.cuocSoanId,
					...nguoi,
				});

	const payload: OkrBridgeClaims = {
		iss: OKR_PHIEN_SOAN.issuer,
		aud: OKR_PHIEN_SOAN.audience,
		sub: user.id,
		...thuoc,
		iat: now,
		nbf: now - 5,
		exp: now + TTL_SECONDS,
	};

	return kyHs256(payload, secret);
}

async function kyHs256(
	payload: BridgeClaims | OkrBridgeClaims,
	secret: string,
): Promise<string> {
	const header = { alg: "HS256", typ: "JWT" };

	const signingInput = `${base64url(encode(JSON.stringify(header)))}.${base64url(
		encode(JSON.stringify(payload)),
	)}`;

	const key = await crypto.subtle.importKey(
		"raw",
		encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);

	const signature = await crypto.subtle.sign("HMAC", key, encode(signingInput));

	return `${signingInput}.${base64url(new Uint8Array(signature))}`;
}

function encode(input: string) {
	return new TextEncoder().encode(input);
}

function base64url(bytes: Uint8Array): string {
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}
