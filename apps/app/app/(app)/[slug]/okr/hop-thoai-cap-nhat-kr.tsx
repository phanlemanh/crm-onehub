"use client";

import Renew from "@carbon/icons-react/es/Renew";
import UserFollow from "@carbon/icons-react/es/UserFollow";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
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
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { Spinner } from "@crm/ui/components/spinner";
import { TargetLineChart } from "@crm/ui/components/target-line-chart";
import { homNayVN } from "@crm/validation/ngay-vn";
import { bangChungVao } from "@crm/validation/okr-canh-kr";
import { type GuiCapNhatInput, mucCapNhat } from "@crm/validation/okr-cap-nhat";
import { SO_KR_MOC, tienDoKr } from "@crm/validation/okr-kr";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import { toast } from "sonner";
import { loiDuongDan } from "@/components/crm/record-sheet/kr-bang-chung";
import { okrMessages } from "@/lib/messages/okr";
import { okrCanhKrMessages } from "@/lib/messages/okr-canh-kr";
import { okrLanTruocMessages } from "@/lib/messages/okr-lan-truoc";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import {
	ChonTuTin,
	docGiaTri,
	type LanTruoc,
	loiSo,
	OGhiChu,
	OGiaTri,
	oBanDau,
} from "./cap-nhat-tuan/cap-nhat-tuan";
import { KhoiLanTruoc } from "./khoi-lan-truoc";
import type { KetQua, KrCapNhat } from "./kieu";
import type { LanTruocKr } from "./lan-truoc-kr";

type ChiTiet = RouterOutputs["okr"]["objective"];
type DienBien = RouterOutputs["okr"]["dienBien"];
type O = ReturnType<typeof oBanDau>;
type MucGui = GuiCapNhatInput["items"][number];

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

const XEM_TRUOC = { chieuCao: 144 } as const;

const nhanTuan = (ngay: string) => `${ngay.slice(8, 10)}/${ngay.slice(5, 7)}`;

function tuanCuaDiemMoi(diem: DienBien["diem"], homNay: string): string {
	return diem.reduce<string>(
		(cu, d) => (d.tuan <= homNay ? d.tuan : cu),
		homNay,
	);
}

function XemTruocMoc({ so }: { so: number }) {
	const t = okrMessages(useLocale());
	const tienDo = tienDoKr(
		"moc",
		SO_KR_MOC.startValue,
		SO_KR_MOC.targetValue,
		so,
	);
	return (
		<Field data-o="xem-truoc" data-xem-truoc="moc">
			<FieldDescription data-tien-do-moi={tienDo}>
				{so >= SO_KR_MOC.targetValue ? t.moc.xong : t.moc.chuaXong} ·{" "}
				{t.capNhat.dich} {t.moc.xong.toLowerCase()} ·{" "}
				{t.capNhat.tienDoMoi(tienDo)}
			</FieldDescription>
		</Field>
	);
}

function XemTruocSo({ kr, so }: { kr: KrCapNhat; so: number | null }) {
	const locale = useLocale();
	const m = okrMessages(locale).capNhat;
	const mt = okrToanCanhMessages(locale);
	const trpc = useTRPC();
	const db = useQuery(
		trpc.okr.dienBien.queryOptions({ keyResultId: kr.keyResultId }),
	);
	if (db.isPending)
		return <Skeleton className="h-36 w-full" data-o="xem-truoc" />;
	if (db.isError) return null;
	const d = db.data;
	const tuan = tuanCuaDiemMoi(d.diem, homNayVN(new Date()));
	const tienDo = so === null ? null : tienDoKr(d.kieu, d.khoi, d.dich, so);
	return (
		<Field data-o="xem-truoc" data-xem-truoc="so">
			<TargetLineChart
				data={d.diem.map((p) => ({
					x: nhanTuan(p.tuan),
					value: p.giaTri,
					expected: p.kyVong,
				}))}
				height={XEM_TRUOC.chieuCao}
				label={m.xemTruoc}
				previewPoint={
					so === null ? undefined : { x: nhanTuan(tuan), value: so }
				}
				target={d.dich}
				targetLabel={mt.dienBien.dich(
					d.donVi === "%" ? `${d.dich}%` : `${d.dich} ${d.donVi}`.trim(),
				)}
			/>
			{tienDo === null ? null : (
				<FieldDescription className="tabular-nums" data-tien-do-moi={tienDo}>
					{m.tienDoMoi(tienDo)}
				</FieldDescription>
			)}
		</Field>
	);
}

export function krCapNhatTuSheet(mt: ChiTiet, kr: KetQua): KrCapNhat {
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

export function HopThoaiCapNhatKr({
	kr,
	lanTruoc,
	chuTen,
	ghiHo,
	sessionId,
	loiMo,
	moLai,
	dong,
	onDaGui,
}: {
	kr: KrCapNhat;
	lanTruoc: LanTruocKr | null;
	chuTen: string;
	ghiHo: boolean;
	sessionId: string | null;
	loiMo: boolean;
	moLai: () => void;
	dong: () => void;
	onDaGui?: (keyResultId: string) => void;
}) {
	const locale = useLocale();
	const t = okrMessages(locale);
	const m = t.hopCapNhat;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const queryClient = useQueryClient();
	const ma = useId();
	const mc = okrCanhKrMessages(locale);
	const [o, setO] = useState(() => oBanDau(kr, locale));
	const [bangChung, setBangChung] = useState("");
	const gui = useMutation(
		trpc.okr.guiCapNhat.mutationOptions({
			onSuccess: async () => {
				toast.success(m.daGui);
				const theoKr = { keyResultId: kr.keyResultId };
				await Promise.all([
					cache.okr(kr.objectiveId, { settle: "record" }),
					queryClient.invalidateQueries(
						{ queryKey: trpc.okr.canhKr.queryKey(theoKr) },
						{ cancelRefetch: false },
					),
					queryClient.invalidateQueries(
						{ queryKey: trpc.okr.dienBien.queryKey(theoKr) },
						{ cancelRefetch: false },
					),
				]);
				onDaGui?.(kr.keyResultId);
				dong();
			},
		}),
	);

	const so = docGiaTri(kr, o.giaTri);
	const loi = loiSo(kr, so);
	const hienBangChung = kr.kind === "moc" && so === 1;
	const saiBangChung = hienBangChung && loiDuongDan(bangChung);
	const muc = mucGui(kr, o, bangChung);
	const lan: LanTruoc | null = kr.lastAt === null ? null : "lan-truoc";
	const khoa = gui.isPending;
	const dangMo = sessionId === null && !loiMo;
	const sanSang = sessionId !== null && muc !== null;
	const loiMayChu =
		gui.error?.data?.httpStatus !== undefined && gui.error.data.httpStatus < 500
			? gui.error.message
			: t.capNhat.loiGui.mayChu;

	const guiDi = () => {
		if (khoa || sessionId === null || muc === null) return;
		gui.mutate({ sessionId, items: [muc] });
	};

	return (
		<Dialog
			open
			onOpenChange={(mo) => {
				if (!mo && !khoa) dong();
			}}
		>
			<DialogContent data-hop-cap-nhat-kr={kr.keyResultId}>
				<DialogHeader>
					<DialogTitle>{m.tieuDe}</DialogTitle>
					<DialogDescription translate="no">{kr.title}</DialogDescription>
				</DialogHeader>
				{ghiHo ? (
					<Alert data-ghi-ho>
						<Icon icon={UserFollow} />
						<AlertTitle>
							{m.ghiHo} <span translate="no">{chuTen}</span>
						</AlertTitle>
						<AlertDescription>{m.ghiHoMoTa}</AlertDescription>
					</Alert>
				) : null}
				{loiMo ? (
					<Alert variant="destructive">
						<Icon icon={WarningAlt} />
						<AlertTitle>{m.loiMo}</AlertTitle>
						<AlertDescription>
							<Button onClick={moLai} size="sm" variant="outline">
								<Icon data-icon="inline-start" icon={Renew} />
								{m.moLai}
							</Button>
						</AlertDescription>
					</Alert>
				) : null}
				{gui.isError && !khoa ? (
					<Alert variant="destructive">
						<Icon icon={WarningAlt} />
						<AlertTitle>{t.capNhat.loiGui.title}</AlertTitle>
						<AlertDescription>
							{loiMayChu} {t.capNhat.loiGui.conNguyen}
						</AlertDescription>
					</Alert>
				) : null}
				{lanTruoc ? <KhoiLanTruoc kr={kr} lan={lanTruoc} /> : null}
				<form
					id={`${ma}-form`}
					onSubmit={(e) => {
						e.preventDefault();
						guiDi();
					}}
				>
					<FieldGroup>
						<OGiaTri
							datGiaTri={(giaTri) => setO({ ...o, giaTri })}
							khoa={khoa}
							kr={kr}
							lan={null}
							loi={loi}
							so={so}
							tuDongFocus
							value={o.giaTri}
						/>
						{kr.kind === "moc" ? (
							<XemTruocMoc so={so ?? SO_KR_MOC.startValue} />
						) : (
							<XemTruocSo kr={kr} so={loi === null ? so : null} />
						)}
						{hienBangChung ? (
							<Field
								data-o="bang-chung"
								data-invalid={saiBangChung ? true : undefined}
							>
								<FieldLabel htmlFor={`${ma}-bang-chung`}>
									{mc.capNhat.bangChung}
								</FieldLabel>
								<Input
									id={`${ma}-bang-chung`}
									name="bang-chung"
									type="url"
									inputMode="url"
									autoComplete="off"
									spellCheck={false}
									translate="no"
									placeholder="https://…"
									value={bangChung}
									disabled={khoa}
									aria-invalid={saiBangChung ? true : undefined}
									onChange={(e) => setBangChung(e.target.value)}
								/>
								{saiBangChung ? (
									<FieldError>{mc.bangChung.loiDuongDan}</FieldError>
								) : (
									<FieldDescription>{mc.capNhat.goiY}</FieldDescription>
								)}
							</Field>
						) : null}
						<ChonTuTin
							datTuTin={(tuTin) => setO({ ...o, tuTin })}
							khoa={khoa}
							kr={kr}
							lan={lan}
							value={o.tuTin}
						/>
						<OGhiChu
							datGhiChu={(ghiChu) => setO({ ...o, ghiChu })}
							goiY={okrLanTruocMessages(locale).goiY}
							id={kr.keyResultId}
							khoa={khoa}
							value={o.ghiChu}
						/>
					</FieldGroup>
				</form>
				<DialogFooter>
					<DialogClose asChild>
						<Button disabled={khoa} variant="outline">
							{m.huy}
						</Button>
					</DialogClose>
					<Button
						data-nut="gui-cap-nhat-kr"
						disabled={!sanSang || khoa}
						form={`${ma}-form`}
						type="submit"
					>
						{khoa || dangMo ? <Spinner data-icon="inline-start" /> : null}
						{khoa ? t.capNhat.dangGui : dangMo ? m.dangMo : m.gui}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
