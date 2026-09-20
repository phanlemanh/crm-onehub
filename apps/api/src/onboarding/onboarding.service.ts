import type { Db } from "@crm/db";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import type {
	DepartmentCreateInput,
	DepartmentIdInput,
	DepartmentOutput,
	DepartmentReorderInput,
	DepartmentUpdateInput,
} from "./onboarding.contracts";

@Injectable()
export class OnboardingService {
	constructor(@InjectDatabase() private readonly db: Db) {}

	async listDepartments(): Promise<DepartmentOutput[]> {
		return this.db.department.findMany({
			where: { archivedAt: null },
			orderBy: { position: "asc" },
			select: { id: true, name: true, position: true, archivedAt: true },
		});
	}

	async createDepartment(
		input: DepartmentCreateInput,
	): Promise<DepartmentOutput> {
		const cuoi = await this.db.department.findFirst({
			orderBy: { position: "desc" },
			select: { position: true },
		});

		return this.db.department.create({
			data: { name: input.name, position: (cuoi?.position ?? -1) + 1 },
			select: { id: true, name: true, position: true, archivedAt: true },
		});
	}

	async updateDepartment(
		input: DepartmentUpdateInput,
	): Promise<DepartmentOutput> {
		await this.doiChieuBoPhan(input.id);

		return this.db.department.update({
			where: { id: input.id },
			data: { name: input.name },
			select: { id: true, name: true, position: true, archivedAt: true },
		});
	}

	async archiveDepartment(input: DepartmentIdInput): Promise<DepartmentOutput> {
		await this.doiChieuBoPhan(input.id);

		return this.db.department.update({
			where: { id: input.id },
			data: { archivedAt: new Date() },
			select: { id: true, name: true, position: true, archivedAt: true },
		});
	}

	async reorderDepartments(
		input: DepartmentReorderInput,
	): Promise<DepartmentOutput[]> {
		await this.db.$transaction(
			input.ids.map((id, viTri) =>
				this.db.department.update({
					where: { id },
					data: { position: viTri },
				}),
			),
		);

		return this.listDepartments();
	}

	private async doiChieuBoPhan(id: string): Promise<void> {
		const co = await this.db.department.findUnique({
			where: { id },
			select: { id: true },
		});

		if (co === null) {
			throw new NotFoundException(`Không có bộ phận nào mang mã ${id}.`);
		}
	}
}
