const tu = (goi: string) => Bun.resolveSync(goi, process.cwd());

const { db } = await import(tu("@crm/db"));

const NGUOI = "cvv-doc-phien";

const [{ ten }] = await db.$queryRaw<
	{ ten: string }[]
>`SELECT current_database() AS ten`;
if (!ten.endsWith("_test")) {
	console.error(`dem-cvv: dang doc nham co so du lieu ${ten}`);
	process.exit(2);
}

const nguoi = await db.user.count({ where: { id: NGUOI } });
const thanhVien = await db.member.count({ where: { userId: NGUOI } });
const phien = await db.session.count({ where: { userId: NGUOI } });

console.log(
	`dem-cvv: nguoi=${nguoi} thanh-vien=${thanhVien} phien=${phien} (${NGUOI}, ${ten})`,
);
process.exit(nguoi + thanhVien + phien === 0 ? 0 : 1);
