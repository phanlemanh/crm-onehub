"use client";

import DocumentPdf from "@carbon/icons-react/es/DocumentPdf";
import DocumentWordProcessor from "@carbon/icons-react/es/DocumentWordProcessor";
import ImageIcon from "@carbon/icons-react/es/Image";
import Launch from "@carbon/icons-react/es/Launch";
import TrashCan from "@carbon/icons-react/es/TrashCan";
import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { FieldDescription } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemFooter,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { NguonKeoTha } from "@crm/ui/components/nguon-keo-tha";
import { Spinner } from "@crm/ui/components/spinner";
import { formatBytes } from "@crm/ui/hooks/use-file-upload";
import { useIsMobile } from "@crm/ui/hooks/use-mobile";
import {
	CAC_KIEU_TEP,
	KIEU_TEP,
	type KieuTep,
	kieuTheoTen,
} from "@crm/validation/kieu-tep";
import { TEP_TRUONG } from "@crm/validation/tep-truong";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { useState } from "react";
import { DetailSheetProperty } from "@/components/detail-sheet";
import { LocalDay } from "@/components/local-date-time";
import { type CrmMessages, crmMessages } from "@/lib/messages/crm";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { type FieldEntity, kindOf } from "./fields-entity";

export type TepOTep = {
	id: string;
	tenTep: string;
	kieu: KieuTep;
	kichThuoc: number;
	taiLuc: string;
	taiBoi: { id: string; ten: string | null } | null;
	coTheMo: boolean;
	coTheXoa: boolean;
};

export type DichOTep = {
	entity: FieldEntity;
	recordId: string;
	luuTru: boolean;
};

type LoiTep = keyof CrmMessages["tepTruong"]["loi"];

type DongTai = {
	ma: string;
	tep: File;
	trangThai: "dang" | "loi";
	loi?: LoiTep;
};

const CHAP_NHAN = CAC_KIEU_TEP.flatMap((kieu) => [
	...KIEU_TEP[kieu].duoi,
	KIEU_TEP[kieu].mime,
]).join(",");

const BIEU_TUONG = {
	pdf: DocumentPdf,
	docx: DocumentWordProcessor,
	png: ImageIcon,
	jpeg: ImageIcon,
} as const satisfies Record<KieuTep, typeof DocumentPdf>;

const LOI_THEO_CAU_MAY_CHU = new Map<string, LoiTep>([
	[TEP_TRUONG.thongDiep.saiKieu, "saiKieu"],
	[TEP_TRUONG.thongDiep.macro, "macro"],
	[TEP_TRUONG.thongDiep.quaCo, "quaCo"],
	[TEP_TRUONG.thongDiep.rong, "rong"],
]);

function loiTuMayChu(loi: Error): LoiTep {
	if (!(loi instanceof TRPCClientError)) return "khongXong";
	return LOI_THEO_CAU_MAY_CHU.get(loi.message) ?? "khongXong";
}

function loiTruocKhiTai(tep: File): LoiTep | null {
	if (!kieuTheoTen(tep.name)) return "saiKieu";
	if (tep.size === 0) return "rong";
	if (tep.size > TEP_TRUONG.toiDaByte) return "quaCo";
	return null;
}

export function OTep({
	nhan,
	khoa,
	tep,
	dich,
}: {
	nhan: string;
	khoa: string;
	tep: TepOTep[];
	dich: DichOTep;
}) {
	const locale = useLocale();
	const m = crmMessages(locale).tepTruong;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const trangThai = useQuery(trpc.fieldFiles.status.queryOptions());
	const xinCho = useMutation(trpc.fieldFiles.requestUpload.mutationOptions());
	const nhanTep = useMutation(trpc.fieldFiles.complete.mutationOptions());
	const moTep = useMutation(trpc.fieldFiles.downloadUrl.mutationOptions());
	const xoaTep = useMutation(trpc.fieldFiles.remove.mutationOptions());
	const [dongTai, setDongTai] = useState<DongTai[]>([]);
	const [hoiXoa, setHoiXoa] = useState<TepOTep | null>(null);
	const HangNut = useIsMobile() ? ItemFooter : ItemActions;

	const bat = trangThai.data?.bat !== false;
	const dangTai = dongTai.filter((d) => d.trangThai === "dang").length;
	const day = tep.length + dangTai >= TEP_TRUONG.toiDaTepMoiO;
	const lamMoi = () => cache[kindOf(dich.entity)](dich.recordId);
	const datDong = (ma: string, doi: Partial<DongTai> | null) =>
		setDongTai((cu) =>
			doi === null
				? cu.filter((d) => d.ma !== ma)
				: cu.map((d) => (d.ma === ma ? { ...d, ...doi } : d)),
		);

	const taiLen = async (dong: DongTai) => {
		const kieu = kieuTheoTen(dong.tep.name);
		if (!kieu) return datDong(dong.ma, { trangThai: "loi", loi: "saiKieu" });
		datDong(dong.ma, { trangThai: "dang", loi: undefined });
		const o = {
			entity: dich.entity,
			recordId: dich.recordId,
			fieldKey: khoa,
			tenTep: dong.tep.name,
		};
		try {
			const cho = await xinCho.mutateAsync({
				...o,
				kieu,
				kichThuoc: dong.tep.size,
			});
			const tra = await fetch(cho.url, {
				method: "PUT",
				body: dong.tep,
				headers: { "content-type": KIEU_TEP[kieu].mime },
			});
			if (!tra.ok) throw new Error("put");
			const kq = await nhanTep.mutateAsync({
				...o,
				pathname: cho.pathname,
				phieu: cho.phieu,
			});
			if (kq.trung) {
				datDong(dong.ma, { trangThai: "loi", loi: "trung" });
			} else {
				datDong(dong.ma, null);
			}
			await lamMoi();
		} catch (loi) {
			datDong(dong.ma, {
				trangThai: "loi",
				loi: loi instanceof Error ? loiTuMayChu(loi) : "khongXong",
			});
		}
	};

	const chon = (tepMoi: File) => {
		const loi = loiTruocKhiTai(tepMoi);
		const dong: DongTai = {
			ma: `${tepMoi.name}-${tepMoi.size}-${Date.now()}-${Math.random()}`,
			tep: tepMoi,
			trangThai: loi ? "loi" : "dang",
			loi: loi ?? undefined,
		};
		setDongTai((cu) => [...cu, dong]);
		if (!loi) void taiLen(dong);
	};

	const mo = async (t: TepOTep) => {
		const ky = await moTep.mutateAsync({ tepId: t.id });
		window.open(ky.url, "_blank", "noopener,noreferrer");
	};

	const xoa = async () => {
		if (!hoiXoa) return;
		await xoaTep.mutateAsync({ tepId: hoiXoa.id });
		setHoiXoa(null);
		await lamMoi();
	};

	const lyDoKhoa = !bat ? m.tat : day ? m.day : undefined;
	const coTheMoBatKy = tep.some((t) => t.coTheMo);

	return (
		<DetailSheetProperty label={nhan} wide stackBelowMd>
			<div className="flex min-w-0 flex-col gap-2" data-slot="o-tep">
				{tep.length === 0 && dongTai.length === 0 ? (
					<FieldDescription>{m.chuaCo}</FieldDescription>
				) : null}
				<ItemGroup>
					{tep.map((t) => (
						<Item key={t.id} variant="outline" size="xs" data-tep={t.id}>
							<ItemMedia>
								<Icon icon={BIEU_TUONG[t.kieu]} aria-hidden="true" />
							</ItemMedia>
							<ItemContent>
								<ItemTitle title={t.tenTep} translate="no">
									<span className="min-w-0 truncate">{t.tenTep}</span>
								</ItemTitle>
								<ItemDescription>
									{formatBytes(t.kichThuoc, 1)} · <LocalDay date={t.taiLuc} />
									{t.taiBoi?.ten ? ` · ${m.taiBoi(t.taiBoi.ten)}` : null}
								</ItemDescription>
							</ItemContent>
							<HangNut>
								<Button
									variant="ghost"
									size="sm"
									aria-label={m.mo(t.tenTep)}
									disabled={!t.coTheMo || !bat || moTep.isPending}
									onClick={() => void mo(t)}
								>
									<Icon icon={Launch} aria-hidden="true" />
									{m.nutMo}
								</Button>
								{t.coTheXoa && !dich.luuTru ? (
									<Button
										variant="ghost"
										size="sm"
										aria-label={m.xoa(t.tenTep)}
										onClick={() => setHoiXoa(t)}
									>
										<Icon icon={TrashCan} aria-hidden="true" />
										{m.nutXoa}
									</Button>
								) : null}
							</HangNut>
						</Item>
					))}
					{dongTai.map((d) => (
						<Item
							key={d.ma}
							variant="muted"
							size="xs"
							data-dong-tai={d.trangThai}
						>
							<ItemContent>
								<ItemTitle title={d.tep.name} translate="no">
									<span className="min-w-0 truncate">{d.tep.name}</span>
								</ItemTitle>
								<ItemDescription aria-live="polite">
									{d.trangThai === "dang"
										? m.dangTai
										: m.loi[d.loi ?? "khongXong"]}
								</ItemDescription>
							</ItemContent>
							<HangNut>
								{d.trangThai === "dang" ? <Spinner /> : null}
								{d.trangThai === "loi" && d.loi === "khongXong" ? (
									<Button
										variant="ghost"
										size="sm"
										onClick={() => void taiLen(d)}
									>
										{m.thuLai}
									</Button>
								) : null}
								{d.trangThai === "loi" ? (
									<Button
										variant="ghost"
										size="sm"
										onClick={() => datDong(d.ma, null)}
									>
										{m.bo}
									</Button>
								) : null}
							</HangNut>
						</Item>
					))}
				</ItemGroup>
				{tep.length > 0 && !coTheMoBatKy && bat ? (
					<FieldDescription>{m.khongMo}</FieldDescription>
				) : null}
				{dich.luuTru ? null : (
					<NguonKeoTha
						nhan={m.keoTha}
						moTa={m.moTaTai}
						nutChon={m.chonTep}
						chapNhan={CHAP_NHAN}
						toiDaByte={TEP_TRUONG.toiDaByte}
						nhieu
						tat={lyDoKhoa ? { lyDo: lyDoKhoa } : undefined}
						onChon={chon}
						onTuChoi={(tepSai, lyDo) =>
							setDongTai((cu) => [
								...cu,
								{
									ma: `${tepSai.name}-${Date.now()}-${Math.random()}`,
									tep: tepSai,
									trangThai: "loi",
									loi: lyDo === "co" ? "quaCo" : "saiKieu",
								},
							])
						}
					/>
				)}
				<ConfirmDialog
					tieuDe={hoiXoa ? m.hoiXoa.tieuDe(hoiXoa.tenTep) : ""}
					than={m.hoiXoa.than}
					nut={m.hoiXoa.nut}
					thoi={m.hoiXoa.thoi}
					open={hoiXoa !== null}
					onOpenChange={(mo) => {
						if (!mo) setHoiXoa(null);
					}}
					onConfirm={() => void xoa()}
					pending={xoaTep.isPending}
					tone="destructive"
				/>
			</div>
		</DetailSheetProperty>
	);
}
