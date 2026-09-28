import { defineHook } from "eve/hooks";
import { ketThucTuKetQua, quyetUyQuyen } from "../lib/okr/uy-quyen";
import { uyQuyenOkrState } from "../lib/okr/uy-quyen-state";
import { dongViecOkr, giaHanLease } from "../lib/okr/viec";
import { attribute, purposeOf } from "../lib/session-purpose";

export default defineHook({
	events: {
		"actions.requested"(event, ctx) {
			const quyet = quyetUyQuyen(
				purposeOf(ctx),
				uyQuyenOkrState.get().daGoi,
				event.data.actions,
			);
			if (!quyet.cho) throw new Error(quyet.loi);
			if (purposeOf(ctx) === "okr") {
				uyQuyenOkrState.update(() => ({ daGoi: quyet.daGoi }));
			}
		},

		async "action.result"(event, ctx) {
			if (purposeOf(ctx) !== "okr") return;
			const taskId = attribute(ctx, "okrTaskId");
			if (!taskId) return;
			const ketThuc = ketThucTuKetQua(event.data.result);
			if (ketThuc) await dongViecOkr(taskId, ketThuc);
		},

		async "*"(_event, ctx) {
			if (purposeOf(ctx) !== "okr") return;
			const taskId = attribute(ctx, "okrTaskId");
			if (taskId) await giaHanLease(taskId).catch(() => {});
		},
	},
});
