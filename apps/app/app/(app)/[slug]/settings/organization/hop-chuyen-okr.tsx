"use client";

import Renew from "@carbon/icons-react/es/Renew";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import { Checkbox } from "@crm/ui/components/checkbox";
import { Combobox, type ComboboxOption } from "@crm/ui/components/combobox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	Field,
	FieldDescription,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { Spinner } from "@crm/ui/components/spinner";
import { PHA_CHUYEN_DUOC } from "@crm/validation/okr-chu-ky";
import { OKR_HIEN_THI } from "@crm/validation/okr-hien-thi";
import {
	useMutation,
	useQueries,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { type ReactNode, useId, useState } from "react";
import { toast } from "sonner";
import { dienNode } from "@/components/crm/record-sheet/plan-copy";
import { okrMessages } from "@/lib/messages/okr";
import { okrTaiCoCauMessages } from "@/lib/messages/okr-tai-co-cau";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import type { CayDuLieu } from "./kieu";
import type { NguonChuyenOkr } from "./to-chuc-search-params";

type MucTieu = RouterOutputs["okr"]["byUnit"]["objectives"][number];

const KHUNG_TAI = ["mot", "hai", "ba"] as const;

function tenNguon(cay: CayDuLieu | undefined, n: NguonChuyenOkr): string {
	if (!cay) return "";
	const song =
		n.level === "phong-ban"
			? [...cay.divisions.flatMap((b) => b.departments), ...cay.chuaXep]
			: cay.divisions;
	const luu =
		n.level === "phong-ban" ? cay.archived.departments : cay.archived.divisions;
	return (
		song.find((d) => d.id === n.id)?.name ??
		luu.find((d) => d.id === n.id)?.name ??
		""
	);
}

function donViNhan(
	cay: CayDuLieu | undefined,
	n: NguonChuyenOkr,
	chuaXep: string,
): ComboboxOption[] {
	if (!cay) return [];
	const ds: ComboboxOption[] =
		n.level === "phong-ban"
			? [
					...cay.divisions.flatMap((b) =>
						b.departments.map((p) => ({
							value: p.id,
							label: p.name,
							hint: b.name,
						})),
					),
					...cay.chuaXep.map((p) => ({
						value: p.id,
						label: p.name,
						hint: chuaXep,
					})),
				]
			: cay.divisions.map((b) => ({ value: b.id, label: b.name }));
	return ds.filter((o) => o.value !== n.id);
}

export function HopChuyenOkr({
	nguon,
	dong,
}: {
	nguon: NguonChuyenOkr;
	dong: () => void;
}) {
	const locale = useLocale();
	const m = okrTaiCoCauMessages(locale).chuyen;
	const trangThai = okrMessages(locale).trangThai;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const queryClient = useQueryClient();
	const ma = useId();
	const [den, setDen] = useState("");
	const [bo, setBo] = useState<ReadonlySet<string>>(new Set());
	const [loi, setLoi] = useState<string | null>(null);

	const cay = useQuery(trpc.org.tree.queryOptions());
	const chuKy = useQuery(trpc.okr.cycles.queryOptions());
	const kyMo = (chuKy.data?.cycles ?? []).filter((c) =>
		PHA_CHUYEN_DUOC.includes(c.phase),
	);
	const donVi = {
		loai: nguon.level === "phong-ban" ? ("pb" as const) : ("bp" as const),
		id: nguon.id,
	};
	const theoKy = useQueries({
		queries: kyMo.map((c) =>
			trpc.okr.byUnit.queryOptions({ cycleId: c.id, unit: donVi }),
		),
	});

	const tenKy = new Map(kyMo.map((c) => [c.id, c.name]));
	const mucTieu: MucTieu[] = theoKy
		.flatMap((q) => q.data?.objectives ?? [])
		.filter((o) => o.status !== "da-bo" && o.level === nguon.level);
	const chon = mucTieu.filter((o) => !bo.has(o.id)).map((o) => o.id);
	const tu = tenNguon(cay.data, nguon);
	const luaChon = donViNhan(cay.data, nguon, m.chuaXep);
	const tenDen = luaChon.find((o) => o.value === den)?.label ?? "";
	const dangTai =
		cay.isPending || chuKy.isPending || theoKy.some((q) => q.isPending);
	const hong = cay.isError || chuKy.isError || theoKy.some((q) => q.isError);
	const quaTran = chon.length > OKR_HIEN_THI.chuyenToiDa;

	const chuyen = useMutation(
		trpc.okr.chuyenDonVi.mutationOptions({
			onSuccess: async (kq) => {
				toast.success(
					m.xong(kq.daChuyen, tenDen),
					kq.canhBao ? { description: kq.canhBao } : undefined,
				);
				await Promise.all([
					cache.okr(),
					queryClient.invalidateQueries({
						queryKey: trpc.org.tree.queryKey(),
					}),
				]);
				dong();
			},
			onError: (e) => setLoi(e.message),
		}),
	);

	const doiChon = (id: string, bat: boolean) =>
		setBo((cu) => {
			const moi = new Set(cu);
			if (bat) moi.delete(id);
			else moi.add(id);
			return moi;
		});

	const thuLai = () => {
		if (cay.isError) void cay.refetch();
		if (chuKy.isError) void chuKy.refetch();
		for (const q of theoKy) if (q.isError) void q.refetch();
	};

	const guiDuoc =
		den !== "" && chon.length > 0 && !quaTran && !chuyen.isPending;

	let danhSach: ReactNode;
	if (hong)
		danhSach = (
			<Empty data-trang-thai="ST-chuyen-loi-tai">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Icon icon={WarningAlt} />
					</EmptyMedia>
					<EmptyTitle>{m.loiTai.tieuDe}</EmptyTitle>
					<EmptyDescription>{m.loiTai.moTa}</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button variant="outline" size="sm" onClick={thuLai}>
						<Icon icon={Renew} data-icon="inline-start" />
						{m.loiTai.thuLai}
					</Button>
				</EmptyContent>
			</Empty>
		);
	else if (dangTai)
		danhSach = (
			<ItemGroup aria-busy="true" className="gap-2">
				<span className="sr-only" role="status">
					{m.dangTai}
				</span>
				{KHUNG_TAI.map((k) => (
					<Item key={k} size="sm" variant="outline">
						<ItemMedia>
							<Skeleton className="size-4" />
						</ItemMedia>
						<ItemContent>
							<Skeleton className="h-4 w-2/3" />
							<Skeleton className="h-3 w-1/2" />
						</ItemContent>
					</Item>
				))}
			</ItemGroup>
		);
	else if (mucTieu.length === 0)
		danhSach = (
			<Empty data-trang-thai="ST-chuyen-rong">
				<EmptyHeader>
					<EmptyTitle>{m.rong.tieuDe}</EmptyTitle>
					<EmptyDescription>{m.rong.moTa}</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	else
		danhSach = (
			<FieldSet>
				<FieldLegend variant="label">{m.danhSach(mucTieu.length)}</FieldLegend>
				<ItemGroup className="gap-2">
					{mucTieu.map((o) => {
						const id = `${ma}-${o.id}`;
						const moTa = m.dongMoTa(
							o.keyResults.length,
							trangThai[o.status],
							o.owner.name,
						);
						return (
							<Item
								key={o.id}
								size="sm"
								variant="outline"
								data-muc-tieu-chuyen={o.id}
							>
								<ItemMedia>
									<Checkbox
										id={id}
										checked={!bo.has(o.id)}
										disabled={chuyen.isPending}
										aria-describedby={loi ? `${ma}-loi` : undefined}
										onCheckedChange={(v) => doiChon(o.id, v === true)}
									/>
								</ItemMedia>
								<ItemContent>
									<ItemTitle>
										<label htmlFor={id} translate="no">
											{o.title}
										</label>
									</ItemTitle>
									<ItemDescription>
										{kyMo.length > 1
											? `${tenKy.get(o.cycleId) ?? ""} · ${moTa}`
											: moTa}
									</ItemDescription>
								</ItemContent>
							</Item>
						);
					})}
				</ItemGroup>
				{quaTran ? (
					<FieldDescription data-qua-tran>
						{m.quaTran(OKR_HIEN_THI.chuyenToiDa)}
					</FieldDescription>
				) : null}
			</FieldSet>
		);

	return (
		<Dialog
			open
			onOpenChange={(mo) => {
				if (!mo && !chuyen.isPending) dong();
			}}
		>
			<DialogContent data-hop="chuyen-okr" size="wide">
				<DialogHeader>
					<DialogTitle>{m.tieuDe}</DialogTitle>
					<DialogDescription>
						{dienNode(m.moTa, { ten: <span translate="no">{tu}</span> })}
					</DialogDescription>
				</DialogHeader>
				<form
					id={`${ma}-form`}
					className="flex flex-col gap-4"
					onSubmit={(e) => {
						e.preventDefault();
						if (!guiDuoc) return;
						setLoi(null);
						chuyen.mutate({
							objectiveIds: chon,
							denDonVi: { level: nguon.level, id: den },
						});
					}}
				>
					{loi ? (
						<Alert id={`${ma}-loi`} variant="destructive" data-loi-chuyen>
							<Icon icon={WarningAlt} />
							<AlertTitle>{m.loiChuyen}</AlertTitle>
							<AlertDescription>
								<p>{loi}</p>
							</AlertDescription>
						</Alert>
					) : null}
					<Field>
						<FieldLabel htmlFor={`${ma}-den`}>{m.denDonVi}</FieldLabel>
						<Combobox
							id={`${ma}-den`}
							options={luaChon}
							value={den}
							onValueChange={setDen}
							placeholder={m.chon[nguon.level]}
							searchPlaceholder={m.tim[nguon.level]}
							empty={m.khongKhop}
							disabled={chuyen.isPending}
							translate="no"
							data-o-den
						/>
						<FieldDescription>{m.denMoTa[nguon.level]}</FieldDescription>
					</Field>
					{danhSach}
				</form>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" disabled={chuyen.isPending}>
							{m.huy}
						</Button>
					</DialogClose>
					<Button
						type="submit"
						form={`${ma}-form`}
						disabled={!guiDuoc}
						data-nut="chuyen-okr"
					>
						{chuyen.isPending ? <Spinner data-icon="inline-start" /> : null}
						{m.nut(chon.length)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
