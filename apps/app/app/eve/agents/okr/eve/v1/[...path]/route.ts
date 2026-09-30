import {
	docDuocPhamVi,
	KHONG_TRONG_PHAM_VI,
	NOT_A_MEMBER,
	workspaceRoleOf,
} from "@crm/auth";
import { db } from "@crm/db";
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

async function handler(request: Request): Promise<Response> {
	await connection();

	if (!okrBridgeConfigured()) return loi(503, CUA_OKR.loi.chuaCauHinh);

	const session = await getSession();
	if (!session) return loi(401, CUA_OKR.loi.chuaDangNhap);

	const role = await workspaceRoleOf(session.user.id);
	if (!role) return loi(403, NOT_A_MEMBER);
	if (!docDuocPhamVi(role, "okr")) return loi(403, KHONG_TRONG_PHAM_VI);

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

	const url = new URL(request.url);
	const duongEve = url.pathname.slice(OKR_SOAN_CUA.host.length);
	const phienXin = sessionFromPath(duongEve);
	if (
		phienXin &&
		phienXin !== cuoc.sessionId &&
		!cuoc.cacPhien.includes(phienXin)
	) {
		return loi(403, CUA_OKR.loi.phienKhongThuocCuoc);
	}

	if (request.method === "POST" && CUA_OKR.duongLuot.test(duongEve)) {
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

	const init: RequestInit & { duplex?: "half" } = {
		method: request.method,
		headers,
		redirect: "manual",
		signal: request.signal,
	};

	if (request.method !== "GET" && request.method !== "HEAD") {
		init.body = request.body;
		init.duplex = "half";
	}

	let upstream: Response;
	try {
		upstream = await fetch(`${OKR_AGENT_URL}${duongEve}${url.search}`, init);
	} catch (error) {
		return Response.json(
			{
				error: CUA_OKR.loi.khongNoiDuoc,
				detail: error instanceof Error ? error.message : String(error),
			},
			{ status: 502 },
		);
	}

	const responseHeaders = new Headers(upstream.headers);
	for (const header of CUA_OKR.khongTra) responseHeaders.delete(header);

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

function tangLuot(cuocSoanId: string) {
	return getServerTrpcClient().okr.soanTangLuot.mutate({ cuocSoanId });
}

function sessionFromPath(pathname: string): string | null {
	const match = pathname.match(CUA_OKR.duongPhien);
	return match?.[1] ? decodeURIComponent(match[1]) : null;
}
