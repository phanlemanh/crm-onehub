"use client";

import { Button } from "@crm/ui/components/button";
import { useLocale } from "@crm/ui/components/locale-provider";
import { toChucMessages } from "@/lib/messages/to-chuc";
import { DongNguoi, TieuDeChiTiet } from "./chi-tiet-chung";
import type { CayDuLieu, HanhDong } from "./kieu";

export function ChiTietChuaCo({
	cay,
	hd,
	anTieuDe = false,
}: {
	cay: CayDuLieu;
	hd: HanhDong;
	anTieuDe?: boolean;
}) {
	const t = toChucMessages(useLocale());
	const m = t.chiTiet;
	return (
		<section
			className="flex flex-col gap-4 p-4"
			data-chi-tiet="chua-co-phong-ban"
			data-nhom="chua-co-phong-ban"
		>
			<TieuDeChiTiet ten={t.chuaCoPhongBan} an={anTieuDe} />
			<p className="text-muted-foreground text-sm">
				{cay.chuaCoPhongBan.length === 0 ? m.chuaCoTrong : m.chuaCoMoTa}
			</p>
			{cay.chuaCoPhongBan.length === 0 ? null : (
				<ul className="divide-y rounded-lg border">
					{cay.chuaCoPhongBan.map((n) => (
						<DongNguoi
							key={n.id}
							nguoi={n}
							cuoi={
								<Button
									variant="outline"
									size="sm"
									disabled={!hd.sua}
									aria-haspopup="dialog"
									data-nguoi={n.id}
									onClick={() => hd.moNguoi(n.id)}
								>
									{m.xepPhongBan}
								</Button>
							}
						/>
					))}
				</ul>
			)}
		</section>
	);
}
