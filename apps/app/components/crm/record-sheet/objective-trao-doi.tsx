"use client";

import Chat from "@carbon/icons-react/es/Chat";
import Close from "@carbon/icons-react/es/Close";
import Renew from "@carbon/icons-react/es/Renew";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { Combobox } from "@crm/ui/components/combobox";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { Skeleton } from "@crm/ui/components/skeleton";
import { Spinner } from "@crm/ui/components/spinner";
import { Textarea } from "@crm/ui/components/textarea";
import {
	TokenFieldAction,
	TokenFieldItem,
} from "@crm/ui/components/token-field";
import { BINH_LUAN_TOI_DA } from "@crm/validation/okr-trao-doi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Fragment, useId, useState } from "react";
import { luc } from "@/app/(app)/[slug]/okr/bang-vet";
import {
	DetailSheetBody,
	DetailSheetEmpty,
	DetailSheetSection,
} from "@/components/detail-sheet";
import { okrMessages } from "@/lib/messages/okr";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { dien } from "./plan-copy";

export type KrTraoDoi = { id: string; title: string };

const CA_MUC_TIEU = "ca-muc-tieu";

const KHUNG_TAI = ["mot", "hai"] as const;

export function TabTraoDoi({
	objectiveId,
	keyResults,
}: {
	objectiveId: string;
	keyResults: KrTraoDoi[];
}) {
	const m = okrMessages(useLocale()).traoDoi;
	const trpc = useTRPC();
	const ds = useQuery(trpc.okr.comments.queryOptions({ objectiveId }));

	return (
		<DetailSheetBody>
			{ds.isPending ? (
				<DetailSheetSection>
					<div
						aria-busy="true"
						className="flex flex-col gap-3"
						data-trang-thai="ST-traodoi-dangtai"
					>
						<span className="sr-only" role="status">
							{m.dangTai}
						</span>
						{KHUNG_TAI.map((id) => (
							<div className="flex flex-col gap-2" key={id}>
								<Skeleton className="h-4 w-1/3" />
								<Skeleton className="h-8 w-full" />
							</div>
						))}
					</div>
				</DetailSheetSection>
			) : ds.isError ? (
				<DetailSheetEmpty
					action={
						<Button onClick={() => ds.refetch()} variant="outline">
							<Icon data-icon="inline-start" icon={Renew} />
							{m.thuLai}
						</Button>
					}
					description={ds.error.message}
					icon={Chat}
					title={m.loiTai}
				/>
			) : ds.data.comments.length === 0 ? (
				<div className="contents" data-trang-thai="ST-traodoi-rong">
					<DetailSheetEmpty
						description={m.rong.body}
						icon={Chat}
						title={m.rong.title}
					/>
				</div>
			) : (
				<DetailSheetSection>
					<ItemGroup
						aria-label={m.danhSach}
						data-trang-thai="ST-traodoi-codulieu"
					>
						{ds.data.comments.map((c) => (
							<BinhLuan binhLuan={c} key={c.id} />
						))}
					</ItemGroup>
				</DetailSheetSection>
			)}
			<DetailSheetSection>
				<KhungSoan keyResults={keyResults} objectiveId={objectiveId} />
			</DetailSheetSection>
		</DetailSheetBody>
	);
}

type BinhLuanHien = {
	id: string;
	author: { name: string };
	keyResultTitle: string | null;
	body: string;
	createdAt: string;
	mentions: { id: string; name: string }[];
};

function BinhLuan({ binhLuan: c }: { binhLuan: BinhLuanHien }) {
	const locale = useLocale();
	const m = okrMessages(locale).traoDoi;
	return (
		<Item data-binh-luan={c.id} role="listitem" size="sm" variant="muted">
			<ItemContent>
				<ItemTitle translate="no">{c.author.name}</ItemTitle>
				<ItemDescription>{luc(c.createdAt, locale)}</ItemDescription>
			</ItemContent>
			{c.keyResultTitle ? (
				<div className="flex min-w-0 basis-full">
					<Badge
						className="max-w-full"
						data-chip-kr
						translate="no"
						variant="outline"
					>
						<span className="truncate">{c.keyResultTitle}</span>
					</Badge>
				</div>
			) : null}
			<p
				className="basis-full whitespace-pre-wrap break-words text-sm"
				data-noi-dung
				translate="no"
			>
				{c.body}
			</p>
			{c.mentions.length > 0 ? (
				<p className="basis-full text-muted-foreground text-xs" data-nhac-ten>
					{m.daNhac}:{" "}
					{c.mentions.map((n, i) => (
						<Fragment key={n.id}>
							{i > 0 ? ", " : null}
							<span className="font-medium text-foreground" translate="no">
								{n.name}
							</span>
						</Fragment>
					))}
				</p>
			) : null}
		</Item>
	);
}

function KhungSoan({
	objectiveId,
	keyResults,
}: {
	objectiveId: string;
	keyResults: KrTraoDoi[];
}) {
	const t = okrMessages(useLocale());
	const m = t.traoDoi;
	const h = t.hopThoai;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const ma = useId();
	const thanhVien = useQuery(trpc.okr.thanhVien.queryOptions());
	const [noiDung, setNoiDung] = useState("");
	const [kr, setKr] = useState(CA_MUC_TIEU);
	const [nhac, setNhac] = useState<string[]>([]);
	const them = useMutation(
		trpc.okr.addComment.mutationOptions({
			onSuccess: async () => {
				await cache.okr(objectiveId, { settle: "record" });
				setNoiDung("");
				setKr(CA_MUC_TIEU);
				setNhac([]);
			},
		}),
	);

	const tenNguoi = (id: string) =>
		thanhVien.data?.find((u) => u.id === id)?.name ?? id;
	const luaChon = (thanhVien.data ?? [])
		.filter((u) => !nhac.includes(u.id))
		.map((u) => ({
			value: u.id,
			label: u.name,
			hint: u.email,
			keywords: [u.email],
		}));
	const loi =
		them.isError && !them.isPending
			? dien(m.chuaGui, {
					loi:
						them.error.data?.httpStatus !== undefined &&
						them.error.data.httpStatus < 500
							? them.error.message
							: m.mayChu,
				})
			: null;

	const gui = () => {
		if (them.isPending || noiDung.trim() === "") return;
		them.mutate({
			objectiveId,
			keyResultId: kr === CA_MUC_TIEU ? undefined : kr,
			body: noiDung,
			mentionUserIds: nhac,
		});
	};

	return (
		<form
			data-khung-soan
			data-trang-thai={loi ? "ST-traodoi-loigui" : undefined}
			onSubmit={(e) => {
				e.preventDefault();
				gui();
			}}
		>
			<FieldGroup>
				<Field>
					<FieldLabel htmlFor={`${ma}-noi-dung`}>{m.noiDung}</FieldLabel>
					<Textarea
						aria-describedby={loi ? `${ma}-loi` : undefined}
						disabled={them.isPending}
						id={`${ma}-noi-dung`}
						maxLength={BINH_LUAN_TOI_DA}
						onChange={(e) => setNoiDung(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
								e.preventDefault();
								gui();
							}
						}}
						placeholder={m.goiY}
						translate="no"
						value={noiDung}
					/>
				</Field>
				<div className="grid items-start gap-3 sm:grid-cols-2">
					<Field>
						<FieldLabel htmlFor={`${ma}-kr`}>{m.veKr}</FieldLabel>
						<Select disabled={them.isPending} onValueChange={setKr} value={kr}>
							<SelectTrigger data-o-kr id={`${ma}-kr`}>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={CA_MUC_TIEU}>{m.caMucTieu}</SelectItem>
								{keyResults.map((k) => (
									<SelectItem key={k.id} translate="no" value={k.id}>
										{k.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>
					<Field>
						<FieldLabel htmlFor={`${ma}-nhac`}>{m.nhacTen}</FieldLabel>
						<Combobox
							data-o-nhac-ten
							disabled={thanhVien.isPending || them.isPending}
							empty={h.khongAi}
							id={`${ma}-nhac`}
							onValueChange={(v) => setNhac((ds) => [...ds, v])}
							options={luaChon}
							placeholder={thanhVien.isPending ? h.dangTai : m.themNguoi}
							searchPlaceholder={h.timNguoi}
							translate="no"
							value=""
						/>
						{nhac.length > 0 ? (
							<div className="flex flex-wrap gap-1" data-nguoi-nhac>
								{nhac.map((id) => (
									<TokenFieldItem key={id}>
										<span className="truncate px-1" translate="no">
											{tenNguoi(id)}
										</span>
										<TokenFieldAction
											aria-label={dien(m.boNhac, { ten: tenNguoi(id) })}
											disabled={them.isPending}
											onClick={() =>
												setNhac((ds) => ds.filter((x) => x !== id))
											}
										>
											<Icon icon={Close} />
										</TokenFieldAction>
									</TokenFieldItem>
								))}
							</div>
						) : null}
					</Field>
				</div>
				{loi ? (
					<FieldError data-loi-gui id={`${ma}-loi`}>
						{loi}
					</FieldError>
				) : null}
				<div>
					<Button
						data-nut="gui-binh-luan"
						disabled={them.isPending || noiDung.trim() === ""}
						type="submit"
					>
						{them.isPending ? <Spinner data-icon="inline-start" /> : null}
						{m.gui}
					</Button>
				</div>
			</FieldGroup>
		</form>
	);
}
