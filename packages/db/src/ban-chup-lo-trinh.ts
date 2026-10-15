import type { Db } from "./client";
import { Prisma } from "./generated/prisma/client";

export type GhiBanChup = {
	nguon: string;
	sha: string;
	commitLuc: string;
	duLieu: Prisma.InputJsonObject;
	canhBao: string[];
};

export type KetQuaGhiBanChup = "nhan" | "trung" | "cu-hon";

export function docBanChupLoTrinh(db: Db, nguon: string) {
	return db.banChupLoTrinh.findUnique({
		where: { nguon },
		select: {
			sha: true,
			commitLuc: true,
			layLuc: true,
			duLieu: true,
			canhBao: true,
		},
	});
}

export async function ghiBanChupLoTrinh(
	db: Db,
	vao: GhiBanChup,
	now: Date,
): Promise<KetQuaGhiBanChup> {
	const commitLuc = new Date(vao.commitLuc);
	const moi = {
		sha: vao.sha,
		commitLuc,
		layLuc: now,
		duLieu: vao.duLieu,
		canhBao: vao.canhBao,
	};
	const doi = await db.banChupLoTrinh.updateMany({
		where: { nguon: vao.nguon, commitLuc: { lt: commitLuc } },
		data: moi,
	});
	if (doi.count === 1) return "nhan";
	try {
		await db.banChupLoTrinh.create({ data: { nguon: vao.nguon, ...moi } });
		return "nhan";
	} catch (loi) {
		if (
			!(
				loi instanceof Prisma.PrismaClientKnownRequestError &&
				loi.code === "P2002"
			)
		)
			throw loi;
	}
	const hang = await db.banChupLoTrinh.findUniqueOrThrow({
		where: { nguon: vao.nguon },
		select: { sha: true },
	});
	return hang.sha === vao.sha ? "trung" : "cu-hon";
}
