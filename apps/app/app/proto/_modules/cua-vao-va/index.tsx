"use client";

import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Field, FieldGroup, FieldLabel } from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { LogoLockup } from "@crm/ui/components/logo-lockup";
import { Spinner } from "@crm/ui/components/spinner";
import Link from "next/link";
import type { ReactNode } from "react";

const CHU = {
	trangChu: "Trang chủ",
	quen: {
		title: "Quên mật khẩu",
		description:
			"Nhập địa chỉ email của bạn, hệ thống gửi cho bạn một liên kết để đặt mật khẩu mới.",
		diaChi: "Địa chỉ email",
		gui: "Gửi liên kết",
		quayLai: "Quay lại đăng nhập",
	},
	daGui: {
		title: "Kiểm tra hộp thư",
		description:
			"Nếu địa chỉ này vào được OneHub Center, liên kết đang trên đường tới. Liên kết dùng được một lần và còn hạn 60 phút. Chưa mở thì mật khẩu hiện tại vẫn nguyên.",
		quayLai: "Quay lại đăng nhập",
	},
	loi: {
		title: "Hệ thống đang trục trặc",
		description:
			"Phiên của bạn vẫn còn — bạn chưa bị đăng xuất. Trang này chưa tải được vì máy chủ đang lỗi; thử lại sau ít giây.",
		thuLai: "Thử lại",
		dangThu: "Đang thử lại…",
	},
	khung: "Đầu trang và thanh biểu tượng của app — giữ nguyên khi trang lỗi",
} as const;

function DauCuaVao({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	return (
		<div className="flex flex-col gap-3 text-left">
			<Link href="/" aria-label={CHU.trangChu} className="flex">
				<LogoLockup className="h-6 w-auto shrink-0" />
			</Link>
			<div className="flex flex-col gap-1">
				<h2 className="text-2xl/8 font-semibold tracking-tight text-balance">
					{title}
				</h2>
				<p className="max-w-[32ch] text-sm/5 text-muted-foreground text-pretty">
					{description}
				</p>
			</div>
		</div>
	);
}

function KhungCuaVao({ children }: { children: ReactNode }) {
	return (
		<section className="flex min-h-svh flex-col bg-background px-6 py-8 sm:px-10">
			<div className="flex flex-1 items-center justify-center py-12">
				<div className="flex w-full max-w-sm flex-col gap-8">{children}</div>
			</div>
		</section>
	);
}

function QuenNhap() {
	return (
		<KhungCuaVao>
			<DauCuaVao description={CHU.quen.description} title={CHU.quen.title} />
			<form className="flex flex-col gap-4">
				<FieldGroup>
					<Field>
						<FieldLabel htmlFor="dia-chi">{CHU.quen.diaChi}</FieldLabel>
						<Input
							autoComplete="email"
							id="dia-chi"
							inputMode="email"
							spellCheck={false}
							type="email"
						/>
					</Field>
				</FieldGroup>
				<Button className="w-full" type="button">
					{CHU.quen.gui}
				</Button>
				<Button className="w-full" type="button" variant="ghost">
					{CHU.quen.quayLai}
				</Button>
			</form>
		</KhungCuaVao>
	);
}

function QuenDaGui() {
	return (
		<KhungCuaVao>
			<DauCuaVao
				description={CHU.daGui.description}
				title={CHU.daGui.title}
			/>
			<Button className="w-full" type="button" variant="outline">
				{CHU.daGui.quayLai}
			</Button>
		</KhungCuaVao>
	);
}

function ThanLoi({ dangThu }: { dangThu: boolean }) {
	return (
		<Empty aria-live="polite">
			<EmptyHeader>
				<EmptyTitle aria-level={1} role="heading">
					{CHU.loi.title}
				</EmptyTitle>
				<EmptyDescription>{CHU.loi.description}</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button autoFocus disabled={dangThu} type="button">
					{dangThu ? <Spinner data-icon="inline-start" /> : null}
					{dangThu ? CHU.loi.dangThu : CHU.loi.thuLai}
				</Button>
			</EmptyContent>
		</Empty>
	);
}

function LoiTrongKhung({ dangThu }: { dangThu: boolean }) {
	return (
		<div className="flex h-svh flex-col">
			<p
				aria-hidden="true"
				className="border-b px-4 py-3 text-xs text-muted-foreground"
			>
				{CHU.khung}
			</p>
			<main className="flex min-h-0 flex-1 items-center justify-center p-6">
				<ThanLoi dangThu={dangThu} />
			</main>
		</div>
	);
}

function LoiNgoaiKhung() {
	return (
		<main className="flex min-h-svh items-center justify-center bg-background p-6">
			<ThanLoi dangThu={false} />
		</main>
	);
}

export function CuaVaoVaMau({ state }: { state: string }) {
	switch (state) {
		case "ST-quen-mat-khau-da-gui":
			return <QuenDaGui />;
		case "ST-trang-loi-trong-khung":
			return <LoiTrongKhung dangThu={false} />;
		case "ST-trang-loi-dang-thu":
			return <LoiTrongKhung dangThu />;
		case "ST-trang-loi-ngoai-khung":
			return <LoiNgoaiKhung />;
		default:
			return <QuenNhap />;
	}
}
