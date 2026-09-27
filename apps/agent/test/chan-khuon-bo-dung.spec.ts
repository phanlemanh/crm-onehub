import { describe, expect, it } from "bun:test";
import { BUILDER_OUTPUT_SCHEMA_MESSAGE } from "../agent/lib/builder-delegation";
import mauGoi from "./fixtures/goi-bo-dung-kem-khuon-that.json";
import {
	type DuLieuHanhDong,
	datSlot,
	type HanhDong,
	layHook,
	phien,
	suKien,
} from "./tran-uy-thac/chuoi-cuong-che";

const hook = await layHook();

const duLieuThat = mauGoi.data as DuLieuHanhDong;
const goiThat = duLieuThat.actions[0];
if (
	!goiThat ||
	goiThat.kind !== "subagent-call" ||
	!("outputSchema" in goiThat.input)
) {
	throw new Error("mau goi-bo-dung-kem-khuon-that.json khong con kem khuon");
}

const voi = (sua: (goi: HanhDong) => HanhDong): DuLieuHanhDong => ({
	...duLieuThat,
	actions: [sua(goiThat)],
});

const boKhuon = (goi: HanhDong): HanhDong => {
	if (goi.kind !== "subagent-call") return goi;
	const { outputSchema: _khuon, ...input } = goi.input;
	return { ...goi, input };
};

const khuonRong = (goi: HanhDong): HanhDong =>
	goi.kind === "subagent-call"
		? { ...goi, input: { ...goi.input, outputSchema: {} } }
		: goi;

const doiSubagent = (goi: HanhDong): HanhDong =>
	goi.kind === "subagent-call"
		? { ...goi, subagentName: "agent_runner", name: "agent_runner" }
		: goi;

function chay(data: DuLieuHanhDong, purpose = "builder") {
	const slot = datSlot();
	let loi: string | null = null;
	try {
		hook.hanhDong(suKien(data), phien({ purpose }));
	} catch (error) {
		loi = error instanceof Error ? error.message : String(error);
	}
	return { loi, trangThai: slot.doc() };
}

describe("chan-khuon", () => {
	it("chan-khuon: hang dung chung la cau co dinh", () => {
		expect(BUILDER_OUTPUT_SCHEMA_MESSAGE).toBe(
			"Call agent_builder with message only; it returns its own result.",
		);
	});

	it("chan-khuon: ma tran truc D, nam o", () => {
		const MA_TRAN = [
			{
				o: "loi goi GLM that kem outputSchema",
				data: duLieuThat,
				purpose: "builder",
				chan: true,
			},
			{
				o: "cung loi goi, bo outputSchema",
				data: voi(boKhuon),
				purpose: "builder",
				chan: false,
			},
			{
				o: "outputSchema rong",
				data: voi(khuonRong),
				purpose: "builder",
				chan: true,
			},
			{
				o: "subagent khac kem outputSchema",
				data: voi(doiSubagent),
				purpose: "builder",
				chan: false,
			},
			{
				o: "phien khong phai dung",
				data: duLieuThat,
				purpose: "research",
				chan: false,
			},
		] as const;
		expect(MA_TRAN).toHaveLength(5);

		for (const ca of MA_TRAN) {
			const { loi, trangThai } = chay(ca.data, ca.purpose);
			expect({ o: ca.o, loi }, "outputSchema").toEqual({
				o: ca.o,
				loi: ca.chan ? BUILDER_OUTPUT_SCHEMA_MESSAGE : null,
			});
			const daGhi = trangThai.callIds.includes(goiThat.callId);
			const phaiGhi =
				!ca.chan && ca.purpose === "builder" && ca.o !== "subagent khac kem outputSchema";
			expect({ o: ca.o, daGhi }).toEqual({ o: ca.o, daGhi: phaiGhi });
		}
	});
});
