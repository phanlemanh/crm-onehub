const tu = (goi: string) => Bun.resolveSync(goi, process.cwd());

const { db } = await import(tu("@crm/db"));
const { OKR_PROGRAM_MAC_DINH } = await import(
	tu("@crm/validation/okr-chuong-trinh")
);

const HANG_SOT = {
	id: "bom-gio-hang-sot",
	version: 1,
	createdById: "bom-gio-hang-sot-admin",
};

await db.okrProgramConfig.create({
	data: { ...OKR_PROGRAM_MAC_DINH, ...HANG_SOT, createdAt: new Date() },
});
