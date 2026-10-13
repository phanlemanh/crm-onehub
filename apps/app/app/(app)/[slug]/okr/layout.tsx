import type * as React from "react";
import { KhungTrangOkr } from "./soan/khung-trang-okr";

export default function OkrLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <KhungTrangOkr>{children}</KhungTrangOkr>;
}
