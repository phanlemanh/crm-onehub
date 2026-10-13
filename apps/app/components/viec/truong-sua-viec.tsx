"use client";

import { Input } from "@crm/ui/components/input";
import { Textarea } from "@crm/ui/components/textarea";
import { useRef, useState } from "react";

type Chung = {
	nhan: string;
	giaTri: string;
	toiDa: number;
	choPhepRong: boolean;
	onLuu: (chu: string) => void;
	placeholder?: string;
};

export function TruongSuaViec({
	nhan,
	giaTri,
	toiDa,
	choPhepRong,
	onLuu,
	placeholder,
	nhieuDong = false,
}: Chung & { nhieuDong?: boolean }) {
	const [ban, setBan] = useState(giaTri);
	const daLuu = useRef(giaTri);

	const luu = () => {
		const chu = ban.trim();
		if (chu === daLuu.current) return;
		if (chu === "" && !choPhepRong) {
			setBan(daLuu.current);
			return;
		}
		daLuu.current = chu;
		onLuu(chu);
	};

	if (nhieuDong) {
		return (
			<Textarea
				aria-label={nhan}
				maxLength={toiDa}
				onBlur={luu}
				onChange={(event) => setBan(event.target.value)}
				placeholder={placeholder}
				translate="no"
				value={ban}
			/>
		);
	}
	return (
		<Input
			aria-label={nhan}
			autoComplete="off"
			maxLength={toiDa}
			onBlur={luu}
			onChange={(event) => setBan(event.target.value)}
			onKeyDown={(event) => {
				if (event.key === "Enter") {
					event.preventDefault();
					luu();
				}
			}}
			placeholder={placeholder}
			translate="no"
			value={ban}
		/>
	);
}
