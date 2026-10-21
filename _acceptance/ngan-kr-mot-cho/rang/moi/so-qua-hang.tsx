import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";

const NGAN_SO = "so-kr" as const;

export function SoQuaHang({ keyResultId }: { keyResultId: string }) {
	const mo = useOpenRecord();
	return (
		<button
			onClick={() => mo({ kind: NGAN_SO, id: keyResultId })}
			type="button"
		>
			{keyResultId}
		</button>
	);
}
