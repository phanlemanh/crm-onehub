"use client";

import {
	Conversation,
	ConversationContent,
} from "@crm/ui/components/ai-elements/conversation";
import {
	Message,
	MessageContent,
} from "@crm/ui/components/ai-elements/message";
import {
	PromptInput,
	PromptInputBody,
	PromptInputFooter,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputTools,
} from "@crm/ui/components/ai-elements/prompt-input";
import {
	Suggestion,
	Suggestions,
} from "@crm/ui/components/ai-elements/suggestion";
import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { FieldDescription } from "@crm/ui/components/field";
import Logo from "@crm/ui/components/logo";
import { MessageAvatar } from "@crm/ui/components/message";
import { SectionHeading } from "@crm/ui/components/section-heading";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@crm/ui/components/tabs";
import { ThinkingIndicator } from "@crm/ui/components/thinking-indicator";
import type { ReactNode } from "react";
import { BanNhap, type HinhNhap, soDong } from "./ban-nhap";
import {
	type CauHoiMoDau,
	DON_VI,
	HOI_THOAI,
	HOI_THOAI_BI_LOAI,
	HOI_THOAI_SUA,
	KY_SOAN,
	type LuotChat,
	MO_DAU,
	SO_KR,
	TRAN,
} from "./du-lieu";

export type HinhSoan =
	| "mo-dau"
	| "thieu-boi-canh"
	| "dang-tra-loi"
	| "ban-nhap"
	| "dong-sua"
	| "dong-da-quyet"
	| "sua-qua-chat"
	| "dong-bi-loai"
	| "loi"
	| "het-luot"
	| "dua-vao-xac-nhan"
	| "dua-vao-thieu-dich"
	| "da-dua-vao"
	| "dua-vao-loi"
	| "hep";

const HINH_NHAP = {
	"mo-dau": "rong",
	"thieu-boi-canh": "rong",
	"dang-tra-loi": "rong",
	"ban-nhap": "co",
	"dong-sua": "sua",
	"dong-da-quyet": "da-quyet",
	"sua-qua-chat": "sua-qua-chat",
	"dong-bi-loai": "bi-loai",
	loi: "co",
	"het-luot": "co",
	"dua-vao-xac-nhan": "co",
	"dua-vao-thieu-dich": "thieu-dich",
	"da-dua-vao": "da-dua-vao",
	"dua-vao-loi": "dua-vao-loi",
	hep: "co",
} as const satisfies Record<HinhSoan, HinhNhap>;

const LUOT_DA_DUNG = {
	"mo-dau": 1,
	"thieu-boi-canh": 1,
	"dang-tra-loi": 2,
	"ban-nhap": 2,
	"dong-sua": 2,
	"dong-da-quyet": 2,
	"sua-qua-chat": 3,
	"dong-bi-loai": 2,
	loi: 2,
	"het-luot": 12,
	"dua-vao-xac-nhan": 3,
	"dua-vao-thieu-dich": 3,
	"da-dua-vao": 3,
	"dua-vao-loi": 3,
	hep: 2,
} as const satisfies Record<HinhSoan, number>;

function AvatarTroLy() {
	return (
		<MessageAvatar square>
			<Logo className="size-5" />
		</MessageAvatar>
	);
}

function CauHoi({ cau }: { cau: CauHoiMoDau }) {
	return (
		<div className="flex flex-col gap-2" data-cau-hoi={cau.id}>
			<p>{cau.hoi}</p>
			<Suggestions aria-label={`Gợi ý trả lời: ${cau.hoi}`}>
				{cau.goiY.map((g) => (
					<Suggestion key={g} suggestion={g} data-goi-y />
				))}
			</Suggestions>
		</div>
	);
}

function LuotMoDau() {
	return (
		<div className="flex min-w-0 gap-2" data-luot="mo-dau">
			<AvatarTroLy />
			<Message from="assistant" className="min-w-0">
				<MessageContent>
					<p translate="no">{MO_DAU.daBiet}</p>
					{MO_DAU.cauHoi.map((c) => (
						<CauHoi key={c.id} cau={c} />
					))}
				</MessageContent>
			</Message>
		</div>
	);
}

function Luot({ luot }: { luot: LuotChat }) {
	if (luot.tu === "nguoi") {
		return (
			<Message from="user" className="min-w-0" data-luot={luot.id}>
				<MessageContent className="text-pretty" translate="no">
					{luot.chu}
				</MessageContent>
			</Message>
		);
	}
	return (
		<div className="flex min-w-0 gap-2" data-luot={luot.id}>
			<AvatarTroLy />
			<Message from="assistant" className="min-w-0">
				<MessageContent translate="no">{luot.chu}</MessageContent>
			</Message>
		</div>
	);
}

function LuotLoi() {
	return (
		<div className="flex min-w-0 gap-2" data-luot="loi">
			<AvatarTroLy />
			<Message from="assistant" className="min-w-0">
				<MessageContent>
					<Alert role="alert">
						<AlertTitle>Trợ lý OKR chưa trả lời được</AlertTitle>
						<AlertDescription>
							Quá 45 giây không có hồi âm. Bản nháp bên phải giữ nguyên.
						</AlertDescription>
					</Alert>
					<Button size="sm" variant="outline" className="w-fit">
						Thử lại
					</Button>
				</MessageContent>
			</Message>
		</div>
	);
}

function luotCua(hinh: HinhSoan): LuotChat[] {
	if (hinh === "sua-qua-chat") return HOI_THOAI_SUA;
	if (hinh === "dong-bi-loai") return HOI_THOAI_BI_LOAI;
	if (hinh === "dang-tra-loi" || hinh === "loi") return HOI_THOAI.slice(0, 1);
	if (hinh === "mo-dau" || hinh === "thieu-boi-canh") return [];
	return HOI_THOAI;
}

function DaiThieuBoiCanh() {
	return (
		<Alert variant="warning" role="note" data-dai="thieu-boi-canh">
			<AlertTitle>
				Chưa có Hồ sơ công ty và Chiến lược năm — Trợ lý soạn với ít bối cảnh
				hơn
			</AlertTitle>
			<AlertDescription>
				Viết hai trang loại «Chiến lược» trong Kho tài liệu rồi duyệt; cuộc sau
				Trợ lý sẽ đọc.
			</AlertDescription>
			<AlertAction>
				<Button size="sm" variant="outline">
					Tới Kho tài liệu
				</Button>
			</AlertAction>
		</Alert>
	);
}

function OSoan({ hinh }: { hinh: HinhSoan }) {
	const khoa = hinh === "dang-tra-loi" || hinh === "het-luot";
	return (
		<div className="flex flex-col gap-2 border-t pt-3">
			<PromptInput
				onSubmit={() => undefined}
				data-o-soan={khoa ? "khoa" : "mo"}
			>
				<PromptInputBody>
					<PromptInputTextarea
						aria-label="Nhắn Trợ lý OKR"
						placeholder="Trả lời, hoặc nói bạn muốn đổi gì trong bản nháp…"
						disabled={khoa}
						translate="no"
					/>
				</PromptInputBody>
				<PromptInputFooter>
					<PromptInputTools />
					<PromptInputSubmit
						status={hinh === "dang-tra-loi" ? "streaming" : "ready"}
						disabled={khoa}
					/>
				</PromptInputFooter>
			</PromptInput>
			<FieldDescription>
				{hinh === "het-luot"
					? `Đã dùng hết ${TRAN.luotMoiCuoc} lượt của cuộc này — đưa vào bộ OKR hoặc mở cuộc mới.`
					: hinh === "dang-tra-loi"
						? "Ô soạn mở lại khi Trợ lý trả lời xong."
						: "Enter gửi · Shift+Enter xuống dòng"}
			</FieldDescription>
			{hinh === "het-luot" ? (
				<Button size="sm" variant="outline" className="w-fit">
					Mở cuộc mới
				</Button>
			) : null}
		</div>
	);
}

function CotHoiThoai({ hinh }: { hinh: HinhSoan }) {
	const luot = luotCua(hinh);
	return (
		<section
			aria-label="Trò chuyện với Trợ lý OKR"
			className="flex min-h-0 flex-1 flex-col"
			data-cot="hoi-thoai"
		>
			{hinh === "thieu-boi-canh" ? <DaiThieuBoiCanh /> : null}
			<Conversation>
				<ConversationContent>
					<LuotMoDau />
					{luot.map((l) => (
						<Luot key={l.id} luot={l} />
					))}
					{hinh === "dang-tra-loi" ? (
						<div
							className="flex min-w-0 gap-2"
							role="status"
							aria-live="polite"
							aria-busy="true"
						>
							<AvatarTroLy />
							<ThinkingIndicator label="Trợ lý OKR đang soạn…" />
						</div>
					) : null}
					{hinh === "loi" ? <LuotLoi /> : null}
				</ConversationContent>
			</Conversation>
			<OSoan hinh={hinh} />
		</section>
	);
}

function CotBanNhap({ hinh, tieuDe }: { hinh: HinhSoan; tieuDe: boolean }) {
	return (
		<section
			aria-label="Bản nháp"
			className="flex min-h-0 flex-col gap-3 overflow-y-auto"
			data-cot="ban-nhap"
		>
			{tieuDe ? (
				<SectionHeading
					actions={
						<Badge variant="outline">{soDong(HINH_NHAP[hinh])} dòng</Badge>
					}
				>
					Bản nháp
				</SectionHeading>
			) : null}
			<BanNhap hinh={HINH_NHAP[hinh]} />
		</section>
	);
}

function ThanHep({ hinh }: { hinh: HinhSoan }) {
	return (
		<Tabs defaultValue="tro-chuyen" className="min-h-0 flex-1" data-khong="hep">
			<TabsList aria-label="Màn soạn" className="w-full">
				<TabsTrigger value="tro-chuyen">Trò chuyện</TabsTrigger>
				<TabsTrigger value="ban-nhap">
					Bản nháp ({soDong(HINH_NHAP[hinh])})
				</TabsTrigger>
			</TabsList>
			<TabsContent value="tro-chuyen" className="flex min-h-0 flex-1 flex-col">
				<CotHoiThoai hinh={hinh} />
			</TabsContent>
			<TabsContent value="ban-nhap" className="min-h-0 flex-1">
				<CotBanNhap hinh={hinh} tieuDe={false} />
			</TabsContent>
		</Tabs>
	);
}

function ThanRong({ hinh }: { hinh: HinhSoan }) {
	return (
		<div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-2" data-khong="rong">
			<CotHoiThoai hinh={hinh} />
			<CotBanNhap hinh={hinh} tieuDe />
		</div>
	);
}

function HopXacNhan() {
	return (
		<ConfirmDialog
			open
			onOpenChange={() => undefined}
			onConfirm={() => undefined}
			pending={false}
			tone="default"
			tieuDe="Đưa vào bộ OKR"
			than={`Tạo 3 Mục tiêu và ${SO_KR} KR, đích do bạn đặt, ở trạng thái nháp cho ${DON_VI.ten}, ${KY_SOAN.ngan}?`}
			nut="Đưa vào"
			thoi="Huỷ"
		/>
	);
}

export function ManSoan({
	hinh,
	children,
}: {
	hinh: HinhSoan;
	children: ReactNode;
}) {
	return (
		<>
			{children}
			<Sheet open>
				<SheetContent side="right" size="2xl" data-man-soan={hinh}>
					<SheetHeader>
						<SheetTitle size="lg">Soạn OKR cùng Trợ lý</SheetTitle>
						<SheetDescription>
							<span translate="no">{DON_VI.ten}</span> · {KY_SOAN.ten} · lượt{" "}
							<span className="tabular-nums">
								{LUOT_DA_DUNG[hinh]}/{TRAN.luotMoiCuoc}
							</span>
						</SheetDescription>
					</SheetHeader>
					<div className="flex min-h-0 flex-1 flex-col px-4 pb-4">
						{hinh === "hep" ? (
							<ThanHep hinh={hinh} />
						) : (
							<ThanRong hinh={hinh} />
						)}
					</div>
				</SheetContent>
			</Sheet>
			{hinh === "dua-vao-xac-nhan" ? <HopXacNhan /> : null}
		</>
	);
}
