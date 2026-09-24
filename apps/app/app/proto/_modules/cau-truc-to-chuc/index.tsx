"use client";

import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import Search from "@carbon/icons-react/es/Search";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@crm/ui/components/input-group";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { useState } from "react";
import {
	type BoPhanMau,
	CAY_HAI_CAP,
	CHUA_XEP,
	PHONG_BAN_PHANG,
	type PhongBanMau,
} from "./du-lieu";

const TIM_SAN = "vùng";

function KhungMan({
	tieuDe,
	mo,
	children,
}: {
	tieuDe: string;
	mo: string;
	children: React.ReactNode;
}) {
	return (
		<section aria-labelledby="proto-man" className="flex flex-col gap-4">
			<header className="flex flex-col gap-1">
				<h2 className="font-medium text-lg" id="proto-man">
					{tieuDe}
				</h2>
				<p className="text-muted-foreground text-sm">{mo}</p>
			</header>
			{children}
		</section>
	);
}

function khop(ten: string, tim: string) {
	return ten
		.toLocaleLowerCase("vi")
		.includes(tim.trim().toLocaleLowerCase("vi"));
}

function DongPhongBan({
	phongBan,
	coNguoi,
}: {
	phongBan: PhongBanMau;
	coNguoi: boolean;
}) {
	return (
		<li
			className="flex flex-col gap-2 py-2 ps-8 pe-2"
			data-phong-ban={phongBan.id}
		>
			<span className="flex items-center justify-between gap-2 text-sm">
				<span className="min-w-0 truncate" translate="no">
					{phongBan.ten}
				</span>
				<span className="shrink-0 text-muted-foreground text-xs tabular-nums">
					{phongBan.soBuoc} bước kế hoạch
				</span>
			</span>
			{coNguoi ? (
				<span className="flex flex-wrap items-center gap-2">
					{phongBan.thanhVien.length === 0 ? (
						<span className="text-muted-foreground text-xs">
							Chưa có thành viên
						</span>
					) : null}
					{phongBan.thanhVien.map((nguoi) => (
						<span key={nguoi.id} className="flex items-center gap-1 text-xs">
							<PersonAvatar size="sm" name={nguoi.ten} email={nguoi.email} />
							<span translate="no">{nguoi.ten}</span>
							{phongBan.truong?.id === nguoi.id ? (
								<Badge variant="outline">Trưởng phòng</Badge>
							) : null}
						</span>
					))}
				</span>
			) : null}
		</li>
	);
}

function NhanhBoPhan({
	boPhan,
	moSan,
	coNguoi,
	tim,
}: {
	boPhan: BoPhanMau;
	moSan: boolean;
	coNguoi: boolean;
	tim: string;
}) {
	const [mo, setMo] = useState(moSan);
	const conLai = tim
		? boPhan.phongBan.filter((p) => khop(p.ten, tim) || khop(boPhan.ten, tim))
		: boPhan.phongBan;
	if (tim && conLai.length === 0) return null;
	const dangMo = tim ? true : mo;
	return (
		<Collapsible open={dangMo} onOpenChange={setMo} asChild>
			<li data-bo-phan={boPhan.id}>
				<CollapsibleTrigger asChild>
					<Button variant="ghost" className="w-full justify-start">
						<Icon
							icon={ChevronRight}
							className={
								dangMo
									? "rotate-90 transition-transform"
									: "transition-transform"
							}
						/>
						<span className="min-w-0 flex-1 truncate text-start" translate="no">
							{boPhan.ten}
						</span>
						<span className="text-muted-foreground text-xs font-normal tabular-nums">
							{boPhan.phongBan.length} phòng ban
						</span>
					</Button>
				</CollapsibleTrigger>
				{coNguoi && boPhan.truong ? (
					<span className="flex items-center gap-1 ps-8 pb-1 text-muted-foreground text-xs">
						<PersonAvatar
							size="sm"
							name={boPhan.truong.ten}
							email={boPhan.truong.email}
						/>
						<span translate="no">{boPhan.truong.ten}</span>
						<Badge variant="outline">Trưởng bộ phận</Badge>
					</span>
				) : null}
				<CollapsibleContent asChild>
					<ul className="divide-y">
						{conLai.map((phongBan) => (
							<DongPhongBan
								key={phongBan.id}
								phongBan={phongBan}
								coNguoi={coNguoi}
							/>
						))}
					</ul>
				</CollapsibleContent>
			</li>
		</Collapsible>
	);
}

function CayToChuc({
	boPhan,
	chuaXep,
	coNguoi,
	timSan,
}: {
	boPhan: readonly BoPhanMau[];
	chuaXep: readonly PhongBanMau[];
	coNguoi: boolean;
	timSan: string;
}) {
	const [tim, setTim] = useState(timSan);
	const chuaXepConLai = tim ? chuaXep.filter((p) => khop(p.ten, tim)) : chuaXep;
	return (
		<div className="flex flex-col gap-3">
			<InputGroup>
				<InputGroupAddon>
					<Icon icon={Search} />
				</InputGroupAddon>
				<InputGroupInput
					aria-label="Tìm bộ phận hoặc phòng ban"
					placeholder="Tìm bộ phận hoặc phòng ban"
					value={tim}
					onChange={(event) => setTim(event.target.value)}
				/>
			</InputGroup>
			<ul
				className="flex flex-col gap-1 rounded-lg border p-2"
				aria-label="Cây tổ chức"
			>
				{boPhan.map((b) => (
					<NhanhBoPhan
						key={b.id}
						boPhan={b}
						moSan
						coNguoi={coNguoi}
						tim={tim}
					/>
				))}
				{chuaXepConLai.length > 0 ? (
					<li data-bo-phan="chua-xep" className="flex flex-col gap-1 pt-2">
						<span className="px-3 text-muted-foreground text-xs">
							Chưa xếp vào bộ phận nào
						</span>
						<ul className="divide-y">
							{chuaXepConLai.map((phongBan) => (
								<DongPhongBan
									key={phongBan.id}
									phongBan={phongBan}
									coNguoi={coNguoi}
								/>
							))}
						</ul>
					</li>
				) : null}
			</ul>
		</div>
	);
}

function DanhSachPhang() {
	return (
		<ul className="divide-y rounded-lg border" aria-label="Bộ phận hôm nay">
			{PHONG_BAN_PHANG.map((phongBan) => (
				<li
					key={phongBan.id}
					className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
				>
					<span translate="no">{phongBan.ten}</span>
					<span className="text-muted-foreground text-xs tabular-nums">
						{phongBan.soBuoc} bước kế hoạch
					</span>
				</li>
			))}
		</ul>
	);
}

function ChonNoiNhanBuoc() {
	return (
		<Field>
			<FieldLabel>Giao bước «Gọi chào mừng» cho</FieldLabel>
			<Select defaultValue="kd1">
				<SelectTrigger>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{CAY_HAI_CAP.map((boPhan) => (
						<SelectGroup key={boPhan.id}>
							<SelectLabel translate="no">{boPhan.ten}</SelectLabel>
							{boPhan.phongBan.map((phongBan) => (
								<SelectItem
									key={phongBan.id}
									value={phongBan.id}
									translate="no"
								>
									{phongBan.ten}
								</SelectItem>
							))}
						</SelectGroup>
					))}
					<SelectGroup>
						<SelectLabel>Chưa xếp vào bộ phận nào</SelectLabel>
						{CHUA_XEP.map((phongBan) => (
							<SelectItem key={phongBan.id} value={phongBan.id} translate="no">
								{phongBan.ten}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
			<FieldDescription>
				Bước vẫn giao cho phòng ban như hôm nay; bộ phận chỉ gom các phòng ban
				lại để chọn và lọc.
			</FieldDescription>
		</Field>
	);
}

export function CauTrucToChucMau({ state }: { state: string }) {
	if (state === "ST-hientai") {
		return (
			<KhungMan
				tieuDe="Hôm nay — danh sách phẳng"
				mo="Sáu hàng ngang nhau; «Kinh doanh vùng 1» và «vùng 2» không có chỗ nói chúng thuộc cùng bộ phận Kinh doanh."
			>
				<DanhSachPhang />
			</KhungMan>
		);
	}
	if (state === "ST-cay") {
		return (
			<KhungMan
				tieuDe="Cây hai cấp — bộ phận chứa phòng ban"
				mo="Phòng ban cũ giữ nguyên và giữ các bước đã giao; bộ phận là cấp mới ở trên. Phòng ban chưa xếp nằm riêng ở cuối."
			>
				<CayToChuc
					boPhan={CAY_HAI_CAP}
					chuaXep={CHUA_XEP}
					coNguoi={false}
					timSan=""
				/>
			</KhungMan>
		);
	}
	if (state === "ST-cay-tim") {
		return (
			<KhungMan
				tieuDe="Tìm trong cây"
				mo={`Gõ «${TIM_SAN}»: chỉ nhánh có phòng ban khớp còn lại và tự mở ra.`}
			>
				<CayToChuc
					boPhan={CAY_HAI_CAP}
					chuaXep={CHUA_XEP}
					coNguoi={false}
					timSan={TIM_SAN}
				/>
			</KhungMan>
		);
	}
	if (state === "ST-cay-nguoi") {
		return (
			<KhungMan
				tieuDe="Nếu thành viên thuộc phòng ban — câu hỏi mở cho Cổng Đáng"
				mo="Mỗi phòng ban có thành viên và một trưởng phòng; bộ phận có trưởng bộ phận. Đây là phương án để quyết, chưa phải hướng đã chốt."
			>
				<CayToChuc boPhan={CAY_HAI_CAP} chuaXep={CHUA_XEP} coNguoi timSan="" />
			</KhungMan>
		);
	}
	if (state === "ST-giao-buoc") {
		return (
			<KhungMan
				tieuDe="Giao bước kế hoạch — chọn phòng ban theo bộ phận"
				mo="Ô chọn nhóm phòng ban theo bộ phận; người điều phối vẫn giao cho phòng ban."
			>
				<ChonNoiNhanBuoc />
			</KhungMan>
		);
	}
	return (
		<KhungMan
			tieuDe="Chưa có bộ phận nào"
			mo="Ngày đầu sau khi bật: mọi phòng ban cũ nằm ở «chưa xếp», không mất bước nào."
		>
			<Empty>
				<EmptyHeader>
					<EmptyTitle>Chưa có bộ phận nào</EmptyTitle>
					<EmptyDescription>
						{PHONG_BAN_PHANG.length} phòng ban đang chưa xếp vào bộ phận. Tạo bộ
						phận đầu tiên rồi kéo phòng ban vào.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button>Tạo bộ phận</Button>
				</EmptyContent>
			</Empty>
			<CayToChuc
				boPhan={[]}
				chuaXep={PHONG_BAN_PHANG}
				coNguoi={false}
				timSan=""
			/>
		</KhungMan>
	);
}
