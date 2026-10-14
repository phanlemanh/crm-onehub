import { defineAgent } from "eve";
import { mockModel } from "eve/evals";
import mauGoi from "./_chep/goi-bo-dung-kem-khuon-that.json";
import { CUA_SO_THU, KICH_BAN } from "./kich-ban";

const goiThat = mauGoi.data.actions[0];
if (!goiThat) throw new Error("mau goi-bo-dung-kem-khuon-that.json rong");
const { outputSchema: _khuon, ...khongKhuon } = goiThat.input;

export default defineAgent({
	modelContextWindowTokens: CUA_SO_THU,
	model: mockModel(
		({ lastUserMessage, messages, toolResults, userMessageCount }) => {
			if (messages.at(-1)?.role !== "user") {
				return `ket-qua ${JSON.stringify(
					toolResults.map((ketQua) => ({
						ten: ketQua.name,
						loi: ketQua.isError,
						ra: ketQua.output,
					})),
				)}`;
			}
			switch (lastUserMessage) {
				case KICH_BAN.coKhuon:
					return {
						toolCalls: [{ name: "agent_builder", input: goiThat.input }],
					};
				case KICH_BAN.khongKhuon:
					return { toolCalls: [{ name: "agent_builder", input: khongKhuon }] };
				case KICH_BAN.tiep:
				case KICH_BAN.dung:
					return {
						toolCalls: [
							{ name: "bo_dung_thu", input: { message: "dung thu" } },
						],
					};
				case KICH_BAN.hoi:
					return {
						toolCalls: [
							{
								name: "hoi_thu",
								input: { message: `hoi-thu-${userMessageCount}` },
							},
						],
					};
				default:
					return "khong co kich ban";
			}
		},
	),
});
