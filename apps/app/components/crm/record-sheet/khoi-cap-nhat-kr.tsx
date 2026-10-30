"use client";

import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import ChevronUp from "@carbon/icons-react/es/ChevronUp";
import Renew from "@carbon/icons-react/es/Renew";
import UserFollow from "@carbon/icons-react/es/UserFollow";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { type LoiHoi, useKhaiThayDoi } from "@crm/ui/components/giu-thay-doi";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { Spinner } from "@crm/ui/components/spinner";
import { useMountEffect } from "@crm/ui/hooks/use-mount-effect";
import { formatDayShort } from "@crm/ui/lib/format";
import { homNayVN } from "@crm/validation/ngay-vn";
import { bangChungVao } from "@crm/validation/okr-canh-kr";
import {
	type GuiCapNhatInput,
	type LoiVao,
	mucCapNhat,
} from "@crm/validation/okr-cap-nhat";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseAsString, useQueryStates } from "nuqs";
import {
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import { toast } from "sonner";
import {
	ChonTuTin,
	docGiaTri,
	loiSo,
	OGhiChu,
	OGiaTri,
	oBanDau,
} from "@/app/(app)/[slug]/okr/cap-nhat-tuan/cap-nhat-tuan";
import { giaTri } from "@/app/(app)/[slug]/okr/gia-tri-kr";
import type { KrCapNhat } from "@/app/(app)/[slug]/okr/kieu";
import { DetailSheetSection } from "@/components/detail-sheet";
import { okrMessages } from "@/lib/messages/okr";
import { okrCanhKrMessages } from "@/lib/messages/okr-canh-kr";
import { okrLanTruocMessages } from "@/lib/messages/okr-lan-truoc";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { loiDuongDan } from "./kr-bang-chung";
import { dien } from "./plan-copy";
import { useOpenRecord } from "./record-stack";

export const TAB_CAP_NHAT = "cap-nhat";

type ChiTiet = RouterOutputs["okr"]["objective"];
type KrCuaMt = ChiTiet["keyResults"][number];
type LanCapNhat = RouterOutputs["okr"]["lichSuKr"]["lan"][number];
type O = ReturnType<typeof oBanDau>;
type MucGui = GuiCapNhatInput["items"][number];

const NGAY_MS = 86_400_000;
const SO_NGAY_TUAN = 7;
const SO_LE_DOI = 6;

let loiVaoCho: { keyResultId: string; entry: LoiVao } | null = null;
const nguoiNghe = new Set<(keyResultId: string) => void>();

export function datLoiVao(keyResultId: string, entry: LoiVao): void {
	loiVaoCho = { keyResultId, entry };
}

function layLoiVao(keyResultId: string): LoiVao {
	const cho = loiVaoCho;
	loiVaoCho = null;
	return cho?.keyResultId === keyResultId ? cho.entry : "sheet";
}

const thamSoMo = {
	[SEARCH_PARAM.record.tab]: parseAsString,
	[SEARCH_PARAM.record.thuTu]: parseAsString,
};

export type MoCapNhatKr = (
	keyResultId: string,
	entry: LoiVao,
	thuTu?: string | null,
) => void;

export function useMoCapNhatKr(): MoCapNhatKr {
	const openRecord = useOpenRecord();
	const [, dat] = useQueryStates(thamSoMo);
	return useCallback(
		(keyResultId, entry, thuTu = null) => {
			datLoiVao(keyResultId, entry);
			openRecord({ kind: "kr", id: keyResultId });
			void dat({
				[SEARCH_PARAM.record.tab]: TAB_CAP_NHAT,
				...(thuTu === null ? {} : { [SEARCH_PARAM.record.thuTu]: thuTu }),
			});
		},
		[openRecord, dat],
	);
}

export function ngheDaGui(nghe: (keyResultId: string) => void): () => void {
	nguoiNghe.add(nghe);
	return () => {
		nguoiNghe.delete(nghe);
	};
}

function baoDaGui(keyResultId: string): void {
	for (const nghe of nguoiNghe) nghe(keyResultId);
}

export function dauTuanVN(ngay: string): string {
	const d = new Date(`${ngay}T00:00:00Z`);
	const lui = (d.getUTCDay() + SO_NGAY_TUAN - 1) % SO_NGAY_TUAN;
	return new Date(d.getTime() - lui * NGAY_MS).toISOString().slice(0, 10);
}

export function denHanCapNhat(lan: readonly LanCapNhat[], now: Date): boolean {
	const tuanNay = dauTuanVN(homNayVN(now));
	return !lan.some((l) => l.tuan >= tuanNay);
}

export function krCapNhatTuSheet(mt: ChiTiet, kr: KrCuaMt): KrCapNhat {
	const lanCuoi = mt.trail
		.filter((v) => v.action === "cap-nhat-tuan" && v.keyResultId === kr.id)
		.reduce<ChiTiet["trail"][number] | null>(
			(moi, v) => (moi === null || v.at > moi.at ? v : moi),
			null,
		);
	const tuTin = mucCapNhat.shape.confidence.safeParse(
		lanCuoi?.after?.confidence,
	);
	return {
		keyResultId: kr.id,
		title: kr.title,
		objectiveId: mt.id,
		objectiveTitle: mt.title,
		unitName: mt.unitName,
		kind: kr.kind,
		unit: kr.unit,
		targetValue: kr.targetValue,
		currentValue: kr.currentValue,
		lastConfidence: tuTin.success ? tuTin.data : null,
		lastAt: lanCuoi?.at ?? null,
		updatedThisWeek: false,
		nguon: kr.source,
		doCanh: kr.doCanh,
		soMay: kr.soMay,
	};
}

export function mucGui(kr: KrCapNhat, o: O, bangChung: string): MucGui | null {
	const so = docGiaTri(kr, o.giaTri);
	if (so === null || loiSo(kr, so) !== null || o.tuTin === null) return null;
	const coBangChung = kr.kind === "moc" && so === 1;
	if (coBangChung && loiDuongDan(bangChung)) return null;
	const bangChungGui = coBangChung
		? bangChungVao.safeParse({ url: bangChung, ghiChu: "" })
		: null;
	return {
		keyResultId: kr.keyResultId,
		value: so,
		confidence: o.tuTin,
		note: o.ghiChu.trim(),
		bangChung: bangChungGui?.success ? bangChungGui.data : undefined,
	};
}

export function mucDoi(
	kr: Pick<KrCapNhat, "kind" | "unit">,
	cu: number,
	moi: number,
	locale: Parameters<typeof giaTri>[2],
	mau: string,
): string | null {
	if (moi === cu) return null;
	const chu = (so: number) => giaTri(kr, so, locale);
	if (kr.kind === "moc") return `${chu(cu)} → ${chu(moi)}`;
	const so = (n: number) => giaTri({ kind: kr.kind, unit: "" }, n, locale);
	const doi = Number((moi - cu).toFixed(SO_LE_DOI));
	const dau = doi > 0 ? "+" : "−";
	return dien(mau, {
		cu: so(cu),
		moi: so(moi),
		doi: `${dau}${chu(Math.abs(doi))}`,
	});
}

function DongThu({ moTa, onMo }: { moTa: string; onMo: () => void }) {
	const m = okrCanhKrMessages(useLocale()).khoiCapNhat;
	return (
		<DetailSheetSection data-khoi-cap-nhat-kr="thu">
			<Item asChild size="sm" variant="outline">
				<button
					aria-expanded={false}
					data-nut="mo-khoi-cap-nhat-kr"
					onClick={onMo}
					type="button"
				>
					<ItemContent>
						<ItemTitle>{m.tieuDe}</ItemTitle>
						<ItemDescription className="tabular-nums">{moTa}</ItemDescription>
					</ItemContent>
					<ItemActions>
						<Icon icon={ChevronDown} />
					</ItemActions>
				</button>
			</Item>
		</DetailSheetSection>
	);
}

export function KhoiCapNhatKr({
	mt,
	kr,
	tuLoiVao,
	onXemTruoc,
	onDaGui,
}: {
	mt: ChiTiet;
	kr: KrCuaMt;
	tuLoiVao: boolean;
	onXemTruoc: (so: number | null) => void;
	onDaGui: () => void;
}) {
	const trpc = useTRPC();
	const ls = useQuery(trpc.okr.lichSuKr.queryOptions({ keyResultId: kr.id }));
	if (ls.isPending) return <Skeleton className="mx-5 my-3 h-14" />;
	if (!ls.data) return null;
	return (
		<KhoiDaTai
			denHan={denHanCapNhat(ls.data.lan, new Date())}
			kr={kr}
			lanCuoi={ls.data.lan.at(-1) ?? null}
			mt={mt}
			onDaGui={onDaGui}
			onXemTruoc={onXemTruoc}
			tuLoiVao={tuLoiVao}
		/>
	);
}

function KhoiDaTai({
	mt,
	kr,
	denHan,
	lanCuoi,
	tuLoiVao,
	onXemTruoc,
	onDaGui,
}: {
	mt: ChiTiet;
	kr: KrCuaMt;
	denHan: boolean;
	lanCuoi: LanCapNhat | null;
	tuLoiVao: boolean;
	onXemTruoc: (so: number | null) => void;
	onDaGui: () => void;
}) {
	const locale = useLocale();
	const t = okrMessages(locale);
	const m = okrCanhKrMessages(locale);
	const k = m.khoiCapNhat;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const qc = useQueryClient();
	const ma = useId();
	const krCn = useMemo(() => krCapNhatTuSheet(mt, kr), [mt, kr]);
	const banDau = useMemo(() => oBanDau(krCn, locale), [krCn, locale]);
	const [mo, setMo] = useState(denHan || tuLoiVao);
	const [tieuDiem, setTieuDiem] = useState(tuLoiVao);
	const [oNhap, setO] = useState<O | null>(null);
	const o = oNhap ?? banDau;
	const [bangChung, setBangChung] = useState("");
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [cho, setCho] = useState(false);
	const daMo = useRef(false);
	const khoi = useRef<HTMLDivElement>(null);
	const khai = useKhaiThayDoi(k.hoiBo satisfies LoiHoi);
	const moPhien = useMutation(trpc.okr.moCapNhat.mutationOptions());
	const goiMo = moPhien.mutate;

	const coNhap =
		(oNhap !== null &&
			(oNhap.giaTri !== banDau.giaTri ||
				oNhap.tuTin !== null ||
				oNhap.ghiChu.trim() !== "")) ||
		bangChung !== "";
	const so = docGiaTri(krCn, o.giaTri);
	const loi = loiSo(krCn, so);
	const soXem = coNhap && loi === null && so !== null ? so : null;

	useEffect(() => {
		khai(coNhap);
	}, [khai, coNhap]);
	useEffect(() => {
		onXemTruoc(mo && krCn.kind !== "moc" ? soXem : null);
	}, [mo, krCn.kind, soXem, onXemTruoc]);
	useEffect(() => {
		if (tuLoiVao) khoi.current?.scrollIntoView?.({ block: "start" });
	}, [tuLoiVao]);

	const batDau = () => {
		if (daMo.current) return;
		daMo.current = true;
		goiMo(
			{ entry: layLoiVao(kr.id) },
			{ onSuccess: ({ sessionId: id }) => setSessionId(id) },
		);
	};
	useMountEffect(() => {
		if (tuLoiVao) batDau();
	});

	const gui = useMutation(
		trpc.okr.guiCapNhat.mutationOptions({
			onSuccess: async () => {
				toast.success(t.hopCapNhat.daGui);
				const theoKr = { keyResultId: kr.id };
				await Promise.all([
					cache.okr(mt.id, { settle: "record" }),
					qc.invalidateQueries(
						{ queryKey: trpc.okr.canhKr.queryKey(theoKr) },
						{ cancelRefetch: false },
					),
					qc.invalidateQueries(
						{ queryKey: trpc.okr.lichSuKr.queryKey(theoKr) },
						{ cancelRefetch: false },
					),
				]);
				khai(false);
				setO(null);
				setBangChung("");
				setSessionId(null);
				daMo.current = false;
				setMo(false);
				baoDaGui(kr.id);
				onDaGui();
			},
		}),
	);

	const muc = mucGui(krCn, o, bangChung);
	const guiMuc = gui.mutate;
	useEffect(() => {
		if (!cho || sessionId === null) return;
		setCho(false);
		if (muc) guiMuc({ sessionId, items: [muc] });
	}, [cho, sessionId, muc, guiMuc]);

	const ngayCuoi = lanCuoi ? formatDayShort(lanCuoi.ngay, locale) : null;
	const giaTriCuoi = lanCuoi?.giaTri ?? kr.currentValue;
	const moTaThu = [
		ngayCuoi === null
			? k.chuaCo
			: dien(k.moiNhat, {
					ngay: ngayCuoi,
					giaTri: giaTri(krCn, giaTriCuoi, locale),
				}),
		coNhap ? k.conNhap : null,
	]
		.filter((c) => c !== null)
		.join(" · ");

	if (!mo)
		return (
			<DongThu
				moTa={moTaThu}
				onMo={() => {
					setTieuDiem(true);
					setMo(true);
					batDau();
				}}
			/>
		);

	const khoa = gui.isPending;
	const dangMo = sessionId === null && !moPhien.isError;
	const duoc = muc !== null;
	const hienBangChung = krCn.kind === "moc" && so === 1;
	const saiBangChung = hienBangChung && loiDuongDan(bangChung);
	const doi =
		so === null || loi !== null
			? null
			: mucDoi(krCn, giaTriCuoi, so, locale, k.mucDoi);
	const loiMayChu =
		gui.error?.data?.httpStatus !== undefined && gui.error.data.httpStatus < 500
			? gui.error.message
			: t.capNhat.loiGui.mayChu;

	const guiDi = () => {
		if (khoa || muc === null) return;
		if (sessionId === null) {
			batDau();
			setCho(true);
			return;
		}
		gui.mutate({ sessionId, items: [muc] });
	};

	return (
		<div ref={khoi}>
			<DetailSheetSection
				action={
					<Button
						aria-label={k.thu}
						onClick={() => setMo(false)}
						size="icon-sm"
						variant="ghost"
					>
						<Icon icon={ChevronUp} />
					</Button>
				}
				data-khoi-cap-nhat-kr="mo"
				title={k.tieuDe}
			>
				<form
					className="flex flex-col gap-4"
					id={`${ma}-form`}
					onFocus={batDau}
					onKeyDown={(e) => {
						if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
							e.preventDefault();
							guiDi();
						}
					}}
					onSubmit={(e) => {
						e.preventDefault();
						guiDi();
					}}
				>
					{kr.laCuaToi ? null : (
						<Alert data-ghi-ho>
							<Icon icon={UserFollow} />
							<AlertTitle>
								{t.hopCapNhat.ghiHo} <span translate="no">{kr.owner.name}</span>
							</AlertTitle>
							<AlertDescription>{t.hopCapNhat.ghiHoMoTa}</AlertDescription>
						</Alert>
					)}
					{moPhien.isError ? (
						<Alert variant="destructive">
							<Icon icon={WarningAlt} />
							<AlertTitle>{t.hopCapNhat.loiMo}</AlertTitle>
							<AlertDescription>
								<Button
									onClick={() => {
										daMo.current = false;
										batDau();
									}}
									size="sm"
									type="button"
									variant="outline"
								>
									<Icon data-icon="inline-start" icon={Renew} />
									{t.hopCapNhat.moLai}
								</Button>
							</AlertDescription>
						</Alert>
					) : null}
					{gui.isError && !khoa ? (
						<Alert data-loi-gui variant="destructive">
							<Icon icon={WarningAlt} />
							<AlertTitle>{t.capNhat.loiGui.title}</AlertTitle>
							<AlertDescription>
								{loiMayChu} {t.capNhat.loiGui.conNguyen}
							</AlertDescription>
						</Alert>
					) : null}
					<FieldGroup>
						<OGiaTri
							datGiaTri={(giaTri) => setO({ ...o, giaTri })}
							khoa={khoa}
							kr={krCn}
							lan={null}
							loi={loi}
							moTa={
								doi === null ? undefined : (
									<span data-xem-truoc-cap-nhat={so ?? undefined}>{doi}</span>
								)
							}
							so={so}
							tuDongFocus={tieuDiem}
							value={o.giaTri}
						/>
						{hienBangChung ? (
							<Field
								data-invalid={saiBangChung ? true : undefined}
								data-o="bang-chung"
							>
								<FieldLabel htmlFor={`${ma}-bang-chung`}>
									{m.capNhat.bangChung}
								</FieldLabel>
								<Input
									aria-invalid={saiBangChung ? true : undefined}
									autoComplete="off"
									disabled={khoa}
									id={`${ma}-bang-chung`}
									inputMode="url"
									name="bang-chung"
									onChange={(e) => setBangChung(e.target.value)}
									placeholder="https://…"
									spellCheck={false}
									translate="no"
									type="url"
									value={bangChung}
								/>
								{saiBangChung ? (
									<FieldError>{m.bangChung.loiDuongDan}</FieldError>
								) : (
									<FieldDescription>{m.capNhat.goiY}</FieldDescription>
								)}
							</Field>
						) : null}
						<ChonTuTin
							datTuTin={(tuTin) => setO({ ...o, tuTin })}
							khoa={khoa}
							kr={krCn}
							lan={krCn.lastAt === null ? null : "lan-truoc"}
							value={o.tuTin}
						/>
						<OGhiChu
							datGhiChu={(ghiChu) => setO({ ...o, ghiChu })}
							goiY={okrLanTruocMessages(locale).goiY}
							id={kr.id}
							khoa={khoa}
							value={o.ghiChu}
						/>
					</FieldGroup>
					<div className="flex flex-wrap items-center justify-end gap-3">
						<span
							aria-hidden={duoc || undefined}
							className="text-muted-foreground text-xs"
							data-goi-y-phim
						>
							{duoc ? k.phim : k.chonTuTin}
						</span>
						<Button
							aria-keyshortcuts="Control+Enter Meta+Enter"
							data-nut="gui-cap-nhat-kr"
							disabled={!duoc || khoa || moPhien.isError}
							type="submit"
						>
							{khoa || (cho && dangMo) ? (
								<Spinner data-icon="inline-start" />
							) : null}
							{khoa ? t.capNhat.dangGui : t.hopCapNhat.gui}
						</Button>
					</div>
				</form>
			</DetailSheetSection>
		</div>
	);
}
