import ArrowRight from "@carbon/icons-react/es/ArrowRight";
import Chat from "@carbon/icons-react/es/Chat";
import Email from "@carbon/icons-react/es/Email";
import Events from "@carbon/icons-react/es/Events";
import MagicWand from "@carbon/icons-react/es/MagicWand";
import Phone from "@carbon/icons-react/es/Phone";
import Roadmap from "@carbon/icons-react/es/Roadmap";
import Task from "@carbon/icons-react/es/Task";
import type { ActivityType } from "@crm/db/enums";
import type { CarbonIcon } from "@crm/ui/components/icon";
import type { Locale } from "@crm/ui/lib/locale";
import { crmMessages } from "@/lib/messages/crm";

type ActivityPresentation = Record<
	ActivityType,
	{
		icon: CarbonIcon;
		khoa: keyof ReturnType<typeof crmMessages>["timeline"]["type"];
	}
>;

const PRESENTATION: ActivityPresentation = {
	NOTE: { icon: Chat, khoa: "note" },
	CALL: { icon: Phone, khoa: "call" },
	EMAIL: { icon: Email, khoa: "email" },
	MEETING: { icon: Events, khoa: "meeting" },
	TASK: { icon: Task, khoa: "task" },
	STAGE_CHANGE: { icon: ArrowRight, khoa: "stageChange" },
	ENRICHMENT: { icon: MagicWand, khoa: "enrichment" },
	PLAN_CHANGE: { icon: Roadmap, khoa: "planChange" },
};

export function activityLabel(type: ActivityType, locale: Locale): string {
	return crmMessages(locale).timeline.type[PRESENTATION[type].khoa];
}

export function activityIcon(type: ActivityType): CarbonIcon {
	return PRESENTATION[type].icon;
}
