"use client";

import ChevronLeft from "@carbon/icons-react/es/ChevronLeft";
import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { ConfidenceIndicator } from "@crm/ui/components/okr-status";
import { Progress } from "@crm/ui/components/progress";
import { SectionHeading } from "@crm/ui/components/section-heading";
import {
	Sheet,
	SheetBody,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import type { KrHop } from "./du-lieu";
import { DongLyDo, OMucDoi } from "./o-dong";
import { dinhDangSo, mucDoi, tenMucTieu, tienDoMoiNhat } from "./tinh";

export type ViTriNgan = {
	viTri: number;
	tong: number;
	thuTu: string;
};

function DauNgan({
	kr,
	viTri,
	onDoiViTri,
	onCapNhat,
}: {
	kr: KrHop;
	viTri: ViTriNgan;
	onDoiViTri: (viTri: number) => void;
	onCapNhat: () => void;
}) {
	const dau = viTri.viTri === 0;
	const cuoi = viTri.viTri === viTri.tong - 1;
	return (
		<SheetHeader>
			<div className="flex items-center gap-2">
				<Badge variant="secondary">KR</Badge>
				<SheetTitle translate="no">{kr.tieuDe}</SheetTitle>
			</div>
			<SheetDescription>
				<span translate="no">{tenMucTieu(kr)}</span> · Phụ trách{" "}
				<span translate="no">{kr.chuTen}</span>
			</SheetDescription>
			<div className="flex flex-wrap items-center gap-2 pt-2">
				<span
					aria-live="polite"
					className="text-muted-foreground text-xs tabular-nums"
					data-dem-kr=""
				>
					{viTri.viTri + 1}/{viTri.tong} · {viTri.thuTu}
				</span>
				<Button
					aria-label="KR trước"
					data-nut="kr-truoc"
					disabled={dau}
					onClick={() => onDoiViTri(viTri.viTri - 1)}
					size="icon-sm"
					variant="outline"
				>
					<Icon icon={ChevronLeft} />
				</Button>
				<Button
					aria-label="KR kế"
					data-nut="kr-ke"
					disabled={cuoi}
					onClick={() => onDoiViTri(viTri.viTri + 1)}
					size="icon-sm"
					variant="outline"
				>
					<Icon icon={ChevronRight} />
				</Button>
				<Button
					className="ml-auto"
					data-nut="cap-nhat-ngan-kr"
					onClick={onCapNhat}
					size="sm"
				>
					Cập nhật
				</Button>
			</div>
		</SheetHeader>
	);
}

function ThanNgan({ kr, coMucDoi }: { kr: KrHop; coMucDoi: boolean }) {
	const [moi] = kr.lan;
	return (
		<SheetBody className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<div className="flex items-baseline justify-between gap-2">
					<span className="font-medium text-2xl tabular-nums">
						{dinhDangSo(moi.giaTri, kr.donViDo)}
					</span>
					<span className="text-muted-foreground text-xs">
						đích {dinhDangSo(kr.dich, kr.donViDo)}
					</span>
				</div>
				<Progress label={kr.tieuDe} value={tienDoMoiNhat(kr)} />
				<ConfidenceIndicator level={moi.tuTin} size="sm" />
				<DongLyDo kr={kr} />
			</div>
			{coMucDoi ? (
				<div className="flex flex-col gap-1" data-muc-doi-ngan="">
					<SectionHeading level={4}>Mức đổi</SectionHeading>
					<OMucDoi doi={mucDoi(kr)} />
				</div>
			) : null}
			<div className="flex flex-col gap-2">
				<SectionHeading level={4}>Các lần cập nhật</SectionHeading>
				<ItemGroup className="gap-2">
					{kr.lan.map((lan) => (
						<Item key={`${lan.ngay}-${lan.giaTri}`} variant="outline">
							<ItemContent>
								<ItemTitle>
									{dinhDangSo(lan.giaTri, kr.donViDo)} · {lan.ngay}
								</ItemTitle>
								<ItemDescription unclamped>
									{lan.ghiChu ? (
										<span translate="no">«{lan.ghiChu}»</span>
									) : (
										"Không ghi chú"
									)}
								</ItemDescription>
							</ItemContent>
							<ConfidenceIndicator level={lan.tuTin} size="sm" />
						</Item>
					))}
				</ItemGroup>
			</div>
		</SheetBody>
	);
}

export function NganKrHop({
	kr,
	viTri,
	coMucDoi,
	onDoiViTri,
	onCapNhat,
	onDong,
}: {
	kr: KrHop;
	viTri: ViTriNgan;
	coMucDoi: boolean;
	onDoiViTri: (viTri: number) => void;
	onCapNhat: () => void;
	onDong: () => void;
}) {
	return (
		<Sheet open onOpenChange={(mo) => (mo ? null : onDong())}>
			<SheetContent data-ngan-kr={kr.id} side="right" size="md">
				<DauNgan
					kr={kr}
					onCapNhat={onCapNhat}
					onDoiViTri={onDoiViTri}
					viTri={viTri}
				/>
				<ThanNgan coMucDoi={coMucDoi} kr={kr} />
			</SheetContent>
		</Sheet>
	);
}
