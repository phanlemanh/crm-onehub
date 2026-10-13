"use client";

import { Button } from "@crm/ui/components/button";
import { FieldError, FieldGroup } from "@crm/ui/components/field";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@crm/ui/components/sheet";
import { Spinner } from "@crm/ui/components/spinner";
import { type ReactNode, useEffect, useId, useRef } from "react";

export type KhungTaoProps = {
	nhanNut?: string;
	bieuTuong?: ReactNode;
	khoaNut?: boolean;
	moTaKhoa?: string;
	bienThe?: "default" | "outline";
	tieuDe: string;
	moTa?: string;
	dangMo: boolean;
	doiMo: (mo: boolean) => void;
	sanSang: boolean;
	dangLuu: boolean;
	loi: string | null;
	nhanLuu: string;
	nhanHuy: string;
	onLuu: () => void;
	children: ReactNode;
};

export function KhungTao({
	nhanNut,
	bieuTuong,
	khoaNut = false,
	moTaKhoa,
	bienThe = "outline",
	tieuDe,
	moTa,
	dangMo,
	doiMo,
	sanSang,
	dangLuu,
	loi,
	nhanLuu,
	nhanHuy,
	onLuu,
	children,
}: KhungTaoProps) {
	const maForm = useId();
	const dangGui = useRef(false);

	useEffect(() => {
		if (!dangLuu) dangGui.current = false;
	}, [dangLuu]);

	const gui = () => {
		if (dangGui.current || dangLuu || !sanSang) return;
		dangGui.current = true;
		onLuu();
	};

	return (
		<Sheet open={dangMo} onOpenChange={doiMo}>
			{nhanNut === undefined ? null : (
				<SheetTrigger asChild>
					<Button
						variant={bienThe}
						disabled={khoaNut}
						aria-describedby={khoaNut ? moTaKhoa : undefined}
					>
						{bieuTuong}
						{nhanNut}
					</Button>
				</SheetTrigger>
			)}
			<SheetContent side="right">
				<SheetHeader>
					<SheetTitle>{tieuDe}</SheetTitle>
					{moTa ? <SheetDescription>{moTa}</SheetDescription> : null}
				</SheetHeader>
				<form
					id={maForm}
					className="flex-1 overflow-y-auto px-4"
					onSubmit={(event) => {
						event.preventDefault();
						gui();
					}}
				>
					<FieldGroup>
						{children}
						{loi ? <FieldError role="alert">{loi}</FieldError> : null}
					</FieldGroup>
				</form>
				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline">{nhanHuy}</Button>
					</SheetClose>
					<Button type="submit" form={maForm} disabled={dangLuu || !sanSang}>
						{dangLuu ? <Spinner /> : null}
						{nhanLuu}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
