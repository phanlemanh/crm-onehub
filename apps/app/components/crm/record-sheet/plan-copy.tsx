import { Fragment, type ReactNode } from "react";

export function dien(
	mau: string,
	gia: Record<string, string | number>,
): string {
	return mau.replace(/\{(\w+)\}/g, (nguyen, khoa: string) =>
		khoa in gia ? String(gia[khoa]) : nguyen,
	);
}

export function dienNode(
	mau: string,
	gia: Record<string, ReactNode>,
): ReactNode[] {
	let viTri = 0;
	return mau
		.split(/(\{\w+\})/)
		.filter((phan) => phan !== "")
		.map((phan) => {
			const khoa = /^\{(\w+)\}$/.exec(phan)?.[1];
			const khoaReact = `${viTri}`;
			viTri += phan.length;
			return (
				<Fragment key={khoaReact}>
					{khoa === undefined ? phan : (gia[khoa] ?? "")}
				</Fragment>
			);
		});
}
