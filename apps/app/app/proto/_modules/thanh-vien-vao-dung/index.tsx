"use client";

import Add from "@carbon/icons-react/es/Add";
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
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import { Skeleton } from "@crm/ui/components/skeleton";
import { Spinner } from "@crm/ui/components/spinner";
import { useId, useState } from "react";
import {
	PageShell,
	PageShellActions,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";

const DA_LUU = "onehub.center, onehub.vn";

type The =
	| { kieu: "dang-tai" }
	| { kieu: "loi-tai" }
	| {
			kieu: "o";
			giaTri: string;
			daLuu: string;
			coQuyen: boolean;
			dangLuu: boolean;
			loi: string | null;
	  };

function theCua(state: string): The {
	switch (state) {
		case "ST-ten-mien-dang-tai":
			return { kieu: "dang-tai" };
		case "ST-ten-mien-loi-tai":
			return { kieu: "loi-tai" };
		case "ST-ten-mien-rong":
			return {
				kieu: "o",
				giaTri: "",
				daLuu: "",
				coQuyen: true,
				dangLuu: false,
				loi: null,
			};
		case "ST-ten-mien-dang-luu":
			return {
				kieu: "o",
				giaTri: `${DA_LUU}, onehub.com.vn`,
				daLuu: DA_LUU,
				coQuyen: true,
				dangLuu: true,
				loi: null,
			};
		case "ST-ten-mien-loi-nhap":
			return {
				kieu: "o",
				giaTri: `${DA_LUU}, gmail.com`,
				daLuu: DA_LUU,
				coQuyen: true,
				dangLuu: false,
				loi: "gmail.com is a public mail domain, not one of ours. Remove it and save again.",
			};
		case "ST-ten-mien-khoa":
			return {
				kieu: "o",
				giaTri: DA_LUU,
				daLuu: DA_LUU,
				coQuyen: false,
				dangLuu: false,
				loi: null,
			};
		default:
			return {
				kieu: "o",
				giaTri: DA_LUU,
				daLuu: DA_LUU,
				coQuyen: true,
				dangLuu: false,
				loi: null,
			};
	}
}

function TheTenMien({ the }: { the: The }) {
	const oId = useId();
	const loiId = useId();
	const [nhap, setNhap] = useState<string | null>(null);

	const tieuDe = (
		<>
			<CardTitle>Tên miền nội bộ</CardTitle>
			<CardDescription>
				Địa chỉ thư thuộc các tên miền này là người của công ty: Theo dõi không
				lập hồ sơ khách cho họ, hộp thư không coi họ là đối tác.
			</CardDescription>
		</>
	);

	if (the.kieu === "dang-tai") {
		return (
			<Card aria-busy>
				<CardHeader>
					{tieuDe}
					<CardAction>
						<Skeleton className="h-9 w-16" />
					</CardAction>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-2">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-9 w-full" />
						<Skeleton className="h-4 w-2/3" />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (the.kieu === "loi-tai") {
		return (
			<Card>
				<CardHeader>{tieuDe}</CardHeader>
				<CardContent>
					<Empty>
						<EmptyHeader>
							<EmptyTitle>Không tải được tên miền nội bộ.</EmptyTitle>
							<EmptyDescription>
								Danh sách vẫn còn đó; lỗi chỉ ở lần tải này.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button variant="outline">Thử lại</Button>
						</EmptyContent>
					</Empty>
				</CardContent>
			</Card>
		);
	}

	const giaTri = nhap ?? the.giaTri;
	const daSua = giaTri !== the.daLuu;
	const khoa = !the.coQuyen || the.dangLuu;

	return (
		<Card>
			<CardHeader>
				{tieuDe}
				<CardAction>
					<Button
						type="submit"
						form="ten-mien-noi-bo"
						disabled={khoa || (!daSua && !the.dangLuu)}
					>
						{the.dangLuu ? <Spinner data-icon="inline-start" /> : null}
						Lưu
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent>
				<form id="ten-mien-noi-bo" onSubmit={(event) => event.preventDefault()}>
					<FieldGroup>
						<Field data-invalid={the.loi !== null || undefined}>
							<FieldLabel htmlFor={oId}>Tên miền</FieldLabel>
							<Input
								id={oId}
								value={giaTri}
								onChange={(event) => setNhap(event.target.value)}
								placeholder="onehub.center, onehub.vn"
								translate="no"
								autoComplete="off"
								autoCapitalize="off"
								autoCorrect="off"
								spellCheck={false}
								disabled={khoa}
								aria-invalid={the.loi !== null || undefined}
								aria-describedby={the.loi ? loiId : undefined}
							/>
							{the.loi ? <FieldError id={loiId}>{the.loi}</FieldError> : null}
							<FieldDescription>
								{the.coQuyen
									? giaTri.trim() === ""
										? "Chưa có tên miền nội bộ — máy chưa nhận ra người nhà ở Theo dõi và hộp thư."
										: "Ngăn bằng dấu phẩy. Không nhận tên miền thư công cộng như gmail.com."
									: "Chỉ chủ sở hữu hoặc quản trị đổi được tên miền nội bộ."}
							</FieldDescription>
						</Field>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
}

function KhoiCoSan({ tieuDe, dong }: { tieuDe: string; dong: string }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{tieuDe}</CardTitle>
				<CardDescription>{dong}</CardDescription>
			</CardHeader>
		</Card>
	);
}

function HopDaLaThanhVien() {
	const emailId = useId();
	const loiId = useId();

	return (
		<Dialog open>
			<DialogContent className="overscroll-contain">
				<DialogHeader>
					<DialogTitle>Cho phép một địa chỉ</DialogTitle>
					<DialogDescription>
						Người có địa chỉ này đăng nhập được, với vai trò bạn chọn.
					</DialogDescription>
				</DialogHeader>
				<FieldGroup>
					<Field data-invalid>
						<FieldLabel htmlFor={emailId}>Địa chỉ thư</FieldLabel>
						<Input
							id={emailId}
							defaultValue="Lan.Nguyen@OneHub.vn"
							translate="no"
							aria-invalid
							aria-describedby={loiId}
						/>
						<FieldError id={loiId}>
							That person is already a member. Change their role in the members
							table.
						</FieldError>
					</Field>
				</FieldGroup>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Thôi</Button>
					</DialogClose>
					<Button>Cho phép</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function ThanhVienVaoDungMau({ state }: { state: string }) {
	const nutHienSauLoi = state === "ST-dau-trang-sau-loi";

	return (
		<div data-proto-state={state}>
			<PageShell width="wide">
				<PageShellHeader>
					<PageShellHeading>
						<PageShellTitle>Thành viên</PageShellTitle>
						<PageShellDescription>
							Ai đã vào không gian làm việc, và ai được phép vào.
						</PageShellDescription>
					</PageShellHeading>
					<PageShellActions>
						<Button aria-haspopup="dialog">
							<Icon icon={Add} data-icon="inline-start" />
							Cho phép một địa chỉ
						</Button>
					</PageShellActions>
				</PageShellHeader>
				<PageShellContent>
					<div className="flex flex-col gap-8">
						{nutHienSauLoi ? (
							<FieldDescription>
								Bản mẫu: lần tải đầu của trang lỗi; truy vấn phía trình duyệt
								thử lại thành công và nút ở đầu trang hiện mà không tải lại
								trang.
							</FieldDescription>
						) : null}
						<KhoiCoSan
							tieuDe="Đã vào · 12"
							dong="Bảng thành viên như hiện có — không đổi trong vòng này."
						/>
						<KhoiCoSan
							tieuDe="Được phép vào · 3"
							dong="Thành viên hiện tại có dòng chờ cũ thôi bị liệt ở đây."
						/>
						<TheTenMien the={theCua(state)} />
					</div>
				</PageShellContent>
			</PageShell>
			{state === "ST-cho-phep-da-la-thanh-vien" ? <HopDaLaThanhVien /> : null}
		</div>
	);
}
