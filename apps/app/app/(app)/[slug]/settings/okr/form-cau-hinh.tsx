"use client";

import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldGroup,
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
import { Switch } from "@crm/ui/components/switch";
import {
	CHE_DO_TRAN,
	type OkrProgram,
	okrProgram,
	THANG_CHAM,
} from "@crm/validation/okr-chuong-trinh";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { okrMessages } from "@/lib/messages/okr";
import { okrTaiCoCauMessages } from "@/lib/messages/okr-tai-co-cau";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { DangTaiThe, LoiThe, useQuyenChuongTrinh } from "./trang-thai-cai-dat";

const FORM = "okr-program";

const luatChung = okrProgram.pick({
	objectiveCap: true,
	krCap: true,
	capMode: true,
	scoreScale: true,
	weightsOn: true,
	personalOn: true,
	duyetCongBo: true,
});

type LuatChung = Pick<
	OkrProgram,
	| "objectiveCap"
	| "krCap"
	| "capMode"
	| "scoreScale"
	| "weightsOn"
	| "personalOn"
	| "duyetCongBo"
>;

type Nhap = Omit<LuatChung, "objectiveCap" | "krCap"> & {
	objectiveCap: string;
	krCap: string;
};

const soNguyen = (chu: string) =>
	/^\d+$/.test(chu.trim()) ? Number(chu.trim()) : Number.NaN;

const tranHong = (chu: string) =>
	!okrProgram.shape.objectiveCap.safeParse(soNguyen(chu)).success;

const nhapTu = (ct: LuatChung): Nhap => ({
	capMode: ct.capMode,
	scoreScale: ct.scoreScale,
	weightsOn: ct.weightsOn,
	personalOn: ct.personalOn,
	duyetCongBo: ct.duyetCongBo,
	objectiveCap: String(ct.objectiveCap),
	krCap: String(ct.krCap),
});

export function FormCauHinh() {
	const locale = useLocale();
	const c = okrMessages(locale).caiDat.cauHinh;
	const d = okrTaiCoCauMessages(locale).chuongTrinh;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const ma = useId();
	const program = useQuery(trpc.okr.program.queryOptions());
	const { canManage, lyDo } = useQuyenChuongTrinh();
	const [nhap, setNhap] = useState<Nhap | null>(null);

	useEffect(() => {
		if (program.data) setNhap(nhapTu(program.data));
	}, [program.data]);

	const luu = useMutation(
		trpc.okr.setProgram.mutationOptions({
			onSuccess: async () => {
				await cache.okr();
				toast.success(c.daLuu);
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const ketQua = nhap
		? luatChung.safeParse({
				...nhap,
				objectiveCap: soNguyen(nhap.objectiveCap),
				krCap: soNguyen(nhap.krCap),
			})
		: null;
	const daLuu = program.data;
	const daSua =
		nhap !== null &&
		daLuu !== undefined &&
		(nhap.objectiveCap.trim() !== String(daLuu.objectiveCap) ||
			nhap.krCap.trim() !== String(daLuu.krCap) ||
			nhap.capMode !== daLuu.capMode ||
			nhap.scoreScale !== daLuu.scoreScale ||
			nhap.weightsOn !== daLuu.weightsOn ||
			nhap.personalOn !== daLuu.personalOn ||
			nhap.duyetCongBo !== daLuu.duyetCongBo);
	const hopLe = ketQua?.success === true;
	const khoa = !canManage || luu.isPending;
	const moTaTran = lyDo ? `${lyDo} ${ma}-tran-mo-ta` : `${ma}-tran-mo-ta`;
	const sua = (thay: Partial<Nhap>) =>
		setNhap((cu) => (cu ? { ...cu, ...thay } : cu));

	return (
		<Card data-the="cau-hinh">
			<CardHeader>
				<CardTitle>{c.tieuDe}</CardTitle>
				<CardDescription>{c.moTa}</CardDescription>
				<CardAction>
					<Button
						type="submit"
						form={FORM}
						aria-describedby={lyDo}
						disabled={!canManage || luu.isPending || !daSua || !hopLe}
						data-nut="luu-cau-hinh"
					>
						{luu.isPending ? <Spinner data-icon="inline-start" /> : null}
						{c.luu}
					</Button>
				</CardAction>
			</CardHeader>

			{program.isError ? (
				<LoiThe thuLai={() => void program.refetch()} />
			) : !nhap ? (
				<DangTaiThe />
			) : (
				<CardContent>
					<form
						id={FORM}
						onSubmit={(event) => {
							event.preventDefault();
							if (ketQua?.success && canManage) luu.mutate(ketQua.data);
						}}
					>
						<FieldGroup>
							<div className="grid items-start gap-3 sm:grid-cols-2">
								<Field data-invalid={tranHong(nhap.objectiveCap)}>
									<FieldLabel htmlFor={`${ma}-tran-muc-tieu`}>
										{c.tranMucTieu}
									</FieldLabel>
									<Input
										id={`${ma}-tran-muc-tieu`}
										inputMode="numeric"
										autoComplete="off"
										value={nhap.objectiveCap}
										disabled={khoa}
										aria-invalid={tranHong(nhap.objectiveCap)}
										aria-describedby={moTaTran}
										data-o-tran-muc-tieu
										onChange={(event) =>
											sua({ objectiveCap: event.target.value })
										}
									/>
								</Field>
								<Field data-invalid={tranHong(nhap.krCap)}>
									<FieldLabel htmlFor={`${ma}-tran-kr`}>{c.tranKr}</FieldLabel>
									<Input
										id={`${ma}-tran-kr`}
										inputMode="numeric"
										autoComplete="off"
										value={nhap.krCap}
										disabled={khoa}
										aria-invalid={tranHong(nhap.krCap)}
										aria-describedby={moTaTran}
										data-o-tran-kr
										onChange={(event) => sua({ krCap: event.target.value })}
									/>
								</Field>
							</div>
							<FieldDescription id={`${ma}-tran-mo-ta`}>
								{c.tranMoTa}
							</FieldDescription>

							<div className="grid items-start gap-3 sm:grid-cols-2">
								<Field>
									<FieldLabel htmlFor={`${ma}-che-do`}>{c.cheDo}</FieldLabel>
									<Select
										value={nhap.capMode}
										disabled={khoa}
										onValueChange={(v) => {
											const moi = CHE_DO_TRAN.find((k) => k === v);
											if (moi) sua({ capMode: moi });
										}}
									>
										<SelectTrigger
											id={`${ma}-che-do`}
											className="w-full"
											aria-describedby={lyDo}
										>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{CHE_DO_TRAN.map((k) => (
												<SelectItem key={k} value={k}>
													{c.cheDoChon[k]}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
								<Field>
									<FieldLabel htmlFor={`${ma}-thang`}>{c.thang}</FieldLabel>
									<Select
										value={nhap.scoreScale}
										disabled={khoa}
										onValueChange={(v) => {
											const moi = THANG_CHAM.find((k) => k === v);
											if (moi) sua({ scoreScale: moi });
										}}
									>
										<SelectTrigger
											id={`${ma}-thang`}
											className="w-full"
											aria-describedby={lyDo}
										>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{THANG_CHAM.map((k) => (
												<SelectItem key={k} value={k}>
													{c.thangChon[k]}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
							</div>

							<Field orientation="horizontal">
								<FieldContent>
									<FieldLabel htmlFor={`${ma}-trong-so`}>
										{c.trongSo}
									</FieldLabel>
									<FieldDescription>{c.trongSoMoTa}</FieldDescription>
								</FieldContent>
								<Switch
									id={`${ma}-trong-so`}
									checked={nhap.weightsOn}
									disabled={khoa}
									aria-describedby={lyDo}
									data-cong-tac="trong-so"
									onCheckedChange={(on) => sua({ weightsOn: on })}
								/>
							</Field>

							<Field orientation="horizontal">
								<FieldContent>
									<FieldLabel htmlFor={`${ma}-ca-nhan`}>{c.caNhan}</FieldLabel>
									<FieldDescription>{c.caNhanMoTa}</FieldDescription>
								</FieldContent>
								<Switch
									id={`${ma}-ca-nhan`}
									checked={nhap.personalOn}
									disabled={khoa}
									aria-describedby={lyDo}
									data-cong-tac="ca-nhan"
									onCheckedChange={(on) => sua({ personalOn: on })}
								/>
							</Field>

							<Field orientation="horizontal">
								<FieldContent>
									<FieldLabel htmlFor={`${ma}-duyet-cong-bo`}>
										{d.duyetCongBo}
									</FieldLabel>
									<FieldDescription>{d.duyetCongBoMoTa}</FieldDescription>
								</FieldContent>
								<Switch
									id={`${ma}-duyet-cong-bo`}
									checked={nhap.duyetCongBo}
									disabled={khoa}
									aria-describedby={lyDo}
									data-cong-tac="duyet-cong-bo"
									onCheckedChange={(on) => sua({ duyetCongBo: on })}
								/>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			)}
		</Card>
	);
}
