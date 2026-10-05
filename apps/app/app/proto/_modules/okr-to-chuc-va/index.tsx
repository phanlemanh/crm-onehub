"use client";

import Add from "@carbon/icons-react/es/Add";
import ArrowRight from "@carbon/icons-react/es/ArrowRight";
import DocumentImport from "@carbon/icons-react/es/DocumentImport";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { ArchivedList } from "@crm/ui/components/archived-list";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { Icon } from "@crm/ui/components/icon";
import { Toaster } from "@crm/ui/components/sonner";
import { useState } from "react";
import { toast } from "sonner";

export const STATE = {
	quanTriThem: "ST-donvi-quantri-them",
	thanhVien: "ST-donvi-thanhvien",
	chanEn: "ST-luutru-chan-en",
	khoiPhucChan: "ST-luutru-khoiphuc-chan",
} as const;

const CHAN_EN = {
	tieuDe: "Archive “Sales North”?",
	than: "An archived department leaves the tree; its people keep their accounts.",
	canhBao: "Can't archive yet",
	lyDo: [
		{
			loai: "khuon",
			truoc: "This department is still in the onboarding template ",
			ten: "New sales rep",
			sau: " — edit the template first.",
		},
		{
			loai: "nguoi",
			truoc:
				"2 people still have this as their primary department — move them first.",
			ten: null,
			sau: "",
		},
		{
			loai: "okr",
			truoc:
				"This department still has 3 objectives in an open cycle — move the OKRs or drop the objectives before archiving.",
			ten: null,
			sau: "",
		},
	],
	chuyenOkr: "Move OKRs…",
	huy: "Cancel",
	luuTru: "Archive",
} as const;

function ThanhDonVi({ quanTri }: { quanTri: boolean }) {
	return (
		<Card data-don-vi>
			<CardHeader>
				<CardTitle>Kinh doanh miền Bắc</CardTitle>
				<CardDescription>
					Phòng ban · Khối Kinh doanh · Quý 4 2026 · Lập kế hoạch
				</CardDescription>
			</CardHeader>
			<div className="flex flex-wrap items-center gap-2 px-6" data-hang-nut>
				{quanTri ? (
					<>
						<Button
							size="sm"
							variant="outline"
							aria-haspopup="dialog"
							data-nut="nhap-bang-tinh"
						>
							<Icon icon={DocumentImport} data-icon="inline-start" />
							Nhập bảng tính
						</Button>
						<Button size="sm" aria-haspopup="dialog" data-nut="them-muc-tieu">
							<Icon icon={Add} data-icon="inline-start" />
							Thêm mục tiêu
						</Button>
					</>
				) : null}
			</div>
		</Card>
	);
}

function HopChanEn() {
	const [mo, setMo] = useState(true);
	return (
		<>
			<Button variant="outline" onClick={() => setMo(true)}>
				Archive
			</Button>
			<ConfirmDialog
				tieuDe={CHAN_EN.tieuDe}
				than={CHAN_EN.than}
				nut={CHAN_EN.luuTru}
				thoi={CHAN_EN.huy}
				open={mo}
				onOpenChange={setMo}
				onConfirm={() => setMo(false)}
				pending={false}
				noiDung={
					<Alert variant="warning">
						<Icon icon={WarningAlt} />
						<AlertTitle>{CHAN_EN.canhBao}</AlertTitle>
						<AlertDescription>
							<div className="flex flex-col gap-2">
								{CHAN_EN.lyDo.map((l) => (
									<div key={l.loai} className="flex flex-col gap-2">
										<p data-ly-do-chan={l.loai}>
											{l.truoc}
											{l.ten ? <span translate="no">{l.ten}</span> : null}
											{l.sau}
										</p>
										{l.loai === "okr" ? (
											<div className="flex flex-col gap-2 sm:flex-row">
												<Button
													variant="outline"
													size="sm"
													data-nut="chuyen-okr-tu-luu-tru"
												>
													{CHAN_EN.chuyenOkr}
													<Icon icon={ArrowRight} data-icon="inline-end" />
												</Button>
											</div>
										) : null}
									</div>
								))}
							</div>
						</AlertDescription>
					</Alert>
				}
			/>
		</>
	);
}

function KhoiPhucChan() {
	return (
		<div className="flex flex-col gap-3">
			<ArchivedList
				label="Đã lưu trữ"
				restoreLabel="Khôi phục"
				purgeLabel="Xoá hẳn"
				items={[
					{
						id: "bp",
						name: "Khối Kinh doanh",
						kind: "Bộ phận",
						purgeable: false,
					},
					{
						id: "pb",
						name: "Kinh doanh miền Bắc",
						kind: "Phòng ban",
						purgeable: false,
					},
				]}
				onRestore={(id) =>
					toast.error(
						id === "pb"
							? "Phòng ban này thuộc bộ phận «Khối Kinh doanh» đã lưu trữ — khôi phục bộ phận đó trước."
							: "Đã có bộ phận đang hoạt động tên «Khối Kinh doanh» — đổi tên một trong hai trước.",
					)
				}
				onPurge={() => undefined}
			/>
			<Toaster />
		</div>
	);
}

export function OkrToChucVaMau({ state }: { state: string }) {
	if (state === STATE.chanEn) return <HopChanEn />;
	if (state === STATE.khoiPhucChan) return <KhoiPhucChan />;
	return <ThanhDonVi quanTri={state === STATE.quanTriThem} />;
}
