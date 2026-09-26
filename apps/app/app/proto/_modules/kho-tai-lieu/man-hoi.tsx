"use client";

import Book from "@carbon/icons-react/es/Book";
import { Badge } from "@crm/ui/components/badge";
import { Bubble, BubbleContent } from "@crm/ui/components/bubble";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import Bot from "@crm/ui/components/icons/bot";
import { Markdown } from "@crm/ui/components/markdown";
import {
	Message,
	MessageAvatar,
	MessageContent,
	MessageGroup,
	MessageHeader,
} from "@crm/ui/components/message";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import { PageShellTitle } from "@/components/page-shell";
import { HOI_THOAI, HOI_TU_CHOI } from "./du-lieu";

function CauHoi({ chu }: { chu: string }) {
	return (
		<Message align="end">
			<MessageAvatar>
				<PersonAvatar name="Lê Quang Vinh" size="sm" />
			</MessageAvatar>
			<MessageContent>
				<Bubble variant="muted">
					<BubbleContent>{chu}</BubbleContent>
				</Bubble>
			</MessageContent>
		</Message>
	);
}

function TraLoi() {
	return (
		<Message>
			<MessageAvatar square>
				<Icon icon={Bot} />
			</MessageAvatar>
			<MessageContent>
				<MessageHeader>Trợ lý AI · đọc 1 trang tài liệu đã duyệt</MessageHeader>
				<div className="px-3">
					<Markdown className="text-sm/6">{HOI_THOAI.tra}</Markdown>
				</div>
				<ul className="flex flex-col gap-2 px-3" data-trich-dan="">
					{HOI_THOAI.trich.map((t) => (
						<li
							className="flex flex-col gap-1 rounded-lg border p-2 text-xs"
							key={t.muc}
						>
							<span className="flex items-center gap-2 font-medium">
								<Icon icon={Book} />
								<span translate="no">{t.trang}</span>
								<span className="text-muted-foreground">› {t.muc}</span>
							</span>
							<span className="text-muted-foreground" translate="no">
								«{t.doan}»
							</span>
							<span className="text-muted-foreground">{t.ban}</span>
						</li>
					))}
				</ul>
				<div className="px-3">
					<Button size="sm" variant="ghost">
						Báo câu trả lời này sai
					</Button>
				</div>
			</MessageContent>
		</Message>
	);
}

function TuChoi() {
	return (
		<Message>
			<MessageAvatar square>
				<Icon icon={Bot} />
			</MessageAvatar>
			<MessageContent data-tu-choi="">
				<MessageHeader>
					Trợ lý AI · không có trang đã duyệt phù hợp
				</MessageHeader>
				<p className="px-3 text-sm/6">{HOI_TU_CHOI.tra}</p>
				<div className="flex flex-wrap items-center gap-2 px-3 text-xs">
					<span className="text-muted-foreground">Trang gần nhất:</span>
					{HOI_TU_CHOI.ganNhat.map((t) => (
						<Badge key={t} variant="outline">
							<span translate="no">{t}</span>
						</Badge>
					))}
				</div>
				<p className="px-3 text-muted-foreground text-xs">
					Câu hỏi đã vào hàng «chưa trả lời được» của chủ trang.
				</p>
			</MessageContent>
		</Message>
	);
}

export function HoiTacNhan({ tuChoi = false }: { tuChoi?: boolean }) {
	return (
		<div className="flex min-w-0 flex-1 flex-col gap-4 p-6">
			<div className="flex">
				<PageShellTitle>Hội thoại</PageShellTitle>
			</div>
			<MessageGroup className="max-w-2xl gap-6">
				<CauHoi chu={tuChoi ? HOI_TU_CHOI.hoi : HOI_THOAI.hoi} />
				{tuChoi ? <TuChoi /> : <TraLoi />}
			</MessageGroup>
		</div>
	);
}
