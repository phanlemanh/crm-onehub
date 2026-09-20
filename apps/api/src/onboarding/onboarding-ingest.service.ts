import type { Db } from "@crm/db";
import type { OnboardingBatch } from "@crm/validation/onboarding-ingest";
import { Injectable, Logger } from "@nestjs/common";
import { AgentTriggerService } from "../agent/agent-trigger.service";
import { InjectDatabase } from "../database/database.constants";
import { MA_NEN_TANG } from "./onboarding-config";

export type KetQuaNhan = {
	khop: number;
	chuyenTacNhan: number;
};

@Injectable()
export class OnboardingIngestService {
	private readonly logger = new Logger(OnboardingIngestService.name);

	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly agent: AgentTriggerService,
	) {}

	async nhan(batch: OnboardingBatch): Promise<KetQuaNhan> {
		const fieldId = await this.ensureField();

		const maTrongLo = batch.items.map((muc) => muc.platformBrokerId);
		const daKhop = await this.db.fieldValue.findMany({
			where: { fieldId, text: { in: maTrongLo }, contactId: { not: null } },
			select: { text: true, contactId: true },
		});

		const bang = new Map<string, string>();
		for (const hang of daKhop) {
			if (hang.text !== null && hang.contactId !== null) {
				bang.set(hang.text, hang.contactId);
			}
		}

		let khop = 0;
		const chuaKhop: string[] = [];

		await this.db.$transaction(async (tx) => {
			for (const muc of batch.items) {
				const contactId = bang.get(muc.platformBrokerId);

				if (contactId === undefined) {
					chuaKhop.push(muc.platformBrokerId);
					continue;
				}

				await tx.onboardingEnrollment.upsert({
					where: {
						planId_contactId: { planId: batch.planId, contactId },
					},
					create: {
						planId: batch.planId,
						contactId,
						source: "nen-tang",
						accountAt: moc(muc.accountAt),
						courseAt: moc(muc.courseAt),
						activeAt: moc(muc.activeAt),
						dealAt: moc(muc.dealAt),
					},
					update: {
						source: "nen-tang",
						accountAt: moc(muc.accountAt),
						courseAt: moc(muc.courseAt),
						activeAt: moc(muc.activeAt),
						dealAt: moc(muc.dealAt),
					},
				});
				khop += 1;
			}
		});

		for (const ma of chuaKhop) {
			await this.agent.onboardingMatchNeeded(batch.planId, ma);
		}

		this.logger.log({
			msg: "onboarding ingest",
			planId: batch.planId,
			items: batch.items.length,
			khop,
			chuyenTacNhan: chuaKhop.length,
		});

		return { khop, chuyenTacNhan: chuaKhop.length };
	}

	private async ensureField(): Promise<string> {
		const co = await this.db.fieldDefinition.findUnique({
			where: { entity_key: { entity: "CONTACT", key: MA_NEN_TANG.key } },
			select: { id: true },
		});

		if (co !== null) return co.id;

		const cuoi = await this.db.fieldDefinition.findFirst({
			where: { entity: "CONTACT" },
			orderBy: { position: "desc" },
			select: { position: true },
		});

		const moi = await this.db.fieldDefinition.create({
			data: {
				entity: "CONTACT",
				key: MA_NEN_TANG.key,
				label: MA_NEN_TANG.label,
				type: "TEXT",
				agentFilled: false,
				position: (cuoi?.position ?? -1) + 1,
			},
			select: { id: true },
		});

		return moi.id;
	}
}

function moc(gia: string | null): Date | null {
	return gia === null ? null : new Date(gia);
}
