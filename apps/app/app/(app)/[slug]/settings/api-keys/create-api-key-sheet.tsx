"use client";

import Add from "@carbon/icons-react/es/Add";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Sheet, SheetTrigger } from "@crm/ui/components/sheet";
import { Skeleton } from "@crm/ui/components/skeleton";
import { useMutation, useQuery } from "@tanstack/react-query";
import { parseAsBoolean, useQueryState } from "nuqs";
import { type ComponentProps, Suspense, useState } from "react";
import { toast } from "sonner";
import { useTableQuery } from "@/components/data-table/use-table-query";
import { khoaApiMessages } from "@/lib/messages/settings-khoa-api";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { apiKeysSearchParams } from "./api-keys-search-params";
import { CreatedApiKeyDialog } from "./created-api-key-dialog";
import type { LoaiKhoa } from "./loai-khoa";
import { type HanKhoa, ToTaoKhoa } from "./to-tao-khoa";

type CreatedApiKey = RouterOutputs["apiKeys"]["create"];

function NewApiKeyButton(props: ComponentProps<typeof Button>) {
	const t = khoaApiMessages(useLocale());

	return (
		<Button {...props}>
			<Icon icon={Add} data-icon="inline-start" />
			{t.tao.nut}
		</Button>
	);
}

export function CreateApiKeySheet() {
	return (
		<Suspense fallback={<Skeleton className="h-8 w-28 rounded-md" />}>
			<CreateApiKeyForm />
		</Suspense>
	);
}

function CreateApiKeyForm() {
	const t = khoaApiMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();
	const { input } = useTableQuery(apiKeysSearchParams);
	const danhSach = useQuery(trpc.apiKeys.list.queryOptions(input));
	const laQuanTri = danhSach.data?.taoDuocKeoTinHieu ?? false;

	const [open, setOpen] = useQueryState(
		SEARCH_PARAM.dialog.create,
		parseAsBoolean.withDefault(false),
	);
	const [ten, setTen] = useState("");
	const [loai, setLoai] = useState<LoaiKhoa>("toan-quyen");
	const [han, setHan] = useState<HanKhoa>("90");
	const [created, setCreated] = useState<CreatedApiKey | null>(null);

	const create = useMutation(
		trpc.apiKeys.create.mutationOptions({
			onSuccess: async (apiKey) => {
				await cache.apiKeys();
				await setOpen(null);
				setTen("");
				setLoai("toan-quyen");
				setHan("90");
				setCreated(apiKey);
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	return (
		<>
			<Sheet open={open} onOpenChange={(next) => setOpen(next || null)}>
				<SheetTrigger asChild>
					<NewApiKeyButton />
				</SheetTrigger>

				<ToTaoKhoa
					t={t}
					laQuanTri={laQuanTri}
					ten={ten}
					onTen={setTen}
					loai={loai}
					onLoai={setLoai}
					han={han}
					onHan={setHan}
					dangTao={create.isPending}
					onTao={() =>
						create.mutate({
							name: ten.trim(),
							expiresInDays: han === "never" ? null : Number(han),
							loai: laQuanTri ? loai : undefined,
						})
					}
				/>
			</Sheet>

			<CreatedApiKeyDialog
				apiKey={created}
				onOpenChange={(next) => {
					if (!next) setCreated(null);
				}}
			/>
		</>
	);
}
