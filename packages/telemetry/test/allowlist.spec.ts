import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { TASK_KINDS } from "@crm/db/agent-tasks";
import { GIAI_DOAN_GOC } from "@crm/db/giai-doan";
import {
	AGENT_TOOLS,
	ALLOWED_PROPERTIES,
	bucket,
	DEAL_STAGE_KEYS,
	dayBucket,
	EVIDENCE_KINDS,
	OTHER,
	permitted,
	permittedDealStage,
	permittedErrorClass,
	permittedEvidenceKind,
	permittedMethod,
	permittedModelId,
	permittedRoute,
	permittedTaskKind,
	permittedTool,
} from "../src/allowlist";

const REPO = join(import.meta.dir, "..", "..", "..");

describe("permitted", () => {
	it("keeps a property on the list", () => {
		expect(permitted({ crm_version: "1.0.0" })).toEqual({
			crm_version: "1.0.0",
		});
	});

	it("drops a property that is not on the list", () => {
		expect(
			permitted({
				crm_version: "1.0.0",
				contact_email: "ada@example.test",
				company_name: "Acme",
			}),
		).toEqual({ crm_version: "1.0.0" });
	});

	it("drops everything when nothing is on the list", () => {
		expect(
			permitted({ email: "ada@example.test", note: "called them" }),
		).toEqual({});
	});

	it("drops undefined rather than sending a null it did not mean", () => {
		expect(permitted({ crm_version: undefined })).toEqual({});
	});

	it("keeps a deliberate null", () => {
		expect(permitted({ postgres_version: null })).toEqual({
			postgres_version: null,
		});
	});

	it("names every property exactly once", () => {
		expect(new Set(ALLOWED_PROPERTIES).size).toBe(ALLOWED_PROPERTIES.length);
	});
});

describe("permittedTool", () => {
	it("keeps an authored tool", () => {
		expect(permittedTool("read_crm_history")).toBe("read_crm_history");
	});

	it("keeps an eve builtin", () => {
		expect(permittedTool("web_search")).toBe("web_search");
	});

	it("buckets anything it does not know", () => {
		expect(permittedTool("exfiltrate_ada@example.test")).toBe(OTHER);
		expect(permittedTool(null)).toBe(OTHER);
	});

	it("lists every tool in apps/agent/agent/tools", () => {
		const files = readdirSync(join(REPO, "apps", "agent", "agent", "tools"))
			.filter((name) => name.endsWith(".ts"))
			.map((name) => name.replace(/\.ts$/, ""));

		expect([...AGENT_TOOLS].sort()).toEqual(files.sort());
	});
});

describe("permittedEvidenceKind", () => {
	it("keeps a kind the agent prices", () => {
		expect(permittedEvidenceKind("crm.signature-block")).toBe(
			"crm.signature-block",
		);
	});

	it("buckets anything else", () => {
		expect(permittedEvidenceKind("ada@example.test")).toBe(OTHER);
	});

	it("mirrors the WEIGHTS map in lib/evidence.ts", () => {
		const source = readFileSync(
			join(REPO, "apps", "agent", "agent", "lib", "evidence.ts"),
			"utf8",
		);

		const start = source.indexOf("export const WEIGHTS");
		const block = source.slice(start, source.indexOf("\n};", start));

		const kinds = [...block.matchAll(/^\t"?([a-z][a-z0-9.-]*)"?:\s*\{/gm)].map(
			(match) => match[1] as string,
		);

		expect(kinds.length).toBeGreaterThan(0);
		expect([...EVIDENCE_KINDS].sort()).toEqual(kinds.sort());
	});
});

describe("permittedMethod", () => {
	it("keeps a slug a tool wrote", () => {
		expect(permittedMethod("linkedin.profile")).toBe("linkedin.profile");
		expect(permittedMethod("crm.thread")).toBe("crm.thread");
	});

	it("buckets anything that could carry a person", () => {
		expect(permittedMethod("ada@example.test")).toBe(OTHER);
		expect(permittedMethod("Ada Okafor, VP Sales at Acme")).toBe(OTHER);
		expect(permittedMethod("https://example.test/ada")).toBe(OTHER);
		expect(permittedMethod("a".repeat(80))).toBe(OTHER);
		expect(permittedMethod(null)).toBe(OTHER);
	});
});

describe("permittedTaskKind", () => {
	it("keeps every kind the dispatcher knows", () => {
		for (const kind of TASK_KINDS) {
			expect(permittedTaskKind(kind)).toBe(kind);
		}
	});

	it("buckets anything else", () => {
		expect(permittedTaskKind("contact:ada@example.test")).toBe(OTHER);
	});
});

const LOAI = ["OPEN", "WON", "LOST"] as const;

const KHAC = {
	OPEN: "other_open",
	WON: "other_won",
	LOST: "other_lost",
} as const;

describe("permittedDealStage", () => {
	it("giu ma giai doan goc o moi loai", () => {
		for (const ma of Object.values(GIAI_DOAN_GOC)) {
			for (const kind of LOAI) {
				expect(permittedDealStage(ma, kind), `${ma}/${kind}`).toBe(ma);
			}
		}
	});

	it("ma tu tao vao khoa khac theo loai", () => {
		for (const ma of ["ckz9x1abc0000", "", "Đã gửi hợp đồng"]) {
			for (const kind of LOAI) {
				expect(
					permittedDealStage(ma, kind),
					"ma tu tao lot ra ngoai tap khoa",
				).toBe(KHAC[kind]);
			}
		}
	});

	it("DEAL_STAGE_KEYS dung muoi khoa", () => {
		expect(DEAL_STAGE_KEYS.length).toBe(10);
		expect(new Set(DEAL_STAGE_KEYS).size).toBe(10);
		expect([...DEAL_STAGE_KEYS]).toEqual([
			...Object.values(GIAI_DOAN_GOC),
			"other_open",
			"other_won",
			"other_lost",
		]);
	});
});

describe("telemetry-md-deals-by-stage", () => {
	it("dong deals_by_stage liet ke du tap khoa", () => {
		const md = readFileSync(join(REPO, "docs", "telemetry.md"), "utf8");
		const dong = md
			.split("\n")
			.filter((d) => d.startsWith("| `deals_by_stage` |"));
		expect(dong.length).toBe(1);
		for (const khoa of DEAL_STAGE_KEYS) {
			expect(
				dong[0]?.includes(`\`${khoa}\``),
				`tai lieu thieu khoa ${khoa}`,
			).toBe(true);
		}
		expect(dong[0]?.includes("get a cuid")).toBe(false);
	});
});

describe("permittedRoute", () => {
	it("keeps a route pattern", () => {
		expect(permittedRoute("/internal/sync/google")).toBe(
			"/internal/sync/google",
		);
		expect(permittedRoute("/trpc/contacts.list")).toBe("/trpc/contacts.list");
		expect(permittedRoute("/contacts/:id")).toBe("/contacts/:id");
	});

	it("buckets a URL with an address in the query string", () => {
		expect(permittedRoute("/contacts?email=ada@example.test")).toBe(OTHER);
		expect(permittedRoute("https://crm.example.test/contacts")).toBe(OTHER);
		expect(permittedRoute(null)).toBe(OTHER);
	});
});

describe("permittedErrorClass", () => {
	it("takes the class, never the message", () => {
		expect(
			permittedErrorClass(new TypeError("ada@example.test is not a fn")),
		).toBe("TypeError");
	});

	it("takes an eve error code", () => {
		expect(permittedErrorClass({ code: "model_overloaded" })).toBe(
			"model_overloaded",
		);
	});

	it("buckets a free-text string", () => {
		expect(permittedErrorClass("could not reach ada@example.test")).toBe(OTHER);
		expect(permittedErrorClass({})).toBe(OTHER);
	});
});

describe("permittedModelId", () => {
	it("keeps a model slug", () => {
		expect(permittedModelId("zai/glm-5.2-fast")).toBe("zai/glm-5.2-fast");
	});

	it("buckets anything else", () => {
		expect(permittedModelId("the model said hello to ada")).toBe(OTHER);
	});
});

describe("buckets", () => {
	it("never reports an exact size", () => {
		expect(bucket(0)).toBe("0");
		expect(bucket(1)).toBe("1-9");
		expect(bucket(9)).toBe("1-9");
		expect(bucket(10)).toBe("10-49");
		expect(bucket(4_999)).toBe("1000-4999");
		expect(bucket(1_000_000)).toBe("25000+");
	});

	it("bands recheck intervals by day", () => {
		expect(dayBucket(0)).toBe("0-1");
		expect(dayBucket(7)).toBe("2-7");
		expect(dayBucket(30)).toBe("8-30");
		expect(dayBucket(365)).toBe("180+");
	});
});
