"use client";

import Add from "@carbon/icons-react/es/Add";
import Search from "@carbon/icons-react/es/Search";
import Upload from "@carbon/icons-react/es/Upload";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@crm/ui/components/input-group";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { dien, toChucMessages } from "@/lib/messages/to-chuc";
import { useTRPC } from "@/lib/trpc/client";
import { CayToChuc } from "./cay-to-chuc";
import { DaLuuTruToChuc } from "./da-luu-tru-to-chuc";
import { HopThoaiDonVi } from "./hop-thoai-don-vi";
import { HopThoaiNhap } from "./hop-thoai-nhap";
import { HopThoaiViTri } from "./hop-thoai-vi-tri";
import type { YeuCauDonVi } from "./kieu";

export function ToChuc() {
	const m = toChucMessages(useLocale());
	const trpc = useTRPC();
	const cay = useQuery(trpc.org.tree.queryOptions());
	const quyen = useQuery(trpc.org.access.queryOptions());
	const [tim, setTim] = useState("");
	const [nguoiMo, setNguoiMo] = useState<string | null>(null);
	const [donVi, setDonVi] = useState<YeuCauDonVi | null>(null);
	const [moNhap, setMoNhap] = useState(false);

	if (cay.isPending || quyen.isPending) {
		return (
			<div
				aria-live="polite"
				className="flex flex-col gap-2"
				data-trang-thai="ST-tochuc-dangtai"
			>
				<span className="text-muted-foreground text-sm">{m.loading}</span>
				<Skeleton className="h-24 w-full" />
			</div>
		);
	}

	if (cay.isError || !cay.data) {
		return (
			<Empty data-trang-thai="ST-tochuc-loi">
				<EmptyHeader>
					<EmptyTitle>{m.loi.title}</EmptyTitle>
				</EmptyHeader>
				<EmptyContent>
					<Button variant="outline" onClick={() => void cay.refetch()}>
						{m.loi.action}
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	const d = cay.data;
	const sua = quyen.data?.canManage === true;
	const rong = d.divisions.length === 0 && d.chuaXep.length === 0;
	const nguoi = nguoiMo ? d.people.find((p) => p.id === nguoiMo) : undefined;

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="text-sm" aria-live="polite" data-do-phu>
					{dien(m.doPhu, {
						x: d.coverage.withPrimary,
						m: d.coverage.members,
						k: d.coverage.departmentsWithoutHead,
					})}
				</p>
				{sua ? (
					<span className="flex flex-wrap gap-2">
						<Button variant="outline" onClick={() => setMoNhap(true)}>
							<Icon icon={Upload} data-icon="inline-start" />
							{m.nhap}
						</Button>
						<Button onClick={() => setDonVi({ loai: "tao-bo-phan" })}>
							<Icon icon={Add} data-icon="inline-start" />
							{m.themBoPhan}
						</Button>
					</span>
				) : (
					<span
						className="text-muted-foreground text-sm"
						data-trang-thai="ST-tochuc-chidoc"
					>
						{m.chiDoc}
					</span>
				)}
			</div>

			{rong ? (
				<Empty data-trang-thai="ST-tochuc-rong">
					<EmptyHeader>
						<EmptyTitle>{m.rong.title}</EmptyTitle>
						<EmptyDescription>{m.rong.body}</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : null}

			{rong && d.chuaCoPhongBan.length === 0 ? null : (
				<>
					<InputGroup>
						<InputGroupAddon>
							<Icon icon={Search} />
						</InputGroupAddon>
						<InputGroupInput
							aria-label={m.tim}
							placeholder={m.tim}
							value={tim}
							onChange={(e) => setTim(e.target.value)}
						/>
					</InputGroup>
					<CayToChuc
						cay={d}
						sua={sua}
						tim={tim}
						moNguoi={setNguoiMo}
						moDonVi={setDonVi}
					/>
				</>
			)}

			{sua ? <DaLuuTruToChuc cay={d} /> : null}

			{nguoi && sua ? (
				<HopThoaiViTri
					key={nguoi.id}
					cay={d}
					nguoi={nguoi}
					dong={() => setNguoiMo(null)}
				/>
			) : null}
			{donVi ? (
				<HopThoaiDonVi
					key={JSON.stringify(donVi)}
					cay={d}
					yeuCau={donVi}
					dong={() => setDonVi(null)}
				/>
			) : null}
			{moNhap ? <HopThoaiNhap dong={() => setMoNhap(false)} /> : null}
		</div>
	);
}
