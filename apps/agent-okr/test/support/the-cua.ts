export const BI_MAT_THU = "sokr-bi-mat-thu-dai-du-32-ky-tu-000000";

export type YeuSachCua = {
	iss: string;
	aud: string;
	sub: string | undefined;
	purpose: string;
	cuocSoanId: string;
	email?: string;
	name?: string;
	iat: number;
	nbf: number;
	exp: number | undefined;
};

export function yeuSach(
	v: Partial<YeuSachCua> & Pick<YeuSachCua, "sub" | "cuocSoanId">,
): YeuSachCua {
	const now = Math.floor(Date.now() / 1000);
	return {
		iss: "crm-app",
		aud: "crm-okr-agent",
		purpose: "okr-soan",
		iat: now,
		nbf: now - 5,
		exp: now + 120,
		...v,
	};
}

export async function mintOkr(
	claims: YeuSachCua,
	secret = BI_MAT_THU,
): Promise<string> {
	const ma = (v: YeuSachCua | { alg: string; typ: string }) =>
		Buffer.from(JSON.stringify(v)).toString("base64url");
	const dau = `${ma({ alg: "HS256", typ: "JWT" })}.${ma(claims)}`;
	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const chuKy = await crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(dau),
	);
	return `${dau}.${Buffer.from(chuKy).toString("base64url")}`;
}

export function yeuCau(
	token: string | null,
	duong = "/eve/v1/session",
): Request {
	return new Request(`https://okr-agent.example.com${duong}`, {
		method: "POST",
		headers: token ? { authorization: `Bearer ${token}` } : {},
	});
}
