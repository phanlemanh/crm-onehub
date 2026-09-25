import type * as React from "react";
import { useId } from "react";
import { LOGO_ONEHUB } from "../lib/logo-onehub";
import { MarkOneHub } from "./logo";

export function LogoLockup(props: React.SVGProps<SVGSVGElement>) {
	const id = useId();
	const { mark, banNgang } = LOGO_ONEHUB;
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={banNgang.rong}
			height={banNgang.cao}
			viewBox={banNgang.viewBox}
			fill="none"
			role="img"
			aria-label={LOGO_ONEHUB.ten}
			{...props}
		>
			<g transform={`translate(${mark.tam.x} ${mark.tam.y})`}>
				<MarkOneHub id={id} />
			</g>
			<path d={banNgang.chu} fill="currentColor" fillRule="evenodd" />
		</svg>
	);
}
