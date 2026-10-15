import { db } from "@crm/db";
import { ghiPhienEve, laPlaceholder } from "@crm/db/okr-cuoc-hoi";
import type { WorkspaceRole } from "@crm/validation/vai-workspace";
import { mintOkrBridgeToken } from "@/lib/agent-bridge";
import { CUA_OKR, CUA_OKR_HOI } from "@/lib/cua-okr-config";
import { getServerTrpcClient } from "@/lib/trpc/server";

type DangDuong = keyof typeof CUA_OKR.dangDuong;

export type VaoCuaHoi = {
	request: Request;
	duong: { ten: DangDuong; phien: string | null };
	dich: URL;
	user: { id: string; email: string; name: string };
	role: WorkspaceRole;
	maHoi: string;
};

const loi = (status: number, error: string) =>
	Response.json({ error }, { status });

const laChiDoc = (request: Request) =>
	CUA_OKR.chiDoc.some((m) => m === request.method);

const laLuot = (ten: DangDuong) => CUA_OKR.dangLuot.some((l) => l === ten);

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

export async function cuaHoi(v: VaoCuaHoi): Promise<Response> {
	const ma = CUA_OKR.maCuoc.safeParse(v.maHoi);
	if (!ma.success) return loi(400, CUA_OKR_HOI.loi.thieuCuoc);
	const cuocHoiId = ma.data;
	const cuoc = await db.okrCuocHoi.findUnique({
		where: { id: cuocHoiId },
		select: { nguoiHoiUserId: true, sessionId: true, cacPhien: true },
	});
	if (!cuoc || cuoc.nguoiHoiUserId !== v.user.id)
		return loi(403, CUA_OKR.loi.cuocKhongThuocBan);

	const { phien, ten } = v.duong;
	if (phien && phien !== cuoc.sessionId && !cuoc.cacPhien.includes(phien))
		return loi(403, CUA_OKR.loi.phienKhongThuocCuoc);
	if (phien && phien !== cuoc.sessionId && !laChiDoc(v.request))
		return loi(409, CUA_OKR.loi.phienDaThay);

	const moPhien = v.request.method === "POST" && ten === "moPhien";
	if (moPhien && !laPlaceholder(cuoc.sessionId))
		return loi(409, CUA_OKR.loi.daCoPhien);

	if (v.request.method === "POST" && laLuot(ten)) {
		let luot: Awaited<
			ReturnType<
				ReturnType<typeof getServerTrpcClient>["okr"]["hoiTangLuot"]["mutate"]
			>
		>;
		try {
			luot = await getServerTrpcClient().okr.hoiTangLuot.mutate({ cuocHoiId });
		} catch {
			return loi(502, CUA_OKR.loi.khongDemDuocLuot);
		}
		if (!luot.ok) return loi(429, luot.lyDo);
	}

	const headers = new Headers(v.request.headers);
	for (const header of CUA_OKR.khongChuyen) headers.delete(header);
	for (const header of [...headers.keys()]) {
		if (header.startsWith(CUA_OKR.tienToRieng)) headers.delete(header);
	}
	headers.set(
		"authorization",
		`Bearer ${await mintOkrBridgeToken(v.user, { cuocHoiId, vai: v.role })}`,
	);
	const init: RequestInit & { duplex?: "half" } = {
		method: v.request.method,
		headers,
		redirect: "manual",
		signal: v.request.signal,
	};
	if (!laChiDoc(v.request)) {
		init.body = v.request.body;
		init.duplex = "half";
	}

	let upstream: Response;
	try {
		upstream = await fetch(v.dich, init);
	} catch (error) {
		const detail = error instanceof Error ? error.message : String(error);
		return Response.json(
			{ error: CUA_OKR.loi.khongNoiDuoc, detail },
			{ status: 502 },
		);
	}
	const responseHeaders = new Headers(upstream.headers);
	for (const header of CUA_OKR.khongTra) responseHeaders.delete(header);

	if (moPhien && upstream.ok) {
		const than = await upstream.text();
		const phienEve = docPhienEve(upstream.headers, than);
		if (!phienEve) return loi(502, CUA_OKR.loi.khongDocDuocPhien);
		try {
			await ghiPhienEve(db, cuocHoiId, phienEve);
		} catch {
			return loi(502, CUA_OKR.loi.khongGhiDuocPhien);
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
