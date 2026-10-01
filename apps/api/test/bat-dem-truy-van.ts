const DB_DA_NAP = globalThis.prisma !== undefined;

process.env.DB_DA_NAP_TRUOC_TEP_DEM = String(DB_DA_NAP);
if (!DB_DA_NAP && process.env.PRISMA_LOG_QUERIES !== "true") {
	process.env.PRISMA_LOG_QUERIES = "true";
	process.env.PRISMA_LOG_QUERIES_DO_TEP_DEM = "true";
}
