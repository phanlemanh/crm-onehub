"use client";

import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { Progress } from "@crm/ui/components/progress";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { SimpleTable, SimpleTableRow } from "@crm/ui/components/simple-table";
import { Skeleton } from "@crm/ui/components/skeleton";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { Switch } from "@crm/ui/components/switch";
import { TableCell } from "@crm/ui/components/table";
import {
	PageShell,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import {
	type CauHinhMau,
	DON_VI,
	type DoiSoat,
	laState,
	type PhamVi,
	type SanSang,
	type SoMau,
	STATES,
} from "./du-lieu";

const tien = new Intl.NumberFormat("vi-VN", {
	style: "currency",
	currency: "USD",
	minimumFractionDigits: 2,
});

const PHAM_VI: { id: PhamVi; nhan: string }[] = [
	{ id: "tat", nhan: "Tắt" },
	{ id: "toan-cong-ty", nhan: "Toàn công ty" },
	{ id: "danh-sach", nhan: "Chọn đơn vị" },
];

const CELL = "px-3 py-2.5 align-middle";

function ChiBao({ sanSang }: { sanSang: SanSang }) {
	switch (sanSang.loai) {
		case "tat":
			return <StatusIndicator size="sm" tone="neutral" label="Đang tắt" />;
		case "san-sang":
			return <StatusIndicator size="sm" tone="success" label="Sẵn sàng" />;
		case "chua-san-sang":
			return (
				<StatusIndicator
					size="sm"
					tone="warning"
					label={`Chưa sẵn sàng — ${sanSang.lyDo}`}
				/>
			);
		case "het-tran":
			return (
				<StatusIndicator
					size="sm"
					tone="error"
					label={`Đã chạm trần tháng — tạm nghỉ tới ${sanSang.toiNgay}`}
				/>
			);
	}
}

function DongViec({
	ma,
	nhan,
	moTa,
	phamVi,
	donVi,
	khoa,
}: {
	ma: string;
	nhan: string;
	moTa: string;
	phamVi: PhamVi;
	donVi: string[];
	khoa: boolean;
}) {
	const tenDonVi = DON_VI.filter((d) => donVi.includes(d.id));
	return (
		<Field data-viec={ma}>
			<FieldLabel htmlFor={`pham-vi-${ma}`}>{nhan}</FieldLabel>
			<Select defaultValue={phamVi} disabled={khoa}>
				<SelectTrigger id={`pham-vi-${ma}`} className="w-full sm:w-56">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{PHAM_VI.map((p) => (
						<SelectItem key={p.id} value={p.id}>
							{p.nhan}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{phamVi === "danh-sach" ? (
				<div className="flex flex-wrap items-center gap-2">
					<ul
						aria-label={`Đơn vị bật ${nhan.toLowerCase()}`}
						className="flex flex-wrap gap-1.5"
					>
						{tenDonVi.map((d) => (
							<li key={d.id}>
								<Badge variant="token" translate="no">
									{d.ten}
								</Badge>
							</li>
						))}
					</ul>
					<Button variant="outline" size="sm" disabled={khoa}>
						Chọn đơn vị…
					</Button>
				</div>
			) : null}
			<FieldDescription>
				{phamVi === "danh-sach" && tenDonVi.length === 0
					? "Chưa chọn đơn vị nào — việc này chưa chạy ở đâu."
					: moTa}
			</FieldDescription>
		</Field>
	);
}

function TheTroLyOkr({ cauHinh }: { cauHinh: CauHinhMau | null }) {
	if (!cauHinh) {
		return (
			<Card data-the="tro-ly-okr" aria-busy="true">
				<CardHeader>
					<CardTitle>Trợ lý OKR</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<Skeleton className="h-5 w-40" />
					<Skeleton className="h-9 w-full" />
					<Skeleton className="h-9 w-full" />
					<Skeleton className="h-9 w-32" />
				</CardContent>
			</Card>
		);
	}
	const khoa = !cauHinh.bat;
	return (
		<Card data-the="tro-ly-okr">
			<CardHeader>
				<CardTitle>Trợ lý OKR</CardTitle>
				<CardAction>
					<Button type="submit" size="sm">
						Lưu
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent className="flex flex-col gap-6">
				<div data-san-sang>
					<ChiBao sanSang={cauHinh.sanSang} />
				</div>
				<FieldGroup>
					<Field orientation="horizontal">
						<FieldContent>
							<FieldLabel htmlFor="tro-ly-bat">Bật Trợ lý OKR</FieldLabel>
							<FieldDescription>
								Nội dung OKR chỉ gửi tới nhà cung cấp mô hình cam kết không lưu
								dữ liệu. Người dùng chưa thấy nút nào cho tới khi góp ý mở.
							</FieldDescription>
						</FieldContent>
						<Switch id="tro-ly-bat" defaultChecked={cauHinh.bat} />
					</Field>
					<DongViec
						ma="de-xuat"
						nhan="Góp ý khi bấm"
						moTa="Người sửa được một Mục tiêu nhờ Trợ lý OKR góp ý tên, «vì sao lúc này» và KR."
						phamVi={cauHinh.deXuat}
						donVi={cauHinh.deXuatDonVi}
						khoa={khoa}
					/>
					<DongViec
						ma="tom-tat-tuan"
						nhan="Tóm tắt tuần"
						moTa="Mỗi phòng ban nhận một Tóm tắt tuần ở đầu Họp tuần."
						phamVi={cauHinh.tomTat}
						donVi={cauHinh.tomTatDonVi}
						khoa={khoa}
					/>
					<Field data-invalid={cauHinh.loiLuu ? "" : undefined}>
						<FieldLabel htmlFor="tro-ly-tran">Trần tháng (USD)</FieldLabel>
						<Input
							id="tro-ly-tran"
							inputMode="decimal"
							autoComplete="off"
							defaultValue={cauHinh.tran}
							className="w-full sm:w-32"
							disabled={khoa}
						/>
						<FieldDescription>
							Chạm trần thì Trợ lý OKR tạm nghỉ tới đầu tháng sau. Quản trị được
							báo ở 80% và 100%.
						</FieldDescription>
					</Field>
					{cauHinh.loiLuu ? (
						<p role="alert" className="text-destructive text-sm">
							Chưa lưu được. Thử lại — phần đã nhập vẫn còn.
						</p>
					) : null}
				</FieldGroup>
			</CardContent>
		</Card>
	);
}

function DongDoiSoat({ doiSoat }: { doiSoat: DoiSoat }) {
	switch (doiSoat.loai) {
		case "chua-co":
			return "Chưa có lần đối soát nào với AI Gateway.";
		case "khop":
			return `Đối soát tháng ${doiSoat.thang} với AI Gateway: khớp (lệch ${doiSoat.lech}%).`;
		case "lech":
			return `Đối soát tháng ${doiSoat.thang} với AI Gateway: lệch ${doiSoat.lech}%.`;
		case "khong-duoc":
			return `Đối soát tháng ${doiSoat.thang}: chưa đối soát được — ${doiSoat.lyDo}.`;
	}
}

function TheSoChiPhi({ so }: { so: SoMau }) {
	const dau = (
		<CardHeader>
			<CardTitle>Sổ chi phí AI — tháng này</CardTitle>
			<CardDescription>
				Tiền mọi việc AI trong CRM, theo giờ Việt Nam từ ngày 1.
			</CardDescription>
		</CardHeader>
	);
	if (so.loai === "dang-tai") {
		return (
			<Card data-the="so-chi-phi" aria-busy="true">
				{dau}
				<CardContent className="flex flex-col gap-3">
					{["mot", "hai", "ba", "bon", "nam"].map((dong) => (
						<Skeleton key={dong} className="h-6 w-full" />
					))}
				</CardContent>
			</Card>
		);
	}
	if (so.loai === "loi" || so.loai === "rong") {
		return (
			<Card data-the="so-chi-phi">
				{dau}
				<CardContent>
					<Empty>
						<EmptyHeader>
							<EmptyTitle>
								{so.loai === "loi"
									? "Không tải được sổ chi phí"
									: "Tháng này chưa có lượt AI nào"}
							</EmptyTitle>
							{so.loai === "rong" ? (
								<EmptyDescription>
									Trần của Trợ lý OKR: {tien.format(so.tran)}.
								</EmptyDescription>
							) : null}
						</EmptyHeader>
						{so.loai === "loi" ? (
							<EmptyContent>
								<Button variant="outline" size="sm">
									Thử lại
								</Button>
							</EmptyContent>
						) : null}
					</Empty>
				</CardContent>
			</Card>
		);
	}
	const tong = so.dong.reduce((s, d) => s + d.usd, 0) + so.chuaGan;
	const phanTram = Math.round((so.troLyOkr / so.tran) * 100);
	const muc =
		phanTram >= 100
			? "Đã chạm trần"
			: phanTram >= 80
				? "Đã dùng 80% trần"
				: null;
	return (
		<Card data-the="so-chi-phi">
			{dau}
			<CardContent className="flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between gap-3 text-sm">
						<span>Trợ lý OKR</span>
						<span className="tabular-nums">
							{tien.format(so.troLyOkr)} / {tien.format(so.tran)} ({phanTram}%)
						</span>
					</div>
					<Progress
						value={Math.min(phanTram, 100)}
						label="Trợ lý OKR đã dùng trên trần tháng"
					/>
					{muc ? (
						<StatusIndicator
							size="sm"
							tone={phanTram >= 100 ? "error" : "warning"}
							label={muc}
						/>
					) : null}
				</div>
				<SimpleTable
					surface="page"
					columns={[
						{ id: "viec", header: "Việc" },
						{ id: "tien", header: "Tiền", width: "w-24", align: "right" },
					]}
				>
					{so.dong.map((d) => (
						<SimpleTableRow key={d.viec}>
							<TableCell className={CELL}>{d.viec}</TableCell>
							<TableCell className={`${CELL} text-right tabular-nums`}>
								{tien.format(d.usd)}
							</TableCell>
						</SimpleTableRow>
					))}
					{so.chuaGan > 0 ? (
						<SimpleTableRow>
							<TableCell className={`${CELL} text-muted-foreground`}>
								Chưa gán việc
							</TableCell>
							<TableCell className={`${CELL} text-right tabular-nums`}>
								{tien.format(so.chuaGan)}
							</TableCell>
						</SimpleTableRow>
					) : null}
					<SimpleTableRow>
						<TableCell className={`${CELL} font-medium`}>Tổng</TableCell>
						<TableCell
							className={`${CELL} text-right font-medium tabular-nums`}
						>
							{tien.format(tong)}
						</TableCell>
					</SimpleTableRow>
				</SimpleTable>
				<p className="text-muted-foreground text-sm">
					<DongDoiSoat doiSoat={so.doiSoat} />
				</p>
			</CardContent>
		</Card>
	);
}

function TheCo({ tieuDe, moTa }: { tieuDe: string; moTa: string }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{tieuDe}</CardTitle>
				<CardDescription>{moTa}</CardDescription>
			</CardHeader>
		</Card>
	);
}

export function TroLyOkrNenMau({ state }: { state: string }) {
	const du = STATES[laState(state) ? state : "ST-troly-san-sang"];
	return (
		<PageShell key={state}>
			<div className="flex w-full max-w-(--container-page) flex-col gap-6">
				<PageShellHeader>
					<PageShellHeading>
						<PageShellTitle>Chương trình OKR</PageShellTitle>
						<PageShellDescription>
							Chu kỳ, luật chung và Trợ lý OKR của cả công ty.
						</PageShellDescription>
					</PageShellHeading>
				</PageShellHeader>
				<TheCo tieuDe="Chu kỳ" moTa="Khối có sẵn — không đổi ở lượt này." />
				<TheCo tieuDe="Cấu hình" moTa="Khối có sẵn — không đổi ở lượt này." />
				{du.so ? (
					<>
						<TheTroLyOkr cauHinh={du.cauHinh} />
						<TheSoChiPhi so={du.so} />
					</>
				) : (
					<p data-thanh-vien className="text-muted-foreground text-sm">
						Thành viên thường mở trang này thấy đúng hai khối có sẵn; hai khối
						Trợ lý OKR và Sổ chi phí AI không hiện.
					</p>
				)}
			</div>
		</PageShell>
	);
}
