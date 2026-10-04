import { describe, expect, mock, test } from "bun:test";
import type { ClientOptions } from "eve/client";

const daTao: ClientOptions[] = [];
const eveThat = await import("eve/client");
mock.module("eve/client", () => ({
	...eveThat,
	Client: class extends eveThat.Client {
		constructor(o: ClientOptions) {
			daTao.push(o);
			super(o);
		}
	},
}));
const { loadThread } = await import("../lib/agent-session");
const { OKR_SOAN_CUA, okrSoanHeader } = await import("../lib/okr-soan-record");

describe("okr-soan-record", () => {
	test("thẻ và cửa của tác nhân OKR", () => {
		expect(OKR_SOAN_CUA).toEqual({
			agent: "okr",
			host: "/eve/agents/okr",
			header: "x-crm-cuoc-soan",
			purpose: "okr-soan",
		});
		expect(okrSoanHeader("c1")).toEqual({ "x-crm-cuoc-soan": "c1" });
	});
	test("loadThread đi qua host của tác nhân OKR khi được đưa, mặc định cửa cũ", async () => {
		await loadThread("s", okrSoanHeader("c1"), undefined, OKR_SOAN_CUA.host);
		await loadThread("s", { "x-crm-deal": "d1" });
		expect(daTao.map((d) => d.host)).toEqual(["/eve/agents/okr", ""]);
	});
});
