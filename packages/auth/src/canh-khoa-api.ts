import type { BetterAuthPlugin } from "better-auth";
import {
	APIError,
	createAuthMiddleware,
	getSessionFromCtx,
} from "better-auth/api";
import { NOT_A_MEMBER, workspaceRoleOf } from "./organization";
import type { CtxTruoc } from "./slack-connect";

const API_KEY_PATH_PREFIX = "/api-key/";

export async function canhKhoaApi(ctx: CtxTruoc): Promise<void> {
	if (!ctx.path.startsWith(API_KEY_PATH_PREFIX)) return;

	const session = await getSessionFromCtx(ctx, { disableCookieCache: true });
	if (!session) return;

	if (!(await workspaceRoleOf(session.user.id))) {
		throw new APIError("FORBIDDEN", { message: NOT_A_MEMBER });
	}
}

export function canhKhoaApiPlugin() {
	return {
		id: "canh-khoa-api",
		hooks: {
			before: [
				{
					matcher: (ctx) => ctx.path?.startsWith(API_KEY_PATH_PREFIX) ?? false,
					handler: createAuthMiddleware(canhKhoaApi),
				},
			],
		},
	} satisfies BetterAuthPlugin;
}
