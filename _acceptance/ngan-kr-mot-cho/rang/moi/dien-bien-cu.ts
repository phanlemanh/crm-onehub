import {
	useOpenRecord,
	useRecordSheetView,
} from "@/components/crm/record-sheet/record-stack";

export const TAB_DIEN_BIEN = "dien-bien";

export function useMoDienBien() {
	const openRecord = useOpenRecord();
	const { setTab } = useRecordSheetView("tong-quan");
	return (objectiveId: string, keyResultId: string) => {
		openRecord({ kind: "objective", id: objectiveId });
		setTab(TAB_DIEN_BIEN);
		return keyResultId;
	};
}
