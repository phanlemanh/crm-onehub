import { afterEach, describe, expect, test } from "bun:test";
import { schemas } from "@crm/validation";
import {
	builderQuestion,
	buildPendingInputRequest,
	SESSION_LIMIT_OPTION_IDS,
} from "@crm/validation/builder-question";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import mauHetHanMuc from "../../agent/test/fixtures/session-limit-that.json";

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { BuilderQuestionComposer, sessionLimitAnswerLabel } = await import(
	"@/components/agent-builder/builder-question-composer"
);
const { oSoanMessages } = await import("@/lib/messages/agent-builder-o-soan");

const t = oSoanMessages("vi");
const CHU_EVE = ["output-token limit", "Approve"];

const yeuCau = schemas.agents.inputRequested.parse(mauHetHanMuc.data)
	.requests[0];
if (yeuCau?.kind !== "session-limit") {
	throw new Error("mau session-limit-that.json khong con la session-limit");
}

function cauHoiQuaDuongThat(request: object) {
	const cauHoi = builderQuestion.parse(buildPendingInputRequest(request, true));
	if (!cauHoi) throw new Error("reader cua API khong doc duoc cau hoi");
	return cauHoi;
}

type TraLoi = { requestId: string; optionId?: string; text?: string };

const dangMo: Root[] = [];

afterEach(() => {
	for (const root of dangMo.splice(0)) act(() => root.unmount());
	document.body.innerHTML = "";
});

function ve(
	request: object,
	{
		pending = false,
		onAnswer = async () => {},
	}: {
		pending?: boolean;
		onAnswer?: (response: TraLoi) => Promise<void>;
	} = {},
) {
	const o = document.createElement("div");
	document.body.append(o);
	const root = createRoot(o);
	dangMo.push(root);
	act(() => {
		root.render(
			<LocaleProvider locale="vi">
				<BuilderQuestionComposer
					question={cauHoiQuaDuongThat(request)}
					pending={pending}
					onAnswer={onAnswer}
				/>
			</LocaleProvider>,
		);
	});
	return o;
}

function tenDocDuoc(node: Node): string {
	if (
		node instanceof HTMLElement &&
		node.getAttribute("aria-hidden") === "true"
	) {
		return "";
	}
	if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
	return Array.from(node.childNodes).map(tenDocDuoc).join("");
}

const nut = (o: HTMLElement, ten: string) => {
	const tim = Array.from(o.querySelectorAll("button")).find(
		(button) => tenDocDuoc(button).trim() === ten,
	);
	if (!tim) throw new Error(`khong thay nut ${ten}`);
	return tim;
};

describe("het-han-muc", () => {
	test("het-han-muc: session-limit ve cau tieng Viet va hai nut", () => {
		const o = ve(yeuCau);
		expect(o.textContent, "session-limit").toContain(t.hetHanMuc.cau);
		expect(nut(o, "Cấp thêm")).toBeTruthy();
		expect(nut(o, "Dừng")).toBeTruthy();
		expect(o.querySelectorAll("button")).toHaveLength(2);
		expect(o.querySelector("input, textarea")).toBeNull();
		for (const chu of CHU_EVE) expect(o.textContent).not.toContain(chu);
		expect(tenDocDuoc(o)).not.toContain(t.oSoan.dangGui);
	});

	const MA_TRAN = [
		{ ten: "Cấp thêm", optionId: SESSION_LIMIT_OPTION_IDS.continue },
		{ ten: "Dừng", optionId: SESSION_LIMIT_OPTION_IDS.stop },
	] as const;

	for (const o of MA_TRAN) {
		test(`het-han-muc: bam ${o.ten} gui ${o.optionId}`, async () => {
			const daGui: TraLoi[] = [];
			const man = ve(yeuCau, {
				onAnswer: async (response) => {
					daGui.push(response);
				},
			});
			await act(async () => {
				nut(man, o.ten).click();
			});
			expect(daGui).toEqual([
				{ requestId: yeuCau.requestId, optionId: o.optionId },
			]);
		});
	}

	test("het-han-muc: dang gui thi hai nut khoa", () => {
		const o = ve(yeuCau, { pending: true });
		expect(nut(o, "Cấp thêm").disabled).toBe(true);
		expect(nut(o, "Dừng").disabled).toBe(true);
	});

	test("het-han-muc: gui loi thi hai nut mo lai", async () => {
		let lan = 0;
		const o = ve(yeuCau, {
			onAnswer: async () => {
				lan += 1;
				throw new Error("mang hong");
			},
		});
		await act(async () => {
			nut(o, "Cấp thêm").click();
		});
		expect(lan).toBe(1);
		expect(nut(o, "Cấp thêm").disabled).toBe(false);
		expect(nut(o, "Dừng").disabled).toBe(false);
	});

	test("het-han-muc: doi chung — cau hoi question van ve o tra loi cu", () => {
		const o = ve({
			kind: "question",
			requestId: "cau-hoi-1",
			prompt: "Which channel should receive this?",
			display: "text",
			options: [],
		});
		expect(o.textContent).toContain("Which channel should receive this?");
		expect(o.querySelector("input, textarea")).not.toBeNull();
		expect(o.textContent).not.toContain(t.hetHanMuc.cau);
	});

	test("het-han-muc: bong bong cau tra loi dung nhan tieng Viet", () => {
		expect(
			sessionLimitAnswerLabel(
				{ kind: "session-limit", optionId: SESSION_LIMIT_OPTION_IDS.continue },
				t,
			),
		).toBe("Cấp thêm");
		expect(
			sessionLimitAnswerLabel(
				{ kind: "session-limit", optionId: SESSION_LIMIT_OPTION_IDS.stop },
				t,
			),
		).toBe("Dừng");
		expect(sessionLimitAnswerLabel({ optionId: "crm-task" }, t)).toBeNull();
		expect(sessionLimitAnswerLabel(null, t)).toBeNull();
	});
});
