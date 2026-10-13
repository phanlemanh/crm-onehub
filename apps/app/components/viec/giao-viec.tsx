"use client";

import { Button } from "@crm/ui/components/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import { useLocale } from "@crm/ui/components/locale-provider";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useCallback } from "react";
import { viecMessages } from "@/lib/messages/viec";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { OSoanViec } from "./o-soan-viec";

const moHop = parseAsStringLiteral(["viec"] as const);

export function useMoGiaoViec(): () => void {
	const [, setMo] = useQueryState(SEARCH_PARAM.dialog.create, moHop);
	return useCallback(() => void setMo("viec"), [setMo]);
}

export function GiaoViec() {
	const m = viecMessages(useLocale());
	const [mo, setMo] = useQueryState(SEARCH_PARAM.dialog.create, moHop);
	return (
		<>
			<Button onClick={() => void setMo("viec")}>{m.trang.giaoViec}</Button>
			<Dialog
				onOpenChange={(tiep) => {
					if (!tiep) void setMo(null);
				}}
				open={mo === "viec"}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{m.trang.giaoViec}</DialogTitle>
						<DialogDescription>{m.rong.moTa}</DialogDescription>
					</DialogHeader>
					<OSoanViec anchor={null} onXong={() => void setMo(null)} />
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">{m.oSoan.huy}</Button>
						</DialogClose>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
