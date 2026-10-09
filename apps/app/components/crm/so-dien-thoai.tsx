import {
	docSoDienThoai,
	hienThiSoDienThoai,
} from "@crm/validation/so-dien-thoai";

export function SoDienThoai({ so, goi = false }: { so: string; goi?: boolean }) {
	const hien = hienThiSoDienThoai(so);

	if (!goi) {
		return (
			<span className="truncate tabular-nums" translate="no">
				{hien}
			</span>
		);
	}

	const doc = docSoDienThoai(so);
	return (
		<a
			href={`tel:${doc.kind === "ok" ? doc.so : so}`}
			className="tabular-nums underline-offset-2 hover:underline"
			translate="no"
		>
			{hien}
		</a>
	);
}
