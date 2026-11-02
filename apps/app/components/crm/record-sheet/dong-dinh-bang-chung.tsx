"use client";

import { Button } from "@crm/ui/components/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { useKhaiThayDoi } from "@crm/ui/components/giu-thay-doi";
import { Item, ItemContent } from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { Textarea } from "@crm/ui/components/textarea";
import { TU_XU_LY_ESC } from "@crm/ui/lib/tu-xu-ly-esc";
import {
	type BangChungVao,
	bangChungVao,
	OKR_CANH_KR,
} from "@crm/validation/okr-canh-kr";
import { type KeyboardEvent, useEffect, useId, useState } from "react";
import { okrCanhKrMessages } from "@/lib/messages/okr-canh-kr";
import { ODuongDanBangChung } from "./o-duong-dan-bang-chung";
import { dien } from "./plan-copy";

export function DongDinhBangChung({
	onDinh,
	dong,
	dau,
}: {
	onDinh: (vao: BangChungVao) => Promise<void>;
	dong: () => void;
	dau?: BangChungVao;
}) {
	const m = okrCanhKrMessages(useLocale()).bangChung;
	const ma = useId();
	const khai = useKhaiThayDoi();
	const [url, setUrl] = useState(dau?.url ?? "");
	const [ghiChu, setGhiChu] = useState(dau?.ghiChu ?? "");
	const [dangDinh, setDangDinh] = useState(false);
	const [loiDinh, setLoiDinh] = useState<string | null>(null);
	const kq = bangChungVao.safeParse({ url, ghiChu });
	const saiGhiChu = !bangChungVao.shape.ghiChu.safeParse(ghiChu).success;

	useEffect(() => {
		khai(url !== "" || ghiChu !== "");
	}, [khai, url, ghiChu]);

	const huy = () => {
		if (dangDinh) return;
		khai(false);
		dong();
	};

	const dinh = async () => {
		if (!kq.success || dangDinh) return;
		setDangDinh(true);
		setLoiDinh(null);
		try {
			await onDinh(kq.data);
			khai(false);
			dong();
		} catch {
			setLoiDinh(m.loiDinh);
		} finally {
			setDangDinh(false);
		}
	};

	const phim = (e: KeyboardEvent<HTMLElement>, enterDinh: boolean) => {
		if (e.nativeEvent.isComposing) return;
		if (e.key === "Escape") {
			e.preventDefault();
			huy();
			return;
		}
		if (e.key === "Enter" && (enterDinh || e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			void dinh();
		}
	};

	return (
		<Item size="sm" variant="outline" data-hop-dinh-bang-chung="">
			<ItemContent>
				<FieldGroup>
					<ODuongDanBangChung
						id={`${ma}-url`}
						value={url}
						autoFocus
						disabled={dangDinh}
						loiThem={loiDinh}
						onChange={(v) => {
							setUrl(v);
							setLoiDinh(null);
						}}
						onKeyDown={(e) => phim(e, true)}
					/>
					<Field data-invalid={saiGhiChu ? true : undefined}>
						<FieldLabel htmlFor={`${ma}-ghi-chu`}>{m.hop.ghiChu}</FieldLabel>
						<Textarea
							id={`${ma}-ghi-chu`}
							name="ghi-chu"
							{...TU_XU_LY_ESC}
							translate="no"
							placeholder={m.hop.ghiChuGoiY}
							value={ghiChu}
							disabled={dangDinh}
							aria-invalid={saiGhiChu ? true : undefined}
							onChange={(e) => setGhiChu(e.target.value)}
							onKeyDown={(e) => phim(e, false)}
						/>
						{saiGhiChu ? (
							<FieldError>{dien(m.loiGhiChu, OKR_CANH_KR.ghiChu)}</FieldError>
						) : (
							<FieldDescription>
								{dien(m.hop.toiDa, OKR_CANH_KR.ghiChu)}
							</FieldDescription>
						)}
					</Field>
					<div className="flex justify-end gap-2">
						<Button
							size="sm"
							variant="outline"
							disabled={dangDinh}
							onClick={huy}
						>
							{m.hop.huy}
						</Button>
						<Button
							size="sm"
							data-nut="dinh"
							disabled={!kq.success || dangDinh}
							onClick={() => void dinh()}
						>
							{dangDinh ? <Spinner data-icon="inline-start" /> : null}
							{m.hop.dinh}
						</Button>
					</div>
				</FieldGroup>
			</ItemContent>
		</Item>
	);
}
