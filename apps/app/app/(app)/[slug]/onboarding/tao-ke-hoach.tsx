"use client";

import Add from "@carbon/icons-react/es/Add";
import { Button } from "@crm/ui/components/button";
import { DatePicker } from "@crm/ui/components/date-picker";
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
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
import { useId, useMemo, useState } from "react";
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
	const [chonPhong, setChonPhong] = useState<Record<string, string>>({});
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
	const dsPhong = useQuery({
		...trpc.onboarding.listDepartments.queryOptions({ archived: false }),
		enabled: dangMo,
	});
	const nguoiCam = nguoi || toi.data?.id || "";

	// Một hàng mỗi phòng ban có trong khuôn, theo thứ tự xuất hiện của bước (design 2026-10-14 mục 3).
	const khuonChon = dsKhuon.data?.find((k) => k.id === khuon);
	const phongCuaKhuon = useMemo(() => {
		const buoc = [...(khuonChon?.steps ?? [])].sort(
			(a, b) => a.position - b.position,
		);
		return [...new Set(buoc.map((b) => b.departmentId))];
	}, [khuonChon]);
	const nhanDuoc = new Set((dsNguoi.data ?? []).map((u) => u.id));
	const tenPhong = new Map((dsPhong.data ?? []).map((p) => [p.id, p]));
	const macDinh = (phongId: string) => {
		const truong = tenPhong.get(phongId)?.headUserId;
		return truong && nhanDuoc.has(truong) ? truong : nguoiCam;
	};
	const nguoiCuaPhong = (phongId: string) =>
		chonPhong[phongId] ?? macDinh(phongId);
	const khuonRong = khuonChon !== undefined && khuonChon.steps.length === 0;

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
			sanSang={
				congTy !== "" &&
				khuon !== "" &&
				!khuonRong &&
				ngay !== "" &&
				nguoiCam !== ""
			}
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
						nguoiTheoPhongBan: phongCuaKhuon.map((departmentId) => ({
							departmentId,
							userId: nguoiCuaPhong(departmentId),
						})),
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
							setChonPhong({});
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
				<Select
					value={khuon}
					onValueChange={(ma) => {
						setKhuon(ma);
						setChonPhong({});
					}}
				>
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
			<KhoiNguoiTheoPhong
				nhan={m.tao.keHoach}
				dangTai={dsKhuon.isPending}
				loiTai={dsKhuon.isError}
				thuLai={() => dsKhuon.refetch()}
				rong={khuonRong}
				phong={phongCuaKhuon.map((id) => ({
					id,
					ten: tenPhong.get(id)?.name ?? "",
					chuaCoTruong: !tenPhong.get(id)?.headUserId,
				}))}
				nguoi={dsNguoi.data ?? []}
				nguoiCuaPhong={nguoiCuaPhong}
				doi={(phongId, userId) =>
					setChonPhong((cu) => ({ ...cu, [phongId]: userId }))
				}
			/>
		</KhungTao>
	);
}

type NhanKhoi = {
	nguoiTheoPhong: string;
	phongChuaCoTruong: string;
	dangTaiKhuon: string;
	loiTaiKhuon: string;
	thuLai: string;
	khuonRong: string;
};

function KhoiNguoiTheoPhong({
	nhan,
	dangTai,
	loiTai,
	thuLai,
	rong,
	phong,
	nguoi,
	nguoiCuaPhong,
	doi,
}: {
	nhan: NhanKhoi;
	dangTai: boolean;
	loiTai: boolean;
	thuLai: () => void;
	rong: boolean;
	phong: { id: string; ten: string; chuaCoTruong: boolean }[];
	nguoi: { id: string; name: string }[];
	nguoiCuaPhong: (phongId: string) => string;
	doi: (phongId: string, userId: string) => void;
}) {
	if (dangTai) {
		return (
			<p className="text-muted-foreground text-sm" data-trang-thai="cho-tai">
				{nhan.dangTaiKhuon}
			</p>
		);
	}
	if (loiTai) {
		return (
			<div className="flex items-center gap-2" data-trang-thai="loi">
				<p className="text-destructive text-sm">{nhan.loiTaiKhuon}</p>
				<Button type="button" variant="outline" size="sm" onClick={thuLai}>
					{nhan.thuLai}
				</Button>
			</div>
		);
	}
	if (rong) {
		return (
			<p className="text-muted-foreground text-sm" data-trang-thai="rong">
				{nhan.khuonRong}
			</p>
		);
	}
	if (phong.length === 0) return null;
	return (
		<Field data-khoi="nguoi-theo-phong">
			<FieldLabel>{nhan.nguoiTheoPhong}</FieldLabel>
			<div className="flex flex-col gap-3">
				{phong.map((p) => (
					<div
						key={p.id}
						className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3"
						data-phong={p.id}
					>
						<span className="text-sm sm:w-40 sm:shrink-0" translate="no">
							{p.ten}
						</span>
						<div className="flex min-w-0 flex-1 flex-col gap-1">
							<Select
								value={nguoiCuaPhong(p.id)}
								onValueChange={(u) => doi(p.id, u)}
							>
								<SelectTrigger aria-label={`${nhan.nguoiTheoPhong} — ${p.ten}`}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{nguoi.map((u) => (
										<SelectItem key={u.id} value={u.id}>
											{u.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{p.chuaCoTruong ? (
								<FieldDescription>{nhan.phongChuaCoTruong}</FieldDescription>
							) : null}
						</div>
					</div>
				))}
			</div>
		</Field>
	);
}
