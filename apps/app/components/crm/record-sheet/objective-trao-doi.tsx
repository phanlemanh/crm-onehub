"use client";

import Chat from "@carbon/icons-react/es/Chat";
import Close from "@carbon/icons-react/es/Close";
import Renew from "@carbon/icons-react/es/Renew";
import { Button } from "@crm/ui/components/button";
import { Combobox } from "@crm/ui/components/combobox";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { useKhaiThayDoi } from "@crm/ui/components/giu-thay-doi";
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
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import {
	TokenFieldAction,
	TokenFieldItem,
} from "@crm/ui/components/token-field";
import { OKR_CANH_KR } from "@crm/validation/okr-canh-kr";
import { BINH_LUAN_TOI_DA } from "@crm/validation/okr-trao-doi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Fragment, useId, useState } from "react";
import { toast } from "sonner";
import { luc } from "@/app/(app)/[slug]/okr/bang-vet";
import {
	DetailSheetBody,
	DetailSheetEmpty,
	DetailSheetSection,
} from "@/components/detail-sheet";
import { okrMessages } from "@/lib/messages/okr";
import { okrCanhKrMessages } from "@/lib/messages/okr-canh-kr";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import {
	ChipKr,
	DongGhiNhan,
	type NguoiChon,
	TruongNguoiNhan,
} from "./objective-ghi-nhan";
import { dien } from "./plan-copy";

export type KrTraoDoi = { id: string; title: string };
export type BinhLuanVao = {
	keyResultId: string | null;
	body: string;
	mentionUserIds: string[];
};
export type GhiNhanVao = {
	keyResultId: string | null;
	nguoiNhan: string[];
	loiNhan: string;
};
type TraoDoi = RouterOutputs["okr"]["comments"];
type BinhLuanHien = TraoDoi["comments"][number];

const CA_MUC_TIEU = "ca-muc-tieu";

const LOAI_TIN = ["binh-luan", "ghi-nhan"] as const;
type LoaiTin = (typeof LOAI_TIN)[number];

const KHUNG_TAI = ["mot", "hai"] as const;

export function TabTraoDoi({
	objectiveId,
	keyResults,
	ghiNhanDuoc,
}: {
	objectiveId: string;
	keyResults: KrTraoDoi[];
	ghiNhanDuoc: boolean;
}) {
	const locale = useLocale();
	const m = okrMessages(locale).traoDoi;
	const g = okrCanhKrMessages(locale).ghiNhan;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const ds = useQuery(trpc.okr.comments.queryOptions({ objectiveId }));
	const go = useMutation(
		trpc.okr.goGhiNhan.mutationOptions({
			onError: (e) => toast.error(e.message),
		}),
	);

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
			) : ds.data.dong.length === 0 ? (
				<div className="contents" data-trang-thai="ST-traodoi-rong">
					<DetailSheetEmpty
						description={m.rong.body}
						icon={Chat}
						title={m.rong.title}
					/>
				</div>
			) : (
				<DetailSheetSection>
					<DongThoiGian
						duLieu={ds.data}
						onGoGhiNhan={async (id) => {
							await go.mutateAsync({ id });
							toast.success(g.daGo);
							await cache.okr(objectiveId, { settle: "record" });
						}}
					/>
				</DetailSheetSection>
			)}
			<DetailSheetSection>
				<KhungSoan
					ghiNhanDuoc={ghiNhanDuoc}
					keyResults={keyResults}
					objectiveId={objectiveId}
				/>
			</DetailSheetSection>
		</DetailSheetBody>
	);
}

export function DongThoiGian({
	duLieu,
	onGoGhiNhan,
}: {
	duLieu: TraoDoi;
	onGoGhiNhan: (id: string) => Promise<void>;
}) {
	const locale = useLocale();
	const m = okrMessages(locale).traoDoi;
	const g = okrCanhKrMessages(locale).ghiNhan;
	const [hoiGo, setHoiGo] = useState<string | null>(null);
	const [dangGo, setDangGo] = useState(false);
	const binhLuan = new Map(duLieu.comments.map((c) => [c.id, c]));

	const go = () => {
		if (hoiGo === null || dangGo) return;
		setDangGo(true);
		onGoGhiNhan(hoiGo).then(
			() => {
				setDangGo(false);
				setHoiGo(null);
			},
			() => setDangGo(false),
		);
	};

	return (
		<>
			<ItemGroup aria-label={m.danhSach} data-trang-thai="ST-traodoi-codulieu">
				{duLieu.dong.map((d) => {
					if (d.loai === "ghi-nhan")
						return (
							<DongGhiNhan ghiNhan={d} key={d.id} onGo={() => setHoiGo(d.id)} />
						);
					const c = binhLuan.get(d.id);
					return c ? <BinhLuan binhLuan={c} key={d.id} /> : null;
				})}
			</ItemGroup>
			<ConfirmDialog
				nut={g.hoiGo.nut}
				onConfirm={go}
				onOpenChange={(mo) => {
					if (!mo && !dangGo) setHoiGo(null);
				}}
				open={hoiGo !== null}
				pending={dangGo}
				than={g.hoiGo.than}
				thoi={g.hoiGo.thoi}
				tieuDe={g.hoiGo.tieuDe}
				tone="destructive"
			/>
		</>
	);
}

function BinhLuan({ binhLuan: c }: { binhLuan: BinhLuanHien }) {
	const locale = useLocale();
	const m = okrMessages(locale).traoDoi;
	return (
		<Item data-binh-luan={c.id} role="listitem" size="sm" variant="muted">
			<ItemContent>
				<ItemTitle translate="no">{c.author.name}</ItemTitle>
				<ItemDescription>{luc(c.createdAt, locale)}</ItemDescription>
			</ItemContent>
			{c.keyResultTitle ? <ChipKr ten={c.keyResultTitle} /> : null}
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
	ghiNhanDuoc,
}: {
	objectiveId: string;
	keyResults: KrTraoDoi[];
	ghiNhanDuoc: boolean;
}) {
	const m = okrMessages(useLocale()).traoDoi;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const thanhVien = useQuery(trpc.okr.thanhVien.queryOptions());
	const toi = useQuery(trpc.users.me.queryOptions());
	const them = useMutation(trpc.okr.addComment.mutationOptions());
	const gui = useMutation(trpc.okr.guiGhiNhan.mutationOptions());
	const hong = them.error ?? gui.error;
	const dangGui = them.isPending || gui.isPending;
	const loi =
		hong && !dangGui
			? dien(m.chuaGui, {
					loi:
						hong.data?.httpStatus !== undefined && hong.data.httpStatus < 500
							? hong.message
							: m.mayChu,
				})
			: null;
	const xong = (datLai: () => void) => async () => {
		await cache.okr(objectiveId, { settle: "record" });
		datLai();
	};

	return (
		<OSoanTraoDoi
			dangGui={dangGui}
			ghiNhanDuoc={ghiNhanDuoc}
			keyResults={keyResults}
			loi={loi}
			onGuiBinhLuan={(vao, datLai) => {
				gui.reset();
				them.mutate(
					{
						objectiveId,
						keyResultId: vao.keyResultId ?? undefined,
						body: vao.body,
						mentionUserIds: vao.mentionUserIds,
					},
					{ onSuccess: xong(datLai) },
				);
			}}
			onGuiGhiNhan={(vao, datLai) => {
				them.reset();
				gui.mutate({ objectiveId, ...vao }, { onSuccess: xong(datLai) });
			}}
			thanhVien={(thanhVien.data ?? []).map((u) => ({
				value: u.id,
				label: u.name,
				hint: u.email,
				keywords: [u.email],
			}))}
			thanhVienDangTai={thanhVien.isPending || toi.isPending}
			toiId={toi.data?.id ?? null}
		/>
	);
}

export function OSoanTraoDoi({
	keyResults,
	thanhVien,
	thanhVienDangTai,
	toiId,
	ghiNhanDuoc,
	dangGui,
	loi,
	onGuiBinhLuan,
	onGuiGhiNhan,
}: {
	keyResults: KrTraoDoi[];
	thanhVien: NguoiChon[];
	thanhVienDangTai: boolean;
	toiId: string | null;
	ghiNhanDuoc: boolean;
	dangGui: boolean;
	loi: string | null;
	onGuiBinhLuan: (vao: BinhLuanVao, datLai: () => void) => void;
	onGuiGhiNhan: (vao: GhiNhanVao, datLai: () => void) => void;
}) {
	const locale = useLocale();
	const t = okrMessages(locale);
	const m = t.traoDoi;
	const h = t.hopThoai;
	const g = okrCanhKrMessages(locale).ghiNhan;
	const ma = useId();
	const khaiThayDoi = useKhaiThayDoi();
	const [loai, setLoai] = useState<LoaiTin>("binh-luan");
	const [noiDung, setNoiDung] = useState("");
	const [kr, setKr] = useState(CA_MUC_TIEU);
	const [nhac, setNhac] = useState<string[]>([]);
	const [nguoiNhan, setNguoiNhan] = useState<string[]>([]);

	const ghiNhan = ghiNhanDuoc && loai === "ghi-nhan";
	const loiNhan = noiDung.trim();
	const loiQuaDai = loiNhan.length > OKR_CANH_KR.loiNhan.max;
	const guiDuoc = ghiNhan
		? nguoiNhan.length >= OKR_CANH_KR.nguoiNhan.min &&
			nguoiNhan.length <= OKR_CANH_KR.nguoiNhan.max &&
			loiNhan.length >= OKR_CANH_KR.loiNhan.min &&
			!loiQuaDai
		: loiNhan !== "";

	const tenNguoi = (id: string) =>
		thanhVien.find((u) => u.value === id)?.label ?? id;
	const luaChonNhac = thanhVien.filter((u) => !nhac.includes(u.value));
	const dem = dien(g.demKyTu, {
		n: noiDung.length,
		max: OKR_CANH_KR.loiNhan.max,
	});

	const datLai = () => {
		setNoiDung("");
		setKr(CA_MUC_TIEU);
		setNhac([]);
		setNguoiNhan([]);
		khaiThayDoi(false);
	};

	const gui = () => {
		if (dangGui || !guiDuoc) return;
		const keyResultId = kr === CA_MUC_TIEU ? null : kr;
		if (ghiNhan) onGuiGhiNhan({ keyResultId, nguoiNhan, loiNhan }, datLai);
		else
			onGuiBinhLuan(
				{ keyResultId, body: noiDung, mentionUserIds: nhac },
				datLai,
			);
	};

	const doiNguoiNhan = (ds: string[]) => {
		setNguoiNhan(ds);
		khaiThayDoi(ds.length > 0 || noiDung.trim() !== "");
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
			<FieldGroup
				data-trang-thai={ghiNhan ? "ST-traodoi-soan-ghinhan" : undefined}
			>
				{ghiNhanDuoc ? (
					<ToggleGroup
						aria-label={g.cheDo.nhan}
						data-o-loai-tin
						disabled={dangGui}
						onValueChange={(v) => {
							const moi = LOAI_TIN.find((x) => x === v);
							if (moi) setLoai(moi);
						}}
						type="single"
						value={loai}
						variant="outline"
					>
						<ToggleGroupItem value="binh-luan">
							{g.cheDo.binhLuan}
						</ToggleGroupItem>
						<ToggleGroupItem value="ghi-nhan">
							{g.cheDo.ghiNhan}
						</ToggleGroupItem>
					</ToggleGroup>
				) : null}
				{ghiNhan ? (
					<TruongNguoiNhan
						dangTai={thanhVienDangTai}
						id={`${ma}-nguoi-nhan`}
						khoa={dangGui}
						onChange={doiNguoiNhan}
						thanhVien={thanhVien.filter((u) => u.value !== toiId)}
						value={nguoiNhan}
					/>
				) : null}
				<Field data-invalid={ghiNhan && loiQuaDai ? true : undefined}>
					<FieldLabel htmlFor={`${ma}-noi-dung`}>
						{ghiNhan ? g.loi : m.noiDung}
					</FieldLabel>
					<Textarea
						aria-describedby={loi ? `${ma}-loi` : undefined}
						data-o-loi-nhan={ghiNhan ? true : undefined}
						disabled={dangGui}
						id={`${ma}-noi-dung`}
						maxLength={ghiNhan ? OKR_CANH_KR.loiNhan.max : BINH_LUAN_TOI_DA}
						onChange={(e) => {
							setNoiDung(e.target.value);
							khaiThayDoi(e.target.value.trim() !== "" || nguoiNhan.length > 0);
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
								e.preventDefault();
								gui();
							}
						}}
						placeholder={ghiNhan ? g.goiY : m.goiY}
						translate="no"
						value={noiDung}
					/>
					{ghiNhan ? (
						loiQuaDai ? (
							<FieldError data-dem-loi-nhan>{dem}</FieldError>
						) : (
							<FieldDescription data-dem-loi-nhan>{dem}</FieldDescription>
						)
					) : null}
				</Field>
				<div className="grid items-start gap-3 sm:grid-cols-2">
					<Field>
						<FieldLabel htmlFor={`${ma}-kr`}>{m.veKr}</FieldLabel>
						<Select disabled={dangGui} onValueChange={setKr} value={kr}>
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
					{ghiNhan ? null : (
						<Field>
							<FieldLabel htmlFor={`${ma}-nhac`}>{m.nhacTen}</FieldLabel>
							<Combobox
								data-o-nhac-ten
								disabled={thanhVienDangTai || dangGui}
								empty={h.khongAi}
								id={`${ma}-nhac`}
								onValueChange={(v) => setNhac((ds) => [...ds, v])}
								options={luaChonNhac}
								placeholder={thanhVienDangTai ? h.dangTai : m.themNguoi}
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
												disabled={dangGui}
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
					)}
				</div>
				{loi ? (
					<FieldError data-loi-gui id={`${ma}-loi`}>
						{loi}
					</FieldError>
				) : null}
				<div>
					<Button
						data-nut={ghiNhan ? "gui-ghi-nhan" : "gui-binh-luan"}
						disabled={dangGui || !guiDuoc}
						type="submit"
					>
						{dangGui ? <Spinner data-icon="inline-start" /> : null}
						{ghiNhan ? g.gui : m.gui}
					</Button>
				</div>
			</FieldGroup>
		</form>
	);
}
