"use client";

import { Button } from "@crm/ui/components/button";
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
	LO_TRINH_SAN_PHAM,
	type SanPhamKhai,
	sanPhamKhai,
} from "@crm/validation/san-pham-lo-trinh";
import { useId, useState } from "react";
import { sanPhamMessages } from "@/lib/messages/san-pham";

type O = keyof SanPhamKhai;

const O_KHAI: readonly O[] = ["ten", "kho", "nhanh", "duongTep"];

const FORM = "form-san-pham";

export type SanPhamSua = SanPhamKhai & { ma: string };

const TRONG: SanPhamKhai = {
	ten: "",
	kho: "",
	nhanh: "main",
	duongTep: LO_TRINH_SAN_PHAM.tepMacDinh,
};

export function SheetSanPham({
	sp,
	dangLuu,
	loi,
	onLuu,
	onDong,
}: {
	sp: SanPhamSua | null;
	dangLuu: boolean;
	loi: string | null;
	onLuu: (vao: SanPhamKhai) => void;
	onDong: () => void;
}) {
	const t = sanPhamMessages(useLocale()).sheet;
	const ma = useId();
	const dau: SanPhamKhai = sp
		? { ten: sp.ten, kho: sp.kho, nhanh: sp.nhanh, duongTep: sp.duongTep }
		: TRONG;
	const [n, setN] = useState<SanPhamKhai>(dau);
	const [cham, setCham] = useState<ReadonlySet<O>>(new Set());
	const ket = sanPhamKhai.safeParse(n);
	const hong = new Set(
		ket.success ? [] : ket.error.issues.map((i) => String(i.path[0])),
	);
	const coThayDoi = O_KHAI.some((o) => n[o] !== dau[o]);
	const hopLe = ket.success;
	const nhap = (o: O, gt: string) => {
		setN((cu) => ({ ...cu, [o]: gt }));
		setCham((cu) => new Set([...cu, o]));
	};
	const o = (khoa: O, nhan: string, moTa?: string) => {
		const sai = cham.has(khoa) && hong.has(khoa);
		return (
			<Field data-invalid={sai || undefined} data-o={khoa}>
				<FieldLabel htmlFor={`${ma}-${khoa}`}>{nhan}</FieldLabel>
				<Input
					id={`${ma}-${khoa}`}
					value={n[khoa]}
					aria-invalid={sai || undefined}
					translate={khoa === "ten" ? undefined : "no"}
					onChange={(e) => nhap(khoa, e.target.value)}
				/>
				{moTa ? <FieldDescription>{moTa}</FieldDescription> : null}
				{sai ? <FieldError>{t.loi[khoa]}</FieldError> : null}
			</Field>
		);
	};

	return (
		<Sheet
			open
			coThayDoi={coThayDoi}
			onOpenChange={(mo) => {
				if (!mo && !dangLuu) onDong();
			}}
		>
			<SheetContent
				side="right"
				size="md"
				data-sheet-san-pham={sp?.ma ?? "moi"}
			>
				<SheetHeader>
					<SheetTitle>{sp ? t.suaTieuDe(sp.ten) : t.themTieuDe}</SheetTitle>
					<SheetDescription>{t.moTa}</SheetDescription>
				</SheetHeader>
				<form
					id={FORM}
					className="flex-1 overflow-y-auto px-4"
					onSubmit={(e) => {
						e.preventDefault();
						if (ket.success && !dangLuu) onLuu(ket.data);
					}}
				>
					<FieldGroup>
						{o("ten", t.ten)}
						{o("kho", t.kho, t.khoMoTa)}
						{o("nhanh", t.nhanh)}
						{o("duongTep", t.tep)}
						{loi ? <FieldError>{loi}</FieldError> : null}
					</FieldGroup>
				</form>
				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline" disabled={dangLuu}>
							{t.huy}
						</Button>
					</SheetClose>
					<Button
						type="submit"
						form={FORM}
						disabled={!hopLe || dangLuu || (sp !== null && !coThayDoi)}
						data-nut="luu-san-pham"
					>
						{dangLuu ? <Spinner data-icon="inline-start" /> : null}
						{t.luu}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
