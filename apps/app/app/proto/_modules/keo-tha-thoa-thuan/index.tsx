import { BangCotMau } from "./bang-cot-mau";

export function KeoThaThoaThuanMau({ state }: { state: string }) {
	return <BangCotMau key={state} state={state} />;
}
