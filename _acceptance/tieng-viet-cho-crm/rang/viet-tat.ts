import { initialsFromName } from "../../../packages/ui/src/lib/format";

const names: string[] = JSON.parse(process.argv[2] ?? "[]");
console.log(JSON.stringify(names.map((name) => initialsFromName(name))));
