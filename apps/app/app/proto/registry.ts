import type { ReactNode } from "react";
import { DieuPhoi30NgayDauMau } from "./_modules/dieu-phoi-30-ngay-dau";
import { DuongProtoMau } from "./_modules/duong-proto";
import { KeHoachLaMotBanGhiMau } from "./_modules/ke-hoach-la-mot-ban-ghi";
import { VaoBangMatKhauMau } from "./_modules/vao-bang-mat-khau";
import { PROTO_CATALOG } from "./catalog";

export type ProtoComponent = (props: { state: string }) => ReactNode;

const BANG_GHEP = {
	"dieu-phoi-30-ngay-dau": DieuPhoi30NgayDauMau,
	"duong-proto-cho-design-pass": DuongProtoMau,
	"ke-hoach-la-mot-ban-ghi": KeHoachLaMotBanGhiMau,
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
