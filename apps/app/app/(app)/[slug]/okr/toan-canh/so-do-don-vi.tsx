"use client";

import {
	FlowMap,
	type FlowMapEdge,
	FlowMapNode,
	type Node,
	type NodeProps,
} from "@crm/ui/components/flow-map";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { useIsMobile } from "@crm/ui/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useMemo } from "react";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import { type LocSoDo, soDoParsers } from "../okr-search-params";
import { SO_DO } from "./so-do-config";
import { type GopNhanh, type NutThe, TheDonVi } from "./the-don-vi";

type NutSoDoKhach = NutThe & {
	cap: "goc" | "bo-phan" | "phong-ban";
	cha: string | null;
	chuaGop: number;
};

export type SoDoKhach = {
	nut: NutSoDoKhach[];
	duong: { tu: string; den: string; loai: "lien" | "dut"; soMucTieu: number }[];
};

type DuLieuNut = {
	nut: NutSoDoKhach;
	dangMo: boolean;
	chim: boolean;
	gop: GopNhanh | null;
	cap: number;
};

export type NutVe = Node<DuLieuNut, "don-vi">;

type DuLieuNutVe = DuLieuNut & {
	onMo: () => void;
	onDong: () => void;
	onMoNhanh: () => void;
};

function NutDonViVe({ data }: NodeProps<Node<DuLieuNutVe, "don-vi">>) {
	return (
		<FlowMapNode>
			<TheDonVi
				bien="khung"
				chim={data.chim}
				dangMo={data.dangMo}
				gop={data.gop}
				nut={data.nut}
				onDong={data.onDong}
				onMo={data.onMo}
				onMoNhanh={data.onMoNhanh}
			/>
		</FlowMapNode>
	);
}

const KIEU_NUT = { "don-vi": NutDonViVe };

export const CHU_GIAI_SO_DO = [
	"chuGiaiLien",
	"chuGiaiDut",
	"chuGiaiChuaNoi",
] as const;

type TrangThaiSoDo = {
	loc: LocSoDo;
	moDonVi: string | null;
	moNhanh: readonly string[];
};

function kichThuoc(n: NutSoDoKhach, dangMo: boolean) {
	if (!dangMo)
		return { width: SO_DO.the.dong.rong, height: SO_DO.the.dong.cao };
	const dong = n.mucTieu.reduce((t, m) => t + Math.max(1, m.gop.length), 0);
	return {
		width: SO_DO.the.mo.rong,
		height:
			SO_DO.the.mo.coSo +
			n.mucTieu.length * SO_DO.the.mo.moiMucTieu +
			dong * SO_DO.the.mo.moiDongGop,
	};
}

export function dungSoDo(du: SoDoKhach, tt: TrangThaiSoDo) {
	const con = new Map<string, NutSoDoKhach[]>();
	for (const n of du.nut)
		if (n.cha) con.set(n.cha, [...(con.get(n.cha) ?? []), n]);
	const thuGon = du.nut.length > SO_DO.thuGonKhiHon;
	const an = new Set<string>();
	const gopCua = new Map<string, GopNhanh>();
	const tuMoNhanh: string[] = [];
	if (thuGon) {
		for (const b of du.nut.filter((n) => n.cap === "bo-phan")) {
			const ds = con.get(b.khoa) ?? [];
			if (ds.length === 0) continue;
			const tuMo =
				ds.some((p) => p.co.includes("chua-noi")) ||
				ds.some((p) => p.khoa === tt.moDonVi) ||
				(tt.loc === "chu-y" && ds.some((p) => p.canChuY));
			if (tuMo) tuMoNhanh.push(b.khoa);
			if (tuMo || tt.moNhanh.includes(b.khoa)) continue;
			for (const p of ds) an.add(p.khoa);
			gopCua.set(b.khoa, {
				soPhongBan: ds.length,
				soChuY: ds.filter((p) => p.canChuY).length,
			});
		}
	}
	const capCua = (n: NutSoDoKhach): number =>
		n.cap === "goc" ? 0 : n.cap === "bo-phan" || n.cha === "goc" ? 1 : 2;
	const nut: NutVe[] = du.nut
		.filter((n) => !an.has(n.khoa))
		.map((n) => {
			const dangMo = n.khoa === tt.moDonVi;
			return {
				id: n.khoa,
				type: "don-vi",
				position: { x: 0, y: 0 },
				...kichThuoc(n, dangMo),
				data: {
					nut: n,
					dangMo,
					chim: tt.loc === "chu-y" && !n.canChuY,
					gop: gopCua.get(n.khoa) ?? null,
					cap: capCua(n),
				},
			};
		});
	const hien = new Set(nut.map((n) => n.id));
	const day: FlowMapEdge[] = du.duong
		.filter((d) => hien.has(d.tu) && hien.has(d.den))
		.map((d) => ({
			id: `${d.tu}->${d.den}`,
			source: d.tu,
			target: d.den,
			data: {
				kind: d.loai,
				label: d.soMucTieu > 1 ? String(d.soMucTieu) : undefined,
			},
		}));
	for (const n of nut) {
		const cha = n.data.nut.cha;
		if (!cha || !hien.has(cha)) continue;
		if (day.some((d) => d.source === cha && d.target === n.id)) continue;
		day.push({
			id: `${cha}~>${n.id}`,
			source: cha,
			target: n.id,
			data: { kind: "an" },
		});
	}
	return {
		nut,
		day,
		soMoi: du.nut.length,
		soChuY: du.nut.filter((n) => n.canChuY).length,
		tuMoNhanh,
	};
}

function KhungSoDo({ nhan }: { nhan: string }) {
	return (
		<div
			aria-busy="true"
			aria-live="polite"
			className="flex flex-col items-center gap-16 rounded-lg border p-8"
			style={{ height: SO_DO.khung.caoPx }}
		>
			<span className="sr-only">{nhan}</span>
			<Skeleton className="h-28 w-64" />
			<div className="flex gap-10">
				<Skeleton className="h-28 w-64" />
				<Skeleton className="h-28 w-64" />
				<Skeleton className="h-28 w-64" />
			</div>
		</div>
	);
}

export default function SoDoDonVi({ cycleId }: { cycleId: string }) {
	const m = okrToanCanhMessages(useLocale()).soDo;
	const trpc = useTRPC();
	const q = useQuery(trpc.okr.soDoDonVi.queryOptions({ cycleId }));
	const [thamSo, datThamSo] = useQueryStates(soDoParsers);
	const hep = useIsMobile();
	const loc = thamSo[SEARCH_PARAM.okr.locSoDo];
	const moDonVi = thamSo[SEARCH_PARAM.okr.moDonVi];
	const moNhanh = thamSo[SEARCH_PARAM.okr.moNhanh];
	const ve = useMemo(
		() => (q.data ? dungSoDo(q.data, { loc, moDonVi, moNhanh }) : null),
		[q.data, loc, moDonVi, moNhanh],
	);

	if (q.isError)
		return (
			<VungTaiLoi
				moTa={m.loiMoTa}
				onThuLai={() => void q.refetch()}
				tieuDe={m.loiTieuDe}
			/>
		);
	if (!q.data || !ve) return <KhungSoDo nhan={m.dangTai} />;

	const mo = (khoa: string) =>
		void datThamSo({ [SEARCH_PARAM.okr.moDonVi]: khoa });
	const dong = () => void datThamSo({ [SEARCH_PARAM.okr.moDonVi]: null });
	const moThemNhanh = (khoa: string) =>
		void datThamSo({
			[SEARCH_PARAM.okr.moNhanh]: [...new Set([...moNhanh, khoa])],
		});
	const the = (n: NutVe, bien: "khung" | "dong") => (
		<TheDonVi
			bien={bien}
			chim={n.data.chim}
			dangMo={n.data.dangMo}
			gop={n.data.gop}
			nut={n.data.nut}
			onDong={dong}
			onMo={() => mo(n.id)}
			onMoNhanh={() => moThemNhanh(n.id)}
		/>
	);
	const kyRong = q.data.nut.every((n) => n.soMucTieu === 0);
	const chiChuY = loc === "chu-y" && ve.soChuY === 0;

	const nutKhung = ve.nut.map((n) => ({
		...n,
		data: {
			...n.data,
			onMo: () => mo(n.id),
			onDong: dong,
			onMoNhanh: () => moThemNhanh(n.id),
		},
	}));

	return (
		<div className="flex flex-col gap-3" data-so-do>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<ToggleGroup
					aria-label={m.locNhan}
					onValueChange={(v) => {
						if (v === "moi" || v === "chu-y")
							void datThamSo({ [SEARCH_PARAM.okr.locSoDo]: v });
					}}
					size="sm"
					type="single"
					value={loc}
					variant="outline"
				>
					<ToggleGroupItem data-loc-so-do="moi" value="moi">
						{m.moi}
						<span className="text-muted-foreground tabular-nums">
							{ve.soMoi}
						</span>
					</ToggleGroupItem>
					<ToggleGroupItem data-loc-so-do="chu-y" value="chu-y">
						{m.chuY}
						<span className="text-muted-foreground tabular-nums">
							{ve.soChuY}
						</span>
					</ToggleGroupItem>
				</ToggleGroup>
				<span aria-live="polite" className="sr-only">
					{m.soDangLoc(ve.soChuY, ve.soMoi)}
				</span>
				<ul className="hidden flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs md:flex">
					{CHU_GIAI_SO_DO.map((k) => (
						<li key={k}>{m[k]}</li>
					))}
				</ul>
			</div>
			{kyRong ? (
				<div className="flex flex-col gap-3">
					{ve.nut
						.filter((n) => n.data.nut.cap === "goc")
						.map((n) => (
							<div key={n.id}>{the(n, "dong")}</div>
						))}
					<p className="text-muted-foreground text-sm" data-ky-rong>
						{m.kyRong}
					</p>
				</div>
			) : chiChuY ? (
				<p className="text-muted-foreground text-sm" data-khong-chu-y>
					{m.khongChuY}
				</p>
			) : hep ? (
				<div className="flex flex-col gap-2" data-so-do-danh-sach>
					{ve.nut.map((n) => (
						<div
							data-cap={n.data.cap}
							key={n.id}
							style={{
								paddingInlineStart: `${n.data.cap * SO_DO.danhSach.luiPx}px`,
							}}
						>
							{the(n, "dong")}
						</div>
					))}
				</div>
			) : (
				<div style={{ height: SO_DO.khung.caoPx }}>
					<FlowMap
						centerId={moDonVi}
						edges={ve.day}
						label={m.nhan}
						nodeTypes={KIEU_NUT}
						nodes={nutKhung}
					/>
				</div>
			)}
		</div>
	);
}
