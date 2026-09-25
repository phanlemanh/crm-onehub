"use client";

import { Button } from "@crm/ui/components/button";
import { DatePicker } from "@crm/ui/components/date-picker";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
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
import { parseMoChuKy, THAM_SO_MO_CHU_KY } from "./okr-settings-search-params";

const FORM = "okr-mo-chu-ky";
const THU = [1, 2, 3, 4, 5, 6, 7] as const;

const ngayHoacNull = (v: string) => (v === "" ? null : v);

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
	const [ten, setTen] = useState("");
	const [namCha, setNamCha] = useState<string | null>(null);
	const [batDau, setBatDau] = useState<string | null>(null);
	const [ketThuc, setKetThuc] = useState<string | null>(null);
	const [nghiTu, setNghiTu] = useState<string | null>(null);
	const [nghiDen, setNghiDen] = useState<string | null>(null);
	const [thu, setThu] = useState(1);

	const vao = {
		kind: loai,
		name: ten,
		parentId: loai === "quy" ? namCha : null,
		startsOn: batDau ?? "",
		endsOn: ketThuc ?? "",
		breakStartsOn: nghiTu,
		breakEndsOn: nghiDen,
		updateWeekday: thu,
	};
	const hopLe =
		chuKyInput.safeParse(vao).success && (loai === "nam" || namCha !== null);

	const datLai = () => {
		setLoai("nam");
		setTen("");
		setNamCha(null);
		setBatDau(null);
		setKetThuc(null);
		setNghiTu(null);
		setNghiDen(null);
		setThu(1);
	};

	const tao = useMutation(
		trpc.okr.createCycle.mutationOptions({
			onSuccess: async () => {
				await cache.okr();
				toast.success(c.daMo(ten.trim()));
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
					<FieldGroup>
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

						<Field>
							<FieldLabel htmlFor={`${ma}-ten`}>{c.ten}</FieldLabel>
							<Input
								id={`${ma}-ten`}
								value={ten}
								maxLength={80}
								autoComplete="off"
								translate="no"
								placeholder={
									loai === "nam"
										? c.tenGoiY.nam(goiY.nam)
										: c.tenGoiY.quy(goiY.quy.so, goiY.quy.nam)
								}
								data-o-ten
								onChange={(event) => setTen(event.target.value)}
							/>
						</Field>

						{loai === "quy" ? (
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
						) : null}

						<div className="grid items-start gap-3 sm:grid-cols-2">
							<Field>
								<FieldLabel htmlFor={`${ma}-dau`}>{c.batDau}</FieldLabel>
								<DatePicker
									id={`${ma}-dau`}
									value={batDau}
									onChange={(v) => setBatDau(ngayHoacNull(v))}
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor={`${ma}-cuoi`}>{c.ketThuc}</FieldLabel>
								<DatePicker
									id={`${ma}-cuoi`}
									value={ketThuc}
									onChange={(v) => setKetThuc(ngayHoacNull(v))}
								/>
							</Field>
						</div>

						<FieldSet>
							<FieldLegend variant="label">{c.nghi}</FieldLegend>
							<FieldDescription>{c.nghiMoTa}</FieldDescription>
							<div className="grid items-start gap-3 sm:grid-cols-2">
								<Field>
									<FieldLabel htmlFor={`${ma}-nghi-tu`}>{c.nghiTu}</FieldLabel>
									<DatePicker
										id={`${ma}-nghi-tu`}
										value={nghiTu}
										onChange={(v) => setNghiTu(ngayHoacNull(v))}
									/>
								</Field>
								<Field>
									<FieldLabel htmlFor={`${ma}-nghi-den`}>
										{c.nghiDen}
									</FieldLabel>
									<DatePicker
										id={`${ma}-nghi-den`}
										value={nghiDen}
										onChange={(v) => setNghiDen(ngayHoacNull(v))}
									/>
								</Field>
							</div>
							{nghiTu !== null || nghiDen !== null ? (
								<div>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => {
											setNghiTu(null);
											setNghiDen(null);
										}}
									>
										{c.boNghi}
									</Button>
								</div>
							) : null}
						</FieldSet>

						<Field>
							<FieldLabel htmlFor={`${ma}-thu`}>{c.ngayCapNhat}</FieldLabel>
							<Select
								value={String(thu)}
								onValueChange={(v) => {
									const moi = THU.find((t) => String(t) === v);
									if (moi) setThu(moi);
								}}
							>
								<SelectTrigger id={`${ma}-thu`} className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{THU.map((t) => (
										<SelectItem key={t} value={String(t)}>
											{c.thu[t - 1]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
					</FieldGroup>
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
