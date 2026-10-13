"use client";

import Add from "@carbon/icons-react/es/Add";
import Upload from "@carbon/icons-react/es/Upload";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageShellNote } from "@/components/page-shell-note";
import { toChucMessages } from "@/lib/messages/to-chuc";
import { useTRPC } from "@/lib/trpc/client";
import { HopThoaiDonVi } from "./hop-thoai-don-vi";
import { HopThoaiNhap } from "./hop-thoai-nhap";

export const ID_CHI_DOC = "to-chuc-chi-doc";

export function DongChiDoc() {
	const m = toChucMessages(useLocale());
	const trpc = useTRPC();
	const quyen = useQuery(trpc.org.access.queryOptions());
	if (quyen.data?.canManage !== false) return null;
	return (
		<PageShellNote data-trang-thai="ST-tochuc-chidoc" id={ID_CHI_DOC}>
			{m.chiDoc}
		</PageShellNote>
	);
}

export function HanhDongToChuc() {
	const m = toChucMessages(useLocale());
	const trpc = useTRPC();
	const cay = useQuery(trpc.org.tree.queryOptions());
	const quyen = useQuery(trpc.org.access.queryOptions());
	const [moNhap, setMoNhap] = useState(false);
	const [moThem, setMoThem] = useState(false);
	const sua = quyen.data?.canManage === true && cay.data !== undefined;
	const lyDo = quyen.data?.canManage === false ? ID_CHI_DOC : undefined;

	return (
		<>
			<Button
				variant="outline"
				disabled={!sua}
				aria-describedby={lyDo}
				aria-haspopup="dialog"
				onClick={() => setMoNhap(true)}
			>
				<Icon icon={Upload} data-icon="inline-start" />
				{m.nhap}
			</Button>
			<Button
				disabled={!sua}
				aria-describedby={lyDo}
				aria-haspopup="dialog"
				onClick={() => setMoThem(true)}
			>
				<Icon icon={Add} data-icon="inline-start" />
				{m.themBoPhan}
			</Button>
			{moNhap ? <HopThoaiNhap dong={() => setMoNhap(false)} /> : null}
			{moThem && cay.data ? (
				<HopThoaiDonVi
					cay={cay.data}
					yeuCau={{ loai: "tao-bo-phan" }}
					dong={() => setMoThem(false)}
				/>
			) : null}
		</>
	);
}
