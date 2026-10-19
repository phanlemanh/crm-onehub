"use client";

import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { Checkbox } from "@crm/ui/components/checkbox";
import { Field, FieldGroup, FieldLabel } from "@crm/ui/components/field";
import { KhungXuong } from "@crm/ui/components/khung-xuong";
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
import { useQuery } from "@tanstack/react-query";
import { useId, useState } from "react";
import { sanPhamMessages } from "@/lib/messages/san-pham";
import { useTRPC } from "@/lib/trpc/client";

export function SheetNguoiXem({
	ma,
	ten,
	dangLuu,
	onLuu,
	onDong,
}: {
	ma: string;
	ten: string;
	dangLuu: boolean;
	onLuu: (userIds: string[]) => void;
	onDong: () => void;
}) {
	const t = sanPhamMessages(useLocale());
	const trpc = useTRPC();
	const id = useId();
	const ds = useQuery(trpc.sanPhamLoTrinh.nguoiXem.queryOptions({ ma }));
	const [chon, setChon] = useState<ReadonlySet<string> | null>(null);
	const goc = new Set(
		(ds.data ?? []).filter((n) => n.chon && !n.luonThay).map((n) => n.userId),
	);
	const dangChon = chon ?? goc;
	const coThayDoi =
		chon !== null &&
		(chon.size !== goc.size || [...chon].some((u) => !goc.has(u)));
	const doi = (userId: string, co: boolean) => {
		const moi = new Set(dangChon);
		if (co) moi.add(userId);
		else moi.delete(userId);
		setChon(moi);
	};

	return (
		<Sheet
			open
			coThayDoi={coThayDoi}
			onOpenChange={(mo) => {
				if (!mo && !dangLuu) onDong();
			}}
		>
			<SheetContent side="right" size="md" data-sheet-nguoi-xem={ma}>
				<SheetHeader>
					<SheetTitle>
						<span translate="no">{t.nguoiXem.tieuDe(ten)}</span>
					</SheetTitle>
					<SheetDescription>{t.nguoiXem.moTa}</SheetDescription>
				</SheetHeader>
				<div className="flex-1 overflow-y-auto px-4">
					{ds.data ? (
						<FieldGroup>
							{ds.data.map((n) => (
								<Field
									key={n.userId}
									orientation="horizontal"
									data-nguoi-xem={n.userId}
								>
									<Checkbox
										id={`${id}-${n.userId}`}
										checked={n.luonThay || dangChon.has(n.userId)}
										disabled={n.luonThay || dangLuu}
										onCheckedChange={(co) => doi(n.userId, co === true)}
									/>
									<FieldLabel htmlFor={`${id}-${n.userId}`}>
										<span translate="no">{n.ten}</span>
										<Badge variant="secondary">
											{n.luonThay ? t.nguoiXem.luonThay : t.nguoiXem.vai[n.vai]}
										</Badge>
									</FieldLabel>
								</Field>
							))}
						</FieldGroup>
					) : (
						<KhungXuong hinh="danh-sach" />
					)}
				</div>
				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline" disabled={dangLuu}>
							{t.sheet.huy}
						</Button>
					</SheetClose>
					<Button
						disabled={!coThayDoi || dangLuu}
						data-nut="luu-nguoi-xem"
						onClick={() => onLuu([...dangChon])}
					>
						{dangLuu ? <Spinner data-icon="inline-start" /> : null}
						{t.sheet.luu}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
