import { describe, expect, test } from "bun:test";
import { DEFAULT_AGENT_MODEL } from "@crm/db/settings";
import { TRO_LY_OKR_SOAN } from "../../agent-okr/agent/lib/config";
import { TRO_LY_OKR } from "../agent/lib/okr/config";

const MODEL_CHAM = "zai/glm-5.2-fast";

describe("rmh-judge", () => {
	test("rmh-judge: model chấm của hai nơi khai giữ GLM 5.2 Fast", () => {
		const hai = {
			agent: TRO_LY_OKR.judge.model,
			"agent-okr": TRO_LY_OKR_SOAN.judge.model,
		};
		expect(hai).toEqual({ agent: MODEL_CHAM, "agent-okr": MODEL_CHAM });
	});

	test("rmh-judge: đối chứng — model chấm khác model mặc định nên phép so phân biệt được", () => {
		expect(DEFAULT_AGENT_MODEL.id).not.toBe(MODEL_CHAM);
	});
});
