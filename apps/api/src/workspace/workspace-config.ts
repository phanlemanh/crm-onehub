export const WORKSPACE_CONFIG = {
	staffDomains: {
		max: 20,
	},
	messages: {
		alreadyAMember:
			"That person is already a member. Change their role in the members table.",
		staffDomainsForbidden:
			"Only an owner or an admin can change the staff email domains.",
		staffDomainsTooMany: (max: number) => `Enter at most ${max} domains.`,
		staffDomainIsAddress: (entry: string) =>
			`${entry} is an email address. Enter only the part after @.`,
		staffDomainInvalid: (entry: string) =>
			`${entry} is not a domain. Enter one like onehub.vn.`,
		staffDomainPublic: (entry: string) =>
			`${entry} is a public mail domain, not one of ours. Remove it and save again.`,
	},
} as const;
