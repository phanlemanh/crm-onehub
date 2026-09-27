"use client";

import { AsyncButtonContent } from "@crm/ui/components/async-action";
import { Button } from "@crm/ui/components/button";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemFooter,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SESSION_LIMIT_OPTION_IDS } from "@crm/validation/builder-question";
import { useState } from "react";
import { oSoanMessages } from "../lib/messages/agent-builder-o-soan";
import { AGENT_COMPOSER_CLASS_NAME } from "./agent-composer-frame";

export type SessionLimitAnswer =
	(typeof SESSION_LIMIT_OPTION_IDS)[keyof typeof SESSION_LIMIT_OPTION_IDS];

export type SessionLimitResponse = {
	requestId: string;
	optionId: SessionLimitAnswer;
};

export function AgentSessionLimitComposer({
	requestId,
	pending,
	onAnswer,
}: {
	requestId: string;
	pending: boolean;
	onAnswer: (response: SessionLimitResponse) => Promise<void>;
}) {
	const locale = useLocale();
	const t = oSoanMessages(locale);
	const [sending, setSending] = useState<SessionLimitAnswer | null>(null);
	const locked = pending || sending !== null;

	const answer = async (optionId: SessionLimitAnswer) => {
		if (locked) return;
		setSending(optionId);
		try {
			await onAnswer({ requestId, optionId });
		} catch {
			setSending(null);
		}
	};

	const status = (optionId: SessionLimitAnswer) =>
		sending === optionId ? "pending" : "idle";

	return (
		<div className={AGENT_COMPOSER_CLASS_NAME}>
			<Item>
				<ItemContent>
					<p className="text-sm">{t.hetHanMuc.cau}</p>
				</ItemContent>
				<ItemFooter>
					<ItemActions>
						<Button
							size="sm"
							disabled={locked}
							aria-busy={sending === SESSION_LIMIT_OPTION_IDS.continue}
							onClick={() => void answer(SESSION_LIMIT_OPTION_IDS.continue)}
						>
							<AsyncButtonContent
								status={status(SESSION_LIMIT_OPTION_IDS.continue)}
								pendingLabel={t.oSoan.dangGui}
							>
								{t.hetHanMuc.capThem}
							</AsyncButtonContent>
						</Button>
						<Button
							size="sm"
							variant="outline"
							disabled={locked}
							aria-busy={sending === SESSION_LIMIT_OPTION_IDS.stop}
							onClick={() => void answer(SESSION_LIMIT_OPTION_IDS.stop)}
						>
							<AsyncButtonContent
								status={status(SESSION_LIMIT_OPTION_IDS.stop)}
								pendingLabel={t.oSoan.dangGui}
							>
								{t.hetHanMuc.dung}
							</AsyncButtonContent>
						</Button>
					</ItemActions>
				</ItemFooter>
			</Item>
		</div>
	);
}
