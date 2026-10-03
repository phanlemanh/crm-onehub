import { afterEach, beforeEach } from "bun:test";
import { datLai, thaoHet } from "./khung-gop-y-dung-cho";

beforeEach(datLai);
afterEach(thaoHet);

await import("./gop-y-dung-cho-danh-sach");
await import("./gop-y-dung-cho-khung");
await import("./gop-y-dung-cho-hop-sua");
await import("./gop-y-dung-cho-ra-soat");
