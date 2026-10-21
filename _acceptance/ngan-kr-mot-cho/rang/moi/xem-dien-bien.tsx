import { useMoDienBien } from "./dien-bien-cu";

export function XemDienBien({
	objectiveId,
	keyResultId,
}: {
	objectiveId: string;
	keyResultId: string;
}) {
	const moDienBien = useMoDienBien();
	return (
		<button onClick={() => moDienBien(objectiveId, keyResultId)} type="button">
			{keyResultId}
		</button>
	);
}
