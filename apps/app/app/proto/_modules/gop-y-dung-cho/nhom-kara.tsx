"use client";

import AiGenerate from "@carbon/icons-react/es/AiGenerate";
import Help from "@carbon/icons-react/es/Help";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Field, FieldDescription } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
} from "@crm/ui/components/item";
import { KaraLabel, KaraMark } from "@crm/ui/components/kara";
import { ThinkingIndicator } from "@crm/ui/components/thinking-indicator";
import { useId } from "react";
import { DOC_LUC, GOP_Y, LY_DO_KARA, type TrangThaiKara } from "./du-lieu";
import { GopYNeo, type QuyetCua } from "./gop-y-neo";

function NutNhoKara({
	khoa,
	moTa,
	nhan = "Nhờ Kara góp ý",
}: {
	khoa?: boolean;
	moTa?: string;
	nhan?: string;
}) {
	const id = useId();
	const nut = (
		<Button
			aria-describedby={moTa ? id : undefined}
			data-nut="nho-kara"
			disabled={khoa}
			size="sm"
			variant="outline"
		>
			<Icon data-icon="inline-start" icon={AiGenerate} />
			{nhan}
		</Button>
	);
	if (!moTa) return nut;
	return (
		<Field data-disabled={khoa ? true : undefined}>
			<div>{nut}</div>
			<FieldDescription id={id}>{moTa}</FieldDescription>
		</Field>
	);
}

export function CanhBaoDoiTrong() {
	return (
		<Alert data-canh-bao-doi-trong variant="warning">
			<Icon icon={Help} />
			<AlertTitle>Mọi KR đều đẩy một con số lên</AlertTitle>
			<AlertDescription>
				Có KR nào giữ chất lượng không — ví dụ tỷ lệ thoả thuận huỷ giữ dưới một
				mức? Câu hỏi này không chặn công bố.
			</AlertDescription>
		</Alert>
	);
}

export function NhomKara({
	trangThai,
	qc,
	moKr,
}: {
	trangThai: TrangThaiKara;
	qc: QuyetCua;
	moKr: (den: "kr-moi" | "sua-kr") => void;
}) {
	if (trangThai === "tat") return <CanhBaoDoiTrong />;

	if (trangThai === "dang-doc")
		return (
			<div data-nhom-kara="dang-doc">
				<ThinkingIndicator label="Kara đang đọc Mục tiêu này…" />
			</div>
		);

	if (trangThai === "chua-goi")
		return (
			<Item data-nhom-kara="chua-goi" size="sm" variant="outline">
				<ItemContent>
					<KaraMark />
					<ItemDescription>
						Kara đọc tên, «vì sao lúc này» và các KR, rồi đặt góp ý ngay dưới
						chỗ cần sửa.
					</ItemDescription>
				</ItemContent>
				<ItemActions>
					<NutNhoKara />
				</ItemActions>
			</Item>
		);

	if (trangThai === "het-luot")
		return (
			<div data-nhom-kara="het-luot">
				<NutNhoKara
					khoa
					moTa="Bạn đã dùng hết lượt góp ý hôm nay. Mở lại lúc 00:00 ngày mai."
				/>
			</div>
		);

	if (trangThai === "rong")
		return (
			<Empty border="solid" data-nhom-kara="rong" size="compact">
				<EmptyHeader>
					<EmptyTitle>Kara không thấy chỗ nào cần sửa</EmptyTitle>
					<EmptyDescription>
						Tên, «vì sao lúc này» và 3 KR đã đọc ổn lúc {DOC_LUC}. Sửa xong thì
						nhờ Kara đọc lại.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<NutNhoKara nhan="Nhờ Kara đọc lại" />
				</EmptyContent>
			</Empty>
		);

	if (trangThai === "loi")
		return (
			<Empty border="solid" data-nhom-kara="loi" size="compact">
				<EmptyHeader>
					<EmptyTitle>Kara chưa đọc được Mục tiêu này</EmptyTitle>
					<EmptyDescription>
						Lượt đọc bị ngắt giữa chừng. Chưa có gì bị ghi vào Mục tiêu.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button size="sm" variant="outline">
						Thử lại
					</Button>
				</EmptyContent>
			</Empty>
		);

	const capBo = GOP_Y.filter((g) => g.krId === null);
	return (
		<div className="flex flex-col gap-1" data-nhom-kara="co-gop-y">
			<KaraLabel
				readAt={DOC_LUC}
				reason={LY_DO_KARA}
				scope={qc.conCho > 0 ? `${qc.conCho} góp ý chờ` : "đã xem hết góp ý"}
			/>
			{capBo.map((g) => (
				<GopYNeo g={g} key={g.id} moKr={moKr} qc={qc} />
			))}
		</div>
	);
}
