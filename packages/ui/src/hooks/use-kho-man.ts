import * as React from "react";

export const KHO_MAN = { dienThoaiDuoi: 768 } as const;

export type KhoMan = "chua-biet" | "dien-thoai" | "may-tinh";

export function useKhoMan(): KhoMan {
	const [kho, setKho] = React.useState<KhoMan>("chua-biet");

	React.useEffect(() => {
		const mql = window.matchMedia(
			`(max-width: ${KHO_MAN.dienThoaiDuoi - 1}px)`,
		);
		const doc = () =>
			setKho(
				window.innerWidth < KHO_MAN.dienThoaiDuoi ? "dien-thoai" : "may-tinh",
			);
		mql.addEventListener("change", doc);
		doc();
		return () => mql.removeEventListener("change", doc);
	}, []);

	return kho;
}
