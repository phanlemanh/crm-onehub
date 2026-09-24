"use client";

import Add from "@carbon/icons-react/es/Add";
import Close from "@carbon/icons-react/es/Close";
import { Alert, AlertDescription } from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { Spinner } from "@crm/ui/components/spinner";
import { useMutation } from "@tanstack/react-query";
import { useId, useRef, useState } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { toChucMessages } from "@/lib/messages/to-chuc";
import { useTRPC } from "@/lib/trpc/client";
import {
	type CayDuLieu,
	KHONG_CHON,
	moiPhongBan,
	type NguoiDuLieu,
	NHOM_CHUA_XEP,
	type PhongBanDuLieu,
} from "./kieu";
import { useLamMoiToChuc } from "./lam-moi";

function ChonPhongBan({
	id,
	cay,
	giaTri,
	boQua,
	nhanTrong,
	onChange,
}: {
	id: string;
	cay: CayDuLieu;
	giaTri: string;
	boQua: string[];
	nhanTrong: string;
	onChange: (v: string) => void;
}) {
	const m = toChucMessages(useLocale());
	const nhom: { id: string; name: string; ds: PhongBanDuLieu[] }[] = [
		...cay.divisions.map((d) => ({
			id: d.id,
			name: d.name,
			ds: d.departments,
		})),
		{ id: NHOM_CHUA_XEP, name: m.chuaXep, ds: cay.chuaXep },
	];
	return (
		<Select value={giaTri} onValueChange={onChange}>
			<SelectTrigger id={id}>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value={KHONG_CHON}>{nhanTrong}</SelectItem>
				{nhom.map((g) => {
					const con = g.ds.filter((d) => !boQua.includes(d.id));
					if (con.length === 0) return null;
					return (
						<SelectGroup key={g.id}>
							<SelectLabel translate="no">{g.name}</SelectLabel>
							{con.map((d) => (
								<SelectItem key={d.id} value={d.id} translate="no">
									{d.name}
								</SelectItem>
							))}
						</SelectGroup>
					);
				})}
			</SelectContent>
		</Select>
	);
}

export function HopThoaiViTri({
	cay,
	nguoi,
	dong,
}: {
	cay: CayDuLieu;
	nguoi: NguoiDuLieu;
	dong: () => void;
}) {
	const m = toChucMessages(useLocale());
	const v = m.viTri;
	const [tieuDeTruoc, tieuDeSau = ""] = v.tieuDe.split("{ten}");
	const trpc = useTRPC();
	const lamMoi = useLamMoiToChuc();
	const maChinh = useId();
	const maPhu = useId();
	const maQuanLy = useId();
	const dangGui = useRef(false);

	const [chinh, setChinh] = useState<string | null>(nguoi.primaryDepartmentId);
	const [phu, setPhu] = useState<string[]>(nguoi.secondaryDepartmentIds);
	const [tay, setTay] = useState<string | null>(nguoi.managerOverrideId);
	const [chonTay, setChonTay] = useState(false);
	const [loi, setLoi] = useState<string | null>(null);

	const luu = useMutation(
		trpc.org.setPlacement.mutationOptions({
			onSuccess: async () => {
				await lamMoi();
				dong();
			},
			onError: (e) => setLoi(e.message),
			onSettled: () => {
				dangGui.current = false;
			},
		}),
	);

	const phongBan = moiPhongBan(cay);
	const tenPb = (id: string) => phongBan.find((d) => d.id === id)?.name ?? id;
	const theoId = new Map(cay.people.map((p) => [p.id, p]));
	const pbChinh = chinh ? phongBan.find((d) => d.id === chinh) : undefined;
	const truongPb =
		pbChinh?.head && pbChinh.head.id !== nguoi.id ? pbChinh.head : undefined;
	const bpChinh = pbChinh?.divisionId
		? cay.divisions.find((d) => d.id === pbChinh.divisionId)
		: undefined;
	const truongBp =
		bpChinh?.head && bpChinh.head.id !== nguoi.id ? bpChinh.head : undefined;
	const quanLy = tay !== null ? theoId.get(tay) : (truongPb ?? truongBp);
	const moTa =
		tay !== null
			? pbChinh?.head
				? dien(v.chonTay, { ten: pbChinh.head.name })
				: v.chonTayKhongTruong
			: truongPb
				? v.theoTruongPb
				: truongBp
					? v.theoTruongBp
					: v.khongCo;

	const gui = () => {
		if (dangGui.current || luu.isPending) return;
		dangGui.current = true;
		setLoi(null);
		luu.mutate({
			userId: nguoi.id,
			primaryDepartmentId: chinh,
			secondaryDepartmentIds: phu,
			managerUserId: tay,
		});
	};

	return (
		<Dialog
			open
			onOpenChange={(mo) => {
				if (!mo && !luu.isPending) dong();
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{tieuDeTruoc}
						<span translate="no">{nguoi.name}</span>
						{tieuDeSau}
					</DialogTitle>
					<DialogDescription translate="no">{nguoi.email}</DialogDescription>
				</DialogHeader>

				<Field>
					<FieldLabel htmlFor={maChinh}>{v.chinh}</FieldLabel>
					<ChonPhongBan
						id={maChinh}
						cay={cay}
						giaTri={chinh ?? KHONG_CHON}
						boQua={phu}
						nhanTrong={v.chuaChon}
						onChange={(x) => setChinh(x === KHONG_CHON ? null : x)}
					/>
				</Field>

				<Field>
					<FieldLabel htmlFor={maPhu}>{v.phu}</FieldLabel>
					{phu.length > 0 ? (
						<span className="flex flex-wrap items-center gap-1" data-phu>
							{phu.map((id) => (
								<span key={id} className="flex items-center gap-1">
									<Badge variant="secondary" translate="no">
										{tenPb(id)}
									</Badge>
									<Button
										variant="ghost"
										size="icon-xs"
										aria-label={dien(v.boPhu, { ten: tenPb(id) })}
										onClick={() => setPhu((ds) => ds.filter((x) => x !== id))}
									>
										<Icon icon={Close} />
									</Button>
								</span>
							))}
						</span>
					) : null}
					<ChonPhongBan
						id={maPhu}
						cay={cay}
						giaTri={KHONG_CHON}
						boQua={[...phu, ...(chinh ? [chinh] : [])]}
						nhanTrong={v.themPhu}
						onChange={(x) => {
							if (x !== KHONG_CHON) setPhu((ds) => [...ds, x]);
						}}
					/>
				</Field>

				<Field>
					<FieldLabel htmlFor={maQuanLy}>{v.quanLy}</FieldLabel>
					{quanLy ? (
						<span className="flex items-center gap-1 text-xs">
							<PersonAvatar size="sm" name={quanLy.name} email={quanLy.email} />
							<span translate="no">{quanLy.name}</span>
						</span>
					) : null}
					<FieldDescription>{moTa}</FieldDescription>
					{chonTay ? (
						<Select
							value={tay ?? KHONG_CHON}
							onValueChange={(x) => setTay(x === KHONG_CHON ? null : x)}
						>
							<SelectTrigger id={maQuanLy}>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={KHONG_CHON}>{v.khongCo}</SelectItem>
								{cay.people
									.filter((p) => p.id !== nguoi.id)
									.map((p) => (
										<SelectItem key={p.id} value={p.id} translate="no">
											{p.name}
										</SelectItem>
									))}
							</SelectContent>
						</Select>
					) : null}
					<span className="flex flex-wrap gap-2">
						{chonTay ? null : (
							<Button
								id={maQuanLy}
								variant="outline"
								size="sm"
								onClick={() => setChonTay(true)}
							>
								<Icon icon={Add} data-icon="inline-start" />
								{v.chonKhac}
							</Button>
						)}
						{tay !== null ? (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									setTay(null);
									setChonTay(false);
								}}
							>
								{v.veTheoTruong}
							</Button>
						) : null}
					</span>
				</Field>

				{loi ? (
					<Alert variant="destructive">
						<AlertDescription>{loi}</AlertDescription>
					</Alert>
				) : null}

				<DialogFooter>
					<Button variant="outline" onClick={dong} disabled={luu.isPending}>
						{v.huy}
					</Button>
					<Button onClick={gui} disabled={luu.isPending}>
						{luu.isPending ? <Spinner /> : null}
						{v.luu}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
