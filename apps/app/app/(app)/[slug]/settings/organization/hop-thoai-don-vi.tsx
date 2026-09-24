"use client";

import { Button } from "@crm/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@crm/ui/components/field";
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

	const coTen = yeuCau.loai === "doi-ten" ? yeuCau.name : "";
	const [ten, setTen] = useState(coTen);
	const [loi, setLoi] = useState<string | null>(null);

	const truongHienTai =
		yeuCau.loai === "truong"
			? yeuCau.don === "bo-phan"
				? cay.divisions.find((d) => d.id === yeuCau.id)?.head?.id
				: moiPhongBan(cay).find((d) => d.id === yeuCau.id)?.head?.id
			: undefined;
	const [chon, setChon] = useState<string>(
		yeuCau.loai === "chuyen"
			? (yeuCau.divisionId ?? KHONG_CHON)
			: (truongHienTai ?? KHONG_CHON),
	);

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
	const sanSang = laTen ? ten.trim() !== "" : true;

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
					tenBp.mutate({ id: yeuCau.id, name: ten }, opt);
				else tenPb.mutate({ id: yeuCau.id, name: ten }, opt);
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
					<Button variant="outline" onClick={dong} disabled={dangLuu}>
						{m.huy}
					</Button>
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
