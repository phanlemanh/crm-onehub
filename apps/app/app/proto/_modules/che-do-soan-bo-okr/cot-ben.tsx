"use client";

import { Button } from "@crm/ui/components/button";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { KaraMark } from "@crm/ui/components/kara";
import {
	KaraDock,
	KaraDockBody,
	KaraDockFooter,
} from "@crm/ui/components/kara/dock";
import {
	KaraProposal,
	KaraProposalGroup,
} from "@crm/ui/components/kara/proposal";
import { KaraState } from "@crm/ui/components/kara/state";
import { Progress } from "@crm/ui/components/progress";
import { SectionHeading } from "@crm/ui/components/section-heading";
import { Separator } from "@crm/ui/components/separator";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { CAU_DIEM, type DiemKiem, GOP_Y, type GopY } from "./du-lieu";

export type HinhKara =
	| "chua-doc"
	| "dang-doc"
	| "co-gop-y"
	| "da-nhan-mot"
	| "khong-co"
	| "tat";

const CHU = {
	chatLuong: "Chất lượng",
	chatLuongMoTa: "Máy chấm theo luật OKR của OneHub, ngay khi bạn gõ.",
	dat: (d: number, t: number) => `${d} trên ${t} điểm đạt`,
	denDong: "Đến dòng",
	datHet: "Bộ đạt mọi điểm chất lượng.",
	chuaCo: "Gõ mục tiêu đầu tiên để máy chấm.",
	gopY: (n: number) => (n === 0 ? "Góp ý" : `${n} góp ý`),
	nhoDoc: "Nhờ Kara đọc bộ",
	docLai: "Kara đọc lại bộ",
	dangDoc: "Kara đang đọc bộ OKR này…",
	chuaDoc:
		"Kara đọc cả bộ khi bạn nhờ, rồi đặt góp ý ở đây. Bạn quyết từng góp ý.",
	khongCo: "Kara không thấy chỗ nào cần sửa",
	khongCoMoTa: "Mọi KR đã đo kết quả, có khởi điểm và có đối trọng.",
	tat: "Quản trị chưa bật Kara cho đơn vị này. Điểm chất lượng vẫn chấm như thường.",
	viSao:
		"Kara đọc bộ OKR này và mục tiêu cấp trên «Tăng trưởng 30% doanh thu vận tải» lúc 09:12.",
	daThay: "Đã thay câu theo Kara",
	boQua: "Bỏ qua",
	sua: "Sửa",
} as const;

function KhoiChatLuong({ diem }: { diem: DiemKiem[] }) {
	const dat = diem.filter((d) => d.dat).length;
	const con = diem.filter((d) => !d.dat);
	return (
		<section className="flex flex-col gap-3" data-khoi="chat-luong">
			<SectionHeading level={4}>{CHU.chatLuong}</SectionHeading>
			{diem.length === 0 ? (
				<p className="text-muted-foreground text-sm">{CHU.chuaCo}</p>
			) : (
				<>
					<div className="flex flex-col gap-2">
						<p
							className="font-medium text-sm tabular-nums"
							data-diem={`${dat}/${diem.length}`}
						>
							{CHU.dat(dat, diem.length)}
						</p>
						<Progress
							value={(dat / diem.length) * 100}
							aria-label={CHU.chatLuong}
						/>
						<p className="text-muted-foreground text-xs">{CHU.chatLuongMoTa}</p>
					</div>
					{con.length === 0 ? (
						<StatusIndicator tone="success" size="sm" label={CHU.datHet} />
					) : (
						<ItemGroup>
							{con.map((d) => (
								<Item key={d.id} size="sm" data-diem-con={d.id}>
									<ItemContent>
										<ItemTitle>
											<StatusIndicator tone="warning" size="sm" label={d.cau} />
										</ItemTitle>
										<ItemDescription>{CAU_DIEM[d.id]}</ItemDescription>
									</ItemContent>
									<ItemActions>
										<Button variant="ghost" size="sm" type="button">
											{CHU.denDong}
										</Button>
									</ItemActions>
								</Item>
							))}
						</ItemGroup>
					)}
				</>
			)}
		</section>
	);
}

function TheGopY({ g, daNhan }: { g: GopY; daNhan: boolean }) {
	return (
		<KaraProposal
			density="card"
			kind={g.truoc ? "rewrite" : "compact"}
			label={g.nhan}
			before={g.truoc ? <span translate="no">{g.truoc}</span> : undefined}
			value={<span translate="no">{g.sau}</span>}
			rationale={g.viSao}
			decided={
				daNhan
					? { decision: "accepted", text: CHU.daThay, onUndo: () => {} }
					: undefined
			}
			actions={[
				{ id: "nhan", label: g.nut, tone: "primary", onClick: () => {} },
				{ id: "sua", label: CHU.sua, tone: "secondary", onClick: () => {} },
				{ id: "bo", label: CHU.boQua, tone: "quiet", onClick: () => {} },
			]}
		/>
	);
}

function ThanKara({ kara }: { kara: HinhKara }) {
	if (kara === "dang-doc")
		return <KaraState kind="working" label={CHU.dangDoc} delayMs={0} />;
	if (kara === "chua-doc")
		return <p className="text-muted-foreground text-sm">{CHU.chuaDoc}</p>;
	if (kara === "khong-co")
		return (
			<KaraState
				kind="empty"
				title={CHU.khongCo}
				description={CHU.khongCoMoTa}
			/>
		);
	if (kara === "tat")
		return <KaraState kind="unconfigured" description={CHU.tat} />;
	const nhanMot = kara === "da-nhan-mot";
	return (
		<KaraProposalGroup
			entries={GOP_Y.map((g) => ({
				id: g.id,
				status: nhanMot && g.id === "g1" ? "decided" : "pending",
				batchable: false,
			}))}
			reason={CHU.viSao}
		>
			<div className="flex flex-col gap-3">
				{GOP_Y.map((g) => (
					<TheGopY key={g.id} g={g} daNhan={nhanMot && g.id === "g1"} />
				))}
			</div>
		</KaraProposalGroup>
	);
}

export function CotBen({
	diem,
	kara,
	motMinh,
}: {
	diem: DiemKiem[];
	kara: HinhKara;
	motMinh?: boolean;
}) {
	const soCho =
		kara === "co-gop-y" ? GOP_Y.length : kara === "da-nhan-mot" ? 1 : 0;
	const coNut = kara !== "tat" && kara !== "dang-doc";
	return (
		<KaraDock
			side={motMinh ? "fill" : "rail"}
			alone={motMinh}
			aria-label={CHU.chatLuong}
			data-o="cot-ben"
		>
			<KaraDockBody>
				<div className="flex flex-col gap-5">
					<KhoiChatLuong diem={diem} />
					<Separator />
					<section className="flex flex-col gap-3" data-khoi="gop-y-kara">
						{soCho > 0 ? null : <KaraMark scope={CHU.gopY(0)} />}
						<ThanKara kara={kara} />
					</section>
				</div>
			</KaraDockBody>
			{coNut ? (
				<KaraDockFooter divided>
					<Button
						variant="outline"
						size="sm"
						type="button"
						data-nut="nho-kara-doc"
					>
						{kara === "chua-doc" ? CHU.nhoDoc : CHU.docLai}
					</Button>
				</KaraDockFooter>
			) : null}
		</KaraDock>
	);
}
