"use client";

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
	FieldLabel,
} from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { Spinner } from "@crm/ui/components/spinner";
import { useMutation } from "@tanstack/react-query";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useId, useState } from "react";
import { toast } from "sonner";
import type { GiaiDoanHien, LoaiGiaiDoanHien } from "@/lib/giai-doan";
import { settingsMessages } from "@/lib/messages/settings";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

const NHAN_TOI_DA = 40;

const thamSo = {
	[SEARCH_PARAM.giaiDoan.them]: parseAsStringLiteral([
		"OPEN",
		"WON",
		"LOST",
	] as const),
	[SEARCH_PARAM.giaiDoan.doiTen]: parseAsString,
	[SEARCH_PARAM.giaiDoan.xoa]: parseAsString,
};

export function useHopThoaiGiaiDoan() {
	const [gia, dat] = useQueryStates(thamSo);
	const dong = () =>
		void dat({
			[SEARCH_PARAM.giaiDoan.them]: null,
			[SEARCH_PARAM.giaiDoan.doiTen]: null,
			[SEARCH_PARAM.giaiDoan.xoa]: null,
		});
	return {
		them: gia[SEARCH_PARAM.giaiDoan.them],
		doiTen: gia[SEARCH_PARAM.giaiDoan.doiTen],
		xoa: gia[SEARCH_PARAM.giaiDoan.xoa],
		moThem: (kind: LoaiGiaiDoanHien) =>
			void dat({ [SEARCH_PARAM.giaiDoan.them]: kind }),
		moDoiTen: (id: string) => void dat({ [SEARCH_PARAM.giaiDoan.doiTen]: id }),
		moXoa: (id: string) => void dat({ [SEARCH_PARAM.giaiDoan.xoa]: id }),
		dong,
	};
}

type Hop = ReturnType<typeof useHopThoaiGiaiDoan>;

function HopThoaiTen({
	kind,
	giaiDoan,
	dong,
}: {
	kind: LoaiGiaiDoanHien | null;
	giaiDoan: GiaiDoanHien | null;
	dong: () => void;
}) {
	const t = settingsMessages(useLocale()).giaiDoan;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const oNhap = useId();
	const [nhan, setNhan] = useState(giaiDoan?.label ?? "");
	const [loi, setLoi] = useState<string | null>(null);
	const xong = (thongBao: string) => async () => {
		await cache.giaiDoan();
		toast.success(thongBao);
		dong();
	};
	const onError = (error: { message: string }) => setLoi(error.message);
	const them = useMutation(
		trpc.giaiDoan.create.mutationOptions({
			onSuccess: xong(t.daThem),
			onError,
		}),
	);
	const doiTen = useMutation(
		trpc.giaiDoan.rename.mutationOptions({
			onSuccess: xong(t.daDoiTen),
			onError,
		}),
	);
	const dangLuu = them.isPending || doiTen.isPending;
	const gon = nhan.trim();
	const hopLe =
		gon.length > 0 && gon.length <= NHAN_TOI_DA && gon !== giaiDoan?.label;

	return (
		<Dialog open onOpenChange={(mo) => !mo && dong()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{giaiDoan ? t.doiTenTieuDe : t.themTieuDe}</DialogTitle>
					<DialogDescription>
						{giaiDoan
							? t.doiTenMoTa
							: t.themMoTa.replace(
									"{nhom}",
									kind
										? { OPEN: t.mo, WON: t.chot, LOST: t.khongThanh }[kind]
										: "",
								)}
					</DialogDescription>
				</DialogHeader>
				<form
					id="giai-doan-ten"
					className="px-4"
					onSubmit={(event) => {
						event.preventDefault();
						if (!hopLe) return;
						setLoi(null);
						if (giaiDoan) doiTen.mutate({ id: giaiDoan.id, label: gon });
						else if (kind) them.mutate({ label: gon, kind });
					}}
				>
					<Field data-invalid={loi ? true : undefined}>
						<FieldLabel htmlFor={oNhap}>{t.ten}</FieldLabel>
						<Input
							id={oNhap}
							value={nhan}
							maxLength={NHAN_TOI_DA}
							aria-invalid={loi ? true : undefined}
							onChange={(event) => setNhan(event.target.value)}
						/>
						{loi ? (
							<FieldError>{loi}</FieldError>
						) : (
							<FieldDescription>{t.tenGoiY}</FieldDescription>
						)}
					</Field>
				</form>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">{t.huy}</Button>
					</DialogClose>
					<Button
						type="submit"
						form="giai-doan-ten"
						disabled={!hopLe || dangLuu}
					>
						{dangLuu ? <Spinner /> : null}
						{t.luu}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function HopThoaiXoa({
	giaiDoan,
	stages,
	dong,
}: {
	giaiDoan: GiaiDoanHien;
	stages: GiaiDoanHien[];
	dong: () => void;
}) {
	const t = settingsMessages(useLocale()).giaiDoan;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const oChon = useId();
	const [dich, setDich] = useState("");
	const xoa = useMutation(
		trpc.giaiDoan.archive.mutationOptions({
			onSuccess: async () => {
				await Promise.all([cache.giaiDoan(), cache.deal()]);
				toast.success(t.daLuuTruTen.replace("{ten}", giaiDoan.label));
				dong();
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const cungLoai = stages.filter(
		(g) => g.kind === giaiDoan.kind && g.id !== giaiDoan.id,
	);

	return (
		<Dialog open onOpenChange={(mo) => !mo && dong()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{t.luuTruTieuDe.replace("{ten}", giaiDoan.label)}
					</DialogTitle>
					<DialogDescription>
						{t.conThoaThuanLuuTru.replace("{so}", String(giaiDoan.dealCount))}
					</DialogDescription>
				</DialogHeader>
				<Field className="px-4">
					<FieldLabel htmlFor={oChon}>{t.chuyenSang}</FieldLabel>
					<Select value={dich} onValueChange={setDich}>
						<SelectTrigger id={oChon} className="w-full">
							<SelectValue placeholder={t.chonGiaiDoan} />
						</SelectTrigger>
						<SelectContent>
							{cungLoai.map((g) => (
								<SelectItem key={g.id} value={g.id}>
									<span translate="no">{g.label}</span>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<FieldDescription>{t.lichSu}</FieldDescription>
				</Field>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">{t.huy}</Button>
					</DialogClose>
					<Button
						disabled={dich === "" || xoa.isPending}
						onClick={() => xoa.mutate({ id: giaiDoan.id, moveTo: dich })}
					>
						{xoa.isPending ? <Spinner /> : null}
						{t.chuyenVaLuuTru}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function HopThoaiGiaiDoan({
	hop,
	stages,
}: {
	hop: Hop;
	stages: GiaiDoanHien[];
}) {
	const theoId = new Map(stages.map((g) => [g.id, g]));
	if (hop.them) {
		return <HopThoaiTen kind={hop.them} giaiDoan={null} dong={hop.dong} />;
	}
	const doiTen = hop.doiTen ? theoId.get(hop.doiTen) : undefined;
	if (doiTen) {
		return (
			<HopThoaiTen
				key={doiTen.id}
				kind={null}
				giaiDoan={doiTen}
				dong={hop.dong}
			/>
		);
	}
	const xoa = hop.xoa ? theoId.get(hop.xoa) : undefined;
	if (xoa && xoa.dealCount > 0) {
		return (
			<HopThoaiXoa
				key={xoa.id}
				giaiDoan={xoa}
				stages={stages}
				dong={hop.dong}
			/>
		);
	}
	return null;
}
