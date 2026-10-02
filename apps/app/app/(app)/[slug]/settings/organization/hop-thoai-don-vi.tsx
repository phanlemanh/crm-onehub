"use client";

import { Button } from "@crm/ui/components/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import {
	Field,
	FieldDescription,
	FieldError,
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
import { Textarea } from "@crm/ui/components/textarea";
import { TO_CHUC_TRAN } from "@crm/validation/to-chuc";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { toChucMessages } from "@/lib/messages/to-chuc";
import { useTRPC } from "@/lib/trpc/client";
import {
	type CayDuLieu,
	KHONG_CHON,
	moiPhongBan,
	type YeuCauDonVi,
} from "./kieu";
import { useLamMoiToChuc } from "./lam-moi";

export function HopThoaiDonVi({
	cay,
	yeuCau,
	dong,
}: {
	cay: CayDuLieu;
	yeuCau: YeuCauDonVi;
	dong: () => void;
}) {
	const m = toChucMessages(useLocale()).donVi;
	const mc = toChucMessages(useLocale());
	const trpc = useTRPC();
	const lamMoi = useLamMoiToChuc();
	const maO = useId();
	const dangGui = useRef(false);

	const truongHienTai =
		yeuCau.loai === "truong"
			? yeuCau.don === "bo-phan"
				? cay.divisions.find((d) => d.id === yeuCau.id)?.head?.id
				: moiPhongBan(cay).find((d) => d.id === yeuCau.id)?.head?.id
			: undefined;
	const [dau] = useState(() => ({
		ten: yeuCau.loai === "doi-ten" ? yeuCau.name : "",
		moTa: yeuCau.loai === "doi-ten" ? yeuCau.moTa : "",
		chon:
			yeuCau.loai === "chuyen"
				? (yeuCau.divisionId ?? KHONG_CHON)
				: (truongHienTai ?? KHONG_CHON),
	}));
	const [ten, setTen] = useState(dau.ten);
	const [moTa, setMoTa] = useState(dau.moTa);
	const [loi, setLoi] = useState<string | null>(null);
	const [chon, setChon] = useState<string>(dau.chon);
	const coThayDoi = ten !== dau.ten || moTa !== dau.moTa || chon !== dau.chon;

	useEffect(() => {
		if (loi) document.getElementById(maO)?.focus();
	}, [loi, maO]);

	const baoXong = () => {
		switch (yeuCau.loai) {
			case "tao-bo-phan":
				return dien(m.xong.taoBoPhan, { ten: ten.trim() });
			case "tao-phong-ban":
				return dien(m.xong.taoPhongBan, { ten: ten.trim() });
			case "doi-ten":
				return dien(m.xong.doiTen, { ten: ten.trim() });
			case "truong":
				return dien(m.xong.truong, { ten: yeuCau.name });
			case "chuyen":
				return dien(m.xong.chuyen, { ten: yeuCau.name });
		}
	};

	const opt = {
		onSuccess: async () => {
			toast.success(baoXong());
			await lamMoi();
			dong();
		},
		onError: (e: { message: string }) => setLoi(e.message),
		onSettled: () => {
			dangGui.current = false;
		},
	};
	const taoBp = useMutation(trpc.org.createDivision.mutationOptions());
	const taoPb = useMutation(trpc.org.createDepartment.mutationOptions());
	const tenBp = useMutation(trpc.org.renameDivision.mutationOptions());
	const tenPb = useMutation(trpc.org.renameDepartment.mutationOptions());
	const truong = useMutation(trpc.org.setHead.mutationOptions());
	const chuyen = useMutation(trpc.org.moveDepartment.mutationOptions());
	const dangLuu = [taoBp, taoPb, tenBp, tenPb, truong, chuyen].some(
		(x) => x.isPending,
	);

	const laTen =
		yeuCau.loai === "tao-bo-phan" ||
		yeuCau.loai === "tao-phong-ban" ||
		yeuCau.loai === "doi-ten";
	const laBoPhan =
		yeuCau.loai === "tao-bo-phan" ||
		((yeuCau.loai === "doi-ten" || yeuCau.loai === "truong") &&
			yeuCau.don === "bo-phan");
	const moTaQua = moTa.length > TO_CHUC_TRAN.moTa;
	const sanSang = laTen ? ten.trim() !== "" && !moTaQua : true;

	const tieuDe = (() => {
		switch (yeuCau.loai) {
			case "tao-bo-phan":
				return m.taoBoPhan;
			case "tao-phong-ban":
				return dien(m.taoPhongBan, { bp: yeuCau.name });
			case "doi-ten":
				return yeuCau.don === "bo-phan" ? m.doiTenBoPhan : m.doiTenPhongBan;
			case "truong":
				return dien(m.truongCua, { ten: yeuCau.name });
			case "chuyen":
				return dien(m.chuyenDi, { ten: yeuCau.name });
		}
	})();

	const ungVien =
		yeuCau.loai === "truong"
			? yeuCau.don === "bo-phan"
				? cay.people
				: (moiPhongBan(cay).find((d) => d.id === yeuCau.id)?.people ?? [])
			: [];

	const gui = () => {
		if (dangGui.current || dangLuu || !sanSang) return;
		dangGui.current = true;
		setLoi(null);
		const giaTri = chon === KHONG_CHON ? null : chon;
		switch (yeuCau.loai) {
			case "tao-bo-phan":
				taoBp.mutate({ name: ten }, opt);
				return;
			case "tao-phong-ban":
				taoPb.mutate({ name: ten, divisionId: yeuCau.divisionId }, opt);
				return;
			case "doi-ten":
				if (yeuCau.don === "bo-phan")
					tenBp.mutate({ id: yeuCau.id, name: ten, moTa }, opt);
				else tenPb.mutate({ id: yeuCau.id, name: ten, moTa }, opt);
				return;
			case "truong":
				truong.mutate(
					{
						kind: yeuCau.don === "bo-phan" ? "division" : "department",
						id: yeuCau.id,
						userId: giaTri,
					},
					opt,
				);
				return;
			case "chuyen":
				chuyen.mutate({ id: yeuCau.id, divisionId: giaTri, index: 0 }, opt);
				return;
		}
	};

	return (
		<Dialog
			open
			onOpenChange={(mo) => {
				if (!mo && !dangLuu) dong();
			}}
			coThayDoi={coThayDoi}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{tieuDe}</DialogTitle>
				</DialogHeader>
				<form
					id={`${maO}-form`}
					onSubmit={(e) => {
						e.preventDefault();
						gui();
					}}
				>
					{laTen ? (
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor={maO}>
									{laBoPhan ? m.tenBoPhan : m.tenPhongBan}
								</FieldLabel>
								<Input
									id={maO}
									value={ten}
									maxLength={80}
									autoComplete="off"
									translate="no"
									aria-invalid={loi !== null}
									onChange={(e) => setTen(e.target.value)}
								/>
								{loi ? <FieldError role="alert">{loi}</FieldError> : null}
							</Field>
							{yeuCau.loai === "doi-ten" ? (
								<Field data-invalid={moTaQua}>
									<FieldLabel htmlFor={`${maO}-mo-ta`}>{m.moTa}</FieldLabel>
									<Textarea
										id={`${maO}-mo-ta`}
										value={moTa}
										maxLength={TO_CHUC_TRAN.moTa}
										translate="no"
										aria-invalid={moTaQua}
										data-o-mo-ta
										onChange={(e) => setMoTa(e.target.value)}
									/>
									<FieldDescription data-dem-mo-ta>
										{dien(m.dem, { n: moTa.length, max: TO_CHUC_TRAN.moTa })}
									</FieldDescription>
									{moTaQua ? (
										<FieldError>
											{dien(m.moTaDai, {
												n: moTa.length,
												max: TO_CHUC_TRAN.moTa,
											})}
										</FieldError>
									) : (
										<FieldDescription>{m.moTaGoiY}</FieldDescription>
									)}
								</Field>
							) : null}
						</FieldGroup>
					) : (
						<Field>
							<FieldLabel htmlFor={maO}>{tieuDe}</FieldLabel>
							<Select value={chon} onValueChange={setChon}>
								<SelectTrigger id={maO}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={KHONG_CHON}>
										{yeuCau.loai === "chuyen" ? mc.chuaXep : m.khongAi}
									</SelectItem>
									{yeuCau.loai === "chuyen"
										? cay.divisions.map((d) => (
												<SelectItem key={d.id} value={d.id} translate="no">
													{d.name}
												</SelectItem>
											))
										: ungVien.map((n) => (
												<SelectItem key={n.id} value={n.id} translate="no">
													{n.name}
												</SelectItem>
											))}
								</SelectContent>
							</Select>
							{loi ? <FieldError role="alert">{loi}</FieldError> : null}
						</Field>
					)}
				</form>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" disabled={dangLuu}>
							{m.huy}
						</Button>
					</DialogClose>
					<Button
						type="submit"
						form={`${maO}-form`}
						disabled={dangLuu || !sanSang}
					>
						{dangLuu ? <Spinner /> : null}
						{m.luu}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
