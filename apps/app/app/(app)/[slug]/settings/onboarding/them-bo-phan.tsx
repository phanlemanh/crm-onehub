"use client";

import { Field, FieldLabel } from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import { KhungTao } from "@/components/onboarding/khung-tao";
import { onboardingMessages } from "@/lib/messages/onboarding";
import { useTRPC } from "@/lib/trpc/client";

export function ThemBoPhan() {
	const m = onboardingMessages(useLocale());
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const maTen = useId();

	const [dangMo, setDangMo] = useState(false);
	const [ten, setTen] = useState("");
	const [loi, setLoi] = useState<string | null>(null);

	const tao = useMutation(trpc.onboarding.createDepartment.mutationOptions());

	return (
		<KhungTao
			nhanNut={m.settings.newDepartment}
			tieuDe={m.tao.boPhan.title}
			dangMo={dangMo}
			doiMo={setDangMo}
			sanSang={ten.trim() !== ""}
			dangLuu={tao.isPending}
			loi={loi}
			nhanLuu={m.tao.save}
			nhanHuy={m.tao.cancel}
			onLuu={() => {
				setLoi(null);
				tao.mutate(
					{ name: ten.trim() },
					{
						onSuccess: async () => {
							await queryClient.invalidateQueries({
								queryKey: trpc.onboarding.listDepartments.queryKey(),
							});
							setTen("");
							setDangMo(false);
						},
						onError: (error) => setLoi(error.message),
					},
				);
			}}
		>
			<Field>
				<FieldLabel htmlFor={maTen}>{m.tao.boPhan.name}</FieldLabel>
				<Input
					id={maTen}
					value={ten}
					onChange={(e) => setTen(e.target.value)}
					autoComplete="off"
				/>
			</Field>
		</KhungTao>
	);
}
