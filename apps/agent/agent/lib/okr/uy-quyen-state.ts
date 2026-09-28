import { defineState } from "eve/context";

export const uyQuyenOkrState = defineState<{ daGoi: readonly string[] }>(
	"crm.okr-uy-quyen",
	() => ({ daGoi: [] }),
);
