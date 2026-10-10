import { AUTH_COOKIE_PREFIX } from "@crm/auth/cookies";
import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
import { isMarketing } from "@/lib/env";
import {
	ONBOARDING_PATH,
	RESEARCH_PATH,
	readResearchGate,
	readWorkspaceGate,
} from "@/lib/onboarding";
import { dieuHuongTheoVai } from "@/lib/pham-vi-man";
import { duongProtoHopLe, PROTO_PREFIX, protoMoDuoc } from "@/lib/proto-gate";
import { isAnonymous, isUnder } from "@/lib/proxy-paths";
import { workspaceUrl } from "@/lib/workspace-url";

const LANDING_PATH = "/";

const SIGN_IN_PATH = "/sign-in";

const NO_WORKSPACE_PATH = "/het-quyen";

const SET_PASSWORD_PATH = "/dat-mat-khau";

export const UNGATED = [
	"/grant-access",
	"/eve",
	NO_WORKSPACE_PATH,
	SET_PASSWORD_PATH,
];

const SECTIONS = [
	"/campaigns",
	"/companies",
	"/contacts",
	"/deals",
	"/lo-trinh",
	"/okr",
	"/settings",
];

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (pathname === SIGN_IN_PATH) return NextResponse.next();

	if (isUnder(pathname, PROTO_PREFIX)) {
		if (!protoMoDuoc()) return new NextResponse(null, { status: 404 });

		const state = request.nextUrl.searchParams.get("state");
		if (!duongProtoHopLe(pathname, state))
			return new NextResponse(null, { status: 404 });
	}

	if (isAnonymous(pathname)) return NextResponse.next();

	if (
		getSessionCookie(request, { cookiePrefix: AUTH_COOKIE_PREFIX }) === null
	) {
		return isPublic(pathname)
			? NextResponse.next()
			: NextResponse.redirect(new URL(SIGN_IN_PATH, request.nextUrl));
	}

	if (isUngated(pathname)) return NextResponse.next();

	// Both answers, every time, and concurrently — so the gate costs one round
	// trip rather than two, and neither answer can be stale.
	const [workspace, research] = await Promise.all([
		readWorkspaceGate(request),
		readResearchGate(request),
	]);

	if (workspace.hetPhien && !isPublic(pathname)) {
		return NextResponse.redirect(new URL(SIGN_IN_PATH, request.nextUrl));
	}

	if (workspace.inWorkspace === false) {
		return sendTo(NO_WORKSPACE_PATH, request);
	}

	if (workspace.gate === "required") return sendTo(ONBOARDING_PATH, request);
	if (research === "required") return sendTo(RESEARCH_PATH, request);

	if (workspace.slug) {
		const duong = dieuHuongTheoVai(
			workspace.viewerRole,
			boSlug(pathname, workspace.slug),
		);
		if (duong !== "ok") {
			return sendTo(workspaceUrl(workspace.slug, duong.toi), request);
		}
	}

	const settled = workspace.gate === "settled" && research === "settled";

	if (!settled || !workspace.slug) return NextResponse.next();

	return sendTo(appPath(pathname, workspace.slug), request);
}

function appPath(pathname: string, slug: string): string {
	if (pathname === LANDING_PATH || isSetup(pathname)) {
		return workspaceUrl(slug);
	}

	if (SECTIONS.some((section) => isUnder(pathname, section))) {
		return workspaceUrl(slug, pathname);
	}

	const [first, ...rest] = pathname.slice(1).split("/");

	if (first === slug) return pathname;

	return workspaceUrl(slug, rest.length ? `/${rest.join("/")}` : "/");
}

function boSlug(pathname: string, slug: string): string {
	const [first, ...rest] = pathname.slice(1).split("/");
	return first === slug ? `/${rest.join("/")}` : pathname;
}

function isPublic(pathname: string): boolean {
	return pathname === LANDING_PATH && isMarketing();
}

function isUngated(pathname: string): boolean {
	return UNGATED.some((prefix) => isUnder(pathname, prefix));
}

function isSetup(pathname: string): boolean {
	return pathname === ONBOARDING_PATH || pathname === RESEARCH_PATH;
}

function sendTo(path: string, request: NextRequest): NextResponse {
	if (request.nextUrl.pathname === path) return NextResponse.next();

	const url = new URL(path, request.nextUrl);
	url.search = request.nextUrl.search;

	return NextResponse.redirect(url);
}

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|.*\\.(?:ico|png|svg|jpg|jpeg|gif|webp|webmanifest)$).*)",
	],
};
