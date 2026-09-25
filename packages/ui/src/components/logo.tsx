import type * as React from "react";
import { useId } from "react";
import { LOGO_ONEHUB } from "../lib/logo-onehub";

export function MarkOneHub({ id }: { id: string }) {
	const { mark, dai } = LOGO_ONEHUB;
	return (
		<>
			<defs>
				<linearGradient
					id={id}
					gradientUnits="userSpaceOnUse"
					x1={dai.x1}
					y1={dai.y1}
					x2={dai.x2}
					y2={dai.y2}
				>
					<stop offset={0} stopColor={dai.tu} />
					<stop offset={1} stopColor={dai.den} />
				</linearGradient>
			</defs>
			<path d={mark.path} fill={`url(#${id})`} />
		</>
	);
}

const Logo = (props: React.SVGProps<SVGSVGElement>) => {
	const id = useId();
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={512}
			height={512}
			viewBox={LOGO_ONEHUB.mark.viewBox}
			fill="none"
			role="img"
			aria-label={LOGO_ONEHUB.ten}
			{...props}
		>
			<MarkOneHub id={id} />
		</svg>
	);
};
export default Logo;
