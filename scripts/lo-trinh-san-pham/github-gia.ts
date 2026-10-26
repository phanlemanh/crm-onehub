import { createPublicKey, createVerify, type KeyObject } from "node:crypto";

export type DuongGithub =
	| "installation"
	| "access_tokens"
	| "branches"
	| "contents";

export type LoiGia = Partial<Record<DuongGithub, number>>;

export type KhoGia = {
	html: (sha: string, duong: string) => string | null;
	dauNhanh: { sha: string; commitLuc: string } | null;
	nhanh?: string;
	caiLuc: string | null;
	loi?: LoiGia;
	gioiHan?: boolean;
};

export type GoiGia = {
	duong: DuongGithub;
	kho: string;
	url: string;
	than: unknown;
	xacThuc: string;
	jwt: { iss: string; iat: number; exp: number } | null;
};

export type GithubGia = {
	xuLy: (req: Request) => Promise<Response>;
	fetch: typeof fetch;
	goi: GoiGia[];
	dem: (duong: DuongGithub) => number;
};

const TOKEN_GIA = "ghs_token-gia-cua-lan-thu";

function json(status: number, than: unknown, dau: Record<string, string> = {}) {
	return new Response(JSON.stringify(than), {
		status,
		headers: { "content-type": "application/json", ...dau },
	});
}

function khongThay() {
	return json(404, {
		message: "Not Found",
		documentation_url: "https://docs.github.com/rest",
		status: "404",
	});
}

function b64u(s: string) {
	return Buffer.from(s, "base64url");
}

function docJwt(
	xacThuc: string,
	khoa: KeyObject,
): { iss: string; iat: number; exp: number } | null {
	const jwt = xacThuc.replace(/^Bearer /, "");
	const [dau, than, ky] = jwt.split(".");
	if (!dau || !than || !ky) return null;
	const kiem = createVerify("RSA-SHA256");
	kiem.update(`${dau}.${than}`);
	if (!kiem.verify(khoa, b64u(ky))) return null;
	const p = JSON.parse(b64u(than).toString("utf8"));
	return { iss: String(p.iss), iat: Number(p.iat), exp: Number(p.exp) };
}

export function taoGithubGia(opts: {
	khoaCongKhai: string;
	kho: Record<string, KhoGia>;
	idUngDung: string;
}): GithubGia {
	const khoa = createPublicKey(opts.khoaCongKhai);
	const goi: GoiGia[] = [];
	const caiTheoId = new Map<number, string>();
	let idKe = 1000;
	for (const ten of Object.keys(opts.kho)) caiTheoId.set(++idKe, ten);
	const idCua = (ten: string) =>
		[...caiTheoId.entries()].find(([, k]) => k === ten)?.[0] ?? 0;

	async function xuLy(req: Request): Promise<Response> {
		const url = new URL(req.url);
		const xacThuc = req.headers.get("authorization") ?? "";
		const than =
			req.method === "POST" ? await req.json().catch(() => null) : null;
		const p = url.pathname;

		const mInst = p.match(/^\/repos\/([^/]+\/[^/]+)\/installation$/);
		if (mInst) {
			const ten = decodeURIComponent(mInst[1] ?? "");
			const jwt = docJwt(xacThuc, khoa);
			goi.push({
				duong: "installation",
				kho: ten,
				url: req.url,
				than,
				xacThuc,
				jwt,
			});
			if (!jwt || jwt.iss !== opts.idUngDung)
				return json(401, { message: "A JSON web token could not be decoded" });
			const k = opts.kho[ten];
			if (k?.loi?.installation)
				return json(k.loi.installation, { message: "Server Error" });
			if (!k || k.caiLuc === null) return khongThay();
			return json(200, {
				id: idCua(ten),
				account: { login: ten.split("/")[0] },
				repository_selection: "selected",
				created_at: k.caiLuc,
				permissions: { contents: "read", metadata: "read" },
			});
		}

		const mTok = p.match(/^\/app\/installations\/(\d+)\/access_tokens$/);
		if (mTok) {
			const ten = caiTheoId.get(Number(mTok[1])) ?? "";
			const jwt = docJwt(xacThuc, khoa);
			goi.push({
				duong: "access_tokens",
				kho: ten,
				url: req.url,
				than,
				xacThuc,
				jwt,
			});
			if (!jwt)
				return json(401, { message: "A JSON web token could not be decoded" });
			const k = opts.kho[ten];
			if (k?.loi?.access_tokens)
				return json(k.loi.access_tokens, { message: "Server Error" });
			return json(201, {
				token: TOKEN_GIA,
				expires_at: new Date(Date.now() + 3_600_000).toISOString(),
				permissions: { contents: "read", metadata: "read" },
				repository_selection: "selected",
			});
		}

		const mNhanh = p.match(/^\/repos\/([^/]+\/[^/]+)\/branches\/(.+)$/);
		if (mNhanh) {
			const ten = decodeURIComponent(mNhanh[1] ?? "");
			goi.push({
				duong: "branches",
				kho: ten,
				url: req.url,
				than,
				xacThuc,
				jwt: null,
			});
			if (xacThuc !== `token ${TOKEN_GIA}` && xacThuc !== `Bearer ${TOKEN_GIA}`)
				return json(401, { message: "Bad credentials" });
			const k = opts.kho[ten];
			if (k?.gioiHan)
				return json(
					403,
					{ message: "API rate limit exceeded" },
					{ "x-ratelimit-remaining": "0" },
				);
			if (k?.loi?.branches)
				return json(k.loi.branches, { message: "Server Error" });
			if (
				!k?.dauNhanh ||
				decodeURIComponent(mNhanh[2] ?? "") !== (k.nhanh ?? "main")
			)
				return json(404, { message: "Branch not found", status: "404" });
			return json(200, {
				name: decodeURIComponent(mNhanh[2] ?? ""),
				commit: {
					sha: k.dauNhanh.sha,
					commit: { committer: { date: k.dauNhanh.commitLuc } },
				},
				protected: false,
			});
		}

		const mTep = p.match(/^\/repos\/([^/]+\/[^/]+)\/contents\/(.+)$/);
		if (mTep) {
			const ten = decodeURIComponent(mTep[1] ?? "");
			const duong = decodeURIComponent(mTep[2] ?? "");
			goi.push({
				duong: "contents",
				kho: ten,
				url: req.url,
				than,
				xacThuc,
				jwt: null,
			});
			if (xacThuc !== `token ${TOKEN_GIA}` && xacThuc !== `Bearer ${TOKEN_GIA}`)
				return json(401, { message: "Bad credentials" });
			const k = opts.kho[ten];
			if (k?.loi?.contents)
				return json(k.loi.contents, { message: "Server Error" });
			const html = k?.html(url.searchParams.get("ref") ?? "", duong) ?? null;
			if (html === null) return khongThay();
			if (req.headers.get("accept") !== "application/vnd.github.raw")
				return json(415, { message: "Unsupported media type" });
			return new Response(html, {
				status: 200,
				headers: {
					"content-type": "application/vnd.github.raw; charset=utf-8",
					"content-length": String(Buffer.byteLength(html)),
				},
			});
		}

		return khongThay();
	}

	return {
		xuLy,
		fetch: ((url: string | URL | Request, init?: RequestInit) =>
			xuLy(
				url instanceof Request ? url : new Request(url, init),
			)) as typeof fetch,
		goi,
		dem: (duong) => goi.filter((g) => g.duong === duong).length,
	};
}
