import { afterEach, describe, expect, it } from "bun:test";
import { AUTH_COOKIE_PREFIX } from "@crm/auth/cookies";
import { NextRequest } from "next/server";
import { readResearchGate, readWorkspaceGate } from "../lib/onboarding";
import { proxy } from "../proxy";

const SESSION_COOKIE = `${AUTH_COOKIE_PREFIX}.session_token=abc.def`;

const SLUG = "comp-ai";

const realFetch = globalThis.fetch;

const realMarketing = process.env.IS_MARKETING;

afterEach(() => {
	globalThis.fetch = realFetch;
	marketing(realMarketing);
});

function marketing(value: string | undefined) {
	if (value === undefined) delete process.env.IS_MARKETING;
	else process.env.IS_MARKETING = value;
}

function stub(handler: (url: string) => Promise<Response>) {
	globalThis.fetch = ((input: string | URL | Request) =>
		handler(String(input))) as unknown as typeof fetch;
}

type GateResponse =
	| { result: { data: unknown } }
	| {
			error: {
				message: string;
				code?: number;
				data?: { code: string; httpStatus: number; path: string };
			};
	  };

function json(body: GateResponse, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	});
}

function answerWith(body: GateResponse, status = 200) {
	stub(async () => json(body, status));
}

const workspace = (data: {
	onboarded: boolean;
	canRename: boolean;
	slug?: string;
	viewerRole?: string | null;
}) => ({
	result: { data: { slug: SLUG, viewerRole: "owner", ...data } },
});

const loiPhien = (path: string): GateResponse => ({
	error: {
		message: "UNAUTHORIZED",
		code: -32001,
		data: { code: "UNAUTHORIZED", httpStatus: 401, path },
	},
});

function hetPhien() {
	const calls = { count: 0 };

	stub(async (url) => {
		calls.count += 1;
		return json(
			loiPhien(
				url.includes("workspace.get")
					? "workspace.get"
					: "settings.researchKey",
			),
			401,
		);
	});

	return calls;
}

const KHONG_BIET = {
	gate: "unknown",
	slug: null,
	inWorkspace: null,
	viewerRole: null,
	hetPhien: false,
};

function researchKey(configured: boolean, canManage: boolean | null = true) {
	const hint = configured ? "••••9876" : null;
	const data =
		canManage === null ? { configured, hint } : { configured, hint, canManage };
	return { result: { data } };
}

/** Answers both gate procedures, counting the calls to each. */
function setup({
	onboarded = true,
	canRename = true,
	configured = true,
	canManage = true,
	slug = SLUG,
}: {
	onboarded?: boolean;
	canRename?: boolean;
	configured?: boolean;
	canManage?: boolean;
	slug?: string;
} = {}) {
	const calls = { workspace: 0, research: 0 };

	stub(async (url) => {
		if (url.includes("workspace.get")) {
			calls.workspace += 1;
			return json(workspace({ onboarded, canRename, slug }));
		}

		calls.research += 1;
		return json(researchKey(configured, canManage));
	});

	return calls;
}

function request(pathname: string, cookies: string[] = []) {
	return new NextRequest(new URL(pathname, "http://localhost:3000"), {
		headers: cookies.length ? { cookie: cookies.join("; ") } : {},
	});
}

function redirectedTo(response: Response): string | null {
	const location = response.headers.get("location");

	return location ? new URL(location).pathname : null;
}

async function gateOf(pathname: string) {
	return (await readWorkspaceGate(request(pathname, [SESSION_COOKIE]))).gate;
}

describe("readWorkspaceGate", () => {
	it("reads the answer out of a plain tRPC envelope", async () => {
		answerWith(workspace({ onboarded: false, canRename: true }));

		expect(await gateOf("/")).toBe("required");
	});

	it("settles for someone who could not answer the form anyway", async () => {
		answerWith(workspace({ onboarded: false, canRename: false }));

		expect(await gateOf("/")).toBe("settled");
	});

	it("carries the slug the app is served under", async () => {
		answerWith(workspace({ onboarded: true, canRename: true }));

		expect(await readWorkspaceGate(request("/", [SESSION_COOKIE]))).toEqual({
			gate: "settled",
			slug: SLUG,
			inWorkspace: true,
			viewerRole: "owner",
			hetPhien: false,
		});
	});

	it("says the viewer is out when the API names no role for them", async () => {
		answerWith(
			workspace({ onboarded: true, canRename: true, viewerRole: null }),
		);

		expect(await readWorkspaceGate(request("/", [SESSION_COOKIE]))).toEqual({
			gate: "settled",
			slug: SLUG,
			inWorkspace: false,
			viewerRole: null,
			hetPhien: false,
		});
	});

	it("does not throw anyone out when the API says nothing about the role", async () => {
		answerWith({
			result: { data: { slug: SLUG, onboarded: true, canRename: true } },
		});

		const gate = await readWorkspaceGate(request("/", [SESSION_COOKIE]));

		expect([gate.inWorkspace, "vang truong khac han voi bi go"]).toEqual([
			null,
			"vang truong khac han voi bi go",
		]);
	});

	it("is unknown rather than required when the API cannot be read", async () => {
		answerWith({ error: { message: "UNAUTHORIZED" } }, 401);
		expect(await gateOf("/")).toBe("unknown");

		stub(async () => {
			throw new Error("connect ECONNREFUSED");
		});
		expect(await gateOf("/")).toBe("unknown");

		answerWith({ result: { data: { nothing: "useful" } } });
		expect(await gateOf("/")).toBe("unknown");
	});
});

describe("readWorkspaceGate and a dead session", () => {
	it("doc-401: flags only a 401 as a dead session", async () => {
		const ca: [string, () => void, unknown][] = [
			["401", () => hetPhien(), { ...KHONG_BIET, hetPhien: true }],
			[
				"200",
				() => answerWith(workspace({ onboarded: true, canRename: true })),
				{
					gate: "settled",
					slug: SLUG,
					inWorkspace: true,
					viewerRole: "owner",
					hetPhien: false,
				},
			],
			[
				"403",
				() => answerWith({ error: { message: "FORBIDDEN" } }, 403),
				KHONG_BIET,
			],
			[
				"500",
				() => answerWith({ error: { message: "INTERNAL_SERVER_ERROR" } }, 500),
				KHONG_BIET,
			],
			[
				"loi mang",
				() =>
					stub(async () => {
						throw new Error("connect ECONNREFUSED");
					}),
				KHONG_BIET,
			],
			[
				"het gio",
				() =>
					stub(async () => {
						throw new DOMException("timed out", "TimeoutError");
					}),
				KHONG_BIET,
			],
		];
		const sai: string[] = [];

		for (const [ten, dung, mong] of ca) {
			dung();
			const that = await readWorkspaceGate(request("/", [SESSION_COOKIE]));
			if (JSON.stringify(that) !== JSON.stringify(mong)) {
				sai.push(`${ten}: hetPhien sai`);
			}
		}

		const calls = hetPhien();
		const khongCookie = await readWorkspaceGate(request("/"));
		if (
			JSON.stringify(khongCookie) !== JSON.stringify(KHONG_BIET) ||
			calls.count !== 0
		) {
			sai.push("khong cookie: hetPhien sai");
		}

		expect(ca.length + 1).toBe(7);
		expect(sai).toEqual([]);
	});
});

describe("readResearchGate", () => {
	it("is settled once a key is saved, and required until then", async () => {
		answerWith(researchKey(true));
		expect(await readResearchGate(request("/", [SESSION_COOKIE]))).toBe(
			"settled",
		);

		answerWith(researchKey(false));
		expect(await readResearchGate(request("/", [SESSION_COOKIE]))).toBe(
			"required",
		);
	});

	it("is unknown rather than required when the API cannot be read", async () => {
		stub(async () => {
			throw new Error("connect ECONNREFUSED");
		});

		expect(await readResearchGate(request("/", [SESSION_COOKIE]))).toBe(
			"unknown",
		);
	});
});

describe("proxy", () => {
	it("shows a stranger the landing page and nothing behind it", async () => {
		marketing("true");

		expect(redirectedTo(await proxy(request("/")))).toBeNull();
		expect(redirectedTo(await proxy(request("/sign-in")))).toBeNull();
		expect(redirectedTo(await proxy(request(`/${SLUG}`)))).toBe("/sign-in");
		expect(redirectedTo(await proxy(request(`/${SLUG}/companies`)))).toBe(
			"/sign-in",
		);
	});

	it("sends a stranger to sign in when the install has no landing page", async () => {
		marketing(undefined);

		expect(redirectedTo(await proxy(request("/")))).toBe("/sign-in");
		expect(redirectedTo(await proxy(request("/sign-in")))).toBeNull();
	});

	it("never aims a redirect at the sign-in page itself", async () => {
		marketing(undefined);
		setup({ onboarded: false, configured: false });

		expect(redirectedTo(await proxy(request("/sign-in")))).toBeNull();
		expect(
			redirectedTo(await proxy(request("/sign-in", [SESSION_COOKIE]))),
		).toBeNull();
		expect(
			redirectedTo(await proxy(request("/sign-in?method=google"))),
		).toBeNull();
	});

	it("reads the flag on every request, and only the literal true turns it on", async () => {
		marketing("false");
		expect(redirectedTo(await proxy(request("/")))).toBe("/sign-in");

		marketing("1");
		expect(redirectedTo(await proxy(request("/")))).toBe("/sign-in");

		marketing("true");
		expect(redirectedTo(await proxy(request("/")))).toBeNull();
	});

	it("ignores a neighbour's cookie from the parent domain", async () => {
		expect(AUTH_COOKIE_PREFIX).not.toBe("better-auth");
		setup();

		expect(
			redirectedTo(
				await proxy(
					request(`/${SLUG}/companies`, [
						"better-auth.session_token=someone.else",
					]),
				),
			),
		).toBe("/sign-in");
	});

	it("gates a signed-in rep who has not answered the form", async () => {
		setup({ onboarded: false });

		expect(
			redirectedTo(
				await proxy(request(`/${SLUG}/companies`, [SESSION_COOKIE])),
			),
		).toBe("/onboarding");
	});

	it("lets the form itself render", async () => {
		setup({ onboarded: false });

		expect(
			redirectedTo(await proxy(request("/onboarding", [SESSION_COOKIE]))),
		).toBeNull();
	});

	it("asks again on every request, and remembers nothing", async () => {
		const calls = setup();

		const first = await proxy(request(`/${SLUG}/companies`, [SESSION_COOKIE]));

		expect([...first.cookies.getAll()]).toHaveLength(0);
		expect(calls).toEqual({ workspace: 1, research: 1 });

		await proxy(request(`/${SLUG}/companies`, [SESSION_COOKIE]));

		expect(calls).toEqual({ workspace: 2, research: 2 });
	});

	it("notices when the answer changes underneath it", async () => {
		setup();
		expect(
			redirectedTo(
				await proxy(request(`/${SLUG}/companies`, [SESSION_COOKIE])),
			),
		).toBeNull();

		// A reset database, a removed key: the browser is carrying nothing that
		// could keep saying the gate was satisfied.
		setup({ onboarded: false });
		expect(
			redirectedTo(
				await proxy(request(`/${SLUG}/companies`, [SESSION_COOKIE])),
			),
		).toBe("/onboarding");
	});

	it("takes a settled rep off both setup pages and into the workspace", async () => {
		setup();

		expect(
			redirectedTo(await proxy(request("/onboarding", [SESSION_COOKIE]))),
		).toBe(`/${SLUG}`);

		expect(
			redirectedTo(
				await proxy(request("/onboarding/research", [SESSION_COOKIE])),
			),
		).toBe(`/${SLUG}`);
	});

	it("never fights /grant-access, which would ping-pong forever", async () => {
		setup({ onboarded: false });

		expect(
			redirectedTo(await proxy(request("/grant-access", [SESSION_COOKIE]))),
		).toBeNull();
	});

	it("leaves the agent bridge alone", async () => {
		setup({ onboarded: false });

		expect(
			redirectedTo(await proxy(request("/eve/v1/info", [SESSION_COOKIE]))),
		).toBeNull();
	});

	it("fails open when the API is unreachable", async () => {
		stub(async () => {
			throw new Error("connect ECONNREFUSED");
		});

		const response = await proxy(
			request(`/${SLUG}/companies`, [SESSION_COOKIE]),
		);

		expect(redirectedTo(response)).toBeNull();
	});
});

describe("the slug the app is served under", () => {
	it("sends a signed-in rep off the landing page and into the workspace", async () => {
		setup();

		expect(redirectedTo(await proxy(request("/", [SESSION_COOKIE])))).toBe(
			`/${SLUG}`,
		);
	});

	it("puts the slug on a link that predates it, keeping the query", async () => {
		setup();

		const response = await proxy(
			request("/companies?record=contact:abc", [SESSION_COOKIE]),
		);

		expect(response.headers.get("location")).toBe(
			`http://localhost:3000/${SLUG}/companies?record=contact:abc`,
		);
	});

	it("moves a stale slug onto the current one, keeping the rest", async () => {
		setup();

		expect(
			redirectedTo(
				await proxy(request("/old-name/settings/members", [SESSION_COOKIE])),
			),
		).toBe(`/${SLUG}/settings/members`);
	});

	it("leaves a request that already carries the slug alone", async () => {
		setup();

		expect(
			redirectedTo(
				await proxy(request(`/${SLUG}/settings/sso`, [SESSION_COOKIE])),
			),
		).toBeNull();
	});

	it("rewrites nothing when the API could not say what the slug is", async () => {
		setup({ slug: "" });

		expect(
			redirectedTo(await proxy(request("/companies", [SESSION_COOKIE]))),
		).toBeNull();
	});
});

describe("the research key gate", () => {
	it("sends an onboarded rep with no key to the key form", async () => {
		setup({ configured: false });

		expect(
			redirectedTo(
				await proxy(request(`/${SLUG}/companies`, [SESSION_COOKIE])),
			),
		).toBe("/onboarding/research");
	});

	it("lets that form render rather than looping onto itself", async () => {
		setup({ configured: false });

		expect(
			redirectedTo(
				await proxy(request("/onboarding/research", [SESSION_COOKIE])),
			),
		).toBeNull();
	});

	it("asks the first question first when both are outstanding", async () => {
		setup({ onboarded: false, configured: false });

		expect(
			redirectedTo(
				await proxy(request(`/${SLUG}/companies`, [SESSION_COOKIE])),
			),
		).toBe("/onboarding");
	});

	it("sends them on to the key once the workspace is named", async () => {
		setup({ onboarded: true, configured: false });

		expect(
			redirectedTo(await proxy(request("/onboarding", [SESSION_COOKIE]))),
		).toBe("/onboarding/research");
	});
});

describe("ccq-cong-nghien-cuu", () => {
	it("member khong bi day khi chua co khoa", async () => {
		answerWith(researchKey(false, false));
		expect(
			`member: ${await readResearchGate(request("/", [SESSION_COOKIE]))}`,
		).toBe("member: settled");
	});

	it("quan tri van bi day khi chua co khoa", async () => {
		answerWith(researchKey(false, true));
		expect(
			`admin: ${await readResearchGate(request("/", [SESSION_COOKIE]))}`,
		).toBe("admin: required");
	});

	it("thieu co thi settled", async () => {
		answerWith(researchKey(false, null));
		expect(
			`thieu co: ${await readResearchGate(request("/", [SESSION_COOKIE]))}`,
		).toBe("thieu co: settled");
	});

	it("co khoa thi settled du khong co quyen", async () => {
		answerWith(researchKey(true, false));
		expect(
			`co khoa: ${await readResearchGate(request("/", [SESSION_COOKIE]))}`,
		).toBe("co khoa: settled");
	});

	it("proxy: member mo trang trong ung dung khong bi day", async () => {
		setup({ configured: false, canManage: false });
		expect(
			`member khong bi day: ${redirectedTo(
				await proxy(request(`/${SLUG}/companies`, [SESSION_COOKIE])),
			)}`,
		).not.toBe("member khong bi day: /onboarding/research");
	});

	it("proxy: member go thang /onboarding/research ve trang chinh", async () => {
		setup({ configured: false, canManage: false });
		expect(
			`member go thang: ${redirectedTo(
				await proxy(request("/onboarding/research", [SESSION_COOKIE])),
			)}`,
		).toBe(`member go thang: /${SLUG}`);
	});

	it("proxy: quan tri van bi day", async () => {
		setup({ configured: false, canManage: true });
		expect(
			`quan tri: ${redirectedTo(
				await proxy(request(`/${SLUG}/companies`, [SESSION_COOKIE])),
			)}`,
		).toBe("quan tri: /onboarding/research");
	});
});

describe("proxy and a dead session", () => {
	it("het-phien: sends the rep to sign in from every gated path", async () => {
		marketing(undefined);
		hetPhien();
		const duong = [
			"/",
			`/${SLUG}/companies`,
			"/companies",
			"/onboarding",
			"/onboarding/research",
		];
		const sai: string[] = [];

		for (const d of duong) {
			if (
				redirectedTo(await proxy(request(d, [SESSION_COOKIE]))) !== "/sign-in"
			) {
				sai.push(`${d}: cookie chet van lot qua proxy`);
			}
		}

		expect(duong.length).toBe(5);
		expect(sai).toEqual([]);
	});

	it("het-phien: leaves a live session where it is", async () => {
		setup();

		expect(
			redirectedTo(
				await proxy(request(`/${SLUG}/companies`, [SESSION_COOKIE])),
			),
		).toBeNull();
	});

	it("giu-mo: keeps failing open when the API only fails", async () => {
		const ca: [string, () => void][] = [
			[
				"loi mang",
				() =>
					stub(async () => {
						throw new Error("connect ECONNREFUSED");
					}),
			],
			[
				"het gio",
				() =>
					stub(async () => {
						throw new DOMException("timed out", "TimeoutError");
					}),
			],
			[
				"500",
				() => answerWith({ error: { message: "INTERNAL_SERVER_ERROR" } }, 500),
			],
			[
				"503",
				() => answerWith({ error: { message: "SERVICE_UNAVAILABLE" } }, 503),
			],
			["403", () => answerWith({ error: { message: "FORBIDDEN" } }, 403)],
		];
		const sai: string[] = [];

		for (const [ten, dung] of ca) {
			dung();
			const dich = redirectedTo(
				await proxy(request(`/${SLUG}/companies`, [SESSION_COOKIE])),
			);
			if (dich !== null)
				sai.push(`${ten}: proxy day ve /sign-in du API chi loi`);
		}

		expect(ca.length).toBe(5);
		expect(sai).toEqual([]);
	});

	it("khong-dung: never touches the paths that skip the gate", async () => {
		marketing(undefined);
		const duong = [
			"/sign-in",
			"/t/crm.js",
			"/proto/x",
			"/dat-mat-khau/abc",
			"/quen-mat-khau",
			"/grant-access",
			"/eve/v1/info",
			"/het-quyen",
		];
		const sai: string[] = [];

		for (const d of duong) {
			const calls = hetPhien();
			const dich = redirectedTo(await proxy(request(d, [SESSION_COOKIE])));
			if (dich !== null || calls.count !== 0) {
				sai.push(`${d}: proxy dung vao duong khong co cong`);
			}
		}

		marketing("true");
		hetPhien();
		if (redirectedTo(await proxy(request("/", [SESSION_COOKIE]))) !== null) {
			sai.push("marketing bat: / bi day ve /sign-in");
		}

		marketing(undefined);
		const doiChung = hetPhien();
		expect(
			redirectedTo(
				await proxy(request(`/${SLUG}/companies`, [SESSION_COOKIE])),
			),
		).toBe("/sign-in");
		expect(doiChung.count).toBeGreaterThan(0);

		expect(duong.length + 1).toBe(9);
		expect(sai).toEqual([]);
	});
});

describe("readWorkspaceGate when the API cannot read the session", () => {
	it("doc-503: a 503 lets the request through, a 401 still sends it to sign-in", async () => {
		const loiDocPhien: GateResponse = {
			error: {
				message: "SERVICE_UNAVAILABLE",
				code: -32603,
				data: {
					code: "SERVICE_UNAVAILABLE",
					httpStatus: 503,
					path: "workspace.get",
				},
			},
		};
		answerWith(loiDocPhien, 503);
		const gate = await readWorkspaceGate(
			request("/comp-ai/contacts", [SESSION_COOKIE]),
		);
		const ra503 = await proxy(request("/comp-ai/contacts", [SESSION_COOKIE]));
		hetPhien();
		const ra401 = await proxy(request("/comp-ai/contacts", [SESSION_COOKIE]));

		expect(gate.hetPhien, "503 khong phai het phien").toBe(false);
		expect(
			ra503.headers.get("location"),
			"khong duoc chuyen ve /sign-in",
		).toBeNull();
		expect(ra401.headers.get("location")?.endsWith("/sign-in")).toBe(true);
	});
});
