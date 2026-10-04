"use client";

import { useKhaiThayDoi } from "@crm/ui/components/giu-thay-doi";
import { useMountEffect } from "@crm/ui/hooks/use-mount-effect";
import { laChoGiuPhien } from "@crm/validation/okr-cuoc-soan";
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
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { SOAN_UI } from "./cau-hinh";
import { guiHuyLuot, kieuKhep, luotDangChay } from "./huy-luot";
import type {
	CuocSoan,
	DongSoan,
	DonViSoan,
	KetSoBanNhap,
	SoDaGo,
	SoKr,
} from "./kieu";
import {
	type LyDoHong,
	laChuaCauHinh,
	laDaCoPhien,
	lyDoHong,
	lyDoTuChoiLuot,
} from "./loi-cua";
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
	return useQuery({
		...trpc.okr.soanDanhSach.queryOptions({ cuocSoanId }),
		retry: false,
	});
}

type BanNhapDaXet = {
	nguon: readonly DongSoan[];
	goc: readonly DongSoan[];
	ket: KetSoBanNhap;
};

type ChoGuiLai = {
	ma: number;
	tin: string;
	tu: number;
	luot: string | undefined;
	daKhep: boolean;
	daHuy: boolean;
};

type PhienThan = { theo: string; id: string; lan: number; choNap: boolean };

export function usePhienCuoc(cuoc: CuocSoan) {
	const [phien, setPhien] = useState<PhienThan>({
		theo: cuoc.sessionId,
		id: cuoc.sessionId,
		lan: 0,
		choNap: false,
	});
	if (phien.theo !== cuoc.sessionId) {
		const vuaGanEve =
			laChoGiuPhien(phien.theo) && !laChoGiuPhien(cuoc.sessionId);
		setPhien({
			theo: cuoc.sessionId,
			id: vuaGanEve && !phien.choNap ? phien.id : cuoc.sessionId,
			lan: phien.choNap ? phien.lan + 1 : phien.lan,
			choNap: false,
		});
	}
	const idThan = phien.id;
	const thread = useQuery<Thread>({
		queryKey: ["soan-thread", cuoc.id, idThan],
		enabled: cuoc.trangThai === "dang" && !laChoGiuPhien(idThan),
		staleTime: SOAN_UI.giuPhienMs,
		gcTime: 0,
		refetchOnWindowFocus: false,
		refetchInterval: (q) =>
			q.state.data?.status === "working" ? SOAN_UI.hoiLuongMs : false,
		queryFn: ({ signal }) =>
			loadThread(idThan, okrSoanHeader(cuoc.id), signal, OKR_SOAN_CUA.host),
	});
	const luong = thread.data?.status === "working" ? "chay" : "yen";
	return {
		khoa: `${idThan}#${phien.lan}#${luong}`,
		thread,
		napLai: () =>
			setPhien((p) =>
				laChoGiuPhien(p.theo)
					? { ...p, choNap: true }
					: { ...p, id: p.theo, lan: p.lan + 1 },
			),
	};
}

export function useNhapCuoc(dong: readonly DongSoan[]) {
	const [xet, setXet] = useState<BanNhapDaXet>(() => ({
		nguon: dong,
		goc: dong,
		ket: soBanNhap([], dong),
	}));
	if (xet.nguon !== dong) {
		setXet({ nguon: dong, goc: xet.goc, ket: soBanNhap(xet.goc, dong) });
	}
	const [so, setSo] = useState<SoDaGo>({});
	const [chu, setChu] = useState("");
	const khaiSo = useKhaiThayDoi();
	const khaiChu = useKhaiThayDoi();
	return {
		ket: xet.ket,
		luotBatDau: () =>
			setXet((cu) => ({
				nguon: cu.nguon,
				goc: cu.nguon,
				ket: soBanNhap(cu.nguon, cu.nguon),
			})),
		so,
		datSo: (krId: string, moi: SoKr) => {
			setSo((cu) => ({ ...cu, [krId]: moi }));
			khaiSo(true);
		},
		xongSo: () => khaiSo(false),
		chu,
		doiChu: (moi: string) => {
			setChu(moi);
			khaiChu(moi.trim() !== "");
		},
	};
}

export type NhapCuoc = ReturnType<typeof useNhapCuoc>;

export function useCuocSoan({
	cuoc,
	thread,
	nhap,
	napLai,
}: {
	cuoc: CuocSoan;
	thread: Thread | undefined;
	nhap: NhapCuoc;
	napLai: () => void;
}) {
	const trpc = useTRPC();
	const qc = useQueryClient();
	const cache = useCrmCache();
	const docLaiRoi = () =>
		qc.invalidateQueries({
			queryKey: trpc.okr.soanDanhSach.queryKey({ cuocSoanId: cuoc.id }),
		});
	const docLai = () => void docLaiRoi();
	const daBaoPhien = useRef(false);
	const choGuiLai = useRef<ChoGuiLai | null>(null);
	const soChuoi = useRef(0);
	const henKhep = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [dangChoKhep, setDangChoKhep] = useState(false);
	const [loiGuiLai, setLoiGuiLai] = useState(false);
	const cuoiCung = useRef<string | null>(null);

	const guiThang = async (chu: string) => {
		cuoiCung.current = chu;
		try {
			await agent.send({ message: chu });
			return true;
		} catch {
			return false;
		}
	};
	const guiLai = async (tin: string) => {
		setLoiGuiLai(false);
		if (!(await guiThang(tin))) setLoiGuiLai(true);
	};
	const boChuoi = (loi: boolean) => {
		choGuiLai.current = null;
		if (henKhep.current) clearTimeout(henKhep.current);
		setDangChoKhep(false);
		if (loi) setLoiGuiLai(true);
	};
	const danhDau = (
		ma: number,
		moi: Pick<ChoGuiLai, "daKhep"> | Pick<ChoGuiLai, "daHuy">,
	) => {
		const cho = choGuiLai.current;
		if (!cho || cho.ma !== ma) return;
		const sau = { ...cho, ...moi };
		choGuiLai.current = sau;
		if (!sau.daKhep || !sau.daHuy) return;
		boChuoi(false);
		void guiLai(sau.tin);
	};
	const khiKhep = (suKien: Parameters<typeof kieuKhep>[0]) => {
		const cho = choGuiLai.current;
		if (!cho) return;
		const kieu = kieuKhep(suKien, cho.tu, cho.luot);
		if (kieu === "huy") danhDau(cho.ma, { daKhep: true });
		else boChuoi(kieu === "loi");
	};
	const hetChoKhep = (ma: number) => {
		if (choGuiLai.current?.ma !== ma) return;
		boChuoi(true);
		agent.stop();
	};
	const huyLuot = (tin: string, phien: string) => {
		soChuoi.current += 1;
		const ma = soChuoi.current;
		const luot = luotDangChay(agent.events);
		choGuiLai.current = {
			ma,
			tin,
			tu: agent.events.length,
			luot,
			daKhep: false,
			daHuy: false,
		};
		setDangChoKhep(true);
		henKhep.current = setTimeout(() => hetChoKhep(ma), SOAN_UI.choKhepMs);
		void guiHuyLuot({ phien, cuocSoanId: cuoc.id, luot }).then((daHuy) => {
			if (daHuy) danhDau(ma, { daHuy: true });
			else if (choGuiLai.current?.ma === ma) boChuoi(true);
		});
	};

	const agent = useEveAgent({
		host: OKR_SOAN_CUA.host,
		headers: okrSoanHeader(cuoc.id),
		...(thread && "session" in thread
			? { initialSession: thread.session, initialEvents: eventsOf(thread) }
			: { initialEvents: eventsOf(thread) }),
		onSessionChange: (phien) => {
			if (daBaoPhien.current || !phien.sessionId) return;
			if (!laChoGiuPhien(cuoc.sessionId)) return;
			daBaoPhien.current = true;
			docLai();
		},
		onError: (loi) => {
			if (laDaCoPhien(loi)) void docLaiRoi().then(napLai);
		},
		onFinish: (snap) => khiKhep(snap.events),
	});
	const busy = agent.status === "submitted" || agent.status === "streaming";
	const dangTraLoi = busy || thread?.status === "working";
	const soSuKien = agent.events.length + eventsOf(thread).length;

	const [lanThu, setLanThu] = useState(0);
	const [lyDoTruoc, setLyDoTruoc] = useState<LyDoHong | null>(null);
	const [mocThu, setMocThu] = useState<number | null>(null);
	const trongChuoiThu = mocThu === soSuKien || dangChoKhep || loiGuiLai;
	const [hetGioTai, setHetGioTai] = useState<string | null>(null);
	const moc = `${lanThu}:${soSuKien}`;
	const qua45s = dangTraLoi && hetGioTai === moc;
	const baoHetGio = () => setHetGioTai(moc);

	const { locked, ended } = composerState(thread, busy);
	const lyDoLuot =
		agent.status === "error" ? lyDoTuChoiLuot(agent.error) : null;
	const chuaCauHinh = agent.status === "error" && laChuaCauHinh(agent.error);
	const cuocDong = cuoc.trangThai !== "dang";
	const hetLuot = cuoc.soLuot >= cuoc.tranLuot || lyDoLuot === "het-luot-cuoc";
	const moLai = useMutation(trpc.okr.soanMo.mutationOptions());
	const hong =
		lyDoLuot === null &&
		!chuaCauHinh &&
		!cuocDong &&
		!laDaCoPhien(agent.error) &&
		(qua45s ||
			agent.status === "error" ||
			ended ||
			moLai.isError ||
			dangChoKhep ||
			loiGuiLai);
	const lyDoMoi = lyDoHong({
		loi: agent.status === "error" ? agent.error : undefined,
		qua45s,
		loiMoLai: moLai.error,
	});
	const dangThu =
		dangChoKhep ||
		(trongChuoiThu && (agent.status === "submitted" || moLai.isPending));
	const khoaSoan =
		locked || hetLuot || hong || cuocDong || lyDoLuot !== null || chuaCauHinh;

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

	const thuLai = () => {
		setLyDoTruoc(lyDoMoi);
		setLanThu(trongChuoiThu ? lanThu + 1 : 1);
		setMocThu(soSuKien);
		moLai.reset();
		const tin = cuoiCung.current;
		const phien = agent.session.sessionId;
		if (agent.session.continuationToken && tin && !ended) {
			if (busy && phien) huyLuot(tin, phien);
			else void guiLai(tin);
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
				if (!kq.ok) return;
				nhap.xongSo();
				void cache.okr();
			},
			onSettled: docLai,
		}),
	);

	const cay = cayNhap(nhap.ket.dong);
	return {
		agent,
		busy,
		dangTraLoi,
		moc,
		baoHetGio,
		docLai,
		luotBatDau: nhap.luotBatDau,
		khoaSoan,
		hong,
		qua45s,
		dangThu,
		lanThu: trongChuoiThu ? lanThu : 0,
		lyDoHong: dangThu ? lyDoTruoc : lyDoMoi,
		chuaGuiLai: loiGuiLai && !dangChoKhep,
		lyDoLuot,
		chuaCauHinh,
		hetLuot,
		cuocDong,
		gui,
		thuLai,
		moLai,
		transcript: toTranscript(agent.data.messages),
		nhan: nhap.ket.nhan,
		cay,
		so: nhap.so,
		datSo: nhap.datSo,
		chu: nhap.chu,
		doiChu: nhap.doiChu,
		thieu: krThieuSo(cay, nhap.so),
		dem: demDuaVao(cay),
		quyet,
		duaVao,
		guiDuaVao: () =>
			duaVao.mutate({ cuocSoanId: cuoc.id, kr: krDuaVao(cay, nhap.so) }),
	};
}

export type CuocDangSoan = ReturnType<typeof useCuocSoan>;
