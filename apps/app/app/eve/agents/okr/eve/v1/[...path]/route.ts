import {
	docDuocPhamVi,
	KHONG_TRONG_PHAM_VI,
	NOT_A_MEMBER,
	workspaceRoleOf,
} from "@crm/auth";
import { db } from "@crm/db";
import { capNhatPhien, hoanLuot, noiPhienMoCoi } from "@crm/db/okr-cuoc-soan";
import { laChoGiuPhien } from "@crm/validation/okr-cuoc-soan";
import { connection } from "next/server";
import {
	mintOkrBridgeToken,
	OKR_AGENT_URL,
	okrBridgeConfigured,
} from "@/lib/agent-bridge";
import { CUA_OKR } from "@/lib/cua-okr-config";
import { OKR_SOAN_CUA } from "@/lib/okr-soan-record";
import { getSession } from "@/lib/session";
import { getServerTrpcClient } from "@/lib/trpc/server";

const loi = (status: number, error: string) =>
	Response.json({ error }, { status });

type DangDuong = keyof typeof CUA_OKR.dangDuong;

async function handler(
	request: Request,
	{ params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
	await connection();

	if (!okrBridgeConfigured())
		return loi(CUA_OKR.trangThaiChuaCauHinh, CUA_OKR.loi.chuaCauHinh);

	const session = await getSession();
	if (!session) return loi(401, CUA_OKR.loi.chuaDangNhap);

	const role = await workspaceRoleOf(session.user.id);
	if (!role) return loi(403, NOT_A_MEMBER);
	if (!docDuocPhamVi(role, "okr")) return loi(403, KHONG_TRONG_PHAM_VI);

	const duong = khopDuong((await params).path);
	if (!duong) return loi(404, CUA_OKR.loi.duongKhongPhucVu);

	const dich = new URL(
		`${CUA_OKR.tienToEve}/${duong.doan.join("/")}`,
		OKR_AGENT_URL,
	);
	if (dich.origin !== new URL(OKR_AGENT_URL).origin) {
		return loi(404, CUA_OKR.loi.duongKhongPhucVu);
	}
	const url = new URL(request.url);
	dich.search = url.search;

	const ma = CUA_OKR.maCuoc.safeParse(request.headers.get(OKR_SOAN_CUA.header));
	if (!ma.success) return loi(400, CUA_OKR.loi.thieuCuoc);
	const cuocSoanId = ma.data;

	const cuoc = await db.okrCuocSoan.findUnique({
		where: { id: cuocSoanId },
		select: {
			nguoiMoUserId: true,
			trangThai: true,
			sessionId: true,
			cacPhien: true,
		},
	});
	if (!cuoc || cuoc.nguoiMoUserId !== session.user.id) {
		return loi(403, CUA_OKR.loi.cuocKhongThuocBan);
	}
	if (cuoc.trangThai !== "dang") return loi(403, CUA_OKR.loi.cuocKhongDang);

	if (
		duong.phien &&
		duong.phien !== cuoc.sessionId &&
		!cuoc.cacPhien.includes(duong.phien)
	) {
		return loi(403, CUA_OKR.loi.phienKhongThuocCuoc);
	}

	if (duong.phien && duong.phien !== cuoc.sessionId && !laChiDoc(request)) {
		return loi(409, CUA_OKR.loi.phienDaThay);
	}

	const moPhien = request.method === "POST" && duong.ten === "moPhien";
	if (moPhien && !laChoGiuPhien(cuoc.sessionId)) {
		return loi(409, CUA_OKR.loi.daCoPhien);
	}

	const giuCho = request.method === "POST" && laLuot(duong.ten);
	if (giuCho) {
		let luot: Awaited<ReturnType<typeof tangLuot>>;
		try {
			luot = await tangLuot(cuocSoanId);
		} catch {
			return loi(502, CUA_OKR.loi.khongDemDuocLuot);
		}
		if (!luot.ok) {
			return loi(CUA_OKR.trangThaiTuChoiLuot[luot.lyDo], luot.lyDo);
		}
	}

	const headers = new Headers(request.headers);
	for (const header of CUA_OKR.khongChuyen) headers.delete(header);
	for (const header of [...headers.keys()]) {
		if (header.startsWith(CUA_OKR.tienToRieng)) headers.delete(header);
	}
	headers.set(
		"authorization",
		`Bearer ${await mintOkrBridgeToken(
			{
				id: session.user.id,
				email: session.user.email,
				name: session.user.name,
			},
			{ cuocSoanId, vai: role },
		)}`,
	);

	const quaHan = new AbortController();
	const henGio = giuCho
		? setTimeout(() => quaHan.abort(), CUA_OKR.choTroLyMs)
		: undefined;
	const init: RequestInit & { duplex?: "half" } = {
		method: request.method,
		headers,
		redirect: "manual",
		signal: giuCho
			? AbortSignal.any([request.signal, quaHan.signal])
			: request.signal,
	};

	if (request.method !== "GET" && request.method !== "HEAD") {
		init.body = request.body;
		init.duplex = "half";
	}

	let upstream: Response;
	try {
		upstream = await fetch(dich, init);
	} catch (error) {
		const detail = error instanceof Error ? error.message : String(error);
		const khongNoi = { error: CUA_OKR.loi.khongNoiDuoc, detail };
		if (request.signal.aborted) return Response.json(khongNoi, { status: 502 });
		if (quaHan.signal.aborted)
			return loiHoan(giuCho, cuocSoanId, 504, { error: CUA_OKR.loi.quaHan });
		return loiHoan(giuCho, cuocSoanId, 502, khongNoi);
	} finally {
		clearTimeout(henGio);
	}

	if (giuCho && !upstream.ok && (await daHoan(cuocSoanId))) {
		const error =
			upstream.status >= 500 ? CUA_OKR.loi.troLyLoi : CUA_OKR.loi.troLyTuChoi;
		return Response.json(kemLuot({ error }, true), { status: upstream.status });
	}

	const responseHeaders = new Headers(upstream.headers);
	for (const header of CUA_OKR.khongTra) responseHeaders.delete(header);

	if (moPhien && upstream.ok) {
		const than = await upstream.text();
		const phienEve = docPhienEve(upstream.headers, than);
		if (!phienEve)
			return loiHoan(true, cuocSoanId, 502, {
				error: CUA_OKR.loi.khongDocDuocPhien,
			});
		const ghi = await ghiPhienEve(cuocSoanId, phienEve, cuoc.sessionId);
		if (ghi !== "da-ghi") {
			await noiPhienMoCoi(db, cuocSoanId, phienEve).catch(() => ({
				noi: false,
			}));
			return ghi === "thua"
				? loiHoan(true, cuocSoanId, 409, { error: CUA_OKR.loi.daCoPhien })
				: loiHoan(true, cuocSoanId, 502, {
						error: CUA_OKR.loi.khongGhiDuocPhien,
					});
		}
		return new Response(than, {
			status: upstream.status,
			statusText: upstream.statusText,
			headers: responseHeaders,
		});
	}

	return new Response(upstream.body, {
		status: upstream.status,
		statusText: upstream.statusText,
		headers: responseHeaders,
	});
}

export {
	handler as DELETE,
	handler as GET,
	handler as HEAD,
	handler as OPTIONS,
	handler as PATCH,
	handler as POST,
	handler as PUT,
};

async function daHoan(cuocSoanId: string): Promise<boolean> {
	try {
		return (await hoanLuot(db, cuocSoanId)).tru;
	} catch (error) {
		console.error("hoan-luot-hong", cuocSoanId, error);
		return false;
	}
}

function kemLuot(
	than: Record<string, string>,
	hoan: boolean,
): Record<string, string> {
	return hoan ? { ...than, luot: CUA_OKR.luotDaHoan } : than;
}

async function loiHoan(
	giuCho: boolean,
	cuocSoanId: string,
	status: number,
	than: Record<string, string>,
): Promise<Response> {
	const hoan = giuCho && (await daHoan(cuocSoanId));
	return Response.json(kemLuot(than, hoan), { status });
}

function tangLuot(cuocSoanId: string) {
	return getServerTrpcClient().okr.soanTangLuot.mutate({ cuocSoanId });
}

async function ghiPhienEve(
	cuocSoanId: string,
	phienEve: string,
	choGiu: string,
): Promise<"da-ghi" | "thua" | "hong"> {
	try {
		const { doi } = await capNhatPhien(db, cuocSoanId, phienEve, choGiu);
		return doi ? "da-ghi" : "thua";
	} catch {
		return "hong";
	}
}

function docPhienEve(headers: Headers, than: string): string | null {
	const tuHeader = CUA_OKR.phienEve.ma.safeParse(
		headers.get(CUA_OKR.phienEve.header),
	);
	if (tuHeader.success) return tuHeader.data;
	try {
		const tuThan = CUA_OKR.phienEve.than.safeParse(JSON.parse(than));
		return tuThan.success ? tuThan.data.sessionId : null;
	} catch {
		return null;
	}
}

function laChiDoc(request: Request): boolean {
	return CUA_OKR.chiDoc.some((method) => method === request.method);
}

function laLuot(ten: DangDuong): boolean {
	return CUA_OKR.dangLuot.some((luot) => luot === ten);
}

function khopDuong(
	vao: string[],
): { ten: DangDuong; doan: string[]; phien: string | null } | null {
	const doan = CUA_OKR.doanDuong.safeParse(vao);
	if (!doan.success) return null;
	const thuc = doan.data;
	for (const ten of Object.keys(CUA_OKR.dangDuong).filter(isDangDuong)) {
		const mau: readonly string[] = CUA_OKR.dangDuong[ten];
		if (mau.length !== thuc.length) continue;
		if (!mau.every((phan, i) => phan === CUA_OKR.phien || phan === thuc[i])) {
			continue;
		}
		const viTri = mau.indexOf(CUA_OKR.phien);
		return { ten, doan: thuc, phien: viTri < 0 ? null : (thuc[viTri] ?? null) };
	}
	return null;
}

function isDangDuong(ten: string): ten is DangDuong {
	return ten in CUA_OKR.dangDuong;
}
