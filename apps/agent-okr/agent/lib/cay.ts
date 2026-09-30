import { basename, resolve } from "node:path";
import { treeSlug } from "@crm/db/measure-database";
import { TRO_LY_OKR_SOAN } from "./config";

export function dauMocCay(): string {
	const ten = process.env[TRO_LY_OKR_SOAN.env.tenCay]?.trim();
	return treeSlug(ten || basename(resolve(process.cwd(), "..", "..")));
}
