"use client";

import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { TablePagination } from "@crm/ui/components/table-pagination";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { TAI_LIEU } from "@crm/validation/tai-lieu";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type TaiLieuMessages, taiLieuMessages } from "@/lib/messages/tai-lieu";
import { taiLieuLichSuMessages } from "@/lib/messages/tai-lieu-lich-su";
import {
	duongDanhSach,
	duongDeXuat,
	NHOM_DE_XUAT,
	type NhomDeXuat,
	ngayTaiLieu,
} from "@/lib/tai-lieu-man";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { DangTaiDanhSach } from "./dang-tai";
import type { ToiLoc } from "./danh-sach-loc";
import { LoiTai } from "./loi-tai";

function nhanTrangThai(
	m: TaiLieuMessages,
	r: { trangThai: keyof TaiLieuMessages["choDuyet"]["trangThai"]; cu: boolean },
): string | null {
	if (r.cu) return m.choDuyet.trangThai.CU;
	if (r.trangThai === "CHO_DUYET") return null;
	return m.choDuyet.trangThai[r.trangThai];
}

function laNhom(v: string): v is NhomDeXuat {
	return NHOM_DE_XUAT.some((n) => n === v);
}

export function ChoDuyet({
	nhom,
	page,
	toi,
}: {
	nhom: NhomDeXuat;
	page: number;
	toi: ToiLoc;
}) {
	const locale = useLocale();
	const m = taiLieuMessages(locale);
	const loaiDeXuat = taiLieuLichSuMessages(locale).luuTru.loaiDeXuat;
	const trpc = useTRPC();
	const router = useRouter();
	const url = useWorkspaceUrl();
	const cho = useQuery(trpc.taiLieu.proposals.queryOptions({ nhom, page }));
	const coTrang = TAI_LIEU.danhSach.coTrang;

	const chonNhom = (
		<ToggleGroup
			aria-label={m.choDuyet.nhom.nhan}
			onValueChange={(v) => {
				if (laNhom(v)) router.push(toi({ nhom: v, page: 1 }));
			}}
			size="sm"
			type="single"
			value={nhom}
			variant="outline"
		>
			<ToggleGroupItem data-nhom="cho" value="cho">
				{m.choDuyet.nhom.cho}
			</ToggleGroupItem>
			<ToggleGroupItem data-nhom="da-xu-ly" value="da-xu-ly">
				{m.choDuyet.nhom.daXuLy}
			</ToggleGroupItem>
		</ToggleGroup>
	);

	if (cho.isError && !cho.data)
		return <LoiTai m={m} thuLai={() => cho.refetch()} />;
	if (!cho.data) return <DangTaiDanhSach />;

	const { rows, total } = cho.data;

	return (
		<div className="flex min-w-0 flex-col gap-4" data-cho-duyet="">
			{chonNhom}
			{rows.length === 0 ? (
				<Empty data-cho-duyet-rong="">
					<EmptyHeader>
						<EmptyTitle>
							{nhom === "cho" ? m.choDuyet.rong : m.choDuyet.rongDaXuLy}
						</EmptyTitle>
					</EmptyHeader>
					<EmptyContent>
						<Button asChild variant="outline">
							<Link href={url(duongDanhSach())}>{m.choDuyet.veDanhSach}</Link>
						</Button>
					</EmptyContent>
				</Empty>
			) : (
				<ItemGroup data-hang-cho-duyet="">
					{rows.map((r) => {
						const nhan = nhanTrangThai(m, r);
						const viec =
							r.loai === "LUU_TRU" || r.loai === "KHOI_PHUC" ? r.loai : null;
						return (
							<Item asChild key={r.id} variant="outline">
								<Link data-de-xuat={r.id} href={url(duongDeXuat(r.id))}>
									<ItemContent>
										<ItemTitle translate="no">{r.ten}</ItemTitle>
										<ItemDescription>
											<span translate="no">{r.taoBoi.name}</span> ·{" "}
											{ngayTaiLieu(r.luc, locale)}
										</ItemDescription>
									</ItemContent>
									{nhan || viec ? (
										<ItemActions>
											{viec ? (
												<Badge data-loai-de-xuat={viec} variant="secondary">
													{loaiDeXuat[viec]}
												</Badge>
											) : null}
											{nhan ? (
												<Badge data-trang-thai={r.trangThai} variant="outline">
													{nhan}
												</Badge>
											) : null}
										</ItemActions>
									) : null}
								</Link>
							</Item>
						);
					})}
				</ItemGroup>
			)}
			{total > coTrang ? (
				<TablePagination
					loading={cho.isFetching}
					onPageChange={(p) => router.push(toi({ page: p }))}
					page={page}
					pageSize={coTrang}
					total={total}
					totalPages={Math.ceil(total / coTrang)}
				/>
			) : null}
		</div>
	);
}
