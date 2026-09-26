"use client";

import Book from "@carbon/icons-react/es/Book";
import { Badge } from "@crm/ui/components/badge";
import { Bubble, BubbleContent } from "@crm/ui/components/bubble";
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
import { HOI_THOAI } from "./du-lieu";

export function HoiTacNhan() {
	return (
		<div className="flex min-w-0 flex-1 flex-col gap-4 p-6">
			<div className="flex">
				<PageShellTitle>Hội thoại</PageShellTitle>
			</div>
			<MessageGroup className="max-w-2xl gap-6">
				<Message align="end">
					<MessageAvatar>
						<PersonAvatar name="Lê Quang Vinh" size="sm" />
					</MessageAvatar>
					<MessageContent>
						<Bubble variant="muted">
							<BubbleContent>{HOI_THOAI.hoi}</BubbleContent>
						</Bubble>
					</MessageContent>
				</Message>
				<Message>
					<MessageAvatar square>
						<Icon icon={Bot} />
					</MessageAvatar>
					<MessageContent>
						<MessageHeader>Tác nhân · đọc 1 trang tài liệu</MessageHeader>
						<div className="px-3">
							<Markdown className="text-sm/6">{HOI_THOAI.tra}</Markdown>
						</div>
						<div className="flex flex-wrap gap-2 px-3">
							{HOI_THOAI.trich.map((t) => (
								<Badge key={t.muc} variant="outline">
									<Icon icon={Book} />
									<span translate="no">{t.trang}</span>
									<span className="text-muted-foreground">› {t.muc}</span>
								</Badge>
							))}
						</div>
					</MessageContent>
				</Message>
			</MessageGroup>
		</div>
	);
}
