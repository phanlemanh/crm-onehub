import {
	SESSION_PURPOSES,
	type SessionPurpose,
} from "@crm/validation/phien-tac-tu";
import { z } from "zod";
import { ZALO } from "./zalo-config";

export { SESSION_PURPOSES, type SessionPurpose };

type SessionAttributes = Readonly<Record<string, string | readonly string[]>>;

export type PurposeContext = {
	readonly session: {
		readonly auth: {
			readonly current: {
				readonly attributes: SessionAttributes;
			} | null;
			readonly initiator: {
				readonly attributes: SessionAttributes;
			} | null;
		};
	};
};

const attributeText = z.string().trim().min(1).nullable().catch(null);

const sessionPurpose = z.enum(SESSION_PURPOSES).catch("research");

export function purposeOf(ctx: PurposeContext): SessionPurpose {
	return sessionPurpose.parse(attribute(ctx, "purpose"));
}

export function attribute(ctx: PurposeContext, key: string): string | null {
	return (
		attributeText.parse(ctx.session.auth.current?.attributes[key]) ??
		attributeText.parse(ctx.session.auth.initiator?.attributes[key])
	);
}

export function requireAttribute(ctx: PurposeContext, key: string): string {
	const value = attribute(ctx, key);
	if (!value) throw new Error(`This session is missing ${key}.`);
	return value;
}

export function builderTurnAuthorized(ctx: PurposeContext): boolean {
	return (
		purposeOf(ctx) === "builder" &&
		attribute(ctx, "commandType") === "CREATE_AGENT"
	);
}

export function requireBuilderAttribute(
	ctx: PurposeContext,
	key: string,
): string {
	if (!builderTurnAuthorized(ctx)) {
		throw new Error(
			"Agent creation requires an explicit request to create or build an agent.",
		);
	}
	return requireAttribute(ctx, key);
}

export function requireTeamAgentAttribute(
	ctx: PurposeContext,
	key: string,
): string {
	if (purposeOf(ctx) !== "team-agent") {
		throw new Error(
			"This deployed-agent tool is unavailable for this session.",
		);
	}
	return requireAttribute(ctx, key);
}

export function assertResearchPurpose(ctx: PurposeContext): void {
	if (purposeOf(ctx) !== "research") {
		throw new Error("This CRM research tool is unavailable for this session.");
	}
}

export function assertNotZaloQuestion(ctx: PurposeContext): void {
	if (purposeOf(ctx) === "zalo") throw new Error(ZALO.hoi.tuChoiGhi);
}
