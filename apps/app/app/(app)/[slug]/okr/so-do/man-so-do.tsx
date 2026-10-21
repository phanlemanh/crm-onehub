"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { escTuXuLy } from "@crm/ui/lib/tu-xu-ly-esc";
import { useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useEffect } from "react";
import { okrQuanhMessages } from "@/lib/messages/okr-quanh";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import { useChuKy } from "../chon-chu-ky";
import { soDoParsers } from "../okr-search-params";
import { QuanhMucTieuNoiDung } from "../quanh-muc-tieu/quanh-muc-tieu";
import SoDoDonVi, { LocSoDoDonVi } from "../toan-canh/so-do-don-vi";
import { useToanManHinh } from "../toan-man-hinh";
import { buocEsc, lopDangMo } from "../toan-man-hinh-luat";
import { ChuaChuKy, Loi } from "../trang-thai-okr";
import { DaiCongCu } from "./dai-cong-cu";

function useEscToanManHinh(tam: string | null) {
	const { bat, dat } = useToanManHinh();
	const [thamSo, datThamSo] = useQueryStates(soDoParsers);
	const theDonViMo = tam === null && thamSo[SEARCH_PARAM.okr.moDonVi] !== null;
	useEffect(() => {
		if (!bat) return;
		const nghe = (e: KeyboardEvent) => {
			if (e.key !== "Escape") return;
			const buoc = buocEsc({
				tuXuLy: escTuXuLy(e.target),
				lopMo: lopDangMo(document),
				theDonViMo,
			});
			if (buoc === "dong-the")
				void datThamSo({ [SEARCH_PARAM.okr.moDonVi]: null });
			if (buoc === "thoat") dat(false);
		};
		document.addEventListener("keydown", nghe, true);
		return () => document.removeEventListener("keydown", nghe, true);
	}, [bat, dat, datThamSo, theDonViMo]);
}

export function KhungSoDoCho() {
	const m = okrQuanhMessages(useLocale());
	return (
		<div
			aria-busy="true"
			className="flex min-h-0 flex-1 flex-col items-center gap-10 rounded-lg border p-8"
			data-so-do-cho
		>
			<span className="sr-only">{m.dangTai}</span>
			<Skeleton className="h-24 w-64" />
			<div className="flex gap-8">
				<Skeleton className="h-20 w-56" />
				<Skeleton className="h-20 w-56" />
			</div>
		</div>
	);
}

export function ManSoDoCho({ coTam }: { coTam: boolean }) {
	return (
		<div className="flex min-h-0 flex-1 flex-col gap-3" data-man-so-do>
			<DaiCongCu coTam={coTam} tam={null} />
			<KhungSoDoCho />
		</div>
	);
}

function CaCongTy() {
	const trpc = useTRPC();
	const { cycles, currentId } = useChuKy();
	const access = useQuery(trpc.okr.access.queryOptions());
	if (cycles.isError)
		return (
			<>
				<DaiCongCu tam={null} />
				<Loi thuLai={() => void cycles.refetch()} />
			</>
		);
	if (cycles.isPending)
		return (
			<>
				<DaiCongCu tam={null} />
				<KhungSoDoCho />
			</>
		);
	if (currentId === null)
		return (
			<>
				<DaiCongCu tam={null} />
				<ChuaChuKy quanTri={access.data?.canManageProgram === true} />
			</>
		);
	return (
		<>
			<DaiCongCu loc={<LocSoDoDonVi cycleId={currentId} />} tam={null} />
			<SoDoDonVi cycleId={currentId} lop="toan-vung" />
		</>
	);
}

export function ManSoDo({ tam }: { tam: string | null }) {
	useEscToanManHinh(tam);
	return (
		<div className="flex min-h-0 flex-1 flex-col gap-3" data-man-so-do>
			{tam === null ? (
				<CaCongTy />
			) : (
				<>
					<DaiCongCu tam={tam} />
					<QuanhMucTieuNoiDung lop="toan-vung" objectiveId={tam} />
				</>
			)}
		</div>
	);
}
