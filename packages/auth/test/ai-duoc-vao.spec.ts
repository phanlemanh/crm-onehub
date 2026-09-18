import { describe, expect, it } from "bun:test";
import {
	type AllowanceRow,
	type AllowDecision,
	decideSignIn,
} from "../src/allow-list";

const khue = (
	status: AllowanceRow["status"],
	role: string | null = "member",
): AllowanceRow[] => [{ email: "khue@gmail.com", role, status }];

type Dong = {
	n: number;
	allowances: AllowanceRow[];
	seedList: string;
	anyUserExists: boolean;
	email: string;
	want: AllowDecision;
};

const BANG: Dong[] = [
	{
		n: 1,
		allowances: [],
		seedList: "onemount.com",
		anyUserExists: false,
		email: "ai@onemount.com",
		want: { allowed: true, role: "member", source: "seed" },
	},
	{
		n: 2,
		allowances: [],
		seedList: "onemount.com",
		anyUserExists: true,
		email: "ai@onemount.com",
		want: { allowed: false },
	},
	{
		n: 3,
		allowances: [],
		seedList: "",
		anyUserExists: false,
		email: "ai@onemount.com",
		want: { allowed: false },
	},
	{
		n: 4,
		allowances: [],
		seedList: "onemount.com",
		anyUserExists: false,
		email: "nguoi@gmail.com",
		want: { allowed: false },
	},
	{
		n: 5,
		allowances: [],
		seedList: "khue@gmail.com",
		anyUserExists: false,
		email: "khue@gmail.com",
		want: { allowed: true, role: "member", source: "seed" },
	},
	{
		n: 6,
		allowances: [],
		seedList: "khue@gmail.com",
		anyUserExists: false,
		email: "khac@gmail.com",
		want: { allowed: false },
	},
	{
		n: 7,
		allowances: khue("pending"),
		seedList: "onemount.com",
		anyUserExists: true,
		email: "khue@gmail.com",
		want: { allowed: true, role: "member", source: "table" },
	},
	{
		n: 8,
		allowances: khue("pending", "admin"),
		seedList: "",
		anyUserExists: true,
		email: "khue@gmail.com",
		want: { allowed: true, role: "admin", source: "table" },
	},
	{
		n: 9,
		allowances: khue("canceled"),
		seedList: "",
		anyUserExists: true,
		email: "khue@gmail.com",
		want: { allowed: false },
	},
	{
		n: 10,
		allowances: khue("accepted"),
		seedList: "",
		anyUserExists: true,
		email: "khue@gmail.com",
		want: { allowed: true, role: "member", source: "table" },
	},
	{
		n: 11,
		allowances: khue("pending"),
		seedList: "onemount.com",
		anyUserExists: true,
		email: "ai@onemount.com",
		want: { allowed: false },
	},
];

describe("decideSignIn", () => {
	it("bang viet truoc co dung muoi mot dong", () => {
		expect(BANG.length).toBe(11);
		expect(BANG.map((dong) => dong.n)).toEqual([
			1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
		]);
	});

	for (const dong of BANG) {
		it(`dong ${dong.n} — ${dong.email}`, () => {
			const got = decideSignIn({
				email: dong.email,
				allowances: dong.allowances,
				seedList: dong.seedList,
				anyUserExists: dong.anyUserExists,
			});

			expect({ dong: dong.n, got }).toEqual({ dong: dong.n, got: dong.want });
		});
	}
});
