import { defineHook } from "eve/hooks";
import { TRO_LY_OKR } from "../lib/okr/config";
import { ketThucTuKetQua, laGoiTroLy, quyetUyQuyen } from "../lib/okr/uy-quyen";
import { uyQuyenOkrState } from "../lib/okr/uy-quyen-state";
import { dongViecOkr, giaHanLease } from "../lib/okr/viec";
import { attribute, purposeOf } from "../lib/session-purpose";

export default defineHook({
	events: {
		"actions.requested"(event, ctx) {
			const purpose = purposeOf(ctx);
			if (purpose !== "okr") {
				if (event.data.actions.some(laGoiTroLy))
					console.warn(`${TRO_LY_OKR.ngoaiPhien.dongNgoaiOkr}${purpose}`);
				return;
			}
			const quyet = quyetUyQuyen(
				purpose,
				uyQuyenOkrState.get().daGoi,
				event.data.actions,
			);
			if (!quyet.cho) throw new Error(quyet.loi);
			uyQuyenOkrState.update(() => ({ daGoi: quyet.daGoi }));
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
