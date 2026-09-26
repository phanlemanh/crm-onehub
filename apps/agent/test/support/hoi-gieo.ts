import { db } from "@crm/db";
import { gieoNguoi, TIEN_TO } from "./nhac-gieo";

export async function gieoVai(
	ten: string,
	role: "member" | "admin" | "owner" | "okr",
) {
	const nguoi = await gieoNguoi(ten);
	if (role !== "member") {
		await db.member.updateMany({ where: { userId: nguoi.id }, data: { role } });
	}
	return nguoi;
}

export async function boThanhVien(userId: string): Promise<void> {
	await db.member.deleteMany({ where: { userId } });
}

export async function donHoi(): Promise<void> {
	await db.zaloHoi.deleteMany({});
	await db.zaloLink.deleteMany({
		where: { crmUserId: { startsWith: TIEN_TO } },
	});
}
