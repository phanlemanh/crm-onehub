import { db } from "../src/client";
import { MEASURE_DATABASE } from "../src/measure-database";
import { writeAgentModel } from "../src/settings";

try {
	await writeAgentModel(db, MEASURE_DATABASE.agentModel);
} finally {
	await db.$disconnect();
}
