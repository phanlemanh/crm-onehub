"use client";

import Idea from "@carbon/icons-react/es/Idea";
import Information from "@carbon/icons-react/es/Information";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@crm/ui/components/alert";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@crm/ui/components/hover-card";
import type { CarbonIcon } from "@crm/ui/components/icon";
import { Icon } from "@crm/ui/components/icon";
import { Separator } from "@crm/ui/components/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@crm/ui/components/table";
import { lienKetAnToan } from "@crm/ui/lib/lien-ket-an-toan";
import { cn } from "@crm/ui/lib/utils";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";
import { type ComponentProps, useEffect, useState } from "react";
import {
	type Components,
	defaultRehypePlugins,
	defaultRemarkPlugins,
	Streamdown,
} from "streamdown";

export type ReaderLink = {
	title: string;
	summary: string;
	meta?: string;
};

export type ReaderHeading = { id: string; text: string; depth: 2 | 3 };

export type ReaderCalloutLabels = Record<CalloutKind, string>;

type CalloutKind = "note" | "tip" | "important" | "warning" | "caution";

type Node = {
	type: string;
	value?: string;
	depth?: number;
	url?: string;
	tagName?: string;
	properties?: Record<string, unknown>;
	children?: Node[];
};

const WIKI_PREFIX = "#wiki:";

const WIKI_PATTERN = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

const CALLOUT_PATTERN = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/;

const CALLOUT_ICON = {
	note: Information,
	tip: Idea,
	important: Information,
	warning: WarningAlt,
	caution: WarningAlt,
} satisfies Record<CalloutKind, CarbonIcon>;

const CALLOUT_VARIANT = {
	note: "default",
	tip: "default",
	important: "default",
	warning: "warning",
	caution: "destructive",
} as const satisfies Record<CalloutKind, "default" | "warning" | "destructive">;

const DEFAULT_CALLOUT_LABELS: ReaderCalloutLabels = {
	note: "Note",
	tip: "Tip",
	important: "Important",
	warning: "Warning",
	caution: "Caution",
};

function readerUrl(url: string, key: string): string | null {
	if (key === "src") return null;
	return lienKetAnToan(url) ? url : null;
}

export function readerSlug(text: string): string {
	return text
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/đ/gi, "d")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function headingText(node: Node): string {
	if (node.type === "text" || node.type === "inlineCode") return node.value ?? "";
	return (node.children ?? []).map(headingText).join("");
}

function collectHeadings(node: Node, out: ReaderHeading[]): void {
	if (node.type === "heading" && (node.depth === 2 || node.depth === 3)) {
		const text = headingText(node).trim();
		out.push({ id: readerSlug(text), text, depth: node.depth });
		return;
	}
	for (const child of node.children ?? []) collectHeadings(child, out);
}

export function readerHeadings(markdown: string): ReaderHeading[] {
	const tree = fromMarkdown(markdown, {
		extensions: [gfm()],
		mdastExtensions: [gfmFromMarkdown()],
	}) as Node;
	remarkWikiLinks()(tree);
	const headings: ReaderHeading[] = [];
	collectHeadings(tree, headings);
	return headings;
}

function textOf(node: Node): string {
	if (node.type === "text") return node.value ?? "";
	return (node.children ?? []).map(textOf).join("");
}

function splitWikiLinks(value: string): Node[] {
	const parts: Node[] = [];
	let last = 0;
	for (const match of value.matchAll(WIKI_PATTERN)) {
		const target = match[1]?.trim() ?? "";
		const start = match.index ?? 0;
		if (start > last) parts.push({ type: "text", value: value.slice(last, start) });
		parts.push({
			type: "link",
			url: `${WIKI_PREFIX}${encodeURIComponent(target)}`,
			children: [
				{ type: "text", value: match[2]?.trim() ?? target.replace("#", " › ") },
			],
		});
		last = start + match[0].length;
	}
	if (last < value.length) parts.push({ type: "text", value: value.slice(last) });
	return parts;
}

function remarkWikiLinks() {
	const walk = (node: Node) => {
		if (!node.children) return;
		node.children = node.children.flatMap((child) => {
			if (child.type === "text" && child.value?.includes("[[")) {
				return splitWikiLinks(child.value);
			}
			if (child.type !== "link" && child.type !== "inlineCode") walk(child);
			return [child];
		});
	};
	return (tree: Node) => walk(tree);
}

function markCallout(node: Node) {
	const paragraph = node.children?.find((c) => c.type === "element");
	const first = paragraph?.children?.[0];
	if (paragraph?.tagName !== "p" || first?.type !== "text") return;
	const match = CALLOUT_PATTERN.exec(first.value ?? "");
	if (!match?.[1]) return;
	first.value = (first.value ?? "").slice(match[0].length);
	node.properties = {
		...node.properties,
		dataCallout: match[1].toLowerCase(),
	};
}

function rehypeReader() {
	const walk = (node: Node) => {
		if (node.type === "element") {
			if (
				(node.tagName === "h2" || node.tagName === "h3") &&
				node.properties?.id === undefined
			) {
				node.properties = { ...node.properties, id: readerSlug(textOf(node)) };
			}
			if (node.tagName === "blockquote") markCallout(node);
		}
		for (const child of node.children ?? []) walk(child);
	};
	return (tree: Node) => walk(tree);
}

const REMARK_PLUGINS = [...Object.values(defaultRemarkPlugins), remarkWikiLinks];

const REHYPE_PLUGINS = [...Object.values(defaultRehypePlugins), rehypeReader];

type WithNode<T extends keyof React.JSX.IntrinsicElements> = ComponentProps<T> & {
	node?: unknown;
};

function WikiLink({
	target,
	children,
	resolve,
	missingLabel,
}: {
	target: string;
	children: React.ReactNode;
	resolve?: (target: string) => ReaderLink | null;
	missingLabel: string;
}) {
	const [ten = target, muc] = target.split("#");
	const page = resolve?.(ten.trim()) ?? null;
	if (page === null) {
		return (
			<span
				className="text-muted-foreground underline decoration-dashed underline-offset-4"
				data-wiki-missing=""
				title={missingLabel}
			>
				{children}
			</span>
		);
	}
	return (
		<HoverCard openDelay={200}>
			<HoverCardTrigger asChild>
				<a
					className="font-medium text-foreground underline decoration-primary underline-offset-4"
					data-wiki-link=""
					href={`${WIKI_PREFIX}${encodeURIComponent(target)}`}
				>
					{children}
				</a>
			</HoverCardTrigger>
			<HoverCardContent align="start" className="w-80">
				<span className="flex flex-col gap-1.5">
					<span className="font-medium text-sm" translate="no">
						{page.title}
						{muc ? ` › ${muc.trim()}` : ""}
					</span>
					<span className="line-clamp-4 text-muted-foreground text-xs" translate="no">
						{page.summary}
					</span>
					{page.meta ? (
						<span className="text-muted-foreground text-xs">{page.meta}</span>
					) : null}
				</span>
			</HoverCardContent>
		</HoverCard>
	);
}

function readerComponents({
	resolve,
	calloutLabels,
	missingLabel,
}: {
	resolve?: (target: string) => ReaderLink | null;
	calloutLabels: ReaderCalloutLabels;
	missingLabel: string;
}): Components {
	return {
		h2: ({ node: _, className, ...props }: WithNode<"h2">) =>
			props.id === "footnote-label" ? (
				<h2 className="font-medium text-foreground text-sm" {...props} />
			) : (
				<h2
					className={cn(
						"mt-8 scroll-mt-6 font-semibold text-lg tracking-tight first:mt-0",
						className,
					)}
					{...props}
				/>
			),
		h3: ({ node: _, className, ...props }: WithNode<"h3">) => (
			<h3
				className={cn("mt-6 scroll-mt-6 font-semibold text-base", className)}
				{...props}
			/>
		),
		h4: ({ node: _, className, ...props }: WithNode<"h4">) => (
			<h4 className={cn("mt-4 font-medium text-sm", className)} {...props} />
		),
		p: ({ node: _, ...props }: WithNode<"p">) => (
			<p className="text-pretty text-sm/7" {...props} />
		),
		ul: ({ node: _, className, ...props }: WithNode<"ul">) => (
			<ul
				className={cn(
					"list-disc space-y-1.5 pl-5 text-sm/7 marker:text-muted-foreground",
					className,
				)}
				{...props}
			/>
		),
		ol: ({ node: _, className, ...props }: WithNode<"ol">) => (
			<ol
				className={cn(
					"list-decimal space-y-1.5 pl-5 text-sm/7 marker:text-muted-foreground",
					className,
				)}
				{...props}
			/>
		),
		li: ({ node: _, className, ...props }: WithNode<"li">) => (
			<li className={cn("pl-1", className)} {...props} />
		),
		strong: ({ node: _, ...props }: WithNode<"strong">) => (
			<strong className="font-semibold" {...props} />
		),
		a: ({ node: _, href, children, target, rel, ...props }: WithNode<"a">) => {
			if (href?.startsWith(WIKI_PREFIX)) {
				return (
					<WikiLink
						missingLabel={missingLabel}
						resolve={resolve}
						target={decodeURIComponent(href.slice(WIKI_PREFIX.length))}
					>
						{children}
					</WikiLink>
				);
			}
			return (
				<a
					className="underline underline-offset-4 hover:text-foreground"
					href={href}
					rel={href?.startsWith("#") ? undefined : rel}
					target={href?.startsWith("#") ? undefined : target}
					{...props}
				>
					{children}
				</a>
			);
		},
		blockquote: ({ node: _, children, ...props }: WithNode<"blockquote">) => {
			const kind = (props as { "data-callout"?: CalloutKind })["data-callout"];
			if (kind === undefined) {
				return (
					<blockquote className="border-l-2 pl-4 text-muted-foreground">
						{children}
					</blockquote>
				);
			}
			return (
				<Alert data-callout={kind} role="note" variant={CALLOUT_VARIANT[kind]}>
					<Icon icon={CALLOUT_ICON[kind]} />
					<AlertTitle>{calloutLabels[kind]}</AlertTitle>
					<AlertDescription className="*:text-xs/6">{children}</AlertDescription>
				</Alert>
			);
		},
		table: ({ node: _, children }: WithNode<"table">) => (
			<div className="overflow-hidden rounded-lg border">
				<Table>{children}</Table>
			</div>
		),
		thead: ({ node: _, children }: WithNode<"thead">) => (
			<TableHeader className="bg-muted">{children}</TableHeader>
		),
		tbody: ({ node: _, children }: WithNode<"tbody">) => (
			<TableBody>{children}</TableBody>
		),
		tr: ({ node: _, children }: WithNode<"tr">) => <TableRow>{children}</TableRow>,
		th: ({ node: _, children, style }: WithNode<"th">) => (
			<TableHead className="text-muted-foreground" style={style}>
				{children}
			</TableHead>
		),
		td: ({ node: _, children, style }: WithNode<"td">) => (
			<TableCell className="tabular-nums" style={style}>
				{children}
			</TableCell>
		),
		hr: () => <Separator className="my-6" />,
		inlineCode: ({ node: _, ...props }: WithNode<"code">) => (
			<code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-xs" {...props} />
		),
		section: ({ node: _, children, ...props }: WithNode<"section">) => {
			if ((props as { "data-footnotes"?: unknown })["data-footnotes"] === undefined) {
				return <section {...props}>{children}</section>;
			}
			return (
				<section
					aria-labelledby="footnote-label"
					className="mt-8 flex flex-col gap-2 border-t pt-4 text-muted-foreground text-xs [&_li]:text-xs/5 [&_ol]:space-y-1 [&_p]:text-xs/5"
					data-reader-sources=""
				>
					{children}
				</section>
			);
		},
		sup: ({ node: _, ...props }: WithNode<"sup">) => (
			<sup className="ml-0.5 font-medium text-primary [&_a]:no-underline" {...props} />
		),
	};
}

export function MarkdownReader({
	children,
	resolveLink,
	calloutLabels = DEFAULT_CALLOUT_LABELS,
	missingLabel = "No page yet",
	sourcesLabel = "Sources",
	sourceBackLabel = "Back to where it is cited",
	className,
}: {
	children: string;
	resolveLink?: (target: string) => ReaderLink | null;
	calloutLabels?: ReaderCalloutLabels;
	missingLabel?: string;
	sourcesLabel?: string;
	sourceBackLabel?: string;
	className?: string;
}) {
	return (
		<Streamdown
			className={cn("flex min-w-0 max-w-prose flex-col gap-4 wrap-break-word", className)}
			components={readerComponents({
				resolve: resolveLink,
				calloutLabels,
				missingLabel,
			})}
			controls={false}
			linkSafety={{ enabled: false }}
			mode="static"
			rehypePlugins={REHYPE_PLUGINS}
			remarkPlugins={REMARK_PLUGINS}
			remarkRehypeOptions={{
				footnoteLabel: sourcesLabel,
				footnoteBackLabel: sourceBackLabel,
			}}
			shikiTheme={["github-light", "github-dark"]}
			tableMaxHeight={0}
			urlTransform={readerUrl}
		>
			{children}
		</Streamdown>
	);
}

export function ReaderToc({
	headings,
	label,
}: {
	headings: ReaderHeading[];
	label: string;
}) {
	const [active, setActive] = useState<string | null>(headings[0]?.id ?? null);

	useEffect(() => {
		const targets = headings
			.map((h) => document.getElementById(h.id))
			.filter((el): el is HTMLElement => el !== null);
		if (targets.length === 0) return;
		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible[0]) setActive(visible[0].target.id);
			},
			{ rootMargin: "0px 0px -70% 0px" },
		);
		for (const el of targets) observer.observe(el);
		return () => observer.disconnect();
	}, [headings]);

	if (headings.length === 0) return null;

	return (
		<nav aria-label={label} className="flex flex-col gap-2" data-reader-toc="">
			<span className="font-medium text-sm">{label}</span>
			<ol className="flex flex-col border-l">
				{headings.map((h) => (
					<li key={h.id}>
						<a
							aria-current={active === h.id ? "location" : undefined}
							className={cn(
								"-ml-px block border-l py-1 text-muted-foreground text-xs hover:text-foreground",
								h.depth === 2 ? "pl-3" : "pl-6",
								active === h.id && "border-primary font-medium text-foreground",
							)}
							href={`#${h.id}`}
						>
							{h.text}
						</a>
					</li>
				))}
			</ol>
		</nav>
	);
}
