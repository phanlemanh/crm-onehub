"use client";

import Add from "@carbon/icons-react/es/Add";
import { DatePicker } from "@crm/ui/components/date-picker";
import { Field, FieldLabel } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import { Link as TextLink } from "@crm/ui/components/link";
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
import Link from "next/link";
import { useId, useState } from "react";
import { toast } from "sonner";
import { CompanyPicker } from "@/components/crm/company-picker";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { KhungTao } from "@/components/onboarding/khung-tao";
import { PageShellNote } from "@/components/page-shell-note";
import { onboardingMessages } from "@/lib/messages/onboarding";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

export type CongTyCoDinh = { id: string; name: string };

export const ID_KHOA_KE_HOACH = "onboarding-khoa-ke-hoach";

export function DongKhoaKeHoach() {
	const m = onboardingMessages(useLocale());
	const trpc = useTRPC();
	const url = useWorkspaceUrl();
	const dsKhuon = useQuery(trpc.onboarding.listTemplates.queryOptions());
	if (dsKhuon.data?.length !== 0) return null;
	return (
		<PageShellNote data-ly-do-khoa="" id={ID_KHOA_KE_HOACH}>
			{m.tao.keHoach.khoaLyDo}{" "}
			<TextLink asChild>
				<Link href={url("/settings/onboarding")}>
					{m.empty.noTemplate.action}
				</Link>
			</TextLink>
		</PageShellNote>
	);
}

export function DanhMucHanhDong() {
	const m = onboardingMessages(useLocale());
	return <TaoKeHoach nhanNut={m.tao.keHoach.toolbar} dauTrang />;
}

export function TaoKeHoach({
	nhanNut,
	bienThe,
	dauTrang = false,
	congTyCoDinh,
	mo,
	doiMo,
}: {
	nhanNut?: string;
	bienThe?: "default" | "outline";
	dauTrang?: boolean;
	congTyCoDinh?: CongTyCoDinh;
	mo?: boolean;
	doiMo?: (mo: boolean) => void;
}) {
	const m = onboardingMessages(useLocale());
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const maCongTy = useId();
	const maNgay = useId();

	const [moTrong, setMoTrong] = useState(false);
	const dangMo = mo ?? moTrong;
	const setDangMo = doiMo ?? setMoTrong;
	const [congTy, setCongTy] = useState(congTyCoDinh?.id ?? "");
	const [khuon, setKhuon] = useState("");
	const [ngay, setNgay] = useState(() => toDay(new Date()));
	const [nguoi, setNguoi] = useState("");
	const [loi, setLoi] = useState<string | null>(null);

	const openRecord = useOpenRecord();
	const dsKhuon = useQuery({
		...trpc.onboarding.listTemplates.queryOptions(),
		enabled: dangMo || dauTrang,
	});
	const dsNguoi = useQuery({
		...trpc.onboarding.nguoiNhanViec.queryOptions(),
		enabled: dangMo,
	});
	const toi = useQuery({ ...trpc.users.me.queryOptions(), enabled: dangMo });
	const nguoiCam = nguoi || toi.data?.id || "";

	const tao = useMutation(trpc.onboarding.createFromTemplate.mutationOptions());

	return (
		<KhungTao
			nhanNut={nhanNut}
			bienThe={dauTrang ? "default" : bienThe}
			bieuTuong={
				dauTrang ? <Icon icon={Add} data-icon="inline-start" /> : undefined
			}
			khoaNut={dauTrang && dsKhuon.data?.length === 0}
			moTaKhoa={dauTrang ? ID_KHOA_KE_HOACH : undefined}
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
						onSuccess: async (keHoach) => {
							await Promise.all([
								queryClient.invalidateQueries({
									queryKey: trpc.onboarding.manDanhMuc.queryKey(),
								}),
								queryClient.invalidateQueries({
									queryKey: trpc.onboarding.bangCot.queryKey(),
								}),
								queryClient.invalidateQueries({
									queryKey: trpc.onboarding.plansOfCompany.queryKey(),
								}),
								queryClient.invalidateQueries({
									queryKey: trpc.companies.byId.queryKey(),
								}),
							]);
							setCongTy(congTyCoDinh?.id ?? "");
							setKhuon("");
							setNgay(toDay(new Date()));
							setNguoi("");
							setDangMo(false);
							toast.success(m.tao.keHoach.created);
							openRecord({ kind: "plan", id: keHoach.id });
						},
						onError: (error) => setLoi(error.message),
					},
				);
			}}
		>
			<Field>
				<FieldLabel htmlFor={maCongTy}>{m.tao.keHoach.company}</FieldLabel>
				{congTyCoDinh ? (
					<Input
						id={maCongTy}
						value={congTyCoDinh.name}
						readOnly
						disabled
						translate="no"
					/>
				) : (
					<CompanyPicker
						id={maCongTy}
						value={congTy}
						onValueChange={setCongTy}
					/>
				)}
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
