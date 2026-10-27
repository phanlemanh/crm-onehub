import { congNghienCuu } from "@crm/validation/cong-nghien-cuu";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { API_URL } from "@/lib/env";

export const ONBOARDING_PATH = "/onboarding";

export const RESEARCH_PATH = "/onboarding/research";

const GATE_TIMEOUT_MS = 2_000;

const HTTP_HET_PHIEN = 401;

export type Gate = "settled" | "required" | "unknown";

const procedureResult = z
	.object({ result: z.object({ data: z.json() }).catch({ data: null }) })
	.catch({ result: { data: null } });

const workspaceAnswer = z
	.object({
		onboarded: z.boolean().nullable().catch(null),
		canRename: z.boolean().nullable().catch(null),
		slug: z.string().min(1).nullable().catch(null),
		viewerRole: z.string().nullable().optional(),
	})
	.catch({ onboarded: null, canRename: null, slug: null });

type Doc = { hetPhien: boolean; data: unknown };

const KHONG_DOC: Doc = { hetPhien: false, data: null };

export async function readProcedure(
	request: NextRequest,
	procedure: string,
): Promise<Doc> {
	const cookie = request.headers.get("cookie");

	if (!cookie) return KHONG_DOC;

	try {
		const response = await fetch(`${API_URL}/api/trpc/${procedure}`, {
			headers: { cookie },
			cache: "no-store",
			signal: AbortSignal.timeout(GATE_TIMEOUT_MS),
		});

		if (response.status === HTTP_HET_PHIEN) {
			return { hetPhien: true, data: null };
		}

		if (!response.ok) return KHONG_DOC;

		return {
			hetPhien: false,
			data: procedureResult.parse(await response.json()).result.data,
		};
	} catch {
		return KHONG_DOC;
	}
}

export type WorkspaceGate = {
	gate: Gate;
	slug: string | null;
	inWorkspace: boolean | null;
	viewerRole: string | null;
	hetPhien: boolean;
};

export async function readWorkspaceGate(
	request: NextRequest,
): Promise<WorkspaceGate> {
	const doc = await readProcedure(request, "workspace.get");
	const workspace = workspaceAnswer.parse(doc.data);

	const slug = workspace.slug;
	const viewerRole = workspace.viewerRole ?? null;

	if (workspace.onboarded === null) {
		return {
			gate: "unknown",
			slug,
			inWorkspace: null,
			viewerRole,
			hetPhien: doc.hetPhien,
		};
	}

	return {
		gate:
			workspace.onboarded || workspace.canRename !== true
				? "settled"
				: "required",
		slug,
		inWorkspace:
			workspace.viewerRole === undefined ? null : workspace.viewerRole !== null,
		viewerRole,
		hetPhien: doc.hetPhien,
	};
}

export async function readResearchGate(request: NextRequest): Promise<Gate> {
	return congNghienCuu(
		(await readProcedure(request, "settings.researchKey")).data,
	);
}
