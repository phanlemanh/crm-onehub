import { CAP_MUC_TIEU } from "@crm/validation/okr-muc-tieu";
import { z } from "zod";

const capMucTieu = z.enum(CAP_MUC_TIEU);

type TenDonVi = {
	level: string;
	division: { name: string } | null;
	department: { name: string } | null;
	person: { name: string } | null;
};

export function tenDonVi(r: TenDonVi, tenGoc: string): string {
	switch (capMucTieu.parse(r.level)) {
		case "onehub":
			return tenGoc;
		case "bo-phan":
			return r.division?.name ?? "";
		case "phong-ban":
			return r.department?.name ?? "";
		case "ca-nhan":
			return r.person?.name ?? "";
	}
}

export function khoaDonViDong(r: {
	level: string;
	divisionId: string | null;
	departmentId: string | null;
	personUserId: string | null;
}): string {
	switch (capMucTieu.parse(r.level)) {
		case "onehub":
			return "goc";
		case "bo-phan":
			return `bp:${r.divisionId}`;
		case "phong-ban":
			return `pb:${r.departmentId}`;
		case "ca-nhan":
			return `nguoi:${r.personUserId}`;
	}
}
