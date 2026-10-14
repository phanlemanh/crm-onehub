"use client";

import Archive from "@carbon/icons-react/es/Archive";
import Undo from "@carbon/icons-react/es/Undo";
import type { ReactNode, SyntheticEvent } from "react";
import { Alert, AlertAction, AlertTitle } from "./alert";
import { Button } from "./button";
import { Icon } from "./icon";

function DaiLuuTru({
	tieuDe,
	nhanKhoiPhuc,
	onKhoiPhuc,
	dangKhoiPhuc = false,
}: {
	tieuDe: ReactNode;
	nhanKhoiPhuc: string;
	onKhoiPhuc: () => void;
	dangKhoiPhuc?: boolean;
}) {
	return (
		<div data-slot="dai-luu-tru" className="shrink-0 border-b p-3">
			<Alert data-dai-luu-tru="">
				<Icon icon={Archive} />
				<AlertTitle>{tieuDe}</AlertTitle>
				<AlertAction>
					<Button
						variant="outline"
						size="sm"
						disabled={dangKhoiPhuc}
						onClick={onKhoiPhuc}
					>
						<Icon icon={Undo} data-icon="inline-start" />
						{nhanKhoiPhuc}
					</Button>
				</AlertAction>
			</Alert>
		</div>
	);
}

const CHO_SUA =
	"button, input, textarea, select, [role=combobox], [role=button], [contenteditable=true]";

function KhoaLuuTru({
	khoa,
	children,
}: {
	khoa: boolean;
	children: ReactNode;
}) {
	const chan = (event: SyntheticEvent) => {
		if (!khoa) return;
		if (!(event.target instanceof Element)) return;
		if (!event.target.closest(CHO_SUA)) return;
		event.preventDefault();
		event.stopPropagation();
	};
	return (
		<fieldset
			disabled={khoa}
			data-khoa-luu-tru={khoa ? "" : undefined}
			className="contents"
			onPointerDownCapture={chan}
			onMouseDownCapture={chan}
			onClickCapture={chan}
			onKeyDownCapture={chan}
		>
			{children}
		</fieldset>
	);
}

export { DaiLuuTru, KhoaLuuTru };
