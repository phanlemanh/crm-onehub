import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { Empty, EmptyHeader, EmptyTitle } from "@crm/ui/components/empty";
import { Separator } from "@crm/ui/components/separator";

const DOI_TAC = [
	{ ten: "Ngân hàng Đại Nam", loai: "RM ngân hàng", trangThai: "Đang theo" },
	{ ten: "Sàn Phương Bắc", loai: "Môi giới", trangThai: "Mới" },
	{ ten: "Công ty Tân Việt", loai: "Môi giới", trangThai: "Đã ký" },
];

const DAI = Array.from({ length: 24 }, (_, i) => ({
	ten: `Đối tác số ${i + 1} với một cái tên rất dài để thử tràn dòng`,
	loai: i % 2 === 0 ? "Môi giới" : "RM ngân hàng",
	trangThai: "Đang theo",
}));

export function DuongProtoMau({ state }: { state: string }) {
	if (state === "rong") {
		return (
			<Card>
				<CardContent>
					<Empty>
						<EmptyHeader>
							<EmptyTitle>Chưa có đối tác nào</EmptyTitle>
						</EmptyHeader>
					</Empty>
				</CardContent>
			</Card>
		);
	}

	if (state === "dang-tai") {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Đối tác</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-3">
						<div className="h-5 w-2/3 animate-pulse rounded-md bg-muted" />
						<div className="h-5 w-1/2 animate-pulse rounded-md bg-muted" />
						<div className="h-5 w-3/5 animate-pulse rounded-md bg-muted" />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (state === "loi") {
		return (
			<Alert variant="destructive">
				<AlertTitle>Không tải được danh sách đối tác</AlertTitle>
				<AlertDescription>
					Máy chủ không trả lời. Thử lại sau ít phút.
				</AlertDescription>
			</Alert>
		);
	}

	const hang = state === "tran-dai" ? DAI : DOI_TAC;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Đối tác</CardTitle>
				<CardDescription>{hang.length} đối tác đang theo dõi</CardDescription>
			</CardHeader>
			<CardContent>
				<ul className="flex flex-col gap-3">
					{hang.map((d) => (
						<li key={d.ten} className="flex flex-col gap-2">
							<div className="flex items-center justify-between gap-3">
								<span className="truncate font-medium">{d.ten}</span>
								<Badge variant="secondary">{d.trangThai}</Badge>
							</div>
							<span className="text-muted-foreground text-sm">{d.loai}</span>
							<Separator />
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}
