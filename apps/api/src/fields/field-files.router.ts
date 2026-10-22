import { Inject } from "@nestjs/common";
import {
	Ctx,
	Input,
	Mutation,
	Query,
	Router,
	UseMiddlewares,
} from "nestjs-trpc";
import type { z } from "zod";
import type { AuthedTrpcContext } from "../trpc/context.types";
import { PhamViDoiTacMiddleware } from "../trpc/middlewares/pham-vi-du-lieu.middleware";
import { restMeta } from "../trpc/openapi";
import { docPhamViYeuCau } from "../trpc/pham-vi-yeu-cau";
import {
	fieldFileCompleteInput,
	fieldFileCompleteOutput,
	fieldFileDownloadOutput,
	fieldFileIdInput,
	fieldFileRemoveOutput,
	fieldFileRequestUploadInput,
	fieldFileRequestUploadOutput,
	fieldFileStatusOutput,
} from "./field-files.contracts";
import { FieldFilesService } from "./field-files.service";
import type { NguoiGoiTep } from "./field-files-quyen";

const TAG = ["Field files"];

function nguoiGoi(ctx: AuthedTrpcContext): NguoiGoiTep {
	return { id: ctx.user.id, role: docPhamViYeuCau(ctx).role };
}

@Router({ alias: "fieldFiles" })
@UseMiddlewares(PhamViDoiTacMiddleware)
export class FieldFilesRouter {
	constructor(
		@Inject(FieldFilesService) private readonly tep: FieldFilesService,
	) {}

	@Query({
		output: fieldFileStatusOutput,
		meta: restMeta("GET", "/field-files/status", TAG),
	})
	status() {
		return this.tep.status();
	}

	@Mutation({
		input: fieldFileRequestUploadInput,
		output: fieldFileRequestUploadOutput,
		meta: restMeta("POST", "/field-files/request-upload", TAG),
	})
	requestUpload(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof fieldFileRequestUploadInput>,
	) {
		return this.tep.requestUpload(nguoiGoi(ctx), input);
	}

	@Mutation({
		input: fieldFileCompleteInput,
		output: fieldFileCompleteOutput,
		meta: restMeta("POST", "/field-files/complete", TAG),
	})
	complete(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof fieldFileCompleteInput>,
	) {
		return this.tep.complete(nguoiGoi(ctx), input);
	}

	@Mutation({
		input: fieldFileIdInput,
		output: fieldFileDownloadOutput,
		meta: restMeta("POST", "/field-files/{tepId}/download-url", TAG),
	})
	downloadUrl(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof fieldFileIdInput>,
	) {
		return this.tep.downloadUrl(nguoiGoi(ctx), input.tepId);
	}

	@Mutation({
		input: fieldFileIdInput,
		output: fieldFileRemoveOutput,
		meta: restMeta("POST", "/field-files/{tepId}/remove", TAG),
	})
	remove(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof fieldFileIdInput>,
	) {
		return this.tep.remove(nguoiGoi(ctx), input.tepId);
	}
}
