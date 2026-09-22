"use client";

import { useState } from "react";
import { type DauTheoDoi, SheetTheoDoi } from "./sheet-theo-doi";
import { TheTongQuan } from "./the-tong-quan";
import { TinSlack } from "./tin-slack";

function CanhTongQuan({ rong }: { rong: boolean }) {
	const [mo, setMo] = useState(false);
	return (
		<>
			<TheTongQuan onMo={() => setMo(true)} rong={rong} />
			{mo ? <SheetTheoDoi dau="chua" onClose={() => setMo(false)} /> : null}
		</>
	);
}

function CanhTheoDoi({ dau }: { dau: DauTheoDoi }) {
	const [mo, setMo] = useState(true);
	return (
		<>
			<TheTongQuan onMo={() => setMo(true)} rong={false} />
			{mo ? <SheetTheoDoi dau={dau} onClose={() => setMo(false)} /> : null}
		</>
	);
}

const HINH = {
	"tasks-co-im": () => <CanhTongQuan rong={false} />,
	"tasks-rong": () => <CanhTongQuan rong />,
	"theo-doi-chua": () => <CanhTheoDoi dau="chua" />,
	"theo-doi-dang": () => <CanhTheoDoi dau="dang" />,
	"theo-doi-loi": () => <CanhTheoDoi dau="loi" />,
	"slack-du": () => <TinSlack tran={false} />,
	"slack-tran": () => <TinSlack tran />,
} as const;

export function MayNhacTruocNguoiMau({ state }: { state: string }) {
	const ve =
		state in HINH ? HINH[state as keyof typeof HINH] : HINH["tasks-co-im"];
	return <div key={state}>{ve()}</div>;
}
