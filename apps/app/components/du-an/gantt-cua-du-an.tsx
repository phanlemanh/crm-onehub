"use client";

import { Button } from "@crm/ui/components/button";
import { DatePicker } from "@crm/ui/components/date-picker";
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
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Field, FieldError, FieldLabel } from "@crm/ui/components/field";
import {
	GANTT_DU_AN,
	GanttDuAn,
	type GanttDuAnDoiLich,
} from "@crm/ui/components/gantt-du-an";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { useMoGiaoViec } from "@/components/viec/giao-viec";
import { duAnMessages } from "@/lib/messages/du-an";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

type Lich = { batDau: string; han: string };

const HANG_CHO = ["a", "b", "c", "d", "e"];

function homNayVN(): string {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: GANTT_DU_AN.muiGio,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date());
}

function ChoTaiGantt() {
	return (
		<div
			aria-busy="true"
			className="grid grid-cols-[minmax(8rem,14rem)_1fr] gap-2"
			data-gantt-cho-tai=""
		>
			{HANG_CHO.map((k) => (
				<div className="contents" key={k}>
					<Skeleton className="h-8" />
					<Skeleton className="h-8" />
				</div>
			))}
		</div>
	);
}

function HopDatNgay({
	viec,
	onOpenChange,
	onLuu,
}: {
	viec: {
		id: string;
		tieuDe: string;
		batDau: string | null;
		han: string | null;
	} | null;
	onOpenChange: (open: boolean) => void;
	onLuu: (lich: Lich) => Promise<string | null>;
}) {
	const m = duAnMessages(useLocale()).gantt;
	const [batDau, setBatDau] = useState<string | null>(viec?.batDau ?? null);
	const [han, setHan] = useState<string | null>(viec?.han ?? null);
	const [loi, setLoi] = useState<string | null>(null);
	const [dangLuu, setDangLuu] = useState(false);

	const luu = async () => {
		if (!batDau || !han) {
			setLoi(m.thieuNgay);
			return;
		}
		if (batDau > han) {
			setLoi(m.batDauSauHan);
			return;
		}
		setDangLuu(true);
		const loiMay = await onLuu({ batDau, han });
		setDangLuu(false);
		setLoi(loiMay);
	};

	return (
		<Dialog onOpenChange={onOpenChange} open={viec !== null}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{m.datNgay}</DialogTitle>
					<DialogDescription>
						<span translate="no">
							{dien(m.datNgayMoTa, { ten: viec?.tieuDe ?? "" })}
						</span>
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-3 sm:grid-cols-2">
					<Field>
						<FieldLabel>{m.batDau}</FieldLabel>
						<DatePicker onChange={setBatDau} value={batDau} />
					</Field>
					<Field>
						<FieldLabel>{m.han}</FieldLabel>
						<DatePicker onChange={setHan} value={han} />
					</Field>
				</div>
				{loi ? <FieldError>{loi}</FieldError> : null}
				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="outline">
							{m.huy}
						</Button>
					</DialogClose>
					<Button disabled={dangLuu} onClick={() => void luu()} type="button">
						{m.luu}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function GanttCuaDuAn({ duAnId }: { duAnId: string }) {
	const m = duAnMessages(useLocale()).gantt;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const open = useOpenRecord();
	const moGiao = useMoGiaoViec();
	const q = useQuery(trpc.duAn.lich.queryOptions({ id: duAnId }));
	const doiLich = useMutation(trpc.viec.doiLich.mutationOptions());
	const [tam, setTam] = useState<ReadonlyMap<string, Lich>>(new Map());
	const [datNgay, setDatNgay] = useState<string | null>(null);

	const boTam = (id: string) =>
		setTam((cu) => {
			const moi = new Map(cu);
			moi.delete(id);
			return moi;
		});

	const gui = async (id: string, lich: Lich): Promise<string | null> => {
		setTam((cu) => new Map(cu).set(id, lich));
		try {
			const kq = await doiLich.mutateAsync({
				id,
				batDauNgay: lich.batDau,
				hanNgay: lich.han,
			});
			if (kq.daDoi.length > 0) {
				toast.success(dien(m.daDoi, { n: kq.daDoi.length }));
			}
			await cache.viec();
			boTam(id);
			return null;
		} catch (e) {
			boTam(id);
			const chu = e instanceof Error ? e.message : m.loi;
			toast.error(chu);
			return chu;
		}
	};

	if (q.isPending) return <ChoTaiGantt />;
	if (!q.data) {
		return (
			<VungTaiLoi
				dangTai={q.isFetching}
				moTa={m.loiMoTa}
				onThuLai={() => void q.refetch()}
				tieuDe={m.loi}
			/>
		);
	}
	const du = q.data;
	if (du.viec.length === 0) {
		return (
			<Empty border="solid">
				<EmptyHeader>
					<EmptyTitle>{m.rong}</EmptyTitle>
					<EmptyDescription>{m.rongMoTa}</EmptyDescription>
				</EmptyHeader>
				{du.duAn.dong ? null : (
					<EmptyContent>
						<Button onClick={moGiao} variant="outline">
							{m.giaoViec}
						</Button>
					</EmptyContent>
				)}
			</Empty>
		);
	}
	const viec = du.viec.map((v) => {
		const doi = tam.get(v.id);
		return doi ? { ...v, batDau: doi.batDau, han: doi.han } : v;
	});
	const dangDat = datNgay
		? (du.viec.find((v) => v.id === datNgay) ?? null)
		: null;
	return (
		<>
			<GanttDuAn
				chiDoc={du.duAn.dong}
				className="h-[520px]"
				homNay={homNayVN()}
				lich={du.lich}
				moc={du.moc}
				onDatNgay={setDatNgay}
				onDoiLich={(doi: GanttDuAnDoiLich) =>
					void gui(doi.id, { batDau: doi.batDau, han: doi.han })
				}
				onMoViec={(id) => open({ kind: "viec", id })}
				viec={viec}
			/>
			<HopDatNgay
				key={dangDat?.id ?? "dong"}
				onLuu={async (lich) => {
					if (!dangDat) return null;
					const loi = await gui(dangDat.id, lich);
					if (loi === null) setDatNgay(null);
					return loi;
				}}
				onOpenChange={(mo) => {
					if (!mo) setDatNgay(null);
				}}
				viec={dangDat}
			/>
		</>
	);
}
