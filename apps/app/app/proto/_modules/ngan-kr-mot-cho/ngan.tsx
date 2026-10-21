"use client";

import ChevronLeft from "@carbon/icons-react/es/ChevronLeft";
import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import { Button } from "@crm/ui/components/button";
import { StatGroup } from "@crm/ui/components/dashboard";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { SectionHeading } from "@crm/ui/components/section-heading";
import {
	Sheet,
	SheetBody,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import { StatCard } from "@crm/ui/components/stat-card";
import { TargetLineChart } from "@crm/ui/components/target-line-chart";
import type { KrMau } from "../ban-mau-okr/du-lieu";
import {
	DangTai,
	giaTri,
	Loi,
	ThanhTienDo,
	TinhTrangKr,
	TuTin,
	tienDo,
} from "../ban-mau-okr/phan-chung";
import {
	diemDoThi,
	KR_CUA_MUC_TIEU,
	KY_VONG,
	lichSu,
	MUC_TIEU,
} from "./du-lieu";

export type HinhNgan = "mo" | "chi-doc" | "dang-tai" | "loi" | "khong-thay";

type NganKrProps = {
	viTri: number;
	daGui: Record<string, number>;
	hinh: HinhNgan;
	onDoiViTri: (viTri: number) => void;
	onCapNhat: (kr: KrMau) => void;
};

function DauNgan({
	kr,
	viTri,
	coCapNhat,
	onDoiViTri,
	onCapNhat,
}: {
	kr: KrMau;
	viTri: number;
	coCapNhat: boolean;
	onDoiViTri: (viTri: number) => void;
	onCapNhat: (kr: KrMau) => void;
}) {
	const tong = KR_CUA_MUC_TIEU.length;
	return (
		<SheetHeader>
			<SheetDescription>
				<a className="hover:underline" href="#ngan-muc-tieu" translate="no">
					{MUC_TIEU.ten}
				</a>
			</SheetDescription>
			<SheetTitle>
				<span translate="no">{kr.ten}</span>
			</SheetTitle>
			<div className="flex flex-wrap items-center gap-2">
				{tong > 1 ? (
					<>
						<span
							aria-live="polite"
							className="text-muted-foreground text-xs tabular-nums"
						>
							{viTri + 1}/{tong}
						</span>
						<Button
							aria-label="KR trước"
							disabled={viTri === 0}
							onClick={() => onDoiViTri(viTri - 1)}
							size="icon-sm"
							variant="outline"
						>
							<Icon icon={ChevronLeft} />
						</Button>
						<Button
							aria-label="KR kế"
							disabled={viTri === tong - 1}
							onClick={() => onDoiViTri(viTri + 1)}
							size="icon-sm"
							variant="outline"
						>
							<Icon icon={ChevronRight} />
						</Button>
					</>
				) : null}
				{coCapNhat ? (
					<Button className="ml-auto" onClick={() => onCapNhat(kr)} size="sm">
						Cập nhật
					</Button>
				) : null}
			</div>
		</SheetHeader>
	);
}

function ThanNgan({ kr }: { kr: KrMau }) {
	const phanTram = tienDo(kr);
	const lanCu = lichSu(kr);
	return (
		<SheetBody>
			<div className="flex flex-col gap-5">
				<StatGroup data-muc-ngan="so">
					<StatCard
						description={
							kr.kieu === "moc" ? "mốc" : `đích ${giaTri(kr, kr.dich)}`
						}
						label="Hiện tại"
						value={giaTri(kr)}
					/>
					<StatCard
						description={
							<TinhTrangKr
								laMoc={kr.kieu === "moc"}
								loai={MUC_TIEU.loai}
								phanTram={phanTram}
								size="sm"
							/>
						}
						label={`Tiến độ · lẽ ra ${KY_VONG}%`}
						value={`${phanTram}%`}
					/>
				</StatGroup>
				<div data-muc-ngan="tien-do">
					<ThanhTienDo nhan="Tiến độ KR" phanTram={phanTram} />
				</div>
				<section className="flex flex-col gap-2" data-muc-ngan="lich-su">
					<SectionHeading level={3}>Lịch sử cập nhật</SectionHeading>
					{kr.kieu === "so" ? (
						<TargetLineChart
							data={diemDoThi(kr, null)}
							height={160}
							label={`Diễn biến của ${kr.ten}`}
							target={kr.dich}
							targetLabel={`Đích ${giaTri(kr, kr.dich)}`}
						/>
					) : null}
					<ItemGroup>
						{lanCu.map((l) => (
							<Item key={l.tuan} size="sm" variant="outline">
								<ItemContent>
									<ItemTitle>
										{l.tuan} · {giaTri(kr, l.giaTri)}
									</ItemTitle>
									{l.ghiChu ? (
										<ItemDescription>{l.ghiChu}</ItemDescription>
									) : null}
								</ItemContent>
								<ItemActions>
									<TuTin coNhan={false} muc={l.tuTin} size="sm" />
								</ItemActions>
							</Item>
						))}
					</ItemGroup>
				</section>
				<section
					className="flex flex-col gap-2"
					data-muc-ngan="viec-bang-chung"
				>
					<SectionHeading level={3}>Việc và bằng chứng</SectionHeading>
					<p className="text-muted-foreground text-sm">
						3 việc · 2 xong{kr.kieu === "moc" ? " · 1 bằng chứng" : ""}
					</p>
				</section>
				<section className="flex flex-col gap-2" data-muc-ngan="so-nguon">
					<SectionHeading level={3}>Số và nguồn</SectionHeading>
					<p className="text-muted-foreground text-sm">
						Nhập tay ở mỗi lần cập nhật · 6 bản ghi sau con số
					</p>
				</section>
				<section className="flex flex-col gap-2" data-muc-ngan="chi-tiet">
					<SectionHeading level={3}>Chi tiết</SectionHeading>
					<p className="text-muted-foreground text-sm">
						Phụ trách <span translate="no">{kr.phuTrach.ten}</span> · hạn 31/12
						· kiểu{" "}
						{kr.kieu === "moc"
							? "Mốc"
							: kr.dich < kr.khoiDiem
								? "Giảm tới"
								: "Tăng tới"}
					</p>
				</section>
			</div>
		</SheetBody>
	);
}

function KhongThay() {
	return (
		<SheetBody>
			<Empty>
				<EmptyHeader>
					<EmptyTitle>Không thấy KR</EmptyTitle>
					<EmptyDescription>
						Không tìm thấy KR này, hoặc bạn không có quyền xem.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		</SheetBody>
	);
}

export function NganKr({
	viTri,
	daGui,
	hinh,
	onDoiViTri,
	onCapNhat,
}: NganKrProps) {
	const goc = KR_CUA_MUC_TIEU[viTri] as KrMau;
	const kr = { ...goc, hienTai: daGui[goc.id] ?? goc.hienTai };
	const docDuoc = hinh === "mo" || hinh === "chi-doc";
	return (
		<Sheet open>
			<SheetContent data-ngan-kr size="md">
				{hinh === "khong-thay" ? (
					<>
						<SheetHeader>
							<SheetTitle>KR</SheetTitle>
						</SheetHeader>
						<KhongThay />
					</>
				) : (
					<DauNgan
						coCapNhat={hinh === "mo"}
						kr={kr}
						onCapNhat={onCapNhat}
						onDoiViTri={onDoiViTri}
						viTri={viTri}
					/>
				)}
				{docDuoc ? <ThanNgan kr={kr} /> : null}
				{hinh === "dang-tai" ? (
					<SheetBody>
						<DangTai dong={3} />
					</SheetBody>
				) : null}
				{hinh === "loi" ? (
					<SheetBody>
						<Loi cau="Không tải được KR. Thử lại sau ít phút." />
					</SheetBody>
				) : null}
			</SheetContent>
		</Sheet>
	);
}
