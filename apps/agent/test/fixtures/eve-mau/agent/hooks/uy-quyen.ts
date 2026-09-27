import { quyetUyQuyen } from "@mau/agent/agent/lib/okr/uy-quyen";
import { SESSION_PURPOSES } from "@mau/agent/agent/lib/session-purpose";
import { defineHook } from "eve/hooks";

const mucDich = () =>
	SESSION_PURPOSES.find((p) => p === process.env.MAU_PURPOSE) ?? "research";

export default defineHook({
	events: {
		"actions.requested"(event) {
			const quyet = quyetUyQuyen(mucDich(), [], event.data.actions);
			if (!quyet.cho) throw new Error(quyet.loi);
		},
	},
});
