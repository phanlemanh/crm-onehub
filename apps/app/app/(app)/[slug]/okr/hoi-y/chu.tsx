import { Fragment, type ReactNode } from "react";

type Gia<K extends string> = { readonly [k in K]: ReactNode };

export function ghep<K extends string>(mau: string, gia: Gia<K>): ReactNode {
	return mau
		.split(/\{(\w+)\}/)
		.map((phan, i) =>
			i % 2 === 0 ? (
				phan
			) : (
				<Fragment key={phan}>
					{phan in gia ? gia[phan as K] : `{${phan}}`}
				</Fragment>
			),
		);
}

export function dien<K extends string>(
	mau: string,
	gia: { readonly [k in K]: string | number },
): string {
	return mau.replace(/\{(\w+)\}/g, (nguyen, khoa: string) =>
		khoa in gia ? String(gia[khoa as K]) : nguyen,
	);
}

export function demSo(mot: string, nhieu: string, n: number): string {
	return dien(n === 1 ? mot : nhieu, { n });
}

export function ChuNguoi({ children }: { children: string }) {
	return <span translate="no">{children}</span>;
}

export function DoanChu({ children }: { children: string }) {
	return (
		<p className="whitespace-pre-line text-sm wrap-anywhere" translate="no">
			{children}
		</p>
	);
}

export function khongTraConTro(e: Event): void {
	e.preventDefault();
}
