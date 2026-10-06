import "@crm/env/load";

import { db } from "@crm/db";
import { BLOB_NGUON } from "@crm/db/blob-nguon";
import { TRO_LY_OKR_KHOA } from "@crm/db/okr-tro-ly-danh-muc";
import { readContextDevKey } from "@crm/db/settings";
import { nguonKhoaMoHinh } from "./mo-hinh-khoa";
import { zaloToken } from "./zalo-api";

export const CONTEXT_DEV = "CONTEXT_DEV";

export const CONTEXT_DEV_PEOPLE = "CONTEXT_DEV_PEOPLE";

export const CONTEXT_DEV_SOURCE = "Context.dev key (Settings → General)";

export type Capability = {
	readonly id: string;
	readonly label: string;
	readonly gives: string;
	readonly enabled: boolean;
	readonly from: string;
};

export async function contextDevKey(): Promise<string | null> {
	try {
		return await readContextDevKey(db);
	} catch (error) {
		console.error(
			`[agent] could not read the Context.dev key from the database: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);

		return null;
	}
}

export const LUU_NGUON = "LUU_NGUON";

async function coTokenZalo(): Promise<boolean> {
	try {
		return (await zaloToken()) !== null;
	} catch (error) {
		console.error(
			`[agent] could not read the Zalo bot token: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		return false;
	}
}

export async function capabilities(): Promise<readonly Capability[]> {
	const [contextDev, nguon, zalo] = await Promise.all([
		contextDevKey(),
		nguonKhoaMoHinh({ rieng: false }),
		coTokenZalo(),
	]);
	return capabilitiesFrom(contextDev, nguon !== null, zalo);
}

export function capabilitiesFrom(
	contextDev: string | null,
	coMoHinh = false,
	coZalo = Boolean(process.env.ZALO_BOT_TOKEN?.trim()),
): readonly Capability[] {
	const fromEnv = (id: string) => ({
		id,
		from: id,
		enabled: Boolean(process.env[id]?.trim()),
	});

	return [
		{
			...fromEnv("PERPLEXITY_API_KEY"),
			label: "Web research",
			gives:
				"open-web context with citations, and the search that finds a LinkedIn slug in the first place",
		},
		{
			id: CONTEXT_DEV,
			from: "Settings → General",
			label: "Company brand data",
			gives: "a company's logo, industry, location and socials from its domain",
			enabled: contextDev !== null,
		},
		{
			id: CONTEXT_DEV_PEOPLE,
			from: "Settings → General",
			label: "LinkedIn",
			gives:
				"a person read back from a LinkedIn URL you already hold — their real name, bio, current title and employer, every earlier role with its dates, their education and their other public profiles, all self-reported and so authoritative on identity",
			enabled: contextDev !== null,
		},
		{
			...fromEnv("BLOB_READ_WRITE_TOKEN"),
			label: "Picture storage",
			gives:
				"somewhere to keep a logo or a profile photo. Without it a record has no picture at all, because the URLs these sources hand back expire and are never stored as they are",
		},
		{
			id: LUU_NGUON,
			from: BLOB_NGUON.bienKhoa,
			label: "Document sources",
			gives:
				"somewhere to keep the Word and PDF files people upload to the document library, and to read them back for drafting. Without it nothing can be uploaded and no page is drafted from a file",
			enabled: Boolean(process.env[BLOB_NGUON.bienKhoa]?.trim()),
		},
		{
			...fromEnv("KHO_TAI_LIEU_AI_GATEWAY_API_KEY"),
			label: "Document library key",
			gives:
				"a separate AI Gateway key for the document library — the machine that drafts pages from uploaded files and the AI assistant that answers questions from approved pages — so their spend is billed apart. Without it both run on the shared model key",
		},
		{
			id: "ZALO_BOT_TOKEN",
			from: "Zalo bot token (Settings › Connections › Zalo) or ZALO_BOT_TOKEN",
			enabled: coZalo,
			label: "Zalo reminders",
			gives:
				"the morning reminder on Zalo for anyone who linked their Zalo, and the bot that answers link codes",
		},
		{
			id: "MO_HINH_AI",
			from: `${TRO_LY_OKR_KHOA.chung} or Vercel OIDC`,
			label: "AI model",
			gives:
				"every model call, including Trợ lý OKR. Without it Trợ lý OKR tasks close at once as «chua-co-khoa-mo-hinh» and no session opens",
			enabled: coMoHinh,
		},
		{
			id: "GOOGLE_SHEETS_KHOA",
			from: "GOOGLE_SHEETS_EMAIL + GOOGLE_SHEETS_KHOA",
			label: "Google Sheets",
			gives:
				"the daily number of an OKR key result read from a cell of a Google Sheet shared with the service account. The dispatch tick reads it; there is no tool for it in a session",
			enabled: Boolean(
				process.env.GOOGLE_SHEETS_EMAIL?.trim() &&
					process.env.GOOGLE_SHEETS_KHOA?.trim(),
			),
		},
	];
}

export async function enabled(id: string): Promise<boolean> {
	return (await capabilities()).some(
		(capability) => capability.id === id && capability.enabled,
	);
}

export type UnavailableCapability = {
	ok: false;
	configured: false;
	reason: string;
};

export function unavailable(env: string): UnavailableCapability {
	return {
		ok: false,
		configured: false,
		reason:
			`This install has no ${env}, so that source is unavailable. This is not a failure and retrying will not help — ` +
			"use what the CRM already knows, and say in your write-up what you could not check.",
	};
}

export async function logCapabilities(): Promise<void> {
	for (const capability of await capabilities()) {
		console.log(
			`[agent] ${capability.enabled ? "on " : "off"}  ${capability.label} (${capability.from})`,
		);
	}
}

export async function capabilitiesMarkdown(): Promise<string> {
	return markdownFor(await capabilities());
}

export function markdownFor(all: readonly Capability[]): string {
	const on = all.filter((capability) => capability.enabled);
	const off = all.filter((capability) => !capability.enabled);

	const lines = ["## What you can use here", ""];

	if (on.length === 0) {
		lines.push(
			"No outside sources are configured on this install. Everything you can",
			"learn is already in the CRM — email threads, meetings, signature",
			"blocks — and `read_crm_history` reads all of it for free. That is",
			"often enough to settle who somebody is. Record what it shows, and",
			"leave the rest empty.",
		);
		return lines.join("\n");
	}

	lines.push("Available:");
	for (const capability of on) {
		lines.push(`- **${capability.label}** — ${capability.gives}.`);
	}

	if (off.length > 0) {
		lines.push("", "Not configured here, so do not plan around them:");
		for (const capability of off) {
			lines.push(`- ${capability.label}`);
		}
		lines.push(
			"",
			"Their tools will tell you the same thing if you call them. Note what",
			"you could not check rather than guessing at it.",
		);
	}

	return lines.join("\n");
}
