import { describe, expect, it } from "bun:test";
import {
	databaseName,
	mintRunId,
	runIdSlug,
	runScopedName,
	runScopedUrl,
	TEST_DATABASE,
} from "../src/test-database";

const base =
	"postgresql://postgres:postgres@localhost:5432/crm_test?schema=public";

describe("runScopedName", () => {
	it("puts the run id before the _test suffix, so the suffix guard still holds", () => {
		expect(runScopedName("crm_test", "abc")).toBe("crm_abc_test");
		expect(
			runScopedName("crm_abc_test", "abc").endsWith(TEST_DATABASE.suffix),
		).toBe(true);
	});

	it("leaves the name alone when there is no run id", () => {
		expect(runScopedName("crm_test", undefined)).toBe("crm_test");
		expect(runScopedName("crm_test", "")).toBe("crm_test");
	});

	it("is idempotent, so a URL that already carries the id is not scoped twice", () => {
		expect(runScopedName("crm_abc_test", "abc")).toBe("crm_abc_test");
	});

	it("keeps only characters Postgres and an email address both accept", () => {
		expect(runScopedName("crm_test", "Lane-B.1")).toBe("crm_laneb1_test");
	});

	it("refuses an id that leaves nothing behind, rather than silently sharing the base", () => {
		expect(() => runScopedName("crm_test", "---")).toThrow(/TEST_RUN_ID/);
	});

	it("refuses a base that does not end in _test", () => {
		expect(() => runScopedName("crm", "abc")).toThrow(/_test/);
	});
});

describe("runScopedUrl", () => {
	it("rewrites only the database path and keeps the query string", () => {
		expect(runScopedUrl(base, "abc")).toBe(
			"postgresql://postgres:postgres@localhost:5432/crm_abc_test?schema=public",
		);
		expect(databaseName(runScopedUrl(base, "abc"))).toBe("crm_abc_test");
	});

	it("returns the base URL untouched without a run id", () => {
		expect(runScopedUrl(base, undefined)).toBe(base);
	});
});

describe("runIdSlug and mintRunId", () => {
	it("lowercases and strips everything outside [a-z0-9]", () => {
		expect(runIdSlug("Lane-B.1")).toBe("laneb1");
	});

	it("mints ids that are already slugs and differ between calls", () => {
		const first = mintRunId();
		const second = mintRunId();
		expect(first).toMatch(/^[a-z0-9]+$/);
		expect(runIdSlug(first)).toBe(first);
		expect(first).not.toBe(second);
	});
});
