"use client";

import { Button } from "@crm/ui/components/button";
import { Field, FieldLabel } from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
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
import { type SuaChuKyInput, suaChuKyInput } from "@crm/validation/okr-chu-ky";
import { useMutation } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useId, useState } from "react";
import { toast } from "sonner";
import { ChuNguoi, ghep } from "@/app/(app)/[slug]/okr/hoi-y/chu";
import type { ChuKy } from "@/app/(app)/[slug]/okr/kieu";
import { okrMessages } from "@/lib/messages/okr";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { type GiaChuKy, OChuKy } from "./o-chu-ky";
import {
	parseSuaChuKy,
	THAM_SO_SUA_CHU_KY,
} from "./okr-settings-search-params";

const FORM = "okr-sua-chu-ky";

const suaDuoc = (ky: ChuKy) => ky.viec.suaMoiO || ky.viec.suaTen;

export function SheetSuaChuKy({
	canManage,
	cycles,
}: {
	canManage: boolean;
	cycles: ChuKy[];
}) {
	const [id, setId] = useQueryState(THAM_SO_SUA_CHU_KY, parseSuaChuKy);
	const ky = cycles.find((c) => c.id === id && suaDuoc(c));
	const [cuoi, setCuoi] = useState<ChuKy | null>(null);
	if (ky && ky !== cuoi) setCuoi(ky);
	const hien = ky ?? cuoi;
	if (!hien) return null;

	return (
		<KhungSua
			ky={hien}
			mo={ky !== undefined && canManage}
			namCha={cycles.find((c) => c.id === hien.parentId)?.name ?? null}
			dong={() => void setId(null)}
		/>
	);
}

function KhungSua({
	ky,
	mo,
	namCha,
	dong,
}: {
	ky: ChuKy;
	mo: boolean;
	namCha: string | null;
	dong: () => void;
}) {
	const trpc = useTRPC();
	const cache = useCrmCache();
	const s = okrMessages(useLocale()).caiDat.sua;

	const sua = useMutation(
		trpc.okr.suaChuKy.mutationOptions({
			onSuccess: async (_kq, vao) => {
				await cache.okr();
				toast.success(
					ghep(s.xong("{ky}"), { ky: <ChuNguoi>{vao.name}</ChuNguoi> }),
				);
				dong();
			},
			onError: async (error) => {
				toast.error(error.message);
				await cache.okr();
			},
		}),
	);

	return (
		<Sheet
			open={mo}
			onOpenChange={(next) => {
				if (!next && !sua.isPending) dong();
			}}
		>
			<SheetContent side="right" data-sheet-sua-chu-ky={ky.id}>
				<FormSua
					key={ky.id}
					ky={ky}
					namCha={namCha}
					dangLuu={sua.isPending}
					luu={(vao) => sua.mutate(vao)}
				/>
			</SheetContent>
		</Sheet>
	);
}

function FormSua({
	ky,
	namCha,
	dangLuu,
	luu,
}: {
	ky: ChuKy;
	namCha: string | null;
	dangLuu: boolean;
	luu: (vao: SuaChuKyInput) => void;
}) {
	const m = okrMessages(useLocale());
	const c = m.caiDat.mo;
	const s = m.caiDat.sua;
	const ma = useId();
	const daLuu: GiaChuKy = {
		ten: ky.name,
		batDau: ky.startsOn,
		ketThuc: ky.endsOn,
		nghiTu: ky.breakStartsOn,
		nghiDen: ky.breakEndsOn,
		thu: ky.updateWeekday,
	};
	const [nhap, setNhap] = useState<GiaChuKy>(daLuu);
	const khoa = !ky.viec.suaMoiO;
	const gia = khoa ? { ...daLuu, ten: nhap.ten } : nhap;
	const tenKy = { ky: <ChuNguoi>{ky.name}</ChuNguoi> };
	const moTa = ghep(
		(!khoa ? s.moTaMoiO : ky.viec.go ? s.moTaRoiKeHoach : s.moTaCoDuLieu)(
			"{ky}",
		),
		tenKy,
	);
	const lyDoKhoa = !khoa
		? undefined
		: ky.viec.go
			? s.khoaRoiKeHoach
			: s.khoaCoDuLieu;

	const kq = suaChuKyInput.safeParse({
		id: ky.id,
		name: gia.ten,
		startsOn: gia.batDau ?? "",
		endsOn: gia.ketThuc ?? "",
		breakStartsOn: gia.nghiTu,
		breakEndsOn: gia.nghiDen,
		updateWeekday: gia.thu,
	});
	const daDoi =
		gia.ten.trim() !== ky.name ||
		gia.batDau !== ky.startsOn ||
		gia.ketThuc !== ky.endsOn ||
		gia.nghiTu !== ky.breakStartsOn ||
		gia.nghiDen !== ky.breakEndsOn ||
		gia.thu !== ky.updateWeekday;
	const guiDuoc = kq.success && daDoi && !dangLuu;

	return (
		<>
			<SheetHeader>
				<SheetTitle>{ghep(s.tieuDe("{ky}"), tenKy)}</SheetTitle>
				<SheetDescription>{moTa}</SheetDescription>
			</SheetHeader>

			<form
				id={FORM}
				className="flex-1 overflow-y-auto px-4"
				data-cuon-hop
				onSubmit={(event) => {
					event.preventDefault();
					if (kq.success && guiDuoc) luu(kq.data);
				}}
			>
				<OChuKy
					ma={ma}
					gia={gia}
					doi={(moi) => setNhap((cu) => ({ ...cu, ...moi }))}
					khoaNgoaiTen={khoa}
					moTaKhoa={lyDoKhoa}
					truocTen={
						<>
							<Field>
								<FieldLabel htmlFor={`${ma}-loai`}>{c.loai}</FieldLabel>
								<Input
									id={`${ma}-loai`}
									value={m.loaiChuKy[ky.kind]}
									disabled
									readOnly
								/>
							</Field>
							{namCha !== null ? (
								<Field>
									<FieldLabel htmlFor={`${ma}-nam`}>{c.namCha}</FieldLabel>
									<Input
										id={`${ma}-nam`}
										value={namCha}
										translate="no"
										disabled
										readOnly
									/>
								</Field>
							) : null}
						</>
					}
				/>
			</form>

			<SheetFooter>
				<SheetClose asChild>
					<Button variant="outline" disabled={dangLuu}>
						{c.huy}
					</Button>
				</SheetClose>
				<Button
					type="submit"
					form={FORM}
					disabled={!guiDuoc}
					data-nut="luu-chu-ky"
				>
					{dangLuu ? <Spinner data-icon="inline-start" /> : null}
					{s.luu}
				</Button>
			</SheetFooter>
		</>
	);
}
