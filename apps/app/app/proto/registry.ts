import type { ReactNode } from "react";
import { DuongProtoMau } from "./_modules/duong-proto";
import { VaoBangMatKhauMau } from "./_modules/vao-bang-mat-khau";
import { PROTO_CATALOG } from "./catalog";

export type ProtoComponent = (props: { state: string }) => ReactNode;

const BANG_GHEP = {
	"duong-proto-cho-design-pass": DuongProtoMau,
	"vao-bang-email-va-mat-khau": VaoBangMatKhauMau,
} satisfies Record<string, ProtoComponent>;

export const PROTO_COMPONENTS = new Map(Object.entries(BANG_GHEP));

export function mucMoCoi(): string[] {
	const trongSo = PROTO_CATALOG.map((muc) => muc.slug);
	const trongBang = [...PROTO_COMPONENTS.keys()];

	return [
		...trongSo.filter((s) => !trongBang.includes(s)),
		...trongBang.filter((s) => !trongSo.includes(s)),
	];
}
