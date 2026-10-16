"use client";

import { Button } from "@crm/ui/components/button";
import {
	FlowMap,
	type FlowMapEdge,
	FlowMapNode,
	type Node,
	type NodeProps,
} from "@crm/ui/components/flow-map";
import { Item, ItemContent, ItemGroup } from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SectionHeading } from "@crm/ui/components/section-heading";
import { Skeleton } from "@crm/ui/components/skeleton";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { useIsMobile } from "@crm/ui/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";
import { okrQuanhMessages } from "@/lib/messages/okr-quanh";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { type NutQuanh, type QuanhMucTieu, TheQuanh } from "./the-quanh";

export const QUANH = {
	khung: { caoPx: 600 },
	the: {
		mucTieu: { rong: 280, cao: 128 },
		kr: { rong: 240, cao: 96 },
	},
} as const;

type DuLieuNut = { nut: NutQuanh; laTam: boolean };

function NutQuanhVe({ data }: NodeProps<Node<DuLieuNut, "quanh">>) {
	return (
		<FlowMapNode>
			<TheQuanh bien="khung" laTam={data.laTam} nut={data.nut} />
		</FlowMapNode>
	);
}

const KIEU_NUT = { quanh: NutQuanhVe };

export function dungKhung(q: QuanhMucTieu) {
	const nut: Node<DuLieuNut, "quanh">[] = q.nut.map((n) => ({
		id: n.id,
		type: "quanh",
		position: { x: 0, y: 0 },
		width: n.loai === "kr" ? QUANH.the.kr.rong : QUANH.the.mucTieu.rong,
		height: n.loai === "kr" ? QUANH.the.kr.cao : QUANH.the.mucTieu.cao,
		data: { nut: n, laTam: n.id === q.tamId },
	}));
	const canh: FlowMapEdge[] = q.canh.map((c) => ({
		id: `${c.tu}->${c.den}`,
		source: c.tu,
		target: c.den,
		data: { kind: "lien" },
	}));
	return { nut, canh };
}

function doCao(q: QuanhMucTieu): Map<string, number> {
	const cao = new Map<string, number>([[q.tamId, 0]]);
	for (let doi = true; doi; ) {
		doi = false;
		for (const c of q.canh) {
			const d = cao.get(c.den);
			if (d === undefined || cao.has(c.tu)) continue;
			cao.set(c.tu, d + 1);
			doi = true;
		}
	}
	return cao;
}

export function nhomDanhSach(q: QuanhMucTieu) {
	const cao = doCao(q);
	const tren = q.nut
		.filter((n) => n.phia === "tren")
		.sort(
			(a, b) =>
				Number(b.congTy) - Number(a.congTy) ||
				(cao.get(b.id) ?? 0) - (cao.get(a.id) ?? 0),
		);
	const duoi = q.nut.filter((n) => n.phia === "duoi");
	return [
		{ khoa: "gop-vao", nut: tren },
		{ khoa: "tam", nut: q.nut.filter((n) => n.phia === "tam") },
		{ khoa: "kr", nut: duoi.filter((n) => n.loai === "kr") },
		{ khoa: "gop-vao-no", nut: duoi.filter((n) => n.loai === "muc-tieu") },
	] as const;
}

function DongGopLen({ q }: { q: QuanhMucTieu }) {
	const m = okrQuanhMessages(useLocale());
	return (
		<div
			className="flex flex-col gap-1 rounded-lg border bg-muted/40 px-3 py-2 text-sm"
			data-gop-len-cong-ty
		>
			{q.laCongTy ? (
				<span>{m.laCongTy}</span>
			) : q.gopLenCongTy.length === 0 ? (
				<span>{m.chuaLenCongTy}</span>
			) : (
				q.gopLenCongTy.map((g) => (
					<span
						data-gop-len-muc
						data-kr={g.kr?.id ?? ""}
						data-muc-tieu={g.mucTieu.id}
						key={g.kr?.id ?? g.mucTieu.id}
					>
						{g.kr ? (
							<>
								{m.gopLenQuaKr}{" "}
								<span className="font-medium" translate="no">
									«{g.kr.tieuDe}»
								</span>{" "}
								{m.cuaMucTieu} <span translate="no">«{g.mucTieu.tieuDe}»</span>
							</>
						) : (
							<>
								{m.gopThang}{" "}
								<span className="font-medium" translate="no">
									«{g.mucTieu.tieuDe}»
								</span>
							</>
						)}
					</span>
				))
			)}
		</div>
	);
}

function KhungCho({ nhan }: { nhan: string }) {
	return (
		<div
			aria-busy="true"
			aria-live="polite"
			className="flex flex-col items-center gap-10 rounded-lg border p-8"
			data-quanh-dang-tai
			style={{ height: QUANH.khung.caoPx }}
		>
			<span className="sr-only">{nhan}</span>
			<Skeleton className="h-24 w-64" />
			<Skeleton className="h-24 w-64" />
			<div className="flex gap-8">
				<Skeleton className="h-20 w-56" />
				<Skeleton className="h-20 w-56" />
			</div>
		</div>
	);
}

export function QuanhMucTieuNoiDung({ objectiveId }: { objectiveId: string }) {
	const m = okrQuanhMessages(useLocale());
	const trpc = useTRPC();
	const url = useWorkspaceUrl();
	const hep = useIsMobile();
	const q = useQuery(trpc.okr.quanhMucTieu.queryOptions({ objectiveId }));
	const khung = useMemo(() => (q.data ? dungKhung(q.data) : null), [q.data]);

	if (q.isError) {
		if (q.error?.data?.code === "NOT_FOUND")
			return (
				<div className="flex flex-col items-start gap-3" data-quanh-khong-thay>
					<p className="text-sm">{m.khongThay}</p>
					<Button asChild size="sm" variant="outline">
						<Link href={url("/okr/toan-canh")}>{m.veToanCanh}</Link>
					</Button>
				</div>
			);
		return (
			<VungTaiLoi
				moTa={m.loiMoTa}
				onThuLai={() => void q.refetch()}
				tieuDe={m.loiTieuDe}
			/>
		);
	}
	if (!q.data || !khung) return <KhungCho nhan={m.dangTai} />;

	const tam = q.data.nut.find((n) => n.id === q.data.tamId);

	return (
		<div className="flex min-w-0 flex-col gap-3" data-quanh>
			<p className="min-w-0 text-sm">
				<span className="text-muted-foreground">{m.dangXemQuanh} </span>
				<span className="font-medium" translate="no">
					{tam?.tieuDe}
				</span>
			</p>
			<DongGopLen q={q.data} />
			{hep ? (
				<div className="flex flex-col gap-4" data-quanh-danh-sach>
					{nhomDanhSach(q.data)
						.filter((g) => g.nut.length > 0)
						.map((g) => (
							<section
								className="flex flex-col gap-2"
								data-nhom={g.khoa}
								key={g.khoa}
							>
								<SectionHeading>{m.nhom[nhomKhoa(g.khoa)]}</SectionHeading>
								<ItemGroup className="gap-2">
									{g.nut.map((n) => (
										<Item key={n.id} size="sm" variant="outline">
											<ItemContent>
												<TheQuanh
													bien="dong"
													laTam={n.id === q.data.tamId}
													nut={n}
												/>
											</ItemContent>
										</Item>
									))}
								</ItemGroup>
							</section>
						))}
				</div>
			) : (
				<>
					<p className="text-muted-foreground text-xs">{m.chuThich}</p>
					<div style={{ height: QUANH.khung.caoPx }}>
						<FlowMap
							centerId={q.data.tamId}
							edges={khung.canh}
							focusId={q.data.tamId}
							label={m.nhanKhung}
							nodeTypes={KIEU_NUT}
							nodes={khung.nut}
						/>
					</div>
				</>
			)}
		</div>
	);
}

function nhomKhoa(k: "gop-vao" | "tam" | "kr" | "gop-vao-no") {
	return (
		{
			"gop-vao": "gopVao",
			tam: "tam",
			kr: "kr",
			"gop-vao-no": "gopVaoNo",
		} as const
	)[k];
}
