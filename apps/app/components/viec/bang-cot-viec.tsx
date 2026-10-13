"use client";

import {
	Board,
	type BoardCard,
	type BoardColumn,
	type BoardMove,
} from "@crm/ui/components/board";
import { Button } from "@crm/ui/components/button";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import type { NhomViec } from "@crm/validation/viec";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { viecMessages } from "@/lib/messages/viec";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { HoiDongCha } from "./hoi-dong-cha";
import { DongGapViec } from "./khoi-viec";
import {
	COT_BANG,
	type CotBang,
	laCotBang,
	PhuTheViec,
	type TheBang,
	TheViecBang,
} from "./the-viec-bang";

type Keo = {
	id: string;
	den: CotBang;
	thuTu: string[];
	nguon: "bang-keo" | "bang-menu";
};

const THE_CHO = ["a", "b", "c"];

function laLoiMang(e: unknown): boolean {
	return !(e instanceof TRPCClientError) || e.data == null;
}

export function BangCotViec({
	nhom,
	onXemDanhSach,
}: {
	nhom: NhomViec;
	onXemDanhSach: () => void;
}) {
	const m = viecMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();
	const open = useOpenRecord();
	const thamSo = useSearchParams();
	const q = useQuery(trpc.viec.bang.queryOptions({ nhom }));
	const [cho, setCho] = useState<ReadonlyMap<string, Keo>>(new Map());
	const [hoi, setHoi] = useState<{ keo: Keo; conMo: number } | null>(null);
	const keo = useMutation(trpc.viec.keo.mutationOptions());
	const chiXem = nhom === "dang-theo-doi";

	const boCho = (id: string) =>
		setCho((cu) => {
			const moi = new Map(cu);
			moi.delete(id);
			return moi;
		});

	const gui = (k: Keo) => {
		setCho((cu) => new Map(cu).set(k.id, k));
		keo.mutate(
			{ id: k.id, den: k.den, thuTu: k.thuTu, nguon: k.nguon },
			{
				onError: (e) => {
					boCho(k.id);
					toast.error(
						laLoiMang(e) ? m.bang.loiMoTa : e.message,
						laLoiMang(e)
							? { action: { label: m.bang.thuLai, onClick: () => gui(k) } }
							: undefined,
					);
				},
				onSettled: async () => {
					await cache.viec();
					boCho(k.id);
				},
			},
		);
	};

	if (q.isPending) {
		return (
			<div
				aria-busy="true"
				className="flex gap-3 overflow-hidden rounded-lg border bg-card p-3"
				data-bang-cho-tai=""
			>
				{COT_BANG.map((cot) => (
					<div className="flex w-64 shrink-0 flex-col gap-2" key={cot}>
						<Skeleton className="h-5 w-24" />
						{THE_CHO.map((k) => (
							<Skeleton className="h-20 w-full" key={k} />
						))}
					</div>
				))}
			</div>
		);
	}
	if (!q.data) {
		return (
			<VungTaiLoi
				dangTai={q.isFetching}
				moTa={m.bang.loiMoTa}
				onThuLai={() => void q.refetch()}
				tieuDe={m.bang.loiTieuDe}
			/>
		);
	}

	const du = q.data;
	const tatCa = new Map<string, TheBang>(
		du.cot.flatMap((c) => c.viec.map((v) => [v.id, v] as const)),
	);
	const cotCua = (v: TheBang): CotBang => {
		const k = cho.get(v.id);
		if (k) return k.den;
		return laCotBang(v.trangThai) ? v.trangThai : "CHUA_LAM";
	};
	const thuTuCua = (cot: CotBang): TheBang[] => {
		const goc = du.cot.find((c) => c.trangThai === cot)?.viec ?? [];
		const den = [...tatCa.values()].filter(
			(v) => cotCua(v) === cot && !goc.some((g) => g.id === v.id),
		);
		const trongCot = [...den, ...goc.filter((v) => cotCua(v) === cot)];
		const ganNhat = [...cho.values()].filter(
			(k) => k.den === cot && k.thuTu.length > 0,
		);
		const thuTu = ganNhat[ganNhat.length - 1]?.thuTu;
		if (!thuTu) return trongCot;
		const viTri = new Map(thuTu.map((id, i) => [id, i]));
		return [...trongCot].sort(
			(a, b) =>
				(viTri.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
				(viTri.get(b.id) ?? Number.MAX_SAFE_INTEGER),
		);
	};

	const theRa = (v: TheBang): BoardCard => ({
		id: v.id,
		href: (() => {
			const ts = new URLSearchParams(thamSo.toString());
			ts.set(SEARCH_PARAM.record.stack, `viec:${v.id}`);
			return `?${ts.toString()}`;
		})(),
		title: v.tieuDe,
		subtitle: v.cha ? dien(m.bang.thuoc, { cha: v.cha.tieuDe }) : null,
		meta: chiXem ? <PhuTheViec hienNguoi the={{ ...v, cha: null }} /> : null,
	});

	const cot: BoardColumn[] = COT_BANG.map((c) => {
		const ds = thuTuCua(c);
		return {
			id: c,
			label: m.trangThai[c],
			count: ds.length,
			cards: ds.map(theRa),
		};
	});

	const batDau = (k: Keo) => {
		const v = tatCa.get(k.id);
		if (v && k.den === "XONG" && v.conMo > 0) {
			setHoi({ keo: k, conMo: v.conMo });
			return;
		}
		gui(k);
	};

	const onMove = (move: BoardMove) => {
		if (!laCotBang(move.to)) return;
		batDau({
			id: move.cardId,
			den: move.to,
			thuTu: move.order ?? [],
			nguon: "bang-keo",
		});
	};

	const xongCu =
		(du.cot.find((c) => c.trangThai === "XONG")?.tong ?? 0) -
		(du.cot.find((c) => c.trangThai === "XONG")?.viec.length ?? 0);

	return (
		<div className="flex flex-col gap-3" data-bang-viec="">
			<Board
				canDrop={(id, c) => {
					const v = tatCa.get(id);
					if (!v) return false;
					return c === cotCua(v) || v.chuyenDuoc.some((d) => d === c);
				}}
				columns={cot}
				emptyLabel={m.bang.rongCot}
				label={m.bang.nhan}
				onMove={chiXem ? undefined : onMove}
				pendingIds={[...cho.keys()]}
				renderCard={(card) => {
					const v = tatCa.get(card.id);
					if (!v) return null;
					return (
						<TheViecBang
							hienNguoi={nhom !== "giao-cho-toi"}
							khoa={cho.has(v.id)}
							onChuyen={(den) =>
								batDau({ id: v.id, den, thuTu: [], nguon: "bang-menu" })
							}
							onMo={() => open({ kind: "viec", id: v.id })}
							the={{ ...v, trangThai: cotCua(v) }}
						/>
					);
				}}
				reorder
			/>
			<div className="flex flex-wrap gap-2">
				{xongCu > 0 ? (
					<Button
						data-xong-cu=""
						onClick={onXemDanhSach}
						size="sm"
						variant="outline"
					>
						{dien(m.bang.xongCu, { n: xongCu })}
					</Button>
				) : null}
				<DongGapViec ds={du.daHuy} nhan={dien(m.daHuy, { n: du.soHuy })} />
			</div>
			{hoi ? (
				<HoiDongCha
					conMo={hoi.conMo}
					den="XONG"
					onDongY={() => {
						gui(hoi.keo);
						setHoi(null);
					}}
					onOpenChange={(mo) => {
						if (!mo) setHoi(null);
					}}
					open
					pending={false}
				/>
			) : null}
		</div>
	);
}
