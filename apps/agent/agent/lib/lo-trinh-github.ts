import { createSign } from "node:crypto";
import type { GhiBanChup } from "@crm/db/ban-chup-lo-trinh";
import {
	LO_TRINH_SAN_PHAM,
	type TrangThaiLay,
} from "@crm/db/san-pham-lo-trinh-danh-muc";
import { BAN_CHUP_LO_TRINH } from "@crm/validation/ban-chup-lo-trinh";
import { docDuLieu } from "@crm/validation/doc-du-lieu-lo-trinh";
import { phanTichLoTrinh } from "@crm/validation/lo-trinh-du-lieu";
import { z } from "zod";

const API_GOC = "https://api.github.com";
const PHIEN_BAN_API = "2022-11-28";

export type CauHinhGithubApp = { appId: string; khoa: string; apiUrl: string };

export type NguonSanPham = {
	ma: string;
	kho: string;
	nhanh: string;
	duongTep: string;
};

export type KetQuaGithub = {
	trangThai: TrangThaiLay;
	chiTiet: string | null;
	caiLuc: Date | null;
	banChup: GhiBanChup | null;
	phienBan: number | null;
	khongDoi: boolean;
};

const caiDat = z.object({ id: z.number().int(), created_at: z.string() });
const tokenCai = z.object({ token: z.string().min(1) });
const nhanh = z.object({
	commit: z.object({
		sha: z.string().regex(/^[0-9a-f]{40}$/),
		commit: z.object({ committer: z.object({ date: z.string() }) }),
	}),
});
const khoiJson = z.record(z.string(), z.json());

export function cauHinhGithubApp(): CauHinhGithubApp | null {
	const appId = process.env.GITHUB_APP_ID?.trim();
	const khoa = process.env.GITHUB_APP_PRIVATE_KEY?.trim();
	if (!appId || !khoa) return null;
	const ghiDe =
		process.env.NODE_ENV === "production"
			? null
			: process.env.GITHUB_API_URL?.trim().replace(/\/+$/, "") || null;
	return { appId, khoa: khoa.replace(/\\n/g, "\n"), apiUrl: ghiDe ?? API_GOC };
}

export function kyJwtUngDung(cau: CauHinhGithubApp, nowMs: number): string {
	const giay = Math.floor(nowMs / 1000);
	const iat = giay - LO_TRINH_SAN_PHAM.jwtLuiGiay;
	const exp = giay + LO_TRINH_SAN_PHAM.jwtSongGiay;
	const ma = (
		o: { alg: string; typ: string } | { iat: number; exp: number; iss: string },
	) => Buffer.from(JSON.stringify(o)).toString("base64url");
	const dauThan = `${ma({ alg: "RS256", typ: "JWT" })}.${ma({ iat, exp, iss: cau.appId })}`;
	const ky = createSign("RSA-SHA256").update(dauThan).sign(cau.khoa);
	return `${dauThan}.${ky.toString("base64url")}`;
}

function hong(
	trangThai: TrangThaiLay,
	chiTiet: string,
	caiLuc: Date | null = null,
): KetQuaGithub {
	return {
		trangThai,
		chiTiet,
		caiLuc,
		banChup: null,
		phienBan: null,
		khongDoi: false,
	};
}

function loiGithub(res: Response): KetQuaGithub {
	const het = res.headers.get("x-ratelimit-remaining") === "0";
	return hong("loi-github", het ? "rate-limit" : `http ${res.status}`);
}

export async function layLoTrinhTuGithub(
	cau: CauHinhGithubApp,
	sp: NguonSanPham,
	shaDangLuu: string | null,
	nowMs: number,
	f: typeof fetch = fetch,
): Promise<KetQuaGithub> {
	const goi = (duong: string, init: RequestInit = {}) =>
		f(`${cau.apiUrl}${duong}`, {
			...init,
			headers: {
				"x-github-api-version": PHIEN_BAN_API,
				accept: "application/vnd.github+json",
				...init.headers,
			},
			signal: AbortSignal.timeout(LO_TRINH_SAN_PHAM.tranGoiMs),
		});
	const [chu, tenKho] = sp.kho.split("/");
	const duongKho = `/repos/${encodeURIComponent(chu ?? "")}/${encodeURIComponent(tenKho ?? "")}`;
	const jwt = kyJwtUngDung(cau, nowMs);

	const resCai = await goi(`${duongKho}/installation`, {
		headers: { authorization: `Bearer ${jwt}` },
	});
	if (resCai.status === 404) return hong("chua-cai", "installation 404");
	if (!resCai.ok) return loiGithub(resCai);
	const cai = caiDat.parse(await resCai.json());
	const caiLuc = new Date(cai.created_at);

	const resTok = await goi(`/app/installations/${cai.id}/access_tokens`, {
		method: "POST",
		headers: {
			authorization: `Bearer ${jwt}`,
			"content-type": "application/json",
		},
		body: JSON.stringify({
			repositories: [tenKho],
			permissions: { contents: "read", metadata: "read" },
		}),
	});
	if (!resTok.ok) return { ...loiGithub(resTok), caiLuc };
	const { token } = tokenCai.parse(await resTok.json());
	const xacThuc = { authorization: `Bearer ${token}` };

	const resNhanh = await goi(
		`${duongKho}/branches/${encodeURIComponent(sp.nhanh)}`,
		{ headers: xacThuc },
	);
	if (resNhanh.status === 404)
		return hong("khong-thay-kho", "branch 404", caiLuc);
	if (!resNhanh.ok) return { ...loiGithub(resNhanh), caiLuc };
	const dau = nhanh.parse(await resNhanh.json()).commit;
	if (shaDangLuu === dau.sha)
		return {
			trangThai: "da-lay",
			chiTiet: null,
			caiLuc,
			banChup: null,
			phienBan: null,
			khongDoi: true,
		};

	const duongTep = sp.duongTep.split("/").map(encodeURIComponent).join("/");
	const resTep = await goi(`${duongKho}/contents/${duongTep}?ref=${dau.sha}`, {
		headers: { ...xacThuc, accept: "application/vnd.github.raw" },
	});
	if (resTep.status === 404)
		return hong("khong-thay-tep", "contents 404", caiLuc);
	if (!resTep.ok) return { ...loiGithub(resTep), caiLuc };
	if (
		Number(resTep.headers.get("content-length") ?? 0) >
		LO_TRINH_SAN_PHAM.tranTepByte
	)
		return hong("qua-tran", "content-length", caiLuc);
	const html = await resTep.text();
	if (Buffer.byteLength(html) > LO_TRINH_SAN_PHAM.tranTepByte)
		return hong("qua-tran", "body", caiLuc);

	const { duLieu, canhBao } = docDuLieu(html);
	if (duLieu === null) return hong("khoi-hong", canhBao.join(" · "), caiLuc);
	const kq = phanTichLoTrinh(duLieu);
	if (!kq.ok)
		return hong("khoi-hong", `${kq.duongKhoa}: ${kq.thongDiep}`, caiLuc);
	return {
		trangThai: "da-lay",
		chiTiet: canhBao.length > 0 ? canhBao.join(" · ") : null,
		caiLuc,
		banChup: {
			nguon: sp.ma,
			sha: dau.sha,
			commitLuc: dau.commit.committer.date,
			duLieu: khoiJson.parse(duLieu),
			canhBao: canhBao.slice(0, BAN_CHUP_LO_TRINH.tranCanhBao),
		},
		phienBan: kq.duLieu.phien_ban,
		khongDoi: false,
	};
}
