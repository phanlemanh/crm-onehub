"use client";

import Checkmark from "@carbon/icons-react/es/Checkmark";
import { Icon } from "@crm/ui/components/icon";
import {
	Stepper,
	StepperDescription,
	StepperIndicator,
	StepperItem,
	StepperSeparator,
	StepperTitle,
	useStepItem,
} from "@crm/ui/components/reui/stepper";
import { cn } from "@crm/ui/lib/utils";
import { Children, createContext, useContext } from "react";
import type * as React from "react";

const TinhContext = createContext(false);
const SoBuocContext = createContext(0);

function StepList({
	activeStep,
	label,
	markCompleted = false,
	tinh = false,
	children,
}: {
	activeStep?: number;
	label: string;
	markCompleted?: boolean;
	tinh?: boolean;
	children: React.ReactNode;
}) {
	return (
		<TinhContext.Provider value={tinh}>
			<SoBuocContext.Provider value={Children.count(children)}>
				<Stepper
					value={tinh ? Number.MAX_SAFE_INTEGER : activeStep}
					orientation="vertical"
					role="list"
					aria-label={label}
					indicators={
						markCompleted && !tinh ? { completed: <Icon icon={Checkmark} /> } : {}
					}
					className="flex flex-col"
				>
					{children}
				</Stepper>
			</SoBuocContext.Provider>
		</TinhContext.Provider>
	);
}

function StepListBody({
	title,
	description,
	children,
}: {
	title: React.ReactNode;
	description?: React.ReactNode;
	children?: React.ReactNode;
}) {
	const { state } = useStepItem();
	return (
		<div className="flex min-w-0 flex-1 flex-col gap-1">
			<StepperTitle
				className={cn(
					"leading-6",
					state === "inactive" && "font-normal text-muted-foreground",
				)}
			>
				{title}
			</StepperTitle>
			{description ? (
				<StepperDescription className="text-muted-foreground text-sm">
					{description}
				</StepperDescription>
			) : null}
			{children ? <div className="pt-2">{children}</div> : null}
		</div>
	);
}

function StepListItem({
	step,
	title,
	description,
	children,
	activeStep,
}: {
	step: number;
	activeStep?: number;
	title: React.ReactNode;
	description?: React.ReactNode;
	children?: React.ReactNode;
}) {
	const tinh = useContext(TinhContext);
	const soBuoc = useContext(SoBuocContext);
	return (
		<StepperItem
			step={step}
			role="listitem"
			aria-current={!tinh && step === activeStep ? "step" : undefined}
			className="relative flex-row items-start justify-start gap-3 pb-5 last:pb-0"
		>
			{tinh && step < soBuoc ? (
				<span aria-hidden="true" className="contents">
					<StepperSeparator className="absolute top-7 bottom-1 left-3 m-0 h-auto w-px rounded-none bg-border group-data-[orientation=vertical]/stepper-nav:h-auto group-data-[orientation=vertical]/stepper-nav:w-px" />
				</span>
			) : null}
			<StepperIndicator>{step}</StepperIndicator>
			<StepListBody title={title} description={description}>
				{children}
			</StepListBody>
		</StepperItem>
	);
}

export { StepList, StepListItem };
