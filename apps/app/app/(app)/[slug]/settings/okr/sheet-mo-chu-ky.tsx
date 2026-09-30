"use client";

import { Button } from "@crm/ui/components/button";
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
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
import {
	chuKyInput,
	LOAI_CHU_KY,
	type LoaiChuKy,
} from "@crm/validation/okr-chu-ky";
import { useMutation } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useId, useState } from "react";
import { toast } from "sonner";
import type { ChuKy } from "@/app/(app)/[slug]/okr/kieu";
import { okrMessages } from "@/lib/messages/okr";
import type { GoiYChuKy } from "@/lib/okr-chu-ky-nhan";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { GIA_TRONG, type GiaChuKy, OChuKy } from "./o-chu-ky";
import { parseMoChuKy, THAM_SO_MO_CHU_KY } from "./okr-settings-search-params";

const FORM = "okr-mo-chu-ky";

export function SheetMoChuKy({
	canManage,
	cacNam,
	goiY,
}: {
	canManage: boolean;
	cacNam: ChuKy[];
	goiY: GoiYChuKy;
}) {
	const m = okrMessages(useLocale());
	const c = m.caiDat.mo;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const ma = useId();

	const [mo, setMo] = useQueryState(THAM_SO_MO_CHU_KY, parseMoChuKy);
	const [loai, setLoai] = useState<LoaiChuKy>("nam");
	const [namCha, setNamCha] = useState<string | null>(null);
	const [gia, setGia] = useState<GiaChuKy>(GIA_TRONG);

	const vao = {
		kind: loai,
		name: gia.ten,
		parentId: loai === "quy" ? namCha : null,
		startsOn: gia.batDau ?? "",
		endsOn: gia.ketThuc ?? "",
		breakStartsOn: gia.nghiTu,
		breakEndsOn: gia.nghiDen,
		updateWeekday: gia.thu,
	};
	const hopLe =
		chuKyInput.safeParse(vao).success && (loai === "nam" || namCha !== null);

	const datLai = () => {
		setLoai("nam");
		setNamCha(null);
		setGia(GIA_TRONG);
	};

	const tao = useMutation(
		trpc.okr.createCycle.mutationOptions({
			onSuccess: async () => {
				await cache.okr();
				toast.success(c.daMo(gia.ten.trim()));
				datLai();
				await setMo(null);
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	return (
		<Sheet
			open={mo && canManage}
			onOpenChange={(next) => {
				if (!tao.isPending) void setMo(next || null);
			}}
		>
			<SheetContent side="right" data-sheet-mo-chu-ky>
				<SheetHeader>
					<SheetTitle>{c.tieuDe}</SheetTitle>
					<SheetDescription>{c.moTa}</SheetDescription>
				</SheetHeader>

				<form
					id={FORM}
					className="flex-1 overflow-y-auto px-4"
					data-cuon-hop
					onSubmit={(event) => {
						event.preventDefault();
						const kq = chuKyInput.safeParse(vao);
						if (kq.success && hopLe) tao.mutate(kq.data);
					}}
				>
					<OChuKy
						ma={ma}
						gia={gia}
						doi={(sua) => setGia((cu) => ({ ...cu, ...sua }))}
						khoaNgoaiTen={false}
						goiYTen={
							loai === "nam"
								? c.tenGoiY.nam(goiY.nam)
								: c.tenGoiY.quy(goiY.quy.so, goiY.quy.nam)
						}
						truocTen={
							<Field>
								<FieldLabel htmlFor={`${ma}-loai`}>{c.loai}</FieldLabel>
								<Select
									value={loai}
									onValueChange={(v) => {
										const moi = LOAI_CHU_KY.find((k) => k === v);
										if (moi) setLoai(moi);
									}}
								>
									<SelectTrigger id={`${ma}-loai`} className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{LOAI_CHU_KY.map((k) => (
											<SelectItem key={k} value={k}>
												{m.loaiChuKy[k]}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
						}
						sauTen={
							loai === "quy" ? (
								<Field>
									<FieldLabel htmlFor={`${ma}-nam`}>{c.namCha}</FieldLabel>
									<Select
										value={namCha ?? ""}
										disabled={cacNam.length === 0}
										onValueChange={(v) => setNamCha(v === "" ? null : v)}
									>
										<SelectTrigger
											id={`${ma}-nam`}
											className="w-full"
											aria-describedby={
												cacNam.length === 0 ? `${ma}-nam-mo-ta` : undefined
											}
											data-o-nam-cha
										>
											<SelectValue placeholder={c.chonNam} />
										</SelectTrigger>
										<SelectContent>
											{cacNam.map((n) => (
												<SelectItem key={n.id} value={n.id}>
													<span translate="no">{n.name}</span>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{cacNam.length === 0 ? (
										<FieldDescription id={`${ma}-nam-mo-ta`}>
											{c.chuaCoNam}
										</FieldDescription>
									) : null}
								</Field>
							) : null
						}
					/>
				</form>

				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline" disabled={tao.isPending}>
							{c.huy}
						</Button>
					</SheetClose>
					<Button
						type="submit"
						form={FORM}
						disabled={!hopLe || tao.isPending}
						data-nut="gui-chu-ky"
					>
						{tao.isPending ? <Spinner data-icon="inline-start" /> : null}
						{c.gui}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
