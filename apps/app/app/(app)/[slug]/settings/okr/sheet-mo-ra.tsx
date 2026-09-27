"use client";

import { Button } from "@crm/ui/components/button";
import { DatePicker } from "@crm/ui/components/date-picker";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import { Spinner } from "@crm/ui/components/spinner";
import { formatDay } from "@crm/ui/lib/format";
import { moRaInput } from "@crm/validation/okr-khep";
import { useMutation } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useId, useState } from "react";
import { toast } from "sonner";
import type { ChuKy } from "@/app/(app)/[slug]/okr/kieu";
import { okrKhepMessages } from "@/lib/messages/okr-khep";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { parseMoRa, THAM_SO_MO_RA } from "./okr-settings-search-params";

const FORM = "okr-mo-ra";

const ngayHoacNull = (v: string) => (v === "" ? null : v);

function trongKy(ky: ChuKy, homNay: string): string {
	if (homNay < ky.startsOn) return ky.startsOn;
	if (homNay > ky.endsOn) return ky.endsOn;
	return homNay;
}

export function SheetMoRa({
	canManage,
	cycles,
	homNay,
}: {
	canManage: boolean;
	cycles: ChuKy[];
	homNay: string;
}) {
	const [mo, setMo] = useQueryState(THAM_SO_MO_RA, parseMoRa);
	const ky = cycles.find((c) => c.id === mo && c.phase === "dang-chay") ?? null;
	const [dangGui, setDangGui] = useState(false);

	return (
		<Sheet
			open={ky !== null && canManage}
			onOpenChange={(next) => {
				if (!next && !dangGui) void setMo(null);
			}}
		>
			<SheetContent side="right" data-sheet-mo-ra={ky?.id ?? ""}>
				{ky ? (
					<NoiDungMoRa
						key={ky.id}
						ky={ky}
						homNay={homNay}
						onDangGui={setDangGui}
						onXong={() => void setMo(null)}
					/>
				) : null}
			</SheetContent>
		</Sheet>
	);
}

function NoiDungMoRa({
	ky,
	homNay,
	onDangGui,
	onXong,
}: {
	ky: ChuKy;
	homNay: string;
	onDangGui: (dang: boolean) => void;
	onXong: () => void;
}) {
	const locale = useLocale();
	const c = okrKhepMessages(locale).caiDat.ra;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const ma = useId();
	const [tu, setTu] = useState<string | null>(trongKy(ky, homNay));
	const [den, setDen] = useState<string | null>(null);

	const dau = formatDay(ky.startsOn, locale);
	const cuoi = formatDay(ky.endsOn, locale);
	const saiThuTu = tu !== null && den !== null && tu > den;
	const ngoaiKy =
		(tu !== null && (tu < ky.startsOn || tu > ky.endsOn)) ||
		(den !== null && (den < ky.startsOn || den > ky.endsOn));
	const vao = { cycleId: ky.id, tuNgay: tu ?? "", denNgay: den ?? "" };
	const hopLe = !saiThuTu && !ngoaiKy && moRaInput.safeParse(vao).success;

	const gui = useMutation(
		trpc.okr.moRa.mutationOptions({
			onMutate: () => onDangGui(true),
			onSettled: () => onDangGui(false),
			onSuccess: async () => {
				await cache.okr();
				toast.success(c.daMo(ky.name));
				onXong();
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	return (
		<>
			<SheetHeader>
				<SheetTitle>{c.tieuDe(ky.name)}</SheetTitle>
				<SheetDescription>{c.moTa}</SheetDescription>
			</SheetHeader>

			<form
				id={FORM}
				className="flex-1 overflow-y-auto px-4"
				onSubmit={(event) => {
					event.preventDefault();
					const kq = moRaInput.safeParse(vao);
					if (kq.success && hopLe && !gui.isPending) gui.mutate(kq.data);
				}}
			>
				<FieldGroup>
					<Field data-invalid={ngoaiKy || undefined}>
						<FieldLabel htmlFor={`${ma}-tu`}>{c.tu}</FieldLabel>
						<DatePicker
							id={`${ma}-tu`}
							value={tu}
							onChange={(v) => setTu(ngayHoacNull(v))}
						/>
					</Field>
					<Field data-invalid={saiThuTu || ngoaiKy || undefined}>
						<FieldLabel htmlFor={`${ma}-den`}>{c.den}</FieldLabel>
						<DatePicker
							id={`${ma}-den`}
							value={den}
							onChange={(v) => setDen(ngayHoacNull(v))}
						/>
						{saiThuTu ? (
							<FieldError data-loi-ra="thu-tu">{c.loiThuTu}</FieldError>
						) : ngoaiKy ? (
							<FieldError data-loi-ra="ngoai-ky">
								{c.loiNgoaiKy(dau, cuoi)}
							</FieldError>
						) : (
							<FieldDescription>{c.moTaNgay(dau, cuoi)}</FieldDescription>
						)}
					</Field>
				</FieldGroup>
			</form>

			<SheetFooter>
				<SheetClose asChild>
					<Button variant="outline" disabled={gui.isPending}>
						{c.huy}
					</Button>
				</SheetClose>
				<Button
					type="submit"
					form={FORM}
					disabled={!hopLe || gui.isPending}
					data-nut="gui-mo-ra"
				>
					{gui.isPending ? <Spinner data-icon="inline-start" /> : null}
					{c.gui}
				</Button>
			</SheetFooter>
		</>
	);
}
