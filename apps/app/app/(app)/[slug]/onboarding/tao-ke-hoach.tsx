"use client";

import { DatePicker } from "@crm/ui/components/date-picker";
import { Field, FieldLabel } from "@crm/ui/components/field";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { toDay } from "@crm/ui/lib/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import { CompanyPicker } from "@/components/crm/company-picker";
import { KhungTao } from "@/components/onboarding/khung-tao";
import { onboardingMessages } from "@/lib/messages/onboarding";
import { useTRPC } from "@/lib/trpc/client";

export function TaoKeHoach({
	nhanNut,
	bienThe,
}: {
	nhanNut: string;
	bienThe?: "default" | "outline";
}) {
	const m = onboardingMessages(useLocale());
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const maCongTy = useId();
	const maNgay = useId();

	const [dangMo, setDangMo] = useState(false);
	const [congTy, setCongTy] = useState("");
	const [khuon, setKhuon] = useState("");
	const [ngay, setNgay] = useState(() => toDay(new Date()));
	const [nguoi, setNguoi] = useState("");
	const [loi, setLoi] = useState<string | null>(null);

	const dsKhuon = useQuery({
		...trpc.onboarding.listTemplates.queryOptions(),
		enabled: dangMo,
	});
	const dsNguoi = useQuery({
		...trpc.users.list.queryOptions(),
		enabled: dangMo,
	});
	const toi = useQuery({ ...trpc.users.me.queryOptions(), enabled: dangMo });
	const nguoiCam = nguoi || toi.data?.id || "";

	const tao = useMutation(trpc.onboarding.createFromTemplate.mutationOptions());

	return (
		<KhungTao
			nhanNut={nhanNut}
			bienThe={bienThe}
			tieuDe={m.tao.keHoach.title}
			dangMo={dangMo}
			doiMo={setDangMo}
			sanSang={congTy !== "" && khuon !== "" && ngay !== "" && nguoiCam !== ""}
			dangLuu={tao.isPending}
			loi={loi}
			nhanLuu={m.tao.save}
			nhanHuy={m.tao.cancel}
			onLuu={() => {
				setLoi(null);
				tao.mutate(
					{
						companyId: congTy,
						templateId: khuon,
						startedAt: ngay,
						ownerId: nguoiCam,
					},
					{
						onSuccess: async () => {
							await Promise.all([
								queryClient.invalidateQueries({
									queryKey: trpc.onboarding.manDanhMuc.queryKey(),
								}),
								queryClient.invalidateQueries({
									queryKey: trpc.onboarding.bangCot.queryKey(),
								}),
							]);
							setCongTy("");
							setKhuon("");
							setNgay(toDay(new Date()));
							setNguoi("");
							setDangMo(false);
						},
						onError: (error) => setLoi(error.message),
					},
				);
			}}
		>
			<Field>
				<FieldLabel htmlFor={maCongTy}>{m.tao.keHoach.company}</FieldLabel>
				<CompanyPicker id={maCongTy} value={congTy} onValueChange={setCongTy} />
			</Field>
			<Field>
				<FieldLabel>{m.tao.keHoach.template}</FieldLabel>
				<Select value={khuon} onValueChange={setKhuon}>
					<SelectTrigger aria-label={m.tao.keHoach.template}>
						<SelectValue placeholder={m.tao.keHoach.template} />
					</SelectTrigger>
					<SelectContent>
						{(dsKhuon.data ?? []).map((k) => (
							<SelectItem key={k.id} value={k.id}>
								{k.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</Field>
			<Field>
				<FieldLabel htmlFor={maNgay}>{m.tao.keHoach.startedAt}</FieldLabel>
				<DatePicker id={maNgay} value={ngay} onChange={setNgay} />
			</Field>
			<Field>
				<FieldLabel>{m.tao.keHoach.owner}</FieldLabel>
				<Select value={nguoiCam} onValueChange={setNguoi}>
					<SelectTrigger aria-label={m.tao.keHoach.owner}>
						<SelectValue placeholder={m.tao.keHoach.owner} />
					</SelectTrigger>
					<SelectContent>
						{(dsNguoi.data ?? []).map((u) => (
							<SelectItem key={u.id} value={u.id}>
								{u.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</Field>
		</KhungTao>
	);
}
