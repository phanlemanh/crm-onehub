const tu = (goi: string) => Bun.resolveSync(goi, process.cwd());

const { db } = await import(tu("@crm/db"));

const ID = "bom-gio-hang-sot";

const [{ ten }] = await db.$queryRaw<
	{ ten: string }[]
>`SELECT current_database() AS ten`;
if (!ten.endsWith("_test")) {
	console.error(`dem-hang-sot: dang doc nham co so du lieu ${ten}`);
	process.exit(2);
}

const hang = await db.okrProgramConfig.count({ where: { id: ID } });
console.log(`dem-hang-sot: ${ID}=${hang} (${ten})`);
process.exit(hang === 1 ? 0 : 1);
