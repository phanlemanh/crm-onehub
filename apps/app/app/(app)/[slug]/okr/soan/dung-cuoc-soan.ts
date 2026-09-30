"use client";

import { useKhaiThayDoi } from "@crm/ui/components/giu-thay-doi";
import { useMountEffect } from "@crm/ui/hooks/use-mount-effect";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEveAgent } from "eve/react";
import { useRef, useState } from "react";
import {
	composerState,
	eventsOf,
	loadThread,
	type Thread,
} from "@/lib/agent-session";
import { toTranscript } from "@/lib/agent-transcript";
import { OKR_SOAN_CUA, okrSoanHeader } from "@/lib/okr-soan-record";
import { useTRPC } from "@/lib/trpc/client";
import { SOAN_UI } from "./cau-hinh";
import type {
	CuocSoan,
	DongSoan,
	DonViSoan,
	KetSoBanNhap,
	SoDaGo,
	SoKr,
} from "./kieu";
import { lyDoTuChoiLuot } from "./loi-cua";
import {
	cayNhap,
	demDuaVao,
	krDuaVao,
	krThieuSo,
	soBanNhap,
} from "./luat-ban-nhap";

export function donViCua(cuoc: CuocSoan): DonViSoan {
	return {
		cycleId: cuoc.cycleId,
		level: cuoc.level,
		divisionId: cuoc.divisionId,
		departmentId: cuoc.departmentId,
	};
}

export function useLuongCuoc(cuocSoanId: string) {
	const trpc = useTRPC();
	const danhSach = useQuery({
		...trpc.okr.soanDanhSach.queryOptions({ cuocSoanId }),
		retry: false,
	});
	const cuoc = danhSach.data?.cuoc;
	const sessionId = cuoc?.sessionId ?? null;
	const thread = useQuery<Thread>({
		queryKey: ["soan-thread", cuocSoanId, sessionId],
		enabled: sessionId !== null && cuoc?.trangThai === "dang",
		staleTime: SOAN_UI.giuPhienMs,
		refetchOnWindowFocus: false,
		queryFn: ({ signal }) =>
			loadThread(
				sessionId ?? "",
				okrSoanHeader(cuocSoanId),
				signal,
				OKR_SOAN_CUA.host,
			),
	});
	return { danhSach, thread };
}

type BanNhapDaXet = {
	nguon: readonly DongSoan[];
	truoc: readonly DongSoan[];
	ket: KetSoBanNhap;
};

export function useCuocSoan({
	cuoc,
	dong,
	thread,
}: {
	cuoc: CuocSoan;
	dong: readonly DongSoan[];
	thread: Thread | undefined;
}) {
	const trpc = useTRPC();
	const qc = useQueryClient();
	const agent = useEveAgent({
		host: OKR_SOAN_CUA.host,
		headers: okrSoanHeader(cuoc.id),
		...(thread && "session" in thread
			? { initialSession: thread.session, initialEvents: eventsOf(thread) }
			: { initialEvents: eventsOf(thread) }),
	});
	const busy = agent.status === "submitted" || agent.status === "streaming";
	const soSuKien = agent.events.length;

	const [xet, setXet] = useState<BanNhapDaXet>(() => ({
		nguon: dong,
		truoc: dong,
		ket: soBanNhap([], dong),
	}));
	if (xet.nguon !== dong) {
		setXet({ nguon: dong, truoc: dong, ket: soBanNhap(xet.truoc, dong) });
	}

	const [so, setSo] = useState<SoDaGo>({});
	const khaiSo = useKhaiThayDoi();
	const datSo = (krId: string, moi: SoKr) => {
		setSo((cu) => ({ ...cu, [krId]: moi }));
		khaiSo(true);
	};

	const [hetGioTai, setHetGioTai] = useState<number | null>(null);
	const qua45s = busy && hetGioTai === soSuKien;
	const baoHetGio = () => setHetGioTai(soSuKien);

	const cuoiCung = useRef<string | null>(null);
	const docLai = () =>
		void qc.invalidateQueries({
			queryKey: trpc.okr.soanDanhSach.queryKey({ cuocSoanId: cuoc.id }),
		});

	const { locked, ended } = composerState(thread, busy);
	const lyDoLuot =
		agent.status === "error" ? lyDoTuChoiLuot(agent.error) : null;
	const cuocDong = cuoc.trangThai !== "dang";
	const hetLuot = cuoc.soLuot >= cuoc.tranLuot || lyDoLuot === "het-luot-cuoc";
	const hong =
		lyDoLuot === null &&
		!cuocDong &&
		(qua45s || agent.status === "error" || ended);
	const khoaSoan = locked || hetLuot || hong || cuocDong || lyDoLuot !== null;

	const guiThang = async (chu: string) => {
		cuoiCung.current = chu;
		try {
			await agent.send({ message: chu });
		} catch {
			return;
		}
	};
	const gui = (chu: string) => {
		const s = chu.trim();
		if (!s || khoaSoan) return;
		void guiThang(s);
	};

	useMountEffect(() => {
		const chuaCoLuot =
			cuoc.trangThai === "dang" &&
			cuoc.soLuot === 0 &&
			eventsOf(thread).length === 0 &&
			thread?.status !== "working";
		if (chuaCoLuot) void guiThang(SOAN_UI.luotMoDau);
	});

	const moLai = useMutation(trpc.okr.soanMo.mutationOptions());
	const thuLai = () => {
		const tin = cuoiCung.current;
		if (agent.session.continuationToken && tin && !ended) {
			if (busy) agent.stop();
			setHetGioTai(null);
			void guiThang(tin);
			return;
		}
		moLai.mutate(
			{ ...donViCua(cuoc), thuLaiCuocId: cuoc.id },
			{ onSuccess: (kq) => (kq.ok ? docLai() : undefined) },
		);
	};

	const quyet = useMutation(
		trpc.okr.soanQuyet.mutationOptions({ onSettled: docLai }),
	);
	const duaVao = useMutation(
		trpc.okr.soanDuaVao.mutationOptions({
			onSuccess: (kq) => {
				if (kq.ok) khaiSo(false);
			},
			onSettled: docLai,
		}),
	);

	const cay = cayNhap(xet.ket.dong);
	return {
		agent,
		busy,
		soSuKien,
		baoHetGio,
		docLai,
		khoaSoan,
		hong,
		qua45s,
		lyDoLuot,
		hetLuot,
		cuocDong,
		gui,
		thuLai,
		moLai,
		transcript: toTranscript(agent.data.messages),
		nhan: xet.ket.nhan,
		cay,
		so,
		datSo,
		thieu: krThieuSo(cay, so),
		dem: demDuaVao(cay),
		quyet,
		duaVao,
		guiDuaVao: () =>
			duaVao.mutate({ cuocSoanId: cuoc.id, kr: krDuaVao(cay, so) }),
	};
}

export type CuocDangSoan = ReturnType<typeof useCuocSoan>;
