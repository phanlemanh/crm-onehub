import { parseAsStringLiteral } from "nuqs/server";

export const TIMELINE_TABS = ["all", "notes", "email", "meetings"] as const;

export type TimelineTab = (typeof TIMELINE_TABS)[number];

export const timelineTabParser =
	parseAsStringLiteral(TIMELINE_TABS).withDefault("all");
