import { OKR_SO } from "@crm/db/okr-so-config";

export const EMAIL_SHEETS = "doc-okr@du-an-thu.iam.gserviceaccount.com";

export const TOKEN_GIA = "tok-gia-okr";

export type CapKhoa = {
	pem: string;
	pemEnv: string;
	congKhai: CryptoKey;
};

export async function sinhKhoa(): Promise<CapKhoa> {
	const cap = await crypto.subtle.generateKey(
		{
			name: "RSASSA-PKCS1-v1_5",
			modulusLength: 2048,
			publicExponent: new Uint8Array([1, 0, 1]),
			hash: "SHA-256",
		},
		true,
		["sign", "verify"],
	);
	const der = await crypto.subtle.exportKey("pkcs8", cap.privateKey);
	const dong =
		Buffer.from(der)
			.toString("base64")
			.match(/.{1,64}/g) ?? [];
	const pem = [
		"-----BEGIN PRIVATE KEY-----",
		...dong,
		"-----END PRIVATE KEY-----",
		"",
	].join("\n");
	return { pem, pemEnv: pem.replace(/\n/g, "\\n"), congKhai: cap.publicKey };
}

const BIEN = [
	"GOOGLE_SHEETS_EMAIL",
	"GOOGLE_SHEETS_KHOA",
	"OKR_SHEETS_TOKEN_URL",
	"OKR_SHEETS_API_URL",
] as const;

export type BienSheets = {
	email: string | null;
	khoa: string | null;
};

export function datBienSheets(bien: BienSheets): () => void {
	const cu = BIEN.map((ten) => [ten, process.env[ten]] as const);
	for (const ten of BIEN) delete process.env[ten];
	if (bien.email !== null) process.env.GOOGLE_SHEETS_EMAIL = bien.email;
	if (bien.khoa !== null) process.env.GOOGLE_SHEETS_KHOA = bien.khoa;
	return () => {
		for (const [ten, giaTri] of cu) {
			if (giaTri === undefined) delete process.env[ten];
			else process.env[ten] = giaTri;
		}
	};
}

export type GoiGoogle =
	| { loai: "token"; than: string }
	| { loai: "values"; sheetId: string; o: string; url: URL; auth: string };

export type TraLoiGoogle = Response | "treo";

export type GoogleGia = {
	f: typeof fetch;
	goi: GoiGoogle[];
};

function treo(signal: AbortSignal | null | undefined): Promise<Response> {
	return new Promise((_, reject) => {
		signal?.addEventListener("abort", () => reject(signal.reason), {
			once: true,
		});
	});
}

export function oGia(giaTri: number | string | boolean | null): Response {
	return Response.json(
		giaTri === null
			? { range: "A1", majorDimension: "ROWS" }
			: { range: "A1", majorDimension: "ROWS", values: [[giaTri]] },
	);
}

export function tokenGia(): Response {
	return Response.json({
		access_token: TOKEN_GIA,
		expires_in: 3599,
		token_type: "Bearer",
	});
}

export function googleGia(traLoi: (goi: GoiGoogle) => TraLoiGoogle): GoogleGia {
	const goi: GoiGoogle[] = [];
	const f = async (input: RequestInfo | URL, init?: RequestInit) => {
		const url = new URL(input instanceof Request ? input.url : String(input));
		const signal = init?.signal;
		let lan: GoiGoogle;
		if (url.href === OKR_SO.sheets.tokenUrl) {
			lan = { loai: "token", than: String(init?.body ?? "") };
		} else if (url.href.startsWith(`${OKR_SO.sheets.apiUrl}/`)) {
			const [sheetId = "", , o = ""] = url.pathname
				.slice(new URL(OKR_SO.sheets.apiUrl).pathname.length + 1)
				.split("/");
			lan = {
				loai: "values",
				sheetId: decodeURIComponent(sheetId),
				o: decodeURIComponent(o),
				url,
				auth: new Headers(init?.headers).get("authorization") ?? "",
			};
		} else {
			throw new Error(`Google giả không biết địa chỉ ${url.origin}`);
		}
		goi.push(lan);
		const r = traLoi(lan);
		return r === "treo" ? treo(signal) : r;
	};
	return {
		f: Object.assign(f, { preconnect: globalThis.fetch.preconnect }),
		goi,
	};
}

export function googleTheoO(
	theoO: (sheetId: string, o: string) => TraLoiGoogle,
): GoogleGia {
	return googleGia((goi) =>
		goi.loai === "token" ? tokenGia() : theoO(goi.sheetId, goi.o),
	);
}

export function demValues(g: GoogleGia): number {
	return g.goi.filter((x) => x.loai === "values").length;
}
